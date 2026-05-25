import { useEffect, useRef } from "react";
import { drawOmMandala } from "@/lib/drawOmMandala";
import { cn } from "@/lib/utils";

type OmMandalaCanvasProps = {
  active: boolean;
  breath?: number;
  audioEnergy?: number;
  speed?: number;
  minimal?: boolean;
  className?: string;
};

export default function OmMandalaCanvas({
  active,
  breath = 0,
  audioEnergy = 0,
  speed: speedProp,
  minimal = false,
  className,
}: OmMandalaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef(0);
  const activeRef = useRef(active);
  const breathRef = useRef(breath);
  const energyRef = useRef(audioEnergy);
  const speedRef = useRef(speedProp ?? (active ? 1 : 0.35));

  useEffect(() => {
    activeRef.current = active;
    breathRef.current = breath;
    energyRef.current = audioEnergy;
    speedRef.current = speedProp ?? (active ? 1 : 0.35);
  }, [active, breath, audioEnergy, speedProp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let logicalSide = 400;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      logicalSide = Math.min(rect.width, rect.height, minimal ? 320 : 720);
      canvas.width = Math.floor(logicalSide * dpr);
      canvas.height = Math.floor(logicalSide * dpr);
      canvas.style.width = `${logicalSide}px`;
      canvas.style.height = `${logicalSide}px`;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const animate = (time: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawOmMandala(ctx, logicalSide, logicalSide, time, {
        speed: speedRef.current,
        breath: breathRef.current,
        audioEnergy: energyRef.current,
        drawOmSymbol: !minimal,
        omFontSize: Math.max(72, Math.min(110, logicalSide * 0.12)),
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(animationRef.current);
    };
  }, [minimal]);

  return (
    <div ref={containerRef} className={cn("flex h-full w-full items-center justify-center", className)}>
      <canvas
        ref={canvasRef}
        className={cn(
          "max-h-[min(88dvh,720px)] max-w-[min(92vw,720px)]",
          minimal && "opacity-80",
        )}
        aria-hidden
      />
    </div>
  );
}
