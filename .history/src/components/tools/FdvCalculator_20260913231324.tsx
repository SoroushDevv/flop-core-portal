"use client";

import React, { useState } from "react";
import { FLOP_CONFIG } from "@/lib/constants";

export const FdvCalculator: React.FC = () => {
  const [tokens, setTokens] = useState<number>(5000);
  const [fdv, setFdv] = useState<number>(100_000_000);

  const tokenPrice = fdv / FLOP_CONFIG.TOTAL_SUPPLY;
  const usdValue = tokens * tokenPrice;
  const poolShare = (tokens / FLOP_CONFIG.AGENT_POOL) * 100;

  const presets = [25_000_000, 50_000_000, 100_000_000, 250_000_000, 500_000_000, 1_000_000_000];

  return (
    <div className="p-6 rounded-xl bg-[#0B0F19] border border-[#2F293A] font-mono">
      <div className="flex justify-between items-center border-b border-[#2F293A] pb-4 mb-6">
        <div>
          <h3 className="text-sm font-bold text-[#00B4D8]">$FLOP GENESIS AIRDROP SIMULATOR</h3>
          <p className="text-xs text-slate-400 mt-1">
            Total Supply: 18.10B $FLOP | Agent Inference Pool: 1.20B (6.6%)
          </p>
        </div>
        <span className="text-[10px] px-2 py-1 rounded border border-[#00B4D8]/30 text-[#00B4D8]">
          TOKENOMICS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-[#04060A] border border-[#2F293A]">
          <label className="text-xs text-slate-400 block mb-2">ESTIMATED $FLOP TOKENS:</label>
          <input
            type="number"
            value={tokens}
            onChange={(e) => setTokens(Number(e.target.value))}
            className="w-full bg-[#0D131F] border border-[#334155] rounded p-2 text-sm text-white outline-none"
          />
        </div>

        <div className="p-4 rounded-lg bg-[#04060A] border border-[#2F293A]">
          <label className="text-xs text-slate-400 block mb-2">PROJECTED FDV (USD):</label>
          <input
            type="number"
            value={fdv}
            onChange={(e) => setFdv(Number(e.target.value))}
            className="w-full bg-[#0D131F] border border-[#334155] rounded p-2 text-sm text-white outline-none"
          />
          <div className="flex gap-1.5 flex-wrap mt-2">
            {presets.map((val) => (
              <button
                key={val}
                onClick={() => setFdv(val)}
                className="text-[10px] px-2 py-0.5 rounded bg-[#1E293B] border border-[#334155] text-[#90E0EF] hover:border-[#00B4D8]"
              >
                ${val / 1_000_000}M
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 rounded-lg bg-gradient-to-br from-[#00B4D8]/10 to-[#04060A] border border-[#00B4D8]">
        <div className="text-xs text-slate-400">ESTIMATED AIRDROP VALUE AT TGE:</div>
        <div className="text-3xl font-extrabold text-[#00B4D8] my-1">
          ${usdValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-slate-300">
          Unit Price: <span className="text-[#FF9FFC]">${tokenPrice.toFixed(6)}</span> / FLOP
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          Share of 1.2B Agent Pool: <span className="text-[#90E0EF]">{poolShare.toFixed(5)}%</span>
        </div>
      </div>
    </div>
  );
};