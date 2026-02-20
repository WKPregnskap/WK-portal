import { Queue, Worker } from "bullmq";
import { redisTilkobling } from "@/lib/queues/tilkobling";
import { KO_NAVN, JobbNavn } from "@/lib/queues/konstanter";
import { oppdaterDashboardCache } from "@/lib/services/dashboard";
import { synkManglendeBilag } from "@/lib/services/bilag";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

export const jobbKo = new Queue(KO_NAVN, { connection: redisTilkobling });

type JobbPayload = {
  kundeselskapId: string;
  periode?: string;
  opprettetAvId?: string;
};

export async function leggTilJobb(navn: JobbNavn, payload: JobbPayload) {
  await jobbKo.add(navn, payload, {
    attempts: 4,
    backoff: {
      type: "exponential",
      delay: 500,
    },
    removeOnComplete: true,
    removeOnFail: false,
  });
}

export function startWorker() {
  return new Worker(
    KO_NAVN,
    async (jobb) => {
      const { kundeselskapId, periode, opprettetAvId } = jobb.data as JobbPayload;

      switch (jobb.name as JobbNavn) {
        case "oppdater-dashboard-cache": {
          await oppdaterDashboardCache(kundeselskapId, periode ?? nyestePeriode());
          break;
        }
        case "synk-manglende-bilag": {
          if (!opprettetAvId) {
            throw new Error("opprettetAvId mangler for synk-manglende-bilag");
          }
          await synkManglendeBilag(kundeselskapId, opprettetAvId);
          break;
        }
        case "forny-tripletex-session": {
          await prisma.systemTilkobling.updateMany({
            where: {
              kundeselskapId,
              sessionTokenExpiresAt: {
                lte: new Date(Date.now() + 10 * 60 * 1000),
              },
            },
            data: {
              sessionTokenKryptert: null,
            },
          });
          break;
        }
        default:
          logger.warn({ navn: jobb.name }, "Ukjent jobbnavn");
      }
    },
    { connection: redisTilkobling },
  );
}

function nyestePeriode() {
  const now = new Date();
  const maaned = `${now.getMonth() + 1}`.padStart(2, "0");
  return `${now.getFullYear()}-${maaned}`;
}
