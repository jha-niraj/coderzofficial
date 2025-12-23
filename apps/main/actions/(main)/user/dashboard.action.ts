'use server'

import { auth } from '@repo/auth'
import prisma from "@repo/prisma"
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
