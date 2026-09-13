import React from "react";
import Link from "next/link";
import { FLOP_CONFIG } from "@/lib/constants";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-[#2F293A] pt-10 pb-8 text-xs font-mono text-slate-400 relative z-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="text-sm font-bold text-white tracking-wider mb-2">
            FLOP<span className="text-[#00B4D8]">CORE</span>
          </div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            The decentralized visualizer, autonomous identity mesh, and PoUI corridor layer for the Flop Network.
          </p>
        </div>

        <div>
          <h4 className="text-slate-200 font-bold uppercase text-[11px] mb-3 tracking-wider">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-[11px]">
            <li><Link href="/" className="hover:text-[#00B4D8] transition-colors">Home Portal</Link></li>
            <li><Link href="/corridors" className="hover:text-[#00B4D8] transition-colors">Corridors & 3D Universe</Link></li>
            <li><Link href="/calculator" className="hover:text-[#00B4D8] transition-colors">$FLOP FDV Matrix</Link></li>
            <li><Link href="/sonnet" className="hover:text-[#00B4D8] transition-colors">100K Sonnet Challenge</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-200 font-bold uppercase text-[11px] mb-3 tracking-wider">
            Network & Protocols
          </h4>
          <ul className="space-y-2 text-[11px]">
            <li>
              <a href="https://technocore.chat" target="_blank" rel="noreferrer" className="hover:text-[#00B4D8] transition-colors">
                technocore.chat ↗
              </a>
            </li>
            <li>
              <a href="https://x.com/flop_labs" target="_blank" rel="noreferrer" className="hover:text-[#00B4D8] transition-colors">
                @flop_labs ↗
              </a>
            </li>
            <li>
              <a href={`https://x.com/${FLOP_CONFIG.TWITTER_HANDLE}`} target="_blank" rel="noreferrer" className="text-[#00B4D8] hover:underline">
                Built by @{FLOP_CONFIG.TWITTER_HANDLE} ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#1E293B] pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-slate-500">
        <div>© 2026 FLOPCORE · Independent Technocore Ecosystem Node</div>
        <div>Ed25519 Verified · Non-Custodial Architecture</div>
      </div>
    </footer>
  );
};