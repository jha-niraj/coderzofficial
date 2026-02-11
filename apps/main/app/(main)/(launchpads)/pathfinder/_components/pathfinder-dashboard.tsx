'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Progress } from '@repo/ui/components/ui/progress'
import {
    Target, Plus, CheckCircle2, Trophy,
    Flame, FolderOpen, MoreVertical, MoveRight, BookOpen, 
    Code2, Brain, Mic
} from 'lucide-react'
import Link from 'next/link'
import { 
    PathfinderStatus, PathfinderCategory, PathfinderLevel 
} from '@repo/prisma/client'
import { CreateGoalSheet } from './create-goal-sheet'
import { CreateGroupSheet } from './create-group-sheet'
import { AssignGoalSheet } from './assign-goal-sheet'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@repo/ui/components/ui/dropdown-menu'
import {
    Collapsible, CollapsibleContent, CollapsibleTrigger
} from '@repo/ui/components/ui/collapsible'
import { cn } from '@repo/ui/lib/utils'

interface Goal {
    id: string
    title: string
    category: PathfinderCategory
    level: PathfinderLevel
    focusAreas: string[]
    status: PathfinderStatus
    progressPercent: number
    totalSubGoals: number
    completedSubGoals: number
    totalQuizAnswered: number
    totalCodingSolved: number
    streakDays: number
    lastActivityAt: Date | null
    estimatedDays: number | null
    overview: string | null
    createdAt: Date
    completedAt: Date | null
    groupId: string | null
    studioId: string | null
}

interface Group {
    id: string
    name: string
    emoji: string | null
    color: string | null
    _count: { goals: number }
}

interface PathfinderDashboardProps {
    initialGoals: Goal[]
    initialGroups: Group[]
}

const categoryConfig: Record<PathfinderCategory, { emoji: string; color: string }> = {
    DSA: { emoji: '🧮', color: 'from-blue-500 to-indigo-500' },
    WEB_DEVELOPMENT: { emoji: '🌐', color: 'from-green-500 to-emerald-500' },
    FRONTEND: { emoji: '🎨', color: 'from-pink-500 to-rose-500' },
    BACKEND: { emoji: '⚙️', color: 'from-orange-500 to-red-500' },
    DEVOPS: { emoji: '🚀', color: 'from-purple-500 to-violet-500' },
    AI_ML: { emoji: '🤖', color: 'from-cyan-500 to-blue-500' },
    DATABASE: { emoji: '🗄️', color: 'from-yellow-500 to-orange-500' },
    SYSTEM_DESIGN: { emoji: '🏗️', color: 'from-slate-500 to-gray-500' },
    MOBILE: { emoji: '📱', color: 'from-teal-500 to-green-500' },
    OTHER: { emoji: '📚', color: 'from-neutral-500 to-stone-500' },
}

