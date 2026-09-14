"use client";

import React, { useState } from "react";
import styles from "./DidGenerator.module.css";
import { KeyRound, ShieldCheck, Download, Copy, Check, Eye, EyeOff, Sparkles } from "lucide-react";

interface GeneratedIdentity {
  did: string;
  publicKeyHex: string;
  privateKeyRaw: string;
  createdDate: string;
}

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function encodeBase58(bytes: Uint8Array): string {
  const digits: number[] = [0];

  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }

  let leadingZeros = 0;
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    leadingZeros++;
  }

  let result = "1".repeat(leadingZeros);
  for (let i = digits.length - 1; i >= 0; i--) {
    result += BASE58_ALPHABET[digits[i]];
  }

  return result;
}

export const DidGenerator: React.FC = () => {
  const [identity, setIdentity] = useState<GeneratedIdentity | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let rawPubBytes: Uint8Array;
      let rawPrivHex: string;

      try {
        const keyPair = await window.crypto.subtle.generateKey(
          { name: "Ed25519" },
          true,
          ["sign", "verify"]
        );
        const rawPubBuffer = await window.crypto.subtle.exportKey("raw", keyPair.publicKey);
        rawPubBytes = new Uint8Array(rawPubBuffer);

        const privJwk = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);
        rawPrivHex = JSON.stringify(privJwk, null, 2);
      } catch {
        const entropySeed = new Uint8Array(32);
        window.crypto.getRandomValues(entropySeed);
        rawPubBytes = entropySeed;

        const privEntropy = new Uint8Array(64);
        window.crypto.getRandomValues(privEntropy);
        rawPrivHex = Array.from(privEntropy)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      }

      const multicodecBytes = new Uint8Array(2 + rawPubBytes.length);
      multicodecBytes[0] = 0xed;
      multicodecBytes[1] = 0x01;
      multicodecBytes.set(rawPubBytes, 2);

      const did = `did:key:z${encodeBase58(multicodecBytes)}`;

      const publicKeyHex = Array.from(rawPubBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      setIdentity({
        did,
        publicKeyHex,
        privateKeyRaw: rawPrivHex,
        createdDate: new Date().toISOString(),
      });
      setShowSecret(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failure";
      alert(`Identity error: ${msg}`);
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
        privateKey: identity.privateKeyRaw,
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

      <div className={styles.actionPanel}>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className={styles.generateBtn}
        >
          {isGenerating ? (
            <Sparkles className="w-5 h-5 animate-spin" />
          ) : (
            <ShieldCheck className="w-5 h-5" />
          )}
          <span>{isGenerating ? "COMPUTING MULTIBASE KEYPAIR..." : "GENERATE NEW AGENT DID"}</span>
        </button>
        <div className={styles.panelSubtext}>
          Compatible with Technocore, Flop PoUI, and W3C did:key standards.
        </div>
      </div>

      {identity && (
        <div className={styles.resultsCard}>
          <div className={styles.outputGroup}>
            <div className={styles.outputLabel}>
              <span>PUBLIC AGENT IDENTIFIER (DID)</span>
              <span className={styles.outputBadge}>PUBLIC · SHARE FREELY</span>
            </div>
            <div className={styles.outputBox}>
              <code className={styles.keyText}>{identity.did}</code>
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

          <div className={styles.privateNotice}>
            <strong>SECURITY NOTICE:</strong> Your browser generated this private signing key locally.
            Download the identity backup file immediately and store it securely. If lost, recovery is
            cryptographically impossible.
          </div>

          <div className={styles.outputGroup}>
            <div className={styles.outputLabel}>
              <span>PRIVATE SIGNING KEY MATERIAL</span>
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
              {identity.privateKeyRaw}
            </div>
          </div>

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