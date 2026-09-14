"use client";

import React, { useEffect, useRef } from "react";

interface NeuralCoreProps {
  did: string;
  size?: number;
}

export const NeuralCore: React.FC<NeuralCoreProps> = ({ did, size = 110 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !did) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let hash = 2166136261;
    for (let i = 0; i < did.length; i++) {
      hash ^= did.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const entropy = Math.abs(hash);

    ctx.fillStyle = "#02050D";
    ctx.fillRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const nodeCount = 6 + (entropy % 6);
    const radius = size * 0.36;
    const step = (Math.PI * 2) / nodeCount;

    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = i * step;
      const jitter = ((entropy >> (i % 8)) & 7) - 3;
      nodes.push({
        x: cx + Math.cos(angle) * (radius + jitter),
        y: cy + Math.sin(angle) * (radius + jitter),
      });
    }

    ctx.strokeStyle = "rgba(0, 180, 216, 0.35)";
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if ((i + j) % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#90E0EF";
      ctx.fill();
    });

    ctx.strokeStyle = "#00B4D8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#00B4D8";
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  }, [did, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-lg border border-[#162238] bg-[#02050D] shadow-[0_0_15px_rgba(0,180,216,0.25)]"
    />
  );
};