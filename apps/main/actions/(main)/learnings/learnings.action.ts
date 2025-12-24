"use server";

import { auth } from '@repo/auth';
import { prisma } from "@repo/prisma";

// ==========================================
// TYPES
// ==========================================

export interface LearningsSummary {
    totalItemsInProgress: number;
    totalCompleted: number;
    currentStreak: number;
    totalLearningTime: number;
    modules: {
        projects: {
            inProgress: number;
            completed: number;
            total: number;
            recent: any[];
        };
        concepts: {
            learning: number;
            completed: number;
            total: number;
            recent: any[];
        };
        studio: {
            enrolled: number;
            completed: number;
            total: number;
            recent: any[];
        };
        mock: {
            sessions: number;
            avgScore: number;
            recent: any[];
        };
        collectives: {
            memberships: number;
            contributions: number;
            recent: any[];
        };
    };
    recentActivity: any[];
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

async function getCurrentUser() {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }
    return session.user;
}

// ==========================================
// MAIN FUNCTIONS
// ==========================================

export async function getLearningsSummary(): Promise<{ success: boolean; data?: LearningsSummary; error?: string }> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        // Fetch all learning data in parallel
        const [
            projectProgress,
            conceptProgress,
            mockSessions,
            communityMemberships,
        ] = await Promise.all([
            // Projects user has started/worked on
            prisma.userProjectProgress.findMany({
                where: { userId: user.id },
                include: {
                    project: {
                        select: {
                            id: true,
                            name: true,
                            category: true,
                            difficulty: true,
                            updatedAt: true,
                        },
                    },
                },
                orderBy: { startedAt: "desc" },
                take: 10,
            }),
            // Concepts user is learning
            prisma.conceptProgress.findMany({
                where: { userId: user.id },
                include: {
                    concept: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            category: true,
                            difficulty: true,
                            thumbnail: true,
                            estimatedTime: true,
                        },
                    },
                },
                orderBy: { updatedAt: "desc" },
                take: 10,
            }),
            // Mock interview sessions
            prisma.mockVoiceSession.findMany({
                where: { userId: user.id },
                include: {
                    mock: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            }),
            // Community memberships
            prisma.communityMember.findMany({
                where: { userId: user.id },
                include: {
                    community: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            logo: true,
                            memberCount: true,
                        },
                    },
                },
                orderBy: { joinedAt: "desc" },
                take: 10,
            }),
        ]);

        // Calculate stats
        const conceptsCompleted = conceptProgress.filter(p => p.isCompleted).length;
        const conceptsInProgress = conceptProgress.filter(p => !p.isCompleted && p.currentStep > 0).length;

        // Calculate streak (days with activity in last 7 days)
        const recentConceptDates = conceptProgress
            .filter(p => p.updatedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
            .map(p => p.updatedAt.toISOString().split("T")[0]);
        const uniqueDays = new Set(recentConceptDates);
        const currentStreak = uniqueDays.size;

        // Calculate average mock score from userRating
        const avgMockScore = mockSessions.length > 0
            ? Math.round(mockSessions.reduce((acc, s) => acc + ((s.userRating || 0) * 20), 0) / mockSessions.length)
            : 0;

        // Build recent activity
        const recentActivity: any[] = [];
        
        conceptProgress.slice(0, 3).forEach(p => {
            recentActivity.push({
                type: "concept",
                title: p.concept.title,
                slug: p.concept.slug,
                action: p.isCompleted ? "completed" : "learning",
                progress: p.progressPercent,
                date: p.updatedAt,
            });
        });

        projectProgress.slice(0, 2).forEach(p => {
            recentActivity.push({
                type: "project",
                title: p.project.name,
                slug: p.project.id,
                action: p.status === "Completed" ? "completed" : "working",
                date: p.startedAt || p.project.updatedAt,
            });
        });

        mockSessions.slice(0, 2).forEach(s => {
            recentActivity.push({
                type: "mock",
                title: s.mock?.title || `Mock Interview`,
                action: s.status === "COMPLETED" ? "completed" : "in-progress",
                score: s.userRating ? s.userRating * 20 : null,
                date: s.createdAt,
            });
        });

        // Sort by date
        recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
            success: true,
            data: {
                totalItemsInProgress: conceptsInProgress + projectProgress.filter(p => p.status !== "Completed").length,
                totalCompleted: conceptsCompleted + projectProgress.filter(p => p.status === "Completed").length,
                currentStreak,
                totalLearningTime: conceptProgress.reduce((acc, p) => acc + (p.totalTimeSpent || 0), 0),
                modules: {
                    projects: {
                        inProgress: projectProgress.filter(p => p.status !== "Completed").length,
                        completed: projectProgress.filter(p => p.status === "Completed").length,
                        total: projectProgress.length,
                        recent: projectProgress.slice(0, 5).map(p => ({
                            id: p.project.id,
                            title: p.project.name,
                            slug: p.project.id,
                            coverImage: null,
                            category: p.project.category,
                            status: p.status,
                        })),
                    },
                    concepts: {
                        learning: conceptsInProgress,
                        completed: conceptsCompleted,
                        total: conceptProgress.length,
                        recent: conceptProgress.slice(0, 5).map(p => ({
                            id: p.concept.id,
                            title: p.concept.title,
                            slug: p.concept.slug,
                            category: p.concept.category,
                            difficulty: p.concept.difficulty,
                            thumbnail: p.concept.thumbnail,
                            progress: p.progressPercent,
                            isCompleted: p.isCompleted,
                        })),
                    },
                    studio: {
                        enrolled: 0,
                        completed: 0,
                        total: 0,
                        recent: [],
                    },
                    mock: {
                        sessions: mockSessions.length,
                        avgScore: avgMockScore,
                        recent: mockSessions.slice(0, 5).map(s => ({
                            id: s.id,
                            score: s.userRating ? s.userRating * 20 : null,
                            status: s.status,
                            date: s.createdAt,
                        })),
                    },
                    collectives: {
                        memberships: communityMemberships.length,
                        contributions: communityMemberships.reduce((acc, m) => acc + m.postCount, 0),
                        recent: communityMemberships.slice(0, 5).map(m => ({
                            id: m.community.id,
                            name: m.community.name,
                            slug: m.community.slug,
                            icon: m.community.logo,
                            memberCount: m.community.memberCount,
                        })),
                    },
                },
                recentActivity: recentActivity.slice(0, 10),
            },
        };
    } catch (error) {
        console.error("Error fetching learnings summary:", error);
        return { success: false, error: "Failed to fetch learnings" };
    }
}

