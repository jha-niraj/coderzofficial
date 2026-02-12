'use server'

import { prisma } from '@repo/prisma'
import { Prisma } from '@repo/prisma/client'
import type { 
    BadgeRequirements, BadgeProgress 
} from '@/types/achievements'

// ================================================================================
// BADGE PROGRESS UTILITIES
// These functions check and update badge progress based on user actions
// ================================================================================

type BadgeTarget = 
    // Projects
    | 'projects_completed' | 'sprints_completed' | 'tasks_completed' 
    | 'project_quiz_high_scores' | 'perfect_quiz_scores'
    // Assessments
    | 'practice_sessions' | 'exams_taken' | 'certifications_earned' 
    | 'correct_answers' | 'high_score_exams' | 'elite_exam_scores'
    // Challenges
    | 'forge_enrollments' | 'forge_steps_completed' | 'forge_tracks_completed'
    | 'crucible_problems_solved' | 'crucible_no_hint_solves' | 'crucible_time_bonus_solves'
    // Mock Interviews
    | 'mock_interviews_completed' | 'mock_score' | 'mock_communication_high'
    | 'mock_technical_high' | 'mock_excellent_scores' | 'custom_mocks_created' | 'mock_perfect_score'
    // Community
    | 'communities_joined' | 'posts_created' | 'likes_received' 
    | 'questions_helped' | 'events_organized' | 'resources_shared'
    // Concepts
    | 'concepts_completed' | 'concept_quiz_high' | 'concept_categories_completed'
    // Spaces
    | 'spaces_joined' | 'space_steps_completed' | 'spaces_completed' 
    | 'spaces_created' | 'space_completions_by_others'
    // Studio
    | 'studios_created' | 'flashcards_studied' | 'studio_quiz_high'
    | 'studio_clones' | 'studio_quizzes_aced'
    // Open Source
    | 'os_contributions' | 'os_modules_completed' | 'os_prs_merged'
    | 'os_issues_solved' | 'os_certifications' | 'os_code_reviews' | 'os_bounty_earnings'
    // Pathfinder
    | 'pathfinder_goals_created' | 'pathfinder_subgoals_completed' 
    | 'pathfinder_goals_completed' | 'pathfinder_streak' 
    | 'pathfinder_verifications_passed' | 'pathfinder_quizzes_completed'
    // Launchpads
    | 'products_submitted' | 'products_approved' | 'product_views' 
    | 'products_featured' | 'total_product_views'
    // Collective
    | 'proposals_submitted' | 'votes_cast' | 'proposals_approved'
    | 'collective_challenges_completed' | 'challenge_top_performance'
    // Portfolio
    | 'portfolio_projects_added' | 'detailed_portfolio_projects'
    // Consistency
    | 'activity_streak'
    // Social
    | 'followers_gained' | 'following_count' | 'likes_given' | 'comments_made'
    // Milestone (handled separately)
    | 'total_badges'

interface ProgressUpdate {
    userId: string
    target: BadgeTarget
    increment?: number
    value?: number
    itemId?: string
}

// ================================================================================
// UPDATE BADGE PROGRESS
// ================================================================================

