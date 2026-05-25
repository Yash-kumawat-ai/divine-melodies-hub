import { OM } from "@/lib/meditation/unicode";

export type MandalaDrawOptions = {
  /** 0 = paused, 1 = normal, 2+ = listening / energized */
  speed?: number;
  /** 0–1 breath pulse from meditation session */
  breath?: number;
  /** 0–1 audio-reactive energy */
  audioEnergy?: number;
  /** Draw ॐ in mandala space (centered at origin after translate) */
  drawOmSymbol?: boolean;
  omFontSize?: number;
};

const DEFAULT_OPTS: Required<MandalaDrawOptions> = {
  speed: 1,
  breath: 0,
  audioEnergy: 0,
  drawOmSymbol: true,
  omFontSize: 110,
};

/**
 * Sacred Om mandala — shared by floating orb and fullscreen meditation portal.
 * Based on OmMandalaExperience (ChatGPT canvas reference).
 */
export function drawOmMandala(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeMs: number,
  options: MandalaDrawOptions = {},
) {
  const opts = { ...DEFAULT_OPTS, ...options };
  const t = timeMs * 0.001;
  const cx = width / 2;
  const cy = height / 2;
  const s = width / 900;
  const speed = Math.max(0.15, opts.speed);
  const breath = 1 + Math.sin(t * 0.9) * 0.06 * (0.35 + opts.breath * 0.65);
  const energy = opts.audioEnergy;

  ctx.clearRect(0, 0, width, height);

  const bg = ctx.createRadialGradient(cx, cy, 100 * s, cx, cy, 500 * s);
  bg.addColorStop(0, "#2d1200");
  bg.addColorStop(0.4, "#14001f");
  bg.addColorStop(1, "#000000");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Fire-like outer aura
  for (let ring = 0; ring < 3; ring++) {
    const auraR = (420 + ring * 28 + Math.sin(t * 0.4 + ring) * 12) * s * breath;
    const aura = ctx.createRadialGradient(cx, cy, auraR * 0.55, cx, cy, auraR);
    aura.addColorStop(0, `rgba(255,140,40,${(0.14 - ring * 0.03) * (1 + energy * 0.5)})`);
    aura.addColorStop(0.6, `rgba(120,40,180,${0.06 - ring * 0.015})`);
    aura.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(cx, cy, auraR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Temple fog
  for (let f = 0; f < 5; f++) {
    const fx = cx + Math.sin(t * 0.15 + f * 2.1) * width * 0.22;
    const fy = cy + Math.cos(t * 0.12 + f * 1.7) * height * 0.18;
    const fog = ctx.createRadialGradient(fx, fy, 0, fx, fy, 180 * s);
    fog.addColorStop(0, "rgba(255,220,180,0.06)");
    fog.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fog;
    ctx.beginPath();
    ctx.arc(fx, fy, 180 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s * breath, s * breath);

  for (let i = 0; i < 4; i++) {
    ctx.save();
    const radius = 250 - i * 42;
    const rotation = t * 0.08 * speed * (i % 2 === 0 ? 1 : -1);

    ctx.rotate(rotation);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,210,120,${0.22 - i * 0.03})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.setLineDash([3, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, radius - 12, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,160,60,${0.16 - i * 0.03})`;
    ctx.stroke();
    ctx.setLineDash([]);

    for (let j = 0; j < 48; j++) {
      const angle = (Math.PI * 2 * j) / 48;
      const inner = radius - 70;
      const outer = radius;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      ctx.strokeStyle = `rgba(255,200,80,${0.1 - i * 0.015})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    for (let j = 0; j < 24; j++) {
      const angle = (Math.PI * 2 * j) / 24;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -radius + 8);
      ctx.lineTo(-8, -radius + 28);
      ctx.lineTo(8, -radius + 28);
      ctx.closePath();
      ctx.strokeStyle = `rgba(255,180,60,${0.16 - i * 0.02})`;
      ctx.stroke();
      ctx.restore();
    }

    ctx.beginPath();
    for (let j = 0; j <= 64; j++) {
      const angle = (Math.PI * 2 * j) / 64;
      const dynamicRadius = radius - 35 + Math.sin(angle * 6 + t * 2 * speed) * (8 + energy * 6);
      const x = Math.cos(angle) * dynamicRadius;
      const y = Math.sin(angle) * dynamicRadius;
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(255,120,40,${0.08 - i * 0.01})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  for (let i = 0; i < 16; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / 16 + t * 0.1 * speed);
    const petalGradient = ctx.createRadialGradient(0, -90, 10, 0, -90, 90);
    petalGradient.addColorStop(0, "rgba(255,220,120,0.8)");
    petalGradient.addColorStop(0.5, "rgba(255,120,40,0.35)");
    petalGradient.addColorStop(1, "rgba(255,0,120,0)");
    ctx.fillStyle = petalGradient;
    ctx.beginPath();
    ctx.ellipse(0, -120, 28, 95, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  for (let i = 0; i < 6; i++) {
    const angle = t * 0.5 * speed + i;
    const bx = Math.cos(angle) * 30;
    const by = Math.sin(angle * 1.3) * 30;
    const gradient = ctx.createRadialGradient(bx, by, 10, bx, by, 120);
    gradient.addColorStop(0, "rgba(255,220,160,0.95)");
    gradient.addColorStop(0.25, i % 2 === 0 ? "rgba(255,120,0,0.7)" : "rgba(180,60,255,0.7)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(bx, by, 110 - i * 8, 0, Math.PI * 2);
    ctx.fill();
  }

  const glow = ctx.createRadialGradient(0, 0, 10, 0, 0, 120 + energy * 40);
  glow.addColorStop(0, "rgba(255,255,220,1)");
  glow.addColorStop(0.2, "rgba(255,190,80,0.9)");
  glow.addColorStop(0.5, `rgba(255,120,0,${0.4 + energy * 0.25})`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 120, 0, Math.PI * 2);
  ctx.fill();

  if (opts.drawOmSymbol) {
    ctx.fillStyle = "#ffe29a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${opts.omFontSize}px "Noto Sans Devanagari", "Segoe UI Symbol", serif`;
    ctx.shadowColor = "rgba(255,180,60,1)";
    ctx.shadowBlur = 40 + energy * 20;
    ctx.fillText(OM, 0, 10);
    ctx.shadowBlur = 0;
  }

  for (let i = 0; i < 40; i++) {
    const px = Math.sin(i * 14.2 + t * speed) * 320;
    const py = Math.cos(i * 8.3 + t * 1.2 * speed) * 320;
    ctx.beginPath();
    ctx.arc(px, py, i % 3 === 0 ? 2 : 1, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? "rgba(255,220,100,0.8)" : "rgba(180,80,255,0.5)";
    ctx.fill();
  }

  // Diya / light particles (rise slowly)
  for (let d = 0; d < 18; d++) {
    const phase = d * 0.7 + t * 0.35;
    const dx = Math.sin(phase * 1.4) * (260 + d * 4);
    const dy = ((phase * 40) % 520) - 260;
    const diyaGlow = ctx.createRadialGradient(dx, dy, 0, dx, dy, 14);
    diyaGlow.addColorStop(0, `rgba(255,200,100,${0.85 + energy * 0.15})`);
    diyaGlow.addColorStop(1, "rgba(255,80,0,0)");
    ctx.fillStyle = diyaGlow;
    ctx.beginPath();
    ctx.arc(dx, dy, 6 + (d % 3), 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle glow trails
  ctx.globalAlpha = 0.35 + energy * 0.2;
  ctx.strokeStyle = "rgba(255,200,120,0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let j = 0; j <= 32; j++) {
    const angle = (Math.PI * 2 * j) / 32;
    const r = 180 + Math.sin(angle * 3 + t * 1.5) * 15;
    const x = Math.cos(angle + t * 0.05) * r;
    const y = Math.sin(angle + t * 0.05) * r;
    if (j === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.restore();
}
