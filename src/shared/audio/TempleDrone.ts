// ─── SYNTHESIZED MEDITATIVE TANPURA DRONE ─────────────────────────
export class TempleDrone {
  private ctx: AudioContext | null = null;
  private oscs: OscillatorNode[] = [];
  private gain: GainNode | null = null;

  start() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
      
      this.gain = this.ctx.createGain();
      this.gain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 1.2); // soft ambient volume
      this.gain.connect(this.ctx.destination);

      // Deep meditative tanpura base drone
      // C#3 root frequency (138.59 Hz)
      const baseFreq = 138.59;
      const harmonyRatios = [1, 1.5, 2, 3]; // Root, Perfect Fifth, Octave, Octave Perfect Fifth
      
      harmonyRatios.forEach((ratio, idx) => {
        if (!this.ctx || !this.gain) return;
        const osc = this.ctx.createOscillator();
        osc.type = idx === 0 ? "triangle" : "sine"; // triangle for base warmth, sine for high harmonics
        osc.frequency.value = baseFreq * ratio;
        
        // Chorus detuning
        osc.detune.value = (Math.random() - 0.5) * 6;

        // Swelling slow volume LFO
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.12 + Math.random() * 0.08;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 0.01;
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        lfo.start();
        osc.connect(this.gain);
        osc.start();
        
        this.oscs.push(osc);
        this.oscs.push(lfo as any);
      });
    } catch (e) {
      console.error("AudioContext initialization failed", e);
    }
  }

  stop() {
    try {
      if (this.gain && this.ctx) {
        const now = this.ctx.currentTime;
        this.gain.gain.setValueAtTime(this.gain.gain.value, now);
        this.gain.gain.linearRampToValueAtTime(0, now + 0.8);
        setTimeout(() => {
          this.oscs.forEach(osc => {
            try { osc.stop(); } catch(_) { /* ignore stop error */ }
          });
          try { this.ctx?.close(); } catch(_) { /* ignore close error */ }
          this.ctx = null;
          this.oscs = [];
          this.gain = null;
        }, 900);
      }
    } catch(e) { /* ignore top-level stop error */ }
  }
}