export async function updateBadgeProgress({ userId, target, increment = 1, value, itemId }: ProgressUpdate) {
    try {
        // Find all badges that track this target
        const badges = await prisma.badge.findMany({
            where: {
                isActive: true,
                requirements: {
                    path: ['target'],
                    equals: target,
                },
            },
        })

        if (badges.length === 0) return { success: true, updated: 0 }

        const updates: Prisma.PrismaPromise<unknown>[] = []

        for (const badge of badges) {
            const req = badge.requirements as unknown as BadgeRequirements

            // Get or create user badge entry
            let userBadge = await prisma.userBadge.findUnique({
                where: { userId_badgeId: { userId, badgeId: badge.id } },
            })

            if (!userBadge) {
                userBadge = await prisma.userBadge.create({
                    data: {
                        userId,
                        badgeId: badge.id,
                        status: 'IN_PROGRESS',
                        progress: { current: 0, items: [] },
                        progressPercent: 0,
                        unlockedAt: new Date(),
                    },
                })
            }

            // Skip if already claimed
            if (userBadge.status === 'CLAIMED') continue

            // Update progress based on requirement type
            const progress = (userBadge.progress as unknown as BadgeProgress) || { current: 0, items: [] }
            const targetCount = req.count || 1

            if (req.type === 'count') {
                progress.current = value !== undefined ? value : (progress.current + increment)
                if (itemId && !progress.items?.includes(itemId)) {
                    progress.items = [...(progress.items || []), itemId]
                }
            } else if (req.type === 'streak') {
                progress.current = value !== undefined ? value : Math.max(progress.current, increment)
            } else if (req.type === 'score') {
                // For score-based badges, track count of high scores
                if (value !== undefined && value >= (req.minScore || 0)) {
                    progress.current = (progress.current || 0) + 1
                }
            }

            const progressPercent = Math.min(100, Math.round((progress.current / targetCount) * 100))
            const isComplete = progress.current >= targetCount

            updates.push(
                prisma.userBadge.update({
                    where: { id: userBadge.id },
                    data: {
                        progress: progress as unknown as Prisma.InputJsonValue,
                        progressPercent,
                        status: isComplete ? 'READY_TO_CLAIM' : 'IN_PROGRESS',
                        completedAt: isComplete && !userBadge.completedAt ? new Date() : userBadge.completedAt,
                    },
                })
            )

            // Create notification if badge is ready to claim
            if (isComplete && userBadge.status !== 'READY_TO_CLAIM') {
                updates.push(
                    prisma.achievementNotification.create({
                        data: {
                            userId,
                            type: 'badge_ready',
                            title: 'Badge Ready to Claim!',
                            message: `You've completed the requirements for "${badge.name}". Claim your reward!`,
                            referenceType: 'badge',
                            referenceId: badge.id,
                            icon: badge.icon,
                            color: badge.color,
                        },
                    })
                )
            }
        }

        if (updates.length > 0) {
            await prisma.$transaction(updates)
        }

        return { success: true, updated: updates.length }
    } catch (error) {
        console.error('Error updating badge progress:', error)
        return { success: false, error: 'Failed to update badge progress' }
    }
}

// ================================================================================
// CHECK XP MILESTONES
// ================================================================================

export async function checkXpMilestones(userId: string, totalXp: number) {
    try {
        const xpMilestones = [500, 5000, 25000, 100000, 500000]
        
        for (const milestone of xpMilestones) {
            if (totalXp >= milestone) {
                await updateBadgeProgress({
                    userId,
                    target: 'correct_answers', // This will be handled by XP badge requirements
                    value: totalXp,
                })
            }
        }

        return { success: true }
    } catch (error) {
        console.error('Error checking XP milestones:', error)
        return { success: false }
    }
}

// ================================================================================
// CHECK LEVEL MILESTONES
// ================================================================================

export async function checkLevelMilestones(userId: string, level: number) {
    try {
        // Find level-based badges
        const badges = await prisma.badge.findMany({
            where: {
                isActive: true,
                requirements: {
                    path: ['type'],
                    equals: 'level',
                },
            },
        })

        for (const badge of badges) {
            const req = badge.requirements as unknown as BadgeRequirements
            if (level >= (req.level ?? 0)) {
                let userBadge = await prisma.userBadge.findUnique({
                    where: { userId_badgeId: { userId, badgeId: badge.id } },
                })

                if (!userBadge) {
                    userBadge = await prisma.userBadge.create({
                        data: {
                            userId,
                            badgeId: badge.id,
                            status: 'READY_TO_CLAIM',
                            progress: { current: level },
                            progressPercent: 100,
                            unlockedAt: new Date(),
                            completedAt: new Date(),
                        },
                    })

                    // Create notification
                    await prisma.achievementNotification.create({
                        data: {
                            userId,
                            type: 'badge_ready',
                            title: 'Level Milestone Badge!',
                            message: `You've reached level ${level}! Claim your "${badge.name}" badge.`,
                            referenceType: 'badge',
                            referenceId: badge.id,
                            icon: badge.icon,
                            color: badge.color,
                        },
                    })
                } else if (userBadge.status !== 'CLAIMED' && userBadge.status !== 'READY_TO_CLAIM') {
                    await prisma.userBadge.update({
                        where: { id: userBadge.id },
                        data: {
                            status: 'READY_TO_CLAIM',
                            progress: { current: level },
                            progressPercent: 100,
                            completedAt: new Date(),
                        },
                    })
                }
            }
        }

        return { success: true }
    } catch (error) {
        console.error('Error checking level milestones:', error)
        return { success: false }
    }
}

// ================================================================================
// TRIGGER FUNCTIONS (Call from various modules)
// ================================================================================

// Projects
export async function onProjectCompleted(userId: string, projectId: string) {
    return updateBadgeProgress({ userId, target: 'projects_completed', itemId: projectId })
}

