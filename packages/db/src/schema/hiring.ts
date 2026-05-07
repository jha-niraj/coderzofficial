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

export const companyMemberRoleEnum = pgEnum("CompanyMemberRole", [
    "FOUNDER",
    "ADMIN",
    "HIRING_MANAGER",
    "RECRUITER",
    "INTERVIEWER",
]);

export const companyMemberJobTitleEnum = pgEnum("CompanyMemberJobTitle", [
    "CEO",
    "CTO",
    "COFOUNDER",
    "VP_ENGINEERING",
    "ENGINEERING_MANAGER",
    "HR_HEAD",
    "HR_MANAGER",
    "TALENT_ACQUISITION",
    "RECRUITER",
    "HIRING_MANAGER",
    "TECH_LEAD",
    "INTERVIEWER",
    "OTHER",
]);

export const companyVerificationStatusEnum = pgEnum("CompanyVerificationStatus", [
    "PENDING",
    "VERIFIED",
    "REJECTED",
]);

export const memberInviteStatusEnum = pgEnum("MemberInviteStatus", [
    "PENDING",
    "ACCEPTED",
    "REVOKED",
    "EXPIRED",
]);

export const companyInvitationStatusEnum = pgEnum("CompanyInvitationStatus", [
    "PENDING",
    "ACCEPTED",
    "EXPIRED",
    "REVOKED",
]);

export const hiringSubscriptionPlanEnum = pgEnum("HiringSubscriptionPlan", [
    "FREE",
    "PRO",
    "ENTERPRISE",
]);

export const hiringSubscriptionStatusEnum = pgEnum("HiringSubscriptionStatus", [
    "ACTIVE",
    "CANCELLED",
    "EXPIRED",
    "PAST_DUE",
    "TRIALING",
]);

export const hiringPaymentStatusEnum = pgEnum("HiringPaymentStatus", [
    "PENDING",
    "PROCESSING",
    "SUCCEEDED",
    "FAILED",
    "REFUNDED",
    "CANCELLED",
]);

export const hiringInvoiceStatusEnum = pgEnum("HiringInvoiceStatus", [
    "DRAFT",
    "PENDING",
    "PAID",
    "VOID",
    "UNCOLLECTIBLE",
]);

export const templateStyleEnum = pgEnum("TemplateStyle", [
    "STARTUP",
    "FAANG",
    "MNC",
    "CUSTOM",
]);

export const templateCategoryEnum = pgEnum("TemplateCategory", [
    "ENGINEERING",
    "PRODUCT",
    "DESIGN",
    "DATA_SCIENCE",
    "MARKETING",
    "SALES",
    "OPERATIONS",
    "INTERN",
    "GENERAL",
]);

// ===========================
// Tables
// ===========================

export const companies = pgTable(
    "Company",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        name: text("name").notNull(),
        slug: text("slug").notNull().unique(),
        logoUrl: text("logoUrl"),
        website: text("website"),
        description: text("description"),
        industry: text("industry"),
        companySize: text("companySize"),
        foundedYear: integer("foundedYear"),
        headquarters: text("headquarters"),
        socialLinks: jsonb("socialLinks"),
        address: text("address"),
        city: text("city"),
        state: text("state"),
        country: text("country"),
        pincode: text("pincode"),
        culture: text("culture"),
        benefits: jsonb("benefits"),
        techStack: jsonb("techStack"),
        mediaGallery: jsonb("mediaGallery"),
        responseRatePercent: real("responseRatePercent"),
        avgTimeToHireDays: integer("avgTimeToHireDays"),
        interviewToOfferPercent: real("interviewToOfferPercent"),
        totalHired: integer("totalHired").notNull().default(0),
        totalApplications: integer("totalApplications").notNull().default(0),
        verificationStatus: companyVerificationStatusEnum("verificationStatus")
            .notNull()
            .default("PENDING"),
        verifiedAt: timestamp("verifiedAt"),
        verifiedBy: text("verifiedBy"),
        inviteCode: text("inviteCode").unique(),
        createdByUserId: text("createdByUserId").references(() => users.id, {
            onDelete: "set null",
        }),
        hasInterviewProcess: boolean("hasInterviewProcess").notNull().default(false),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_company_slug").on(table.slug),
        index("idx_company_verificationStatus").on(table.verificationStatus),
        index("idx_company_createdByUserId").on(table.createdByUserId),
    ],
);

