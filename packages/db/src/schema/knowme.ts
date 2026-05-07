import {
    pgTable,
    pgEnum,
    text,
    integer,
    boolean,
    timestamp,
    jsonb,
    index,
    uniqueIndex,
    real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./schema";

// ===========================
// Enums
// ===========================

export const knowMeStatusEnum = pgEnum("KnowMeStatus", [
    "INACTIVE",
    "SETUP",
    "PROCESSING",
    "ACTIVE",
    "PAUSED",
    "ERROR",
]);

export const knowMePrivacyEnum = pgEnum("KnowMePrivacy", [
    "PUBLIC",
    "REGISTERED",
    "RECRUITERS",
    "PRIVATE",
]);

export const knowMePlatformEnum = pgEnum("KnowMePlatform", [
    "GITHUB",
    "LEETCODE",
    "STACKOVERFLOW",
    "LINKEDIN",
    "DEVTO",
    "HASHNODE",
    "CODEPEN",
    "DRIBBBLE",
]);

export const knowMeSyncStatusEnum = pgEnum("KnowMeSyncStatus", [
    "PENDING",
    "SYNCING",
    "COMPLETED",
    "FAILED",
]);

export const knowMeDataTypeEnum = pgEnum("KnowMeDataType", [
    "PROFILE",
    "PROJECT",
    "ASSESSMENT",
    "RESUME",
    "COVER_LETTER",
    "CUSTOM_BIO",
    "GITHUB_REPO",
    "GITHUB_CONTRIBUTION",
    "LEETCODE_PROBLEM",
    "STACKOVERFLOW_ANSWER",
    "LINKEDIN_EXPERIENCE",
    "OWNER_TRAINING",
    "OTHER",
]);

export const knowMeJobStatusEnum = pgEnum("KnowMeJobStatus", [
    "QUEUED",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
    "CANCELLED",
]);

export const knowMeJobTypeEnum = pgEnum("KnowMeJobType", [
    "FULL_SYNC",
    "INCREMENTAL",
    "PLATFORM_SYNC",
    "MANUAL_UPDATE",
]);

export const knowMeQuestionCategoryEnum = pgEnum("KnowMeQuestionCategory", [
    "TECHNICAL_SKILLS",
    "PROJECTS",
    "WORK_EXPERIENCE",
    "EDUCATION",
    "ASSESSMENTS",
    "AVAILABILITY",
    "COMPENSATION",
    "SOFT_SKILLS",
    "GENERAL",
    "OTHER",
]);

export const knowMeViewerTypeEnum = pgEnum("KnowMeViewerType", [
    "OWNER",
    "REGISTERED_USER",
    "RECRUITER",
    "ANONYMOUS",
    "EXTERNAL_API",
]);

// ===========================
// Tables
// ===========================

export const knowMeProfiles = pgTable(
    "KnowMeProfile",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
        status: knowMeStatusEnum("status").notNull().default("INACTIVE"),
        privacy: knowMePrivacyEnum("privacy").notNull().default("PUBLIC"),
        isPublic: boolean("isPublic").notNull().default(true),
        includePersonalData: boolean("includePersonalData").notNull().default(true),
        includePlatformData: boolean("includePlatformData").notNull().default(false),
        includeProjects: boolean("includeProjects").notNull().default(true),
        includeAssessments: boolean("includeAssessments").notNull().default(true),
        includeResume: boolean("includeResume").notNull().default(true),
        updateCycleDays: integer("updateCycleDays").notNull().default(10),
        lastUpdatedAt: timestamp("lastUpdatedAt"),
        nextScheduledUpdate: timestamp("nextScheduledUpdate"),
        totalEmbeddingsCount: integer("totalEmbeddingsCount").notNull().default(0),
        lastEmbeddingVersion: text("lastEmbeddingVersion"),
        apiKey: text("apiKey").unique(),
        apiKeyHash: text("apiKeyHash"),
        apiEnabled: boolean("apiEnabled").notNull().default(false),
        apiRateLimit: integer("apiRateLimit").notNull().default(100),
        apiUsageToday: integer("apiUsageToday").notNull().default(0),
        apiUsageTotal: integer("apiUsageTotal").notNull().default(0),
        apiLastResetAt: timestamp("apiLastResetAt").notNull().defaultNow(),
        totalQuestionsAnswered: integer("totalQuestionsAnswered").notNull().default(0),
        totalSessions: integer("totalSessions").notNull().default(0),
        totalVisitors: integer("totalVisitors").notNull().default(0),
        totalExternalRequests: integer("totalExternalRequests").notNull().default(0),
        onboardingStep: integer("onboardingStep").notNull().default(0),
        onboardingCompleted: boolean("onboardingCompleted").notNull().default(false),
        onboardingStartedAt: timestamp("onboardingStartedAt").notNull().defaultNow(),
        aiPersonality: text("aiPersonality"),
        welcomeMessage: text("welcomeMessage"),
        suggestedQuestions: text("suggestedQuestions").array().notNull().default([]),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("knowMeProfile_userId_idx").on(t.userId),
        index("knowMeProfile_status_idx").on(t.status),
        index("knowMeProfile_apiKey_idx").on(t.apiKey),
    ]
);

