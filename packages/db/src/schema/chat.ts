import {
    pgTable,
    pgEnum,
    text,
    boolean,
    timestamp,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./schema";

// ===========================
// Enums
// ===========================

export const followRequestStatusEnum = pgEnum("FollowRequestStatus", [
    "PENDING",
    "ACCEPTED",
    "REJECTED",
]);

export const chatMessageTypeEnum = pgEnum("ChatMessageType", [
    "TEXT",
    "IMAGE",
]);

export const chatMessageStatusEnum = pgEnum("ChatMessageStatus", [
    "SENT",
    "DELIVERED",
    "READ",
]);

// ===========================
// follow
// ===========================

export const follow = pgTable(
    "Follow",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        followerId: text("followerId").notNull().references(() => users.id, { onDelete: "cascade" }),
        followingId: text("followingId").notNull().references(() => users.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        uniqueIndex("follow_followerId_followingId_key").on(t.followerId, t.followingId),
        index("follow_followerId_idx").on(t.followerId),
        index("follow_followingId_idx").on(t.followingId),
    ]
);

export const followRelations = relations(follow, ({ one }) => ({
    follower: one(users, {
        fields: [follow.followerId],
        references: [users.id],
        relationName: "Follower",
    }),
    following: one(users, {
        fields: [follow.followingId],
        references: [users.id],
        relationName: "Following",
    }),
}));

// ===========================
// followRequest
// ===========================

export const followRequest = pgTable(
    "FollowRequest",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        senderId: text("senderId").notNull().references(() => users.id, { onDelete: "cascade" }),
        receiverId: text("receiverId").notNull().references(() => users.id, { onDelete: "cascade" }),
        status: followRequestStatusEnum("status").notNull().default("PENDING"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdateFn(() => new Date()),
    },
    (t) => [
        uniqueIndex("followRequest_senderId_receiverId_key").on(t.senderId, t.receiverId),
        index("followRequest_senderId_idx").on(t.senderId),
        index("followRequest_receiverId_idx").on(t.receiverId),
    ]
);

export const followRequestRelations = relations(followRequest, ({ one }) => ({
    sender: one(users, {
        fields: [followRequest.senderId],
        references: [users.id],
        relationName: "FollowRequestSender",
    }),
    receiver: one(users, {
        fields: [followRequest.receiverId],
        references: [users.id],
        relationName: "FollowRequestReceiver",
    }),
}));

// ===========================
// conversation
// ===========================

export const conversation = pgTable(
    "Conversation",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        participant1Id: text("participant1Id").notNull().references(() => users.id, { onDelete: "cascade" }),
        participant2Id: text("participant2Id").notNull().references(() => users.id, { onDelete: "cascade" }),
        lastMessageAt: timestamp("lastMessageAt"),
        lastMessageText: text("lastMessageText"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdateFn(() => new Date()),
    },
    (t) => [
        uniqueIndex("conversation_participant1Id_participant2Id_key").on(t.participant1Id, t.participant2Id),
        index("conversation_participant1Id_idx").on(t.participant1Id),
        index("conversation_participant2Id_idx").on(t.participant2Id),
        index("conversation_lastMessageAt_idx").on(t.lastMessageAt),
    ]
);

export const conversationRelations = relations(conversation, ({ one, many }) => ({
    participant1: one(users, {
        fields: [conversation.participant1Id],
        references: [users.id],
        relationName: "ConversationParticipant1",
    }),
    participant2: one(users, {
        fields: [conversation.participant2Id],
        references: [users.id],
        relationName: "ConversationParticipant2",
    }),
    messages: many(chatMessage),
}));

// ===========================
// chatMessage
// ===========================

export const chatMessage = pgTable(
    "ChatMessage",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        conversationId: text("conversationId").notNull().references(() => conversation.id, { onDelete: "cascade" }),
        senderId: text("senderId").notNull().references(() => users.id, { onDelete: "cascade" }),
        type: chatMessageTypeEnum("type").notNull().default("TEXT"),
        content: text("content").notNull(),
        imageUrl: text("imageUrl"),
        status: chatMessageStatusEnum("status").notNull().default("SENT"),
        readAt: timestamp("readAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("chatMessage_conversationId_idx").on(t.conversationId),
        index("chatMessage_senderId_idx").on(t.senderId),
        index("chatMessage_createdAt_idx").on(t.createdAt),
    ]
);

export const chatMessageRelations = relations(chatMessage, ({ one }) => ({
    conversation: one(conversation, {
        fields: [chatMessage.conversationId],
        references: [conversation.id],
    }),
    sender: one(users, {
        fields: [chatMessage.senderId],
        references: [users.id],
        relationName: "ChatMessageSender",
    }),
}));

// ===========================
// chatSettings
// ===========================

export const chatSettings = pgTable("ChatSettings", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
    messageNotifications: boolean("messageNotifications").notNull().default(true),
    soundEnabled: boolean("soundEnabled").notNull().default(true),
    allowMessagesFrom: text("allowMessagesFrom").notNull().default("followers"),
    showOnlineStatus: boolean("showOnlineStatus").notNull().default(true),
    showReadReceipts: boolean("showReadReceipts").notNull().default(true),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const chatSettingsRelations = relations(chatSettings, ({ one }) => ({
    user: one(users, {
        fields: [chatSettings.userId],
        references: [users.id],
        relationName: "UserChatSettings",
    }),
}));
