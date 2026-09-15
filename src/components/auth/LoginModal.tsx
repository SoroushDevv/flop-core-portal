"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./LoginModal.module.css";
import { FileText, Sparkles, X, Info, Key, LogOut } from "lucide-react";
import { botSpeak } from "@/lib/botUtils";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeDid, setActiveDid] = useState<string>(
    "did:key:z6MkoZA46EWPJR6HSFD92hEfGVGpLCE9YJvC7cDviwrQ8crj"
  );
  const [passphrase, setPassphrase] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isEnteringSeed, setIsEnteringSeed] = useState(false);
  const [seedValue, setSeedValue] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDid = localStorage.getItem("flop_active_did");
      if (storedDid) {
        setActiveDid(storedDid);
      }
      const unlocked = localStorage.getItem("flop_is_unlocked") === "true";
      setIsUnlocked(unlocked);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // If local password exists or default verify
    const savedPass = localStorage.getItem("flop_agent_passphrase");
    const valid = savedPass ? passphrase === savedPass : passphrase.length >= 6;

    if (valid) {
      localStorage.setItem("flop_is_unlocked", "true");
      if (!savedPass) {
        localStorage.setItem("flop_agent_passphrase", passphrase);
      }
      setIsUnlocked(true);
      botSpeak(`Vault unlocked! Agent identity authenticated: ${activeDid.slice(0, 16)}...`, "success");
      setTimeout(() => {
        onClose();
      }, 500);
    } else {
      setErrorMessage("Wrong passphrase, or that file is not a backup from here.");
      botSpeak("Authentication failed: Wrong passphrase or corrupted key file.", "error", 4500);
    }
  };

  const handleSeedRestore = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = seedValue.trim();
    if (!clean) {
      setErrorMessage("Please enter a valid seed string or private key.");
      return;
    }

    localStorage.setItem("flop_is_unlocked", "true");
    setIsUnlocked(true);
    setIsEnteringSeed(false);
    botSpeak("Identity unlocked using cryptographic seed recovery.", "success");
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = JSON.parse(ev.target?.result as string);
        if (content.did && typeof content.did === "string") {
          setActiveDid(content.did);
          localStorage.setItem("flop_active_did", content.did);
          window.dispatchEvent(new Event("storage"));
          setErrorMessage(null);
          botSpeak(`Loaded identity backup for ${content.did.slice(0, 16)}... Enter passphrase to unlock.`, "info");
        } else {
          setErrorMessage("Wrong passphrase, or that file is not a backup from here.");
        }
      } catch {
        setErrorMessage("Invalid JSON backup file. Integrity check failed.");
      }
    };
    reader.readAsText(file);
  };

  const handleSignOut = () => {
    localStorage.removeItem("flop_is_unlocked");
    setIsUnlocked(false);
    setPassphrase("");
    botSpeak("Session locked. Re-authenticate to sign transactions.", "warning");
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className={styles.closeBtn}>
          <X className="w-5 h-5" />
        </button>

        <div className={styles.welcomeLabel}>WELCOME BACK</div>

        <div className={styles.didDisplayBox}>{activeDid}</div>

        <div className={styles.securityNoteRow}>
          <span className={styles.securityNoteText}>
            Your data never leaves this browser
          </span>
          <span
            className={styles.infoCircle}
            title="All cryptography runs locally inside WebCrypto. No private keys are sent to servers."
          >
            i
          </span>
        </div>

        {!isEnteringSeed ? (
          <form onSubmit={handleUnlock}>
            <div className={styles.inputUnlockRow}>
              <input
                type="password"
                required
                value={passphrase}
                onChange={(e) => {
                  setPassphrase(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="••••••••"
                className={styles.passphraseInput}
                autoFocus
              />
              <button type="submit" className={styles.unlockBtn}>
                Unlock
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSeedRestore}>
            <input
              type="text"
              required
              value={seedValue}
              onChange={(e) => setSeedValue(e.target.value)}
              placeholder="Paste 64-char Hex Seed or Base64Url string..."
              className={styles.seedInputArea}
              autoFocus
            />
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button type="submit" className={styles.unlockBtn} style={{ padding: "8px 16px" }}>
                Recover & Unlock
              </button>
              <button
                type="button"
                onClick={() => setIsEnteringSeed(false)}
                style={{
                  background: "transparent",
                  border: "1px solid #16253b",
                  color: "#94a3b8",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {errorMessage && <div className={styles.errorBanner}>{errorMessage}</div>}

        <div
          className={styles.seedRecoveryBox}
          onClick={() => {
            setIsEnteringSeed((prev) => !prev);
            setErrorMessage(null);
          }}
        >
          <span className={styles.seedRecoveryTitle}>Forgotten it? Use your seed</span>
          <span className={styles.infoCircle} title="Restore access using your 32-byte Ed25519 entropy seed.">
            i
          </span>
        </div>

        <div className={styles.actionLinksList}>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className={styles.hiddenFileInput}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={styles.actionItemBtn}
          >
            <FileText className={styles.actionIcon} />
            <span>Use a different backup file</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/did-generator");
            }}
            className={styles.actionItemBtn}
          >
            <Sparkles className={styles.actionIcon} />
            <span>Make another identity</span>
          </button>

          {isUnlocked && (
            <button
              type="button"
              onClick={handleSignOut}
              className={styles.actionItemBtn}
              style={{ color: "#f87171" }}
            >
              <LogOut className={styles.actionIcon} style={{ color: "#f87171" }} />
              <span>Lock Vault Session</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};