export const companyFollowers = pgTable(
    "CompanyFollower",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        companyId: text("companyId")
            .notNull()
            .references(() => companies.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_companyFollower_userId_companyId").on(table.userId, table.companyId),
        index("idx_companyFollower_userId").on(table.userId),
        index("idx_companyFollower_companyId").on(table.companyId),
    ],
);

export const companyMembers = pgTable(
    "CompanyMember",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        companyId: text("companyId")
            .notNull()
            .references(() => companies.id, { onDelete: "cascade" }),
        role: companyMemberRoleEnum("role").notNull().default("RECRUITER"),
        jobTitle: companyMemberJobTitleEnum("jobTitle").notNull().default("OTHER"),
        jobTitleCustom: text("jobTitleCustom"),
        displayName: text("displayName"),
        email: text("email").notNull(),
        phone: text("phone"),
        permissions: jsonb("permissions")
            .notNull()
            .default(["view_jobs", "post_jobs", "view_applications", "review_candidates"]),
        inviteStatus: memberInviteStatusEnum("inviteStatus").notNull().default("ACCEPTED"),
        invitedById: text("invitedById"),
        invitedAt: timestamp("invitedAt"),
        acceptedAt: timestamp("acceptedAt"),
        isActive: boolean("isActive").notNull().default(true),
        lastActiveAt: timestamp("lastActiveAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_companyMember_userId_companyId").on(table.userId, table.companyId),
        index("idx_companyMember_userId").on(table.userId),
        index("idx_companyMember_companyId").on(table.companyId),
        index("idx_companyMember_email").on(table.email),
        index("idx_companyMember_role").on(table.role),
    ],
);

export const memberInvitations = pgTable(
    "MemberInvitation",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        companyId: text("companyId")
            .notNull()
            .references(() => companies.id, { onDelete: "cascade" }),
        email: text("email").notNull(),
        name: text("name"),
        role: companyMemberRoleEnum("role").notNull().default("RECRUITER"),
        jobTitle: companyMemberJobTitleEnum("jobTitle").notNull().default("RECRUITER"),
        inviteCode: text("inviteCode").notNull().unique(),
        invitedById: text("invitedById")
            .notNull()
            .references(() => companyMembers.id, { onDelete: "cascade" }),
        status: memberInviteStatusEnum("status").notNull().default("PENDING"),
        message: text("message"),
        expiresAt: timestamp("expiresAt"),
        acceptedAt: timestamp("acceptedAt"),
        resultingMemberId: text("resultingMemberId"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_memberInvitation_email").on(table.email),
        index("idx_memberInvitation_inviteCode").on(table.inviteCode),
        index("idx_memberInvitation_status").on(table.status),
        index("idx_memberInvitation_companyId").on(table.companyId),
    ],
);

export const companyInvitations = pgTable(
    "CompanyInvitation",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        email: text("email").notNull(),
        companyName: text("companyName"),
        invitedBy: text("invitedBy"),
        inviteCode: text("inviteCode").notNull().unique(),
        status: companyInvitationStatusEnum("status").notNull().default("PENDING"),
        acceptedAt: timestamp("acceptedAt"),
        expiresAt: timestamp("expiresAt"),
        metadata: jsonb("metadata"),
        companyId: text("companyId").references(() => companies.id),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_companyInvitation_email").on(table.email),
        index("idx_companyInvitation_inviteCode").on(table.inviteCode),
        index("idx_companyInvitation_status").on(table.status),
    ],
);

