import { CROWD_LEVELS } from './mockData.js'

export function getCrowdInfo(level) {
  return CROWD_LEVELS[level] || CROWD_LEVELS.MEDIUM
}

export function getEffectiveTravelTime(baseMins, crowdLevel) {
  const multiplier = CROWD_LEVELS[crowdLevel]?.multiplier || 1.0
  return Math.round(baseMins * multiplier)
}

export function getGeneralizedCost(option) {
  const { travelTime, walkToStop, walkFromStop, waitTime, crowdLevel } = option
  const W_WALK = 1.9
  const W_WAIT = 1.9
  const walkMins = (walkToStop + walkFromStop) / 1.3 / 60
  const waitMins = waitTime
  const ivtEffective = getEffectiveTravelTime(travelTime, crowdLevel)
  return (W_WALK * walkMins) + (W_WAIT * waitMins) + ivtEffective
}

export function getCorridorPoolWaitTime(frequencies) {
  const totalFreq = frequencies.reduce((a, b) => a + b, 0)
  const avgWait = 30 / totalFreq
  return Math.round(avgWait)
}

export function formatWalkTime(meters) {
  const minutes = Math.round(meters / 1.3 / 60)
  return `${minutes} min walk`
}

export function getConfidenceDescription(confidence, reason) {
  const descriptions = {
    HIGH: 'High confidence — based on 200+ historical trips this hour',
    MEDIUM: 'Medium confidence — based on 50-200 trips; some variability expected',
    LOW: 'Low confidence — sparse data for this route/hour combination',
  }
  return reason || descriptions[confidence] || descriptions.MEDIUM
}

export function getCrowdBarWidth(level) {
  const widths = { LOW: '25%', MEDIUM: '50%', HIGH: '75%', VERY_HIGH: '95%' }
  return widths[level] || '50%'
}

export function getOccupancyPercent(level) {
  const pcts = { LOW: 30, MEDIUM: 55, HIGH: 78, VERY_HIGH: 95 }
  return pcts[level] || 55
}
