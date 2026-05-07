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
import { users } from "./schema.js";

// ===========================
// Enums
// ===========================

export const assessmentModeEnum = pgEnum("AssessmentMode", [
    "QUIZ",
    "CODE",
    "MOCK",
    "MIXED",
]);

export const assessmentTypeEnum = pgEnum("AssessmentType", [
    "PRACTICE",
    "EXAM",
]);

export const questionDifficultyEnum = pgEnum("QuestionDifficulty", [
    "EASY",
    "INTERMEDIATE",
    "HARD",
]);

export const assessmentLanguageEnum = pgEnum("AssessmentLanguage", [
    "JAVASCRIPT",
    "PYTHON",
    "C",
    "CPP",
    "REACTJS",
    "TYPESCRIPT",
    "JAVA",
    "GO",
    "RUST",
]);

export const assessmentQuestionTypeEnum = pgEnum("AssessmentQuestionType", [
    "MCQ",
    "MULTIPLE_SELECT",
    "CODE_OUTPUT",
    "CODE_WRITE",
    "CODE_DEBUG",
    "CODE_COMPLETE",
    "SCENARIO",
    "TRUE_FALSE",
]);

export const userContentStatusEnum = pgEnum("UserContentStatus", [
    "GENERATING",
    "DRAFT",
    "ACTIVE",
    "ARCHIVED",
]);

// ===========================
// Tables
// ===========================

export const assessmentTopics = pgTable(
    "AssessmentTopic",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        slug: text("slug").notNull().unique(),
        name: text("name").notNull(),
        description: text("description"),
        icon: text("icon"),
        color: text("color"),
        language: assessmentLanguageEnum("language").notNull(),
        totalQuestions: integer("totalQuestions").notNull().default(0),
        totalAttempts: integer("totalAttempts").notNull().default(0),
        avgScore: real("avgScore").notNull().default(0),
        isActive: boolean("isActive").notNull().default(true),
        orderIndex: integer("orderIndex").notNull().default(0),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_assessmentTopic_language").on(table.language),
        index("idx_assessmentTopic_isActive").on(table.isActive),
    ],
);

export const assessmentSubModules = pgTable(
    "AssessmentSubModule",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        slug: text("slug").notNull(),
        name: text("name").notNull(),
        description: text("description"),
        icon: text("icon"),
        topicId: text("topicId").notNull().references(() => assessmentTopics.id, { onDelete: "cascade" }),
        totalQuestions: integer("totalQuestions").notNull().default(0),
        totalAttempts: integer("totalAttempts").notNull().default(0),
        avgScore: real("avgScore").notNull().default(0),
        isActive: boolean("isActive").notNull().default(true),
        orderIndex: integer("orderIndex").notNull().default(0),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_assessmentSubModule_topicId_slug").on(table.topicId, table.slug),
        index("idx_assessmentSubModule_topicId").on(table.topicId),
        index("idx_assessmentSubModule_isActive").on(table.isActive),
    ],
);

export const assessmentQuestions = pgTable(
    "AssessmentQuestion",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        topicId: text("topicId").notNull().references(() => assessmentTopics.id, { onDelete: "cascade" }),
        subModuleId: text("subModuleId").references(() => assessmentSubModules.id, { onDelete: "set null" }),
        type: assessmentQuestionTypeEnum("type").notNull(),
        mode: assessmentModeEnum("mode").notNull(),
        difficulty: questionDifficultyEnum("difficulty").notNull(),
        question: text("question").notNull(),
        questionHtml: text("questionHtml"),
        codeSnippet: text("codeSnippet"),
        codeLanguage: text("codeLanguage"),
        options: jsonb("options"),
        correctAnswer: text("correctAnswer"),
        answerExplanation: text("answerExplanation"),
        testCases: jsonb("testCases"),
        starterCode: text("starterCode"),
        solutionCode: text("solutionCode"),
        hints: jsonb("hints"),
        points: integer("points").notNull().default(10),
        timeLimit: integer("timeLimit"),
        isSeeded: boolean("isSeeded").notNull().default(true),
        aiGenerated: boolean("aiGenerated").notNull().default(false),
        generatedFor: text("generatedFor"),
        totalAttempts: integer("totalAttempts").notNull().default(0),
        correctAttempts: integer("correctAttempts").notNull().default(0),
        avgTimeSpent: integer("avgTimeSpent").notNull().default(0),
        isActive: boolean("isActive").notNull().default(true),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_assessmentQuestion_topicId").on(table.topicId),
        index("idx_assessmentQuestion_subModuleId").on(table.subModuleId),
        index("idx_assessmentQuestion_type").on(table.type),
        index("idx_assessmentQuestion_mode").on(table.mode),
        index("idx_assessmentQuestion_difficulty").on(table.difficulty),
        index("idx_assessmentQuestion_isSeeded").on(table.isSeeded),
        index("idx_assessmentQuestion_isActive").on(table.isActive),
    ],
);

