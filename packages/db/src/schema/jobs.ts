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
import { users } from "./schema.js";
import { companies, companyMembers } from "./hiring.js";

// ===========================
// Enums
// ===========================

export const jobLocationTypeEnum = pgEnum("JobLocationType", [
    "REMOTE",
    "HYBRID",
    "ONSITE",
]);

export const employmentTypeEnum = pgEnum("EmploymentType", [
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "INTERNSHIP",
    "FREELANCE",
]);

export const jobStatusEnum = pgEnum("JobStatus", [
    "DRAFT",
    "ACTIVE",
    "PAUSED",
    "CLOSED",
    "FILLED",
]);

export const jobVisibilityEnum = pgEnum("JobVisibility", [
    "PUBLIC",
    "INVITE_ONLY",
]);

export const applicationStatusEnum = pgEnum("ApplicationStatus", [
    "INTERESTED",
    "PREPARING",
    "APPLIED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "ASSIGNMENT_SENT",
    "ASSIGNMENT_SUBMITTED",
    "INTERVIEW_SCHEDULED",
    "INTERVIEWED",
    "OFFER_EXTENDED",
    "HIRED",
    "REJECTED",
    "WITHDRAWN",
]);

export const applicationActivityTypeEnum = pgEnum("ApplicationActivityType", [
    "MOCK_INTERVIEW",
    "AI_RESUME_REVIEW",
    "Learn_REVIEW",
    "PROJECT_PROGRESS",
    "STUDIO_NOTE",
    "SKILL_ASSESSMENT",
    "ASSIGNMENT_PROGRESS",
    "ASSIGNMENT_SUBMISSION",
]);

// ===========================
// Tables
// ===========================

export const jobs = pgTable(
    "Job",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        companyId: text("companyId")
            .notNull()
            .references(() => companies.id, { onDelete: "cascade" }),
        postedById: text("postedById")
            .notNull()
            .references(() => companyMembers.id),
        title: text("title").notNull(),
        slug: text("slug").notNull().unique(),
        description: text("description").notNull(),
        requirements: jsonb("requirements"),
        responsibilities: jsonb("responsibilities"),
        benefits: jsonb("benefits"),
        location: text("location"),
        locationType: jobLocationTypeEnum("locationType").notNull().default("REMOTE"),
        employmentType: employmentTypeEnum("employmentType").notNull().default("FULL_TIME"),
        experienceMin: integer("experienceMin"),
        experienceMax: integer("experienceMax"),
        salaryMin: integer("salaryMin"),
        salaryMax: integer("salaryMax"),
        salaryCurrency: text("salaryCurrency").notNull().default("INR"),
        salaryDisclosed: boolean("salaryDisclosed").notNull().default(true),
        skillsRequired: jsonb("skillsRequired").notNull().default([]),
        skillsPreferred: jsonb("skillsPreferred").notNull().default([]),
        hasAssignment: boolean("hasAssignment").notNull().default(false),
        assignmentStudioId: text("assignmentStudioId"),
        assignmentProjectId: text("assignmentProjectId"),
        assignmentDeadlineDays: integer("assignmentDeadlineDays"),
        evaluationCriteria: jsonb("evaluationCriteria"),
        assignmentDetails: jsonb("assignmentDetails"),
        assignmentInstructions: text("assignmentInstructions"),
        customQuestions: jsonb("customQuestions").default([]),
        status: jobStatusEnum("status").notNull().default("DRAFT"),
        visibility: jobVisibilityEnum("visibility").notNull().default("PUBLIC"),
        featured: boolean("featured").notNull().default(false),
        viewsCount: integer("viewsCount").notNull().default(0),
        applicationsCount: integer("applicationsCount").notNull().default(0),
        matchingCriteria: jsonb("matchingCriteria"),
        interviewProcessId: text("interviewProcessId"),
        expiresAt: timestamp("expiresAt"),
        publishedAt: timestamp("publishedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_job_companyId").on(table.companyId),
        index("idx_job_slug").on(table.slug),
        index("idx_job_status").on(table.status),
        index("idx_job_locationType").on(table.locationType),
        index("idx_job_employmentType").on(table.employmentType),
        index("idx_job_postedById").on(table.postedById),
    ],
);

