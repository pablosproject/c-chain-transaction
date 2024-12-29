import autocannon from "autocannon";
import { spawn, spawnSync } from "child_process";
import { createPool } from "../src/common/db/connection";

const HOT_ADDRESSES = [
  "0x995BE1CA945174D5bA75410C1E658a41eB13a2FA",
  "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
  "0xbD8679cf79137042214fA4239b02F4022208EE82",
  "0x18556DA13313f3532c54711497A8FedAC273220E",
];

async function runBenchmark() {
  console.log("Starting benchmark...");

  // Clean existing data
  const pool = createPool();
  await pool.query(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO public;
`);

  // First run migrations
  console.log("Running migrations...");
  spawnSync("npm", ["run", "migrate"], { stdio: "inherit" });

  // Import data
  console.log("Importing transactions...");
  spawnSync(
    "npm",
    ["run", "import", "--", "-f", "asset/43114_txs.csv", "-b", "10000"],
    {
      stdio: "inherit",
    }
  );

  // Start the server
  console.log("Starting HTTP server...");
  const server = spawn("npm", ["run", "server"], { stdio: "inherit" });

  // Wait for server to be ready
  await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
    // Run benchmarks for each endpoint
    const results = await Promise.all([
      // Benchmark transactions by value
      autocannon({
        url: "http://localhost:3000/transactions",
        connections: 10,
        pipelining: 1,
        duration: 10,
        title: "GET /transactions",
      }),

      // Benchmark transactions by address
      ...HOT_ADDRESSES.map((address) =>
        autocannon({
          url: `http://localhost:3000/transactions/${address}`,
          connections: 10,
          pipelining: 1,
          duration: 10,
          title: `GET /transactions/${address}`,
        })
      ),

      // Benchmark transaction counts
      ...HOT_ADDRESSES.map((address) =>
        autocannon({
          url: `http://localhost:3000/transactions/${address}/count`,
          connections: 10,
          pipelining: 1,
          duration: 10,
          title: `GET /transactions/${address}/count`,
        })
      ),
    ]);

    // Print results
    console.log("\nBenchmark Results:\n");
    results.forEach((result) => {
      console.log(`\n${result.title}:`);
      console.log("Average Latency:", result.latency.average, "ms");
      console.log("Average Requests/sec:", result.requests.average);
      console.log("Total Requests:", result.requests.total);
      console.log("Total Errors:", result.errors);
    });
  } finally {
    // Cleanup
    server.kill();
    process.exit(0);
  }
}

// Run benchmark
runBenchmark().catch((error) => {
  console.error("Benchmark failed:", error);
  process.exit(1);
});
