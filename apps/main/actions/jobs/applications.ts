"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"

// Show interest in a job (first step - adds to "My Jobs")
export async function showInterest(jobId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return {
                success: false,
                error: "Please sign in to show interest"
            }
        }

        const job = await prisma.job.findUnique({
            where: { id: jobId },
            select: { id: true, status: true, interviewProcessId: true }
        })

        if (!job || job.status !== "ACTIVE") {
            return { success: false, error: "Job not found or no longer available" }
        }

        // Check if already applied
        const existing = await prisma.jobApplication.findUnique({
            where: {
                jobId_userId: {
                    jobId,
                    userId: session.user.id
                }
            }
        })

        if (existing) {
            return { success: true, data: existing, message: "Already in your list" }
        }

        // Create application in INTERESTED state
        const application = await prisma.jobApplication.create({
            data: {
                jobId,
                userId: session.user.id,
                status: "INTERESTED"
            }
        })

        revalidatePath("/jobs")
        revalidatePath("/jobs/applications")

        return { success: true, data: application }
    } catch (error) {
        console.error("Error showing interest:", error)
        return { success: false, error: "Failed to process request" }
    }
}

// Start preparing for a job
export async function startPreparing(applicationId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                userId: session.user.id
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        if (application.status !== "INTERESTED") {
            return { success: false, error: "Cannot start preparing from current status" }
        }

        const updated = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: { status: "PREPARING" }
        })

        revalidatePath("/jobs/applications")

        return { success: true, data: updated }
    } catch (error) {
        console.error("Error starting preparation:", error)
        return { success: false, error: "Failed to update status" }
    }
}

// Custom Question Response Type
interface CustomQuestionResponse {
    questionId: string
    answer: string | string[] | number | boolean
    answeredAt: string
}

// Commitment Check - Validates candidate is ready to apply
export async function performCommitmentCheck(applicationId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                userId: session.user.id
            },
            include: {
                job: {
                    include: {
                        company: {
                            select: { name: true }
                        }
                    }
                }
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        const checks = {
            // Profile completeness check
            profileComplete: false,
            // Match score check (recommend at least 60%)
            matchScoreOk: (application.matchScore ?? 0) >= 60,
            // Preparation status check
            hasReviewedRequirements: true, // They've seen the job details
            // Competition awareness
            understoodsCompetition: application.job.applicationsCount > 0,
            // Can proceed with caution if low match
            canProceedWithCaution: (application.matchScore ?? 0) >= 40 && (application.matchScore ?? 0) < 60
        }

        // Get user profile to check completeness
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                name: true,
                email: true,
                resume: true,
                skills: true
            }
        })

        if (user) {
            checks.profileComplete = !!(user.name && user.email && (user.resume || (user.skills && user.skills.length > 0)))
        }

        const isReadyToApply = checks.profileComplete && (checks.matchScoreOk || checks.canProceedWithCaution)

        const recommendations = []
        if (!checks.profileComplete) {
            recommendations.push({
                type: "warning",
                message: "Complete your profile to increase your chances"
            })
        }
        if (!checks.matchScoreOk && !checks.canProceedWithCaution) {
            recommendations.push({
                type: "caution",
                message: `Your match score (${application.matchScore ?? 0}%) is low for this role. Consider improving your skills first.`
            })
        }
        if (checks.canProceedWithCaution) {
            recommendations.push({
                type: "info",
                message: "Your match score is moderate. You can still apply, but improving relevant skills may help."
            })
        }
        if (application.job.applicationsCount > 20) {
            recommendations.push({
                type: "info",
                message: `This role has ${application.job.applicationsCount}+ applicants. Stand out with a strong cover letter!`
            })
        }

        return {
            success: true,
            data: {
                checks,
                isReadyToApply,
                recommendations,
                job: {
                    title: application.job.title,
                    company: application.job.company.name,
                    applicationsCount: application.job.applicationsCount
                },
                matchScore: application.matchScore ?? 0
            }
        }
    } catch (error) {
        console.error("Error performing commitment check:", error)
        return { success: false, error: "Failed to perform commitment check" }
    }
}

