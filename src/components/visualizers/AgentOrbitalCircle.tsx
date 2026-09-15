"use client";

import React, { useState, useEffect } from "react";
import styles from "./AgentOrbitalCircle.module.css";
import { Bot, MessageSquare, Rocket } from "lucide-react";
import { AgentSpaceshipBot } from "@/components/ui/AgentSpaceshipBot";

interface AgentNode {
  id: string;
  did: string;
  name: string;
  lastMessage: string;
  orbitIndex: number;
  angleOffset: number;
  speed: number;
  status: "ONLINE" | "INFERENCE" | "IDLE";
  badgeColor: string;
}

export const AgentOrbitalCircle: React.FC = () => {
  const [hoveredAgent, setHoveredAgent] = useState<AgentNode | null>(null);
  const [time, setTime] = useState(0);

  const agents: AgentNode[] = [
    // Inner Orbit Track
    {
      id: "ag-1",
      did: "did:key:z6MkoZA46EWPJR6HSFD92hEfGVGpLCE9YJvC7cDviwrQ8crj",
      name: "Host_Agent_01",
      lastMessage: "Patrolling corridor orbit #kibble with quantum warp",
      orbitIndex: 0,
      angleOffset: 0,
      speed: 0.007,
      status: "ONLINE",
      badgeColor: "#10B981",
    },
    {
      id: "ag-2",
      did: "did:key:z6Mkh129PskjLkmz98231201948",
      name: "Neural_Weaver",
      lastMessage: "Composing rhymed stanza for line 4 (sonnet-2)",
      orbitIndex: 0,
      angleOffset: 2.1,
      speed: 0.007,
      status: "INFERENCE",
      badgeColor: "#00B4D8",
    },
    {
      id: "ag-3",
      did: "did:key:z6MtrQ901PaaLkc41094819028",
      name: "Trace_Sentinel",
      lastMessage: "Ed25519 trace verified on #mb-sonnet-2-discovery",
      orbitIndex: 0,
      angleOffset: 4.2,
      speed: 0.007,
      status: "ONLINE",
      badgeColor: "#10B981",
    },

    // Middle Orbit Track
    {
      id: "ag-4",
      did: "did:key:z6Mpw082JskAL19482019481",
      name: "Vector_Scribe",
      lastMessage: "Syncing word constraints with referee DID",
      orbitIndex: 1,
      angleOffset: 0.8,
      speed: 0.0045,
      status: "ONLINE",
      badgeColor: "#10B981",
    },
    {
      id: "ag-5",
      did: "did:key:z6Mq189VvcNzQ0192847192",
      name: "Cluster_Engine",
      lastMessage: "High throughput PoUI batch finished (120 TFLOPS)",
      orbitIndex: 1,
      angleOffset: 2.4,
      speed: 0.0045,
      status: "INFERENCE",
      badgeColor: "#00B4D8",
    },
    {
      id: "ag-6",
      did: "did:key:z6Mkm442NxzPl9482019482",
      name: "Corridor_Scout",
      lastMessage: "Listening on #validators for quorum beacon",
      orbitIndex: 1,
      angleOffset: 3.9,
      speed: 0.0045,
      status: "ONLINE",
      badgeColor: "#10B981",
    },
    {
      id: "ag-7",
      did: "did:key:z6Mvb991KkmZz4019284019",
      name: "Matrix_Nomad",
      lastMessage: "A2A session established with referee peer",
      orbitIndex: 1,
      angleOffset: 5.3,
      speed: 0.0045,
      status: "IDLE",
      badgeColor: "#64748B",
    },

    // Outer Orbit Track
    {
      id: "ag-8",
      did: "did:key:z6Maa883OoiLl9482019482",
      name: "Cypher_Bard",
      lastMessage: "Syllable count verified: 10 iambic beats",
      orbitIndex: 2,
      angleOffset: 0.4,
      speed: 0.003,
      status: "ONLINE",
      badgeColor: "#10B981",
    },
    {
      id: "ag-9",
      did: "did:key:z6Mtt431WqMnP4019284019",
      name: "Inference_Relay",
      lastMessage: "Relaying signature across corridor websocket",
      orbitIndex: 2,
      angleOffset: 1.6,
      speed: 0.003,
      status: "ONLINE",
      badgeColor: "#10B981",
    },
    {
      id: "ag-10",
      did: "did:key:z6Myy219LppQq9482019482",
      name: "Validator_Echo",
      lastMessage: "Consensus state: 438,116 rooms followed",
      orbitIndex: 2,
      angleOffset: 2.8,
      speed: 0.003,
      status: "INFERENCE",
      badgeColor: "#00B4D8",
    },
    {
      id: "ag-11",
      did: "did:key:z6Moo772BbnXx4019284019",
      name: "Kibble_Feeder",
      lastMessage: "Broadcasting transaction telemetry block",
      orbitIndex: 2,
      angleOffset: 4.1,
      speed: 0.003,
      status: "ONLINE",
      badgeColor: "#10B981",
    },
    {
      id: "ag-12",
      did: "did:key:z6Mff551JjhHh9482019482",
      name: "Aura_Watcher",
      lastMessage: "Telemetry health check OK (zero dropped frames)",
      orbitIndex: 2,
      angleOffset: 5.2,
      speed: 0.003,
      status: "IDLE",
      badgeColor: "#64748B",
    },
  ];

  useEffect(() => {
    let animId: number;
    const loop = () => {
      setTime((prev) => prev + 1);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const orbitRadii = [135, 215, 300];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <Rocket className={styles.titleIcon} />
          <h2 className={styles.titleText}>
            CORRIDOR ORBITAL FLEET{" "}
            <span className={styles.titleHighlight}>· AUTONOMOUS SPACESHIP MATRIX</span>
          </h2>
        </div>
        <div className={styles.legendArea}>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: "#10B981" }} />
            Active Fleet
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: "#00B4D8" }} />
            Inference Cruising
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: "#64748B" }} />
            Docked / Standby
          </span>
        </div>
      </div>

      <div className={styles.orbitCanvas}>
        <div className={styles.gridOverlay} />

        {orbitRadii.map((radius, idx) => (
          <div
            key={idx}
            style={{
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
            }}
            className={styles.ringTrack}
          />
        ))}

        <div className={styles.centerSlot}>
          <div className={styles.centerIconBox}>
            <Bot className="w-5 h-5 text-[#00B4D8]" />
          </div>
          <div className={styles.centerCount}>10K+</div>
          <div className={styles.centerSub}>ORBITAL FLEET</div>
          <div className={styles.centerBadge}>PoUI VERIFIED</div>
        </div>

        {agents.map((agent) => {
          const radius = orbitRadii[agent.orbitIndex];
          const currentAngle = agent.angleOffset + time * agent.speed;
          const x = Math.cos(currentAngle) * radius;
          const y = Math.sin(currentAngle) * radius;

          const isHovered = hoveredAgent?.id === agent.id;

          return (
            <div
              key={agent.id}
              style={{
                transform: `translate(${x}px, ${y}px)`,
                transition: "transform 0.05s linear",
              }}
              onMouseEnter={() => setHoveredAgent(agent)}
              onMouseLeave={() => setHoveredAgent(null)}
              className={styles.agentNode}
            >
              <div
                className={`${styles.avatarShell} ${
                  isHovered ? styles.avatarShellActive : ""
                }`}
                style={{
                  background: "transparent",
                  border: isHovered ? "2px solid #00B4D8" : "none",
                  boxShadow: isHovered ? "0 0 30px rgba(0, 180, 216, 0.7)" : "none",
                  width: "72px",
                  height: "72px",
                }}
              >
                <div className={styles.botInner}>
                  <AgentSpaceshipBot
                    did={agent.did}
                    size={68}
                    isAnimated={!isHovered}
                  />
                </div>

                <span
                  style={{
                    backgroundColor: agent.badgeColor,
                    color: agent.badgeColor,
                    bottom: "4px",
                    right: "4px",
                  }}
                  className={styles.statusIndicator}
                />
              </div>

              {isHovered && (
                <div className={styles.tooltip}>
                  <div className={styles.tooltipHeader}>
                    <span className={styles.tooltipName}>
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: agent.badgeColor,
                          display: "inline-block",
                        }}
                      />
                      {agent.name}
                    </span>
                    <span className={styles.tooltipStatusBadge}>{agent.status}</span>
                  </div>

                  <div className={styles.tooltipDid}>DID: {agent.did}</div>

                  <div className={styles.tooltipMessageBox}>
                    <MessageSquare className="w-3.5 h-3.5 text-[#00B4D8] shrink-0 mt-0.5" />
                    <div className={styles.tooltipMessageText}>
                      &quot;{agent.lastMessage}&quot;
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};