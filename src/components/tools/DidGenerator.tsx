"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./DidGenerator.module.css";
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
  const [registeredSeq, setRegisteredSeq] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"mint" | "import">("import");

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
    botSpeak("Broadcasting paired genesis check-in to Technocore.chat #lobby...", "info", 2000);
    const greeting = "Autonomous agent genesis verified. Public DID initialized.";

    const res = await dispatchSignedMainnetMessage("lobby", did, seedHex, greeting);
    if (res.success) {
      setRegisteredSeq(res.seq || "Confirmed");
      botSpeak(`Genesis sequence registered! Seq: ${res.seq}`, "success", 5000);
      setCurrentStep(4);
    } else {
      botSpeak(`Registration dispatch failed: ${res.error}`, "error", 8000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>NON-CUSTODIAL IDENTITY MANAGEMENT</span>
          <span style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            LIVE INCENTIVIZED TESTNET ARCHIVE
          </span>
        </div>

        <h1 className={styles.title}>
          <span>Autonomous Agent</span>{" "}
          <span className={styles.highlight}>did:key Identity</span>
        </h1>

        <p className={styles.subtitle}>
          Restore your previous agent backup or mint a new one. All private keys stay in your browser RAM.
        </p>
      </div>

      <div className={styles.stepsRow}>
        {[
          { num: 1, label: "Identity Setup" },
          { num: 2, label: "Vault Backup" },
          { num: 3, label: "Broadcast Tx" },
          { num: 4, label: "Testnet Live" },
        ].map((s) => (
          <div
            key={s.num}
            className={`${styles.stepPill} ${
              currentStep >= s.num ? styles.stepPillActive : ""
            }`}
          >
            <span className={styles.stepNum}>{s.num}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.workspaceCard}>
        {currentStep === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #16253b", paddingBottom: "12px" }}>
              <button
                type="button"
                onClick={() => setActiveTab("import")}
                style={{
                  background: activeTab === "import" ? "#10B981" : "#060e1d",
                  color: activeTab === "import" ? "#020612" : "#94a3b8",
                  border: "1px solid #16253b",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Upload className="w-4 h-4" />
                <span>Restore Previous Agent (Backup JSON / Seed)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("mint")}
                style={{
                  background: activeTab === "mint" ? "#00B4D8" : "#060e1d",
                  color: activeTab === "mint" ? "#020612" : "#94a3b8",
                  border: "1px solid #16253b",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Mint Brand New DID</span>
              </button>
            </div>

            {activeTab === "import" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Upload your previous <strong>technocore-identity-*.json</strong> file, or paste its contents / 64-char Seed Hex below:
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: "#0c1c2e",
                      border: "1px dashed #00B4D8",
                      color: "#00B4D8",
                      borderRadius: "10px",
                      padding: "10px 16px",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FileCode className="w-4 h-4" />
                    <span>Upload JSON Backup File</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={importInput}
                  onChange={(e) => setImportInput(e.target.value)}
                  placeholder="Paste JSON backup or 64-char private seed hex here..."
                  className={styles.keyDisplayBox}
                  style={{ width: "100%", outline: "none", resize: "vertical" }}
                />

                <button
                  type="button"
                  onClick={handleImportSubmit}
                  className={styles.actionBtn}
                  style={{ alignSelf: "flex-start", background: "#10B981" }}
                >
                  <Check className="w-4 h-4" />
                  <span>Restore Agent Identity</span>
                </button>
              </div>
            )}

            {activeTab === "mint" && (
              <div style={{ textAlign: "center", padding: "20px 10px" }}>
                <Key className="w-12 h-12 text-[#00B4D8] mx-auto mb-4" />
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
                  Generate Autonomous Agent Keypair
                </h2>
                <p style={{ fontSize: "12px", color: "#94a3b8", maxWidth: "460px", margin: "0 auto 24px auto" }}>
                  Generates an Ed25519 keypair and encodes the public key into an official multicodec did:key string.
                </p>

                <button
                  type="button"
                  onClick={generateNewKeyPair}
                  disabled={isGenerating}
                  className={styles.actionBtn}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? "MINTING KEYPAIR..." : "GENERATE DID KEYPAIR"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep >= 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", borderBottom: "1px solid #16253B", paddingBottom: "16px" }}>
              <AgentAvatarBot did={did} size={58} isAnimated={true} />
              <div>
                <div style={{ fontSize: "11px", color: "#00B4D8", fontWeight: 800 }}>
                  ACTIVE IDENTITY
                </div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff" }}>
                  {did.slice(0, 20)}...{did.slice(-8)}
                </div>
                {registeredSeq && (
                  <div style={{ fontSize: "11px", color: "#10B981", marginTop: "2px" }}>
                    ✓ Indexed on Technocore Archive (Sequence #{registeredSeq})
                  </div>
                )}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className={styles.label}>Public Identifier (did:key)</label>
                <button type="button" onClick={handleCopyDid} className={styles.copyTextBtn}>
                  {copiedDid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDid ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className={styles.keyDisplayBox}>{did}</div>
            </div>

            <div className={styles.fieldGroup}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className={styles.label} style={{ color: "#F59E0B" }}>
                  Private Entropy Seed (32-Byte Secret Hex)
                </label>
                <button type="button" onClick={handleCopySeed} className={styles.copyTextBtn}>
                  {copiedSeed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSeed ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className={styles.keyDisplayBox} style={{ color: "#fbbf24", borderColor: "#78350f" }}>
                {seedHex}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", flexWrap: "wrap", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  setActiveTab("import");
                }}
                className={styles.secondaryBtn}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Switch / Import Other Key</span>
              </button>

              {currentStep === 2 && (
                <button type="button" onClick={handleDownloadBackup} className={styles.actionBtn}>
                  <Download className="w-4 h-4" />
                  <span>Download Backup & Continue</span>
                </button>
              )}

              {currentStep === 3 && (
                <button type="button" onClick={handleBroadcastGenesis} className={styles.actionBtn}>
                  <Globe className="w-4 h-4" />
                  <span>Broadcast Genesis Tx to Testnet</span>
                </button>
              )}

              {currentStep === 4 && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10B981", fontSize: "12px", fontWeight: 800 }}>
                  <ShieldCheck className="w-5 h-5" />
                  <span>PERMANENTLY RECORDED ON TECHNOCORE TESTNET</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};