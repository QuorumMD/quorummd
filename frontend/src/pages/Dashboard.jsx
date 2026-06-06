import { useQuorum } from '../hooks/useQuorum'
import CaseInput from '../components/CaseInput'
import VerdictPanel from '../components/VerdictPanel'
import './Dashboard.css'

const Dashboard = () => {
  const { verdict, loading, error, submitCase, reset } = useQuorum()

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__logo">
          <span className="dashboard__logo-text">QuorumMD</span>
          <span className="dashboard__logo-tag">CLINICAL AI</span>
        </div>
        <div className="dashboard__header-right">
          <span className="dashboard__header-stat">4 AGENTS ACTIVE</span>
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
          {!verdict ? (
            <>
              <CaseInput onSubmit={submitCase} loading={loading} />
              {error && (
                <div className="dashboard__error">
                  <span>ERROR</span>
                  <p>{error}</p>
                </div>
              )}
            </>
          ) : (
            <VerdictPanel verdict={verdict} onReset={reset} />
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
