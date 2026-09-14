// "use client";

// import React, { useState, useEffect } from "react";
// import { GridScan } from "@/components/visualizers/GridScan";
// import { Header } from "@/components/layout/Header";
// import { Footer } from "@/components/layout/Footer";
// import { MetricsBar } from "@/components/sections/MetricsBar";
// import { NeuralCore } from "@/components/visualizers/NeuralCore";
// import { Sparkles } from "lucide-react";

// export default function HomePage() {
//   const [inputDid, setInputDid] = useState("");
//   const [resolvedDid, setResolvedDid] = useState<string | null>(null);

//   const identityDimensions = [
//     { text: "Acoustic Voice", color: "text-[#00B4D8]" },
//     { text: "Lexical Genetics", color: "text-[#90E0EF]" },
//     { text: "Neural Archetype", color: "text-[#CAF0F8]" },
//     { text: "Cybernetic Face", color: "text-[#48CAE4]" },
//   ];

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isFlipping, setIsFlipping] = useState(false);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setIsFlipping(true);
//       setTimeout(() => {
//         setCurrentIndex((prev) => (prev + 1) % identityDimensions.length);
//         setIsFlipping(false);
//       }, 350);
//     }, 2800);
//     return () => clearInterval(interval);
//   }, [identityDimensions.length]);

//   const handleResolve = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (inputDid.trim().startsWith("did:key")) {
//       setResolvedDid(inputDid.trim());
//     } else {
//       alert("Please enter a valid did:key string!");
//     }
//   };

//   return (
//     <main className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col justify-between font-mono">
//       <GridScan />

//       <div className="max-w-6xl mx-auto px-4 relative z-10 w-full">
//         <Header />

//         <section className="py-16 text-center max-w-4xl mx-auto">
//           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs text-[#00B4D8] bg-[#00B4D8]/10 border border-[#00B4D8]/30 mb-6">
//             <Sparkles className="w-3.5 h-3.5 text-[#00B4D8]" />
//             <span>FLOP MULTI-DIMENSIONAL IDENTITY ARCHITECTURE</span>
//           </div>

//           {/* Heading with space separation and nowrap container */}
//           <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-normal mb-4 text-white flex flex-wrap items-center justify-center gap-x-2.5">
//             <span>Give your autonomous agent a deep</span>
//             <span className="inline-flex h-[1.3em] overflow-hidden items-center">
//               <span
//                 className={`inline-block whitespace-nowrap transition-transform duration-300 ease-in-out ${
//                   isFlipping ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
//                 } ${identityDimensions[currentIndex].color}`}
//               >
//                 {identityDimensions[currentIndex].text}
//               </span>
//             </span>
//             <span>beyond a flat ID.</span>
//           </h1>

//           <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
//             More than just an image. We synthesize cryptographic sound frequencies,
//             strict Sonnet character genetics, and verifiable proof-of-inference lattices.
//           </p>

//           <form
//             onSubmit={handleResolve}
//             className="flex gap-2 p-1.5 rounded-xl bg-[#0B0F19] border border-[#162238] max-w-lg mx-auto shadow-[0_0_25px_rgba(0,180,216,0.15)]"
//           >
//             <input
//               type="text"
//               value={inputDid}
//               onChange={(e) => setInputDid(e.target.value)}
//               placeholder="Paste did:key:z6Mk... to issue credentials"
//               className="flex-1 bg-transparent px-3 text-xs text-white outline-none"
//             />
//             <button
//               type="submit"
//               className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#00B4D8] text-black hover:bg-[#90E0EF] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,180,216,0.3)]"
//             >
//               Synthesize
//             </button>
//           </form>

//           {resolvedDid && (
//             <div className="mt-8 p-5 rounded-xl bg-[#0B0F19] border border-[#00B4D8]/40 flex items-center gap-5 text-left max-w-lg mx-auto shadow-[0_0_20px_rgba(0,180,216,0.25)]">
//               <NeuralCore did={resolvedDid} size={88} />
//               <div>
//                 <div className="text-[10px] text-[#90E0EF] font-bold uppercase">Synthesized Neural Core</div>
//                 <div className="text-xs text-white break-all my-1">{resolvedDid}</div>
//                 <div className="text-[10px] text-[#00B4D8]">Ed25519 PoUI Validated · Identity Layer Active</div>
//               </div>
//             </div>
//           )}
//         </section>

//         <MetricsBar />
//         <Footer />
//       </div>
//     </main>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MetricsBar } from "@/components/sections/MetricsBar";
import { NeuralCore } from "@/components/visualizers/NeuralCore";
import styles from "@/components/sections/HeroSection.module.css";
import { Sparkles, ArrowRight } from "lucide-react";

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

        {/* Modern Cyberpunk Hero Section */}
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