import React, { useState } from 'react'
import CrowdBadge from './CrowdBadge.jsx'
import ConfidenceMeter from './ConfidenceMeter.jsx'
import { getEffectiveTravelTime } from '../utils/crowdUtils.js'

const SEG_COLORS = {
  LOW: '#22C55E',
  MEDIUM: '#EAB308',
  HIGH: '#F97316',
  VERY_HIGH: '#EF4444',
}

export default function JourneyCard({ option, overlapBuses = [], isRecommended = false, isFocused = false, onFocusMap }) {
  const [showStops, setShowStops] = useState(false)
  const [showOverlap, setShowOverlap] = useState(false)

  const typeColors = {
    fastest:     { border: '#3B82F6', bg: '#EFF6FF', label: '⚡ Fastest',     textColor: '#1D4ED8' },
    comfortable: { border: '#22C55E', bg: '#F0FDF4', label: '😌 Comfortable', textColor: '#15803D' },
    balanced:    { border: '#F59E0B', bg: '#FFFBEB', label: '⚖️ Balanced',    textColor: '#B45309' },
  }

  const typeStyle = typeColors[option.type] || typeColors.balanced
  const effectiveTime = option.effectiveTime || getEffectiveTravelTime(option.travelTime, option.crowdLevel)

  return (
    <div
      className="relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200"
      style={{
        borderLeft: `4px solid ${typeStyle.border}`,
        outline: isFocused ? '2px solid #B81104' : 'none',
      }}
    >
      {isRecommended && (
        <div
          className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: '#B81104', color: '#FFFACD' }}
        >
          ⭐ Recommended
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 pr-24">
          <div className="flex flex-wrap gap-1.5">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: typeStyle.bg, color: typeStyle.textColor }}
            >
              {typeStyle.label}
            </span>
            {option.isAC && (
              <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#EEF2FF', color: '#4338CA' }}>
                ❄️ AC Bus
              </span>
            )}
            {option.isTransfer && (
              <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                🔄 1-Transfer ({option.transferHub})
              </span>
            )}
          </div>
          <CrowdBadge level={option.crowdLevel} />
        </div>

        {/* Route Info */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color: '#B81104' }}>🚌 {option.routeName}</span>
            <span className="text-xs text-gray-500">• {option.busSize || '12m'} bus</span>
          </div>
          {onFocusMap && (
            <button
              type="button"
              onClick={onFocusMap}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors"
              style={{
                borderColor: '#B81104',
                backgroundColor: isFocused ? '#B81104' : '#FFFACD',
                color: isFocused ? '#FFFACD' : '#B81104',
              }}
            >
              {isFocused ? '📍 Focused on Map' : '🗺️ Show on Map'}
            </button>
          )}
        </div>

        {/* Journey Timeline */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 flex-wrap">
          <span className="font-semibold text-gray-800">{option.departureTime}</span>
          <span className="text-gray-400">•</span>
          <span className="font-medium">{option.from}</span>
          <span>→</span>
          <span className="font-medium">{option.to}</span>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { value: `${effectiveTime}`, sub: `raw ${option.travelTime}m`, label: 'eff. mins', highlight: true },
            { value: `${option.walkToStop}m`, sub: `${Math.max(1, Math.round(option.walkToStop / 78))} min`, label: 'walk to bus', highlight: false },
            { value: `${option.waitTime}`, sub: 'expected', label: 'min wait', highlight: false },
            { value: `₹${option.fare}`, sub: `GC ${option.generalizedCost ?? '—'}`, label: 'fare', highlight: false },
          ].map(stat => (
            <div key={stat.label} className="text-center p-2 rounded-xl" style={{ backgroundColor: '#FFFDF0' }}>
              <p className="text-lg font-bold" style={{ color: stat.highlight ? '#B81104' : '#374151' }}>{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-[10px] text-gray-400">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Confidence + Quantile Band */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Confidence:</span>
            <ConfidenceMeter confidence={option.confidence} reason={option.confidenceReason} />
          </div>
          {option.crowdIndexBand && (
            <span className="text-[11px] text-gray-500">
              p10–p90 index band: <strong>{option.crowdIndexBand[0]}–{option.crowdIndexBand[1]}%</strong>
            </span>
          )}
        </div>

        {/* Crowd Impact Warning */}
        {option.crowdLevel === 'VERY_HIGH' && (
          <div className="text-xs p-2.5 rounded-lg mb-3" style={{ backgroundColor: '#FEF2F2', color: '#991B1B' }}>
            ⚠️ High standing density adds +{Math.max(5, effectiveTime - option.travelTime)} eff. min discomfort penalty. Check comfortable corridor alternatives below.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            type="button"
            onClick={() => setShowStops(!showStops)}
            className="flex-1 text-sm py-2 rounded-lg border transition-colors font-medium"
            style={{ borderColor: '#B81104', color: '#B81104' }}
          >
            {showStops ? '▲ Hide Stops & Segment Load' : '▼ Stop-by-Stop Load Profile'}
          </button>
          {overlapBuses.length > 0 && (
            <button
              type="button"
              onClick={() => setShowOverlap(!showOverlap)}
              className="flex-1 text-sm py-2 rounded-lg border transition-colors font-medium"
              style={{
                borderColor: '#8B0000',
                color: '#8B0000',
                backgroundColor: showOverlap ? '#FFF5F5' : 'white',
              }}
            >
              {showOverlap ? '▲ Hide Corridor Buses' : `🔀 ${overlapBuses.length} Overlapping Buses`}
            </button>
          )}
        </div>

        {/* Stop Timeline + Module C Stop-to-Stop Propagation */}
        {showStops && option.stops && (
          <div className="mt-3 pt-3 border-t stop-timeline pl-6">
            <p className="text-[11px] font-semibold text-gray-500 mb-2">MODULE C: STOP-TO-STOP PASSENGER FLOW PROPAGATION</p>
            {option.stops.map((stop, i) => {
              const seg = option.stopLoadProfile?.[i]
              const segLevel = seg?.segment_crowd_level || option.crowdLevel
              const loadPct = seg?.onboard_index ?? (i === option.stops.length - 1 ? 0 : 60)
              return (
                <div key={i} className="relative mb-3 last:mb-0">
                  <div
                    className="absolute -left-6 w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs"
                    style={{
                      borderColor: '#B81104',
                      backgroundColor: (i === 0 || i === option.stops.length - 1) ? '#B81104' : 'white',
                      color: (i === 0 || i === option.stops.length - 1) ? '#FFFACD' : '#B81104',
                    }}
                  >
                    {i === 0 ? '●' : i === option.stops.length - 1 ? '■' : '·'}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-gray-700 font-medium">{stop}</p>
                    {i < option.stops.length - 1 && (
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.max(12, loadPct)}%`, backgroundColor: SEG_COLORS[segLevel] || '#EAB308' }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-500 w-10 text-right">{loadPct}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Overlap Buses */}
        {showOverlap && overlapBuses.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs font-semibold text-gray-500 mb-2">🛣️ NEARBY BUSES ON SAME CORRIDOR</p>
            {overlapBuses.map((bus, i) => (
              <div key={i} className="rounded-xl p-3 mb-2 border" style={{ backgroundColor: '#FFFACD', borderColor: '#f0e68c' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold" style={{ color: '#B81104' }}>Bus {bus.routeName}</span>
                  <CrowdBadge level={bus.crowdLevel} size="sm" />
                </div>
                <p className="text-xs text-gray-600 mb-1">
                  📍 Board at: <strong>{bus.boardingStop}</strong> ({bus.walkDistance}m · {bus.walkMinutes} min walk)
                </p>
                <p className="text-xs text-gray-600">🛣️ {bus.overlapDescription}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
