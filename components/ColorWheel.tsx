"use client";

import { useEffect, useRef } from "react";
import type { ExtractedColor } from "@/types";

interface ColorWheelProps {
  colors: ExtractedColor[];
}

export default function ColorWheel({ colors }: ColorWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || colors.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const outerRadius = size / 2 - 10;
    const innerRadius = outerRadius * 0.55;

    ctx.clearRect(0, 0, size, size);

    // Draw background color wheel (hue ring)
    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = ((angle - 1) * Math.PI) / 180;
      const endAngle = ((angle + 1) * Math.PI) / 180;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerRadius, startAngle, endAngle);
      ctx.closePath();

      // Fade toward center (desaturate)
      const innerGrad = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);
      innerGrad.addColorStop(0, `hsla(${angle}, 0%, 50%, 0.15)`);
      innerGrad.addColorStop(1, `hsla(${angle}, 80%, 50%, 0.25)`);
      ctx.fillStyle = innerGrad;
      ctx.fill();
    }

    // Draw the actual extracted colors as arcs on the wheel
    const validColors = colors.filter((c) => c.hsl.s > 5);
    const grayColors = colors.filter((c) => c.hsl.s <= 5);

    // Draw color dots on the wheel positioned by hue
    validColors.forEach((color, i) => {
      const hue = color.hsl.h;
      const sat = color.hsl.s / 100;
      const light = color.hsl.l / 100;

      const angleRad = ((hue - 90) * Math.PI) / 180;
      // Position: radius scaled by saturation
      const r = innerRadius + (outerRadius - innerRadius) * sat * 0.85;
      const x = cx + r * Math.cos(angleRad);
      const y = cy + r * Math.sin(angleRad);

      const dotSize = Math.max(8, Math.min(18, 8 + color.percentage / 3));

      // Shadow
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 6;

      // Dot
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = color.hex;
      ctx.fill();

      // Border
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.shadowBlur = 0;

    // Center: show dominant color
    if (colors.length > 0) {
      const dominant = colors[0];
      const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerRadius * 0.8);
      centerGrad.addColorStop(0, dominant.hex);
      centerGrad.addColorStop(1, dominant.hex + "88");

      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = centerGrad;
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Text in center
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = `bold ${Math.round(size * 0.055)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(dominant.hex.toUpperCase(), cx, cy);
    }

    // Draw grayscale colors as small dots in bottom strip
    if (grayColors.length > 0) {
      const stripY = size - 18;
      const spacing = Math.min(28, (size - 40) / grayColors.length);
      const startX = cx - ((grayColors.length - 1) * spacing) / 2;

      grayColors.forEach((color, i) => {
        const x = startX + i * spacing;
        ctx.beginPath();
        ctx.arc(x, stripY, 7, 0, Math.PI * 2);
        ctx.fillStyle = color.hex;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }
  }, [colors]);

  return (
    <div className="flex flex-col items-center gap-3">
      <h2 className="text-lg font-semibold text-gray-200">Color Wheel</h2>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="rounded-full"
          style={{ background: "radial-gradient(circle, #1e1e2e 0%, #0f0f1a 100%)" }}
        />
        {colors.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No colors yet</span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500">
        Positioned by hue & saturation. Dot size = frequency.
      </p>
    </div>
  );
}