export const companySubscriptions = pgTable(
    "CompanySubscription",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        companyId: text("companyId")
            .notNull()
            .unique()
            .references(() => companies.id, { onDelete: "cascade" }),
        plan: hiringSubscriptionPlanEnum("plan").notNull().default("FREE"),
        status: hiringSubscriptionStatusEnum("status").notNull().default("ACTIVE"),
        dodoSubscriptionId: text("dodoSubscriptionId").unique(),
        dodoProductId: text("dodoProductId"),
        dodoPriceId: text("dodoPriceId"),
        maxJobPosts: integer("maxJobPosts").notNull().default(3),
        maxApplications: integer("maxApplications").notNull().default(50),
        maxInterviewTemplates: integer("maxInterviewTemplates").notNull().default(1),
        maxTeamMembers: integer("maxTeamMembers").notNull().default(1),
        hasAIScreening: boolean("hasAIScreening").notNull().default(false),
        hasCustomAssignments: boolean("hasCustomAssignments").notNull().default(false),
        hasPrioritySupport: boolean("hasPrioritySupport").notNull().default(false),
        hasAPIAccess: boolean("hasAPIAccess").notNull().default(false),
        hasSSO: boolean("hasSSO").notNull().default(false),
        hasWhiteLabel: boolean("hasWhiteLabel").notNull().default(false),
        amount: real("amount").notNull().default(0),
        currency: text("currency").notNull().default("INR"),
        billingCycle: text("billingCycle").notNull().default("monthly"),
        currentPeriodStart: timestamp("currentPeriodStart").notNull().defaultNow(),
        currentPeriodEnd: timestamp("currentPeriodEnd"),
        trialStart: timestamp("trialStart"),
        trialEnd: timestamp("trialEnd"),
        cancelledAt: timestamp("cancelledAt"),
        metadata: jsonb("metadata"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_companySubscription_companyId").on(table.companyId),
        index("idx_companySubscription_status").on(table.status),
        index("idx_companySubscription_dodoSubscriptionId").on(table.dodoSubscriptionId),
    ],
);

export const companyPayments = pgTable(
    "CompanyPayment",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        companyId: text("companyId")
            .notNull()
            .references(() => companies.id, { onDelete: "cascade" }),
        subscriptionId: text("subscriptionId").references(() => companySubscriptions.id),
        dodoPaymentId: text("dodoPaymentId").unique(),
        dodoCheckoutSessionId: text("dodoCheckoutSessionId").unique(),
        amount: real("amount").notNull(),
        currency: text("currency").notNull().default("INR"),
        status: hiringPaymentStatusEnum("status").notNull().default("PENDING"),
        paymentMethod: text("paymentMethod"),
        billingEmail: text("billingEmail"),
        billingName: text("billingName"),
        description: text("description"),
        metadata: jsonb("metadata"),
        paidAt: timestamp("paidAt"),
        failedAt: timestamp("failedAt"),
        refundedAt: timestamp("refundedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_companyPayment_companyId").on(table.companyId),
        index("idx_companyPayment_subscriptionId").on(table.subscriptionId),
        index("idx_companyPayment_status").on(table.status),
        index("idx_companyPayment_dodoPaymentId").on(table.dodoPaymentId),
        index("idx_companyPayment_dodoCheckoutSessionId").on(table.dodoCheckoutSessionId),
    ],
);

export const companyInvoices = pgTable(
    "CompanyInvoice",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        companyId: text("companyId")
            .notNull()
            .references(() => companies.id, { onDelete: "cascade" }),
        paymentId: text("paymentId")
            .notNull()
            .unique()
            .references(() => companyPayments.id),
        invoiceNumber: text("invoiceNumber").notNull().unique(),
        status: hiringInvoiceStatusEnum("status").notNull().default("DRAFT"),
        lineItems: jsonb("lineItems").notNull(),
        subtotal: real("subtotal").notNull(),
        taxAmount: real("taxAmount").notNull().default(0),
        taxRate: real("taxRate").notNull().default(0),
        discount: real("discount").notNull().default(0),
        totalAmount: real("totalAmount").notNull(),
        currency: text("currency").notNull().default("INR"),
        billingName: text("billingName"),
        billingEmail: text("billingEmail"),
        billingAddress: text("billingAddress"),
        billingCity: text("billingCity"),
        billingState: text("billingState"),
        billingCountry: text("billingCountry"),
        billingPincode: text("billingPincode"),
        gstNumber: text("gstNumber"),
        invoiceDate: timestamp("invoiceDate").notNull().defaultNow(),
        dueDate: timestamp("dueDate"),
        paidAt: timestamp("paidAt"),
        pdfUrl: text("pdfUrl"),
        notes: text("notes"),
        metadata: jsonb("metadata"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_companyInvoice_companyId").on(table.companyId),
        index("idx_companyInvoice_status").on(table.status),
        index("idx_companyInvoice_invoiceNumber").on(table.invoiceNumber),
        index("idx_companyInvoice_invoiceDate").on(table.invoiceDate),
    ],
);

