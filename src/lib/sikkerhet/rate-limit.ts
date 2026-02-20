type Nokk = string;

type Vindu = {
  teller: number;
  resetTid: number;
};

const butikk = new Map<Nokk, Vindu>();

export function sjekkRateLimit(nokkel: string, maksKall: number, vinduMs: number) {
  const naa = Date.now();
  const eksisterende = butikk.get(nokkel);

  if (!eksisterende || eksisterende.resetTid < naa) {
    butikk.set(nokkel, { teller: 1, resetTid: naa + vinduMs });
    return { tillatt: true, gjenstaar: maksKall - 1 };
  }

  if (eksisterende.teller >= maksKall) {
    return { tillatt: false, gjenstaar: 0 };
  }

  eksisterende.teller += 1;
  return { tillatt: true, gjenstaar: maksKall - eksisterende.teller };
}