export const knowMePersonalData = pgTable(
    "KnowMePersonalData",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        profileId: text("profileId").notNull().references(() => knowMeProfiles.id, { onDelete: "cascade" }),
        dataType: knowMeDataTypeEnum("dataType").notNull(),
        title: text("title"),
        fileName: text("fileName"),
        fileUrl: text("fileUrl"),
        fileSize: integer("fileSize"),
        contentText: text("contentText"),
        contentHash: text("contentHash"),
        isActive: boolean("isActive").notNull().default(true),
        isIndexed: boolean("isIndexed").notNull().default(false),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("knowMePersonalData_profileId_idx").on(t.profileId),
        index("knowMePersonalData_dataType_idx").on(t.dataType),
        index("knowMePersonalData_isActive_idx").on(t.isActive),
    ]
);

export const knowMePlatformConnections = pgTable(
    "KnowMePlatformConnection",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        profileId: text("profileId").notNull().references(() => knowMeProfiles.id, { onDelete: "cascade" }),
        platform: knowMePlatformEnum("platform").notNull(),
        platformUsername: text("platformUsername"),
        platformUserId: text("platformUserId"),
        profileUrl: text("profileUrl"),
        connectionStatus: knowMeSyncStatusEnum("connectionStatus").notNull().default("PENDING"),
        isConnected: boolean("isConnected").notNull().default(false),
        accessToken: text("accessToken"),
        refreshToken: text("refreshToken"),
        tokenExpiresAt: timestamp("tokenExpiresAt"),
        syncFrequencyDays: integer("syncFrequencyDays").notNull().default(10),
        lastSyncedAt: timestamp("lastSyncedAt"),
        nextSyncAt: timestamp("nextSyncAt"),
        lastSyncError: text("lastSyncError"),
        metadata: jsonb("metadata"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (t) => [
        uniqueIndex("knowMePlatformConnection_profileId_platform_key").on(t.profileId, t.platform),
        index("knowMePlatformConnection_profileId_idx").on(t.profileId),
        index("knowMePlatformConnection_platform_idx").on(t.platform),
        index("knowMePlatformConnection_connectionStatus_idx").on(t.connectionStatus),
    ]
);

export const knowMeExternalData = pgTable(
    "KnowMeExternalData",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        profileId: text("profileId").notNull().references(() => knowMeProfiles.id, { onDelete: "cascade" }),
        connectionId: text("connectionId").references(() => knowMePlatformConnections.id, { onDelete: "cascade" }),
        dataType: knowMeDataTypeEnum("dataType").notNull(),
        externalId: text("externalId"),
        title: text("title"),
        description: text("description"),
        url: text("url"),
        techStack: text("techStack").array().notNull().default([]),
        dateCreated: timestamp("dateCreated"),
        dateUpdated: timestamp("dateUpdated"),
        metrics: jsonb("metrics"),
        rawData: jsonb("rawData"),
        isActive: boolean("isActive").notNull().default(true),
        isIndexed: boolean("isIndexed").notNull().default(false),
        isDuplicate: boolean("isDuplicate").notNull().default(false),
        mergedWithCoderProjectId: text("mergedWithCoderProjectId"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (t) => [
        uniqueIndex("knowMeExternalData_profileId_connectionId_externalId_key").on(t.profileId, t.connectionId, t.externalId),
        index("knowMeExternalData_profileId_idx").on(t.profileId),
        index("knowMeExternalData_dataType_idx").on(t.dataType),
        index("knowMeExternalData_isActive_idx").on(t.isActive),
    ]
);

export const knowMeEmbeddings = pgTable(
    "KnowMeEmbedding",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        profileId: text("profileId").notNull().references(() => knowMeProfiles.id, { onDelete: "cascade" }),
        sourceType: knowMeDataTypeEnum("sourceType").notNull(),
        sourceId: text("sourceId").notNull(),
        chunkIndex: integer("chunkIndex").notNull().default(0),
        chunkText: text("chunkText").notNull(),
        chunkHash: text("chunkHash"),
        vectorId: text("vectorId").notNull(),
        vectorNamespace: text("vectorNamespace").notNull(),
        vectorScore: real("vectorScore"),
        embeddingModel: text("embeddingModel").notNull().default("text-embedding-3-small"),
        embeddingVersion: integer("embeddingVersion").notNull().default(1),
        dimensions: integer("dimensions").notNull().default(1024),
        metadata: jsonb("metadata"),
        isActive: boolean("isActive").notNull().default(true),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("knowMeEmbedding_profileId_idx").on(t.profileId),
        index("knowMeEmbedding_sourceType_idx").on(t.sourceType),
        index("knowMeEmbedding_vectorId_idx").on(t.vectorId),
        index("knowMeEmbedding_isActive_idx").on(t.isActive),
    ]
);

export const knowMeEmbeddingJobs = pgTable(
    "KnowMeEmbeddingJob",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        profileId: text("profileId").notNull().references(() => knowMeProfiles.id, { onDelete: "cascade" }),
        jobType: knowMeJobTypeEnum("jobType").notNull(),
        status: knowMeJobStatusEnum("status").notNull().default("QUEUED"),
        priority: integer("priority").notNull().default(5),
        scope: jsonb("scope"),
        progress: integer("progress").notNull().default(0),
        totalItems: integer("totalItems").notNull().default(0),
        processedItems: integer("processedItems").notNull().default(0),
        failedItems: integer("failedItems").notNull().default(0),
        result: jsonb("result"),
        errorLogs: text("errorLogs").array().notNull().default([]),
        scheduledFor: timestamp("scheduledFor"),
        startedAt: timestamp("startedAt"),
        completedAt: timestamp("completedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        attempts: integer("attempts").notNull().default(0),
        maxAttempts: integer("maxAttempts").notNull().default(3),
    },
    (t) => [
        index("knowMeEmbeddingJob_profileId_idx").on(t.profileId),
        index("knowMeEmbeddingJob_status_idx").on(t.status),
        index("knowMeEmbeddingJob_scheduledFor_idx").on(t.scheduledFor),
    ]
);

export const knowMeChatSessions = pgTable(
    "KnowMeChatSession",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        profileId: text("profileId").notNull().references(() => knowMeProfiles.id, { onDelete: "cascade" }),
        visitorUserId: text("visitorUserId").references(() => users.id, { onDelete: "set null" }),
        viewerType: knowMeViewerTypeEnum("viewerType").notNull().default("ANONYMOUS"),
        visitorIp: text("visitorIp"),
        visitorUserAgent: text("visitorUserAgent"),
        visitorCountry: text("visitorCountry"),
        visitorCity: text("visitorCity"),
        visitorReferrer: text("visitorReferrer"),
        sessionToken: text("sessionToken").notNull().unique().$defaultFn(() => createId()),
        questionsAsked: integer("questionsAsked").notNull().default(0),
        messagesCount: integer("messagesCount").notNull().default(0),
        rateLimitRemaining: integer("rateLimitRemaining").notNull().default(20),
        rateLimitResetAt: timestamp("rateLimitResetAt").notNull().defaultNow(),
        source: text("source"),
        startedAt: timestamp("startedAt").notNull().defaultNow(),
        lastActivityAt: timestamp("lastActivityAt").notNull().defaultNow(),
        endedAt: timestamp("endedAt"),
    },
    (t) => [
        index("knowMeChatSession_profileId_idx").on(t.profileId),
        index("knowMeChatSession_visitorUserId_idx").on(t.visitorUserId),
        index("knowMeChatSession_sessionToken_idx").on(t.sessionToken),
        index("knowMeChatSession_startedAt_idx").on(t.startedAt),
    ]
);

