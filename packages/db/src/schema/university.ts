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

export const universityTypeEnum = pgEnum("UniversityType", [
    "PUBLIC",
    "PRIVATE",
    "DEEMED",
    "AUTONOMOUS",
    "STATE",
    "CENTRAL",
    "AFFILIATED",
    "COMMUNITY_COLLEGE",
    "TECHNICAL_INSTITUTE",
    "OTHER",
]);

export const universityMemberRoleEnum = pgEnum("UniversityMemberRole", [
    "HEAD",
    "DEPARTMENT_HEAD",
    "PLACEMENT_OFFICER",
    "FINANCE_OFFICER",
    "FACULTY",
    "TEACHING_ASSISTANT",
]);

export const universityMemberJobTitleEnum = pgEnum("UniversityMemberJobTitle", [
    "CHANCELLOR",
    "PRINCIPAL",
    "REGISTRAR",
    "DEAN",
    "HOD",
    "PROFESSOR",
    "ASSOCIATE_PROFESSOR",
    "ASSISTANT_PROFESSOR",
    "LECTURER",
    "PLACEMENT_COORDINATOR",
    "PLACEMENT_OFFICER",
    "FINANCE_MANAGER",
    "ACCOUNTS_OFFICER",
    "TEACHING_ASSISTANT",
    "LAB_INSTRUCTOR",
    "OTHER",
]);

export const universityVerificationStatusEnum = pgEnum("UniversityVerificationStatus", [
    "PENDING",
    "UNDER_REVIEW",
    "VERIFIED",
    "REJECTED",
    "SUSPENDED",
]);

export const universityMemberInviteStatusEnum = pgEnum("UniversityMemberInviteStatus", [
    "PENDING",
    "ACCEPTED",
    "REVOKED",
    "EXPIRED",
]);

export const studentVerificationStatusEnum = pgEnum("StudentVerificationStatus", [
    "PENDING",
    "UNDER_REVIEW",
    "VERIFIED",
    "REJECTED",
    "EXPIRED",
]);

export const universityAssignmentTypeEnum = pgEnum("UniversityAssignmentType", [
    "QUIZ",
    "CODING",
    "PROJECT",
    "MOCK_INTERVIEW",
    "SPACE_TOPIC",
    "CUSTOM",
]);

export const universityAssignmentStatusEnum = pgEnum("UniversityAssignmentStatus", [
    "DRAFT",
    "PUBLISHED",
    "CLOSED",
    "ARCHIVED",
]);

export const submissionGradingStatusEnum = pgEnum("SubmissionGradingStatus", [
    "NOT_SUBMITTED",
    "SUBMITTED",
    "UNDER_REVIEW",
    "GRADED",
    "RESUBMISSION_REQUESTED",
]);

export const semesterTypeEnum = pgEnum("SemesterType", [
    "SEMESTER_1",
    "SEMESTER_2",
    "SEMESTER_3",
    "SEMESTER_4",
    "SEMESTER_5",
    "SEMESTER_6",
    "SEMESTER_7",
    "SEMESTER_8",
]);

export const universityJobVisibilityEnum = pgEnum("UniversityJobVisibility", [
    "PUBLIC",
    "UNIVERSITY_ONLY",
    "FILTERED",
]);

export const universitySubscriptionPlanEnum = pgEnum("UniversitySubscriptionPlan", [
    "FREE",
    "STARTER",
    "GROWTH",
    "ENTERPRISE",
]);

export const universitySubscriptionStatusEnum = pgEnum("UniversitySubscriptionStatus", [
    "ACTIVE",
    "CANCELLED",
    "EXPIRED",
    "PAST_DUE",
    "TRIALING",
]);

// ===========================
// Tables
// ===========================

