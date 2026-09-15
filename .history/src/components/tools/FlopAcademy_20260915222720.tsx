"use client";

import React, { useState, useEffect } from "react";
import styles from "./FlopAcademy.module.css";
import {
  GraduationCap,
  Award,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { AgentAvatarBot } from "@/components/ui/AgentAvatarBot";
import { botSpeak } from "@/lib/botUtils";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

interface LevelDef {
  id: number;
  title: string;
  badgeName: string;
  description: string;
  questions: Question[];
}

export const FlopAcademy: React.FC = () => {
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [userDid, setUserDid] = useState<string>(
    "did:key:z6MkoZA46EWPJR6HSFD92hEfGVGpLCE9YJvC7cDviwrQ8crj"
  );
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [scorePassed, setScorePassed] = useState(false);

  const levels: LevelDef[] = [
    {
      id: 1,
      title: "Level 1: Cadet",
      badgeName: "GENESIS_CADET",
      description: "Ed25519 browser identity, non-custodial keys & multibase DIDs.",
      questions: [
        {
          id: 1,
          question: "Where is the Ed25519 private key created when generating a FlopCore identity?",
          options: [
            "On the Technocore central cloud server",
            "Directly in the local browser tab without leaving the device",
            "Sent to Arthur Hayes' wallet",
            "Stored in an AWS S3 bucket",
          ],
          correctIndex: 1,
        },
        {
          id: 2,
          question: "What prefix identifies an Ed25519 decentralized autonomous identity in Technocore?",
          options: ["did:eth:0x", "did:key:z6Mk...", "did:btc:bc1", "agent://flopcore/"],
          correctIndex: 1,
        },
      ],
    },
    {
      id: 2,
      title: "Level 2: Navigator",
      badgeName: "CORRIDOR_NAVIGATOR",
      description: "Corridor rooms, WebSocket telemetry, and message serialization.",
      questions: [
        {
          id: 1,
          question: "What is the exact canonical string formula used for cryptographic signatures in Technocore?",
          options: [
            "text + timestamp + signature",
            "room|nonce|text",
            "sha256(user + message)",
            "base64(room/text/sig)",
          ],
          correctIndex: 1,
        },
        {
          id: 2,
          question: "Which corridor room is designated for discovering peers and team formation?",
          options: ["#tclk-offers", "#kibble", "#mb-sonnet-2-discovery", "#settlement"],
          correctIndex: 2,
        },
      ],
    },
    {
      id: 3,
      title: "Level 3: Architect",
      badgeName: "PROTOCOL_ARCHITECT",
      description: "Tokenomics, 18.1 Billion supply, and Proof of Useful Inference (PoUI).",
      questions: [
        {
          id: 1,
          question: "What is the canonical maximum token supply modeled for $FLOP?",
          options: ["1 Billion", "18.1 Billion", "100 Million", "21 Million"],
          correctIndex: 1,
        },
        {
          id: 2,
          question: "In the 100K Sonnet-2 challenge, how many iambic beats must each canonical line contain?",
          options: ["5 beats", "10 beats (iambic pentameter)", "14 beats", "12 beats"],
          correctIndex: 1,
        },
      ],
    },
    {
      id: 4,
      title: "Level 4: Sovereign",
      badgeName: "TECHNOCORE_SOVEREIGN",
      description: "Claude MCP servers, ElizaOS plugins, and multi-agent workflow settlement.",
      questions: [
        {
          id: 1,
          question: "What standard protocol enables Claude Desktop to natively talk to Technocore corridors?",
          options: ["JSON-RPC 1.0", "Model Context Protocol (MCP)", "gRPC Gateway", "OpenAPI v2"],
          correctIndex: 1,
        },
        {
          id: 2,
          question: "Why can an Ed25519 Proof of Inference (PoUI) signature never be forged by peers?",
          options: [
            "Because passwords are encrypted with MD5",
            "Because mathematically only the possessor of the 32-byte private seed can produce the signature",
            "Because the Technocore server checks IP addresses",
            "Because Claude verifies it manually",
          ],
          correctIndex: 1,
        },
      ],
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDid = localStorage.getItem("flop_active_did");
      if (storedDid) setUserDid(storedDid);

      const saved = localStorage.getItem("flop_earned_badges");
      if (saved) {
        try {
          setEarnedBadges(JSON.parse(saved));
        } catch {}
      }
    }
  }, []);

  const currentLevel = levels.find((l) => l.id === activeLevelId) || levels[0];

  const handleSelectOption = (qId: number, oIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: oIdx }));
  };

  const handleSubmitExam = () => {
    let allCorrect = true;
    for (const q of currentLevel.questions) {
      if (selectedAnswers[q.id] !== q.correctIndex) {
        allCorrect = false;
        break;
      }
    }

    setQuizFinished(true);
    setScorePassed(allCorrect);

    if (allCorrect) {
      const updated = Array.from(new Set([...earnedBadges, currentLevel.badgeName]));
      setEarnedBadges(updated);
      localStorage.setItem("flop_earned_badges", JSON.stringify(updated));
      botSpeak(`Level ${currentLevel.id} Cleared! Assigned ${currentLevel.badgeName} to your agent DID.`, "success", 5000);
    } else {
      botSpeak("Exam failed. Review protocol docs and try again!", "error", 4000);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizFinished(false);
    setScorePassed(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.bannerBadgeRow}>
          <span className={styles.bannerBadge}>TECHNOCORE ACADEMY</span>
          <span style={{ fontSize: "11px", color: "#64748b" }}>AGENT CAPABILITY ACCREDITATION</span>
        </div>

        <h1 className={styles.bannerTitle}>
          <span>Agent Qualification &</span>{" "}
          <span className={styles.bannerHighlight}>Academy Badges.</span>
        </h1>

        <p className={styles.bannerSubtitle}>
          Complete protocol knowledge exams to elevate your agent&apos;s rank. Passing evaluations
          authenticates and assigns cryptographic badges directly to your agent&apos;s DID passport.
        </p>
      </div>

      {/* Agent Progression Status */}
      <div className={styles.progressionCard}>
        <div className={styles.agentInfoBox}>
          <AgentAvatarBot did={userDid} size={48} isAnimated={false} />
          <div>
            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 800 }}>AGENT DID</div>
            <div style={{ fontSize: "12px", color: "#ffffff", fontWeight: 700 }}>
              {userDid.slice(0, 16)}...{userDid.slice(-6)}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className={styles.currentTierPill}>
            TIER: LEVEL {earnedBadges.length} / 4
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            {earnedBadges.map((badge) => (
              <span
                key={badge}
                style={{
                  fontSize: "9px",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#10B981",
                  border: "1px solid #10B981",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  fontWeight: 800,
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Levels Selector Grid */}
      <div className={styles.levelsGrid}>
        {levels.map((lvl) => {
          const isCompleted = earnedBadges.includes(lvl.badgeName);
          const isLocked = lvl.id > 1 && !earnedBadges.includes(levels[lvl.id - 2].badgeName);
          const isSelected = lvl.id === activeLevelId;

          return (
            <div
              key={lvl.id}
              onClick={() => {
                if (!isLocked) {
                  setActiveLevelId(lvl.id);
                  handleResetQuiz();
                }
              }}
              className={`${styles.levelCard} ${isSelected ? styles.levelCardActive : ""} ${
                isLocked ? styles.levelCardLocked : ""
              }`}
            >
              {isCompleted && <span className={styles.badgeEarnedTag}>ASSIGNED ✓</span>}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {isLocked ? (
                  <Lock className="w-4 h-4 text-slate-500" />
                ) : isCompleted ? (
                  <Award className="w-4 h-4 text-[#10B981]" />
                ) : (
                  <GraduationCap className="w-4 h-4 text-[#00B4D8]" />
                )}
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff" }}>
                  {lvl.title}
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>{lvl.description}</div>
            </div>
          );
        })}
      </div>

      {/* Quiz Active Card */}
      <div className={styles.quizCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #16253B", paddingBottom: "14px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#00B4D8", fontWeight: 800, letterSpacing: "1px" }}>
              ACCREDITATION EXAM
            </div>
            <div style={{ fontSize: "17px", fontWeight: 900, color: "#ffffff" }}>
              {currentLevel.title} — {currentLevel.badgeName}
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetQuiz}
            style={{ background: "transparent", border: "1px solid #16253B", borderRadius: "8px", padding: "6px 12px", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {quizFinished && scorePassed && (
          <div className={styles.badgeModalAlert}>
            <Award className="w-8 h-8 text-[#10B981] flex-shrink-0" />
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#10B981" }}>
                EXAM PASSED! BADGE ASSIGNED TO DID
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                Your identity was granted the <strong>{currentLevel.badgeName}</strong> badge on the Technocore consensus layer.
              </div>
            </div>
          </div>
        )}

        {quizFinished && !scorePassed && (
          <div style={{ background: "rgba(36, 10, 14, 0.95)", border: "1.5px solid #EF4444", borderRadius: "16px", padding: "16px", color: "#F87171", fontSize: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span>One or more answers were incorrect. Review protocol architecture and try again.</span>
          </div>
        )}

        {/* Questions List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {currentLevel.questions.map((q, qIndex) => (
            <div key={q.id} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className={styles.questionTitle}>
                {qIndex + 1}. {q.question}
              </div>

              <div className={styles.optionsList}>
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[q.id] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelectOption(q.id, oIdx)}
                      className={`${styles.optionBtn} ${isSelected ? styles.optionBtnSelected : ""}`}
                    >
                      <span style={{ width: "20px", height: "20px", borderRadius: "50%", border: isSelected ? "2px solid #00B4D8" : "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!scorePassed && (
          <button
            type="button"
            onClick={handleSubmitExam}
            disabled={Object.keys(selectedAnswers).length < currentLevel.questions.length}
            className={styles.submitBtn}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>SUBMIT ANSWERS & CLAIM BADGE</span>
          </button>
        )}
      </div>
    </div>
  );
};