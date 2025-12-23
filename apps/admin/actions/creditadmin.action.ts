"use server";

import { Resend } from 'resend';
import { 
    CreditType 
} from '@repo/prisma/client';
import { prisma } from '@repo/prisma';
import { revalidatePath } from 'next/cache';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface CreditTransaction {
    id: string;
    userId: string;
    userName: string;
    email: string;
    type: 'PURCHASE' | 'SPEND' | 'BONUS' | 'REWARD';
    amount: number;
    description: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    createdAt: string;
    paymentMethod: string;
}

export async function getCreditTransactions(
    page: number = 1,
    limit: number = 30,
    searchTerm?: string,
    typeFilter?: string
) {
    try {
        const skip = (page - 1) * limit;

        const whereClause: any = {};

        if (typeFilter && typeFilter !== 'ALL') {
            whereClause.type = typeFilter as CreditType;
        }

        if (searchTerm) {
            whereClause.OR = [
                {
                    user: {
                        name: { contains: searchTerm, mode: 'insensitive' }
                    }
                },
                {
                    user: {
                        email: { contains: searchTerm, mode: 'insensitive' }
                    }
                },
                {
                    description: { contains: searchTerm, mode: 'insensitive' }
                }
            ];
        }

        const [transactions, totalCount] = await Promise.all([
            prisma.creditTransaction.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.creditTransaction.count({ where: whereClause })
        ]);

        const formattedTransactions: CreditTransaction[] = transactions.map((transaction: any) => ({
            id: transaction.id,
            userId: transaction.userId,
            userName: transaction.user.name || 'Unknown',
            email: transaction.user.email,
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
            status: 'COMPLETED',
            createdAt: transaction.createdAt.toISOString(),
            paymentMethod: 'System'
        }));

        return {
            success: true,
            data: {
                transactions: formattedTransactions,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        };
    } catch (error) {
        console.error('Error fetching credit transactions:', error);
        return {
            success: false,
            error: 'Failed to fetch credit transactions'
        };
    }
}

export async function sendLowCreditEmail({ email, userName, userId }: { email: string, userName: string, userId: string }) {
    try {

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        const currentBalance = user?.credits || 0;

        await resend.emails.send({
            from: 'CoderzLab <noreply@coderzai.xyz>',
            to: email,
            subject: '⚠️ Your Credit Balance is Running Low!',
            html: `
              <div style="font-family: 'Segoe UI', sans-serif; background: #f9fafb; padding: 30px;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); padding: 30px;">
                  <h2 style="color: #111827;">Hey ${userName},</h2>
                  <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
                    👀 Heads up! Your current credit balance is <strong style="color: #ef4444;">${currentBalance}</strong> credits.
                  </p>
          
                  <p style="font-size: 15px; color: #4b5563;">
                    To keep enjoying all the awesome features of CoderzLab, top up now and stay in the game! Your credits let you access:
                  </p>
          
                  <ul style="color: #4b5563; padding-left: 20px; margin-top: 16px; margin-bottom: 24px;">
                    <li>🔥 Bug Hunt challenges</li>
                    <li>🚀 Premium features</li>
                    <li>🏆 Exclusive competitions</li>
                  </ul>
          
                  <a href="https://coderzai.xyz/purchase" 
                     style="display: inline-block; padding: 12px 20px; background-color: #10b981; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                    💳 Top Up Credits
                  </a>
          
                  <p style="margin-top: 40px; font-size: 14px; color: #6b7280;">Thanks for being a part of the community,</p>
                  <p style="font-size: 14px; color: #6b7280;">— The CoderzLab Team</p>
                </div>
              </div>
            `
        });

        return { success: true };
    } catch (error) {
        console.error('Error sending low credit email:', error);
        return { success: false, error: 'Failed to send email' };
    }
}

export async function distributeCredits(
    userType: 'ALL' | 'PREMIUM' | 'NEW' | 'ACTIVE',
    amount: number,
    reason: string,
    emailTemplate: string
) {
    try {
        let whereClause: any = {};

        if (userType === 'NEW') {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            whereClause.createdAt = { gte: sevenDaysAgo };
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            select: { id: true, credits: true, email: true, name: true }
        });

        // Update credits for all selected users
        const updatePromises = users.map((user: any) =>
            prisma.user.update({
                where: { id: user.id },
                data: { credits: user.credits + amount }
            })
        );

        // Create credit transaction records
        const transactionPromises = users.map((user: any) =>
            prisma.creditTransaction.create({
                data: {
                    userId: user.id,
                    amount,
                    type: 'BONUS',
                    description: reason,
                    currency: 'NA'
                }
            })
        );

        // Send emails to users
        const emailPromises = users.map((user: any) =>
            resend.emails.send({
                from: 'CoderzLab <noreply@coderzlab.com>',
                to: user.email,
                subject: 'Credits Added to Your Account',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Hi ${user.name},</h2>
                        <p>Great news! We've added ${amount} credits to your account.</p>
                        <p>Reason: ${reason}</p>
                        <p>Your new balance: ${user.credits + amount} credits</p>
                        <p style="margin-top: 20px;">The CoderzLab Team</p>
                    </div>
                `
            })
        );

        await Promise.all([...updatePromises, ...transactionPromises, ...emailPromises]);

        return {
            success: true,
            message: `Credits distributed to ${users.length} users`
        };
    } catch (error) {
        console.error('Error distributing credits:', error);
        return {
            success: false,
            error: 'Failed to distribute credits'
        };
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