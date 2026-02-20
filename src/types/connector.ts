export type ConnectorStatus = {
  ok: boolean;
  melding: string;
};

export type BilagsOppgaveFraSystem = {
  externalVoucherId: string;
  tittel: string;
  beskrivelse?: string;
};

export type Maanedssammendrag = {
  periode: string;
  omsetning: number;
  kostnader: number;
  resultat: number;
  toppKostnader: Array<{ navn: string; belop: number }>;
};

export type MvaStatusFraSystem = {
  periode: string;
  status: "IKKE_STARTET" | "PAGAR" | "INNRAPPORTERT";
  rapportertDato?: string;
  referanse?: string;
};

export interface RegnskapConnector {
  navn: string;
  testTilkobling(): Promise<ConnectorStatus>;
  hentManglendeBilagOppgaver(): Promise<BilagsOppgaveFraSystem[]>;
  hentMaanedssammendrag(periode: string): Promise<Maanedssammendrag>;
  hentMvaStatus(periode: string): Promise<MvaStatusFraSystem>;
}
