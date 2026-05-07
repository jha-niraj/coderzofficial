import {
    pgTable,
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
import {
    users,
    learnDifficultyEnum,
    learnStatusEnum,
    learnStepTypeEnum,
    quizQuestionTypeEnum,
    quizDifficultyEnum,
    interviewCardDifficultyEnum,
    learnRequestStatusEnum,
} from "./schema";

// ===========================
// Tables
// ===========================

export const learn = pgTable(
    "Learn",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        slug: text("slug").notNull().unique(),
        title: text("title").notNull(),
        description: text("description").notNull(),
        difficulty: learnDifficultyEnum("difficulty").notNull().default("BEGINNER"),
        tags: text("tags").array().notNull().default([]),
        unitNumber: integer("unitNumber").default(0),
        unitTitle: text("unitTitle"),
        mainCategoryId: text("mainCategoryId"),
        subCategoryId: text("subCategoryId"),
        topicId: text("topicId"),
        thumbnail: text("thumbnail"),
        coverImage: text("coverImage"),
        iconEmoji: text("iconEmoji").default("📚"),
        accentColor: text("accentColor").default("#3B82F6"),
        status: learnStatusEnum("status").notNull().default("DRAFT"),
        publishedAt: timestamp("publishedAt"),
        estimatedTime: integer("estimatedTime").default(10),
        prerequisites: text("prerequisites").array().notNull().default([]),
        viewCount: integer("viewCount").notNull().default(0),
        likeCount: integer("likeCount").notNull().default(0),
        bookmarkCount: integer("bookmarkCount").notNull().default(0),
        commentCount: integer("commentCount").notNull().default(0),
        metaTitle: text("metaTitle"),
        metaDescription: text("metaDescription"),
        creatorId: text("creatorId").notNull().references(() => users.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_learn_slug").on(table.slug),
        index("idx_learn_difficulty").on(table.difficulty),
        index("idx_learn_status").on(table.status),
        index("idx_learn_creatorId").on(table.creatorId),
        index("idx_learn_createdAt").on(table.createdAt),
        index("idx_learn_likeCount").on(table.likeCount),
        index("idx_learn_viewCount").on(table.viewCount),
        index("idx_learn_mainCategoryId").on(table.mainCategoryId),
        index("idx_learn_subCategoryId").on(table.subCategoryId),
        index("idx_learn_topicId").on(table.topicId),
        index("idx_learn_unitNumber").on(table.unitNumber),
    ],
);

export const learnRelation = pgTable(
    "LearnRelation",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        fromLearnId: text("fromLearnId").notNull().references(() => learn.id, { onDelete: "cascade" }),
        toLearnId: text("toLearnId").notNull().references(() => learn.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_learnRelation_fromLearnId_toLearnId").on(table.fromLearnId, table.toLearnId),
        index("idx_learnRelation_fromLearnId").on(table.fromLearnId),
        index("idx_learnRelation_toLearnId").on(table.toLearnId),
    ],
);

export const learnPrerequisite = pgTable(
    "LearnPrerequisite",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        learnId: text("learnId").notNull().references(() => learn.id, { onDelete: "cascade" }),
        prerequisiteId: text("prerequisiteId").notNull().references(() => learn.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_learnPrerequisite_learnId_prerequisiteId").on(table.learnId, table.prerequisiteId),
        index("idx_learnPrerequisite_learnId").on(table.learnId),
        index("idx_learnPrerequisite_prerequisiteId").on(table.prerequisiteId),
    ],
);

export const learnStep = pgTable(
    "LearnStep",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        learnId: text("learnId").notNull().references(() => learn.id, { onDelete: "cascade" }),
        order: integer("order").notNull(),
        title: text("title").notNull(),
        type: learnStepTypeEnum("type").notNull().default("EXPLANATION"),
        content: text("content").notNull(),
        stepData: jsonb("stepData"),
        keyTakeaways: text("keyTakeaways").array().notNull().default([]),
        warnings: text("warnings").array().notNull().default([]),
        tips: text("tips").array().notNull().default([]),
        mockInterviewId: text("mockInterviewId").unique(),
        linkedProjectId: text("linkedProjectId").unique(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_learnStep_learnId_order").on(table.learnId, table.order),
        index("idx_learnStep_learnId").on(table.learnId),
        index("idx_learnStep_type").on(table.type),
        index("idx_learnStep_mockInterviewId").on(table.mockInterviewId),
        index("idx_learnStep_linkedProjectId").on(table.linkedProjectId),
    ],
);

export const learnCodeBlock = pgTable(
    "LearnCodeBlock",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        stepId: text("stepId").notNull().references(() => learnStep.id, { onDelete: "cascade" }),
        order: integer("order").notNull().default(0),
        title: text("title"),
        language: text("language").notNull().default("javascript"),
        code: text("code").notNull(),
        explanation: text("explanation"),
        highlightLines: integer("highlightLines").array().notNull().default([]),
        showLineNumbers: boolean("showLineNumbers").notNull().default(true),
        isRunnable: boolean("isRunnable").notNull().default(false),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_learnCodeBlock_stepId").on(table.stepId),
    ],
);