export const practiceAttempts = pgTable(
    "PracticeAttempt",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        topicId: text("topicId").notNull().references(() => assessmentTopics.id, { onDelete: "cascade" }),
        subModuleId: text("subModuleId").references(() => assessmentSubModules.id, { onDelete: "set null" }),
        mode: assessmentModeEnum("mode").notNull(),
        difficulty: questionDifficultyEnum("difficulty"),
        totalQuestions: integer("totalQuestions").notNull(),
        answeredCount: integer("answeredCount").notNull().default(0),
        correctCount: integer("correctCount").notNull().default(0),
        score: real("score").notNull().default(0),
        startedAt: timestamp("startedAt").notNull().defaultNow(),
        completedAt: timestamp("completedAt"),
        timeSpent: integer("timeSpent").notNull().default(0),
        status: text("status").notNull().default("IN_PROGRESS"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_practiceAttempt_userId").on(table.userId),
        index("idx_practiceAttempt_topicId").on(table.topicId),
        index("idx_practiceAttempt_subModuleId").on(table.subModuleId),
        index("idx_practiceAttempt_status").on(table.status),
    ],
);

export const practiceAnswers = pgTable(
    "PracticeAnswer",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        attemptId: text("attemptId").notNull().references(() => practiceAttempts.id, { onDelete: "cascade" }),
        questionId: text("questionId").notNull().references(() => assessmentQuestions.id, { onDelete: "cascade" }),
        selectedOption: text("selectedOption"),
        selectedOptions: jsonb("selectedOptions"),
        codeAnswer: text("codeAnswer"),
        textAnswer: text("textAnswer"),
        isCorrect: boolean("isCorrect").notNull(),
        partialScore: real("partialScore"),
        pointsEarned: integer("pointsEarned").notNull().default(0),
        timeSpent: integer("timeSpent").notNull().default(0),
        aiFeedback: text("aiFeedback"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_practiceAnswer_attemptId_questionId").on(table.attemptId, table.questionId),
        index("idx_practiceAnswer_attemptId").on(table.attemptId),
        index("idx_practiceAnswer_questionId").on(table.questionId),
    ],
);

export const examAttempts = pgTable(
    "ExamAttempt",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        topicId: text("topicId").notNull().references(() => assessmentTopics.id, { onDelete: "cascade" }),
        mode: assessmentModeEnum("mode").notNull(),
        difficulty: questionDifficultyEnum("difficulty").notNull(),
        totalQuestions: integer("totalQuestions").notNull(),
        timeLimit: integer("timeLimit").notNull(),
        passingScore: real("passingScore").notNull().default(70),
        answeredCount: integer("answeredCount").notNull().default(0),
        correctCount: integer("correctCount").notNull().default(0),
        score: real("score"),
        passed: boolean("passed"),
        startedAt: timestamp("startedAt").notNull().defaultNow(),
        completedAt: timestamp("completedAt"),
        timeSpent: integer("timeSpent").notNull().default(0),
        status: text("status").notNull().default("IN_PROGRESS"),
        tabSwitchCount: integer("tabSwitchCount").notNull().default(0),
        warnings: jsonb("warnings"),
        certificateId: text("certificateId").unique(),
        certificateUrl: text("certificateUrl"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_examAttempt_userId").on(table.userId),
        index("idx_examAttempt_topicId").on(table.topicId),
        index("idx_examAttempt_status").on(table.status),
        index("idx_examAttempt_passed").on(table.passed),
    ],
);

