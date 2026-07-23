import React from 'react'
import { useAgentRoster } from '../hooks/useAgentRoster'
import { useQuorumStream } from '../hooks/useQuorumStream'
import CaseInput from '../components/CaseInput'
import DeliberationLive from '../components/DeliberationLive'
import ResultsView from '../components/ResultsView'
import './Dashboard.css'

const Dashboard = () => {
  const { roster: appRoster } = useAgentRoster()
  const quorum = useQuorumStream()

  const liveRoster = quorum.roster.length ? quorum.roster : appRoster
  const headerCount = liveRoster.length

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__logo">
          <span className="dashboard__logo-text">QuorumMD</span>
          <span className="dashboard__logo-tag">CLINICAL AI</span>
        </div>
        <div className="dashboard__header-right">
          <span className="dashboard__header-stat">
            {headerCount > 0 ? `${headerCount} AGENTS ACTIVE` : 'CONNECTING...'}
          </span>
        </div>
      </header>

      <main className="dashboard__main">
        <div className="dashboard__hero">
          <h1 className="dashboard__title">The AI Second Opinion</h1>
          <p className="dashboard__subtitle">
            Specialized agents deliberate in real time.<br />
            No angle gets missed.
          </p>
        </div>

        <div className="dashboard__content">
          {quorum.phase === 'idle' && (
            <CaseInput onSubmit={quorum.submitCase} loading={false} />
          )}

          {quorum.phase === 'streaming' && (
            <DeliberationLive
              roster={liveRoster}
              agentVerdicts={quorum.agentVerdicts}
              synthesis={quorum.synthesis}
              phase={quorum.phase}
            />
          )}

          {quorum.phase === 'error' && (
            <div className="dashboard__error">
              <span>ERROR</span>
              <p>{quorum.error}</p>
              <button className="dashboard__error-retry" onClick={quorum.reset}>TRY AGAIN</button>
            </div>
          )}

          {quorum.phase === 'done' && (
            <ResultsView verdict={quorum} onReset={quorum.reset} />
          )}
        </div>
      </main>

      <footer className="dashboard__footer">
        <span>QuorumMD · For authorized hospital use only</span>
        <span>v0.1.0</span>
      </footer>
    </div>
  )
}

export default Dashboard