export const universities = pgTable(
    "University",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        name: text("name").notNull(),
        slug: text("slug").notNull().unique(),
        logoUrl: text("logoUrl"),
        bannerUrl: text("bannerUrl"),
        website: text("website"),
        description: text("description"),
        email: text("email"),
        phone: text("phone"),
        universityType: universityTypeEnum("universityType"),
        affiliatedTo: text("affiliatedTo"),
        accreditation: text("accreditation"),
        establishedYear: integer("establishedYear"),
        emailDomain: text("emailDomain").notNull().unique(),
        address: text("address"),
        city: text("city"),
        state: text("state"),
        country: text("country").notNull().default("India"),
        pincode: text("pincode"),
        verificationStatus: universityVerificationStatusEnum("verificationStatus")
            .notNull()
            .default("PENDING"),
        verifiedAt: timestamp("verifiedAt"),
        verifiedBy: text("verifiedBy"),
        rejectionReason: text("rejectionReason"),
        totalCreditsAllocated: integer("totalCreditsAllocated").notNull().default(0),
        totalCreditsUsed: integer("totalCreditsUsed").notNull().default(0),
        creditExpiryDate: timestamp("creditExpiryDate"),
        memberInviteCode: text("memberInviteCode").unique(),
        studentInviteCode: text("studentInviteCode").unique(),
        createdByUserId: text("createdByUserId"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_uni_slug").on(table.slug),
        index("idx_uni_emailDomain").on(table.emailDomain),
        index("idx_uni_verificationStatus").on(table.verificationStatus),
        index("idx_uni_createdByUserId").on(table.createdByUserId),
    ],
);

export const departments = pgTable(
    "Department",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        universityId: text("universityId")
            .notNull()
            .references(() => universities.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        code: text("code"),
        description: text("description"),
        headUserId: text("headUserId"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("idx_dept_universityId_name").on(table.universityId, table.name),
        uniqueIndex("idx_dept_universityId_code").on(table.universityId, table.code),
        index("idx_dept_universityId").on(table.universityId),
    ],
);

export const universityMembers = pgTable(
    "UniversityMember",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId").notNull(),
        universityId: text("universityId")
            .notNull()
            .references(() => universities.id, { onDelete: "cascade" }),
        departmentId: text("departmentId").references(() => departments.id, { onDelete: "set null" }),
        role: universityMemberRoleEnum("role").notNull().default("FACULTY"),
        jobTitle: universityMemberJobTitleEnum("jobTitle").notNull().default("OTHER"),
        jobTitleCustom: text("jobTitleCustom"),
        displayName: text("displayName"),
        email: text("email").notNull(),
        phone: text("phone"),
        permissions: jsonb("permissions")
            .notNull()
            .default(["view_classes", "create_assignments", "grade_submissions", "view_students"]),
        inviteStatus: universityMemberInviteStatusEnum("inviteStatus").notNull().default("ACCEPTED"),
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
        uniqueIndex("idx_um_userId_universityId").on(table.userId, table.universityId),
        index("idx_um_userId").on(table.userId),
        index("idx_um_universityId").on(table.universityId),
        index("idx_um_departmentId").on(table.departmentId),
        index("idx_um_email").on(table.email),
        index("idx_um_role").on(table.role),
    ],
);

export const universityClasses = pgTable(
    "UniversityClass",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        universityId: text("universityId")
            .notNull()
            .references(() => universities.id, { onDelete: "cascade" }),
        departmentId: text("departmentId").references(() => departments.id, { onDelete: "set null" }),
        name: text("name").notNull(),
        code: text("code"),
        description: text("description"),
        semester: semesterTypeEnum("semester").notNull(),
        academicYear: text("academicYear").notNull(),
        section: text("section"),
        facultyId: text("facultyId").references(() => universityMembers.id, { onDelete: "set null" }),
        studentCount: integer("studentCount").notNull().default(0),
        isActive: boolean("isActive").notNull().default(true),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("idx_uc_universityId_code_academicYear_section").on(
            table.universityId,
            table.code,
            table.academicYear,
            table.section,
        ),
        index("idx_uc_universityId").on(table.universityId),
        index("idx_uc_departmentId").on(table.departmentId),
        index("idx_uc_facultyId").on(table.facultyId),
        index("idx_uc_semester").on(table.semester),
        index("idx_uc_academicYear").on(table.academicYear),
    ],
);

