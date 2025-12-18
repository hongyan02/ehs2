import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./server/db/pg-schema.ts",
    out: "./drizzle/pg",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.POSTGRES_URL || "postgres://postgres:postgres@localhost:5432/ehs",
    },
});
