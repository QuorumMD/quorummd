import React, { useState } from 'react'
import './AgentCard.css'

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

const AgentCard = ({ verdict, isLeader, index = 0 }) => {
  const [expanded, setExpanded] = useState(false)
  const chunks = parseFinding(verdict.finding)
  const pct = Math.round(verdict.confidence * 100)
  const selfPct = Math.round((verdict.self_reported_confidence ?? 0) * 100)
  const relPct = Math.round((verdict.relevance_score ?? 0) * 100)

  return (
    <div
      className={`agent-card${isLeader ? ' agent-card--leader' : ''}`}
      style={{ animationDelay: `${Math.min(index, 5) * 0.08}s` }}
    >
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

      {verdict.sources?.length > 0 && (
        <div className="agent-card__sources">
          {verdict.sources.map((s, i) => <span key={i} className="agent-card__source">{s}</span>)}
        </div>
      )}

      {verdict.confidence > 0 && (
        <button
          type="button"
          className="agent-card__breakdown-toggle"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? 'HIDE SCORE BREAKDOWN ▲' : 'WHY THIS SCORE? ▾'}
        </button>
      )}

      {expanded && (
        <div className="agent-card__breakdown">
          <div className="agent-card__breakdown-row">
            <span>Model self-report</span>
            <span>{selfPct}%</span>
          </div>
          <div className="agent-card__breakdown-row">
            <span>Specialty relevance to case</span>
            <span>{relPct}%</span>
          </div>
          <div className="agent-card__breakdown-row agent-card__breakdown-row--final">
            <span>Blended confidence</span>
            <span>{pct}%</span>
          </div>
        </div>
      )}

      <div className="agent-card__footer">
        {verdict.elapsed_ms > 0 && (
          <span className="agent-card__latency">responded in {(verdict.elapsed_ms / 1000).toFixed(1)}s</span>
        )}
      </div>
    </div>
  )
}

export default AgentCard
