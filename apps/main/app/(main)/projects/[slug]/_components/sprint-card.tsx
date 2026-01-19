'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronDown, ChevronRight, Clock, CheckCircle2, Circle
} from 'lucide-react'
// Button import removed
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Card, CardContent, CardHeader, CardTitle
} from '@repo/ui/components/ui/card'
// Sheet imports removed
import {
    Collapsible, CollapsibleContent, CollapsibleTrigger
} from '@repo/ui/components/ui/collapsible'
import { Progress } from '@repo/ui/components/ui/progress'
import { cn } from '@repo/ui/lib/utils'
import { TaskDetailSheet } from './task-detail-sheet'

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
                    {
                    task.category && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {task.category}
                        </span>
                    )
                    }
                    {
                    task.estimatedTime && (
                        <span className="text-xs text-neutral-400 dark:text-neutral-500">
                            • {task.estimatedTime}
                        </span>
                    )
                    }
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
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                                <strong>Goal:</strong> {sprint.goal}
                            </p>
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {
                                    sprint.tasks.map((task, idx) => (
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
                                    ))
                                    }
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
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