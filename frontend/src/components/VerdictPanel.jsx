import React from 'react'
import './VerdictPanel.css'

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

  return [{ label: null, text: raw }]
}

const AgentCard = ({ verdict, isLeader }) => {
  const chunks = parseFinding(verdict.finding)
  const pct = Math.round(verdict.confidence * 100)

  return (
    <div className={`agent-card${isLeader ? ' agent-card--leader' : ''}`}>
      <div className="agent-card__header">
        <span className="agent-card__specialty">
          {verdict.specialty.replace('_', ' ').toUpperCase()}
          {isLeader && <span className="agent-card__leader-badge">LEADING</span>}
        </span>
        <span className="agent-card__confidence">
          {verdict.confidence > 0 ? `${pct}%` : 'PENDING'}
        </span>
      </div>

      {verdict.confidence > 0 && (
        <div className="agent-card__conf-bar">
          <div
            className="agent-card__conf-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

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

const VerdictPanel = ({ verdict, onReset }) => {
  const leaderId = verdict.agent_verdicts.reduce((maxIdx, v, i, arr) =>
    v.confidence > arr[maxIdx].confidence ? i : maxIdx, 0)

  return (
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
          {verdict.agent_verdicts.map((v, i) => (
            <AgentCard key={i} verdict={v} isLeader={i === leaderId && v.confidence > 0} />
          ))}
        </div>
      </div>

      <p className="verdict-panel__disclaimer">{verdict.disclaimer}</p>
    </div>
  )
}

export default VerdictPanel