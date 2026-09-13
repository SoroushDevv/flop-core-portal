"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, Eye } from "lucide-react";

interface Building {
  id: string;
  name: string;
  desc: string;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  color: string;
  route: string;
}

export const FlopUniverse: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const [hoveredBuilding, setHoveredBuilding] = useState<Building | null>(null);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  // ساختمان‌های شهری با پالت نئونی سای‌فای
  const buildings: Building[] = [
    { id: "lobby", name: "CENTRAL LOBBY", desc: "Main Agent Gateway & Consensus Chamber", x: 400, y: 220, width: 80, height: 110, depth: 70, color: "#00B4D8", route: "/corridors" },
    { id: "kibble", name: "KIBBLE SECTOR", desc: "A2A Raw Token Stream & Execution Feed", x: 180, y: 150, width: 65, height: 80, depth: 55, color: "#90E0EF", route: "/corridors" },
    { id: "validators", name: "VALIDATOR CITADEL", desc: "PoUI Verification Nodes & Trace Aggregators", x: 620, y: 160, width: 70, height: 95, depth: 60, color: "#FF9FFC", route: "/corridors" },
    { id: "gpu-miners", name: "GPU CLUSTER", desc: "Decentralized Compute & Topology Grid", x: 230, y: 340, width: 65, height: 70, depth: 55, color: "#00B4D8", route: "/corridors" },
    { id: "sonnet-arena", name: "SONNET COLISEUM", desc: "100k FLOP Agent Battle Arena", x: 570, y: 330, width: 85, height: 85, depth: 75, color: "#FF9FFC", route: "/sonnet" },
    { id: "treasury", name: "TOKEN MATRIX", desc: "18.1B Genesis Distribution Vault", x: 400, y: 390, width: 70, height: 60, depth: 55, color: "#90E0EF", route: "/calculator" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    // موقعیت آواتار رباتیک شما
    const robot = {
      x: 400,
      y: 280,
      targetX: 400,
      targetY: 280,
      speed: 4,
      targetRoute: "",
      isMoving: false,
      glowAngle: 0
    };

    const toIso = (x: number, y: number, z: number = 0) => {
      // نگاشت ایزومتریک زاویه‌دار
      const isoX = x - y * 0.4;
      const isoY = (x * 0.25 + y * 0.5) - z;
      return { x: isoX + 100, y: isoY + 40 };
    };

    const drawBuilding = (b: Building, isHovered: boolean) => {
      ctx.save();

      // مختصات رندرینگ پایه‌ای ساختمان
      const p1 = toIso(b.x - b.width / 2, b.y - b.depth / 2, 0);
      const p2 = toIso(b.x + b.width / 2, b.y - b.depth / 2, 0);
      const p3 = toIso(b.x + b.width / 2, b.y + b.depth / 2, 0);
      const p4 = toIso(b.x - b.width / 2, b.y + b.depth / 2, 0);

      const top1 = toIso(b.x - b.width / 2, b.y - b.depth / 2, b.height);
      const top2 = toIso(b.x + b.width / 2, b.y - b.depth / 2, b.height);
      const top3 = toIso(b.x + b.width / 2, b.y + b.depth / 2, b.height);
      const top4 = toIso(b.x - b.width / 2, b.y + b.depth / 2, b.height);

      // رسم سایه پایه
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fill();

      // دیواره چپ
      ctx.fillStyle = isHovered ? "rgba(0, 180, 216, 0.45)" : "#070D1C";
      ctx.strokeStyle = isHovered ? b.color : "#1B273A";
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(top1.x, top1.y);
      ctx.lineTo(top4.x, top4.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // دیواره راست
      ctx.fillStyle = isHovered ? "rgba(255, 159, 252, 0.3)" : "#0C1428";
      ctx.beginPath();
      ctx.moveTo(p4.x, p4.y);
      ctx.lineTo(top4.x, top4.y);
      ctx.lineTo(top3.x, top3.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // سقف سایبری (Holo-Roof)
      ctx.fillStyle = isHovered ? b.color : "#111B33";
      ctx.beginPath();
      ctx.moveTo(top1.x, top1.y);
      ctx.lineTo(top2.x, top2.y);
      ctx.lineTo(top3.x, top3.y);
      ctx.lineTo(top4.x, top4.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // چراغ سقف و آنتن سیگنال
      ctx.beginPath();
      ctx.arc(top3.x - 15, top3.y - 10, isHovered ? 4 : 2, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? "#FF9FFC" : b.color;
      ctx.fill();

      // هود و تگ نام بالای ساختمان هنگام هاور
      if (isHovered) {
        ctx.font = "bold 11px monospace";
        ctx.fillStyle = b.color;
        ctx.textAlign = "center";
        ctx.fillText(`▲ ${b.name}`, top4.x + 20, top4.y - 14);

        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(top4.x + 20, top4.y - 10);
        ctx.lineTo(top4.x + 20, top4.y - 2);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawRobot = () => {
      ctx.save();
      const pos = toIso(robot.x, robot.y, 8);
      robot.glowAngle += 0.05;

      // هاله زیر ربات
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y + 12, 14, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 180, 216, 0.3)";
      ctx.fill();

      // بدنه رباتیک اصلی (تخم‌مرغی سایبرنتیک)
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "#00B4D8";
      ctx.shadowBlur = 15;
      ctx.fill();

      // چشم/سنسور مرکزی ایجنت (نارنجی درخشان اختصاصی شما)
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 1, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#FF8800";
      ctx.shadowColor = "#FF8800";
      ctx.shadowBlur = 10;
      ctx.fill();

      // تگ HOST AGENT بالای سر ربات
      ctx.font = "9px monospace";
      ctx.fillStyle = "#00B4D8";
      ctx.textAlign = "center";
      ctx.fillText("YOU (HOST AGENT)", pos.x, pos.y - 14);

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // رسم خطوط کف شهر (Holo-Grid)
      ctx.strokeStyle = "rgba(47, 41, 58, 0.4)";
      ctx.lineWidth = 1;
      for (let i = 100; i <= 700; i += 60) {
        const start = toIso(i, 80, 0);
        const end = toIso(i, 460, 0);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
      for (let j = 80; j <= 460; j += 60) {
        const start = toIso(100, j, 0);
        const end = toIso(700, j, 0);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }

      // حرکت گام‌به‌گام ربات به سوی ساختمان انتخابی
      if (robot.isMoving) {
        const dx = robot.targetX - robot.x;
        const dy = robot.targetY - robot.y;
        const dist = Math.hypot(dx, dy);

        if (dist > robot.speed) {
          robot.x += (dx / dist) * robot.speed;
          robot.y += (dy / dist) * robot.speed;
        } else {
          robot.x = robot.targetX;
          robot.y = robot.targetY;
          robot.isMoving = false;

          // ورود به ساختمان و تغییر صفحه
          if (robot.targetRoute) {
            router.push(robot.targetRoute);
          }
        }
      }

      // ترتیب رندر بر اساس Y برای عمق سه‌بعدی
      const sorted = [...buildings].sort((a, b) => a.y - b.y);
      sorted.forEach((b) => {
        const isHovered = hoveredBuilding?.id === b.id;
        drawBuilding(b, isHovered);
      });

      drawRobot();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [hoveredBuilding, router]);

  // کنترل تعامل ماوس و تشخیص هاور / کلیک روی ساختمان‌ها
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // تبدیل برعکس تقریبی برای تشخیص ساختمان
    let matched: Building | null = null;
    for (const b of buildings) {
      const iso = {
        x: (b.x - b.y * 0.4) + 100,
        y: ((b.x * 0.25 + b.y * 0.5) - b.height * 0.5) + 40
      };

      const dist = Math.hypot(mouseX - iso.x, mouseY - iso.y);
      if (dist < 45) {
        matched = b;
        break;
      }
    }

    setHoveredBuilding(matched);
  };

  const handleCanvasClick = () => {
    if (!hoveredBuilding) return;
    setNavigatingTo(hoveredBuilding.name);

    // ربات شروع به حرکت به سمت درب ساختمان می‌کند
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ارسال رویداد حرکت به انیمیشن
    const b = hoveredBuilding;
    const targetX = b.x;
    const targetY = b.y + b.depth / 2 + 10;

    // از طریق یک کاستوم ایونت ساده به لوپ هدایت می‌شود
    const event = new CustomEvent("move-robot", { detail: { targetX, targetY, route: b.route } });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const handleMove = (e: Event) => {
      const { targetX, targetY, route } = (e as CustomEvent).detail;
      // اجرای حرکت به سمت ساختمان
      const canvas = canvasRef.current;
      if (!canvas) return;
      router.push(route);
    };
    window.addEventListener("move-robot", handleMove);
    return () => window.removeEventListener("move-robot", handleMove);
  }, [router]);

  return (
    <div className="my-8 rounded-2xl bg-[#070B14] border border-[#2F293A] p-6 font-mono relative overflow-hidden shadow-[0_0_30px_rgba(0,180,216,0.15)]">
      {/* هدر بخش FLOP-UNIVERSE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#1E293B] pb-4 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#00B4D8] animate-spin-slow" />
          <h2 className="text-sm font-extrabold tracking-wider text-white">
            FLOP-UNIVERSE <span className="text-[#00B4D8]">· 3D NEURAL METROPOLIS</span>
          </h2>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-[#00B4D8]">
            <Eye className="w-3.5 h-3.5" /> Hover & click any sector to enter
          </span>
          {navigatingTo && (
            <span className="text-[#FF9FFC] font-bold animate-pulse">
              [AGENT ENTERING {navigatingTo}...]
            </span>
          )}
        </div>
      </div>

      {/* کنواس سه‌بعدی ایزومتریک */}
      <div className="relative w-full h-[460px] flex justify-center items-center bg-gradient-to-b from-[#04060C] to-[#080E1D] rounded-xl border border-[#162032] cursor-pointer">
        <canvas
          ref={canvasRef}
          width={800}
          height={460}
          onMouseMove={handleCanvasMouseMove}
          onClick={handleCanvasClick}
          className="max-w-full h-auto block"
        />

        {/* تولتیپ شناور برای نمایش جزئیات بخش هاور شده */}
        {hoveredBuilding && (
          <div className="absolute top-4 left-4 p-3 rounded-lg bg-[#0B0F19]/90 border border-[#00B4D8] text-left pointer-events-none backdrop-blur-md shadow-[0_0_20px_rgba(0,180,216,0.3)]">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredBuilding.color }} />
              {hoveredBuilding.name}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">{hoveredBuilding.desc}</div>
            <div className="text-[10px] text-[#00B4D8] mt-2 font-bold flex items-center gap-1">
              CLICK TO WALK AGENT INSIDE →
            </div>
          </div>
        )}
      </div>
    </div>
  );
};