import cliProgress from "cli-progress";
import { parse as csvParse } from "csv-parse";
import * as fs from "fs";
import { Logger } from "pino";
import { z } from "zod";
import { createPool } from "../common/db/connection";
import { TransactionRepository } from "../common/service/transaction.repository";
import { Transaction } from "../common/types/transaction";
import { countLines } from "./util";

const csvTransaction = z.object({
  timestamp: z.string().transform((date) => BigInt(new Date(date).getTime())),
  status: z.string().transform((status) => !!status),
  block_number: z.string().transform((blockNumber) => BigInt(blockNumber)),
  tx_index: z.string().transform((index) => parseInt(index)),
  from: z.string(),
  to: z.string(),
  value: z.string().transform((value) => BigInt(value)),
  gas_limit: z.string().transform((limit) => BigInt(limit)),
  gas_used: z.string().transform((used) => BigInt(used)),
  gas_price: z.string().transform((price) => BigInt(price)),
});

const pool = createPool();
const transactionRepository = new TransactionRepository(pool);
const progressBar = new cliProgress.SingleBar({
  format: "Processing |{bar}| {percentage}% | {value}/{total} Records",
  barCompleteChar: "\u2588",
  barIncompleteChar: "\u2591",
});
let logger: Logger;

export async function processFile({
  filePath,
  batchSize,
  logger,
}: {
  filePath: string;
  batchSize: number;
  logger: Logger;
}) {
  logger = logger;
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found");
    }

    // Count total lines for progress bar
    const totalLines = (await countLines(filePath)) - 1; // Subtract 1 for header
    logger.info(`Found ${totalLines} records to process`);

    const startTime = performance.now();
    progressBar.start(totalLines, 0);

    const parser = fs
      .createReadStream(filePath)
      .pipe(csvParse({ columns: true, skipEmptyLines: true }));

    let errorCount = 0;
    let currentBatch: Transaction[] = [];
    let processedCount = 0;

    for await (const record of parser) {
      try {
        const transaction = validateAndTransform(record);
        if (transaction) {
          currentBatch.push(transaction);
        }
      } catch (error) {
        logger.error(`Error processing record: ${error}`);
        errorCount++;
      }

      if (currentBatch.length >= batchSize) {
        try {
          await transactionRepository.bulkInsertTransaction(currentBatch);
          currentBatch = [];
        } catch (error) {
          logger.error(`Error inserting transaction: ${error}`);
          errorCount++;
          currentBatch = [];
        }
      }

      processedCount++;
      progressBar.update(processedCount);
    }

    // Process remaining batch
    if (currentBatch.length > 0) {
      try {
        await transactionRepository.bulkInsertTransaction(currentBatch);
      } catch (error) {
        logger.error(`Error inserting transaction: ${error}`);
        errorCount++;
      }
    }

    progressBar.stop();
    const totalTimeSeconds = (performance.now() - startTime) / 1000;

    logger.info("\nImport Summary:");
    logger.info("----------------");
    logger.info(`Total records processed: ${processedCount}`);
    logger.info(`Time taken: ${totalTimeSeconds.toFixed(2)} seconds`);
    logger.info(`Failed imports: ${errorCount}`);

    process.exit(0);
  } catch (error) {
    logger.error(`Error: ${error}`);
    process.exit(1);
  }
}

const validateAndTransform = (record: any): Transaction | null => {
  return csvTransaction
    .transform((csvTransaction) => ({
      ...csvTransaction,
      from_address: csvTransaction.from,
      to_address: csvTransaction.to,
    }))
    .parse(record);
};
