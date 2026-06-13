let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return null
    audioCtx = new Ctor()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

/** Synthesized brass temple bell chime (no audio files needed). */
export function playBellChime() {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime
  // A bell is a mix of inharmonic partials with long decay
  const partials = [
    { freq: 523.25, gain: 0.5, decay: 2.6 },
    { freq: 1046.5, gain: 0.25, decay: 2.0 },
    { freq: 1568.0, gain: 0.12, decay: 1.4 },
    { freq: 661.0, gain: 0.18, decay: 2.2 },
  ]
  for (const p of partials) {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(p.freq, now)
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(p.gain, now + 0.015)
    g.gain.exponentialRampToValueAtTime(0.0001, now + p.decay)
    osc.connect(g)
    g.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + p.decay + 0.1)
  }
}

/** Soft, warm tone when lighting the diya. */
export function playDiyaTone() {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, now)
  osc.frequency.exponentialRampToValueAtTime(520, now + 0.8)
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(0.12, now + 0.1)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 1.3)
}

/** Conch (shankh) blow — a long, breathy resonant note that swells then fades. */
export function playShankhTone() {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime
  // Two slightly detuned saw oscillators give the reedy conch timbre
  const freqs = [196, 197.5, 294]
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = i === 2 ? 'sine' : 'sawtooth'
    osc.frequency.setValueAtTime(f * 0.96, now)
    osc.frequency.exponentialRampToValueAtTime(f, now + 0.5)
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(i === 2 ? 0.05 : 0.09, now + 0.45)
    g.gain.setValueAtTime(i === 2 ? 0.05 : 0.09, now + 1.6)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 2.6)
    // gentle lowpass to soften the saw
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1400, now)
    osc.connect(filter)
    filter.connect(g)
    g.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 2.7)
  })
}

/** Short single tone helper. */
function playTone(freq: number, duration: number, gain = 0.1) {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, now)
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(gain, now + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + duration + 0.1)
}

/** Bhog offering tone — 396Hz, 300ms. */
export function playBhogTone() {
  playTone(396, 0.4, 0.12)
}

/** Dhoop incense tone — 639Hz, 300ms. */
export function playDhoopTone() {
  playTone(639, 0.4, 0.09)
}

/** Mala tone — 741Hz, 250ms. */
export function playMalaTone() {
  playTone(741, 0.3, 0.09)
}

/** Aarti start — dual warm tone 528Hz + 440Hz. */
export function playAartiTone() {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime
  ;[528, 440].forEach((f) => {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(f, now)
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.08, now + 0.05)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6)
    osc.connect(g)
    g.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.7)
  })
}

/** Soft tick when the aarti plate crosses each quarter rotation. */
export function playAartiTick() {
  playTone(880, 0.12, 0.05)
}

/** Triumphant completion chord when aarti finishes. */
export function playAartiComplete() {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime
  const chord = [523.25, 659.25, 783.99, 1046.5]
  chord.forEach((f, i) => {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(f, now + i * 0.07)
    g.gain.setValueAtTime(0.0001, now + i * 0.07)
    g.gain.exponentialRampToValueAtTime(0.12, now + i * 0.07 + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 1.8)
    osc.connect(g)
    g.connect(ctx.destination)
    osc.start(now + i * 0.07)
    osc.stop(now + i * 0.07 + 2)
  })
}

/** Gentle chime for flower offering. */
export function playFlowerTone() {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime
  const freqs = [783.99, 987.77]
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(f, now + i * 0.12)
    g.gain.setValueAtTime(0.0001, now + i * 0.12)
    g.gain.exponentialRampToValueAtTime(0.08, now + i * 0.12 + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.9)
    osc.connect(g)
    g.connect(ctx.destination)
    osc.start(now + i * 0.12)
    osc.stop(now + i * 0.12 + 1)
  })
}
