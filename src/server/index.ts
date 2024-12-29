import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createMiddleware } from "hono/factory";
import { Transaction } from "../common/types/transaction";
import { createPool } from "../common/db/connection";
import { TransactionRepository } from "../common/service/transaction.repository";
import { serve } from "@hono/node-server";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};

// Validation schemas
const paginationSchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
});

// TODO: extend to include avax addresses
const addressParamSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

const pool = createPool();
const transactionRepository = new TransactionRepository(pool);
const app = new Hono();

const paginationMiddleware = createMiddleware<{
  Variables: { pagination: { page: number; limit: number } };
}>(async (c, next) => {
  const query = c.req.query();
  const { page, limit } = paginationSchema.parse({
    page: query.page || "1",
    limit: query.limit || "10",
  });

  c.set("pagination", {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)), // Limit maximum page size to 100
  });

  await next();
});

// Middleware for pagination
app.use("*", paginationMiddleware);

// Get transaction ordered by value
app.get("/transactions", paginationMiddleware, async (c) => {
  const { page, limit } = c.var.pagination;
  const offset = (page - 1) * limit;

  try {
    const { transactions, totalCount } =
      await transactionRepository.getTransactionsOrderedByValue({
        page,
        limit,
      });

    const totalPages = Math.ceil(totalCount / limit);

    const response: PaginatedResponse<Transaction> = {
      data: transactions,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };

    return c.json(response);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to fetch transactions" }, 500);
  }
});

// Get transactions for address (paginated)
app.get(
  "/transactions/:address",
  paginationMiddleware,
  zValidator("param", addressParamSchema),
  async (c) => {
    const { address } = c.req.param();
    const { page, limit } = c.var.pagination;
    const offset = (page - 1) * limit;

    try {
      const { transactions, totalCount } =
        await transactionRepository.getTransactionsForAddress(address, {
          page,
          limit,
        });

      const totalPages = Math.ceil(totalCount / limit);

      const response: PaginatedResponse<Transaction> = {
        data: transactions,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems: totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      };

      return c.json(response);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to fetch transactions" }, 500);
    }
  },
);

// // Get transaction count for address
app.get(
  "/transactions/:address/count",
  zValidator("param", addressParamSchema),
  async (c) => {
    const { address } = c.req.param();

    try {
      const count =
        await transactionRepository.getTransactionCountForAddress(address);
      return c.json({ count });
    } catch (error) {
      return c.json({ error: "Failed to fetch transaction count" }, 500);
    }
  },
);

// // Get transactions ordered by value (paginated)
// app.get("/transactions/by-value", async (c) => {
//   const { page, limit } = c.get("pagination");
//   const offset = (page - 1) * limit;

//   try {
//     const [transactions, totalCount] = await Promise.all([
//       db.query(
//         `
//         SELECT *
//         FROM transactions
//         ORDER BY CAST(value AS DECIMAL(65,0)) DESC
//         LIMIT ? OFFSET ?
//       `,
//         [limit, offset],
//       ),
//       db.query(`
//         SELECT COUNT(*) as count
//         FROM transactions
//       `),
//     ]);

//     const totalItems = totalCount[0].count;
//     const totalPages = Math.ceil(totalItems / limit);

//     const response: PaginatedResponse<Transaction> = {
//       data: transactions,
//       pagination: {
//         currentPage: page,
//         pageSize: limit,
//         totalItems,
//         totalPages,
//         hasNext: page < totalPages,
//         hasPrevious: page > 1,
//       },
//     };

//     return c.json(response);
//   } catch (error) {
//     return c.json({ error: "Failed to fetch transactions" }, 500);
//   }
// });

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