export const interviewProcessTemplates = pgTable(
    "InterviewProcessTemplate",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        name: text("name").notNull(),
        description: text("description"),
        style: templateStyleEnum("style").notNull().default("CUSTOM"),
        category: templateCategoryEnum("category").notNull().default("GENERAL"),
        rounds: jsonb("rounds").notNull(),
        estimatedDurationWeeks: integer("estimatedDurationWeeks"),
        roundCount: integer("roundCount").notNull().default(0),
        isAiGenerated: boolean("isAiGenerated").notNull().default(false),
        aiPrompt: text("aiPrompt"),
        isPublic: boolean("isPublic").notNull().default(true),
        usageCount: integer("usageCount").notNull().default(0),
        createdByCompanyId: text("createdByCompanyId"),
        createdByUserId: text("createdByUserId"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_interviewProcessTemplate_style").on(table.style),
        index("idx_interviewProcessTemplate_category").on(table.category),
        index("idx_interviewProcessTemplate_isPublic").on(table.isPublic),
        index("idx_interviewProcessTemplate_usageCount").on(table.usageCount),
    ],
);

// ===========================
// Relations
// ===========================

export const companiesRelations = relations(companies, ({ one, many }) => ({
    createdBy: one(users, {
        fields: [companies.createdByUserId],
        references: [users.id],
        relationName: "CompanyCreator",
    }),
    followers: many(companyFollowers),
    members: many(companyMembers),
    memberInvitations: many(memberInvitations),
    companyInvitations: many(companyInvitations),
    subscription: one(companySubscriptions, {
        fields: [companies.id],
        references: [companySubscriptions.companyId],
    }),
    payments: many(companyPayments),
    invoices: many(companyInvoices),
}));

export const companyFollowersRelations = relations(companyFollowers, ({ one }) => ({
    user: one(users, {
        fields: [companyFollowers.userId],
        references: [users.id],
        relationName: "UserFollowedCompanies",
    }),
    company: one(companies, {
        fields: [companyFollowers.companyId],
        references: [companies.id],
    }),
}));

export const companyMembersRelations = relations(companyMembers, ({ one, many }) => ({
    user: one(users, {
        fields: [companyMembers.userId],
        references: [users.id],
        relationName: "UserCompanyMemberships",
    }),
    company: one(companies, {
        fields: [companyMembers.companyId],
        references: [companies.id],
    }),
    invitedBy: one(companyMembers, {
        fields: [companyMembers.invitedById],
        references: [companyMembers.id],
        relationName: "InvitedBy",
    }),
    sentInvitations: many(memberInvitations, {
        relationName: "SentInvitations",
    }),
}));

export const memberInvitationsRelations = relations(memberInvitations, ({ one }) => ({
    company: one(companies, {
        fields: [memberInvitations.companyId],
        references: [companies.id],
    }),
    invitedBy: one(companyMembers, {
        fields: [memberInvitations.invitedById],
        references: [companyMembers.id],
        relationName: "SentInvitations",
    }),
}));

export const companyInvitationsRelations = relations(companyInvitations, ({ one }) => ({
    company: one(companies, {
        fields: [companyInvitations.companyId],
        references: [companies.id],
    }),
}));

export const companySubscriptionsRelations = relations(companySubscriptions, ({ one, many }) => ({
    company: one(companies, {
        fields: [companySubscriptions.companyId],
        references: [companies.id],
    }),
    payments: many(companyPayments),
}));

export const companyPaymentsRelations = relations(companyPayments, ({ one }) => ({
    company: one(companies, {
        fields: [companyPayments.companyId],
        references: [companies.id],
    }),
    subscription: one(companySubscriptions, {
        fields: [companyPayments.subscriptionId],
        references: [companySubscriptions.id],
    }),
    invoice: one(companyInvoices, {
        fields: [companyPayments.id],
        references: [companyInvoices.paymentId],
    }),
}));

export const companyInvoicesRelations = relations(companyInvoices, ({ one }) => ({
    company: one(companies, {
        fields: [companyInvoices.companyId],
        references: [companies.id],
    }),
    payment: one(companyPayments, {
        fields: [companyInvoices.paymentId],
        references: [companyPayments.id],
    }),
}));
