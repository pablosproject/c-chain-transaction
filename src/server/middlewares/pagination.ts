import { createMiddleware } from "hono/factory";
import { z } from "zod";

export type PaginatedResponse<T> = {
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
export const paginationSchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
});

export const paginationMiddleware = createMiddleware<{
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
