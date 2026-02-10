"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"

// Types for the feed
export interface FeedJobResult {
    id: string
    title: string
    slug: string
    description: string | null
    company: {
        id: string
        name: string
        logoUrl: string | null
        industry: string | null
        hasTransparentProcess: boolean
    }
    location: string | null
    locationType: string
    employmentType: string
    experienceMin: number | null
    experienceMax: number | null
    salaryMin: number | null
    salaryMax: number | null
    salaryCurrency: string
    salaryDisclosed: boolean
    skillsRequired: string[]
    skillsPreferred: string[]
    hasAssignment: boolean
    applicationsCount: number
    publishedAt: Date | null
    interviewProcess: {
        id: string
        name: string
        estimatedDurationWeeks: number | null
        rounds: Array<{
            id: string
            roundNumber: number
            title: string
            roundType: string
            hasMockInterview: boolean
        }>
    } | null
    // Match & recommendation data
    matchScore: number
    matchReasons: {
        skillMatch: number
        experienceMatch: number
        locationMatch: number
        industryMatch: number
    }
    matchedSkills: string[]
    missingSkills: string[]
    isSaved: boolean
    hasApplied: boolean
    isFollowingCompany: boolean
}

export interface ShouldApplyScore {
    score: number // 0-100
    recommendation: "HIGHLY_RECOMMENDED" | "RECOMMENDED" | "CONSIDER" | "NOT_RECOMMENDED"
    reasons: string[]
    competition: {
        applicantsCount: number
        level: "LOW" | "MEDIUM" | "HIGH"
    }
    responseRate: number | null
    averageResponseDays: number | null
}

export interface CompanyHiringStats {
    responseRate: number
    averageResponseDays: number
    totalHires: number
    openRoles: number
    hasTransparentProcess: boolean
    recentActivity: Array<{
        type: string
        description: string
        date: Date
    }>
}

export interface SkillGapAnalysis {
    matchedSkills: string[]
    missingRequired: string[]
    missingPreferred: string[]
    learningRecommendations: Array<{
        skill: string
        projectId: string
        projectTitle: string
        projectSlug: string
        estimatedHours: number
    }>
    potentialMatchAfterLearning: number
}

// Helper: Get user's skills
async function getUserSkills(userId: string): Promise<string[]> {
    const skills = await prisma.skills.findMany({
        where: { userId },
        select: { name: true }
    })
    return skills.map(s => s.name.toLowerCase())
}

// Helper: Get user's followed company IDs
async function getUserFollowedCompanyIds(userId: string): Promise<string[]> {
    const follows = await prisma.companyFollower.findMany({
        where: { userId },
        select: { companyId: true }
    })
    return follows.map(f => f.companyId)
}

// Helper: Get user's saved job IDs
async function getUserSavedJobIds(userId: string): Promise<string[]> {
    const saved = await prisma.savedJob.findMany({
        where: { userId },
        select: { jobId: true }
    })
    return saved.map(s => s.jobId)
}

// Helper: Get user's applied job IDs
async function getUserAppliedJobIds(userId: string): Promise<string[]> {
    const applications = await prisma.jobApplication.findMany({
        where: { userId },
        select: { jobId: true }
    })
    return applications.map(a => a.jobId)
}

// Helper: Calculate skill match score
function calculateSkillMatch(userSkills: string[], requiredSkills: string[], preferredSkills: string[] = []): {
    score: number
    matchedSkills: string[]
    missingSkills: string[]
} {
    const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim())
    const normalizedRequired = requiredSkills.map(s => s.toLowerCase().trim())
    const normalizedPreferred = preferredSkills.map(s => s.toLowerCase().trim())

    const matchedRequired = normalizedRequired.filter(skill => 
        normalizedUserSkills.some(us => us.includes(skill) || skill.includes(us))
    )
    const matchedPreferred = normalizedPreferred.filter(skill => 
        normalizedUserSkills.some(us => us.includes(skill) || skill.includes(us))
    )

    const missingRequired = normalizedRequired.filter(skill => 
        !normalizedUserSkills.some(us => us.includes(skill) || skill.includes(us))
    )

    // Required skills are worth 80%, preferred skills are worth 20%
    const requiredScore = normalizedRequired.length > 0 
        ? (matchedRequired.length / normalizedRequired.length) * 80 
        : 80
    const preferredScore = normalizedPreferred.length > 0 
        ? (matchedPreferred.length / normalizedPreferred.length) * 20 
        : 20

    return {
        score: Math.round(requiredScore + preferredScore),
        matchedSkills: [...matchedRequired, ...matchedPreferred],
        missingSkills: missingRequired
    }
}

