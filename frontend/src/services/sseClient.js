import { API_BASE_URL } from './api'

// Native EventSource can't send a POST body, so the streaming case-analysis endpoint is
// consumed by hand: fetch() + a raw ReadableStream reader, parsing "event: x\ndata: y\n\n"
// frames out of the decoded text as they arrive.
export const streamCase = async (caseData, handlers = {}, signal) => {
  const { onRoster, onAgentVerdict, onSynthesis, onDone, onError } = handlers

  let response
  try {
    response = await fetch(`${API_BASE_URL}/case/analyze/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseData),
      signal
    })
  } catch (err) {
    onError?.(err.message || 'Could not reach the server.')
    return
  }

  if (!response.ok || !response.body) {
    let detail = `Request failed (${response.status})`
    try {
      const body = await response.json()
      detail = body.detail || detail
    } catch {
      // response wasn't JSON, keep the generic message
    }
    onError?.(detail)
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const dispatch = (eventName, rawData) => {
    let data
    try {
      data = JSON.parse(rawData)
    } catch {
      return
    }
    if (eventName === 'roster') onRoster?.(data.agents)
    else if (eventName === 'agent_verdict') onAgentVerdict?.(data)
    else if (eventName === 'synthesis') onSynthesis?.(data)
    else if (eventName === 'done') onDone?.(data)
  }

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let boundary
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, boundary)
        buffer = buffer.slice(boundary + 2)

        let eventName = 'message'
        const dataLines = []
        for (const line of frame.split('\n')) {
          if (line.startsWith('event:')) eventName = line.slice(6).trim()
          else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
        }
        if (dataLines.length) dispatch(eventName, dataLines.join('\n'))
      }
    }
  } catch (err) {
    if (err.name !== 'AbortError') onError?.(err.message || 'Connection lost while streaming.')
  }
}
