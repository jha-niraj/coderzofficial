"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/app/store/useUserStore";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import {
    AlertCircle, User as UserIcon, RefreshCw
} from "lucide-react";
import { DotmSquare11 } from "@repo/ui/components/ui/dotm-square-11";
import {
    ProfileHeader, ProfileTabs, ProfileSidebar, AtAGlanceTab, ProjectsTab,
    SkillsTab, WorkExperienceTab, EducationTab, ShareProfileModal,
    EditProfileModal
} from "@/components/profile";
import type { ProfileTab } from "@/components/profile";
import { AddSkillsSheet } from "@/components/profile/sheets/add-skills-sheet";
import toast from "@repo/ui/components/ui/sonner";
import {
    getOwnProfile, getUserProfileStats, endorseSkill
} from "@/actions/(main)/user/profile.action";
import { useRouter } from "next/navigation";

interface ProfileStats {
    projectsCount: number;
    skillsCount: number;
    followersCount: number;
    followingCount: number;
    xp: number;
    level: number;
    credits: number;
    achievementsCount: number;
}

interface ProfileData {
    id: string;
    name: string | null;
    username: string | null;
    email: string | null;
    image: string | null;
    bio: string | null;
    totalXp: number;
    currentXp: number;
    currentLevel: number;
    credits?: number;
    location: string | null;
    company: string | null;
    occupation: string | null;
    website: string | null;
    createdAt: Date;

    recentActivity: Array<{
        id: string;
        activityType: string | null;
        description: string | null;
        createdAt: Date;
    }>;
    achievements: Array<{
        id: string;
        title: string;
        description: string;
        createdAt?: Date;
    }>;
    portfolioProjects?: Array<{
        id: string;
        projectName: string;
        projectType: string;
        description: string | null;
        status: string;
        visibility: string;
        technologies: string[];
        startDate: Date;
        endDate: Date | null;
        thumbnailUrl: string | null;
        projectLinks?: Array<{
            id: string;
            linkType: string;
            url: string;
            description: string | null;
        }>;
    }>;
    UserProjectV2Progress?: Array<{
        id: string;
        status: string;
        project: {
            id: string;
            slug: string;
            title: string;
            shortDescription: string | null;
            description: string;
            technologies: string[];
            generationType: string;
            difficulty: string;
        };
    }>;
    skills: Array<{
        id: string;
        name: string;
        level: string;
        category: string;
        endorsements?: Array<{
            id: string;
            endorserId: string;
            message?: string | null;
        }>;
    }>;
    resume: string | null;
    hasResume: boolean;
    phone: string | null;
    university: string | null;
    semester: string | null;
    gender: string | null;
    yearofbirth: string | null;
    interests: string[];
    careerGoals: string[];
    targetCompanies: string[];
    expectedSalary: string | null;
    noticePeriod: string | null;
    workExperience: string | null;
    experiences: Array<{
        id: string;
        companyName: string;
        companyLogo: string | null;
        roleTitle: string;
        description: string | null;
        startDate: Date;
        endDate: Date | null;
        isCurrentlyWorking: boolean;
        companyWebsite: string | null;
    }>;
    certifications: Array<{
        id: string;
        name: string;
        issuer: string;
        issuedDate: Date;
        link: string;
    }>;
    educations?: Array<{
        id: string;
        institution: string;
        degree: string | null;
        startDate: Date | null;
        endDate: Date | null;
        bulletPoints?: string[];
    }>;
    socialLinks?: Array<{
        id: string;
        platform: string;
        url: string;
    }>;
    userProfile?: {
        showEmail: boolean;
        coverGradient: string | null;
        tagline: string | null;
        theme: string;
        profileViews: number;
        completionScore: number;
    } | null;
    _count?: {
        followers: number;
        following: number;
    };
    /* eslint-disable @typescript-eslint/no-explicit-any */
    [key: string]: any;
    /* eslint-enable @typescript-eslint/no-explicit-any */
}

