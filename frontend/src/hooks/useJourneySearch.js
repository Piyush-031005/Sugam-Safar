import { useState, useCallback } from 'react'
import { getMockJourneyOptions, getOverlappingBuses } from '../utils/mockData.js'
import { getGeneralizedCost } from '../utils/crowdUtils.js'

export function useJourneySearch() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchParams, setSearchParams] = useState(null)

  const search = useCallback(async ({ origin, destination, time, dayType, mode }) => {
    setLoading(true)
    setError(null)

    try {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 600))

      const hour = parseInt(time?.split(':')[0] || '8')
      const options = getMockJourneyOptions(origin, destination, hour)
      const overlapBuses = getOverlappingBuses(hour)

      // Sort by generalized cost
      const sorted = [...options].sort((a, b) => getGeneralizedCost(a) - getGeneralizedCost(b))

      setResults({ options: sorted, overlapBuses, hour, dayType, mode })
      setSearchParams({ origin, destination, time, dayType, mode })
    } catch (err) {
      setError('Failed to fetch journey options. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResults(null)
    setError(null)
    setSearchParams(null)
  }, [])

  return { results, loading, error, search, reset, searchParams }
}
