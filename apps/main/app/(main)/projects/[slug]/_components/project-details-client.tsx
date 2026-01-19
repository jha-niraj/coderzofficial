'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft, Sparkles, Clock, Code2, Brain, Trophy, CheckCircle2, Lock,
    Unlock, Play, Users, Target, Lightbulb, Layers, ListChecks, Share2,
    Coins, Copy, Check, Zap, GitFork, Settings
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@repo/ui/components/ui/card'
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from '@repo/ui/components/ui/tabs'
import { Progress } from '@repo/ui/components/ui/progress'
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
    SheetFooter
} from '@repo/ui/components/ui/sheet'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Textarea } from '@repo/ui/components/ui/textarea'
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@repo/ui/components/ui/tooltip'
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@repo/ui/components/ui/dialog'
import toast from '@repo/ui/components/ui/sonner'
import {
    startProject, submitProject, forkProject
} from '@/actions/(main)/projects/project.action'
import {
    ProjectDetailsClientProps, ProjectV2Page, ProjectV2Sprint
} from '@/types/project'

import { EnrollmentDialog } from './enrollment-dialog'

import DailyStandupSheet from './daily-standup-sheet'

import { cn } from '@repo/ui/lib/utils'
import BlueprintFlowchart from '@/components/projects/blueprintflowchart'

// New extracted components
import { ProjectAssistantButtons } from './project-assistant-buttons'
import { PageOverviewCard } from './page-overview-card'
import { SetupGuideTab } from './setup-guide-tab'
// Team Members components removed


import { ProjectSettingsTab, TeamMember, ProjectInvitation } from './project-settings-tab'

import {
    inviteToProject, cancelInvitation, removeMember, updateMemberRole,
    getProjectMembers, getProjectInvitations, updateProjectVisibility
} from '@/actions/(main)/projects/team-collaboration.action'


import { TaskItem } from '@/components/projects/task-list-progress'

function MilestoneTracker({ progressPercentage }: { progressPercentage: number, includeAssessment?: boolean }) {
    const milestones = [
        { threshold: 0, label: 'Start', icon: Play, unlocked: true },
        { threshold: 50, label: 'Quiz Available', icon: Brain, unlocked: progressPercentage >= 50 },
        { threshold: 75, label: 'Mock Interview', icon: Sparkles, unlocked: progressPercentage >= 75 },
        { threshold: 100, label: 'Complete', icon: Trophy, unlocked: progressPercentage >= 100 },
    ]

    return (
        <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Milestones</h3>
            <div className="relative">
                <div className="absolute top-5 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
                <div className="relative flex justify-between">
                    {
                        milestones.map((milestone, index) => {
                            const Icon = milestone.icon
                            return (
                                <TooltipProvider key={index}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex flex-col items-center">
                                                <div className={cn(
                                                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                                                    milestone.unlocked
                                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30'
                                                        : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-400'
                                                )}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className={cn(
                                                    'mt-2 text-xs font-medium',
                                                    milestone.unlocked ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400'
                                                )}>
                                                    {milestone.label}
                                                </span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {
                                                milestone.unlocked ? (
                                                    <p className="text-green-600">✓ Unlocked</p>
                                                ) : (
                                                    <p>Complete {milestone.threshold}% to unlock</p>
                                                )
                                            }
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// Quick Actions Component
// ============================================================================
function QuickActions({
    projectSlug,
    progressPercentage,
    includeAssessment,
    isPublic,
    hasStarted,
}: {
    projectSlug: string
    progressPercentage: number
    includeAssessment: boolean
    isPublic: boolean
    hasStarted: boolean
}) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href={hasStarted ? `/projects/${projectSlug}/sprints` : '#'}>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full h-auto py-4 flex-col gap-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all",
                        !hasStarted && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!hasStarted}
                >
                    <ListChecks className="w-5 h-5" />
                    <span className="text-xs">Sprints Board</span>
                </Button>
            </Link>

            {
                includeAssessment && (
                    <Link href={progressPercentage >= 50 ? `/projects/${projectSlug}/quiz` : '#'}>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full h-auto py-4 flex-col gap-1",
                                progressPercentage >= 50
                                    ? "hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300"
                                    : "opacity-50 cursor-not-allowed"
                            )}
                            disabled={progressPercentage < 50}
                        >
                            <Brain className={cn("w-5 h-5", progressPercentage >= 50 ? "text-purple-600" : "text-neutral-400")} />
                            <span className="text-xs">{progressPercentage >= 50 ? 'Quiz' : '50% to unlock'}</span>
                        </Button>
                    </Link>
                )
            }

            {
                includeAssessment && (
                    <Link href={progressPercentage >= 75 ? `/projects/${projectSlug}/mock` : '#'}>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full h-auto py-4 flex-col gap-1",
                                progressPercentage >= 75
                                    ? "hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300"
                                    : "opacity-50 cursor-not-allowed"
                            )}
                            disabled={progressPercentage < 75}
                        >
                            <Sparkles className={cn("w-5 h-5", progressPercentage >= 75 ? "text-amber-600" : "text-neutral-400")} />
                            <span className="text-xs">{progressPercentage >= 75 ? 'Mock AI' : '75% to unlock'}</span>
                        </Button>
                    </Link>
                )
            }

            {
                isPublic && (
                    <Link href={`/projects/${projectSlug}/leaderboard`}>
                        <Button variant="outline" className="w-full h-auto py-4 flex-col gap-1 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300">
                            <Trophy className="w-5 h-5 text-green-600" />
                            <span className="text-xs">Leaderboard</span>
                        </Button>
                    </Link>
                )
            }
        </div>
    )
}

