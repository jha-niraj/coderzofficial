import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Exclude orphaned Prisma-era tables that still exist in the DB but are no
  // longer part of the Drizzle schema. Without this, drizzle-kit reads them
  // from the DB and prompts "is X a rename of one of these?" for every new table.
  // "accounts" (lowercase) is the old better-auth table created before the
  // schema switched to PascalCase "Account".
  tablesFilter: [
    "!Launchpad*",  // old launchpad product feature
    "!Space*",      // old spaces feature (SpaceMember, SpaceStep, etc.)
    "!Learn*",      // old learn feature (LearnStep, LearnProgress, etc. — NOT osLearn*)
    "!Codebase*",   // old codebase feature
    "!ProductIdea", // old standalone table
    "!accounts",    // old lowercase better-auth table (current one is "Account")
  ],
  verbose: true,
  strict: true,
});
