import { useEffect, useState } from 'react'
import { getAgentRoster } from '../services/api'

export const useAgentRoster = () => {
  const [roster, setRoster] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getAgentRoster()
      .then(agents => { if (!cancelled) setRoster(agents) })
      .catch(() => { if (!cancelled) setRoster([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { roster, loading }
}
