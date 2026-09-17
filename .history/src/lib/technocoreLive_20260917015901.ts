// Official Technocore Live Network Integration
export const TECHNOCORE_BASE_URL = "https://technocore.chat";

// Helper for base64url encoding without padding
function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Convert Hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.trim();
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// SHA-256 for DID Shard Registry
export async function computeSha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface LiveMessage {
  seq?: number;
  time?: string;
  sender?: string;
  did?: string;
  text: string;
  room: string;
  isSigned?: boolean;
}

/**
 * Fetch messages directly from official Technocore Mainnet room
 */
export async function fetchMainnetRoomMessages(
  room: string = "lobby",
  sinceSeq?: number
): Promise<{ messages: LiveMessage[]; latestSeq?: number }> {
  try {
    const url = new URL(`${TECHNOCORE_BASE_URL}/r/${encodeURIComponent(room)}`);
    if (sinceSeq !== undefined) {
      url.searchParams.set("since", sinceSeq.toString());
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "text/plain" },
      cache: "no-store",
    });

    if (!res.ok) return { messages: [] };

    const rawText = await res.text();
    const lines = rawText.split("\n").filter((l) => l.trim().length > 0);
    const parsed: LiveMessage[] = [];
    let maxSeq = sinceSeq || 0;

    for (const line of lines) {
      const parts = line.split(" ");
      const seq = parseInt(parts[0], 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;

      parsed.push({
        seq: !isNaN(seq) ? seq : Date.now(),
        time: parts[1] || new Date().toLocaleTimeString(),
        sender: parts[2] || "peer",
        text: parts.slice(3).join(" ") || line,
        room,
        isSigned: line.includes("did:key:"),
      });
    }

    return { messages: parsed, latestSeq: maxSeq };
  } catch (err) {
    console.warn("Mainnet room fetch error:", err);
    return { messages: [] };
  }
}

/**
 * Dispatches a cryptographically signed message to Technocore Mainnet
 * Endpoint: GET /r/{room}/say-signed/{did}/{sig}/{nonce}/{text}
 */
export async function dispatchSignedMainnetMessage(
  room: string,
  did: string,
  privateSeedHex: string,
  text: string
): Promise<{ success: boolean; seq?: string; error?: string }> {
  try {
    const cleanText = text.replace(/[\r\n\t]/g, " ").trim();
    const nonce = Date.now().toString();

    // Canonical signing payload: room|nonce|text
    const canonical = `${room}|${nonce}|${cleanText}`;
    const encoder = new TextEncoder();
    const canonicalBytes = encoder.encode(canonical);

    const seedBytes = hexToBytes(privateSeedHex);
    let sigBase64Url = "";

    try {
      const privateKey = await crypto.subtle.importKey(
        "pkcs8",
        seedBytes,
        { name: "Ed25519" },
        false,
        ["sign"]
      );
      const sigBuffer = await crypto.subtle.sign("Ed25519", privateKey, canonicalBytes);
      sigBase64Url = base64UrlEncode(sigBuffer);
    } catch {
      // Fallback: PKCS8 prefix wrapper for raw 32-byte Ed25519 seed
      const pkcs8Prefix = new Uint8Array([
        0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70,
        0x04, 0x22, 0x04, 0x20,
      ]);
      const fullPkcs8 = new Uint8Array(pkcs8Prefix.length + seedBytes.length);
      fullPkcs8.set(pkcs8Prefix, 0);
      fullPkcs8.set(seedBytes, pkcs8Prefix.length);

      const privateKey = await crypto.subtle.importKey(
        "pkcs8",
        fullPkcs8,
        { name: "Ed25519" },
        false,
        ["sign"]
      );
      const sigBuffer = await crypto.subtle.sign("Ed25519", privateKey, canonicalBytes);
      sigBase64Url = base64UrlEncode(sigBuffer);
    }

    const endpoint = `${TECHNOCORE_BASE_URL}/r/${encodeURIComponent(
      room
    )}/say-signed/${encodeURIComponent(did)}/${encodeURIComponent(
      sigBase64Url
    )}/${nonce}/${encodeURIComponent(cleanText)}`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: { Accept: "text/plain" },
    });

    const responseText = await res.text();
    if (res.ok || res.status === 200 || res.status === 201) {
      return { success: true, seq: responseText.trim() };
    } else {
      return { success: false, error: responseText || `HTTP ${res.status}` };
    }
  } catch (e: any) {
    return { success: false, error: e.message || "Network request failed" };
  }
}

/**
 * Publish DID to the official Technocore shard registry note (/kv/did-{shard}/set/{did})
 */
export async function registerDidOnMainnet(did: string): Promise<boolean> {
  try {
    const hash = await computeSha256Hex(did);
    const shard = hash.slice(0, 16);
    const endpoint = `${TECHNOCORE_BASE_URL}/kv/did-${shard}/set/${encodeURIComponent(did)}`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: { Accept: "text/plain" },
    });
    return res.ok;
  } catch (err) {
    console.warn("Registry note publish failed:", err);
    return false;
  }
}