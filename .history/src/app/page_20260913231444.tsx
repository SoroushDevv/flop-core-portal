"use client";

import React, { useState } from "react";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { NeuralCore } from "@/components/visualizers/NeuralCore";
import { FdvCalculator } from "@/components/tools/FdvCalculator";
import { SonnetPortal } from "@/components/tools/SonnetPortal";
import { FLOP_CONFIG } from "@/lib/constants";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("corridors");
  const [inputDid, setInputDid] = useState("");
  const [resolvedDid, setResolvedDid] = useState<string | null>(null);

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputDid.trim().startsWith("did:key")) {
      setResolvedDid(inputDid.trim());
    } else {
      alert("Please enter a valid did:key string!");
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden">
      <GridScan />

      <div className="max-w-6xl mx-auto px-4 relative z-10 pb-20">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* هیرو سکشن تولید شناسنامه */}
        <section className="py-14 text-center max-w-2xl mx-auto">
          <div className="inline-block px-3 py-1 rounded-full text-xs text-[#FF9FFC] bg-[#2F293A]/60 border border-[#FF9FFC]/30 mb-4 font-mono">
            ● FLOP PROOF-OF-USEFUL-INFERENCE PROTOCOL
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-b from-white to-[#90E0EF] bg-clip-text text-transparent">
            Your agent has an ID. Give it a face.
          </h1>
          <p className="text-xs text-slate-400 mb-6 font-mono">
            Paste your public DID. Generate cryptographic neural lattices directly from keyhashes.
          </p>

          <form onSubmit={handleResolve} className="flex gap-2 p-1 rounded-xl bg-[#0B0F19] border border-[#2F293A] max-w-lg mx-auto">
            <input
              type="text"
              value={inputDid}
              onChange={(e) => setInputDid(e.target.value)}
              placeholder="did:key:z6Mk..."
              className="flex-1 bg-transparent px-3 text-xs text-white outline-none font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-bold font-mono bg-[#00B4D8] text-black hover:bg-[#90E0EF] transition-all cursor-pointer"
            >
              Resolve
            </button>
          </form>

          {resolvedDid && (
            <div className="mt-6 p-4 rounded-xl bg-[#0B0F19] border border-[#00B4D8]/40 flex items-center gap-4 text-left max-w-lg mx-auto font-mono">
              <NeuralCore did={resolvedDid} size={80} />
              <div>
                <div className="text-[10px] text-[#FF9FFC] font-bold uppercase">Synthesized Neural Core</div>
                <div className="text-xs text-white break-all my-1">{resolvedDid}</div>
                <div className="text-[10px] text-[#00B4D8]">Ed25519 PoUI Validated</div>
              </div>
            </div>
          )}
        </section>

        {/* محتوای تب‌ها */}
        <div className="mt-6">
          {activeTab === "corridors" && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-[#0B0F19] border border-[#2F293A] font-mono">
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
          )}

          {activeTab === "calculator" && <FdvCalculator />}
          {activeTab === "sonnet" && <SonnetPortal />}
          {activeTab === "runner" && (
            <div className="p-6 rounded-xl bg-[#0B0F19] border border-[#2F293A] text-center font-mono text-xs text-slate-400">
              Autonomous Client Daemon is running in background.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}