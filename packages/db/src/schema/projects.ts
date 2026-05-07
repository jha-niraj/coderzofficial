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
    varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users, resourceTypeEnum } from "./schema";

// ===========================
// Enums
// ===========================

export const projectV2VisibilityEnum = pgEnum("ProjectV2Visibility", [
    "PRIVATE",
    "PUBLIC",
]);

export const projectV2DifficultyEnum = pgEnum("ProjectV2Difficulty", [
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
]);

export const userProjectV2StatusEnum = pgEnum("UserProjectV2Status", [
    "NOT_STARTED",
    "IN_PROGRESS",
    "SUBMITTED",
    "COMPLETED",
]);

export const taskKanbanStatusEnum = pgEnum("TaskKanbanStatus", [
    "TO_DO",
    "IN_PROGRESS",
    "COMPLETED",
]);

export const quizV2DifficultyEnum = pgEnum("QuizV2Difficulty", [
    "EASY",
    "MEDIUM",
    "HARD",
]);

export const featureSuggestionTypeEnum = pgEnum("FeatureSuggestionType", [
    "FEATURE",
    "IMPROVEMENT",
    "BUG_FIX",
    "UI_UX",
    "PERFORMANCE",
    "DOCUMENTATION",
    "OTHER",
]);

export const featureSuggestionStatusEnum = pgEnum("FeatureSuggestionStatus", [
    "PENDING",
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
    "IMPLEMENTED",
]);

export const suggestionSourceEnum = pgEnum("SuggestionSource", [
    "CREATOR",
    "ENROLLED_USER",
    "VISITOR",
]);

export const projectErrorSeverityEnum = pgEnum("ProjectErrorSeverity", [
    "HIGH",
    "MEDIUM",
    "LOW",
]);

export const projectErrorCategoryEnum = pgEnum("ProjectErrorCategory", [
    "SETUP",
    "CONFIGURATION",
    "DATABASE",
    "API",
    "UI",
    "STATE",
    "DEPLOYMENT",
    "SECURITY",
    "PERFORMANCE",
    "OTHER",
]);

export const projectErrorStatusEnum = pgEnum("ProjectErrorStatus", [
    "PENDING",
    "APPROVED",
    "REJECTED",
]);

export const projectIdeaStatusEnum = pgEnum("ProjectIdeaStatus", [
    "PENDING",
    "APPROVED",
    "REJECTED",
]);

export const ideaTypeEnum = pgEnum("IdeaType", [
    "PROBLEM_STATEMENT",
    "TECHNOLOGY_SPECIFIC",
]);

export const taskAssessmentTypeEnum = pgEnum("TaskAssessmentType", [
    "QUIZ",
    "CODE",
    "NONE",
]);

export const mockSessionTypeEnum = pgEnum("MockSessionType", [
    "PROJECT_FINAL",
    "SPRINT_REVIEW",
]);

export const projectV2MemberRoleEnum = pgEnum("ProjectV2MemberRole", [
    "ADMIN",
    "MEMBER",
]);

export const projectV2InvitationStatusEnum = pgEnum("ProjectV2InvitationStatus", [
    "PENDING",
    "ACCEPTED",
    "DECLINED",
    "EXPIRED",
]);

export const sprintSuggestionStatusEnum = pgEnum("SprintSuggestionStatus", [
    "PENDING",
    "APPROVED",
    "REJECTED",
]);

// ===========================
// Tables
// ===========================

export const projectCategories = pgTable(
    "ProjectCategory",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        slug: text("slug").notNull().unique(),
        name: text("name").notNull(),
        description: text("description").notNull(),
        icon: text("icon").notNull(),
        color: text("color").notNull(),
        orderIndex: integer("orderIndex").notNull().default(0),
        isActive: boolean("isActive").notNull().default(true),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_projectCategory_slug").on(table.slug),
        index("idx_projectCategory_orderIndex").on(table.orderIndex),
        index("idx_projectCategory_isActive").on(table.isActive),
    ],
);

export const projectTechnologies = pgTable(
    "ProjectTechnology",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        slug: text("slug").notNull().unique(),
        name: text("name").notNull(),
        description: text("description").notNull(),
        icon: text("icon").notNull(),
        color: text("color").notNull(),
        learningOutcomes: text("learningOutcomes").array().notNull().default([]),
        projectCount: integer("projectCount").notNull().default(0),
        orderIndex: integer("orderIndex").notNull().default(0),
        isActive: boolean("isActive").notNull().default(true),
        categoryId: text("categoryId").notNull().references(() => projectCategories.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_projectTechnology_categoryId").on(table.categoryId),
        index("idx_projectTechnology_slug").on(table.slug),
        index("idx_projectTechnology_orderIndex").on(table.orderIndex),
        index("idx_projectTechnology_isActive").on(table.isActive),
    ],
);

export const projectsV2 = pgTable(
    "ProjectV2",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        slug: text("slug").notNull().unique(),
        title: text("title").notNull(),
        shortDescription: varchar("shortDescription", { length: 200 }),
        description: text("description").notNull(),
        technologies: text("technologies").array().notNull().default([]),
        generationType: text("generationType").notNull(),
        primaryLanguageOrFramework: text("primaryLanguageOrFramework"),
        difficulty: projectV2DifficultyEnum("difficulty").notNull(),
        visibility: projectV2VisibilityEnum("visibility").notNull().default("PRIVATE"),
        estimatedHours: integer("estimatedHours").notNull().default(20),
        includeAssessment: boolean("includeAssessment").notNull().default(false),
        isPlatformSeeded: boolean("isPlatformSeeded").notNull().default(false),
        projectSource: text("projectSource").notNull().default("AI_GENERATED"),
        guidedModeEnabled: boolean("guidedModeEnabled").notNull().default(true),
        blueprintOverview: text("blueprintOverview").notNull(),
        vision: text("vision"),
        targetAudience: text("targetAudience"),
        problemSolution: text("problemSolution"),
        estimatedDuration: text("estimatedDuration"),
        keyOutcomes: text("keyOutcomes").array().notNull().default([]),
        recruiterSignal: text("recruiterSignal"),
        features: jsonb("features"),
        technicalRequirements: jsonb("technicalRequirements"),
        dataArchitecture: jsonb("dataArchitecture"),
        projectStructure: jsonb("projectStructure"),
        setupGuide: jsonb("setupGuide"),
        stacks: jsonb("stacks").notNull(),
        assistantEcho: jsonb("assistantEcho").notNull(),
        assistantRaw: jsonb("assistantRaw").notNull(),
        totalStarted: integer("totalStarted").notNull().default(0),
        totalCompleted: integer("totalCompleted").notNull().default(0),
        totalSubmissions: integer("totalSubmissions").notNull().default(0),
        totalViews: integer("totalViews").notNull().default(0),
        createdBy: text("createdBy").notNull().references(() => users.id, { onDelete: "cascade" }),
        isUniversityProject: boolean("isUniversityProject").notNull().default(false),
        universityId: text("universityId"),
        teacherMemberId: text("teacherMemberId"),
        classIds: text("classIds").array().notNull().default([]),
        assignmentDeadline: timestamp("assignmentDeadline"),
        assignmentCredits: integer("assignmentCredits"),
        assignmentInstructions: text("assignmentInstructions"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_projectV2_createdBy").on(table.createdBy),
        index("idx_projectV2_visibility").on(table.visibility),
        index("idx_projectV2_difficulty").on(table.difficulty),
        index("idx_projectV2_createdAt").on(table.createdAt),
        index("idx_projectV2_slug").on(table.slug),
        index("idx_projectV2_isPlatformSeeded").on(table.isPlatformSeeded),
        index("idx_projectV2_projectSource").on(table.projectSource),
        index("idx_projectV2_universityId").on(table.universityId),
        index("idx_projectV2_isUniversityProject").on(table.isUniversityProject),
    ],
);

