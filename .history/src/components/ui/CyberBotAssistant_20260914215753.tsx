"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./CyberBotAssistant.module.css";
import { BotMessagePayload } from "@/lib/botUtils";
import { AgentAvatarBot } from "./AgentAvatarBot";
import { Terminal, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export const CyberBotAssistant: React.FC = () => {
  const [message, setMessage] = useState<BotMessagePayload | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeDid, setActiveDid] = useState<string>(
    "did:key:z6MkoZA46EWPJR6HSFD92hEfGVGpLCE9YJvC7cDviwrQ8crj"
  );
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync active user identity from storage or custom events
  useEffect(() => {
    const checkUserIdentity = () => {
      if (typeof window !== "undefined") {
        const storedDid = localStorage.getItem("flop_active_did");
        if (storedDid && storedDid.startsWith("did:key:")) {
          setActiveDid(storedDid);
        }
      }
    };

    checkUserIdentity();
    window.addEventListener("storage", checkUserIdentity);
    return () => window.removeEventListener("storage", checkUserIdentity);
  }, []);

  useEffect(() => {
    const handleBotSpeak = (event: Event) => {
      const customEvent = event as CustomEvent<BotMessagePayload>;
      const payload = customEvent.detail;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setMessage(payload);
      setIsVisible(true);

      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setMessage(null), 300);
      }, payload.duration || 4500);
    };

    window.addEventListener("bot-speak", handleBotSpeak);
    return () => window.removeEventListener("bot-speak", handleBotSpeak);
  }, []);

  const getStyleClass = () => {
    if (!message) return styles.bubbleInfo;
    switch (message.type) {
      case "success": return styles.bubbleSuccess;
      case "error": return styles.bubbleError;
      case "warning": return styles.bubbleWarning;
      default: return styles.bubbleInfo;
    }
  };

  const getIcon = () => {
    if (!message) return <Terminal className="w-3 h-3" />;
    switch (message.type) {
      case "success": return <CheckCircle2 className="w-3 h-3" />;
      case "error": return <XCircle className="w-3 h-3" />;
      case "warning": return <AlertTriangle className="w-3 h-3" />;
      default: return <Terminal className="w-3 h-3" />;
    }
  };

  const getTitle = () => {
    if (!message) return "AGENT SYSTEM";
    switch (message.type) {
      case "success": return "VERIFIED";
      case "error": return "TRANSACTION FAILED";
      case "warning": return "PROTOCOL NOTICE";
      default: return "CORRIDOR RELAY";
    }
  };

  return (
    <div className={styles.botContainer}>
      {isVisible && message && (
        <div className={`${styles.speechBubble} ${getStyleClass()}`}>
          <div className={styles.messageTitle}>
            {getIcon()}
            <span>{getTitle()}</span>
          </div>
          <div className={styles.messageText}>{message.text}</div>
          <div style={{ marginTop: "6px", fontSize: "9px", color: "#64748b" }}>
            AGENT: {activeDid.slice(0, 14)}...{activeDid.slice(-4)}
          </div>
        </div>
      )}

      {/* 3D Capsule-Head Robot matching the exact user screenshot */}
      <div
        className={`${styles.botAvatar} ${isVisible ? styles.botTalking : ""}`}
        onClick={() => {
          if (!isVisible) {
            setIsVisible(true);
            setMessage({
              text: `Agent ${activeDid.slice(0, 16)}... online and ready for Technocore corridor instructions.`,
              type: "info",
              duration: 4000,
            });
            setTimeout(() => setIsVisible(false), 4000);
          }
        }}
      >
        <AgentAvatarBot did={activeDid} size={74} isAnimated={true} />
      </div>
    </div>
  );
};