// Helper: Format job with match data
function formatJobWithMatch(
    job: any,
    userSkills: string[],
    savedJobIds: string[],
    appliedJobIds: string[],
    followedCompanyIds: string[]
): FeedJobResult {
    const skillsRequired = (job.skillsRequired as string[]) || []
    const skillsPreferred = (job.skillsPreferred as string[]) || []
    
    const skillMatch = calculateSkillMatch(userSkills, skillsRequired, skillsPreferred)

    return {
        id: job.id,
        title: job.title,
        slug: job.slug,
        description: job.description,
        company: {
            id: job.company.id,
            name: job.company.name,
            logoUrl: job.company.logoUrl,
            industry: job.company.industry,
            hasTransparentProcess: job.company.hasInterviewProcess || !!job.interviewProcess
        },
        location: job.location,
        locationType: job.locationType,
        employmentType: job.employmentType,
        experienceMin: job.experienceMin,
        experienceMax: job.experienceMax,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        salaryDisclosed: job.salaryDisclosed,
        skillsRequired,
        skillsPreferred,
        hasAssignment: job.hasAssignment,
        applicationsCount: job.applicationsCount,
        publishedAt: job.publishedAt,
        interviewProcess: job.interviewProcess,
        matchScore: skillMatch.score,
        matchReasons: {
            skillMatch: skillMatch.score,
            experienceMatch: 80, // Default, can be enhanced
            locationMatch: 90, // Default, can be enhanced
            industryMatch: 85 // Default, can be enhanced
        },
        matchedSkills: skillMatch.matchedSkills,
        missingSkills: skillMatch.missingSkills,
        isSaved: savedJobIds.includes(job.id),
        hasApplied: appliedJobIds.includes(job.id),
        isFollowingCompany: followedCompanyIds.includes(job.companyId)
    }
}

// ============================================
// MAIN FEED FUNCTIONS
// ============================================

/**
 * Get jobs from followed companies, filtered by user's skills
 * This is the "Following" tab feed
 */
export async function getFollowingFeedJobs(page = 1, limit = 10) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { 
                success: false, 
                error: "Please sign in to see jobs from companies you follow",
                requiresAuth: true 
            }
        }

        const userId = session.user.id
        const skip = (page - 1) * limit

        // Get user data in parallel
        const [userSkills, followedCompanyIds, savedJobIds, appliedJobIds] = await Promise.all([
            getUserSkills(userId),
            getUserFollowedCompanyIds(userId),
            getUserSavedJobIds(userId),
            getUserAppliedJobIds(userId)
        ])

        if (followedCompanyIds.length === 0) {
            return {
                success: true,
                data: {
                    jobs: [],
                    pagination: { page, limit, total: 0, totalPages: 0 },
                    followedCompaniesCount: 0,
                    isEmpty: true
                }
            }
        }

        // Get jobs from followed companies
        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where: {
                    companyId: { in: followedCompanyIds },
                    status: "ACTIVE",
                    visibility: "PUBLIC"
                },
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
                orderBy: { publishedAt: "desc" },
                skip,
                take: limit
            }),
            prisma.job.count({
                where: {
                    companyId: { in: followedCompanyIds },
                    status: "ACTIVE",
                    visibility: "PUBLIC"
                }
            })
        ])

        // Format jobs with match scores
        const formattedJobs = jobs.map(job => 
            formatJobWithMatch(job, userSkills, savedJobIds, appliedJobIds, followedCompanyIds)
        )

        // Sort by match score (highest first)
        formattedJobs.sort((a, b) => b.matchScore - a.matchScore)

        // Group by match quality
        const perfectMatch = formattedJobs.filter(j => j.matchScore >= 90)
        const goodMatch = formattedJobs.filter(j => j.matchScore >= 70 && j.matchScore < 90)
        const explore = formattedJobs.filter(j => j.matchScore < 70)

        return {
            success: true,
            data: {
                jobs: formattedJobs,
                grouped: {
                    perfectMatch,
                    goodMatch,
                    explore
                },
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                },
                followedCompaniesCount: followedCompanyIds.length,
                isEmpty: false
            }
        }
    } catch (error) {
        console.error("Error fetching following feed:", error)
        return { success: false, error: "Failed to fetch jobs from followed companies" }
    }
}

