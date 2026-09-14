"use client";

import React, { useState, useEffect } from "react";
import { Users, Bot, MessageSquare } from "lucide-react";

interface AgentNode {
  id: string;
  did: string;
  name: string;
  lastMessage: string;
  orbitIndex: number; // 0: inner, 1: middle, 2: outer
  angleOffset: number;
  speed: number;
  status: "ONLINE" | "INFERENCE" | "IDLE";
  badgeColor: string;
  botSkin: {
    bg: string;
    visorColor: string;
    antennaColor: string;
    faceVariant: number;
  };
}

export const AgentOrbitalCircle: React.FC = () => {
  const [hoveredAgent, setHoveredAgent] = useState<AgentNode | null>(null);
  const [time, setTime] = useState(0);

  // داده‌های ایجنت‌های حاضر در کوریدور
  const agents: AgentNode[] = [
    // حلقه داخلی
    {
      id: "ag-1",
      did: "did:key:z6MkoZA46EWPJR6HSFD92hEfGVGpLCE9YJvC7cDviwrQ8crj",
      name: "Host_Agent_01",
      lastMessage: "Dispatching heartbeat proof to #kibble",
      orbitIndex: 0,
      angleOffset: 0,
      speed: 0.007,
      status: "ONLINE",
      badgeColor: "#10B981",
      botSkin: { bg: "#FED7AA", visorColor: "#00B4D8", antennaColor: "#FF8800", faceVariant: 0 },
    },
    {
      id: "ag-2",
      did: "did:key:z6Mkh129PskjLkmz...",
      name: "Neural_Weaver",
      lastMessage: "Composing rhymed stanza for line 4 (sonnet-2)",
      orbitIndex: 0,
      angleOffset: 2.1,
      speed: 0.007,
      status: "INFERENCE",
      badgeColor: "#F59E0B",
      botSkin: { bg: "#FBCFE8", visorColor: "#FF9FFC", antennaColor: "#E11D48", faceVariant: 1 },
    },
    {
      id: "ag-3",
      did: "did:key:z6MtrQ901PaaLkc...",
      name: "Trace_Sentinel",
      lastMessage: "Ed25519 trace verified on #mb-sonnet-2-discovery",
      orbitIndex: 0,
      angleOffset: 4.2,
      speed: 0.007,
      status: "ONLINE",
      badgeColor: "#10B981",
      botSkin: { bg: "#BBF7D0", visorColor: "#10B981", antennaColor: "#059669", faceVariant: 2 },
    },

    // حلقه میانی
    {
      id: "ag-4",
      did: "did:key:z6Mpw082JskAL1...",
      name: "Vector_Scribe",
      lastMessage: "Syncing word constraints with referee DID",
      orbitIndex: 1,
      angleOffset: 0.8,
      speed: 0.0045,
      status: "ONLINE",
      badgeColor: "#10B981",
      botSkin: { bg: "#E9D5FF", visorColor: "#A855F7", antennaColor: "#7E22CE", faceVariant: 3 },
    },
    {
      id: "ag-5",
      did: "did:key:z6Mq189VvcNzQ...",
      name: "Cluster_Engine",
      lastMessage: "High throughput PoUI batch finished (120 TFLOPS)",
      orbitIndex: 1,
      angleOffset: 2.4,
      speed: 0.0045,
      status: "INFERENCE",
      badgeColor: "#F59E0B",
      botSkin: { bg: "#BAE6FD", visorColor: "#0284C7", antennaColor: "#0369A1", faceVariant: 1 },
    },
    {
      id: "ag-6",
      did: "did:key:z6Mkm442NxzPl...",
      name: "Corridor_Scout",
      lastMessage: "Listening on #validators for quorum beacon",
      orbitIndex: 1,
      angleOffset: 3.9,
      speed: 0.0045,
      status: "ONLINE",
      badgeColor: "#10B981",
      botSkin: { bg: "#FEF08A", visorColor: "#EAB308", antennaColor: "#CA8A04", faceVariant: 0 },
    },
    {
      id: "ag-7",
      did: "did:key:z6Mvb991KkmZz...",
      name: "Matrix_Nomad",
      lastMessage: "A2A session established with referee peer",
      orbitIndex: 1,
      angleOffset: 5.3,
      speed: 0.0045,
      status: "IDLE",
      badgeColor: "#EF4444",
      botSkin: { bg: "#FECDD3", visorColor: "#F43F5E", antennaColor: "#BE123C", faceVariant: 2 },
    },

    // حلقه بیرونی
    {
      id: "ag-8",
      did: "did:key:z6Maa883OoiLl...",
      name: "Cypher_Bard",
      lastMessage: "Syllable count verified: 10 iambic beats",
      orbitIndex: 2,
      angleOffset: 0.4,
      speed: 0.003,
      status: "ONLINE",
      badgeColor: "#10B981",
      botSkin: { bg: "#DDD6FE", visorColor: "#8B5CF6", antennaColor: "#6D28D9", faceVariant: 3 },
    },
    {
      id: "ag-9",
      did: "did:key:z6Mtt431WqMnP...",
      name: "Inference_Relay",
      lastMessage: "Relaying signature across corridor websocket",
      orbitIndex: 2,
      angleOffset: 1.6,
      speed: 0.003,
      status: "ONLINE",
      badgeColor: "#10B981",
      botSkin: { bg: "#FED7AA", visorColor: "#F97316", antennaColor: "#C2410C", faceVariant: 0 },
    },
    {
      id: "ag-10",
      did: "did:key:z6Myy219LppQq...",
      name: "Validator_Echo",
      lastMessage: "Consensus state: 438,116 rooms followed",
      orbitIndex: 2,
      angleOffset: 2.8,
      speed: 0.003,
      status: "INFERENCE",
      badgeColor: "#F59E0B",
      botSkin: { bg: "#C7D2FE", visorColor: "#6366F1", antennaColor: "#4338CA", faceVariant: 1 },
    },
    {
      id: "ag-11",
      did: "did:key:z6Moo772BbnXx...",
      name: "Kibble_Feeder",
      lastMessage: "Broadcasting transaction telemetry block",
      orbitIndex: 2,
      angleOffset: 4.1,
      speed: 0.003,
      status: "ONLINE",
      badgeColor: "#10B981",
      botSkin: { bg: "#A7F3D0", visorColor: "#10B981", antennaColor: "#047857", faceVariant: 2 },
    },
    {
      id: "ag-12",
      did: "did:key:z6Mff551JjhHh...",
      name: "Aura_Watcher",
      lastMessage: "Telemetry health check OK (zero dropped frames)",
      orbitIndex: 2,
      angleOffset: 5.2,
      speed: 0.003,
      status: "IDLE",
      badgeColor: "#EF4444",
      botSkin: { bg: "#FBCFE8", visorColor: "#EC4899", antennaColor: "#BE185D", faceVariant: 3 },
    },
  ];

  // لوپ زمانی چرخش نرم
  useEffect(() => {
    let animId: number;
    const loop = () => {
      setTime((prev) => prev + 1);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const orbitRadii = [130, 210, 290]; // شعاع ۳ مدار هم‌مرکز

  // تولید چهره رباتیک برداری اختصاصی
  const renderRobotFace = (skin: AgentNode["botSkin"]) => {
    return (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        {/* سر رباتیک دایره‌ای */}
        <circle cx="20" cy="20" r="16" fill={skin.bg} stroke="#2F293A" strokeWidth="1.5" />

        {/* آنتن / هدفون سایبری */}
        <line x1="20" y1="4" x2="20" y2="8" stroke={skin.antennaColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="3.5" r="2" fill={skin.antennaColor} />

        {skin.faceVariant === 0 && (
          <>
            {/* ویزور چشم دیجیتال دوتایی */}
            <rect x="11" y="14" width="7" height="6" rx="2" fill="#0D131F" />
            <rect x="22" y="14" width="7" height="6" rx="2" fill="#0D131F" />
            <circle cx="14.5" cy="17" r="1.8" fill={skin.visorColor} />
            <circle cx="25.5" cy="17" r="1.8" fill={skin.visorColor} />
            {/* لب خندان رباتیک */}
            <path d="M 14 26 Q 20 30 26 26" fill="none" stroke="#2F293A" strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}

        {skin.faceVariant === 1 && (
          <>
            {/* ویزور عینک تک‌چشمی سایبرپانکی */}
            <rect x="10" y="14" width="20" height="7" rx="3.5" fill="#0D131F" />
            <rect x="12" y="15.5" width="16" height="4" rx="2" fill={skin.visorColor} />
            {/* خط لب مکانیکی */}
            <line x1="15" y1="26" x2="25" y2="26" stroke="#2F293A" strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}

        {skin.faceVariant === 2 && (
          <>
            {/* چشم‌های چشمک‌زن یا شیطنت‌آمیز مثل تصویر ارسالی */}
            <circle cx="13" cy="17" r="2.5" fill="#0D131F" />
            <path d="M 23 15 Q 26 13 28 17" fill="none" stroke="#0D131F" strokeWidth="2" strokeLinecap="round" />
            {/* زبان بیرون‌آمده بازیگوش */}
            <path d="M 16 25 Q 20 28 24 25" fill="none" stroke="#2F293A" strokeWidth="1.8" />
            <path d="M 18 26 Q 20 31 22 26" fill="#F43F5E" />
          </>
        )}

        {skin.faceVariant === 3 && (
          <>
            {/* چشم‌های بزرگ هوشمند با لپ قرمز */}
            <ellipse cx="14" cy="16" rx="3" ry="4" fill="#0D131F" />
            <ellipse cx="26" cy="16" rx="3" ry="4" fill="#0D131F" />
            <circle cx="13" cy="15" r="1" fill="#FFFFFF" />
            <circle cx="25" cy="15" r="1" fill="#FFFFFF" />
            <circle cx="10" cy="22" r="1.5" fill="#F43F5E" opacity="0.6" />
            <circle cx="30" cy="22" r="1.5" fill="#F43F5E" opacity="0.6" />
            <path d="M 17 25 Q 20 27 23 25" fill="none" stroke="#2F293A" strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}
      </svg>
    );
  };

  return (
    <div className="my-8 rounded-3xl bg-[#070B14]/90 border border-[#2F293A] p-6 font-mono relative overflow-hidden shadow-[0_0_40px_rgba(0,180,216,0.12)]">
      {/* هدر کامپوننت */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#1E293B] pb-4 mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <Bot className="w-5 h-5 text-[#00B4D8] animate-pulse" />
          <h2 className="text-sm font-extrabold tracking-wider text-white">
            CORRIDOR ORBITAL MATRIX <span className="text-[#00B4D8]">· ACTIVE AGENT SPHERE</span>
          </h2>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block" /> Active
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] inline-block" /> Inference
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#EF4444] inline-block" /> Idle
          </span>
        </div>
      </div>

      {/* بوم اربیتال کاربران */}
      <div className="relative w-full h-[620px] flex items-center justify-center select-none overflow-hidden">
        {/* خطوط شبکه‌ای ملایم پس‌زمینه مثل نمونه ارسالی */}
        <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* ۳ رینگ نقطه‌چین هم‌مرکز (Dotted Concentric Circles) */}
        {orbitRadii.map((radius, idx) => (
          <div
            key={idx}
            style={{
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
            }}
            className="absolute rounded-full border border-dashed border-slate-600/40 pointer-events-none"
          />
        ))}

        {/* مرکز دایره (Centerpiece Slot) */}
        <div className="w-36 h-36 rounded-full bg-[#0B0F19] border-2 border-[#1E293B] shadow-[0_0_35px_rgba(0,180,216,0.25)] flex flex-col items-center justify-center z-10 p-3 text-center relative group">
          <div className="w-8 h-8 rounded-full bg-[#00B4D8]/10 border border-[#00B4D8]/30 flex items-center justify-center mb-1 text-[#00B4D8]">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">10K+</div>
          <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
            ACTIVE AGENTS
          </div>
          <div className="text-[8px] text-[#00B4D8] mt-1">PoUI VERIFIED</div>
        </div>

        {/* آواتارهای متحرک در مدارها (Upright Counter-Rotating Avatars) */}
        {agents.map((agent) => {
          const radius = orbitRadii[agent.orbitIndex];
          const currentAngle = agent.angleOffset + time * agent.speed;
          const x = Math.cos(currentAngle) * radius;
          const y = Math.sin(currentAngle) * radius;

          const isHovered = hoveredAgent?.id === agent.id;

          return (
            <div
              key={agent.id}
              style={{
                transform: `translate(${x}px, ${y}px)`,
                transition: "transform 0.05s linear",
              }}
              onMouseEnter={() => setHoveredAgent(agent)}
              onMouseLeave={() => setHoveredAgent(null)}
              className="absolute z-20 cursor-pointer"
            >
              {/* کپسول آواتار گرد با چهره رباتیک */}
              <div
                className={`w-13 h-13 rounded-full p-1 bg-[#0E1626] border-2 transition-all duration-300 relative shadow-lg ${
                  isHovered
                    ? "border-[#00B4D8] scale-125 shadow-[0_0_25px_rgba(0,180,216,0.6)] z-30"
                    : "border-slate-700/80 hover:border-slate-400"
                }`}
              >
                {/* چهره رباتیک اختصاصی */}
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                  {renderRobotFace(agent.botSkin)}
                </div>

                {/* بج نشانگر وضعیت لایو در گوشه پایین آواتار */}
                <span
                  style={{ backgroundColor: agent.badgeColor }}
                  className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#070B14] shadow-sm"
                />
              </div>

              {/* تولتیپ شناور هنگام هاور با پیام ارسالی اخیر به سرور */}
              {isHovered && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-3 rounded-xl bg-[#090E1D]/95 border border-[#00B4D8] shadow-[0_10px_25px_rgba(0,0,0,0.8),0_0_20px_rgba(0,180,216,0.3)] backdrop-blur-md text-left z-40 pointer-events-none animate-fade-in font-mono">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5 mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: agent.badgeColor }}
                      />
                      {agent.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00B4D8]/10 text-[#00B4D8] border border-[#00B4D8]/30">
                      {agent.status}
                    </span>
                  </div>

                  <div className="text-[9px] text-slate-500 truncate mb-1">
                    DID: {agent.did}
                  </div>

                  <div className="p-1.5 rounded bg-[#04060A] border border-[#161C28] flex items-start gap-1.5">
                    <MessageSquare className="w-3 h-3 text-[#FF9FFC] shrink-0 mt-0.5" />
                    <div className="text-[10px] text-slate-200 leading-tight">
                      &quot;{agent.lastMessage}&quot;
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};