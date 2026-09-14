"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./CyberBotAssistant.module.css";
import { BotMessagePayload } from "@/lib/botUtils";
import { Terminal, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export const CyberBotAssistant: React.FC = () => {
  const [message, setMessage] = useState<BotMessagePayload | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        setTimeout(() => setMessage(null), 300); // Wait for transition
      }, payload.duration || 4000);
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
    if (!message) return "SYSTEM";
    switch (message.type) {
      case "success": return "VERIFIED";
      case "error": return "CRITICAL ERROR";
      case "warning": return "WARNING";
      default: return "AGENT RELAY";
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
        </div>
      )}

      {/* 3D Isometric Cyber-Bot SVG */}
      <div className={`${styles.botAvatar} ${isVisible ? styles.botTalking : ""}`}>
        <svg viewBox="0 0 120 120" className={styles.svgModel}>
          <defs>
            <linearGradient id="armorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#162238" />
              <stop offset="100%" stopColor="#070b14" />
            </linearGradient>
            <linearGradient id="visorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00b4d8" />
              <stop offset="50%" stopColor="#90e0ef" />
              <stop offset="100%" stopColor="#00b4d8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Hexagonal Isometric Base */}
          <polygon 
            points="60,10 105,35 105,85 60,110 15,85 15,35" 
            fill="url(#armorGradient)" 
            stroke="#00b4d8" 
            strokeWidth="2"
          />
          
          {/* Inner 3D Panels */}
          <polygon points="60,10 105,35 60,55 15,35" fill="rgba(0, 180, 216, 0.1)" stroke="#00b4d8" strokeWidth="1"/>
          <polygon points="15,35 60,55 60,110 15,85" fill="rgba(0, 0, 0, 0.4)" stroke="#00b4d8" strokeWidth="1"/>
          <polygon points="105,35 60,55 60,110 105,85" fill="rgba(255, 255, 255, 0.02)" stroke="#00b4d8" strokeWidth="1"/>

          {/* Core Visor Plate */}
          <path 
            d="M 35,50 L 85,50 L 75,80 L 45,80 Z" 
            fill="#020409" 
            stroke="#00b4d8" 
            strokeWidth="2"
          />

          {/* Animated Glowing Eye / Scanner */}
          <rect 
            x="45" y="60" width="30" height="8" rx="4" 
            fill="url(#visorGradient)" 
            filter="url(#glow)" 
            className={styles.eyeScanner}
          />

          {/* Floating Halos / Rings */}
          <ellipse cx="60" cy="115" rx="30" ry="8" fill="none" stroke="rgba(0, 180, 216, 0.4)" strokeWidth="1.5" />
          <ellipse cx="60" cy="115" rx="15" ry="4" fill="rgba(0, 180, 216, 0.2)" />
        </svg>
      </div>
    </div>
  );
};