export const studentUniversityLinks = pgTable(
    "StudentUniversityLink",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId").notNull(),
        universityId: text("universityId")
            .notNull()
            .references(() => universities.id, { onDelete: "cascade" }),
        departmentId: text("departmentId").references(() => departments.id, { onDelete: "set null" }),
        universityEmail: text("universityEmail").notNull(),
        verificationStatus: studentVerificationStatusEnum("verificationStatus")
            .notNull()
            .default("PENDING"),
        verificationOtp: text("verificationOtp"),
        otpExpiresAt: timestamp("otpExpiresAt"),
        verifiedAt: timestamp("verifiedAt"),
        rejectionReason: text("rejectionReason"),
        rollNumber: text("rollNumber"),
        semester: semesterTypeEnum("semester"),
        batchYear: text("batchYear"),
        creditsAllocated: integer("creditsAllocated").notNull().default(0),
        creditsUsed: integer("creditsUsed").notNull().default(0),
        isActive: boolean("isActive").notNull().default(true),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("idx_sul_userId_universityId").on(table.userId, table.universityId),
        uniqueIndex("idx_sul_universityId_universityEmail").on(table.universityId, table.universityEmail),
        uniqueIndex("idx_sul_universityId_rollNumber").on(table.universityId, table.rollNumber),
        index("idx_sul_userId").on(table.userId),
        index("idx_sul_universityId").on(table.universityId),
        index("idx_sul_departmentId").on(table.departmentId),
        index("idx_sul_verificationStatus").on(table.verificationStatus),
    ],
);

export const classEnrollments = pgTable(
    "ClassEnrollment",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        classId: text("classId")
            .notNull()
            .references(() => universityClasses.id, { onDelete: "cascade" }),
        studentLinkId: text("studentLinkId")
            .notNull()
            .references(() => studentUniversityLinks.id, { onDelete: "cascade" }),
        isActive: boolean("isActive").notNull().default(true),
        enrolledAt: timestamp("enrolledAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("idx_ce_classId_studentLinkId").on(table.classId, table.studentLinkId),
        index("idx_ce_classId").on(table.classId),
        index("idx_ce_studentLinkId").on(table.studentLinkId),
    ],
);

export const universityAssignments = pgTable(
    "UniversityAssignment",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        classId: text("classId")
            .notNull()
            .references(() => universityClasses.id, { onDelete: "cascade" }),
        createdById: text("createdById").notNull(),
        title: text("title").notNull(),
        description: text("description"),
        instructions: text("instructions"),
        type: universityAssignmentTypeEnum("type").notNull(),
        referenceId: text("referenceId"),
        referenceUrl: text("referenceUrl"),
        referenceData: jsonb("referenceData"),
        deadline: timestamp("deadline"),
        maxAttempts: integer("maxAttempts").notNull().default(1),
        lateSubmission: boolean("lateSubmission").notNull().default(false),
        latePenalty: integer("latePenalty").notNull().default(0),
        creditsRequired: integer("creditsRequired").notNull().default(0),
        maxScore: integer("maxScore").notNull().default(100),
        passingScore: integer("passingScore").notNull().default(40),
        isAutoGraded: boolean("isAutoGraded").notNull().default(false),
        status: universityAssignmentStatusEnum("status").notNull().default("DRAFT"),
        publishedAt: timestamp("publishedAt"),
        closedAt: timestamp("closedAt"),
        attachments: jsonb("attachments"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_ua_classId").on(table.classId),
        index("idx_ua_createdById").on(table.createdById),
        index("idx_ua_type").on(table.type),
        index("idx_ua_status").on(table.status),
        index("idx_ua_deadline").on(table.deadline),
    ],
);

