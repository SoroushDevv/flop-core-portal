"use client";

import React from "react";
import { Cpu } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: "corridors", label: "CORRIDORS" },
    { id: "calculator", label: "$FLOP CALCULATOR" },
    { id: "sonnet", label: "100K SONNET" },
    { id: "runner", label: "AGENT RUNNER" },
  ];

  return (
    <header className="flex flex-col md:flex-row items-center justify-between py-6 border-b border-[#2F293A] relative z-20 gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#0B0F19] border border-[#00B4D8]/30 shadow-[0_0_15px_rgba(0,180,216,0.3)]">
          <Cpu className="w-5 h-5 text-[#00B4D8]" />
        </div>
        <div className="text-xl font-bold font-mono tracking-wider">
          FLOP<span className="text-[#00B4D8]">CORE</span>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono transition-all border ${
              activeTab === item.id
                ? "bg-[#00B4D8]/10 text-[#00B4D8] border-[#00B4D8] shadow-[0_0_12px_rgba(0,180,216,0.3)]"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-[#2F293A]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
};