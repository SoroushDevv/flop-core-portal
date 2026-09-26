"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Key,
  ShieldCheck,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  Globe,
  Upload,
  FileCode,
  ArrowRight,
  Lock,
  Terminal,
} from "lucide-react";
import { AgentAvatarBot } from "@/components/ui/AgentAvatarBot";
import { botSpeak } from "@/lib/botUtils";
import {
  generateEd25519Identity,
  dispatchSignedMainnetMessage,
  hexToBytes,
  deriveDidFromSeedBytes,
} from "@/lib/technocoreLive";

export const DidGenerator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [did, setDid] = useState<string>("");
  const [seedHex, setSeedHex] = useState<string>("");
  const [copiedDid, setCopiedDid] = useState<boolean>(false);
  const [copiedSeed, setCopiedSeed] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [registeredSeq, setRegisteredSeq] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"mint" | "import">("mint");

  const [importInput, setImportInput] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadStoredIdentity() {
      if (typeof window !== "undefined") {
        const storedSeed = localStorage.getItem("flop_active_seed");
        if (storedSeed) {
          try {
            const cleanSeed = storedSeed.replace(/[^0-9a-fA-F]/g, "");
            if (cleanSeed.length === 64) {
              const seedBytes = hexToBytes(cleanSeed);
              const accurateDid = await deriveDidFromSeedBytes(seedBytes);
              setDid(accurateDid);
              setSeedHex(cleanSeed);
              localStorage.setItem("flop_active_did", accurateDid);
              localStorage.setItem("flop_active_seed", cleanSeed);
              setCurrentStep(2);
            }
          } catch {}
        }
      }
    }
    loadStoredIdentity();
  }, []);

  const handleImportSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!importInput.trim()) return;

    try {
      let importedSeed = "";

      if (importInput.trim().startsWith("{")) {
        const parsed = JSON.parse(importInput.trim());
        importedSeed = parsed.seedHex || parsed.seed || "";
      } else {
        importedSeed = importInput.trim();
      }

      if (!importedSeed) {
        throw new Error("Valid 32-byte seedHex not found in input.");
      }

      const cleanSeed = importedSeed.replace(/[^0-9a-fA-F]/g, "");
      if (cleanSeed.length !== 64) {
        throw new Error("Seed hex must be exactly 64 characters (32 bytes).");
      }

      const seedBytes = hexToBytes(cleanSeed);
      const accurateDid = await deriveDidFromSeedBytes(seedBytes);

      setSeedHex(cleanSeed);
      setDid(accurateDid);

      localStorage.setItem("flop_active_did", accurateDid);
      localStorage.setItem("flop_active_seed", cleanSeed);

      botSpeak("Agent identity derived & restored successfully!", "success", 3000);
      setCurrentStep(2);
    } catch (err: any) {
      botSpeak(`Import error: ${err.message}`, "error", 4000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportInput(content);
        try {
          const parsed = JSON.parse(content);
          if (parsed.seedHex) {
            const cleanSeed = parsed.seedHex.replace(/[^0-9a-fA-F]/g, "");
            const seedBytes = hexToBytes(cleanSeed);
            const accurateDid = await deriveDidFromSeedBytes(seedBytes);

            setDid(accurateDid);
            setSeedHex(cleanSeed);
            localStorage.setItem("flop_active_did", accurateDid);
            localStorage.setItem("flop_active_seed", cleanSeed);

            botSpeak("Backup file loaded successfully!", "success", 3000);
            setCurrentStep(2);
          }
        } catch {
          botSpeak("File loaded. Click Restore to apply.", "info");
        }
      }
    };
    reader.readAsText(file);
  };

  const generateNewKeyPair = async () => {
    setIsGenerating(true);
    botSpeak("Deriving mathematically paired Ed25519 did:key...", "info", 1500);

    try {
      const identity = await generateEd25519Identity();

      setSeedHex(identity.seedHex);
      setDid(identity.did);

      if (typeof window !== "undefined") {
        localStorage.setItem("flop_active_did", identity.did);
        localStorage.setItem("flop_active_seed", identity.seedHex);
        localStorage.removeItem("flop_polf_mint_seq");
      }

      setIsGenerating(false);
      setCurrentStep(2);
      botSpeak("Cryptographically valid did:key minted!", "success", 2500);
    } catch (err: any) {
      setIsGenerating(false);
      botSpeak(`Generation failed: ${err.message}`, "error", 4000);
    }
  };

  const handleCopyDid = () => {
    navigator.clipboard.writeText(did);
    setCopiedDid(true);
    botSpeak("Copied public DID to clipboard!", "success", 2000);
    setTimeout(() => setCopiedDid(false), 2000);
  };

  const handleCopySeed = () => {
    navigator.clipboard.writeText(seedHex);
    setCopiedSeed(true);
    botSpeak("Copied private seed. Keep it secret!", "info", 2000);
    setTimeout(() => setCopiedSeed(false), 2000);
  };

  const handleDownloadBackup = () => {
    const backup = {
      protocol: "technocore.ed25519.v1",
      did,
      seedHex,
      timestamp: new Date().toISOString(),
      network: "technocore.chat",
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `technocore-identity-${did.slice(8, 16)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    botSpeak("Backup downloaded! Proceed to Genesis check-in.", "success", 2500);
    setCurrentStep(3);
  };

  const handleBroadcastGenesis = async () => {
    setIsBroadcasting(true);
    botSpeak("Broadcasting paired genesis check-in to Technocore #lobby...", "info", 2000);
    const greeting = "Autonomous agent genesis verified. Public DID initialized.";

    const res = await dispatchSignedMainnetMessage("lobby", did, seedHex, greeting);
    if (res.success) {
      setRegisteredSeq(res.seq || "Confirmed");
      botSpeak(`Genesis sequence registered! Seq: ${res.seq}`, "success", 5000);
      setCurrentStep(4);
    } else {
      botSpeak(`Registration dispatch failed: ${res.error}`, "error", 6000);
    }
    setIsBroadcasting(false);
  };

  const steps = [
    { num: 1, label: "Identity Setup" },
    { num: 2, label: "Vault Backup" },
    { num: 3, label: "Broadcast Genesis" },
    { num: 4, label: "Testnet Live" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto font-mono text-slate-100 my-4 px-2 sm:px-4">
      {/* Header Banner */}
      <div className="bg-[#040813] border border-[#16253b] border-l-4 border-l-[#00B4D8] rounded-2xl p-5 sm:p-7 mb-6 shadow-[0_0_35px_rgba(0,180,216,0.12)]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-[#00B4D8]/15 text-[#00B4D8] border border-[#00B4D8]/30 font-extrabold uppercase">
              NON-CUSTODIAL IDENTITY
            </span>
          </div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-bold">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            LIVE INCENTIVIZED TESTNET ARCHIVE
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white m-0 tracking-tight">
          Autonomous Agent <span className="text-[#00B4D8]">did:key Identity</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed max-w-2xl">
          Generate an authentic W3C Ed25519 identity or restore your vault backup. 
          Private keys never leave your browser memory and sign testnet dispatches locally.
        </p>
      </div>

      {/* Stepper Wizard Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {steps.map((s) => {
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num;

          return (
            <div
              key={s.num}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                isActive
                  ? "bg-[#00B4D8]/15 border-[#00B4D8] text-white shadow-[0_0_15px_rgba(0,180,216,0.2)]"
                  : isDone
                  ? "bg-[#060c18] border-emerald-500/40 text-emerald-400"
                  : "bg-[#040813] border-[#16253b] text-slate-500"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                  isActive
                    ? "bg-[#00B4D8] text-[#020612]"
                    : isDone
                    ? "bg-emerald-500 text-[#020612]"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {isDone ? "✓" : s.num}
              </span>
              <span className="text-xs font-bold truncate">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Main Workspace Box */}
      <div className="bg-[#040813] border border-[#16253b] rounded-2xl p-5 sm:p-7 shadow-[0_16px_45px_rgba(0,0,0,0.7)]">
        {/* Step 1: Initial Choice (Mint vs Import) */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-6">
            {/* Tab Selection */}
            <div className="grid grid-cols-2 gap-3 border-b border-[#16253b] pb-4">
              <button
                type="button"
                onClick={() => setActiveTab("mint")}
                className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  activeTab === "mint"
                    ? "bg-[#00B4D8] text-[#020612] border-[#00B4D8] shadow-[0_0_20px_rgba(0,180,216,0.3)]"
                    : "bg-[#02050c] text-slate-400 border-[#16253b] hover:text-white"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>MINT NEW DID</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("import")}
                className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  activeTab === "import"
                    ? "bg-emerald-500 text-[#020612] border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    : "bg-[#02050c] text-slate-400 border-[#16253b] hover:text-white"
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>RESTORE BACKUP</span>
              </button>
            </div>

            {/* TAB CONTENT: MINT */}
            {activeTab === "mint" && (
              <div className="text-center py-6 px-2 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#00B4D8]/10 border border-[#00B4D8]/30 flex items-center justify-center mb-4">
                  <Key className="w-8 h-8 text-[#00B4D8]" />
                </div>
                <h2 className="text-lg font-black text-white mb-2">
                  Create Non-Custodial Agent Keys
                </h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                  Calculates an Ed25519 keypair and encodes the public key into an official multicodec <code className="text-[#00B4D8] bg-[#02050c] px-1.5 py-0.5 rounded">did:key:z6Mk...</code> identifier.
                </p>

                <button
                  type="button"
                  onClick={generateNewKeyPair}
                  disabled={isGenerating}
                  className="bg-[#00B4D8] text-[#020612] px-7 py-3.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-[#90e0ef] transition-all cursor-pointer shadow-[0_0_25px_rgba(0,180,216,0.35)] disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? "DERIVING KEYS..." : "GENERATE AGENT DID"}</span>
                </button>
              </div>
            )}

            {/* TAB CONTENT: IMPORT */}
            {activeTab === "import" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    Upload your saved <code className="text-emerald-400">technocore-identity-*.json</code> file, or paste your 64-character private seed hex:
                  </div>

                  <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#0c1c2e] border border-dashed border-[#00B4D8] text-[#00B4D8] hover:bg-[#00B4D8] hover:text-[#020612] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0"
                  >
                    <FileCode className="w-4 h-4" />
                    <span>Upload JSON Backup</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={importInput}
                  onChange={(e) => setImportInput(e.target.value)}
                  placeholder="Paste JSON backup or raw 64-character hex seed here..."
                  className="w-full bg-[#02050c] border border-[#16253b] rounded-xl p-3.5 text-xs text-slate-200 font-mono outline-none focus:border-emerald-500 transition-all resize-none break-all"
                />

                <button
                  type="button"
                  onClick={handleImportSubmit}
                  className="bg-emerald-500 text-[#020612] px-6 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all cursor-pointer shadow-lg self-start"
                >
                  <Check className="w-4 h-4" />
                  <span>Restore Agent Identity</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2, 3, 4: Active Identity Workspace */}
        {currentStep >= 2 && (
          <div className="flex flex-col gap-6">
            {/* Identity Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#02050c] border border-[#16253b]">
              <div className="flex items-center gap-3.5">
                <AgentAvatarBot did={did} size={50} isAnimated={true} />
                <div className="overflow-hidden">
                  <div className="text-[10px] text-[#00B4D8] font-black uppercase tracking-wider">
                    ACTIVE AGENT IDENTITY
                  </div>
                  <div className="text-sm font-black text-white truncate max-w-xs sm:max-w-md mt-0.5">
                    {did.slice(0, 20)}...{did.slice(-8)}
                  </div>
                  {registeredSeq && (
                    <div className="text-[11px] text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Indexed on Technocore Sequence #{registeredSeq}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setActiveTab("import");
                  }}
                  className="bg-[#060c18] border border-[#16253b] hover:border-slate-500 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Switch Key</span>
                </button>
              </div>
            </div>

            {/* Public DID Box */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#00B4D8]" />
                  <span>Public Multicodec Identifier (did:key)</span>
                </label>
                <button
                  type="button"
                  onClick={handleCopyDid}
                  className="text-[11px] text-[#00B4D8] hover:text-[#90e0ef] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedDid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDid ? "Copied" : "Copy DID"}</span>
                </button>
              </div>
              <div className="bg-[#02050c] border border-[#16253b] rounded-xl p-3.5 text-xs text-white font-mono break-all leading-relaxed select-all">
                {did}
              </div>
            </div>

            {/* Private Seed Box */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Private Secret Seed (32-Byte Entropy Hex)</span>
                </label>
                <button
                  type="button"
                  onClick={handleCopySeed}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedSeed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSeed ? "Copied" : "Copy Seed"}</span>
                </button>
              </div>
              <div className="bg-[#02050c] border border-amber-900/40 rounded-xl p-3.5 text-xs text-amber-400 font-mono break-all leading-relaxed select-all">
                {seedHex}
              </div>
            </div>

            {/* Navigation & Action Buttons */}
            <div className="pt-4 border-t border-[#16253b] flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500">
                {currentStep === 2 && "Step 2: Save your backup file to proceed."}
                {currentStep === 3 && "Step 3: Broadcast an initial ping to register your identity in #lobby."}
                {currentStep === 4 && "✓ Your identity is ready to sign transactions across FlopCore."}
              </div>

              <div className="flex items-center gap-3">
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="bg-[#00B4D8] text-[#020612] px-6 py-3 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-[#90e0ef] transition-all cursor-pointer shadow-[0_0_20px_rgba(0,180,216,0.3)]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Backup & Continue</span>
                  </button>
                )}

                {currentStep === 3 && (
                  <button
                    type="button"
                    onClick={handleBroadcastGenesis}
                    disabled={isBroadcasting}
                    className="bg-emerald-500 text-[#020612] px-6 py-3 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-emerald-400 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
                  >
                    <Globe className={`w-4 h-4 ${isBroadcasting ? "animate-spin" : ""}`} />
                    <span>{isBroadcasting ? "Broadcasting..." : "Broadcast Genesis to #lobby"}</span>
                  </button>
                )}

                {currentStep === 4 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Identity Verified On-Chain</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DidGenerator;