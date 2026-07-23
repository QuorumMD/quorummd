import React from 'react'
import './OverviewTab.css'

const computeSpread = (agentVerdicts) => {
  if (!agentVerdicts.length) return 0
  const pcts = agentVerdicts.map(v => v.confidence * 100)
  return Math.max(...pcts) - Math.min(...pcts)
}

const OverviewTab = ({ verdict }) => {
  const { synthesis, agentVerdicts, confidenceScore, totalElapsedMs } = verdict
  const spread = computeSpread(agentVerdicts)

  return (
    <div className="overview-tab">
      <div className="overview-tab__synthesized">
        <span className="overview-tab__syn-label">SYNTHESIZED SECOND OPINION</span>
        <p className="overview-tab__syn-text">{synthesis?.synthesized_verdict}</p>
      </div>

      <div className="overview-tab__stats">
        <div className="overview-tab__stat">
          <span className="overview-tab__stat-value">{Math.round(confidenceScore * 100)}%</span>
          <span className="overview-tab__stat-label">Avg confidence</span>
        </div>
        <div className="overview-tab__stat">
          <span className="overview-tab__stat-value">{Math.round(spread)}pt</span>
          <span className="overview-tab__stat-label">Confidence spread</span>
        </div>
        <div className="overview-tab__stat">
          <span className="overview-tab__stat-value">{(totalElapsedMs / 1000).toFixed(1)}s</span>
          <span className="overview-tab__stat-label">Time to convene</span>
        </div>
        <div className="overview-tab__stat">
          <span className="overview-tab__stat-value">{agentVerdicts.length}</span>
          <span className="overview-tab__stat-label">Specialists consulted</span>
        </div>
      </div>

      {synthesis?.recommended_actions?.length > 0 && (
        <div className="overview-tab__actions">
          <span className="overview-tab__actions-label">RECOMMENDED ACTIONS</span>
          <ul>
            {synthesis.recommended_actions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

export default OverviewTab
