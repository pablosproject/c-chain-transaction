import { Pool } from "pg";
import {
  bulkInsertTransaction,
  insertTransaction,
} from "../db/queries/transaction.queries";
import { Transaction } from "../types/transaction";
import { z } from "zod";

/**
 * To maintain bigint precision, we use numeric
 * at DB level, we should handle conversion from/to
 * database using strings
 */
const DBTransaction = z.object({
  id: z.number().optional(),
  timestamp: z.bigint(),
  status: z.boolean(),
  block_number: z.bigint(),
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
      this.pool,
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
      this.pool,
    );
  }
}
