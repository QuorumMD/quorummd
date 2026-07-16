import React from 'react'
import './VerdictPanel.css'

// Parses "**Label:** sentence" bullets (or numbered/line-based fallback)
// into { label, text } chunks instead of one long paragraph.
const parseFinding = (raw) => {
  if (!raw) return []

  const boldPattern = /\*\*(.+?):?\*\*\s*:?\s*/g
  const matches = [...raw.matchAll(boldPattern)]

  if (matches.length > 0) {
    return matches.map((m, i) => {
      const start = m.index + m[0].length
      const end = i + 1 < matches.length ? matches[i + 1].index : raw.length
      return {
        label: m[1].trim(),
        text: raw.slice(start, end).trim().replace(/^\d+\.\s*/, '')
      }
    })
  }

  // Fallback: split on numbered list items (e.g. "1. ", "2. ")
  const numbered = raw.split(/\d+\.\s+/).filter(s => s.trim())
  if (numbered.length > 1) {
    return numbered.map(chunk => {
      const boldMatch = chunk.match(/^\*\*(.+?)\*\*:?\s*/)
      if (boldMatch) {
        return { label: boldMatch[1].trim(), text: chunk.slice(boldMatch[0].length).trim() }
      }
      return { label: null, text: chunk.trim() }
    })
  }

  // Last resort: no structure detected, show as-is
  return [{ label: null, text: raw }]
}

const AgentCard = ({ verdict }) => {
  const chunks = parseFinding(verdict.finding)

  return (
    <div className="agent-card">
      <div className="agent-card__header">
        <span className="agent-card__specialty">{verdict.specialty.replace('_', ' ').toUpperCase()}</span>
        <span className="agent-card__confidence">
          {verdict.confidence > 0 ? `${(verdict.confidence * 100).toFixed(0)}% confidence` : 'PENDING'}
        </span>
      </div>

      <ul className="agent-card__points">
        {chunks.map((c, i) => (
          <li key={i} className="agent-card__point">
            {c.label && <span className="agent-card__point-label">{c.label}</span>}
            <span className="agent-card__point-text">{c.text}</span>
          </li>
        ))}
      </ul>

      {verdict.sources.length > 0 && (
        <div className="agent-card__sources">
          {verdict.sources.map((s, i) => <span key={i} className="agent-card__source">{s}</span>)}
        </div>
      )}
    </div>
  )
}

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