"""
Mock Delhi Bus Data
Models Delhi's DTC & Cluster bus corridors (Vikas Marg, Ring Road, Mathura Road, MB Road)
with realistic stop coordinates, overlapping routes, and stop-level boarding/alighting weights.
In production, loaded from October 2026 e-ticketing CSV (~2.56M tickets) and Delhi GTFS.
"""
from typing import Dict, List, Any


CROWD_BY_HOUR = {
    "R405": {  # Kashmere Gate -> Laxmi Nagar -> Nehru Place (Arterial, 12m non-AC)
        0: "LOW", 1: "LOW", 2: "LOW", 3: "LOW", 4: "LOW", 5: "LOW",
        6: "MEDIUM", 7: "VERY_HIGH", 8: "VERY_HIGH", 9: "HIGH",
        10: "MEDIUM", 11: "LOW", 12: "LOW", 13: "MEDIUM", 14: "MEDIUM",
        15: "MEDIUM", 16: "HIGH", 17: "VERY_HIGH", 18: "VERY_HIGH",
        19: "HIGH", 20: "MEDIUM", 21: "LOW", 22: "LOW", 23: "LOW",
    },
    "R419": {  # Kashmere Gate -> Mandi House -> Vikas Marg -> Laxmi Nagar (9m non-AC)
        0: "LOW", 1: "LOW", 2: "LOW", 3: "LOW", 4: "LOW", 5: "LOW",
        6: "MEDIUM", 7: "HIGH", 8: "VERY_HIGH", 9: "HIGH",
        10: "MEDIUM", 11: "LOW", 12: "LOW", 13: "LOW", 14: "MEDIUM",
        15: "MEDIUM", 16: "HIGH", 17: "HIGH", 18: "VERY_HIGH",
        19: "HIGH", 20: "MEDIUM", 21: "LOW", 22: "LOW", 23: "LOW",
    },
    "R534": {  # Anand Vihar -> Vikas Marg -> Mayur Vihar -> Nehru Place (12m AC)
        0: "LOW", 1: "LOW", 2: "LOW", 3: "LOW", 4: "LOW", 5: "LOW",
        6: "LOW", 7: "MEDIUM", 8: "HIGH", 9: "MEDIUM",
        10: "LOW", 11: "LOW", 12: "LOW", 13: "LOW", 14: "LOW",
        15: "LOW", 16: "MEDIUM", 17: "HIGH", 18: "HIGH",
        19: "MEDIUM", 20: "LOW", 21: "LOW", 22: "LOW", 23: "LOW",
    },
    "R729": {  # Anand Vihar -> Laxmi Nagar -> Vikas Marg -> Kashmere Gate (9m non-AC)
        0: "LOW", 1: "LOW", 2: "LOW", 3: "LOW", 4: "LOW", 5: "LOW",
        6: "MEDIUM", 7: "HIGH", 8: "VERY_HIGH", 9: "HIGH",
        10: "MEDIUM", 11: "LOW", 12: "MEDIUM", 13: "MEDIUM", 14: "MEDIUM",
        15: "HIGH", 16: "VERY_HIGH", 17: "VERY_HIGH", 18: "HIGH",
        19: "MEDIUM", 20: "LOW", 21: "LOW", 22: "LOW", 23: "LOW",
    },
    "R501": {  # Connaught Place -> India Gate -> Lajpat Nagar -> Saket (12m AC)
        0: "LOW", 1: "LOW", 2: "LOW", 3: "LOW", 4: "LOW", 5: "LOW",
        6: "LOW", 7: "MEDIUM", 8: "HIGH", 9: "VERY_HIGH",
        10: "HIGH", 11: "MEDIUM", 12: "MEDIUM", 13: "LOW", 14: "LOW",
        15: "MEDIUM", 16: "HIGH", 17: "VERY_HIGH", 18: "HIGH",
        19: "MEDIUM", 20: "LOW", 21: "LOW", 22: "LOW", 23: "LOW",
    },
    "R543": {  # Anand Vihar -> Vikas Marg -> ITO/Mandi House -> Connaught Place -> Dhaula Kuan
        0: "LOW", 1: "LOW", 2: "LOW", 3: "LOW", 4: "LOW", 5: "LOW",
        6: "LOW", 7: "MEDIUM", 8: "MEDIUM", 9: "MEDIUM",
        10: "LOW", 11: "LOW", 12: "LOW", 13: "LOW", 14: "LOW",
        15: "LOW", 16: "MEDIUM", 17: "MEDIUM", 18: "HIGH",
        19: "MEDIUM", 20: "LOW", 21: "LOW", 22: "LOW", 23: "LOW",
    },
    "R347": {  # Rohini East -> Kashmere Gate -> Connaught Place -> Lajpat Nagar -> Nehru Place
        0: "LOW", 1: "LOW", 2: "LOW", 3: "LOW", 4: "LOW", 5: "LOW",
        6: "MEDIUM", 7: "HIGH", 8: "VERY_HIGH", 9: "HIGH",
        10: "MEDIUM", 11: "MEDIUM", 12: "LOW", 13: "LOW", 14: "MEDIUM",
        15: "MEDIUM", 16: "HIGH", 17: "VERY_HIGH", 18: "HIGH",
        19: "MEDIUM", 20: "LOW", 21: "LOW", 22: "LOW", 23: "LOW",
    },
}

