import { Rolle, TilkoblingsStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { krevApiRoller } from "@/lib/auth/api";
import { prisma } from "@/lib/db/prisma";
import { opprettTripletexTilkobling, TripletexConnector } from "@/lib/connectors/tripletex-connector";
import { skrivAuditlogg } from "@/lib/services/auditlogg";
import { validerCsrfToken } from "@/lib/sikkerhet/csrf";

const opprettSchema = z.object({
  kundeselskapId: z.string().min(1),
  consumerToken: z.string().min(5),
  employeeToken: z.string().min(5),
});

const patchSchema = z.object({
  tilkoblingId: z.string().min(1),
  handling: z.enum(["TEST", "DEAKTIVER", "ROTER"]),
  consumerToken: z.string().optional(),
  employeeToken: z.string().optional(),
});

export async function POST(request: Request) {
  const csrfOk = await validerCsrfToken(request);
  if (!csrfOk) return NextResponse.json({ feil: "Ugyldig CSRF-token" }, { status: 403 });

  const resultat = await krevApiRoller([Rolle.ADMIN, Rolle.REGNSKAPSFORER]);
  if ("feil" in resultat) return resultat.feil;

  const body = await request.json();
  const parsed = opprettSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ feil: parsed.error.flatten() }, { status: 400 });
  }

  const tilkobling = await opprettTripletexTilkobling(parsed.data);

  await skrivAuditlogg({
    organisasjonId: resultat.bruker.organisasjonId,
    kundeselskapId: parsed.data.kundeselskapId,
    brukerId: resultat.bruker.id,
    handling: "SYSTEMTILKOBLING_OPPRETTET",
    ressursType: "SystemTilkobling",
    ressursId: tilkobling.id,
  });

  return NextResponse.json({ tilkobling }, { status: 201 });
}

export async function PATCH(request: Request) {
  const csrfOk = await validerCsrfToken(request);
  if (!csrfOk) return NextResponse.json({ feil: "Ugyldig CSRF-token" }, { status: 403 });

  const resultat = await krevApiRoller([Rolle.ADMIN, Rolle.REGNSKAPSFORER]);
  if ("feil" in resultat) return resultat.feil;

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ feil: parsed.error.flatten() }, { status: 400 });
  }

  const tilkobling = await prisma.systemTilkobling.findUnique({ where: { id: parsed.data.tilkoblingId } });
  if (!tilkobling) {
    return NextResponse.json({ feil: "Tilkobling finnes ikke" }, { status: 404 });
  }

  if (parsed.data.handling === "DEAKTIVER") {
    const oppdatert = await prisma.systemTilkobling.update({
      where: { id: tilkobling.id },
      data: {
        status: TilkoblingsStatus.DEAKTIVERT,
        deaktivertTidspunkt: new Date(),
      },
    });
    return NextResponse.json({ tilkobling: oppdatert });
  }

  if (parsed.data.handling === "ROTER") {
    if (!parsed.data.consumerToken || !parsed.data.employeeToken) {
      return NextResponse.json({ feil: "Nye tokens må oppgis ved rotering" }, { status: 400 });
    }

    const ny = await opprettTripletexTilkobling({
      kundeselskapId: tilkobling.kundeselskapId,
      consumerToken: parsed.data.consumerToken,
      employeeToken: parsed.data.employeeToken,
    });

    return NextResponse.json({ tilkobling: ny });
  }

  const connector = new TripletexConnector(tilkobling);
  const status = await connector.testTilkobling();
  return NextResponse.json({ status });
}
