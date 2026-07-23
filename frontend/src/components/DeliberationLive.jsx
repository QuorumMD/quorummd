import React, { useEffect, useRef, useState } from 'react'
import AgentCard from './AgentCard'
import './DeliberationLive.css'

const STAGE_LABELS = {
  starting: 'Convening quorum...',
  inProgress: 'Agents reviewing case...',
  awaitingSynthesis: 'Cross-examining findings...',
  synthesizing: 'Synthesizing opinion...'
}

const DeliberationLive = ({ roster, agentVerdicts, synthesis, phase }) => {
  const [elapsedMs, setElapsedMs] = useState(0)
  const startRef = useRef(null)

  useEffect(() => {
    if (phase !== 'streaming') return
    startRef.current = performance.now()
    setElapsedMs(0)
    const id = setInterval(() => setElapsedMs(performance.now() - startRef.current), 100)
    return () => clearInterval(id)
  }, [phase])

  const total = roster.length
  const respondedCount = agentVerdicts.length

  let stageLabel = STAGE_LABELS.starting
  if (respondedCount > 0 && respondedCount < total) stageLabel = STAGE_LABELS.inProgress
  if (total > 0 && respondedCount === total && !synthesis) stageLabel = STAGE_LABELS.awaitingSynthesis
  if (synthesis) stageLabel = STAGE_LABELS.synthesizing

  const placeholders = total > 0 ? roster : Array.from({ length: 4 }, (_, i) => ({ name: `pending-${i}`, specialty: 'general medicine' }))

  return (
    <div className="deliberation-live">
      <div className="deliberation-live__status">
        <span className="deliberation-live__stage">
          <span className="deliberation-live__spinner" />
          {stageLabel}
        </span>
        <span className="deliberation-live__meta">
          {total > 0 ? `${respondedCount}/${total} agents responded` : 'connecting...'} · {(elapsedMs / 1000).toFixed(1)}s elapsed
        </span>
      </div>

      <div className="deliberation-live__progress-track">
        <div
          className="deliberation-live__progress-fill"
          style={{ width: `${Math.min(100, (elapsedMs / 10000) * 100)}%` }}
        />
      </div>

      <div className="deliberation-live__grid">
        {placeholders.map((agent, i) => {
          const verdict = agentVerdicts.find(v => v.agent_name === agent.name)
          if (verdict) {
            return <AgentCard key={agent.name} verdict={verdict} index={i} />
          }
          return (
            <div key={agent.name} className="deliberation-live__skeleton">
              <div className="deliberation-live__skeleton-header">
                <span>{agent.specialty.replace('_', ' ').toUpperCase()}</span>
                <span className="deliberation-live__skeleton-dot" />
              </div>
              <div className="deliberation-live__skeleton-line" />
              <div className="deliberation-live__skeleton-line" style={{ width: '80%' }} />
              <div className="deliberation-live__skeleton-line" style={{ width: '55%' }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DeliberationLive
