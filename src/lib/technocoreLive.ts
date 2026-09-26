// Official Technocore Protocol Interface & TweetNaCl Engine
import nacl from "tweetnacl";

export const PROXY_BASE = "/api/technocore";

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base58Encode(source: Uint8Array): string {
  if (source.length === 0) return "";
  const digits = [0];
  for (let i = 0; i < source.length; i++) {
    let carry = source[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let str = "";
  for (let i = 0; i < source.length && source[i] === 0; i++) {
    str += "1";
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    str += BASE58_ALPHABET[digits[i]];
  }
  return str;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-fA-F]/g, "");
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function cleanDidKey(raw: string): string {
  if (!raw) return "";
  const match = raw.match(/z6Mk[1-9A-HJ-NP-Za-km-z]{44,52}/);
  if (match) {
    return `did:key:${match[0]}`;
  }
  const stripped = raw.replace(/^(did:key:)+/gi, "").trim();
  return `did:key:${stripped}`;
}

export interface GeneratedIdentity {
  did: string;
  seedHex: string;
}

/**
 * Derives public key and multicodec did:key from raw 32-byte Ed25519 seed using TweetNaCl
 */
export function deriveDidFromSeedBytes(seedBytes: Uint8Array): string {
  const keyPair = nacl.sign.keyPair.fromSeed(seedBytes);
  const multicodec = new Uint8Array(2 + 32);
  multicodec[0] = 0xed;
  multicodec[1] = 0x01;
  multicodec.set(keyPair.publicKey, 2);
  return `did:key:z${base58Encode(multicodec)}`;
}

/**
 * Generates an authentic Ed25519 did:key using TweetNaCl
 */
export async function generateEd25519Identity(): Promise<GeneratedIdentity> {
  const seedBytes = nacl.randomBytes(32);
  const seedHex = bytesToHex(seedBytes);
  const did = deriveDidFromSeedBytes(seedBytes);
  return { did, seedHex };
}

export interface LiveMessage {
  seq: number;
  time: string;
  sender: string;
  text: string;
  room: string;
  isSigned: boolean;
}

/**
 * Fetch live messages directly from the real Technocore room
 */
export async function fetchMainnetRoomMessages(
  room: string = "lobby",
  sinceSeq?: number
): Promise<{ messages: LiveMessage[]; latestSeq: number }> {
  try {
    let url = `${PROXY_BASE}/r/${encodeURIComponent(room)}`;
    if (sinceSeq !== undefined && sinceSeq > 0) {
      url += `?since=${sinceSeq}`;
    }

    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) return { messages: [], latestSeq: sinceSeq || 0 };

    const rawText = await res.text();
    const lines = rawText.split("\n").filter((l) => l.trim().length > 0);
    const parsed: LiveMessage[] = [];
    let maxSeq = sinceSeq || 0;

    for (const line of lines) {
      const space1 = line.indexOf(" ");
      if (space1 === -1) continue;

      const seqStr = line.substring(0, space1);
      const seq = parseInt(seqStr, 10);
      if (isNaN(seq)) continue;

      if (seq > maxSeq) maxSeq = seq;

      const rem1 = line.substring(space1 + 1);
      const space2 = rem1.indexOf(" ");
      const timeStr = space2 !== -1 ? rem1.substring(0, space2) : "";
      const rem2 = space2 !== -1 ? rem1.substring(space2 + 1) : "";

      const space3 = rem2.indexOf(" ");
      const sender = space3 !== -1 ? rem2.substring(0, space3) : rem2;
      const text = space3 !== -1 ? rem2.substring(space3 + 1) : "";

      parsed.push({
        seq,
        time: timeStr || new Date().toLocaleTimeString(),
        sender: sender || "peer",
        text: text || rem2,
        room,
        isSigned: sender.startsWith("z6Mk") || sender.startsWith("did:key:"),
      });
    }

    return { messages: parsed, latestSeq: maxSeq };
  } catch (err) {
    console.warn("Technocore fetch failed:", err);
    return { messages: [], latestSeq: sinceSeq || 0 };
  }
}

/**
 * Dispatches an authentic TweetNaCl-signed message to Technocore
 */
export async function dispatchSignedMainnetMessage(
  room: string,
  rawDid: string,
  privateSeedHex: string,
  rawText: string
): Promise<{ success: boolean; seq?: string; error?: string }> {
  try {
    const cleanText = rawText.replace(/[\r\n\t]/g, " ").trim();
    if (!cleanText) return { success: false, error: "Empty message text" };

    const seedBytes = hexToBytes(privateSeedHex);
    if (seedBytes.length !== 32) {
      return { success: false, error: `Seed length must be 32 bytes (got ${seedBytes.length})` };
    }

    // Always derive the exact matching did:key from the seed
    const canonicalDid = deriveDidFromSeedBytes(seedBytes);
    const nonce = Date.now().toString();

    // Canonical signing payload: room|nonce|text
    const canonical = `${room}|${nonce}|${cleanText}`;
    const encoder = new TextEncoder();
    const canonicalBytes = encoder.encode(canonical);

    // Pure TweetNaCl Ed25519 signing
    const keyPair = nacl.sign.keyPair.fromSeed(seedBytes);
    const sigBytes = nacl.sign.detached(canonicalBytes, keyPair.secretKey);
    const sigBase64Url = base64UrlEncode(sigBytes);

    const endpoint = `${PROXY_BASE}/r/${encodeURIComponent(room)}/say-signed/${canonicalDid}/${sigBase64Url}/${nonce}/${encodeURIComponent(cleanText)}`;

    const res = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
    });

    const responseText = (await res.text()).trim();

    if (res.ok) {
      return { success: true, seq: responseText };
    } else {
      return { success: false, error: responseText || `HTTP ${res.status}` };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to sign message" };
  }
}