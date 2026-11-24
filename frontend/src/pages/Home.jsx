import React from 'react'
import { Link } from 'react-router-dom'
import JourneySearch from '../components/JourneySearch.jsx'

const QUICK_ROUTES = [
  { from: 'Kashmere Gate ISBT', to: 'Laxmi Nagar', emoji: '🏙️', tag: 'Vikas Marg Corridor' },
  { from: 'Connaught Place', to: 'Saket', emoji: '🛍️', tag: 'Ring Road South' },
  { from: 'Anand Vihar ISBT', to: 'Kashmere Gate ISBT', emoji: '🚉', tag: 'Corridor Pool' },
  { from: 'Rohini East', to: 'Saket', emoji: '🏛️', tag: '1-Transfer RAPTOR' },
]

const FEATURES = [
  { icon: '🧠', title: 'LightGBM + Quantiles', desc: 'Predicts relative within-route crowd index with p10–p90 confidence bands on 2.56M tickets.' },
  { icon: '🛣️', title: 'Corridor Discovery', desc: 'Finds overlapping bus numbers sharing your stretch and pools headways to cut wait times.' },
  { icon: '📊', title: 'Stop-Flow Propagation', desc: 'Module C tracks boarding/alighting sweep across each stop segment, normalized by 12m/9m & AC.' },
  { icon: '⚖️', title: 'Generalized Cost', desc: 'Ranks Fastest, Comfortable & Balanced options using configurable multipliers (w=1.9, m=1.0–1.6).' },
]

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Hero Banner — Milano Red & Lemon Chiffon, clean flat contrast (no neon glow) */}
      <div className="rounded-2xl p-6 text-center shadow-md" style={{ background: 'linear-gradient(135deg, #B81104 0%, #8B0000 100%)' }}>
        <h2 className="text-3xl font-bold mb-2" style={{ color: '#FFFACD' }}>Know the crowd before you board.</h2>
        <p className="text-sm opacity-90 mb-1" style={{ color: '#FFFACD' }}>
          Sugam Safar — Delhi's crowd-aware bus journey planner powered by CrowdTwin Intelligence.
        </p>
        <div className="flex justify-center flex-wrap gap-3 mt-3 text-xs" style={{ color: '#FFFACD', opacity: 0.85 }}>
          <span>2.56M October e-tickets</span>
          <span>•</span>
          <span>10,500+ GTFS stops modelled</span>
          <span>•</span>
          <span>Hybrid Tier Prototype</span>
        </div>
      </div>

      {/* Main Layout: Search + Sidebar */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <JourneySearch />
        </div>

        <div className="space-y-4">
          {/* Quick Routes */}
          <div className="card">
            <h3 className="font-bold mb-3 text-sm" style={{ color: '#B81104' }}>⚡ Popular Delhi Test Routes</h3>
            <div className="space-y-2">
              {QUICK_ROUTES.map((r, i) => (
                <Link
                  key={i}
                  to={`/journey?origin=${encodeURIComponent(r.from)}&dest=${encodeURIComponent(r.to)}&time=08:00&dayType=weekday&mode=balanced`}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-yellow-50 transition-colors text-sm border border-transparent hover:border-yellow-200"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span>{r.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 truncate">{r.from}</p>
                      <p className="text-xs font-semibold text-gray-700 truncate">→ {r.to}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: '#FFFACD', color: '#B81104' }}>
                    {r.tag}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Live Clock / Time Context */}
          <div className="card-cream text-center">
            <p className="text-xs text-gray-600 mb-1">Current Time (IST)</p>
            <p className="text-2xl font-bold" style={{ color: '#B81104' }}>
              {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div>
        <h3 className="font-bold mb-3" style={{ color: '#B81104' }}>🎯 How CrowdTwin Powers Sugam Safar</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FEATURES.map((f, i) => (
            <div key={i} className="card p-4 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h4 className="text-sm font-bold mb-1" style={{ color: '#B81104' }}>{f.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Transparency Notice */}
      <div className="text-center p-3 rounded-xl text-xs text-gray-600" style={{ backgroundColor: '#FFFACD', border: '1px solid #e5d87d' }}>
        <strong style={{ color: '#B81104' }}>📋 Honest Uncertainty:</strong> E-ticketing covers ~3–4% of total bus riders, so Sugam Safar outputs a
        <strong> relative crowd index + confidence band</strong> rather than uncalibrated headcounts.
      </div>
    </div>
  )
}
