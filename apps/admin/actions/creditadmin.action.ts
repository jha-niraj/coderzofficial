"use server";

import { Resend } from 'resend';
import { CreditType } from '@prisma/client';
import prisma from '@/lib/prisma';

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