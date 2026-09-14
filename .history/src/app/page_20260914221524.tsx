"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MetricsBar } from "@/components/sections/MetricsBar";
import { NeuralCore } from "@/components/visualizers/NeuralCore";
import styles from "@/components/sections/HeroSection.module.css";
import { botSpeak } from "@/lib/botUtils";

export default function HomePage() {
  const [inputDid, setInputDid] = useState("");
  const [resolvedDid, setResolvedDid] = useState<string | null>(null);

  const identityDimensions = [
    { text: "Acoustic Voice", color: "#00B4D8" },
    { text: "Lexical Genetics", color: "#90E0EF" },
    { text: "Neural Archetype", color: "#48CAE4" },
    { text: "Cybernetic Face", color: "#CAF0F8" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % identityDimensions.length);
        setIsFlipping(false);
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, [identityDimensions.length]);

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDid = inputDid.trim();
    if (cleanDid.startsWith("did:key:")) {
      setResolvedDid(cleanDid);
      if (typeof window !== "undefined") {
        localStorage.setItem("flop_active_did", cleanDid);
        window.dispatchEvent(new Event("storage"));
      }
      botSpeak(`Synthesized credentials for agent ${cleanDid.slice(0, 16)}...`, "success");
    } else {
      botSpeak("Invalid DID format! Public key must start with 'did:key:z6Mk...'", "error", 5000);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col justify-between font-mono">
      <GridScan />

      <div className="max-w-6xl mx-auto px-4 relative z-10 w-full">
        <Header />

        <section className={styles.heroWrapper}>
          <div className={styles.topPill}>
            <span className={styles.pillDot} />
            <span className={styles.pillText}>FLOP IDENTITY MESH · TECHNOCORE READY</span>
          </div>

          <div className={styles.logoGlowBox}>
            <Image
              src="/logo.png"
              alt="FlopCore Network Logo"
              width={76}
              height={76}
              className={styles.logoImage}
              priority
            />
          </div>

          <h1 className={styles.mainTitle}>
            <span>Give your autonomous agent a deep</span>
            <span className={styles.rotatorContainer}>
              <span
                style={{
                  color: identityDimensions[currentIndex].color,
                  transform: isFlipping ? "translateY(-100%)" : "translateY(0)",
                  opacity: isFlipping ? 0 : 1,
                }}
                className={styles.rotatorText}
              >
                {identityDimensions[currentIndex].text}
              </span>
            </span>
            <span>beyond a flat ID.</span>
          </h1>

          <p className={styles.subDescription}>
            Construct cryptographically verifiable identity passports, synthesize harmonic acoustic frequencies,
            and resolve strict Sonnet-2 lexical genetics directly from Ed25519 keyhashes.
          </p>

          <form onSubmit={handleResolve} className={styles.actionForm}>
            <input
              type="text"
              value={inputDid}
              onChange={(e) => setInputDid(e.target.value)}
              placeholder="Paste did:key:z6Mk... to issue credentials"
              className={styles.didInput}
            />
            <button type="submit" className={styles.synthesizeBtn}>
              <span>Synthesize</span>
            </button>
          </form>

          {resolvedDid && (
            <div className={styles.resolvedCard}>
              <NeuralCore did={resolvedDid} size={84} />
              <div>
                <div className="text-[10px] text-[#00B4D8] font-bold uppercase tracking-wider">
                  Synthesized Neural Core
                </div>
                <div className="text-xs text-white break-all my-1">{resolvedDid}</div>
                <div className="text-[10px] text-slate-400">
                  Ed25519 PoUI Validated · Identity Layer Active
                </div>
              </div>
            </div>
          )}
        </section>

        <MetricsBar />
        <Footer />
      </div>
    </main>
  );
}