/**
 * Prisma Client Singleton
 * 
 * This file provides a singleton instance of PrismaClient
 * Import pattern: import { prisma } from "@repo/prisma"
 * 
 * For types and enums, use: import { Role, User } from "@repo/prisma/client"
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;

// Utility function for full-text search sanitization
export const sanitizeFullTextSearch = (search: string) => {
    // remove unsupported characters for full text search
    return search.replace(/[*+\-()~@%<>!=?:]/g, "").trim();
};

// Re-export PrismaClient type for advanced usage
export type { PrismaClient } from "@prisma/client";