/**
 * Get AI-curated "For You" job feed
 * Uses skills, experience, saved jobs, and more to recommend
 */
export async function getForYouFeedJobs(page = 1, limit = 10) {
    try {
        const session = await auth()
        const skip = (page - 1) * limit

        // For unauthenticated users, return featured jobs
        if (!session?.user?.id) {
            const [jobs, total] = await Promise.all([
                prisma.job.findMany({
                    where: {
                        status: "ACTIVE",
                        visibility: "PUBLIC"
                    },
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
                prisma.job.count({
                    where: {
                        status: "ACTIVE",
                        visibility: "PUBLIC"
                    }
                })
            ])

            const formattedJobs = jobs.map(job => formatJobWithMatch(job, [], [], [], []))

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

        // Get user data in parallel
        const [userSkills, followedCompanyIds, savedJobIds, appliedJobIds] = await Promise.all([
            getUserSkills(userId),
            getUserFollowedCompanyIds(userId),
            getUserSavedJobIds(userId),
            getUserAppliedJobIds(userId)
        ])

        // Get all active jobs
        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where: {
                    status: "ACTIVE",
                    visibility: "PUBLIC"
                },
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
                orderBy: { publishedAt: "desc" }
            }),
            prisma.job.count({
                where: {
                    status: "ACTIVE",
                    visibility: "PUBLIC"
                }
            })
        ])

        // Format and score all jobs
        const formattedJobs = jobs.map(job => 
            formatJobWithMatch(job, userSkills, savedJobIds, appliedJobIds, followedCompanyIds)
        )

        // Sort by match score (For You feed prioritizes match)
        formattedJobs.sort((a, b) => {
            // Prioritize jobs from followed companies slightly
            const aBoost = a.isFollowingCompany ? 5 : 0
            const bBoost = b.isFollowingCompany ? 5 : 0
            return (b.matchScore + bBoost) - (a.matchScore + aBoost)
        })

        // Paginate the sorted results
        const paginatedJobs = formattedJobs.slice(skip, skip + limit)

        return {
            success: true,
            data: {
                jobs: paginatedJobs,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                },
                isAuthenticated: true,
                userSkillsCount: userSkills.length
            }
        }
    } catch (error) {
        console.error("Error fetching for you feed:", error)
        return { success: false, error: "Failed to fetch recommended jobs" }
    }
}

/**
 * Get "Should Apply" recommendation for a specific job
 */
