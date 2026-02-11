"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"

export interface TabCounts {
    spark: number
    following: number
    saved: number
    applied: number
    browse: number
}

/**
 * Get counts for all job tabs
 * Used to display badge counts on tabs
 */
export async function getJobsTabCounts(): Promise<{
    success: boolean
    data?: TabCounts
    error?: string
}> {
    try {
        const session = await auth()
        const userId = session?.user?.id

        // Total active jobs (for browse and spark)
        const totalJobs = await prisma.job.count({
            where: {
                status: "ACTIVE",
                visibility: "PUBLIC"
            }
        })

        // If not authenticated, return basic counts
        if (!userId) {
            return {
                success: true,
                data: {
                    spark: totalJobs,
                    following: 0,
                    saved: 0,
                    applied: 0,
                    browse: totalJobs
                }
            }
        }

        // Get user's followed company IDs
        const followedCompanies = await prisma.companyFollower.findMany({
            where: { userId },
            select: { companyId: true }
        })
        const followedCompanyIds = followedCompanies.map(f => f.companyId)

        // Get user's dismissed/seen job IDs for spark count
        // For now, spark shows all jobs minus applied ones
        const appliedJobs = await prisma.jobApplication.findMany({
            where: { userId },
            select: { jobId: true }
        })
        const appliedJobIds = appliedJobs.map(a => a.jobId)

        // Get counts in parallel
        const [
            followingJobsCount,
            savedJobsCount,
            appliedJobsCount
        ] = await Promise.all([
            // Following: Jobs from followed companies
            followedCompanyIds.length > 0 
                ? prisma.job.count({
                    where: {
                        companyId: { in: followedCompanyIds },
                        status: "ACTIVE",
                        visibility: "PUBLIC"
                    }
                })
                : 0,
            // Saved: User's saved jobs
            prisma.savedJob.count({
                where: { userId }
            }),
            // Applied: Active applications
            prisma.jobApplication.count({
                where: {
                    userId,
                    status: {
                        notIn: ["WITHDRAWN", "REJECTED", "HIRED"]
                    }
                }
            })
        ])

        // Spark: Jobs user hasn't applied to yet
        const sparkCount = totalJobs - appliedJobIds.length

        return {
            success: true,
            data: {
                spark: Math.max(0, sparkCount),
                following: followingJobsCount,
                saved: savedJobsCount,
                applied: appliedJobsCount,
                browse: totalJobs
            }
        }
    } catch (error) {
        console.error("Error fetching tab counts:", error)
        return { 
            success: false, 
            error: "Failed to fetch tab counts" 
        }
    }
}

/**
 * Get jobs for Spark (swipe) mode
 * Returns jobs the user hasn't interacted with yet
 */
