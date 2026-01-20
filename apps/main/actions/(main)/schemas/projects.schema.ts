import { z } from 'zod'

export const ProjectEchoSchema = z.object({
    projectTitle: z.string().min(1, 'Title is required'),
    projectDescription: z.string().min(10, 'Description must be at least 10 characters'),
    generationType: z.enum(['FULL_STACK', 'FRONTEND', 'PROGRAMS', 'AI/ML', 'AI_AGENT', 'APP', 'OTHER']),
    stacks: z.object({
        frontend: z.string().optional(),
        backend: z.string().optional(),
        database: z.string().optional(),
        deployment: z.string().optional(),
        aiProvider: z.string().optional(),
    }),
    technologies: z.array(z.string()).optional().default([]), // Optional additional technologies
    primaryLanguageOrFramework: z.string().optional(), // Made optional since we removed it from UI
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    visibility: z.enum(['PRIVATE', 'PUBLIC']),
    includeAssessment: z.boolean(),
    conceptsFocus: z.array(z.string()).optional().default([]), // Optional learning focus
    similarProjectsHint: z.string().optional(),
    preferences: z.object({
        generateNow: z.boolean(),
        pagesPreset: z.enum(['BLOG', 'ECOM', 'DASHBOARD', 'CUSTOM']).optional(), // Made optional
    }),
})