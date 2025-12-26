"use server"

import { auth } from '@repo/auth';
import { prisma } from "@repo/prisma";
import { revalidatePath } from "next/cache";

// ================= WORK EXPERIENCE ACTIONS =================

export async function getWorkExperiences() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required", data: [] };
        }

        const experiences = await prisma.workExperience.findMany({
            where: { userId: session.user.id },
            orderBy: [
                { isCurrentlyWorking: 'desc' },
                { startDate: 'desc' }
            ]
        });

        return { success: true, data: experiences };
    } catch (error) {
        console.error("Error fetching work experiences:", error);
        return { success: false, message: "Failed to fetch work experiences", data: [] };
    }
}

export async function addWorkExperience(data: {
    companyName: string;
    companyLogo?: string;
    roleTitle: string;
    companyWebsite?: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    isCurrentlyWorking: boolean;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" };
        }

        const experience = await prisma.workExperience.create({
            data: {
                userId: session.user.id,
                ...data
            }
        });

        revalidatePath("/profile");
        return { success: true, message: "Work experience added successfully", data: experience };
    } catch (error) {
        console.error("Error adding work experience:", error);
        return { success: false, message: "Failed to add work experience" };
    }
}

export async function updateWorkExperience(id: string, data: {
    companyName?: string;
    companyLogo?: string;
    roleTitle?: string;
    companyWebsite?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    isCurrentlyWorking?: boolean;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" };
        }

        // Verify ownership
        const existing = await prisma.workExperience.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!existing || existing.userId !== session.user.id) {
            return { success: false, message: "Unauthorized" };
        }

        const experience = await prisma.workExperience.update({
            where: { id },
            data
        });

        revalidatePath("/profile");
        return { success: true, message: "Work experience updated successfully", data: experience };
    } catch (error) {
        console.error("Error updating work experience:", error);
        return { success: false, message: "Failed to update work experience" };
    }
}

export async function deleteWorkExperience(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" };
        }

        // Verify ownership
        const existing = await prisma.workExperience.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!existing || existing.userId !== session.user.id) {
            return { success: false, message: "Unauthorized" };
        }

        await prisma.workExperience.delete({ where: { id } });

        revalidatePath("/profile");
        return { success: true, message: "Work experience deleted successfully" };
    } catch (error) {
        console.error("Error deleting work experience:", error);
        return { success: false, message: "Failed to delete work experience" };
    }
}

// ================= PORTFOLIO PROJECT ACTIONS =================

export async function getPortfolioProjects() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required", data: [] };
        }

        const projects = await prisma.portfolioProject.findMany({
            where: { userId: session.user.id },
            include: {
                projectLinks: true,
                projectMedia: true
            },
            orderBy: { startDate: 'desc' }
        });

        return { success: true, data: projects };
    } catch (error) {
        console.error("Error fetching portfolio projects:", error);
        return { success: false, message: "Failed to fetch portfolio projects", data: [] };
    }
}

export async function addPortfolioProject(data: {
    projectName: string;
    projectType: string;
    description?: string;
    status: string;
    visibility: string;
    technologies: string[];
    startDate: Date;
    endDate?: Date;
    thumbnailUrl?: string;
    links?: { linkType: string; url: string; description?: string }[];
    media?: { mediaUrl: string; mediaType: string; caption?: string }[];
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" };
        }

        const { links, media, ...projectData } = data;

        const project = await prisma.portfolioProject.create({
            data: {
                userId: session.user.id,
                ...projectData,
                projectLinks: links ? {
                    create: links
                } : undefined,
                projectMedia: media ? {
                    create: media
                } : undefined
            },
            include: {
                projectLinks: true,
                projectMedia: true
            }
        });

        revalidatePath("/profile");
        return { success: true, message: "Project added successfully", data: project };
    } catch (error) {
        console.error("Error adding portfolio project:", error);
        return { success: false, message: "Failed to add project" };
    }
}

export async function updatePortfolioProject(id: string, data: {
    projectName?: string;
    projectType?: string;
    description?: string;
    status?: string;
    visibility?: string;
    technologies?: string[];
    startDate?: Date;
    endDate?: Date;
    thumbnailUrl?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" };
        }

        // Verify ownership
        const existing = await prisma.portfolioProject.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!existing || existing.userId !== session.user.id) {
            return { success: false, message: "Unauthorized" };
        }

        const project = await prisma.portfolioProject.update({
            where: { id },
            data
        });

        revalidatePath("/profile");
        return { success: true, message: "Project updated successfully", data: project };
    } catch (error) {
        console.error("Error updating portfolio project:", error);
        return { success: false, message: "Failed to update project" };
    }
}