export const knowMeChatMessages = pgTable(
    "KnowMeChatMessage",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        sessionId: text("sessionId").notNull().references(() => knowMeChatSessions.id, { onDelete: "cascade" }),
        role: text("role").notNull(),
        content: text("content").notNull(),
        retrievedChunks: jsonb("retrievedChunks"),
        modelUsed: text("modelUsed"),
        tokensUsed: integer("tokensUsed"),
        responseTimeMs: integer("responseTimeMs"),
        confidence: real("confidence"),
        sources: jsonb("sources"),
        wasHelpful: boolean("wasHelpful"),
        feedback: text("feedback"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        index("knowMeChatMessage_sessionId_idx").on(t.sessionId),
        index("knowMeChatMessage_createdAt_idx").on(t.createdAt),
    ]
);

export const knowMeQuestionAnalytics = pgTable(
    "KnowMeQuestionAnalytics",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        profileId: text("profileId").notNull().references(() => knowMeProfiles.id, { onDelete: "cascade" }),
        question: text("question").notNull(),
        questionCategory: knowMeQuestionCategoryEnum("questionCategory").notNull().default("OTHER"),
        questionKeywords: text("questionKeywords").array().notNull().default([]),
        askedByUserId: text("askedByUserId").references(() => users.id, { onDelete: "set null" }),
        askedByType: knowMeViewerTypeEnum("askedByType").notNull().default("ANONYMOUS"),
        responseGenerated: boolean("responseGenerated").notNull().default(true),
        responseTimeMs: integer("responseTimeMs"),
        responseTokens: integer("responseTokens"),
        wasHelpful: boolean("wasHelpful"),
        source: text("source"),
        askedAt: timestamp("askedAt").notNull().defaultNow(),
    },
    (t) => [
        index("knowMeQuestionAnalytics_profileId_idx").on(t.profileId),
        index("knowMeQuestionAnalytics_questionCategory_idx").on(t.questionCategory),
        index("knowMeQuestionAnalytics_askedAt_idx").on(t.askedAt),
        index("knowMeQuestionAnalytics_askedByUserId_idx").on(t.askedByUserId),
    ]
);

