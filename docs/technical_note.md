# Sugam Safar — Technical Note

**Transport Stack Hackathon 2026 · Problem 2: Crowd-Aware Bus Journey Planner**

---

## 1. Problem Statement

Design a system that uses historical e-ticketing data to estimate crowding on Delhi bus routes and help commuters make smarter journey decisions.

**Core challenge:** Raw e-ticketing data gives us ticket sales, not passenger counts on a bus at a given time. We must infer occupancy patterns from boarding data, while handling:
- Sparse data for low-frequency routes
- AC vs non-AC capacity differences
- Multiple bus sizes (9m, 12m)
- Temporal patterns (peak/off-peak, weekday/weekend)

---

## 2. Data

### 2.1 Primary Dataset
October 2026 DTC e-ticketing export (~2.56M tickets):

| Field | Type | Notes |
|-------|------|-------|
| `passenger_count` | int | Tickets sold per transaction |
| `amount` | float | Fare collected (₹) |
| `vehicle_number` | str | Bus ID |
| `ticket_type_id` | int | Single/return/pass |
| `start_stop_name` | str | Boarding stop |
| `end_stop_name` | str | Alighting stop |
| `route` | str | Route number |
| `created_at` | datetime (IST) | Transaction timestamp |
| `is_ac` | bool | AC or non-AC bus |

### 2.2 Static Data
- Delhi GTFS: ~10,500 stops, 2,400 routes, full stop-time sequences
- Optionally: DTC GPS pings for bus bunching analysis

---

## 3. Methodology

### 3.1 Relative Crowd Index
Rather than estimating absolute passenger counts (which requires knowing bus occupancy at start of trip), we compute a **relative crowd index** — the percentile of hourly boarding volume within a route's own distribution:

```
raw_index(route, hour, day_type) = percentile_rank(
    boardings[route, hour, day_type],
    boardings[route, all_hours, day_type]
)
```

Thresholds: LOW < 0.33 ≤ MEDIUM < 0.60 ≤ HIGH < 0.80 ≤ VERY_HIGH

**Why this works:** A commuter cares whether THIS bus is busier than usual, not whether it carries 60 or 80 passengers. The relative index is also robust to route-level differences in capacity.

### 3.2 Vehicle-Class Normalization
Before computing the index, we normalize:
- **Bus size:** 12m buses get capacity weight 1.33× vs 9m buses
- **AC vs non-AC:** Modelled separately (AC passengers tend to be premium, lower elasticity)

```python
normalized_boardings = raw_boardings / (capacity_factor * ac_factor)
```

### 3.3 Corridor Priors (Low-Data Routes)
For routes with < 50 trips at a given hour/day-type, we borrow statistical strength from overlapping routes running the same corridor:

```
crowd_prior(route, hour) = 0.4 * route_own_index + 0.6 * corridor_average_index
```

This prevents extreme predictions on sparse routes while still personalizing.

### 3.4 LightGBM Model Features
| Feature | Type | Notes |
|---------|------|-------|
| `hour_of_day` | int (0-23) | Most important feature |
| `day_of_week` | int (0-6) | Mon=0, Sun=6 |
| `is_holiday` | bool | Public holiday flag |
| `route_cluster` | int (1-4) | Crowd DNA cluster ID |
| `is_ac` | bool | AC flag |
| `bus_size_m` | int (9/12) | Bus capacity tier |
| `lag_1h_load` | float | Crowd index 1 hour ago |
| `lag_7d_load` | float | Same hour last week |
| `week_of_month` | int (1-5) | Payday/month-end effects |

**Training:** 70/15/15 train/val/test split on Oct data with time-series-aware split (no data leakage).

**Target:** Per-route-hour percentile rank (continuous regression, then thresholded).

### 3.5 Crowd DNA Clustering
K-means (K=4) on 24-dimensional hourly demand vectors (normalized per route):

| Cluster | Name | Description |
|---------|------|-------------|
| C1 | Office Commuter (Twin-Peak) | Peaks 7-9 AM and 5-8 PM |
| C2 | Market / Shopping (Midday) | Peak 10 AM - 3 PM |
| C3 | AC Comfortable Route | Lower overall, uniform |
| C4 | Inter-district Feeder | Variable, multi-peak |

Cluster membership is used as a feature in the main model.

---

## 4. Journey Planner

### 4.1 Generalized Cost Formula
```
GC(option) = IVT_eff + W_walk × walk_mins + W_wait × wait_mins

Where:
  IVT_eff = IVT_base × crowd_multiplier
  crowd_multiplier: LOW=1.00, MEDIUM=1.16, HIGH=1.40, VERY_HIGH=1.60
  W_walk = W_wait = 1.9  (from Delhi travel behavior studies)
```

The crowd multiplier converts crowding discomfort into effective time — a 30-min ride in a Very High crowd bus "feels like" 48 minutes.

### 4.2 Three Option Types
1. **Fastest** — Minimizes raw travel time (lowest base IVT)
2. **Comfortable** — Minimizes crowd multiplier (prefers AC/low-crowd routes)
3. **Balanced** — Minimizes generalized cost (optimal tradeoff)

### 4.3 Overlapping Corridor Discovery
Algorithm:
1. For each candidate route, find all routes sharing ≥ 7 stops on the same corridor segment
2. Rank by: (walk distance to boarding point) + (crowd penalty on that route)
3. Compute corridor-pooled effective wait time: `1 / Σ(1/headway_i)`

---

## 5. Confidence Band

Each prediction carries a confidence label based on data volume:

| Confidence | Ticket Count (this hour/day-type) | Description |
|------------|-----------------------------------|-------------|
| HIGH | > 200 trips | Model well-trained, low uncertainty |
| MEDIUM | 50-200 trips | Some variability expected |
| LOW | < 50 trips | Sparse data; corridor prior applied |

---

## 6. Architecture

```
Raw CSV → preprocess.py → crowd_features.parquet
                        → lightgbm training → crowd_model.txt
                                           ↓
                              CrowdEngine.predict(route, hour, day_type)
                                           ↓
                              JourneyPlanner.plan(origin, dest, hour)
                                           ↓
                              FastAPI /api/v1/journey POST
                                           ↓
                              React Frontend (JourneyResult page)
```

---

## 7. Limitations & Future Work

1. **No real-time data:** Currently uses historical distributions; real-time GPS/ticket feeds would enable live updates
2. **Origin-destination estimation:** E-ticketing gives boarding stop only; alighting stop inferred from route terminal (imperfect)
3. **Boarding vs in-vehicle count:** We track boarding events, not how many passengers are still on the bus mid-route
4. **Weather integration:** Rains significantly spike crowding; weather API integration is a priority
5. **Intermodal:** No metro/auto integration yet — purely bus-focused

---

## 8. Team & Acknowledgements

- Piyush Punera (IIIT Delhi) — Lead ML & Backend
- [Team Member 2] — Frontend & Design
- [Team Member 3] — Data Engineering & Spatial Analysis

**Data:** DTC e-ticketing open data; Delhi GTFS (OpenMobilityData)  
**Built for:** Transport Stack Hackathon 2026, Problem 2