export const learnLike = pgTable(
    "LearnLike",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        learnId: text("learnId").notNull().references(() => learn.id, { onDelete: "cascade" }),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_learnLike_learnId_userId").on(table.learnId, table.userId),
        index("idx_learnLike_learnId").on(table.learnId),
        index("idx_learnLike_userId").on(table.userId),
    ],
);

export const learnBookmark = pgTable(
    "LearnBookmark",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        learnId: text("learnId").notNull().references(() => learn.id, { onDelete: "cascade" }),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        folder: text("folder").default("Saved"),
        notes: text("notes"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_learnBookmark_learnId_userId").on(table.learnId, table.userId),
        index("idx_learnBookmark_learnId").on(table.learnId),
        index("idx_learnBookmark_userId").on(table.userId),
        index("idx_learnBookmark_folder").on(table.folder),
    ],
);

export const learnComment = pgTable(
    "LearnComment",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        learnId: text("learnId").notNull().references(() => learn.id, { onDelete: "cascade" }),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        content: text("content").notNull(),
        parentId: text("parentId"),
        likeCount: integer("likeCount").notNull().default(0),
        isEdited: boolean("isEdited").notNull().default(false),
        isPinned: boolean("isPinned").notNull().default(false),
        isHidden: boolean("isHidden").notNull().default(false),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_learnComment_learnId").on(table.learnId),
        index("idx_learnComment_userId").on(table.userId),
        index("idx_learnComment_parentId").on(table.parentId),
        index("idx_learnComment_createdAt").on(table.createdAt),
    ],
);

export const learnView = pgTable(
    "LearnView",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        learnId: text("learnId").notNull().references(() => learn.id, { onDelete: "cascade" }),
        userId: text("userId"),
        source: text("source"),
        duration: integer("duration"),
        stepsViewed: integer("stepsViewed").notNull().default(0),
        completedSteps: integer("completedSteps").notNull().default(0),
        viewedAt: timestamp("viewedAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_learnView_learnId").on(table.learnId),
        index("idx_learnView_userId").on(table.userId),
        index("idx_learnView_viewedAt").on(table.viewedAt),
    ],
);

