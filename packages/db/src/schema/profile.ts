import {
    pgTable, pgEnum, text, integer, boolean, timestamp,
    jsonb, index, uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users, skillCategoryEnum } from "./schema.js";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const profileThemeEnum = pgEnum("ProfileTheme", [
    "OCEAN_BLUE", "SUNSET_ORANGE", "FOREST_GREEN", "PURPLE_DREAM", "DARK_MODE",
]);

export const profileLayoutEnum = pgEnum("ProfileLayout", [
    "DEFAULT", "MINIMAL", "SHOWCASE", "PORTFOLIO",
]);

export const profileVisibilityEnum = pgEnum("ProfileVisibility", [
    "PUBLIC", "FOLLOWERS", "PRIVATE",
]);

export const portfolioProjectSourceEnum = pgEnum("PortfolioProjectSource", [
    "PROFILE", "CONCEPTS", "RESUMECREATOR",
]);

export const featureNotifySectionEnum = pgEnum("FeatureNotifySection", [
    "AI_TOOLS", "MOCK_VIDEO", "MOCK_COMPANYWISE", "MOCK_PEERTOPEER",
    "MOCK_CONNECT", "AI_PORTFOLIO_AUDIT", "AI_SYSTEM_ARCHITECT",
    "AI_PROJECT_SCOPER", "AI_OSS_SCOUT", "AI_DOCUSMITH",
    "AI_CODE_SENTINEL", "AI_TEST_FORGE",
]);

// ─── Work Experience ──────────────────────────────────────────────────────────

export const workExperiences = pgTable("WorkExperience", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    companyName: text("companyName").notNull(),
    companyLogo: text("companyLogo"),
    roleTitle: text("roleTitle").notNull(),
    companyWebsite: text("companyWebsite"),
    description: text("description"),
    bulletPoints: text("bulletPoints").array().notNull().default([]),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate"),
    isCurrentlyWorking: boolean("isCurrentlyWorking").notNull().default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
}, (t) => [index("idx_workExp_userId").on(t.userId)]);

// ─── User Education ───────────────────────────────────────────────────────────

export const userEducations = pgTable("UserEducation", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    degree: text("degree"),
    institution: text("institution").notNull(),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate"),
    bulletPoints: text("bulletPoints").array().notNull().default([]),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
}, (t) => [index("idx_userEdu_userId").on(t.userId)]);

// ─── Social Links ─────────────────────────────────────────────────────────────

export const socialLinks = pgTable("SocialLink", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(),
    url: text("url").notNull(),
    label: text("label"),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
}, (t) => [
    uniqueIndex("uq_socialLink_userId_platform").on(t.userId, t.platform),
    index("idx_socialLink_userId").on(t.userId),
]);

// ─── Portfolio Projects ───────────────────────────────────────────────────────

export const portfolioProjects = pgTable("PortfolioProject", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    projectName: text("projectName").notNull(),
    projectType: text("projectType").notNull(),
    description: text("description"),
    bulletPoints: text("bulletPoints").array().notNull().default([]),
    status: text("status").notNull().default("In Progress"),
    visibility: text("visibility").notNull().default("Public"),
    technologies: text("technologies").array().notNull().default([]),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate"),
    thumbnailUrl: text("thumbnailUrl"),
    source: portfolioProjectSourceEnum("source").notNull().default("PROFILE"),
    learnStepId: text("learnStepId"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
}, (t) => [
    index("idx_portfolio_userId").on(t.userId),
    index("idx_portfolio_learnStepId").on(t.learnStepId),
    index("idx_portfolio_source").on(t.source),
]);

