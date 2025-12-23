"use server"

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { CreditType, Currency, XpTransactionProps } from '@prisma/client';

// Level configuration - this could be moved to database later
const LEVEL_CONFIG = [
    { level: 1, title: "Coding Newbie", xpRequired: 0, xpReward: 0, creditsReward: 0, description: "Welcome to the coding journey!", icon: "🌱", color: "#10B981" },
	{ level: 2, title: "Code Explorer", xpRequired: 500, xpReward: 50, creditsReward: 10, description: "Starting to explore the world of code", icon: "🔍", color: "#3B82F6" },
	{ level: 3, title: "Bug Squasher", xpRequired: 1200, xpReward: 75, creditsReward: 15, description: "Getting good at finding and fixing bugs", icon: "🐛", color: "#8B5CF6" },
	{ level: 4, title: "Algorithm Apprentice", xpRequired: 2500, xpReward: 100, creditsReward: 25, description: "Learning the art of algorithms", icon: "⚙️", color: "#F59E0B" },
	{ level: 5, title: "Code Artisan", xpRequired: 5000, xpReward: 150, creditsReward: 35, description: "Crafting beautiful and efficient code", icon: "🎨", color: "#EF4444" },
	{ level: 6, title: "Debug Detective", xpRequired: 8500, xpReward: 200, creditsReward: 50, description: "Master of debugging mysteries", icon: "🕵️", color: "#6366F1" },
	{ level: 7, title: "Algorithm Architect", xpRequired: 13500, xpReward: 300, creditsReward: 75, description: "Designing complex algorithmic solutions", icon: "🏗️", color: "#059669" },
	{ level: 8, title: "Code Virtuoso", xpRequired: 20000, xpReward: 400, creditsReward: 100, description: "Virtuoso level coding skills", icon: "🎭", color: "#DC2626" },
	{ level: 9, title: "Tech Sage", xpRequired: 30000, xpReward: 600, creditsReward: 150, description: "Wise in the ways of technology", icon: "🧙‍♂️", color: "#7C3AED" },
	{ level: 10, title: "Code Grandmaster", xpRequired: 50000, xpReward: 1000, creditsReward: 250, description: "Grandmaster of the coding realm", icon: "👑", color: "#B91C1C" }
];