export const examAnswers = pgTable(
    "ExamAnswer",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        attemptId: text("attemptId").notNull().references(() => examAttempts.id, { onDelete: "cascade" }),
        questionId: text("questionId").notNull().references(() => assessmentQuestions.id, { onDelete: "cascade" }),
        selectedOption: text("selectedOption"),
        selectedOptions: jsonb("selectedOptions"),
        codeAnswer: text("codeAnswer"),
        textAnswer: text("textAnswer"),
        isCorrect: boolean("isCorrect"),
        partialScore: real("partialScore"),
        pointsEarned: integer("pointsEarned").notNull().default(0),
        timeSpent: integer("timeSpent").notNull().default(0),
        aiEvaluation: jsonb("aiEvaluation"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_examAnswer_attemptId_questionId").on(table.attemptId, table.questionId),
        index("idx_examAnswer_attemptId").on(table.attemptId),
        index("idx_examAnswer_questionId").on(table.questionId),
    ],
);

export const userAssessmentStats = pgTable(
    "UserAssessmentStats",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
        totalPracticeAttempts: integer("totalPracticeAttempts").notNull().default(0),
        practiceQuestionsAnswered: integer("practiceQuestionsAnswered").notNull().default(0),
        practiceCorrectAnswers: integer("practiceCorrectAnswers").notNull().default(0),
        avgPracticeScore: real("avgPracticeScore").notNull().default(0),
        totalPracticeTime: integer("totalPracticeTime").notNull().default(0),
        totalExamAttempts: integer("totalExamAttempts").notNull().default(0),
        examsPassed: integer("examsPassed").notNull().default(0),
        examsFailed: integer("examsFailed").notNull().default(0),
        avgExamScore: real("avgExamScore").notNull().default(0),
        certificates: integer("certificates").notNull().default(0),
        streakDays: integer("streakDays").notNull().default(0),
        longestStreak: integer("longestStreak").notNull().default(0),
        lastActivityAt: timestamp("lastActivityAt"),
        topicProgress: jsonb("topicProgress"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_userAssessmentStats_userId").on(table.userId),
    ],
);

export const assessmentCertificates = pgTable(
    "AssessmentCertificate",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        certificateId: text("certificateId").notNull().unique(),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        topicName: text("topicName").notNull(),
        language: assessmentLanguageEnum("language").notNull(),
        difficulty: questionDifficultyEnum("difficulty").notNull(),
        mode: assessmentModeEnum("mode").notNull(),
        score: real("score").notNull(),
        passingScore: real("passingScore").notNull(),
        issuedAt: timestamp("issuedAt").notNull().defaultNow(),
        expiresAt: timestamp("expiresAt"),
        isActive: boolean("isActive").notNull().default(true),
        verificationUrl: text("verificationUrl"),
    },
    (table) => [
        index("idx_assessmentCertificate_userId").on(table.userId),
        index("idx_assessmentCertificate_certificateId").on(table.certificateId),
    ],
);

