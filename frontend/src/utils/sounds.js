const ctx = () => new (window.AudioContext || window.webkitAudioContext)()

export const playSubmit = () => {
  const ac = ctx()
  const o = ac.createOscillator()
  const g = ac.createGain()
  o.connect(g)
  g.connect(ac.destination)
  o.type = 'sine'
  o.frequency.setValueAtTime(880, ac.currentTime)
  g.gain.setValueAtTime(0, ac.currentTime)
  g.gain.linearRampToValueAtTime(0.2, ac.currentTime + 0.005)
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12)
  o.start()
  o.stop(ac.currentTime + 0.12)
}

let deliberationInterval = null

export const startDeliberation = () => {
  let beat = 0
  const bpm = 72
  const interval = (60 / bpm) * 1000

  deliberationInterval = setInterval(() => {
    const ac = ctx()

    const beep = (freq, startTime, duration, gain) => {
      const o = ac.createOscillator()
      const g = ac.createGain()
      o.connect(g)
      g.connect(ac.destination)
      o.type = 'sine'
      o.frequency.setValueAtTime(freq, startTime)
      g.gain.setValueAtTime(0, startTime)
      g.gain.linearRampToValueAtTime(gain, startTime + 0.005)
      g.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
      o.start(startTime)
      o.stop(startTime + duration)
    }

    const now = ac.currentTime
    beep(1046, now, 0.08, 0.18)
    beep(1046, now + 0.09, 0.06, 0.12)

    beat++
  }, interval)
}

export const stopDeliberation = () => {
  if (deliberationInterval) {
    clearInterval(deliberationInterval)
    deliberationInterval = null
  }
}

export const playVerdict = () => {
  const ac = ctx()

  const tone = (freq, start, duration, gain) => {
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.connect(g)
    g.connect(ac.destination)
    o.type = 'sine'
    o.frequency.setValueAtTime(freq, start)
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(gain, start + 0.01)
    g.gain.setValueAtTime(gain, start + duration - 0.05)
    g.gain.linearRampToValueAtTime(0, start + duration)
    o.start(start)
    o.stop(start + duration)
  }

  const now = ac.currentTime
  tone(440, now, 0.25, 0.12)
  tone(554, now + 0.25, 0.25, 0.12)
  tone(659, now + 0.5, 0.5, 0.15)
}