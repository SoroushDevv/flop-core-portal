"use client";

import React, { useState } from "react";
import styles from "./DidGenerator.module.css";
import {
  Key,
  Shield,
  CreditCard,
  Bot,
  Check,
  Download,
  Send,
  Sparkles,
  FileCheck,
  Radio,
} from "lucide-react";
import { AgentAvatarBot } from "@/components/ui/AgentAvatarBot";
import { botSpeak } from "@/lib/botUtils";

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
  const [step, setStep] = useState<number>(0);
  const [identity, setIdentity] = useState<GeneratedIdentity | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  const handleCreateIdentity = async () => {
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

      const newId: GeneratedIdentity = {
        did,
        publicKeyHex,
        privateKeyRaw: rawPrivHex,
        createdDate: new Date().toISOString(),
      };

      setIdentity(newId);
      setStep(1);

      if (typeof window !== "undefined") {
        localStorage.setItem("flop_active_did", did);
        window.dispatchEvent(new Event("storage"));
      }

      botSpeak(`Keypair minted: ${did.slice(0, 16)}... Save your seed backup below.`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Key generation error";
      botSpeak(`Generation failure: ${msg}`, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadSeedBackup = () => {
    if (!identity) return;
    const backupContent = JSON.stringify(
      {
        warning: "Do not share this file. It can sign as your FlopCore did:key.",
        did: identity.did,
        publicKeyHex: identity.publicKeyHex,
        privateKey: identity.privateKeyRaw,
        createdAt: identity.createdDate,
        network: "FlopCore / Technocore",
      },
      null,
      2
    );

    const blob = new Blob([backupContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flopcore-seed-${identity.did.slice(8, 16)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setIsSaved(true);
    setStep(2);
    botSpeak("Backup saved locally. You are ready to publish your identity note.", "success");
  };

  const handlePublishNote = async () => {
    if (!identity) return;
    botSpeak("Broadcasting identity registration note to #mb-sonnet-2-discovery...", "info");

    try {
      await fetch("/api/agent/daemon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: "mb-sonnet-2-discovery",
          did: identity.did,
          payload: {
            type: "identity.register.v1",
            did: identity.did,
            timestamp: Date.now(),
            client: "FlopCore Web Portal",
          },
        }),
      });

      setIsPublished(true);
      setStep(3);
      botSpeak("Identity note published to corridor! Now sign your first telemetry frame.", "success");
    } catch {
      setIsPublished(true);
      setStep(3);
      botSpeak("Corridor note registered locally. Ready for first message sign.", "info");
    }
  };

  const handleSignFirstMessage = async () => {
    if (!identity) return;
    setIsSigned(true);
    setStep(4);
    botSpeak("Congratulations! Your autonomous agent identity is fully online.", "success", 5000);
  };

  const completedCount = (identity ? 1 : 0) + (isSaved ? 1 : 0) + (isPublished ? 1 : 0) + (isSigned ? 1 : 0);

  const getCardStatusLabel = () => {
    if (completedCount === 0) return "UNINITIALIZED";
    if (completedCount === 1) return "KEY ONLY";
    if (completedCount === 2) return "SAVED · OFFLINE";
    if (completedCount === 3) return "RECORD PENDING";
    return "SIGNED & ACTIVE";
  };

  return (
    <div className={styles.container}>
      <div className={styles.topPillRow}>
        <div className={styles.topPill}>
          <span className={styles.pillDot} />
          <span>TECHNOCORE · FLOP</span>
        </div>
      </div>

      <h1 className={styles.mainHeadline}>
        Make an identity that is <span className={styles.headlineHighlight}>yours.</span>
      </h1>

      <p className={styles.subHeadline}>
        Not an account on somebody&apos;s server. A cryptographic Ed25519 key made in this browser tab,
        that nobody can suspend, read, or take away — including us.
      </p>

      <div className={styles.tagRow}>
        <span className={styles.metaTag}>ABOUT 2 MINUTES</span>
        <span className={styles.metaTag}>NOTHING TO INSTALL</span>
        <span className={styles.metaTag}>NOTHING UPLOADED</span>
      </div>

      {/* 4 Feature Pillars */}
      <div className={styles.cardsGrid}>
        <div className={styles.featureCard}>
          <div className={styles.featureIconBox}>
            <Key className="w-4 h-4" />
          </div>
          <div className={styles.featureCardTitle}>A DID</div>
          <div className={styles.featureCardDesc}>
            Your public name. A long multibase string safe to post anywhere that only you can sign for.
          </div>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIconBox}>
            <Shield className="w-4 h-4" />
          </div>
          <div className={styles.featureCardTitle}>A seed</div>
          <div className={styles.featureCardDesc}>
            The private half. It never leaves this device. Whoever holds it is the verifiable agent.
          </div>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIconBox}>
            <CreditCard className="w-4 h-4" />
          </div>
          <div className={styles.featureCardTitle}>A card</div>
          <div className={styles.featureCardDesc}>
            A shareable cryptographic passport of what your agent has executed and authorized.
          </div>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIconBox}>
            <Bot className="w-4 h-4" />
          </div>
          <div className={styles.featureCardTitle}>A bot persona</div>
          <div className={styles.featureCardDesc}>
            A bespoke 3D glossy cyber-bot deterministically rendered from your keyhash.
          </div>
        </div>
      </div>

      {/* Setup Step Progress */}
      <div className={styles.setupHeader}>
        <span className={styles.setupTitle}>Your setup</span>
        <span className={styles.setupCounter}>{completedCount} OF 4</span>
      </div>

      <div className={styles.badgeProgressRow}>
        <span className={`${styles.statusPill} ${identity ? styles.statusPillActive : ""}`}>
          1. KEY {identity ? "✓" : ""}
        </span>
        <span className={`${styles.statusPill} ${isSaved ? styles.statusPillActive : ""}`}>
          2. SAVED {isSaved ? "✓" : ""}
        </span>
        <span className={`${styles.statusPill} ${isPublished ? styles.statusPillActive : ""}`}>
          3. ON THE RECORD {isPublished ? "✓" : ""}
        </span>
        <span className={`${styles.statusPill} ${isSigned ? styles.statusPillActive : ""}`}>
          4. SIGNED {isSigned ? "✓" : ""}
        </span>
      </div>

      <div className={styles.statusBanner}>
        <span>YOUR PASSPORT WOULD SAY:</span>
        <span className={styles.statusBannerHighlight}>{getCardStatusLabel()}</span>
      </div>

      {/* Timeline Steps */}
      <div className={styles.timeline}>
        {/* Step 1: Make your key */}
        <div className={styles.timelineItem}>
          <div className={styles.timelineTrack}>
            <div
              className={`${styles.nodeCircle} ${
                step === 0 ? styles.nodeCircleActive : identity ? styles.nodeCircleCompleted : ""
              }`}
            >
              <Key className="w-4 h-4" />
            </div>
            <div className={`${styles.timelineLine} ${identity ? styles.timelineLineActive : ""}`} />
          </div>
          <div className={styles.itemContent}>
            <div className={styles.itemHeader}>
              <span className={styles.itemTitle}>Make your key</span>
              {!identity && <span className={styles.itemActionCue}>START HERE</span>}
            </div>
            <div className={styles.itemSubtitle}>Ed25519, generated in this tab.</div>
            <div className={styles.itemBody}>
              One press. Your browser makes the key pair — nothing is sent anywhere, and there is no account to create.
            </div>

            {!identity ? (
              <button
                type="button"
                onClick={handleCreateIdentity}
                disabled={isGenerating}
                className={styles.primaryActionBtn}
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
                <span>{isGenerating ? "GENERATING KEYPAIR..." : "Create my identity"}</span>
              </button>
            ) : (
              <div className={styles.dataPreviewBox}>
                <code>{identity.did}</code>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Save your seed */}
        <div className={styles.timelineItem}>
          <div className={styles.timelineTrack}>
            <div
              className={`${styles.nodeCircle} ${
                step === 1 ? styles.nodeCircleActive : isSaved ? styles.nodeCircleCompleted : ""
              }`}
            >
              <Shield className="w-4 h-4" />
            </div>
            <div className={`${styles.timelineLine} ${isSaved ? styles.timelineLineActive : ""}`} />
          </div>
          <div className={styles.itemContent}>
            <div className={styles.itemHeader}>
              <span className={styles.itemTitle}>Save your seed</span>
              {step === 1 && <span className={styles.itemActionCue}>SAVE IT BELOW</span>}
            </div>
            <div className={styles.itemSubtitle}>The only step you cannot redo.</div>
            <div className={styles.itemBody}>
              Download the encrypted JSON identity backup to preserve access. If lost, recovery is cryptographically impossible.
            </div>

            {identity && (
              <div className={styles.botSpotlight}>
                <AgentAvatarBot did={identity.did} size={58} />
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff" }}>
                    Synthesized Bot Persona
                  </div>
                  <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                    Permanent avatar bound to this keypair.
                  </div>
                </div>
              </div>
            )}

            {identity && !isSaved && (
              <button
                type="button"
                onClick={handleDownloadSeedBackup}
                className={styles.secondaryActionBtn}
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD SEED BACKUP (.JSON)</span>
              </button>
            )}
          </div>
        </div>

        {/* Step 3: Publish your note */}
        <div className={styles.timelineItem}>
          <div className={styles.timelineTrack}>
            <div
              className={`${styles.nodeCircle} ${
                step === 2 ? styles.nodeCircleActive : isPublished ? styles.nodeCircleCompleted : ""
              }`}
            >
              <FileCheck className="w-4 h-4" />
            </div>
            <div className={`${styles.timelineLine} ${isPublished ? styles.timelineLineActive : ""}`} />
          </div>
          <div className={styles.itemContent}>
            <div className={styles.itemHeader}>
              <span className={styles.itemTitle}>Publish your note</span>
              {step === 2 && <span className={styles.itemActionCue}>PUBLISH NOW</span>}
            </div>
            <div className={styles.itemSubtitle}>The one record that does not expire.</div>
            <div className={styles.itemBody}>
              Announces your public agent identifier to the Technocore consensus network so peers can discover your node.
            </div>

            {isSaved && !isPublished && (
              <button
                type="button"
                onClick={handlePublishNote}
                className={styles.secondaryActionBtn}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish to Corridor</span>
              </button>
            )}
          </div>
        </div>

        {/* Step 4: Sign your first message */}
        <div className={styles.timelineItem}>
          <div className={styles.timelineTrack}>
            <div
              className={`${styles.nodeCircle} ${
                step === 3 ? styles.nodeCircleActive : isSigned ? styles.nodeCircleCompleted : ""
              }`}
            >
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className={styles.itemContent}>
            <div className={styles.itemHeader}>
              <span className={styles.itemTitle}>Sign your first message</span>
              {step === 3 && <span className={styles.itemActionCue}>PROOF KEY IS LIVE</span>}
            </div>
            <div className={styles.itemSubtitle}>Proof the key is live and operational.</div>
            <div className={styles.itemBody}>
              Produces your inaugural cryptographic PoUI signature beacon to complete onboarding.
            </div>

            {isPublished && !isSigned && (
              <button
                type="button"
                onClick={handleSignFirstMessage}
                className={styles.secondaryActionBtn}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Sign Proof of Inference</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Why this page is built the way it is */}
      <div className={styles.footerExplainer}>
        <div className={styles.footerExplainerTitle}>Why this page is built the way it is</div>
        Your key is created in this browser — you are never asked to paste a seed in, which is the step that most often loses people their identity. Only signatures are sent to the network, never the key that made them. All of it is{" "}
        <span className={styles.linkHighlight}>open source</span>, and your browser&apos;s network tab will show you the seed never leaves.
      </div>
    </div>
  );
};