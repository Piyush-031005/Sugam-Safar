"""
Spatial Module — Corridor discovery and stop proximity analysis.

Key concept: Overlapping Corridor Discovery
  Many Delhi bus routes run parallel on the same road corridor.
  By identifying buses sharing ≥N stops on the same corridor,
  we can present commuters with effective alternatives and
  reduce wait time through corridor pooling.

Corridor Pooling Wait Time:
  If buses A, B, C run every 8, 12, 15 minutes on the same corridor,
  the effective pooled headway ≈ 1/(1/8 + 1/12 + 1/15) ≈ 3.5 minutes.
"""
import math
from typing import List, Dict, Any, Tuple


CORRIDOR_SEGMENTS = {
    "Vikas Marg Corridor": {
        "routes": ["R405", "R419", "R534"],
        "shared_stops": ["Kashmere Gate ISBT", "Vikas Marg Chowk", "Vikas Marg", "Mayur Vihar Ph-1", "Laxmi Nagar"],
        "length_km": 11.5,
    },
    "NH-24 Corridor": {
        "routes": ["R729", "R405"],
        "shared_stops": ["Anand Vihar ISBT", "Vikas Marg", "Laxmi Nagar", "Kashmere Gate ISBT"],
        "length_km": 14.2,
    },
    "Ring Road South": {
        "routes": ["R501"],
        "shared_stops": ["Connaught Place", "India Gate", "Lajpat Nagar", "Saket"],
        "length_km": 18.0,
    },
}

ROUTE_FREQUENCIES = {
    "R405": 8, "R419": 12, "R534": 15, "R729": 10, "R501": 20,
}


class CorridorFinder:
    """Finds overlapping bus corridors and computes corridor pooling metrics."""

    def haversine(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Distance in meters between two lat/lon points."""
        R = 6371000
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlam = math.radians(lon2 - lon1)
        a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlam/2)**2
        return 2 * R * math.asin(math.sqrt(a))

    def find_corridor(self, route_id: str) -> Dict[str, Any]:
        """Find which corridor a route belongs to."""
        for name, data in CORRIDOR_SEGMENTS.items():
            if route_id in data["routes"]:
                return {"corridor_name": name, **data}
        return {}

    def get_corridor_pool_wait(self, route_ids: List[str]) -> float:
        """Compute effective wait time with corridor pooling (minutes)."""
        total_freq = sum(1 / ROUTE_FREQUENCIES.get(r, 15) for r in route_ids)
        if total_freq == 0:
            return 999
        return round(0.5 / total_freq, 1)  # 0.5 hour = 30 min cycle

    def find_overlapping_routes(self, route_id: str) -> List[str]:
        """Find all routes that overlap with a given route on any corridor."""
        corridor = self.find_corridor(route_id)
        if not corridor:
            return []
        return [r for r in corridor.get("routes", []) if r != route_id]

    def get_boarding_stop_distance(
        self, 
        origin_stop: str, 
        overlap_route: str,
        origin_lat: float = 28.6671,
        origin_lon: float = 77.2286,
    ) -> Tuple[int, int]:
        """Return (distance_m, walk_minutes) to nearest boarding stop for overlap route."""
        # Mock: return pre-computed distances
        mock_distances = {
            "R534": (240, 3),
            "R419": (150, 2),
            "R729": (320, 4),
        }
        return mock_distances.get(overlap_route, (300, 4))
