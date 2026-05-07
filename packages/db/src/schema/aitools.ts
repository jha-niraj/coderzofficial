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
import { users } from "./schema";

// ===========================
// jobInterviewAssistant
// ===========================

export const jobInterviewAssistant = pgTable(
    "JobInterviewAssistant",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        position: text("position").notNull(),
        jobDescription: text("jobDescription").notNull(),
        companyUrl: text("companyUrl").notNull(),
        companyInfo: jsonb("companyInfo"),
        generatedContent: jsonb("generatedContent").notNull(),
        includeAnswers: boolean("includeAnswers").notNull().default(false),
        includePractice: boolean("includePractice").notNull().default(false),
        searchHash: text("searchHash"),
        slug: text("slug").notNull().unique().default("niraj jha"),
        technicalCount: integer("technicalCount").notNull().default(8),
        behavioralCount: integer("behavioralCount").notNull().default(8),
        codingCount: integer("codingCount").notNull().default(3),
        isPublic: boolean("isPublic").notNull().default(false),
        publicCost: integer("publicCost"),
        description: text("description"),
        creditsCost: integer("creditsCost"),
        purchaseCount: integer("purchaseCount").notNull().default(0),
        viewCount: integer("viewCount").notNull().default(0),
        rating: real("rating"),
        tags: text("tags").array().notNull().default([]),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("jobInterviewAssistant_userId_idx").on(t.userId),
        index("jobInterviewAssistant_searchHash_idx").on(t.searchHash),
        index("jobInterviewAssistant_isPublic_idx").on(t.isPublic),
        index("jobInterviewAssistant_position_idx").on(t.position),
    ]
);

export const jobInterviewAssistantRelations = relations(jobInterviewAssistant, ({ one, many }) => ({
    user: one(users, {
        fields: [jobInterviewAssistant.userId],
        references: [users.id],
    }),
    codeEvaluations: many(codeEvaluation),
    questionAnswers: many(questionAnswer),
    userQuestionResponses: many(userQuestionResponse),
    publicInterviewPurchases: many(interviewPlanPurchase, { relationName: "PublicInterviewPurchases" }),
    purchasedInterviewPlans: many(interviewPlanPurchase, { relationName: "PurchasedInterviewPlan" }),
}));

// ===========================
// codeEvaluation
// ===========================

export const codeEvaluation = pgTable(
    "CodeEvaluation",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        questionText: text("questionText").notNull(),
        userCode: text("userCode").notNull(),
        language: text("language").notNull(),
        evaluation: jsonb("evaluation"),
        score: integer("score"),
        feedback: text("feedback"),
        strengths: text("strengths").array().notNull().default([]),
        improvements: text("improvements").array().notNull().default([]),
        isSubmitted: boolean("isSubmitted").notNull().default(false),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdateFn(() => new Date()),
        interviewId: text("interviewId").notNull().references(() => jobInterviewAssistant.id, { onDelete: "cascade" }),
    },
    (t) => [
        index("codeEvaluation_interviewId_idx").on(t.interviewId),
        index("codeEvaluation_language_idx").on(t.language),
        index("codeEvaluation_isSubmitted_idx").on(t.isSubmitted),
    ]
);

export const codeEvaluationRelations = relations(codeEvaluation, ({ one }) => ({
    interview: one(jobInterviewAssistant, {
        fields: [codeEvaluation.interviewId],
        references: [jobInterviewAssistant.id],
    }),
}));

// ===========================
// questionAnswer
// ===========================

export const questionAnswer = pgTable(
    "QuestionAnswer",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        questionText: text("questionText").notNull(),
        questionType: text("questionType").notNull(),
        language: text("language"),
        answer: jsonb("answer").notNull(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdateFn(() => new Date()),
        interviewId: text("interviewId").notNull().references(() => jobInterviewAssistant.id, { onDelete: "cascade" }),
    },
    (t) => [
        uniqueIndex("questionAnswer_interviewId_questionText_language_key").on(t.interviewId, t.questionText, t.language),
        index("questionAnswer_interviewId_idx").on(t.interviewId),
        index("questionAnswer_questionType_idx").on(t.questionType),
        index("questionAnswer_language_idx").on(t.language),
    ]
);