// Submit application (move from PREPARING to APPLIED)
export async function submitApplication(
    applicationId: string,
    data?: {
        coverLetter?: string
        customQuestionResponses?: CustomQuestionResponse[]
        acknowledgedCommitmentCheck?: boolean
    }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                userId: session.user.id
            },
            include: {
                job: {
                    select: {
                        id: true,
                        customQuestions: true
                    }
                }
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        if (!["INTERESTED", "PREPARING"].includes(application.status)) {
            return { success: false, error: "Application already submitted" }
        }

        // Validate required custom questions if any
        const customQuestions = application.job.customQuestions as Array<{
            id: string
            required: boolean
            question: string
        }> | null

        if (customQuestions && customQuestions.length > 0) {
            const requiredQuestions = customQuestions.filter(q => q.required)
            const responses = data?.customQuestionResponses || []

            for (const rq of requiredQuestions) {
                const response = responses.find(r => r.questionId === rq.id)
                if (!response || !response.answer ||
                    (Array.isArray(response.answer) && response.answer.length === 0) ||
                    (typeof response.answer === 'string' && response.answer.trim() === '')) {
                    return {
                        success: false,
                        error: `Please answer the required question: "${rq.question}"`
                    }
                }
            }
        }

        // Update application
        const updated = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                status: "APPLIED",
                appliedAt: new Date(),
                coverLetter: data?.coverLetter || application.coverLetter,
                // Cast to JSON for Prisma
                customQuestionResponses: JSON.parse(JSON.stringify(data?.customQuestionResponses || []))
            }
        })

        // Increment job applications count
        await prisma.job.update({
            where: { id: application.jobId },
            data: {
                applicationsCount: { increment: 1 }
            }
        })

        revalidatePath("/jobs/applications")

        return { success: true, data: updated }
    } catch (error) {
        console.error("Error submitting application:", error)
        return { success: false, error: "Failed to submit application" }
    }
}

// Withdraw application
export async function withdrawApplication(applicationId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                userId: session.user.id
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        // Can only withdraw if not already rejected or hired
        if (["REJECTED", "HIRED", "WITHDRAWN"].includes(application.status)) {
            return { success: false, error: "Cannot withdraw this application" }
        }

        const updated = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: { status: "WITHDRAWN" }
        })

        revalidatePath("/jobs/applications")

        return { success: true, data: updated }
    } catch (error) {
        console.error("Error withdrawing application:", error)
        return { success: false, error: "Failed to withdraw application" }
    }
}

// Get user's applications
export async function getMyApplications(status?: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const where: any = { userId: session.user.id }
        if (status) {
            where.status = status
        }

        const applications = await prisma.jobApplication.findMany({
            where,
            include: {
                job: {
                    include: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                logoUrl: true,
                                industry: true
                            }
                        },
                        interviewProcess: {
                            include: {
                                rounds: {
                                    orderBy: { roundNumber: "asc" }
                                }
                            }
                        }
                    }
                },
                prepProgress: true
            },
            orderBy: { updatedAt: "desc" }
        })

        // Group by status
        const grouped = {
            interested: applications.filter(a => a.status === "INTERESTED"),
            preparing: applications.filter(a => a.status === "PREPARING"),
            applied: applications.filter(a => a.status === "APPLIED"),
            inProgress: applications.filter(a =>
                ["UNDER_REVIEW", "SHORTLISTED", "ASSIGNMENT_SENT", "ASSIGNMENT_SUBMITTED", "INTERVIEW_SCHEDULED", "INTERVIEWED"].includes(a.status)
            ),
            completed: applications.filter(a =>
                ["OFFER_EXTENDED", "HIRED", "REJECTED", "WITHDRAWN"].includes(a.status)
            )
        }

        return { success: true, data: { applications, grouped } }
    } catch (error) {
        console.error("Error fetching applications:", error)
        return { success: false, error: "Failed to fetch applications" }
    }
}

// Get single application details
export async function getApplicationDetails(applicationId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                userId: session.user.id
            },
            include: {
                job: {
                    include: {
                        company: true,
                        interviewProcess: {
                            include: {
                                rounds: {
                                    orderBy: { roundNumber: "asc" }
                                }
                            }
                        }
                    }
                },
                activities: {
                    orderBy: { createdAt: "desc" }
                },
                prepProgress: true
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        return { success: true, data: application }
    } catch (error) {
        console.error("Error fetching application:", error)
        return { success: false, error: "Failed to fetch application" }
    }
}

// Update preparation status
export async function updatePreparationStatus(
    applicationId: string,
    updates: {
        profile_complete?: boolean
        resume_reviewed?: boolean
        mock_interview_done?: boolean
        Learns_reviewed?: boolean
        assignment_started?: boolean
        assignment_completed?: boolean
    }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                userId: session.user.id
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        const currentStatus = application.preparationStatus as Record<string, boolean>
        const newStatus = { ...currentStatus, ...updates }

        // Calculate preparation score
        const totalSteps = Object.keys(newStatus).length
        const completedSteps = Object.values(newStatus).filter(v => v === true).length
        const preparationScore = Math.round((completedSteps / totalSteps) * 100)

        // Check if ready to apply (all steps complete or at least 80%)
        const isReadyToApply = preparationScore >= 80

        const updated = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                preparationStatus: newStatus,
                preparationScore,
                isReadyToApply
            }
        })

        revalidatePath("/jobs/applications")

        return { success: true, data: updated }
    } catch (error) {
        console.error("Error updating preparation:", error)
        return { success: false, error: "Failed to update preparation status" }
    }
}