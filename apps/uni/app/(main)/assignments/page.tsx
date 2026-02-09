"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    Search, Code2, Brain, Mic, Sparkles,
    Calendar, Users, ChevronRight, Clock, MoreVertical, Edit, Trash2,
    Eye, ExternalLink, Loader2, Zap
} from "lucide-react"
import Link from "next/link"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Badge } from "@repo/ui/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@repo/ui/components/ui/tabs"
import TeacherProjectGenerateSheet from "@/components/assignments/teacher-project-generate-sheet"
import TeacherMockCreateSheet from "@/components/assignments/teacher-mock-create-sheet"
import TeacherAssessmentCreateSheet from "@/components/assignments/teacher-assessment-create-sheet"
import { getProjectAssignments } from "@/actions/assignments/project-assignments.action"
import { getMockAssignments } from "@/actions/assignments/mock-assignments.action"
import { getAssessmentAssignments } from "@/actions/assignments/assessment-assignments.action"

interface ProjectAssignment {
    id: string
    title: string
    slug: string
    description: string
    shortDescription: string | null
    difficulty: string
    generationType: string
    classIds: string[]
    assignmentDeadline: Date | null
    assignmentCredits: number | null
    assignmentInstructions: string | null
    createdAt: Date
    classes: Array<{ id: string; name: string; code: string | null }>
    studentsStarted: number
    studentsCompleted: number
}

interface MockAssignment {
    id: string
    title: string
    description: string
    category: string
    level: string
    duration: number
    questionsCount: number
    classIds: string[]
    assignmentDeadline: Date | null
    assignmentCredits: number | null
    createdAt: Date
    classes: Array<{ id: string; name: string; code: string | null }>
    studentsStarted: number
    studentsCompleted: number
}

interface AssessmentAssignment {
    id: string
    title: string
    slug: string
    description: string | null
    language: string
    mode: string
    difficulty: string
    questionCount: number
    timeLimit: number | null
    status: string
    classIds: string[]
    assignmentDeadline: Date | null
    assignmentCredits: number | null
    isLiveSession: boolean
    liveSessionActive: boolean
    createdAt: Date
    classes: Array<{ id: string; name: string; code: string | null }>
    questionsCount: number
    studentsAttempted: number
}

const DIFFICULTY_COLORS = {
    BEGINNER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    INTERMEDIATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    ADVANCED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
    FULL_STACK: <Code2 className="w-4 h-4" />,
    FRONTEND: <Brain className="w-4 h-4" />,
    APP: <Sparkles className="w-4 h-4" />,
    "AI/ML": <Sparkles className="w-4 h-4" />,
}

