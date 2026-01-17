'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronDown, ChevronRight, Clock, CheckCircle2, Circle, Lightbulb,
    Target, Code2, Link2, ArrowLeft, ArrowRight, Copy, Check, Terminal
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Card, CardContent, CardHeader, CardTitle
} from '@repo/ui/components/ui/card'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter
} from '@repo/ui/components/ui/sheet'
import {
    Collapsible, CollapsibleContent, CollapsibleTrigger
} from '@repo/ui/components/ui/collapsible'
import { Progress } from '@repo/ui/components/ui/progress'
import { cn } from '@repo/ui/lib/utils'

// ============================================================================
// Types
// ============================================================================

export interface SprintData {
    id: string
    sprintNumber: number
    name: string
    goal: string
    duration: string
    orderIndex: number
    tasks: TaskData[]
}

export interface TaskData {
    id: string
    title: string
    description: string[]
    criteria: string[]
    hints: string[]
    badges: string[]
    tags: string[]
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    category?: string | null
    estimatedTime?: string | null
    checkpoints: string[]
    relatedPages: string[]
    dependencies: string[]
    terminalCommand?: string | null
    orderIndex: number
    status?: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED'
}

export interface TaskStatusMap {
    [taskId: string]: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED'
}

interface SprintCardProps {
    sprint: SprintData
    taskStatuses: TaskStatusMap
    difficultyColors: Record<string, string>
    categoryColors: Record<string, string>
    onTaskStatusChange?: (taskId: string, status: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED') => void
    isCreator?: boolean
    hasStarted?: boolean
}

// ============================================================================
// Task Detail Sheet Component
// ============================================================================

interface TaskDetailSheetProps {
    task: TaskData | null
    isOpen: boolean
    onClose: () => void
    onNavigate: (direction: 'prev' | 'next') => void
    hasPrev: boolean
    hasNext: boolean
    difficultyColors: Record<string, string>
    categoryColors: Record<string, string>
    taskStatus?: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED'
    onStatusChange?: (status: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED') => void
    hasStarted?: boolean
}

function TaskDetailSheet({
    task,
    isOpen,
    onClose,
    onNavigate,
    hasPrev,
    hasNext,
    difficultyColors,
    categoryColors,
    taskStatus = 'TO_DO',
    onStatusChange,
    hasStarted
}: TaskDetailSheetProps) {
    const [copied, setCopied] = useState(false)
    const [hintsOpen, setHintsOpen] = useState(false)

    if (!task) return null

    const handleCopyCommand = () => {
        if (task.terminalCommand) {
            navigator.clipboard.writeText(task.terminalCommand)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const statusOptions = [
        { value: 'TO_DO', label: 'To Do', icon: Circle, color: 'text-neutral-500' },
        { value: 'IN_PROGRESS', label: 'In Progress', icon: Clock, color: 'text-yellow-500' },
        { value: 'COMPLETED', label: 'Completed', icon: CheckCircle2, color: 'text-green-500' }
    ] as const

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="bottom" className="h-[85vh] w-full overflow-y-auto">
                <SheetHeader className="text-left pb-6 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <SheetTitle className="text-xl mb-2">{task.title}</SheetTitle>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className={difficultyColors[task.difficulty] || ''}>
                                    {task.difficulty}
                                </Badge>
                                {task.category && (
                                    <Badge variant="outline" className={categoryColors[task.category] || ''}>
                                        {task.category}
                                    </Badge>
                                )}
                                {task.estimatedTime && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {task.estimatedTime}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        {hasStarted && onStatusChange && (
                            <div className="flex gap-1">
                                {statusOptions.map((option) => {
                                    const Icon = option.icon
                                    return (
                                        <Button
                                            key={option.value}
                                            variant={taskStatus === option.value ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => onStatusChange(option.value)}
                                            className={cn(
                                                'gap-1',
                                                taskStatus === option.value && 'bg-indigo-600 hover:bg-indigo-700'
                                            )}
                                        >
                                            <Icon className={cn('w-3 h-3', taskStatus !== option.value && option.color)} />
                                            <span className="hidden sm:inline">{option.label}</span>
                                        </Button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                            {task.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </SheetHeader>

                <div className="max-w-4xl mx-auto py-6 space-y-6">
                    {/* Description Steps */}
                    {task.description && task.description.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                                <Code2 className="w-4 h-4" />
                                What to Build
                            </h4>
                            <ol className="space-y-3">
                                {task.description.map((step, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-medium">
                                            {idx + 1}
                                        </span>
                                        <span className="leading-relaxed pt-0.5">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* Success Criteria */}
                    {task.criteria && task.criteria.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Success Criteria
                            </h4>
                            <ul className="space-y-2">
                                {task.criteria.map((criterion, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                        {criterion}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Checkpoints */}
                    {task.checkpoints && task.checkpoints.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Checkpoints
                            </h4>
                            <ul className="space-y-2">
                                {task.checkpoints.map((checkpoint, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                        <div className="w-4 h-4 rounded border-2 border-neutral-300 dark:border-neutral-600 flex-shrink-0 mt-0.5" />
                                        {checkpoint}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Hints (Collapsible) */}
                    {task.hints && task.hints.length > 0 && (
                        <Collapsible open={hintsOpen} onOpenChange={setHintsOpen}>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between p-4 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-xl">
                                    <span className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                        <Lightbulb className="w-4 h-4" />
                                        {task.hints.length} Hints Available
                                    </span>
                                    <ChevronDown className={cn('w-4 h-4 transition-transform', hintsOpen && 'rotate-180')} />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <ul className="mt-3 space-y-2 p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl">
                                    {task.hints.map((hint, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
                                            <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            {hint}
                                        </li>
                                    ))}
                                </ul>
                            </CollapsibleContent>
                        </Collapsible>
                    )}

                    {/* Related Pages */}
                    {task.relatedPages && task.relatedPages.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                                <Link2 className="w-4 h-4" />
                                Related Pages
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {task.relatedPages.map((page, idx) => (
                                    <Badge key={idx} variant="secondary">
                                        {page}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dependencies */}
                    {task.dependencies && task.dependencies.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Dependencies
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {task.dependencies.map((dep, idx) => (
                                    <Badge key={idx} variant="outline" className="text-orange-600 border-orange-300">
                                        {dep}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Terminal Command */}
                    {task.terminalCommand && (
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                Terminal Command
                            </h4>
                            <div className="flex items-center gap-2 p-3 bg-neutral-900 dark:bg-black rounded-xl">
                                <code className="flex-1 text-sm text-green-400 font-mono">
                                    $ {task.terminalCommand}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopyCommand}
                                    className="text-neutral-400 hover:text-white"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <SheetFooter className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-between">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onNavigate('prev')}
                            disabled={!hasPrev}
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onNavigate('next')}
                            disabled={!hasNext}
                        >
                            Next
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

// ============================================================================
// Task Compact Card Component
// ============================================================================

interface TaskCompactCardProps {
    task: TaskData
    status: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED'
    difficultyColors: Record<string, string>
    onClick: () => void
}

function TaskCompactCard({ task, status, difficultyColors, onClick }: TaskCompactCardProps) {
    const statusIcons = {
        TO_DO: Circle,
        IN_PROGRESS: Clock,
        COMPLETED: CheckCircle2
    }
    const StatusIcon = statusIcons[status]

    const statusColors = {
        TO_DO: 'text-neutral-400',
        IN_PROGRESS: 'text-yellow-500',
        COMPLETED: 'text-green-500'
    }

    return (
        <div
            onClick={onClick}
            className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
        >
            <StatusIcon className={cn('w-5 h-5 flex-shrink-0', statusColors[status])} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    {task.category && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {task.category}
                        </span>
                    )}
                    {task.estimatedTime && (
                        <span className="text-xs text-neutral-400 dark:text-neutral-500">
                            • {task.estimatedTime}
                        </span>
                    )}
                </div>
            </div>
            <Badge className={cn('text-xs', difficultyColors[task.difficulty] || '')}>
                {task.difficulty.charAt(0)}
            </Badge>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-indigo-500 transition-colors" />
        </div>
    )
}

// ============================================================================
// Sprint Card Component
// ============================================================================

export function SprintCard({
    sprint,
    taskStatuses,
    difficultyColors,
    categoryColors,
    onTaskStatusChange,
    isCreator,
    hasStarted
}: SprintCardProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    const [selectedTask, setSelectedTask] = useState<TaskData | null>(null)
    const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false)

    // Calculate sprint progress
    const completedTasks = sprint.tasks.filter(t => taskStatuses[t.id] === 'COMPLETED').length
    const totalTasks = sprint.tasks.length
    const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    const handleTaskClick = (task: TaskData) => {
        setSelectedTask(task)
        setIsTaskSheetOpen(true)
    }

    const handleNavigate = (direction: 'prev' | 'next') => {
        if (!selectedTask) return
        const currentIndex = sprint.tasks.findIndex(t => t.id === selectedTask.id)
        const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1
        if (newIndex >= 0 && newIndex < sprint.tasks.length) {
            const nextTask = sprint.tasks[newIndex]
            if (nextTask) {
                setSelectedTask(nextTask)
            }
        }
    }

    const selectedTaskIndex = selectedTask ? sprint.tasks.findIndex(t => t.id === selectedTask.id) : -1

    return (
        <>
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                        {sprint.sprintNumber}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{sprint.name}</CardTitle>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            {sprint.duration} • {completedTasks}/{totalTasks} tasks
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex items-center gap-2 w-32">
                                        <Progress value={progressPercent} className="h-2" />
                                        <span className="text-xs text-neutral-500 w-10">
                                            {Math.round(progressPercent)}%
                                        </span>
                                    </div>
                                    <ChevronDown className={cn(
                                        'w-5 h-5 text-neutral-400 transition-transform',
                                        isExpanded && 'rotate-180'
                                    )} />
                                </div>
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="pt-0">
                            {/* Sprint Goal */}
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                                <strong>Goal:</strong> {sprint.goal}
                            </p>
                            {/* Tasks List */}
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {sprint.tasks.map((task, idx) => (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <TaskCompactCard
                                                task={task}
                                                status={taskStatuses[task.id] || 'TO_DO'}
                                                difficultyColors={difficultyColors}
                                                onClick={() => handleTaskClick(task)}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Task Detail Sheet */}
            <TaskDetailSheet
                task={selectedTask}
                isOpen={isTaskSheetOpen}
                onClose={() => {
                    setIsTaskSheetOpen(false)
                    setSelectedTask(null)
                }}
                onNavigate={handleNavigate}
                hasPrev={selectedTaskIndex > 0}
                hasNext={selectedTaskIndex < sprint.tasks.length - 1}
                difficultyColors={difficultyColors}
                categoryColors={categoryColors}
                taskStatus={selectedTask ? taskStatuses[selectedTask.id] || 'TO_DO' : 'TO_DO'}
                onStatusChange={selectedTask && onTaskStatusChange
                    ? (status) => onTaskStatusChange(selectedTask.id, status)
                    : undefined
                }
                hasStarted={hasStarted}
            />
        </>
    )
}
