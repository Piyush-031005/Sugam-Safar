"""
FastAPI Routes for Sugam Safar (CrowdTwin Intelligence)
"""
from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional, List
from src.planner.journey_planner import JourneyPlanner
from src.models.crowd_engine import CrowdEngine
from src.data.mock_delhi_data import MockDelhiData

router = APIRouter(prefix="/api/v1")

planner = JourneyPlanner()
crowd_engine = CrowdEngine()
mock_data = MockDelhiData()


class JourneyRequest(BaseModel):
    origin: str
    destination: str
    hour: int = 8
    day_type: str = "weekday"
    mode: str = "balanced"
    max_walk_m: int = 600
    w_walk: float = 1.9
    w_wait: float = 1.9
    mult_very_high: float = 1.60


class StopInfo(BaseModel):
    id: str
    name: str
    lat: float
    lon: float


@router.get("/stops", response_model=List[StopInfo], tags=["Stops"])
def get_stops(q: Optional[str] = Query(None, description="Search term")):
    """Get list of Delhi bus stops, optionally filtered by search term."""
    stops = mock_data.get_stops()
    if q:
        q_lower = q.lower()
        stops = [s for s in stops if q_lower in s["name"].lower()]
    return stops


@router.post("/journey", tags=["Journey"])
def plan_journey(request: JourneyRequest):
    """Plan a crowd-aware bus journey with overlapping corridor discovery."""
    return planner.plan(
        origin=request.origin,
        destination=request.destination,
        hour=request.hour,
        day_type=request.day_type,
        mode=request.mode,
        max_walk_m=request.max_walk_m,
        w_walk=request.w_walk,
        w_wait=request.w_wait,
        mult_very_high=request.mult_very_high,
    )


@router.get("/crowd/{route_id}", tags=["Crowd"])
def get_crowd_prediction(
    route_id: str,
    hour: int = Query(8, ge=0, le=23),
    day_type: str = Query("weekday"),
):
    """Get crowd prediction + quantile band + confidence reason for a route-hour."""
    return crowd_engine.predict(route_id, hour, day_type)


@router.get("/stop-load/{route_id}", tags=["Crowd"])
def get_stop_load_propagation(
    route_id: str,
    hour: int = Query(8, ge=0, le=23),
    day_type: str = Query("weekday"),
):
    """Module C: Stop-to-stop boarding/alighting passenger-flow propagation."""
    return {
        "route_id": route_id,
        "hour": hour,
        "day_type": day_type,
        "segments": crowd_engine.propagate_stop_load(route_id, hour, day_type),
    }


@router.get("/crowd/{route_id}/daily", tags=["Crowd"])
def get_daily_crowd(route_id: str, day_type: str = Query("weekday")):
    """Get full 24-hour crowd profile for a route."""
    return mock_data.get_daily_profile(route_id, day_type)


@router.get("/routes", tags=["Routes"])
def get_routes():
    """Get all available routes with metadata."""
    return mock_data.get_routes()


@router.get("/routes/{route_id}/overlap", tags=["Routes"])
def get_overlap_buses(route_id: str, hour: int = Query(8, ge=0, le=23)):
    """Find buses running on overlapping corridors."""
    return mock_data.get_overlap_buses(route_id, hour)


@router.get("/evaluation", tags=["Evaluation"])
def get_evaluation():
    """Blueprint Section 8: Baseline comparisons, ablation table & Hybrid tier flags."""
    return crowd_engine.get_evaluation_summary()


@router.get("/operator/heatmap", tags=["Operator"])
def get_heatmap():
    """Get hourly occupancy data for all routes (operator view)."""
    return mock_data.get_hourly_operator_data()


@router.get("/operator/whatif", tags=["Operator"])
def what_if_simulation(
    route_id: str = Query("R405"),
    hour: int = Query(8, ge=0, le=23),
    extra_buses: int = Query(0, ge=0, le=10),
):
    """Module H: Simulate impact of deploying extra buses on route occupancy (fixed demand)."""
    base_load = crowd_engine.predict(route_id, hour, "weekday")["occupancy_pct"]
    reduction_per_bus = 0.09
    simulated_load = max(5, round(base_load * (1 - extra_buses * reduction_per_bus)))
    return {
        "route_id": route_id,
        "hour": hour,
        "extra_buses": extra_buses,
        "current_load_pct": base_load,
        "simulated_load_pct": simulated_load,
        "reduction_pct": base_load - simulated_load,
        "is_comfortable": simulated_load < 60,
        "assumption": "Fixed demand assumed; headway shrinks proportionally with added trips.",
    }


@router.get("/operator/redistribution", tags=["Operator"])
def crowd_redistribution_sim(
    route_id: str = Query("R405"),
    hour: int = Query(8, ge=0, le=23),
    shift_pct: int = Query(15, ge=0, le=40),
):
    """Module G: Behavioural crowd redistribution scenario simulator (sensitivity analysis)."""
    peak_load = crowd_engine.predict(route_id, hour, "weekday")["occupancy_pct"]
    offpeak_load = crowd_engine.predict(route_id, min(22, hour + 2), "weekday")["occupancy_pct"]
    new_peak = max(10, round(peak_load * (1 - shift_pct / 100.0)))
    new_offpeak = min(95, round(offpeak_load + (peak_load - new_peak) * 0.75))
    return {
        "route_id": route_id,
        "hour": hour,
        "shift_pct": shift_pct,
        "before": {"peak_pct": peak_load, "adjacent_hour_pct": offpeak_load},
        "after": {"peak_pct": new_peak, "adjacent_hour_pct": new_offpeak},
        "note": "Behavioral scenario simulation only — not observed field elasticity.",
    }