export const userPracticeSets = pgTable(
    "UserPracticeSet",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        creatorId: text("creatorId").notNull().references(() => users.id, { onDelete: "cascade" }),
        title: text("title").notNull(),
        description: text("description"),
        slug: text("slug").notNull().unique(),
        language: assessmentLanguageEnum("language").notNull(),
        topicId: text("topicId").references(() => assessmentTopics.id, { onDelete: "set null" }),
        subModuleId: text("subModuleId").references(() => assessmentSubModules.id, { onDelete: "set null" }),
        mode: assessmentModeEnum("mode").notNull(),
        difficulty: questionDifficultyEnum("difficulty").notNull(),
        questionCount: integer("questionCount").notNull().default(10),
        timeLimit: integer("timeLimit"),
        isPublic: boolean("isPublic").notNull().default(false),
        madePublicAt: timestamp("madePublicAt"),
        creditsCost: integer("creditsCost").notNull().default(5),
        creditsRefunded: integer("creditsRefunded").notNull().default(0),
        views: integer("views").notNull().default(0),
        likes: integer("likes").notNull().default(0),
        totalAttempts: integer("totalAttempts").notNull().default(0),
        avgScore: real("avgScore").notNull().default(0),
        completions: integer("completions").notNull().default(0),
        status: userContentStatusEnum("status").notNull().default("GENERATING"),
        isUniversityAssessment: boolean("isUniversityAssessment").notNull().default(false),
        universityId: text("universityId"),
        teacherMemberId: text("teacherMemberId"),
        classIds: text("classIds").array().notNull().default([]),
        assignmentDeadline: timestamp("assignmentDeadline"),
        assignmentCredits: integer("assignmentCredits"),
        assignmentInstructions: text("assignmentInstructions"),
        isLiveSession: boolean("isLiveSession").notNull().default(false),
        liveSessionStartedAt: timestamp("liveSessionStartedAt"),
        liveSessionEndedAt: timestamp("liveSessionEndedAt"),
        liveSessionActive: boolean("liveSessionActive").notNull().default(false),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_userPracticeSet_creatorId").on(table.creatorId),
        index("idx_userPracticeSet_language").on(table.language),
        index("idx_userPracticeSet_isPublic").on(table.isPublic),
        index("idx_userPracticeSet_status").on(table.status),
        index("idx_userPracticeSet_createdAt").on(table.createdAt),
        index("idx_userPracticeSet_universityId").on(table.universityId),
        index("idx_userPracticeSet_isUniversityAssessment").on(table.isUniversityAssessment),
        index("idx_userPracticeSet_isLiveSession").on(table.isLiveSession),
    ],
);

export const userPracticeSetQuestions = pgTable(
    "UserPracticeSetQuestion",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        practiceSetId: text("practiceSetId").notNull().references(() => userPracticeSets.id, { onDelete: "cascade" }),
        type: assessmentQuestionTypeEnum("type").notNull(),
        difficulty: questionDifficultyEnum("difficulty").notNull(),
        orderIndex: integer("orderIndex").notNull().default(0),
        question: text("question").notNull(),
        codeSnippet: text("codeSnippet"),
        codeLanguage: text("codeLanguage"),
        options: jsonb("options"),
        correctAnswer: text("correctAnswer"),
        answerExplanation: text("answerExplanation"),
        testCases: jsonb("testCases"),
        starterCode: text("starterCode"),
        solutionCode: text("solutionCode"),
        mockPrompt: text("mockPrompt"),
        expectedTopics: jsonb("expectedTopics"),
        hints: jsonb("hints"),
        points: integer("points").notNull().default(10),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_userPracticeSetQuestion_practiceSetId").on(table.practiceSetId),
    ],
);

export const userPracticeSetPurchases = pgTable(
    "UserPracticeSetPurchase",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        practiceSetId: text("practiceSetId").notNull().references(() => userPracticeSets.id, { onDelete: "cascade" }),
        attachedAt: timestamp("attachedAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_userPracticeSetPurchase_userId_practiceSetId").on(table.userId, table.practiceSetId),
        index("idx_userPracticeSetPurchase_userId").on(table.userId),
        index("idx_userPracticeSetPurchase_practiceSetId").on(table.practiceSetId),
    ],
);

export const userPracticeSetLikes = pgTable(
    "UserPracticeSetLike",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        practiceSetId: text("practiceSetId").notNull().references(() => userPracticeSets.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_userPracticeSetLike_userId_practiceSetId").on(table.userId, table.practiceSetId),
        index("idx_userPracticeSetLike_userId").on(table.userId),
        index("idx_userPracticeSetLike_practiceSetId").on(table.practiceSetId),
    ],
);

export const userPracticeSetAttempts = pgTable(
    "UserPracticeSetAttempt",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        practiceSetId: text("practiceSetId").notNull().references(() => userPracticeSets.id, { onDelete: "cascade" }),
        mode: assessmentModeEnum("mode").notNull(),
        totalQuestions: integer("totalQuestions").notNull(),
        answeredCount: integer("answeredCount").notNull().default(0),
        correctCount: integer("correctCount").notNull().default(0),
        score: real("score").notNull().default(0),
        creditsSpent: integer("creditsSpent").notNull().default(0),
        creditsEarned: integer("creditsEarned").notNull().default(0),
        startedAt: timestamp("startedAt").notNull().defaultNow(),
        completedAt: timestamp("completedAt"),
        timeSpent: integer("timeSpent").notNull().default(0),
        status: text("status").notNull().default("IN_PROGRESS"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_userPracticeSetAttempt_userId").on(table.userId),
        index("idx_userPracticeSetAttempt_practiceSetId").on(table.practiceSetId),
        index("idx_userPracticeSetAttempt_status").on(table.status),
    ],
);