// ============================================================================
// Main Component
// ============================================================================


export default function ProjectDetailsClient({
    project,
    currentUserId,
    userCredits = 0,
    currentUser
}: ProjectDetailsClientProps) {
    const router = useRouter()

    const userProgress = project.progress?.[0]
    const hasStarted = userProgress && userProgress.status !== 'NOT_STARTED'
    const progressPercentage = userProgress?.progressPercentage || 0
    const isCompleted = userProgress?.status === 'COMPLETED'
    const isCreator = currentUserId === project?.creator?.id
    const isPublic = project.visibility === 'PUBLIC'
    const [starting, setStarting] = useState(false)
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
    const [enrollDialogOpen, setEnrollDialogOpen] = useState(false)
    const [shareDialogOpen, setShareDialogOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submitForm, setSubmitForm] = useState({
        githubUrl: '',
        liveUrl: '',
        notes: ''
    })

    const [copied, setCopied] = useState(false)
    const [standupSheetOpen, setStandupSheetOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')
    const [forking, setForking] = useState(false)


    // Project Settings State & Handlers
    const [projectMembers, setProjectMembers] = useState<TeamMember[]>([])
    const [projectInvitations, setProjectInvitations] = useState<ProjectInvitation[]>([])
    const [isTeamMode, setIsTeamMode] = useState(false)
    const [, setIsSettingsLoading] = useState(false)

    // Fetch settings data when tab is active
    useEffect(() => {
        if (activeTab === 'settings' && isCreator) {
            const fetchSettings = async () => {
                setIsSettingsLoading(true)
                try {
                    const [membersRes, invitationsRes] = await Promise.all([
                        getProjectMembers(project.id),
                        getProjectInvitations(project.id)
                    ])

                    if (membersRes.success && membersRes.data) {
                        setProjectMembers(membersRes.data)
                        // Enable team mode if there are members other than creator
                        if (membersRes.data.length > 1) setIsTeamMode(true)
                    }

                    if (invitationsRes.success && invitationsRes.data) {
                        setProjectInvitations(invitationsRes.data)
                        // Enable team mode if there are pending invitations
                        if (invitationsRes.data.length > 0) setIsTeamMode(true)
                    }
                } catch (error) {
                    console.error('Failed to load settings:', error)
                    toast.error('Failed to load project settings')
                } finally {
                    setIsSettingsLoading(false)
                }
            }
            fetchSettings()
        }
    }, [activeTab, isCreator, project.id])

    const handleInviteMember = async (email: string) => {
        try {
            const result = await inviteToProject(project.id, email)
            if (result.success) {
                const res = await getProjectInvitations(project.id)
                if (res.success && res.data) setProjectInvitations(res.data)
                toast.success('Invitation sent')
            } else {
                toast.error(result.error || 'Failed to send invitation')
            }
        } catch {
            toast.error('An unexpected error occurred')
        }
    }

    const handleRemoveMember = async (memberId: string) => {
        try {
            const result = await removeMember(project.id, memberId)
            if (result.success) {
                const res = await getProjectMembers(project.id)
                if (res.success && res.data) setProjectMembers(res.data)
                toast.success('Member removed')
            } else {
                toast.error(result.error || 'Failed to remove member')
            }
        } catch {
            toast.error('Failed to remove member')
        }
    }

    const handleUpdateMemberRole = async (memberId: string, role: 'ADMIN' | 'MEMBER') => {
        try {
            const result = await updateMemberRole(memberId, role)
            if (result.success) {
                const res = await getProjectMembers(project.id)
                if (res.success && res.data) setProjectMembers(res.data)
                toast.success('Role updated')
            } else {
                toast.error(result.error || 'Failed to update role')
            }
        } catch {
            toast.error('Failed to update role')
        }
    }

    const handleCancelInvitation = async (invitationId: string) => {
        try {
            const result = await cancelInvitation(invitationId)
            if (result.success) {
                const res = await getProjectInvitations(project.id)
                if (res.success && res.data) setProjectInvitations(res.data)
                toast.success('Invitation canceled')
            } else {
                toast.error(result.error || 'Failed to cancel invitation')
            }
        } catch {
            toast.error('Failed to cancel invitation')
        }
    }

    const handleUpdateVisibility = async (visibility: 'PUBLIC' | 'PRIVATE') => {
        try {
            const result = await updateProjectVisibility(project.id, visibility)
            if (!result.success) {
                toast.error(result.error || 'Failed to update visibility')
            }
        } catch {
            toast.error('Failed to update project visibility')
        }
    }



    // Calculate total tasks from sprints (tasks are now nested in sprints)
    const totalTasks = useMemo(() => {
        if (!project.sprints) return 0
        return project.sprints.reduce((acc: number, sprint: ProjectV2Sprint) => {
            return acc + (sprint.tasks?.length || 0)
        }, 0)
    }, [project.sprints])

    // Transform tasks for components (tasks are now nested in sprints)
    const tasksWithStatus: TaskItem[] = useMemo(() => {
        if (!project.sprints || project.sprints.length === 0) return []

        // Access taskStatuses directly from userProgress
        const taskStatuses = userProgress?.taskStatuses || []

        // Flatten tasks from all sprints
        const allTasks: TaskItem[] = []
        let globalIndex = 0

        for (const sprint of project.sprints) {
            const sprintTasks = sprint.tasks || []
            for (const task of sprintTasks) {
                const statusEntry = taskStatuses.find((s) => s.taskId === task.id)
                allTasks.push({
                    id: task.id,
                    title: task.title,
                    description: task.description || [],
                    criteria: task.criteria || [],
                    hints: task.hints || [],
                    badges: task.badges || [],
                    tags: task.tags || [],
                    difficulty: task.difficulty as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
                    terminalCommand: task.terminalCommand || null,
                    status: (statusEntry?.status || 'TO_DO') as 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED',
                    completedAt: statusEntry?.completedAt || null,
                    notes: statusEntry?.notes || null,
                    orderIndex: task.orderIndex ?? globalIndex,
                    // Add sprint info
                    sprintId: sprint.id,
                    sprintName: sprint.name,
                    sprintNumber: sprint.sprintNumber,
                    category: task.category,
                    estimatedTime: task.estimatedTime,
                    checkpoints: task.checkpoints || [],
                    relatedPages: task.relatedPages || [],
                    dependencies: task.dependencies || [],
                })
                globalIndex++
            }
        }

        return allTasks
    }, [project.sprints, userProgress])



    const handleStartProject = async () => {
        try {
            setStarting(true)
            const result = await startProject(project.id)

            if (result.success) {
                toast.success('Project started! Let\'s build something amazing! 🚀')
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to start project')
            }
        } catch (error) {
            console.log("Error occurred while starting project: " + error);
            toast.error('Something went wrong')
        } finally {
            setStarting(false)
        }
    }

    const handleSubmitProject = async () => {
        if (!submitForm.githubUrl) {
            toast.error('GitHub URL is required')
            return
        }

        try {
            setSubmitting(true)
            const result = await submitProject(project.id, {
                githubUrl: submitForm.githubUrl,
                liveUrl: submitForm.liveUrl || undefined,
                notes: submitForm.notes || undefined,
            })

            if (result.success) {
                toast.success('🎉 Project submitted successfully!')
                setSubmitDialogOpen(false)
                setSubmitForm({ githubUrl: '', liveUrl: '', notes: '' })
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to submit project')
            }
        } catch (error) {
            console.log("Error occurred while submitting project: " + error);
            toast.error('Failed to submit project')
        } finally {
            setSubmitting(false)
        }
    }

    const getShareableLink = () => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        const username = currentUser?.username || 'user'
        return `${baseUrl}/projects/${project.slug}/leaderboard?username=${username}&showProgress=true`
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(getShareableLink())
            setCopied(true)
            toast.success('Link copied to clipboard!')
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.log("Error occurred while copying link: " + error);
            toast.error('Failed to copy link')
        }
    }

    const handleForkProject = async () => {
        try {
            setForking(true)
            const result = await forkProject(project.id)

            if (result.success) {
                toast.success(`Project forked successfully! Redirecting to your copy...`)
                router.push(`/projects/${result.data.projectSlug}`)
            } else {
                toast.error(result.error || 'Failed to fork project')
            }
        } catch (error) {
            console.log("Error occurred while forking project: " + error);
            toast.error('Something went wrong while forking')
        } finally {
            setForking(false)
        }
    }

    const difficultyColors = {
        BEGINNER: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        INTERMEDIATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        ADVANCED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    }





    return (
        <div className="relative min-h-screen w-full bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900">
            <div className="w-full py-6 px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-full backdrop-blur-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Projects
                    </Link>
                </motion.div>

                {/* Header Actions including Assistant */}
                <div className="absolute top-6 right-6 flex items-center gap-2">
                    <ProjectAssistantButtons
                        projectId={project.id}
                        projectSlug={project.slug}
                        isCreator={isCreator}
                        isEnrolled={hasStarted || isCreator}
                        currentUserId={currentUserId}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4 flex-wrap">
                                <Badge className={`${difficultyColors[project.difficulty as keyof typeof difficultyColors]} px-3 py-1`}>
                                    {project.difficulty}
                                </Badge>
                                <Badge variant="outline" className="px-3 py-1">
                                    {project.generationType.replace('_', ' ')}
                                </Badge>
                                {
                                    isPublic ? (
                                        <Badge variant="outline" className="px-3 py-1 border-green-300 text-green-700 dark:border-green-700 dark:text-green-400">
                                            <Unlock className="w-3 h-3 mr-1" />
                                            Public
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="px-3 py-1">
                                            <Lock className="w-3 h-3 mr-1" />
                                            Private
                                        </Badge>
                                    )
                                }
                                {
                                    hasStarted && (
                                        <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                            <Zap className="w-3 h-3 mr-1" />
                                            In Progress
                                        </Badge>
                                    )
                                }
                            </div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 dark:from-neutral-50 dark:via-neutral-200 dark:to-neutral-400 mb-4">
                                {project.title}
                            </h1>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mb-6">
                                {project.shortDescription || project.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{project.estimatedHours} hours</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ListChecks className="w-4 h-4" />
                                    <span>{totalTasks} tasks</span>
                                </div>
                                {
                                    isPublic && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                <span>{project.totalStarted} started</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Trophy className="w-4 h-4" />
                                                <span>{project.totalSubmissions} completed</span>
                                            </div>
                                        </>
                                    )
                                }
                            </div>
                        </div>
                        <div className="lg:w-80 flex-shrink-0">
                            <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200 dark:border-neutral-800 shadow-xl">
                                <CardContent className="p-6 space-y-4">
                                    {
                                        hasStarted ? (
                                            <>
                                                <div>
                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                        <span className="text-neutral-600 dark:text-neutral-400">Progress</span>
                                                        <span className="font-bold text-neutral-900 dark:text-white">
                                                            {Math.round(progressPercentage)}%
                                                        </span>
                                                    </div>
                                                    <Progress value={progressPercentage} className="h-3" />
                                                    <p className="text-xs text-neutral-500 mt-1">
                                                        {userProgress?.tasksCompleted || 0} of {userProgress?.totalTasks || totalTasks} tasks
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={() => router.push(`/projects/${project.slug}/sprints`)}
                                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
                                                    size="lg"
                                                >
                                                    <Play className="w-4 h-4 mr-2" />
                                                    {isCompleted ? 'Review Tasks' : 'Continue Building'}
                                                </Button>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => setStandupSheetOpen(true)}
                                                    >
                                                        <Target className="w-4 h-4 mr-1" />
                                                        Standup
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => setShareDialogOpen(true)}
                                                    >
                                                        <Share2 className="w-4 h-4 mr-1" />
                                                        Share
                                                    </Button>
                                                </div>

                                                {
                                                    progressPercentage >= 90 && (
                                                        <Button
                                                            onClick={() => setSubmitDialogOpen(true)}
                                                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                                        >
                                                            <Trophy className="w-4 h-4 mr-2" />
                                                            Submit Project
                                                        </Button>
                                                    )
                                                }
                                            </>
                                        ) : isCreator ? (
                                            <>
                                                <div className="text-center py-2">
                                                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">Your Project</h3>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        Start building to track progress
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={handleStartProject}
                                                    disabled={starting}
                                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
                                                    size="lg"
                                                >
                                                    {
                                                        starting ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                                                Starting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Play className="w-4 h-4 mr-2" />
                                                                Start Building
                                                            </>
                                                        )
                                                    }
                                                </Button>
                                            </>
                                        ) : isPublic ? (
                                            <>
                                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Enrollment</span>
                                                        <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400">
                                                            <Coins className="w-3 h-3 mr-1" />
                                                            13 Credits
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                        Your balance: {userCredits} credits
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={() => setEnrollDialogOpen(true)}
                                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
                                                    size="lg"
                                                >
                                                    <Coins className="w-4 h-4 mr-2" />
                                                    Enroll Now
                                                </Button>
                                                <p className="text-xs text-center text-neutral-500">
                                                    50% discount for public projects!
                                                </p>

                                                <div className="relative my-4">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                                                    </div>
                                                    <div className="relative flex justify-center text-xs uppercase">
                                                        <span className="bg-white dark:bg-neutral-900 px-2 text-neutral-500">or</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={handleForkProject}
                                                    disabled={forking}
                                                    variant="outline"
                                                    className="w-full border-neutral-200 dark:border-neutral-700"
                                                    size="lg"
                                                >
                                                    {
                                                        forking ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                                                Forking...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <GitFork className="w-4 h-4 mr-2" />
                                                                Fork This Project (Free)
                                                            </>
                                                        )
                                                    }
                                                </Button>
                                                <p className="text-xs text-center text-neutral-500">
                                                    Get your own copy with all {totalTasks} tasks
                                                </p>
                                            </>
                                        ) : null

                                    }
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </motion.div>
                {
                    hasStarted && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-8"
                        >
                            <BlueprintFlowchart
                                tasks={tasksWithStatus.map(t => ({
                                    id: t.id,
                                    title: t.title,
                                    description: t.description,
                                    difficulty: t.difficulty,
                                    tags: t.tags,
                                    status: t.status,
                                    orderIndex: t.orderIndex,
                                }))}
                                projectTitle={project.title}
                                progressPercentage={progressPercentage}
                                onTaskClick={() => {
                                    setActiveTab('tasks')
                                }}
                            />
                        </motion.div>
                    )
                }
                {
                    hasStarted && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mb-8 space-y-4"
                        >
                            <MilestoneTracker
                                progressPercentage={progressPercentage}
                                includeAssessment={project.includeAssessment}
                            />
                            <QuickActions
                                projectSlug={project.slug}
                                progressPercentage={progressPercentage}
                                includeAssessment={project.includeAssessment}
                                isPublic={isPublic}
                                hasStarted={hasStarted}
                            />
                        </motion.div>
                    )
                }

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full lg:w-auto bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl p-1 border border-neutral-200 dark:border-neutral-800 shadow-sm flex-wrap">
                            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-neutral-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="pages">
                                Pages ({project.pages.length})
                            </TabsTrigger>
                            <TabsTrigger value="setup">
                                Setup Guide
                            </TabsTrigger>
                            {
                                isCreator && (
                                    <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-neutral-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
                                        <Settings className="w-4 h-4 mr-1" />
                                        Settings
                                    </TabsTrigger>
                                )
                            }
                        </TabsList>
                        <TabsContent value="overview" className="mt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <CardHeader>
                                        <CardTitle className='text-left text-xl'>Project Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-left text-neutral-700 dark:text-neutral-300 leading-relaxed text-lg">
                                            {project.blueprintOverview}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <Layers className="w-5 h-5 text-indigo-500" />
                                            Technology Stack
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            {
                                                project.stacks?.frontend && (
                                                    <div className="flex gap-4 items-center">
                                                        <p className="text-left text-sm font-medium text-neutral-500 dark:text-neutral-400 w-20">Frontend</p>
                                                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">{project.stacks.frontend}</Badge>
                                                    </div>
                                                )
                                            }
                                            {
                                                project.stacks?.backend && (
                                                    <div className="flex gap-4 items-center">
                                                        <p className="text-left text-sm font-medium text-neutral-500 dark:text-neutral-400 w-20">Backend</p>
                                                        <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">{project.stacks.backend}</Badge>
                                                    </div>
                                                )
                                            }
                                            {
                                                project.stacks?.database && (
                                                    <div className="flex gap-4 items-center">
                                                        <p className="text-left text-sm font-medium text-neutral-500 dark:text-neutral-400 w-20">Database</p>
                                                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{project.stacks.database}</Badge>
                                                    </div>
                                                )
                                            }
                                            {
                                                project.stacks?.deployment && (
                                                    <div className="flex gap-4 items-center">
                                                        <p className="text-left text-sm font-medium text-neutral-500 dark:text-neutral-400 w-20">Deployment</p>
                                                        <Badge variant="secondary" className="bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">{project.stacks.deployment}</Badge>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <Target className="w-5 h-5 text-green-500" />
                                            Key Outcomes
                                        </CardTitle>
                                        <CardDescription>What you&apos;ll build in this project</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                            {
                                                (project.keyOutcomes || []).map((outcome: string, index: number) => (
                                                    <li key={index} className="flex items-start gap-3 p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                                                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                        <span className="text-left text-neutral-700 dark:text-neutral-300 text-sm">{outcome}</span>
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    </CardContent>
                                </Card>
                                {
                                    project.vision && (
                                        <Card className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-xl">
                                                    <Lightbulb className="w-5 h-5 text-amber-500" />
                                                    Vision & Purpose
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <p className="text-left text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                                                    &quot;{project.vision}&quot;
                                                </p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                    {project.targetAudience && (
                                                        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg">
                                                            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-wider">Target Audience</p>
                                                            <p className="text-sm text-neutral-700 dark:text-neutral-300">{project.targetAudience}</p>
                                                        </div>
                                                    )}
                                                    {project.problemSolution && (
                                                        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg">
                                                            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-wider">Problem Solved</p>
                                                            <p className="text-sm text-neutral-700 dark:text-neutral-300">{project.problemSolution}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                }
                                {
                                    project.features && project.features.length > 0 && (
                                        <Card className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 border-neutral-200 dark:border-neutral-800 lg:col-span-2 shadow-sm hover:shadow-md transition-shadow duration-300">
                                            <CardHeader>
                                                <CardTitle className="text-left flex items-center gap-2 text-xl">
                                                    <Code2 className="w-5 h-5 text-blue-500" />
                                                    Features
                                                </CardTitle>
                                                <CardDescription className="text-left">Main features you&apos;ll implement</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {
                                                        project.features.map((feature, index: number) => (
                                                            <div key={index} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 hover:bg-white dark:hover:bg-neutral-900 transition-colors">
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <h4 className="font-medium text-neutral-900 dark:text-white text-sm">{feature.name}</h4>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={cn(
                                                                            "text-[10px] uppercase",
                                                                            feature.priority === 'must-have' && "border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400",
                                                                            feature.priority === 'should-have' && "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:border-amber-900 dark:text-amber-400",
                                                                            feature.priority === 'nice-to-have' && "border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400"
                                                                        )}
                                                                    >
                                                                        {feature.priority?.replace('-', ' ')}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">{feature.description}</p>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className={cn(
                                                                        "text-[10px]",
                                                                        feature.complexity === 'low' && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                                                                        feature.complexity === 'medium' && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                                                                        feature.complexity === 'high' && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                                                    )}
                                                                >
                                                                    {feature.complexity} complexity
                                                                </Badge>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                }
                            </div>
                        </TabsContent>

                        <TabsContent value="pages" className="mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {
                                    project.pages.map((page: ProjectV2Page) => (
                                        <PageOverviewCard
                                            key={page.id}
                                            page={page}
                                            difficultyColors={difficultyColors}
                                        />
                                    ))
                                }
                            </div>
                        </TabsContent>
                        <TabsContent value="setup" className="mt-6">
                            <SetupGuideTab
                                setupGuide={project.setupGuide ? {
                                    prerequisites: project.setupGuide.prerequisites || [],
                                    environmentVariables: project.setupGuide.environmentVariables || [],
                                    installationSteps: project.setupGuide.installationSteps || [],
                                    verificationSteps: project.setupGuide.verificationSteps || []
                                } : null}
                            />
                        </TabsContent>
                        {
                            isCreator && (
                                <TabsContent value="settings" className="mt-6">
                                    <ProjectSettingsTab
                                        projectId={project.id}
                                        projectTitle={project.title}
                                        isCreator={isCreator}
                                        visibility={project.visibility as 'PUBLIC' | 'PRIVATE'}
                                        members={projectMembers}
                                        pendingInvitations={projectInvitations}
                                        isTeamProject={isTeamMode}
                                        onInviteMember={handleInviteMember}
                                        onRemoveMember={handleRemoveMember}
                                        onUpdateMemberRole={handleUpdateMemberRole}
                                        onCancelInvitation={handleCancelInvitation}
                                        onUpdateVisibility={handleUpdateVisibility}
                                        onToggleTeamMode={async (enabled) => setIsTeamMode(enabled)}
                                    />
                                </TabsContent>
                            )
                        }
                    </Tabs>
                </motion.div>
            </div >
            <EnrollmentDialog
                open={enrollDialogOpen}
                onOpenChange={setEnrollDialogOpen}
                projectId={project.id}
                projectTitle={project.title}
                projectSlug={project.slug}
                tasksCount={totalTasks}
                userCredits={userCredits}
            />
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Share Your Progress</DialogTitle>
                        <DialogDescription>
                            Share your project progress with others
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Shareable Link</Label>
                            <div className="flex gap-2">
                                <Input value={getShareableLink()} readOnly className="flex-1" />
                                <Button size="icon" variant="outline" onClick={handleCopyLink}>
                                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <Sheet open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
                <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Submit Your Project</SheetTitle>
                        <SheetDescription>
                            Share your completed project for review
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="githubUrl">GitHub Repository URL *</Label>
                            <Input
                                id="githubUrl"
                                placeholder="https://github.com/username/repo"
                                value={submitForm.githubUrl}
                                onChange={(e) => setSubmitForm({ ...submitForm, githubUrl: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="liveUrl">Live Demo URL (Optional)</Label>
                            <Input
                                id="liveUrl"
                                placeholder="https://your-project.vercel.app"
                                value={submitForm.liveUrl}
                                onChange={(e) => setSubmitForm({ ...submitForm, liveUrl: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Additional Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Share any challenges, learnings, or additional features..."
                                value={submitForm.notes}
                                onChange={(e) => setSubmitForm({ ...submitForm, notes: e.target.value })}
                                rows={4}
                            />
                        </div>
                    </div>
                    <SheetFooter>
                        <Button
                            onClick={handleSubmitProject}
                            disabled={submitting || !submitForm.githubUrl}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                        >
                            {
                                submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Trophy className="w-4 h-4 mr-2" />
                                        Submit Project
                                    </>
                                )
                            }
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            <DailyStandupSheet
                isOpen={standupSheetOpen}
                onClose={() => setStandupSheetOpen(false)}
                projectId={project.id}
                projectSlug={project.slug}
                projectTitle={project.title}
                userCredits={userCredits}
                hasStarted={!!hasStarted}
            />
        </div >
    )
}