"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==========================================
// TYPES
// ==========================================

export interface OptimisticStep {
    id: string;
    order: number;
    title: string;
    description?: string | null;
    contentType: string;
    contentId?: string | null;
    contentData?: Record<string, unknown>;
    isRequired: boolean;
    estimatedTime?: number | null;
    status: string;
    completionCount: number;
    averageTimeSpent?: number | null;
    // Optimistic update fields
    isOptimistic?: boolean;
    isLoading?: boolean;
    error?: string | null;
    retryAction?: () => Promise<void>;
}

export interface SpaceComment {
    id: string;
    content: string;
    createdAt: Date;
    userId: string;
    user: {
        id: string;
        name?: string | null;
        username?: string | null;
        image?: string | null;
    };
    likeCount: number;
    isLiked?: boolean;
    replies?: SpaceComment[];
    parentId?: string | null;
    isOptimistic?: boolean;
    error?: string | null;
}

export interface SpaceLikeState {
    stepId: string;
    isLiked: boolean;
    count: number;
}

export interface SpaceActivity {
    id: string;
    type: string;
    userId: string;
    user?: {
        id: string;
        name?: string | null;
        image?: string | null;
    };
    stepId?: string | null;
    metadata?: Record<string, unknown>;
    createdAt: Date;
}

// ==========================================
// STORE STATE
// ==========================================

interface SpaceStoreState {
    // Current space data
    spaceId: string | null;
    steps: OptimisticStep[];
    comments: Record<string, SpaceComment[]>; // stepId -> comments
    likes: Record<string, SpaceLikeState>; // stepId -> like state
    activities: SpaceActivity[];
    
    // UI state
    activeStepId: string | null;
    sidebarMode: 'ai' | 'quiz' | 'flashcard' | null;
    sidebarContent: Record<string, unknown> | null;
    isActivitiesSheetOpen: boolean;
    isCommentsSheetOpen: boolean;
    selectedStepForComments: string | null;
    
    // Loading states
    isLoadingSteps: boolean;
    isLoadingComments: boolean;
    
    // Actions - Space initialization
    initializeSpace: (spaceId: string, steps: OptimisticStep[]) => void;
    clearSpace: () => void;
    
    // Actions - Steps (optimistic updates)
    addStep: (step: OptimisticStep) => void;
    updateStep: (stepId: string, data: Partial<OptimisticStep>) => void;
    removeStep: (stepId: string) => void;
    setStepError: (stepId: string, error: string, retryAction?: () => Promise<void>) => void;
    clearStepError: (stepId: string) => void;
    retryStep: (stepId: string) => Promise<void>;
    
    // Actions - Comments
    setComments: (stepId: string, comments: SpaceComment[]) => void;
    addComment: (stepId: string, comment: SpaceComment) => void;
    removeComment: (stepId: string, commentId: string) => void;
    updateCommentLike: (stepId: string, commentId: string, isLiked: boolean) => void;
    
    // Actions - Likes
    setLike: (stepId: string, isLiked: boolean, count: number) => void;
    toggleLike: (stepId: string) => void;
    
    // Actions - Activities
    setActivities: (activities: SpaceActivity[]) => void;
    addActivity: (activity: SpaceActivity) => void;
    
    // Actions - UI
    setActiveStep: (stepId: string | null) => void;
    openSidebar: (mode: 'ai' | 'quiz' | 'flashcard', content?: Record<string, unknown>) => void;
    closeSidebar: () => void;
    toggleActivitiesSheet: (open?: boolean) => void;
    openCommentsSheet: (stepId: string) => void;
    closeCommentsSheet: () => void;
}

// ==========================================
// STORE IMPLEMENTATION
// ==========================================

