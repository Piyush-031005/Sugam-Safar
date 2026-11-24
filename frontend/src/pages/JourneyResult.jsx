import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import JourneyCard from '../components/JourneyCard.jsx'
import BusMap from '../components/BusMap.jsx'
import OverlapBusPanel from '../components/OverlapBusPanel.jsx'
import CrowdBadge from '../components/CrowdBadge.jsx'
import { getMockJourneyOptions, getOverlappingBuses } from '../utils/mockData.js'
import { getGeneralizedCost } from '../utils/crowdUtils.js'

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl p-5 shadow-md">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(j => <div key={j} className="h-10 bg-gray-100 rounded" />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function normalizeApiOption(opt) {
  return {
    id: opt.id,
    type: opt.type,
    routeId: opt.route_id,
    routeName: opt.route_name,
    from: opt.from_stop,
    to: opt.to_stop,
    departureTime: opt.departure_time,
    travelTime: opt.travel_time_mins,
    effectiveTime: opt.effective_time_mins,
    walkToStop: opt.walk_to_stop_m,
    walkFromStop: opt.walk_from_stop_m,
    waitTime: opt.wait_time_mins,
    crowdLevel: opt.crowd_level,
    confidence: opt.confidence,
    confidenceReason: opt.confidence_reason,
    crowdIndexBand: opt.crowd_index_band,
    isAC: opt.is_ac,
    busSize: opt.bus_size,
    stops: opt.stops,
    stopLoadProfile: opt.stop_load_profile,
    fare: opt.fare,
    generalizedCost: opt.generalized_cost,
    isTransfer: opt.is_transfer,
    transferHub: opt.transfer_hub,
    geometry: opt.geometry,
  }
}

function normalizeOverlapBus(bus) {
  return {
    routeId: bus.route_id,
    routeName: bus.route_name,
    boardingStop: bus.boarding_stop,
    walkDistance: bus.walk_distance,
    walkMinutes: bus.walk_minutes,
    overlapStops: bus.overlap_stops,
    overlapDescription: bus.overlap_description,
    crowdLevel: bus.crowd_level,
    confidence: bus.confidence,
    confidenceReason: bus.confidence_reason,
    isAC: bus.is_ac,
    corridorBadge: bus.corridor_badge,
    geometry: bus.geometry,
  }
}