export const universitySubmissions = pgTable(
    "UniversitySubmission",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        assignmentId: text("assignmentId")
            .notNull()
            .references(() => universityAssignments.id, { onDelete: "cascade" }),
        studentLinkId: text("studentLinkId")
            .notNull()
            .references(() => studentUniversityLinks.id, { onDelete: "cascade" }),
        mainPlatformSubmissionId: text("mainPlatformSubmissionId"),
        mainPlatformUrl: text("mainPlatformUrl"),
        submissionData: jsonb("submissionData"),
        submissionUrl: text("submissionUrl"),
        submissionText: text("submissionText"),
        attemptNumber: integer("attemptNumber").notNull().default(1),
        creditsUsed: integer("creditsUsed").notNull().default(0),
        status: submissionGradingStatusEnum("status").notNull().default("NOT_SUBMITTED"),
        score: integer("score"),
        maxScore: integer("maxScore"),
        percentage: real("percentage"),
        passed: boolean("passed"),
        feedback: text("feedback"),
        gradedById: text("gradedById"),
        gradedAt: timestamp("gradedAt"),
        autoGradeResult: jsonb("autoGradeResult"),
        autoGradedAt: timestamp("autoGradedAt"),
        isLate: boolean("isLate").notNull().default(false),
        latePenalty: integer("latePenalty").notNull().default(0),
        submittedAt: timestamp("submittedAt"),
        startedAt: timestamp("startedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("idx_us_assignmentId_studentLinkId_attemptNumber").on(
            table.assignmentId,
            table.studentLinkId,
            table.attemptNumber,
        ),
        index("idx_us_assignmentId").on(table.assignmentId),
        index("idx_us_studentLinkId").on(table.studentLinkId),
        index("idx_us_status").on(table.status),
        index("idx_us_mainPlatformSubmissionId").on(table.mainPlatformSubmissionId),
    ],
);

export const companyUniversityLinks = pgTable(
    "CompanyUniversityLink",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        companyId: text("companyId").notNull(),
        universityId: text("universityId")
            .notNull()
            .references(() => universities.id, { onDelete: "cascade" }),
        referredById: text("referredById"),
        referralCode: text("referralCode").unique(),
        isPartner: boolean("isPartner").notNull().default(false),
        partnerSince: timestamp("partnerSince"),
        jobsPosted: integer("jobsPosted").notNull().default(0),
        studentsHired: integer("studentsHired").notNull().default(0),
        isActive: boolean("isActive").notNull().default(true),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("idx_cul_companyId_universityId").on(table.companyId, table.universityId),
        index("idx_cul_companyId").on(table.companyId),
        index("idx_cul_universityId").on(table.universityId),
        index("idx_cul_referredById").on(table.referredById),
    ],
);

export const universityJobs = pgTable(
    "UniversityJob",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        jobId: text("jobId").notNull(),
        universityId: text("universityId")
            .notNull()
            .references(() => universities.id, { onDelete: "cascade" }),
        visibility: universityJobVisibilityEnum("visibility").notNull().default("UNIVERSITY_ONLY"),
        filters: jsonb("filters"),
        taggedById: text("taggedById"),
        applications: integer("applications").notNull().default(0),
        isActive: boolean("isActive").notNull().default(true),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("idx_uj_jobId_universityId").on(table.jobId, table.universityId),
        index("idx_uj_jobId").on(table.jobId),
        index("idx_uj_universityId").on(table.universityId),
        index("idx_uj_visibility").on(table.visibility),
    ],
);