export const useSpaceStore = create<SpaceStoreState>()(
    persist(
        (set, get) => ({
            // Initial state
            spaceId: null,
            steps: [],
            comments: {},
            likes: {},
            activities: [],
            activeStepId: null,
            sidebarMode: 'ai',
            sidebarContent: null,
            isActivitiesSheetOpen: false,
            isCommentsSheetOpen: false,
            selectedStepForComments: null,
            isLoadingSteps: false,
            isLoadingComments: false,
            
            // Space initialization
            initializeSpace: (spaceId, steps) => {
                const currentState = get();
                // Only reset if it's a different space or first initialization
                if (currentState.spaceId !== spaceId) {
                    set({
                        spaceId,
                        steps,
                        comments: {},
                        likes: {},
                        activities: [],
                        activeStepId: null,
                        sidebarMode: 'ai', // Default to AI chat
                        sidebarContent: null,
                    });
                } else {
                    // Same space, just update steps
                    set({ steps });
                }
            },
            
            clearSpace: () => {
                set({
                    spaceId: null,
                    steps: [],
                    comments: {},
                    likes: {},
                    activities: [],
                    activeStepId: null,
                    sidebarMode: null,
                    sidebarContent: null,
                });
            },
            
            // Step actions
            addStep: (step) => {
                set((state) => ({
                    steps: [...state.steps, { ...step, isOptimistic: true, isLoading: true }]
                }));
            },
            
            updateStep: (stepId, data) => {
                set((state) => ({
                    steps: state.steps.map((s) =>
                        s.id === stepId ? { ...s, ...data } : s
                    )
                }));
            },
            
            removeStep: (stepId) => {
                set((state) => ({
                    steps: state.steps.filter((s) => s.id !== stepId)
                }));
            },
            
            setStepError: (stepId, error, retryAction) => {
                set((state) => ({
                    steps: state.steps.map((s) =>
                        s.id === stepId
                            ? { ...s, isLoading: false, error, retryAction }
                            : s
                    )
                }));
            },
            
            clearStepError: (stepId) => {
                set((state) => ({
                    steps: state.steps.map((s) =>
                        s.id === stepId
                            ? { ...s, error: null, retryAction: undefined }
                            : s
                    )
                }));
            },
            
            retryStep: async (stepId) => {
                const state = get();
                const step = state.steps.find((s) => s.id === stepId);
                if (step?.retryAction) {
                    set((state) => ({
                        steps: state.steps.map((s) =>
                            s.id === stepId
                                ? { ...s, isLoading: true, error: null }
                                : s
                        )
                    }));
                    await step.retryAction();
                }
            },
            
            // Comment actions
            setComments: (stepId, comments) => {
                set((state) => ({
                    comments: { ...state.comments, [stepId]: comments }
                }));
            },
            
            addComment: (stepId, comment) => {
                set((state) => ({
                    comments: {
                        ...state.comments,
                        [stepId]: [comment, ...(state.comments[stepId] || [])]
                    }
                }));
            },
            
            removeComment: (stepId, commentId) => {
                set((state) => ({
                    comments: {
                        ...state.comments,
                        [stepId]: (state.comments[stepId] || []).filter(
                            (c) => c.id !== commentId
                        )
                    }
                }));
            },
            
            updateCommentLike: (stepId, commentId, isLiked) => {
                set((state) => ({
                    comments: {
                        ...state.comments,
                        [stepId]: (state.comments[stepId] || []).map((c) =>
                            c.id === commentId
                                ? {
                                    ...c,
                                    isLiked,
                                    likeCount: c.likeCount + (isLiked ? 1 : -1)
                                }
                                : c
                        )
                    }
                }));
            },
            
            // Like actions
            setLike: (stepId, isLiked, count) => {
                set((state) => ({
                    likes: {
                        ...state.likes,
                        [stepId]: { stepId, isLiked, count }
                    }
                }));
            },
            
            toggleLike: (stepId) => {
                set((state) => {
                    const current = state.likes[stepId] || { stepId, isLiked: false, count: 0 };
                    return {
                        likes: {
                            ...state.likes,
                            [stepId]: {
                                ...current,
                                isLiked: !current.isLiked,
                                count: current.count + (current.isLiked ? -1 : 1)
                            }
                        }
                    };
                });
            },
            
            // Activity actions
            setActivities: (activities) => {
                set({ activities });
            },
            
            addActivity: (activity) => {
                set((state) => ({
                    activities: [activity, ...state.activities]
                }));
            },
            
            // UI actions
            setActiveStep: (stepId) => {
                set({ activeStepId: stepId });
            },
            
            openSidebar: (mode, content) => {
                set({ sidebarMode: mode, sidebarContent: content });
            },
            
            closeSidebar: () => {
                set({ sidebarMode: null, sidebarContent: null });
            },
            
            toggleActivitiesSheet: (open) => {
                set((state) => ({
                    isActivitiesSheetOpen: open ?? !state.isActivitiesSheetOpen
                }));
            },
            
            openCommentsSheet: (stepId) => {
                set({
                    isCommentsSheetOpen: true,
                    selectedStepForComments: stepId
                });
            },
            
            closeCommentsSheet: () => {
                set({
                    isCommentsSheetOpen: false,
                    selectedStepForComments: null
                });
            },
        }),
        {
            name: 'space-store',
            partialize: (state) => ({
                // Only persist UI preferences, not actual data
                sidebarMode: state.sidebarMode,
            }),
        }
    )
);

// ==========================================
// SELECTORS (for better performance)
// ==========================================

export const useSpaceSteps = () => useSpaceStore((state) => state.steps);
export const useSpaceComments = (stepId: string) => useSpaceStore((state) => state.comments[stepId] || []);
export const useStepLike = (stepId: string) => useSpaceStore((state) => state.likes[stepId]);
export const useSpaceActivities = () => useSpaceStore((state) => state.activities);
export const useSidebarState = () => useSpaceStore((state) => ({
    mode: state.sidebarMode,
    content: state.sidebarContent,
}));
export const useOptimisticSteps = () => useSpaceStore((state) => 
    state.steps.filter(s => s.isOptimistic && s.isLoading)
);
export const useFailedSteps = () => useSpaceStore((state) => 
    state.steps.filter(s => s.error)
);