export const userPracticeSetAnswers = pgTable(
    "UserPracticeSetAnswer",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        attemptId: text("attemptId").notNull().references(() => userPracticeSetAttempts.id, { onDelete: "cascade" }),
        questionId: text("questionId").notNull().references(() => userPracticeSetQuestions.id, { onDelete: "cascade" }),
        selectedOption: text("selectedOption"),
        selectedOptions: jsonb("selectedOptions"),
        codeAnswer: text("codeAnswer"),
        textAnswer: text("textAnswer"),
        voiceTranscript: text("voiceTranscript"),
        isCorrect: boolean("isCorrect"),
        partialScore: real("partialScore"),
        pointsEarned: integer("pointsEarned").notNull().default(0),
        timeSpent: integer("timeSpent").notNull().default(0),
        aiFeedback: text("aiFeedback"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_userPracticeSetAnswer_attemptId_questionId").on(table.attemptId, table.questionId),
        index("idx_userPracticeSetAnswer_attemptId").on(table.attemptId),
        index("idx_userPracticeSetAnswer_questionId").on(table.questionId),
    ],
);

export const userExamSets = pgTable(
    "UserExamSet",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        creatorId: text("creatorId").notNull().references(() => users.id, { onDelete: "cascade" }),
        title: text("title").notNull(),
        description: text("description"),
        slug: text("slug").notNull().unique(),
        language: assessmentLanguageEnum("language").notNull(),
        topicId: text("topicId").references(() => assessmentTopics.id, { onDelete: "set null" }),
        mode: assessmentModeEnum("mode").notNull(),
        difficulty: questionDifficultyEnum("difficulty").notNull(),
        questionCount: integer("questionCount").notNull().default(20),
        timeLimit: integer("timeLimit").notNull().default(1800),
        passingScore: real("passingScore").notNull().default(70),
        isPublic: boolean("isPublic").notNull().default(false),
        madePublicAt: timestamp("madePublicAt"),
        creditsCost: integer("creditsCost").notNull().default(10),
        creditsRefunded: integer("creditsRefunded").notNull().default(0),
        views: integer("views").notNull().default(0),
        likes: integer("likes").notNull().default(0),
        totalAttempts: integer("totalAttempts").notNull().default(0),
        avgScore: real("avgScore").notNull().default(0),
        passCount: integer("passCount").notNull().default(0),
        failCount: integer("failCount").notNull().default(0),
        status: userContentStatusEnum("status").notNull().default("GENERATING"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_userExamSet_creatorId").on(table.creatorId),
        index("idx_userExamSet_language").on(table.language),
        index("idx_userExamSet_isPublic").on(table.isPublic),
        index("idx_userExamSet_status").on(table.status),
        index("idx_userExamSet_createdAt").on(table.createdAt),
    ],
);

export const userExamSetQuestions = pgTable(
    "UserExamSetQuestion",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        examSetId: text("examSetId").notNull().references(() => userExamSets.id, { onDelete: "cascade" }),
        type: assessmentQuestionTypeEnum("type").notNull(),
        difficulty: questionDifficultyEnum("difficulty").notNull(),
        orderIndex: integer("orderIndex").notNull().default(0),
        question: text("question").notNull(),
        codeSnippet: text("codeSnippet"),
        codeLanguage: text("codeLanguage"),
        options: jsonb("options"),
        correctAnswer: text("correctAnswer"),
        answerExplanation: text("answerExplanation"),
        testCases: jsonb("testCases"),
        starterCode: text("starterCode"),
        solutionCode: text("solutionCode"),
        mockPrompt: text("mockPrompt"),
        expectedTopics: jsonb("expectedTopics"),
        hints: jsonb("hints"),
        points: integer("points").notNull().default(10),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_userExamSetQuestion_examSetId").on(table.examSetId),
    ],
);

