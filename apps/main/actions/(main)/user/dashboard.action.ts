'use server'

import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import { db, creditRequests } from "@repo/db"
import { eq, and } from "drizzle-orm"

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
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Check if user already has a pending request
        const pendingRequest = await db.query.creditRequests.findFirst({
            where: and(
                eq(creditRequests.userId, session.user.id),
                eq(creditRequests.status, 'PENDING')
            )
        })

        if (pendingRequest) {
            return {
                success: false,
                error: "You already have a pending credit request. Please wait for it to be processed."
            }
        }

        // Create the credit request
        const [creditRequest] = await db.insert(creditRequests).values({
            userId: session.user.id,
            requestedCredits: data.requestedCredits,
            linkedinPostUrl: data.linkedinPostUrl,
            twitterPostUrl: data.twitterPostUrl
        }).returning()

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
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const requests = await db.query.creditRequests.findMany({
            where: eq(creditRequests.userId, session.user.id),
            orderBy: (creditRequests, { desc }) => [desc(creditRequests.createdAt)],
            limit: 10
        })

        return { success: true, data: requests }
    } catch (error) {
        console.error("Error fetching user credit requests:", error)
        return { success: false, error: "Failed to fetch credit requests" }
    }
}