export const learnProgress = pgTable(
    "LearnProgress",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        learnId: text("learnId").notNull().references(() => learn.id, { onDelete: "cascade" }),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        currentStep: integer("currentStep").notNull().default(0),
        completedSteps: integer("completedSteps").array().notNull().default([]),
        totalSteps: integer("totalSteps").notNull().default(0),
        progressPercent: real("progressPercent").notNull().default(0),
        quizAnswers: jsonb("quizAnswers"),
        challengeSubmissions: jsonb("challengeSubmissions"),
        quizScorePercent: real("quizScorePercent").notNull().default(0),
        interviewCardsReviewed: integer("interviewCardsReviewed").notNull().default(0),
        interviewCardsMastered: integer("interviewCardsMastered").notNull().default(0),
        challengeBestScore: integer("challengeBestScore").notNull().default(0),
        challengeAttempts: integer("challengeAttempts").notNull().default(0),
        isCompleted: boolean("isCompleted").notNull().default(false),
        completedAt: timestamp("completedAt"),
        totalTimeSpent: integer("totalTimeSpent").notNull().default(0),
        lastAccessedAt: timestamp("lastAccessedAt").notNull().defaultNow(),
        studioId: text("studioId").unique(),
        stepTimeSpent: jsonb("stepTimeSpent"),
        aiInteractions: integer("aiInteractions").notNull().default(0),
        quizRetries: jsonb("quizRetries"),
        bookmarkedSteps: integer("bookmarkedSteps").array().notNull().default([]),
        startedAt: timestamp("startedAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_learnProgress_learnId_userId").on(table.learnId, table.userId),
        index("idx_learnProgress_learnId").on(table.learnId),
        index("idx_learnProgress_userId").on(table.userId),
        index("idx_learnProgress_isCompleted").on(table.isCompleted),
        index("idx_learnProgress_lastAccessedAt").on(table.lastAccessedAt),
    ],
);

export const learnRequest = pgTable(
    "LearnRequest",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        title: text("title").notNull(),
        description: text("description").notNull(),
        difficulty: learnDifficultyEnum("difficulty"),
        status: learnRequestStatusEnum("status").notNull().default("PENDING"),
        adminNotes: text("adminNotes"),
        assignedTo: text("assignedTo"),
        upvotes: integer("upvotes").notNull().default(0),
        resultLearnId: text("resultLearnId"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
        resolvedAt: timestamp("resolvedAt"),
    },
    (table) => [
        index("idx_learnRequest_userId").on(table.userId),
        index("idx_learnRequest_status").on(table.status),
        index("idx_learnRequest_upvotes").on(table.upvotes),
        index("idx_learnRequest_createdAt").on(table.createdAt),
    ],
);

export const learnMainCategory = pgTable(
    "LearnMainCategory",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        slug: text("slug").notNull().unique(),
        name: text("name").notNull(),
        description: text("description"),
        icon: text("icon"),
        color: text("color"),
        order: integer("order").notNull().default(0),
        learnCount: integer("learnCount").notNull().default(0),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_learnMainCategory_slug").on(table.slug),
        index("idx_learnMainCategory_order").on(table.order),
    ],
);

export const learnSubCategory = pgTable(
    "LearnSubCategory",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        slug: text("slug").notNull().unique(),
        name: text("name").notNull(),
        description: text("description"),
        icon: text("icon"),
        color: text("color"),
        order: integer("order").notNull().default(0),
        mainCategoryId: text("mainCategoryId").notNull().references(() => learnMainCategory.id, { onDelete: "cascade" }),
        learnCount: integer("learnCount").notNull().default(0),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_learnSubCategory_slug").on(table.slug),
        index("idx_learnSubCategory_mainCategoryId").on(table.mainCategoryId),
        index("idx_learnSubCategory_order").on(table.order),
    ],
);

export const learnTopic = pgTable(
    "LearnTopic",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        slug: text("slug").notNull().unique(),
        name: text("name").notNull(),
        description: text("description"),
        icon: text("icon"),
        order: integer("order").notNull().default(0),
        subCategoryId: text("subCategoryId").notNull().references(() => learnSubCategory.id, { onDelete: "cascade" }),
        learnCount: integer("learnCount").notNull().default(0),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_learnTopic_slug").on(table.slug),
        index("idx_learnTopic_subCategoryId").on(table.subCategoryId),
        index("idx_learnTopic_order").on(table.order),
    ],
);

