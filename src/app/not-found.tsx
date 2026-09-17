import React from "react";
import Link from "next/link";
import { AlertTriangle, Radio, Compass, Home } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GridScan } from "@/components/visualizers/GridScan";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col justify-between font-mono text-slate-100">
      <GridScan />

      <div className="max-w-5xl mx-auto px-4 relative z-10 w-full pb-16">
        <Header />

        <div className="mt-16 flex flex-col items-center text-center">
          {/* Cyber Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <AlertTriangle className="w-4 h-4" />
            <span>SECTOR TEMPORARILY OFFLINE · 404</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            MODULE NOT FOUND OR <span className="text-[#00B4D8]">UNDER CALIBRATION</span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed mb-8">
            This route has not been indexed by the Technocore registry or telemetry endpoints are being synchronized. Explore active live corridors and operational modules while telemetry stabilizes.
          </p>

          {/* Action Links */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00B4D8] text-[#020612] font-black text-xs hover:bg-[#90E0EF] transition-all shadow-[0_0_20px_rgba(0,180,216,0.35)]"
            >
              <Home className="w-4 h-4" />
              <span>HOME PORTAL</span>
            </Link>

            <Link
              href="/corridors"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0c1c2e] border border-[#00B4D8]/40 text-[#90E0EF] font-bold text-xs hover:bg-[#00B4D8]/10 transition-all"
            >
              <Radio className="w-4 h-4 text-[#00B4D8]" />
              <span>ACTIVE CORRIDORS</span>
            </Link>

            <Link
              href="/academy"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0c1c2e] border border-[#16253b] text-slate-300 font-bold text-xs hover:border-slate-400 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>TECHNOCORE ACADEMY</span>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}