export const projectV2Pages = pgTable(
    "ProjectV2Page",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        projectId: text("projectId").notNull().references(() => projectsV2.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        difficulty: projectV2DifficultyEnum("difficulty").notNull(),
        coreFeatures: text("coreFeatures").array().notNull().default([]),
        recommendedComponents: text("recommendedComponents").array().notNull().default([]),
        orderIndex: integer("orderIndex").notNull().default(0),
        route: text("route"),
        purpose: text("purpose"),
        estimatedTime: text("estimatedTime"),
        layout: jsonb("layout"),
        components: jsonb("components"),
        userInteractions: text("userInteractions").array().notNull().default([]),
        dataNeeded: text("dataNeeded").array().notNull().default([]),
    },
    (table) => [
        index("idx_projectV2Page_projectId").on(table.projectId),
        index("idx_projectV2Page_orderIndex").on(table.orderIndex),
    ],
);

export const projectV2Sprints = pgTable(
    "ProjectV2Sprint",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        projectId: text("projectId").notNull().references(() => projectsV2.id, { onDelete: "cascade" }),
        sprintNumber: integer("sprintNumber").notNull(),
        name: text("name").notNull(),
        goal: text("goal").notNull(),
        duration: text("duration").notNull(),
        orderIndex: integer("orderIndex").notNull().default(0),
        createdBy: text("createdBy").references(() => users.id),
        isApproved: boolean("isApproved").notNull().default(true),
        isPersonal: boolean("isPersonal").notNull().default(false),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_projectV2Sprint_projectId_sprintNumber").on(table.projectId, table.sprintNumber),
        index("idx_projectV2Sprint_projectId").on(table.projectId),
        index("idx_projectV2Sprint_orderIndex").on(table.orderIndex),
        index("idx_projectV2Sprint_projectId_orderIndex").on(table.projectId, table.orderIndex),
        index("idx_projectV2Sprint_createdBy").on(table.createdBy),
    ],
);

export const projectV2Tasks = pgTable(
    "ProjectV2Task",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        sprintId: text("sprintId").notNull().references(() => projectV2Sprints.id, { onDelete: "cascade" }),
        title: text("title").notNull(),
        description: text("description").array().notNull().default([]),
        criteria: text("criteria").array().notNull().default([]),
        hints: text("hints").array().notNull().default([]),
        badges: text("badges").array().notNull().default([]),
        tags: text("tags").array().notNull().default([]),
        difficulty: projectV2DifficultyEnum("difficulty").notNull(),
        orderIndex: integer("orderIndex").notNull().default(0),
        terminalCommand: text("terminalCommand"),
        category: text("category"),
        estimatedTime: text("estimatedTime"),
        checkpoints: text("checkpoints").array().notNull().default([]),
        relatedPages: text("relatedPages").array().notNull().default([]),
        dependencies: text("dependencies").array().notNull().default([]),
        learningObjectives: text("learningObjectives").array().notNull().default([]),
        prerequisites: text("prerequisites").array().notNull().default([]),
        resources: jsonb("resources"),
        testingGuidelines: text("testingGuidelines").array().notNull().default([]),
        learns: jsonb("Learns"),
        assessmentType: taskAssessmentTypeEnum("assessmentType").notNull().default("QUIZ"),
        projectV2Id: text("projectV2Id").references(() => projectsV2.id),
        createdBy: text("createdBy"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_projectV2Task_sprintId").on(table.sprintId),
        index("idx_projectV2Task_orderIndex").on(table.orderIndex),
        index("idx_projectV2Task_difficulty").on(table.difficulty),
        index("idx_projectV2Task_category").on(table.category),
        index("idx_projectV2Task_sprintId_orderIndex").on(table.sprintId, table.orderIndex),
        index("idx_projectV2Task_assessmentType").on(table.assessmentType),
    ],
);

export const userProjectV2Progress = pgTable(
    "UserProjectV2Progress",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        projectId: text("projectId").notNull().references(() => projectsV2.id, { onDelete: "cascade" }),
        status: userProjectV2StatusEnum("status").notNull().default("NOT_STARTED"),
        tasksCompleted: integer("tasksCompleted").notNull().default(0),
        totalTasks: integer("totalTasks").notNull().default(0),
        progressPercentage: real("progressPercentage").notNull().default(0),
        totalScore: real("totalScore").notNull().default(0),
        tasksScore: real("tasksScore").notNull().default(0),
        quizScore: real("quizScore").notNull().default(0),
        mockScore: real("mockScore").notNull().default(0),
        startedAt: timestamp("startedAt"),
        submittedAt: timestamp("submittedAt"),
        completedAt: timestamp("completedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_userProjectV2Progress_userId_projectId").on(table.userId, table.projectId),
        index("idx_userProjectV2Progress_userId").on(table.userId),
        index("idx_userProjectV2Progress_projectId").on(table.projectId),
        index("idx_userProjectV2Progress_status").on(table.status),
        index("idx_userProjectV2Progress_totalScore").on(table.totalScore),
    ],
);