export const projectLinks = pgTable("ProjectLink", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    projectId: text("projectId").notNull().references(() => portfolioProjects.id, { onDelete: "cascade" }),
    linkType: text("linkType").notNull(),
    url: text("url").notNull(),
    description: text("description"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (t) => [index("idx_projectLink_projectId").on(t.projectId)]);

export const projectMedia = pgTable("ProjectMedia", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    projectId: text("projectId").notNull().references(() => portfolioProjects.id, { onDelete: "cascade" }),
    mediaUrl: text("mediaUrl").notNull(),
    mediaType: text("mediaType").notNull(),
    caption: text("caption"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (t) => [index("idx_projectMedia_projectId").on(t.projectId)]);

// ─── Skills (legacy relation model) ──────────────────────────────────────────

export const skills = pgTable("Skills", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    name: text("name").notNull(),
    level: text("level").notNull(),
    category: skillCategoryEnum("category").notNull(),
    order: integer("order").notNull().default(0),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (t) => [index("idx_skills_userId").on(t.userId)]);

export const skillEndorsements = pgTable("SkillEndorsement", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    skillId: text("skillId").notNull().references(() => skills.id, { onDelete: "cascade" }),
    endorserId: text("endorserId").notNull(),
    message: text("message"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (t) => [
    uniqueIndex("uq_skillEndorse_skillId_endorserId").on(t.skillId, t.endorserId),
    index("idx_skillEndorse_skillId").on(t.skillId),
    index("idx_skillEndorse_endorserId").on(t.endorserId),
]);

// ─── Certifications ───────────────────────────────────────────────────────────

export const certifications = pgTable("Certifications", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    name: text("name").notNull(),
    issuer: text("issuer").notNull(),
    issuedDate: timestamp("issuedDate").notNull(),
    link: text("link").notNull(),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (t) => [index("idx_cert_userId").on(t.userId)]);

// ─── Recent Activity (legacy) ─────────────────────────────────────────────────

export const recentActivities = pgTable("RecentActivity", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    activityType: text("activityType"),
    description: text("description"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (t) => [index("idx_recentActivity_userId").on(t.userId)]);

// ─── Achievements (legacy) ────────────────────────────────────────────────────

export const achievements = pgTable("Achievements", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    title: text("title").notNull(),
    description: text("description").notNull(),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (t) => [index("idx_achievements_userId").on(t.userId)]);

// ─── Reward ───────────────────────────────────────────────────────────────────

export const rewards = pgTable("Reward", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    type: text("type").notNull(),
    xp: integer("xp"),
    credits: integer("credits").notNull(),
    amount: integer("amount"),
    description: text("description").notNull(),
    feedbackId: text("feedbackId").unique().notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
});

// ─── User Profile ─────────────────────────────────────────────────────────────

export const userProfiles = pgTable("UserProfile", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("userId").unique().notNull().references(() => users.id, { onDelete: "cascade" }),
    coverGradient: text("coverGradient").default("#F59E0B,#FBBF24"),
    theme: profileThemeEnum("theme").notNull().default("OCEAN_BLUE"),
    layout: profileLayoutEnum("layout").notNull().default("DEFAULT"),
    tagline: text("tagline"),
    visibility: profileVisibilityEnum("visibility").notNull().default("PUBLIC"),
    showEmail: boolean("showEmail").notNull().default(false),
    showResume: boolean("showResume").notNull().default(true),
    showActivity: boolean("showActivity").notNull().default(true),
    showStats: boolean("showStats").notNull().default(true),
    allowEndorsements: boolean("allowEndorsements").notNull().default(true),
    allowMessages: boolean("allowMessages").notNull().default(true),
    profileViews: integer("profileViews").notNull().default(0),
    completionScore: integer("completionScore").notNull().default(0),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
});

export const profileViews = pgTable("ProfileView", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    profileId: text("profileId").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
    viewerId: text("viewerId"),
    source: text("source"),
    referrer: text("referrer"),
    userAgent: text("userAgent"),
    ipAddress: text("ipAddress"),
    country: text("country"),
    city: text("city"),
    viewedAt: timestamp("viewedAt").notNull().defaultNow(),
}, (t) => [
    index("idx_profileView_profileId").on(t.profileId),
    index("idx_profileView_viewerId").on(t.viewerId),
    index("idx_profileView_viewedAt").on(t.viewedAt),
]);

// ─── Newsletter ───────────────────────────────────────────────────────────────

export const newsletters = pgTable("Newsletter", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    email: text("email").unique().notNull(),
    subscribedAt: timestamp("subscribedAt").notNull().defaultNow(),
    isActive: boolean("isActive").notNull().default(true),
}, (t) => [
    index("idx_newsletter_email").on(t.email),
    index("idx_newsletter_subscribedAt").on(t.subscribedAt),
]);

