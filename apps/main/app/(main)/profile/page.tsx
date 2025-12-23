"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/app/store/useUserStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertCircle, User as UserIcon, RefreshCw
} from "lucide-react";
import {
    ProfileHeader, ProfileTabs, ProfileSidebar, OverviewTab, ProjectsTab,
    ActivityTab, SkillsTab, ResumeTab, AboutTab, ShareProfileModal, EditProfileModal
} from "@/components/profile";
import type { ProfileTab } from "@/components/profile";
import { toast } from "sonner";
import {
    getOwnProfile, getUserProfileStats, endorseSkill, pinProject, unpinProject
} from "@/actions/(main)/user/profile.action";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoading: storeLoading, error: storeError, fetchUser } = useUserStore();
    const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
    const [profileData, setProfileData] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);

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

            setProfileData(profileResult.user);

            if (profileResult.user?.id) {
                const statsResult = await getUserProfileStats(profileResult.user.id);
                if (statsResult.success) {
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

    // Handle pin project
    const handlePinProject = async (projectId: string) => {
        const result = await pinProject(projectId);
        if (result.success) {
            toast.success("Project pinned to your profile!");
            await loadProfile();
        } else {
            toast.error(result.error || "Failed to pin project");
        }
    };

    // Handle unpin project
    const handleUnpinProject = async (projectId: string) => {
        const result = await unpinProject(projectId);
        if (result.success) {
            toast.success("Project unpinned from your profile!");
            await loadProfile();
        } else {
            toast.error(result.error || "Failed to unpin project");
        }
    };

    // Loading state
    if (isLoading || storeLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
                        <UserIcon className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                    </div>
                    <p className="mt-4 text-muted-foreground font-medium">Loading your profile...</p>
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
        projectsCount: profileData?.projects?.length || 0,
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
            user: profileData,
            isOwnProfile: true,
        };

        switch (activeTab) {
            case "overview":
                return (
                    <OverviewTab
                        {...commonProps}
                        stats={profileStats}
                        onPinProject={() => setActiveTab("projects")}
                    />
                );
            case "projects":
                return (
                    <ProjectsTab
                        {...commonProps}
                        onPinProject={handlePinProject}
                        onUnpinProject={handleUnpinProject}
                    />
                );
            case "activity":
                return <ActivityTab {...commonProps} />;
            case "skills":
                return (
                    <SkillsTab
                        {...commonProps}
                        currentUserId={profileData?.id}
                        onEndorseSkill={handleEndorseSkill}
                        onAddSkill={() => toast.info("Skill management coming soon!")}
                    />
                );
            case "resume":
                return (
                    <ResumeTab
                        {...commonProps}
                        onUploadResume={() => toast.info("Resume upload coming soon!")}
                    />
                );
            case "about":
                return (
                    <AboutTab
                        {...commonProps}
                        onEditProfile={() => setEditModalOpen(true)}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <ProfileHeader
                user={profileData}
                stats={profileStats}
                isOwnProfile={true}
                onEditProfile={() => setEditModalOpen(true)}
                onShareProfile={() => setShareModalOpen(true)}
                onOpenSettings={() => router.push("/profile/settings")}
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
                                user={profileData}
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
                username={profileData?.username || ""}
                name={profileData?.name}
                image={profileData?.image}
            />
            <EditProfileModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                user={profileData}
                onUpdate={loadProfile}
            />
        </div>
    );
}