let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!sharedCtx) sharedCtx = new AudioContext();
  return sharedCtx;
}

/** Soft temple bell — interval or session end. */
export function playMeditationBell(volume = 0.4): void {
  try {
    const ctx = getCtx();
    if (ctx.state === "suspended") void ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 1.2);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.6);
  } catch {
    /* no audio hardware */
  }
}

/** Short completion chime (two tones). */
export function playCompletionChime(volume = 0.35): void {
  playMeditationBell(volume * 0.7);
  window.setTimeout(() => playMeditationBell(volume * 0.5), 400);
}
