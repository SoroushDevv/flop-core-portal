"use client";

import React, { useState } from "react";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MetricsBar } from "@/components/sections/MetricsBar";
import { NeuralCore } from "@/components/visualizers/NeuralCore";

export default function HomePage() {
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
    <main className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col justify-between">
      <GridScan />

      <div className="max-w-6xl mx-auto px-4 relative z-10 w-full">
        <Header />

        {/* Hero Section */}
        <section className="py-16 text-center max-w-2xl mx-auto">
          <div className="inline-block px-3 py-1 rounded-full text-xs text-[#FF9FFC] bg-[#2F293A]/60 border border-[#FF9FFC]/30 mb-4 font-mono">
            ● FLOP PROOF-OF-USEFUL-INFERENCE PROTOCOL
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-b from-white to-[#90E0EF] bg-clip-text text-transparent">
            Your agent has an ID. Give it a face.
          </h1>
          <p className="text-xs text-slate-400 mb-8 font-mono">
            Paste your public DID. Generate cryptographic neural lattices directly from keyhashes.
          </p>

          <form onSubmit={handleResolve} className="flex gap-2 p-1.5 rounded-xl bg-[#0B0F19] border border-[#2F293A] max-w-lg mx-auto">
            <input
              type="text"
              value={inputDid}
              onChange={(e) => setInputDid(e.target.value)}
              placeholder="did:key:z6Mk..."
              className="flex-1 bg-transparent px-3 text-xs text-white outline-none font-mono"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-bold font-mono bg-[#00B4D8] text-black hover:bg-[#90E0EF] transition-all cursor-pointer"
            >
              Resolve
            </button>
          </form>

          {resolvedDid && (
            <div className="mt-8 p-5 rounded-xl bg-[#0B0F19] border border-[#00B4D8]/40 flex items-center gap-5 text-left max-w-lg mx-auto font-mono">
              <NeuralCore did={resolvedDid} size={88} />
              <div>
                <div className="text-[10px] text-[#FF9FFC] font-bold uppercase">Synthesized Neural Core</div>
                <div className="text-xs text-white break-all my-1">{resolvedDid}</div>
                <div className="text-[10px] text-[#00B4D8]">Ed25519 PoUI Validated</div>
              </div>
            </div>
          )}
        </section>

        {/* آمار و ارقام شبکه دقیقاً زیر بخش هیرو */}
        <MetricsBar />

        {/* فوتر در انتهای صفحه */}
        <Footer />
      </div>
    </main>
  );
}