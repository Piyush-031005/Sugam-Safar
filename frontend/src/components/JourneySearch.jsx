import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const POPULAR_STOPS = [
  'Kashmere Gate ISBT', 'Laxmi Nagar', 'Connaught Place', 'Nehru Place',
  'Dwarka Sector 21', 'Rohini East', 'Saket', 'Lajpat Nagar',
  'Anand Vihar ISBT', 'Mandi House', 'India Gate', 'Dhaula Kuan',
  'Mayur Vihar Phase 1', 'Shahdara Bus Terminal', 'Vikas Marg',
]

function StopInput({ label, value, onChange, placeholder }) {
  const [suggestions, setSuggestions] = useState([])

  const handleChange = (e) => {
    const val = e.target.value
    onChange(val)
    setSuggestions(val.length > 1 ? POPULAR_STOPS.filter(s => s.toLowerCase().includes(val.toLowerCase())) : [])
  }

  const selectStop = (stop) => {
    onChange(stop)
    setSuggestions([])
  }

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <input
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setSuggestions([]), 200)}
        required
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-auto">
          {suggestions.map(s => (
            <li
              key={s}
              className="px-4 py-2 cursor-pointer text-sm hover:bg-yellow-50"
              onClick={() => selectStop(s)}
            >
              📍 {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function JourneySearch({ onSearch }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    time: '08:00',
    dayType: 'weekday',
    mode: 'balanced',
  })

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const swapStops = () => setForm(f => ({ ...f, origin: f.destination, destination: f.origin }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.origin || !form.destination) return
    if (onSearch) onSearch(form)
    navigate(`/journey?origin=${encodeURIComponent(form.origin)}&dest=${encodeURIComponent(form.destination)}&time=${form.time}&dayType=${form.dayType}&mode=${form.mode}`)
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ backgroundColor: 'white' }}>
      <h2 className="text-lg font-bold mb-4" style={{ color: '#B81104' }}>🗺️ Plan Your Journey</h2>

      <StopInput
        label="FROM"
        value={form.origin}
        onChange={v => setField('origin', v)}
        placeholder="Enter origin stop (e.g. Kashmere Gate ISBT)"
      />

      <div className="flex justify-center my-2">
        <button
          type="button"
          onClick={swapStops}
          className="p-2 rounded-full border hover:bg-yellow-50 transition-colors"
          style={{ borderColor: '#B81104', color: '#B81104' }}
          title="Swap stops"
        >
          ⇅
        </button>
      </div>

      <div className="mb-4">
        <StopInput
          label="TO"
          value={form.destination}
          onChange={v => setField('destination', v)}
          placeholder="Enter destination stop (e.g. Laxmi Nagar)"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">DEPARTURE TIME</label>
          <input
            type="time"
            className="input-field"
            value={form.time}
            onChange={e => setField('time', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">DAY TYPE</label>
          <select className="input-field" value={form.dayType} onChange={e => setField('dayType', e.target.value)}>
            <option value="weekday">Weekday</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
            <option value="holiday">Holiday</option>
          </select>
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 mb-2">PREFERENCE MODE</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: 'fastest',    label: '⚡ Fastest', desc: 'Min time' },
            { val: 'comfortable', label: '😌 Comfort', desc: 'Less crowd' },
            { val: 'balanced',   label: '⚖️ Balanced', desc: 'Best of both' },
          ].map(m => (
            <button
              key={m.val}
              type="button"
              onClick={() => setField('mode', m.val)}
              className="p-2 rounded-xl border-2 text-center transition-all"
              style={
                form.mode === m.val
                  ? { borderColor: '#B81104', backgroundColor: '#FFF5F5' }
                  : { borderColor: '#E5E7EB', backgroundColor: 'white' }
              }
            >
              <div className="text-sm font-semibold" style={{ color: form.mode === m.val ? '#B81104' : '#374151' }}>
                {m.label}
              </div>
              <div className="text-xs text-gray-400">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="btn-primary w-full text-base">
        🔍 Find Best Bus Options
      </button>
    </form>
  )
}