export async function deletePortfolioProject(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" };
        }

        // Verify ownership
        const existing = await prisma.portfolioProject.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!existing || existing.userId !== session.user.id) {
            return { success: false, message: "Unauthorized" };
        }

        await prisma.portfolioProject.delete({ where: { id } });

        revalidatePath("/profile");
        return { success: true, message: "Project deleted successfully" };
    } catch (error) {
        console.error("Error deleting portfolio project:", error);
        return { success: false, message: "Failed to delete project" };
    }
}

// ================= SOCIAL LINK ACTIONS =================

export async function getSocialLinks() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required", data: [] };
        }

        const socialLinks = await prisma.socialLink.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, data: socialLinks };
    } catch (error) {
        console.error("Error fetching social links:", error);
        return { success: false, message: "Failed to fetch social links", data: [] };
    }
}

export async function addSocialLink(data: {
    platform: string;
    url: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" };
        }

        const socialLink = await prisma.socialLink.create({
            data: {
                userId: session.user.id,
                ...data
            }
        });

        revalidatePath("/profile");
        return { success: true, message: "Social link added successfully", data: socialLink };
    } catch (error) {
        console.error("Error adding social link:", error);
        return { success: false, message: "Failed to add social link" };
    }
}

export async function updateSocialLink(id: string, data: {
    platform?: string;
    url?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" };
        }

        // Verify ownership
        const existing = await prisma.socialLink.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!existing || existing.userId !== session.user.id) {
            return { success: false, message: "Unauthorized" };
        }

        const socialLink = await prisma.socialLink.update({
            where: { id },
            data
        });

        revalidatePath("/profile");
        return { success: true, message: "Social link updated successfully", data: socialLink };
    } catch (error) {
        console.error("Error updating social link:", error);
        return { success: false, message: "Failed to update social link" };
    }
}

export async function deleteSocialLink(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" };
        }

        // Verify ownership
        const existing = await prisma.socialLink.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!existing || existing.userId !== session.user.id) {
            return { success: false, message: "Unauthorized" };
        }

        await prisma.socialLink.delete({ where: { id } });

        revalidatePath("/profile");
        return { success: true, message: "Social link deleted successfully" };
    } catch (error) {
        console.error("Error deleting social link:", error);
        return { success: false, message: "Failed to delete social link" };
    }
}

// ================= PROFILE COMPLETION =================

export async function getProfileCompletion() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required", completion: 0 };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                experiences: true,
                portfolioProjects: true,
                socialLinks: true,
                skills: true,
                certifications: true
            }
        });

        if (!user) {
            return { success: false, message: "User not found", completion: 0 };
        }

        // Calculate completion percentage based on 6 key items shown in dialog
        let completed = 0;
        let total = 6;

        const defaultImage = "https://tse4.mm.bing.net/th?id=OIP.-BS8Y2nH1k93GJiitUVBCAHaHa&pid=Api&P=0";

        // 1. Basic Information (name, bio, profile picture)
        const hasBasicInfo = !!(user.name && user.bio && user.image && user.image !== defaultImage);
        if (hasBasicInfo) completed++;

        // 2. Resume
        const hasResume = !!user.resume;
        if (hasResume) completed++;

        // 3. Work Experience
        const hasExperience = user.experiences.length > 0;
        if (hasExperience) completed++;

        // 4. Portfolio Projects
        const hasProjects = user.portfolioProjects.length > 0;
        if (hasProjects) completed++;

        // 5. Social Links
        const hasSocials = user.socialLinks.length > 0;
        if (hasSocials) completed++;

        // 6. Skills
        const hasSkills = user.skills && user.skills.length > 0;
        if (hasSkills) completed++;

        const completionPercentage = Math.round((completed / total) * 100);

        return {
            success: true,
            completion: completionPercentage,
            details: {
                hasBasicInfo,
                hasResume,
                hasExperience,
                hasProjects,
                hasSocials,
                hasSkills
            }
        };
    } catch (error) {
        console.error("Error calculating profile completion:", error);
        return { success: false, message: "Failed to calculate profile completion", completion: 0 };
    }
}

