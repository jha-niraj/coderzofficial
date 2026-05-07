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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

// ===========================
// Enums
// ===========================

export const roleEnum = pgEnum("Role", [
    "Student",
    "Admin",
    "HR",
    "UNI",
]);

export const contributionStatusEnum = pgEnum("ContributionStatus", [
    "InProgress",
    "Completed",
    "Abandoned",
]);

export const contributionTypeEnum = pgEnum("ContributionType", [
    "PR",
    "ISSUE",
    "COMMIT",
    "REVIEW",
    "COMMENT",
]);

export const openSourceDifficultyEnum = pgEnum("OpenSourceDifficulty", [
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
]);

export const issueDifficultyEnum = pgEnum("IssueDifficulty", [
    "EASY",
    "MEDIUM",
    "HARD",
]);

export const syncStatusEnum = pgEnum("SyncStatus", [
    "PENDING",
    "SYNCING",
    "SUCCESS",
    "FAILED",
]);

export const mockCategoryEnum = pgEnum("MockCategory", [
    "TECHNICAL",
    "BEHAVIORAL",
    "HR",
    "SYSTEM_DESIGN",
    "LEADERSHIP",
    "NEGOTIATION",
    "CASE_STUDY",
    "CODING",
    "GENERAL",
]);

export const mockLevelEnum = pgEnum("MockLevel", [
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
    "EXPERT",
]);

export const projectTierEnum = pgEnum("ProjectTier", [
    "Free",
    "Paid",
]);

export const projectStatusEnum = pgEnum("ProjectStatus", [
    "NotStarted",
    "InProgress",
    "Completed",
]);

export const skillCategoryEnum = pgEnum("SkillCategory", [
    "FRONTEND",
    "LANGUAGES",
    "BACKEND",
    "API",
    "DATABASE",
    "DEVOPS",
    "CLOUD",
    "FRAMEWORKS_LIBRARIES",
    "TOOLS_DATABASES",
    "PLATFORMS",
    "AI_TOOLS",
]);

export const feedbackCategoryEnum = pgEnum("FeedbackCategory", [
    "BUG",
    "FEATURE",
    "UI",
    "OTHER",
]);

export const feedbackStatusEnum = pgEnum("FeedbackStatus", [
    "UNDER_REVIEW",
    "PLANNED",
    "COMPLETED",
]);

export const creditTypeEnum = pgEnum("CreditType", [
    "PURCHASE",
    "SPEND",
    "BONUS",
    "REWARD",
]);

export const creditRequestStatusEnum = pgEnum("CreditRequestStatus", [
    "PENDING",
    "APPROVED",
    "REJECTED",
]);

export const resourceTypeEnum = pgEnum("ResourceType", [
    "YOUTUBE_VIDEO",
    "VIDEO",
    "DOCUMENTATION",
    "BLOG_ARTICLE",
    "COURSE",
    "DISCORD_COMMUNITY",
    "TOOL_RECOMMENDATION",
    "DESIGN_MOCKUP",
    "DESIGN_INSPIRATION",
    "GITHUB_REPO",
    "OTHER",
]);

export const paymentStatusEnum = pgEnum("PaymentStatus", [
    "PENDING",
    "COMPLETED",
    "FAILED",
    "REFUNDED",
    "CANCELLED",
]);

export const activityTypeEnum = pgEnum("ActivityType", [
    "REFERRAL_BONUS",
    "SIGNUP",
    "FEEDBACK_SUBMITTED",
    "REWARD_RECEIVED",
    "STARTED_INTERVIEW",
    "CREDIT_SHARED",
    "CREDIT_RECEIVED",
    "CREATED_PEER_TO_PEER_MOCK_INTERVIEW",
    "DAILY_QUIZ_COMPLETED",
    "COMPLETED_MOCK_INTERVIEW",
    "COMPLETED_PRACTICE_SESSION",
    "PROJECT_SUBMISSION",
    "LEARN_COMPLETED",
    "STUDIO_CREATED",
    "STUDIO_UPDATED",
    "JOINED_SPACE",
    "POSTED_IN_SPACE",
    "COMMENTED_IN_SPACE",
    "COMPLETED_SPACE_STEP",
    "CONTRIBUTED_TO_OPEN_SOURCE",
    "FOLLOWING_USER",
    "COMPLETED_DAILY_CHALLENGE",
    "COMPLETED_GOAL_DAY",
    "SHARED_ACHIEVEMENT",
    "PATHFINDER_GOAL_COMPLETED",
    "ASSESSMENT_PASSED",
    "PATHFINDER_GOAL_STARTED",
]);

