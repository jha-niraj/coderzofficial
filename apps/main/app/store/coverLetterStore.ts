import { create } from 'zustand'
import { CoverLetterQuestion, CoverLetterHistoryItem, CoverLetterRecord } from '@/types/aitools/cover-letter'

interface CoverLetterState {
    step: 1 | 2 | 3
    jobUrl: string
    jobTitle: string
    companyName: string
    jobDescription: string
    tone: string
    questions: CoverLetterQuestion[]
    answers: Record<string, string | string[]>
    generatedLetter: string
    draftId: string | null
    isLoading: boolean
    loadingMessage: string
    loadingSub: string
    history: CoverLetterHistoryItem[]
    selectedHistoryId: string | null
    viewingRecord: CoverLetterRecord | null
    setStep: (step: 1 | 2 | 3) => void
    setField: <K extends 'jobUrl' | 'jobTitle' | 'companyName' | 'jobDescription' | 'tone'>(key: K, value: string) => void
    setQuestions: (q: CoverLetterQuestion[]) => void
    setAnswer: (id: string, value: string | string[]) => void
    setGeneratedLetter: (text: string) => void
    setDraftId: (id: string | null) => void
    setLoading: (loading: boolean, message?: string, sub?: string) => void
    setHistory: (h: CoverLetterHistoryItem[]) => void
    addToHistory: (item: CoverLetterHistoryItem) => void
    removeFromHistory: (id: string) => void
    setSelectedHistoryId: (id: string | null) => void
    setViewingRecord: (r: CoverLetterRecord | null) => void
    reset: () => void
}

const defaultState = {
    step: 1 as const,
    jobUrl: '',
    jobTitle: '',
    companyName: '',
    jobDescription: '',
    tone: 'professional',
    questions: [],
    answers: {},
    generatedLetter: '',
    draftId: null,
    isLoading: false,
    loadingMessage: '',
    loadingSub: '',
    history: [],
    selectedHistoryId: null,
    viewingRecord: null,
}

export const useCoverLetterStore = create<CoverLetterState>((set) => ({
    ...defaultState,
    setStep: (step) => set({ step }),
    setField: (key, value) => set({ [key]: value }),
    setQuestions: (questions) => set({ questions }),
    setAnswer: (id, value) => set((s) => ({ answers: { ...s.answers, [id]: value } })),
    setGeneratedLetter: (generatedLetter) => set({ generatedLetter }),
    setDraftId: (draftId) => set({ draftId }),
    setLoading: (isLoading, loadingMessage = '', loadingSub = '') => set({ isLoading, loadingMessage, loadingSub }),
    setHistory: (history) => set({ history }),
    addToHistory: (item) => set((s) => ({ history: [item, ...s.history.filter((h) => h.id !== item.id)] })),
    removeFromHistory: (id) => set((s) => ({ history: s.history.filter((h) => h.id !== id) })),
    setSelectedHistoryId: (selectedHistoryId) => set({ selectedHistoryId }),
    setViewingRecord: (viewingRecord) => set({ viewingRecord }),
    reset: () => set(defaultState),
}))
