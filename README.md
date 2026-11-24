# 🚌 Sugam Safar — सुगम सफर

**Crowd-Aware Bus Journey Planner for Delhi**

> _Know the crowd before you board._

Sugam Safar is a data-driven passenger-flow intelligence platform that estimates crowding on Delhi bus routes and helps commuters choose more comfortable journeys. Built for Transport Stack Hackathon 2026 — Problem 2.

## 🎯 What It Does

- **Crowd Prediction**: Estimates relative crowding (Low / Medium / High / Very High) for any Delhi bus route at any time using historical e-ticketing data
- **Smart Journey Planning**: Recommends Fastest, Comfortable, and Balanced journey options with crowd-adjusted travel time
- **Overlapping Corridor Discovery**: Suggests alternate bus numbers running along the same corridor — a Delhi-specific feature
- **Confidence Meter**: Shows how confident the prediction is based on data quality
- **Operator Dashboard**: Route heatmaps, peak analysis, and what-if simulation

## 🏗️ Architecture

```
October E-Ticketing Data (2.56M tickets)
         ↓
   Data Cleaning & Feature Engineering
         ↓
   LightGBM Crowd Model + Crowd DNA Clustering
         ↓
   Relative Crowd Index + Confidence Band
         ↓
   Journey Planner (Generalized Cost Scoring)
         ↓
   FastAPI Backend ← → React Frontend
```

## 🚀 Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173

## 📊 Data

- **Primary**: October 2026 e-ticketing CSV (~2.56M tickets)
  - Fields: `passenger_count`, `amount`, `vehicle_number`, `ticket_type_id`, `start_stop_name`, `end_stop_name`, `route`, `created_at` (IST), `is_ac`
- **Static**: Delhi GTFS (~10,500 stops, 2,400 routes)
- **Optional**: DTC GPS data for bunching analysis

## 🧠 Key Innovations

1. **Relative Crowd Index**: Output is a within-route percentile, not fake absolute headcounts
2. **Overlapping Corridor Discovery**: Multi-bus corridor pooling for lower wait times
3. **Vehicle-Class Normalization**: AC vs non-AC, 12m vs 9m bus capacity normalization
4. **Corridor Priors**: Borrows statistical strength from overlapping routes for low-data routes

## 👥 Team

- Piyush Punera (IIIT Delhi)
- [Team Member 2]
- [Team Member 3]

## 📄 License
MIT
