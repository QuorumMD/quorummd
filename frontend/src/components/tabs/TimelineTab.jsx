import React from 'react'
import './TimelineTab.css'

const specialtyLabel = (s) => s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())

const TimelineTab = ({ verdict }) => {
  const { agentVerdicts, totalElapsedMs } = verdict
  const sorted = [...agentVerdicts].sort((a, b) => a.elapsed_ms - b.elapsed_ms)
  const maxMs = Math.max(totalElapsedMs, ...sorted.map(v => v.elapsed_ms), 1)

  if (!sorted.length) {
    return <p className="timeline-tab__empty">No timing data for this case yet.</p>
  }

  return (
    <div className="timeline-tab">
      <p className="timeline-tab__intro">
        Real per-agent response latency for this case, not simulated.
      </p>

      <div className="timeline-tab__rows">
        {sorted.map((v, i) => (
          <div key={v.agent_name} className="timeline-tab__row">
            <span className="timeline-tab__rank">{i + 1}</span>
            <span className="timeline-tab__name">{specialtyLabel(v.specialty)}</span>
            <div className="timeline-tab__track">
              <div className="timeline-tab__fill" style={{ width: `${(v.elapsed_ms / maxMs) * 100}%` }} />
            </div>
            <span className="timeline-tab__time">{(v.elapsed_ms / 1000).toFixed(2)}s</span>
          </div>
        ))}

        <div className="timeline-tab__row timeline-tab__row--total">
          <span className="timeline-tab__rank">—</span>
          <span className="timeline-tab__name">Full quorum convened</span>
          <div className="timeline-tab__track">
            <div className="timeline-tab__fill timeline-tab__fill--total" style={{ width: '100%' }} />
          </div>
          <span className="timeline-tab__time">{(totalElapsedMs / 1000).toFixed(2)}s</span>
        </div>
      </div>

      <p className="timeline-tab__budget">
        Target budget: under 10s end-to-end
        {totalElapsedMs > 0 && (
          <span className={totalElapsedMs <= 10000 ? 'timeline-tab__budget-ok' : 'timeline-tab__budget-over'}>
            {totalElapsedMs <= 10000 ? ' — within budget' : ' — over budget'}
          </span>
        )}
      </p>
    </div>
  )
}

export default TimelineTab
