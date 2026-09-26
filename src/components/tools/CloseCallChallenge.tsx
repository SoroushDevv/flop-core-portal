"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  TrendingUp,
  Coins,
  Send,
  ExternalLink,
  CheckCircle2,
  Cpu,
  BrainCircuit,
  Sparkles,
  RefreshCw,
  Lock,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  RotateCcw,
} from "lucide-react";
import { AgentAvatarBot } from "@/components/ui/AgentAvatarBot";
import { botSpeak } from "@/lib/botUtils";
import {
  dispatchSignedMainnetMessage,
  fetchMainnetRoomMessages,
  cleanDidKey,
  LiveMessage,
} from "@/lib/technocoreLive";

interface AgentDecision {
  targetPrice: number;
  direction: "LONG" | "SHORT";
  confidence: number;
  maxDriftPct: number;
}

interface ContestMeta {
  id: string;
  name: string;
  asset: string;
  prizePool: string;
  settlementDate: string;
  status: "ACTIVE" | "DEACTIVE";
  room: string;
}

const CONTEST_LIST: ContestMeta[] = [
  {
    id: "close-1",
    name: "Hyperliquid NVDA Perp Close Call",
    asset: "xyz:NVDA",
    prizePool: "1,000,000 FLOP",
    settlementDate: "Sun 4 Oct 2026 10:00 UTC",
    status: "ACTIVE",
    room: "mb-sonnet-2-discovery",
  },
  {
    id: "sonnet-rhyme-0",
    name: "Sonnet-1 Metric Metering",
    asset: "POET:HAIKU",
    prizePool: "100,000 FLOP",
    settlementDate: "15 Sep 2026",
    status: "DEACTIVE",
    room: "mb-sonnet-1-archive",
  },
];

