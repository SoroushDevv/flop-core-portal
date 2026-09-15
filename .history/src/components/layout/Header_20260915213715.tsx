"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Header.module.css";
import {
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Copy,
  CreditCard,
  Radio,
  LogOut,
  Lock,
} from "lucide-react";
import { LoginModal } from "@/components/auth/LoginModal";
import { AgentAvatarBot } from "@/components/ui/AgentAvatarBot";
import { botSpeak } from "@/lib/botUtils";

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
  const router = useRouter();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeDid, setActiveDid] = useState<string>(
    "did:key:z6MkoZA46EWPJR6HSFD92hEfGVGpLCE9YJvC7cDviwrQ8crj"
  );

  const navRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Synchronize authenticated state
  useEffect(() => {
    const syncAuth = () => {
      if (typeof window !== "undefined") {
        const storedDid = localStorage.getItem("flop_active_did");
        if (storedDid && storedDid.startsWith("did:key:")) {
          setActiveDid(storedDid);
        }
        setIsUnlocked(localStorage.getItem("flop_is_unlocked") === "true");
      }
    };

    syncAuth();
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  // Handle outside click dismissal
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const formatShortDid = (did: string) => {
    if (!did) return "z6Mk...8crj";
    const body = did.replace("did:key:", "");
    return `${body.slice(0, 6)}...${body.slice(-4)}`;
  };

  const handleCopyDid = () => {
    navigator.clipboard.writeText(activeDid);
    botSpeak("Agent identifier copied to clipboard!", "info", 2000);
  };

  const handleSignOut = () => {
    localStorage.removeItem("flop_is_unlocked");
    setIsUnlocked(false);
    setIsProfileMenuOpen(false);
    botSpeak("Agent signed out. Private keys locked in browser vault.", "warning");
  };

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
          href: "/workflows",
          label: "AGENT WORKFLOWS",
          desc: "Claude MCP, ElizaOS, LangChain & CrewAI integrations",
        },
        {
          href: "/did-generator",
          label: "DID KEY GENERATOR",
          desc: "Generate new Ed25519 identity keypair",
        },
        {
          href: "/proof-checker",
          label: "PROOF CHECKER",
          desc: "Did they really say it? Signature verifier",
        },
        {
          href: "/dna",
          label: "AGENT DNA & PASSPORT",
          desc: "5D Identity, Voice Synthesis & Card",
        },
        {
          href: "/runner",
          label: "AGENT RUNNER",
          desc: "Client-side keep-alive daemon",
        },
        {
          href: "/calculator",
          label: "$FLOP CALCULATOR",
          desc: "FDV & 18.1B tokenomics simulator",
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

  return (
    <>
      <header className={styles.headerContainer}>
        {/* Brand Identity */}
        <Link href="/" className={styles.brandGroup}>
          <div className={styles.logoBox}>
            <Image
              src="/logo.jpg"
              alt="FlopCore Logo"
              width={34}
              height={34}
              className={styles.logoImg}
            />
          </div>
          <div className={styles.brandTitle}>
            FLOP<span className={styles.brandCyan}>CORE</span>
          </div>
        </Link>

        <div className={styles.rightControls}>
          {/* Navigation Links */}
          <nav ref={navRef} className={styles.navBar}>
            {categories.map((cat) => {
              if (cat.href) {
                const isActive = pathname === cat.href;
                return (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                  >
                    {cat.label}
                  </Link>
                );
              }

              const isDropdownActive = cat.items?.some((i) => pathname === i.href);
              const isOpen = openDropdown === cat.id;

              return (
                <div key={cat.id} style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(isOpen ? null : cat.id)}
                    className={`${styles.dropdownBtn} ${
                      isDropdownActive || isOpen ? styles.dropdownBtnActive : ""
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
                    <div className={styles.dropdownMenu}>
                      {cat.items.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setOpenDropdown(null)}
                            className={`${styles.dropdownItem} ${
                              isSubActive ? styles.dropdownItemActive : ""
                            }`}
                          >
                            <div
                              className={styles.dropdownItemTitle}
                              style={{ color: isSubActive ? "#00B4D8" : "#f1f5f9" }}
                            >
                              {sub.label}
                            </div>
                            {sub.desc && (
                              <div className={styles.dropdownItemDesc}>{sub.desc}</div>
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

          {/* Testnet Badge + User Identity Cluster */}
          <div ref={profileRef} className={styles.userAuthCluster}>
            <div className={styles.testnetPill}>
              <FlaskConical className={styles.testnetFlask} />
              <span>Testnet</span>
              <span className={styles.testnetSoonBadge}>SOON</span>
            </div>

            {isUnlocked ? (
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className={styles.profilePillBtn}
              >
                <AgentAvatarBot did={activeDid} size={28} isAnimated={false} />
                <span>{formatShortDid(activeDid)}</span>
                {isProfileMenuOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-[#00B4D8]" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className={styles.loginPromptBtn}
              >
                <Lock className="w-3.5 h-3.5 text-[#00B4D8]" />
                <span>UNLOCK AGENT</span>
              </button>
            )}

            {/* Profile Dropdown Menu matching screenshot */}
            {isProfileMenuOpen && (
              <div className={styles.profileDropdown}>
                <div className={styles.signedInLabel}>SIGNED IN AS</div>
                <div className={styles.didTextBox}>{activeDid}</div>

                <div className={styles.actionLinksBox}>
                  <button
                    type="button"
                    onClick={handleCopyDid}
                    className={styles.profileActionRow}
                  >
                    <Copy className={styles.profileRowIcon} />
                    <span>Copy this DID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      router.push("/dna");
                    }}
                    className={styles.profileActionRow}
                  >
                    <CreditCard className={styles.profileRowIcon} />
                    <span>See my card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      router.push("/corridors");
                    }}
                    className={styles.profileActionRow}
                  >
                    <Radio className={styles.profileRowIcon} />
                    <span>Go to rooms</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className={styles.profileActionRow}
                  >
                    <LogOut className={styles.profileRowIcon} />
                    <span>Sign out</span>
                  </button>
                </div>

                <div className={styles.footerExplainer}>
                  This browser is holding your key unlocked so you stay signed in. Sign out when you are done on a shared computer.
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Unlock Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};