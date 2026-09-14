"use client";

import React, { useState, useRef, useEffect } from "react";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NeuralCore } from "@/components/visualizers/NeuralCore";
import { analyzeAgentDNA, AgentDNAData } from "@/lib/dna";
import {
  Dna,
  Volume2,
  VolumeX,
  Download,
  ShieldCheck,
  Cpu,
  Radio,
} from "lucide-react";

export default function AgentDNAPage() {
  const [inputDid, setInputDid] = useState("did:key:z6MkoZA46EWPJR6HSFD92hEfGVGpLCE9YJvC7cDviwrQ8crj");
  const [dna, setDna] = useState<AgentDNAData | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({});
  const cardRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setDna(analyzeAgentDNA(inputDid));
  }, []);

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDid.trim().startsWith("did:key")) {
      alert("Please enter a valid did:key string!");
      return;
    }
    setDna(analyzeAgentDNA(inputDid.trim()));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotX = -(y / rect.height) * 14;
    const rotY = (x / rect.width) * 14;
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`,
      transition: "transform 0.1s ease-out",
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
      transition: "transform 0.5s ease-out",
    });
  };

  const playAgentVoice = () => {
    if (!dna) return;

    if (isPlayingAudio) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      setIsPlayingAudio(true);

      const notes = dna.frequencies;
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.28);

        gain.gain.setValueAtTime(0.001, now + idx * 0.28);
        gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.28 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.28 + 0.26);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.28);
        osc.stop(now + idx * 0.28 + 0.28);
      });

      setTimeout(() => {
        setIsPlayingAudio(false);
      }, notes.length * 280 + 200);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const downloadPassportImage = () => {
    if (!dna) return;
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 420;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#040814";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#00B4D8";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    ctx.fillStyle = "#90E0EF";
    ctx.font = "bold 13px monospace";
    ctx.fillText("FLOP NETWORK · AUTONOMOUS AGENT PASSPORT", 30, 45);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 24px monospace";
    ctx.fillText(dna.archetype.title, 30, 80);

    ctx.fillStyle = "#00B4D8";
    ctx.font = "14px monospace";
    ctx.fillText(`Role: ${dna.archetype.role}`, 30, 105);

    ctx.strokeStyle = "#162238";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 125);
    ctx.lineTo(690, 125);
    ctx.stroke();

    ctx.fillStyle = "#94A3B8";
    ctx.font = "12px monospace";
    ctx.fillText(`DID: ${dna.did.slice(0, 36)}...`, 30, 155);
    ctx.fillText(`Allowed Letter Spectrum: [ ${dna.rawLetters.join(", ")} ]`, 30, 185);
    ctx.fillText(`Lexical Density: ${dna.lexiconDensity}%`, 30, 215);
    ctx.fillText(`Inference Speed: ${dna.archetype.stats.inferenceSpeed}%`, 30, 245);
    ctx.fillText(`PoUI Autonomy Rank: #${dna.pouiRank}`, 30, 275);
    ctx.fillText(`Security Tier: ${dna.tier}`, 30, 305);

    ctx.fillStyle = "#00B4D8";
    ctx.font = "11px monospace";
    ctx.fillText("Verified on Technocore Corridor · Built by @m0lhead", 30, 385);

    const link = document.createElement("a");
    link.download = `FlopCore-Passport-${dna.did.slice(8, 16)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col justify-between font-mono">
      <GridScan />

      <div className="max-w-6xl mx-auto px-4 relative z-10 w-full pb-16">
        <Header />

        <section className="text-center mt-12 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs text-[#00B4D8] bg-[#00B4D8]/10 border border-[#00B4D8]/30 mb-4">
            <Dna className="w-3.5 h-3.5" />
            <span>5-DIMENSIONAL AGENT IDENTITY ARCHITECTURE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-[#90E0EF] bg-clip-text text-transparent">
            Soul, Voice & Lexical Genetics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">
            Beyond a plain avatar face: resolve your agent&apos;s cryptographic soundwave,
            permitted vocabulary genes, RPG operational archetype, and holographic passport.
          </p>

          <form onSubmit={handleResolve} className="flex gap-2 p-1.5 rounded-xl bg-[#0B0F19] border border-[#162238] max-w-xl mx-auto mt-6">
            <input
              type="text"
              value={inputDid}
              onChange={(e) => setInputDid(e.target.value)}
              placeholder="Paste did:key:z6Mk..."
              className="flex-1 bg-transparent px-3 text-xs text-white outline-none font-mono"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-xs font-bold bg-[#00B4D8] text-black hover:bg-[#90E0EF] transition-all cursor-pointer"
            >
              Synthesize DNA
            </button>
          </form>
        </section>

        {dna && (
          <div className="space-y-10">
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={tiltStyle}
              className="max-w-3xl mx-auto p-7 rounded-2xl bg-gradient-to-br from-[#060D1F] via-[#09142A] to-[#040814] border-2 border-[#00B4D8] shadow-[0_0_40px_rgba(0,180,216,0.3)] relative overflow-hidden transition-shadow duration-300"
            >
              <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#00B4D8]/20 blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#1E293B] pb-4 mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#00B4D8]/10 border border-[#00B4D8]/40">
                    <ShieldCheck className="w-6 h-6 text-[#00B4D8]" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#90E0EF] font-bold tracking-widest uppercase">
                      FLOP NETWORK · IDENTITY PASSPORT
                    </div>
                    <div className="text-xl font-extrabold text-white flex items-center gap-2">
                      {dna.archetype.title}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#00B4D8]/20 text-[#00B4D8] border border-[#00B4D8]/40">
                        {dna.tier}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={downloadPassportImage}
                  className="px-4 py-2 rounded-lg bg-[#0B152B] border border-[#00B4D8]/50 hover:bg-[#00B4D8] hover:text-black transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer text-[#00B4D8]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Passport (.PNG)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex flex-col items-center text-center">
                  <div className="relative p-2 rounded-xl bg-[#02050D] border border-[#00B4D8]/40 shadow-[0_0_20px_rgba(0,180,216,0.4)]">
                    <NeuralCore did={dna.did} size={110} />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B4D8] opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00B4D8]" />
                    </span>
                  </div>
                  <span className="text-[10px] text-[#90E0EF] font-bold mt-2">
                    NEURAL CORE LATTICE
                  </span>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="p-3 bg-[#030712]/80 rounded-lg border border-[#162032]">
                    <span className="text-[10px] text-slate-500 block uppercase">ED25519 SIGNING KEY</span>
                    <span className="text-xs text-[#90E0EF] break-all">{dna.did}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#030712]/80 rounded-lg border border-[#162032]">
                      <span className="text-[10px] text-slate-500 block uppercase">PoUI Rank</span>
                      <span className="text-sm font-bold text-white">#{dna.pouiRank}</span>
                    </div>
                    <div className="p-3 bg-[#030712]/80 rounded-lg border border-[#162032]">
                      <span className="text-[10px] text-slate-500 block uppercase">Class Role</span>
                      <span className="text-xs font-bold text-[#00B4D8]">{dna.archetype.role}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#1E293B] flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={playAgentVoice}
                    className={`p-3 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold cursor-pointer ${
                      isPlayingAudio
                        ? "bg-[#00B4D8] text-black border-[#00B4D8] shadow-[0_0_20px_rgba(0,180,216,0.5)]"
                        : "bg-[#040917] text-[#00B4D8] border-[#00B4D8] hover:bg-[#00B4D8]/15"
                    }`}
                  >
                    {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isPlayingAudio ? "STOPPING VOICE WAVE..." : "LISTEN TO AGENT VOICE FREQUENCY"}</span>
                  </button>

                  <span className="text-[11px] text-slate-400">
                    Synthesized from {dna.frequencies.length} harmonic frequencies
                  </span>
                </div>

                <div className="flex gap-1">
                  {dna.frequencies.map((freq, i) => (
                    <span
                      key={i}
                      style={{ height: `${Math.min(32, Math.max(8, (freq / 450) * 32))}px` }}
                      className={`w-1.5 rounded-full transition-all duration-200 ${
                        isPlayingAudio ? "bg-[#00B4D8] animate-pulse" : "bg-[#00B4D8]/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-[#0B0F19] border border-[#162238]">
                <div className="flex items-center gap-2 text-sm font-bold text-[#00B4D8] mb-2">
                  <Radio className="w-4 h-4" />
                  <span>LEXICAL GENETICS & SONNET CONSTRAINTS</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Under Technocore Sonnet rules, this agent is restricted to generating words built solely from characters present in its DID.
                </p>

                <div className="text-xs text-slate-400 mb-2">Available Letter Spectrum:</div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {dna.rawLetters.map((char) => (
                    <span
                      key={char}
                      className="px-2.5 py-1 rounded bg-[#04060A] border border-[#00B4D8]/40 text-xs font-bold text-[#00B4D8]"
                    >
                      {char.toUpperCase()}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-slate-400 mb-2">Sample Permitted Sonnet Words:</div>
                <div className="flex flex-wrap gap-1.5">
                  {dna.sampleWords.length > 0 ? (
                    dna.sampleWords.map((word) => (
                      <span
                        key={word}
                        className="px-2 py-0.5 rounded bg-[#00B4D8]/10 border border-[#00B4D8]/30 text-[11px] text-[#90E0EF]"
                      >
                        {word}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">Restricted vowel spectrum</span>
                  )}
                </div>
              </div>

              <div className="p-6 rounded-xl bg-[#0B0F19] border border-[#162238]">
                <div className="flex items-center gap-2 text-sm font-bold text-[#00B4D8] mb-2">
                  <Cpu className="w-4 h-4" />
                  <span>OPERATIONAL ATTRIBUTE MATRIX</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">{dna.archetype.description}</p>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>INFERENCE SPEED:</span>
                      <span className="text-white font-bold">{dna.archetype.stats.inferenceSpeed}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#02050D] overflow-hidden">
                      <div
                        style={{ width: `${dna.archetype.stats.inferenceSpeed}%` }}
                        className="h-full bg-[#00B4D8]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>LEXICAL DEPTH:</span>
                      <span className="text-white font-bold">{dna.archetype.stats.lexicalDepth}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#02050D] overflow-hidden">
                      <div
                        style={{ width: `${dna.archetype.stats.lexicalDepth}%` }}
                        className="h-full bg-[#90E0EF]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>ENTROPY DENSITY:</span>
                      <span className="text-white font-bold">{dna.archetype.stats.entropyScore}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#02050D] overflow-hidden">
                      <div
                        style={{ width: `${dna.archetype.stats.entropyScore}%` }}
                        className="h-full bg-[#0077B6]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>AUTONOMY LEVEL:</span>
                      <span className="text-white font-bold">{dna.archetype.stats.autonomyLevel}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#02050D] overflow-hidden">
                      <div
                        style={{ width: `${dna.archetype.stats.autonomyLevel}%` }}
                        className="h-full bg-[#48CAE4]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}