export const userTaskV2Statuses = pgTable(
    "UserTaskV2Status",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        projectId: text("projectId").notNull().references(() => projectsV2.id, { onDelete: "cascade" }),
        taskId: text("taskId").notNull().references(() => projectV2Tasks.id, { onDelete: "cascade" }),
        progressId: text("progressId").notNull().references(() => userProjectV2Progress.id, { onDelete: "cascade" }),
        status: taskKanbanStatusEnum("status").notNull().default("TO_DO"),
        completedAt: timestamp("completedAt"),
        notes: text("notes"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_userTaskV2Status_userId_taskId").on(table.userId, table.taskId),
        index("idx_userTaskV2Status_userId").on(table.userId),
        index("idx_userTaskV2Status_taskId").on(table.taskId),
        index("idx_userTaskV2Status_projectId").on(table.projectId),
        index("idx_userTaskV2Status_progressId").on(table.progressId),
        index("idx_userTaskV2Status_status").on(table.status),
    ],
);

export const projectV2Quizzes = pgTable(
    "ProjectV2Quiz",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        projectId: text("projectId").notNull().unique().references(() => projectsV2.id, { onDelete: "cascade" }),
        totalQuestions: integer("totalQuestions").notNull(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
);

export const projectV2QuizQuestions = pgTable(
    "ProjectV2QuizQuestion",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        quizId: text("quizId").notNull().references(() => projectV2Quizzes.id, { onDelete: "cascade" }),
        orderIndex: integer("orderIndex").notNull().default(0),
        difficulty: quizV2DifficultyEnum("difficulty").notNull(),
        prompt: text("prompt").notNull(),
        options: text("options").array().notNull().default([]),
        correctAnswer: integer("correctAnswer").notNull(),
        explanation: text("explanation").notNull(),
    },
    (table) => [
        index("idx_projectV2QuizQuestion_quizId").on(table.quizId),
        index("idx_projectV2QuizQuestion_orderIndex").on(table.orderIndex),
        index("idx_projectV2QuizQuestion_difficulty").on(table.difficulty),
    ],
);

export const projectV2KnowledgeBases = pgTable(
    "ProjectV2KnowledgeBase",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        projectId: text("projectId").notNull().unique().references(() => projectsV2.id, { onDelete: "cascade" }),
        points: text("points").array().notNull().default([]),
        mockKnowledgeBase: text("mockKnowledgeBase"),
        mockQuestionsData: jsonb("mockQuestionsData"),
        mockGeneratedAt: timestamp("mockGeneratedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
);

export const projectV2Submissions = pgTable(
    "ProjectV2Submission",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        projectId: text("projectId").notNull().references(() => projectsV2.id, { onDelete: "cascade" }),
        githubUrl: text("githubUrl").notNull(),
        liveUrl: text("liveUrl"),
        notes: text("notes"),
        status: text("status").notNull().default("PENDING"),
        scores: jsonb("scores"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_projectV2Submission_userId").on(table.userId),
        index("idx_projectV2Submission_projectId").on(table.projectId),
        index("idx_projectV2Submission_status").on(table.status),
    ],
);

export const projectV2QuizAttempts = pgTable(
    "ProjectV2QuizAttempt",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        projectId: text("projectId").notNull().references(() => projectsV2.id, { onDelete: "cascade" }),
        quizId: text("quizId").notNull().references(() => projectV2Quizzes.id, { onDelete: "cascade" }),
        score: integer("score").notNull().default(0),
        totalQuestions: integer("totalQuestions").notNull().default(0),
        correctAnswers: integer("correctAnswers").notNull().default(0),
        timeSpent: integer("timeSpent"),
        isCompleted: boolean("isCompleted").notNull().default(false),
        startedAt: timestamp("startedAt").notNull().defaultNow(),
        completedAt: timestamp("completedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_projectV2QuizAttempt_userId_quizId").on(table.userId, table.quizId),
        index("idx_projectV2QuizAttempt_userId").on(table.userId),
        index("idx_projectV2QuizAttempt_projectId").on(table.projectId),
        index("idx_projectV2QuizAttempt_quizId").on(table.quizId),
        index("idx_projectV2QuizAttempt_isCompleted").on(table.isCompleted),
    ],
);

export const projectV2QuizAnswers = pgTable(
    "ProjectV2QuizAnswer",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        attemptId: text("attemptId").notNull().references(() => projectV2QuizAttempts.id, { onDelete: "cascade" }),
        questionId: text("questionId").notNull().references(() => projectV2QuizQuestions.id, { onDelete: "cascade" }),
        selectedAnswer: integer("selectedAnswer").notNull(),
        isCorrect: boolean("isCorrect").notNull().default(false),
        timeSpent: integer("timeSpent"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_projectV2QuizAnswer_attemptId_questionId").on(table.attemptId, table.questionId),
        index("idx_projectV2QuizAnswer_attemptId").on(table.attemptId),
        index("idx_projectV2QuizAnswer_questionId").on(table.questionId),
        index("idx_projectV2QuizAnswer_isCorrect").on(table.isCorrect),
    ],
);

export const projectV2MockSessions = pgTable(
    "ProjectV2MockSession",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        projectId: text("projectId").notNull().references(() => projectsV2.id, { onDelete: "cascade" }),
        sessionType: mockSessionTypeEnum("sessionType").notNull().default("PROJECT_FINAL"),
        sprintId: text("sprintId").references(() => projectV2Sprints.id, { onDelete: "cascade" }),
        agentId: text("agentId"),
        conversationId: text("conversationId"),
        duration: integer("duration"),
        score: integer("score"),
        technicalScore: integer("technicalScore"),
        communicationScore: integer("communicationScore"),
        learnualScore: integer("LearnualScore"),
        transcript: text("transcript"),
        feedback: text("feedback"),
        strengths: text("strengths").array().notNull().default([]),
        improvements: text("improvements").array().notNull().default([]),
        status: text("status").notNull().default("SCHEDULED"),
        scheduledAt: timestamp("scheduledAt"),
        startedAt: timestamp("startedAt"),
        completedAt: timestamp("completedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_projectV2MockSession_userId").on(table.userId),
        index("idx_projectV2MockSession_projectId").on(table.projectId),
        index("idx_projectV2MockSession_sprintId").on(table.sprintId),
        index("idx_projectV2MockSession_status").on(table.status),
        index("idx_projectV2MockSession_completedAt").on(table.completedAt),
        index("idx_projectV2MockSession_sessionType").on(table.sessionType),
    ],
);

