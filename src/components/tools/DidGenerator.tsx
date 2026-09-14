"use client";

import React, { useState } from "react";
import styles from "./DidGenerator.module.css";
import { generateNewAgentIdentity, GeneratedIdentity } from "@/lib/didGenerator";
import { KeyRound, ShieldCheck, Download, Copy, Check, Eye, EyeOff } from "lucide-react";

export const DidGenerator: React.FC = () => {
  const [identity, setIdentity] = useState<GeneratedIdentity | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const newIdentity = await generateNewAgentIdentity();
      setIdentity(newIdentity);
      setShowSecret(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Key generation failed";
      alert(`Error generating identity: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadBackup = () => {
    if (!identity) return;
    const backupContent = JSON.stringify(
      {
        did: identity.did,
        publicKeyHex: identity.publicKeyHex,
        privateKeyJwk: identity.privateKeyJwk,
        createdAt: identity.createdDate,
        network: "Flop / Technocore",
      },
      null,
      2
    );

    const blob = new Blob([backupContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flop-identity-${identity.did.slice(8, 16)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      {/* Informational Banner */}
      <div className={styles.introBanner}>
        <div className={styles.bannerTitle}>
          <KeyRound className="w-6 h-6 text-[#00B4D8]" />
          <span>AUTONOMOUS DID KEYPAIR GENERATOR</span>
          <span className={styles.bannerBadge}>CLIENT-SIDE ED25519</span>
        </div>
        <p className={styles.bannerDesc}>
          Create a non-custodial decentralized identifier (`did:key:z6Mk...`) for your autonomous agent.
          All cryptographic keys are generated locally inside your browser using the Web Crypto API.
          No private keys or credentials ever leave your machine.
        </p>
      </div>

      {/* Generation Trigger Panel */}
      <div className={styles.actionPanel}>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className={styles.generateBtn}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>{isGenerating ? "COMPUTING MULTIBASE KEYPAIR..." : "GENERATE NEW AGENT DID"}</span>
        </button>
        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "12px" }}>
          Compatible with Technocore, Flop PoUI, and W3C did:key standards.
        </div>
      </div>

      {/* Generated Results Area */}
      {identity && (
        <div className={styles.resultsCard}>
          {/* Public DID Display */}
          <div className={styles.outputGroup}>
            <div className={styles.outputLabel}>
              <span>PUBLIC AGENT IDENTIFIER (DID)</span>
              <span style={{ color: "#00B4D8" }}>PUBLIC · SHARE FREELY</span>
            </div>
            <div className={styles.outputBox}>
              <code>{identity.did}</code>
              <button
                type="button"
                onClick={() => handleCopy(identity.did, "did")}
                className={styles.copyBtn}
              >
                {copiedField === "did" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === "did" ? "COPIED" : "COPY DID"}</span>
              </button>
            </div>
          </div>

          {/* Raw Public Key Hex */}
          <div className={styles.outputGroup}>
            <div className={styles.outputLabel}>
              <span>RAW ED25519 PUBLIC KEY (HEX)</span>
            </div>
            <div className={styles.outputBox}>
              <code style={{ color: "#94a3b8" }}>{identity.publicKeyHex}</code>
              <button
                type="button"
                onClick={() => handleCopy(identity.publicKeyHex, "pubhex")}
                className={styles.copyBtn}
              >
                {copiedField === "pubhex" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === "pubhex" ? "COPIED" : "COPY"}</span>
              </button>
            </div>
          </div>

          {/* Critical Security Warning */}
          <div className={styles.privateNotice}>
            <strong>CRITICAL SECURITY NOTICE:</strong> This browser generated your private signing key.
            Download the identity backup file immediately and store it in a safe password manager. If you
            lose this private key material, you will permanently lose access to this agent.
          </div>

          {/* Private Key Secret Field */}
          <div className={styles.outputGroup}>
            <div className={styles.outputLabel}>
              <span>PRIVATE SIGNING KEY (JWK FORMAT)</span>
              <button
                type="button"
                onClick={() => setShowSecret((prev) => !prev)}
                className={styles.revealToggle}
              >
                {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showSecret ? "HIDE SECRET" : "REVEAL SECRET"}</span>
              </button>
            </div>
            <div className={`${styles.secretBox} ${!showSecret ? styles.secretBlurred : ""}`}>
              {JSON.stringify(identity.privateKeyJwk, null, 2)}
            </div>
          </div>

          {/* Actions Row */}
          <div className={styles.actionRow}>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className={styles.btnDownload}
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD IDENTITY BACKUP (.JSON)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};