export const learnQuizQuestion = pgTable(
    "LearnQuizQuestion",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        stepId: text("stepId").notNull().references(() => learnStep.id, { onDelete: "cascade" }),
        order: integer("order").notNull().default(0),
        question: text("question").notNull(),
        type: quizQuestionTypeEnum("type").notNull().default("SINGLE_CHOICE"),
        options: jsonb("options").notNull(),
        explanation: text("explanation"),
        codeSnippet: text("codeSnippet"),
        codeLanguage: text("codeLanguage").default("go"),
        difficulty: quizDifficultyEnum("difficulty").notNull().default("MEDIUM"),
        points: integer("points").notNull().default(10),
        hint: text("hint"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_learnQuizQuestion_stepId").on(table.stepId),
        index("idx_learnQuizQuestion_order").on(table.order),
    ],
);

export const learnQuizAnswer = pgTable(
    "LearnQuizAnswer",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        questionId: text("questionId").notNull().references(() => learnQuizQuestion.id, { onDelete: "cascade" }),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        selectedOptions: text("selectedOptions").array().notNull().default([]),
        isCorrect: boolean("isCorrect").notNull(),
        attemptNumber: integer("attemptNumber").notNull().default(1),
        timeTaken: integer("timeTaken"),
        answeredAt: timestamp("answeredAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_learnQuizAnswer_questionId").on(table.questionId),
        index("idx_learnQuizAnswer_userId").on(table.userId),
        index("idx_learnQuizAnswer_questionId_userId").on(table.questionId, table.userId),
    ],
);

export const learnInterviewCard = pgTable(
    "LearnInterviewCard",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        stepId: text("stepId").notNull().references(() => learnStep.id, { onDelete: "cascade" }),
        order: integer("order").notNull().default(0),
        category: text("category"),
        question: text("question").notNull(),
        answer: text("answer").notNull(),
        codeSnippet: text("codeSnippet"),
        codeLanguage: text("codeLanguage").default("go"),
        difficulty: interviewCardDifficultyEnum("difficulty").notNull().default("MEDIUM"),
        tags: text("tags").array().notNull().default([]),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_learnInterviewCard_stepId").on(table.stepId),
        index("idx_learnInterviewCard_order").on(table.order),
    ],
);

export const learnChallengeSubmission = pgTable(
    "LearnChallengeSubmission",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        stepId: text("stepId").notNull().references(() => learnStep.id, { onDelete: "cascade" }),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        code: text("code").notNull(),
        language: text("language").notNull().default("go"),
        score: integer("score").notNull().default(0),
        isCorrect: boolean("isCorrect").notNull().default(false),
        feedback: text("feedback"),
        suggestions: text("suggestions").array().notNull().default([]),
        attemptNumber: integer("attemptNumber").notNull().default(1),
        submittedAt: timestamp("submittedAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_learnChallengeSubmission_stepId").on(table.stepId),
        index("idx_learnChallengeSubmission_userId").on(table.userId),
        index("idx_learnChallengeSubmission_stepId_userId").on(table.stepId, table.userId),
    ],
);

export const learnLeaderboard = pgTable(
    "LearnLeaderboard",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        subCategoryId: text("subCategoryId").notNull().references(() => learnSubCategory.id, { onDelete: "cascade" }),
        learnId: text("learnId"),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        quizScore: integer("quizScore").notNull().default(0),
        challengeScore: integer("challengeScore").notNull().default(0),
        mockScore: integer("mockScore").notNull().default(0),
        projectScore: integer("projectScore").notNull().default(0),
        totalScore: integer("totalScore").notNull().default(0),
        quizzesCompleted: integer("quizzesCompleted").notNull().default(0),
        challengesCompleted: integer("challengesCompleted").notNull().default(0),
        mocksCompleted: integer("mocksCompleted").notNull().default(0),
        projectsCompleted: integer("projectsCompleted").notNull().default(0),
        learnsCompleted: integer("learnsCompleted").notNull().default(0),
        rank: integer("rank"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_learnLeaderboard_subCategoryId_userId").on(table.subCategoryId, table.userId),
        index("idx_learnLeaderboard_subCategoryId").on(table.subCategoryId),
        index("idx_learnLeaderboard_userId").on(table.userId),
        index("idx_learnLeaderboard_totalScore").on(table.totalScore),
        index("idx_learnLeaderboard_rank").on(table.rank),
    ],
);

