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
    varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./schema.js";

// ===========================
// Enums
// ===========================

export const communityTypeEnum = pgEnum("CommunityType", [
    "OFFICIAL",
    "USER_CREATED",
    "ORGANIZATION",
]);

export const communityVisibilityEnum = pgEnum("CommunityVisibility", [
    "PUBLIC",
    "PRIVATE",
    "RESTRICTED",
]);

export const communityRoleEnum = pgEnum("CommunityRole", [
    "OWNER",
    "ADMIN",
    "MODERATOR",
    "MEMBER",
]);

export const communityPostTypeEnum = pgEnum("CommunityPostType", [
    "DISCUSSION",
    "QUESTION",
    "RESOURCE",
    "SHOWCASE",
    "EVENT",
    "POLL",
    "CHALLENGE",
    "HELP_REQUEST",
    "ANNOUNCEMENT",
]);

export const communityResourceTypeEnum = pgEnum("CommunityResourceType", [
    "PDF",
    "VIDEO",
    "LINK",
    "CODE",
    "IMAGE",
    "OTHER",
]);

export const communityEventStatusEnum = pgEnum("CommunityEventStatus", [
    "UPCOMING",
    "ONGOING",
    "COMPLETED",
    "CANCELLED",
]);

export const attendeeStatusEnum = pgEnum("AttendeeStatus", [
    "GOING",
    "INTERESTED",
    "NOT_GOING",
]);

// ===========================
// Tables
// ===========================

export const communities = pgTable(
    "Community",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        name: text("name").notNull(),
        slug: text("slug").notNull().unique(),
        description: text("description").notNull(),
        shortDescription: varchar("shortDescription", { length: 200 }),
        coverImage: text("coverImage"),
        logo: text("logo"),
        themeColor: text("themeColor").notNull().default("#3B82F6"),
        type: communityTypeEnum("type").notNull().default("USER_CREATED"),
        visibility: communityVisibilityEnum("visibility").notNull().default("PUBLIC"),
        category: text("category").notNull().default("General"),
        isVerified: boolean("isVerified").notNull().default(false),
        verifiedAt: timestamp("verifiedAt"),
        verificationReason: text("verificationReason"),
        enabledSections: text("enabledSections").array().notNull().default([]),
        rules: text("rules").array().notNull().default([]),
        tags: text("tags").array().notNull().default([]),
        settings: jsonb("settings"),
        joinQuestions: text("joinQuestions").array().notNull().default([]),
        websiteUrl: text("websiteUrl"),
        contactEmail: text("contactEmail"),
        twitterUrl: text("twitterUrl"),
        instagramUrl: text("instagramUrl"),
        discordUrl: text("discordUrl"),
        githubUrl: text("githubUrl"),
        linkedinUrl: text("linkedinUrl"),
        youtubeUrl: text("youtubeUrl"),
        memberCount: integer("memberCount").notNull().default(0),
        postCount: integer("postCount").notNull().default(0),
        isFeatured: boolean("isFeatured").notNull().default(false),
        featuredAt: timestamp("featuredAt"),
        creatorId: text("creatorId").notNull().references(() => users.id),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("community_slug_idx").on(t.slug),
        index("community_type_idx").on(t.type),
        index("community_visibility_idx").on(t.visibility),
        index("community_category_idx").on(t.category),
        index("community_creatorId_idx").on(t.creatorId),
        index("community_isFeatured_idx").on(t.isFeatured),
        index("community_memberCount_idx").on(t.memberCount),
    ]
);

