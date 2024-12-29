import { z } from "zod";

export const Transaction = z.object({
  id: z.number().optional(),
  timestamp: z.bigint(),
  status: z.boolean(),
  block_number: z.bigint(),
  tx_index: z.number(),
  from_address: z.string(),
  to_address: z.string(),
  value: z.bigint(),
  gas_limit: z.bigint(),
  gas_used: z.bigint(),
  gas_price: z.bigint(),
});

export type Transaction = z.infer<typeof Transaction>;