// ===========================
// Relations
// ===========================

export const learnRelations = relations(learn, ({ one, many }) => ({
    creator: one(users, {
        fields: [learn.creatorId],
        references: [users.id],
        relationName: "LearnCreator",
    }),
    steps: many(learnStep, { relationName: "LearnSteps" }),
    likes: many(learnLike, { relationName: "LearnLikes" }),
    bookmarks: many(learnBookmark, { relationName: "LearnBookmarks" }),
    comments: many(learnComment, { relationName: "LearnComments" }),
    views: many(learnView, { relationName: "LearnViews" }),
    progress: many(learnProgress, { relationName: "LearnProgress" }),
    relatedFrom: many(learnRelation, { relationName: "RelatedFrom" }),
    relatedTo: many(learnRelation, { relationName: "RelatedTo" }),
    prerequisiteFor: many(learnPrerequisite, { relationName: "PrerequisiteFor" }),
    prerequisiteOf: many(learnPrerequisite, { relationName: "PrerequisiteOf" }),
}));

export const learnRelationRelations = relations(learnRelation, ({ one }) => ({
    fromLearn: one(learn, {
        fields: [learnRelation.fromLearnId],
        references: [learn.id],
        relationName: "RelatedFrom",
    }),
    toLearn: one(learn, {
        fields: [learnRelation.toLearnId],
        references: [learn.id],
        relationName: "RelatedTo",
    }),
}));

export const learnPrerequisiteRelations = relations(learnPrerequisite, ({ one }) => ({
    learn: one(learn, {
        fields: [learnPrerequisite.learnId],
        references: [learn.id],
        relationName: "PrerequisiteFor",
    }),
    prerequisite: one(learn, {
        fields: [learnPrerequisite.prerequisiteId],
        references: [learn.id],
        relationName: "PrerequisiteOf",
    }),
}));

export const learnStepRelations = relations(learnStep, ({ one, many }) => ({
    learn: one(learn, {
        fields: [learnStep.learnId],
        references: [learn.id],
        relationName: "LearnSteps",
    }),
    codeBlocks: many(learnCodeBlock, { relationName: "StepCodeBlocks" }),
    quizQuestions: many(learnQuizQuestion, { relationName: "StepQuizQuestions" }),
    interviewCards: many(learnInterviewCard, { relationName: "StepInterviewCards" }),
    challengeSubmissions: many(learnChallengeSubmission, { relationName: "StepChallengeSubmissions" }),
}));

export const learnCodeBlockRelations = relations(learnCodeBlock, ({ one }) => ({
    step: one(learnStep, {
        fields: [learnCodeBlock.stepId],
        references: [learnStep.id],
        relationName: "StepCodeBlocks",
    }),
}));

export const learnLikeRelations = relations(learnLike, ({ one }) => ({
    learn: one(learn, {
        fields: [learnLike.learnId],
        references: [learn.id],
        relationName: "LearnLikes",
    }),
    user: one(users, {
        fields: [learnLike.userId],
        references: [users.id],
        relationName: "LearnLikes",
    }),
}));

export const learnBookmarkRelations = relations(learnBookmark, ({ one }) => ({
    learn: one(learn, {
        fields: [learnBookmark.learnId],
        references: [learn.id],
        relationName: "LearnBookmarks",
    }),
    user: one(users, {
        fields: [learnBookmark.userId],
        references: [users.id],
        relationName: "LearnBookmarks",
    }),
}));

