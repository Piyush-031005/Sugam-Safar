import React, { useState } from 'react'
import OperatorDashboard from '../components/OperatorDashboard.jsx'
import WhatIfSimulator from '../components/WhatIfSimulator.jsx'

export default function OperatorView() {
  const [shiftPct, setShiftPct] = useState(15)
  const peakBefore = 94
  const peakAfter = Math.max(20, Math.round(peakBefore * (1 - shiftPct / 100)))
  const offpeakBefore = 42
  const offpeakAfter = Math.min(90, Math.round(offpeakBefore + (peakBefore - peakAfter) * 0.75))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#B81104' }}>🎛️ Operator Digital Twin & What-If View</h2>
        <p className="text-sm text-gray-500 mt-1">
          Route-level occupancy analytics, fleet deployment simulation (Module H), and behavioral redistribution scenarios (Module G).
        </p>
      </div>

      {/* Alert Banner */}
      <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: '#FEF2F2', borderLeft: '4px solid #B81104' }}>
        <strong style={{ color: '#B81104' }}>🔴 Peak Demand Alert (October Model):</strong> Route 405 on Vikas Marg hits <strong>94% relative index</strong> at 08:00 AM.
        Adding 2 extra buses or encouraging 15% mode/time shift brings peak load into the Medium-High band.
      </div>

      <OperatorDashboard />

      <WhatIfSimulator />

      {/* Module G: Crowd Redistribution Simulator */}
      <div className="card" style={{ borderTop: '3px solid #B81104' }}>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div>
            <h3 className="font-bold text-sm" style={{ color: '#B81104' }}>🔄 Module G: Behavioral Crowd Redistribution Simulator</h3>
            <p className="text-xs text-gray-500">
              Explores sensitivity if commuters respond to crowd labels by shifting to less crowded departures or overlapping AC buses.
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FFFACD', color: '#854D0E' }}>
            Scenario Simulation (Not Observed Field Behaviour)
          </span>
        </div>

        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-600 block mb-1">
            Assumed Rider Shift to Less Crowded Option: <strong style={{ color: '#B81104' }}>{shiftPct}%</strong>
          </label>
          <input
            type="range" min={0} max={35} step={5} value={shiftPct}
            onChange={e => setShiftPct(parseInt(e.target.value))}
            className="w-full" style={{ accentColor: '#B81104' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-center text-xs">
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#FEF2F2' }}>
            <p className="text-gray-500 mb-1">Peak Hour (08:00) Load</p>
            <p className="text-xl font-bold" style={{ color: '#B81104' }}>{peakBefore}% → {peakAfter}%</p>
            <p className="text-green-700 mt-0.5">↓ {peakBefore - peakAfter} pts peak relief</p>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#FFFACD' }}>
            <p className="text-gray-500 mb-1">Adjacent Window (09:30–10:00)</p>
            <p className="text-xl font-bold text-gray-800">{offpeakBefore}% → {offpeakAfter}%</p>
            <p className="text-gray-600 mt-0.5">Absorbed within spare capacity</p>
          </div>
        </div>
      </div>

      {/* Data Quality Note */}
      <div className="card text-xs text-gray-500 space-y-2">
        <p className="font-semibold text-sm" style={{ color: '#B81104' }}>📋 Data Sources & Honest Methodology</p>
        <ul className="space-y-1 list-disc pl-4">
          <li><strong>Primary:</strong> October 2026 DTC e-ticketing data (~2.56M tickets) — <code>passenger_count</code>, <code>route</code>, <code>start_stop_name</code>, <code>end_stop_name</code>, <code>created_at</code>, <code>is_ac</code></li>
          <li><strong>Crowd Index:</strong> Relative occupancy percentile within each route-direction (not absolute headcount)</li>
          <li><strong>Vehicle Normalization:</strong> 12m vs 9m fleet capacity tiers and AC vs non-AC separated</li>
          <li><strong>Confidence Band:</strong> Routes with &lt;50 trips/hr flagged as LOW confidence and strengthened with corridor priors</li>
        </ul>
      </div>
    </div>
  )
}