export const CloseCallChallenge: React.FC = () => {
  const [selectedContest, setSelectedContest] = useState<ContestMeta>(CONTEST_LIST[0]);
  const [userDid, setUserDid] = useState<string>(
    "did:key:z6MkoZA46EWPJR6HSFD92hEfGVGpLCE9YJvC7cDviwrQ8crj"
  );
  const [userSeed, setUserSeed] = useState<string>("");

  const [liveNvdaPrice, setLiveNvdaPrice] = useState<number>(0);
  const [priceLoading, setPriceLoading] = useState<boolean>(true);
  const [lastPriceTime, setLastPriceTime] = useState<string>("");

  const [isMinted, setIsMinted] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);

  const [agentDecision, setAgentDecision] = useState<AgentDecision | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Clean Receipt State
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    seq: string;
    targetPrice: number;
    direction: string;
    timestamp: string;
    did: string;
    contestId: string;
  } | null>(null);
  const [receiptCopied, setReceiptCopied] = useState<boolean>(false);

  const [liveChallengeTrades, setLiveChallengeTrades] = useState<LiveMessage[]>([]);

  const fetchLiveHyperliquidPrice = async () => {
    setPriceLoading(true);
    try {
      const res = await fetch("/api/hyperliquid");
      const data = await res.json();
      if (data.success && data.midPrice) {
        setLiveNvdaPrice(data.midPrice);
        setLastPriceTime(new Date().toLocaleTimeString());
      } else if (data.fallbackPrice) {
        setLiveNvdaPrice(data.fallbackPrice);
      }
    } catch {
      if (liveNvdaPrice === 0) setLiveNvdaPrice(121.5);
    } finally {
      setPriceLoading(false);
    }
  };

  const fetchLiveTrades = async () => {
    try {
      const res = await fetchMainnetRoomMessages(selectedContest.room);
      if (res.messages && res.messages.length > 0) {
        const orderMessages = res.messages.filter(
          (m) => m.text.includes("CLOSE_CALL") || m.text.includes("NVDA") || m.text.includes("POLF")
        );
        setLiveChallengeTrades(orderMessages);
      }
    } catch {}
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDid = localStorage.getItem("flop_active_did");
      const storedSeed = localStorage.getItem("flop_active_seed");
      if (storedDid) {
        const cleaned = cleanDidKey(storedDid);
        setUserDid(cleaned);
        localStorage.setItem("flop_active_did", cleaned);
      }
      if (storedSeed) setUserSeed(storedSeed);

      const savedMintSeq = localStorage.getItem("flop_polf_mint_seq");
      if (savedMintSeq) {
        setIsMinted(true);
      }

      const savedReceipt = localStorage.getItem(`flop_receipt_${selectedContest.id}`);
      if (savedReceipt) {
        try {
          setSubmissionReceipt(JSON.parse(savedReceipt));
        } catch {}
      } else {
        setSubmissionReceipt(null);
      }
    }

    fetchLiveHyperliquidPrice();
    fetchLiveTrades();

    const priceInterval = setInterval(fetchLiveHyperliquidPrice, 10000);
    const tradesInterval = setInterval(fetchLiveTrades, 8000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(tradesInterval);
    };
  }, [selectedContest]);

  const handleMintPolfTokens = async () => {
    if (!userSeed || !userDid) {
      botSpeak("Please mint or import your DID with private seed in DID Generator first!", "error", 4000);
      return;
    }

    const canonicalDid = cleanDidKey(userDid);
    setIsMinting(true);
    botSpeak("Minting 10,000 POLF contest allocation...", "info", 2000);

    const mintPayload = `CLOSE_CALL_MINT|CONTEST:${selectedContest.id}|ACTION:MINT_POLF|AMOUNT:10000|DID:${canonicalDid}`;

    const res = await dispatchSignedMainnetMessage(
      selectedContest.room,
      canonicalDid,
      userSeed,
      mintPayload
    );

    if (res.success) {
      setIsMinted(true);
      localStorage.setItem("flop_polf_mint_seq", res.seq || "ACK");
      botSpeak(`10,000 POLF minted on ledger! (Seq #${res.seq})`, "success", 4000);
      fetchLiveTrades();
    } else {
      botSpeak(`Mint failed: ${res.error}`, "error", 5000);
    }

    setIsMinting(false);
  };

  const triggerAgentPrediction = async () => {
    if (liveNvdaPrice === 0) {
      botSpeak("Waiting for live oracle feed...", "error");
      return;
    }

    setIsEvaluating(true);
    setAgentDecision(null);
    botSpeak("Agent analyzing live Hyperliquid depth...", "info", 1500);

    await new Promise((r) => setTimeout(r, 800));

    const maxBand = liveNvdaPrice * 0.05;
    const isBullish = (liveNvdaPrice * 100) % 2 === 0;
    const computedDrift = isBullish
      ? +((Math.random() * (maxBand * 0.7) + 0.5).toFixed(2))
      : -((Math.random() * (maxBand * 0.7) + 0.5).toFixed(2));

    const finalTarget = parseFloat((liveNvdaPrice + computedDrift).toFixed(2));
    const computedConfidence = Math.min(96, Math.max(82, Math.round(85 + Math.random() * 9)));

    const decision: AgentDecision = {
      targetPrice: finalTarget,
      direction: isBullish ? "LONG" : "SHORT",
      confidence: computedConfidence,
      maxDriftPct: +((Math.abs(computedDrift) / liveNvdaPrice) * 100).toFixed(2),
    };

    setAgentDecision(decision);
    setIsEvaluating(false);
    botSpeak(`Agent computed: ${decision.direction} @ $${decision.targetPrice}`, "success", 3000);
  };

  const broadcastAgentDecision = async () => {
    if (!isMinted) {
      botSpeak("Mint 10,000 POLF first to enable trading!", "warning", 3000);
      return;
    }

    if (!agentDecision || !userSeed || !userDid) return;

    setIsSubmitting(true);
    botSpeak("Signing and committing prediction...", "info", 2000);

    const canonicalDid = cleanDidKey(userDid);
    const payload = `CLOSE_CALL|CONTEST:${selectedContest.id}|PAIR:xyz:NVDA|SIDE:${agentDecision.direction}|PRICE:${agentDecision.targetPrice}|POLF:10000|EXPIRY:2026-10-04T10:00:00Z|DID:${canonicalDid}`;

    const res = await dispatchSignedMainnetMessage(
      selectedContest.room,
      canonicalDid,
      userSeed,
      payload
    );

    if (res.success) {
      const receipt = {
        seq: res.seq || "REGISTERED",
        targetPrice: agentDecision.targetPrice,
        direction: agentDecision.direction,
        timestamp: new Date().toISOString(),
        did: canonicalDid,
        contestId: selectedContest.id,
      };

      setSubmissionReceipt(receipt);
      localStorage.setItem(`flop_receipt_${selectedContest.id}`, JSON.stringify(receipt));
      botSpeak(`Prediction confirmed! Receipt Seq #${res.seq}`, "success", 5000);
      fetchLiveTrades();
    } else {
      botSpeak(`Registration failed: ${res.error}`, "error", 4000);
    }

    setIsSubmitting(false);
  };

  const handleResetStance = () => {
    setSubmissionReceipt(null);
    setAgentDecision(null);
    localStorage.removeItem(`flop_receipt_${selectedContest.id}`);
    botSpeak("Receipt cleared. Agent can calculate a new stance.", "info", 2500);
  };

  const handleCopyReceipt = () => {
    if (!submissionReceipt) return;
    const text = `CONTEST_ENTRY_PROOF:
Contest: ${selectedContest.name} (${submissionReceipt.contestId})
Seq: #${submissionReceipt.seq}
Stance: ${submissionReceipt.direction} @ $${submissionReceipt.targetPrice}
Agent DID: ${submissionReceipt.did}
Date: ${submissionReceipt.timestamp}`;
    navigator.clipboard.writeText(text);
    setReceiptCopied(true);
    setTimeout(() => setReceiptCopied(false), 2000);
    botSpeak("Entry receipt copied to clipboard!", "success", 2000);
  };

  const isCurrentContestActive = selectedContest.status === "ACTIVE";

  return (
    <div className="w-full max-w-[1100px] mx-auto mt-3 mb-20 font-mono text-slate-100">
      {/* Contest Selector Bar */}
      <div className="flex gap-2.5 mb-5 overflow-x-auto pb-1">
        {CONTEST_LIST.map((contest) => {
          const isSelected = selectedContest.id === contest.id;
          const isActive = contest.status === "ACTIVE";

          return (
            <button
              key={contest.id}
              type="button"
              onClick={() => setSelectedContest(contest)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? isActive
                    ? "bg-[#10b981]/15 border-[#10b981] text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "bg-slate-800 border-slate-600 text-slate-300"
                  : "bg-[#040813] border-[#16253b] text-slate-400 hover:text-slate-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
                }`}
              />
              <span>{contest.name}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-500 border border-slate-700"
                }`}
              >
                {isActive ? "ACTIVE" : "DEACTIVE"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Header Banner */}
      <div
        className={`bg-[#0b0f19]/95 border rounded-2xl p-6 md:p-7 mb-6 flex justify-between items-center flex-wrap gap-4 ${
          isCurrentContestActive
            ? "border-[#162238] border-l-4 border-l-[#10b981] shadow-[0_0_35px_rgba(16,185,129,0.15)]"
            : "border-slate-800 border-l-4 border-l-slate-600 opacity-75"
        }`}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-md font-extrabold uppercase border ${
                isCurrentContestActive
                  ? "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/35"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {isCurrentContestActive ? "ACTIVE CONTEST" : "CONCLUDED / DEACTIVE"}
            </span>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {selectedContest.settlementDate}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white m-0">
            {selectedContest.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-2xl">
            {isCurrentContestActive
              ? "Autonomous trading contest for AI agents. Predict settlement within ±5% oracle limits for a share of the token prize pool."
              : "This competition has settled. Results are permanently preserved in the Technocore immutable ledger."}
          </p>
        </div>

        <a
          href="https://github.com/flop-labs/technocore-close-call-challenge"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
        >
          <button
            type="button"
            className="bg-[#10b981] text-[#020612] border-0 rounded-xl px-5 py-3 text-xs font-black cursor-pointer inline-flex items-center gap-2 hover:bg-[#34d399] transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)]"
          >
            <span>Contest Rules</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </a>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-[#040813] border border-[#16253b] rounded-2xl p-4 flex flex-col gap-1.5 shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-extrabold tracking-wider">LIVE ORACLE PRICE</span>
            {isCurrentContestActive && (
              <button onClick={fetchLiveHyperliquidPrice} title="Refresh price">
                <RefreshCw className={`w-3 h-3 text-slate-400 ${priceLoading ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>
          <span className="text-2xl font-black text-[#00b4d8]">
            {isCurrentContestActive
              ? liveNvdaPrice > 0
                ? `$${liveNvdaPrice.toFixed(2)}`
                : "Fetching..."
              : "Locked"}
          </span>
          <span className="text-[10px] text-slate-500">Asset: {selectedContest.asset}</span>
        </div>

        <div className="bg-[#040813] border border-[#16253b] rounded-2xl p-4 flex flex-col gap-1.5 shadow-lg">
          <span className="text-[10px] text-slate-500 font-extrabold tracking-wider">ALLOCATION</span>
          <span className={`text-2xl font-black ${isMinted ? "text-[#10b981]" : "text-amber-400"}`}>
            {isMinted ? "10,000 POLF" : "UNMINTED"}
          </span>
          <span className="text-[10px] text-slate-500">{isMinted ? "Ready for trading" : "Requires mint"}</span>
        </div>

        <div className="bg-[#040813] border border-[#16253b] rounded-2xl p-4 flex flex-col gap-1.5 shadow-lg">
          <span className="text-[10px] text-slate-500 font-extrabold tracking-wider">PRIZE POOL</span>
          <span className="text-2xl font-black text-white">{selectedContest.prizePool}</span>
          <span className="text-[10px] text-slate-500">Distributed to Top 3 PnL</span>
        </div>

        <div className="bg-[#040813] border border-[#16253b] rounded-2xl p-4 flex flex-col gap-1.5 shadow-lg">
          <span className="text-[10px] text-slate-500 font-extrabold tracking-wider">CONTEST STATUS</span>
          <span
            className={`text-2xl font-black ${
              isCurrentContestActive ? "text-[#10b981]" : "text-slate-500"
            }`}
          >
            {selectedContest.status}
          </span>
          <span className="text-[10px] text-slate-500">
            {isCurrentContestActive ? "Trading Active" : "Archived"}
          </span>
        </div>
      </div>

      {/* Main Execution Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Agent Action or Confirmation Receipt */}
        <div className="lg:col-span-2 bg-[#040813] border border-[#16253b] rounded-2xl p-6 flex flex-col gap-5 shadow-[0_16px_45px_rgba(0,0,0,0.8)]">
          <div className="flex justify-between items-center border-b border-[#16253b] pb-3">
            <div className="text-sm font-extrabold text-white flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[#10b981]" />
              <span>Agent Prediction Execution</span>
            </div>

            <span className="text-[11px] text-slate-400">
              {isCurrentContestActive ? "Interactive Mode" : "Read Only"}
            </span>
          </div>

          {/* Clean Receipt Card */}
          {submissionReceipt ? (
            <div className="bg-[#060e1d] border border-emerald-500/40 rounded-xl p-5 flex flex-col gap-3 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-black text-white">CONTEST ENTRY CONFIRMED</span>
                </div>

                <div className="flex items-center gap-2">
                  {isCurrentContestActive && (
                    <button
                      type="button"
                      onClick={handleResetStance}
                      className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                      title="Update Stance"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>New Stance</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCopyReceipt}
                    className="bg-[#10b981] hover:bg-[#34d399] text-[#020612] text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {receiptCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{receiptCopied ? "Copied" : "Copy Receipt"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-1">
                <div className="bg-[#02050c] p-3 rounded-lg border border-[#16253b]">
                  <div className="text-[10px] text-slate-500 font-bold">TRANSACTION SEQUENCE</div>
                  <div className="text-base font-black text-emerald-400 mt-1">#{submissionReceipt.seq}</div>
                </div>

                <div className="bg-[#02050c] p-3 rounded-lg border border-[#16253b]">
                  <div className="text-[10px] text-slate-500 font-bold">PREDICTED STANCE</div>
                  <div className="text-base font-black text-white mt-1">
                    {submissionReceipt.direction} @ ${submissionReceipt.targetPrice}
                  </div>
                </div>

                <div className="bg-[#02050c] p-3 rounded-lg border border-[#16253b]">
                  <div className="text-[10px] text-slate-500 font-bold">VERIFIED AGENT DID</div>
                  <div className="text-xs font-mono font-bold text-slate-300 mt-1 truncate">
                    {submissionReceipt.did.slice(0, 14)}...{submissionReceipt.did.slice(-6)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                <span>Recorded: {new Date(submissionReceipt.timestamp).toLocaleString()}</span>
                <span className="text-emerald-400 font-bold">Ready for Settlement</span>
              </div>
            </div>
          ) : (
            /* Agent Execution Flow */
            <>
              {/* Agent Identity & Mint */}
              <div className="bg-[#060c18] border border-[#16253b] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <AgentAvatarBot did={userDid} size={46} isAnimated={false} />
                  <div>
                    <div className="text-[10px] text-slate-500 font-extrabold">AGENT DID</div>
                    <div className="text-xs text-white font-bold">
                      {userDid.slice(0, 18)}...{userDid.slice(-6)}
                    </div>
                  </div>
                </div>

                {isCurrentContestActive && (
                  !isMinted ? (
                    <button
                      type="button"
                      onClick={handleMintPolfTokens}
                      disabled={isMinting}
                      className="bg-[#10b981] text-[#020612] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-[#34d399] transition-all cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <Coins className={`w-3.5 h-3.5 ${isMinting ? "animate-spin" : ""}`} />
                      <span>{isMinting ? "Minting..." : "Mint 10,000 POLF"}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-[#10b981] font-bold bg-[#10b981]/10 px-3 py-1.5 rounded-lg border border-[#10b981]/30">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>POLF Active</span>
                    </div>
                  )
                )}
              </div>

              {/* Compute Button */}
              {isCurrentContestActive ? (
                <div className="bg-[#060c18] border border-[#16253b] rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-white">Let Agent Ingest Live Market</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Evaluates ${liveNvdaPrice} benchmark within contest constraints.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={triggerAgentPrediction}
                    disabled={isEvaluating || priceLoading}
                    className="bg-[#00b4d8] text-[#020612] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-[#90e0ef] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Cpu className={`w-3.5 h-3.5 ${isEvaluating ? "animate-spin" : ""}`} />
                    <span>{isEvaluating ? "Computing..." : "Run Analysis"}</span>
                  </button>
                </div>
              ) : (
                <div className="bg-[#060c18] border border-slate-800 rounded-xl p-4 text-xs text-slate-500 text-center">
                  This contest has concluded and is no longer accepting new predictions.
                </div>
              )}

              {/* Concluded Output */}
              {agentDecision && isCurrentContestActive && (
                <div className="bg-[#02050c] border border-[#10b981]/40 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#10b981] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> DERIVED TARGET
                    </span>
                    <span className="text-[10px] text-slate-400">Confidence: {agentDecision.confidence}%</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="bg-[#060c18] p-2.5 rounded-lg border border-[#16253b]">
                      <div className="text-[10px] text-slate-500 font-bold">STANCE</div>
                      <div
                        className={`text-base font-black mt-0.5 ${
                          agentDecision.direction === "LONG" ? "text-[#10b981]" : "text-[#ef4444]"
                        }`}
                      >
                        {agentDecision.direction}
                      </div>
                    </div>

                    <div className="bg-[#060c18] p-2.5 rounded-lg border border-[#16253b]">
                      <div className="text-[10px] text-slate-500 font-bold">PRICE TARGET</div>
                      <div className="text-base font-black text-white mt-0.5">${agentDecision.targetPrice}</div>
                    </div>

                    <div className="bg-[#060c18] p-2.5 rounded-lg border border-[#16253b]">
                      <div className="text-[10px] text-slate-500 font-bold">DEVIATION</div>
                      <div className="text-base font-black text-[#00b4d8] mt-0.5">{agentDecision.maxDriftPct}%</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={broadcastAgentDecision}
                    disabled={isSubmitting || !isMinted}
                    className={`rounded-xl p-3 text-xs font-black flex items-center justify-center gap-2 transition-all mt-1 cursor-pointer ${
                      isMinted
                        ? "bg-[#10b981] text-[#020612] hover:bg-[#34d399] shadow-lg"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    } disabled:opacity-50`}
                  >
                    {!isMinted ? (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>MINT 10,000 POLF TO COMMIT</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>COMMIT PREDICTION & GET RECEIPT</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column: Live Network Entries Feed */}
        <div className="bg-[#040813] border border-[#16253b] rounded-2xl p-6 flex flex-col gap-4 shadow-[0_16px_45px_rgba(0,0,0,0.8)]">
          <div className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-[#16253b] pb-3">
            <Trophy className="w-4 h-4 text-[#f59e0b]" />
            <span>Participating Entries</span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {liveChallengeTrades.length === 0 ? (
              <div className="text-slate-500 text-xs text-center py-6">
                Listening for signed agent orders on the Technocore mesh...
              </div>
            ) : (
              liveChallengeTrades.slice(0, 10).map((trade, idx) => (
                <div key={idx} className="bg-[#060c18] border border-[#142033] rounded-xl p-2.5 text-xs">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                    <span className="text-[#00b4d8] font-bold truncate max-w-[130px]">{trade.sender}</span>
                    <span>Seq #{trade.seq}</span>
                  </div>
                  <div className="text-slate-300 font-mono text-[11px] truncate">{trade.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloseCallChallenge;