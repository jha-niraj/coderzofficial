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
    decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users, creditTypeEnum, creditRequestStatusEnum, paymentStatusEnum, currencyEnum } from "./schema.js";

// ===========================
// Enums
// ===========================

export const moduleEnum = pgEnum("Module", [
    "PATHFINDER",
    "CONCEPTS",
    "RESUME_TEMPLATE",
    "RESUME_DRAFT",
]);

// ===========================
// Tables
// ===========================

export const subTransactions = pgTable(
    "SubTransaction",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        creditTransactionId: text("creditTransactionId").notNull().unique().references(() => creditTransactions.id, { onDelete: "cascade" }),
        module: moduleEnum("module").notNull(),
        referenceId: text("referenceId"),
        metadata: jsonb("metadata"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        index("subTransaction_module_idx").on(t.module),
        index("subTransaction_referenceId_idx").on(t.referenceId),
        index("subTransaction_module_referenceId_idx").on(t.module, t.referenceId),
    ]
);

export const earnings = pgTable(
    "Earning",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull(),
        module: moduleEnum("module").notNull(),
        referenceId: text("referenceId"),
        amount: integer("amount").notNull(),
        sourceUserId: text("sourceUserId"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        index("earning_userId_idx").on(t.userId),
        index("earning_module_idx").on(t.module),
        index("earning_referenceId_idx").on(t.referenceId),
        index("earning_userId_module_idx").on(t.userId, t.module),
    ]
);

export const referrals = pgTable(
    "Referral",
    {
        id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
        referrerId: text("referrerId").notNull().references(() => users.id),
        referredUserId: text("referredUserId").notNull().unique().references(() => users.id),
        referralCode: text("referralCode").notNull(),
        pointsAwarded: boolean("pointsAwarded").notNull().default(false),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        index("referral_referrerId_idx").on(t.referrerId),
        index("referral_referralCode_idx").on(t.referralCode),
    ]
);

export const creditTransfers = pgTable(
    "CreditTransfer",
    {
        id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
        senderId: text("senderId").notNull().references(() => users.id),
        receiverId: text("receiverId").notNull().references(() => users.id),
        amount: integer("amount").notNull(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        transferReference: text("transferReference").notNull().unique().$defaultFn(() => createId()),
    },
    (t) => [
        index("creditTransfer_senderId_idx").on(t.senderId),
        index("creditTransfer_receiverId_idx").on(t.receiverId),
    ]
);

export const creditTransactions = pgTable(
    "CreditTransaction",
    {
        id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
        userId: text("userId").notNull().references(() => users.id),
        currency: currencyEnum("currency").notNull(),
        amount: integer("amount").notNull(),
        type: creditTypeEnum("type").notNull(),
        description: text("description").notNull(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        paymentId: text("paymentId"),
    },
    (t) => [
        index("creditTransaction_userId_idx").on(t.userId),
        index("creditTransaction_paymentId_idx").on(t.paymentId),
        index("creditTransaction_createdAt_idx").on(t.createdAt),
    ]
);

export const creditRequests = pgTable(
    "CreditRequest",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id),
        requestedCredits: integer("requestedCredits").notNull(),
        linkedinPostUrl: text("linkedinPostUrl").notNull(),
        twitterPostUrl: text("twitterPostUrl"),
        status: creditRequestStatusEnum("status").notNull().default("PENDING"),
        adminNotes: text("adminNotes"),
        processedAt: timestamp("processedAt"),
        processedBy: text("processedBy"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("creditRequest_userId_idx").on(t.userId),
        index("creditRequest_status_idx").on(t.status),
        index("creditRequest_createdAt_idx").on(t.createdAt),
    ]
);

export const creditTransferOuts = pgTable(
    "CreditTransferOut",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id),
        userEmail: text("userEmail").notNull(),
        creditsTransferred: integer("creditsTransferred").notNull(),
        destinationPlatform: text("destinationPlatform").notNull().default("truefool"),
        transferId: text("transferId").notNull(),
        status: text("status").notNull().default("COMPLETED"),
        ipAddress: text("ipAddress"),
        userAgent: text("userAgent"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        index("creditTransferOut_userId_idx").on(t.userId),
        index("creditTransferOut_transferId_idx").on(t.transferId),
        index("creditTransferOut_createdAt_idx").on(t.createdAt),
    ]
);

export const payments = pgTable(
    "Payment",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id),
        credits: integer("credits").notNull(),
        amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
        currency: currencyEnum("currency").notNull().default("INR"),
        status: paymentStatusEnum("status").notNull().default("PENDING"),
        orderId: text("orderId").unique(),
        paymentId: text("paymentId").unique(),
        razorpayOrderId: text("razorpayOrderId").unique(),
        signature: text("signature"),
        receipt: text("receipt"),
        notes: jsonb("notes"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
        completedAt: timestamp("completedAt"),
    },
    (t) => [
        index("payment_userId_idx").on(t.userId),
        index("payment_status_idx").on(t.status),
        index("payment_orderId_idx").on(t.orderId),
        index("payment_paymentId_idx").on(t.paymentId),
        index("payment_createdAt_idx").on(t.createdAt),
    ]
);

// ===========================
// Relations
// ===========================

export const subTransactionsRelations = relations(subTransactions, ({ one }) => ({
    creditTransaction: one(creditTransactions, {
        fields: [subTransactions.creditTransactionId],
        references: [creditTransactions.id],
    }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
    referrer: one(users, {
        fields: [referrals.referrerId],
        references: [users.id],
        relationName: "Referrer",
    }),
    referredUser: one(users, {
        fields: [referrals.referredUserId],
        references: [users.id],
        relationName: "ReferredUser",
    }),
}));

export const creditTransfersRelations = relations(creditTransfers, ({ one }) => ({
    sender: one(users, {
        fields: [creditTransfers.senderId],
        references: [users.id],
        relationName: "Sender",
    }),
    receiver: one(users, {
        fields: [creditTransfers.receiverId],
        references: [users.id],
        relationName: "Receiver",
    }),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one, many }) => ({
    user: one(users, {
        fields: [creditTransactions.userId],
        references: [users.id],
    }),
    subTransaction: many(subTransactions),
}));

export const creditRequestsRelations = relations(creditRequests, ({ one }) => ({
    user: one(users, {
        fields: [creditRequests.userId],
        references: [users.id],
    }),
}));

export const creditTransferOutsRelations = relations(creditTransferOuts, ({ one }) => ({
    user: one(users, {
        fields: [creditTransferOuts.userId],
        references: [users.id],
    }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    user: one(users, {
        fields: [payments.userId],
        references: [users.id],
    }),
}));
