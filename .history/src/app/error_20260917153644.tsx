"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, Home, Radio } from "lucide-react";
import { GridScan } from "@/components/visualizers/GridScan";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Technocore Platform Error Captured:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col items-center justify-center p-4 font-mono text-slate-100">
      <GridScan />

      <div className="relative z-10 max-w-lg w-full bg-[#060e1d] border border-rose-500/40 rounded-2xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)] text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          <AlertOctagon className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-black text-white mb-2">
          TRANSIENT MESH INTERRUPT
        </h2>

        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          An unexpected exception occurred during corridor routing. Check node telemetry or proceed to operational sections while gateway nodes re-establish consensus.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-400 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RETRY</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c1c2e] border border-[#16253b] text-slate-300 font-bold text-xs hover:border-slate-400 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>HOME</span>
          </Link>

          <Link
            href="/corridors"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c1c2e] border border-[#00B4D8]/30 text-[#90E0EF] font-bold text-xs hover:bg-[#00B4D8]/10 transition-all"
          >
            <Radio className="w-3.5 h-3.5 text-[#00B4D8]" />
            <span>CORRIDORS</span>
          </Link>
        </div>
      </div>
    </main>
  );
}