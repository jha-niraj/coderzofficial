"use server"

import { prisma } from "@repo/prisma";
import { auth } from "@repo/auth";

interface OnboardingData {
    companyName: string;
    slug: string;
    website?: string;
    industry?: string;
    companySize?: string;
    description?: string;
    userRole: string;
    hiringGoals?: string[];
    city?: string;
    state?: string;
    country?: string;
    inviteBy?: string; // University slug for referral tracking
}

export async function checkSlugAvailability(slug: string): Promise<{ available: boolean; suggestions?: string[] }> {
    if (!slug || slug.length < 2) {
        return { available: false };
    }

    try {
        const existingCompany = await prisma.company.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!existingCompany) {
            return { available: true };
        }

        // Generate suggestions if slug is taken
        const suggestions: string[] = [];
        const baseSlugs = [
            `${slug}-hq`,
            `${slug}-team`,
            `${slug}-inc`,
            `${slug}-${Math.floor(Math.random() * 100)}`,
            `${slug}-${new Date().getFullYear()}`,
        ];

        for (const suggestion of baseSlugs) {
            const exists = await prisma.company.findUnique({
                where: { slug: suggestion },
                select: { id: true },
            });
            if (!exists) {
                suggestions.push(suggestion);
            }
            if (suggestions.length >= 3) break;
        }

        return { available: false, suggestions };
    } catch {
        return { available: false };
    }
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

        // Verify slug is available
        const existingCompany = await prisma.company.findUnique({
            where: { slug: data.slug },
            select: { id: true },
        });

        if (existingCompany) {
            return { success: false, error: "This URL is already taken. Please choose a different one." };
        }

        // Create company with provided name and slug
        const company = await prisma.company.create({
            data: {
                name: data.companyName,
                slug: data.slug,
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

        // If company was referred by a university, create the link
        if (data.inviteBy) {
            try {
                const university = await prisma.university.findUnique({
                    where: { slug: data.inviteBy },
                    select: { id: true, createdByUserId: true },
                });

                if (university) {
                    const referralCode = `${company.slug}-${data.inviteBy}-${Date.now().toString(36)}`;
                    await prisma.companyUniversityLink.create({
                        data: {
                            companyId: company.id,
                            universityId: university.id,
                            referredById: university.createdByUserId || null,
                            referralCode,
                            isPartner: false,
                            jobsPosted: 0,
                            studentsHired: 0,
                            isActive: true,
                        },
                    });
                    console.log(`✅ Created CompanyUniversityLink for company ${company.id} referred by university ${university.id}`);
                }
            } catch (linkError) {
                // Non-fatal: don't block onboarding if link creation fails
                console.error("Failed to create CompanyUniversityLink:", linkError);
            }
        }

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