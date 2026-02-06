/*
    * Zod validation schemas for Job-related forms
    * Used for client-side and server-side validation
*/

import { z } from "zod"

// ============================================
// ENUM SCHEMAS
// ============================================

export const jobLocationTypeSchema = z.enum(["REMOTE", "HYBRID", "ONSITE"])

export const employmentTypeSchema = z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE"])

export const jobStatusSchema = z.enum(["DRAFT", "ACTIVE", "PAUSED", "CLOSED", "FILLED"])

export const jobVisibilitySchema = z.enum(["PUBLIC", "INVITE_ONLY"])

// ============================================
// ASSIGNMENT DETAILS SCHEMA
// ============================================

export const assignmentDetailsSchema = z.object({
    title: z.string().min(1, "Assignment title is required"),
    description: z.string().min(1, "Assignment description is required"),
    requirements: z.array(z.string()).default([]),
    resources: z.array(z.string()).default([]),
    deliverables: z.array(z.string()).default([]),
})

// ============================================
// CREATE JOB SCHEMA
// ============================================

export const createJobSchema = z.object({
    // Required fields
    title: z.string()
        .min(1, "Job title is required")
        .min(3, "Job title must be at least 3 characters")
        .max(100, "Job title must be less than 100 characters"),
    
    description: z.string()
        .min(1, "Job description is required")
        .min(50, "Job description must be at least 50 characters"),
    
    locationType: jobLocationTypeSchema,
    employmentType: employmentTypeSchema,
    
    // Optional fields with validation
    department: z.string().optional(),
    
    location: z.string()
        .max(100, "Location must be less than 100 characters")
        .optional()
        .nullable(),
    
    requirements: z.array(z.string()).default([]),
    responsibilities: z.array(z.string()).default([]),
    benefits: z.array(z.string()).default([]),
    
    // Experience
    experienceMin: z.number()
        .min(0, "Minimum experience cannot be negative")
        .max(50, "Minimum experience cannot exceed 50 years")
        .optional()
        .nullable(),
    
    experienceMax: z.number()
        .min(0, "Maximum experience cannot be negative")
        .max(50, "Maximum experience cannot exceed 50 years")
        .optional()
        .nullable(),
    
    // Salary
    salaryMin: z.number()
        .min(0, "Minimum salary cannot be negative")
        .optional()
        .nullable(),
    
    salaryMax: z.number()
        .min(0, "Maximum salary cannot be negative")
        .optional()
        .nullable(),
    
    salaryCurrency: z.string().default("INR"),
    salaryDisclosed: z.boolean().default(true),
    
    // Skills
    skillsRequired: z.array(z.string())
        .min(1, "At least one required skill must be specified")
        .default([]),
    
    skillsPreferred: z.array(z.string()).default([]),
    
    // Assignment
    hasAssignment: z.boolean().default(false),
    assignmentDetails: assignmentDetailsSchema.optional().nullable(),
    assignmentDeadlineDays: z.number()
        .min(1, "Assignment deadline must be at least 1 day")
        .max(30, "Assignment deadline cannot exceed 30 days")
        .optional()
        .nullable(),
    
    // Interview Process
    interviewProcessId: z.string().optional().nullable(),
    
    // Visibility & Status
    visibility: jobVisibilitySchema.default("PUBLIC"),
    status: jobStatusSchema.default("DRAFT"),
}).superRefine((data, ctx) => {
    // Validate salary range
    if (data.salaryMin && data.salaryMax && data.salaryMin > data.salaryMax) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Minimum salary cannot be greater than maximum salary",
            path: ["salaryMin"],
        })
    }
    
    // Validate experience range
    if (data.experienceMin && data.experienceMax && data.experienceMin > data.experienceMax) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Minimum experience cannot be greater than maximum experience",
            path: ["experienceMin"],
        })
    }
    
    // If assignment is enabled, deadline is required
    if (data.hasAssignment && !data.assignmentDeadlineDays) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Assignment deadline is required when assignment is enabled",
            path: ["assignmentDeadlineDays"],
        })
    }
})

// Type inference from schema
export type CreateJobFormData = z.infer<typeof createJobSchema>

// ============================================
// UPDATE JOB SCHEMA
// ============================================

// Base schema without refinements for partial updates
export const baseJobSchema = z.object({
    title: z.string()
        .min(1, "Job title is required")
        .min(3, "Job title must be at least 3 characters")
        .max(100, "Job title must be less than 100 characters"),
    description: z.string()
        .min(1, "Job description is required")
        .min(50, "Job description must be at least 50 characters"),
    locationType: jobLocationTypeSchema,
    employmentType: employmentTypeSchema,
    department: z.string().optional(),
    location: z.string().max(100).optional().nullable(),
    requirements: z.array(z.string()).default([]),
    responsibilities: z.array(z.string()).default([]),
    benefits: z.array(z.string()).default([]),
    experienceMin: z.number().min(0).max(50).optional().nullable(),
    experienceMax: z.number().min(0).max(50).optional().nullable(),
    salaryMin: z.number().min(0).optional().nullable(),
    salaryMax: z.number().min(0).optional().nullable(),
    salaryCurrency: z.string().default("INR"),
    salaryDisclosed: z.boolean().default(true),
    skillsRequired: z.array(z.string()).default([]),
    skillsPreferred: z.array(z.string()).default([]),
    hasAssignment: z.boolean().default(false),
    assignmentDetails: assignmentDetailsSchema.optional().nullable(),
    assignmentDeadlineDays: z.number().min(1).max(30).optional().nullable(),
    interviewProcessId: z.string().optional().nullable(),
    visibility: jobVisibilitySchema.default("PUBLIC"),
    status: jobStatusSchema.default("DRAFT"),
})

export const updateJobSchema = baseJobSchema.partial()

export type UpdateJobFormData = z.infer<typeof updateJobSchema>