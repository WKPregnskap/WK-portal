import { prisma } from "@/lib/db/prisma";

type AuditInput = {
  organisasjonId: string;
  kundeselskapId?: string | null;
  brukerId?: string | null;
  handling: string;
  ressursType: string;
  ressursId?: string | null;
  metadata?: unknown;
};

export async function skrivAuditlogg(input: AuditInput) {
  await prisma.auditLogg.create({
    data: {
      organisasjonId: input.organisasjonId,
      kundeselskapId: input.kundeselskapId ?? null,
      brukerId: input.brukerId ?? null,
      handling: input.handling,
      ressursType: input.ressursType,
      ressursId: input.ressursId ?? null,
      metadataJson: input.metadata ? (input.metadata as object) : undefined,
    },
  });
}