export default function ProfilePage() {
    const router = useRouter();
    const { user: storeUser, isLoading: storeLoading, error: storeError, fetchUser } = useUserStore();
    const [activeTab, setActiveTab] = useState<ProfileTab>("at_a_glance");
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [skillsSheetOpen, setSkillsSheetOpen] = useState(false);

    // Load profile data
    const loadProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            await fetchUser();

            const profileResult = await getOwnProfile();
            if (!profileResult.success) {
                setError(profileResult.error || "Failed to load profile");
                return;
            }

            setProfileData(profileResult.user || null);

            if (profileResult.user?.id) {
                const statsResult = await getUserProfileStats(profileResult.user.id);
                if (statsResult.success && statsResult.stats) {
                    setStats(statsResult.stats);
                }
            }
        } catch (err) {
            console.error("Error loading profile:", err);
            setError("Failed to load profile data");
        } finally {
            setIsLoading(false);
        }
    }, [fetchUser]);

    // Silent refresh - no loading spinner, for post-edit profile updates (tagline, theme)
    const refreshProfileData = useCallback(async () => {
        try {
            const profileResult = await getOwnProfile();
            if (profileResult.success && profileResult.user) {
                setProfileData(profileResult.user);
                if (profileResult.user.id) {
                    const statsResult = await getUserProfileStats(profileResult.user.id);
                    if (statsResult.success && statsResult.stats) {
                        setStats(statsResult.stats);
                    }
                }
            }
        } catch (err) {
            console.error("Error refreshing profile:", err);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    // Handle skill endorsement
    const handleEndorseSkill = async (skillId: string) => {
        const result = await endorseSkill(skillId);
        if (result.success) {
            toast.success("Skill endorsed!");
            await loadProfile();
        } else {
            toast.error(result.error || "Failed to endorse skill");
        }
    };

    // Resume upload refreshes profile
    const handleUploadResume = () => loadProfile();

    // Merge store user into profile for instant updates when Edit Profile saves (no full refetch)
    const displayProfile = useMemo(() => {
        if (!profileData) return null;
        if (!storeUser) return profileData;
        return {
            ...profileData,
            name: storeUser.name ?? profileData.name,
            bio: storeUser.bio ?? profileData.bio,
            location: storeUser.location ?? profileData.location,
            company: storeUser.company ?? profileData.company,
            occupation: storeUser.occupation ?? profileData.occupation,
            website: storeUser.website ?? profileData.website,
            careerGoals: storeUser.careerGoals ?? profileData.careerGoals,
            targetCompanies: storeUser.targetCompanies ?? profileData.targetCompanies,
            expectedSalary: storeUser.expectedSalary ?? profileData.expectedSalary,
            noticePeriod: storeUser.noticePeriod ?? profileData.noticePeriod,
            workExperience: storeUser.workExperience ?? profileData.workExperience,
        };
    }, [profileData, storeUser]);

    // Loading state - only full-page loading on initial load (no profileData yet)
    if ((isLoading || storeLoading) && !profileData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <DotmSquare11 size={48} dotSize={6} speed={1.4} />
                    <p className="text-sm text-muted-foreground font-medium">Loading profile...</p>
                </motion.div>
            </div>
        );
    }

    // Error state
    if (error || storeError) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="max-w-md w-full shadow-lg">
                        <CardContent className="py-10 text-center">
                            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-destructive" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                            <p className="text-muted-foreground mb-6">
                                {error || storeError || "Failed to load profile"}
                            </p>
                            <Button onClick={() => window.location.reload()} className="gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    // No user data
    if (!profileData) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="max-w-md w-full shadow-lg">
                        <CardContent className="py-10 text-center">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <UserIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Sign in to view your profile</h2>
                            <p className="text-muted-foreground mb-6">
                                Create an account or sign in to access your developer profile.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Button variant="outline" onClick={() => router.push("/register")}>
                                    Create Account
                                </Button>
                                <Button onClick={() => router.push("/signin")}>
                                    Sign In
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    // Profile stats
    const profileStats = stats || {
        projectsCount: profileData?.portfolioProjects?.length || 0,
        skillsCount: profileData?.skills?.length || 0,
        followersCount: profileData?._count?.followers || 0,
        followingCount: profileData?._count?.following || 0,
        xp: profileData?.totalXp || profileData?.currentXp || 0,
        level: profileData?.currentLevel || 1,
        credits: profileData?.credits || 0,
        achievementsCount: profileData?.achievements?.length || 0,
    };

    // Render tab content
    const renderTabContent = () => {
        const commonProps = {
            user: displayProfile ?? profileData,
            isOwnProfile: true,
        };

        switch (activeTab) {
            case "at_a_glance":
                return (
                    <AtAGlanceTab
                        {...commonProps}
                        stats={profileStats}
                        onEditProfile={() => setEditModalOpen(true)}
                    />
                );
            case "projects":
                return (
                    <ProjectsTab
                        user={{
                            portfolioProjects: profileData?.portfolioProjects ?? [],
                            UserProjectV2Progress: profileData?.UserProjectV2Progress ?? [],
                        }}
                        isOwnProfile={true}
                        onProjectAdded={loadProfile}
                    />
                );
            case "skills":
                return (
                    <SkillsTab
                        {...commonProps}
                        currentUserId={(displayProfile ?? profileData)?.id}
                        onEndorseSkill={handleEndorseSkill}
                        onAddSkill={() => setSkillsSheetOpen(true)}
                    />
                );
            case "work_experience":
                return (
                    <WorkExperienceTab
                        {...commonProps}
                        onUploadResume={handleUploadResume}
                        onRefresh={loadProfile}
                    />
                );
            case "education":
                return (
                    <EducationTab
                        {...commonProps}
                        onRefresh={loadProfile}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <ProfileHeader
                user={displayProfile ?? profileData}
                stats={profileStats}
                isOwnProfile={true}
                onEditProfile={() => setEditModalOpen(true)}
                onShareProfile={() => setShareModalOpen(true)}
                onOpenSettings={() => router.push("/settings/account")}
            />
            <ProfileTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isOwnProfile={true}
            />
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                {renderTabContent()}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                    <aside className="w-full lg:w-80 flex-shrink-0">
                        <motion.div
                            className="sticky top-20"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <ProfileSidebar
                                user={displayProfile ?? profileData}
                                stats={profileStats}
                                isOwnProfile={true}
                            />
                        </motion.div>
                    </aside>
                </div>
            </div>
            <ShareProfileModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                username={(displayProfile ?? profileData)?.username || ""}
                name={(displayProfile ?? profileData)?.name}
                image={(displayProfile ?? profileData)?.image}
            />
            <EditProfileModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                user={displayProfile ?? profileData}
                onUpdate={refreshProfileData}
            />
            <AddSkillsSheet
                open={skillsSheetOpen}
                onOpenChange={setSkillsSheetOpen}
                onSuccess={loadProfile}
                existingSkills={profileData?.skills ?? []}
            />
        </div>
    );
}