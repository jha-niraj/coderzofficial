import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema/index";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export type DB = NeonHttpDatabase<typeof schema>;