export async function onSprintCompleted(userId: string, sprintId: string) {
    return updateBadgeProgress({ userId, target: 'sprints_completed', itemId: sprintId })
}

export async function onTaskCompleted(userId: string, taskId: string) {
    return updateBadgeProgress({ userId, target: 'tasks_completed', itemId: taskId })
}

// Mock Interviews
export async function onMockInterviewCompleted(userId: string, mockId: string, score: number) {
    await updateBadgeProgress({ userId, target: 'mock_interviews_completed', itemId: mockId })
    if (score >= 70) await updateBadgeProgress({ userId, target: 'mock_score', value: score })
    if (score >= 90) await updateBadgeProgress({ userId, target: 'mock_excellent_scores', increment: 1 })
    if (score >= 95) await updateBadgeProgress({ userId, target: 'mock_perfect_score', value: score })
}

// Pathfinder
export async function onPathfinderGoalCreated(userId: string, goalId: string) {
    return updateBadgeProgress({ userId, target: 'pathfinder_goals_created', itemId: goalId })
}

export async function onPathfinderGoalCompleted(userId: string, goalId: string) {
    return updateBadgeProgress({ userId, target: 'pathfinder_goals_completed', itemId: goalId })
}

export async function onPathfinderSubGoalCompleted(userId: string, subGoalId: string) {
    return updateBadgeProgress({ userId, target: 'pathfinder_subgoals_completed', itemId: subGoalId })
}

export async function onPathfinderStreakUpdated(userId: string, streakDays: number) {
    return updateBadgeProgress({ userId, target: 'pathfinder_streak', value: streakDays })
}

// Launchpads
export async function onProductSubmitted(userId: string, productId: string) {
    return updateBadgeProgress({ userId, target: 'products_submitted', itemId: productId })
}

export async function onProductApproved(userId: string, productId: string) {
    return updateBadgeProgress({ userId, target: 'products_approved', itemId: productId })
}

// Portfolio
export async function onPortfolioProjectAdded(userId: string, projectId: string) {
    return updateBadgeProgress({ userId, target: 'portfolio_projects_added', itemId: projectId })
}

// Social
export async function onFollowerGained(userId: string, followerId: string) {
    return updateBadgeProgress({ userId, target: 'followers_gained', itemId: followerId })
}

// Studio
export async function onStudioCreated(userId: string, studioId: string) {
    return updateBadgeProgress({ userId, target: 'studios_created', itemId: studioId })
}

export async function onFlashcardStudied(userId: string, count: number) {
    return updateBadgeProgress({ userId, target: 'flashcards_studied', increment: count })
}

// Community
export async function onCommunityJoined(userId: string, communityId: string) {
    return updateBadgeProgress({ userId, target: 'communities_joined', itemId: communityId })
}

export async function onPostCreated(userId: string, postId: string) {
    return updateBadgeProgress({ userId, target: 'posts_created', itemId: postId })
}

export async function onLikeReceived(userId: string, likeCount: number) {
    return updateBadgeProgress({ userId, target: 'likes_received', value: likeCount })
}

// Activity Streak
export async function onActivityStreakUpdated(userId: string, streakDays: number) {
    return updateBadgeProgress({ userId, target: 'activity_streak', value: streakDays })
}

// Concepts
export async function onConceptCompleted(userId: string, conceptId: string) {
    return updateBadgeProgress({ userId, target: 'concepts_completed', itemId: conceptId })
}

// Spaces
export async function onSpaceCompleted(userId: string, spaceId: string) {
    return updateBadgeProgress({ userId, target: 'spaces_completed', itemId: spaceId })
}

export async function onSpaceCreated(userId: string, spaceId: string) {
    return updateBadgeProgress({ userId, target: 'spaces_created', itemId: spaceId })
}

// Challenges
export async function onCrucibleProblemSolved(userId: string, problemId: string, withHint: boolean, timeBonus: boolean) {
    await updateBadgeProgress({ userId, target: 'crucible_problems_solved', itemId: problemId })
    if (!withHint) await updateBadgeProgress({ userId, target: 'crucible_no_hint_solves', itemId: problemId })
    if (timeBonus) await updateBadgeProgress({ userId, target: 'crucible_time_bonus_solves', itemId: problemId })
}

export async function onForgeTrackCompleted(userId: string, trackId: string) {
    return updateBadgeProgress({ userId, target: 'forge_tracks_completed', itemId: trackId })
}
