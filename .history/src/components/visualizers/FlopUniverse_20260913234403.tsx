"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe2, Rocket, Sparkles } from "lucide-react";

interface Planet {
  id: string;
  name: string;
  desc: string;
  route: string;
  color: string;
  glowColor: string;
  size: number;
  orbitRadiusX: number;
  orbitRadiusY: number;
  speed: number;
  angle: number;
  ring?: boolean;
}

interface Spaceship {
  did: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  color: string;
  isHost?: boolean;
}

export const FlopUniverse: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null);
  const [warpingTarget, setWarpingTarget] = useState<string | null>(null);

  // مشخصات سیارات منظومه Flop
  const planetsRef = useRef<Planet[]>([
    {
      id: "lobby",
      name: "CENTRAL LOBBY",
      desc: "Agent Consensus & Core Gateway",
      route: "/corridors",
      color: "#00B4D8",
      glowColor: "rgba(0, 180, 216, 0.6)",
      size: 14,
      orbitRadiusX: 110,
      orbitRadiusY: 60,
      speed: 0.012,
      angle: 0,
      ring: true,
    },
    {
      id: "sonnet",
      name: "SONNET COLISEUM",
      desc: "100k FLOP Agent Battle Arena",
      route: "/sonnet",
      color: "#FF9FFC",
      glowColor: "rgba(255, 159, 252, 0.6)",
      size: 16,
      orbitRadiusX: 180,
      orbitRadiusY: 95,
      speed: 0.008,
      angle: 1.8,
      ring: false,
    },
    {
      id: "treasury",
      name: "TOKEN TREASURY",
      desc: "18.1B Supply & Airdrop Matrix",
      route: "/calculator",
      color: "#90E0EF",
      glowColor: "rgba(144, 224, 239, 0.5)",
      size: 13,
      orbitRadiusX: 250,
      orbitRadiusY: 130,
      speed: 0.005,
      angle: 3.5,
      ring: true,
    },
    {
      id: "gpu",
      name: "GPU MINING CLUSTER",
      desc: "Distributed PoUI Compute Grid",
      route: "/corridors",
      color: "#38BDF8",
      glowColor: "rgba(56, 189, 248, 0.5)",
      size: 12,
      orbitRadiusX: 310,
      orbitRadiusY: 160,
      speed: 0.004,
      angle: 4.9,
      ring: false,
    },
    {
      id: "validators",
      name: "VALIDATOR CITADEL",
      desc: "Signature & Receipt Aggregators",
      route: "/corridors",
      color: "#A78BFA",
      glowColor: "rgba(167, 139, 250, 0.5)",
      size: 15,
      orbitRadiusX: 370,
      orbitRadiusY: 190,
      speed: 0.003,
      angle: 0.8,
      ring: true,
    },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let starPulse = 0;

    // ایجاد استارها در پس‌زمینه کهکشان
    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.2,
      alpha: Math.random() * 0.8 + 0.2,
    }));

    // ایجاد ناوگان سفینه‌های گشت‌زنی ایجنت‌ها
    const ships: Spaceship[] = [
      { did: "z6Mkh...", x: 200, y: 150, vx: 0.8, vy: 0.4, angle: 0, color: "#00B4D8" },
      { did: "z6Mpo...", x: 600, y: 350, vx: -0.6, vy: -0.5, angle: 0, color: "#FF9FFC" },
      { did: "z6Mtx...", x: 450, y: 100, vx: 0.5, vy: -0.7, angle: 0, color: "#90E0EF" },
      { did: "z6Mqy...", x: 300, y: 400, vx: -0.7, vy: 0.3, angle: 0, color: "#A78BFA" },
    ];

    // سفینه پرچمدار شما (Host Flagship)
    const hostShip = {
      x: 400,
      y: 300,
      targetX: 400,
      targetY: 300,
      speed: 5,
      angle: 0,
      targetRoute: "",
      isWarping: false,
    };

    const drawSun = (cx: number, cy: number) => {
      starPulse += 0.03;
      const glow = Math.sin(starPulse) * 4;

      // هاله انرژی کور
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 55 + glow);
      grad.addColorStop(0, "#FFFFFF");
      grad.addColorStop(0.2, "#00B4D8");
      grad.addColorStop(0.6, "rgba(255, 159, 252, 0.4)");
      grad.addColorStop(1, "rgba(3, 7, 18, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 55 + glow, 0, Math.PI * 2);
      ctx.fill();

      // کره ستاره
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "#00B4D8";
      ctx.shadowBlur = 25;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = "bold 9px monospace";
      ctx.fillStyle = "#90E0EF";
      ctx.textAlign = "center";
      ctx.fillText("FLOP CORE", cx, cy + 32);
    };

    const drawShip = (s: { x: number; y: number; angle: number; color: string; isHost?: boolean }) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      // رسم بدنه سفینه سای‌فای به شکل دارت / جنگنده
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-7, -6);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-7, 6);
      ctx.closePath();

      ctx.fillStyle = s.isHost ? "#FF8800" : s.color;
      ctx.shadowColor = s.isHost ? "#FF8800" : s.color;
      ctx.shadowBlur = s.isHost ? 15 : 8;
      ctx.fill();

      // موتور رانش پلاسمایی
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(-11, 0);
      ctx.strokeStyle = s.isHost ? "#FFFFFF" : "#FF9FFC";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // ۱. رسم استارهای پس‌زمینه
      stars.forEach((st) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${st.alpha})`;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // ۲. رسم مدارهای چرخش بیضوی
      planetsRef.current.forEach((p) => {
        ctx.strokeStyle = "rgba(47, 41, 58, 0.6)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, p.orbitRadiusX, p.orbitRadiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // ۳. رسم ستاره مرکزی
      drawSun(cx, cy);

      // ۴. آپدیت و رسم سیارات
      planetsRef.current.forEach((p) => {
        p.angle += p.speed;
        const px = cx + Math.cos(p.angle) * p.orbitRadiusX;
        const py = cy + Math.sin(p.angle) * p.orbitRadiusY;

        const isHovered = hoveredPlanet?.id === p.id;

        // حلقه سیاره (Rings)
        if (p.ring) {
          ctx.strokeStyle = p.glowColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(px, py, p.size * 1.8, p.size * 0.6, 0.4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // اتمسفر و درخشش سیاره
        ctx.beginPath();
        ctx.arc(px, py, p.size + (isHovered ? 5 : 2), 0, Math.PI * 2);
        ctx.fillStyle = p.glowColor;
        ctx.fill();

        // بدنه اصلی سیاره
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = isHovered ? 20 : 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // هود و اطلاعات سیاره هنگام هاور
        if (isHovered) {
          ctx.font = "bold 11px monospace";
          ctx.fillStyle = "#FFFFFF";
          ctx.textAlign = "center";
          ctx.fillText(`⯈ ${p.name}`, px, py - p.size - 12);

          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, py - p.size - 8);
          ctx.lineTo(px, py - p.size - 2);
          ctx.stroke();
        }
      });

      // ۵. حرکت و چرخش سفینه‌های ایجنت در کهکشان
      ships.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.angle = Math.atan2(s.vy, s.vx);

        if (s.x < 20 || s.x > canvas.width - 20) s.vx *= -1;
        if (s.y < 20 || s.y > canvas.height - 20) s.vy *= -1;

        drawShip(s);
      });

      // ۶. حرکت سفینه پرچمدار شما (Host Flagship)
      if (hostShip.isWarping) {
        const dx = hostShip.targetX - hostShip.x;
        const dy = hostShip.targetY - hostShip.y;
        const dist = Math.hypot(dx, dy);
        hostShip.angle = Math.atan2(dy, dx);

        if (dist > hostShip.speed) {
          hostShip.x += (dx / dist) * hostShip.speed;
          hostShip.y += (dy / dist) * hostShip.speed;

          // خط شتاب هایپردرایو
          ctx.strokeStyle = "rgba(255, 136, 0, 0.4)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(hostShip.x, hostShip.y);
          ctx.lineTo(hostShip.x - Math.cos(hostShip.angle) * 25, hostShip.y - Math.sin(hostShip.angle) * 25);
          ctx.stroke();
        } else {
          hostShip.isWarping = false;
          if (hostShip.targetRoute) {
            router.push(hostShip.targetRoute);
          }
        }
      }

      drawShip({ ...hostShip, color: "#FF8800", isHost: true });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [hoveredPlanet, router]);

  // رهگیری هاور روی سیارات
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    let match: Planet | null = null;
    for (const p of planetsRef.current) {
      const px = cx + Math.cos(p.angle) * p.orbitRadiusX;
      const py = cy + Math.sin(p.angle) * p.orbitRadiusY;

      const dist = Math.hypot(mouseX - px, mouseY - py);
      if (dist < p.size + 8) {
        match = p;
        break;
      }
    }

    setHoveredPlanet(match);
  };

  // کلیک روی سیاره و اعزام هایپردرایو سفینه
  const handleClick = () => {
    if (!hoveredPlanet) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setWarpingTarget(hoveredPlanet.name);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const targetX = cx + Math.cos(hoveredPlanet.angle) * hoveredPlanet.orbitRadiusX;
    const targetY = cy + Math.sin(hoveredPlanet.angle) * hoveredPlanet.orbitRadiusY;

    // ارسال فرمان پرواز به سمت سیاره
    const event = new CustomEvent("fly-to-planet", {
      detail: { targetX, targetY, route: hoveredPlanet.route },
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const handleFly = (e: Event) => {
      const { route } = (e as CustomEvent).detail;
      setTimeout(() => {
        router.push(route);
      }, 700);
    };
    window.addEventListener("fly-to-planet", handleFly);
    return () => window.removeEventListener("fly-to-planet", handleFly);
  }, [router]);

  return (
    <div className="my-8 rounded-2xl bg-[#030611] border border-[#2F293A] p-6 font-mono relative overflow-hidden shadow-[0_0_35px_rgba(0,180,216,0.15)]">
      {/* هدر بخش FLOP SOLAR SYSTEM */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#1E293B] pb-4 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-[#00B4D8] animate-spin-slow" />
          <h2 className="text-sm font-extrabold tracking-wider text-white">
            FLOP-UNIVERSE <span className="text-[#00B4D8]">· 3D SOLAR SYSTEM</span>
          </h2>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-[#FF8800]">
            <Rocket className="w-3.5 h-3.5" /> Orange Vessel: Your Host Agent
          </span>
          {warpingTarget && (
            <span className="text-[#FF9FFC] font-bold animate-pulse flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> [HYPERDRIVE WARPING TO {warpingTarget}...]
            </span>
          )}
        </div>
      </div>

      {/* کنواس سه‌بعدی منظومه خورشیدی */}
      <div className="relative w-full h-[480px] flex justify-center items-center bg-gradient-to-b from-[#020409] via-[#040817] to-[#02050E] rounded-xl border border-[#162032] cursor-pointer overflow-hidden">
        <canvas
          ref={canvasRef}
          width={840}
          height={480}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          className="max-w-full h-auto block"
        />

        {/* تولتیپ هدایت سیگنالی */}
        {hoveredPlanet && (
          <div className="absolute top-4 left-4 p-3.5 rounded-xl bg-[#0B0F19]/90 border border-[#00B4D8] text-left pointer-events-none backdrop-blur-md shadow-[0_0_20px_rgba(0,180,216,0.35)]">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredPlanet.color }} />
              {hoveredPlanet.name}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{hoveredPlanet.desc}</div>
            <div className="text-[10px] text-[#00B4D8] mt-2 font-bold flex items-center gap-1">
              CLICK TO INITIATE HYPERDRIVE FLIGHT 🚀
            </div>
          </div>
        )}
      </div>
    </div>
  );
};