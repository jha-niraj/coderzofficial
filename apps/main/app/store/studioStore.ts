"use client";

import { create } from "zustand";
import type { StudioStep, StudioWithSteps } from "@/types/studios";

// ==========================================
// TYPES
// ==========================================

export interface PendingStep {
    id: string; // temporary id
    type: string;
    prompt: string;
    status: "generating" | "error";
    errorMessage?: string;
    createdAt: Date;
}

interface StudioStoreState {
    // Studio data
    studioId: string | null;
    studio: StudioWithSteps | null;
    steps: StudioStep[];

    // Loading/generating states
    isLoading: boolean;
    isCreatingStudio: boolean;
    isGenerating: boolean;
    pendingSteps: PendingStep[];

    // External prompt (from text selection)
    externalPrompt: string | null;

    // Actions - Initialize
    initialize: (studio: StudioWithSteps) => void;
    reset: () => void;

    // Actions - Studio
    setStudioId: (id: string | null) => void;
    setStudio: (studio: StudioWithSteps | null) => void;
    setIsCreatingStudio: (creating: boolean) => void;

    // Actions - Steps
    setSteps: (steps: StudioStep[]) => void;
    addStep: (step: StudioStep) => void;
    updateStep: (stepId: string, data: Partial<StudioStep>) => void;
    removeStep: (stepId: string) => void;

    // Actions - Generating
    setIsGenerating: (generating: boolean) => void;
    addPendingStep: (pending: PendingStep) => void;
    removePendingStep: (pendingId: string) => void;
    updatePendingStep: (pendingId: string, data: Partial<PendingStep>) => void;

    // Actions - External prompt
    setExternalPrompt: (prompt: string | null) => void;

    // Actions - Loading
    setIsLoading: (loading: boolean) => void;
}

// ==========================================
// STORE IMPLEMENTATION
// ==========================================

export const useStudioStore = create<StudioStoreState>()((set, get) => ({
    // Initial state
    studioId: null,
    studio: null,
    steps: [],
    isLoading: false,
    isCreatingStudio: false,
    isGenerating: false,
    pendingSteps: [],
    externalPrompt: null,

    // Initialize with full studio data
    initialize: (studio) => {
        set({
            studioId: studio.id,
            studio,
            steps: studio.steps || [],
            isLoading: false,
        });
    },

    reset: () => {
        set({
            studioId: null,
            studio: null,
            steps: [],
            isLoading: false,
            isCreatingStudio: false,
            isGenerating: false,
            pendingSteps: [],
            externalPrompt: null,
        });
    },

    // Studio actions
    setStudioId: (id) => set({ studioId: id }),

    setStudio: (studio) => {
        if (studio) {
            set({
                studio,
                studioId: studio.id,
                steps: studio.steps || [],
            });
        } else {
            set({ studio: null, steps: [] });
        }
    },

    setIsCreatingStudio: (creating) => set({ isCreatingStudio: creating }),

    // Step actions
    setSteps: (steps) => set({ steps }),

    addStep: (step) => {
        set((state) => ({
            steps: [...state.steps, step],
            studio: state.studio
                ? {
                    ...state.studio,
                    steps: [...state.studio.steps, step],
                    stepCount: state.studio.stepCount + 1,
                }
                : null,
        }));
    },

    updateStep: (stepId, data) => {
        set((state) => ({
            steps: state.steps.map((s) =>
                s.id === stepId ? { ...s, ...data } : s
            ),
        }));
    },

    removeStep: (stepId) => {
        set((state) => ({
            steps: state.steps.filter((s) => s.id !== stepId),
            studio: state.studio
                ? {
                    ...state.studio,
                    steps: state.studio.steps.filter((s) => s.id !== stepId),
                    stepCount: Math.max(0, state.studio.stepCount - 1),
                }
                : null,
        }));
    },

    // Generating actions
    setIsGenerating: (generating) => set({ isGenerating: generating }),

    addPendingStep: (pending) => {
        set((state) => ({
            pendingSteps: [...state.pendingSteps, pending],
            isGenerating: true,
        }));
    },

    removePendingStep: (pendingId) => {
        set((state) => {
            const newPending = state.pendingSteps.filter(
                (p) => p.id !== pendingId
            );
            return {
                pendingSteps: newPending,
                isGenerating: newPending.length > 0,
            };
        });
    },

    updatePendingStep: (pendingId, data) => {
        set((state) => ({
            pendingSteps: state.pendingSteps.map((p) =>
                p.id === pendingId ? { ...p, ...data } : p
            ),
        }));
    },

    // External prompt
    setExternalPrompt: (prompt) => set({ externalPrompt: prompt }),

    // Loading
    setIsLoading: (loading) => set({ isLoading: loading }),
}));

// ==========================================
// SELECTORS
// ==========================================

export const useStudioSteps = () =>
    useStudioStore((state) => state.steps);
export const useStudioIsGenerating = () =>
    useStudioStore((state) => state.isGenerating);
export const useStudioPendingSteps = () =>
    useStudioStore((state) => state.pendingSteps);
export const useStudioExternalPrompt = () =>
    useStudioStore((state) => state.externalPrompt);