export const knowMeProfileViews = pgTable(
    "KnowMeProfileView",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        profileId: text("profileId").notNull().references(() => knowMeProfiles.id, { onDelete: "cascade" }),
        viewerUserId: text("viewerUserId").references(() => users.id, { onDelete: "set null" }),
        viewerType: knowMeViewerTypeEnum("viewerType").notNull().default("ANONYMOUS"),
        viewerIp: text("viewerIp"),
        sessionDurationSeconds: integer("sessionDurationSeconds"),
        questionsAsked: integer("questionsAsked").notNull().default(0),
        source: text("source"),
        referrer: text("referrer"),
        viewedAt: timestamp("viewedAt").notNull().defaultNow(),
    },
    (t) => [
        index("knowMeProfileView_profileId_idx").on(t.profileId),
        index("knowMeProfileView_viewerUserId_idx").on(t.viewerUserId),
        index("knowMeProfileView_viewedAt_idx").on(t.viewedAt),
    ]
);

export const knowMeApiRequests = pgTable(
    "KnowMeApiRequest",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        profileId: text("profileId").notNull().references(() => knowMeProfiles.id, { onDelete: "cascade" }),
        apiKey: text("apiKey").notNull(),
        endpoint: text("endpoint").notNull(),
        method: text("method").notNull(),
        requestIp: text("requestIp"),
        requestHeaders: jsonb("requestHeaders"),
        requestBody: jsonb("requestBody"),
        responseStatus: integer("responseStatus"),
        responseTimeMs: integer("responseTimeMs"),
        tokensUsed: integer("tokensUsed"),
        costUsd: real("costUsd"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        index("knowMeApiRequest_profileId_idx").on(t.profileId),
        index("knowMeApiRequest_apiKey_idx").on(t.apiKey),
        index("knowMeApiRequest_createdAt_idx").on(t.createdAt),
    ]
);

