"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CreateCardData {
    title: string;
    description: string;
    cardData: {
        title: string;
        description: string;
        metrics: {
            overallScore: string;
            activityLevel: string;
            collaborationScore: string;
        };
        skills: {
            languages: string[];
            frameworks: string[];
        };
        highlights: string[];
        careerLevel: string;
        userName: string;
        userAvatar: string;
    };
    isPublic?: boolean;
}

export async function createPortfolioCard(data: CreateCardData) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const card = await prisma.portfolioCard.create({
            data: {
                userId,
                title: data.title,
                description: data.description,
                cardData: data.cardData,
                isPublic: data.isPublic || false
            }
        });

        revalidatePath('/cards');
        return { success: true, card };
    } catch (error) {
        console.error('Error creating card:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to create card' 
        };
    }
}

export async function getUserCards() {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const cards = await prisma.portfolioCard.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return { success: true, cards };
    } catch (error) {
        console.error('Error fetching cards:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch cards',
            cards: []
        };
    }
}

export async function deletePortfolioCard(cardId: string) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            throw new Error("Unauthorized");
        }

        // Verify the card belongs to the user
        const card = await prisma.portfolioCard.findFirst({
            where: {
                id: cardId,
                userId: userId
            }
        });

        if (!card) {
            throw new Error("Card not found or unauthorized");
        }

        await prisma.portfolioCard.delete({
            where: {
                id: cardId
            }
        });

        revalidatePath('/cards');
        return { success: true };
    } catch (error) {
        console.error('Error deleting card:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to delete card' 
        };
    }
}

export async function updateCardVisibility(cardId: string, isPublic: boolean) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            throw new Error("Unauthorized");
        }

        // Verify the card belongs to the user
        const card = await prisma.portfolioCard.findFirst({
            where: {
                id: cardId,
                userId: userId
            }
        });

        if (!card) {
            throw new Error("Card not found or unauthorized");
        }

        const updatedCard = await prisma.portfolioCard.update({
            where: {
                id: cardId
            },
            data: {
                isPublic
            }
        });

        revalidatePath('/cards');
        return { success: true, card: updatedCard };
    } catch (error) {
        console.error('Error updating card visibility:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to update card' 
        };
    }
}

export async function incrementShareCount(cardId: string) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const updatedCard = await prisma.portfolioCard.update({
            where: {
                id: cardId
            },
            data: {
                shareCount: {
                    increment: 1
                }
            }
        });

        revalidatePath('/cards');
        return { success: true, card: updatedCard };
    } catch (error) {
        console.error('Error incrementing share count:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to update share count' 
        };
    }
} 