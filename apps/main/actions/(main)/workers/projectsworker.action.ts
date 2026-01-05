"use server"

import { auth } from '@repo/auth'
import prisma from "@repo/prisma"
import { z } from "zod"
import { ProjectEchoSchema } from "../schemas/projects.schema"
import crypto from 'crypto'

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

// Helper to get signed token directly (no fetch needed)
export async function issueWorkerToken(action: 'generate_project' | 'check_job' | 'run_code' | 'check_execution', jobId?: string) {
    const user = await getCurrentUser()
    const secret = process.env.WORKER_SECRET

    if (!secret) throw new Error("Worker secret not configured")

    const now = Math.floor(Date.now() / 1000)
    const payload = {
        userId: user.id,
        action,
        jobId,
        iat: now,
        exp: now + 300 // 5 minutes
    }

    const data = JSON.stringify(payload)
    const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url')
    const encodedPayload = Buffer.from(data).toString('base64url')

    return `${encodedPayload}.${signature}`
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
export async function initiateProjectGeneration(
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
            userId: user.id
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
export async function syncJobStatus(
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

export async function finalizeGeneratedProject(jobId: string, workerData: any) {
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

        // Data from worker is now minimal: { projectId, slug, title, saved: true }
        if (!workerData.projectId || !workerData.slug) {
            throw new Error('Invalid worker response: Missing project ID or slug')
        }

        // Deduct credits
        await deductCredits(user.id, totalCost, `Generated project: ${workerData.title || 'Project'}`)

        // Update job status
        await prisma.backgroundJob.update({
            where: { jobId },
            data: {
                status: 'completed',
                progress: 100,
            },
        })

        console.log(`✅ [PROJECT GENERATION COMPLETED] Project: ${workerData.slug}`)

        return {
            success: true,
            message: 'Project generation finalized',
            data: {
                projectSlug: workerData.slug,
                projectId: workerData.projectId,
            },
        }
    } catch (err: any) {
        console.error('Failed to finalize project generation:', err)
        return {
            success: false,
            error: err.message || 'Failed to finalize project',
        }
    }
}