OCCUPANCY_MAP = {"LOW": 28, "MEDIUM": 54, "HIGH": 78, "VERY_HIGH": 94}

CONFIDENCE_MAP = {
    "R405": "HIGH",
    "R419": "MEDIUM",
    "R534": "HIGH",
    "R729": "LOW",      # Sparse route-level history -> benefits from Vikas Marg corridor prior
    "R501": "HIGH",
    "R543": "MEDIUM",
    "R347": "HIGH",
}

STOPS = [
    {"id": "S001", "name": "Kashmere Gate ISBT", "lat": 28.6671, "lon": 77.2286},
    {"id": "S002", "name": "Laxmi Nagar", "lat": 28.6318, "lon": 77.2766},
    {"id": "S003", "name": "Shahdara Bus Terminal", "lat": 28.6714, "lon": 77.2893},
    {"id": "S004", "name": "Connaught Place", "lat": 28.6304, "lon": 77.2177},
    {"id": "S005", "name": "Nehru Place", "lat": 28.5491, "lon": 77.2537},
    {"id": "S006", "name": "Dwarka Sector 21", "lat": 28.5523, "lon": 77.0588},
    {"id": "S007", "name": "Rohini East", "lat": 28.7179, "lon": 77.1282},
    {"id": "S008", "name": "Saket", "lat": 28.5244, "lon": 77.2066},
    {"id": "S009", "name": "Lajpat Nagar", "lat": 28.5676, "lon": 77.2434},
    {"id": "S010", "name": "Vikas Marg", "lat": 28.6235, "lon": 77.2834},
    {"id": "S011", "name": "Anand Vihar ISBT", "lat": 28.6467, "lon": 77.3157},
    {"id": "S012", "name": "Mandi House", "lat": 28.6260, "lon": 77.2317},
    {"id": "S013", "name": "India Gate", "lat": 28.6129, "lon": 77.2295},
    {"id": "S014", "name": "Dhaula Kuan", "lat": 28.5921, "lon": 77.1569},
    {"id": "S015", "name": "Mayur Vihar Phase 1", "lat": 28.6072, "lon": 77.2946},
    {"id": "S016", "name": "Laxmi Nagar Metro Gate 2", "lat": 28.6305, "lon": 77.2782},  # ~180m walk transfer stop
    {"id": "S017", "name": "ITO Crossing", "lat": 28.6289, "lon": 77.2414},
]

ROUTES_META = [
    {
        "id": "R405", "name": "Route 405",
        "description": "Kashmere Gate -> Laxmi Nagar -> Nehru Place via Vikas Marg",
        "is_ac": False, "bus_size": "12m", "capacity": 70, "frequency": 8, "fare": 15,
        "corridor": "Vikas Marg Corridor",
        "stops": ["S001", "S017", "S010", "S002", "S015", "S009", "S005"],
        "segment_times_min": [9, 10, 6, 7, 11, 8],
    },
    {
        "id": "R419", "name": "Route 419",
        "description": "Kashmere Gate -> Mandi House -> Laxmi Nagar -> Shahdara",
        "is_ac": False, "bus_size": "9m", "capacity": 45, "frequency": 12, "fare": 10,
        "corridor": "Vikas Marg Corridor",
        "stops": ["S001", "S012", "S017", "S010", "S016", "S002", "S003"],
        "segment_times_min": [8, 5, 9, 5, 3, 12],
    },
    {
        "id": "R534", "name": "Route 534 (AC)",
        "description": "Kashmere Gate -> ITO -> Vikas Marg -> Mayur Vihar -> Laxmi Nagar -> Nehru Place",
        "is_ac": True, "bus_size": "12m", "capacity": 65, "frequency": 15, "fare": 25,
        "corridor": "Vikas Marg Corridor",
        "stops": ["S001", "S017", "S010", "S015", "S002", "S005"],
        "segment_times_min": [11, 11, 8, 6, 12],
    },
    {
        "id": "R729", "name": "Route 729",
        "description": "Anand Vihar -> Laxmi Nagar -> Vikas Marg -> Kashmere Gate",
        "is_ac": False, "bus_size": "9m", "capacity": 45, "frequency": 10, "fare": 15,
        "corridor": "Vikas Marg Corridor",
        "stops": ["S011", "S002", "S016", "S010", "S017", "S001"],
        "segment_times_min": [10, 3, 5, 9, 10],
    },
    {
        "id": "R501", "name": "Route 501 (AC)",
        "description": "Connaught Place -> India Gate -> Lajpat Nagar -> Saket",
        "is_ac": True, "bus_size": "12m", "capacity": 65, "frequency": 20, "fare": 25,
        "corridor": "Ring Road South",
        "stops": ["S004", "S013", "S009", "S005", "S008"],
        "segment_times_min": [7, 12, 8, 11],
    },
    {
        "id": "R543", "name": "Route 543 (AC)",
        "description": "Anand Vihar -> Vikas Marg -> ITO -> Connaught Place -> Dhaula Kuan -> Dwarka",
        "is_ac": True, "bus_size": "12m", "capacity": 65, "frequency": 14, "fare": 25,
        "corridor": "Central East-West Spine",
        "stops": ["S011", "S002", "S010", "S017", "S012", "S004", "S014", "S006"],
        "segment_times_min": [10, 5, 9, 5, 6, 14, 18],
    },
    {
        "id": "R347", "name": "Route 347",
        "description": "Rohini East -> Kashmere Gate -> Connaught Place -> Lajpat Nagar -> Nehru Place",
        "is_ac": False, "bus_size": "12m", "capacity": 70, "frequency": 11, "fare": 15,
        "corridor": "North-South Arterial",
        "stops": ["S007", "S001", "S004", "S013", "S009", "S005"],
        "segment_times_min": [18, 12, 7, 11, 8],
    },
]

