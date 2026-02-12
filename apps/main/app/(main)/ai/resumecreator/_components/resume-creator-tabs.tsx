"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
    User, Briefcase, FolderKanban, Link2, GraduationCap, Award,
    ArrowLeft, Loader2, ExternalLink, Copy, Check
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@repo/ui/components/ui/tabs"
import toast from "@repo/ui/components/ui/sonner"
import { EditProfileModal } from "@/components/profile/modals/edit-profile-modal"
import { getOwnProfile } from "@/actions/(main)/user/profile.action"
import {
    addWorkExperience, updateWorkExperience, deleteWorkExperience,
    addPortfolioProject, updatePortfolioProject, deletePortfolioProject,
    addSocialLink, deleteSocialLink,
    addUserEducation, updateUserEducation, deleteUserEducation,
} from "@/actions/(main)/user/profile.action"
import { updateUserSkills, deleteSkill } from "@/actions/(main)/user/user.action"
import { ResumePublicView } from "@/components/resume/resume-public-view"
import { ExperienceTabForm } from "./experience-tab-form"
import { ProjectsTabForm } from "./projects-tab-form"
import { SocialsTabForm } from "./socials-tab-form"
import { EducationTabForm } from "./education-tab-form"
import { SkillsTabForm } from "./skills-tab-form"
import { useResumeCreatorStore } from "@/app/store/resumeCreatorStore"
import { normalizeToResumeProfile } from "@/types/resume"

type TabId = "basic" | "experience" | "projects" | "socials" | "education" | "skills"

export function ResumeCreatorTabs() {
    const [activeTab, setActiveTab] = useState<TabId>("experience")
    const [copied, setCopied] = useState(false)
    const [editProfileOpen, setEditProfileOpen] = useState(false)

    const {
        profile,
        resumeData,
        isLoading,
        error,
        loadFromProfile,
        setLoading,
        setError,
    } = useResumeCreatorStore()

    const loadProfile = async (showLoading = false) => {
        if (showLoading) setLoading(true)
        const res = await getOwnProfile()
        if (res.success && res.user) {
            const normalized = normalizeToResumeProfile(res.user)
            loadFromProfile(normalized)
        } else {
            setError(res.error ?? "Failed to load profile")
        }
        setLoading(false)
    }

    useEffect(() => {
        loadProfile(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: run once on mount
    }, [])

    if (isLoading && !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error && !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <p className="text-muted-foreground">{error}</p>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <p className="text-muted-foreground">Could not load profile</p>
            </div>
        )
    }

    const shareUrl = profile.username
        ? `${typeof window !== "undefined" ? window.location.origin : ""}/resume/${profile.username}`
        : null

    const copyShareUrl = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            toast.success("Link copied!")
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleFormSuccess = () => {
        loadProfile(false)
    }

    const editProfileUser = {
        id: profile.id,
        name: profile.name,
        username: profile.username,
        image: profile.image,
        bio: profile.bio ?? null,
        location: profile.location ?? null,
        company: profile.company ?? null,
        occupation: profile.occupation ?? null,
        website: profile.website ?? null,
        userProfile: profile.userProfile ?? undefined,
        careerGoals: profile.careerGoals,
        targetCompanies: profile.targetCompanies,
        expectedSalary: profile.expectedSalary,
        noticePeriod: profile.noticePeriod,
        workExperience: profile.workExperience,
        semester: profile.semester,
        university: profile.university,
    }

    return (
        <div className="w-full min-h-screen bg-background">
            <div className="w-full px-4 py-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/profile?tab=work_experience">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Resume Creator</h1>
                            <p className="text-sm text-muted-foreground">
                                Build your resume. Work experience, education, skills & socials sync to your profile.
                            </p>
                        </div>
                    </div>
                    {
                        shareUrl && (
                            <div className="flex items-center gap-2">
                                <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]">
                                    /resume/{profile.username}
                                </code>
                                <Button variant="outline" size="sm" onClick={copyShareUrl}>
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={shareUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        )
                    }
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-8">
                    <div className="min-w-0">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
                            <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
                                <TabsTrigger value="basic" className="gap-1.5 text-xs">
                                    <User className="w-3.5 h-3.5" />
                                    BASIC INFO
                                </TabsTrigger>
                                <TabsTrigger value="experience" className="gap-1.5 text-xs">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    EXPERIENCE
                                </TabsTrigger>
                                <TabsTrigger value="projects" className="gap-1.5 text-xs">
                                    <FolderKanban className="w-3.5 h-3.5" />
                                    PROJECTS
                                </TabsTrigger>
                                <TabsTrigger value="socials" className="gap-1.5 text-xs">
                                    <Link2 className="w-3.5 h-3.5" />
                                    SOCIALS
                                </TabsTrigger>
                                <TabsTrigger value="education" className="gap-1.5 text-xs">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    EDUCATION
                                </TabsTrigger>
                                <TabsTrigger value="skills" className="gap-1.5 text-xs">
                                    <Award className="w-3.5 h-3.5" />
                                    SKILLS
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="basic" className="mt-6">
                                <div className="rounded-xl border bg-card p-6 space-y-4">
                                    <h3 className="font-semibold">Basic Information</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Name, location, role, and about come from your profile. Edit them here.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => setEditProfileOpen(true)}
                                    >
                                        Edit in Profile
                                    </Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="experience" className="mt-6">
                                <ExperienceTabForm
                                    experiences={profile.experiences}
                                    onAdd={addWorkExperience}
                                    onUpdate={updateWorkExperience}
                                    onDelete={deleteWorkExperience}
                                    onSuccess={handleFormSuccess}
                                />
                            </TabsContent>
                            <TabsContent value="projects" className="mt-6">
                                <ProjectsTabForm
                                    projects={profile.portfolioProjects as Parameters<typeof ProjectsTabForm>[0]["projects"]}
                                    onAdd={addPortfolioProject}
                                    onUpdate={updatePortfolioProject}
                                    onDelete={deletePortfolioProject}
                                    onSuccess={handleFormSuccess}
                                />
                            </TabsContent>
                            <TabsContent value="socials" className="mt-6">
                                <SocialsTabForm
                                    socialLinks={profile.socialLinks}
                                    onAdd={addSocialLink}
                                    onDelete={deleteSocialLink}
                                    onSuccess={handleFormSuccess}
                                />
                            </TabsContent>
                            <TabsContent value="education" className="mt-6">
                                <EducationTabForm
                                    educations={profile.educations}
                                    onAdd={addUserEducation}
                                    onUpdate={updateUserEducation}
                                    onDelete={deleteUserEducation}
                                    onSuccess={handleFormSuccess}
                                />
                            </TabsContent>
                            <TabsContent value="skills" className="mt-6">
                                <SkillsTabForm
                                    skills={profile.skills}
                                    onUpdate={updateUserSkills}
                                    onDeleteSkill={async (id) => {
                                        await deleteSkill(id)
                                        await handleFormSuccess()
                                    }}
                                    onSuccess={handleFormSuccess}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    <EditProfileModal
                        isOpen={editProfileOpen}
                        onClose={() => setEditProfileOpen(false)}
                        user={editProfileUser}
                        onUpdate={() => loadProfile(false)}
                    />

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:sticky lg:top-24 h-fit"
                    >
                        <div className="rounded-xl border bg-card p-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                                Live Preview
                            </h3>
                            {resumeData && <ResumePublicView user={resumeData} embedded />}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}