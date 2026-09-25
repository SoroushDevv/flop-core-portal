"use client";

import React, { useState, useEffect } from "react";
import { botState, BotEvent, BotMessagePayload } from "@/lib/botUtils";
import { MessageSquare, Bot } from "lucide-react";

export const CyberBotAssistant: React.FC = () => {
  const [activeMessage, setActiveMessage] = useState<BotMessagePayload | null>(null);

  useEffect(() => {
    const unsub = botState.subscribe((event: BotEvent | null) => {
      setActiveMessage(event);
    });
    return unsub;
  }, []);

  if (!activeMessage) return null;

  return (
    <aside aria-label="Cybernetic Bot Assistant" className="fixed bottom-4 left-4 z-40 max-w-sm pointer-events-none font-mono">
      <div className="bg-[#040813]/90 border border-[#00B4D8]/40 rounded-xl p-3 shadow-[0_0_20px_rgba(0,180,216,0.2)] flex items-center gap-2.5">
        <Bot className="w-4 h-4 text-[#00B4D8] flex-shrink-0 animate-pulse" />
        <span className="text-[11px] text-slate-300 truncate">
          {activeMessage.text}
        </span>
      </div>
    </aside>
  );
};