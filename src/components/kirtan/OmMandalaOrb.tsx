import { useEffect, useRef } from "react";
import { drawOmMandala } from "@/lib/drawOmMandala";
import { cn } from "@/lib/utils";

export type NaradOrbVoiceState = "idle" | "listening" | "thinking" | "speaking";

type OmMandalaOrbProps = {
  active?: boolean;
  listening?: boolean;
  /** Siri-style phase (overrides listening speed when set). */
  voiceState?: NaradOrbVoiceState;
  reducedMotion?: boolean;
  /** When false, mandala only — use an HTML ॐ overlay on the FAB. */
  drawCenterOm?: boolean;
  size?: number;
  className?: string;
};

function speedForState(state: NaradOrbVoiceState, active: boolean, listening: boolean): number {
  if (state === "listening") return 2.2;
  if (state === "thinking") return 1.4;
  if (state === "speaking") return 1.65;
  if (listening) return 2.2;
  return active ? 1 : 0.35;
}

/** Animated sacred Om mandala for the floating Ask Narad trigger. */
export default function OmMandalaOrb({
  active = true,
  listening = false,
  voiceState = "idle",
  reducedMotion = false,
  drawCenterOm = true,
  size = 72,
  className,
}: OmMandalaOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef(0);
  const activeRef = useRef(active);
  const listeningRef = useRef(listening);
  const voiceStateRef = useRef(voiceState);
  const reducedRef = useRef(reducedMotion);
  const shouldAnimate = !reducedMotion && (active || listening || voiceState !== "idle");

  useEffect(() => {
    activeRef.current = active;
    listeningRef.current = listening;
    voiceStateRef.current = voiceState;
    reducedRef.current = reducedMotion;
  }, [active, listening, voiceState, reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(size * dpr);
    canvas.height = Math.floor(size * dpr);

    const drawFrame = (time: number) => {
      const state = voiceStateRef.current;
      const speed = reducedRef.current
        ? 0.35
        : speedForState(state, activeRef.current, listeningRef.current);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawOmMandala(ctx, size, size, time, {
        speed,
        drawOmSymbol: drawCenterOm,
        omFontSize: Math.max(20, Math.round(size * 0.44)),
      });
    };

    if (!shouldAnimate) {
      drawFrame(0);
      return;
    }

    const animate = (time: number) => {
      drawFrame(time);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [size, drawCenterOm, shouldAnimate]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={cn("block rounded-full", className)}
      aria-hidden
    />
  );
}