export const learnDifficultyEnum = pgEnum("LearnDifficulty", [
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
    "EXPERT",
]);

export const learnStatusEnum = pgEnum("LearnStatus", [
    "DRAFT",
    "PUBLISHED",
    "ARCHIVED",
]);

export const learnStepTypeEnum = pgEnum("LearnStepType", [
    "EXPLANATION",
    "QUIZ",
    "CODE_CHALLENGE",
    "VIDEO",
    "MOCK_INTERVIEW",
    "PROJECT",
    "INTERVIEW_QUESTIONS",
]);

export const quizQuestionTypeEnum = pgEnum("QuizQuestionType", [
    "SINGLE_CHOICE",
    "MULTIPLE_CHOICE",
    "TRUE_FALSE",
    "CODE_OUTPUT",
]);

export const quizDifficultyEnum = pgEnum("QuizDifficulty", [
    "EASY",
    "MEDIUM",
    "HARD",
]);

export const interviewCardDifficultyEnum = pgEnum("InterviewCardDifficulty", [
    "EASY",
    "MEDIUM",
    "HARD",
]);

export const learnRequestStatusEnum = pgEnum("LearnRequestStatus", [
    "PENDING",
    "IN_PROGRESS",
    "COMPLETED",
    "REJECTED",
]);

export const xpTransactionPropsEnum = pgEnum("XpTransactionProps", [
    "EARN",
    "SPEND",
    "REWARD",
    "BONUS",
    "PENALTY",
]);

export const currencyEnum = pgEnum("Currency", [
    "INR",
    "USD",
    "EUR",
    "GBP",
]);

// Renamed to notificationEnum to avoid collision with the Notification table.
// Prisma enum name: NotificationEnum (used as the column type below)
export const notificationTypeEnum = pgEnum("NotificationType", [
    "INFO",
    "SUCCESS",
    "WARNING",
    "ERROR",
]);

export const platformEnum = pgEnum("Platform", [
    "MAIN",
    "HIRING",
    "UNI",
    "ADMIN",
]);

// ===========================
// Tables
// ===========================

export const users = pgTable(
    "User",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        // BetterAuth core
        name: text("name"),
        email: text("email").unique().notNull(),
        emailVerified: boolean("emailVerified").notNull().default(false),
        image: text("image").default("https://tse4.mm.bing.net/th?id=OIP.-BS8Y2nH1k93GJiitUVBCAHaHa&pid=Api&P=0"),
        // Auth
        hashedPassword: text("hashedPassword"),
        mustChangePassword: boolean("mustChangePassword").notNull().default(false),
        role: roleEnum("role").notNull().default("Student"),
        // Email OTP verification
        verifyToken: text("verifyToken"),
        verifyTokenExpiry: timestamp("verifyTokenExpiry"),
        verifyOTP: text("verifyOTP"),
        verifyOTPExpiry: timestamp("verifyOTPExpiry"),
        // Password reset
        resetToken: text("resetToken"),
        restTokenExpiry: timestamp("restTokenExpiry"),
        resetOTP: text("resetOTP"),
        resetOTPExpiry: timestamp("resetOTPExpiry"),
        // Onboarding
        onboardingCompleted: boolean("onboardingCompleted").notNull().default(false),
        onboardingStep: integer("onboardingStep").notNull().default(0),
        // Profile basics
        username: text("username").unique(),
        bio: text("bio"),
        headline: text("headline"),
        location: text("location"),
        gender: text("gender"),
        phone: text("phone"),
        yearofbirth: text("yearofbirth"),
        university: text("university"),
        semester: text("semester"),
        company: text("company"),
        occupation: text("occupation"),
        website: text("website"),
        // Resume
        hasResume: boolean("hasResume").notNull().default(false),
        resume: text("resume"),
        resumeText: text("resumeText"),
        // Career preferences
        interests: text("interests").array().notNull().default([]),
        learningPreferences: text("learningPreferences").array().notNull().default([]),
        careerGoals: text("careerGoals").array().notNull().default([]),
        targetCompanies: text("targetCompanies").array().notNull().default([]),
        expectedSalary: text("expectedSalary"),
        noticePeriod: text("noticePeriod"),
        workExperience: text("workExperience"),
        openToWork: boolean("openToWork").notNull().default(false),
        // Credits & XP
        credits: integer("credits").notNull().default(100),
        totalCredits: integer("totalCredits").notNull().default(0),
        creditsShared: integer("creditsShared").notNull().default(0),
        totalCreditsShared: integer("totalCreditsShared").notNull().default(0),
        maxCreditsShared: integer("maxCreditsShared").notNull().default(500),
        currentXp: integer("currentXp").notNull().default(250),
        totalXp: integer("totalXp").notNull().default(250),
        currentLevel: integer("currentLevel").notNull().default(1),
        referralCode: text("referralCode").unique(),
        referralCount: integer("referralCount").notNull().default(0),
        // Activity
        streak: integer("streak").notNull().default(0),
        lastActiveDate: timestamp("lastActiveDate"),
        // Social links (quick access)
        githubUrl: text("githubUrl"),
        linkedinUrl: text("linkedinUrl"),
        twitterUrl: text("twitterUrl"),
        websiteUrl: text("websiteUrl"),
        // Profile meta
        profileViews: integer("profileViews").notNull().default(0),
        isPublicProfile: boolean("isPublicProfile").notNull().default(true),
        yearsOfExperience: integer("yearsOfExperience"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_user_username").on(table.username),
        index("idx_user_email").on(table.email),
        index("idx_user_role").on(table.role),
        index("idx_user_referralCode").on(table.referralCode),
    ],
);

