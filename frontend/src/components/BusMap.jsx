import React, { useEffect, useRef } from 'react'
import L from 'leaflet'

const STOP_COLORS = { origin: '#22C55E', destination: '#B81104', stop: '#3B82F6', boarding: '#F59E0B' }

function makeIcon(type) {
  return L.divIcon({
    html: `<div style="width:14px;height:14px;background:${STOP_COLORS[type] || '#3B82F6'};border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

const DEFAULT_GEOMETRY = {
  origin: [28.6671, 77.2286],
  destination: [28.6318, 77.2766],
  bus_coords: [
    [28.6671, 77.2286],
    [28.6289, 77.2414],
    [28.6235, 77.2834],
    [28.6318, 77.2766],
  ],
  stop_markers: [
    { lat: 28.6671, lon: 77.2286, name: 'Kashmere Gate ISBT', type: 'origin' },
    { lat: 28.6289, lon: 77.2414, name: 'ITO Crossing', type: 'stop' },
    { lat: 28.6235, lon: 77.2834, name: 'Vikas Marg', type: 'stop' },
    { lat: 28.6318, lon: 77.2766, name: 'Laxmi Nagar', type: 'destination' },
  ],
}

export default function BusMap({ geometry, focusedLabel, overlapFocus }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const layerGroupRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, { center: [28.6300, 77.2500], zoom: 12, zoomControl: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    layerGroupRef.current = L.layerGroup().addTo(map)
    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
      layerGroupRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    const layerGroup = layerGroupRef.current
    if (!map || !layerGroup) return

    layerGroup.clearLayers()

    if (overlapFocus && overlapFocus.geometry) {
      const { origin, boarding, destination } = overlapFocus.geometry
      L.polyline([origin, boarding], { color: '#16A34A', weight: 3, dashArray: '4,6' }).addTo(layerGroup)
      L.polyline([boarding, destination], { color: '#B81104', weight: 4, opacity: 0.9 }).addTo(layerGroup)
      L.marker(origin, { icon: makeIcon('origin') }).bindPopup('<b>Your Origin</b>').addTo(layerGroup)
      L.marker(boarding, { icon: makeIcon('boarding') })
        .bindPopup(`<b>Board Bus ${overlapFocus.routeName}</b><br/>${overlapFocus.boardingStop} (${overlapFocus.walkDistance}m walk)`)
        .addTo(layerGroup)
        .openPopup()
      L.marker(destination, { icon: makeIcon('destination') }).bindPopup('<b>Destination</b>').addTo(layerGroup)
      map.fitBounds(L.latLngBounds([origin, boarding, destination]), { padding: [35, 35] })
      return
    }

    const active = geometry || DEFAULT_GEOMETRY
    const markers = active.stop_markers || DEFAULT_GEOMETRY.stop_markers
    const busCoords = active.bus_coords || markers.map(m => [m.lat, m.lon])

    if (active.origin && busCoords.length > 0) {
      L.polyline([active.origin, busCoords[0]], { color: '#16A34A', weight: 3, dashArray: '4,6' }).addTo(layerGroup)
    }
    if (busCoords.length > 1) {
      L.polyline(busCoords, { color: '#B81104', weight: 4, opacity: 0.85 }).addTo(layerGroup)
    }
    if (active.destination && busCoords.length > 0) {
      L.polyline([busCoords[busCoords.length - 1], active.destination], { color: '#D97706', weight: 3, dashArray: '4,6' }).addTo(layerGroup)
    }

    markers.forEach(stop => {
      L.marker([stop.lat, stop.lon], { icon: makeIcon(stop.type) })
        .bindPopup(`<b>${stop.name}</b><br/><small>${stop.type}</small>`)
        .addTo(layerGroup)
    })

    if (busCoords.length > 0) {
      map.fitBounds(L.latLngBounds(busCoords), { padding: [30, 30] })
    }
  }, [geometry, overlapFocus])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: '#B81104' }}>🗺️ Corridor & Walk Map</h3>
        {(overlapFocus || focusedLabel) && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FFFACD', color: '#B81104' }}>
            {overlapFocus ? `Bus ${overlapFocus.routeName}` : focusedLabel}
          </span>
        )}
      </div>
      <div ref={mapRef} style={{ height: '290px', width: '100%', borderRadius: '0.75rem' }} />
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
        <span>🟢 Origin / Walk</span>
        <span>🟡 Alternate Boarding</span>
        <span>🔴 Bus Corridor / Dest</span>
      </div>
    </div>
  )
}
