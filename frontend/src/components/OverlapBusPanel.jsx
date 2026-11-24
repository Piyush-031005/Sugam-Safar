import React from 'react'
import CrowdBadge from './CrowdBadge.jsx'
import ConfidenceMeter from './ConfidenceMeter.jsx'

export default function OverlapBusPanel({ buses = [], corridorPool, selectedOverlapRoute, onSelectOverlap }) {
  if (!buses || buses.length === 0) {
    return (
      <div className="card">
        <h3 className="font-bold mb-2" style={{ color: '#B81104' }}>🔀 Corridor Alternatives</h3>
        <p className="text-sm text-gray-500">No overlapping buses found for this route segment.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="font-bold mb-1" style={{ color: '#B81104' }}>🔀 Nearby Overlapping Buses (Same Stretch)</h3>
      <p className="text-xs text-gray-500 mb-3">
        Different route numbers running co-linearly along the same arterial road — tap any bus to highlight its boarding walk & corridor on the map.
      </p>

      {/* Comfortable Bus Pool Card */}
      {corridorPool && (
        <div className="mb-3 p-3 rounded-xl text-xs" style={{ backgroundColor: '#B81104', color: '#FFFACD' }}>
          <p className="font-bold text-sm mb-0.5">🚌 Comfortable Bus Pool at {corridorPool.stop_name}</p>
          <p className="opacity-95">{corridorPool.label}</p>
          <p className="text-[11px] opacity-80 mt-1">
            Common-line pooling: E[Wait] = 1 / (2 × Σ f_r) across Low/Medium buses
          </p>
        </div>
      )}

      {/* Corridor Badge */}
      {buses[0]?.corridorBadge && (
        <div className="inline-block mb-3 text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#FFFACD', color: '#B81104', border: '1px solid #e5d87d' }}>
          🛣️ {buses[0].corridorBadge}
        </div>
      )}

      <div className="space-y-3">
        {buses.map((bus, i) => {
          const isSelected = selectedOverlapRoute === bus.routeName
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectOverlap && onSelectOverlap(isSelected ? null : bus)}
              className="w-full text-left rounded-xl p-3.5 border transition-all"
              style={{
                backgroundColor: isSelected ? '#FFF5F5' : '#FFFACD',
                borderColor: isSelected ? '#B81104' : '#f0e68c',
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-base font-bold" style={{ color: '#B81104' }}>🚌 Bus {bus.routeName}</span>
                  {bus.isAC && <span className="ml-2 text-xs font-semibold" style={{ color: '#4338CA' }}>❄️ AC</span>}
                </div>
                <CrowdBadge level={bus.crowdLevel} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="text-gray-400">Board at:</span>
                  <p className="font-semibold">{bus.boardingStop}</p>
                </div>
                <div>
                  <span className="text-gray-400">Walk distance:</span>
                  <p className="font-semibold">{bus.walkDistance}m ({bus.walkMinutes} min)</p>
                </div>
                <div>
                  <span className="text-gray-400">Shared stops:</span>
                  <p className="font-semibold">{bus.overlapStops} stops</p>
                </div>
                <div>
                  <span className="text-gray-400">Confidence:</span>
                  <ConfidenceMeter confidence={bus.confidence} reason={bus.confidenceReason} showLabel={false} />
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-2 italic">{bus.overlapDescription}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