export const communityMembers = pgTable(
    "CommunityMember",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        communityId: text("communityId").notNull().references(() => communities.id, { onDelete: "cascade" }),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        role: communityRoleEnum("role").notNull().default("MEMBER"),
        joinedAt: timestamp("joinedAt").notNull().defaultNow(),
        notifyPosts: boolean("notifyPosts").notNull().default(true),
        notifyMentions: boolean("notifyMentions").notNull().default(true),
        notifyEvents: boolean("notifyEvents").notNull().default(true),
        postCount: integer("postCount").notNull().default(0),
        helpfulCount: integer("helpfulCount").notNull().default(0),
        isApproved: boolean("isApproved").notNull().default(true),
        approvedAt: timestamp("approvedAt"),
        approvedBy: text("approvedBy"),
        joinAnswers: jsonb("joinAnswers"),
    },
    (t) => [
        uniqueIndex("communityMember_communityId_userId_key").on(t.communityId, t.userId),
        index("communityMember_communityId_idx").on(t.communityId),
        index("communityMember_userId_idx").on(t.userId),
        index("communityMember_role_idx").on(t.role),
    ]
);

export const communityPosts = pgTable(
    "CommunityPost",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        communityId: text("communityId").references(() => communities.id, { onDelete: "cascade" }),
        authorId: text("authorId").notNull().references(() => users.id),
        title: text("title"),
        content: text("content").notNull(),
        type: communityPostTypeEnum("type").notNull().default("DISCUSSION"),
        attachments: jsonb("attachments"),
        embeds: jsonb("embeds"),
        codeBlocks: jsonb("codeBlocks"),
        isPinned: boolean("isPinned").notNull().default(false),
        isLocked: boolean("isLocked").notNull().default(false),
        isEdited: boolean("isEdited").notNull().default(false),
        editedAt: timestamp("editedAt"),
        isAnswered: boolean("isAnswered").notNull().default(false),
        acceptedAnswerId: text("acceptedAnswerId"),
        isResolved: boolean("isResolved").notNull().default(false),
        resolvedAt: timestamp("resolvedAt"),
        tags: text("tags").array().notNull().default([]),
        likeCount: integer("likeCount").notNull().default(0),
        commentCount: integer("commentCount").notNull().default(0),
        viewCount: integer("viewCount").notNull().default(0),
        shareCount: integer("shareCount").notNull().default(0),
        linkedProjectId: text("linkedProjectId"),
        linkedMockId: text("linkedMockId"),
        linkedLearnId: text("linkedLearnId"),
        officialChannel: text("officialChannel"),
        slug: text("slug").unique(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("communityPost_communityId_idx").on(t.communityId),
        index("communityPost_authorId_idx").on(t.authorId),
        index("communityPost_type_idx").on(t.type),
        index("communityPost_isPinned_idx").on(t.isPinned),
        index("communityPost_createdAt_idx").on(t.createdAt),
        index("communityPost_likeCount_idx").on(t.likeCount),
    ]
);

export const communityPostLikes = pgTable(
    "CommunityPostLike",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        postId: text("postId").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        uniqueIndex("communityPostLike_postId_userId_key").on(t.postId, t.userId),
        index("communityPostLike_postId_idx").on(t.postId),
        index("communityPostLike_userId_idx").on(t.userId),
    ]
);

export const communityComments = pgTable(
    "CommunityComment",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        postId: text("postId").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
        authorId: text("authorId").notNull().references(() => users.id),
        content: text("content").notNull(),
        parentId: text("parentId"),
        isAccepted: boolean("isAccepted").notNull().default(false),
        isEdited: boolean("isEdited").notNull().default(false),
        editedAt: timestamp("editedAt"),
        likeCount: integer("likeCount").notNull().default(0),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("communityComment_postId_idx").on(t.postId),
        index("communityComment_authorId_idx").on(t.authorId),
        index("communityComment_parentId_idx").on(t.parentId),
    ]
);

export const communityCommentLikes = pgTable(
    "CommunityCommentLike",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        commentId: text("commentId").notNull().references(() => communityComments.id, { onDelete: "cascade" }),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        uniqueIndex("communityCommentLike_commentId_userId_key").on(t.commentId, t.userId),
        index("communityCommentLike_commentId_idx").on(t.commentId),
        index("communityCommentLike_userId_idx").on(t.userId),
    ]
);

