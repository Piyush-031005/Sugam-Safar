import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, ReferenceLine } from 'recharts'
import { getHourlyOperatorData } from '../utils/mockData.js'

function crowdColor(v) {
  if (v >= 80) return '#EF4444'
  if (v >= 60) return '#F97316'
  if (v >= 35) return '#EAB308'
  return '#22C55E'
}

export default function WhatIfSimulator() {
  const [route, setRoute] = useState('R405')
  const [extraBuses, setExtraBuses] = useState(2)
  const [hour, setHour] = useState(8)

  const hourlyData = getHourlyOperatorData()
  const currentLoad = hourlyData[hour][route]
  const perBusReduction = 0.09
  const simulatedLoad = Math.max(5, Math.round(currentLoad * (1 - extraBuses * perBusReduction)))

  const chartData = hourlyData.map(d => ({
    ...d,
    simulated: d.hour === `${String(hour).padStart(2,'0')}:00`
      ? simulatedLoad
      : Math.max(5, Math.round(d[route] * (1 - extraBuses * perBusReduction * 0.3))),
    original: d[route],
  }))

  const routes = ['R405', 'R419', 'R534', 'R729']

  return (
    <div className="card">
      <h3 className="font-bold mb-1" style={{ color: '#B81104' }}>🔮 What-If Fleet Simulator</h3>
      <p className="text-xs text-gray-500 mb-4">Model the impact of deploying additional buses on route occupancy.</p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">ROUTE</label>
          <select className="input-field text-sm" value={route} onChange={e => setRoute(e.target.value)}>
            {routes.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">PEAK HOUR</label>
          <select className="input-field text-sm" value={hour} onChange={e => setHour(parseInt(e.target.value))}>
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            EXTRA BUSES: <strong style={{ color: '#B81104' }}>+{extraBuses}</strong>
          </label>
          <input
            type="range" min={0} max={8} value={extraBuses}
            onChange={e => setExtraBuses(parseInt(e.target.value))}
            className="w-full mt-2"
            style={{ accentColor: '#B81104' }}
          />
        </div>
      </div>

      {/* Before / After Comparison */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#FEF2F2' }}>
          <p className="text-xs text-gray-500">Current Load</p>
          <p className="text-2xl font-bold" style={{ color: crowdColor(currentLoad) }}>{currentLoad}%</p>
        </div>
        <div className="flex items-center justify-center flex-col">
          <p className="text-xl text-gray-400">→</p>
          <p className="text-xs text-gray-400">+{extraBuses} buses</p>
        </div>
        <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#F0FDF4' }}>
          <p className="text-xs text-gray-500">Projected Load</p>
          <p className="text-2xl font-bold" style={{ color: crowdColor(simulatedLoad) }}>{simulatedLoad}%</p>
          <p className="text-xs" style={{ color: '#15803D' }}>↓ {currentLoad - simulatedLoad}%</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={3} />
          <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 9 }} domain={[0, 100]} />
          <Tooltip formatter={(v, name) => [`${v}%`, name === 'original' ? 'Current' : 'Simulated']} />
          <ReferenceLine y={60} stroke="#F97316" strokeDasharray="4 4" label={{ value: 'High threshold', fontSize: 9, fill: '#F97316' }} />
          <Bar dataKey="original" opacity={0.4} radius={[2,2,0,0]}>
            {chartData.map((e, i) => <Cell key={i} fill={crowdColor(e.original)} />)}
          </Bar>
          <Bar dataKey="simulated" radius={[2,2,0,0]}>
            {chartData.map((e, i) => <Cell key={i} fill={crowdColor(e.simulated)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {extraBuses > 0 && (
        <div className="mt-3 p-3 rounded-xl text-xs" style={{ backgroundColor: '#FFFACD', borderLeft: '3px solid #B81104' }}>
          <strong>Analysis:</strong> Deploying +{extraBuses} extra buses on {route} at {String(hour).padStart(2,'0')}:00
          reduces occupancy from <strong>{currentLoad}%</strong> to <strong>{simulatedLoad}%</strong>
          {simulatedLoad < 60
            ? ' — bringing it within comfortable range. ✅'
            : ' — still above comfortable threshold (60%). Consider +' + (Math.ceil((currentLoad - 60) / (currentLoad * perBusReduction))) + ' more buses.'}
        </div>
      )}
    </div>
  )
}