export async function getShouldApplyScore(jobId: string): Promise<{
    success: boolean
    data?: ShouldApplyScore
    error?: string
}> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in to get recommendations" }
        }

        const userId = session.user.id

        // Get job and user data
        const [job, userSkills, applications] = await Promise.all([
            prisma.job.findUnique({
                where: { id: jobId },
                include: {
                    company: true,
                    _count: {
                        select: { applications: true }
                    }
                }
            }),
            getUserSkills(userId),
            prisma.jobApplication.findMany({
                where: { jobId },
                select: { status: true, createdAt: true, updatedAt: true }
            })
        ])

        if (!job) {
            return { success: false, error: "Job not found" }
        }

        const skillsRequired = (job.skillsRequired as string[]) || []
        const skillMatch = calculateSkillMatch(userSkills, skillsRequired)

        // Calculate competition level
        const applicantsCount = job._count.applications
        let competitionLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW"
        if (applicantsCount > 100) competitionLevel = "HIGH"
        else if (applicantsCount > 30) competitionLevel = "MEDIUM"

        // Calculate response rate - applications that got past initial stages
        const reviewedApps = applications.filter(a => 
            a.status !== "INTERESTED" && a.status !== "PREPARING" && a.status !== "APPLIED"
        )
        const responseRate = applications.length > 0 
            ? Math.round((reviewedApps.length / applications.length) * 100)
            : null

        // Build reasons
        const reasons: string[] = []
        
        if (skillMatch.score >= 90) {
            reasons.push(`Excellent match! You have ${skillMatch.matchedSkills.length} of ${skillsRequired.length} required skills`)
        } else if (skillMatch.score >= 70) {
            reasons.push(`Good match with ${skillMatch.matchedSkills.length} of ${skillsRequired.length} required skills`)
        } else {
            reasons.push(`You're missing ${skillMatch.missingSkills.length} key skills for this role`)
        }

        if (competitionLevel === "LOW") {
            reasons.push("Low competition - fewer applicants means better visibility")
        } else if (competitionLevel === "HIGH") {
            reasons.push("High competition - make sure your application stands out")
        }

        if (job.company.hasInterviewProcess) {
            reasons.push("Company has a transparent interview process")
        }

        // Calculate overall score
        let score = skillMatch.score
        if (competitionLevel === "LOW") score += 10
        else if (competitionLevel === "HIGH") score -= 10
        if (job.company.hasInterviewProcess) score += 5
        score = Math.min(100, Math.max(0, score))

        // Determine recommendation
        let recommendation: ShouldApplyScore["recommendation"] = "CONSIDER"
        if (score >= 85) recommendation = "HIGHLY_RECOMMENDED"
        else if (score >= 70) recommendation = "RECOMMENDED"
        else if (score < 50) recommendation = "NOT_RECOMMENDED"

        return {
            success: true,
            data: {
                score,
                recommendation,
                reasons,
                competition: {
                    applicantsCount,
                    level: competitionLevel
                },
                responseRate,
                averageResponseDays: 5 // Placeholder
            }
        }
    } catch (error) {
        console.error("Error calculating should apply score:", error)
        return { success: false, error: "Failed to calculate recommendation" }
    }
}

/**
 * Get company hiring stats
 */
export async function getCompanyHiringStats(companyId: string): Promise<{
    success: boolean
    data?: CompanyHiringStats
    error?: string
}> {
    try {
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: {
                jobs: {
                    where: { status: "ACTIVE" },
                    select: { id: true }
                },
                _count: {
                    select: { followers: true }
                }
            }
        })

        if (!company) {
            return { success: false, error: "Company not found" }
        }

        // Get application stats for this company's jobs
        const jobIds = company.jobs.map(j => j.id)
        const applications = await prisma.jobApplication.findMany({
            where: { jobId: { in: jobIds } },
            select: { status: true, createdAt: true, updatedAt: true }
        })

        const reviewedApps = applications.filter(a => 
            a.status !== "INTERESTED" && a.status !== "PREPARING" && a.status !== "APPLIED"
        )
        const responseRate = applications.length > 0 
            ? Math.round((reviewedApps.length / applications.length) * 100)
            : 85 // Default

        const hiredApps = applications.filter(a => a.status === "HIRED")

        return {
            success: true,
            data: {
                responseRate,
                averageResponseDays: 5, // Placeholder
                totalHires: hiredApps.length,
                openRoles: company.jobs.length,
                hasTransparentProcess: company.hasInterviewProcess || false,
                recentActivity: [] // Would need activity tracking
            }
        }
    } catch (error) {
        console.error("Error fetching company hiring stats:", error)
        return { success: false, error: "Failed to fetch company stats" }
    }
}

/**
 * Get skill gap analysis for a specific job
 */