export const userTaskV2Assessments = pgTable(
    "UserTaskV2Assessment",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        taskId: text("taskId").notNull().references(() => projectV2Tasks.id, { onDelete: "cascade" }),
        assessmentType: taskAssessmentTypeEnum("assessmentType").notNull(),
        quizQuestions: jsonb("quizQuestions"),
        quizAnswers: jsonb("quizAnswers"),
        quizScore: integer("quizScore"),
        correctAnswers: integer("correctAnswers").notNull().default(0),
        totalQuestions: integer("totalQuestions").notNull().default(0),
        codeSubmission: text("codeSubmission"),
        codeLanguage: text("codeLanguage"),
        codeValidation: jsonb("codeValidation"),
        codeScore: integer("codeScore"),
        passed: boolean("passed").notNull().default(false),
        attempts: integer("attempts").notNull().default(1),
        timeSpent: integer("timeSpent"),
        startedAt: timestamp("startedAt").notNull().defaultNow(),
        completedAt: timestamp("completedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_userTaskV2Assessment_userId_taskId").on(table.userId, table.taskId),
        index("idx_userTaskV2Assessment_userId").on(table.userId),
        index("idx_userTaskV2Assessment_taskId").on(table.taskId),
        index("idx_userTaskV2Assessment_assessmentType").on(table.assessmentType),
        index("idx_userTaskV2Assessment_passed").on(table.passed),
    ],
);

export const projectV2FeatureSuggestions = pgTable(
    "ProjectV2FeatureSuggestion",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        projectId: text("projectId").notNull().references(() => projectsV2.id, { onDelete: "cascade" }),
        title: text("title").notNull(),
        description: text("description").notNull(),
        type: featureSuggestionTypeEnum("type").notNull().default("FEATURE"),
        tags: text("tags").array().notNull().default([]),
        imageUrl: text("imageUrl"),
        status: featureSuggestionStatusEnum("status").notNull().default("PENDING"),
        suggestedBy: suggestionSourceEnum("suggestedBy").notNull().default("VISITOR"),
        addedByUsers: text("addedByUsers").array().notNull().default([]),
        addedToTasks: boolean("addedToTasks").notNull().default(false),
        taskId: text("taskId"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_projectV2FeatureSuggestion_userId").on(table.userId),
        index("idx_projectV2FeatureSuggestion_projectId").on(table.projectId),
        index("idx_projectV2FeatureSuggestion_status").on(table.status),
        index("idx_projectV2FeatureSuggestion_type").on(table.type),
        index("idx_projectV2FeatureSuggestion_suggestedBy").on(table.suggestedBy),
        index("idx_projectV2FeatureSuggestion_createdAt").on(table.createdAt),
    ],
);

export const projectV2Resources = pgTable(
    "ProjectV2Resource",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        projectId: text("projectId").notNull().references(() => projectsV2.id, { onDelete: "cascade" }),
        title: varchar("title", { length: 200 }).notNull(),
        link: text("link").notNull(),
        type: resourceTypeEnum("type").notNull(),
        description: text("description"),
        helpfulCount: integer("helpfulCount").notNull().default(0),
        markedHelpfulBy: text("markedHelpfulBy").array().notNull().default([]),
        views: integer("views").notNull().default(0),
        isOfficial: boolean("isOfficial").notNull().default(false),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_projectV2Resource_userId").on(table.userId),
        index("idx_projectV2Resource_projectId").on(table.projectId),
        index("idx_projectV2Resource_type").on(table.type),
        index("idx_projectV2Resource_createdAt").on(table.createdAt),
        index("idx_projectV2Resource_helpfulCount").on(table.helpfulCount),
    ],
);

export const projectV2Leaderboards = pgTable(
    "ProjectV2Leaderboard",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        projectId: text("projectId").notNull().references(() => projectsV2.id, { onDelete: "cascade" }),
        rank: integer("rank").notNull(),
        score: real("score").notNull(),
        tasksCompleted: integer("tasksCompleted").notNull().default(0),
        totalTasks: integer("totalTasks").notNull().default(0),
        progressPercent: real("progressPercent").notNull().default(0),
        tasksScore: real("tasksScore").notNull().default(0),
        quizScore: real("quizScore").notNull().default(0),
        mockScore: real("mockScore").notNull().default(0),
        lastUpdated: timestamp("lastUpdated").notNull().defaultNow(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_projectV2Leaderboard_userId_projectId").on(table.userId, table.projectId),
        index("idx_projectV2Leaderboard_projectId_rank").on(table.projectId, table.rank),
        index("idx_projectV2Leaderboard_projectId_score").on(table.projectId, table.score),
        index("idx_projectV2Leaderboard_userId").on(table.userId),
    ],
);

export const projectV2GlobalLeaderboards = pgTable(
    "ProjectV2GlobalLeaderboard",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
        rank: integer("rank").notNull(),
        totalScore: real("totalScore").notNull().default(0),
        projectsStarted: integer("projectsStarted").notNull().default(0),
        projectsCompleted: integer("projectsCompleted").notNull().default(0),
        averageScore: real("averageScore").notNull().default(0),
        totalTasksCompleted: integer("totalTasksCompleted").notNull().default(0),
        totalQuizzesCompleted: integer("totalQuizzesCompleted").notNull().default(0),
        totalMocksCompleted: integer("totalMocksCompleted").notNull().default(0),
        lastUpdated: timestamp("lastUpdated").notNull().defaultNow(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_projectV2GlobalLeaderboard_rank").on(table.rank),
        index("idx_projectV2GlobalLeaderboard_totalScore").on(table.totalScore),
        index("idx_projectV2GlobalLeaderboard_averageScore").on(table.averageScore),
    ],
);

export const projectV2TaskDetails = pgTable(
    "ProjectV2TaskDetail",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        taskId: text("taskId").notNull().unique().references(() => projectV2Tasks.id, { onDelete: "cascade" }),
        subTasks: jsonb("subTasks").notNull(),
        commonErrors: text("commonErrors").array().notNull().default([]),
        errorsToWatchout: text("errorsToWatchout").array().notNull().default([]),
        relatedTasks: jsonb("relatedTasks").notNull(),
        generatedBy: text("generatedBy").notNull(),
        generatedAt: timestamp("generatedAt").notNull().defaultNow(),
        generationCost: integer("generationCost").notNull().default(1),
        accessCount: integer("accessCount").notNull().default(1),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_projectV2TaskDetail_taskId").on(table.taskId),
    ],
);

export const userTaskV2DetailAccesses = pgTable(
    "UserTaskV2DetailAccess",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        taskDetailId: text("taskDetailId").notNull().references(() => projectV2TaskDetails.id, { onDelete: "cascade" }),
        creditsPaid: integer("creditsPaid").notNull().default(1),
        accessedAt: timestamp("accessedAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_userTaskV2DetailAccess_userId_taskDetailId").on(table.userId, table.taskDetailId),
        index("idx_userTaskV2DetailAccess_userId").on(table.userId),
        index("idx_userTaskV2DetailAccess_taskDetailId").on(table.taskDetailId),
    ],
);

export const projectV2StandupConfigs = pgTable(
    "ProjectV2StandupConfig",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull(),
        projectId: text("projectId").notNull().references(() => projectsV2.id, { onDelete: "cascade" }),
        daysPerWeek: integer("daysPerWeek").notNull(),
        standupTime: text("standupTime").notNull(),
        durationMinutes: integer("durationMinutes").notNull().default(10),
        selectedDays: integer("selectedDays").array().notNull().default([]),
        creditsPerDay: integer("creditsPerDay").notNull().default(5),
        weeklyCredits: integer("weeklyCredits").notNull(),
        isActive: boolean("isActive").notNull().default(true),
        currentWeekStart: timestamp("currentWeekStart").notNull().defaultNow(),
        currentWeekEnd: timestamp("currentWeekEnd").notNull(),
        totalStandups: integer("totalStandups").notNull().default(0),
        completedStandups: integer("completedStandups").notNull().default(0),
        missedStandups: integer("missedStandups").notNull().default(0),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_projectV2StandupConfig_userId_projectId").on(table.userId, table.projectId),
        index("idx_projectV2StandupConfig_userId").on(table.userId),
        index("idx_projectV2StandupConfig_projectId").on(table.projectId),
        index("idx_projectV2StandupConfig_isActive").on(table.isActive),
    ],
);

export const projectV2StandupEntries = pgTable(
    "ProjectV2StandupEntry",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        configId: text("configId").notNull().references(() => projectV2StandupConfigs.id, { onDelete: "cascade" }),
        scheduledFor: timestamp("scheduledFor").notNull(),
        submittedAt: timestamp("submittedAt"),
        whatDidYesterday: text("whatDidYesterday"),
        whatDoingToday: text("whatDoingToday"),
        anyBlockers: text("anyBlockers"),
        recordingUrl: text("recordingUrl"),
        durationSeconds: integer("durationSeconds"),
        status: text("status").notNull().default("SCHEDULED"),
        aiSummary: text("aiSummary"),
        aiSuggestions: text("aiSuggestions").array().notNull().default([]),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_projectV2StandupEntry_configId").on(table.configId),
        index("idx_projectV2StandupEntry_scheduledFor").on(table.scheduledFor),
        index("idx_projectV2StandupEntry_status").on(table.status),
    ],
);

export const projectIdeas = pgTable(
    "ProjectIdea",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        projectTitle: text("projectTitle").notNull(),
        projectDescription: text("projectDescription").notNull(),
        generationType: text("generationType").notNull(),
        difficulty: text("difficulty").notNull(),
        primaryLanguageOrFramework: text("primaryLanguageOrFramework"),
        technologies: text("technologies").array().notNull().default([]),
        categories: text("categories").array().notNull().default([]),
        technology: text("technology"),
        ideaType: ideaTypeEnum("ideaType").notNull().default("TECHNOLOGY_SPECIFIC"),
        overview: text("overview"),
        coreRequirements: text("coreRequirements").array().notNull().default([]),
        engineeringConstraints: text("engineeringConstraints").array().notNull().default([]),
        suggestedStacks: jsonb("suggestedStacks"),
        recruiterSignal: text("recruiterSignal"),
        isPlatformCurated: boolean("isPlatformCurated").notNull().default(false),
        curatedQuality: text("curatedQuality"),
        buildCount: integer("buildCount").notNull().default(0),
        images: text("images").array().notNull().default([]),
        figmaLinks: text("figmaLinks").array().notNull().default([]),
        resourceLinks: text("resourceLinks").array().notNull().default([]),
        stacks: jsonb("stacks"),
        blueprintProjectId: text("blueprintProjectId").unique().references(() => projectsV2.id),
        hasBlueprintGenerated: boolean("hasBlueprintGenerated").notNull().default(false),
        blueprintGeneratedAt: timestamp("blueprintGeneratedAt"),
        status: projectIdeaStatusEnum("status").notNull().default("PENDING"),
        submittedById: text("submittedById").references(() => users.id),
        isUserSubmitted: boolean("isUserSubmitted").notNull().default(false),
        upvotes: integer("upvotes").notNull().default(0),
        views: integer("views").notNull().default(0),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
        approvedAt: timestamp("approvedAt"),
    },
    (table) => [
        index("idx_projectIdea_technology").on(table.technology),
        index("idx_projectIdea_status").on(table.status),
        index("idx_projectIdea_difficulty").on(table.difficulty),
        index("idx_projectIdea_submittedById").on(table.submittedById),
        index("idx_projectIdea_createdAt").on(table.createdAt),
        index("idx_projectIdea_upvotes").on(table.upvotes),
        index("idx_projectIdea_hasBlueprintGenerated").on(table.hasBlueprintGenerated),
        index("idx_projectIdea_ideaType").on(table.ideaType),
        index("idx_projectIdea_isPlatformCurated").on(table.isPlatformCurated),
    ],
);

export const projectIdeaUpvotes = pgTable(
    "ProjectIdeaUpvote",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        projectIdeaId: text("projectIdeaId").notNull().references(() => projectIdeas.id, { onDelete: "cascade" }),
        userId: text("userId").notNull(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_projectIdeaUpvote_projectIdeaId_userId").on(table.projectIdeaId, table.userId),
        index("idx_projectIdeaUpvote_projectIdeaId").on(table.projectIdeaId),
        index("idx_projectIdeaUpvote_userId").on(table.userId),
    ],
);

