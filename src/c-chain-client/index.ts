import { logger, TransactionMonitorService } from "./client";

const monitor = new TransactionMonitorService();

process.on("SIGINT", async () => {
  logger.info("Received SIGINT. Cleaning up...");
  await monitor.cleanup();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM. Cleaning up...");
  await monitor.cleanup();
  process.exit(0);
});

async function start() {
  try {
    await monitor.startMonitoring();
    logger.info("Transaction monitoring started successfully");
  } catch (error) {
    logger.error({ error }, "Failed to start monitoring");
    await monitor.cleanup();
    process.exit(1);
  }
}

start();
