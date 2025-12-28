/**
 * Common Types and Interfaces
 * Used across various components to avoid 'any' type usage
 */

// Note: ActionResponse and PaginatedResponse are defined in assessment.ts
// Import from there if needed: import { ActionResponse, PaginatedResponse } from './assessment'

// ==================== USER RELATED TYPES ====================

/**
 * Basic user info for display purposes
 */
export interface BasicUserInfo {
    id: string;
    name: string | null;
    username?: string | null;
    image: string | null;
    email?: string;
}

/**
 * User with stats for leaderboards and profiles
 */
export interface UserWithStats extends BasicUserInfo {
    xp?: number;
    credits?: number;
    projectsCompleted?: number;
    quizzesCompleted?: number;
    rank?: number;
    score?: number;
}

// ==================== COMMUNITY TYPES ====================

/**
 * Community member info
 */
export interface CommunityMember {
    id: string;
    userId: string;
    communityId: string;
    role: string;
    joinedAt: Date;
    user: BasicUserInfo;
}

/**
 * Community post type
 */
export interface CommunityPostData {
    id: string;
    title?: string;
    content: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
    author: BasicUserInfo;
    likes: number;
    comments: number;
    isLiked?: boolean;
}

/**
 * Community comment type
 */
export interface CommunityCommentData {
    id: string;
    content: string;
    createdAt: Date;
    author: BasicUserInfo;
    likes: number;
    isLiked?: boolean;
    replies?: CommunityCommentData[];
}

// ==================== CHALLENGE TYPES ====================

/**
 * Challenge step type
 */
export interface ChallengeStepData {
    id: string;
    title: string;
    description: string;
    orderIndex: number;
    stepType: string;
    content: string;
    hints?: string[];
    resources?: ResourceData[];
}

/**
 * Challenge progress
 */
export interface ChallengeProgressData {
    id: string;
    userId: string;
    challengeId: string;
    currentStep: number;
    completedSteps: number[];
    startedAt: Date;
    completedAt?: Date;
}

// ==================== CONCEPT TYPES ====================

/**
 * Concept step for learning modules
 */
export interface ConceptStepData {
    id: string;
    conceptId: string;
    title: string;
    content: string;
    stepType: string;
    orderIndex: number;
    codeSnippet?: string;
    codeLanguage?: string;
    explanation?: string;
}

/**
 * Concept with steps
 */
export interface ConceptWithSteps {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    estimatedTime: number;
    steps: ConceptStepData[];
    creator?: BasicUserInfo;
}

// ==================== RESOURCE TYPES ====================

/**
 * Generic resource data
 */
export interface ResourceData {
    id: string;
    title: string;
    description?: string;
    type: string;
    url: string;
}

// ==================== MOCK INTERVIEW TYPES ====================

/**
 * Mock interview session data
 */
export interface MockSessionData {
    id: string;
    userId: string;
    category: string;
    difficulty: string;
    status: string;
    startedAt: Date;
    completedAt?: Date;
    score?: number;
    feedback?: string;
}

/**
 * Mock interview question
 */
export interface MockQuestionData {
    id: string;
    question: string;
    category: string;
    difficulty: string;
    expectedAnswer?: string;
    hints?: string[];
}

// ==================== FORM/INPUT HANDLER TYPES ====================

/**
 * Generic form field change handler
 */
export type FormFieldChangeHandler<T = string> = (value: T) => void;

/**
 * Generic event handler type
 */
export type EventHandler<T = void> = () => T | Promise<T>;

// ==================== ERROR HANDLING ====================

/**
 * API error response
 */
export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, unknown>;
}

// ==================== FILTER/SORT TYPES ====================

/**
 * Generic filter options
 */
export interface FilterOptions {
    search?: string;
    category?: string;
    difficulty?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

// ==================== COLLECTIVE TYPES ====================

/**
 * Proposal data for collective challenges
 */
export interface ProposalData {
    id: string;
    title: string;
    description: string;
    status: string;
    votesFor: number;
    votesAgainst: number;
    createdAt: Date;
    author: BasicUserInfo;
}

/**
 * Collective challenge step
 */
export interface CollectiveStepData {
    id: string;
    title: string;
    description: string;
    stepType: string;
    orderIndex: number;
    deadline?: Date;
}

// ==================== ASSESSMENT TYPES EXTENSIONS ====================

/**
 * Answer submission data
 */
export interface AnswerSubmission {
    questionId: string;
    selectedOption?: string;
    codeAnswer?: string;
    textAnswer?: string;
    timeTaken: number;
}

// ==================== BOOKING/SESSION TYPES ====================

/**
 * Booking session for peer-to-peer mocks
 */
export interface BookingSessionData {
    id: string;
    bookerId: string;
    bookedUserId: string;
    sessionType: string;
    scheduledAt: Date;
    status: string;
    booker: BasicUserInfo;
    bookedUser: BasicUserInfo;
}

// ==================== NOTIFICATION TYPES ====================

/**
 * Notification data
 */
export interface NotificationData {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    actionUrl?: string;
}

// ==================== CHAT TYPES ====================

/**
 * Chat message data
 */
export interface ChatMessageData {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type: string;
    status: string;
    createdAt: Date;
    sender?: BasicUserInfo;
}

/**
 * Chat conversation data
 */
export interface ChatConversationData {
    id: string;
    participants: BasicUserInfo[];
    lastMessage?: ChatMessageData;
    unreadCount: number;
    updatedAt: Date;
}

// ==================== TRANSFER/CREDIT TYPES ====================

/**
 * Credit transfer data
 */
export interface CreditTransferData {
    id: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
    status: string;
    createdAt: Date;
    fromUser?: BasicUserInfo;
    toUser?: BasicUserInfo;
}

// ==================== GENERIC UTILITY TYPES ====================

/**
 * Key-value map type
 */
export type RecordMap<T = unknown> = Record<string, T>;

/**
 * Nullable type helper
 */
export type Nullable<T> = T | null;

/**
 * Optional type helper
 */
export type Optional<T> = T | undefined;

/**
 * ID field type
 */
export type Id = string;

/**
 * Timestamp field type
 */
export type Timestamp = Date | string;
