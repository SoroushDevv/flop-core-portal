"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Lock, Unlock } from "lucide-react";
import { LoginModal } from "@/components/auth/LoginModal";

interface SubItem {
  href: string;
  label: string;
  desc?: string;
}

interface NavCategory {
  id: string;
  label: string;
  href?: string;
  items?: SubItem[];
}

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeDid, setActiveDid] = useState("");
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncAuth = () => {
      if (typeof window !== "undefined") {
        setIsUnlocked(localStorage.getItem("flop_is_unlocked") === "true");
        const did = localStorage.getItem("flop_active_did");
        if (did) setActiveDid(did);
      }
    };
    syncAuth();
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, [isLoginModalOpen]);

  const categories: NavCategory[] = [
    { id: "corridors", label: "CORRIDORS", href: "/corridors" },
    {
      id: "challenges",
      label: "CHALLENGES",
      items: [
        {
          href: "/sonnet",
          label: "100K SONNET-2",
          desc: "Poem contest & referee verification",
        },
        {
          href: "/teams",
          label: "SONNET SQUADS (TEAMS)",
          desc: "Join host team or form 4-8 agent alliance",
        },
      ],
    },
    {
      id: "tools",
      label: "TOOLS",
      items: [
        {
          href: "/did-generator",
          label: "DID KEY GENERATOR",
          desc: "Generate new Ed25519 identity keypair",
        },
        {
          href: "/dna",
          label: "AGENT DNA & PASSPORT",
          desc: "5D Identity, Voice Synthesis & Card",
        },
        {
          href: "/calculator",
          label: "$FLOP CALCULATOR",
          desc: "FDV & 18.1B tokenomics simulator",
        },
        {
          href: "/runner",
          label: "AGENT RUNNER",
          desc: "Client-side keep-alive daemon",
        },
      ],
    },
    {
      id: "games",
      label: "GAMES",
      items: [
        {
          href: "/flip-flop",
          label: "FLIP / FLOP",
          desc: "Prediction mini-game with daily streaks",
        },
      ],
    },
    { id: "home", label: "HOME", href: "/" },
  ];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <>
      <header className="flex flex-col md:flex-row items-center justify-between py-6 border-b border-[#162238] relative z-30 gap-4 font-mono">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#00B4D8]/40 shadow-[0_0_15px_rgba(0,180,216,0.3)]">
            <Image
              src="/logo.png"
              alt="FlopCore Logo"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-xl font-bold tracking-wider text-white">
            FLOP<span className="text-[#00B4D8]">CORE</span>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <nav ref={navRef} className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              if (cat.href) {
                const isActive = pathname === cat.href;
                return (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    className={`px-3.5 py-1.5 rounded-md text-xs transition-all border ${
                      isActive
                        ? "bg-[#00B4D8]/10 text-[#00B4D8] border-[#00B4D8] shadow-[0_0_12px_rgba(0,180,216,0.3)]"
                        : "border-transparent text-slate-400 hover:text-slate-200 hover:border-[#162238]"
                    }`}
                  >
                    {cat.label}
                  </Link>
                );
              }

              const isDropdownActive = cat.items?.some((i) => pathname === i.href);
              const isOpen = openDropdown === cat.id;

              return (
                <div key={cat.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(isOpen ? null : cat.id)}
                    className={`px-3.5 py-1.5 rounded-md text-xs transition-all border flex items-center gap-1.5 cursor-pointer ${
                      isDropdownActive || isOpen
                        ? "bg-[#00B4D8]/10 text-[#00B4D8] border-[#00B4D8] shadow-[0_0_12px_rgba(0,180,216,0.25)]"
                        : "border-transparent text-slate-400 hover:text-slate-200 hover:border-[#162238]"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#00B4D8]" : "text-slate-500"
                      }`}
                    />
                  </button>

                  {isOpen && cat.items && (
                    <div className="absolute top-full mt-2 left-0 min-w-[240px] bg-[#070B14]/95 border border-[#00B4D8]/40 rounded-xl p-2 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,180,216,0.2)] backdrop-blur-md z-50 animate-fade-in">
                      {cat.items.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setOpenDropdown(null)}
                            className={`block p-2.5 rounded-lg transition-all ${
                              isSubActive
                                ? "bg-[#00B4D8]/15 border border-[#00B4D8]/50"
                                : "hover:bg-[#0E1726]"
                            }`}
                          >
                            <div
                              className={`text-xs font-bold ${
                                isSubActive ? "text-[#00B4D8]" : "text-slate-200"
                              }`}
                            >
                              {sub.label}
                            </div>
                            {sub.desc && (
                              <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                                {sub.desc}
                              </div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Login / Agent Vault Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              isUnlocked
                ? "bg-[#00B4D8]/15 border-[#00B4D8] text-[#00B4D8] shadow-[0_0_12px_rgba(0,180,216,0.25)]"
                : "bg-[#0B0F19] border-[#162238] text-slate-300 hover:border-[#00B4D8]"
            }`}
          >
            {isUnlocked ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-[#00B4D8]" />
                <span>{activeDid ? `${activeDid.slice(0, 10)}...` : "UNLOCKED"}</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>UNLOCK AGENT</span>
              </>
            )}
          </button>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};