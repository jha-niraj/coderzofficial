"use client";

import { create } from "zustand";
import type {
    PracticeProblemDetail, PracticeSessionData, PracticeChatMessage, 
    PracticeMode, PracticeModule,
} from "@/types/practice";

// ==========================================
// TYPES
// ==========================================

export interface PracticeWorkspaceState {
    // Core data
    problem: PracticeProblemDetail | null;
    session: PracticeSessionData | null;
    module: PracticeModule | null;
    mode: PracticeMode | null;

    // Editor state
    code: string;
    cssCode: string;
    canvasData: unknown;
    language: string;
    isDirty: boolean;

    // Timer
    elapsedSeconds: number;
    isTimerRunning: boolean;

    // AI Chat
    chatHistory: PracticeChatMessage[];
    isChatLoading: boolean;

    // Assessment
    isAssessing: boolean;
    lastScore: number | null;
    lastFeedback: string | null;
    requirementsMet: Record<string, boolean>;

    // Voice
    isVoiceActive: boolean;
    voiceTranscript: string;

    // UI State
    activeTab: "code" | "preview" | "canvas";
    isSaving: boolean;

    // ── Actions ──

    // Initialize
    initialize: (problem: PracticeProblemDetail, session: PracticeSessionData) => void;
    reset: () => void;

    // Editor
    setCode: (code: string) => void;
    setCssCode: (css: string) => void;
    setCanvasData: (data: unknown) => void;
    setLanguage: (lang: string) => void;
    markClean: () => void;

    // Timer
    setElapsedSeconds: (seconds: number) => void;
    incrementTimer: () => void;
    setTimerRunning: (running: boolean) => void;

    // Chat
    addChatMessage: (message: PracticeChatMessage) => void;
    setChatHistory: (history: PracticeChatMessage[]) => void;
    setChatLoading: (loading: boolean) => void;

    // Assessment
    setAssessing: (assessing: boolean) => void;
    setAssessmentResult: (score: number, feedback: string, reqMet: Record<string, boolean>) => void;

    // Voice
    setVoiceActive: (active: boolean) => void;
    setVoiceTranscript: (transcript: string) => void;

    // UI
    setActiveTab: (tab: "code" | "preview" | "canvas") => void;
    setSaving: (saving: boolean) => void;
}

// ==========================================
// STORE
// ==========================================

const initialState = {
    problem: null,
    session: null,
    module: null,
    mode: null,
    code: "",
    cssCode: "",
    canvasData: null,
    language: "javascript",
    isDirty: false,
    elapsedSeconds: 0,
    isTimerRunning: false,
    chatHistory: [] as PracticeChatMessage[],
    isChatLoading: false,
    isAssessing: false,
    lastScore: null,
    lastFeedback: null,
    requirementsMet: {} as Record<string, boolean>,
    isVoiceActive: false,
    voiceTranscript: "",
    activeTab: "code" as const,
    isSaving: false,
};

export const usePracticeStore = create<PracticeWorkspaceState>((set) => ({
    ...initialState,

    // ── Initialize ──
    initialize: (problem, session) =>
        set({
            problem,
            session,
            module: problem.module,
            mode: session.mode,
            code: session.code ?? problem.starterCode ?? "",
            cssCode: session.cssCode ?? problem.starterCss ?? "",
            canvasData: session.canvasData,
            language: session.language ?? "javascript",
            elapsedSeconds: session.totalTimeSeconds,
            chatHistory: (session.chatHistory as PracticeChatMessage[]) ?? [],
            requirementsMet: session.requirementsMet ?? {},
            lastScore: session.bestScore > 0 ? session.bestScore : null,
            lastFeedback: session.lastFeedback,
            isDirty: false,
            isTimerRunning: true,
        }),

    reset: () => set(initialState),

    // ── Editor ──
    setCode: (code) => set({ code, isDirty: true }),
    setCssCode: (cssCode) => set({ cssCode, isDirty: true }),
    setCanvasData: (canvasData) => set({ canvasData, isDirty: true }),
    setLanguage: (language) => set({ language }),
    markClean: () => set({ isDirty: false }),

    // ── Timer ──
    setElapsedSeconds: (elapsedSeconds) => set({ elapsedSeconds }),
    incrementTimer: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),
    setTimerRunning: (isTimerRunning) => set({ isTimerRunning }),

    // ── Chat ──
    addChatMessage: (message) =>
        set((state) => ({ chatHistory: [...state.chatHistory, message] })),
    setChatHistory: (chatHistory) => set({ chatHistory }),
    setChatLoading: (isChatLoading) => set({ isChatLoading }),

    // ── Assessment ──
    setAssessing: (isAssessing) => set({ isAssessing }),
    setAssessmentResult: (score, feedback, reqMet) =>
        set({
            lastScore: score,
            lastFeedback: feedback,
            requirementsMet: reqMet,
            isAssessing: false,
        }),

    // ── Voice ──
    setVoiceActive: (isVoiceActive) => set({ isVoiceActive }),
    setVoiceTranscript: (voiceTranscript) => set({ voiceTranscript }),

    // ── UI ──
    setActiveTab: (activeTab) => set({ activeTab }),
    setSaving: (isSaving) => set({ isSaving }),
}));
