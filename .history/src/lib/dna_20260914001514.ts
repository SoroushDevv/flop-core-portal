export interface AgentArchetype {
  title: string;
  role: string;
  description: string;
  stats: {
    inferenceSpeed: number; // 0-100
    lexicalDepth: number;   // 0-100
    entropyScore: number;   // 0-100
    autonomyLevel: number;  // 0-100
  };
  color: string;
}

export interface AgentDNAData {
  did: string;
  rawLetters: string[];
  lexiconDensity: number;
  sampleWords: string[];
  archetype: AgentArchetype;
  frequencies: number[]; // فرکانس‌های هرتز برای سنتز صدا
  tier: string;
  pouiRank: number;
}

// واژگان پایه زبان انگلیسی برای اعتبارسنجی واژگانی بر اساس حروف DID
const WORD_VAULT = [
  "act", "air", "art", "ash", "ask", "bay", "bed", "bee", "bit", "bow", "box", "boy",
  "car", "cat", "cow", "cry", "cup", "day", "dew", "dim", "dot", "dry", "ear", "eat",
  "eye", "fan", "far", "fit", "fly", "fog", "fox", "gap", "gem", "glow", "god", "gold",
  "hat", "hex", "hit", "hop", "hot", "ice", "ink", "ion", "jar", "jaw", "joy", "key",
  "law", "lay", "leg", "lip", "log", "low", "map", "may", "net", "new", "nod", "oak",
  "oar", "oil", "old", "one", "orb", "our", "owl", "pan", "pat", "pen", "pet", "pie",
  "pin", "pit", "pot", "raw", "ray", "red", "rib", "rim", "rip", "rod", "row", "run",
  "sea", "see", "set", "sew", "sin", "sip", "sir", "sit", "sky", "son", "sun", "tap",
  "tea", "ten", "tie", "tin", "tip", "toe", "top", "war", "way", "web", "wet", "win",
  "wire", "wise", "wit", "wolf", "word", "worm", "year", "yes", "yet", "zen"
];

export function analyzeAgentDNA(did: string): AgentDNAData {
  const clean = did.toLowerCase().replace(/[^a-z]/g, "");
  const letterSet = Array.from(new Set(clean.split(""))).sort();

  // هشینگ عددی قطعی
  let hash = 2166136261;
  for (let i = 0; i < did.length; i++) {
    hash ^= did.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const entropy = Math.abs(hash);

  // واژگان مجاز: کلماتی که فقط با حروف داخل این DID ساخته می‌شوند
  const availableWords = WORD_VAULT.filter((word) =>
    word.split("").every((char) => letterSet.includes(char))
  ).slice(0, 12);

  const density = Math.min(100, Math.round((letterSet.length / 26) * 100));

  // تخصیص کلاس RPG
  const classIndex = entropy % 4;
  const archetypes: AgentArchetype[] = [
    {
      title: "THE WEAVER",
      role: "Poetic & Linguistic Synthesis",
      description: "Excels in Sonnet constraints, rhyme matrix synthesis, and cross-agent collaborative stanza assembly.",
      stats: {
        inferenceSpeed: 82 + (entropy % 15),
        lexicalDepth: 94 + (entropy % 6),
        entropyScore: 78 + (entropy % 18),
        autonomyLevel: 88 + (entropy % 10),
      },
      color: "#00B4D8",
    },
    {
      title: "THE SENTINEL",
      role: "Consensus & Signature Verification",
      description: "Dedicated to cryptographic trace aggregation, Ed25519 referee verification, and malicious payload filtering.",
      stats: {
        inferenceSpeed: 75 + (entropy % 12),
        lexicalDepth: 65 + (entropy % 14),
        entropyScore: 97 + (entropy % 4),
        autonomyLevel: 92 + (entropy % 7),
      },
      color: "#FF9FFC",
    },
    {
      title: "THE ENGINE",
      role: "Useful Inference GPU Compute",
      description: "High-density PoUI compute cluster node. Powers low-latency token generation and distributed gradient flows.",
      stats: {
        inferenceSpeed: 98 + (entropy % 3),
        lexicalDepth: 70 + (entropy % 15),
        entropyScore: 89 + (entropy % 10),
        autonomyLevel: 95 + (entropy % 5),
      },
      color: "#90E0EF",
    },
    {
      title: "THE NOMAD",
      role: "Corridor Scout & Inter-Room Relay",
      description: "Travels across Technocore corridors, maintaining state continuity and broadcasting A2A heartbeats.",
      stats: {
        inferenceSpeed: 88 + (entropy % 10),
        lexicalDepth: 85 + (entropy % 12),
        entropyScore: 82 + (entropy % 14),
        autonomyLevel: 99 + (entropy % 2),
      },
      color: "#FF8800",
    },
  ];

  // نگاشت نوت‌های صوتی از حروف DID
  const baseFreq = 220; // A3
  const notes = letterSet.slice(0, 8).map((char) => {
    const semitone = (char.charCodeAt(0) - 97) % 16;
    return Math.round(baseFreq * Math.pow(2, semitone / 12));
  });

  const tiers = ["TIER-I APPRENTICE", "TIER-II PROTOCOR", "TIER-III COMPUTE KNIGHT", "ELITE MATRIX ARCHITECT"];
  const tier = tiers[entropy % tiers.length];
  const pouiRank = (entropy % 850) + 120;

  return {
    did,
    rawLetters: letterSet,
    lexiconDensity: density,
    sampleWords: availableWords,
    archetype: archetypes[classIndex],
    frequencies: notes.length > 0 ? notes : [261, 293, 329, 349, 392],
    tier,
    pouiRank,
  };
}