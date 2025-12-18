import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./pg-schema";

// NOTE: If your password contains special characters (like #, &, %), they must be URL encoded in the connection string.
// Example: & -> %26, % -> %25
const connectionString = process.env["60JSC_DATABASE_URL"];

if (!connectionString) {
    throw new Error("60JSC_DATABASE_URL is not defined in environment variables");
}

// Disable prefetch as it isn't supported for "Transaction" pool mode (if using Supabase Transaction pooler etc)
const client = postgres(connectionString, { prepare: false });

export const pgDb = drizzle(client, { schema });