export const communityResources = pgTable(
    "CommunityResource",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        communityId: text("communityId").notNull().references(() => communities.id, { onDelete: "cascade" }),
        uploaderId: text("uploaderId").notNull().references(() => users.id),
        title: text("title").notNull(),
        description: text("description"),
        type: communityResourceTypeEnum("type").notNull(),
        url: text("url").notNull(),
        thumbnailUrl: text("thumbnailUrl"),
        fileSize: integer("fileSize"),
        mimeType: text("mimeType"),
        folder: text("folder"),
        tags: text("tags").array().notNull().default([]),
        downloadCount: integer("downloadCount").notNull().default(0),
        viewCount: integer("viewCount").notNull().default(0),
        isPinned: boolean("isPinned").notNull().default(false),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("communityResource_communityId_idx").on(t.communityId),
        index("communityResource_uploaderId_idx").on(t.uploaderId),
        index("communityResource_type_idx").on(t.type),
        index("communityResource_folder_idx").on(t.folder),
    ]
);

export const communityEvents = pgTable(
    "CommunityEvent",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        communityId: text("communityId").notNull().references(() => communities.id, { onDelete: "cascade" }),
        creatorId: text("creatorId").notNull().references(() => users.id),
        title: text("title").notNull(),
        description: text("description").notNull(),
        coverImage: text("coverImage"),
        startDate: timestamp("startDate").notNull(),
        endDate: timestamp("endDate"),
        timezone: text("timezone").notNull().default("UTC"),
        isAllDay: boolean("isAllDay").notNull().default(false),
        locationType: text("locationType").notNull().default("online"),
        location: text("location"),
        meetingLink: text("meetingLink"),
        maxAttendees: integer("maxAttendees"),
        currentAttendees: integer("currentAttendees").notNull().default(0),
        status: communityEventStatusEnum("status").notNull().default("UPCOMING"),
        isRecurring: boolean("isRecurring").notNull().default(false),
        recurrenceRule: text("recurrenceRule"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("communityEvent_communityId_idx").on(t.communityId),
        index("communityEvent_creatorId_idx").on(t.creatorId),
        index("communityEvent_startDate_idx").on(t.startDate),
        index("communityEvent_status_idx").on(t.status),
    ]
);

export const communityEventAttendees = pgTable(
    "CommunityEventAttendee",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        eventId: text("eventId").notNull().references(() => communityEvents.id, { onDelete: "cascade" }),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        status: attendeeStatusEnum("status").notNull().default("GOING"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        uniqueIndex("communityEventAttendee_eventId_userId_key").on(t.eventId, t.userId),
        index("communityEventAttendee_eventId_idx").on(t.eventId),
        index("communityEventAttendee_userId_idx").on(t.userId),
    ]
);

export const communityChallengesNew = pgTable(
    "CommunityChallengeNew",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        communityId: text("communityId").notNull().references(() => communities.id, { onDelete: "cascade" }),
        creatorId: text("creatorId").notNull().references(() => users.id),
        title: text("title").notNull(),
        description: text("description").notNull(),
        rules: text("rules"),
        startDate: timestamp("startDate").notNull(),
        endDate: timestamp("endDate").notNull(),
        prizeCredits: integer("prizeCredits"),
        prizeBadge: text("prizeBadge"),
        prizeDescription: text("prizeDescription"),
        maxSubmissions: integer("maxSubmissions"),
        submissionCount: integer("submissionCount").notNull().default(0),
        isActive: boolean("isActive").notNull().default(true),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("communityChallengeNew_communityId_idx").on(t.communityId),
        index("communityChallengeNew_creatorId_idx").on(t.creatorId),
        index("communityChallengeNew_endDate_idx").on(t.endDate),
        index("communityChallengeNew_isActive_idx").on(t.isActive),
    ]
);

