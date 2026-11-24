export const DELHI_STOPS = [
  { id: 'S001', name: 'Kashmere Gate ISBT', lat: 28.6671, lon: 77.2286 },
  { id: 'S002', name: 'Laxmi Nagar', lat: 28.6318, lon: 77.2766 },
  { id: 'S003', name: 'Shahdara Bus Terminal', lat: 28.6714, lon: 77.2893 },
  { id: 'S004', name: 'Connaught Place', lat: 28.6304, lon: 77.2177 },
  { id: 'S005', name: 'Nehru Place', lat: 28.5491, lon: 77.2537 },
  { id: 'S006', name: 'Dwarka Sector 21', lat: 28.5523, lon: 77.0588 },
  { id: 'S007', name: 'Rohini East', lat: 28.7179, lon: 77.1282 },
  { id: 'S008', name: 'Saket', lat: 28.5244, lon: 77.2066 },
  { id: 'S009', name: 'Lajpat Nagar', lat: 28.5676, lon: 77.2434 },
  { id: 'S010', name: 'Vikas Marg', lat: 28.6235, lon: 77.2834 },
  { id: 'S011', name: 'Anand Vihar ISBT', lat: 28.6467, lon: 77.3157 },
  { id: 'S012', name: 'Mandi House', lat: 28.6260, lon: 77.2317 },
  { id: 'S013', name: 'India Gate', lat: 28.6129, lon: 77.2295 },
  { id: 'S014', name: 'Dhaula Kuan', lat: 28.5921, lon: 77.1569 },
  { id: 'S015', name: 'Mayur Vihar Phase 1', lat: 28.6072, lon: 77.2946 },
]

export const CROWD_LEVELS = {
  LOW:       { label: 'Low',       color: '#22C55E', bgColor: '#F0FDF4', textColor: '#166534', emoji: '🟢', multiplier: 1.00 },
  MEDIUM:    { label: 'Medium',    color: '#EAB308', bgColor: '#FEFCE8', textColor: '#854D0E', emoji: '🟡', multiplier: 1.16 },
  HIGH:      { label: 'High',      color: '#F97316', bgColor: '#FFF7ED', textColor: '#9A3412', emoji: '🟠', multiplier: 1.40 },
  VERY_HIGH: { label: 'Very High', color: '#EF4444', bgColor: '#FEF2F2', textColor: '#991B1B', emoji: '🔴', multiplier: 1.60 },
}

export const MOCK_ROUTES = [
  {
    id: 'R405', name: 'Route 405',
    stops: ['S001', 'S010', 'S002', 'S015'],
    description: 'Kashmere Gate → Laxmi Nagar via Vikas Marg',
    isAC: false, busSize: '12m',
    crowdByHour: {
      7: 'VERY_HIGH', 8: 'VERY_HIGH', 9: 'HIGH', 10: 'MEDIUM',
      11: 'LOW', 12: 'LOW', 13: 'MEDIUM', 14: 'MEDIUM',
      15: 'MEDIUM', 16: 'HIGH', 17: 'VERY_HIGH', 18: 'VERY_HIGH',
      19: 'HIGH', 20: 'MEDIUM', 21: 'LOW', 22: 'LOW'
    },
    frequency: 8,
  },
  {
    id: 'R419', name: 'Route 419',
    stops: ['S001', 'S012', 'S010', 'S002'],
    description: 'Kashmere Gate → Shahdara via Mandi House',
    isAC: false, busSize: '9m',
    crowdByHour: {
      7: 'HIGH', 8: 'VERY_HIGH', 9: 'HIGH', 10: 'MEDIUM',
      11: 'LOW', 12: 'LOW', 13: 'LOW', 14: 'MEDIUM',
      15: 'MEDIUM', 16: 'HIGH', 17: 'HIGH', 18: 'VERY_HIGH',
      19: 'HIGH', 20: 'MEDIUM', 21: 'LOW', 22: 'LOW'
    },
    frequency: 12,
  },
  {
    id: 'R534', name: 'Route 534',
    stops: ['S001', 'S010', 'S015', 'S002'],
    description: 'Kashmere Gate → Laxmi Nagar via Mayur Vihar',
    isAC: true, busSize: '12m',
    crowdByHour: {
      7: 'MEDIUM', 8: 'HIGH', 9: 'MEDIUM', 10: 'LOW',
      11: 'LOW', 12: 'LOW', 13: 'LOW', 14: 'LOW',
      15: 'LOW', 16: 'MEDIUM', 17: 'HIGH', 18: 'HIGH',
      19: 'MEDIUM', 20: 'LOW', 21: 'LOW', 22: 'LOW'
    },
    frequency: 15,
  },
  {
    id: 'R729', name: 'Route 729',
    stops: ['S011', 'S010', 'S002', 'S001'],
    description: 'Anand Vihar → Kashmere Gate',
    isAC: false, busSize: '9m',
    crowdByHour: {
      7: 'HIGH', 8: 'VERY_HIGH', 9: 'HIGH', 10: 'MEDIUM',
      11: 'LOW', 12: 'MEDIUM', 13: 'MEDIUM', 14: 'MEDIUM',
      15: 'HIGH', 16: 'VERY_HIGH', 17: 'VERY_HIGH', 18: 'HIGH',
      19: 'MEDIUM', 20: 'LOW', 21: 'LOW', 22: 'LOW'
    },
    frequency: 10,
  },
  {
    id: 'R501', name: 'Route 501',
    stops: ['S004', 'S013', 'S009', 'S008'],
    description: 'Connaught Place → Saket via Lajpat Nagar',
    isAC: true, busSize: '12m',
    crowdByHour: {
      7: 'MEDIUM', 8: 'HIGH', 9: 'VERY_HIGH', 10: 'HIGH',
      11: 'MEDIUM', 12: 'MEDIUM', 13: 'LOW', 14: 'LOW',
      15: 'MEDIUM', 16: 'HIGH', 17: 'VERY_HIGH', 18: 'HIGH',
      19: 'MEDIUM', 20: 'LOW', 21: 'LOW', 22: 'LOW'
    },
    frequency: 20,
  },
]

