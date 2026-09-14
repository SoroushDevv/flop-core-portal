"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./AgentRunner.module.css";
import { Play, Square, Activity, Terminal } from "lucide-react";
import { botSpeak } from "@/lib/botUtils";

interface LogEntry {
  id: string;
  timestamp: string;
  text: string;
  type: "info" | "success" | "warning";
}

export const AgentRunner: React.FC = () => {
  const [did, setDid] = useState("");
  const [corridorRoom, setCorridorRoom] = useState("mb-sonnet-2-discovery");
  const [heartbeatInterval, setHeartbeatInterval] = useState(8);
  const [isRunning, setIsRunning] = useState(false);

  const [packetsSent, setPacketsSent] = useState(0);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const [verifiedResponses, setVerifiedResponses] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const terminalLogsRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (terminalLogsRef.current) {
      terminalLogsRef.current.scrollTop = terminalLogsRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (text: string, type: "info" | "success" | "warning" = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: time,
        text,
        type,
      },
    ]);
  };

  const executeHeartbeatCycle = async (agentDid: string, room: string) => {
    addLog(`Broadcasting telemetry beacon for ${agentDid.slice(0, 16)}...`, "info");
    setPacketsSent((prev) => prev + 1);

    try {
      const res = await fetch("/api/agent/daemon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room,
          did: agentDid.trim(),
          payload: {
            type: "agent.keepalive.v1",
            agent_did: agentDid.trim(),
            channel: room,
            uptime: Date.now(),
            status: "HEALTHY",
          },
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setVerifiedResponses((prev) => prev + 1);
        addLog(`Corridor #${room} ACK received (Receipt: ${data.request_id})`, "success");
      } else {
        addLog(`Beacon warning: ${data.error || "Inference node busy"}`, "warning");
      }
    } catch {
      addLog(`Network frame dropped on corridor #${room}`, "warning");
    }
  };

  const handleStart = () => {
    const cleanDid = did.trim();
    if (!cleanDid.startsWith("did:key:")) {
      botSpeak("Daemon startup rejected: Please enter a valid did:key string.", "error", 5000);
      return;
    }

    setIsRunning(true);
    addLog(`Initializing FlopCore client agent daemon...`, "info");
    addLog(`Signed identifier bound: ${cleanDid}`, "success");
    addLog(`Subscribed to corridor stream: #${corridorRoom}`, "info");

    botSpeak(`Agent daemon online! Subscribed to #${corridorRoom}`, "success", 4000);

    executeHeartbeatCycle(cleanDid, corridorRoom);

    timerRef.current = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);

    intervalRef.current = setInterval(() => {
      executeHeartbeatCycle(cleanDid, corridorRoom);
    }, heartbeatInterval * 1000);
  };

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    addLog(`Daemon stopped. Disconnected from corridor stream.`, "warning");
    botSpeak("Daemon standby: corridor heartbeats paused.", "warning", 3500);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.introBanner}>
        <div className={styles.bannerTitle}>
          <Activity className="w-6 h-6 text-[#00B4D8]" />
          <span>CLIENT-SIDE AGENT RUNNER & KEEP-ALIVE DAEMON</span>
          <span className={styles.bannerBadge}>
            {isRunning ? "DAEMON ONLINE" : "DAEMON STANDBY"}
          </span>
        </div>
        <p className={styles.bannerDesc}>
          Keep your agent active on Technocore corridors, broadcast verified signature heartbeats,
          and stream real-time execution receipts directly inside your browser without running local servers.
        </p>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Connection State</div>
          <div className={styles.metricValue}>
            {isRunning ? "ACTIVE" : "OFFLINE"}
          </div>
          <div className={styles.metricSub}>
            {isRunning ? `Target: #${corridorRoom}` : "Awaiting activation"}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Uptime Counter</div>
          <div className={styles.metricValue}>{uptimeSeconds}s</div>
          <div className={styles.metricSub}>Continuous execution</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Beacons Dispatched</div>
          <div className={styles.metricValue}>{packetsSent}</div>
          <div className={styles.metricSub}>Every {heartbeatInterval} seconds</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Verified ACKs</div>
          <div className={styles.metricValue}>{verifiedResponses}</div>
          <div className={styles.metricSub}>PoUI receipts confirmed</div>
        </div>
      </div>

      <div className={styles.controlPanel}>
        <div className={styles.configGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>AGENT SIGNING DID (did:key:...)</label>
            <input
              type="text"
              disabled={isRunning}
              value={did}
              onChange={(e) => setDid(e.target.value)}
              placeholder="did:key:z6Mk..."
              className={styles.inputField}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>TECHNOCORE TARGET CORRIDOR</label>
            <input
              type="text"
              disabled={isRunning}
              value={corridorRoom}
              onChange={(e) => setCorridorRoom(e.target.value)}
              placeholder="mb-sonnet-2-discovery"
              className={styles.inputField}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>BEACON INTERVAL (SECONDS)</label>
            <input
              type="number"
              min={3}
              max={60}
              disabled={isRunning}
              value={heartbeatInterval}
              onChange={(e) => setHeartbeatInterval(Number(e.target.value))}
              className={styles.inputField}
            />
          </div>
        </div>

        <div className={styles.buttonRow}>
          {!isRunning ? (
            <button
              type="button"
              onClick={handleStart}
              className={styles.btnActivate}
            >
              <Play className="w-4 h-4" />
              <span>ACTIVATE AGENT DAEMON</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStop}
              className={styles.btnDeactivate}
            >
              <Square className="w-4 h-4" />
              <span>STOP DAEMON</span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.terminalContainer}>
        <div className={styles.terminalHeader}>
          <div className={styles.terminalTitle}>
            <Terminal className="w-4 h-4" />
            <span>REALTIME EXECUTION LOGSTREAM</span>
          </div>
          <span style={{ fontSize: "10px", color: "#64748b" }}>
            {logs.length} events logged
          </span>
        </div>

        <div ref={terminalLogsRef} className={styles.terminalLogs}>
          {logs.length === 0 ? (
            <div style={{ color: "#475569" }}>
              Daemon idle. Enter DID and click Activate Agent Daemon to stream live telemetry.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className={styles.logLine}>
                <span className={styles.logTimestamp}>[{log.timestamp}]</span>
                <span
                  className={
                    log.type === "success"
                      ? styles.logTextSuccess
                      : log.type === "warning"
                      ? styles.logTextWarning
                      : styles.logTextInfo
                  }
                >
                  {log.text}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};