"""
Ranker — Sorts journey options by generalized cost with mode-specific adjustments.

Generalized Cost formula:
  GC = IVT_effective + W_walk * walk_mins + W_wait * wait_mins

Where:
  IVT_effective = IVT_base * crowd_multiplier
  W_walk = W_wait = 1.9  (research-backed for Indian urban transit)
  crowd_multiplier: LOW=1.0, MEDIUM=1.16, HIGH=1.4, VERY_HIGH=1.6
"""
from typing import List, Dict, Any

CROWD_MULTIPLIER = {
    "LOW": 1.00,
    "MEDIUM": 1.16,
    "HIGH": 1.40,
    "VERY_HIGH": 1.60,
}


class Ranker:
    """Ranks journey options by generalized cost, adjusted for mode preference."""

    W_WALK = 1.9
    W_WAIT = 1.9

    CROWD_MULTIPLIER = CROWD_MULTIPLIER

    MODE_WEIGHTS = {
        # (crowd_weight_bonus, speed_weight_bonus)
        "fastest":    (0.0, 2.0),   # Prioritize raw speed
        "comfortable": (3.0, 0.0),  # Heavily penalize crowd
        "balanced":   (1.0, 1.0),   # Equal consideration
    }

    def rank(self, options: List[Dict[str, Any]], mode: str = "balanced") -> List[Dict]:
        """Sort options by adjusted generalized cost."""
        crowd_bonus, speed_bonus = self.MODE_WEIGHTS.get(mode, (1.0, 1.0))

        scored = []
        for opt in options:
            crowd_level = opt.get("crowd_level", "MEDIUM")
            crowd_mult = self.CROWD_MULTIPLIER.get(crowd_level, 1.0)
            
            walk_mins = (opt.get("walk_to_stop_m", 300) + opt.get("walk_from_stop_m", 200)) / 1.3 / 60
            wait_mins = opt.get("wait_time_mins", 8)
            ivt = opt.get("travel_time_mins", 30)
            ivt_eff = ivt * crowd_mult
            
            # Base generalized cost
            base_gc = ivt_eff + self.W_WALK * walk_mins + self.W_WAIT * wait_mins
            
            # Mode adjustment
            crowd_penalty = (crowd_mult - 1.0) * ivt * crowd_bonus
            speed_bonus_val = (30 - ivt) * speed_bonus * 0.1  # Reward faster routes
            
            adjusted_gc = base_gc + crowd_penalty - speed_bonus_val
            scored.append((adjusted_gc, opt))

        scored.sort(key=lambda x: x[0])

        result = []
        type_labels = ["fastest", "comfortable", "balanced"]
        for i, (gc, opt) in enumerate(scored):
            enriched = {**opt}
            if i < len(type_labels):
                enriched["type"] = type_labels[i]
            enriched["generalized_cost"] = round(gc, 2)
            result.append(enriched)

        return result
