'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// ==================== CREDIT REQUEST ACTIONS ====================

/**
 * Submit a credit request for LinkedIn/Twitter post
 */
export async function submitCreditRequest(data: {
    requestedCredits: number
    linkedinPostUrl: string
    twitterPostUrl?: string
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Check if user already has a pending request
        const pendingRequest = await prisma.creditRequest.findFirst({
            where: {
                userId: session.user.id,
                status: 'PENDING'
            }
        })

        if (pendingRequest) {
            return { 
                success: false, 
                error: "You already have a pending credit request. Please wait for it to be processed." 
            }
        }

        // Create the credit request
        const creditRequest = await prisma.creditRequest.create({
            data: {
                userId: session.user.id,
                requestedCredits: data.requestedCredits,
                linkedinPostUrl: data.linkedinPostUrl,
                twitterPostUrl: data.twitterPostUrl
            }
        })

        return { 
            success: true, 
            data: creditRequest,
            message: "Credit request submitted successfully!" 
        }
    } catch (error) {
        console.error("Error submitting credit request:", error)
        return { success: false, error: "Failed to submit credit request" }
    }
}

/**
 * Get all credit requests (admin only)
 */
export async function getAllCreditRequests(
    page: number = 1,
    limit: number = 20,
    search?: string,
    statusFilter?: string
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        if (user?.role !== 'Admin') {
            return { success: false, error: "Admin access required" }
        }

        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}
        
        if (statusFilter && statusFilter !== 'ALL') {
            where.status = statusFilter
        }

        if (search) {
            where.OR = [
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { linkedinPostUrl: { contains: search, mode: 'insensitive' } }
            ]
        }

        const [requests, total, stats] = await Promise.all([
            prisma.creditRequest.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.creditRequest.count({ where }),
            prisma.creditRequest.groupBy({
                by: ['status'],
                _count: { status: true }
            })
        ])

        // Calculate stats
        const statsMap = stats.reduce((acc, stat) => {
            acc[stat.status] = stat._count.status
            return acc
        }, {} as Record<string, number>)

        return {
            success: true,
            data: {
                requests,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                },
                stats: {
                    pending: statsMap.PENDING || 0,
                    approved: statsMap.APPROVED || 0,
                    rejected: statsMap.REJECTED || 0,
                    total: (statsMap.PENDING || 0) + (statsMap.APPROVED || 0) + (statsMap.REJECTED || 0)
                }
            }
        }
    } catch (error) {
        console.error("Error fetching credit requests:", error)
        return { success: false, error: "Failed to fetch credit requests" }
    }
}

/**
 * Process a credit request (admin only)
 */
export async function processCreditRequest(
    requestId: string,
    action: 'APPROVE' | 'REJECT',
    adminNotes?: string
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Check if user is admin
        const admin = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        if (admin?.role !== 'Admin') {
            return { success: false, error: "Admin access required" }
        }

        // Get the credit request
        const creditRequest = await prisma.creditRequest.findUnique({
            where: { id: requestId },
            include: { user: true }
        })

        if (!creditRequest) {
            return { success: false, error: "Credit request not found" }
        }

        if (creditRequest.status !== 'PENDING') {
            return { success: false, error: "This request has already been processed" }
        }

        // Process the request
        const updatedRequest = await prisma.$transaction(async (tx) => {
            // Update credit request status
            const updated = await tx.creditRequest.update({
                where: { id: requestId },
                data: {
                    status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                    processedAt: new Date(),
                    processedBy: session.user!.id,
                    adminNotes
                }
            })

            // If approved, add credits to user
            if (action === 'APPROVE') {
                await tx.user.update({
                    where: { id: creditRequest.userId },
                    data: {
                        credits: { increment: creditRequest.requestedCredits }
                    }
                })
            }

            return updated
        })

        revalidatePath('/admin/credit-requests')

        return { 
            success: true, 
            data: updatedRequest,
            message: `Request ${action.toLowerCase()}ed successfully!`
        }
    } catch (error) {
        console.error("Error processing credit request:", error)
        return { success: false, error: "Failed to process credit request" }
    }
}

/**
 * Get user's credit request history
 */
export async function getUserCreditRequests() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const requests = await prisma.creditRequest.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        return { success: true, data: requests }
    } catch (error) {
        console.error("Error fetching user credit requests:", error)
        return { success: false, error: "Failed to fetch credit requests" }
    }
}
