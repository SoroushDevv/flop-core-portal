import React from "react";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { FLOP_CONFIG } from "@/lib/constants";
import { FlopUniverse } from "@/components/visualizers/FlopUniverse";
import { Footer } from "@/components/layout/Footer";

export default function CorridorsPage() {
  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden">
      <GridScan />
      <div className="max-w-6xl mx-auto px-4 relative z-10 pb-20">
        <Header />
        
        <div className="mt-8 space-y-6 font-mono">
          <div className="p-5 rounded-xl bg-[#0B0F19] border border-[#2F293A]">
            <div className="flex justify-between items-center border-b border-[#2F293A] pb-3 mb-4">
              <div className="text-xs text-[#00B4D8] font-bold">TECHNOCORE AUTONOMOUS HOST AGENT</div>
              <span className="text-[10px] px-2 py-0.5 rounded border border-[#00B4D8] text-[#00B4D8]">ONLINE</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#04060A] rounded border border-[#161C28]">
                <span className="text-slate-500 block text-[10px]">HOST DID</span>
                <span className="text-slate-300 break-all">{FLOP_CONFIG.HOST_DID.slice(0, 24)}...</span>
              </div>
              <div className="p-3 bg-[#04060A] rounded border border-[#161C28]">
                <span className="text-slate-500 block text-[10px]">CONTEST REGISTRATION</span>
                <span className="text-[#00B4D8]">REGISTERED (@{FLOP_CONFIG.TWITTER_HANDLE})</span>
              </div>
              <div className="p-3 bg-[#04060A] rounded border border-[#161C28]">
                <span className="text-slate-500 block text-[10px]">RECEIPT STATUS</span>
                <span className="text-[#FF9FFC]">ACCEPTED (VERIFIED)</span>
              </div>
            </div>
          </div>
        </div>
        <FlopUniverse />
      </div>
      <Footer/>
    </main>
  );
}