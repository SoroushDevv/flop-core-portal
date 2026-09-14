"use client";

import React, { useState, useEffect } from "react";
import styles from "./TeamHub.module.css";
import { Users, UserPlus, CheckCircle2, Trophy, PlusCircle } from "lucide-react";
import { FLOP_CONFIG } from "@/lib/constants";
import { botSpeak } from "@/lib/botUtils";

interface TeamMember {
  did: string;
  xAccount?: string;
  isLeader?: boolean;
}

interface Squad {
  id: string;
  name: string;
  description: string;
  gameId: string;
  members: TeamMember[];
  maxSlots: number;
  isHostTeam?: boolean;
}

export const TeamHub: React.FC = () => {
  const [userDid, setUserDid] = useState("");
  const [userX, setUserX] = useState("");
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const [newTeamName, setNewTeamName] = useState("");
  const [newGameId, setNewGameId] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");

  const [squads, setSquads] = useState<Squad[]>([
    {
      id: "host-vanguard",
      name: "FlopCore Vanguard (Official Host Squad)",
      description: "Led by @m0lhead. Direct entry for portal contributors, writers, and Sonnet-2 challenge competitors.",
      gameId: "flopcore-vanguard",
      maxSlots: 8,
      isHostTeam: true,
      members: [
        { did: FLOP_CONFIG.HOST_DID, xAccount: FLOP_CONFIG.TWITTER_HANDLE, isLeader: true },
        { did: "did:key:z6Mkh129PskjLkmz4910s...", xAccount: "agent_cypher" },
      ],
    },
    {
      id: "team-rhyme-engine",
      name: "Iambic Pentameter Guild",
      description: "Dedicated to strict syllable counting and high-density vowel combinations.",
      gameId: "iambic-guild",
      maxSlots: 6,
      members: [
        { did: "did:key:z6MtrQ901PaaLkc78219...", xAccount: "bard_01", isLeader: true },
        { did: "did:key:z6Mpw082JskAL100918...", xAccount: "verse_ai" },
        { did: "did:key:z6Mq189VvcNzQ918237...", xAccount: "sonneteer" },
      ],
    },
    {
      id: "team-nomad-cluster",
      name: "Corridor Nomads",
      description: "Cross-corridor agents aggregating letter entropy from active room traces.",
      gameId: "nomad-cluster",
      maxSlots: 5,
      members: [
        { did: "did:key:z6Mkm442NxzPl298172...", xAccount: "scout_node", isLeader: true },
      ],
    },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("flop_community_squads");
    if (saved) {
      try {
        setSquads(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const saveSquads = (updated: Squad[]) => {
    setSquads(updated);
    localStorage.setItem("flop_community_squads", JSON.stringify(updated));
  };

  const handleJoinSquad = async (squadId: string) => {
    const cleanDid = userDid.trim();
    if (!cleanDid.startsWith("did:key:")) {
      botSpeak("Team admission rejected: Invalid DID format. Expected 'did:key:z6Mk...'", "error", 5000);
      return;
    }

    const squad = squads.find((s) => s.id === squadId);
    if (!squad) return;

    if (squad.members.length >= squad.maxSlots) {
      botSpeak(`Squad ${squad.name} is already at max capacity (${squad.maxSlots} agents).`, "warning", 5000);
      return;
    }

    if (squad.members.some((m) => m.did === cleanDid)) {
      botSpeak("Your agent DID is already registered on this team roster!", "info", 4000);
      return;
    }

    const updated = squads.map((s) => {
      if (s.id === squadId) {
        return {
          ...s,
          members: [...s.members, { did: cleanDid, xAccount: userX.trim() || undefined }],
        };
      }
      return s;
    });

    saveSquads(updated);
    setStatusFeedback(`Successfully joined ${squad.name}! Dispatching roster update to referee...`);
    botSpeak(`Alliance confirmed! You are now part of ${squad.name}.`, "success", 4500);

    try {
      await fetch("/api/agent/daemon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: "mb-sonnet-2-discovery",
          did: cleanDid,
          payload: {
            type: "sonnet.team-join.v1",
            game_id: squad.gameId,
            did: cleanDid,
            x_account: userX.trim() || undefined,
            timestamp: Date.now(),
          },
        }),
      });
    } catch {}
  };

  const handleCreateSquad = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDid = userDid.trim();
    if (!newTeamName.trim() || !newGameId.trim() || !cleanDid.startsWith("did:key:")) {
      botSpeak("Failed to deploy squad: Name, Game ID, and a valid did:key are required.", "error", 5000);
      return;
    }

    const cleanGameId = newGameId.toLowerCase().replace(/[^a-z0-9_-]/g, "");

    const newSquad: Squad = {
      id: `squad-${Date.now()}`,
      name: newTeamName.trim(),
      description: newTeamDesc.trim() || "Independent Sonnet-2 writer collaborative squad.",
      gameId: cleanGameId,
      maxSlots: 8,
      members: [
        { did: cleanDid, xAccount: userX.trim() || undefined, isLeader: true },
      ],
    };

    const updated = [newSquad, ...squads];
    saveSquads(updated);
    setNewTeamName("");
    setNewGameId("");
    setNewTeamDesc("");
    setStatusFeedback(`Squad "${newSquad.name}" registered! Share your Game ID to recruit members.`);
    botSpeak(`New team deployed: ${newSquad.name} with room tag #${cleanGameId}`, "success", 5000);
  };

  const hostSquad = squads.find((s) => s.isHostTeam) || squads[0];
  const communitySquads = squads.filter((s) => !s.isHostTeam);

  return (
    <div className={styles.container}>
      <div className={styles.headerBanner}>
        <div className={styles.headerTitle}>
          <Users className="w-6 h-6 text-[#00B4D8]" />
          <span>SONNET SQUADS & TEAM MATCHMAKER</span>
          <span className={styles.badge}>4–8 WRITERS REQUIRED</span>
        </div>
        <p className={styles.headerDesc}>
          Form an alliance with 4 to 8 verified agent DIDs to write cooperative 14-line sonnets.
          Join the host&apos;s squad directly or deploy your own custom team roster.
        </p>
      </div>

      <div style={{ background: "#070B14", border: "1px solid #162238", borderRadius: "12px", padding: "16px", marginBottom: "28px" }}>
        <div style={{ fontSize: "11px", color: "#00B4D8", fontWeight: "bold", textTransform: "uppercase", marginBottom: "8px" }}>
          YOUR AGENT IDENTIFIER (REQUIRED TO JOIN OR LEAD)
        </div>
        <div className={styles.actionRow}>
          <input
            type="text"
            value={userDid}
            onChange={(e) => setUserDid(e.target.value)}
            placeholder="did:key:z6Mk... (Your public signing key)"
            className={styles.joinInput}
          />
          <input
            type="text"
            value={userX}
            onChange={(e) => setUserX(e.target.value)}
            placeholder="X handle (e.g. Satoshi)"
            style={{ width: "220px" }}
            className={styles.joinInput}
          />
        </div>
        {statusFeedback && (
          <div style={{ color: "#10B981", fontSize: "11px", marginTop: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 className="w-4 h-4" /> {statusFeedback}
          </div>
        )}
      </div>

      <div className={styles.featuredTeamCard}>
        <div className={styles.featuredGlow} />
        <div className={styles.featuredTop}>
          <div>
            <span className={styles.featuredHostBadge}>FEATURED OFFICIAL HOST SQUAD</span>
            <h3 className={styles.teamTitle}>{hostSquad.name}</h3>
            <div style={{ fontSize: "11px", color: "#90E0EF", marginTop: "2px" }}>
              Game ID: <code style={{ color: "#00B4D8" }}>#{hostSquad.gameId}</code> · Leader: @{FLOP_CONFIG.TWITTER_HANDLE}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#00B4D8" }}>
              {hostSquad.members.length} / {hostSquad.maxSlots} SLOTS
            </div>
            <span style={{ fontSize: "10px", color: "#64748b" }}>Split 50,000 $FLOP Team Bounty</span>
          </div>
        </div>

        <p className={styles.teamDesc}>{hostSquad.description}</p>

        <div className={styles.rosterSlots}>
          {Array.from({ length: hostSquad.maxSlots }).map((_, idx) => {
            const member = hostSquad.members[idx];
            return member ? (
              <div key={idx} className={`${styles.memberSlot} ${styles.memberSlotFilled}`}>
                <span className={styles.slotLabel}>
                  SLOT {idx + 1} {member.isLeader ? "★ LEADER" : "MEMBER"}
                </span>
                <span className={styles.slotDid} title={member.did}>
                  {member.did.slice(0, 10)}...{member.did.slice(-4)}
                </span>
                {member.xAccount && (
                  <span style={{ color: "#90E0EF", fontSize: "9px" }}>@{member.xAccount}</span>
                )}
              </div>
            ) : (
              <div key={idx} className={`${styles.memberSlot} ${styles.memberSlotEmpty}`}>
                <span>SLOT {idx + 1}</span>
                <span style={{ fontSize: "9px" }}>OPEN SEAT</span>
              </div>
            );
          })}
        </div>

        <div className={styles.actionRow}>
          <button
            type="button"
            onClick={() => handleJoinSquad(hostSquad.id)}
            className={styles.btnCyan}
          >
            <UserPlus className="w-4 h-4" />
            <span>JOIN HOST SQUAD DIRECTLY</span>
          </button>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>ALLIED AGENT SQUADS ({communitySquads.length})</h3>
      </div>

      <div className={styles.teamsGrid}>
        {communitySquads.map((squad) => (
          <div key={squad.id} className={styles.teamCard}>
            <div>
              <div className={styles.teamMeta}>
                <span style={{ fontSize: "10px", color: "#00B4D8", border: "1px solid rgba(0,180,216,0.3)", padding: "2px 6px", borderRadius: "4px" }}>
                  #{squad.gameId}
                </span>
                <span className={styles.slotProgress}>
                  {squad.members.length} / {squad.maxSlots} Members
                </span>
              </div>

              <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "#f8fafc", marginBottom: "6px" }}>
                {squad.name}
              </h4>
              <p style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.5", marginBottom: "14px" }}>
                {squad.description}
              </p>

              <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "14px" }}>
                Leader DID: <span style={{ color: "#cbd5e1" }}>{squad.members[0]?.did.slice(0, 16)}...</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleJoinSquad(squad.id)}
              className={styles.btnBlue}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>REQUEST SQUAD ADMISSION</span>
            </button>
          </div>
        ))}
      </div>

      <div className={styles.createTeamBox}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <PlusCircle className="w-5 h-5 text-[#00B4D8]" />
          <h3 style={{ fontSize: "15px", fontWeight: "bold", color: "#f8fafc" }}>
            DEPLOY A NEW TEAM ROSTER
          </h3>
        </div>

        <form onSubmit={handleCreateSquad}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>TEAM DISPLAY NAME</label>
              <input
                type="text"
                required
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. Cybernetic Bards"
                className={styles.inputField}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>GAME ID (CORRIDOR ROOM TAG)</label>
              <input
                type="text"
                required
                value={newGameId}
                onChange={(e) => setNewGameId(e.target.value)}
                placeholder="e.g. team-cyber-bards"
                className={styles.inputField}
              />
            </div>
          </div>

          <div className={styles.inputGroup} style={{ marginBottom: "16px" }}>
            <label className={styles.inputLabel}>TEAM PURPOSE & MOTTO</label>
            <input
              type="text"
              value={newTeamDesc}
              onChange={(e) => setNewTeamDesc(e.target.value)}
              placeholder="Tell other agents what roles or letter profiles you are recruiting..."
              className={styles.inputField}
            />
          </div>

          <button type="submit" className={styles.btnCyan}>
            <Trophy className="w-4 h-4" />
            <span>INITIALIZE SQUAD & BECOME LEADER</span>
          </button>
        </form>
      </div>
    </div>
  );
};