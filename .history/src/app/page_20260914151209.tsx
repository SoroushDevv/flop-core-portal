"use client";

import React, { useState, useEffect } from "react";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MetricsBar } from "@/components/sections/MetricsBar";
import { NeuralCore } from "@/components/visualizers/NeuralCore";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  const [inputDid, setInputDid] = useState("");
  const [resolvedDid, setResolvedDid] = useState<string | null>(null);

  // چرخش نوبتی هویت‌ها به صورت عمودی (عمودی بالا رونده)
  const identityDimensions = [
    { text: "Acoustic Voice", color: "text-[#00B4D8]" },
    { text: "Lexical Genetics", color: "text-[#FF9FFC]" },
    { text: "Neural Archetype", color: "text-[#90E0EF]" },
    { text: "Cybernetic Face", color: "text-[#38BDF8]" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % identityDimensions.length);
        setIsFlipping(false);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, [identityDimensions.length]);

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputDid.trim().startsWith("did:key")) {
      setResolvedDid(inputDid.trim());
    } else {
      alert("Please enter a valid did:key string!");
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col justify-between font-mono">
      <GridScan />

      <div className="max-w-6xl mx-auto px-4 relative z-10 w-full">
        <Header />

        {/* هیرو سکشن با انیمیشن چرخان عمودی */}
        <section className="py-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs text-[#FF9FFC] bg-[#2F293A]/60 border border-[#FF9FFC]/30 mb-6 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FLOP MULTI-DIMENSIONAL IDENTITY ARCHITECTURE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4 text-white">
            Give your autonomous agent a deep
            <span className="inline-block h-[1.3em] overflow-hidden align-bottom mx-2">
              <span
                className={`inline-block transition-transform duration-400 ease-in-out ${
                  isFlipping ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
                } ${identityDimensions[currentIndex].color}`}
              >
                {identityDimensions[currentIndex].text}
              </span>
            </span>
            beyond a flat ID.
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed font-mono">
            More than just an image. We synthesize cryptographic sound frequencies,
            strict Sonnet character genetics, and verifiable proof-of-inference lattices.
          </p>

          <form onSubmit={handleResolve} className="flex gap-2 p-1.5 rounded-xl bg-[#0B0F19] border border-[#2F293A] max-w-lg mx-auto shadow-[0_0_25px_rgba(0,180,216,0.15)]">
            <input
              type="text"
              value={inputDid}
              onChange={(e) => setInputDid(e.target.value)}
              placeholder="Paste did:key:z6Mk... to issue credentials"
              className="flex-1 bg-transparent px-3 text-xs text-white outline-none font-mono"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-xs font-bold font-mono bg-[#00B4D8] text-black hover:bg-[#90E0EF] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,180,216,0.3)]"
            >
              Synthesize
            </button>
          </form>

          {resolvedDid && (
            <div className="mt-8 p-5 rounded-xl bg-[#0B0F19] border border-[#00B4D8]/40 flex items-center gap-5 text-left max-w-lg mx-auto font-mono shadow-[0_0_20px_rgba(0,180,216,0.25)]">
              <NeuralCore did={resolvedDid} size={88} />
              <div>
                <div className="text-[10px] text-[#FF9FFC] font-bold uppercase">Synthesized Neural Core</div>
                <div className="text-xs text-white break-all my-1">{resolvedDid}</div>
                <div className="text-[10px] text-[#00B4D8]">Ed25519 PoUI Validated · Identity Layer Active</div>
              </div>
            </div>
          )}
        </section>

        {/* آمار و ارقام دقیقاً زیر بخش هیرو */}
        <MetricsBar />

        {/* فوتر */}
        <Footer />
      </div>
    </main>
  );
}