import React, { useState } from 'react'
import OverviewTab from './tabs/OverviewTab'
import DeliberationTab from './tabs/DeliberationTab'
import AnalyticsTab from './tabs/AnalyticsTab'
import TimelineTab from './tabs/TimelineTab'
import './ResultsView.css'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'deliberation', label: 'Deliberation' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'timeline', label: 'Timeline' }
]

const ResultsView = ({ verdict, onReset }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const activeIndex = TABS.findIndex(t => t.id === activeTab)

  return (
    <div className="results-view">
      <div className="results-view__header">
        <div>
          <span className="results-view__label">QUORUM VERDICT</span>
          <p className="results-view__id">
            Case {verdict.caseId ? verdict.caseId.slice(0, 8).toUpperCase() : '—'}
            {verdict.totalElapsedMs > 0 && (
              <span className="results-view__time-badge">
                convened in {(verdict.totalElapsedMs / 1000).toFixed(1)}s
              </span>
            )}
          </p>
        </div>
        <button className="results-view__reset" onClick={onReset}>NEW CASE</button>
      </div>

      <div
        className="results-view__tabs"
        style={{ '--tab-count': TABS.length, '--tab-index': activeIndex }}
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`results-view__tab${activeTab === tab.id ? ' results-view__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <span className="results-view__tab-indicator" />
      </div>

      <div className="results-view__content" key={activeTab}>
        {activeTab === 'overview' && <OverviewTab verdict={verdict} />}
        {activeTab === 'deliberation' && <DeliberationTab verdict={verdict} />}
        {activeTab === 'analytics' && <AnalyticsTab verdict={verdict} />}
        {activeTab === 'timeline' && <TimelineTab verdict={verdict} />}
      </div>

      <p className="results-view__disclaimer">{verdict.disclaimer}</p>
    </div>
  )
}

export default ResultsView