export const userExamSetPurchases = pgTable(
    "UserExamSetPurchase",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        examSetId: text("examSetId").notNull().references(() => userExamSets.id, { onDelete: "cascade" }),
        attachedAt: timestamp("attachedAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_userExamSetPurchase_userId_examSetId").on(table.userId, table.examSetId),
        index("idx_userExamSetPurchase_userId").on(table.userId),
        index("idx_userExamSetPurchase_examSetId").on(table.examSetId),
    ],
);

export const userExamSetLikes = pgTable(
    "UserExamSetLike",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        examSetId: text("examSetId").notNull().references(() => userExamSets.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_userExamSetLike_userId_examSetId").on(table.userId, table.examSetId),
        index("idx_userExamSetLike_userId").on(table.userId),
        index("idx_userExamSetLike_examSetId").on(table.examSetId),
    ],
);

export const userExamSetAttempts = pgTable(
    "UserExamSetAttempt",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        examSetId: text("examSetId").notNull().references(() => userExamSets.id, { onDelete: "cascade" }),
        mode: assessmentModeEnum("mode").notNull(),
        totalQuestions: integer("totalQuestions").notNull(),
        answeredCount: integer("answeredCount").notNull().default(0),
        correctCount: integer("correctCount").notNull().default(0),
        score: real("score"),
        passed: boolean("passed"),
        creditsSpent: integer("creditsSpent").notNull().default(0),
        creditsEarned: integer("creditsEarned").notNull().default(0),
        timeLimit: integer("timeLimit").notNull(),
        startedAt: timestamp("startedAt").notNull().defaultNow(),
        completedAt: timestamp("completedAt"),
        timeSpent: integer("timeSpent").notNull().default(0),
        tabSwitchCount: integer("tabSwitchCount").notNull().default(0),
        warnings: jsonb("warnings"),
        status: text("status").notNull().default("IN_PROGRESS"),
        certificateId: text("certificateId").unique(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_userExamSetAttempt_userId").on(table.userId),
        index("idx_userExamSetAttempt_examSetId").on(table.examSetId),
        index("idx_userExamSetAttempt_status").on(table.status),
        index("idx_userExamSetAttempt_passed").on(table.passed),
    ],
);

export const userExamSetAnswers = pgTable(
    "UserExamSetAnswer",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        attemptId: text("attemptId").notNull().references(() => userExamSetAttempts.id, { onDelete: "cascade" }),
        questionId: text("questionId").notNull().references(() => userExamSetQuestions.id, { onDelete: "cascade" }),
        selectedOption: text("selectedOption"),
        selectedOptions: jsonb("selectedOptions"),
        codeAnswer: text("codeAnswer"),
        textAnswer: text("textAnswer"),
        voiceTranscript: text("voiceTranscript"),
        isCorrect: boolean("isCorrect"),
        partialScore: real("partialScore"),
        pointsEarned: integer("pointsEarned").notNull().default(0),
        timeSpent: integer("timeSpent").notNull().default(0),
        aiFeedback: text("aiFeedback"),
        aiEvaluation: jsonb("aiEvaluation"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_userExamSetAnswer_attemptId_questionId").on(table.attemptId, table.questionId),
        index("idx_userExamSetAnswer_attemptId").on(table.attemptId),
        index("idx_userExamSetAnswer_questionId").on(table.questionId),
    ],
);

export const randomPracticeSessions = pgTable(
    "RandomPracticeSession",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        language: assessmentLanguageEnum("language"),
        mode: assessmentModeEnum("mode"),
        difficulty: questionDifficultyEnum("difficulty"),
        questionCount: integer("questionCount").notNull().default(10),
        creditsCost: integer("creditsCost").notNull().default(3),
        creditsEarned: integer("creditsEarned").notNull().default(0),
        totalQuestions: integer("totalQuestions").notNull(),
        answeredCount: integer("answeredCount").notNull().default(0),
        correctCount: integer("correctCount").notNull().default(0),
        score: real("score").notNull().default(0),
        startedAt: timestamp("startedAt").notNull().defaultNow(),
        completedAt: timestamp("completedAt"),
        timeSpent: integer("timeSpent").notNull().default(0),
        questionRefs: jsonb("questionRefs").notNull(),
        answers: jsonb("answers"),
        status: text("status").notNull().default("IN_PROGRESS"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_randomPracticeSession_userId").on(table.userId),
        index("idx_randomPracticeSession_status").on(table.status),
        index("idx_randomPracticeSession_createdAt").on(table.createdAt),
    ],
);

