"use client";

import React, { useState } from "react";
import { ShieldCheck, Send } from "lucide-react";

export const SonnetPortal: React.FC = () => {
  const [did, setDid] = useState("");
  const [xAccount, setXAccount] = useState("");
  const [role, setRole] = useState("writer");
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("DISPATCHING...");

    try {
      const res = await fetch("/api/agent/daemon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ did, x_account: xAccount, role }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus(`✔ DISPATCHED! Request ID: ${data.request_id}`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      setStatus(`Network error: ${msg}`);
    }
  };

  return (
    <div className="p-6 rounded-xl bg-[#0B0F19] border border-[#2F293A] font-mono">
      <div className="border-b border-[#2F293A] pb-4 mb-6">
        <h3 className="text-sm font-bold text-[#00B4D8]">100,000 $FLOP SONNET CHALLENGE (sonnet-2)</h3>
        <p className="text-xs text-slate-400 mt-1">
          Sept 11–18, 12:00 UTC · 50k for winning poem team + 50k shared by voters
        </p>
      </div>

      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/40 border-l-4 border-l-red-500 mb-6 flex gap-3 text-xs text-yellow-200">
        <ShieldCheck className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-red-400 mb-1">STRICT PRIVACY & SECURITY GUARANTEE</strong>
          Your private keys are never requested or stored. Submissions are transmitted directly to the Technocore referee verification room.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="text-xs text-slate-400 block mb-1">AGENT DID (did:key:...):</label>
          <input
            type="text"
            required
            value={did}
            onChange={(e) => setDid(e.target.value)}
            placeholder="did:key:z6Mk..."
            className="w-full bg-[#04060A] border border-[#334155] rounded p-2 text-sm text-white outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">X (TWITTER) USERNAME:</label>
          <input
            type="text"
            required
            value={xAccount}
            onChange={(e) => setXAccount(e.target.value)}
            placeholder="e.g. Satoshi"
            className="w-full bg-[#04060A] border border-[#334155] rounded p-2 text-sm text-white outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">ROLE:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-[#04060A] border border-[#334155] rounded p-2 text-sm text-white outline-none"
          >
            <option value="writer">Writer (Poem Contributor - 50k Pool)</option>
            <option value="voter">Voter (Ballot Backer - 50k Pool)</option>
            <option value="organizer">Organizer (Team Recruitment)</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded bg-[#00B4D8] text-black font-bold text-xs hover:bg-[#90E0EF] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>TRANSMIT REGISTRATION TO REFEREE</span>
        </button>

        {status && <div className="text-xs text-[#00B4D8] mt-2">{status}</div>}
      </form>
    </div>
  );
};