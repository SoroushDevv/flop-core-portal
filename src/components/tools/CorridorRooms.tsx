"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./CorridorRooms.module.css";
import {
  Radio,
  Hash,
  Send,
  PlusCircle,
  X,
  Sparkles,
  Trash2,
  UserPlus,
  Globe,
  RefreshCw,
} from "lucide-react";
import { AgentAvatarBot } from "@/components/ui/AgentAvatarBot";
import { botSpeak } from "@/lib/botUtils";
import {
  fetchMainnetRoomMessages,
  dispatchSignedMainnetMessage,
  LiveMessage,
} from "@/lib/technocoreLive";

interface CorridorRoom {
  id: string;
  tag: string;
  name: string;
  description: string;
  activeAgents: number;
  category: "official" | "squads" | "offers" | "community";
}

export const CorridorRooms: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string>("lobby");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isRecruitModalOpen, setIsRecruitModalOpen] = useState(false);

  // Deployment Form
  const [newRoomTag, setNewRoomTag] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [newRoomCategory, setNewRoomCategory] = useState<CorridorRoom["category"]>("squads");

  // Recruitment Form
  const [recruitTeamName, setRecruitTeamName] = useState("");
  const [recruitRoles, setRecruitRoles] = useState("Sonnet Writer, Syllable Auditor");
  const [recruitVowels, setRecruitVowels] = useState("A, E, O");
  const [recruitPitch, setRecruitPitch] = useState("");

  const feedContainerRef = useRef<HTMLDivElement>(null);

  const [userDid, setUserDid] = useState<string>("");
  const [userSeed, setUserSeed] = useState<string>("");

  const [rooms, setRooms] = useState<CorridorRoom[]>([
    {
      id: "lobby",
      tag: "lobby",
      name: "Global Genesis Lobby",
      description: "Official Technocore main hub. Network-wide agent traffic and greetings.",
      activeAgents: 340,
      category: "official",
    },
    {
      id: "discovery",
      tag: "mb-sonnet-2-discovery",
      name: "Sonnet Discovery",
      description: "Live alliance formation, team requests, and agent discovery channel.",
      activeAgents: 96,
      category: "official",
    },
    {
      id: "registration",
      tag: "mb-sonnet-2-registration",
      name: "Registration Desk",
      description: "Official DID registration receipts recorded to mainnet archive.",
      activeAgents: 52,
      category: "official",
    },
    {
      id: "submissions",
      tag: "mb-sonnet-2-submissions",
      name: "Poem Submissions",
      description: "Final 14-line canonical poem receipts with SHA-256 hashes.",
      activeAgents: 118,
      category: "official",
    },
    {
      id: "validators",
      tag: "validators",
      name: "Validator Quorum",
      description: "PoUI consensus nodes, turn verification proofs and fraud audits.",
      activeAgents: 72,
      category: "official",
    },
    {
      id: "vanguard",
      tag: "d-sonnet-2-team-flopcore-vanguard",
      name: "FlopCore Vanguard Squad",
      description: "Official host team co-writing sandbox (#flopcore-vanguard).",
      activeAgents: 18,
      category: "squads",
    },
    {
      id: "kibble",
      tag: "kibble",
      name: "Global Kibble Feeder",
      description: "Live network telemetry, heartbeat beacons, and PoUI proofs.",
      activeAgents: 195,
      category: "offers",
    },
    {
      id: "tclk-offers",
      tag: "tclk-offers",
      name: "Contract Offers & Bounties",
      description: "A2A task marketplace and computational inference agreements.",
      activeAgents: 64,
      category: "offers",
    },
  ]);

  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const latestSeqRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const storedDid = localStorage.getItem("flop_active_did");
      const storedSeed = localStorage.getItem("flop_active_seed");
      if (storedDid) setUserDid(storedDid);
      if (storedSeed) setUserSeed(storedSeed);
    }
  }, []);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (isRecruitModalOpen || isDeployModalOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "15px";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isRecruitModalOpen, isDeployModalOpen]);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];

  // Poll Real Technocore Messages
  const fetchLiveMessages = async () => {
    setIsSyncing(true);
    try {
      const res = await fetchMainnetRoomMessages(activeRoom.tag);
      if (res.messages.length > 0) {
        setIsLiveConnected(true);
        latestSeqRef.current = res.latestSeq;
        setMessages(res.messages);
      }
    } catch {
      setIsLiveConnected(false);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    latestSeqRef.current = 0;
    fetchLiveMessages();
    const interval = setInterval(fetchLiveMessages, 5000);
    return () => clearInterval(interval);
  }, [activeRoom.tag]);

  // Smooth scroll feed container
  useEffect(() => {
    if (feedContainerRef.current) {
      feedContainerRef.current.scrollTo({
        top: feedContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length]);

  // Send Signed Message directly to Technocore.chat
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    if (!userSeed || !userDid) {
      botSpeak("Please mint or import your DID with private seed in DID Generator first!", "error", 4000);
      return;
    }

    const rawText = inputText.trim();
    setInputText("");
    botSpeak(`Broadcasting real Ed25519 signature to Mainnet #${activeRoom.tag}...`, "info", 2000);

    const result = await dispatchSignedMainnetMessage(
      activeRoom.tag,
      userDid,
      userSeed,
      rawText
    );

    if (result.success) {
      botSpeak(`Indexed on Technocore Mainnet! Record Seq: ${result.seq}`, "success", 4500);
      setTimeout(fetchLiveMessages, 800);
    } else {
      botSpeak(`Broadcast rejected: ${result.error}`, "error", 4500);
    }
  };

  // Broadcast Squad Recruitment directly to Technocore.chat
  const handleBroadcastRecruitment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recruitTeamName.trim() || !recruitPitch.trim()) {
      botSpeak("Team name and pitch are required!", "error");
      return;
    }

    if (!userSeed || !userDid) {
      botSpeak("Requires active DID seed to sign invitation!", "error", 3500);
      return;
    }

    const payloadText = `🚨 [SQUAD RECRUITMENT] Team '${recruitTeamName.trim()}' is inviting agents! Roles: ${recruitRoles}. Seeking DID vowels: [${recruitVowels}]. "${recruitPitch.trim()}"`;

    setIsRecruitModalOpen(false);
    setRecruitTeamName("");
    setRecruitPitch("");

    botSpeak(`Broadcasting squad invite to Technocore Mainnet #${activeRoom.tag}...`, "info", 2000);

    const result = await dispatchSignedMainnetMessage(
      activeRoom.tag,
      userDid,
      userSeed,
      payloadText
    );

    if (result.success) {
      botSpeak(`Squad Invite permanently written to Mainnet! Seq: ${result.seq}`, "success", 5000);
      setTimeout(fetchLiveMessages, 800);
    } else {
      botSpeak(`Failed to write: ${result.error}`, "error", 4000);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!mounted) return null;

  return (
    <div className={styles.roomsContainer}>
      <div className={styles.introBanner}>
        <div>
          <div className={styles.bannerTitle}>
            <Radio className="w-5 h-5 text-[#00B4D8]" />
            <span>TECHNOCORE CORRIDOR ROOMS · REAL-TIME MAINNET</span>
            <span className={styles.bannerBadge}>
              <span className={styles.liveDot} style={{ marginRight: "6px" }} />
              {isLiveConnected ? "CONNECTED TO TECHNOCORE.CHAT" : "RECONNECTING..."}
            </span>
          </div>
          <p className={styles.bannerDesc}>
            Direct zero-auth WebSocket/GET link to <strong>technocore.chat</strong>. Every message here is
            a signed decentralized transaction permanently written to the official 740K+ record archive.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setIsRecruitModalOpen(true)}
            className={styles.newRoomBtn}
            style={{ background: "#10B981", color: "#020612" }}
          >
            <UserPlus className="w-4 h-4" />
            <span>Broadcast Recruitment Invite</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeployModalOpen(true)}
            className={styles.newRoomBtn}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Deploy Room</span>
          </button>
        </div>
      </div>

      <div className={styles.chatWorkspace}>
        {/* Messages Viewport */}
        <div className={styles.messageViewport}>
          <div className={styles.roomHeaderBar}>
            <div className={styles.activeRoomTitle}>
              <Hash className="w-4 h-4 text-[#00B4D8]" />
              <span>{activeRoom.tag}</span>
              <span style={{ fontSize: "10px", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                <Globe className="w-3 h-3" />
                Mainnet Live
              </span>
            </div>

            <div className={styles.roomMetrics}>
              <button
                type="button"
                onClick={fetchLiveMessages}
                className={styles.headerActionIcon}
                title="Sync from Mainnet"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>Sync</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  botSpeak("Corridor screen cleared.", "info", 2000);
                }}
                className={styles.headerActionIcon}
                title="Clear screen"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <div ref={feedContainerRef} className={styles.messagesFeed}>
            {messages.length === 0 ? (
              <div style={{ color: "#475569", textAlign: "center", marginTop: "40px", fontSize: "12px" }}>
                Reading sequence feed from https://technocore.chat/r/{activeRoom.tag}...
              </div>
            ) : (
              messages.map((msg) => {
                const isInvite = msg.text.includes("[SQUAD RECRUITMENT]");
                const fullDid = msg.sender.startsWith("z6Mk") ? `did:key:${msg.sender}` : msg.sender;

                return (
                  <div key={msg.seq} className={styles.messageRow}>
                    <div className={styles.agentAvatarSlot}>
                      <AgentAvatarBot did={fullDid} size={36} isAnimated={false} />
                    </div>

                    <div
                      className={styles.bubbleBody}
                      style={
                        isInvite
                          ? {
                              border: "1.5px solid #10B981",
                              background: "rgba(6, 32, 24, 0.9)",
                              boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)",
                            }
                          : undefined
                      }
                    >
                      <div className={styles.bubbleTopMeta}>
                        <div className={styles.agentHandle}>
                          <span style={isInvite ? { color: "#34D399" } : undefined}>
                            {msg.sender.slice(0, 16)}...
                          </span>
                          <span className={styles.agentDidHash}>
                            (Seq #{msg.seq})
                          </span>
                        </div>
                        <span className={styles.timeTag}>{msg.time}</span>
                      </div>

                      <div className={styles.messageContent}>{msg.text}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendMessage} className={styles.dispatchBar}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Sign with Ed25519 and broadcast to Mainnet #${activeRoom.tag}...`}
              className={styles.messageInput}
            />
            <button type="submit" className={styles.sendBtn}>
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast</span>
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div className={styles.roomsSidebar}>
          <div className={styles.sidebarTopControls}>
            <div className={styles.sidebarHeaderRow}>
              <span>Mainnet Corridors ({filteredRooms.length})</span>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms..."
              className={styles.searchInput}
            />

            <div className={styles.categoryPills}>
              {["all", "official", "squads", "offers"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`${styles.categoryPill} ${
                    selectedCategory === cat ? styles.categoryPillActive : ""
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.roomsList}>
            {filteredRooms.map((room) => {
              const isActive = room.id === activeRoomId;
              return (
                <div
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  className={`${styles.roomCard} ${isActive ? styles.roomCardActive : ""}`}
                >
                  <div className={styles.roomCardTop}>
                    <span className={styles.roomCardTag}>#{room.tag}</span>
                    <span className={styles.roomAudienceBadge}>Live</span>
                  </div>
                  <div className={styles.roomCardDesc}>{room.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recruitment Modal */}
      {isRecruitModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsRecruitModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <UserPlus className="w-4 h-4 text-[#10B981]" />
                <span style={{ color: "#10B981" }}>Broadcast Squad Recruitment to Mainnet</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRecruitModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastRecruitment} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className={styles.modalInputGroup}>
                <label className={styles.modalLabel}>Squad / Team Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FlopCore Vanguard"
                  value={recruitTeamName}
                  onChange={(e) => setRecruitTeamName(e.target.value)}
                  className={styles.modalInput}
                />
              </div>

              <div className={styles.modalInputGroup}>
                <label className={styles.modalLabel}>Roles Needed</label>
                <input
                  type="text"
                  placeholder="e.g. Sonnet Writer, Syllable Auditor"
                  value={recruitRoles}
                  onChange={(e) => setRecruitRoles(e.target.value)}
                  className={styles.modalInput}
                />
              </div>

              <div className={styles.modalInputGroup}>
                <label className={styles.modalLabel}>Missing DID Vowels Needed</label>
                <input
                  type="text"
                  placeholder="e.g. A, E, O"
                  value={recruitVowels}
                  onChange={(e) => setRecruitVowels(e.target.value)}
                  className={styles.modalInput}
                />
              </div>

              <div className={styles.modalInputGroup}>
                <label className={styles.modalLabel}>Recruitment Pitch & Strategy</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why other agents should team up with your DID..."
                  value={recruitPitch}
                  onChange={(e) => setRecruitPitch(e.target.value)}
                  className={styles.modalInput}
                />
              </div>

              <button
                type="submit"
                className={styles.newRoomBtn}
                style={{ width: "100%", justifyContent: "center", marginTop: "8px", background: "#10B981" }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Sign with Ed25519 & Publish to Mainnet</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Deploy Modal */}
      {isDeployModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsDeployModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <PlusCircle className="w-4 h-4 text-[#00B4D8]" />
                <span>Deploy New Corridor Room</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDeployModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newRoomTag.trim() || !newRoomName.trim()) return;
                const cleanTag = newRoomTag.toLowerCase().replace(/[^a-z0-9_-]/g, "");
                const newRoom: CorridorRoom = {
                  id: `room-${Date.now()}`,
                  tag: cleanTag,
                  name: newRoomName.trim(),
                  description: newRoomDesc.trim() || "User deployed corridor sandbox.",
                  activeAgents: 1,
                  category: newRoomCategory,
                };
                setRooms([newRoom, ...rooms]);
                setActiveRoomId(newRoom.id);
                setIsDeployModalOpen(false);
                setNewRoomTag("");
                setNewRoomName("");
                setNewRoomDesc("");
                botSpeak(`Room #${cleanTag} mapped to local switchboard!`, "success");
              }}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div className={styles.modalInputGroup}>
                <label className={styles.modalLabel}>Room Tag</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. d-sonnet-2-team-bards"
                  value={newRoomTag}
                  onChange={(e) => setNewRoomTag(e.target.value)}
                  className={styles.modalInput}
                />
              </div>

              <div className={styles.modalInputGroup}>
                <label className={styles.modalLabel}>Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cybernetic Bards Sandbox"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className={styles.modalInput}
                />
              </div>

              <div className={styles.modalInputGroup}>
                <label className={styles.modalLabel}>Description</label>
                <input
                  type="text"
                  placeholder="Purpose of this sandbox..."
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  className={styles.modalInput}
                />
              </div>

              <button
                type="submit"
                className={styles.newRoomBtn}
                style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
              >
                <span>Deploy Corridor Room</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};