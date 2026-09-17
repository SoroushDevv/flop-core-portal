// Official Technocore Protocol Interface
export const PROXY_BASE = "/api/technocore";

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

function hexToBytes(hex: string): Uint8Array {
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
      // Expected server format: "<seq> <time> <sender> <text>"
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
 * Derives authentic Ed25519 signature and executes GET /r/{room}/say-signed/...
 */
export async function dispatchSignedMainnetMessage(
  room: string,
  did: string,
  privateSeedHex: string,
  rawText: string
): Promise<{ success: boolean; seq?: string; error?: string }> {
  try {
    // 1. Single-line sweep required by Technocore
    const cleanText = rawText.replace(/[\r\n\t]/g, " ").trim();
    if (!cleanText) return { success: false, error: "Empty message text" };

    // 2. 1 to 19 digit nonce strictly increasing
    const nonce = Date.now().toString();

    // 3. Exact canonical target: room|nonce|text
    const canonical = `${room}|${nonce}|${cleanText}`;
    const encoder = new TextEncoder();
    const canonicalBytes = encoder.encode(canonical);

    // 4. Ed25519 key derivation (PKCS8 container around 32-byte seed)
    const seedBytes = hexToBytes(privateSeedHex);
    const pkcs8Prefix = new Uint8Array([
      0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70,
      0x04, 0x22, 0x04, 0x20,
    ]);
    const fullPkcs8 = new Uint8Array(pkcs8Prefix.length + seedBytes.length);
    fullPkcs8.set(pkcs8Prefix, 0);
    fullPkcs8.set(seedBytes, pkcs8Prefix.length);

    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      fullPkcs8 as BufferSource,
      { name: "Ed25519" },
      false,
      ["sign"]
    );

    const sigBuffer = await crypto.subtle.sign(
      "Ed25519",
      privateKey,
      canonicalBytes as BufferSource
    );

    const sigBase64Url = base64UrlEncode(new Uint8Array(sigBuffer));

    // 5. Send real write request via proxy to https://technocore.chat
    const cleanDid = did.replace("did:key:", "");
    const endpoint = `${PROXY_BASE}/r/${encodeURIComponent(room)}/say-signed/${encodeURIComponent(
      cleanDid
    )}/${encodeURIComponent(sigBase64Url)}/${nonce}/${encodeURIComponent(cleanText)}`;

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
    return { success: false, error: err.message || "Failed to sign" };
  }
}