import { useState } from 'react'
import { analyzeCase } from '../services/api'

export const useQuorum = () => {
  const [verdict, setVerdict] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submitCase = async (caseData) => {
    setLoading(true)
    setError(null)
    setVerdict(null)
    try {
      const result = await analyzeCase(caseData)
      setVerdict(result)
    } catch (err) {
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
