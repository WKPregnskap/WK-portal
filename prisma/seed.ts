import bcrypt from "bcryptjs";
import { PrismaClient, Rolle, OppgaveStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const organisasjon = await prisma.organisasjon.upsert({
    where: { id: "org_wk_demo" },
    update: {},
    create: {
      id: "org_wk_demo",
      navn: "Werner Klausen Regnskap AS",
    },
  });

  const kundeselskap = await prisma.kundeselskap.upsert({
    where: { orgnummer: "999888777" },
    update: {},
    create: {
      navn: "Nordlys Drift AS",
      orgnummer: "999888777",
      organisasjonId: organisasjon.id,
    },
  });

  const adminPassordHash = await bcrypt.hash("Admin123!", 10);
  const kundePassordHash = await bcrypt.hash("Kunde123!", 10);

  const admin = await prisma.bruker.upsert({
    where: { epost: "admin@wkpregnskap.no" },
    update: {},
    create: {
      navn: "Portal Admin",
      epost: "admin@wkpregnskap.no",
      passordHash: adminPassordHash,
      rolle: Rolle.ADMIN,
      organisasjonId: organisasjon.id,
    },
  });

  await prisma.bruker.upsert({
    where: { epost: "kunde@nordlys.no" },
    update: {},
    create: {
      navn: "Kunde Demo",
      epost: "kunde@nordlys.no",
      passordHash: kundePassordHash,
      rolle: Rolle.KUNDE,
      organisasjonId: organisasjon.id,
      kundeselskapId: kundeselskap.id,
    },
  });

  const eksisterende = await prisma.bilagsOppgave.count({
    where: { kundeselskapId: kundeselskap.id },
  });

  if (eksisterende === 0) {
    await prisma.bilagsOppgave.createMany({
      data: [
        {
          kundeselskapId: kundeselskap.id,
          opprettetAvId: admin.id,
          tittel: "Manglende kvittering for drivstoff",
          beskrivelse: "Mangler kvittering for transaksjon 14.01",
          status: OppgaveStatus.APEN,
          externalVoucherId: "VCH-1001",
        },
        {
          kundeselskapId: kundeselskap.id,
          opprettetAvId: admin.id,
          tittel: "Mangler faktura fra leverandør",
          beskrivelse: "Last opp PDF for faktura INV-2026-22",
          status: OppgaveStatus.OPPLASTET,
          externalVoucherId: "VCH-1002",
        },
        {
          kundeselskapId: kundeselskap.id,
          opprettetAvId: admin.id,
          tittel: "Bekreftelse på reiseregning",
          beskrivelse: "Trenger dokumentasjon for reisekostnad",
          status: OppgaveStatus.LINKET,
          externalVoucherId: "VCH-1003",
        },
      ],
    });
  }

  console.log("Seed fullført.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