const statusConfig: Record<PathfinderStatus, { label: string; color: string; bgColor: string }> = {
    ACTIVE: { label: 'Active', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    VERIFICATION: { label: 'Verifying', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    COMPLETED: { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    FAILED: { label: 'Retry', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
    ABANDONED: { label: 'Paused', color: 'text-neutral-600', bgColor: 'bg-neutral-100 dark:bg-neutral-900/30' },
}

// ================================================================================
// GOAL CARD COMPONENT
// ================================================================================

function GoalCard({ goal, onAssign }: { goal: Goal; onAssign: () => void }) {
    const category = categoryConfig[goal.category]
    const status = statusConfig[goal.status]

    const progressPercent = goal.totalSubGoals > 0
        ? Math.round((goal.completedSubGoals / goal.totalSubGoals) * 100)
        : 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative"
        >
            <Link href={`/pathfinder/${goal.id}`}>
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-sm transition-all cursor-pointer bg-white dark:bg-neutral-950">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-lg shadow-sm flex-shrink-0`}>
                            {category.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-neutral-900 dark:text-white text-sm truncate pr-6">
                                {goal.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 h-4", status.bgColor, status.color)}>
                                    {status.label}
                                </Badge>
                                <span className="text-[10px] text-neutral-400 capitalize">
                                    {goal.level.toLowerCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-[11px] text-neutral-500 mb-3">
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{goal.completedSubGoals}/{goal.totalSubGoals} tasks</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Brain className="w-3 h-3" />
                            <span>{goal.totalQuizAnswered} quiz</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Code2 className="w-3 h-3" />
                            <span>{goal.totalCodingSolved} code</span>
                        </div>
                        {goal.streakDays > 0 && (
                            <div className="flex items-center gap-1 text-orange-500">
                                <Flame className="w-3 h-3" />
                                <span>{goal.streakDays}d streak</span>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                            <span>Progress</span>
                            <span>{progressPercent}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-1" />
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                        <Link href={`/pathfinder/${goal.id}/practice`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                            <Button variant="secondary" size="sm" className="w-full text-xs h-7">
                                <BookOpen className="w-3 h-3 mr-1" />
                                Daily Practice
                            </Button>
                        </Link>
                        {goal.studioId && (
                            <Link href={`/studio/${goal.studioId}`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                                <Button variant="outline" size="sm" className="w-full text-xs h-7">
                                    <Code2 className="w-3 h-3 mr-1" />
                                    Studio
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </Link>

            {/* Menu Button */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.preventDefault(); onAssign(); }}>
                            <MoveRight className="w-3 h-3 mr-2" />
                            Move to Group
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.div>
    )
}

// ================================================================================
// GROUP SECTION COMPONENT
// ================================================================================

function GroupSection({
    group,
    goals,
    onAssignGoal,
}: {
    group: Group
    goals: Goal[]
    onAssignGoal: (goalId: string) => void
}) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
            <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                <div
                    className="w-6 h-6 rounded flex items-center justify-center text-sm"
                    style={{ backgroundColor: group.color || '#7c3aed' }}
                >
                    {group.emoji || '📁'}
                </div>
                <span className="font-medium text-sm text-neutral-900 dark:text-white flex-1 text-left">
                    {group.name}
                </span>
                <Badge variant="secondary" className="text-[10px]">
                    {goals.length}
                </Badge>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 pl-2 space-y-2">
                {goals.map((goal) => (
                    <GoalCard
                        key={goal.id}
                        goal={goal}
                        onAssign={() => onAssignGoal(goal.id)}
                    />
                ))}
                {goals.length === 0 && (
                    <p className="text-xs text-neutral-400 py-4 text-center">
                        No goals in this group yet
                    </p>
                )}
            </CollapsibleContent>
        </Collapsible>
    )
}

// ================================================================================
// QUICK STATS
// ================================================================================

function QuickStats({ goals }: { goals: Goal[] }) {
    const totalTasks = goals.reduce((sum, g) => sum + g.totalSubGoals, 0)
    const completedTasks = goals.reduce((sum, g) => sum + g.completedSubGoals, 0)
    const totalQuiz = goals.reduce((sum, g) => sum + g.totalQuizAnswered, 0)
    const totalCoding = goals.reduce((sum, g) => sum + g.totalCodingSolved, 0)

    return (
        <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-center">
                <div className="text-lg font-bold text-blue-600">{goals.length}</div>
                <div className="text-[10px] text-blue-600/70">Goals</div>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 text-center">
                <div className="text-lg font-bold text-green-600">{completedTasks}/{totalTasks}</div>
                <div className="text-[10px] text-green-600/70">Tasks</div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-center">
                <div className="text-lg font-bold text-purple-600">{totalQuiz}</div>
                <div className="text-[10px] text-purple-600/70">Quiz Ans</div>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-center">
                <div className="text-lg font-bold text-orange-600">{totalCoding}</div>
                <div className="text-[10px] text-orange-600/70">Code Done</div>
            </div>
        </div>
    )
}

// ================================================================================
// EMPTY STATE
// ================================================================================

function EmptyState({ onCreateGoal }: { onCreateGoal: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center px-4"
        >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl mb-4">
                <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                Start Your Learning Journey
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs mb-4">
                Create your first learning goal and track your daily progress with AI-powered quizzes.
            </p>
            <Button onClick={onCreateGoal} className="bg-gradient-to-r from-violet-600 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
            </Button>
        </motion.div>
    )
}

// ================================================================================
// WELCOME SECTION
// ================================================================================

function WelcomeSection() {
    const features = [
        { icon: <Target className="w-5 h-5" />, title: 'Set Goals', desc: 'Define what you want to learn' },
        { icon: <BookOpen className="w-5 h-5" />, title: 'Daily Tasks', desc: 'Add tasks & practice daily' },
        { icon: <Brain className="w-5 h-5" />, title: 'AI Quizzes', desc: 'Test yourself on each task' },
        { icon: <Code2 className="w-5 h-5" />, title: 'Code Challenges', desc: 'Practice with real problems' },
        { icon: <Mic className="w-5 h-5" />, title: 'Mock Interview', desc: 'AI-powered interviews' },
        { icon: <Trophy className="w-5 h-5" />, title: 'Verification', desc: 'Prove your skills' },
    ]

    return (
        <div className="p-6">
            {/* Hero */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-xl mb-4">
                    <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    Pathfinder
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                    Your personalized learning companion. Create goals, add daily tasks, and let AI generate quizzes and coding challenges.
                </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {features.map((f, i) => (
                    <motion.div
                        key={f.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-600">
                                {f.icon}
                            </div>
                            <span className="font-medium text-sm text-neutral-900 dark:text-white">
                                {f.title}
                            </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 pl-8">{f.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Categories */}
            <div className="mt-8">
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                    Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(categoryConfig).map(([key, config]) => (
                        <div
                            key={key}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800"
                        >
                            <span>{config.emoji}</span>
                            <span className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">
                                {key.toLowerCase().replace('_', ' ')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ================================================================================
// MAIN DASHBOARD
// ================================================================================

export function PathfinderDashboard({ initialGoals, initialGroups }: PathfinderDashboardProps) {
    const [goals] = useState(initialGoals)
    const [groups] = useState(initialGroups)
    const [createSheetOpen, setCreateSheetOpen] = useState(false)
    const [createGroupSheetOpen, setCreateGroupSheetOpen] = useState(false)
    const [assignSheetOpen, setAssignSheetOpen] = useState(false)
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)

    // Separate goals by group
    const ungroupedGoals = goals.filter(g => !g.groupId)
    const groupedGoals = groups.map(group => ({
        group,
        goals: goals.filter(g => g.groupId === group.id),
    }))

    const handleGoalCreated = (goalId: string) => {
        setCreateSheetOpen(false)
        window.location.href = `/pathfinder/${goalId}`
    }

    const handleAssignGoal = (goalId: string) => {
        setSelectedGoalId(goalId)
        setAssignSheetOpen(true)
    }

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Left Side - Goals List */}
            <div className="w-full md:w-[420px] lg:w-[480px] border-r border-neutral-200 dark:border-neutral-800 flex flex-col bg-neutral-50/50 dark:bg-neutral-950">
                {/* Header */}
                <div className="flex-shrink-0 p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                                <Target className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="text-base font-bold text-neutral-900 dark:text-white">Pathfinder</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCreateGroupSheetOpen(true)}
                                className="h-8 text-xs"
                            >
                                <FolderOpen className="w-3 h-3 mr-1" />
                                Group
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setCreateSheetOpen(true)}
                                className="h-8 text-xs bg-gradient-to-r from-violet-600 to-purple-600"
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                Goal
                            </Button>
                        </div>
                    </div>

                    {goals.length > 0 && <QuickStats goals={goals} />}
                </div>

                {/* Goals List */}
                <ScrollArea className="flex-1">
                    <div className="p-4">
                        <AnimatePresence mode="wait">
                            {goals.length === 0 ? (
                                <EmptyState onCreateGoal={() => setCreateSheetOpen(true)} />
                            ) : (
                                <>
                                    {/* Grouped Goals */}
                                    {groupedGoals.map(({ group, goals: groupGoals }) => (
                                        <GroupSection
                                            key={group.id}
                                            group={group}
                                            goals={groupGoals}
                                            onAssignGoal={handleAssignGoal}
                                        />
                                    ))}

                                    {/* Ungrouped Goals */}
                                    {ungroupedGoals.length > 0 && (
                                        <div className="mb-4">
                                            {groups.length > 0 && (
                                                <div className="flex items-center gap-2 p-2 mb-2">
                                                    <span className="text-xs font-medium text-neutral-500">
                                                        Ungrouped ({ungroupedGoals.length})
                                                    </span>
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                {ungroupedGoals.map((goal) => (
                                                    <GoalCard
                                                        key={goal.id}
                                                        goal={goal}
                                                        onAssign={() => handleAssignGoal(goal.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </div>

            {/* Right Side - Welcome */}
            <div className="hidden md:flex flex-1 flex-col overflow-hidden">
                <ScrollArea className="flex-1">
                    <WelcomeSection />
                </ScrollArea>
            </div>

            {/* Sheets */}
            <CreateGoalSheet
                open={createSheetOpen}
                onOpenChange={setCreateSheetOpen}
                onSuccess={handleGoalCreated}
                groups={groups}
            />
            <CreateGroupSheet
                open={createGroupSheetOpen}
                onOpenChange={setCreateGroupSheetOpen}
            />
            <AssignGoalSheet
                open={assignSheetOpen}
                onOpenChange={setAssignSheetOpen}
                goalId={selectedGoalId}
                groups={groups}
            />
        </div>
    )
}
