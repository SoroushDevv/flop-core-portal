"use client";

import React, { useMemo } from "react";
import styles from "./AgentAvatarBot.module.css";

interface AgentAvatarBotProps {
  did?: string;
  size?: number;
  className?: string;
  isAnimated?: boolean;
}

interface BotTraits {
  uid: string;
  colorTheme: {
    primaryStart: string;
    primaryEnd: string;
    highlight: string;
    shadow: string;
    eyeColor: string;
  };
  headgear: "halo" | "antenna" | "dual-antenna" | "bolts";
  eyeShape: "dots" | "bars" | "capsule" | "curved";
  mouthShape: "none" | "smile" | "line" | "dot";
  screenTint: string;
}

function hashDid(did: string): number {
  let hash = 2166136261;
  const clean = did || "did:key:z6MkoZA46EWPJR6HSFD92hEfGVGpLCE9YJvC7cDviwrQ8crj";
  for (let i = 0; i < clean.length; i++) {
    hash ^= clean.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export const AgentAvatarBot: React.FC<AgentAvatarBotProps> = ({
  did = "did:key:z6MkoZA46EWPJR6HSFD92hEfGVGpLCE9YJvC7cDviwrQ8crj",
  size = 64,
  className = "",
  isAnimated = true,
}) => {
  const traits = useMemo<BotTraits>(() => {
    const h = hashDid(did);
    const uid = `bot-${h % 100000}`;

    // Color themes matching the screenshot (Electric Blue, Cyan, Emerald/Teal, Soft Slate-Cyan)
    const colorThemes = [
      {
        primaryStart: "#00B4D8",
        primaryEnd: "#0077B6",
        highlight: "#90E0EF",
        shadow: "#03045E",
        eyeColor: "#CAF0F8",
      },
      {
        primaryStart: "#0077B6",
        primaryEnd: "#023E8A",
        highlight: "#00B4D8",
        shadow: "#011c40",
        eyeColor: "#90E0EF",
      },
      {
        primaryStart: "#10B981",
        primaryEnd: "#059669",
        highlight: "#6EE7B7",
        shadow: "#064E3B",
        eyeColor: "#D1FAE5",
      },
      {
        primaryStart: "#0EA5E9",
        primaryEnd: "#0284C7",
        highlight: "#BAE6FD",
        shadow: "#075985",
        eyeColor: "#E0F2FE",
      },
      {
        primaryStart: "#06B6D4",
        primaryEnd: "#0891B2",
        highlight: "#A5F3FC",
        shadow: "#164E63",
        eyeColor: "#ECFEFF",
      },
    ];

    const headgears: BotTraits["headgear"][] = ["halo", "antenna", "dual-antenna", "bolts"];
    const eyeShapes: BotTraits["eyeShape"][] = ["dots", "bars", "capsule", "curved"];
    const mouthShapes: BotTraits["mouthShape"][] = ["none", "smile", "line", "dot"];

    return {
      uid,
      colorTheme: colorThemes[h % colorThemes.length],
      headgear: headgears[(h >> 3) % headgears.length],
      eyeShape: eyeShapes[(h >> 6) % eyeShapes.length],
      mouthShape: mouthShapes[(h >> 9) % mouthShapes.length],
      screenTint: "#020612",
    };
  }, [did]);

  const { uid, colorTheme, headgear, eyeShape, mouthShape } = traits;

  return (
    <div
      className={`${styles.botWrapper} ${className}`}
      style={{ width: size, height: size }}
      title={did}
    >
      <svg
        viewBox="0 0 100 100"
        className={styles.botSvg}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main 3D Capsule Helmet Gradient */}
          <radialGradient
            id={`${uid}-helmet`}
            cx="40%"
            cy="28%"
            r="65%"
            fx="38%"
            fy="25%"
          >
            <stop offset="0%" stopColor={colorTheme.highlight} />
            <stop offset="42%" stopColor={colorTheme.primaryStart} />
            <stop offset="85%" stopColor={colorTheme.primaryEnd} />
            <stop offset="100%" stopColor={colorTheme.shadow} />
          </radialGradient>

          {/* Glossy Curved Visor Reflection */}
          <linearGradient id={`${uid}-screen`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#040915" />
            <stop offset="100%" stopColor="#02040A" />
          </linearGradient>

          <linearGradient id={`${uid}-glassGloss`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <filter id={`${uid}-softShadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* --- HEADGEAR ACCESSORIES --- */}
        {headgear === "halo" && (
          <g className={isAnimated ? styles.haloFloat : ""}>
            <ellipse
              cx="50"
              cy="20"
              rx="24"
              ry="7"
              stroke={colorTheme.highlight}
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            <ellipse
              cx="50"
              cy="20"
              rx="24"
              ry="7"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeDasharray="14 30"
              fill="none"
            />
          </g>
        )}

        {headgear === "antenna" && (
          <g className={isAnimated ? styles.antennaPulse : ""}>
            <line x1="50" y1="24" x2="50" y2="14" stroke={colorTheme.primaryEnd} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="50" cy="11" r="5" fill={colorTheme.highlight} />
            <circle cx="50" cy="11" r="2.2" fill="#ffffff" />
          </g>
        )}

        {headgear === "dual-antenna" && (
          <g className={isAnimated ? styles.antennaPulse : ""}>
            <line x1="36" y1="26" x2="30" y2="15" stroke={colorTheme.primaryEnd} strokeWidth="3" strokeLinecap="round" />
            <circle cx="29" cy="13" r="4" fill={colorTheme.highlight} />
            <line x1="64" y1="26" x2="70" y2="15" stroke={colorTheme.primaryEnd} strokeWidth="3" strokeLinecap="round" />
            <circle cx="71" cy="13" r="4" fill={colorTheme.highlight} />
          </g>
        )}

        {/* --- EAR BOLTS / AUDIO NODES --- */}
        <rect x="11" y="47" width="7" height="18" rx="3.5" fill={colorTheme.primaryEnd} stroke={colorTheme.shadow} strokeWidth="1" />
        <rect x="82" y="47" width="7" height="18" rx="3.5" fill={colorTheme.primaryEnd} stroke={colorTheme.shadow} strokeWidth="1" />
        <circle cx="14.5" cy="56" r="1.8" fill={colorTheme.highlight} />
        <circle cx="85.5" cy="56" r="1.8" fill={colorTheme.highlight} />

        {/* --- 3D CAPSULE HELMET HEAD (Matching screenshot form-factor) --- */}
        <rect
          x="16"
          y="23"
          width="68"
          height="62"
          rx="26"
          fill={`url(#${uid}-helmet)`}
          filter={`url(#${uid}-softShadow)`}
        />

        {/* Subtle Helmet Top Highlight Specular */}
        <ellipse cx="50" cy="30" rx="20" ry="4.5" fill="#ffffff" fillOpacity="0.28" />

        {/* --- INNER SCREEN / VISOR BEZEL --- */}
        <rect
          x="24"
          y="35"
          width="52"
          height="39"
          rx="15"
          fill="#0a101f"
          stroke={colorTheme.primaryEnd}
          strokeWidth="1.6"
        />

        {/* Visor Screen Deep Face */}
        <rect
          x="26"
          y="37"
          width="48"
          height="35"
          rx="13"
          fill={`url(#${uid}-screen)`}
        />

        {/* Screen Top Glass Gloss Curve */}
        <path
          d="M 27 47 C 33 41, 67 41, 73 47 L 73 41 C 73 38, 70 37, 67 37 L 33 37 C 30 37, 27 38, 27 41 Z"
          fill={`url(#${uid}-glassGloss)`}
        />

        {/* --- PROCEDURAL SCREEN EYES --- */}
        <g className={styles.eyeGlow}>
          {eyeShape === "dots" && (
            <>
              <circle cx="41" cy="52" r="3.6" fill={colorTheme.eyeColor} />
              <circle cx="59" cy="52" r="3.6" fill={colorTheme.eyeColor} />
              <circle cx="42" cy="50.8" r="1.2" fill="#ffffff" />
              <circle cx="60" cy="50.8" r="1.2" fill="#ffffff" />
            </>
          )}

          {eyeShape === "bars" && (
            <>
              <rect x="36" y="50" width="9" height="4.5" rx="2.2" fill={colorTheme.eyeColor} />
              <rect x="55" y="50" width="9" height="4.5" rx="2.2" fill={colorTheme.eyeColor} />
            </>
          )}

          {eyeShape === "capsule" && (
            <>
              <rect x="37" y="47" width="8" height="9" rx="4" fill={colorTheme.eyeColor} />
              <rect x="55" y="47" width="8" height="9" rx="4" fill={colorTheme.eyeColor} />
              <circle cx="39.5" cy="49.5" r="1.2" fill="#ffffff" />
              <circle cx="57.5" cy="49.5" r="1.2" fill="#ffffff" />
            </>
          )}

          {eyeShape === "curved" && (
            <>
              <path d="M 36 53 Q 41 47 46 53" stroke={colorTheme.eyeColor} strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 54 53 Q 59 47 64 53" stroke={colorTheme.eyeColor} strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          )}
        </g>

        {/* --- PROCEDURAL SCREEN MOUTH --- */}
        {mouthShape === "smile" && (
          <path
            d="M 45 61 Q 50 65 55 61"
            stroke={colorTheme.eyeColor}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            className={styles.eyeGlow}
          />
        )}

        {mouthShape === "line" && (
          <line
            x1="46"
            y1="62"
            x2="54"
            y2="62"
            stroke={colorTheme.eyeColor}
            strokeWidth="2"
            strokeLinecap="round"
            className={styles.eyeGlow}
          />
        )}

        {mouthShape === "dot" && (
          <circle
            cx="50"
            cy="62"
            r="1.6"
            fill={colorTheme.eyeColor}
            className={styles.eyeGlow}
          />
        )}

        {/* Helmet Chin Ring Accent */}
        <path
          d="M 37 83 Q 50 87 63 83"
          stroke={colorTheme.highlight}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
      </svg>
    </div>
  );
};