export async function getSkillGapForJob(jobId: string): Promise<{
    success: boolean
    data?: SkillGapAnalysis
    error?: string
}> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in to see skill analysis" }
        }

        const userId = session.user.id

        // Get job and user skills
        const [job, userSkills] = await Promise.all([
            prisma.job.findUnique({
                where: { id: jobId }
            }),
            getUserSkills(userId)
        ])

        if (!job) {
            return { success: false, error: "Job not found" }
        }

        const skillsRequired = (job.skillsRequired as string[]) || []
        const skillsPreferred = (job.skillsPreferred as string[]) || []

        const normalizedUserSkills = userSkills.map(s => s.toLowerCase())
        
        const matchedSkills = skillsRequired.filter(skill => 
            normalizedUserSkills.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us))
        )
        
        const missingRequired = skillsRequired.filter(skill => 
            !normalizedUserSkills.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us))
        )
        
        const missingPreferred = skillsPreferred.filter(skill => 
            !normalizedUserSkills.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us))
        )

        // Find learning projects for missing skills
        const learningRecommendations: SkillGapAnalysis["learningRecommendations"] = []
        
        for (const skill of missingRequired.slice(0, 3)) {
            const project = await prisma.projectV2.findFirst({
                where: {
                    visibility: "PUBLIC",
                    OR: [
                        { title: { contains: skill, mode: "insensitive" } },
                        { technologies: { has: skill } }
                    ]
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    estimatedHours: true
                }
            })

            if (project) {
                learningRecommendations.push({
                    skill,
                    projectId: project.id,
                    projectTitle: project.title,
                    projectSlug: project.slug,
                    estimatedHours: project.estimatedHours || 10
                })
            }
        }

        // Calculate potential match after learning
        const currentScore = skillsRequired.length > 0 
            ? (matchedSkills.length / skillsRequired.length) * 100 
            : 100
        const potentialMatch = Math.min(100, currentScore + (learningRecommendations.length * 15))

        return {
            success: true,
            data: {
                matchedSkills,
                missingRequired,
                missingPreferred,
                learningRecommendations,
                potentialMatchAfterLearning: Math.round(potentialMatch)
            }
        }
    } catch (error) {
        console.error("Error analyzing skill gap:", error)
        return { success: false, error: "Failed to analyze skills" }
    }
}

/**
 * Get saved jobs for feed
 */
export async function getSavedFeedJobs(page = 1, limit = 10) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { 
                success: false, 
                error: "Please sign in to see saved jobs",
                requiresAuth: true 
            }
        }

        const userId = session.user.id
        const skip = (page - 1) * limit

        // Get saved job entries
        const savedJobEntries = await prisma.savedJob.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        })

        if (savedJobEntries.length === 0) {
            return {
                success: true,
                data: {
                    jobs: [],
                    pagination: {
                        page,
                        limit,
                        total: 0,
                        totalPages: 0
                    }
                }
            }
        }

        // Get user data and jobs in parallel
        const jobIds = savedJobEntries.map(s => s.jobId)
        const [userSkills, followedCompanyIds, appliedJobIds, jobs, total] = await Promise.all([
            getUserSkills(userId),
            getUserFollowedCompanyIds(userId),
            getUserAppliedJobIds(userId),
            prisma.job.findMany({
                where: { 
                    id: { in: jobIds },
                    status: "ACTIVE"
                },
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
                }
            }),
            prisma.savedJob.count({ where: { userId } })
        ])

        const savedJobIds = savedJobEntries.map(s => s.jobId)

        // Map jobs with saved entry data
        const formattedJobs = savedJobEntries
            .map(savedEntry => {
                const job = jobs.find(j => j.id === savedEntry.jobId)
                if (!job) return null
                return {
                    ...formatJobWithMatch(
                        job, 
                        userSkills, 
                        savedJobIds, 
                        appliedJobIds, 
                        followedCompanyIds
                    ),
                    savedAt: savedEntry.createdAt,
                    notes: savedEntry.notes
                }
            })
            .filter((j): j is NonNullable<typeof j> => j !== null)

        return {
            success: true,
            data: {
                jobs: formattedJobs,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        }
    } catch (error) {
        console.error("Error fetching saved jobs:", error)
        return { success: false, error: "Failed to fetch saved jobs" }
    }
}

/**
 * Get feed stats for the user
 */
export async function getFeedStats() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: true, data: null }
        }

        const userId = session.user.id

        const [
            followedCompaniesCount,
            savedJobsCount,
            appliedJobsCount,
            userSkillsCount
        ] = await Promise.all([
            prisma.companyFollower.count({ where: { userId } }),
            prisma.savedJob.count({ where: { userId } }),
            prisma.jobApplication.count({ where: { userId } }),
            prisma.skills.count({ where: { userId } })
        ])

        // Get jobs from followed companies count
        const followedCompanyIds = await getUserFollowedCompanyIds(userId)
        const followingJobsCount = await prisma.job.count({
            where: {
                companyId: { in: followedCompanyIds },
                status: "ACTIVE",
                visibility: "PUBLIC"
            }
        })

        return {
            success: true,
            data: {
                followedCompaniesCount,
                followingJobsCount,
                savedJobsCount,
                appliedJobsCount,
                userSkillsCount
            }
        }
    } catch (error) {
        console.error("Error fetching feed stats:", error)
        return { success: false, error: "Failed to fetch stats" }
    }
}
