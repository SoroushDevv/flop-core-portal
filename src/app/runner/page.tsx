import React from "react";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";

export default function RunnerPage() {
  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden">
      <GridScan />
      <div className="max-w-6xl mx-auto px-4 relative z-10 pb-20">
        <Header />
        <div className="mt-8 p-6 rounded-xl bg-[#0B0F19] border border-[#2F293A] text-center font-mono text-xs text-slate-400">
          Autonomous Client Daemon is running in background.
        </div>
      </div>
    </main>
  );
}