export const universityCreditTransactions = pgTable(
    "UniversityCreditTransaction",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        universityId: text("universityId")
            .notNull()
            .references(() => universities.id, { onDelete: "cascade" }),
        type: text("type").notNull(),
        amount: integer("amount").notNull(),
        balance: integer("balance").notNull(),
        description: text("description"),
        referenceType: text("referenceType"),
        referenceId: text("referenceId"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_uct_universityId").on(table.universityId),
        index("idx_uct_type").on(table.type),
        index("idx_uct_createdAt").on(table.createdAt),
    ],
);

export const universityInvitations = pgTable(
    "UniversityInvitation",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        email: text("email").notNull(),
        universityName: text("universityName"),
        invitedBy: text("invitedBy"),
        inviteCode: text("inviteCode").notNull().unique(),
        status: universityMemberInviteStatusEnum("status").notNull().default("PENDING"),
        acceptedAt: timestamp("acceptedAt"),
        expiresAt: timestamp("expiresAt"),
        metadata: jsonb("metadata"),
        universityId: text("universityId").references(() => universities.id, { onDelete: "set null" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_uinv_email").on(table.email),
        index("idx_uinv_inviteCode").on(table.inviteCode),
        index("idx_uinv_status").on(table.status),
    ],
);

export const universityMemberInvitations = pgTable(
    "UniversityMemberInvitation",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        universityId: text("universityId")
            .notNull()
            .references(() => universities.id, { onDelete: "cascade" }),
        email: text("email").notNull(),
        name: text("name"),
        departmentId: text("departmentId"),
        role: universityMemberRoleEnum("role").notNull().default("FACULTY"),
        jobTitle: universityMemberJobTitleEnum("jobTitle").notNull().default("OTHER"),
        inviteCode: text("inviteCode").notNull().unique(),
        invitedById: text("invitedById")
            .notNull()
            .references(() => universityMembers.id, { onDelete: "cascade" }),
        status: universityMemberInviteStatusEnum("status").notNull().default("PENDING"),
        message: text("message"),
        expiresAt: timestamp("expiresAt"),
        acceptedAt: timestamp("acceptedAt"),
        resultingMemberId: text("resultingMemberId"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_umi_email").on(table.email),
        index("idx_umi_inviteCode").on(table.inviteCode),
        index("idx_umi_status").on(table.status),
        index("idx_umi_universityId").on(table.universityId),
    ],
);

export const universitySubscriptions = pgTable(
    "UniversitySubscription",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        universityId: text("universityId")
            .notNull()
            .unique()
            .references(() => universities.id, { onDelete: "cascade" }),
        plan: universitySubscriptionPlanEnum("plan").notNull().default("FREE"),
        status: universitySubscriptionStatusEnum("status").notNull().default("ACTIVE"),
        maxStudents: integer("maxStudents").notNull().default(500),
        maxFaculty: integer("maxFaculty").notNull().default(10),
        maxDepartments: integer("maxDepartments").notNull().default(5),
        maxClassesPerFaculty: integer("maxClassesPerFaculty").notNull().default(5),
        maxCreditsPerMonth: integer("maxCreditsPerMonth").notNull().default(100000),
        hasAnalytics: boolean("hasAnalytics").notNull().default(false),
        hasAdvancedReports: boolean("hasAdvancedReports").notNull().default(false),
        hasPlacementModule: boolean("hasPlacementModule").notNull().default(false),
        hasCompanyPortal: boolean("hasCompanyPortal").notNull().default(false),
        hasAPIAccess: boolean("hasAPIAccess").notNull().default(false),
        hasPrioritySupport: boolean("hasPrioritySupport").notNull().default(false),
        hasWhiteLabel: boolean("hasWhiteLabel").notNull().default(false),
        hasCustomBranding: boolean("hasCustomBranding").notNull().default(false),
        billingCycle: text("billingCycle").notNull().default("monthly"),
        amount: integer("amount").notNull().default(0),
        currency: text("currency").notNull().default("INR"),
        currentPeriodStart: timestamp("currentPeriodStart").notNull().defaultNow(),
        currentPeriodEnd: timestamp("currentPeriodEnd"),
        dodoSubscriptionId: text("dodoSubscriptionId"),
        dodoCustomerId: text("dodoCustomerId"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_usub_plan").on(table.plan),
        index("idx_usub_status").on(table.status),
    ],
);

export const universityPayments = pgTable(
    "UniversityPayment",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        universityId: text("universityId")
            .notNull()
            .references(() => universities.id, { onDelete: "cascade" }),
        amount: integer("amount").notNull(),
        currency: text("currency").notNull().default("INR"),
        status: text("status").notNull().default("PENDING"),
        description: text("description"),
        dodoPaymentId: text("dodoPaymentId"),
        dodoCheckoutSessionId: text("dodoCheckoutSessionId"),
        invoiceId: text("invoiceId"),
        metadata: jsonb("metadata"),
        paidAt: timestamp("paidAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_upay_universityId").on(table.universityId),
        index("idx_upay_status").on(table.status),
        index("idx_upay_dodoPaymentId").on(table.dodoPaymentId),
    ],
);