// ─── Contact Messages ─────────────────────────────────────────────────────────

export const contactMessages = pgTable("contact_submissions", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    message: text("message"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// ─── Feature Notify Interest ──────────────────────────────────────────────────

export const featureNotifyInterests = pgTable("FeatureNotifyInterest", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    section: featureNotifySectionEnum("section").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (t) => [
    uniqueIndex("uq_featureNotify_userId_section_title").on(t.userId, t.section, t.title),
    index("idx_featureNotify_userId").on(t.userId),
    index("idx_featureNotify_section").on(t.section),
    index("idx_featureNotify_createdAt").on(t.createdAt),
]);

// ─── Config (system-level key-value) ─────────────────────────────────────────

export const configs = pgTable("Config", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    key: text("key").unique().notNull(),
    value: jsonb("value").notNull(),
    description: text("description"),
    updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
}, (t) => [index("idx_config_key").on(t.key)]);

// ─── User DSA Tracking ────────────────────────────────────────────────────────

export const userDSATrackingEntries = pgTable("UserDSATrackingEntry", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    problemId: text("problemId").notNull(),
    status: text("status").notNull().default("IN_PROGRESS"),
    lastAttemptAt: timestamp("lastAttemptAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
}, (t) => [
    uniqueIndex("uq_dsaTrack_userId_problemId").on(t.userId, t.problemId),
    index("idx_dsaTrack_userId").on(t.userId),
]);

// ─── Relations ────────────────────────────────────────────────────────────────

export const workExperiencesRelations = relations(workExperiences, ({ one }) => ({
    user: one(users, { fields: [workExperiences.userId], references: [users.id] }),
}));

export const userEducationsRelations = relations(userEducations, ({ one }) => ({
    user: one(users, { fields: [userEducations.userId], references: [users.id] }),
}));

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
    user: one(users, { fields: [socialLinks.userId], references: [users.id] }),
}));

export const portfolioProjectsRelations = relations(portfolioProjects, ({ one, many }) => ({
    user: one(users, { fields: [portfolioProjects.userId], references: [users.id] }),
    links: many(projectLinks),
    media: many(projectMedia),
}));

export const projectLinksRelations = relations(projectLinks, ({ one }) => ({
    project: one(portfolioProjects, { fields: [projectLinks.projectId], references: [portfolioProjects.id] }),
}));

export const projectMediaRelations = relations(projectMedia, ({ one }) => ({
    project: one(portfolioProjects, { fields: [projectMedia.projectId], references: [portfolioProjects.id] }),
}));

export const skillsRelations = relations(skills, ({ one, many }) => ({
    user: one(users, { fields: [skills.userId], references: [users.id] }),
    endorsements: many(skillEndorsements),
}));

export const skillEndorsementsRelations = relations(skillEndorsements, ({ one }) => ({
    skill: one(skills, { fields: [skillEndorsements.skillId], references: [skills.id] }),
}));

export const certificationsRelations = relations(certifications, ({ one }) => ({
    user: one(users, { fields: [certifications.userId], references: [users.id] }),
}));

export const recentActivitiesRelations = relations(recentActivities, ({ one }) => ({
    user: one(users, { fields: [recentActivities.userId], references: [users.id] }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
    user: one(users, { fields: [achievements.userId], references: [users.id] }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one, many }) => ({
    user: one(users, { fields: [userProfiles.userId], references: [users.id] }),
    views: many(profileViews),
}));

export const profileViewsRelations = relations(profileViews, ({ one }) => ({
    profile: one(userProfiles, { fields: [profileViews.profileId], references: [userProfiles.id] }),
}));

export const featureNotifyInterestsRelations = relations(featureNotifyInterests, ({ one }) => ({
    user: one(users, { fields: [featureNotifyInterests.userId], references: [users.id] }),
}));

export const userDSATrackingEntriesRelations = relations(userDSATrackingEntries, ({ one }) => ({
    user: one(users, { fields: [userDSATrackingEntries.userId], references: [users.id] }),
}));