export const projectV2Errors = pgTable(
    "ProjectV2Error",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        projectId: text("projectId").notNull().references(() => projectsV2.id, { onDelete: "cascade" }),
        title: varchar("title", { length: 200 }).notNull(),
        description: text("description").notNull(),
        solution: text("solution").notNull(),
        severity: projectErrorSeverityEnum("severity").notNull().default("MEDIUM"),
        category: projectErrorCategoryEnum("category").notNull().default("OTHER"),
        taskId: text("taskId").references(() => projectV2Tasks.id, { onDelete: "set null" }),
        errorCode: text("errorCode"),
        fixedCode: text("fixedCode"),
        tags: text("tags").array().notNull().default([]),
        status: projectErrorStatusEnum("status").notNull().default("PENDING"),
        submittedById: text("submittedById").notNull().references(() => users.id, { onDelete: "cascade" }),
        isAIGenerated: boolean("isAIGenerated").notNull().default(false),
        helpfulCount: integer("helpfulCount").notNull().default(0),
        encounteredCount: integer("encounteredCount").notNull().default(0),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
        approvedAt: timestamp("approvedAt"),
    },
    (table) => [
        index("idx_projectV2Error_projectId").on(table.projectId),
        index("idx_projectV2Error_taskId").on(table.taskId),
        index("idx_projectV2Error_severity").on(table.severity),
        index("idx_projectV2Error_category").on(table.category),
        index("idx_projectV2Error_status").on(table.status),
        index("idx_projectV2Error_submittedById").on(table.submittedById),
        index("idx_projectV2Error_helpfulCount").on(table.helpfulCount),
        index("idx_projectV2Error_createdAt").on(table.createdAt),
    ],
);

export const projectV2ErrorVotes = pgTable(
    "ProjectV2ErrorVote",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        errorId: text("errorId").notNull().references(() => projectV2Errors.id, { onDelete: "cascade" }),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        voteType: text("voteType").notNull(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_projectV2ErrorVote_errorId_userId_voteType").on(table.errorId, table.userId, table.voteType),
        index("idx_projectV2ErrorVote_errorId").on(table.errorId),
        index("idx_projectV2ErrorVote_userId").on(table.userId),
    ],
);

export const projectV2Members = pgTable(
    "ProjectV2Member",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        projectId: text("projectId").notNull().references(() => projectsV2.id, { onDelete: "cascade" }),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        role: projectV2MemberRoleEnum("role").notNull().default("MEMBER"),
        joinedAt: timestamp("joinedAt").notNull().defaultNow(),
        invitedBy: text("invitedBy"),
    },
    (table) => [
        uniqueIndex("uq_projectV2Member_projectId_userId").on(table.projectId, table.userId),
        index("idx_projectV2Member_projectId").on(table.projectId),
        index("idx_projectV2Member_userId").on(table.userId),
    ],
);

export const projectV2SprintSuggestions = pgTable(
    "ProjectV2SprintSuggestion",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        projectId: text("projectId").notNull().references(() => projectsV2.id, { onDelete: "cascade" }),
        suggestedById: text("suggestedById").notNull().references(() => users.id, { onDelete: "cascade" }),
        sprintNumber: integer("sprintNumber").notNull(),
        name: text("name").notNull(),
        goal: text("goal").notNull(),
        duration: text("duration").notNull(),
        suggestedTasks: jsonb("suggestedTasks"),
        status: sprintSuggestionStatusEnum("status").notNull().default("PENDING"),
        reviewedById: text("reviewedById").references(() => users.id, { onDelete: "set null" }),
        reviewedAt: timestamp("reviewedAt"),
        reviewNote: text("reviewNote"),
        createdSprintId: text("createdSprintId"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_projectV2SprintSuggestion_projectId").on(table.projectId),
        index("idx_projectV2SprintSuggestion_suggestedById").on(table.suggestedById),
        index("idx_projectV2SprintSuggestion_status").on(table.status),
    ],
);

export const projectV2Invitations = pgTable(
    "ProjectV2Invitation",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        projectId: text("projectId").notNull().references(() => projectsV2.id, { onDelete: "cascade" }),
        invitedUserId: text("invitedUserId").references(() => users.id, { onDelete: "cascade" }),
        invitedEmail: text("invitedEmail"),
        invitedById: text("invitedById").notNull().references(() => users.id, { onDelete: "cascade" }),
        role: projectV2MemberRoleEnum("role").notNull().default("MEMBER"),
        status: projectV2InvitationStatusEnum("status").notNull().default("PENDING"),
        inviteToken: text("inviteToken").unique(),
        expiresAt: timestamp("expiresAt"),
        respondedAt: timestamp("respondedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_projectV2Invitation_projectId_invitedUserId").on(table.projectId, table.invitedUserId),
        uniqueIndex("uq_projectV2Invitation_projectId_invitedEmail").on(table.projectId, table.invitedEmail),
        index("idx_projectV2Invitation_projectId").on(table.projectId),
        index("idx_projectV2Invitation_invitedUserId").on(table.invitedUserId),
        index("idx_projectV2Invitation_invitedEmail").on(table.invitedEmail),
        index("idx_projectV2Invitation_inviteToken").on(table.inviteToken),
        index("idx_projectV2Invitation_status").on(table.status),
    ],
);

export const projectV2GuidedSessions = pgTable(
    "ProjectV2GuidedSession",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        projectId: text("projectId").notNull().references(() => projectsV2.id, { onDelete: "cascade" }),
        currentSprintIndex: integer("currentSprintIndex").notNull().default(0),
        currentTaskIndex: integer("currentTaskIndex").notNull().default(0),
        currentStepIndex: integer("currentStepIndex").notNull().default(0),
        conversationHistory: jsonb("conversationHistory"),
        isActive: boolean("isActive").notNull().default(true),
        mode: text("mode").notNull().default("GUIDED"),
        systemContext: text("systemContext"),
        startedAt: timestamp("startedAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_projectV2GuidedSession_userId_projectId").on(table.userId, table.projectId),
        index("idx_projectV2GuidedSession_userId").on(table.userId),
        index("idx_projectV2GuidedSession_projectId").on(table.projectId),
        index("idx_projectV2GuidedSession_isActive").on(table.isActive),
    ],
);

// ===========================
// Relations
// ===========================

export const projectCategoriesRelations = relations(projectCategories, ({ many }) => ({
    technologies: many(projectTechnologies),
}));

export const projectTechnologiesRelations = relations(projectTechnologies, ({ one }) => ({
    category: one(projectCategories, {
        fields: [projectTechnologies.categoryId],
        references: [projectCategories.id],
    }),
}));