export const universityInvoices = pgTable(
    "UniversityInvoice",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        universityId: text("universityId")
            .notNull()
            .references(() => universities.id, { onDelete: "cascade" }),
        invoiceNumber: text("invoiceNumber").notNull().unique(),
        status: text("status").notNull().default("DRAFT"),
        invoiceDate: timestamp("invoiceDate").notNull().defaultNow(),
        dueDate: timestamp("dueDate"),
        paidAt: timestamp("paidAt"),
        subtotal: integer("subtotal").notNull(),
        taxAmount: integer("taxAmount").notNull().default(0),
        taxRate: real("taxRate").notNull().default(18.0),
        discount: integer("discount").notNull().default(0),
        totalAmount: integer("totalAmount").notNull(),
        currency: text("currency").notNull().default("INR"),
        lineItems: jsonb("lineItems").notNull(),
        billingName: text("billingName"),
        billingEmail: text("billingEmail"),
        billingAddress: text("billingAddress"),
        billingCity: text("billingCity"),
        billingState: text("billingState"),
        billingCountry: text("billingCountry"),
        billingPincode: text("billingPincode"),
        gstNumber: text("gstNumber"),
        pdfUrl: text("pdfUrl"),
        notes: text("notes"),
        paymentId: text("paymentId"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_uinvo_universityId").on(table.universityId),
        index("idx_uinvo_status").on(table.status),
        index("idx_uinvo_invoiceDate").on(table.invoiceDate),
    ],
);

// ===========================
// Relations
// ===========================

export const universitiesRelations = relations(universities, ({ many }) => ({
    departments: many(departments),
    members: many(universityMembers),
    classes: many(universityClasses),
    studentLinks: many(studentUniversityLinks),
    companyLinks: many(companyUniversityLinks),
    jobs: many(universityJobs),
    creditTransactions: many(universityCreditTransactions),
    invitations: many(universityInvitations),
    memberInvitations: many(universityMemberInvitations),
    subscription: many(universitySubscriptions),
    payments: many(universityPayments),
    invoices: many(universityInvoices),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
    university: one(universities, {
        fields: [departments.universityId],
        references: [universities.id],
    }),
    members: many(universityMembers),
    classes: many(universityClasses),
    studentLinks: many(studentUniversityLinks),
}));

export const universityMembersRelations = relations(universityMembers, ({ one, many }) => ({
    university: one(universities, {
        fields: [universityMembers.universityId],
        references: [universities.id],
    }),
    department: one(departments, {
        fields: [universityMembers.departmentId],
        references: [departments.id],
    }),
    invitedBy: one(universityMembers, {
        fields: [universityMembers.invitedById],
        references: [universityMembers.id],
        relationName: "InvitedByMember",
    }),
    invitedMembers: many(universityMembers, {
        relationName: "InvitedByMember",
    }),
    facultyClasses: many(universityClasses, {
        relationName: "ClassFaculty",
    }),
    sentInvitations: many(universityMemberInvitations, {
        relationName: "SentInvitations",
    }),
}));

