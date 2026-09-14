// Base58 Bitcoin alphabet used by multibase 'z'
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function encodeBase58(bytes: Uint8Array): string {
  const digits: number[] = [0];

  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
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

  let leadingZeros = 0;
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    leadingZeros++;
  }

  let result = "1".repeat(leadingZeros);
  for (let i = digits.length - 1; i >= 0; i--) {
    result += BASE58_ALPHABET[digits[i]];
  }

  return result;
}

export interface GeneratedIdentity {
  did: string;
  publicKeyHex: string;
  privateKeyJwk: JsonWebKey;
  createdDate: string;
}

export async function generateNewAgentIdentity(): Promise<GeneratedIdentity> {
  // Generate cryptographic Ed25519 keypair via browser Web Crypto API
  const keyPair = await window.crypto.subtle.generateKey(
    { name: "Ed25519" },
    true,
    ["sign", "verify"]
  );

  // Export raw 32-byte public key
  const rawPubBuffer = await window.crypto.subtle.exportKey("raw", keyPair.publicKey);
  const rawPubBytes = new Uint8Array(rawPubBuffer);

  // Multicodec prefix for Ed25519 public key (0xed, 0x01)
  const multicodecBytes = new Uint8Array(2 + rawPubBytes.length);
  multicodecBytes[0] = 0xed;
  multicodecBytes[1] = 0x01;
  multicodecBytes.set(rawPubBytes, 2);

  // Multibase base58btc prefix is 'z'
  const did = `did:key:z${encodeBase58(multicodecBytes)}`;

  // Convert raw public key to hex for display
  const publicKeyHex = Array.from(rawPubBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Export private key as JSON Web Key (JWK)
  const privateKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

  return {
    did,
    publicKeyHex,
    privateKeyJwk,
    createdDate: new Date().toISOString(),
  };
}