import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { getHourlyOperatorData } from '../utils/mockData.js'

function crowdColor(v) {
  if (v >= 80) return '#EF4444'
  if (v >= 60) return '#F97316'
  if (v >= 35) return '#EAB308'
  return '#22C55E'
}

const ROUTE_OPTIONS = [
  { id: 'R405', label: 'Route 405 — Kashmere Gate → Laxmi Nagar' },
  { id: 'R419', label: 'Route 419 — Kashmere Gate → Shahdara' },
  { id: 'R534', label: 'Route 534 (AC) — Kashmere Gate → Laxmi Nagar' },
  { id: 'R729', label: 'Route 729 — Anand Vihar → Kashmere Gate' },
]

export default function OperatorDashboard() {
  const [selectedRoute, setSelectedRoute] = useState('R405')
  const [whatIfBuses, setWhatIfBuses] = useState(0)
  const [whatIfHour, setWhatIfHour] = useState(8)

  const hourlyData = getHourlyOperatorData()

  const currentLoad = hourlyData[whatIfHour][selectedRoute]
  const simulatedLoad = Math.max(5, Math.round(currentLoad * (1 - whatIfBuses * 0.08)))
  const reduction = currentLoad - simulatedLoad

  const peakHour = hourlyData.reduce((max, d) => d[selectedRoute] > max.val ? { h: d.hour, val: d[selectedRoute] } : max, { h: '08:00', val: 0 })

  return (
    <div className="space-y-5">
      {/* Route Selector */}
      <div className="card">
        <h3 className="font-bold mb-3" style={{ color: '#B81104' }}>🎛️ Operator Dashboard</h3>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">SELECT ROUTE</label>
          <select
            className="input-field"
            value={selectedRoute}
            onChange={e => setSelectedRoute(e.target.value)}
          >
            {ROUTE_OPTIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#FEF2F2' }}>
            <p className="text-2xl font-bold" style={{ color: '#B81104' }}>{peakHour.val}%</p>
            <p className="text-xs text-gray-600">Peak Load</p>
            <p className="text-xs text-gray-400">{peakHour.h}</p>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#FFFACD' }}>
            <p className="text-2xl font-bold" style={{ color: '#B45309' }}>
              {Math.round(hourlyData.reduce((s, d) => s + d[selectedRoute], 0) / 24)}%
            </p>
            <p className="text-xs text-gray-600">Avg Load</p>
            <p className="text-xs text-gray-400">Daily mean</p>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#F0FDF4' }}>
            <p className="text-2xl font-bold" style={{ color: '#15803D' }}>
              {hourlyData.filter(d => d[selectedRoute] < 35).length}h
            </p>
            <p className="text-xs text-gray-600">Off-Peak Hours</p>
            <p className="text-xs text-gray-400">Load &lt; 35%</p>
          </div>
        </div>
      </div>

      {/* Hourly Load Chart */}
      <div className="card">
        <h4 className="font-semibold mb-3 text-sm" style={{ color: '#B81104' }}>📊 Hourly Occupancy — {selectedRoute}</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e68c" />
            <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={3} />
            <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} domain={[0, 100]} />
            <Tooltip formatter={v => [`${v}%`, 'Occupancy']} />
            <Bar dataKey={selectedRoute} name="Occupancy" radius={[3, 3, 0, 0]}>
              {hourlyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={crowdColor(entry[selectedRoute])} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-3 mt-2 text-xs justify-center">
          {[['#22C55E', 'Low (<35%)'], ['#EAB308', 'Medium (35-60%)'], ['#F97316', 'High (60-80%)'], ['#EF4444', 'Very High (>80%)']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: c }} />
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* What-If Simulator */}
      <div className="card">
        <h4 className="font-semibold mb-1 text-sm" style={{ color: '#B81104' }}>🔮 What-If Simulator</h4>
        <p className="text-xs text-gray-500 mb-4">Simulate the impact of adding extra buses to reduce peak crowding.</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">HOUR TO SIMULATE</label>
            <select className="input-field text-sm" value={whatIfHour} onChange={e => setWhatIfHour(parseInt(e.target.value))}>
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              EXTRA BUSES: <strong style={{ color: '#B81104' }}>+{whatIfBuses}</strong>
            </label>
            <input
              type="range"
              min={0}
              max={5}
              value={whatIfBuses}
              onChange={e => setWhatIfBuses(parseInt(e.target.value))}
              className="w-full mt-2"
              style={{ accentColor: '#B81104' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl border" style={{ borderColor: '#E5E7EB' }}>
            <p className="text-xs text-gray-500 mb-1">Current Load</p>
            <p className="text-xl font-bold" style={{ color: crowdColor(currentLoad) }}>{currentLoad}%</p>
          </div>
          <div className="text-center flex items-center justify-center">
            <div>
              <p className="text-2xl">→</p>
              <p className="text-xs text-gray-400">+{whatIfBuses} buses</p>
            </div>
          </div>
          <div className="text-center p-3 rounded-xl border" style={{ borderColor: '#22C55E', backgroundColor: '#F0FDF4' }}>
            <p className="text-xs text-gray-500 mb-1">Simulated Load</p>
            <p className="text-xl font-bold" style={{ color: crowdColor(simulatedLoad) }}>{simulatedLoad}%</p>
            {reduction > 0 && (
              <p className="text-xs" style={{ color: '#15803D' }}>↓ {reduction}% reduction</p>
            )}
          </div>
        </div>

        {whatIfBuses > 0 && (
          <div className="mt-3 p-3 rounded-xl text-xs" style={{ backgroundColor: '#FFFACD', borderLeft: '3px solid #B81104' }}>
            <strong>Insight:</strong> Adding {whatIfBuses} extra bus{whatIfBuses > 1 ? 'es' : ''} at {String(whatIfHour).padStart(2,'0')}:00
            would reduce load from {currentLoad}% to ~{simulatedLoad}%
            {simulatedLoad < 60 ? ' — bringing it to a comfortable level.' : ' — still above comfortable threshold (60%).'}
          </div>
        )}
      </div>
    </div>
  )
}