// ===========================
// Relations
// ===========================

export const assessmentTopicsRelations = relations(assessmentTopics, ({ many }) => ({
    subModules: many(assessmentSubModules),
    questions: many(assessmentQuestions),
    practiceAttempts: many(practiceAttempts),
    examAttempts: many(examAttempts),
    practiceSets: many(userPracticeSets),
    examSets: many(userExamSets),
}));

export const assessmentSubModulesRelations = relations(assessmentSubModules, ({ one, many }) => ({
    topic: one(assessmentTopics, {
        fields: [assessmentSubModules.topicId],
        references: [assessmentTopics.id],
    }),
    questions: many(assessmentQuestions),
    practiceAttempts: many(practiceAttempts),
    practiceSets: many(userPracticeSets),
}));

export const assessmentQuestionsRelations = relations(assessmentQuestions, ({ one, many }) => ({
    topic: one(assessmentTopics, {
        fields: [assessmentQuestions.topicId],
        references: [assessmentTopics.id],
    }),
    subModule: one(assessmentSubModules, {
        fields: [assessmentQuestions.subModuleId],
        references: [assessmentSubModules.id],
    }),
    practiceAnswers: many(practiceAnswers),
    examAnswers: many(examAnswers),
}));

export const practiceAttemptsRelations = relations(practiceAttempts, ({ one, many }) => ({
    user: one(users, {
        fields: [practiceAttempts.userId],
        references: [users.id],
    }),
    topic: one(assessmentTopics, {
        fields: [practiceAttempts.topicId],
        references: [assessmentTopics.id],
    }),
    subModule: one(assessmentSubModules, {
        fields: [practiceAttempts.subModuleId],
        references: [assessmentSubModules.id],
    }),
    answers: many(practiceAnswers),
}));

export const practiceAnswersRelations = relations(practiceAnswers, ({ one }) => ({
    attempt: one(practiceAttempts, {
        fields: [practiceAnswers.attemptId],
        references: [practiceAttempts.id],
    }),
    question: one(assessmentQuestions, {
        fields: [practiceAnswers.questionId],
        references: [assessmentQuestions.id],
    }),
}));

export const examAttemptsRelations = relations(examAttempts, ({ one, many }) => ({
    user: one(users, {
        fields: [examAttempts.userId],
        references: [users.id],
    }),
    topic: one(assessmentTopics, {
        fields: [examAttempts.topicId],
        references: [assessmentTopics.id],
    }),
    answers: many(examAnswers),
}));

export const examAnswersRelations = relations(examAnswers, ({ one }) => ({
    attempt: one(examAttempts, {
        fields: [examAnswers.attemptId],
        references: [examAttempts.id],
    }),
    question: one(assessmentQuestions, {
        fields: [examAnswers.questionId],
        references: [assessmentQuestions.id],
    }),
}));

export const userAssessmentStatsRelations = relations(userAssessmentStats, ({ one }) => ({
    user: one(users, {
        fields: [userAssessmentStats.userId],
        references: [users.id],
    }),
}));

export const assessmentCertificatesRelations = relations(assessmentCertificates, ({ one }) => ({
    user: one(users, {
        fields: [assessmentCertificates.userId],
        references: [users.id],
    }),
}));

export const userPracticeSetsRelations = relations(userPracticeSets, ({ one, many }) => ({
    creator: one(users, {
        fields: [userPracticeSets.creatorId],
        references: [users.id],
    }),
    topic: one(assessmentTopics, {
        fields: [userPracticeSets.topicId],
        references: [assessmentTopics.id],
    }),
    subModule: one(assessmentSubModules, {
        fields: [userPracticeSets.subModuleId],
        references: [assessmentSubModules.id],
    }),
    questions: many(userPracticeSetQuestions),
    purchases: many(userPracticeSetPurchases),
    likes: many(userPracticeSetLikes),
    attempts: many(userPracticeSetAttempts),
}));

export const userPracticeSetQuestionsRelations = relations(userPracticeSetQuestions, ({ one, many }) => ({
    practiceSet: one(userPracticeSets, {
        fields: [userPracticeSetQuestions.practiceSetId],
        references: [userPracticeSets.id],
    }),
    answers: many(userPracticeSetAnswers),
}));

