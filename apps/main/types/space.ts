// Space Types based on Prisma Schema

import {
    SpaceVisibility,
    SpaceCategory,
    SpaceMemberRole,
    SpaceStepContentType,
    SpaceStepStatus,
    SpaceBranchVisibility,
    SpaceActivityType
} from '@repo/prisma/client';

// ==========================================
// DATABASE RETURN TYPES
// ==========================================

export interface UserFromDB {
    id: string;
    name?: string | null;
    username?: string | null;
    image?: string | null;
    email?: string | null;
}

export interface SpaceFromDB {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    emoji?: string | null;
    coverImage?: string | null;
    category: SpaceCategory;
    tags: string[];
    visibility: SpaceVisibility;
    accessCode?: string | null;
    allowMemberContent: boolean;
    isAssignmentMode: boolean;
    enableProgressTracking: boolean;
    enableBranches: boolean;
    enableComments: boolean;
    enableLikes: boolean;
    memberCount: number;
    totalSteps: number;
    totalBranches: number;
    viewCount: number;
    likeCount: number;
    creatorId: string;
    createdAt: Date;
    updatedAt: Date;
    creator: UserFromDB;
}

export interface SpaceMemberFromDB {
    id: string;
    spaceId: string;
    userId: string;
    role: SpaceMemberRole;
    currentStepId?: string | null;
    completedSteps: string[];
    progressPercent: number;
    totalTimeSpent: number;
    personalBranchId?: string | null;
    isActive: boolean;
    lastActiveAt: Date;
    joinedAt: Date;
    updatedAt: Date;
    user: UserFromDB;
    space: SpaceFromDB;
}

export interface SpaceStepFromDB {
    id: string;
    spaceId: string;
    order: number;
    title: string;
    description?: string | null;
    contentType: SpaceStepContentType;
    contentId?: string | null;
    contentData?: unknown | null;
    isRequired: boolean;
    estimatedTime?: number | null;
    dueDate?: Date | null;
    status: SpaceStepStatus;
    completionCount: number;
    averageTimeSpent?: number | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface SpaceStepCompletionFromDB {
    id: string;
    stepId: string;
    userId: string;
    spaceId: string;
    timeSpent: number;
    isShared: boolean;
    notes?: string | null;
    attachments?: unknown | null;
    completedAt: Date;
    createdAt: Date;
    user: UserFromDB;
    step: SpaceStepFromDB;
}

export interface SpaceBranchFromDB {
    id: string;
    spaceId: string;
    parentStepId: string;
    creatorId: string;
    title: string;
    description?: string | null;
    visibility: SpaceBranchVisibility;
    steps?: unknown | null;
    memberIds: string[];
    memberCount: number;
    createdAt: Date;
    updatedAt: Date;
    creator: UserFromDB;
}

export interface SpaceActivityFromDB {
    id: string;
    spaceId: string;
    userId: string;
    type: SpaceActivityType;
    stepId?: string | null;
    branchId?: string | null;
    contentId?: string | null;
    metadata?: unknown | null;
    createdAt: Date;
    user: UserFromDB;
}

export interface SpaceCommentFromDB {
    id: string;
    spaceId: string;
    stepId: string;
    userId: string;
    content: string;
    parentId?: string | null;
    likeCount: number;
    isEdited: boolean;
    isHidden: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: UserFromDB;
}

export interface SpaceLikeFromDB {
    id: string;
    spaceId: string;
    stepId?: string | null;
    userId: string;
    createdAt: Date;
    user: UserFromDB;
}

export interface SpaceAIChatFromDB {
    id: string;
    spaceId: string;
    userId: string;
    role: string;
    content: string;
    stepId?: string | null;
    branchId?: string | null;
    metadata?: unknown | null;
    createdAt: Date;
}

// ==========================================
// APPLICATION TYPES
// ==========================================

export interface SpaceFormData {
    title: string;
    description?: string;
    emoji?: string;
    coverImage?: string;
    category?: SpaceCategory;
    tags?: string[];
    visibility: SpaceVisibility;
    accessCode?: string;
    allowMemberContent: boolean;
    isAssignmentMode: boolean;
    enableProgressTracking: boolean;
    enableBranches: boolean;
    enableComments: boolean;
    enableLikes: boolean;
}

export interface SpaceStepFormData {
    order: number;
    title: string;
    description?: string;
    contentType: SpaceStepContentType;
    contentId?: string;
    contentData?: unknown;
    isRequired: boolean;
    estimatedTime?: number;
    dueDate?: Date;
}

export interface SpaceBranchFormData {
    parentStepId: string;
    title: string;
    description?: string;
    visibility: SpaceBranchVisibility;
    steps?: unknown;
}

export interface SpaceFilters {
    search?: string;
    visibility?: SpaceVisibility;
    category?: SpaceCategory;
    creatorId?: string;
    sortBy?: 'latest' | 'popular' | 'members' | 'views';
    page?: number;
    limit?: number;
}

export interface SpaceWithDetails extends SpaceFromDB {
    members: SpaceMemberFromDB[];
    steps: SpaceStepFromDB[];
    branches: SpaceBranchFromDB[];
    recentActivities: SpaceActivityFromDB[];
    userProgress?: SpaceMemberFromDB | null;
}

export interface SpaceStepWithDetails extends SpaceStepFromDB {
    completions: SpaceStepCompletionFromDB[];
    comments: SpaceCommentFromDB[];
    likes: SpaceLikeFromDB[];
    branches: SpaceBranchFromDB[];
    userCompletion?: SpaceStepCompletionFromDB | null;
}

export interface SpaceMemberWithProgress extends SpaceMemberFromDB {
    currentStep?: SpaceStepFromDB | null;
    personalBranch?: SpaceBranchFromDB | null;
}

export interface ActionResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface SpacesListResponse {
    spaces: SpaceFromDB[];
    pagination: PaginationInfo;
}

export interface SpaceMembersResponse {
    members: SpaceMemberWithProgress[];
    pagination: PaginationInfo;
}

export interface SpaceActivitiesResponse {
    activities: SpaceActivityFromDB[];
    pagination: PaginationInfo;
}

export interface SpaceCommentsResponse {
    comments: SpaceCommentFromDB[];
    pagination: PaginationInfo;
}

// URL params for redirect handling
export interface ReturnToParams {
    returnTo?: string;
    spaceId?: string;
    stepId?: string;
    branchId?: string;
}


