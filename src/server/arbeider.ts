import { startWorker } from "@/lib/queues/jobber";
import { logger } from "@/lib/logging/logger";

const worker = startWorker();

worker.on("completed", (jobb) => {
  logger.info({ jobbId: jobb.id, navn: jobb.name }, "Jobb fullført");
});

worker.on("failed", (jobb, error) => {
  logger.error({ jobbId: jobb?.id, navn: jobb?.name, error }, "Jobb feilet");
});

logger.info("BullMQ worker startet");
