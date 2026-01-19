'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronLeft, Plus, CheckCircle2, Clock,
    LayoutList, Sparkles, Loader2, Book, Users, AlertTriangle,
    Coffee, Brain, Lock, MonitorPlay
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
    DialogFooter
} from '@repo/ui/components/ui/dialog'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Checkbox } from '@repo/ui/components/ui/checkbox'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/components/ui/tabs"
import { toast } from '@repo/ui/components/ui/sonner'
import { cn } from '@repo/ui/lib/utils'

import { TaskDetailSheet, TaskData } from '../../_components/task-detail-sheet'
import { SprintGenerationSheet } from '../../_components/sprint-generation-sheet'
import DailyStandupSheet from '../../_components/daily-standup-sheet'
import ResourcesList from '@/components/projects/resources-list'
import { FeatureSuggestionsList } from '@/components/projects/feature-suggestions-list'
import ErrorsTab from '@/components/projects/errors-tab'

import {
    addTaskToSprint, updateTaskStatus
} from '@/actions/(main)/projects/tasks.action'
import { getFeatureSuggestions } from '@/actions/(main)/projects/feature-suggestions.action'
import { Suggestion } from '@/types/project'


interface Sprint {
    id: string
    name: string
    goal: string
    duration: string
    sprintNumber: number
    tasks: TaskData[]
}

interface Project {
    id: string
    title: string
    slug: string
    sprints: Sprint[]
    createdBy: string
    progress?: {
        taskStatuses?: { taskId: string; status: string }[]
    }[]
}

interface SprintsPageClientProps {
    project: Project
    currentUserId?: string | null
    userCredits: number
    currentUser?: unknown
}

