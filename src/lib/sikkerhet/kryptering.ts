import crypto from "crypto";

const ALG = "aes-256-gcm";

function hentMasterNokkel(): Buffer {
  const key = process.env.MASTER_KEY;
  if (!key) {
    throw new Error("MASTER_KEY mangler i miljøvariabler.");
  }

  const erHex = /^[a-fA-F0-9]{64}$/.test(key);
  if (erHex) {
    return Buffer.from(key, "hex");
  }

  const base64 = Buffer.from(key, "base64");
  if (base64.length !== 32) {
    throw new Error("MASTER_KEY må være 32 byte (hex eller base64).");
  }

  return base64;
}

export function krypter(verdi: string): string {
  const iv = crypto.randomBytes(12);
  const key = hentMasterNokkel();
  const cipher = crypto.createCipheriv(ALG, key, iv);

  const kryptert = Buffer.concat([cipher.update(verdi, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, kryptert]).toString("base64");
}

export function dekrypter(payload: string): string {
  const data = Buffer.from(payload, "base64");
  const iv = data.subarray(0, 12);
  const authTag = data.subarray(12, 28);
  const kryptert = data.subarray(28);
  const key = hentMasterNokkel();

  const decipher = crypto.createDecipheriv(ALG, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(kryptert), decipher.final()]).toString("utf8");
}