export default function AssignmentsPage() {
    const [activeTab, setActiveTab] = useState("projects")
    const [projects, setProjects] = useState<ProjectAssignment[]>([])
    const [mocks, setMocks] = useState<MockAssignment[]>([])
    const [assessments, setAssessments] = useState<AssessmentAssignment[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchProjects()
        fetchMocks()
        fetchAssessments()
    }, [])

    const fetchProjects = async () => {
        setLoading(true)
        try {
            const result = await getProjectAssignments()
            if (result.success && result.data) {
                setProjects(result.data as unknown as ProjectAssignment[])
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchMocks = async () => {
        try {
            const result = await getMockAssignments()
            if (result.success && result.data) {
                setMocks(result.data as unknown as MockAssignment[])
            }
        } catch (error) {
            console.error("Failed to fetch mocks:", error)
        }
    }

    const fetchAssessments = async () => {
        try {
            const result = await getAssessmentAssignments()
            if (result.success && result.data) {
                setAssessments(result.data as unknown as AssessmentAssignment[])
            }
        } catch (error) {
            console.error("Failed to fetch assessments:", error)
        }
    }

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredMocks = mocks.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredAssessments = assessments.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const formatDeadline = (date: Date | null) => {
        if (!date) return "No deadline"
        const d = new Date(date)
        const now = new Date()
        const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays < 0) return "Past due"
        if (diffDays === 0) return "Due today"
        if (diffDays === 1) return "Due tomorrow"
        if (diffDays < 7) return `Due in ${diffDays} days`
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    return (
        <div className="min-h-full p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
            >
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                        Assignments
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Create and manage projects, quizzes, mocks, and coding challenges for your students.
                    </p>
                </div>
            </motion.div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <TabsList className="bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl">
                        <TabsTrigger value="projects" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800">
                            <Code2 className="w-4 h-4 mr-2" />
                            Projects
                        </TabsTrigger>
                        <TabsTrigger value="mocks" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800">
                            <Mic className="w-4 h-4 mr-2" />
                            Mock Interviews
                        </TabsTrigger>
                        <TabsTrigger value="quizzes" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800">
                            <Brain className="w-4 h-4 mr-2" />
                            Quizzes
                        </TabsTrigger>
                    </TabsList>

                    {
                    activeTab === "projects" && (
                        <TeacherProjectGenerateSheet onSuccess={() => fetchProjects()} />
                    )
                    }
                    {
                    activeTab === "mocks" && (
                        <TeacherMockCreateSheet onSuccess={() => fetchMocks()} />
                    )
                    }
                    {
                    activeTab === "quizzes" && (
                        <TeacherAssessmentCreateSheet onSuccess={() => fetchAssessments()} />
                    )
                    }
                </div>

                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search assignments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl"
                    />
                </div>
                <TabsContent value="projects" className="space-y-4">
                    {
                    loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12"
                        >
                            <div className="text-center max-w-md mx-auto">
                                <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                                    <Code2 className="w-8 h-8 text-violet-600" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                                    No project assignments yet
                                </h3>
                                <p className="text-neutral-500 mb-6">
                                    Create AI-powered projects and assign them to your classes. Students will build real-world applications with guided tasks.
                                </p>
                                <TeacherProjectGenerateSheet onSuccess={() => fetchProjects()} />
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid gap-4">
                            {
                            filteredProjects.map((project, idx) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                                >
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                            <span className="text-2xl text-white font-bold">
                                                {project.title.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white line-clamp-1">
                                                        {project.title}
                                                    </h3>
                                                    <p className="text-sm text-neutral-500 line-clamp-1 mt-0.5">
                                                        {project.shortDescription || "No description"}
                                                    </p>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Progress
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit Assignment
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <a href={`${process.env.NEXT_PUBLIC_MAIN_URL}/projects/${project.slug}`} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                                View on Platform
                                                            </a>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Remove Assignment
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                {
                                                project.difficulty && (
                                                    <Badge className={DIFFICULTY_COLORS[project.difficulty as keyof typeof DIFFICULTY_COLORS] || "bg-neutral-100"}>
                                                        {project.difficulty}
                                                    </Badge>
                                                )
                                                }
                                                {
                                                project.generationType && (
                                                    <Badge variant="outline" className="flex items-center gap-1">
                                                        {TYPE_ICONS[project.generationType] || <Code2 className="w-3 h-3" />}
                                                        {project.generationType.replace('_', ' ')}
                                                    </Badge>
                                                )
                                                }
                                                <span className="flex items-center gap-1 text-sm text-neutral-500">
                                                    <Users className="w-4 h-4" />
                                                    {project.classes.length} class(es)
                                                </span>
                                                <span className="flex items-center gap-1 text-sm text-neutral-500">
                                                    <Clock className="w-4 h-4" />
                                                    {formatDeadline(project.assignmentDeadline)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        {project.studentsStarted} started
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        {project.studentsCompleted} completed
                                                    </span>
                                                </div>
                                                <Link
                                                    href={`/assignments/projects/${project.id}`}
                                                    className="ml-auto text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
                                                >
                                                    View Details
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                            }
                        </div>
                    )
                    }
                </TabsContent>
                <TabsContent value="mocks">
                    {filteredMocks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12"
                        >
                            <div className="text-center max-w-md mx-auto">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                                    <Mic className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                                    No mock interview assignments yet
                                </h3>
                                <p className="text-neutral-500 mb-6">
                                    Create AI-powered mock interviews to help students practice for real interviews.
                                </p>
                                <TeacherMockCreateSheet onSuccess={() => fetchMocks()} />
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredMocks.map((mock, idx) => (
                                <motion.div
                                    key={mock.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                                >
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                                            <Mic className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white line-clamp-1">
                                                        {mock.title}
                                                    </h3>
                                                    <p className="text-sm text-neutral-500 line-clamp-1 mt-0.5">
                                                        {mock.description || "No description"}
                                                    </p>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Results
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit Assignment
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Remove Assignment
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    {mock.category}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {mock.level}
                                                </Badge>
                                                <span className="flex items-center gap-1 text-sm text-neutral-500">
                                                    <Clock className="w-4 h-4" />
                                                    {mock.duration} min
                                                </span>
                                                <span className="flex items-center gap-1 text-sm text-neutral-500">
                                                    <Users className="w-4 h-4" />
                                                    {mock.classes.length} class(es)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        {mock.studentsStarted} started
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        {mock.studentsCompleted} completed
                                                    </span>
                                                </div>
                                                <Link
                                                    href={`/assignments/mocks/${mock.id}`}
                                                    className="ml-auto text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                                >
                                                    View Details
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="quizzes">
                    {filteredAssessments.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12"
                        >
                            <div className="text-center max-w-md mx-auto">
                                <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                                    <Brain className="w-8 h-8 text-amber-600" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                                    No quiz & assessment assignments yet
                                </h3>
                                <p className="text-neutral-500 mb-6">
                                    Create quizzes and coding assessments with auto-grading for your students.
                                </p>
                                <TeacherAssessmentCreateSheet onSuccess={() => fetchAssessments()} />
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredAssessments.map((assessment, idx) => (
                                <motion.div
                                    key={assessment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            assessment.mode === 'CODE' 
                                                ? 'bg-gradient-to-br from-blue-500 to-cyan-600' 
                                                : assessment.mode === 'MIXED'
                                                    ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                                                    : 'bg-gradient-to-br from-amber-500 to-orange-600'
                                        }`}>
                                            {assessment.mode === 'CODE' ? (
                                                <Code2 className="w-8 h-8 text-white" />
                                            ) : assessment.mode === 'MIXED' ? (
                                                <Zap className="w-8 h-8 text-white" />
                                            ) : (
                                                <Brain className="w-8 h-8 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white line-clamp-1">
                                                            {assessment.title}
                                                        </h3>
                                                        {assessment.isLiveSession && (
                                                            <Badge className={assessment.liveSessionActive 
                                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                                                            }>
                                                                {assessment.liveSessionActive ? "🔴 Live" : "Live Session"}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-neutral-500 line-clamp-1 mt-0.5">
                                                        {assessment.description || `${assessment.language} • ${assessment.questionsCount} questions`}
                                                    </p>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Results
                                                        </DropdownMenuItem>
                                                        {assessment.isLiveSession && !assessment.liveSessionActive && (
                                                            <DropdownMenuItem>
                                                                <Zap className="w-4 h-4 mr-2" />
                                                                Start Live Session
                                                            </DropdownMenuItem>
                                                        )}
                                                        {assessment.liveSessionActive && (
                                                            <DropdownMenuItem className="text-red-600">
                                                                <Zap className="w-4 h-4 mr-2" />
                                                                End Live Session
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit Assignment
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Remove Assignment
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                <Badge className={
                                                    assessment.mode === 'CODE' 
                                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                        : assessment.mode === 'MIXED'
                                                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                }>
                                                    {assessment.mode}
                                                </Badge>
                                                <Badge variant="outline" className={DIFFICULTY_COLORS[assessment.difficulty as keyof typeof DIFFICULTY_COLORS] || ""}>
                                                    {assessment.difficulty}
                                                </Badge>
                                                <span className="flex items-center gap-1 text-sm text-neutral-500">
                                                    <Clock className="w-4 h-4" />
                                                    {assessment.timeLimit ? `${Math.round(assessment.timeLimit / 60)} min` : 'No limit'}
                                                </span>
                                                <span className="flex items-center gap-1 text-sm text-neutral-500">
                                                    <Users className="w-4 h-4" />
                                                    {assessment.classes.length} class(es)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        {assessment.studentsAttempted} attempted
                                                    </span>
                                                </div>
                                                <span className="flex items-center gap-1 text-sm text-neutral-500">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDeadline(assessment.assignmentDeadline)}
                                                </span>
                                                <Link
                                                    href={`/assignments/assessments/${assessment.id}`}
                                                    className="ml-auto text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                                                >
                                                    View Details
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}