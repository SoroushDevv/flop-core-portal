import React from "react";
import { Activity, Radio, Coins, Users } from "lucide-react";

export const MetricsBar: React.FC = () => {
  const metrics = [
    {
      value: "438,116",
      label: "Rooms Followed",
      detail: "Archive synced",
      icon: Radio,
      accent: "text-[#00B4D8]",
      border: "hover:border-[#00B4D8]/50",
    },
    {
      value: "42,614",
      label: "Rooms on Network",
      detail: "Active corridors",
      icon: Activity,
      accent: "text-[#FF9FFC]",
      border: "hover:border-[#FF9FFC]/50",
    },
    {
      value: "18.10B",
      label: "Max $FLOP Supply",
      detail: "Year 10 terminal",
      icon: Coins,
      accent: "text-white",
      border: "hover:border-slate-500",
    },
    {
      value: "1.20B",
      label: "Agent Airdrop Pool",
      detail: "6.6% genesis share",
      icon: Users,
      accent: "text-[#90E0EF]",
      border: "hover:border-[#90E0EF]/50",
    },
  ];

  return (
    <section className="my-10 font-mono relative z-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`p-5 rounded-xl bg-[#0B0F19]/90 border border-[#2F293A] ${item.border} transition-all duration-300 backdrop-blur-sm group`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  {item.detail}
                </span>
                <div className="p-1.5 rounded-lg bg-[#04060A] border border-[#1E293B]">
                  <Icon className={`w-4 h-4 ${item.accent}`} />
                </div>
              </div>

              <div className={`text-2xl font-extrabold tracking-tight ${item.accent}`}>
                {item.value}
              </div>

              <div className="text-xs text-slate-400 mt-1 uppercase">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};