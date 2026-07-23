import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
})

export const analyzeCase = async (caseData) => {
  const response = await api.post('/case/analyze', caseData)
  return response.data
}

export const getAgentRoster = async () => {
  const response = await api.get('/agents')
  return response.data
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default api
