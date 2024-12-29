import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { createPool } from "../../common/db/connection";
import { TransactionRepository } from "../../common/service/transaction.repository";
import { Transaction } from "../../common/types/transaction";
import {
  PaginatedResponse,
  paginationMiddleware,
} from "../middlewares/pagination";

const pool = createPool();
const transactionRepository = new TransactionRepository(pool);

const addressParamSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

const app = new Hono();

// Get transaction ordered by value
app.get("/", paginationMiddleware, async (c) => {
  const { page, limit } = c.var.pagination;

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
  "/:address",
  paginationMiddleware,
  zValidator("param", addressParamSchema),
  async (c) => {
    const { address } = c.req.param();
    const { page, limit } = c.var.pagination;

    try {
      const { transactions, totalCount } =
        await transactionRepository.getTransactionsForAddress(address, {
          page,
          limit,
        });

      if (totalCount === 0) {
        return c.json({ error: "No transactions found for address" }, 404);
      }

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
  }
);

// // Get transaction count for address
app.get(
  "/:address/count",
  zValidator("param", addressParamSchema),
  async (c) => {
    const { address } = c.req.param();

    try {
      const count = await transactionRepository.getTransactionCountForAddress(
        address
      );

      if (count === 0) {
        return c.json({ error: "No transactions found for address" }, 404);
      }

      return c.json({ count });
    } catch (error) {
      return c.json({ error: "Failed to fetch transaction count" }, 500);
    }
  }
);

export default app;
