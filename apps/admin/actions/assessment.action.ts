"use server"

import { prisma } from "@repo/prisma"
import { getServerSession } from "@repo/auth"
import { authOptions } from "@repo/auth"
import { revalidatePath } from "next/cache"
import { hasPermission, type AdminPermissions, type AdminPermission, type PermissionLevel } from "@/lib/navigation"

interface Response<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

// Helper to check admin access
async function checkAdminAccess(requiredModule: AdminPermission, requiredLevel: PermissionLevel) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { authorized: false, error: "Not authenticated" }
    }

    const adminAccess = await prisma.adminAccess.findUnique({
        where: { userId: session.user.id },
        include: { user: true }
    })

    if (!adminAccess || !hasPermission(adminAccess.permissions as AdminPermissions, requiredModule, requiredLevel)) {
        return { authorized: false, error: "Not authorized" }
    }

    return { authorized: true, adminAccess }
}

// Get all assessment topics with filters and pagination
export async function getAllAssessmentTopics(params?: {
    page?: number
    limit?: number
    search?: string
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('assessments', 'read')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const page = params?.page || 1
        const limit = params?.limit || 20
        const skip = (page - 1) * limit

        const where: any = {}

        if (params?.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } },
            ]
        }

        const [topics, total] = await Promise.all([
            prisma.assessmentTopic.findMany({
                where,
                skip,
                take: limit,
                include: {
                    _count: {
                        select: {
                            questions: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.assessmentTopic.count({ where })
        ])

        return {
            success: true,
            data: {
                topics,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        }
    } catch (error) {
        console.error("Get assessment topics error:", error)
        return { success: false, error: "Failed to fetch assessment topics" }
    }
}

// Get all assessment questions with filters and pagination
export async function getAllAssessmentQuestions(params?: {
    page?: number
    limit?: number
    search?: string
    topicId?: string
    difficulty?: string
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('assessments', 'read')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const page = params?.page || 1
        const limit = params?.limit || 20
        const skip = (page - 1) * limit

        const where: any = {}

        if (params?.search) {
            where.OR = [
                { question: { contains: params.search, mode: 'insensitive' } },
            ]
        }

        if (params?.topicId) {
            where.topicId = params.topicId
        }

        if (params?.difficulty) {
            where.difficulty = params.difficulty
        }

        const [questions, total] = await Promise.all([
            prisma.assessmentQuestion.findMany({
                where,
                skip,
                take: limit,
                include: {
                    topic: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.assessmentQuestion.count({ where })
        ])

        return {
            success: true,
            data: {
                questions,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        }
    } catch (error) {
        console.error("Get assessment questions error:", error)
        return { success: false, error: "Failed to fetch assessment questions" }
    }
}

// Create assessment topic
export async function createAssessmentTopic(data: {
    name: string
    slug: string
    language: 'JAVASCRIPT' | 'PYTHON' | 'C' | 'CPP' | 'REACTJS' | 'TYPESCRIPT' | 'JAVA' | 'GO' | 'RUST'
    description?: string
    icon?: string
    color?: string
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('assessments', 'write')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const topic = await prisma.assessmentTopic.create({
            data
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "CREATE",
                module: "assessments",
                resourceType: "AssessmentTopic",
                resourceId: topic.id,
                description: `Created assessment topic: ${topic.name}`
            }
        })

        revalidatePath('/assessments')

        return { success: true, data: topic }
    } catch (error) {
        console.error("Create assessment topic error:", error)
        return { success: false, error: "Failed to create assessment topic" }
    }
}

// Create assessment question
export async function createAssessmentQuestion(data: {
    topicId: string
    question: string
    type: 'MCQ' | 'MULTIPLE_SELECT' | 'CODE_OUTPUT' | 'CODE_WRITE' | 'CODE_DEBUG' | 'CODE_COMPLETE' | 'SCENARIO' | 'TRUE_FALSE'
    mode: 'QUIZ' | 'CODE' | 'MOCK' | 'MIXED'
    difficulty: 'EASY' | 'INTERMEDIATE' | 'HARD'
    options?: any
    correctAnswer?: string
    answerExplanation?: string
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('assessments', 'write')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const question = await prisma.assessmentQuestion.create({
            data
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "CREATE",
                module: "assessments",
                resourceType: "AssessmentQuestion",
                resourceId: question.id,
                description: `Created assessment question`
            }
        })

        revalidatePath('/assessments')

        return { success: true, data: question }
    } catch (error) {
        console.error("Create assessment question error:", error)
        return { success: false, error: "Failed to create assessment question" }
    }
}

// Update assessment question
export async function updateAssessmentQuestion(id: string, data: {
    question?: string
    options?: any
    correctAnswer?: string
    difficulty?: 'EASY' | 'INTERMEDIATE' | 'HARD'
    answerExplanation?: string
    type?: 'MCQ' | 'MULTIPLE_SELECT' | 'CODE_OUTPUT' | 'CODE_WRITE' | 'CODE_DEBUG' | 'CODE_COMPLETE' | 'SCENARIO' | 'TRUE_FALSE'
    mode?: 'QUIZ' | 'CODE' | 'MOCK' | 'MIXED'
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('assessments', 'write')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const question = await prisma.assessmentQuestion.update({
            where: { id },
            data
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "UPDATE",
                module: "assessments",
                resourceType: "AssessmentQuestion",
                resourceId: id,
                description: `Updated assessment question`
            }
        })

        revalidatePath('/assessments')

        return { success: true, data: question }
    } catch (error) {
        console.error("Update assessment question error:", error)
        return { success: false, error: "Failed to update assessment question" }
    }
}

// Delete assessment question
export async function deleteAssessmentQuestion(id: string): Promise<Response> {
    try {
        const check = await checkAdminAccess('assessments', 'delete')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        await prisma.assessmentQuestion.delete({ where: { id } })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "DELETE",
                module: "assessments",
                resourceType: "AssessmentQuestion",
                resourceId: id,
                description: `Deleted assessment question`
            }
        })

        revalidatePath('/assessments')

        return { success: true, data: null }
    } catch (error) {
        console.error("Delete assessment question error:", error)
        return { success: false, error: "Failed to delete assessment question" }
    }
}

// Get assessment stats
export async function getAssessmentStats(): Promise<Response> {
    try {
        const check = await checkAdminAccess('assessments', 'read')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const [totalTopics, totalQuestions, easyQuestions, mediumQuestions, hardQuestions] = await Promise.all([
            prisma.assessmentTopic.count(),
            prisma.assessmentQuestion.count(),
            prisma.assessmentQuestion.count({ where: { difficulty: 'EASY' } }),
            prisma.assessmentQuestion.count({ where: { difficulty: 'INTERMEDIATE' } }),
            prisma.assessmentQuestion.count({ where: { difficulty: 'HARD' } }),
        ])

        return {
            success: true,
            data: {
                totalTopics,
                totalQuestions,
                easyQuestions,
                mediumQuestions,
                hardQuestions
            }
        }
    } catch (error) {
        console.error("Get assessment stats error:", error)
        return { success: false, error: "Failed to fetch assessment stats" }
    }
}