export default function JourneyResult() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState(null)
  const [overlapBuses, setOverlapBuses] = useState([])
  const [corridorPool, setCorridorPool] = useState(null)
  const [lookahead, setLookahead] = useState([])
  const [apiMode, setApiMode] = useState('checking')
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [selectedOverlap, setSelectedOverlap] = useState(null)

  // Configurable multiplier sensitivity (Blueprint Section 5.5)
  const [showSensitivity, setShowSensitivity] = useState(false)
  const [wWalk, setWWalk] = useState(1.9)
  const [multVeryHigh, setMultVeryHigh] = useState(1.60)
  const [maxWalkM, setMaxWalkM] = useState(600)

  const origin = searchParams.get('origin') || 'Kashmere Gate ISBT'
  const dest = searchParams.get('dest') || 'Laxmi Nagar'
  const time = searchParams.get('time') || '08:00'
  const dayType = searchParams.get('dayType') || 'weekday'
  const mode = searchParams.get('mode') || 'balanced'
  const hour = parseInt(time.split(':')[0]) || 8

  const fetchJourneys = useCallback(async () => {
    setLoading(true)
    setSelectedOverlap(null)
    try {
      const res = await axios.post('/api/v1/journey', {
        origin,
        destination: dest,
        hour,
        day_type: dayType,
        mode,
        max_walk_m: maxWalkM,
        w_walk: wWalk,
        w_wait: wWalk,
        mult_very_high: multVeryHigh,
      }, { timeout: 2500 })

      const data = res.data
      setResults((data.options || []).map(normalizeApiOption))
      setOverlapBuses((data.overlap_buses || []).map(normalizeOverlapBus))
      setCorridorPool(data.corridor_pool || null)
      setLookahead(data.lookahead || [])
      setFocusedIndex(0)
      setApiMode('live')
    } catch {
      const opts = getMockJourneyOptions(origin, dest, hour)
      const sorted = [...opts].sort((a, b) => getGeneralizedCost(a) - getGeneralizedCost(b))
      const overlaps = getOverlappingBuses(hour)
      setResults(sorted)
      setOverlapBuses(overlaps)
      setCorridorPool({
        stop_name: origin,
        routes: ['419', '534', '729'],
        avg_wait_min: 4,
        label: 'Board any of [419, 534, 729] — avg wait 4 min',
      })
      setLookahead([
        { offset_min: -15, label: '-15 min', crowd_level: hour === 8 ? 'HIGH' : 'MEDIUM' },
        { offset_min: 0, label: 'Selected', crowd_level: sorted[0]?.crowdLevel || 'HIGH' },
        { offset_min: 15, label: '+15 min', crowd_level: hour >= 9 ? 'MEDIUM' : 'HIGH' },
      ])
      setFocusedIndex(0)
      setApiMode('demo')
    } finally {
      setLoading(false)
    }
  }, [origin, dest, hour, dayType, mode, maxWalkM, wWalk, multVeryHigh])

  useEffect(() => {
    fetchJourneys()
  }, [fetchJourneys])

  const activeOption = results?.[focusedIndex]

  return (
    <div className="space-y-5">
      {/* Search Summary Bar */}
      <div className="card flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="font-bold" style={{ color: '#B81104' }}>{origin}</span>
            <span className="text-xl">→</span>
            <span className="font-bold" style={{ color: '#B81104' }}>{dest}</span>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: apiMode === 'live' ? '#F0FDF4' : '#FFFACD',
                color: apiMode === 'live' ? '#166534' : '#854D0E',
              }}
            >
              {apiMode === 'live' ? '🟢 FastAPI Live' : '🟡 Prototype Fallback'}
            </span>
          </div>
          <div className="flex gap-3 mt-1 text-xs text-gray-500">
            <span>🕐 {time}</span>
            <span>📅 {dayType.charAt(0).toUpperCase() + dayType.slice(1)}</span>
            <span>🎯 {mode.charAt(0).toUpperCase() + mode.slice(1)} mode</span>
            <span>🚶 Max walk {maxWalkM}m</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowSensitivity(s => !s)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border transition-colors"
            style={{ borderColor: '#B81104', color: '#B81104', backgroundColor: '#FFFACD' }}
          >
            ⚙️ {showSensitivity ? 'Hide Weights' : 'Tune Multipliers'}
          </button>
          <Link
            to="/"
            className="text-sm font-semibold px-4 py-2 rounded-xl border-2 transition-colors"
            style={{ borderColor: '#B81104', color: '#B81104' }}
          >
            ← Change Search
          </Link>
        </div>
      </div>

      {/* Configurable Multiplier Sensitivity Drawer */}
      {showSensitivity && (
        <div className="card-cream grid md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold block mb-1" style={{ color: '#B81104' }}>
              Walk & Wait Penalty (w): <strong>{wWalk.toFixed(1)}×</strong>
            </label>
            <input
              type="range" min="1.2" max="2.5" step="0.1" value={wWalk}
              onChange={e => setWWalk(parseFloat(e.target.value))}
              className="w-full" style={{ accentColor: '#B81104' }}
            />
            <p className="text-gray-500 mt-0.5">Literature default: 1.9× (London/Singapore)</p>
          </div>
          <div>
            <label className="font-semibold block mb-1" style={{ color: '#B81104' }}>
              Very High Crowd Multiplier: <strong>{multVeryHigh.toFixed(2)}×</strong>
            </label>
            <input
              type="range" min="1.30" max="2.00" step="0.05" value={multVeryHigh}
              onChange={e => setMultVeryHigh(parseFloat(e.target.value))}
              className="w-full" style={{ accentColor: '#B81104' }}
            />
            <p className="text-gray-500 mt-0.5">Default: 1.60× (configurable sensitivity)</p>
          </div>
          <div>
            <label className="font-semibold block mb-1" style={{ color: '#B81104' }}>
              Max Walk Radius (R_walk): <strong>{maxWalkM}m</strong>
            </label>
            <input
              type="range" min="300" max="900" step="50" value={maxWalkM}
              onChange={e => setMaxWalkM(parseInt(e.target.value))}
              className="w-full" style={{ accentColor: '#B81104' }}
            />
            <p className="text-gray-500 mt-0.5">Expands BallTree corridor discovery</p>
          </div>
        </div>
      )}

      {/* Temporal Lookahead Nudge (-15 min / +15 min) */}
      {!loading && lookahead.length > 0 && (
        <div className="card flex items-center justify-between flex-wrap gap-3 py-3">
          <div>
            <p className="text-xs font-bold" style={{ color: '#B81104' }}>⏰ Temporal Lookahead (±15 min departure nudge)</p>
            <p className="text-xs text-gray-500">Check whether leaving 15 minutes earlier or later gives a more comfortable ride.</p>
          </div>
          <div className="flex gap-2">
            {lookahead.map(item => (
              <div
                key={item.label}
                className="px-3 py-1.5 rounded-xl text-center border text-xs"
                style={{
                  backgroundColor: item.offset_min === 0 ? '#FFFACD' : 'white',
                  borderColor: item.offset_min === 0 ? '#B81104' : '#E5E7EB',
                }}
              >
                <p className="font-bold text-gray-700 mb-0.5">{item.label}</p>
                <CrowdBadge level={item.crowd_level} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {/* Journey Cards */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold" style={{ color: '#B81104' }}>
                🚌 {results?.length || 0} Options Found
              </h2>
              <span className="text-xs text-gray-500">Ranked by generalized cost (crowd-weighted)</span>
            </div>

            {results?.map((option, i) => (
              <JourneyCard
                key={option.id}
                option={option}
                overlapBuses={i === 0 ? overlapBuses : []}
                isRecommended={i === 0}
                isFocused={focusedIndex === i && !selectedOverlap}
                onFocusMap={() => {
                  setSelectedOverlap(null)
                  setFocusedIndex(i)
                }}
              />
            ))}

            {hour >= 7 && hour <= 9 && (
              <div className="p-4 rounded-2xl text-sm" style={{ backgroundColor: '#FEF2F2', borderLeft: '4px solid #B81104' }}>
                <strong style={{ color: '#B81104' }}>🕐 Peak Hour Alert:</strong> Travelling during morning rush (7–9 AM).
                Consider the Comfortable AC option or shifting departure after 9:30 AM for lower standing density.
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            <BusMap
              geometry={activeOption?.geometry}
              focusedLabel={activeOption?.routeName}
              overlapFocus={selectedOverlap}
            />

            <OverlapBusPanel
              buses={overlapBuses}
              corridorPool={corridorPool}
              selectedOverlapRoute={selectedOverlap?.routeName}
              onSelectOverlap={bus => setSelectedOverlap(bus)}
            />

            {/* Generalized Cost Explanation */}
            <div className="card text-xs text-gray-500 space-y-2">
              <p className="font-semibold text-sm" style={{ color: '#B81104' }}>📐 Generalized Cost Formula</p>
              <p>Cost = <strong>w·(t_walk + t_wait)</strong> + Σ segment_time × m(crowd_k) + P_transfer</p>
              <p>Multipliers: Low=1.00, Med=1.16, High=1.40, Very High={multVeryHigh.toFixed(2)} | w={wWalk.toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