// ============================================
// PROFILE REDESIGN - NEW FEATURES
// ============================================

import { ProfileTheme, ProfileLayout, ProfileVisibility } from "@repo/prisma/client";

/**
 * Get user's own profile (full access)
 */
export async function getOwnProfile() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                userProfile: {
                    include: {
                        pinnedProjects: {
                            include: {
                                project: {
                                    include: {
                                        userProgress: {
                                            where: { userId: session.user.id },
                                        },
                                    },
                                },
                            },
                            orderBy: { order: "asc" },
                            take: 6,
                        },
                    },
                },
                skills: {
                    include: {
                        endorsements: true,
                    },
                },
                projects: true,
                recentActivity: {
                    orderBy: { createdAt: "desc" },
                    take: 20,
                },
                achievements: true,
                experiences: {
                    orderBy: { startDate: "desc" },
                },
                certifications: {
                    orderBy: { issuedDate: "desc" },
                },
                socialLinks: true,
            },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        return { success: true, user };
    } catch (error) {
        console.error("Error fetching own profile:", error);
        return { success: false, error: "Failed to fetch profile" };
    }
}

/**
 * Get public profile by username with access control
 */
export async function getPublicProfile(username: string) {
    try {
        const session = await auth();
        const viewerId = session?.user?.id;

        // Find the profile owner
        const profileOwner = await prisma.user.findUnique({
            where: { username },
            include: {
                userProfile: {
                    include: {
                        pinnedProjects: {
                            include: {
                                project: true,
                            },
                            orderBy: { order: "asc" },
                            take: 6,
                        },
                    },
                },
                skills: {
                    include: {
                        endorsements: true,
                    },
                },
                projects: true,
                recentActivity: {
                    orderBy: { createdAt: "desc" },
                    take: 20,
                },
                achievements: true,
                experiences: {
                    orderBy: { startDate: "desc" },
                },
                certifications: {
                    orderBy: { issuedDate: "desc" },
                },
                socialLinks: true,
            },
        });

        if (!profileOwner) {
            return { success: false, error: "User not found" };
        }

        // Check if viewer is the owner
        const isOwnProfile = viewerId === profileOwner.id;

        // Get or create profile settings
        let profile = profileOwner.userProfile;
        if (!profile) {
            // Create default profile if doesn't exist
            profile = await prisma.userProfile.create({
                data: {
                    userId: profileOwner.id,
                },
                include: {
                    pinnedProjects: {
                        include: {
                            project: true,
                        },
                        orderBy: { order: "asc" },
                        take: 6,
                    },
                },
            });
        }

        // Check access based on privacy settings
        if (!isOwnProfile) {
            if (profile.visibility === "PRIVATE") {
                return { success: false, error: "This profile is private" };
            }

            if (profile.visibility === "FOLLOWERS") {
                // Check if viewer is following the profile owner
                const isFollowing = await prisma.follow.findUnique({
                    where: {
                        followerId_followingId: {
                            followerId: viewerId || "",
                            followingId: profileOwner.id,
                        },
                    },
                });

                if (!isFollowing) {
                    return {
                        success: false,
                        error: "This profile is only visible to followers",
                    };
                }
            }

            // Track profile view
            await trackProfileView(profile.id, viewerId || null, "direct");

            // Filter out private information
            const filteredUser = {
                ...profileOwner,
                email: profile.showEmail ? profileOwner.email : null,
                phone: null,
                resume: profile.showResume ? profileOwner.resume : null,
                resumeText: null,
                recentActivity: profile.showActivity ? profileOwner.recentActivity : [],
            };

            return {
                success: true,
                user: filteredUser,
                isOwnProfile: false,
                canEdit: false,
            };
        }

        return {
            success: true,
            user: profileOwner,
            isOwnProfile: true,
            canEdit: true,
        };
    } catch (error) {
        console.error("Error fetching public profile:", error);
        return { success: false, error: "Failed to fetch profile" };
    }
}

/**
 * Track a profile view for analytics
 */
