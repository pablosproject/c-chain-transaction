import { serve } from "@hono/node-server";
import { Hono } from "hono";
import transactions from "./routes/transactions";

/**
 * NOTE: This workaround is needed because BigInt is not supported by JSON.stringify.
 * This is a temporary solution given the scope of the project. This can be serialize
 * accordingly depending on the clients we need to support.
 */
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// TODO: extend to include avax addresses

const app = new Hono();
app.route("transactions", transactions);

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