export const CROWD_DNA_CLUSTERS = [
  {
    id: 'C1', name: 'Office Commuter (Twin-Peak)',
    color: '#B81104',
    routes: ['R405', 'R729'],
    description: 'Peak demand 7-9 AM and 5-8 PM. Typical for routes serving business districts.',
    hourlyProfile: [0.1, 0.05, 0.05, 0.05, 0.1, 0.3, 0.9, 1.0, 0.75, 0.4, 0.3, 0.3, 0.35, 0.3, 0.3, 0.4, 0.75, 1.0, 0.9, 0.6, 0.35, 0.2, 0.15, 0.1],
  },
  {
    id: 'C2', name: 'Market / Shopping (Midday)',
    color: '#F97316',
    routes: ['R501'],
    description: 'Peak demand 10 AM - 3 PM. Serves markets, shopping areas.',
    hourlyProfile: [0.05, 0.05, 0.05, 0.05, 0.1, 0.2, 0.4, 0.5, 0.65, 0.8, 0.9, 1.0, 0.95, 0.9, 0.7, 0.5, 0.4, 0.5, 0.45, 0.3, 0.2, 0.15, 0.1, 0.05],
  },
  {
    id: 'C3', name: 'AC Comfortable Route',
    color: '#22C55E',
    routes: ['R534'],
    description: 'Consistently lower crowd due to AC premium and higher frequency.',
    hourlyProfile: [0.05, 0.05, 0.05, 0.05, 0.1, 0.2, 0.5, 0.65, 0.5, 0.3, 0.25, 0.2, 0.25, 0.2, 0.25, 0.3, 0.5, 0.65, 0.6, 0.4, 0.25, 0.15, 0.1, 0.05],
  },
  {
    id: 'C4', name: 'Inter-district Feeder',
    color: '#3B82F6',
    routes: ['R419'],
    description: 'Variable demand throughout day. Serves multiple residential zones.',
    hourlyProfile: [0.1, 0.05, 0.05, 0.05, 0.15, 0.35, 0.7, 0.9, 0.7, 0.4, 0.35, 0.3, 0.3, 0.3, 0.4, 0.5, 0.65, 0.85, 0.75, 0.5, 0.35, 0.2, 0.15, 0.1],
  },
]