export async function trackProfileView(
    profileId: string,
    viewerId: string | null,
    source: string = "direct"
) {
    try {
        // Don't track owner's own views
        const profile = await prisma.userProfile.findUnique({
            where: { id: profileId },
            select: { userId: true },
        });

        if (profile?.userId === viewerId) {
            return { success: true };
        }

        await prisma.profileView.create({
            data: {
                profileId,
                viewerId,
                source,
            },
        });

        // Increment profile view count
        await prisma.userProfile.update({
            where: { id: profileId },
            data: {
                profileViews: {
                    increment: 1,
                },
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error tracking profile view:", error);
        return { success: false, error: "Failed to track view" };
    }
}

/**
 * Update profile settings
 */
export async function updateProfileSettings(data: {
    coverImage?: string;
    coverGradient?: string;
    theme?: ProfileTheme;
    layout?: ProfileLayout;
    tagline?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        // Get or create profile
        let profile = await prisma.userProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!profile) {
            profile = await prisma.userProfile.create({
                data: {
                    userId: session.user.id,
                },
            });
        }

        // Update profile
        const updatedProfile = await prisma.userProfile.update({
            where: { id: profile.id },
            data: {
                ...(data.coverImage && { coverImage: data.coverImage }),
                ...(data.coverGradient && { coverGradient: data.coverGradient }),
                ...(data.theme && { theme: data.theme }),
                ...(data.layout && { layout: data.layout }),
                ...(data.tagline !== undefined && { tagline: data.tagline }),
            },
        });

        // Recalculate completion score
        await calculateNewProfileCompletion(session.user.id);

        revalidatePath("/profile");
        return { success: true, profile: updatedProfile };
    } catch (error) {
        console.error("Error updating profile settings:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

/**
 * Update profile privacy settings
 */
export async function updatePrivacySettings(data: {
    visibility?: ProfileVisibility;
    showEmail?: boolean;
    showResume?: boolean;
    showActivity?: boolean;
    showStats?: boolean;
    allowEndorsements?: boolean;
    allowMessages?: boolean;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        // Get or create profile
        let profile = await prisma.userProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!profile) {
            profile = await prisma.userProfile.create({
                data: {
                    userId: session.user.id,
                },
            });
        }

        // Update privacy settings
        const updatedProfile = await prisma.userProfile.update({
            where: { id: profile.id },
            data,
        });

        revalidatePath("/profile");
        return { success: true, profile: updatedProfile };
    } catch (error) {
        console.error("Error updating privacy settings:", error);
        return { success: false, error: "Failed to update privacy settings" };
    }
}

// ============================================
// PINNED PROJECTS
// ============================================

/**
 * Pin a project to profile
 */
export async function pinProject(projectId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        // Get or create profile
        let profile = await prisma.userProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                pinnedProjects: true,
            },
        });

        if (!profile) {
            profile = await prisma.userProfile.create({
                data: {
                    userId: session.user.id,
                },
                include: {
                    pinnedProjects: true,
                },
            });
        }

        // Check if already pinned
        const alreadyPinned = profile.pinnedProjects.some(
            (p) => p.projectId === projectId
        );
        if (alreadyPinned) {
            return { success: false, error: "Project already pinned" };
        }

        // Max 6 pinned projects
        if (profile.pinnedProjects.length >= 6) {
            return {
                success: false,
                error: "Maximum 6 projects can be pinned. Unpin one first.",
            };
        }

        // Get next order
        const nextOrder = profile.pinnedProjects.length + 1;

        // Pin the project
        await prisma.pinnedProject.create({
            data: {
                profileId: profile.id,
                projectId,
                order: nextOrder,
            },
        });

        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Error pinning project:", error);
        return { success: false, error: "Failed to pin project" };
    }
}

/**
 * Unpin a project from profile
 */
export async function unpinProject(projectId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const profile = await prisma.userProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!profile) {
            return { success: false, error: "Profile not found" };
        }

        // Find and delete the pinned project
        await prisma.pinnedProject.delete({
            where: {
                profileId_projectId: {
                    profileId: profile.id,
                    projectId,
                },
            },
        });

        // Reorder remaining projects
        const remainingProjects = await prisma.pinnedProject.findMany({
            where: { profileId: profile.id },
            orderBy: { order: "asc" },
        });

        for (let i = 0; i < remainingProjects.length; i++) {
            await prisma.pinnedProject.update({
                where: { id: remainingProjects[i]?.id },
                data: { order: i + 1 },
            });
        }

        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Error unpinning project:", error);
        return { success: false, error: "Failed to unpin project" };
    }
}