export const jobApplications = pgTable(
    "JobApplication",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        jobId: text("jobId")
            .notNull()
            .references(() => jobs.id, { onDelete: "cascade" }),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        status: applicationStatusEnum("status").notNull().default("INTERESTED"),
        currentStage: integer("currentStage"),
        preparationStatus: jsonb("preparationStatus")
            .notNull()
            .default({
                profile_complete: false,
                resume_reviewed: false,
                mock_interview_done: false,
                Learns_reviewed: false,
                assignment_started: false,
                assignment_completed: false,
            }),
        preparationScore: integer("preparationScore").notNull().default(0),
        isReadyToApply: boolean("isReadyToApply").notNull().default(false),
        assignmentProjectCloneId: text("assignmentProjectCloneId"),
        assignmentStartedAt: timestamp("assignmentStartedAt"),
        assignmentSubmittedAt: timestamp("assignmentSubmittedAt"),
        assignmentScore: integer("assignmentScore"),
        assignmentFeedback: text("assignmentFeedback"),
        interviewId: text("interviewId"),
        interviewScheduledAt: timestamp("interviewScheduledAt"),
        interviewCompletedAt: timestamp("interviewCompletedAt"),
        interviewFeedback: jsonb("interviewFeedback"),
        // reviewedById references CompanyMember but is plain text to avoid circular imports
        reviewedById: text("reviewedById"),
        reviewedAt: timestamp("reviewedAt"),
        rejectionReason: text("rejectionReason"),
        hrNotes: text("hrNotes"),
        matchScore: integer("matchScore"),
        coverLetter: text("coverLetter"),
        resumeUrl: text("resumeUrl"),
        customQuestionResponses: jsonb("customQuestionResponses").default([]),
        appliedAt: timestamp("appliedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_jobApplication_jobId_userId").on(table.jobId, table.userId),
        index("idx_jobApplication_jobId").on(table.jobId),
        index("idx_jobApplication_userId").on(table.userId),
        index("idx_jobApplication_status").on(table.status),
        index("idx_jobApplication_reviewedById").on(table.reviewedById),
    ],
);

export const applicationActivities = pgTable(
    "ApplicationActivity",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        applicationId: text("applicationId")
            .notNull()
            .references(() => jobApplications.id, { onDelete: "cascade" }),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        activityType: applicationActivityTypeEnum("activityType").notNull(),
        activityId: text("activityId"),
        metadata: jsonb("metadata"),
        score: integer("score"),
        completedAt: timestamp("completedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_applicationActivity_applicationId").on(table.applicationId),
        index("idx_applicationActivity_userId").on(table.userId),
        index("idx_applicationActivity_activityType").on(table.activityType),
    ],
);

export const jobRecommendations = pgTable(
    "JobRecommendation",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        jobId: text("jobId")
            .notNull()
            .references(() => jobs.id, { onDelete: "cascade" }),
        matchScore: integer("matchScore").notNull(),
        matchReasons: jsonb("matchReasons"),
        isDismissed: boolean("isDismissed").notNull().default(false),
        isSaved: boolean("isSaved").notNull().default(false),
        viewedAt: timestamp("viewedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_jobRecommendation_userId_jobId").on(table.userId, table.jobId),
        index("idx_jobRecommendation_userId").on(table.userId),
        index("idx_jobRecommendation_jobId").on(table.jobId),
        index("idx_jobRecommendation_matchScore").on(table.matchScore),
    ],
);

export const savedJobs = pgTable(
    "SavedJob",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        jobId: text("jobId")
            .notNull()
            .references(() => jobs.id, { onDelete: "cascade" }),
        notes: text("notes"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_savedJob_userId_jobId").on(table.userId, table.jobId),
        index("idx_savedJob_userId").on(table.userId),
    ],
);

// ===========================
// Relations
// ===========================

export const jobsRelations = relations(jobs, ({ one, many }) => ({
    company: one(companies, {
        fields: [jobs.companyId],
        references: [companies.id],
    }),
    postedBy: one(companyMembers, {
        fields: [jobs.postedById],
        references: [companyMembers.id],
        relationName: "PostedBy",
    }),
    applications: many(jobApplications),
    recommendations: many(jobRecommendations),
    savedBy: many(savedJobs),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one, many }) => ({
    user: one(users, {
        fields: [jobApplications.userId],
        references: [users.id],
        relationName: "UserJobApplications",
    }),
    job: one(jobs, {
        fields: [jobApplications.jobId],
        references: [jobs.id],
    }),
    activities: many(applicationActivities),
}));

export const applicationActivitiesRelations = relations(applicationActivities, ({ one }) => ({
    user: one(users, {
        fields: [applicationActivities.userId],
        references: [users.id],
        relationName: "UserApplicationActivities",
    }),
    application: one(jobApplications, {
        fields: [applicationActivities.applicationId],
        references: [jobApplications.id],
    }),
}));

export const jobRecommendationsRelations = relations(jobRecommendations, ({ one }) => ({
    user: one(users, {
        fields: [jobRecommendations.userId],
        references: [users.id],
        relationName: "UserJobRecommendations",
    }),
    job: one(jobs, {
        fields: [jobRecommendations.jobId],
        references: [jobs.id],
    }),
}));

export const savedJobsRelations = relations(savedJobs, ({ one }) => ({
    user: one(users, {
        fields: [savedJobs.userId],
        references: [users.id],
        relationName: "UserSavedJobs",
    }),
    job: one(jobs, {
        fields: [savedJobs.jobId],
        references: [jobs.id],
    }),
}));
