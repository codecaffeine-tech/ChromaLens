"use client";

import { useEffect, useRef, useCallback } from "react";
import type { ExtractedColor } from "@/types";

interface ColorWheelProps {
  colors: ExtractedColor[];
}

export default function ColorWheel({ colors }: ColorWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback((canvas: HTMLCanvasElement, size: number) => {
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx || colors.length === 0) return;

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

      const innerGrad = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);
      innerGrad.addColorStop(0, `hsla(${angle}, 0%, 50%, 0.15)`);
      innerGrad.addColorStop(1, `hsla(${angle}, 80%, 50%, 0.25)`);
      ctx.fillStyle = innerGrad;
      ctx.fill();
    }

    const validColors = colors.filter((c) => c.hsl.s > 5);
    const grayColors = colors.filter((c) => c.hsl.s <= 5);

    validColors.forEach((color) => {
      const hue = color.hsl.h;
      const sat = color.hsl.s / 100;

      const angleRad = ((hue - 90) * Math.PI) / 180;
      const r = innerRadius + (outerRadius - innerRadius) * sat * 0.85;
      const x = cx + r * Math.cos(angleRad);
      const y = cy + r * Math.sin(angleRad);

      const dotSize = Math.max(6, Math.min(size * 0.065, 6 + color.percentage / 3));

      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 6;

      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = color.hex;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.shadowBlur = 0;

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

      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = `bold ${Math.round(size * 0.055)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(dominant.hex.toUpperCase(), cx, cy);
    }

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

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const render = () => {
      const size = Math.min(container.clientWidth, 360);
      draw(canvas, size);
    };

    render();

    const ro = new ResizeObserver(render);
    ro.observe(container);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">색상환</h2>
      <div ref={containerRef} className="relative w-full max-w-[360px]">
        <canvas
          ref={canvasRef}
          className="rounded-full w-full h-auto block"
          style={{ background: "radial-gradient(circle, #1e1e2e 0%, #0f0f1a 100%)" }}
        />
        {colors.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-500 text-sm">아직 색상이 없습니다</span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        색조·채도 기준 배치 &middot; 점 크기 = 사용 빈도
      </p>
    </div>
  );
}