OVERLAP_BUSES = {
    "R405": [
        {
            "route_id": "R534", "route_name": "534 (AC)",
            "boarding_stop": "Laxmi Nagar Metro Gate 2", "walk_distance": 240, "walk_minutes": 3,
            "overlap_stops": 11,
            "overlap_description": "Shares 11 stops along Vikas Marg; drops you 180m from destination",
            "is_ac": True, "corridor_badge": "Vikas Marg Corridor", "frequency": 15,
        },
        {
            "route_id": "R419", "route_name": "419",
            "boarding_stop": "ITO Crossing", "walk_distance": 150, "walk_minutes": 2,
            "overlap_stops": 9,
            "overlap_description": "Shares 9 stops along Vikas Marg & ITO; different outer terminus",
            "is_ac": False, "corridor_badge": "Vikas Marg Corridor", "frequency": 12,
        },
        {
            "route_id": "R729", "route_name": "729",
            "boarding_stop": "Laxmi Nagar Metro Gate 2", "walk_distance": 320, "walk_minutes": 4,
            "overlap_stops": 8,
            "overlap_description": "Co-linear along Vikas Marg before diverging toward Anand Vihar",
            "is_ac": False, "corridor_badge": "Vikas Marg Corridor", "frequency": 10,
        },
    ],
    "R419": [
        {
            "route_id": "R405", "route_name": "405",
            "boarding_stop": "Kashmere Gate ISBT", "walk_distance": 120, "walk_minutes": 2,
            "overlap_stops": 9,
            "overlap_description": "Shares 9 stops on main Vikas Marg corridor",
            "is_ac": False, "corridor_badge": "Vikas Marg Corridor", "frequency": 8,
        },
    ],
}


class MockDelhiData:
    """Mock data provider modelled on Delhi DTC & Cluster bus network."""

    def get_stops(self) -> List[Dict[str, Any]]:
        return STOPS

    def get_routes(self) -> List[Dict[str, Any]]:
        return ROUTES_META

    def get_crowd_prediction(self, route_id: str, hour: int, day_type: str = "weekday") -> Dict[str, Any]:
        route_data = CROWD_BY_HOUR.get(route_id, CROWD_BY_HOUR["R405"])
        level = route_data.get(hour, "MEDIUM")

        if day_type in ("saturday", "sunday", "holiday") and level == "VERY_HIGH":
            level = "HIGH"
        elif day_type == "sunday" and level == "HIGH":
            level = "MEDIUM"

        return {
            "route_id": route_id,
            "hour": hour,
            "day_type": day_type,
            "crowd_level": level,
            "confidence": CONFIDENCE_MAP.get(route_id, "MEDIUM"),
            "occupancy_pct": OCCUPANCY_MAP[level],
        }

    def get_daily_profile(self, route_id: str, day_type: str) -> List[Dict[str, Any]]:
        return [
            {
                "hour": h,
                "time": f"{str(h).zfill(2)}:00",
                **self.get_crowd_prediction(route_id, h, day_type),
            }
            for h in range(24)
        ]

    def get_overlap_buses(self, route_id: str, hour: int) -> List[Dict[str, Any]]:
        overlaps = OVERLAP_BUSES.get(route_id, OVERLAP_BUSES["R405"])
        result = []
        for bus in overlaps:
            crowd = self.get_crowd_prediction(bus["route_id"], hour, "weekday")
            result.append({
                **bus,
                "crowd_level": crowd["crowd_level"],
                "confidence": crowd["confidence"],
            })
        return result

    def get_hourly_operator_data(self) -> List[Dict[str, Any]]:
        rows = []
        for h in range(24):
            row = {"hour": f"{str(h).zfill(2)}:00"}
            for route_id in ["R405", "R419", "R534", "R729", "R501"]:
                pred = self.get_crowd_prediction(route_id, h, "weekday")
                row[route_id] = pred["occupancy_pct"]
            rows.append(row)
        return rows