/**
 * Reorder pinned projects
 */
export async function reorderPinnedProjects(projectIds: string[]) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const profile = await prisma.userProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!profile) {
            return { success: false, error: "Profile not found" };
        }

        // Update order for each project
        for (let i = 0; i < projectIds.length; i++) {
            await prisma.pinnedProject.update({
                where: {
                    profileId_projectId: {
                        profileId: profile.id,
                        projectId: projectIds[i]!,
                    },
                },
                data: { order: i + 1 },
            });
        }

        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Error reordering pinned projects:", error);
        return { success: false, error: "Failed to reorder projects" };
    }
}

// ============================================
// SKILL ENDORSEMENTS
// ============================================

/**
 * Endorse a skill
 */
export async function endorseSkill(skillId: string, message?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        // Check if skill exists
        const skill = await prisma.skills.findUnique({
            where: { id: skillId },
            include: { user: true },
        });

        if (!skill) {
            return { success: false, error: "Skill not found" };
        }

        // Can't endorse own skills
        if (skill.userId === session.user.id) {
            return { success: false, error: "Cannot endorse your own skills" };
        }

        // Check if already endorsed
        const existingEndorsement = await prisma.skillEndorsement.findUnique({
            where: {
                skillId_endorserId: {
                    skillId,
                    endorserId: session.user.id,
                },
            },
        });

        if (existingEndorsement) {
            return { success: false, error: "Already endorsed this skill" };
        }

        // Create endorsement
        await prisma.skillEndorsement.create({
            data: {
                skillId,
                endorserId: session.user.id,
                message,
            },
        });

        revalidatePath(`/profile/${skill.user.username}`);
        return { success: true };
    } catch (error) {
        console.error("Error endorsing skill:", error);
        return { success: false, error: "Failed to endorse skill" };
    }
}

/**
 * Remove skill endorsement
 */
export async function removeEndorsement(skillId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        await prisma.skillEndorsement.delete({
            where: {
                skillId_endorserId: {
                    skillId,
                    endorserId: session.user.id,
                },
            },
        });

        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Error removing endorsement:", error);
        return { success: false, error: "Failed to remove endorsement" };
    }
}

// ============================================
// PROFILE ANALYTICS
// ============================================

/**
 * Get profile analytics
 */
