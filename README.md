# C-Chain Transaction Scanner

A transaction scanner and API for the Avalanche C-Chain.

## Features

- Import historical transactions from CSV files
- Monitor new transactions in real-time
- RESTful API for querying transactions
- Pagination support
- Performance-optimized PostgreSQL queries
- Docker setup for development

## Development Setup

- Please use [nvm](https://github.com/nvm-sh/nvm) to manage the Node.js version or use the node version specified in the `.nvmrc` file.
- Install [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/).

1. Create an env file by copying the `.env.sample` file:

```bash
cp .env.sample .env
```

2. Install dependencies:

```bash
npm ci
```

3. Start PostgreSQL:

```bash
docker-compose up -d
```

4. Run migrations:

```bash
npm run migrate
```

5. Unzip the CSV file:

```bash
unzip asset/43114_txs.csv.zip -d asset
```

### Environment Variables

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=dev_user
DB_PASSWORD=dev_password
DB_NAME=c_chain
DB_CONNECTION_STRING=postgresql://dev_user:dev_password@localhost:5432/c_chain
AVALANCE_NODE=https://api.avax.network/ext/bc/C/rpc
```

### Available Commands

- `npm run migrate` - Run database migrations
- `npm run import -- -f <file.csv> -b <batchSize>` - Import CSV transactions
- `npm run monitor-chain` Monitor new C-Chain transactions
- `npm run server` - Start HTTP API server
- `npm run benchmark` - Run performance tests

## Architecture

### Import process

Run the import using `npm run import -- -f <file.csv> -b <batchSize>`. It is optimized for performance and can handle large CSV files.

- CSV transaction data import with batch processing
- Progress tracking and error handling
- Zod schema validation
- Optimized bulk database operations

Test it on the cloned repository using `npm run import -- -f asset/43114_txs.csv -b 10000`.

## Chain Monitoring

Run the chain monitor using `npm run monitor-chain`. It listens to new transactions on the Avalanche C-Chain and saves them to the database.

- Real-time monitoring of new transactions
- Optimized bulk database operations

## HTTP server

Run the HTTP server using `npm run server`. It provides a RESTful API for querying transactions.

Here is the list of implemented endpoints:

- `GET /transactions` - List transactions by value
- `GET /transactions/:address` - Get address transactions
- `GET /transactions/:address/count` - Get address transaction count

All endpoints support pagination with `limit` and `offset` query parameters.

Here are some examples to run using [httpie](https://httpie.io/) (that uses the hot addresses from the CSV file):

```bash
# Get transactions for an address (paginated)
http GET "localhost:3000/transactions/0x995BE1CA945174D5bA75410C1E658a41eB13a2FA?page=1&limit=20"

# Get transaction count for an address
http GET "localhost:3000/transactions/0x995BE1CA945174D5bA75410C1E658a41eB13a2FA/count"

# Get transactions ordered by value (paginated)
http GET "localhost:3000/transactions?page=1&limit=20"
```

## Performance Benchmark

To measure performance, we use autocannon to simulate a high number of requests to the server and see where there is room for improvements.

To run the benchmark, use `npm run benchmark`. It will run a benchmark test against the server and print the results.

**NOTE**: the benchmark tool erase the database and import the CSV file before running the tests, so keep that in mind when running it.

### Default Benchmark

Running the benchmark with the default schema and no indexes gave this result:

```bash
GET /transactions/0x995BE1CA945174D5bA75410C1E658a41eB13a2FA:
Average Latency: 1148.28 ms
Average Requests/sec: 8
Total Requests: 80
Total Errors: 0

GET /transactions/0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7:
Average Latency: 1171.52 ms
Average Requests/sec: 8
Total Requests: 80
Total Errors: 0

GET /transactions/0xbD8679cf79137042214fA4239b02F4022208EE82:
Average Latency: 1183.08 ms
Average Requests/sec: 8
Total Requests: 80
Total Errors: 0

GET /transactions/0x18556DA13313f3532c54711497A8FedAC273220E:
Average Latency: 1211.45 ms
Average Requests/sec: 8
Total Requests: 80
Total Errors: 0

GET /transactions/0x995BE1CA945174D5bA75410C1E658a41eB13a2FA/count:
Average Latency: 1214.68 ms
Average Requests/sec: 8
Total Requests: 80
Total Errors: 0

GET /transactions/0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7/count:
Average Latency: 1239.16 ms
Average Requests/sec: 7.9
Total Requests: 79
Total Errors: 0

GET /transactions/0xbD8679cf79137042214fA4239b02F4022208EE82/count:
Average Latency: 1249.79 ms
Average Requests/sec: 7.4
Total Requests: 74
Total Errors: 0

GET /transactions/0x18556DA13313f3532c54711497A8FedAC273220E/count:
Average Latency: 1268.15 ms
Average Requests/sec: 7
Total Requests: 70
Total Errors: 0
```

You can try yourself using `npm run benchmark` and deleting the `002-performance-indexes.sql` file.

### Optimized Benchmark

Looking at the queries, some indexes were added to optimize:

- Lookup by address (with default sorting)
- Count by address
- Order by value

The newly performed results are:

```bash
GET /transactions:
Average Latency: 271.04 ms
Average Requests/sec: 36.21
Total Requests: 362
Total Errors: 0

GET /transactions/0x995BE1CA945174D5bA75410C1E658a41eB13a2FA:
Average Latency: 88.79 ms
Average Requests/sec: 112.1
Total Requests: 1233
Total Errors: 0

GET /transactions/0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7:
Average Latency: 267.09 ms
Average Requests/sec: 36.71
Total Requests: 367
Total Errors: 0

GET /transactions/0xbD8679cf79137042214fA4239b02F4022208EE82:
Average Latency: 240.7 ms
Average Requests/sec: 41
Total Requests: 410
Total Errors: 0

GET /transactions/0x18556DA13313f3532c54711497A8FedAC273220E:
Average Latency: 247.98 ms
Average Requests/sec: 39.71
Total Requests: 397
Total Errors: 0

GET /transactions/0x995BE1CA945174D5bA75410C1E658a41eB13a2FA/count:
Average Latency: 244.08 ms
Average Requests/sec: 40.1
Total Requests: 401
Total Errors: 0

GET /transactions/0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7/count:
Average Latency: 271.3 ms
Average Requests/sec: 36.1
Total Requests: 361
Total Errors: 0

GET /transactions/0xbD8679cf79137042214fA4239b02F4022208EE82/count:
Average Latency: 243.59 ms
Average Requests/sec: 40.4
Total Requests: 404
Total Errors: 0

GET /transactions/0x18556DA13313f3532c54711497A8FedAC273220E/count:
Average Latency: 251.09 ms
Average Requests/sec: 39
Total Requests: 390
Total Errors: 0
```

Good enough for the current use case. We should keep it monitored and optimize further if needed.
For further optimization, we could use partitioning, materialized views or other techniques, depending on the use case.

## Design choices

- The web server is implemented using [hono](https://hono.dev/), since it's minimal and provides good enough performance and type safety for this task.
- The database is PostgreSQL, since it's a good choice for relational data and provides good performance for the queries we need. The schema chosen is simple and optimized for the queries we need.
- When possible, data from the external source is validated using Zod, to ensure data integrity (and type safety).