export const projectsV2Relations = relations(projectsV2, ({ one, many }) => ({
    creator: one(users, {
        fields: [projectsV2.createdBy],
        references: [users.id],
    }),
    pages: many(projectV2Pages),
    sprints: many(projectV2Sprints),
    tasks: many(projectV2Tasks),
    userProgress: many(userProjectV2Progress),
    quiz: one(projectV2Quizzes),
    knowledgeBase: one(projectV2KnowledgeBases),
    submissions: many(projectV2Submissions),
    quizAttempts: many(projectV2QuizAttempts),
    mockSessions: many(projectV2MockSessions),
    featureSuggestions: many(projectV2FeatureSuggestions),
    resources: many(projectV2Resources),
    leaderboard: many(projectV2Leaderboards),
    blueprintIdea: one(projectIdeas),
    errors: many(projectV2Errors),
    members: many(projectV2Members),
    sprintSuggestions: many(projectV2SprintSuggestions),
    invitations: many(projectV2Invitations),
    guidedSessions: many(projectV2GuidedSessions),
    standupConfigs: many(projectV2StandupConfigs),
}));

export const projectV2PagesRelations = relations(projectV2Pages, ({ one }) => ({
    project: one(projectsV2, {
        fields: [projectV2Pages.projectId],
        references: [projectsV2.id],
    }),
}));

export const projectV2SprintsRelations = relations(projectV2Sprints, ({ one, many }) => ({
    project: one(projectsV2, {
        fields: [projectV2Sprints.projectId],
        references: [projectsV2.id],
    }),
    creator: one(users, {
        fields: [projectV2Sprints.createdBy],
        references: [users.id],
        relationName: "SprintCreator",
    }),
    tasks: many(projectV2Tasks),
    mockSessions: many(projectV2MockSessions),
}));

export const projectV2TasksRelations = relations(projectV2Tasks, ({ one, many }) => ({
    sprint: one(projectV2Sprints, {
        fields: [projectV2Tasks.sprintId],
        references: [projectV2Sprints.id],
    }),
    projectV2: one(projectsV2, {
        fields: [projectV2Tasks.projectV2Id],
        references: [projectsV2.id],
    }),
    userStatuses: many(userTaskV2Statuses),
    assessments: many(userTaskV2Assessments),
    taskDetail: one(projectV2TaskDetails),
    errors: many(projectV2Errors),
}));

export const userProjectV2ProgressRelations = relations(userProjectV2Progress, ({ one, many }) => ({
    user: one(users, {
        fields: [userProjectV2Progress.userId],
        references: [users.id],
    }),
    project: one(projectsV2, {
        fields: [userProjectV2Progress.projectId],
        references: [projectsV2.id],
    }),
    taskStatuses: many(userTaskV2Statuses),
}));

export const userTaskV2StatusesRelations = relations(userTaskV2Statuses, ({ one }) => ({
    user: one(users, {
        fields: [userTaskV2Statuses.userId],
        references: [users.id],
    }),
    project: one(projectsV2, {
        fields: [userTaskV2Statuses.projectId],
        references: [projectsV2.id],
    }),
    task: one(projectV2Tasks, {
        fields: [userTaskV2Statuses.taskId],
        references: [projectV2Tasks.id],
    }),
    progress: one(userProjectV2Progress, {
        fields: [userTaskV2Statuses.progressId],
        references: [userProjectV2Progress.id],
    }),
}));

export const projectV2QuizzesRelations = relations(projectV2Quizzes, ({ one, many }) => ({
    project: one(projectsV2, {
        fields: [projectV2Quizzes.projectId],
        references: [projectsV2.id],
    }),
    questions: many(projectV2QuizQuestions),
    attempts: many(projectV2QuizAttempts),
}));

export const projectV2QuizQuestionsRelations = relations(projectV2QuizQuestions, ({ one, many }) => ({
    quiz: one(projectV2Quizzes, {
        fields: [projectV2QuizQuestions.quizId],
        references: [projectV2Quizzes.id],
    }),
    answers: many(projectV2QuizAnswers),
}));

export const projectV2KnowledgeBasesRelations = relations(projectV2KnowledgeBases, ({ one }) => ({
    project: one(projectsV2, {
        fields: [projectV2KnowledgeBases.projectId],
        references: [projectsV2.id],
    }),
}));

export const projectV2SubmissionsRelations = relations(projectV2Submissions, ({ one }) => ({
    user: one(users, {
        fields: [projectV2Submissions.userId],
        references: [users.id],
    }),
    project: one(projectsV2, {
        fields: [projectV2Submissions.projectId],
        references: [projectsV2.id],
    }),
}));

export const projectV2QuizAttemptsRelations = relations(projectV2QuizAttempts, ({ one, many }) => ({
    user: one(users, {
        fields: [projectV2QuizAttempts.userId],
        references: [users.id],
    }),
    project: one(projectsV2, {
        fields: [projectV2QuizAttempts.projectId],
        references: [projectsV2.id],
    }),
    quiz: one(projectV2Quizzes, {
        fields: [projectV2QuizAttempts.quizId],
        references: [projectV2Quizzes.id],
    }),
    answers: many(projectV2QuizAnswers),
}));

export const projectV2QuizAnswersRelations = relations(projectV2QuizAnswers, ({ one }) => ({
    attempt: one(projectV2QuizAttempts, {
        fields: [projectV2QuizAnswers.attemptId],
        references: [projectV2QuizAttempts.id],
    }),
    question: one(projectV2QuizQuestions, {
        fields: [projectV2QuizAnswers.questionId],
        references: [projectV2QuizQuestions.id],
    }),
}));

export const projectV2MockSessionsRelations = relations(projectV2MockSessions, ({ one }) => ({
    user: one(users, {
        fields: [projectV2MockSessions.userId],
        references: [users.id],
    }),
    project: one(projectsV2, {
        fields: [projectV2MockSessions.projectId],
        references: [projectsV2.id],
    }),
    sprint: one(projectV2Sprints, {
        fields: [projectV2MockSessions.sprintId],
        references: [projectV2Sprints.id],
    }),
}));

export const userTaskV2AssessmentsRelations = relations(userTaskV2Assessments, ({ one }) => ({
    user: one(users, {
        fields: [userTaskV2Assessments.userId],
        references: [users.id],
        relationName: "UserTaskAssessments",
    }),
    task: one(projectV2Tasks, {
        fields: [userTaskV2Assessments.taskId],
        references: [projectV2Tasks.id],
    }),
}));

export const projectV2FeatureSuggestionsRelations = relations(projectV2FeatureSuggestions, ({ one }) => ({
    user: one(users, {
        fields: [projectV2FeatureSuggestions.userId],
        references: [users.id],
    }),
    project: one(projectsV2, {
        fields: [projectV2FeatureSuggestions.projectId],
        references: [projectsV2.id],
    }),
}));

