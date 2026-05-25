import { useCallback, useEffect, useRef, useState } from "react";
import type { AmbienceId, MantraId, VisualMode } from "@/lib/meditation/meditationTypes";

type UseMeditationAudioOptions = {
  volume: number;
  playing: boolean;
  mantraId?: MantraId;
  visualMode?: VisualMode;
  ambience: Record<AmbienceId, boolean>;
};

const MANTRA_FREQ: Record<MantraId, number> = {
  om_namah_shivaya: 196,
  hare_krishna: 220,
  jai_shree_ram: 207,
  om_namo_narayanaya: 233,
};

/**
 * Generated Web Audio only — no silent fetch of missing MP3s.
 * Tanpura drone + optional rain noise + bell handled externally.
 */
export function useMeditationAudio({
  volume,
  playing,
  mantraId = "om_namah_shivaya",
  visualMode = "full_mandala",
  ambience,
}: UseMeditationAudioOptions) {
  const [audioEnergy, setAudioEnergy] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const oscRefs = useRef<OscillatorNode[]>([]);
  const noiseRef = useRef<AudioBufferSourceNode | null>(null);
  const rafRef = useRef(0);

  const stopAll = useCallback(() => {
    oscRefs.current.forEach((o) => {
      try {
        o.stop();
        o.disconnect();
      } catch {
        /* stopped */
      }
    });
    oscRefs.current = [];
    if (noiseRef.current) {
      try {
        noiseRef.current.stop();
      } catch {
        /* */
      }
      noiseRef.current = null;
    }
  }, []);

  const ensureCtx = useCallback(async () => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      masterGainRef.current = ctxRef.current.createGain();
      analyserRef.current = ctxRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      masterGainRef.current.connect(analyserRef.current);
      analyserRef.current.connect(ctxRef.current.destination);
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") await ctx.resume();
    return ctx;
  }, []);

  const startSynth = useCallback(async () => {
    const ctx = await ensureCtx();
    stopAll();
    const master = masterGainRef.current!;
    const volScale = visualMode === "dim" ? 0.45 : visualMode === "minimal" ? 0.35 : 1;
    master.gain.value = volume * volScale;

    if (!ambience.silence && ambience.tanpura) {
      const base = MANTRA_FREQ[mantraId];
      [base, base * 1.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? "sine" : "triangle";
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.value = i === 0 ? 0.1 : 0.035;
        osc.connect(g);
        g.connect(master);
        osc.start();
        oscRefs.current.push(osc);
      });
    }

    if (ambience.rain || ambience.river) {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = ambience.river ? 400 : 800;
      const g = ctx.createGain();
      g.gain.value = 0.04;
      noise.connect(filter);
      filter.connect(g);
      g.connect(master);
      noise.start();
      noiseRef.current = noise;
    }

    if (ambience.flute) {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = MANTRA_FREQ[mantraId] * 2;
      const g = ctx.createGain();
      g.gain.value = 0.025;
      osc.connect(g);
      g.connect(master);
      osc.start();
      oscRefs.current.push(osc);
    }
  }, [ambience, ensureCtx, mantraId, stopAll, visualMode, volume]);

  useEffect(() => {
    if (!playing) {
      stopAll();
      if (ctxRef.current?.state === "running") void ctxRef.current.suspend();
      setAudioEnergy(0);
      return;
    }
    void startSynth();
    return () => stopAll();
  }, [playing, startSynth, stopAll]);

  useEffect(() => {
    if (masterGainRef.current) {
      const volScale = visualMode === "dim" ? 0.45 : visualMode === "minimal" ? 0.35 : 1;
      masterGainRef.current.gain.value = volume * volScale;
    }
  }, [volume, visualMode]);

  useEffect(() => {
    const analyser = analyserRef.current;
    if (!playing || !analyser) {
      setAudioEnergy(0);
      return;
    }
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const avg = sum / data.length / 255;
      setAudioEnergy((prev) => prev * 0.85 + avg * 0.15);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      stopAll();
      void ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, [stopAll]);

  return { audioEnergy };
}
