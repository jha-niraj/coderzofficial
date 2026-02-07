"use server"

import { prisma } from "@repo/prisma";
import { auth } from "@repo/auth";

interface OnboardingData {
    companyName: string;
    website?: string;
    industry?: string;
    companySize?: string;
    description?: string;
    userRole: string;
    hiringGoals?: string[];
    city?: string;
    state?: string;
    country?: string;
}

export async function completeOnboarding(data: OnboardingData) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    try {
        // Determine if user is HEAD based on role selection
        const headRoles = ["CEO", "CTO", "COFOUNDER", "VP_ENGINEERING", "HR_HEAD"];
        const isHead = headRoles.includes(data.userRole);

        // Create company slug from name
        const slug = data.companyName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") +
            "-" + Math.random().toString(36).substring(2, 8);

        // Create company
        const company = await prisma.company.create({
            data: {
                name: data.companyName,
                slug,
                website: data.website || null,
                industry: data.industry || null,
                companySize: data.companySize || null,
                description: data.description || null,
                city: data.city || null,
                state: data.state || null,
                country: data.country || null,
                createdByUserId: userId,
                verificationStatus: "PENDING",
            },
        });

        // Get user email
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Create company member (the user who registered)
        await prisma.companyMember.create({
            data: {
                userId,
                companyId: company.id,
                email: user.email,
                displayName: user.name,
                role: isHead ? "FOUNDER" : "RECRUITER",
                jobTitle: data.userRole as "CEO" | "CTO" | "COFOUNDER" | "VP_ENGINEERING" | "HR_HEAD" | "HR_MANAGER" | "RECRUITER" | "HIRING_MANAGER" | "OTHER",
                inviteStatus: "ACCEPTED",
                acceptedAt: new Date(),
                permissions: isHead
                    ? JSON.stringify(["view_jobs", "post_jobs", "view_applications", "review_candidates", "manage_members", "manage_company", "manage_billing"])
                    : JSON.stringify(["view_jobs", "post_jobs", "view_applications", "review_candidates"]),
            },
        });

        // Mark user onboarding as completed
        await prisma.user.update({
            where: { id: userId },
            data: { onboardingCompleted: true },
        });

        return { success: true, companyId: company.id };
    } catch (error) {
        console.error("Onboarding error:", error);
        return { success: false, error: "Failed to complete onboarding" };
    }
}

export async function getUserCompany() {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const companyMember = await prisma.companyMember.findFirst({
            where: { userId: session.user.id },
            include: { company: true },
        });

        if (!companyMember) {
            return { success: false, error: "No company found" };
        }

        return { success: true, data: companyMember };
    } catch (error) {
        console.error("Get company error:", error);
        return { success: false, error: "Failed to fetch company" };
    }
}