export async function getSparkJobs(page = 1, limit = 10) {
    try {
        const session = await auth()
        const skip = (page - 1) * limit

        // Base query for active jobs
        const baseWhere = {
            status: "ACTIVE" as const,
            visibility: "PUBLIC" as const
        }

        // For unauthenticated users, return all jobs
        if (!session?.user?.id) {
            const [jobs, total] = await Promise.all([
                prisma.job.findMany({
                    where: baseWhere,
                    include: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                logoUrl: true,
                                industry: true,
                                hasInterviewProcess: true
                            }
                        },
                        interviewProcess: {
                            select: {
                                id: true,
                                name: true,
                                estimatedDurationWeeks: true,
                                rounds: {
                                    select: {
                                        id: true,
                                        roundNumber: true,
                                        title: true,
                                        roundType: true,
                                        hasMockInterview: true
                                    },
                                    orderBy: { roundNumber: "asc" }
                                }
                            }
                        }
                    },
                    orderBy: [
                        { featured: "desc" },
                        { publishedAt: "desc" }
                    ],
                    skip,
                    take: limit
                }),
                prisma.job.count({ where: baseWhere })
            ])

            // Add default match data for unauthenticated users
            const formattedJobs = jobs.map(job => {
                const skillsReq = (job.skillsRequired as string[]) || []
                const skillsPref = (job.skillsPreferred as string[]) || []
                return {
                    ...job,
                    skillsRequired: skillsReq,
                    skillsPreferred: skillsPref,
                    company: {
                        ...job.company,
                        hasTransparentProcess: job.company.hasInterviewProcess || !!job.interviewProcess
                    },
                    matchScore: 70,
                    matchReasons: {
                        skillMatch: 0,
                        experienceMatch: 0,
                        locationMatch: 0,
                        industryMatch: 0
                    },
                    matchedSkills: [] as string[],
                    missingSkills: skillsReq,
                    isSaved: false,
                    hasApplied: false,
                    isFollowingCompany: false
                }
            })

            return {
                success: true,
                data: {
                    jobs: formattedJobs,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit)
                    },
                    isAuthenticated: false
                }
            }
        }

        const userId = session.user.id

        // Get user's applied job IDs to exclude
        const appliedJobs = await prisma.jobApplication.findMany({
            where: { userId },
            select: { jobId: true }
        })
        const appliedJobIds = appliedJobs.map(a => a.jobId)

        // Get user data for matching
        const [userSkills, savedJobIds, followedCompanyIds] = await Promise.all([
            prisma.skills.findMany({
                where: { userId },
                select: { name: true }
            }),
            prisma.savedJob.findMany({
                where: { userId },
                select: { jobId: true }
            }),
            prisma.companyFollower.findMany({
                where: { userId },
                select: { companyId: true }
            })
        ])

        const skills = userSkills.map(s => s.name.toLowerCase())
        const savedIds = savedJobIds.map(s => s.jobId)
        const followedIds = followedCompanyIds.map(f => f.companyId)

        // Query jobs excluding applied ones
        const where = {
            ...baseWhere,
            id: appliedJobIds.length > 0 ? { notIn: appliedJobIds } : undefined
        }

        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where,
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            logoUrl: true,
                            industry: true,
                            hasInterviewProcess: true
                        }
                    },
                    interviewProcess: {
                        select: {
                            id: true,
                            name: true,
                            estimatedDurationWeeks: true,
                            rounds: {
                                select: {
                                    id: true,
                                    roundNumber: true,
                                    title: true,
                                    roundType: true,
                                    hasMockInterview: true
                                },
                                orderBy: { roundNumber: "asc" }
                            }
                        }
                    }
                },
                orderBy: [
                    { featured: "desc" },
                    { publishedAt: "desc" }
                ],
                skip,
                take: limit
            }),
            prisma.job.count({ where })
        ])

        // Format jobs with match scores
        const formattedJobs = jobs.map(job => {
            const skillsRequired = (job.skillsRequired as string[]) || []
            const skillsPreferred = (job.skillsPreferred as string[]) || []
            
            // Calculate skill match
            const normalizedRequired = skillsRequired.map(s => s.toLowerCase())
            const matchedSkills = normalizedRequired.filter(skill =>
                skills.some(us => us.includes(skill) || skill.includes(us))
            )
            const missingSkills = normalizedRequired.filter(skill =>
                !skills.some(us => us.includes(skill) || skill.includes(us))
            )
            const matchScore = normalizedRequired.length > 0
                ? Math.round((matchedSkills.length / normalizedRequired.length) * 100)
                : 80

            return {
                ...job,
                skillsRequired,
                skillsPreferred,
                company: {
                    ...job.company,
                    hasTransparentProcess: job.company.hasInterviewProcess || !!job.interviewProcess
                },
                matchScore,
                matchReasons: {
                    skillMatch: matchScore,
                    experienceMatch: 80,
                    locationMatch: 80,
                    industryMatch: 80
                },
                matchedSkills,
                missingSkills,
                isSaved: savedIds.includes(job.id),
                hasApplied: false, // Already filtered out
                isFollowingCompany: followedIds.includes(job.companyId)
            }
        })

        // Sort by match score
        formattedJobs.sort((a, b) => b.matchScore - a.matchScore)

        return {
            success: true,
            data: {
                jobs: formattedJobs,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                },
                isAuthenticated: true
            }
        }
    } catch (error) {
        console.error("Error fetching spark jobs:", error)
        return { success: false, error: "Failed to fetch jobs" }
    }
}

/**
 * Record a swipe action (left = skip, right = interested)
 * This is used to track user preferences and filter spark feed
 */
export async function recordSwipeAction(
    jobId: string,
    action: "left" | "right" | "save"
): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in to continue" }
        }

        const userId = session.user.id

        if (action === "right") {
            // Swiping right = Save the job (merged Interested/Saved)
            const existing = await prisma.savedJob.findUnique({
                where: {
                    userId_jobId: { userId, jobId }
                }
            })

            if (!existing) {
                await prisma.savedJob.create({
                    data: { userId, jobId }
                })
            }
        } else if (action === "save") {
            // Explicit save action
            const existing = await prisma.savedJob.findUnique({
                where: {
                    userId_jobId: { userId, jobId }
                }
            })

            if (!existing) {
                await prisma.savedJob.create({
                    data: { userId, jobId }
                })
            }
        }
        // For "left" swipes, we don't store anything for now
        // Could add a "dismissed" table later for better recommendations

        return { success: true }
    } catch (error) {
        console.error("Error recording swipe:", error)
        return { success: false, error: "Failed to record action" }
    }
}
