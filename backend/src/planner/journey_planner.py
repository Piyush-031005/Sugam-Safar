"""
Journey Planner — Module E + Overlapping Corridor Discovery & 1-Transfer RAPTOR Fallback.

Implements:
  - BallTree spatial stop expansion around origin & destination
  - Direct & overlapping corridor enumeration
  - 1-Transfer fallback (RAPTOR Round 2) when direct routes are absent or Very High crowded
  - Stretch-aware crowding lookup: T_eff_ivt = sum_k (t_k * m(c_k))
  - Generalized cost scoring with configurable multipliers
  - Common-line "Board-Any-Comfortable-Bus" pooling: E[Wait_pool] = 1 / (2 * sum(f_r))
  - Temporal lookahead (-15 min / +15 min) nudge
  - Map geometry (walking legs + bus corridor polyline)
"""
from typing import Dict, List, Any, Optional, Tuple
from src.planner.ranker import Ranker, CROWD_MULTIPLIER
from src.planner.spatial import CorridorFinder
from src.planner.build_index import TransitIndex
from src.models.crowd_engine import CrowdEngine
from src.data.mock_delhi_data import MockDelhiData, STOPS, ROUTES_META


class JourneyPlanner:
    def __init__(self):
        self.ranker = Ranker()
        self.corridor_finder = CorridorFinder()
        self.mock_data = MockDelhiData()
        self.crowd_engine = CrowdEngine()
        self.index = TransitIndex(STOPS, ROUTES_META)

    def plan(
        self,
        origin: str,
        destination: str,
        hour: int = 8,
        day_type: str = "weekday",
        mode: str = "balanced",
        max_walk_m: int = 600,
        w_walk: float = 1.9,
        w_wait: float = 1.9,
        mult_very_high: float = 1.60,
    ) -> Dict[str, Any]:
        """Execute full online query pipeline (Spatial -> Routes -> Stretch Crowd -> Rank -> Pool)."""
        origin_stop = self.index.resolve_stop(origin)
        dest_stop = self.index.resolve_stop(destination)

        # 1. Nearby Stop Expansion (BallTree)
        s_o_list = self.index.query_nearby_stops(origin_stop["lat"], origin_stop["lon"], radius_m=max_walk_m)
        s_d_list = self.index.query_nearby_stops(dest_stop["lat"], dest_stop["lon"], radius_m=max(max_walk_m, 750))

        s_o_map = {s["id"]: s for s in s_o_list}
        s_d_map = {s["id"]: s for s in s_d_list}

        multipliers = {
            **CROWD_MULTIPLIER,
            "VERY_HIGH": mult_very_high,
        }

        # 2. Direct & Overlapping Corridor Match
        direct_candidates: List[Dict[str, Any]] = []
        for route in ROUTES_META:
            rid = route["id"]
            r_stops = route["stops"]
            cum_times = self.index.route_patterns[rid]["cum_times_min"]

            best_pair: Optional[Tuple[int, int, int]] = None
            for i, sid_o in enumerate(r_stops):
                if sid_o not in s_o_map:
                    continue
                for j in range(i + 1, len(r_stops)):
                    sid_d = r_stops[j]
                    if sid_d not in s_d_map:
                        continue
                    total_walk = s_o_map[sid_o]["walk_distance_m"] + s_d_map[sid_d]["walk_distance_m"]
                    ivt = cum_times[j] - cum_times[i]
                    score = total_walk / 80.0 + ivt
                    if best_pair is None or score < best_pair[2]:
                        best_pair = (i, j, score)

            if best_pair is not None:
                i, j, _ = best_pair
                direct_candidates.append(
                    self._build_direct_option(
                        route=route,
                        origin_stop=origin_stop,
                        dest_stop=dest_stop,
                        board_stop=s_o_map[r_stops[i]],
                        alight_stop=s_d_map[r_stops[j]],
                        seq_i=i,
                        seq_j=j,
                        hour=hour,
                        day_type=day_type,
                        w_walk=w_walk,
                        w_wait=w_wait,
                        multipliers=multipliers,
                    )
                )

        # 3. 1-Transfer Fallback (RAPTOR Round 2) if < 2 direct options or all Very High crowded
        all_very_high = direct_candidates and all(c["crowd_level"] == "VERY_HIGH" for c in direct_candidates)
        if len(direct_candidates) < 2 or all_very_high:
            transfer_opt = self._find_one_transfer(
                origin_stop, dest_stop, s_o_map, s_d_map, hour, day_type, w_walk, w_wait, multipliers
            )
            if transfer_opt is not None:
                direct_candidates.append(transfer_opt)

        # Fallback guarantee if unrelated/unmatched query
        if not direct_candidates:
            for r in ROUTES_META[:3]:
                direct_candidates.append(
                    self._build_synthetic_fallback(r, origin_stop, dest_stop, hour, day_type, w_walk, w_wait, multipliers)
                )

        # 4. Rank options and assign Fastest / Comfortable / Balanced roles
        ranked = self._assign_roles_and_rank(direct_candidates, mode=mode)

        # 5. Overlapping Corridor Discovery & Comfortable Bus Pool
        overlap_buses = self._build_overlap_buses(ranked, origin_stop, dest_stop, hour, day_type)
        corridor_pool = self._build_corridor_pool(ranked, overlap_buses, origin_stop["name"])

        # 6. Temporal Lookahead (-15 min / +15 min)
        top_opt = ranked[0]
        lookahead = self._temporal_lookahead(top_opt["route_id"], hour, day_type)

        return {
            "options": ranked,
            "overlap_buses": overlap_buses,
            "corridor_pool": corridor_pool,
            "lookahead": lookahead,
            "corridor_name": ranked[0].get("corridor_name", "Delhi Arterial Corridor"),
            "search_params": {
                "origin": origin_stop["name"],
                "destination": dest_stop["name"],
                "hour": hour,
                "day_type": day_type,
                "mode": mode,
                "max_walk_m": max_walk_m,
            },
        }

    def _build_direct_option(
        self,
        route: Dict[str, Any],
        origin_stop: Dict[str, Any],
        dest_stop: Dict[str, Any],
        board_stop: Dict[str, Any],
        alight_stop: Dict[str, Any],
        seq_i: int,
        seq_j: int,
        hour: int,
        day_type: str,
        w_walk: float,
        w_wait: float,
        multipliers: Dict[str, float],
    ) -> Dict[str, Any]:
        rid = route["id"]
        cum_times = self.index.route_patterns[rid]["cum_times_min"]
        seg_times = route.get("segment_times_min", [7] * len(route["stops"]))
        travel_time = max(8, cum_times[seq_j] - cum_times[seq_i])

        # Stretch-aware crowding lookup across segments [seq_i, seq_j)
        stop_load_profile = self.crowd_engine.propagate_stop_load(rid, hour, day_type)
        pred = self.crowd_engine.predict(rid, hour, day_type)

        eff_ivt = 0.0
        for k in range(seq_i, seq_j):
            seg_level = stop_load_profile[k]["segment_crowd_level"]
            eff_ivt += seg_times[k] * multipliers.get(seg_level, pred["multiplier"])
        eff_ivt = round(max(travel_time, eff_ivt))

        walk_to_m = board_stop["walk_distance_m"]
        walk_from_m = alight_stop["walk_distance_m"]
        wait_mins = max(3, round(route["frequency"] / 2))
        walk_mins = (walk_to_m + walk_from_m) / 1.3 / 60.0
        gc = round(eff_ivt + w_walk * walk_mins + w_wait * wait_mins, 2)

        sub_stop_ids = route["stops"][seq_i : seq_j + 1]
        sub_stops = [self.index.stop_by_id[sid] for sid in sub_stop_ids]

        return {
            "id": f"OPT-{rid}",
            "type": "balanced",
            "route_id": rid,
            "route_name": f"Bus {route['name'].replace('Route ', '')}",
            "from_stop": board_stop["name"],
            "to_stop": alight_stop["name"],
            "departure_time": f"{str(hour).zfill(2)}:{str((seq_i * 7 + 5) % 50).zfill(2)}",
            "travel_time_mins": travel_time,
            "effective_time_mins": eff_ivt,
            "walk_to_stop_m": walk_to_m,
            "walk_from_stop_m": walk_from_m,
            "wait_time_mins": wait_mins,
            "crowd_level": pred["crowd_level"],
            "confidence": pred["confidence"],
            "confidence_reason": pred["confidence_reason"],
            "crowd_index_band": [pred["crowd_index_p10"], pred["crowd_index_p90"]],
            "is_ac": route["is_ac"],
            "bus_size": route["bus_size"],
            "stops": [s["name"] for s in sub_stops],
            "stop_load_profile": stop_load_profile[seq_i : seq_j + 1],
            "fare": route["fare"],
            "generalized_cost": gc,
            "is_transfer": False,
            "corridor_name": route["corridor"],
            "geometry": {
                "origin": [origin_stop["lat"], origin_stop["lon"]],
                "destination": [dest_stop["lat"], dest_stop["lon"]],
                "bus_coords": [[s["lat"], s["lon"]] for s in sub_stops],
                "stop_markers": [
                    {"lat": s["lat"], "lon": s["lon"], "name": s["name"], "type": "origin" if idx == 0 else ("destination" if idx == len(sub_stops) - 1 else "stop")}
                    for idx, s in enumerate(sub_stops)
                ],
            },
        }

    def _find_one_transfer(
        self,
        origin_stop: Dict[str, Any],
        dest_stop: Dict[str, Any],
        s_o_map: Dict[str, Dict[str, Any]],
        s_d_map: Dict[str, Dict[str, Any]],
        hour: int,
        day_type: str,
        w_walk: float,
        w_wait: float,
        multipliers: Dict[str, float],
    ) -> Optional[Dict[str, Any]]:
        """RAPTOR Round 2: Find best 1-transfer connection via a shared intermediate stop."""
        best_transfer: Optional[Dict[str, Any]] = None
        for r1 in ROUTES_META:
            for i, sid_o in enumerate(r1["stops"]):
                if sid_o not in s_o_map:
                    continue
                for k in range(i + 1, len(r1["stops"])):
                    hub_id = r1["stops"][k]
                    hub_stop = self.index.stop_by_id[hub_id]
                    for r2 in ROUTES_META:
                        if r2["id"] == r1["id"] or hub_id not in r2["stops"]:
                            continue
                        h_idx = r2["stops"].index(hub_id)
                        for j in range(h_idx + 1, len(r2["stops"])):
                            sid_d = r2["stops"][j]
                            if sid_d not in s_d_map:
                                continue
                            t1 = self.index.route_patterns[r1["id"]]["cum_times_min"][k] - self.index.route_patterns[r1["id"]]["cum_times_min"][i]
                            t2 = self.index.route_patterns[r2["id"]]["cum_times_min"][j] - self.index.route_patterns[r2["id"]]["cum_times_min"][h_idx]
                            p1 = self.crowd_engine.predict(r1["id"], hour, day_type)
                            p2 = self.crowd_engine.predict(r2["id"], hour, day_type)
                            eff_ivt = round(t1 * multipliers[p1["crowd_level"]] + t2 * multipliers[p2["crowd_level"]])
                            walk_to = s_o_map[sid_o]["walk_distance_m"]
                            walk_from = s_d_map[sid_d]["walk_distance_m"]
                            wait = round((r1["frequency"] + r2["frequency"]) / 4)
                            transfer_pen = 10.0
                            gc = round(eff_ivt + w_walk * ((walk_to + walk_from) / 1.3 / 60.0) + w_wait * wait + transfer_pen, 2)

                            if best_transfer is None or gc < best_transfer["generalized_cost"]:
                                leg_stops = [self.index.stop_by_id[sid] for sid in r1["stops"][i : k + 1] + r2["stops"][h_idx + 1 : j + 1]]
                                worst_level = max(
                                    [p1["crowd_level"], p2["crowd_level"]],
                                    key=lambda lv: ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"].index(lv),
                                )
                                best_transfer = {
                                    "id": f"OPT-{r1['id']}-{r2['id']}",
                                    "type": "comfortable",
                                    "route_id": r1["id"],
                                    "route_name": f"Bus {r1['name'].replace('Route ', '')} -> {r2['name'].replace('Route ', '')}",
                                    "from_stop": s_o_map[sid_o]["name"],
                                    "to_stop": s_d_map[sid_d]["name"],
                                    "departure_time": f"{str(hour).zfill(2)}:10",
                                    "travel_time_mins": t1 + t2,
                                    "effective_time_mins": eff_ivt,
                                    "walk_to_stop_m": walk_to,
                                    "walk_from_stop_m": walk_from,
                                    "wait_time_mins": wait,
                                    "crowd_level": worst_level,
                                    "confidence": "MEDIUM",
                                    "confidence_reason": f"1-transfer via {hub_stop['name']} (RAPTOR Round 2)",
                                    "crowd_index_band": [p1["crowd_index_p10"], p2["crowd_index_p90"]],
                                    "is_ac": r1["is_ac"] or r2["is_ac"],
                                    "bus_size": r1["bus_size"],
                                    "stops": [s["name"] for s in leg_stops],
                                    "stop_load_profile": self.crowd_engine.propagate_stop_load(r1["id"], hour, day_type)[i : k + 1],
                                    "fare": r1["fare"] + r2["fare"],
                                    "generalized_cost": gc,
                                    "is_transfer": True,
                                    "transfer_hub": hub_stop["name"],
                                    "corridor_name": f"{r1['corridor']} + {r2['corridor']}",
                                    "geometry": {
                                        "origin": [origin_stop["lat"], origin_stop["lon"]],
                                        "destination": [dest_stop["lat"], dest_stop["lon"]],
                                        "bus_coords": [[s["lat"], s["lon"]] for s in leg_stops],
                                        "stop_markers": [
                                            {"lat": s["lat"], "lon": s["lon"], "name": s["name"], "type": "origin" if idx == 0 else ("destination" if idx == len(leg_stops) - 1 else "stop")}
                                            for idx, s in enumerate(leg_stops)
                                        ],
                                    },
                                }
        return best_transfer

    def _build_synthetic_fallback(
        self,
        route: Dict[str, Any],
        origin_stop: Dict[str, Any],
        dest_stop: Dict[str, Any],
        hour: int,
        day_type: str,
        w_walk: float,
        w_wait: float,
        multipliers: Dict[str, float],
    ) -> Dict[str, Any]:
        pred = self.crowd_engine.predict(route["id"], hour, day_type)
        base_ivt = 32 if not route["is_ac"] else 37
        eff_ivt = round(base_ivt * multipliers[pred["crowd_level"]])
        wait = round(route["frequency"] / 2)
        gc = round(eff_ivt + w_walk * (350 / 1.3 / 60.0) + w_wait * wait, 2)
        return {
            "id": f"OPT-{route['id']}",
            "type": "balanced",
            "route_id": route["id"],
            "route_name": f"Bus {route['name'].replace('Route ', '')}",
            "from_stop": origin_stop["name"],
            "to_stop": dest_stop["name"],
            "departure_time": f"{str(hour).zfill(2)}:12",
            "travel_time_mins": base_ivt,
            "effective_time_mins": eff_ivt,
            "walk_to_stop_m": 200,
            "walk_from_stop_m": 150,
            "wait_time_mins": wait,
            "crowd_level": pred["crowd_level"],
            "confidence": pred["confidence"],
            "confidence_reason": pred["confidence_reason"],
            "crowd_index_band": [pred["crowd_index_p10"], pred["crowd_index_p90"]],
            "is_ac": route["is_ac"],
            "bus_size": route["bus_size"],
            "stops": [origin_stop["name"], "Central Arterial Transfer", dest_stop["name"]],
            "stop_load_profile": self.crowd_engine.propagate_stop_load(route["id"], hour, day_type),
            "fare": route["fare"],
            "generalized_cost": gc,
            "is_transfer": False,
            "corridor_name": route["corridor"],
            "geometry": {
                "origin": [origin_stop["lat"], origin_stop["lon"]],
                "destination": [dest_stop["lat"], dest_stop["lon"]],
                "bus_coords": [[origin_stop["lat"], origin_stop["lon"]], [dest_stop["lat"], dest_stop["lon"]]],
                "stop_markers": [
                    {"lat": origin_stop["lat"], "lon": origin_stop["lon"], "name": origin_stop["name"], "type": "origin"},
                    {"lat": dest_stop["lat"], "lon": dest_stop["lon"], "name": dest_stop["name"], "type": "destination"},
                ],
            },
        }

    def _assign_roles_and_rank(self, candidates: List[Dict[str, Any]], mode: str) -> List[Dict[str, Any]]:
        if not candidates:
            return []
        fastest = min(candidates, key=lambda x: x["travel_time_mins"])
        comfortable = min(candidates, key=lambda x: (["LOW", "MEDIUM", "HIGH", "VERY_HIGH"].index(x["crowd_level"]), x["generalized_cost"]))
        balanced = min(candidates, key=lambda x: x["generalized_cost"])

        tagged: List[Dict[str, Any]] = []
        used_ids = set()

        for role, item in [("fastest", fastest), ("comfortable", comfortable), ("balanced", balanced)]:
            if item["id"] not in used_ids:
                tagged.append({**item, "type": role})
                used_ids.add(item["id"])

        for item in sorted(candidates, key=lambda x: x["generalized_cost"]):
            if item["id"] not in used_ids and len(tagged) < 4:
                tagged.append({**item, "type": "balanced"})
                used_ids.add(item["id"])

        # Put the user's preferred mode first
        tagged.sort(key=lambda x: (0 if x["type"] == mode else 1, x["generalized_cost"]))
        return tagged

    def _build_overlap_buses(
        self,
        ranked: List[Dict[str, Any]],
        origin_stop: Dict[str, Any],
        dest_stop: Dict[str, Any],
        hour: int,
        day_type: str,
    ) -> List[Dict[str, Any]]:
        top_rid = ranked[0]["route_id"] if ranked else "R405"
        raw_overlaps = self.mock_data.get_overlap_buses(top_rid, hour)
        enriched = []
        for bus in raw_overlaps:
            pred = self.crowd_engine.predict(bus["route_id"], hour, day_type)
            b_stop = self.index.resolve_stop(bus["boarding_stop"])
            enriched.append({
                **bus,
                "crowd_level": pred["crowd_level"],
                "confidence": pred["confidence"],
                "confidence_reason": pred["confidence_reason"],
                "geometry": {
                    "origin": [origin_stop["lat"], origin_stop["lon"]],
                    "boarding": [b_stop["lat"], b_stop["lon"]],
                    "destination": [dest_stop["lat"], dest_stop["lon"]],
                },
            })
        return enriched

    def _build_corridor_pool(
        self,
        ranked: List[Dict[str, Any]],
        overlap_buses: List[Dict[str, Any]],
        stop_name: str,
    ) -> Dict[str, Any]:
        """Common-line pooling: E[Wait_pool] = 1 / (2 * sum(f_r))."""
        comfortable_routes = []
        freqs_per_min = []

        for opt in ranked:
            if opt["crowd_level"] in ("LOW", "MEDIUM"):
                num = opt["route_name"].replace("Bus ", "").split(" ")[0]
                if num not in comfortable_routes:
                    comfortable_routes.append(num)
                    headway = max(6, opt["wait_time_mins"] * 2)
                    freqs_per_min.append(1.0 / headway)

        for bus in overlap_buses:
            if bus["crowd_level"] in ("LOW", "MEDIUM"):
                num = bus["route_name"].split(" ")[0]
                if num not in comfortable_routes:
                    comfortable_routes.append(num)
                    freqs_per_min.append(1.0 / bus.get("frequency", 12))

        if not comfortable_routes:
            comfortable_routes = [b["route_name"].split(" ")[0] for b in overlap_buses[:2]] or ["419", "534"]
            freqs_per_min = [1.0 / 12.0, 1.0 / 15.0]

        avg_wait = round(1.0 / (2.0 * sum(freqs_per_min)), 1)
        return {
            "stop_name": stop_name,
            "routes": comfortable_routes,
            "avg_wait_min": max(2, round(avg_wait)),
            "label": f"Board any of [{', '.join(comfortable_routes)}] — avg wait {max(2, round(avg_wait))} min",
        }

    def _temporal_lookahead(self, route_id: str, hour: int, day_type: str) -> List[Dict[str, Any]]:
        results = []
        for offset_min, h_delta in [(-15, -1 if hour > 0 else 0), (0, 0), (15, 1 if hour < 23 else 0)]:
            h_eval = max(0, min(23, hour + h_delta))
            pred = self.crowd_engine.predict(route_id, h_eval, day_type)
            results.append({
                "offset_min": offset_min,
                "label": "Selected" if offset_min == 0 else (f"{offset_min} min" if offset_min < 0 else f"+{offset_min} min"),
                "crowd_level": pred["crowd_level"],
                "raw_index_pct": round(pred["raw_index"] * 100),
            })
        return results