export async function getProjectLearnings() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const projects = await prisma.userProjectProgress.findMany({
            where: { userId: user.id },
            include: {
                project: {
                    include: {
                        tasks: true,
                    },
                },
            },
            orderBy: { startedAt: "desc" },
        });

        return {
            success: true,
            data: projects.map(p => ({
                id: p.project.id,
                title: p.project.name,
                slug: p.project.id,
                description: p.project.description,
                coverImage: null,
                category: p.project.category,
                status: p.status,
                difficulty: p.project.difficulty,
                joinedAt: p.startedAt,
                taskCount: p.project.tasks.length,
            })),
        };
    } catch (error) {
        console.error("Error fetching project learnings:", error);
        return { success: false, error: "Failed to fetch projects" };
    }
}

export async function getConceptLearnings() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const progress = await prisma.conceptProgress.findMany({
            where: { userId: user.id },
            include: {
                concept: {
                    include: {
                        _count: {
                            select: {
                                steps: true,
                            },
                        },
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        return {
            success: true,
            data: progress.map(p => ({
                id: p.concept.id,
                title: p.concept.title,
                slug: p.concept.slug,
                description: p.concept.description,
                category: p.concept.category,
                difficulty: p.concept.difficulty,
                thumbnail: p.concept.thumbnail,
                estimatedTime: p.concept.estimatedTime,
                currentStep: p.currentStep,
                totalSteps: p.concept._count.steps,
                progressPercent: p.progressPercent,
                isCompleted: p.isCompleted,
                completedAt: p.completedAt,
                lastAccessedAt: p.lastAccessedAt,
            })),
        };
    } catch (error) {
        console.error("Error fetching concept learnings:", error);
        return { success: false, error: "Failed to fetch concepts" };
    }
}

export async function getMockLearnings() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const sessions = await prisma.mockVoiceSession.findMany({
            where: { userId: user.id },
            include: {
                mock: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return {
            success: true,
            data: sessions.map(s => ({
                id: s.id,
                title: s.mock?.title || "Mock Interview",
                description: s.mock?.description || "General",
                status: s.status,
                userRating: s.userRating,
                duration: s.duration,
                createdAt: s.createdAt,
                completedAt: s.completedAt,
            })),
        };
    } catch (error) {
        console.error("Error fetching mock learnings:", error);
        return { success: false, error: "Failed to fetch mocks" };
    }
}

export async function getCommunityLearnings() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const memberships = await prisma.communityMember.findMany({
            where: { userId: user.id },
            include: {
                community: {
                    include: {
                        _count: {
                            select: {
                                members: true,
                                posts: true,
                            },
                        },
                    },
                },
            },
            orderBy: { joinedAt: "desc" },
        });

        return {
            success: true,
            data: memberships.map(m => ({
                id: m.community.id,
                name: m.community.name,
                slug: m.community.slug,
                description: m.community.description,
                icon: m.community.logo,
                category: m.community.category,
                role: m.role,
                joinedAt: m.joinedAt,
                memberCount: m.community._count.members,
                postCount: m.community._count.posts,
            })),
        };
    } catch (error) {
        console.error("Error fetching community learnings:", error);
        return { success: false, error: "Failed to fetch communities" };
    }
}

export async function getLearningStats() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const [
            projectCount,
            conceptProgress,
            mockCount,
            communityCount,
        ] = await Promise.all([
            prisma.userProjectProgress.count({ where: { userId: user.id } }),
            prisma.conceptProgress.findMany({
                where: { userId: user.id },
                select: {
                    isCompleted: true,
                    currentStep: true,
                    totalTimeSpent: true,
                },
            }),
            prisma.mockVoiceSession.count({ where: { userId: user.id } }),
            prisma.communityMember.count({ where: { userId: user.id } }),
        ]);

        const conceptsCompleted = conceptProgress.filter((p: { isCompleted: boolean }) => p.isCompleted).length;
        const conceptsInProgress = conceptProgress.filter((p: { isCompleted: boolean; currentStep: number }) => !p.isCompleted && p.currentStep > 0).length;
        const totalTimeSpent = conceptProgress.reduce((acc: number, p: { totalTimeSpent: number | null }) => acc + (p.totalTimeSpent || 0), 0);

        return {
            success: true,
            data: {
                projects: projectCount,
                conceptsLearning: conceptsInProgress,
                conceptsCompleted,
                mockSessions: mockCount,
                communities: communityCount,
                totalLearningTime: Math.round(totalTimeSpent / 60), // in minutes
            },
        };
    } catch (error) {
        console.error("Error fetching learning stats:", error);
        return { success: false, error: "Failed to fetch stats" };
    }
}
