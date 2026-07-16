import React, { useState, useEffect } from 'react'
import './CaseInput.css'
import { playSubmit } from '../utils/sounds'

const LOADING_STAGES = [
  'Convening quorum...',
  'Agents reviewing case...',
  'Cross-examining findings...',
  'Synthesizing opinion...'
]

const useLoadingStage = (loading) => {
  const [stage, setStage] = useState(0)
  useEffect(() => {
    if (!loading) { setStage(0); return }
    const id = setInterval(() => setStage(s => (s + 1) % LOADING_STAGES.length), 3000)
    return () => clearInterval(id)
  }, [loading])
  return LOADING_STAGES[stage]
}

const CaseInput = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({
    case_description: '',
    patient_age: '',
    patient_sex: '',
    additional_context: ''
  })

  const loadingText = useLoadingStage(loading)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = () => {
    if (!form.case_description.trim()) return
    playSubmit()
    onSubmit({
      ...form,
      patient_age: form.patient_age ? parseInt(form.patient_age) : null
    })
  }

  return (
    <div className="case-input">
      <div className="case-input__header">
        <span className="case-input__label">CASE SUBMISSION</span>
        <span className="case-input__status">
          <span className="case-input__dot" />
          SECURE
        </span>
      </div>

      <div className="case-input__field">
        <label>Case Description *</label>
        <textarea
          name="case_description"
          value={form.case_description}
          onChange={handleChange}
          placeholder="Describe the clinical case in detail. Include presenting symptoms, timeline, relevant history..."
          rows={6}
          disabled={loading}
        />
      </div>

      <div className="case-input__row">
        <div className="case-input__field">
          <label>Patient Age</label>
          <input
            type="number"
            name="patient_age"
            value={form.patient_age}
            onChange={handleChange}
            placeholder="e.g. 54"
            disabled={loading}
          />
        </div>
        <div className="case-input__field">
          <label>Biological Sex</label>
          <select name="patient_sex" value={form.patient_sex} onChange={handleChange} disabled={loading}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="case-input__field">
        <label>Additional Context</label>
        <textarea
          name="additional_context"
          value={form.additional_context}
          onChange={handleChange}
          placeholder="Labs, imaging, medications, allergies, relevant history..."
          rows={3}
          disabled={loading}
        />
      </div>

      <button
        className="case-input__submit"
        onClick={handleSubmit}
        disabled={loading || !form.case_description.trim()}
      >
        {loading ? (
          <span className="case-input__loading">
            <span className="case-input__spinner" />
            {loadingText.toUpperCase()}
          </span>
        ) : (
          'CONVENE QUORUM'
        )}
      </button>

      <p className="case-input__disclaimer">
        QuorumMD is a clinical decision support tool. All outputs must be verified by a licensed medical professional.
      </p>
    </div>
  )
}

export default CaseInput