// BetterAuth-compatible account table
export const accounts = pgTable(
    "Account",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        accountId: text("accountId").notNull(),       // provider's user ID
        providerId: text("providerId").notNull(),      // "google" | "github" | "credential"
        accessToken: text("accessToken"),
        refreshToken: text("refreshToken"),
        accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
        refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
        scope: text("scope"),
        idToken: text("idToken"),
        password: text("password"),                   // hashed, for credential provider
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_account_providerId_accountId").on(table.providerId, table.accountId),
        index("idx_account_userId").on(table.userId),
    ],
);

// BetterAuth-compatible session table
export const sessions = pgTable(
    "Session",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        token: text("token").unique().notNull(),
        expiresAt: timestamp("expiresAt").notNull(),
        ipAddress: text("ipAddress"),
        userAgent: text("userAgent"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_session_userId").on(table.userId),
        index("idx_session_token").on(table.token),
    ],
);

// BetterAuth-compatible verification table
export const verifications = pgTable(
    "Verification",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expiresAt").notNull(),
        createdAt: timestamp("createdAt").defaultNow(),
        updatedAt: timestamp("updatedAt").$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_verification_identifier").on(table.identifier),
    ],
);

export const userSkills = pgTable(
    "UserSkill",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        level: text("level").notNull().default("beginner"),
        category: skillCategoryEnum("category").notNull(),
        order: integer("order").notNull().default(0),
    },
    (table) => [
        uniqueIndex("uq_userSkill_userId_name").on(table.userId, table.name),
        index("idx_userSkill_userId").on(table.userId),
        index("idx_userSkill_category").on(table.category),
    ],
);

// portfolioProjects is defined in profile.ts (full version matching Prisma schema)

export const feedbacks = pgTable(
    "Feedback",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        category: feedbackCategoryEnum("category").notNull().default("OTHER"),
        title: text("title").notNull(),
        description: text("description").notNull(),
        status: feedbackStatusEnum("status").notNull().default("UNDER_REVIEW"),
        isAnonymous: boolean("isAnonymous").notNull().default(false),
        upvotes: integer("upvotes").notNull().default(0),
        adminNotes: text("adminNotes"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_feedback_userId").on(table.userId),
        index("idx_feedback_category").on(table.category),
        index("idx_feedback_status").on(table.status),
    ],
);

export const notifications = pgTable(
    "Notification",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        title: text("title").notNull(),
        message: text("message").notNull(),
        type: notificationTypeEnum("type").notNull().default("INFO"),
        platform: platformEnum("platform").notNull().default("MAIN"),
        read: boolean("read").notNull().default(false),
        actionUrl: text("actionUrl"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_notification_userId").on(table.userId),
        index("idx_notification_read").on(table.read),
        index("idx_notification_platform").on(table.platform),
    ],
);

// ===========================
// Relations
// ===========================

export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    sessions: many(sessions),
    verifications: many(verifications),
    feedbacks: many(feedbacks),
    userSkills: many(userSkills),
    notifications: many(notifications),
    // portfolioProjects, workExperiences, etc. are in profile.ts
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, {
        fields: [accounts.userId],
        references: [users.id],
    }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
    user: one(users, {
        fields: [userSkills.userId],
        references: [users.id],
    }),
}));


export const feedbacksRelations = relations(feedbacks, ({ one }) => ({
    user: one(users, {
        fields: [feedbacks.userId],
        references: [users.id],
    }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));