export const questionAnswerRelations = relations(questionAnswer, ({ one }) => ({
    interview: one(jobInterviewAssistant, {
        fields: [questionAnswer.interviewId],
        references: [jobInterviewAssistant.id],
    }),
}));

// ===========================
// userQuestionResponse
// ===========================

export const userQuestionResponse = pgTable(
    "UserQuestionResponse",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdateFn(() => new Date()),
        interviewId: text("interviewId").notNull().references(() => jobInterviewAssistant.id, { onDelete: "cascade" }),
        questionText: text("questionText").notNull(),
        questionType: text("questionType").notNull(),
        questionIndex: integer("questionIndex").notNull(),
        userAnswer: text("userAnswer").notNull(),
        answerMethod: text("answerMethod").notNull().default("text"),
        score: integer("score").notNull(),
        feedback: text("feedback").notNull(),
        strengths: text("strengths").array().notNull().default([]),
        improvements: text("improvements").array().notNull().default([]),
        comparedToExpert: jsonb("comparedToExpert").notNull(),
        evaluationDetails: jsonb("evaluationDetails"),
    },
    (t) => [
        uniqueIndex("userQuestionResponse_interviewId_questionType_questionIndex_key").on(
            t.interviewId,
            t.questionType,
            t.questionIndex
        ),
    ]
);

export const userQuestionResponseRelations = relations(userQuestionResponse, ({ one }) => ({
    interview: one(jobInterviewAssistant, {
        fields: [userQuestionResponse.interviewId],
        references: [jobInterviewAssistant.id],
    }),
}));

// ===========================
// interviewPlanPurchase
// ===========================

export const interviewPlanPurchase = pgTable("InterviewPlanPurchase", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    buyerId: text("buyerId").notNull(),
    interviewPlanId: text("interviewPlanId").notNull().references(() => jobInterviewAssistant.id),
    cost: integer("cost").notNull(),
    purchasedAt: timestamp("purchasedAt").notNull().defaultNow(),
    newInterviewPlanId: text("newInterviewPlanId").references(() => jobInterviewAssistant.id),
});

export const interviewPlanPurchaseRelations = relations(interviewPlanPurchase, ({ one }) => ({
    interviewPlan: one(jobInterviewAssistant, {
        fields: [interviewPlanPurchase.interviewPlanId],
        references: [jobInterviewAssistant.id],
        relationName: "PublicInterviewPurchases",
    }),
    newInterviewPlan: one(jobInterviewAssistant, {
        fields: [interviewPlanPurchase.newInterviewPlanId],
        references: [jobInterviewAssistant.id],
        relationName: "PurchasedInterviewPlan",
    }),
}));

// ===========================
// coverLetter
// ===========================

export const coverLetter = pgTable(
    "CoverLetter",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        jobUrl: text("jobUrl").notNull(),
        companyName: text("companyName"),
        jobTitle: text("jobTitle"),
        jobDescription: text("jobDescription"),
        questions: jsonb("questions"),
        answers: jsonb("answers"),
        tone: text("tone").default("Professional"),
        generatedContent: text("generatedContent"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("coverLetter_userId_idx").on(t.userId),
    ]
);

export const coverLetterRelations = relations(coverLetter, ({ one }) => ({
    user: one(users, {
        fields: [coverLetter.userId],
        references: [users.id],
    }),
}));

// ===========================
// resumeTemplate
// ===========================

