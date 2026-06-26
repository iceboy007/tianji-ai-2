import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgres://tianji:tianji2024@localhost:5432/tianji";

const client = postgres(connectionString, { max: 1 });
export const db = drizzle(client);
