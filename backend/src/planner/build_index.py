"""
Static GTFS Precomputation & Spatial Index Builder (Offline/Startup Step)

Builds in-memory / cacheable indices modelled on Delhi's GTFS structure:
  - Spatial Stop Index (BallTree with Haversine metric)
  - Route-Pattern Stop Sequences (route_patterns)
  - Inverted Stop-to-Routes Index (stop_routes_map)
  - Shared-Corridor Lookup (corridor_overlap_index)
"""
import math
from typing import Dict, List, Tuple, Set, Any
import numpy as np

try:
    from sklearn.neighbors import BallTree
    HAS_BALLTREE = True
except ImportError:
    HAS_BALLTREE = False

EARTH_RADIUS_M = 6371000.0


class TransitIndex:
    """Precomputed spatial and corridor indices for millisecond journey queries."""

    def __init__(self, stops: List[Dict[str, Any]], routes: List[Dict[str, Any]]):
        self.stops = stops
        self.stop_by_id: Dict[str, Dict[str, Any]] = {s["id"]: s for s in stops}
        self.stop_by_name: Dict[str, Dict[str, Any]] = {s["name"].lower(): s for s in stops}
        self.routes = routes
        self.route_by_id: Dict[str, Dict[str, Any]] = {r["id"]: r for r in routes}

        # 1. Route-pattern stop sequences & cumulative times
        self.route_patterns: Dict[str, Dict[str, Any]] = {}
        # 2. Inverted stop-to-routes index: stop_id -> list[(route_id, seq, cum_time_min)]
        self.stop_routes_map: Dict[str, List[Dict[str, Any]]] = {s["id"]: [] for s in stops}
        # 3. Shared-corridor lookup: (stop_u, stop_v) -> set of route_ids
        self.corridor_overlap_index: Dict[Tuple[str, str], Set[str]] = {}

        self._build_graph_indices()
        self._build_spatial_tree()

    def _build_graph_indices(self) -> None:
        for route in self.routes:
            rid = route["id"]
            stop_ids = route["stops"]
            seg_times = route.get("segment_times_min", [7] * max(0, len(stop_ids) - 1))
            cum_times = [0]
            for dt in seg_times:
                cum_times.append(cum_times[-1] + dt)

            self.route_patterns[rid] = {
                "route_id": rid,
                "stops": stop_ids,
                "cum_times_min": cum_times,
                "headway_min": route.get("frequency", 12),
            }

            for seq, sid in enumerate(stop_ids):
                if sid in self.stop_routes_map:
                    self.stop_routes_map[sid].append({
                        "route_id": rid,
                        "stop_sequence": seq,
                        "cum_time_min": cum_times[seq],
                    })

            for i in range(len(stop_ids) - 1):
                edge = (stop_ids[i], stop_ids[i + 1])
                self.corridor_overlap_index.setdefault(edge, set()).add(rid)
                # Also index undirected corridor sharing for bi-directional arterial analysis
                rev_edge = (stop_ids[i + 1], stop_ids[i])
                self.corridor_overlap_index.setdefault(rev_edge, set()).add(rid)

    def _build_spatial_tree(self) -> None:
        if HAS_BALLTREE and self.stops:
            coords_rad = np.radians([[s["lat"], s["lon"]] for s in self.stops])
            self.ball_tree = BallTree(coords_rad, metric="haversine")
        else:
            self.ball_tree = None

    def resolve_stop(self, query: str) -> Dict[str, Any]:
        """Resolve a stop name or substring to its stop dictionary."""
        q = query.strip().lower()
        if q in self.stop_by_name:
            return self.stop_by_name[q]
        for name, stop in self.stop_by_name.items():
            if q in name or name in q:
                return stop
        return self.stops[0]

    def query_nearby_stops(self, lat: float, lon: float, radius_m: int = 600) -> List[Dict[str, Any]]:
        """O(log N) BallTree lookup of all candidate stops within walking radius."""
        results: List[Dict[str, Any]] = []
        if self.ball_tree is not None:
            rad = radius_m / EARTH_RADIUS_M
            indices, distances = self.ball_tree.query_radius(
                np.radians([[lat, lon]]), r=rad, return_distance=True, sort_results=True
            )
            for idx, dist_rad in zip(indices[0], distances[0]):
                dist_m = round(float(dist_rad * EARTH_RADIUS_M))
                stop = self.stops[int(idx)]
                results.append({
                    **stop,
                    "walk_distance_m": dist_m,
                    "walk_min": max(1, round(dist_m / 1.3 / 60)),
                })
        else:
            for stop in self.stops:
                dist_m = round(self._haversine_m(lat, lon, stop["lat"], stop["lon"]))
                if dist_m <= radius_m:
                    results.append({
                        **stop,
                        "walk_distance_m": dist_m,
                        "walk_min": max(1, round(dist_m / 1.3 / 60)),
                    })
            results.sort(key=lambda s: s["walk_distance_m"])

        # Always guarantee at least the closest stop if radius yields none
        if not results:
            closest = min(
                self.stops,
                key=lambda s: self._haversine_m(lat, lon, s["lat"], s["lon"]),
            )
            dist_m = round(self._haversine_m(lat, lon, closest["lat"], closest["lon"]))
            results.append({
                **closest,
                "walk_distance_m": dist_m,
                "walk_min": max(1, round(dist_m / 1.3 / 60)),
            })
        return results

    def get_shared_corridor_routes(self, stop_u: str, stop_v: str) -> Set[str]:
        """Return all route_ids traversing the directed/arterial segment (stop_u, stop_v)."""
        return set(self.corridor_overlap_index.get((stop_u, stop_v), set()))

    @staticmethod
    def _haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlam = math.radians(lon2 - lon1)
        a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
        return 2 * EARTH_RADIUS_M * math.asin(math.sqrt(a))
