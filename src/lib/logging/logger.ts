import pino from "pino";

export const logger = pino({
  name: "wk-portal",
  level: process.env.LOGG_NIVA ?? "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            translateTime: "SYS:standard",
          },
        }
      : undefined,
});