// Initialize levels in database (call this once)
export async function initializeLevels() {
    try {
        const existingLevels = await prisma.level.count();
        
        if (existingLevels === 0) {
            await prisma.level.createMany({
                data: LEVEL_CONFIG.map(config => ({
                    level: config.level,
                    title: config.title,
                    xpRequired: config.xpRequired,
                    xpReward: config.xpReward,
                    creditsReward: config.creditsReward,
                    description: config.description,
                    icon: config.icon,
                    color: config.color
                }))
            });
            console.log('Levels initialized successfully');
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error initializing levels:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// Calculate what level a user should be based on their total XP
function calculateLevelFromXp(totalXp: number) {
    let currentLevel = 1;
    let nextLevelXp = 0;
    let currentLevelXp = 0;
    
    for (const config of LEVEL_CONFIG) {
        if (totalXp >= config.xpRequired) {
            currentLevel = config.level;
            currentLevelXp = config.xpRequired;
            // Find next level XP
            const nextLevel = LEVEL_CONFIG.find(l => l.level === config.level + 1);
            nextLevelXp = nextLevel ? nextLevel.xpRequired : config.xpRequired;
        } else {
            break;
        }
    }
    
    const progressInCurrentLevel = totalXp - currentLevelXp;
    const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
    const progressPercentage = xpNeededForNextLevel > 0 ? (progressInCurrentLevel / xpNeededForNextLevel) * 100 : 100;
    
    return {
        currentLevel,
        progressInCurrentLevel,
        xpNeededForNextLevel: nextLevelXp - totalXp,
        progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
        nextLevelXp,
        currentLevelXp
    };
}

// Add XP to user and handle level ups
export async function addXpToUser(userId: string, xpAmount: number, description: string, type: XpTransactionProps = XpTransactionProps.REWARD) {
    try {
        return await prisma.$transaction(async (tx: any) => {
            // Get current user data
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { currentXp: true, totalXp: true, currentLevel: true }
            });
            
            if (!user) {
                throw new Error('User not found');
            }
            
            // Calculate new XP values
            const newCurrentXp = user.currentXp + xpAmount;
            const newTotalXp = user.totalXp + xpAmount;
            
            // Calculate what level user should be
            const levelInfo = calculateLevelFromXp(newTotalXp);
            const shouldLevelUp = levelInfo.currentLevel > user.currentLevel;
            
            // Update user XP and level
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    currentXp: newCurrentXp,
                    totalXp: newTotalXp,
                    currentLevel: levelInfo.currentLevel
                }
            });
            
            // Create XP transaction
            await tx.xpTransaction.create({
                data: {
                    userId,
                    amount: xpAmount,
                    description,
                    type
                }
            });
            
            // Handle level ups
            const levelUps = [];
            if (shouldLevelUp) {
                for (let level = user.currentLevel + 1; level <= levelInfo.currentLevel; level++) {
                    const levelConfig = LEVEL_CONFIG.find(l => l.level === level);
                    if (levelConfig && levelConfig.xpReward > 0) {
                        // Add level up bonus XP
                        await tx.user.update({
                            where: { id: userId },
                            data: {
                                currentXp: { increment: levelConfig.xpReward },
                                totalXp: { increment: levelConfig.xpReward }
                            }
                        });
                        
                        // Add credits reward if any
                        if (levelConfig.creditsReward > 0) {
                            await tx.user.update({
                                where: { id: userId },
                                data: {
                                    credits: { increment: levelConfig.creditsReward }
                                }
                            });
                            
                            // Create credit transaction for level reward
                            await tx.creditTransaction.create({
                                data: {
                                    userId,
                                    amount: levelConfig.creditsReward,
                                    type: CreditType.BONUS,
                                    currency: Currency.INR,
                                    description: `Level ${level} achievement bonus`
                                }
                            });
                        }
                        
                        // Create XP transaction for level bonus
                        await tx.xpTransaction.create({
                            data: {
                                userId,
                                amount: levelConfig.xpReward,
                                description: `Level ${level} achievement bonus`,
                                type: XpTransactionProps.BONUS
                            }
                        });
                        
                        // Record level progress
                        await tx.userLevelProgress.create({
                            data: {
                                userId,
                                level,
                                xpEarned: levelConfig.xpReward,
                                creditsEarned: levelConfig.creditsReward
                            }
                        });
                        
                        levelUps.push({
                            level,
                            title: levelConfig.title,
                            xpReward: levelConfig.xpReward,
                            creditsReward: levelConfig.creditsReward,
                            icon: levelConfig.icon
                        });
                    }
                }
            }
            
            return {
                success: true,
                newCurrentXp: newCurrentXp + (levelUps.reduce((sum, l) => sum + l.xpReward, 0)),
                newTotalXp: newTotalXp + (levelUps.reduce((sum, l) => sum + l.xpReward, 0)),
                newLevel: levelInfo.currentLevel,
                levelUps,
                levelInfo: calculateLevelFromXp(newTotalXp + (levelUps.reduce((sum, l) => sum + l.xpReward, 0)))
            };
        });
    } catch (error) {
        console.error('Error adding XP to user:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// Get user's level information
export async function getUserLevelInfo(userId?: string) {
    try {
        const session = await auth();
        const targetUserId = userId || session?.user?.id;
        
        if (!targetUserId) {
            throw new Error('User not authenticated');
        }
        
        const user = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: {
                currentXp: true,
                totalXp: true,
                currentLevel: true,
                credits: true,
                levelProgressHistory: {
                    include: {
                        levelInfo: true
                    },
                    orderBy: {
                        achievedAt: 'desc'
                    },
                    take: 3
                }
            }
        });
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // Ensure totalXp is set (fallback to currentXp for existing users)
        const totalXp = user.totalXp || user.currentXp;
        
        // Get level information
        const levelInfo = calculateLevelFromXp(totalXp);
        const currentLevelConfig = LEVEL_CONFIG.find(l => l.level === user.currentLevel);
        const nextLevelConfig = LEVEL_CONFIG.find(l => l.level === user.currentLevel + 1);
        
        return {
            success: true,
            data: {
                currentXp: user.currentXp,
                totalXp: totalXp,
                currentLevel: user.currentLevel,
                credits: user.credits,
                levelInfo,
                currentLevelConfig,
                nextLevelConfig,
                recentLevelUps: user.levelProgressHistory || []
            }
        };
    } catch (error) {
        console.error('Error getting user level info:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// Convert XP to Credits (updated to work with currentXp)
export async function convertCurrentXpToCredits(xpAmount: number) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error('User not authenticated');
        }
        
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { currentXp: true, credits: true }
        });
        
        if (!user) {
            throw new Error('User not found');
        }
        
        if (user.currentXp < xpAmount) {
            throw new Error('Insufficient current XP');
        }
        
        const creditsToAdd = Math.floor(xpAmount / 10); // 10 XP = 1 Credit
        
        const result = await prisma.$transaction(async (tx: any) => {
            // Update user XP and credits
            const updatedUser = await tx.user.update({
                where: { id: session.user.id },
                data: {
                    currentXp: { decrement: xpAmount },
                    credits: { increment: creditsToAdd }
                }
            });
            
            // Create XP transaction (spending)
            await tx.xpTransaction.create({
                data: {
                    userId: session.user.id,
                    amount: -xpAmount,
                    description: `Converted ${xpAmount} XP to ${creditsToAdd} credits`,
                    type: XpTransactionProps.SPEND
                }
            });
            
            // Create credit transaction
            await tx.creditTransaction.create({
                data: {
                    userId: session.user.id,
                    amount: creditsToAdd,
                    type: CreditType.BONUS,
                    currency: Currency.INR,
                    description: `Converted from ${xpAmount} XP`
                }
            });
            
            return updatedUser;
        });
        
        return {
            success: true,
            newCurrentXp: result.currentXp,
            newCredits: result.credits,
            creditsGained: creditsToAdd
        };
    } catch (error) {
        console.error('Error converting XP to credits:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// Get XP and Credits for navbar display
export async function fetchCurrentXpAndCredits() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { currentXp: 0, credits: 0 };
        }
        
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { currentXp: true, credits: true }
        });
        
        return {
            currentXp: user?.currentXp || 0,
            credits: user?.credits || 0
        };
    } catch (error) {
        console.error('Error fetching XP and credits:', error);
        return { currentXp: 0, credits: 0 };
    }
}

// Get all levels for reference
export async function getAllLevels() {
    try {
        const levels = await prisma.level.findMany({
            where: { isActive: true },
            orderBy: { level: 'asc' }
        });
        
        return {
            success: true,
            data: levels.length > 0 ? levels : LEVEL_CONFIG
        };
    } catch (error) {
        console.error('Error fetching levels:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: LEVEL_CONFIG
        };
    }
} 