import React from 'react'
import AgentCard from '../AgentCard'
import './DeliberationTab.css'

const DeliberationTab = ({ verdict }) => {
  const { agentVerdicts } = verdict
  const leaderIdx = agentVerdicts.reduce((maxIdx, v, i, arr) =>
    v.confidence > arr[maxIdx].confidence ? i : maxIdx, 0)

  return (
    <div className="deliberation-tab__grid">
      {agentVerdicts.map((v, i) => (
        <AgentCard
          key={v.agent_name}
          verdict={v}
          index={i}
          isLeader={i === leaderIdx && v.confidence > 0}
        />
      ))}
    </div>
  )
}

export default DeliberationTab
