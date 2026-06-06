import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
})

export const analyzeCase = async (caseData) => {
  const response = await api.post('/case/analyze', caseData)
  return response.data
}

export default api
