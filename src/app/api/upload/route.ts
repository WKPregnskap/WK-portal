import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Rolle } from "@prisma/client";
import { NextResponse } from "next/server";
import { krevApiRoller } from "@/lib/auth/api";
import { prisma } from "@/lib/db/prisma";
import { sjekkRateLimit } from "@/lib/sikkerhet/rate-limit";
import { validerCsrfToken } from "@/lib/sikkerhet/csrf";
import { skrivAuditlogg } from "@/lib/services/auditlogg";

const s3 = new S3Client({
  region: process.env.MINIO_REGION ?? "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY ?? "minioadmin",
  },
  forcePathStyle: true,
});

export async function POST(request: Request) {
  const csrfOk = await validerCsrfToken(request);
  if (!csrfOk) return NextResponse.json({ feil: "Ugyldig CSRF-token" }, { status: 403 });

  const resultat = await krevApiRoller([Rolle.ADMIN, Rolle.REGNSKAPSFORER, Rolle.KUNDE]);
  if ("feil" in resultat) return resultat.feil;

  const ip = request.headers.get("x-forwarded-for") ?? "lokal";
  const limit = sjekkRateLimit(`upload:${ip}`, 20, 60_000);
  if (!limit.tillatt) {
    return NextResponse.json({ feil: "For mange opplastinger" }, { status: 429 });
  }

  const formData = await request.formData();
  const fil = formData.get("fil") as File | null;
  const bilagsOppgaveId = formData.get("bilagsOppgaveId")?.toString();

  if (!fil || !bilagsOppgaveId) {
    return NextResponse.json({ feil: "Mangler fil eller oppgaveId" }, { status: 400 });
  }

  const oppgave = await prisma.bilagsOppgave.findUnique({ where: { id: bilagsOppgaveId } });
  if (!oppgave) {
    return NextResponse.json({ feil: "Oppgave finnes ikke" }, { status: 404 });
  }

  if (resultat.bruker.rolle === Rolle.KUNDE && oppgave.kundeselskapId !== resultat.bruker.kundeselskapId) {
    return NextResponse.json({ feil: "Ingen tilgang" }, { status: 403 });
  }

  const key = `${oppgave.kundeselskapId}/${bilagsOppgaveId}/${Date.now()}-${fil.name}`;
  const buffer = Buffer.from(await fil.arrayBuffer());

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.MINIO_BUCKET ?? "wk-portal-dokumenter",
      Key: key,
      Body: buffer,
      ContentType: fil.type || "application/octet-stream",
    }),
  );

  const dokument = await prisma.opplastetDokument.create({
    data: {
      kundeselskapId: oppgave.kundeselskapId,
      bilagsOppgaveId: oppgave.id,
      opplastetAvId: resultat.bruker.id,
      filnavn: fil.name,
      contentType: fil.type || "application/octet-stream",
      storrelseBytes: fil.size,
      s3Nokkel: key,
    },
  });

  await skrivAuditlogg({
    organisasjonId: resultat.bruker.organisasjonId,
    kundeselskapId: oppgave.kundeselskapId,
    brukerId: resultat.bruker.id,
    handling: "DOKUMENT_OPPLASTET",
    ressursType: "OpplastetDokument",
    ressursId: dokument.id,
    metadata: { filnavn: dokument.filnavn },
  });

  return NextResponse.json({ dokument }, { status: 201 });
}
