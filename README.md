# WK Portal

Profesjonell multi-tenant kundeportal for norsk regnskapskontor.
All funksjonalitet er bygget for at regnskapskontoret drifter integrasjoner sentralt.

## Stack

- Next.js (App Router) + TypeScript strict
- TailwindCSS + shadcn/ui-komponentstruktur
- NextAuth (Credentials)
- Prisma + PostgreSQL
- BullMQ + Redis
- MinIO (S3-kompatibel dokumentlagring)
- pino logging
- Vitest + Playwright

## Lokal oppstart

1. Installer avhengigheter:

```bash
npm install
```

2. Kopier miljøvariabler:

```bash
cp .env.example .env
```

3. Start infrastruktur:

```bash
docker compose up -d
```

4. Kjør Prisma og seed:

```bash
npm run prisma:generate
npm run prisma:deploy
npm run seed
```

5. Start app:

```bash
npm run dev
```

6. (Valgfritt) Start bakgrunnsarbeider:

```bash
npm run arbeider
```

## Demo-bruker

- Admin: `admin@wkpregnskap.no` / `Admin123!`
- Kunde: `kunde@nordlys.no` / `Kunde123!`

## Tripletex-oppsett

1. Gå til `Admin -> Systemtilkoblinger`.
2. Opprett tilkobling med `consumerToken` og `employeeToken`.
3. Kjør test via `PATCH /api/admin/systemtilkoblinger` med handling `TEST`.
4. SessionToken blir opprettet og cachet med `expiresAt` i databasen.

## Viktig sikkerhet

- RBAC på alle API-endepunkter.
- Rate limiting på login og upload.
- AES-GCM-kryptering av tokens med `MASTER_KEY`.
- CSRF-beskyttelse for muterende API-kall.
- Webhook-endepunkt klar for signaturvalidering (`/api/webhooks/tripletex`).

## Om GitHub Pages

Denne løsningen er en fullstack-applikasjon med API-ruter, autentisering og database.
GitHub Pages støtter kun statisk hosting og kan derfor bare brukes til begrenset visning.
For full funksjonalitet anbefales serverdrift (for eksempel Vercel, Railway eller VPS).

## Feilsøking

- **Feil ved innlogging**: Sjekk at `seed` er kjørt og at passord stemmer.
- **Prisma feiler**: Verifiser at Postgres kjører på `localhost:5432`.
- **Upload feiler**: Sjekk at MinIO kjører og bucket `wk-portal-dokumenter` finnes.
- **BullMQ-jobber kjører ikke**: Sjekk Redis (`localhost:6379`) og at `npm run arbeider` er startet.

## TODO-er før produksjon

- Ferdigstille signaturvalidering for Tripletex-webhook med HMAC.
- Bytte in-memory rate limiter til Redis-basert distribusjonsvennlig løsning.
- Bygge komplett UI-flyt for admin-opprettelse med skjema og validering.
- Erstatte dummy-endepunkter i connector med faktiske Tripletex-rapporter.
