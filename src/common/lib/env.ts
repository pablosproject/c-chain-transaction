import envSchema from "env-schema";
import { z } from "zod";

const zodSchema = z.object({
  // Database configuration
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("5432"),
  DB_USER: z.string().default("dev_user"),
  DB_PASSWORD: z.string().default("dev_password"),
  DB_NAME: z.string().default("dev_database"),
  DB_CONNECTION_STRING: z.string(),
});

type Schema = z.infer<typeof zodSchema>;

// Convert Zod schema to env-schema format
const schema = {
  type: "object",
  required: [],
  properties: {
    DB_HOST: { type: "string", default: "localhost" },
    DB_PORT: { type: "string", default: "5432" },
    DB_USER: { type: "string", default: "dev_user" },
    DB_PASSWORD: { type: "string", default: "dev_password" },
    DB_NAME: { type: "string", default: "dev_database" },
    DB_CONNECTION_STRING: { type: "string" },
    NODE_ENV: {
      type: "string",
      enum: ["development", "production", "test"],
      default: "development",
    },
  },
};

export const env = envSchema<Schema>({
  schema,
  dotenv: true,
});
