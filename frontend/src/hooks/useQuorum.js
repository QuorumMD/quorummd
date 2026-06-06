import { useState } from 'react'
import { analyzeCase } from '../services/api'
import { startDeliberation, stopDeliberation, playVerdict } from '../utils/sounds'

export const useQuorum = () => {
  const [verdict, setVerdict] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submitCase = async (caseData) => {
    setLoading(true)
    setError(null)
    setVerdict(null)
    startDeliberation()
    try {
      const result = await analyzeCase(caseData)
      stopDeliberation()
      playVerdict()
      setVerdict(result)
    } catch (err) {
      stopDeliberation()
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setVerdict(null)
    setError(null)
    setLoading(false)
  }

  return { verdict, loading, error, submitCase, reset }
}
