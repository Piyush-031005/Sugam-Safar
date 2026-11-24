import React from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="header-gradient py-4 px-6 shadow-xl" style={{ background: 'linear-gradient(135deg, #B81104 0%, #8B0000 100%)' }}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="text-4xl bus-pulse">🚌</div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#FFFACD' }}>Sugam Safar</h1>
            <p className="text-sm opacity-80 font-hindi" style={{ color: '#FFFACD' }}>सुगम सफर • Crowd-Aware Delhi Bus Planner</p>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs opacity-70" style={{ color: '#FFFACD' }}>Powered by</p>
            <p className="text-sm font-semibold" style={{ color: '#FFFACD' }}>CrowdTwin Intelligence</p>
          </div>
          <div
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xl"
            style={{ borderColor: '#FFFACD', backgroundColor: 'rgba(255,250,205,0.15)' }}
          >
            🏛️
          </div>
        </div>
      </div>
    </header>
  )
}
