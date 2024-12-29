import { Pool, types } from "pg";
import { env } from "../lib/env";

export const createPool = () => {
  return new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  });
};