export const knowMePrivacySettings = pgTable(
    "KnowMePrivacySettings",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        profileId: text("profileId").notNull().unique().references(() => knowMeProfiles.id, { onDelete: "cascade" }),
        allowAnonymous: boolean("allowAnonymous").notNull().default(true),
        allowRegisteredUsers: boolean("allowRegisteredUsers").notNull().default(true),
        allowRecruiters: boolean("allowRecruiters").notNull().default(true),
        shareBasicInfo: boolean("shareBasicInfo").notNull().default(true),
        shareProjects: boolean("shareProjects").notNull().default(true),
        shareAssessments: boolean("shareAssessments").notNull().default(true),
        shareWorkHistory: boolean("shareWorkHistory").notNull().default(false),
        shareEducation: boolean("shareEducation").notNull().default(true),
        shareSalary: boolean("shareSalary").notNull().default(false),
        shareExternalData: jsonb("shareExternalData").notNull().default({ github: true, leetcode: true }),
        maxQuestionsPerSession: integer("maxQuestionsPerSession").notNull().default(20),
        requireAuthForSensitive: boolean("requireAuthForSensitive").notNull().default(true),
        blockedUserIds: text("blockedUserIds").array().notNull().default([]),
        blockedCompanies: text("blockedCompanies").array().notNull().default([]),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("knowMePrivacySettings_profileId_idx").on(t.profileId),
    ]
);

export const knowMeCreditTransactions = pgTable(
    "KnowMeCreditTransaction",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        transactionType: text("transactionType").notNull(),
        amount: integer("amount").notNull(),
        reason: text("reason"),
        balanceBefore: integer("balanceBefore").notNull(),
        balanceAfter: integer("balanceAfter").notNull(),
        metadata: jsonb("metadata"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        index("knowMeCreditTransaction_userId_idx").on(t.userId),
        index("knowMeCreditTransaction_createdAt_idx").on(t.createdAt),
    ]
);

// ===========================
// Relations
// ===========================

export const knowMeProfilesRelations = relations(knowMeProfiles, ({ one, many }) => ({
    user: one(users, {
        fields: [knowMeProfiles.userId],
        references: [users.id],
        relationName: "UserKnowMeProfile",
    }),
    personalData: many(knowMePersonalData),
    platformConnections: many(knowMePlatformConnections),
    externalData: many(knowMeExternalData),
    embeddings: many(knowMeEmbeddings),
    embeddingJobs: many(knowMeEmbeddingJobs),
    chatSessions: many(knowMeChatSessions),
    questionAnalytics: many(knowMeQuestionAnalytics),
    profileViews: many(knowMeProfileViews),
    apiRequests: many(knowMeApiRequests),
    privacySettings: one(knowMePrivacySettings),
}));

