"use server"

import { prisma } from "@repo/prisma"

// ============================================
// HIRING PLATFORM ADMIN SERVER ACTIONS
// ============================================

/**
 * Get hiring platform dashboard stats
 */
export async function getHiringDashboardStats() {
    try {
        const [
            totalCompanies,
            verifiedCompanies,
            pendingVerifications,
            rejectedVerifications,
            totalMembers,
            totalJobs,
            activeJobs,
            totalApplications,
            pendingInvitations,
        ] = await Promise.all([
            prisma.company.count(),
            prisma.company.count({ where: { verificationStatus: "VERIFIED" } }),
            prisma.company.count({ where: { verificationStatus: "PENDING" } }),
            prisma.company.count({ where: { verificationStatus: "REJECTED" } }),
            prisma.companyMember.count(),
            prisma.job.count(),
            prisma.job.count({ where: { status: "ACTIVE" } }),
            prisma.jobApplication.count(),
            prisma.memberInvitation.count({ where: { status: "PENDING" } }),
        ])

        return {
            success: true,
            data: {
                totalCompanies,
                verifiedCompanies,
                pendingVerifications,
                rejectedVerifications,
                totalMembers,
                totalJobs,
                activeJobs,
                totalApplications,
                pendingInvitations,
            },
        }
    } catch (error) {
        console.error("Error fetching hiring dashboard stats:", error)
        return { success: false, error: "Failed to fetch hiring dashboard stats" }
    }
}

/**
 * Get companies list with pagination
 */
export async function getCompanies(page = 1, limit = 20, status?: string) {
    try {
        const skip = (page - 1) * limit

        const where = status && status !== "all"
            ? { verificationStatus: status as "PENDING" | "VERIFIED" | "REJECTED" }
            : {}

        const [companies, total] = await Promise.all([
            prisma.company.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    _count: {
                        select: {
                            members: true,
                            jobs: true,
                        },
                    },
                },
            }),
            prisma.company.count({ where }),
        ])

        return {
            success: true,
            data: companies,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    } catch (error) {
        console.error("Error fetching companies:", error)
        return { success: false, error: "Failed to fetch companies" }
    }
}

/**
 * Get pending company verifications
 */
export async function getPendingCompanyVerifications() {
    try {
        const companies = await prisma.company.findMany({
            where: {
                verificationStatus: "PENDING",
            },
            orderBy: { createdAt: "asc" },
            include: {
                _count: {
                    select: {
                        members: true,
                        jobs: true,
                    },
                },
            },
        })

        return { success: true, data: companies }
    } catch (error) {
        console.error("Error fetching pending verifications:", error)
        return { success: false, error: "Failed to fetch pending verifications" }
    }
}

/**
 * Verify a company
 */
export async function verifyCompany(companyId: string, adminUserId: string) {
    try {
        const company = await prisma.company.update({
            where: { id: companyId },
            data: {
                verificationStatus: "VERIFIED",
                verifiedAt: new Date(),
                verifiedBy: adminUserId,
            },
        })

        return { success: true, data: company }
    } catch (error) {
        console.error("Error verifying company:", error)
        return { success: false, error: "Failed to verify company" }
    }
}

/**
 * Reject a company verification
 */
export async function rejectCompanyVerification(companyId: string, adminUserId: string) {
    try {
        const company = await prisma.company.update({
            where: { id: companyId },
            data: {
                verificationStatus: "REJECTED",
                verifiedBy: adminUserId,
            },
        })

        return { success: true, data: company }
    } catch (error) {
        console.error("Error rejecting company:", error)
        return { success: false, error: "Failed to reject company" }
    }
}

/**
 * Get company details by ID
 */
export async function getCompanyById(companyId: string) {
    try {
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: {
                members: {
                    include: {
                        postedJobs: {
                            select: {
                                id: true,
                                title: true,
                                status: true,
                            },
                        },
                    },
                },
                jobs: {
                    take: 10,
                    orderBy: { createdAt: "desc" },
                },
                _count: {
                    select: {
                        members: true,
                        jobs: true,
                    },
                },
            },
        })

        if (!company) {
            return { success: false, error: "Company not found" }
        }

        return { success: true, data: company }
    } catch (error) {
        console.error("Error fetching company:", error)
        return { success: false, error: "Failed to fetch company" }
    }
}

/**
 * Get company members
 */
export async function getCompanyMembers(companyId: string) {
    try {
        const members = await prisma.companyMember.findMany({
            where: { companyId },
            orderBy: { createdAt: "desc" },
        })

        return { success: true, data: members }
    } catch (error) {
        console.error("Error fetching company members:", error)
        return { success: false, error: "Failed to fetch company members" }
    }
}

/**
 * Get all jobs with pagination
 */
export async function getJobs(page = 1, limit = 20, status?: string) {
    try {
        const skip = (page - 1) * limit

        const where = status && status !== "all"
            ? { status: status as "ACTIVE" | "CLOSED" | "DRAFT" | "PAUSED" | "FILLED" }
            : {}

        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            logoUrl: true,
                        },
                    },
                    _count: {
                        select: {
                            applications: true,
                        },
                    },
                },
            }),
            prisma.job.count({ where }),
        ])

        return {
            success: true,
            data: jobs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    } catch (error) {
        console.error("Error fetching jobs:", error)
        return { success: false, error: "Failed to fetch jobs" }
    }
}

/**
 * Get job applications with pagination
 */
export async function getJobApplications(page = 1, limit = 20) {
    try {
        const skip = (page - 1) * limit

        const [applications, total] = await Promise.all([
            prisma.jobApplication.findMany({
                skip,
                take: limit,
                orderBy: { appliedAt: "desc" },
                include: {
                    job: {
                        select: {
                            id: true,
                            title: true,
                            company: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.jobApplication.count(),
        ])

        return {
            success: true,
            data: applications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    } catch (error) {
        console.error("Error fetching job applications:", error)
        return { success: false, error: "Failed to fetch job applications" }
    }
}

/**
 * Get member invitations
 */
export async function getMemberInvitations(status?: string) {
    try {
        const where = status && status !== "all"
            ? { status: status as "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED" }
            : {}

        const invitations = await prisma.memberInvitation.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        return { success: true, data: invitations }
    } catch (error) {
        console.error("Error fetching invitations:", error)
        return { success: false, error: "Failed to fetch invitations" }
    }
}

/**
 * Get recent activity for hiring platform
 */
export async function getHiringRecentActivity(limit = 10) {
    try {
        const [recentCompanies, recentJobs, recentApplications] = await Promise.all([
            prisma.company.findMany({
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    verificationStatus: true,
                    createdAt: true,
                },
            }),
            prisma.job.findMany({
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    createdAt: true,
                    company: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),
            prisma.jobApplication.findMany({
                take: limit,
                orderBy: { appliedAt: "desc" },
                select: {
                    id: true,
                    status: true,
                    appliedAt: true,
                    job: {
                        select: {
                            title: true,
                            company: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
        ])

        return {
            success: true,
            data: {
                recentCompanies,
                recentJobs,
                recentApplications,
            },
        }
    } catch (error) {
        console.error("Error fetching recent activity:", error)
        return { success: false, error: "Failed to fetch recent activity" }
    }
}
