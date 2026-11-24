import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import JourneyResult from './pages/JourneyResult.jsx'
import Insights from './pages/Insights.jsx'
import OperatorView from './pages/OperatorView.jsx'

function NavBar() {
  const location = useLocation()
  
  const links = [
    { path: '/', label: 'Plan Journey', emoji: '🗺️' },
    { path: '/insights', label: 'Crowd Insights', emoji: '📊' },
    { path: '/operator', label: 'Operator View', emoji: '🎛️' },
  ]
  
  return (
    <nav className="shadow-lg" style={{ backgroundColor: '#B81104' }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 py-1">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className="nav-link text-sm"
            style={
              location.pathname === link.path
                ? { backgroundColor: '#FFFACD', color: '#B81104', fontWeight: '700' }
                : { color: '#FFFACD', opacity: 0.85 }
            }
          >
            {link.emoji} {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen" style={{ backgroundColor: '#FFFACD' }}>
        <Header />
        <NavBar />
        <main className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/journey" element={<JourneyResult />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/operator" element={<OperatorView />} />
          </Routes>
        </main>
        <footer className="text-center py-6 mt-10 border-t border-yellow-200" style={{ color: '#B81104' }}>
          <p className="font-semibold">🚌 Sugam Safar — सुगम सफर</p>
          <p className="text-sm opacity-70 mt-1">Transport Stack Hackathon 2026 · Problem 2</p>
        </footer>
      </div>
    </Router>
  )
}
