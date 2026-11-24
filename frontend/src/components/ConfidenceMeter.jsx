import React from 'react'
import { getConfidenceDescription } from '../utils/crowdUtils.js'

export default function ConfidenceMeter({ confidence, reason, showLabel = true }) {
  const configs = {
    HIGH:   { bars: 3, color: '#22C55E', label: 'High Confidence' },
    MEDIUM: { bars: 2, color: '#EAB308', label: 'Medium Confidence' },
    LOW:    { bars: 1, color: '#EF4444', label: 'Low Confidence' },
  }

  const config = configs[confidence] || configs.MEDIUM

  return (
    <div className="flex items-center gap-2" title={getConfidenceDescription(confidence, reason)}>
      <div className="flex gap-0.5">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="w-1.5 h-4 rounded-sm"
            style={{
              backgroundColor: i <= config.bars ? config.color : '#E5E7EB',
              opacity: i <= config.bars ? 1 : 0.4,
            }}
          />
        ))}
      </div>
      {showLabel && <span className="text-xs text-gray-500">{config.label}</span>}
    </div>
  )
}