export const userPracticeSetPurchasesRelations = relations(userPracticeSetPurchases, ({ one }) => ({
    user: one(users, {
        fields: [userPracticeSetPurchases.userId],
        references: [users.id],
    }),
    practiceSet: one(userPracticeSets, {
        fields: [userPracticeSetPurchases.practiceSetId],
        references: [userPracticeSets.id],
    }),
}));

export const userPracticeSetLikesRelations = relations(userPracticeSetLikes, ({ one }) => ({
    user: one(users, {
        fields: [userPracticeSetLikes.userId],
        references: [users.id],
    }),
    practiceSet: one(userPracticeSets, {
        fields: [userPracticeSetLikes.practiceSetId],
        references: [userPracticeSets.id],
    }),
}));

export const userPracticeSetAttemptsRelations = relations(userPracticeSetAttempts, ({ one, many }) => ({
    user: one(users, {
        fields: [userPracticeSetAttempts.userId],
        references: [users.id],
    }),
    practiceSet: one(userPracticeSets, {
        fields: [userPracticeSetAttempts.practiceSetId],
        references: [userPracticeSets.id],
    }),
    answers: many(userPracticeSetAnswers),
}));

export const userPracticeSetAnswersRelations = relations(userPracticeSetAnswers, ({ one }) => ({
    attempt: one(userPracticeSetAttempts, {
        fields: [userPracticeSetAnswers.attemptId],
        references: [userPracticeSetAttempts.id],
    }),
    question: one(userPracticeSetQuestions, {
        fields: [userPracticeSetAnswers.questionId],
        references: [userPracticeSetQuestions.id],
    }),
}));

export const userExamSetsRelations = relations(userExamSets, ({ one, many }) => ({
    creator: one(users, {
        fields: [userExamSets.creatorId],
        references: [users.id],
    }),
    topic: one(assessmentTopics, {
        fields: [userExamSets.topicId],
        references: [assessmentTopics.id],
    }),
    questions: many(userExamSetQuestions),
    purchases: many(userExamSetPurchases),
    likes: many(userExamSetLikes),
    attempts: many(userExamSetAttempts),
}));

export const userExamSetQuestionsRelations = relations(userExamSetQuestions, ({ one, many }) => ({
    examSet: one(userExamSets, {
        fields: [userExamSetQuestions.examSetId],
        references: [userExamSets.id],
    }),
    answers: many(userExamSetAnswers),
}));

export const userExamSetPurchasesRelations = relations(userExamSetPurchases, ({ one }) => ({
    user: one(users, {
        fields: [userExamSetPurchases.userId],
        references: [users.id],
    }),
    examSet: one(userExamSets, {
        fields: [userExamSetPurchases.examSetId],
        references: [userExamSets.id],
    }),
}));

export const userExamSetLikesRelations = relations(userExamSetLikes, ({ one }) => ({
    user: one(users, {
        fields: [userExamSetLikes.userId],
        references: [users.id],
    }),
    examSet: one(userExamSets, {
        fields: [userExamSetLikes.examSetId],
        references: [userExamSets.id],
    }),
}));

export const userExamSetAttemptsRelations = relations(userExamSetAttempts, ({ one, many }) => ({
    user: one(users, {
        fields: [userExamSetAttempts.userId],
        references: [users.id],
    }),
    examSet: one(userExamSets, {
        fields: [userExamSetAttempts.examSetId],
        references: [userExamSets.id],
    }),
    answers: many(userExamSetAnswers),
}));

export const userExamSetAnswersRelations = relations(userExamSetAnswers, ({ one }) => ({
    attempt: one(userExamSetAttempts, {
        fields: [userExamSetAnswers.attemptId],
        references: [userExamSetAttempts.id],
    }),
    question: one(userExamSetQuestions, {
        fields: [userExamSetAnswers.questionId],
        references: [userExamSetQuestions.id],
    }),
}));

export const randomPracticeSessionsRelations = relations(randomPracticeSessions, ({ one }) => ({
    user: one(users, {
        fields: [randomPracticeSessions.userId],
        references: [users.id],
    }),
}));