export const communityChallengeSubmissions = pgTable(
    "CommunityChallengeSubmission",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        challengeId: text("challengeId").notNull().references(() => communityChallengesNew.id, { onDelete: "cascade" }),
        userId: text("userId").notNull().references(() => users.id),
        content: text("content").notNull(),
        attachments: jsonb("attachments"),
        score: integer("score"),
        rank: integer("rank"),
        feedback: text("feedback"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (t) => [
        uniqueIndex("communityChallengeSubmission_challengeId_userId_key").on(t.challengeId, t.userId),
        index("communityChallengeSubmission_challengeId_idx").on(t.challengeId),
        index("communityChallengeSubmission_userId_idx").on(t.userId),
    ]
);

export const communityInvites = pgTable(
    "CommunityInvite",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        communityId: text("communityId").notNull().references(() => communities.id, { onDelete: "cascade" }),
        inviterId: text("inviterId").notNull().references(() => users.id),
        inviteeId: text("inviteeId"),
        inviteeEmail: text("inviteeEmail"),
        code: text("code").notNull().unique().$defaultFn(() => createId()),
        isUsed: boolean("isUsed").notNull().default(false),
        usedAt: timestamp("usedAt"),
        expiresAt: timestamp("expiresAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        index("communityInvite_communityId_idx").on(t.communityId),
        index("communityInvite_inviterId_idx").on(t.inviterId),
        index("communityInvite_code_idx").on(t.code),
    ]
);

export const userFollows = pgTable(
    "UserFollow",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        followerId: text("followerId").notNull().references(() => users.id, { onDelete: "cascade" }),
        followingId: text("followingId").notNull().references(() => users.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        uniqueIndex("userFollow_followerId_followingId_key").on(t.followerId, t.followingId),
        index("userFollow_followerId_idx").on(t.followerId),
        index("userFollow_followingId_idx").on(t.followingId),
    ]
);

export const communityTags = pgTable(
    "CommunityTag",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        name: text("name").notNull(),
        slug: text("slug").notNull().unique(),
        color: text("color"),
        usageCount: integer("usageCount").notNull().default(0),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        index("communityTag_slug_idx").on(t.slug),
        index("communityTag_usageCount_idx").on(t.usageCount),
    ]
);

