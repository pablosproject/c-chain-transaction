import { Command } from "commander";
import { parse as csvParse } from "csv-parse";
import * as fs from "fs";
import { z } from "zod";
import { Transaction } from "../common/types/transaction";
import { createPool } from "../common/db/connection";
import { TransactionRepository } from "../common/service/transaction.repository";
import cliProgress from "cli-progress";
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

const program = new Command();

program
  .name("transaction importer")
  .requiredOption("-f, --file <path>", "Path to the input file")
  .option("-b, --batch <size>", "Batch size for processing", "100")
  .parse(process.argv);

const options = program.opts();
const pool = createPool();
const transactionRepository = new TransactionRepository(pool);
const progressBar = new cliProgress.SingleBar({
  format: "Processing |{bar}| {percentage}% | {value}/{total} Records",
  barCompleteChar: "\u2588",
  barIncompleteChar: "\u2591",
});
const BATCH_SIZE = parseInt(options.batch);

async function processFile(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found");
    }

    // Count total lines for progress bar
    const totalLines = (await countLines(filePath)) - 1; // Subtract 1 for header
    console.log(`Found ${totalLines} records to process`);

    const startTime = performance.now();
    progressBar.start(totalLines, 0);

    const parser = fs
      .createReadStream(filePath)
      .pipe(csvParse({ columns: true, skipEmptyLines: true }));

    let errorCount = 0;
    let currentBatch: Transaction[] = [];
    let processedCount = 0;

    for await (const record of parser) {
      const transaction = validateAndTransform(record);
      if (transaction) {
        currentBatch.push(transaction);
      }

      if (currentBatch.length >= BATCH_SIZE) {
        try {
          await transactionRepository.bulkInsertTransaction(currentBatch);
          currentBatch = [];
        } catch (error) {
          console.error(`Error inserting transaction: ${error}`);
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
        console.error(`Error inserting transaction: ${error}`);
        errorCount++;
      }
    }

    progressBar.stop();
    const totalTimeSeconds = (performance.now() - startTime) / 1000;

    console.log("\nImport Summary:");
    console.log("----------------");
    console.log(`Total records processed: ${processedCount}`);
    console.log(`Time taken: ${totalTimeSeconds.toFixed(2)} seconds`);
    console.log(`Failed imports: ${errorCount}`);

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
}

const validateAndTransform = (record: any): Transaction | null => {
  try {
    return csvTransaction
      .transform((csvTransaction) => ({
        ...csvTransaction,
        from_address: csvTransaction.from,
        to_address: csvTransaction.to,
      }))
      .parse(record);
  } catch (error) {
    console.error(`Error validating record: ${error}`);
    return null;
  }
};

console.log("Transaction import starting...");
processFile(options.file);
