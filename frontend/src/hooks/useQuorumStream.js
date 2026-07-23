import { useCallback, useRef, useState } from 'react'
import { streamCase } from '../services/sseClient'
import { startDeliberation, stopDeliberation, playVerdict } from '../utils/sounds'

const initialState = {
  phase: 'idle', // idle | streaming | done | error
  roster: [],
  agentVerdicts: [],
  synthesis: null,
  caseId: null,
  confidenceScore: 0,
  totalElapsedMs: 0,
  disclaimer: '',
  error: null
}

export const useQuorumStream = () => {
  const [state, setState] = useState(initialState)
  const controllerRef = useRef(null)

  const submitCase = useCallback(async (caseData) => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setState({ ...initialState, phase: 'streaming' })
    startDeliberation()

    await streamCase(caseData, {
      onRoster: (agents) => setState(s => ({ ...s, roster: agents })),
      onAgentVerdict: (verdict) => setState(s => ({ ...s, agentVerdicts: [...s.agentVerdicts, verdict] })),
      onSynthesis: (synthesis) => setState(s => ({ ...s, synthesis })),
      onDone: (done) => {
        stopDeliberation()
        playVerdict()
        setState(s => ({
          ...s,
          phase: 'done',
          caseId: done.case_id,
          confidenceScore: done.confidence_score,
          totalElapsedMs: done.total_elapsed_ms,
          disclaimer: done.disclaimer
        }))
      },
      onError: (message) => {
        stopDeliberation()
        setState(s => ({ ...s, phase: 'error', error: message }))
      }
    }, controller.signal)
  }, [])

  const reset = useCallback(() => {
    controllerRef.current?.abort()
    stopDeliberation()
    setState(initialState)
  }, [])

  return { ...state, submitCase, reset }
}
