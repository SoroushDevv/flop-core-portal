"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./CyberBotAssistant.module.css";
import { BotMessagePayload } from "@/lib/botUtils";
import { AgentAvatarBot } from "./AgentAvatarBot";
import { Terminal, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export const CyberBotAssistant: React.FC = () => {
  const [message, setMessage] = useState<BotMessagePayload | null>({
    text: "FlopCore Autonomous Persona active. Ready for Technocore network instructions.",
    type: "info",
    duration: 5000,
  });
  const [isVisible, setIsVisible] = useState(true);
  const [activeDid, setActiveDid] = useState<string>(
    "did:key:z6MkoZA46EWPJR6HSFD92hEfGVGpLCE9YJvC7cDviwrQ8crj"
  );
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Initial message display for 5 seconds
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => {
      window.removeEventListener("storage", checkUserIdentity);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
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
        setTimeout(() => setMessage(null), 350);
      }, payload.duration || 4500);
    };

    window.addEventListener("bot-speak", handleBotSpeak);
    return () => window.removeEventListener("bot-speak", handleBotSpeak);
  }, []);

  const getStyleClass = () => {
    if (!message) return styles.bubbleInfo;
    switch (message.type) {
      case "success":
        return styles.bubbleSuccess;
      case "error":
        return styles.bubbleError;
      case "warning":
        return styles.bubbleWarning;
      default:
        return styles.bubbleInfo;
    }
  };

  const getIcon = () => {
    if (!message) return <Terminal className="w-3 h-3" />;
    switch (message.type) {
      case "success":
        return <CheckCircle2 className="w-3 h-3" />;
      case "error":
        return <XCircle className="w-3 h-3" />;
      case "warning":
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Terminal className="w-3 h-3" />;
    }
  };

  const getTitle = () => {
    if (!message) return "AGENT SYSTEM";
    switch (message.type) {
      case "success":
        return "VERIFIED";
      case "error":
        return "TRANSACTION FAILED";
      case "warning":
        return "PROTOCOL NOTICE";
      default:
        return "CORRIDOR RELAY";
    }
  };

  const handleBotClick = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMessage({
      text: `Identity Node [${activeDid.slice(0, 16)}...] synchronized with Technocore corridor.`,
      type: "info",
      duration: 4000,
    });
    setIsVisible(true);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 4000);
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

      <div
        className={`${styles.botAvatar} ${isVisible ? styles.botTalking : ""}`}
        onClick={handleBotClick}
      >
        <span className={styles.activeRing} />
        <AgentAvatarBot did={activeDid} size={76} isAnimated={true} />
      </div>
    </div>
  );
};