-- Oppstartsmigrasjon for WK-portal
CREATE TYPE "Rolle" AS ENUM ('ADMIN', 'REGNSKAPSFORER', 'KUNDE');
CREATE TYPE "OppgaveStatus" AS ENUM ('APEN', 'OPPLASTET', 'LINKET', 'FERDIG');
CREATE TYPE "TilkoblingsType" AS ENUM ('TRIPLETEX', 'DUMMY');
CREATE TYPE "TilkoblingsStatus" AS ENUM ('IKKE_TILKOBLET', 'TILKOBLET', 'FEIL', 'DEAKTIVERT');
CREATE TYPE "MvaStatus" AS ENUM ('IKKE_STARTET', 'PAGAR', 'INNRAPPORTERT');

CREATE TABLE "Organisasjon" (
  "id" TEXT PRIMARY KEY,
  "navn" TEXT NOT NULL,
  "opprettetTidspunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "oppdatertTidspunkt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Kundeselskap" (
  "id" TEXT PRIMARY KEY,
  "organisasjonId" TEXT NOT NULL,
  "navn" TEXT NOT NULL,
  "orgnummer" TEXT NOT NULL UNIQUE,
  "aktiv" BOOLEAN NOT NULL DEFAULT true,
  "opprettetTidspunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "oppdatertTidspunkt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Kundeselskap_organisasjonId_fkey" FOREIGN KEY ("organisasjonId") REFERENCES "Organisasjon"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Bruker" (
  "id" TEXT PRIMARY KEY,
  "organisasjonId" TEXT NOT NULL,
  "kundeselskapId" TEXT,
  "navn" TEXT NOT NULL,
  "epost" TEXT NOT NULL UNIQUE,
  "passordHash" TEXT NOT NULL,
  "rolle" "Rolle" NOT NULL,
  "aktiv" BOOLEAN NOT NULL DEFAULT true,
  "sistInnlogget" TIMESTAMP(3),
  "opprettetTidspunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "oppdatertTidspunkt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Bruker_organisasjonId_fkey" FOREIGN KEY ("organisasjonId") REFERENCES "Organisasjon"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Bruker_kundeselskapId_fkey" FOREIGN KEY ("kundeselskapId") REFERENCES "Kundeselskap"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "SystemTilkobling" (
  "id" TEXT PRIMARY KEY,
  "kundeselskapId" TEXT NOT NULL,
  "type" "TilkoblingsType" NOT NULL,
  "status" "TilkoblingsStatus" NOT NULL DEFAULT 'IKKE_TILKOBLET',
  "consumerTokenKryptert" TEXT,
  "employeeTokenKryptert" TEXT,
  "sessionTokenKryptert" TEXT,
  "sessionTokenExpiresAt" TIMESTAMP(3),
  "sistTestetTidspunkt" TIMESTAMP(3),
  "sistFeilmelding" TEXT,
  "deaktivertTidspunkt" TIMESTAMP(3),
  "opprettetTidspunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "oppdatertTidspunkt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SystemTilkobling_kundeselskapId_fkey" FOREIGN KEY ("kundeselskapId") REFERENCES "Kundeselskap"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "BilagsOppgave" (
  "id" TEXT PRIMARY KEY,
  "kundeselskapId" TEXT NOT NULL,
  "opprettetAvId" TEXT NOT NULL,
  "tittel" TEXT NOT NULL,
  "beskrivelse" TEXT,
  "externalVoucherId" TEXT,
  "status" "OppgaveStatus" NOT NULL DEFAULT 'APEN',
  "forfallsdato" TIMESTAMP(3),
  "opprettetTidspunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "oppdatertTidspunkt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BilagsOppgave_kundeselskapId_fkey" FOREIGN KEY ("kundeselskapId") REFERENCES "Kundeselskap"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "BilagsOppgave_opprettetAvId_fkey" FOREIGN KEY ("opprettetAvId") REFERENCES "Bruker"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "OpplastetDokument" (
  "id" TEXT PRIMARY KEY,
  "kundeselskapId" TEXT NOT NULL,
  "bilagsOppgaveId" TEXT NOT NULL,
  "opplastetAvId" TEXT NOT NULL,
  "filnavn" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "storrelseBytes" INTEGER NOT NULL,
  "s3Nokkel" TEXT NOT NULL,
  "opprettetTidspunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OpplastetDokument_kundeselskapId_fkey" FOREIGN KEY ("kundeselskapId") REFERENCES "Kundeselskap"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OpplastetDokument_bilagsOppgaveId_fkey" FOREIGN KEY ("bilagsOppgaveId") REFERENCES "BilagsOppgave"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OpplastetDokument_opplastetAvId_fkey" FOREIGN KEY ("opplastetAvId") REFERENCES "Bruker"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "MeldingsTrad" (
  "id" TEXT PRIMARY KEY,
  "kundeselskapId" TEXT NOT NULL,
  "emne" TEXT NOT NULL,
  "arkivert" BOOLEAN NOT NULL DEFAULT false,
  "opprettetTidspunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "oppdatertTidspunkt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MeldingsTrad_kundeselskapId_fkey" FOREIGN KEY ("kundeselskapId") REFERENCES "Kundeselskap"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Melding" (
  "id" TEXT PRIMARY KEY,
  "meldingsTradId" TEXT NOT NULL,
  "avsenderId" TEXT NOT NULL,
  "innhold" TEXT NOT NULL,
  "intern" BOOLEAN NOT NULL DEFAULT false,
  "opprettetTidspunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Melding_meldingsTradId_fkey" FOREIGN KEY ("meldingsTradId") REFERENCES "MeldingsTrad"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Melding_avsenderId_fkey" FOREIGN KEY ("avsenderId") REFERENCES "Bruker"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Kunngjoring" (
  "id" TEXT PRIMARY KEY,
  "organisasjonId" TEXT NOT NULL,
  "tittel" TEXT NOT NULL,
  "melding" TEXT NOT NULL,
  "aktivFra" TIMESTAMP(3) NOT NULL,
  "aktivTil" TIMESTAMP(3),
  "opprettetTidspunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Kunngjoring_organisasjonId_fkey" FOREIGN KEY ("organisasjonId") REFERENCES "Organisasjon"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "MvaPeriodeStatus" (
  "id" TEXT PRIMARY KEY,
  "kundeselskapId" TEXT NOT NULL,
  "periode" TEXT NOT NULL,
  "status" "MvaStatus" NOT NULL DEFAULT 'IKKE_STARTET',
  "rapportertDato" TIMESTAMP(3),
  "referanse" TEXT,
  "opprettetTidspunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "oppdatertTidspunkt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MvaPeriodeStatus_kundeselskapId_fkey" FOREIGN KEY ("kundeselskapId") REFERENCES "Kundeselskap"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "AuditLogg" (
  "id" TEXT PRIMARY KEY,
  "organisasjonId" TEXT NOT NULL,
  "kundeselskapId" TEXT,
  "brukerId" TEXT,
  "handling" TEXT NOT NULL,
  "ressursType" TEXT NOT NULL,
  "ressursId" TEXT,
  "metadataJson" JSONB,
  "opprettetTidspunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLogg_organisasjonId_fkey" FOREIGN KEY ("organisasjonId") REFERENCES "Organisasjon"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AuditLogg_kundeselskapId_fkey" FOREIGN KEY ("kundeselskapId") REFERENCES "Kundeselskap"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "AuditLogg_brukerId_fkey" FOREIGN KEY ("brukerId") REFERENCES "Bruker"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "DashboardCache" (
  "id" TEXT PRIMARY KEY,
  "kundeselskapId" TEXT NOT NULL,
  "periode" TEXT NOT NULL,
  "payloadJson" JSONB NOT NULL,
  "oppdatertTidspunkt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DashboardCache_kundeselskapId_fkey" FOREIGN KEY ("kundeselskapId") REFERENCES "Kundeselskap"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Kundeselskap_organisasjonId_idx" ON "Kundeselskap"("organisasjonId");
CREATE INDEX "Bruker_organisasjonId_idx" ON "Bruker"("organisasjonId");
CREATE INDEX "Bruker_kundeselskapId_idx" ON "Bruker"("kundeselskapId");
CREATE INDEX "SystemTilkobling_kundeselskapId_type_idx" ON "SystemTilkobling"("kundeselskapId", "type");
CREATE INDEX "BilagsOppgave_kundeselskapId_status_idx" ON "BilagsOppgave"("kundeselskapId", "status");
CREATE INDEX "OpplastetDokument_kundeselskapId_bilagsOppgaveId_idx" ON "OpplastetDokument"("kundeselskapId", "bilagsOppgaveId");
CREATE INDEX "MeldingsTrad_kundeselskapId_idx" ON "MeldingsTrad"("kundeselskapId");
CREATE INDEX "Melding_meldingsTradId_idx" ON "Melding"("meldingsTradId");
CREATE INDEX "Kunngjoring_organisasjonId_aktivFra_idx" ON "Kunngjoring"("organisasjonId", "aktivFra");
CREATE UNIQUE INDEX "MvaPeriodeStatus_kundeselskapId_periode_key" ON "MvaPeriodeStatus"("kundeselskapId", "periode");
CREATE INDEX "AuditLogg_organisasjonId_opprettetTidspunkt_idx" ON "AuditLogg"("organisasjonId", "opprettetTidspunkt");
CREATE UNIQUE INDEX "DashboardCache_kundeselskapId_periode_key" ON "DashboardCache"("kundeselskapId", "periode");
