"use server"

import { prisma } from "@repo/prisma"
import { getServerSession } from "@repo/auth"
import { authOptions } from "@repo/auth"
import { revalidatePath } from "next/cache"
import { hasPermission } from "@/lib/navigation"

interface Response<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

// Helper to check admin access
async function checkAdminAccess(requiredModule: string, requiredLevel: 'read' | 'write' | 'delete' | 'full') {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { authorized: false, error: "Not authenticated" }
    }

    const adminAccess = await prisma.adminAccess.findUnique({
        where: { userId: session.user.id },
        include: { user: true }
    })

    if (!adminAccess || !hasPermission(adminAccess.permissions, requiredModule, requiredLevel)) {
        return { authorized: false, error: "Not authorized" }
    }

    return { authorized: true, adminAccess }
}

// Get all mock interviews with filters and pagination
export async function getAllMockInterviews(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('mocks', 'read')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const page = params?.page || 1
        const limit = params?.limit || 20
        const skip = (page - 1) * limit

        const where: any = {}

        if (params?.search) {
            where.OR = [
                { role: { contains: params.search, mode: 'insensitive' } },
                { company: { contains: params.search, mode: 'insensitive' } },
            ]
        }

        if (params?.status) {
            where.status = params.status
        }

        const [mocks, total] = await Promise.all([
            prisma.mockInterviewVoice.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.mockInterviewVoice.count({ where })
        ])

        return {
            success: true,
            data: {
                mocks,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        }
    } catch (error) {
        console.error("Get mock interviews error:", error)
        return { success: false, error: "Failed to fetch mock interviews" }
    }
}

// Get mock interview by ID
export async function getMockInterviewById(id: string): Promise<Response> {
    try {
        const check = await checkAdminAccess('mocks', 'read')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const mock = await prisma.mockInterviewVoice.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                }
            }
        })

        if (!mock) {
            return { success: false, error: "Mock interview not found" }
        }

        return { success: true, data: mock }
    } catch (error) {
        console.error("Get mock interview error:", error)
        return { success: false, error: "Failed to fetch mock interview" }
    }
}

// Update mock interview
export async function updateMockInterview(id: string, data: {
    status?: string
    score?: number
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('mocks', 'write')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const mock = await prisma.mockInterviewVoice.update({
            where: { id },
            data
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "UPDATE",
                module: "mocks",
                resourceType: "MockInterview",
                resourceId: id,
                description: `Updated mock interview: ${mock.role} at ${mock.company}`
            }
        })

        revalidatePath('/mock')
        revalidatePath(`/mock/${id}`)

        return { success: true, data: mock }
    } catch (error) {
        console.error("Update mock interview error:", error)
        return { success: false, error: "Failed to update mock interview" }
    }
}

// Delete mock interview
export async function deleteMockInterview(id: string): Promise<Response> {
    try {
        const check = await checkAdminAccess('mocks', 'delete')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const mock = await prisma.mockInterviewVoice.findUnique({ where: { id } })
        if (!mock) {
            return { success: false, error: "Mock interview not found" }
        }

        await prisma.mockInterviewVoice.delete({ where: { id } })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "DELETE",
                module: "mocks",
                resourceType: "MockInterview",
                resourceId: id,
                description: `Deleted mock interview: ${mock.role} at ${mock.company}`
            }
        })

        revalidatePath('/mock')

        return { success: true, data: null }
    } catch (error) {
        console.error("Delete mock interview error:", error)
        return { success: false, error: "Failed to delete mock interview" }
    }
}

// Bulk delete mock interviews
export async function bulkDeleteMockInterviews(ids: string[]): Promise<Response> {
    try {
        const check = await checkAdminAccess('mocks', 'delete')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        await prisma.mockInterviewVoice.deleteMany({
            where: { id: { in: ids } }
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "DELETE",
                module: "mocks",
                resourceType: "MockInterview",
                resourceId: ids.join(','),
                description: `Bulk deleted ${ids.length} mock interviews`
            }
        })

        revalidatePath('/mock')

        return { success: true, data: null }
    } catch (error) {
        console.error("Bulk delete mock interviews error:", error)
        return { success: false, error: "Failed to delete mock interviews" }
    }
}

// Get mock interview stats
export async function getMockInterviewStats(): Promise<Response> {
    try {
        const check = await checkAdminAccess('mocks', 'read')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const [total, completed, inProgress, cancelled] = await Promise.all([
            prisma.mockInterviewVoice.count(),
            prisma.mockInterviewVoice.count({ where: { status: 'COMPLETED' } }),
            prisma.mockInterviewVoice.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.mockInterviewVoice.count({ where: { status: 'CANCELLED' } }),
        ])

        // Average score
        const avgScore = await prisma.mockInterviewVoice.aggregate({
            where: { score: { not: null } },
            _avg: { score: true }
        })

        return {
            success: true,
            data: {
                total,
                completed,
                inProgress,
                cancelled,
                averageScore: avgScore._avg.score || 0
            }
        }
    } catch (error) {
        console.error("Get mock interview stats error:", error)
        return { success: false, error: "Failed to fetch mock interview stats" }
    }
}
