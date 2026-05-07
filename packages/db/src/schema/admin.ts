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

// ===========================
// Enums
// ===========================

export const adminRoleEnum = pgEnum("AdminRole", [
    "SUPER_ADMIN",
    "CONTENT_ADMIN",
    "FINANCE_ADMIN",
    "COMMUNITY_ADMIN",
    "MODULE_MANAGER",
    "VIEWER",
]);

export const adminStatusEnum = pgEnum("AdminStatus", [
    "ACTIVE",
    "INACTIVE",
    "SUSPENDED",
]);

export const adminInviteStatusEnum = pgEnum("AdminInviteStatus", [
    "PENDING",
    "USED",
    "EXPIRED",
    "REVOKED",
]);

// ===========================
// Tables
// ===========================

export const adminAccess = pgTable(
    "AdminAccess",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .unique()
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        adminRole: adminRoleEnum("adminRole").notNull().default("MODULE_MANAGER"),
        status: adminStatusEnum("status").notNull().default("ACTIVE"),
        permissions: jsonb("permissions").notNull().default({}),
        lastLoginAt: timestamp("lastLoginAt"),
        loginCount: integer("loginCount").notNull().default(0),
        invitedBy: text("invitedBy"),
        inviteCode: text("inviteCode"),
        hashedPassword: text("hashedPassword"),
        accessCode: text("accessCode"),
        accessCodeExpiry: timestamp("accessCodeExpiry"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_adminAccess_adminRole").on(table.adminRole),
        index("idx_adminAccess_status").on(table.status),
        index("idx_adminAccess_userId").on(table.userId),
    ],
);

export const adminInvitations = pgTable(
    "AdminInvitation",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        code: text("code")
            .unique()
            .notNull()
            .$defaultFn(() => createId()),
        email: text("email").notNull(),
        name: text("name"),
        adminRole: adminRoleEnum("adminRole").notNull(),
        permissions: jsonb("permissions").notNull().default({}),
        status: adminInviteStatusEnum("status").notNull().default("PENDING"),
        usedBy: text("usedBy"),
        usedAt: timestamp("usedAt"),
        expiresAt: timestamp("expiresAt").notNull(),
        createdById: text("createdById")
            .notNull()
            .references(() => adminAccess.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_adminInvitation_code").on(table.code),
        index("idx_adminInvitation_email").on(table.email),
        index("idx_adminInvitation_status").on(table.status),
        index("idx_adminInvitation_expiresAt").on(table.expiresAt),
        index("idx_adminInvitation_createdById").on(table.createdById),
    ],
);

export const adminAuditLogs = pgTable(
    "AdminAuditLog",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        adminId: text("adminId")
            .notNull()
            .references(() => adminAccess.id, { onDelete: "cascade" }),
        action: text("action").notNull(),
        module: text("module").notNull(),
        resourceType: text("resourceType"),
        resourceId: text("resourceId"),
        description: text("description"),
        changes: jsonb("changes"),
        metadata: jsonb("metadata"),
        ipAddress: text("ipAddress"),
        userAgent: text("userAgent"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_adminAuditLog_adminId").on(table.adminId),
        index("idx_adminAuditLog_module").on(table.module),
        index("idx_adminAuditLog_action").on(table.action),
        index("idx_adminAuditLog_createdAt").on(table.createdAt),
        index("idx_adminAuditLog_resourceType_resourceId").on(table.resourceType, table.resourceId),
    ],
);

export const adminDashboardStats = pgTable(
    "AdminDashboardStats",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        statType: text("statType").unique().notNull(),
        data: jsonb("data").notNull(),
        lastUpdatedAt: timestamp("lastUpdatedAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_adminDashboardStats_statType").on(table.statType),
        index("idx_adminDashboardStats_lastUpdatedAt").on(table.lastUpdatedAt),
    ],
);

export const adminNotifications = pgTable(
    "AdminNotification",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        adminId: text("adminId"),
        title: text("title").notNull(),
        message: text("message").notNull(),
        type: text("type").notNull().default("info"),
        actionUrl: text("actionUrl"),
        actionLabel: text("actionLabel"),
        isRead: boolean("isRead").notNull().default(false),
        readAt: timestamp("readAt"),
        metadata: jsonb("metadata"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_adminNotification_adminId").on(table.adminId),
        index("idx_adminNotification_isRead").on(table.isRead),
        index("idx_adminNotification_createdAt").on(table.createdAt),
    ],
);

export const adminSystemSettings = pgTable(
    "AdminSystemSettings",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        key: text("key").unique().notNull(),
        value: jsonb("value").notNull(),
        description: text("description"),
        lastModifiedBy: text("lastModifiedBy"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_adminSystemSettings_key").on(table.key),
    ],
);

// ===========================
// Relations
// ===========================

export const adminAccessRelations = relations(adminAccess, ({ one, many }) => ({
    user: one(users, {
        fields: [adminAccess.userId],
        references: [users.id],
    }),
    invitations: many(adminInvitations),
    auditLogs: many(adminAuditLogs),
}));

export const adminInvitationsRelations = relations(adminInvitations, ({ one }) => ({
    createdBy: one(adminAccess, {
        fields: [adminInvitations.createdById],
        references: [adminAccess.id],
    }),
}));

export const adminAuditLogsRelations = relations(adminAuditLogs, ({ one }) => ({
    admin: one(adminAccess, {
        fields: [adminAuditLogs.adminId],
        references: [adminAccess.id],
    }),
}));
