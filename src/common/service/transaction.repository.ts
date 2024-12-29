import { Pool } from "pg";
import { z } from "zod";
import {
  bulkInsertTransaction,
  countTransactionByAddress,
  countTransactions,
  getTransactionByAddress,
  getTransactionOrderByValue,
  insertTransaction,
} from "../db/queries/transaction.queries";
import { Transaction } from "../types/transaction";

/**
 * To maintain bigint precision, we use numeric
 * at DB level, we should handle conversion from/to
 * database using strings
 */
const DBTransaction = z.object({
  timestamp: z.date().transform((value) => BigInt(value.getTime())),
  status: z.boolean(),
  block_number: z.string().transform((value) => BigInt(value)),
  tx_index: z.number(),
  from_address: z.string(),
  to_address: z.string(),
  value: z.string().transform((value) => BigInt(value)),
  gas_limit: z.string().transform((value) => BigInt(value)),
  gas_used: z.string().transform((value) => BigInt(value)),
  gas_price: z.string().transform((value) => BigInt(value)),
});

export class TransactionRepository {
  constructor(private readonly pool: Pool) {}

  async insertTransaction(transaction: Transaction) {
    await insertTransaction.run(
      {
        ...transaction,
        timestamp: transaction.timestamp.toString(),
        block_number: transaction.block_number.toString(),
        gas_used: transaction.gas_used.toString(),
        gas_limit: transaction.gas_limit.toString(),
        value: transaction.value.toString(),
        gas_price: transaction.gas_price.toString(),
      },
      this.pool
    );
  }

  async bulkInsertTransaction(transactions: Transaction[]) {
    const values = transactions.map((t) => ({
      ...t,
      timestamp: t.timestamp.toString(),
      block_number: t.block_number.toString(),
      gas_used: t.gas_used.toString(),
      gas_limit: t.gas_limit.toString(),
      value: t.value.toString(),
      gas_price: t.gas_price.toString(),
    }));

    await bulkInsertTransaction.run(
      {
        timestamp: values.map((t) => t.timestamp),
        status: values.map((t) => t.status),
        block_number: values.map((t) => t.block_number),
        tx_index: values.map((t) => t.tx_index),
        from_address: values.map((t) => t.from_address),
        to_address: values.map((t) => t.to_address),
        value: values.map((t) => t.value),
        gas_limit: values.map((t) => t.gas_limit),
        gas_used: values.map((t) => t.gas_used),
        gas_price: values.map((t) => t.gas_price),
      },
      this.pool
    );
  }

  async getTransactionsForAddress(
    address: string,
    pagination: { page: number; limit: number }
  ): Promise<{ transactions: Transaction[]; totalCount: number }> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const [transactions, totalCount] = await Promise.all([
      getTransactionByAddress.run({ address, limit, offset }, this.pool),
      countTransactionByAddress.run({ address }, this.pool),
    ]);

    return {
      transactions: transactions.map((t) => DBTransaction.parse(t)),
      totalCount: parseInt(totalCount[0].count || ""),
    };
  }

  async getTransactionCountForAddress(address: string): Promise<number> {
    const result = await countTransactionByAddress.run({ address }, this.pool);
    return parseInt(result[0].count || "");
  }

  async getTransactionsOrderedByValue(pagination: {
    page: number;
    limit: number;
  }): Promise<{ transactions: Transaction[]; totalCount: number }> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const [transactions, totalCount] = await Promise.all([
      getTransactionOrderByValue.run({ limit, offset }, this.pool),
      countTransactions.run(undefined, this.pool),
    ]);

    return {
      transactions: transactions.map((t) => DBTransaction.parse(t)),
      totalCount: parseInt(totalCount[0].count || ""),
    };
  }
}
