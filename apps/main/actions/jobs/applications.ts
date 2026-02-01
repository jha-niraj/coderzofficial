"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"

// Show interest in a job (first step - adds to "My Jobs")
export async function showInterest(jobId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in to show interest" }
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

// Submit application (move from PREPARING to APPLIED)
export async function submitApplication(applicationId: string, coverLetter?: string) {
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
            include: { job: true }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        if (!["INTERESTED", "PREPARING"].includes(application.status)) {
            return { success: false, error: "Application already submitted" }
        }

        // Update application
        const updated = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                status: "APPLIED",
                appliedAt: new Date(),
                coverLetter: coverLetter || application.coverLetter
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
        concepts_reviewed?: boolean
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