export default function SprintsPageClient({
    project,
    currentUserId,
    userCredits,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentUser: _currentUser
}: SprintsPageClientProps) {
    const router = useRouter()
    const [selectedSprintId, setSelectedSprintId] = useState<string>('')
    const [taskStatuses, setTaskStatuses] = useState<Record<string, string>>(() => {
        const statuses: Record<string, string> = {}
        if (project.progress && project.progress.length > 0) {
            const p = project.progress[0]
            if (p && p.taskStatuses) {
                p.taskStatuses.forEach((ts: { taskId: string; status: string }) => {
                    statuses[ts.taskId] = ts.status
                })
            }
        }
        return statuses
    })
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
    const [isSprintGenOpen, setIsSprintGenOpen] = useState(false)

    // Task Form State
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newTaskDesc, setNewTaskDesc] = useState('')
    const [newTaskDiff, setNewTaskDiff] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER')
    const [newTaskTime, setNewTaskTime] = useState('')
    const [newTaskCategory, setNewTaskCategory] = useState('')
    const [addToSuggestions, setAddToSuggestions] = useState(false)
    const [isSubmittingTask, setIsSubmittingTask] = useState(false)

    // Task Detail Sheet State
    const [selectedTask, setSelectedTask] = useState<TaskData | null>(null)
    const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false)

    // Assistant State
    const [activeAssistantTab, setActiveAssistantTab] = useState('resources')
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loadingSuggestions, setLoadingSuggestions] = useState(false)
    const [isStandupOpen, setIsStandupOpen] = useState(false)

    const isCreator = project.createdBy === currentUserId
    // As per requirement, assume enrolled is true for now or handled by parent page
    const isEnrolled = true

    useEffect(() => {
        // Set default sprint (first one or active one)
        if (project.sprints && project.sprints.length > 0 && !selectedSprintId) {
            const firstSprint = project.sprints[0]
            if (firstSprint) setSelectedSprintId(firstSprint.id)
        }
    }, [project.sprints, selectedSprintId])

    useEffect(() => {
        if (project.progress && project.progress.length > 0) {
            const statuses: Record<string, string> = {}
            const p = project.progress[0]
            if (p && p.taskStatuses) {
                p.taskStatuses.forEach((ts: { taskId: string; status: string }) => {
                    statuses[ts.taskId] = ts.status
                })
            }
            setTaskStatuses(statuses)
        }
    }, [project.progress])

    // Fetch suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            setLoadingSuggestions(true)
            try {
                const res = await getFeatureSuggestions(project.id)
                if (res.success && res.data) {
                    setSuggestions(res.data)
                }
            } catch (e) {
                console.error("Failed to fetch suggestions", e)
            } finally {
                setLoadingSuggestions(false)
            }
        }
        fetchSuggestions()
    }, [project.id])

    // Calculate Progress
    const totalTasks = project.sprints?.reduce((acc, s) => acc + s.tasks.length, 0) || 0
    const completedTasks = Object.values(taskStatuses).filter(s => s === 'COMPLETED').length
    const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    const hasStarted = completedTasks > 0

    const handleTaskStatusChange = async (taskId: string, newStatus: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED') => {
        // Optimistic update
        setTaskStatuses(prev => ({ ...prev, [taskId]: newStatus }))

        try {
            await updateTaskStatus(taskId, newStatus, `/projects/${project.slug}/sprints`)
            router.refresh()
        } catch {
            toast.error('Failed to update status')
        }
    }

    const handleAddTask = async () => {
        if (!newTaskTitle.trim() || !selectedSprintId) return

        setIsSubmittingTask(true)
        try {
            const result = await addTaskToSprint(
                project.id,
                selectedSprintId,
                {
                    title: newTaskTitle,
                    description: newTaskDesc,
                    difficulty: newTaskDiff,
                    estimatedTime: newTaskTime,
                    category: newTaskCategory
                },
                addToSuggestions,
                `/projects/${project.slug}/sprints`
            )

            if (result.success) {
                toast.success('Task added successfully')
                setIsTaskDialogOpen(false)
                // Reset form
                setNewTaskTitle('')
                setNewTaskDesc('')
                setAddToSuggestions(false)
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to add task')
            }
        } catch {
            toast.error('Error adding task')
        } finally {
            setIsSubmittingTask(false)
        }
    }

    const handleTaskClick = (task: TaskData) => {
        setSelectedTask(task)
        setIsTaskSheetOpen(true)
    }

    const activeSprint = project.sprints?.find((s: Sprint) => s.id === selectedSprintId)

    const handleNavigate = (direction: 'prev' | 'next') => {
        if (!selectedTask || !activeSprint) return

        const currentIndex = activeSprint.tasks.findIndex((t: TaskData) => t.id === selectedTask.id)
        if (currentIndex === -1) return

        if (direction === 'prev' && currentIndex > 0) {
            const prevTask = activeSprint.tasks[currentIndex - 1]
            if (prevTask) setSelectedTask(prevTask)
        } else if (direction === 'next' && currentIndex < activeSprint.tasks.length - 1) {
            const nextTask = activeSprint.tasks[currentIndex + 1]
            if (nextTask) setSelectedTask(nextTask)
        }
    }

    const handleQuiz = () => {
        if (progressPercent > 50) {
            router.push(`/projects/${project.slug}/quiz`)
        }
    }

    const handleMock = () => {
        if (progressPercent > 75) {
            router.push(`/projects/${project.slug}/aimock`)
        }
    }

    return (
        <div className="flex h-screen w-full bg-white dark:bg-neutral-950 overflow-hidden">
            <div className="hidden md:flex w-80 border-r border-neutral-200 dark:border-neutral-800 flex-col bg-neutral-50/50 dark:bg-neutral-900/20">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <Link
                        href={`/projects/${project.slug}`}
                        className="flex items-center text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Project
                    </Link>
                </div>
                <div className="p-4 pb-2">
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">Sprints</h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {project.sprints?.length || 0} sprints available
                    </p>
                </div>
                <ScrollArea className="flex-1 w-full px-3">
                    <div className="space-y-2 py-2">
                        {
                            project.sprints?.map((sprint: Sprint) => (
                                <button
                                    key={sprint.id}
                                    onClick={() => setSelectedSprintId(sprint.id)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-xl transition-all border border-transparent",
                                        selectedSprintId === sprint.id
                                            ? "bg-white dark:bg-neutral-900 shadow-sm border-neutral-200 dark:border-neutral-800 ring-1 ring-neutral-200 dark:ring-neutral-800"
                                            : "hover:bg-neutral-100 dark:hover:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={cn(
                                            "text-xs font-bold uppercase tracking-wider",
                                            selectedSprintId === sprint.id ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-500"
                                        )}>
                                            Sprint {sprint.sprintNumber}
                                        </span>
                                    </div>
                                    <h3 className={cn(
                                        "font-semibold text-sm line-clamp-1 mb-1",
                                        selectedSprintId === sprint.id ? "text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-300"
                                    )}>
                                        {sprint.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                        <span className="flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {sprint.duration}
                                        </span>
                                        <span>•</span>
                                        <span>{sprint.tasks?.length} tasks</span>
                                    </div>
                                </button>
                            ))
                        }
                    </div>
                </ScrollArea>
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
                    <Button
                        onClick={() => setIsSprintGenOpen(true)}
                        className="w-full bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Sprint
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-950 relative">
                <div className="h-16 px-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white/50 dark:bg-neutral-950/50 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <Link href={`/projects/${project.slug}`} className="md:hidden">
                            <ChevronLeft className="w-5 h-5 text-neutral-500" />
                        </Link>
                        {
                            activeSprint ? (
                                <div className="min-w-0">
                                    <h1 className="text-xl font-bold text-neutral-900 dark:text-white truncate">
                                        {activeSprint.name}
                                    </h1>
                                </div>
                            ) : (
                                <h1 className="text-xl font-bold">Select a Sprint</h1>
                            )
                        }
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="hidden sm:flex gap-2"
                            onClick={() => setIsStandupOpen(true)}
                        >
                            <Coffee className="w-4 h-4 text-amber-600" />
                            Daily Standup
                        </Button>

                        {
                            activeSprint && (
                                <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Task
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>Add Task to Sprint {activeSprint.sprintNumber}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Task Title</Label>
                                                <Input
                                                    value={newTaskTitle}
                                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                                    placeholder="e.g., Implement Login API"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={newTaskDesc}
                                                    onChange={(e) => setNewTaskDesc(e.target.value)}
                                                    placeholder="Describe what needs to be done..."
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Difficulty</Label>
                                                    <Select value={newTaskDiff} onValueChange={(v) => setNewTaskDiff(v as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED')}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="BEGINNER">Beginner</SelectItem>
                                                            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                                            <SelectItem value="ADVANCED">Advanced</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Est. Duration</Label>
                                                    <Input
                                                        value={newTaskTime}
                                                        onChange={(e) => setNewTaskTime(e.target.value)}
                                                        placeholder="e.g., 2 hours"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Category (Tag)</Label>
                                                <Input
                                                    value={newTaskCategory}
                                                    onChange={(e) => setNewTaskCategory(e.target.value)}
                                                    placeholder="e.g., Backend, Frontend"
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2 pt-2">
                                                <Checkbox
                                                    id="suggestion"
                                                    checked={addToSuggestions}
                                                    onCheckedChange={(c) => setAddToSuggestions(c === true)}
                                                />
                                                <Label htmlFor="suggestion" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    Also add to Project Suggestions list
                                                </Label>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
                                            <Button
                                                onClick={handleAddTask}
                                                disabled={isSubmittingTask}
                                                className="bg-black text-white dark:bg-white dark:text-black"
                                            >
                                                {isSubmittingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Task'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )
                        }

                        <Button
                            variant="outline" size="sm" onClick={handleQuiz}
                            disabled={progressPercent <= 50}
                            className={cn("hidden lg:flex gap-2", progressPercent <= 50 && "opacity-50 cursor-not-allowed")}
                        >
                            <Brain className="w-4 h-4 text-purple-600" />
                            Quiz
                            {progressPercent <= 50 && <Lock className="w-3 h-3 ml-1" />}
                        </Button>
                        <Button
                            variant="outline" size="sm" onClick={handleMock}
                            disabled={progressPercent <= 75}
                            className={cn("hidden lg:flex gap-2", progressPercent <= 75 && "opacity-50 cursor-not-allowed")}
                        >
                            <MonitorPlay className="w-4 h-4 text-blue-600" />
                            Mock Interview
                            {progressPercent <= 75 && <Lock className="w-3 h-3 ml-1" />}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    <div className="flex-1 lg:w-1/2 flex flex-col border-r border-neutral-200 dark:border-neutral-800">
                        <ScrollArea className="flex-1 w-full relative">
                            <div className="w-full px-6 py-8 space-y-6">
                                {
                                    activeSprint ? (
                                        activeSprint.tasks?.length > 0 ? (
                                            activeSprint.tasks.map((task: TaskData) => {
                                                const status = taskStatuses[task.id] || 'TO_DO'
                                                const isCompleted = status === 'COMPLETED'

                                                return (
                                                    <div
                                                        key={task.id}
                                                        onClick={() => handleTaskClick(task)}
                                                        className={cn(
                                                            "group relative p-5 bg-white dark:bg-neutral-900 rounded-xl border transition-all duration-200 cursor-pointer",
                                                            isCompleted
                                                                ? "border-green-200 dark:border-green-900/30 bg-green-50/10"
                                                                : "border-neutral-200 dark:border-neutral-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow-md"
                                                        )}
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleTaskStatusChange(task.id, isCompleted ? 'TO_DO' : 'COMPLETED')
                                                                }}
                                                                className={cn(
                                                                    "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                                                    isCompleted
                                                                        ? "bg-green-500 border-green-500 text-white"
                                                                        : "border-neutral-300 dark:border-neutral-600 hover:border-indigo-500 text-transparent"
                                                                )}
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex items-start justify-between">
                                                                    <h3 className={cn(
                                                                        "text-base font-semibold transition-all",
                                                                        isCompleted ? "text-neutral-500 line-through" : "text-neutral-900 dark:text-white"
                                                                    )}>
                                                                        {task.title}
                                                                    </h3>
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge variant="secondary" className={cn(
                                                                            "text-xs font-medium uppercase",
                                                                            task.difficulty === 'BEGINNER' ? "text-green-600 bg-green-50 dark:bg-green-950/30" :
                                                                                task.difficulty === 'INTERMEDIATE' ? "text-blue-600 bg-blue-50 dark:bg-blue-950/30" :
                                                                                    "text-purple-600 bg-purple-50 dark:bg-purple-950/30"
                                                                        )}>
                                                                            {task.difficulty}
                                                                        </Badge>
                                                                        {
                                                                            task.estimatedTime && (
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    {task.estimatedTime}
                                                                                </Badge>
                                                                            )
                                                                        }
                                                                    </div>
                                                                </div>

                                                                {
                                                                    task.description && task.description.length > 0 && (
                                                                        <div className="prose prose-sm dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-400 text-sm">
                                                                            {
                                                                                task.description.map((line, i) => (
                                                                                    <p key={i}>{line}</p>
                                                                                ))
                                                                            }
                                                                        </div>
                                                                    )
                                                                }

                                                                {
                                                                    task.category && (
                                                                        <div className="flex items-center gap-2 pt-2">
                                                                            <Badge variant="outline" className="text-xs bg-neutral-50 dark:bg-neutral-900">
                                                                                {task.category}
                                                                            </Badge>
                                                                        </div>
                                                                    )
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
                                                <LayoutList className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
                                                <h3 className="text-lg font-medium text-neutral-900 dark:text-white">No tasks yet</h3>
                                                <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-2">
                                                    This sprint is empty. Generate tasks with AI or add them manually.
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsTaskDialogOpen(true)}
                                                    className="mt-6"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add First Task
                                                </Button>
                                            </div>
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-[50vh] text-neutral-500">
                                            <p>Select a sprint from the sidebar to view details</p>
                                        </div>
                                    )
                                }
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="flex-1 lg:w-1/2 flex flex-col bg-neutral-50/30 dark:bg-neutral-900/10">
                        <Tabs value={activeAssistantTab} onValueChange={setActiveAssistantTab} className="flex-1 flex flex-col">
                            <div className="px-6 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-sm">
                                <TabsList className="bg-transparent p-0 h-auto gap-4">
                                    <TabsTrigger
                                        value="resources"
                                        className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-2 py-3 border-transparent border-b-2 transition-all"
                                    >
                                        <Book className="w-4 h-4 mr-2" />
                                        Resources
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="suggestions"
                                        className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-2 py-3 border-transparent border-b-2 transition-all"
                                    >
                                        <Users className="w-4 h-4 mr-2" />
                                        Suggestions
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="errors"
                                        className="data-[state=active]:bg-transparent data-[state=active]:text-amber-600 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-600 rounded-none px-2 py-3 border-transparent border-b-2 transition-all"
                                    >
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        Errors
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                            <div className="flex-1 overflow-hidden relative">
                                <ScrollArea className="h-full w-full">
                                    <div className="p-6">
                                        <TabsContent value="resources" className="mt-0">
                                            <ResourcesList
                                                projectId={project.id}
                                                currentUserId={currentUserId}
                                                isCreator={isCreator}
                                            />
                                        </TabsContent>
                                        <TabsContent value="suggestions" className="mt-0">
                                            <FeatureSuggestionsList
                                                suggestions={suggestions}
                                                projectSlug={project.slug}
                                                isCreator={isCreator}
                                                isEnrolled={isEnrolled}
                                                currentUserId={currentUserId}
                                            />
                                        </TabsContent>
                                        <TabsContent value="errors" className="mt-0">
                                            <ErrorsTab
                                                projectId={project.id}
                                                isEnrolled={isEnrolled}
                                                isCreator={isCreator}
                                            />
                                        </TabsContent>
                                    </div>
                                </ScrollArea>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </div>

            <SprintGenerationSheet
                projectId={project.id}
                isOpen={isSprintGenOpen}
                onClose={() => setIsSprintGenOpen(false)}
                isCreator={isCreator}
            />

            <TaskDetailSheet
                task={selectedTask}
                isOpen={isTaskSheetOpen}
                onClose={() => {
                    setIsTaskSheetOpen(false)
                    setSelectedTask(null)
                }}
                onNavigate={handleNavigate}
                hasPrev={selectedTask && activeSprint ? activeSprint.tasks.findIndex(t => t.id === selectedTask.id) > 0 : false}
                hasNext={selectedTask && activeSprint ? activeSprint.tasks.findIndex(t => t.id === selectedTask.id) < activeSprint.tasks.length - 1 : false}
                taskStatus={(selectedTask ? taskStatuses[selectedTask.id] || 'TO_DO' : 'TO_DO') as 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED'}
                onStatusChange={selectedTask ? (status) => handleTaskStatusChange(selectedTask.id, status) : undefined}
                hasStarted={true}
                difficultyColors={{
                    BEGINNER: "text-green-600 bg-green-50 dark:bg-green-950/30",
                    INTERMEDIATE: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
                    ADVANCED: "text-purple-600 bg-purple-50 dark:bg-purple-950/30"
                }}
            />

            <DailyStandupSheet
                isOpen={isStandupOpen}
                onClose={() => setIsStandupOpen(false)}
                projectId={project.id}
                projectSlug={project.slug}
                projectTitle={project.title}
                userCredits={userCredits}
                hasStarted={hasStarted}
            />
        </div>
    )
}