import { Pool } from "pg";
import { Logger } from "pino";
import { Block, createPublicClient, http, type PublicClient } from "viem";
import { avalanche } from "viem/chains";
import { createPool } from "../common/db/connection";
import { env } from "../common/lib/env";
import { TransactionRepository } from "../common/service/transaction.repository";
import { Transaction } from "../common/types/transaction";

export class TransactionMonitorService {
  private client: PublicClient;
  private pool: Pool;
  private transactionRepository: TransactionRepository;

  constructor(private readonly logger: Logger) {
    console.log(env.AVALANCE_NODE);
    this.client = createPublicClient({
      chain: avalanche,
      transport: http(env.AVALANCE_NODE),
    });

    // Initialize PostgreSQL connection pool
    this.pool = createPool();
    this.transactionRepository = new TransactionRepository(this.pool);

    // Test database connection
    this.pool.connect((err) => {
      if (err) {
        logger.error({ error: err }, "Failed to connect to database");
        process.exit(1);
      } else {
        logger.info("Successfully connected to database");
      }
    });
  }

  async startMonitoring() {
    try {
      this.logger.info("Starting transaction monitoring");

      const unwatch = this.client.watchBlocks({
        blockTag: "safe",
        includeTransactions: true,
        onBlock: async (block) => {
          await this.processBlock(block);
        },
        onError: (error) => {
          this.logger.error({ error }, "Error in block watching");
        },
      });

      return unwatch;
    } catch (error) {
      this.logger.error({ error }, "Failed to start monitoring");
      throw error;
    }
  }

  async cleanup() {
    this.logger.info("Cleaning up resources");
    await this.pool.end();
  }

  private async processBlock(block: Block<bigint, true, "safe">) {
    const startTime = performance.now();
    try {
      const transactions: Transaction[] = block.transactions
        .filter((tx) => tx.to !== null) // In case of a contract creation, `to` is null
        .map((tx) => ({
          timestamp: block.timestamp,
          status: true,
          block_number: block.number,
          tx_index: tx.transactionIndex,
          from_address: tx.from,
          to_address: tx.to!,
          gas_limit: tx.gas,
          gas_used: tx.gas, // We would need transaction receipt to get actual gas used
          value: tx.value,
          gas_price: tx.gasPrice || 0n,
        }));

      this.transactionRepository.bulkInsertTransaction(transactions);

      const endTime = performance.now();
      this.logger.info(
        {
          blockNumber: block.number.toString(),
          transactionCount: transactions.length,
          processingTimeMs: Math.round(endTime - startTime),
        },
        "Block processed successfully"
      );
    } catch (error) {
      console.error(error);
      this.logger.error(
        { error, blockNumber: block.number.toString() },
        "Failed to process block"
      );
    }
  }
}
