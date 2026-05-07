import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

// For Cloudflare Workers / edge runtime, swap this driver for:
//   import { drizzle } from "drizzle-orm/neon-http";
//   import { neon } from "@neondatabase/serverless";
//   const sql = neon(process.env.DATABASE_URL!);
//   export const db = drizzle(sql, { schema });

type DbType = PostgresJsDatabase<typeof schema>;

declare global {
  // eslint-disable-next-line no-var
  var __db: DbType | undefined;
}

function createDb(): DbType {
  const client = postgres(process.env.DATABASE_URL!, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return drizzle(client, { schema });
}

export const db: DbType = globalThis.__db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalThis.__db = db;
}

export type DB = DbType;
