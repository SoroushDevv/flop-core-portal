"use client";

import React, { useState, useEffect } from "react";
import { botState, BotEvent } from "@/lib/botUtils";
import { AlertCircle, CheckCircle2, Info, Copy, Check } from "lucide-react";

export const AgentOrbitalBot: React.FC = () => {
  const [currentEvent, setCurrentEvent] = useState<BotEvent | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const unsub = botState.subscribe((event) => {
      setCurrentEvent(event);
      setCopied(false);
    });
    return unsub;
  }, []);

  if (!currentEvent) return null;

  const handleCopyError = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentEvent.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBorderColor = () => {
    if (currentEvent.type === "error") return "border-rose-500/70 shadow-[0_0_35px_rgba(244,63,94,0.3)]";
    if (currentEvent.type === "success") return "border-emerald-500/70 shadow-[0_0_35px_rgba(16,185,129,0.3)]";
    return "border-[#00B4D8]/70 shadow-[0_0_35px_rgba(0,180,216,0.3)]";
  };

  const getIcon = () => {
    if (currentEvent.type === "error") return <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />;
    if (currentEvent.type === "success") return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
    return <Info className="w-4 h-4 text-[#00B4D8] flex-shrink-0" />;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] pointer-events-auto">
      <div
        className={`bg-[#060e1d]/95 backdrop-blur-md border rounded-2xl p-4 flex flex-col gap-2 font-mono text-xs select-text ${getBorderColor()}`}
        style={{ userSelect: "text", WebkitUserSelect: "text" }}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="font-extrabold uppercase tracking-wider text-slate-200">
              {currentEvent.type === "error" ? "TRANSACTION FAILED" : "MESH TELEMETRY"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyError}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] transition-all cursor-pointer"
            title="Copy message to clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "COPIED" : "COPY"}</span>
          </button>
        </div>

        {/* The error message is fully selectable and copyable */}
        <div
          className="text-slate-300 leading-relaxed font-mono whitespace-pre-wrap break-words select-text cursor-text"
          style={{ userSelect: "text", WebkitUserSelect: "text" }}
        >
          {currentEvent.text}
        </div>
      </div>
    </div>
  );
};