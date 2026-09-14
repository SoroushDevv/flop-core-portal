"use client";

import React, { useEffect, useRef } from "react";

export const GridScan: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let scanY = 0;
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 580;
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#162238";
      ctx.lineWidth = 1;
      const step = 40;

      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      scanY += 1.8;
      if (scanY > canvas.height) scanY = 0;

      const grad = ctx.createLinearGradient(0, scanY - 35, 0, scanY + 35);
      grad.addColorStop(0, "rgba(0, 180, 216, 0)");
      grad.addColorStop(0.5, "rgba(0, 180, 216, 0.25)");
      grad.addColorStop(1, "rgba(0, 180, 216, 0)");

      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 35, canvas.width, 70);

      ctx.strokeStyle = "#00B4D8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-[580px] pointer-events-none overflow-hidden z-0">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/40 to-[#030712]" />
    </div>
  );
};