export function getMockJourneyOptions(origin, destination, hour) {
  const h = parseInt(hour) || 8
  const mins = ['05','12','20','25','30','35','40','45']
  const rnd = () => mins[Math.floor(Math.random() * mins.length)]

  return [
    {
      id: 'J1',
      type: 'fastest',
      label: 'Fastest',
      emoji: '⚡',
      routeId: 'R405',
      routeName: 'Bus 405',
      from: origin || 'Kashmere Gate ISBT',
      to: destination || 'Laxmi Nagar',
      departureTime: `${String(h).padStart(2,'0')}:${rnd()}`,
      travelTime: 28,
      walkToStop: 180,
      walkFromStop: 120,
      waitTime: 6,
      crowdLevel: (h >= 7 && h <= 9) ? 'VERY_HIGH' : (h >= 17 && h <= 19) ? 'HIGH' : 'MEDIUM',
      confidence: (h >= 7 && h <= 9) ? 'HIGH' : 'MEDIUM',
      effectiveCost: 42,
      isAC: false,
      busSize: '12m',
      stops: ['Kashmere Gate ISBT', 'Vikas Marg Chowk', 'Laxmi Nagar Gate 2'],
      fare: 15,
    },
    {
      id: 'J2',
      type: 'comfortable',
      label: 'Comfortable',
      emoji: '😌',
      routeId: 'R534',
      routeName: 'Bus 534 (AC)',
      from: origin || 'Kashmere Gate ISBT',
      to: destination || 'Laxmi Nagar',
      departureTime: `${String(h).padStart(2,'0')}:${rnd()}`,
      travelTime: 34,
      walkToStop: 240,
      walkFromStop: 180,
      waitTime: 12,
      crowdLevel: (h >= 8 && h <= 9) ? 'HIGH' : 'LOW',
      confidence: 'HIGH',
      effectiveCost: 38,
      isAC: true,
      busSize: '12m',
      stops: ['Kashmere Gate ISBT', 'Vikas Marg', 'Mayur Vihar Ph-1', 'Laxmi Nagar'],
      fare: 25,
    },
    {
      id: 'J3',
      type: 'balanced',
      label: 'Balanced',
      emoji: '⚖️',
      routeId: 'R419',
      routeName: 'Bus 419',
      from: origin || 'Kashmere Gate ISBT',
      to: destination || 'Laxmi Nagar',
      departureTime: `${String(h).padStart(2,'0')}:${rnd()}`,
      travelTime: 31,
      walkToStop: 150,
      walkFromStop: 200,
      waitTime: 9,
      crowdLevel: (h >= 8 && h <= 9) ? 'HIGH' : (h >= 17 && h <= 18) ? 'HIGH' : 'MEDIUM',
      confidence: 'MEDIUM',
      effectiveCost: 39,
      isAC: false,
      busSize: '9m',
      stops: ['Kashmere Gate ISBT', 'Mandi House', 'Vikas Marg', 'Laxmi Nagar'],
      fare: 10,
    },
  ]
}

export function getOverlappingBuses(hour) {
  const h = parseInt(hour) || 8
  return [
    {
      routeId: 'R534',
      routeName: '534',
      boardingStop: 'Vikas Marg Gate 2',
      walkDistance: 240,
      walkMinutes: 3,
      overlapStops: 11,
      overlapDescription: 'Shares 11 stops along Vikas Marg; drops you 180m from destination',
      crowdLevel: (h >= 8 && h <= 9) ? 'HIGH' : 'LOW',
      confidence: 'HIGH',
      isAC: true,
      corridorBadge: 'Vikas Marg Corridor',
    },
    {
      routeId: 'R729',
      routeName: '729',
      boardingStop: 'Laxmi Nagar Metro Gate 2',
      walkDistance: 320,
      walkMinutes: 4,
      overlapStops: 9,
      overlapDescription: 'Shares 9 stops; different terminus but same corridor until Laxmi Nagar',
      crowdLevel: (h >= 7 && h <= 9) ? 'HIGH' : 'MEDIUM',
      confidence: 'MEDIUM',
      isAC: false,
      corridorBadge: 'Vikas Marg Corridor',
    },
  ]
}

export function getHourlyOperatorData() {
  return Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2,'0')}:00`,
    R405: (h >= 7 && h <= 9) ? 95 : (h >= 17 && h <= 19) ? 90 : (h >= 10 && h <= 16) ? 45 : 20,
    R419: (h >= 7 && h <= 9) ? 80 : (h >= 17 && h <= 18) ? 85 : (h >= 10 && h <= 16) ? 40 : 15,
    R534: (h >= 7 && h <= 9) ? 60 : (h >= 17 && h <= 18) ? 65 : (h >= 10 && h <= 16) ? 30 : 10,
    R729: (h >= 7 && h <= 9) ? 85 : (h >= 15 && h <= 18) ? 95 : (h >= 10 && h <= 14) ? 50 : 15,
  }))
}
