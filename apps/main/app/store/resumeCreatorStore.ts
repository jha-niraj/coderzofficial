import { create } from "zustand"
import type { ResumePublicViewUser } from "@/components/resume/resume-public-view"
import type { ResumeCreatorProfile } from "@/types/resume"
import { toResumePublicViewUser } from "@/types/resume"

interface ResumeCreatorState {
    resumeData: ResumePublicViewUser | null
    profile: ResumeCreatorProfile | null
    isLoading: boolean
    error: string | null
    setResumeData: (data: ResumePublicViewUser | null) => void
    setProfile: (profile: ResumeCreatorProfile | null) => void
    updateResumeData: (data: Partial<ResumePublicViewUser>) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    loadFromProfile: (profile: ResumeCreatorProfile) => void
}

export const useResumeCreatorStore = create<ResumeCreatorState>((set) => ({
    resumeData: null,
    profile: null,
    isLoading: true,
    error: null,

    setResumeData: (data) => set({ resumeData: data }),

    setProfile: (profile) => set({
        profile,
        resumeData: profile ? toResumePublicViewUser(profile) : null,
    }),

    updateResumeData: (data) => set((state) => ({
        resumeData: state.resumeData
            ? { ...state.resumeData, ...data }
            : null,
    })),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    loadFromProfile: (profile) => set({
        profile,
        resumeData: toResumePublicViewUser(profile),
    }),
}))