export const communityLeaderboards = pgTable(
    "CommunityLeaderboard",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        communityId: text("communityId").notNull().references(() => communities.id, { onDelete: "cascade" }),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        totalPoints: integer("totalPoints").notNull().default(0),
        postPoints: integer("postPoints").notNull().default(0),
        commentPoints: integer("commentPoints").notNull().default(0),
        quizPoints: integer("quizPoints").notNull().default(0),
        peerMockPoints: integer("peerMockPoints").notNull().default(0),
        helpPoints: integer("helpPoints").notNull().default(0),
        postsCount: integer("postsCount").notNull().default(0),
        commentsCount: integer("commentsCount").notNull().default(0),
        quizzesCompleted: integer("quizzesCompleted").notNull().default(0),
        questionsCorrect: integer("questionsCorrect").notNull().default(0),
        peerSessionsCount: integer("peerSessionsCount").notNull().default(0),
        helpRequestsSolved: integer("helpRequestsSolved").notNull().default(0),
        rank: integer("rank"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (t) => [
        uniqueIndex("communityLeaderboard_communityId_userId_key").on(t.communityId, t.userId),
        index("communityLeaderboard_communityId_idx").on(t.communityId),
        index("communityLeaderboard_userId_idx").on(t.userId),
        index("communityLeaderboard_totalPoints_idx").on(t.totalPoints),
        index("communityLeaderboard_rank_idx").on(t.rank),
    ]
);

export const communityPolls = pgTable(
    "CommunityPoll",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        postId: text("postId").notNull().unique().references(() => communityPosts.id, { onDelete: "cascade" }),
        question: text("question").notNull(),
        options: jsonb("options").notNull(),
        allowMultiple: boolean("allowMultiple").notNull().default(false),
        endDate: timestamp("endDate"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("communityPoll_postId_idx").on(t.postId),
    ]
);

export const communityPollVotes = pgTable(
    "CommunityPollVote",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        pollId: text("pollId").notNull().references(() => communityPolls.id, { onDelete: "cascade" }),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        optionIndex: integer("optionIndex").notNull(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        uniqueIndex("communityPollVote_pollId_userId_optionIndex_key").on(t.pollId, t.userId, t.optionIndex),
        index("communityPollVote_pollId_idx").on(t.pollId),
        index("communityPollVote_userId_idx").on(t.userId),
    ]
);

// ===========================
// Relations
// ===========================

export const communitiesRelations = relations(communities, ({ one, many }) => ({
    creator: one(users, {
        fields: [communities.creatorId],
        references: [users.id],
        relationName: "CommunityCreator",
    }),
    members: many(communityMembers, { relationName: "CommunityMembers" }),
    posts: many(communityPosts, { relationName: "CommunityPosts" }),
    resources: many(communityResources, { relationName: "CommunityResources" }),
    events: many(communityEvents, { relationName: "CommunityEvents" }),
    challenges: many(communityChallengesNew, { relationName: "CommunityChallenges" }),
    invites: many(communityInvites, { relationName: "CommunityInvites" }),
    leaderboard: many(communityLeaderboards, { relationName: "CommunityLeaderboard" }),
}));

export const communityMembersRelations = relations(communityMembers, ({ one }) => ({
    community: one(communities, {
        fields: [communityMembers.communityId],
        references: [communities.id],
        relationName: "CommunityMembers",
    }),
    user: one(users, {
        fields: [communityMembers.userId],
        references: [users.id],
        relationName: "CommunityMemberships",
    }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
    community: one(communities, {
        fields: [communityPosts.communityId],
        references: [communities.id],
        relationName: "CommunityPosts",
    }),
    author: one(users, {
        fields: [communityPosts.authorId],
        references: [users.id],
        relationName: "CommunityPostAuthor",
    }),
    likes: many(communityPostLikes, { relationName: "PostLikes" }),
    comments: many(communityComments, { relationName: "PostComments" }),
    poll: one(communityPolls, {
        fields: [communityPosts.id],
        references: [communityPolls.postId],
        relationName: "PostPoll",
    }),
}));

export const communityPostLikesRelations = relations(communityPostLikes, ({ one }) => ({
    post: one(communityPosts, {
        fields: [communityPostLikes.postId],
        references: [communityPosts.id],
        relationName: "PostLikes",
    }),
    user: one(users, {
        fields: [communityPostLikes.userId],
        references: [users.id],
        relationName: "CommunityPostLikes",
    }),
}));

export const communityCommentsRelations = relations(communityComments, ({ one, many }) => ({
    post: one(communityPosts, {
        fields: [communityComments.postId],
        references: [communityPosts.id],
        relationName: "PostComments",
    }),
    author: one(users, {
        fields: [communityComments.authorId],
        references: [users.id],
        relationName: "CommunityCommentAuthor",
    }),
    parent: one(communityComments, {
        fields: [communityComments.parentId],
        references: [communityComments.id],
        relationName: "CommentReplies",
    }),
    replies: many(communityComments, { relationName: "CommentReplies" }),
    likes: many(communityCommentLikes, { relationName: "CommentLikes" }),
}));

export const communityCommentLikesRelations = relations(communityCommentLikes, ({ one }) => ({
    comment: one(communityComments, {
        fields: [communityCommentLikes.commentId],
        references: [communityComments.id],
        relationName: "CommentLikes",
    }),
    user: one(users, {
        fields: [communityCommentLikes.userId],
        references: [users.id],
        relationName: "CommunityCommentLikes",
    }),
}));

export const communityResourcesRelations = relations(communityResources, ({ one }) => ({
    community: one(communities, {
        fields: [communityResources.communityId],
        references: [communities.id],
        relationName: "CommunityResources",
    }),
    uploader: one(users, {
        fields: [communityResources.uploaderId],
        references: [users.id],
        relationName: "CommunityResourceUploader",
    }),
}));

export const communityEventsRelations = relations(communityEvents, ({ one, many }) => ({
    community: one(communities, {
        fields: [communityEvents.communityId],
        references: [communities.id],
        relationName: "CommunityEvents",
    }),
    creator: one(users, {
        fields: [communityEvents.creatorId],
        references: [users.id],
        relationName: "CommunityEventCreator",
    }),
    attendees: many(communityEventAttendees, { relationName: "EventAttendees" }),
}));

export const communityEventAttendeesRelations = relations(communityEventAttendees, ({ one }) => ({
    event: one(communityEvents, {
        fields: [communityEventAttendees.eventId],
        references: [communityEvents.id],
        relationName: "EventAttendees",
    }),
    user: one(users, {
        fields: [communityEventAttendees.userId],
        references: [users.id],
        relationName: "CommunityEventAttendees",
    }),
}));

export const communityChallengesNewRelations = relations(communityChallengesNew, ({ one, many }) => ({
    community: one(communities, {
        fields: [communityChallengesNew.communityId],
        references: [communities.id],
        relationName: "CommunityChallenges",
    }),
    creator: one(users, {
        fields: [communityChallengesNew.creatorId],
        references: [users.id],
        relationName: "CommunityChallengeCreator",
    }),
    submissions: many(communityChallengeSubmissions, { relationName: "ChallengeSubmissions" }),
}));

export const communityChallengeSubmissionsRelations = relations(communityChallengeSubmissions, ({ one }) => ({
    challenge: one(communityChallengesNew, {
        fields: [communityChallengeSubmissions.challengeId],
        references: [communityChallengesNew.id],
        relationName: "ChallengeSubmissions",
    }),
    user: one(users, {
        fields: [communityChallengeSubmissions.userId],
        references: [users.id],
        relationName: "CommunityChallengeSubmissions",
    }),
}));

export const communityInvitesRelations = relations(communityInvites, ({ one }) => ({
    community: one(communities, {
        fields: [communityInvites.communityId],
        references: [communities.id],
        relationName: "CommunityInvites",
    }),
    inviter: one(users, {
        fields: [communityInvites.inviterId],
        references: [users.id],
        relationName: "CommunityInviter",
    }),
}));

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
    follower: one(users, {
        fields: [userFollows.followerId],
        references: [users.id],
        relationName: "UserFollowing",
    }),
    following: one(users, {
        fields: [userFollows.followingId],
        references: [users.id],
        relationName: "UserFollowers",
    }),
}));

export const communityLeaderboardsRelations = relations(communityLeaderboards, ({ one }) => ({
    community: one(communities, {
        fields: [communityLeaderboards.communityId],
        references: [communities.id],
        relationName: "CommunityLeaderboard",
    }),
    user: one(users, {
        fields: [communityLeaderboards.userId],
        references: [users.id],
        relationName: "CommunityLeaderboards",
    }),
}));

export const communityPollsRelations = relations(communityPolls, ({ one, many }) => ({
    post: one(communityPosts, {
        fields: [communityPolls.postId],
        references: [communityPosts.id],
        relationName: "PostPoll",
    }),
    votes: many(communityPollVotes),
}));

export const communityPollVotesRelations = relations(communityPollVotes, ({ one }) => ({
    poll: one(communityPolls, {
        fields: [communityPollVotes.pollId],
        references: [communityPolls.id],
    }),
    user: one(users, {
        fields: [communityPollVotes.userId],
        references: [users.id],
        relationName: "CommunityPollVotes",
    }),
}));
