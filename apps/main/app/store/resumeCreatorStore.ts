import { create } from "zustand"
import type { ResumePublicViewUser } from "@/components/resume/resume-public-view"
import type {
    ResumeCreatorProfile, ResumeExperience, ResumePortfolioProject,
    ResumeEducation, ResumeSocialLink, ResumeSkill
} from "@/types/resume"
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
    mergeExperience: (exp: ResumeExperience) => void
    mergeProject: (proj: ResumePortfolioProject) => void
    mergeEducation: (edu: ResumeEducation) => void
    mergeSocialLink: (link: ResumeSocialLink) => void
    mergeSkills: (skills: ResumeSkill[]) => void
    removeExperience: (id: string) => void
    removeProject: (id: string) => void
    removeEducation: (id: string) => void
    removeSocialLink: (id: string) => void
    removeSkill: (id: string) => void
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

    mergeExperience: (exp) => set((s) => {
        if (!s.profile) return s
        const exists = s.profile.experiences.some((e) => e.id === exp.id)
        const experiences = exists
            ? s.profile.experiences.map((e) => (e.id === exp.id ? exp : e))
            : [...s.profile.experiences, exp]
        const profile = { ...s.profile, experiences }
        return { profile, resumeData: toResumePublicViewUser(profile) }
    }),
    mergeProject: (proj) => set((s) => {
        if (!s.profile) return s
        const exists = s.profile.portfolioProjects.some((p) => p.id === proj.id)
        const portfolioProjects = exists
            ? s.profile.portfolioProjects.map((p) => (p.id === proj.id ? proj : p))
            : [...s.profile.portfolioProjects, proj]
        const profile = { ...s.profile, portfolioProjects }
        return { profile, resumeData: toResumePublicViewUser(profile) }
    }),
    mergeEducation: (edu) => set((s) => {
        if (!s.profile) return s
        const exists = s.profile.educations.some((e) => e.id === edu.id)
        const educations = exists
            ? s.profile.educations.map((e) => (e.id === edu.id ? edu : e))
            : [...s.profile.educations, edu]
        const profile = { ...s.profile, educations }
        return { profile, resumeData: toResumePublicViewUser(profile) }
    }),
    mergeSocialLink: (link) => set((s) => {
        if (!s.profile) return s
        const exists = s.profile.socialLinks.some((l) => l.id === link.id)
        const socialLinks = exists
            ? s.profile.socialLinks.map((l) => (l.id === link.id ? link : l))
            : [...s.profile.socialLinks, link]
        const profile = { ...s.profile, socialLinks }
        return { profile, resumeData: toResumePublicViewUser(profile) }
    }),
    mergeSkills: (skills) => set((s) => {
        if (!s.profile) return s
        const profile = { ...s.profile, skills }
        return { profile, resumeData: toResumePublicViewUser(profile) }
    }),
    removeExperience: (id) => set((s) => {
        if (!s.profile) return s
        const experiences = s.profile.experiences.filter((e) => e.id !== id)
        const profile = { ...s.profile, experiences }
        return { profile, resumeData: toResumePublicViewUser(profile) }
    }),
    removeProject: (id) => set((s) => {
        if (!s.profile) return s
        const portfolioProjects = s.profile.portfolioProjects.filter((p) => p.id !== id)
        const profile = { ...s.profile, portfolioProjects }
        return { profile, resumeData: toResumePublicViewUser(profile) }
    }),
    removeEducation: (id) => set((s) => {
        if (!s.profile) return s
        const educations = s.profile.educations.filter((e) => e.id !== id)
        const profile = { ...s.profile, educations }
        return { profile, resumeData: toResumePublicViewUser(profile) }
    }),
    removeSocialLink: (id) => set((s) => {
        if (!s.profile) return s
        const socialLinks = s.profile.socialLinks.filter((l) => l.id !== id)
        const profile = { ...s.profile, socialLinks }
        return { profile, resumeData: toResumePublicViewUser(profile) }
    }),
    removeSkill: (id) => set((s) => {
        if (!s.profile) return s
        const skills = s.profile.skills.filter((sk) => sk.id !== id)
        const profile = { ...s.profile, skills }
        return { profile, resumeData: toResumePublicViewUser(profile) }
    }),
}))