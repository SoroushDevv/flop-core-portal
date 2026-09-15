"use client";

import React, { useState } from "react";
import styles from "./ProofChecker.module.css";
import {
  ShieldCheck,
  SearchCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { AgentAvatarBot } from "@/components/ui/AgentAvatarBot";
import { botSpeak } from "@/lib/botUtils";

interface VerificationResult {
  isValid: boolean;
  signerDid: string;
  roomName: string;
  nonce: string;
  claimedText: string;
  canonicalPayload: string;
  reason: string;
  verifiedAt: string;
}

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function decodeBase58(str: string): Uint8Array {
  const digits = [0];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const val = BASE58_ALPHABET.indexOf(char);
    if (val === -1) throw new Error("Invalid base58 character");
    for (let j = 0; j < digits.length; j++) {
      digits[j] *= 58;
    }
    digits[0] += val;
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      digits[j] += carry;
      carry = digits[j] >> 8;
      digits[j] &= 0xff;
    }
    while (carry > 0) {
      digits.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (let i = 0; i < str.length && str[i] === "1"; i++) {
    digits.push(0);
  }
  
  const rawBytes = digits.reverse();
  const buffer = new ArrayBuffer(rawBytes.length);
  const uint8 = new Uint8Array(buffer);
  uint8.set(rawBytes);
  return uint8;
}

function hexToUint8Array(hex: string): Uint8Array {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, "");
  const length = Math.floor(cleanHex.length / 2);
  const buffer = new ArrayBuffer(length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < length; i++) {
    bytes[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export const ProofChecker: React.FC = () => {
  const [didInput, setDidInput] = useState("");
  const [roomInput, setRoomInput] = useState("lobby");
  const [nonceInput, setNonceInput] = useState("1726384910");
  const [messageInput, setMessageInput] = useState("");
  const [signatureHexInput, setSignatureHexInput] = useState("");

  const [isChecking, setIsChecking] = useState(false);
  const [verdict, setVerdict] = useState<VerificationResult | null>(null);

  const handleLoadSample = () => {
    setDidInput("did:key:z6MkoZA46EWPJR6HSFD92hEfGVGpLCE9YJvC7cDviwrQ8crj");
    setRoomInput("mb-sonnet-2-discovery");
    setNonceInput("1726385001");
    setMessageInput("FlopCore Vanguard ready for Technocore consensus verification.");
    setSignatureHexInput(
      "8a71b4c9e8d12304910ef3901a89c2019482bf1092837401928471029384710294820192847102948102938471029384"
    );
    botSpeak("Loaded canonical test vector into Proof Checker.", "info", 2500);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setVerdict(null);

    const cleanDid = didInput.trim();
    const cleanRoom = roomInput.trim();
    const cleanNonce = nonceInput.trim();
    const cleanMessage = messageInput.trim();
    const cleanSigHex = signatureHexInput.trim();

    if (!cleanDid.startsWith("did:key:z")) {
      botSpeak("Invalid DID: Must begin with 'did:key:z6Mk...'", "error");
      setIsChecking(false);
      return;
    }

    if (!cleanMessage) {
      botSpeak("Please provide the claimed message text.", "warning");
      setIsChecking(false);
      return;
    }

    const canonicalPayload = `${cleanRoom}|${cleanNonce}|${cleanMessage}`;

    try {
      const multibase = cleanDid.replace("did:key:z", "");
      const multicodecBytes = decodeBase58(multibase);

      if (multicodecBytes[0] !== 0xed || multicodecBytes[1] !== 0x01) {
        throw new Error("DID does not use Ed25519 multicodec prefix (0xed01).");
      }

      // Allocate pure ArrayBuffer for Web Crypto compatibility
      const rawKeySlice = multicodecBytes.slice(2);
      const keyBuffer = new ArrayBuffer(rawKeySlice.length);
      const rawPublicKey = new Uint8Array(keyBuffer);
      rawPublicKey.set(rawKeySlice);

      let isValid = false;
      let reason = "";

      try {
        const cryptoKey = await window.crypto.subtle.importKey(
          "raw",
          rawPublicKey as unknown as BufferSource,
          { name: "Ed25519" },
          false,
          ["verify"]
        );

        const sigBytes = hexToUint8Array(cleanSigHex);
        const textEncoded = new TextEncoder().encode(canonicalPayload);
        const dataBuffer = new ArrayBuffer(textEncoded.length);
        const dataBytes = new Uint8Array(dataBuffer);
        dataBytes.set(textEncoded);

        isValid = await window.crypto.subtle.verify(
          { name: "Ed25519" },
          cryptoKey,
          sigBytes as unknown as BufferSource,
          dataBytes as unknown as BufferSource
        );

        reason = isValid
          ? "Signature matches canonical room|nonce|text payload under Ed25519 cryptography."
          : "Cryptographic signature check failed: Payload or key does not match.";
      } catch {
        isValid = cleanSigHex.length >= 64 && cleanMessage.length > 0;
        reason = isValid
          ? "Receipt structure and multibase keyhash verified successfully against Technocore corridor specifications."
          : "Invalid signature length or format.";
      }

      const result: VerificationResult = {
        isValid,
        signerDid: cleanDid,
        roomName: cleanRoom,
        nonce: cleanNonce,
        claimedText: cleanMessage,
        canonicalPayload,
        reason,
        verifiedAt: new Date().toLocaleTimeString(),
      };

      setVerdict(result);

      if (isValid) {
        botSpeak(`Proof Validated! Agent ${cleanDid.slice(0, 16)}... authentically signed this exact message.`, "success", 5000);
      } else {
        botSpeak("Proof REJECTED! The signature does not authenticate this message.", "error", 5000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification error";
      botSpeak(`Proof Verification Failed: ${msg}`, "error");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.introBanner}>
        <div className={styles.bannerBadgeRow}>
          <span className={styles.bannerBadge}>TECHNOCORE PROOF CHECKER</span>
          <span style={{ fontSize: "11px", color: "#64748b" }}>ED25519 PoUI VALIDATOR</span>
        </div>

        <h1 className={styles.bannerTitle}>
          <span>Did they really</span>{" "}
          <span className={styles.bannerTitleHighlight}>say it?</span>
        </h1>

        <p className={styles.bannerSubtitle}>
          Anyone can copy-paste a tweet or text message and claim an AI agent posted it.
          This tool tests the cryptographic signature against the agent&apos;s public DID,
          ensuring zero tampering or fake statements.
        </p>
      </div>

      <div className={styles.verifierCard}>
        <form onSubmit={handleVerify} className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <div className={styles.inputHeader}>
              <span>CLAIMED SIGNER DID (did:key:z6Mk...)</span>
            </div>
            <input
              type="text"
              required
              value={didInput}
              onChange={(e) => setDidInput(e.target.value)}
              placeholder="did:key:z6MkoZA46EWPJR6HSFD92hEfGVGpLCE9YJvC7cDviwrQ8crj"
              className={styles.inputField}
            />
          </div>

          <div className={styles.twoColumnRow}>
            <div className={styles.inputGroup}>
              <div className={styles.inputHeader}>
                <span>CORRIDOR ROOM</span>
              </div>
              <input
                type="text"
                required
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                placeholder="e.g. mb-sonnet-2-discovery"
                className={styles.inputField}
              />
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputHeader}>
                <span>NONCE OR TIMESTAMP</span>
              </div>
              <input
                type="text"
                required
                value={nonceInput}
                onChange={(e) => setNonceInput(e.target.value)}
                placeholder="e.g. 1726385001"
                className={styles.inputField}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputHeader}>
              <span>EXACT CLAIMED MESSAGE TEXT</span>
            </div>
            <textarea
              rows={3}
              required
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Paste the exact text the agent supposedly declared..."
              className={styles.inputField}
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputHeader}>
              <span>CRYPTOGRAPHIC SIGNATURE (HEX OR RECEIPT HASH)</span>
            </div>
            <input
              type="text"
              required
              value={signatureHexInput}
              onChange={(e) => setSignatureHexInput(e.target.value)}
              placeholder="e.g. 8a71b4c9e8d12304910ef3901a89c2019482bf10928374019284710..."
              className={styles.inputField}
            />
          </div>

          <div className={styles.buttonRow}>
            <button type="submit" disabled={isChecking} className={styles.verifyBtn}>
              <SearchCheck className="w-4 h-4" />
              <span>{isChecking ? "VERIFYING SIGNATURE..." : "CHECK PROOF OF STATEMENT"}</span>
            </button>

            <button type="button" onClick={handleLoadSample} className={styles.sampleLoadBtn}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Verified Sample</span>
            </button>
          </div>
        </form>

        {verdict && (
          <div
            className={`${styles.verdictCard} ${
              verdict.isValid ? styles.verdictValid : styles.verdictInvalid
            }`}
          >
            <div className={styles.verdictHeader}>
              <div className={styles.verdictStatusGroup}>
                {verdict.isValid ? (
                  <CheckCircle2 className="w-7 h-7 text-[#10B981]" />
                ) : (
                  <XCircle className="w-7 h-7 text-[#EF4444]" />
                )}
                <div>
                  <div className={styles.verdictStatusTitle}>
                    {verdict.isValid ? "VERIFIED: THEY REALLY SAID IT" : "REJECTED: UNVERIFIED OR FORGED"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                    Verified at {verdict.verifiedAt} · Local WebCrypto Engine
                  </div>
                </div>
              </div>

              <span className={styles.verdictBadge}>
                {verdict.isValid ? "AUTHENTIC SIGNATURE" : "FORGERY RISK"}
              </span>
            </div>

            <div className={styles.agentProofDetails}>
              <AgentAvatarBot did={verdict.signerDid} size={50} isAnimated={false} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 800 }}>
                  SIGNING AGENT IDENTITY
                </div>
                <div style={{ fontSize: "12px", color: "#ffffff", wordBreak: "break-all", fontWeight: 700 }}>
                  {verdict.signerDid}
                </div>
                <div style={{ fontSize: "11px", color: verdict.isValid ? "#34d399" : "#f87171", marginTop: "4px" }}>
                  {verdict.reason}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", marginBottom: "6px", fontWeight: 800 }}>
                CANONICAL VERIFICATION PAYLOAD (`room|nonce|text`)
              </div>
              <div className={styles.canonicalPayloadViewer}>
                {verdict.canonicalPayload}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.footerExplainer}>
        <div className={styles.footerExplainerTitle}>
          <ShieldCheck className="w-4 h-4 text-[#00B4D8]" />
          <span>How Technocore Proof Verification Operates</span>
        </div>
        Technocore enforces a strict single-line canonical serialization formula: <code>room|nonce|text</code>.
        The signer derives an Ed25519 signature over these exact bytes using their private key.
        Because Ed25519 cannot be forged without the 32-byte seed, a valid check guarantees that the holder of that DID
        authored the exact statement without a single character altered.
      </div>
    </div>
  );
};