export const knowMePersonalDataRelations = relations(knowMePersonalData, ({ one }) => ({
    profile: one(knowMeProfiles, {
        fields: [knowMePersonalData.profileId],
        references: [knowMeProfiles.id],
    }),
}));

export const knowMePlatformConnectionsRelations = relations(knowMePlatformConnections, ({ one, many }) => ({
    profile: one(knowMeProfiles, {
        fields: [knowMePlatformConnections.profileId],
        references: [knowMeProfiles.id],
    }),
    externalData: many(knowMeExternalData),
}));

export const knowMeExternalDataRelations = relations(knowMeExternalData, ({ one }) => ({
    profile: one(knowMeProfiles, {
        fields: [knowMeExternalData.profileId],
        references: [knowMeProfiles.id],
    }),
    connection: one(knowMePlatformConnections, {
        fields: [knowMeExternalData.connectionId],
        references: [knowMePlatformConnections.id],
    }),
}));

export const knowMeEmbeddingsRelations = relations(knowMeEmbeddings, ({ one }) => ({
    profile: one(knowMeProfiles, {
        fields: [knowMeEmbeddings.profileId],
        references: [knowMeProfiles.id],
    }),
}));

export const knowMeEmbeddingJobsRelations = relations(knowMeEmbeddingJobs, ({ one }) => ({
    profile: one(knowMeProfiles, {
        fields: [knowMeEmbeddingJobs.profileId],
        references: [knowMeProfiles.id],
    }),
}));

export const knowMeChatSessionsRelations = relations(knowMeChatSessions, ({ one, many }) => ({
    profile: one(knowMeProfiles, {
        fields: [knowMeChatSessions.profileId],
        references: [knowMeProfiles.id],
    }),
    visitorUser: one(users, {
        fields: [knowMeChatSessions.visitorUserId],
        references: [users.id],
        relationName: "KnowMeVisitorSessions",
    }),
    messages: many(knowMeChatMessages),
}));

export const knowMeChatMessagesRelations = relations(knowMeChatMessages, ({ one }) => ({
    session: one(knowMeChatSessions, {
        fields: [knowMeChatMessages.sessionId],
        references: [knowMeChatSessions.id],
    }),
}));

export const knowMeQuestionAnalyticsRelations = relations(knowMeQuestionAnalytics, ({ one }) => ({
    profile: one(knowMeProfiles, {
        fields: [knowMeQuestionAnalytics.profileId],
        references: [knowMeProfiles.id],
    }),
    askedByUser: one(users, {
        fields: [knowMeQuestionAnalytics.askedByUserId],
        references: [users.id],
        relationName: "KnowMeQuestionsAsked",
    }),
}));

export const knowMeProfileViewsRelations = relations(knowMeProfileViews, ({ one }) => ({
    profile: one(knowMeProfiles, {
        fields: [knowMeProfileViews.profileId],
        references: [knowMeProfiles.id],
    }),
    viewerUser: one(users, {
        fields: [knowMeProfileViews.viewerUserId],
        references: [users.id],
        relationName: "KnowMeProfileViews",
    }),
}));

export const knowMeApiRequestsRelations = relations(knowMeApiRequests, ({ one }) => ({
    profile: one(knowMeProfiles, {
        fields: [knowMeApiRequests.profileId],
        references: [knowMeProfiles.id],
    }),
}));

export const knowMePrivacySettingsRelations = relations(knowMePrivacySettings, ({ one }) => ({
    profile: one(knowMeProfiles, {
        fields: [knowMePrivacySettings.profileId],
        references: [knowMeProfiles.id],
    }),
}));

export const knowMeCreditTransactionsRelations = relations(knowMeCreditTransactions, ({ one }) => ({
    user: one(users, {
        fields: [knowMeCreditTransactions.userId],
        references: [users.id],
        relationName: "KnowMeCreditTransactions",
    }),
}));
