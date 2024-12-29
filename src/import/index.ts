import { Command } from "commander";
import pino from "pino";
import { processFile } from "./import";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});
const program = new Command();
const options = program.opts();

program
  .name("transaction importer")
  .requiredOption("-f, --file <path>", "Path to the input file")
  .option("-b, --batch <size>", "Batch size for processing", "100")
  .parse(process.argv);

console.log("Transaction import starting...");

processFile({
  filePath: options.file,
  batchSize: parseInt(options.batch, 10),
  logger,
});
