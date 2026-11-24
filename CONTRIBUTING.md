# Team Collaboration Guide — Sugam Safar

This repository is set up for a **3-member team** working in parallel without merge conflicts.

## Branching Strategy

| Branch | Owner | Scope |
|---|---|---|
| `main` | Protected / Shared | Always runnable Hybrid-tier prototype (FastAPI + React). Merge only via PRs or tested commits. |
| `feature/ml-crowd-engine` | Member 1 (ML & Modeling) | `backend/src/models/`, LightGBM training on October e-ticketing CSV, Crowd DNA clustering, evaluation metrics |
| `feature/gtfs-spatial-planner` | Member 2 (Data & Routing) | `backend/src/planner/`, GTFS `BallTree` index (`build_index.py`), RAPTOR 1-transfer search, GPS bunching |
| `feature/frontend-ux` | Member 3 (Frontend & Viz) | `frontend/src/`, React UI, Leaflet map interactions, Operator What-If & Insights visualizations |

## How Teammates Start Working

1. Clone the repository and pull `main`:
   ```bash
   git clone https://github.com/Piyush-031005/Sugam-Safar.git
   cd Sugam-Safar
   git checkout main
   ```

2. Create and switch to your assigned branch:
   ```bash
   git checkout -b feature/frontend-ux   # or feature/ml-crowd-engine / feature/gtfs-spatial-planner
   git push -u origin feature/frontend-ux
   ```

3. Sync with `main` before opening a PR:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

4. Keep raw datasets (`*.csv`, `*.parquet`, `*.sqlite`) out of Git — `.gitignore` already excludes them.
