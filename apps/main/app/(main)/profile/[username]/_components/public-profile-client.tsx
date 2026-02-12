"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ProfileHeader, ProfileTabs, ProfileSidebar, OverviewTab, SkillsTab,
    ProjectsTab, ResumeTab, AboutTab, ShareProfileModal,
    type ProfileTab
} from "@/components/profile";
import { trackProfileView } from "@/actions/(main)/user/profile.action";
import { toggleFollow } from "@/actions/(main)/community/follow.action";
import { useRouter } from "next/navigation";
import toast from "@repo/ui/components/ui/sonner";

interface PublicProfileClientProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any;
    isOwnProfile: boolean;
    isFollowing: boolean;
}

export function PublicProfileClient({
    user,
    isOwnProfile,
    isFollowing: initialIsFollowing,
}: PublicProfileClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    // Track profile view on mount
    useEffect(() => {
        if (!isOwnProfile && user.userProfile?.id) {
            trackProfileView(user.userProfile.id, null, "DIRECT");
        }
    }, [user.userProfile?.id, isOwnProfile]);

    const handleEditProfile = () => {
        router.push("/profile");
    };

    const handleShareProfile = () => {
        setShareModalOpen(true);
    };

    const handleFollow = async () => {
        if (isFollowLoading) return;

        setIsFollowLoading(true);
        try {
            const result = await toggleFollow(user.id);
            if (result.success) {
                setIsFollowing(result.following ?? !isFollowing);
                toast.success(result.following ? "Now following!" : "Unfollowed");
            } else {
                toast.error(result.error || "Failed to update follow status");
            }
        } catch (error) {
            console.log("Failed to update follow status: " + error);
            toast.error("Failed to update follow status");
        } finally {
            setIsFollowLoading(false);
        }
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    // Compute stats from user data
    const stats = {
        projectsCount: user.portfolioProjects?.length || 0,
        skillsCount: user.skills?.length || 0,
        followersCount: user._count?.followers || 0,
        followingCount: user._count?.following || 0,
        xp: user.totalXp || 0,
        level: user.currentLevel || 1,
        credits: user.credits || 0,
        achievementsCount: user.achievements?.length || 0,
    };

    const renderTabContent = () => {
        const tabContentProps = {
            user,
            isOwnProfile,
        };

        switch (activeTab) {
            case "overview":
                return <OverviewTab {...tabContentProps} stats={stats} />;
            case "projects":
                return (
                    <ProjectsTab
                        user={{
                            portfolioProjects: user.portfolioProjects || [],
                        }}
                        isOwnProfile={isOwnProfile}
                    />
                );
            case "skills":
                return (
                    <SkillsTab
                        {...tabContentProps}
                        onEndorseSkill={async (skillId) => {
                            toast.info("Endorsement feature coming soon for skillid: " + skillId);
                        }}
                        onAddSkill={
                            isOwnProfile
                                ? async () => {
                                    toast.info("Add skill feature coming soon!");
                                }
                                : undefined
                        }
                    />
                );
            case "resume":
                return (
                    <ResumeTab
                        {...tabContentProps}
                        onUploadResume={isOwnProfile ? () => router.push("/profile") : undefined}
                    />
                );
            case "about":
                return <AboutTab {...tabContentProps} />;
            default:
                return <OverviewTab {...tabContentProps} stats={stats} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Profile Header */}
            <ProfileHeader
                user={user}
                stats={stats}
                isOwnProfile={isOwnProfile}
                onEditProfile={handleEditProfile}
                onShareProfile={handleShareProfile}
                onOpenSettings={isOwnProfile ? () => router.push("/settings") : undefined}
                isFollowing={isFollowing}
                onFollowToggle={handleFollow}
            />

            {/* Profile Tabs */}
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} isOwnProfile={isOwnProfile} />

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Content Area */}
                    <motion.div
                        className="flex-1 order-2 lg:order-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                {...fadeInUp}
                                transition={{ duration: 0.3 }}
                            >
                                {renderTabContent()}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div
                        className="w-full lg:w-80 shrink-0 order-1 lg:order-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="lg:sticky lg:top-24">
                            <ProfileSidebar
                                user={user}
                                stats={stats}
                                isOwnProfile={isOwnProfile}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Share Profile Modal */}
            <ShareProfileModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                username={user.username}
                name={user.name}
                image={user.image}
            />
        </div>
    );
}