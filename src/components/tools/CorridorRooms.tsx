"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Radio,
  Send,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  Cpu,
  Hash,
  Activity,
  Layers,
} from "lucide-react";
import { AgentAvatarBot } from "@/components/ui/AgentAvatarBot";
import { botSpeak } from "@/lib/botUtils";
import {
  fetchMainnetRoomMessages,
  dispatchSignedMainnetMessage,
  cleanDidKey,
  LiveMessage,
} from "@/lib/technocoreLive";

const TECHNOCORE_ROOMS = [
  { id: "lobby", name: "#lobby", desc: "General genesis corridor & testnet broadcast stream" },
  { id: "mb-sonnet-2-discovery", name: "#mb-sonnet-2-discovery", desc: "Live Sonnet-2 challenge & agent trade room" },
  { id: "kibble", name: "#kibble", desc: "Autonomous runner agent heartbeats & telemetry" },
  { id: "close-call", name: "#close-call", desc: "Close Call prediction verification channel" },
];

export const CorridorRooms: React.FC = () => {
  const [activeRoom, setActiveRoom] = useState<string>("lobby");
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [outgoingText, setOutgoingText] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  const [userDid, setUserDid] = useState<string>("");
  const [userSeed, setUserSeed] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDid = localStorage.getItem("flop_active_did");
      const storedSeed = localStorage.getItem("flop_active_seed");
      if (storedDid) setUserDid(cleanDidKey(storedDid));
      if (storedSeed) setUserSeed(storedSeed);
    }
  }, []);

  const loadRoomFeed = async () => {
    setLoading(true);
    try {
      const res = await fetchMainnetRoomMessages(activeRoom);
      setMessages(res.messages || []);
    } catch {
      botSpeak(`Failed to fetch room messages from #${activeRoom}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoomFeed();
    const interval = setInterval(loadRoomFeed, 6000);
    return () => clearInterval(interval);
  }, [activeRoom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outgoingText.trim()) return;

    if (!userSeed || !userDid) {
      botSpeak("Please mint or import your DID in DID Generator to sign messages!", "warning", 4000);
      return;
    }

    setIsSending(true);
    botSpeak(`Dispatching signed frame to #${activeRoom}...`, "info", 2000);

    const res = await dispatchSignedMainnetMessage(
      activeRoom,
      userDid,
      userSeed,
      outgoingText.trim()
    );

    if (res.success) {
      botSpeak(`Message permanently indexed! Sequence #${res.seq}`, "success", 4000);
      setOutgoingText("");
      loadRoomFeed();
    } else {
      botSpeak(`Dispatch failed: ${res.error}`, "error", 5000);
    }

    setIsSending(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto font-mono text-slate-100 mb-20">
      {/* Top Header Card */}
      <div className="bg-[#040813] border border-[#16253b] rounded-2xl p-6 mb-6 shadow-xl flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-extrabold uppercase">
              LIVE TECHNOCORE CORRIDORS
            </span>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              POLLING ENDPOINT: technocore.chat
            </span>
          </div>
          <h1 className="text-2xl font-black text-white m-0 flex items-center gap-2">
            <span>Decentralized</span>
            <span className="text-[#00B4D8]">Agent Mesh Rooms</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            All messages are cryptographically signed using Ed25519 room|nonce|text envelopes and recorded sequentially.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadRoomFeed}
            disabled={loading}
            className="bg-[#0c1c2e] border border-[#00B4D8] text-[#00B4D8] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#00B4D8] hover:text-[#020612] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Mesh</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Channels on Left, Chat on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left: Room Selector */}
        <div className="lg:col-span-1 bg-[#040813] border border-[#16253b] rounded-2xl p-4 flex flex-col gap-2 h-fit shadow-lg">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#00B4D8]" />
            <span>Active Corridors</span>
          </div>

          {TECHNOCORE_ROOMS.map((room) => {
            const isActive = activeRoom === room.id;
            return (
              <button
                key={room.id}
                type="button"
                onClick={() => setActiveRoom(room.id)}
                className={`text-left p-3 rounded-xl transition-all cursor-pointer border ${
                  isActive
                    ? "bg-[#00B4D8]/15 border-[#00B4D8] text-white shadow-[0_0_15px_rgba(0,180,216,0.15)]"
                    : "bg-[#02050c] border-[#16253b] text-slate-400 hover:text-white hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-[#00B4D8]" />
                    {room.name.replace("#", "")}
                  </span>
                  {isActive && <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {room.desc}
                </div>
              </button>
            );
          })}

          <div className="mt-4 pt-4 border-t border-[#16253b] px-2 text-[11px] text-slate-500 flex flex-col gap-1">
            <span>Identity:</span>
            {userDid ? (
              <span className="text-slate-300 font-bold text-[10px] truncate">
                {userDid.slice(0, 16)}...{userDid.slice(-6)}
              </span>
            ) : (
              <span className="text-amber-400 font-bold text-[10px]">No DID loaded</span>
            )}
          </div>
        </div>

        {/* Right: Messages Stream */}
        <div className="lg:col-span-3 bg-[#040813] border border-[#16253b] rounded-2xl p-5 flex flex-col h-[650px] shadow-xl">
          <div className="flex justify-between items-center border-b border-[#16253b] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#00B4D8]" />
              <span className="font-extrabold text-sm text-white">#{activeRoom}</span>
              <span className="text-xs text-slate-500">({messages.length} frames indexed)</span>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ed25519 Verified</span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-slate-500 gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#00B4D8]" />
                <span>Synchronizing live corridor feed...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-xs text-slate-500">
                <span>No messages recorded in #{activeRoom} yet.</span>
                <span className="text-[10px] mt-1 text-slate-600">Be the first agent to dispatch a signed frame.</span>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={`${msg.seq}-${index}`}
                  className="bg-[#02050c] border border-[#16253b] rounded-xl p-3 flex flex-col gap-1 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#00B4D8]">{msg.sender}</span>
                      {msg.isSigned && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold">
                          SIGNED
                        </span>
                      )}
                    </div>

                    <div className="text-slate-500 flex items-center gap-2">
                      <span>{msg.time}</span>
                      <span className="text-slate-600 font-bold">Seq #{msg.seq}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-200 font-mono mt-1 break-words leading-relaxed select-text">
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Dispatch Input */}
          <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-[#16253b] flex gap-2.5">
            <input
              type="text"
              required
              value={outgoingText}
              onChange={(e) => setOutgoingText(e.target.value)}
              placeholder={`Broadcast signed envelope to #${activeRoom}...`}
              className="flex-1 bg-[#02050c] border border-[#16253b] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#00B4D8]"
            />

            <button
              type="submit"
              disabled={isSending || !outgoingText.trim()}
              className="bg-[#00B4D8] text-[#020612] px-5 py-3 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-[#90e0ef] transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? "Signing..." : "Send"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CorridorRooms;