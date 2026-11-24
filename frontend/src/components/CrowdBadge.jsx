import React from 'react'
import { getCrowdInfo } from '../utils/crowdUtils.js'

export default function CrowdBadge({ level, size = 'md', showLabel = true }) {
  const info = getCrowdInfo(level)

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizes[size]}`}
      style={{
        backgroundColor: info.bgColor,
        color: info.textColor,
        border: `1px solid ${info.color}40`,
      }}
    >
      <span>{info.emoji}</span>
      {showLabel && <span>{info.label}</span>}
    </span>
  )
}
