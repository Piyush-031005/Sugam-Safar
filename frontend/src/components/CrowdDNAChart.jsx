import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CROWD_DNA_CLUSTERS } from '../utils/mockData.js'

export default function CrowdDNAChart() {
  const [selected, setSelected] = useState(['C1', 'C2'])

  const data = Array.from({ length: 24 }, (_, h) => {
    const point = { hour: `${String(h).padStart(2, '0')}:00` }
    CROWD_DNA_CLUSTERS.forEach(c => { point[c.id] = Math.round(c.hourlyProfile[h] * 100) })
    return point
  })

  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])

  return (
    <div className="card">
      <h3 className="font-bold mb-1" style={{ color: '#B81104' }}>🧬 Crowd DNA — Route Demand Signatures</h3>
      <p className="text-xs text-gray-500 mb-4">
        Normalized hourly demand by route cluster type. Reveals how different route categories behave through the day.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {CROWD_DNA_CLUSTERS.map(cluster => (
          <button
            key={cluster.id}
            onClick={() => toggle(cluster.id)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border-2 transition-all"
            style={{
              borderColor: cluster.color,
              color: cluster.color,
              backgroundColor: selected.includes(cluster.id) ? cluster.color + '15' : 'transparent',
              opacity: selected.includes(cluster.id) ? 1 : 0.4,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cluster.color }} />
            {cluster.name}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0e68c" />
          <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
          <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} domain={[0, 100]} />
          <Tooltip
            formatter={(val, name) => [`${val}%`, CROWD_DNA_CLUSTERS.find(c => c.id === name)?.name || name]}
            labelStyle={{ fontWeight: 'bold' }}
          />
          {CROWD_DNA_CLUSTERS.filter(c => selected.includes(c.id)).map(cluster => (
            <Line
              key={cluster.id}
              type="monotone"
              dataKey={cluster.id}
              stroke={cluster.color}
              strokeWidth={2.5}
              dot={false}
              name={cluster.id}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {CROWD_DNA_CLUSTERS.map(cluster => (
          <div key={cluster.id} className="p-2 rounded-lg" style={{ backgroundColor: '#FFFACD', borderLeft: `3px solid ${cluster.color}` }}>
            <p className="text-xs font-semibold" style={{ color: cluster.color }}>{cluster.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{cluster.description}</p>
            <p className="text-xs text-gray-400 mt-1">Routes: {cluster.routes.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
