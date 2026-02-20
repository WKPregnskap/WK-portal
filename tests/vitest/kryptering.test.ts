import { describe, expect, it } from "vitest";
import { dekrypter, krypter } from "@/lib/sikkerhet/kryptering";

describe("kryptering", () => {
  it("krypterer og dekrypterer verdier", () => {
    process.env.MASTER_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const tekst = "hemmelig-token";
    const kryptert = krypter(tekst);
    expect(kryptert).not.toBe(tekst);
    expect(dekrypter(kryptert)).toBe(tekst);
  });
});
