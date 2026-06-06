import React from 'react'
import './VerdictPanel.css'

const AgentCard = ({ verdict }) => (
  <div className="agent-card">
    <div className="agent-card__header">
      <span className="agent-card__specialty">{verdict.specialty.replace('_', ' ').toUpperCase()}</span>
      <span className="agent-card__confidence">
        {verdict.confidence > 0 ? `${(verdict.confidence * 100).toFixed(0)}% confidence` : 'PENDING'}
      </span>
    </div>
    <p className="agent-card__finding">{verdict.finding}</p>
    {verdict.sources.length > 0 && (
      <div className="agent-card__sources">
        {verdict.sources.map((s, i) => <span key={i} className="agent-card__source">{s}</span>)}
      </div>
    )}
  </div>
)

const VerdictPanel = ({ verdict, onReset }) => (
  <div className="verdict-panel">
    <div className="verdict-panel__header">
      <div>
        <span className="verdict-panel__label">QUORUM VERDICT</span>
        <p className="verdict-panel__id">Case {verdict.case_id.slice(0, 8).toUpperCase()}</p>
      </div>
      <button className="verdict-panel__reset" onClick={onReset}>NEW CASE</button>
    </div>

    <div className="verdict-panel__synthesized">
      <span className="verdict-panel__syn-label">SYNTHESIZED SECOND OPINION</span>
      <p className="verdict-panel__syn-text">{verdict.synthesized_verdict}</p>
    </div>

    {verdict.recommended_actions?.length > 0 && (
      <div className="verdict-panel__actions">
        <span className="verdict-panel__actions-label">RECOMMENDED ACTIONS</span>
        <ul>
          {verdict.recommended_actions.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </div>
    )}

    <div className="verdict-panel__agents">
      <span className="verdict-panel__agents-label">AGENT DELIBERATIONS</span>
      <div className="verdict-panel__agent-grid">
        {verdict.agent_verdicts.map((v, i) => <AgentCard key={i} verdict={v} />)}
      </div>
    </div>

    <p className="verdict-panel__disclaimer">{verdict.disclaimer}</p>
  </div>
)

export default VerdictPanel
