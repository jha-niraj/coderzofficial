import { create } from 'zustand'
import { ResumeDraftContent } from '@/types/resume-draft'

interface ResumeDraft {
    id: string
    name: string
    templateSlug: string
    isPublic: boolean
    shareSlug: string
    atsScore: number | null
    tailoredFor: string | null
    updatedAt: string | Date
    content: ResumeDraftContent
}

interface ResumeTemplate {
    id: string
    slug: string
    name: string
    isPlatform: boolean
    config: unknown
}

interface ResumeHubState {
    drafts: ResumeDraft[]
    templates: ResumeTemplate[]
    isLoading: boolean
    importProgress: { stage: string; percent: number } | null
    setDrafts: (drafts: ResumeDraft[]) => void
    addDraft: (draft: ResumeDraft) => void
    removeDraft: (id: string) => void
    updateDraft: (id: string, patch: Partial<ResumeDraft>) => void
    setTemplates: (templates: ResumeTemplate[]) => void
    setLoading: (v: boolean) => void
    setImportProgress: (p: { stage: string; percent: number } | null) => void
}

export const useResumeHubStore = create<ResumeHubState>((set) => ({
    drafts: [],
    templates: [],
    isLoading: false,
    importProgress: null,
    setDrafts: (drafts) => set({ drafts }),
    addDraft: (draft) => set((s) => ({ drafts: [draft, ...s.drafts] })),
    removeDraft: (id) => set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),
    updateDraft: (id, patch) => set((s) => ({ drafts: s.drafts.map((d) => d.id === id ? { ...d, ...patch } : d) })),
    setTemplates: (templates) => set({ templates }),
    setLoading: (isLoading) => set({ isLoading }),
    setImportProgress: (importProgress) => set({ importProgress }),
}))
