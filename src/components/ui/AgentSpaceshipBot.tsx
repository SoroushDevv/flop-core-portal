"use client";

import React, { useMemo } from "react";
import { AgentAvatarBot } from "./AgentAvatarBot";

interface AgentSpaceshipBotProps {
  did: string;
  size?: number;
  isAnimated?: boolean;
}

export const AgentSpaceshipBot: React.FC<AgentSpaceshipBotProps> = ({
  did,
  size = 90,
  isAnimated = true,
}) => {
  const shipTraits = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < did.length; i++) {
      hash = (hash << 5) - hash + did.charCodeAt(i);
      hash |= 0;
    }

    const abs = Math.abs(hash);
    const chassisType = abs % 4;
    const thrusterCount = (abs % 3) + 1;
    const wingAngle = 10 + (abs % 25);

    const energyColors = [
      { primary: "#00B4D8", glow: "rgba(0, 180, 216, 0.7)" },
      { primary: "#90E0EF", glow: "rgba(144, 224, 239, 0.7)" },
      { primary: "#10B981", glow: "rgba(16, 185, 129, 0.7)" },
      { primary: "#F59E0B", glow: "rgba(245, 158, 11, 0.7)" },
      { primary: "#38BDF8", glow: "rgba(56, 189, 248, 0.7)" },
    ];
    const energy = energyColors[abs % energyColors.length];

    const hullColors = [
      { top: "#1E293B", bottom: "#090E17", border: "#334155" },
      { top: "#0F172A", bottom: "#030712", border: "#1E293B" },
      { top: "#132338", bottom: "#060D19", border: "#00B4D8" },
      { top: "#1A1A2E", bottom: "#0A0A14", border: "#475569" },
    ];
    const hull = hullColors[(abs >> 3) % hullColors.length];

    return {
      chassisType,
      thrusterCount,
      wingAngle,
      energy,
      hull,
    };
  }, [did]);

  const botSize = Math.round(size * 0.52);
  const safeId = did.replace(/[^a-zA-Z0-9]/g, "").slice(-8);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        userSelect: "none",
        animation: isAnimated ? "shipHoverAnim 3.5s ease-in-out infinite alternate" : "none",
      }}
    >
      <style>{`
        @keyframes shipHoverAnim {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(1.5deg); }
          100% { transform: translateY(2px) rotate(-1deg); }
        }
        @keyframes shipFlameFlicker {
          0% { transform: scaleY(0.85) scaleX(0.95); opacity: 0.8; }
          100% { transform: scaleY(1.2) scaleX(1.05); opacity: 1; filter: drop-shadow(0 0 8px currentColor); }
        }
        @keyframes shipEnergyPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.95); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>

      {/* Capsule-head bot avatar in the cockpit */}
      <div
        style={{
          position: "absolute",
          top: "6%",
          zIndex: 5,
        }}
      >
        <AgentAvatarBot did={did} size={botSize} isAnimated={isAnimated} />
      </div>

      {/* Spaceship Hull Vector */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0, zIndex: 10, overflow: "visible" }}
      >
        <defs>
          <linearGradient id={`hullGrad-${safeId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={shipTraits.hull.top} />
            <stop offset="100%" stopColor={shipTraits.hull.bottom} />
          </linearGradient>

          <linearGradient id={`flameGrad-${safeId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor={shipTraits.energy.primary} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Chassis Type 0: Dart Interceptor */}
        {shipTraits.chassisType === 0 && (
          <g>
            <path
              d={`M 14 ${54 + shipTraits.wingAngle * 0.2} L 32 46 L 68 46 L 86 ${54 + shipTraits.wingAngle * 0.2} L 76 68 L 50 78 L 24 68 Z`}
              fill={`url(#hullGrad-${safeId})`}
              stroke={shipTraits.hull.border}
              strokeWidth="1.5"
            />
            <path
              d="M 28 48 C 28 40, 72 40, 72 48 L 76 56 C 76 64, 24 64, 24 56 Z"
              fill="#060C18"
              stroke={shipTraits.energy.primary}
              strokeWidth="1"
            />
            <circle cx="14" cy={54 + shipTraits.wingAngle * 0.2} r="2.5" fill={shipTraits.energy.primary} />
            <circle cx="86" cy={54 + shipTraits.wingAngle * 0.2} r="2.5" fill={shipTraits.energy.primary} />
          </g>
        )}

        {/* Chassis Type 1: Disc Pod */}
        {shipTraits.chassisType === 1 && (
          <g>
            <ellipse
              cx="50"
              cy="58"
              rx="42"
              ry="16"
              fill={`url(#hullGrad-${safeId})`}
              stroke={shipTraits.hull.border}
              strokeWidth="1.5"
            />
            <ellipse
              cx="50"
              cy="58"
              rx="32"
              ry="10"
              fill="#060C18"
              stroke={shipTraits.energy.primary}
              strokeWidth="1"
              strokeDasharray="4 3"
              style={{
                animation: isAnimated ? "shipEnergyPulse 2s ease-in-out infinite" : "none",
                transformOrigin: "50px 58px",
              }}
            />
            <circle cx="16" cy="58" r="2" fill={shipTraits.energy.primary} />
            <circle cx="84" cy="58" r="2" fill={shipTraits.energy.primary} />
            <circle cx="50" cy="72" r="2" fill={shipTraits.energy.primary} />
          </g>
        )}

        {/* Chassis Type 2: Hex Fighter */}
        {shipTraits.chassisType === 2 && (
          <g>
            <polygon
              points="50,42 84,52 74,74 50,80 26,74 16,52"
              fill={`url(#hullGrad-${safeId})`}
              stroke={shipTraits.energy.primary}
              strokeWidth="1.2"
            />
            <line x1="50" y1="42" x2="50" y2="80" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1="16" y1="52" x2="50" y2="64" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1="84" y1="52" x2="50" y2="64" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </g>
        )}

        {/* Chassis Type 3: Heavy Hover Skiff */}
        {shipTraits.chassisType === 3 && (
          <g>
            <rect
              x="12"
              y="50"
              width="18"
              height="18"
              rx="4"
              fill={`url(#hullGrad-${safeId})`}
              stroke={shipTraits.hull.border}
              strokeWidth="1.5"
            />
            <rect
              x="70"
              y="50"
              width="18"
              height="18"
              rx="4"
              fill={`url(#hullGrad-${safeId})`}
              stroke={shipTraits.hull.border}
              strokeWidth="1.5"
            />
            <rect
              x="26"
              y="52"
              width="48"
              height="20"
              rx="6"
              fill="#060C18"
              stroke={shipTraits.energy.primary}
              strokeWidth="1.2"
            />
            <rect x="32" y="66" width="6" height="3" rx="1" fill="#FFFFFF" />
            <rect x="62" y="66" width="6" height="3" rx="1" fill="#FFFFFF" />
          </g>
        )}

        {/* Plasma Thrusters */}
        <g
          style={{
            color: shipTraits.energy.primary,
            transformOrigin: "center top",
            animation: isAnimated ? "shipFlameFlicker 0.15s infinite alternate ease-in-out" : "none",
          }}
        >
          {shipTraits.thrusterCount === 1 && (
            <polygon
              points="44,78 56,78 50,96"
              fill={`url(#flameGrad-${safeId})`}
            />
          )}

          {shipTraits.thrusterCount === 2 && (
            <>
              <polygon points="32,74 40,74 36,92" fill={`url(#flameGrad-${safeId})`} />
              <polygon points="60,74 68,74 64,92" fill={`url(#flameGrad-${safeId})`} />
            </>
          )}

          {shipTraits.thrusterCount === 3 && (
            <>
              <polygon points="26,72 32,72 29,88" fill={`url(#flameGrad-${safeId})`} />
              <polygon points="46,78 54,78 50,97" fill={`url(#flameGrad-${safeId})`} />
              <polygon points="68,72 74,72 71,88" fill={`url(#flameGrad-${safeId})`} />
            </>
          )}
        </g>
      </svg>
    </div>
  );
};