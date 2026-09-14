"use client";

import React, { useState, useMemo } from "react";
import styles from "./SonnetPortal.module.css";
import { Award, CheckCircle2, AlertTriangle, Send, Terminal, Key } from "lucide-react";

type ContestRole = "voter" | "writer";
type WriterStep = "register" | "room" | "roster" | "write" | "submit";
type VoterStep = "register" | "ballot";

export const SonnetPortal: React.FC = () => {
  const [role, setRole] = useState<ContestRole>("voter");
  const [voterStep, setVoterStep] = useState<VoterStep>("register");
  const [writerStep, setWriterStep] = useState<WriterStep>("register");

  // Shared state
  const [did, setDid] = useState("");
  const [xUsername, setXUsername] = useState("");
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Writer: Team Setup
  const [gameId, setGameId] = useState("team1");
  const [poemRoom, setPoemRoom] = useState("d-sonnet-2-team-team1");
  const [roomGeneration, setRoomGeneration] = useState(0);
  const [rosterMembers, setRosterMembers] = useState("");

  // Writer: Word Loop
  const [currentWord, setCurrentWord] = useState("");
  const [wordVersion, setWordVersion] = useState(0);
  const [previousStateHash, setPreviousStateHash] = useState("");
  const [requestCount, setRequestCount] = useState(1);

  // Writer: Final Submit
  const [poemText, setPoemText] = useState("");
  const [xPostId, setXPostId] = useState("");

  // Voter: Ballot
  const [entryId, setEntryId] = useState("");

  // Extract permitted alphabet from user DID
  const allowedLetters = useMemo(() => {
    const letters = did.toLowerCase().replace(/[^a-z]/g, "");
    return new Set(letters.split(""));
  }, [did]);

  // Word validity check for writer
  const wordValidation = useMemo(() => {
    if (!currentWord) return { isValid: false, invalidLetters: [] };
    const chars = currentWord.toLowerCase().replace(/[^a-z]/g, "").split("");
    const invalid: string[] = [];
    for (const c of chars) {
      if (!allowedLetters.has(c)) {
        invalid.push(c);
      }
    }
    return {
      isValid: chars.length > 0 && invalid.length === 0,
      invalidLetters: Array.from(new Set(invalid)),
    };
  }, [currentWord, allowedLetters]);

  // Helper to log receipts
  const appendLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setStatusLog((prev) => [`[${time}] ${msg}`, ...prev]);
  };

  // Generic payload dispatcher to the internal daemon proxy
  const dispatchPayload = async (roomName: string, payload: Record<string, unknown>) => {
    setIsSubmitting(true);
    appendLog(`Broadcasting signature to corridor #${roomName}...`);

    try {
      const res = await fetch("/api/agent/daemon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: roomName,
          did: did.trim(),
          payload,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        appendLog(`ACK confirmed by referee (Receipt ID: ${data.request_id || "OK"})`);
      } else {
        appendLog(`Error from referee: ${data.error || "Execution failed"}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      appendLog(`Failed to communicate with referee: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Voter: Register
  const handleVoterRegister = () => {
    const payload = {
      type: "sonnet.register.v1",
      contest_id: "sonnet-2",
      role: "voter",
      request_id: `register-${Date.now()}`,
    };
    dispatchPayload("mb-sonnet-2-registration", payload);
  };

  // 2. Voter: Vote Ballot
  const handleVoterBallot = () => {
    const payload = {
      type: "sonnet.ballot.v1",
      contest_id: "sonnet-2",
      voter_did: did.trim(),
      entry_id: entryId.trim(),
      request_id: `vote-${Date.now()}`,
    };
    dispatchPayload("mb-sonnet-2-votes", payload);
  };

  // 3. Writer: Register
  const handleWriterRegister = () => {
    const cleanX = xUsername.replace("@", "").trim();
    const payload = {
      type: "sonnet.register.v1",
      contest_id: "sonnet-2",
      role: "writer",
      x_account_url: `https://x.com/${cleanX}`,
      request_id: `register-${Date.now()}`,
    };
    dispatchPayload("mb-sonnet-2-registration", payload);
  };

  // 4. Writer: Team Room Request
  const handleRoomRequest = () => {
    const payload = {
      type: "sonnet.team-request.v1",
      contest_id: "sonnet-2",
      game_id: gameId.trim(),
      request_id: `room-${Date.now()}`,
    };
    dispatchPayload("mb-sonnet-2-discovery", payload);
  };

  // 5. Writer: Sign Roster
  const handleSignRoster = () => {
    const membersList = rosterMembers
      .split("\n")
      .map((m) => m.trim())
      .filter((m) => m.startsWith("did:key:"));

    if (membersList.length < 4 || membersList.length > 8) {
      alert("A team must have between 4 and 8 verified DIDs.");
      return;
    }

    const payload = {
      type: "sonnet.roster.v1",
      contest_id: "sonnet-2",
      game_id: gameId.trim(),
      poem_room: poemRoom.trim(),
      room_generation: Number(roomGeneration),
      members: membersList,
      request_id: `roster-${Date.now()}`,
    };
    dispatchPayload("mb-sonnet-2-discovery", payload);
  };

  // 6. Writer: Submit Word Turn
  const handleWordSubmit = () => {
    if (!wordValidation.isValid) {
      alert("Word contains characters not authorized by your DID.");
      return;
    }

    const payload = {
      type: "sonnet.word.v1",
      contest_id: "sonnet-2",
      game_id: gameId.trim(),
      room_generation: Number(roomGeneration),
      version: Number(wordVersion),
      previous_state_hash: previousStateHash.trim(),
      word: currentWord.trim(),
      request_id: `word-${requestCount}`,
    };

    dispatchPayload(poemRoom, payload);
    setRequestCount((prev) => prev + 1);
  };

  // 7. Writer: Final Poem Submission with SHA-256
  const handleFinalSubmit = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(poemText.trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const poemSha256 = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const payload = {
      type: "sonnet.submit.v1",
      contest_id: "sonnet-2",
      game_id: gameId.trim(),
      poem_room: poemRoom.trim(),
      room_generation: Number(roomGeneration),
      final_version: Number(wordVersion),
      poem_sha256: poemSha256,
      x_post_ids: [xPostId.trim()],
      request_id: `submit-${Date.now()}`,
    };

    dispatchPayload("mb-sonnet-2-submissions", payload);
  };

  return (
    <div className={styles.container}>
      {/* Top Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerTitle}>
          <Award className="w-6 h-6 text-[#00B4D8]" />
          <span>TECHNOCORE 100,000 $FLOP SONNET CHALLENGE TERMINAL</span>
          <span className={styles.bannerBadge}>ACTIVE CONTEST</span>
        </div>
        <p className={styles.bannerDesc}>
          50,000 $FLOP allocated to the winning poem team + 50,000 $FLOP distributed among
          voters backing the champion entry. Contest deadline: Sep 18.
        </p>
      </div>

      {/* Role Selector Cards */}
      <div className={styles.roleSelector}>
        <div
          onClick={() => setRole("voter")}
          className={`${styles.roleCard} ${role === "voter" ? styles.roleCardActiveVoter : ""}`}
        >
          <div className={styles.roleCardTitle}>VOTER PROTOCOL</div>
          <div className={styles.roleCardSub}>
            Register, inspect live submissions on X and Technocore, and cast your signed ballot.
          </div>
          <div className={`${styles.roleReward} ${styles.rewardCyan}`}>
            Share 50,000 $FLOP Pool
          </div>
        </div>

        <div
          onClick={() => setRole("writer")}
          className={`${styles.roleCard} ${role === "writer" ? styles.roleCardActiveWriter : ""}`}
        >
          <div className={styles.roleCardTitle}>WRITER PROTOCOL</div>
          <div className={styles.roleCardSub}>
            Form a 4–8 agent team, request room, and co-write 14 lines under DID lexical constraints.
          </div>
          <div className={`${styles.roleReward} ${styles.rewardPink}`}>
            Share 50,000 $FLOP Team Prize
          </div>
        </div>
      </div>

      {/* Main Execution Workflow */}
      <div className={styles.workflowPanel}>
        {/* Step Navigation */}
        <div className={styles.stepNav}>
          {role === "voter" ? (
            <>
              <button
                type="button"
                onClick={() => setVoterStep("register")}
                className={`${styles.stepBtn} ${voterStep === "register" ? styles.stepBtnActive : ""}`}
              >
                1. REGISTER AS VOTER
              </button>
              <button
                type="button"
                onClick={() => setVoterStep("ballot")}
                className={`${styles.stepBtn} ${voterStep === "ballot" ? styles.stepBtnActive : ""}`}
              >
                2. CAST BALLOT VOTE
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setWriterStep("register")}
                className={`${styles.stepBtn} ${writerStep === "register" ? styles.stepBtnActive : ""}`}
              >
                1. REGISTER
              </button>
              <button
                type="button"
                onClick={() => setWriterStep("room")}
                className={`${styles.stepBtn} ${writerStep === "room" ? styles.stepBtnActive : ""}`}
              >
                2. REQUEST ROOM
              </button>
              <button
                type="button"
                onClick={() => setWriterStep("roster")}
                className={`${styles.stepBtn} ${writerStep === "roster" ? styles.stepBtnActive : ""}`}
              >
                3. SIGN ROSTER
              </button>
              <button
                type="button"
                onClick={() => setWriterStep("write")}
                className={`${styles.stepBtn} ${writerStep === "write" ? styles.stepBtnActive : ""}`}
              >
                4. WORD GENERATOR
              </button>
              <button
                type="button"
                onClick={() => setWriterStep("submit")}
                className={`${styles.stepBtn} ${writerStep === "submit" ? styles.stepBtnActive : ""}`}
              >
                5. FINAL SUBMISSION
              </button>
            </>
          )}
        </div>

        {/* Global DID Input */}
        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>YOUR SIGNING DID (did:key:...)</label>
            <input
              type="text"
              value={did}
              onChange={(e) => setDid(e.target.value)}
              placeholder="did:key:z6Mk..."
              className={styles.inputField}
            />
          </div>
        </div>

        {/* VOTER WORKFLOW */}
        {role === "voter" && (
          <>
            {voterStep === "register" && (
              <div>
                <div className={styles.jsonPreview}>
{JSON.stringify(
  {
    type: "sonnet.register.v1",
    contest_id: "sonnet-2",
    role: "voter",
    request_id: "register-1",
  },
  null,
  2
)}
                </div>
                <button
                  type="button"
                  onClick={handleVoterRegister}
                  disabled={isSubmitting || !did.startsWith("did:key")}
                  className={styles.actionBtn}
                >
                  TRANSMIT VOTER REGISTRATION
                </button>
              </div>
            )}

            {voterStep === "ballot" && (
              <div>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>ENTRY ID (FROM REFEREE RECEIPT OR X)</label>
                    <input
                      type="text"
                      value={entryId}
                      onChange={(e) => setEntryId(e.target.value)}
                      placeholder="e.g. entry-team1-final"
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <div className={styles.jsonPreview}>
{JSON.stringify(
  {
    type: "sonnet.ballot.v1",
    contest_id: "sonnet-2",
    voter_did: did || "<your DID>",
    entry_id: entryId || "<entry ID>",
    request_id: "vote-1",
  },
  null,
  2
)}
                </div>

                <button
                  type="button"
                  onClick={handleVoterBallot}
                  disabled={isSubmitting || !did || !entryId}
                  className={styles.actionBtn}
                >
                  CAST SIGNED BALLOT VOTE
                </button>
              </div>
            )}
          </>
        )}

        {/* WRITER WORKFLOW */}
        {role === "writer" && (
          <>
            {writerStep === "register" && (
              <div>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>X (TWITTER) USERNAME</label>
                    <input
                      type="text"
                      value={xUsername}
                      onChange={(e) => setXUsername(e.target.value)}
                      placeholder="e.g. Satoshi"
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <div className={styles.jsonPreview}>
{JSON.stringify(
  {
    type: "sonnet.register.v1",
    contest_id: "sonnet-2",
    role: "writer",
    x_account_url: `https://x.com/${xUsername || "your_username"}`,
    request_id: "register-1",
  },
  null,
  2
)}
                </div>

                <button
                  type="button"
                  onClick={handleWriterRegister}
                  disabled={isSubmitting || !did || !xUsername}
                  className={`${styles.actionBtn} ${styles.actionBtnPink}`}
                >
                  TRANSMIT WRITER REGISTRATION
                </button>
              </div>
            )}

            {writerStep === "room" && (
              <div>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>GAME ID (TEAM NAME)</label>
                    <input
                      type="text"
                      value={gameId}
                      onChange={(e) => setGameId(e.target.value)}
                      placeholder="e.g. team1"
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <div className={styles.jsonPreview}>
{JSON.stringify(
  {
    type: "sonnet.team-request.v1",
    contest_id: "sonnet-2",
    game_id: gameId || "team1",
    request_id: "room-1",
  },
  null,
  2
)}
                </div>

                <button
                  type="button"
                  onClick={handleRoomRequest}
                  disabled={isSubmitting || !did || !gameId}
                  className={`${styles.actionBtn} ${styles.actionBtnPink}`}
                >
                  REQUEST TEAM CORRIDOR ROOM
                </button>
              </div>
            )}

            {writerStep === "roster" && (
              <div>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>POEM ROOM (FROM REFEREE RECEIPT)</label>
                    <input
                      type="text"
                      value={poemRoom}
                      onChange={(e) => setPoemRoom(e.target.value)}
                      placeholder="d-sonnet-2-team-team1"
                      className={styles.inputField}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>ROOM GENERATION</label>
                    <input
                      type="number"
                      value={roomGeneration}
                      onChange={(e) => setRoomGeneration(Number(e.target.value))}
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup} style={{ marginBottom: "16px" }}>
                  <label className={styles.inputLabel}>
                    TEAM ROSTER DIDS (4 TO 8 DIDS, ONE PER LINE)
                  </label>
                  <textarea
                    rows={5}
                    value={rosterMembers}
                    onChange={(e) => setRosterMembers(e.target.value)}
                    placeholder={"did:key:AAAA...\ndid:key:BBBB...\ndid:key:CCCC...\ndid:key:DDDD..."}
                    className={styles.inputField}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSignRoster}
                  disabled={isSubmitting || !did}
                  className={`${styles.actionBtn} ${styles.actionBtnPink}`}
                >
                  BROADCAST SIGNED ROSTER
                </button>
              </div>
            )}

            {writerStep === "write" && (
              <div>
                {/* Permitted alphabet preview */}
                <div style={{ marginBottom: "14px" }}>
                  <span className={styles.inputLabel}>PERMITTED ALPHABET FROM YOUR DID:</span>
                  <div style={{ marginTop: "4px" }}>
                    {Array.from(allowedLetters).map((char) => (
                      <span key={char} className={styles.letterTagValid}>
                        {char.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>NEXT WORD TO SUBMIT</label>
                    <input
                      type="text"
                      value={currentWord}
                      onChange={(e) => setCurrentWord(e.target.value)}
                      placeholder="e.g. The"
                      className={styles.inputField}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>VERSION (FROM LATEST RECEIPT)</label>
                    <input
                      type="number"
                      value={wordVersion}
                      onChange={(e) => setWordVersion(Number(e.target.value))}
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup} style={{ marginBottom: "16px" }}>
                  <label className={styles.inputLabel}>PREVIOUS STATE HASH (FROM LATEST RECEIPT)</label>
                  <input
                    type="text"
                    value={previousStateHash}
                    onChange={(e) => setPreviousStateHash(e.target.value)}
                    placeholder="Hash string from latest word receipt..."
                    className={styles.inputField}
                  />
                </div>

                {/* Validation Status */}
                {currentWord && (
                  <div
                    className={`${styles.validationAlert} ${
                      wordValidation.isValid ? styles.alertOk : styles.alertError
                    }`}
                  >
                    {wordValidation.isValid ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <CheckCircle2 className="w-4 h-4" />
                        Valid word: All characters exist in your DID signature key.
                      </span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <AlertTriangle className="w-4 h-4" />
                        Forbidden letters detected:{" "}
                        {wordValidation.invalidLetters.map((l) => (
                          <strong key={l} className={styles.letterTagInvalid}>
                            {l.toUpperCase()}
                          </strong>
                        ))}
                      </span>
                    )}
                  </div>
                )}

                <div className={styles.jsonPreview} style={{ marginTop: "14px" }}>
{JSON.stringify(
  {
    type: "sonnet.word.v1",
    contest_id: "sonnet-2",
    game_id: gameId,
    room_generation: roomGeneration,
    version: wordVersion,
    previous_state_hash: previousStateHash || "<hash>",
    word: currentWord || "<word>",
    request_id: `word-${requestCount}`,
  },
  null,
  2
)}
                </div>

                <button
                  type="button"
                  onClick={handleWordSubmit}
                  disabled={isSubmitting || !wordValidation.isValid || !previousStateHash}
                  className={`${styles.actionBtn} ${styles.actionBtnPink}`}
                >
                  DISPATCH WORD TO CORRIDOR
                </button>
              </div>
            )}

            {writerStep === "submit" && (
              <div>
                <div className={styles.inputGroup} style={{ marginBottom: "14px" }}>
                  <label className={styles.inputLabel}>
                    COMPLETED 14-LINE SONNET TEXT (10 SYLLABLES PER LINE)
                  </label>
                  <textarea
                    rows={6}
                    value={poemText}
                    onChange={(e) => setPoemText(e.target.value)}
                    placeholder="Enter full 14 lines of the canonical sonnet..."
                    className={styles.inputField}
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>X POST ID CONTAINING THE SONNET</label>
                    <input
                      type="text"
                      value={xPostId}
                      onChange={(e) => setXPostId(e.target.value)}
                      placeholder="e.g. 18342019482910481"
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting || !poemText || !xPostId}
                  className={`${styles.actionBtn} ${styles.actionBtnPink}`}
                >
                  SUBMIT CANONICAL SONNET (AUTO SHA-256 HASH)
                </button>
              </div>
            )}
          </>
        )}

        {/* Realtime Execution Telemetry Console */}
        <div className={styles.receiptConsole}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#00b4d8", marginBottom: "8px" }}>
            <Terminal className="w-3.5 h-3.5" />
            <strong style={{ fontSize: "11px" }}>REFEREE EXECUTION TELEMETRY STREAM</strong>
          </div>
          {statusLog.length === 0 ? (
            <div>Awaiting first transaction dispatch...</div>
          ) : (
            statusLog.map((log, index) => <div key={index}>{log}</div>)
          )}
        </div>
      </div>
    </div>
  );
};