import React from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList
} from 'recharts'
import './AnalyticsTab.css'

// Mirrors the --chart-* custom properties declared in AnalyticsTab.css. Recharts renders to
// SVG and needs literal color values, so these are kept in sync with the CSS by hand -- both
// were validated together against the app's dark card surface (see dataviz skill workflow).
const CHART_COLORS = {
  selfReported: '#3987e5', // self-reported LLM confidence
  relevance: '#199e70',    // specialty-relevance score
  final: '#d95926'         // blended final confidence
}

const specialtyLabel = (s) => s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="analytics-tab__tooltip">
      <p className="analytics-tab__tooltip-label">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="analytics-tab__tooltip-row">
          <span className="analytics-tab__tooltip-key" style={{ background: p.color }} />
          <span className="analytics-tab__tooltip-value">{Math.round(p.value)}%</span>
          <span className="analytics-tab__tooltip-name">{p.name}</span>
        </p>
      ))}
    </div>
  )
}

const Legend = ({ items }) => (
  <div className="analytics-tab__legend">
    {items.map(item => (
      <span key={item.label} className="analytics-tab__legend-item">
        <span className="analytics-tab__legend-swatch" style={{ background: item.color }} />
        {item.label}
      </span>
    ))}
  </div>
)

const AnalyticsTab = ({ verdict }) => {
  const { agentVerdicts } = verdict

  const finalData = [...agentVerdicts]
    .map(v => ({
      specialty: specialtyLabel(v.specialty),
      confidence: Math.round(v.confidence * 100),
      isLeader: false
    }))
    .sort((a, b) => b.confidence - a.confidence)

  if (finalData.length) finalData[0].isLeader = true

  const compositionData = agentVerdicts.map(v => ({
    specialty: specialtyLabel(v.specialty),
    selfReported: Math.round((v.self_reported_confidence ?? 0) * 100),
    relevance: Math.round((v.relevance_score ?? 0) * 100)
  }))

  if (!agentVerdicts.length) {
    return <p className="analytics-tab__empty">No agent data to analyze yet.</p>
  }

  return (
    <div className="analytics-tab">
      <div className="analytics-tab__chart-card">
        <span className="analytics-tab__chart-title">FINAL CONFIDENCE BY SPECIALTY</span>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={finalData} layout="vertical" margin={{ top: 4, right: 28, left: 4, bottom: 4 }}>
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
            <YAxis
              type="category"
              dataKey="specialty"
              width={130}
              tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="confidence" name="Final confidence" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {finalData.map((entry, i) => (
                <Cell key={i} fill={CHART_COLORS.final} fillOpacity={entry.isLeader ? 1 : 0.55} />
              ))}
              <LabelList
                dataKey="confidence"
                position="right"
                formatter={(v) => `${v}%`}
                style={{ fill: 'var(--text-primary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="analytics-tab__chart-card">
        <span className="analytics-tab__chart-title">CONFIDENCE COMPOSITION</span>
        <p className="analytics-tab__chart-subtitle">
          What each agent's final score is built from — its own stated confidence, blended with
          how well the case matches its specialty.
        </p>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={compositionData} margin={{ top: 8, right: 8, left: -12, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="specialty" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="selfReported" name="Model self-report" fill={CHART_COLORS.selfReported} radius={[4, 4, 0, 0]} maxBarSize={22} />
            <Bar dataKey="relevance" name="Specialty relevance" fill={CHART_COLORS.relevance} radius={[4, 4, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
        <Legend items={[
          { label: 'Model self-report', color: CHART_COLORS.selfReported },
          { label: 'Specialty relevance', color: CHART_COLORS.relevance }
        ]} />
      </div>
    </div>
  )
}

export default AnalyticsTab