export async function getProfileAnalytics(userId?: string) {
    try {
        const session = await auth();
        const targetUserId = userId || session?.user?.id;

        if (!targetUserId) {
            return { success: false, error: "User ID required" };
        }

        // Only allow viewing own analytics
        if (session?.user?.id !== targetUserId) {
            return { success: false, error: "Unauthorized" };
        }

        const profile = await prisma.userProfile.findUnique({
            where: { userId: targetUserId },
            include: {
                views: {
                    orderBy: { viewedAt: "desc" },
                    take: 100,
                },
            },
        });

        if (!profile) {
            return { success: false, error: "Profile not found" };
        }

        // Calculate analytics
        const totalViews = profile.profileViews;
        const last7DaysViews = profile.views.filter(
            (v) =>
                new Date(v.viewedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;

        const last30DaysViews = profile.views.filter(
            (v) =>
                new Date(v.viewedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length;

        // Source breakdown
        const sourceBreakdown = profile.views.reduce((acc: Record<string, number>, view) => {
            const source = view.source || "direct";
            acc[source] = (acc[source] || 0) + 1;
            return acc;
        }, {});

        // Geographic breakdown
        const geoBreakdown = profile.views.reduce((acc: Record<string, number>, view) => {
            if (view.country) {
                acc[view.country] = (acc[view.country] || 0) + 1;
            }
            return acc;
        }, {});

        return {
            success: true,
            analytics: {
                totalViews,
                last7DaysViews,
                last30DaysViews,
                sourceBreakdown,
                geoBreakdown,
                recentViews: profile.views.slice(0, 20),
            },
        };
    } catch (error) {
        console.error("Error fetching profile analytics:", error);
        return { success: false, error: "Failed to fetch analytics" };
    }
}

// ============================================
// NEW PROFILE COMPLETION (WITH PROFILE REDESIGN)
// ============================================

/**
 * Calculate profile completion score (new version with profile customization)
 */
export async function calculateNewProfileCompletion(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                userProfile: true,
                skills: true,
                experiences: true,
                certifications: true,
                projects: true,
                socialLinks: true,
            },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        let score = 0;

        // Basic info (30 points)
        if (user.name) score += 5;
        if (user.username) score += 5;
        if (user.image) score += 5;
        if (user.bio) score += 10;
        if (user.location) score += 5;

        // Profile customization (15 points)
        if (user.userProfile?.coverImage || user.userProfile?.coverGradient)
            score += 5;
        if (user.userProfile?.tagline) score += 5;
        if (user.userProfile?.theme) score += 5;

        // Skills (15 points)
        if (user.skills.length > 0) score += 5;
        if (user.skills.length >= 5) score += 5;
        if (user.skills.length >= 10) score += 5;

        // Experience (15 points)
        if (user.experiences.length > 0) score += 10;
        if (user.company) score += 5;

        // Education & Certifications (10 points)
        if (user.university) score += 5;
        if (user.certifications.length > 0) score += 5;

        // Projects (10 points)
        if (user.projects.length > 0) score += 5;
        if (user.projects.length >= 3) score += 5;

        // Social & Contact (5 points)
        if (user.socialLinks && user.socialLinks.length > 0) score += 3;
        if (user.website) score += 2;

        // Update profile with new score
        if (user.userProfile) {
            await prisma.userProfile.update({
                where: { id: user.userProfile.id },
                data: { completionScore: score },
            });
        }

        return { success: true, score };
    } catch (error) {
        console.error("Error calculating profile completion:", error);
        return { success: false, error: "Failed to calculate completion" };
    }
}

/**
 * Get profile by username (for public viewing)
 */
export async function getProfileByUsername(username: string) {
    try {
        const session = await auth();
        const viewerId = session?.user?.id;

        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                userProfile: {
                    include: {
                        pinnedProjects: {
                            include: {
                                project: true,
                            },
                            orderBy: { order: "asc" },
                        },
                    },
                },
                skills: {
                    include: {
                        endorsements: true,
                    },
                },
                experiences: {
                    orderBy: { startDate: "desc" },
                },
                certifications: {
                    orderBy: { issuedDate: "desc" },
                },
                achievements: true,
                socialLinks: true,
                recentActivity: {
                    orderBy: { createdAt: "desc" },
                    take: 10,
                },
                followers: true,
                following: true,
            },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const isOwnProfile = viewerId === user.id;

        // Check if viewer is following the user
        let isFollowing = false;
        if (viewerId && !isOwnProfile) {
            const follow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: viewerId,
                        followingId: user.id,
                    },
                },
            });
            isFollowing = !!follow;
        }

        // Get follow counts
        const followersCount = await prisma.follow.count({
            where: { followingId: user.id },
        });

        const followingCount = await prisma.follow.count({
            where: { followerId: user.id },
        });

        return {
            success: true,
            user: {
                ...user,
                followersCount,
                followingCount,
            },
            isOwnProfile,
            isFollowing,
        };
    } catch (error) {
        console.error("Error fetching profile by username:", error);
        return { success: false, error: "Failed to fetch profile" };
    }
}

/**
 * Get user stats for profile
 */
export async function getUserProfileStats(userId: string) {
    try {
        const [
            projectsCount,
            skillsCount,
            achievementsCount,
            experienceCount,
            followersCount,
            followingCount,
        ] = await Promise.all([
            prisma.projects.count({ where: { userId } }),
            prisma.skills.count({ where: { userId } }),
            prisma.achievements.count({ where: { userId } }),
            prisma.workExperience.count({ where: { userId } }),
            prisma.follow.count({ where: { followingId: userId } }),
            prisma.follow.count({ where: { followerId: userId } }),
        ]);

        // Get XP and Level
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                currentXp: true,
                totalXp: true,
                currentLevel: true,
                credits: true,
            },
        });

        return {
            success: true,
            stats: {
                projectsCount,
                skillsCount,
                achievementsCount,
                experienceCount,
                followersCount,
                followingCount,
                xp: user?.currentXp || 0,
                totalXp: user?.totalXp || 0,
                level: user?.currentLevel || 1,
                credits: user?.credits || 0,
            },
        };
    } catch (error) {
        console.error("Error fetching user profile stats:", error);
        return { success: false, error: "Failed to fetch stats" };
    }
}