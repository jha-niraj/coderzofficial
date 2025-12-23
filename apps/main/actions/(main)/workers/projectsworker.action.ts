"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ProjectEchoSchema } from "../schemas/projects.schema"

interface ActionResponse {
    success: boolean
    data?: any
    error?: string
}

async function getCurrentUser() {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Not authenticated")
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw new Error("User not found")
    return user
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 50)
}

// Helper to get signed token from backend
export async function getWorkerToken(action: 'generate_project' | 'check_job', jobId?: string) {
    const response = await fetch('/api/worker-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, jobId }),
    })
    
    if (!response.ok) {
        throw new Error('Failed to get worker token')
    }
    
    const { token } = await response.json()
    return token
}

async function deductCredits(userId: string, amount: number, description: string) {
    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: amount } },
        }),
        prisma.creditTransaction.create({
            data: {
                userId,
                amount: -amount,
                type: "SPEND",
                currency: "NA",
                description,
            },
        }),
    ])
}

// ========================================
// WORKER JOB MANAGEMENT
// ========================================

/**
 * Create a project generation job and call the external worker API
 * This is the new entry point for project generation
 */
export async function createProjectGenerationJob(
    input: z.infer<typeof ProjectEchoSchema>,
    workerToken: string
): Promise<{ success: boolean, jobId?: string, error?: string }> {
    try {
        const user = await getCurrentUser()

        // Validate input
        const validatedInput = ProjectEchoSchema.parse(input)
        console.log('✅ [VALIDATION] Input validated successfully')

        // Calculate costs
        const baseCost = validatedInput.visibility === "PUBLIC" ? 13 : 25
        const assessmentCost = validatedInput.includeAssessment ? 30 : 0
        const totalCost = baseCost + assessmentCost
        console.log(`💰 [CREDITS] Total cost: ${totalCost} (Base: ${baseCost}, Assessment: ${assessmentCost})`)

        // Check user credits (don't deduct yet - wait for worker success)
        if (user.credits < totalCost) {
            console.log(`❌ [CREDITS] Insufficient credits. User has ${user.credits}, needs ${totalCost}`)
            return {
                success: false,
                error: `Insufficient credits. You need ${totalCost} credits to generate this project.`,
            }
        }

        // Transform data for worker API
        const stacksArray: Array<{ name: string; category: string }> = []
        if (validatedInput.stacks?.frontend) stacksArray.push({ name: validatedInput.stacks.frontend, category: 'FRONTEND' })
        if (validatedInput.stacks?.backend) stacksArray.push({ name: validatedInput.stacks.backend, category: 'BACKEND' })
        if (validatedInput.stacks?.database) stacksArray.push({ name: validatedInput.stacks.database, category: 'DATABASE' })
        if (validatedInput.stacks?.deployment) stacksArray.push({ name: validatedInput.stacks.deployment, category: 'DEPLOYMENT' })
        if (validatedInput.stacks?.aiProvider) stacksArray.push({ name: validatedInput.stacks.aiProvider, category: 'AI' })

        const workerPayload = {
            projectTitle: validatedInput.projectTitle,
            description: validatedInput.projectDescription,
            generationType: validatedInput.generationType,
            visibility: validatedInput.visibility,
            includeAssessment: validatedInput.includeAssessment || false,
            stacks: stacksArray,
        }

        // Call worker API to create job
        const response = await fetch(`${process.env.WORKER_API_URL}/api/v1/generateproject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${workerToken}`,
            },
            body: JSON.stringify(workerPayload),
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Worker API error: ${error}`)
        }

        const result = await response.json() as {
            success: boolean
            jobId: string
            message: string
        }

        if (!result.success || !result.jobId) {
            throw new Error('Failed to create job in worker')
        }

        // Create job record in database
        await prisma.backgroundJob.create({
            data: {
                jobId: result.jobId,
                status: 'waiting',
                progress: 0,
                userId: user.id,
                input: validatedInput as any,
            }
        })

        console.log(`✅ [JOB CREATED] Job ID: ${result.jobId}`)

        return {
            success: true,
            jobId: result.jobId,
        }
    } catch (error: any) {
        console.error(`❌ [JOB CREATE] Failed:`, error)
        return {
            success: false,
            error: error.message || "Failed to create generation job",
        }
    }
}

/**
 * Update job status in database
 * Called from client after polling worker API
 */
export async function updateJobStatusInDatabase(
    jobId: string,
    status: string,
    progress: number,
    data?: any,
    error?: string
) {
    try {
        const dbJob = await prisma.backgroundJob.update({
            where: { jobId },
            data: {
                status,
                progress,
                result: data ? (data as any) : null,
                error: error || null,
                updatedAt: new Date(),
            },
        })

        return {
            success: true,
            data: dbJob,
        }
    } catch (error: any) {
        console.error('Failed to update job status:', error)
        return {
            success: false,
            error: error.message || 'Failed to update job status',
        }
    }
}

export async function saveProjectToDatabase(jobId: string, workerData: any) {
    try {
        const user = await getCurrentUser()

        // Get the job from database to get original input
        const job = await prisma.backgroundJob.findUnique({
            where: { jobId },
        })

        if (!job) {
            return {
                success: false,
                error: 'Job not found',
            }
        }

        const inputData = job.input as any

        // Calculate costs and deduct credits
        const baseCost = inputData.visibility === "PUBLIC" ? 13 : 25
        const assessmentCost = inputData.includeAssessment ? 30 : 0
        const totalCost = baseCost + assessmentCost

        // Extract data from worker response
        const { project, blueprint, pages, tasks } = workerData

        // Generate slug from title
        const slug = generateSlug(project.title)

        // Save project to database
        const savedProject = await prisma.projectV2.create({
            data: {
                title: project.title,
                slug: slug,
                shortDescription: project.shortDescription,
                description: project.description,
                technologies: project.technologies,
                generationType: inputData.generationType,
                primaryLanguageOrFramework: project.primaryLanguage,
                difficulty: project.difficulty,
                visibility: inputData.visibility,
                estimatedHours: project.estimatedHours,
                createdBy: user.id,
                blueprintOverview: blueprint.overview,
                learningObjectives: blueprint.learningObjectives,
                prerequisites: blueprint.prerequisites,
                coreFeatures: blueprint.coreFeatures,
                advancedFeatures: blueprint.advancedFeatures,
                stacks: inputData.stacks,
                assistantEcho: JSON.stringify({ pages, tasks }),
                assistantRaw: JSON.stringify(workerData),
            }
        })

        // Deduct credits after successful project creation
        await deductCredits(user.id, totalCost, `Generated project: ${project.title}`)

        // Update job status
        await prisma.backgroundJob.update({
            where: { jobId },
            data: {
                status: 'completed',
                progress: 100,
            },
        })

        console.log(`✅ [PROJECT SAVED] Project: ${savedProject.slug}`)

        return {
            success: true,
            message: 'Project saved to database successfully',
            data: {
                projectSlug: savedProject.slug,
                projectId: savedProject.id,
            },
        }
    } catch (err: any) {
        console.error('Failed to save project:', err)
        return {
            success: false,
            error: err.message || 'Failed to save project',
        }
    }
}