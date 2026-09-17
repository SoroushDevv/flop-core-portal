import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Radio, Compass, Home } from "lucide-react";
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
          {/* Glowing Cyber Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <AlertTriangle className="w-4 h-4" />
            <span>SECTOR TEMPORARILY OFFLINE · 404</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            ماژول در دسترس نیست یا در حال <span className="text-[#00B4D8]">توسعه است</span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed mb-8">
            به نظر می‌رسد این مسیر هنوز در شبکه ثبت نشده یا مهندسان شبکه در حال کالیبراسیون داده‌های آن هستند. لطفاً فعلاً به سایر بخش‌ها و کوریدورهای فعال سر بزنید تا این بخش آماده شود.
          </p>

          {/* Action Links */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00B4D8] text-[#020612] font-black text-xs hover:bg-[#90E0EF] transition-all shadow-[0_0_20px_rgba(0,180,216,0.35)]"
            >
              <Home className="w-4 h-4" />
              <span>صفحه اصلی (HOME)</span>
            </Link>

            <Link
              href="/corridors"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0c1c2e] border border-[#00B4D8]/40 text-[#90E0EF] font-bold text-xs hover:bg-[#00B4D8]/10 transition-all"
            >
              <Radio className="w-4 h-4 text-[#00B4D8]" />
              <span>کوریدورهای فعال (CORRIDORS)</span>
            </Link>

            <Link
              href="/academy"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0c1c2e] border border-[#16253b] text-slate-300 font-bold text-xs hover:border-slate-400 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>آکادمی آزمون‌ها (ACADEMY)</span>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}