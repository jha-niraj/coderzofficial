/**
 * Re-export all types, enums, and utilities from @prisma/client
 * This file serves as the central export point for all Prisma types
 * 
 * Import pattern: import { Role, User, Prisma } from "@repo/prisma/client"
 */

// Re-export everything from Prisma Client (all enums, types, and Prisma namespace)
export * from "@prisma/client";

// Explicitly export Prisma namespace for advanced usage
export { Prisma } from "@prisma/client";

// Type exports for User and other models
export type {
    User,
    Account,
    Projects,
    Feedback,
    Skills,
    Certifications,
    Payment,
    CreditTransaction,
    CreditRequest,
    CreditTransfer,
    CreditTransferOut,
    Referral,
    RecentActivity,
    Achievements,
    XpTransaction,
    Reward,
    WorkExperience,
    PortfolioProject,
    SocialLink,
    Community,
    CommunityPost,
    CommunityComment,
    MockInterviewVoice,
    MockVoiceSession,
    Concept,
    ConceptStep,
    Studio
} from "@prisma/client";