export const universityClassesRelations = relations(universityClasses, ({ one, many }) => ({
    university: one(universities, {
        fields: [universityClasses.universityId],
        references: [universities.id],
    }),
    department: one(departments, {
        fields: [universityClasses.departmentId],
        references: [departments.id],
    }),
    faculty: one(universityMembers, {
        fields: [universityClasses.facultyId],
        references: [universityMembers.id],
        relationName: "ClassFaculty",
    }),
    enrollments: many(classEnrollments),
    assignments: many(universityAssignments),
}));

export const studentUniversityLinksRelations = relations(studentUniversityLinks, ({ one, many }) => ({
    university: one(universities, {
        fields: [studentUniversityLinks.universityId],
        references: [universities.id],
    }),
    department: one(departments, {
        fields: [studentUniversityLinks.departmentId],
        references: [departments.id],
    }),
    enrollments: many(classEnrollments),
    submissions: many(universitySubmissions),
}));

export const classEnrollmentsRelations = relations(classEnrollments, ({ one }) => ({
    class: one(universityClasses, {
        fields: [classEnrollments.classId],
        references: [universityClasses.id],
    }),
    studentLink: one(studentUniversityLinks, {
        fields: [classEnrollments.studentLinkId],
        references: [studentUniversityLinks.id],
    }),
}));

export const universityAssignmentsRelations = relations(universityAssignments, ({ one, many }) => ({
    class: one(universityClasses, {
        fields: [universityAssignments.classId],
        references: [universityClasses.id],
    }),
    submissions: many(universitySubmissions),
}));

export const universitySubmissionsRelations = relations(universitySubmissions, ({ one }) => ({
    assignment: one(universityAssignments, {
        fields: [universitySubmissions.assignmentId],
        references: [universityAssignments.id],
    }),
    studentLink: one(studentUniversityLinks, {
        fields: [universitySubmissions.studentLinkId],
        references: [studentUniversityLinks.id],
    }),
}));

export const companyUniversityLinksRelations = relations(companyUniversityLinks, ({ one }) => ({
    university: one(universities, {
        fields: [companyUniversityLinks.universityId],
        references: [universities.id],
    }),
}));

export const universityJobsRelations = relations(universityJobs, ({ one }) => ({
    university: one(universities, {
        fields: [universityJobs.universityId],
        references: [universities.id],
    }),
}));

export const universityCreditTransactionsRelations = relations(universityCreditTransactions, ({ one }) => ({
    university: one(universities, {
        fields: [universityCreditTransactions.universityId],
        references: [universities.id],
    }),
}));

export const universityInvitationsRelations = relations(universityInvitations, ({ one }) => ({
    university: one(universities, {
        fields: [universityInvitations.universityId],
        references: [universities.id],
    }),
}));

export const universityMemberInvitationsRelations = relations(universityMemberInvitations, ({ one }) => ({
    university: one(universities, {
        fields: [universityMemberInvitations.universityId],
        references: [universities.id],
    }),
    invitedBy: one(universityMembers, {
        fields: [universityMemberInvitations.invitedById],
        references: [universityMembers.id],
        relationName: "SentInvitations",
    }),
}));

export const universitySubscriptionsRelations = relations(universitySubscriptions, ({ one }) => ({
    university: one(universities, {
        fields: [universitySubscriptions.universityId],
        references: [universities.id],
    }),
}));

export const universityPaymentsRelations = relations(universityPayments, ({ one }) => ({
    university: one(universities, {
        fields: [universityPayments.universityId],
        references: [universities.id],
    }),
}));

export const universityInvoicesRelations = relations(universityInvoices, ({ one }) => ({
    university: one(universities, {
        fields: [universityInvoices.universityId],
        references: [universities.id],
    }),
}));
