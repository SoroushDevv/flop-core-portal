"use client";

import React, { useState, useEffect } from "react";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Flame, Trophy, Sparkles, RotateCcw, Coins } from "lucide-react";

type Side = "FLIP" | "FLOP";

export default function FlipFlopGame() {
  const [selectedSide, setSelectedSide] = useState<Side | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<Side>("FLIP");
  const [rotation, setRotation] = useState(0);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastFlipStatus, setLastFlipStatus] = useState<"WIN" | "LOSE" | null>(null);

  // بارگذاری مقادیر و محاسبه Streak روزانه
  useEffect(() => {
    const savedPoints = Number(localStorage.getItem("flipflop_points") || "0");
    const savedStreak = Number(localStorage.getItem("flipflop_streak") || "0");
    const lastPlayedDate = localStorage.getItem("flipflop_last_date");

    setPoints(savedPoints);

    const today = new Date().toISOString().slice(0, 10);

    if (lastPlayedDate) {
      const lastDate = new Date(lastPlayedDate);
      const currentDate = new Date(today);
      const diffDays = Math.floor(
        (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        setStreak(savedStreak);
      } else if (diffDays > 1) {
        setStreak(0);
        localStorage.setItem("flipflop_streak", "0");
      } else {
        setStreak(savedStreak);
      }
    } else {
      setStreak(0);
    }
  }, []);

  const handleFlip = () => {
    if (!selectedSide) {
      setStatusMessage("Select FLIP or FLOP first!");
      return;
    }
    if (isFlipping) return;

    setIsFlipping(true);
    setStatusMessage("Flipping through the network...");
    setLastFlipStatus(null);

    // چرخش تصادفی کوین (حداقل ۵ دور کامل + ۱۸۰ درجه بر اساس خروجی)
    const result: Side = Math.random() < 0.5 ? "FLIP" : "FLOP";
    const extraRotations = 1800 + (result === "FLOP" ? 180 : 0);
    const newRotation = rotation + extraRotations;

    setRotation(newRotation);

    setTimeout(() => {
      setIsFlipping(false);
      setCoinResult(result);

      const today = new Date().toISOString().slice(0, 10);
      const lastPlayedDate = localStorage.getItem("flipflop_last_date");

      if (result === selectedSide) {
        // برد
        const newPoints = points + 10;
        setPoints(newPoints);
        localStorage.setItem("flipflop_points", String(newPoints));
        setLastFlipStatus("WIN");
        setStatusMessage("CORRECT! +10 Points added to your PoUI Balance.");

        // آپدیت Streak روزانه در صورت ورود جدید
        if (lastPlayedDate !== today) {
          const newStreak = streak + 1;
          setStreak(newStreak);
          localStorage.setItem("flipflop_streak", String(newStreak));
          localStorage.setItem("flipflop_last_date", today);
        }
      } else {
        // باخت
        setLastFlipStatus("LOSE");
        setStatusMessage(`MISSED! Network resolved to ${result}. Try again!`);
      }
    }, 1800);
  };

  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col justify-between font-mono">
      <GridScan />

      <div className="max-w-4xl mx-auto px-4 relative z-10 w-full pb-16">
        <Header />

        {/* تایتل بازی */}
        <section className="text-center mt-10 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-[#00B4D8] bg-[#00B4D8]/10 border border-[#00B4D8]/30 mb-3">
            <Coins className="w-3.5 h-3.5" />
            <span>FLOP NETWORK MINI-GAME</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white to-[#90E0EF] bg-clip-text text-transparent">
            FLIP / FLOP
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
            Choose your signature side, initiate a state resolution on the coin, and earn daily rewards.
          </p>
        </section>

        {/* کارت استریک و امتیازات */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#2F293A] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#FF8800]/10 border border-[#FF8800]/30 text-[#FF8800]">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{streak} Days</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Daily Streak</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#2F293A] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00B4D8]/10 border border-[#00B4D8]/30 text-[#00B4D8]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#00B4D8]">{points} PTS</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">PoUI Score</div>
            </div>
          </div>
        </div>

        {/* ناحیه تعاملی کوین */}
        <div className="flex flex-col items-center">
          <div
            onClick={handleFlip}
            className="w-48 h-48 relative cursor-pointer select-none my-4 perspective-1000 group"
          >
            <div
              style={{
                transform: `rotateY(${rotation}deg)`,
                transition: "transform 1.8s cubic-bezier(0.2, 0.8, 0.2, 1)",
                transformStyle: "preserve-3d",
              }}
              className="w-full h-full relative rounded-full shadow-[0_0_35px_rgba(0,180,216,0.3)] group-hover:shadow-[0_0_50px_rgba(0,180,216,0.5)] transition-shadow"
            >
              {/* وجه FLIP */}
              <div
                style={{ backfaceVisibility: "hidden" }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#02050D] via-[#0B1528] to-[#00B4D8] border-4 border-[#00B4D8] flex flex-col items-center justify-center text-white"
              >
                <Sparkles className="w-7 h-7 text-[#00B4D8] mb-1 animate-pulse" />
                <span className="text-2xl font-extrabold tracking-wider text-white">FLIP</span>
                <span className="text-[9px] text-[#90E0EF] mt-1">HEADS</span>
              </div>

              {/* وجه FLOP */}
              <div
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#02050D] via-[#1E0B28] to-[#FF9FFC] border-4 border-[#FF9FFC] flex flex-col items-center justify-center text-white"
              >
                <Coins className="w-7 h-7 text-[#FF9FFC] mb-1 animate-pulse" />
                <span className="text-2xl font-extrabold tracking-wider text-white">FLOP</span>
                <span className="text-[9px] text-[#FF9FFC] mt-1">TAILS</span>
              </div>
            </div>
          </div>

          <span className="text-[11px] text-slate-500 mt-2">
            Click coin or button to trigger resolution
          </span>

          {/* انتخابگر FLIP یا FLOP */}
          <div className="flex gap-4 mt-6">
            <button
              disabled={isFlipping}
              onClick={() => {
                setSelectedSide("FLIP");
                setStatusMessage(null);
              }}
              className={`px-8 py-3 rounded-xl font-bold text-xs tracking-wider border transition-all cursor-pointer ${
                selectedSide === "FLIP"
                  ? "bg-[#00B4D8] text-black border-[#00B4D8] shadow-[0_0_20px_rgba(0,180,216,0.5)]"
                  : "bg-[#0B0F19] text-slate-300 border-[#2F293A] hover:border-[#00B4D8]"
              }`}
            >
              PREDICT: FLIP
            </button>

            <button
              disabled={isFlipping}
              onClick={() => {
                setSelectedSide("FLOP");
                setStatusMessage(null);
              }}
              className={`px-8 py-3 rounded-xl font-bold text-xs tracking-wider border transition-all cursor-pointer ${
                selectedSide === "FLOP"
                  ? "bg-[#FF9FFC] text-black border-[#FF9FFC] shadow-[0_0_20px_rgba(255,159,252,0.5)]"
                  : "bg-[#0B0F19] text-slate-300 border-[#2F293A] hover:border-[#FF9FFC]"
              }`}
            >
              PREDICT: FLOP
            </button>
          </div>

          {/* اکشن تریگر اصلی */}
          <button
            onClick={handleFlip}
            disabled={isFlipping}
            className="mt-6 px-10 py-3 rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#90E0EF] text-black font-extrabold text-xs tracking-wider hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_25px_rgba(0,180,216,0.35)]"
          >
            <RotateCcw className={`w-4 h-4 ${isFlipping ? "animate-spin" : ""}`} />
            <span>{isFlipping ? "RESOLVING STATE..." : "FLIP COIN NOW"}</span>
          </button>

          {/* فیدبک وضعیت */}
          {statusMessage && (
            <div
              className={`mt-6 text-xs p-3 px-5 rounded-lg border font-mono animate-fade-in ${
                lastFlipStatus === "WIN"
                  ? "bg-[#00B4D8]/10 border-[#00B4D8] text-[#00B4D8]"
                  : lastFlipStatus === "LOSE"
                  ? "bg-red-500/10 border-red-500/40 text-red-400"
                  : "bg-[#0B0F19] border-[#2F293A] text-slate-300"
              }`}
            >
              {statusMessage}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}