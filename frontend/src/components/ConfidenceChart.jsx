import React from 'react'
import './ConfidenceChart.css'

const ConfidenceChart = ({ agentVerdicts }) => {
  const sorted = [...agentVerdicts].sort((a, b) => b.confidence - a.confidence)
  const max = Math.max(...sorted.map(v => v.confidence), 0.01)

  return (
    <div className="confidence-chart">
      {sorted.map((v, i) => {
        const pct = Math.round(v.confidence * 100)
        const widthPct = (v.confidence / max) * 100
        return (
          <div key={i} className="confidence-chart__row">
            <span className="confidence-chart__label">
              {v.specialty.replace('_', ' ').toUpperCase()}
            </span>
            <div className="confidence-chart__track">
              <div
                className={`confidence-chart__fill${i === 0 ? ' confidence-chart__fill--leader' : ''}`}
                style={{ width: `${widthPct}%`, animationDelay: `${i * 0.08}s` }}
              />
            </div>
            <span className="confidence-chart__value">{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}

export default ConfidenceChart