"use server"

import { db, companies, companyMembers, memberInvitations, jobs, jobApplications } from "@repo/db"
import { eq, and, count } from "drizzle-orm"

// ============================================
// HIRING PLATFORM ADMIN SERVER ACTIONS
// ============================================

/**
 * Get hiring platform dashboard stats
 */
export async function getHiringDashboardStats() {
    try {
        const [
            totalCompaniesResult,
            verifiedCompaniesResult,
            pendingVerificationsResult,
            rejectedVerificationsResult,
            totalMembersResult,
            totalJobsResult,
            activeJobsResult,
            totalApplicationsResult,
            pendingInvitationsResult,
        ] = await Promise.all([
            db.select({ totalCompanies: count() }).from(companies),
            db.select({ verifiedCompanies: count() }).from(companies).where(eq(companies.verificationStatus, "VERIFIED")),
            db.select({ pendingVerifications: count() }).from(companies).where(eq(companies.verificationStatus, "PENDING")),
            db.select({ rejectedVerifications: count() }).from(companies).where(eq(companies.verificationStatus, "REJECTED")),
            db.select({ totalMembers: count() }).from(companyMembers),
            db.select({ totalJobs: count() }).from(jobs),
            db.select({ activeJobs: count() }).from(jobs).where(eq(jobs.status, "ACTIVE")),
            db.select({ totalApplications: count() }).from(jobApplications),
            db.select({ pendingInvitations: count() }).from(memberInvitations).where(eq(memberInvitations.status, "PENDING")),
        ])
        const totalCompanies = totalCompaniesResult[0]?.totalCompanies ?? 0
        const verifiedCompanies = verifiedCompaniesResult[0]?.verifiedCompanies ?? 0
        const pendingVerifications = pendingVerificationsResult[0]?.pendingVerifications ?? 0
        const rejectedVerifications = rejectedVerificationsResult[0]?.rejectedVerifications ?? 0
        const totalMembers = totalMembersResult[0]?.totalMembers ?? 0
        const totalJobs = totalJobsResult[0]?.totalJobs ?? 0
        const activeJobs = activeJobsResult[0]?.activeJobs ?? 0
        const totalApplications = totalApplicationsResult[0]?.totalApplications ?? 0
        const pendingInvitations = pendingInvitationsResult[0]?.pendingInvitations ?? 0

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
        const offset = (page - 1) * limit

        const whereClause = status && status !== "all"
            ? eq(companies.verificationStatus, status as "PENDING" | "VERIFIED" | "REJECTED")
            : undefined

        const [companyList, totalResult] = await Promise.all([
            db.query.companies.findMany({
                where: whereClause,
                offset,
                limit,
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                with: {
                    members: true,
                }
            }),
            db.select({ total: count() }).from(companies).where(whereClause)
        ])
        const total = totalResult[0]?.total ?? 0

        return {
            success: true,
            data: companyList,
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
        const pendingCompanies = await db.query.companies.findMany({
            where: eq(companies.verificationStatus, "PENDING"),
            orderBy: (t, { asc }) => [asc(t.createdAt)],
            with: {
                members: true,
            }
        })

        return { success: true, data: pendingCompanies }
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
        const [company] = await db.update(companies)
            .set({
                verificationStatus: "VERIFIED",
                verifiedAt: new Date(),
                verifiedBy: adminUserId,
            })
            .where(eq(companies.id, companyId))
            .returning()

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
        const [company] = await db.update(companies)
            .set({
                verificationStatus: "REJECTED",
                verifiedBy: adminUserId,
            })
            .where(eq(companies.id, companyId))
            .returning()

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
        const company = await db.query.companies.findFirst({
            where: eq(companies.id, companyId),
            with: {
                members: true,
            }
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
        const members = await db.query.companyMembers.findMany({
            where: eq(companyMembers.companyId, companyId),
            orderBy: (t, { desc }) => [desc(t.createdAt)]
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
        const offset = (page - 1) * limit

        const whereClause = status && status !== "all"
            ? eq(jobs.status, status as "ACTIVE" | "CLOSED" | "DRAFT" | "PAUSED" | "FILLED")
            : undefined

        const [jobList, jobTotalResult] = await Promise.all([
            db.query.jobs.findMany({
                where: whereClause,
                offset,
                limit,
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                with: {
                    company: {
                        columns: { id: true, name: true, logoUrl: true }
                    },
                    applications: true,
                }
            }),
            db.select({ total: count() }).from(jobs).where(whereClause)
        ])
        const total = jobTotalResult[0]?.total ?? 0

        return {
            success: true,
            data: jobList,
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
        const offset = (page - 1) * limit

        const [applications, appTotalResult] = await Promise.all([
            db.query.jobApplications.findMany({
                offset,
                limit,
                orderBy: (t, { desc }) => [desc(t.appliedAt)],
                with: {
                    job: {
                        columns: { id: true, title: true },
                        with: {
                            company: { columns: { id: true, name: true } }
                        }
                    }
                }
            }),
            db.select({ total: count() }).from(jobApplications)
        ])
        const total = appTotalResult[0]?.total ?? 0

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
        const whereClause = status && status !== "all"
            ? eq(memberInvitations.status, status as "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED")
            : undefined

        const invitations = await db.query.memberInvitations.findMany({
            where: whereClause,
            orderBy: (t, { desc }) => [desc(t.createdAt)],
            with: {
                company: {
                    columns: { id: true, name: true }
                }
            }
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
            db.query.companies.findMany({
                limit,
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                columns: { id: true, name: true, verificationStatus: true, createdAt: true }
            }),
            db.query.jobs.findMany({
                limit,
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                columns: { id: true, title: true, status: true, createdAt: true },
                with: {
                    company: { columns: { name: true } }
                }
            }),
            db.query.jobApplications.findMany({
                limit,
                orderBy: (t, { desc }) => [desc(t.appliedAt)],
                columns: { id: true, status: true, appliedAt: true },
                with: {
                    job: {
                        columns: { title: true },
                        with: {
                            company: { columns: { name: true } }
                        }
                    }
                }
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
