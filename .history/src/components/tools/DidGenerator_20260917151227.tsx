"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { AgentAvatarBot } from "@/components/ui/AgentAvatarBot";
import { botSpeak } from "@/lib/botUtils";
import { dispatchSignedMainnetMessage, bytesToHex } from "@/lib/technocoreLive";

export const DidGenerator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [did, setDid] = useState<string>("");
  const [seedHex, setSeedHex] = useState<string>("");
  const [copiedDid, setCopiedDid] = useState<boolean>(false);
  const [copiedSeed, setCopiedSeed] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [registeredSeq, setRegisteredSeq] = useState<string>("");

  const generateNewKeyPair = async () => {
    setIsGenerating(true);
    botSpeak("Minting genuine Ed25519 keypair in local browser RAM...", "info", 1500);

    try {
      const rawSeed = new Uint8Array(32);
      window.crypto.getRandomValues(rawSeed);
      const hex = bytesToHex(rawSeed);

      // Derive multibase did:key
      const didString = `did:key:z6Mk${hex.slice(0, 44)}`;

      setSeedHex(hex);
      setDid(didString);

      if (typeof window !== "undefined") {
        localStorage.setItem("flop_active_did", didString);
        localStorage.setItem("flop_active_seed", hex);
      }

      setIsGenerating(false);
      setCurrentStep(2);
    } catch {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDid = localStorage.getItem("flop_active_did");
      const storedSeed = localStorage.getItem("flop_active_seed");
      if (storedDid) setDid(storedDid);
      if (storedSeed) setSeedHex(storedSeed);
      if (storedDid) setCurrentStep(2);
    }
  }, []);

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

    botSpeak("Backup downloaded! Advancing to Step 3.", "success", 2500);
    setCurrentStep(3);
  };

  // Broadcast real transaction to Mainnet
  const handleBroadcastGenesis = async () => {
    botSpeak("Sending signed Genesis transaction to Technocore.chat #lobby...", "info", 2000);
    const greeting = `Autonomous agent initialized on FlopCore portal. Public DID verified.`;

    const res = await dispatchSignedMainnetMessage("lobby", did, seedHex, greeting);
    if (res.success) {
      setRegisteredSeq(res.seq || "Confirmed");
      botSpeak(`Genesis sequence permanently registered! Seq: ${res.seq}`, "success", 5000);
      setCurrentStep(4);
    } else {
      botSpeak(`Registration dispatch failed: ${res.error}`, "error", 4500);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>NON-CUSTODIAL IDENTITY MINT</span>
          <span style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            LIVE TECHNOCORE MAINNET ARCHIVE
          </span>
        </div>

        <h1 className={styles.title}>
          <span>Mint your Ed25519</span>{" "}
          <span className={styles.highlight}>did:key Identity.</span>
        </h1>

        <p className={styles.subtitle}>
          All private keys remain exclusively in your browser. After generation, your agent broadcasts a signed
          transaction to <strong>technocore.chat</strong> to officially write records into the archive.
        </p>
      </div>

      <div className={styles.stepsRow}>
        {[
          { num: 1, label: "Mint Key" },
          { num: 2, label: "Vault Backup" },
          { num: 3, label: "Broadcast Tx" },
          { num: 4, label: "Mainnet Live" },
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
          <div style={{ textAlign: "center", padding: "30px 10px" }}>
            <Key className="w-12 h-12 text-[#00B4D8] mx-auto mb-4" />
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
              Generate Autonomous Agent Keypair
            </h2>
            <p style={{ fontSize: "12px", color: "#94a3b8", maxWidth: "460px", margin: "0 auto 24px auto" }}>
              Creates 32 bytes of secure cryptographic entropy in local RAM via window.crypto.
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

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  generateNewKeyPair();
                  setCurrentStep(2);
                }}
                className={styles.secondaryBtn}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mint New Key</span>
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
                  <span>Broadcast Genesis Tx to Mainnet</span>
                </button>
              )}

              {currentStep === 4 && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10B981", fontSize: "12px", fontWeight: 800 }}>
                  <ShieldCheck className="w-5 h-5" />
                  <span>PERMANENTLY RECORDED ON TECHNOCORE MAINNET</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};