export const projectV2ResourcesRelations = relations(projectV2Resources, ({ one }) => ({
    user: one(users, {
        fields: [projectV2Resources.userId],
        references: [users.id],
        relationName: "ProjectV2Resources",
    }),
    project: one(projectsV2, {
        fields: [projectV2Resources.projectId],
        references: [projectsV2.id],
        relationName: "ProjectV2Resources",
    }),
}));

export const projectV2LeaderboardsRelations = relations(projectV2Leaderboards, ({ one }) => ({
    user: one(users, {
        fields: [projectV2Leaderboards.userId],
        references: [users.id],
        relationName: "ProjectV2Leaderboard",
    }),
    project: one(projectsV2, {
        fields: [projectV2Leaderboards.projectId],
        references: [projectsV2.id],
        relationName: "ProjectV2Leaderboard",
    }),
}));

export const projectV2GlobalLeaderboardsRelations = relations(projectV2GlobalLeaderboards, ({ one }) => ({
    user: one(users, {
        fields: [projectV2GlobalLeaderboards.userId],
        references: [users.id],
        relationName: "ProjectV2GlobalLeaderboard",
    }),
}));

export const projectV2TaskDetailsRelations = relations(projectV2TaskDetails, ({ one, many }) => ({
    task: one(projectV2Tasks, {
        fields: [projectV2TaskDetails.taskId],
        references: [projectV2Tasks.id],
    }),
    accesses: many(userTaskV2DetailAccesses),
}));

export const userTaskV2DetailAccessesRelations = relations(userTaskV2DetailAccesses, ({ one }) => ({
    user: one(users, {
        fields: [userTaskV2DetailAccesses.userId],
        references: [users.id],
        relationName: "UserTaskDetailAccess",
    }),
    taskDetail: one(projectV2TaskDetails, {
        fields: [userTaskV2DetailAccesses.taskDetailId],
        references: [projectV2TaskDetails.id],
    }),
}));

export const projectV2StandupConfigsRelations = relations(projectV2StandupConfigs, ({ one, many }) => ({
    project: one(projectsV2, {
        fields: [projectV2StandupConfigs.projectId],
        references: [projectsV2.id],
    }),
    entries: many(projectV2StandupEntries),
}));

export const projectV2StandupEntriesRelations = relations(projectV2StandupEntries, ({ one }) => ({
    config: one(projectV2StandupConfigs, {
        fields: [projectV2StandupEntries.configId],
        references: [projectV2StandupConfigs.id],
    }),
}));

export const projectIdeasRelations = relations(projectIdeas, ({ one, many }) => ({
    submittedBy: one(users, {
        fields: [projectIdeas.submittedById],
        references: [users.id],
        relationName: "SubmittedProjectIdeas",
    }),
    blueprintProject: one(projectsV2, {
        fields: [projectIdeas.blueprintProjectId],
        references: [projectsV2.id],
        relationName: "IdeaBlueprint",
    }),
    upvotes: many(projectIdeaUpvotes),
}));

export const projectIdeaUpvotesRelations = relations(projectIdeaUpvotes, ({ one }) => ({
    projectIdea: one(projectIdeas, {
        fields: [projectIdeaUpvotes.projectIdeaId],
        references: [projectIdeas.id],
        relationName: "ProjectIdeaUpvotes",
    }),
}));

export const projectV2ErrorsRelations = relations(projectV2Errors, ({ one, many }) => ({
    project: one(projectsV2, {
        fields: [projectV2Errors.projectId],
        references: [projectsV2.id],
        relationName: "ProjectV2Errors",
    }),
    task: one(projectV2Tasks, {
        fields: [projectV2Errors.taskId],
        references: [projectV2Tasks.id],
        relationName: "TaskErrors",
    }),
    submittedBy: one(users, {
        fields: [projectV2Errors.submittedById],
        references: [users.id],
        relationName: "SubmittedProjectErrors",
    }),
    votes: many(projectV2ErrorVotes),
}));

export const projectV2ErrorVotesRelations = relations(projectV2ErrorVotes, ({ one }) => ({
    error: one(projectV2Errors, {
        fields: [projectV2ErrorVotes.errorId],
        references: [projectV2Errors.id],
        relationName: "ProjectErrorVotes",
    }),
    user: one(users, {
        fields: [projectV2ErrorVotes.userId],
        references: [users.id],
        relationName: "ProjectErrorVotes",
    }),
}));

export const projectV2MembersRelations = relations(projectV2Members, ({ one }) => ({
    project: one(projectsV2, {
        fields: [projectV2Members.projectId],
        references: [projectsV2.id],
        relationName: "ProjectMembers",
    }),
    user: one(users, {
        fields: [projectV2Members.userId],
        references: [users.id],
        relationName: "ProjectMemberships",
    }),
}));

export const projectV2SprintSuggestionsRelations = relations(projectV2SprintSuggestions, ({ one }) => ({
    project: one(projectsV2, {
        fields: [projectV2SprintSuggestions.projectId],
        references: [projectsV2.id],
        relationName: "SprintSuggestions",
    }),
    suggestedBy: one(users, {
        fields: [projectV2SprintSuggestions.suggestedById],
        references: [users.id],
        relationName: "SprintSuggestor",
    }),
    reviewedBy: one(users, {
        fields: [projectV2SprintSuggestions.reviewedById],
        references: [users.id],
        relationName: "SprintReviewer",
    }),
}));

export const projectV2InvitationsRelations = relations(projectV2Invitations, ({ one }) => ({
    project: one(projectsV2, {
        fields: [projectV2Invitations.projectId],
        references: [projectsV2.id],
        relationName: "ProjectInvitations",
    }),
    invitedUser: one(users, {
        fields: [projectV2Invitations.invitedUserId],
        references: [users.id],
        relationName: "ReceivedProjectInvitations",
    }),
    invitedBy: one(users, {
        fields: [projectV2Invitations.invitedById],
        references: [users.id],
        relationName: "SentProjectInvitations",
    }),
}));

export const projectV2GuidedSessionsRelations = relations(projectV2GuidedSessions, ({ one }) => ({
    user: one(users, {
        fields: [projectV2GuidedSessions.userId],
        references: [users.id],
        relationName: "UserGuidedSessions",
    }),
    project: one(projectsV2, {
        fields: [projectV2GuidedSessions.projectId],
        references: [projectsV2.id],
        relationName: "ProjectGuidedSessions",
    }),
}));