export const learnCommentRelations = relations(learnComment, ({ one }) => ({
    learn: one(learn, {
        fields: [learnComment.learnId],
        references: [learn.id],
        relationName: "LearnComments",
    }),
    user: one(users, {
        fields: [learnComment.userId],
        references: [users.id],
        relationName: "LearnCommentAuthor",
    }),
}));

export const learnViewRelations = relations(learnView, ({ one }) => ({
    learn: one(learn, {
        fields: [learnView.learnId],
        references: [learn.id],
        relationName: "LearnViews",
    }),
}));

export const learnProgressRelations = relations(learnProgress, ({ one }) => ({
    learn: one(learn, {
        fields: [learnProgress.learnId],
        references: [learn.id],
        relationName: "LearnProgress",
    }),
    user: one(users, {
        fields: [learnProgress.userId],
        references: [users.id],
        relationName: "LearnProgress",
    }),
}));

export const learnRequestRelations = relations(learnRequest, ({ one }) => ({
    user: one(users, {
        fields: [learnRequest.userId],
        references: [users.id],
        relationName: "LearnRequests",
    }),
}));

export const learnMainCategoryRelations = relations(learnMainCategory, ({ many }) => ({
    subCategories: many(learnSubCategory),
}));

export const learnSubCategoryRelations = relations(learnSubCategory, ({ one, many }) => ({
    mainCategory: one(learnMainCategory, {
        fields: [learnSubCategory.mainCategoryId],
        references: [learnMainCategory.id],
    }),
    topics: many(learnTopic),
    leaderboard: many(learnLeaderboard, { relationName: "SubCategoryLeaderboard" }),
}));

export const learnTopicRelations = relations(learnTopic, ({ one }) => ({
    subCategory: one(learnSubCategory, {
        fields: [learnTopic.subCategoryId],
        references: [learnSubCategory.id],
    }),
}));

export const learnQuizQuestionRelations = relations(learnQuizQuestion, ({ one, many }) => ({
    step: one(learnStep, {
        fields: [learnQuizQuestion.stepId],
        references: [learnStep.id],
        relationName: "StepQuizQuestions",
    }),
    answers: many(learnQuizAnswer, { relationName: "QuizQuestionAnswers" }),
}));

export const learnQuizAnswerRelations = relations(learnQuizAnswer, ({ one }) => ({
    question: one(learnQuizQuestion, {
        fields: [learnQuizAnswer.questionId],
        references: [learnQuizQuestion.id],
        relationName: "QuizQuestionAnswers",
    }),
    user: one(users, {
        fields: [learnQuizAnswer.userId],
        references: [users.id],
        relationName: "LearnQuizAnswers",
    }),
}));

export const learnInterviewCardRelations = relations(learnInterviewCard, ({ one }) => ({
    step: one(learnStep, {
        fields: [learnInterviewCard.stepId],
        references: [learnStep.id],
        relationName: "StepInterviewCards",
    }),
}));

export const learnChallengeSubmissionRelations = relations(learnChallengeSubmission, ({ one }) => ({
    step: one(learnStep, {
        fields: [learnChallengeSubmission.stepId],
        references: [learnStep.id],
        relationName: "StepChallengeSubmissions",
    }),
    user: one(users, {
        fields: [learnChallengeSubmission.userId],
        references: [users.id],
        relationName: "LearnChallengeSubmissions",
    }),
}));

export const learnLeaderboardRelations = relations(learnLeaderboard, ({ one }) => ({
    subCategory: one(learnSubCategory, {
        fields: [learnLeaderboard.subCategoryId],
        references: [learnSubCategory.id],
        relationName: "SubCategoryLeaderboard",
    }),
    user: one(users, {
        fields: [learnLeaderboard.userId],
        references: [users.id],
        relationName: "LearnLeaderboard",
    }),
}));