export const resumeTemplate = pgTable("ResumeTemplate", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    previewImageUrl: text("previewImageUrl").notNull(),
    sectionOrder: jsonb("sectionOrder").notNull(),
    isDefault: boolean("isDefault").notNull().default(false),
    creditsCost: integer("creditsCost").notNull().default(10),
    isPlatform: boolean("isPlatform").notNull().default(false),
    createdById: text("createdById").references(() => users.id, { onDelete: "set null" }),
    isMarketplace: boolean("isMarketplace").notNull().default(false),
    isFeatured: boolean("isFeatured").notNull().default(false),
    marketplacePrice: integer("marketplacePrice").notNull().default(0),
    config: jsonb("config"),
    totalSales: integer("totalSales").notNull().default(0),
    totalRevenue: integer("totalRevenue").notNull().default(0),
    tags: text("tags").array().notNull().default([]),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const resumeTemplateRelations = relations(resumeTemplate, ({ one, many }) => ({
    createdBy: one(users, {
        fields: [resumeTemplate.createdById],
        references: [users.id],
        relationName: "UserCreatedTemplates",
    }),
    generations: many(resumeTemplateGeneration),
    purchases: many(templatePurchase, { relationName: "TemplatePurchases" }),
}));

// ===========================
// resumeTemplateGeneration
// ===========================

export const resumeTemplateGeneration = pgTable(
    "ResumeTemplateGeneration",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        templateId: text("templateId").notNull().references(() => resumeTemplate.id, { onDelete: "cascade" }),
        generatedContent: jsonb("generatedContent"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        index("resumeTemplateGeneration_userId_idx").on(t.userId),
        index("resumeTemplateGeneration_templateId_idx").on(t.templateId),
        index("resumeTemplateGeneration_userId_templateId_idx").on(t.userId, t.templateId),
    ]
);

export const resumeTemplateGenerationRelations = relations(resumeTemplateGeneration, ({ one }) => ({
    user: one(users, {
        fields: [resumeTemplateGeneration.userId],
        references: [users.id],
        relationName: "UserResumeTemplateGenerations",
    }),
    template: one(resumeTemplate, {
        fields: [resumeTemplateGeneration.templateId],
        references: [resumeTemplate.id],
    }),
}));

// ===========================
// resumeDraft
// ===========================

export const resumeDraft = pgTable(
    "ResumeDraft",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        templateSlug: text("templateSlug").notNull().default("clean-minimal"),
        content: jsonb("content").notNull(),
        tailoredFor: text("tailoredFor"),
        jdSnapshot: text("jdSnapshot"),
        atsScore: integer("atsScore"),
        isPublic: boolean("isPublic").notNull().default(false),
        shareSlug: text("shareSlug").notNull().unique().$defaultFn(() => createId()),
        viewCount: integer("viewCount").notNull().default(0),
        importedFrom: text("importedFrom"),
        importedUrl: text("importedUrl"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("resumeDraft_userId_idx").on(t.userId),
        index("resumeDraft_shareSlug_idx").on(t.shareSlug),
        index("resumeDraft_isPublic_idx").on(t.isPublic),
    ]
);

export const resumeDraftRelations = relations(resumeDraft, ({ one }) => ({
    user: one(users, {
        fields: [resumeDraft.userId],
        references: [users.id],
        relationName: "UserResumeDrafts",
    }),
}));

// ===========================
// templatePurchase
// ===========================

export const templatePurchase = pgTable(
    "TemplatePurchase",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        buyerId: text("buyerId").notNull().references(() => users.id),
        templateId: text("templateId").notNull().references(() => resumeTemplate.id),
        pricePaid: integer("pricePaid").notNull(),
        creatorEarning: integer("creatorEarning").notNull(),
        platformFee: integer("platformFee").notNull(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        uniqueIndex("templatePurchase_buyerId_templateId_key").on(t.buyerId, t.templateId),
        index("templatePurchase_buyerId_idx").on(t.buyerId),
        index("templatePurchase_templateId_idx").on(t.templateId),
    ]
);

export const templatePurchaseRelations = relations(templatePurchase, ({ one }) => ({
    buyer: one(users, {
        fields: [templatePurchase.buyerId],
        references: [users.id],
        relationName: "TemplatePurchasesBuyer",
    }),
    template: one(resumeTemplate, {
        fields: [templatePurchase.templateId],
        references: [resumeTemplate.id],
        relationName: "TemplatePurchases",
    }),
}));
