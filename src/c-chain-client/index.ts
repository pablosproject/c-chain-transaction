import pino from "pino";
import { TransactionMonitorService } from "./client";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});
const monitor = new TransactionMonitorService(logger);
let unwatch: () => void;

process.on("SIGINT", async () => {
  logger.info("Received SIGINT. Cleaning up...");
  unwatch();
  await monitor.cleanup();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM. Cleaning up...");
  unwatch();
  await monitor.cleanup();
  process.exit(0);
});

async function start() {
  try {
    unwatch = await monitor.startMonitoring();
    logger.info("Transaction monitoring started successfully");
  } catch (error) {
    logger.error({ error }, "Failed to start monitoring");
    unwatch();
    await monitor.cleanup();
    process.exit(1);
  }
}

start();
