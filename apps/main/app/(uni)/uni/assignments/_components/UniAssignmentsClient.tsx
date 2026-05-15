"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
    BookOpen, Search, CheckCircle2, AlertCircle,
    ArrowUpRight, Calendar, Coins, Tag, 
    FolderGit2, Mic, FileQuestion, Clock, Loader2,
    Play, Zap
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { 
    Tabs, TabsContent, TabsList, TabsTrigger 
} from "@repo/ui/components/ui/tabs"
import { Badge } from "@repo/ui/components/ui/badge"
import Link from "next/link"
import { 
    getStudentUniversityAssignments, type StudentProjectAssignment,
    type StudentMockAssignment, type StudentQuizAssignment
} from "@/actions/university/student-assignments.action"

export default function UniAssignmentsPage() {
    const [projects, setProjects] = useState<StudentProjectAssignment[]>([])
    const [mocks, setMocks] = useState<StudentMockAssignment[]>([])
    const [quizzes, setQuizzes] = useState<StudentQuizAssignment[]>([])
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, dueSoon: 0 })
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("all")

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await getStudentUniversityAssignments()
                if (response.success && response.data) {
                    setProjects(response.data.projects)
                    setMocks(response.data.mocks)
                    setQuizzes(response.data.quizzes)
                    setStats(response.data.stats)
                }
            } catch (error) {
                console.error("Error fetching assignments:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAssignments()
    }, [])

    const isOverdue = (deadline: Date | null) => deadline ? new Date(deadline) < new Date() : false
    const isDueSoon = (deadline: Date | null) => {
        if (!deadline) return false
        const diff = new Date(deadline).getTime() - new Date().getTime()
        return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000 // 3 days
    }

    // Filter functions for search
    const filteredProjects = projects.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const filteredMocks = mocks.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const filteredQuizzes = quizzes.filter(q => 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="min-h-full p-6 lg:p-8 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" />
                    <p className="text-neutral-500">Loading your assignments...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-5 h-5 text-violet-500" />
                            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                                University Assignments
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                            My Assignments
                        </h1>
                        <p className="text-neutral-500 mt-1">
                            View and complete assignments from your teachers
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
                    <p className="text-xs text-neutral-500">Total Assignments</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.pending}</p>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Pending</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.dueSoon}</p>
                    <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Due Soon</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                    <p className="text-xs text-green-600/70 dark:text-green-400/70">Completed</p>
                </div>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
            >
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search assignments..."
                        className="pl-10 rounded-xl"
                    />
                </div>
            </motion.div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl">
                    <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800">
                        <BookOpen className="w-4 h-4 mr-2" />
                        All
                        <Badge variant="secondary" className="ml-2">{stats.total}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="projects" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800">
                        <FolderGit2 className="w-4 h-4 mr-2" />
                        Projects
                        <Badge variant="secondary" className="ml-2">{projects.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="mocks" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800">
                        <Mic className="w-4 h-4 mr-2" />
                        Mocks
                        <Badge variant="secondary" className="ml-2">{mocks.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="quizzes" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800">
                        <FileQuestion className="w-4 h-4 mr-2" />
                        Quizzes
                        <Badge variant="secondary" className="ml-2">{quizzes.length}</Badge>
                    </TabsTrigger>
                </TabsList>

                {/* All Assignments Tab */}
                <TabsContent value="all" className="space-y-6">
                    {filteredProjects.length === 0 && filteredMocks.length === 0 && filteredQuizzes.length === 0 ? (
                        <EmptyState searchQuery={searchQuery} />
                    ) : (
                        <>
                            {filteredProjects.length > 0 && (
                                <AssignmentSection 
                                    title="Projects" 
                                    icon={<FolderGit2 className="w-5 h-5" />}
                                    color="blue"
                                >
                                    {filteredProjects.map((project, i) => (
                                        <ProjectCard key={project.id} project={project} index={i} isOverdue={isOverdue} isDueSoon={isDueSoon} />
                                    ))}
                                </AssignmentSection>
                            )}
                            {filteredMocks.length > 0 && (
                                <AssignmentSection 
                                    title="Mock Interviews" 
                                    icon={<Mic className="w-5 h-5" />}
                                    color="purple"
                                >
                                    {filteredMocks.map((mock, i) => (
                                        <MockCard key={mock.id} mock={mock} index={i} isOverdue={isOverdue} isDueSoon={isDueSoon} />
                                    ))}
                                </AssignmentSection>
                            )}
                            {filteredQuizzes.length > 0 && (
                                <AssignmentSection 
                                    title="Quizzes & Assessments" 
                                    icon={<FileQuestion className="w-5 h-5" />}
                                    color="amber"
                                >
                                    {filteredQuizzes.map((quiz, i) => (
                                        <QuizCard key={quiz.id} quiz={quiz} index={i} isOverdue={isOverdue} isDueSoon={isDueSoon} />
                                    ))}
                                </AssignmentSection>
                            )}
                        </>
                    )}
                </TabsContent>

                {/* Projects Tab */}
                <TabsContent value="projects" className="space-y-4">
                    {filteredProjects.length === 0 ? (
                        <EmptyState searchQuery={searchQuery} type="projects" />
                    ) : (
                        filteredProjects.map((project, i) => (
                            <ProjectCard key={project.id} project={project} index={i} isOverdue={isOverdue} isDueSoon={isDueSoon} />
                        ))
                    )}
                </TabsContent>

                {/* Mocks Tab */}
                <TabsContent value="mocks" className="space-y-4">
                    {filteredMocks.length === 0 ? (
                        <EmptyState searchQuery={searchQuery} type="mocks" />
                    ) : (
                        filteredMocks.map((mock, i) => (
                            <MockCard key={mock.id} mock={mock} index={i} isOverdue={isOverdue} isDueSoon={isDueSoon} />
                        ))
                    )}
                </TabsContent>

                {/* Quizzes Tab */}
                <TabsContent value="quizzes" className="space-y-4">
                    {filteredQuizzes.length === 0 ? (
                        <EmptyState searchQuery={searchQuery} type="quizzes" />
                    ) : (
                        filteredQuizzes.map((quiz, i) => (
                            <QuizCard key={quiz.id} quiz={quiz} index={i} isOverdue={isOverdue} isDueSoon={isDueSoon} />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

// Assignment Section Component
function AssignmentSection({ 
    title, 
    icon, 
    color, 
    children 
}: { 
    title: string
    icon: React.ReactNode
    color: "blue" | "purple" | "amber"
    children: React.ReactNode 
}) {
    const colorClasses = {
        blue: "text-blue-600 dark:text-blue-400",
        purple: "text-purple-600 dark:text-purple-400",
        amber: "text-amber-600 dark:text-amber-400",
    }

    return (
        <div className="space-y-4">
            <div className={`flex items-center gap-2 ${colorClasses[color]}`}>
                {icon}
                <h2 className="font-semibold">{title}</h2>
            </div>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    )
}

// Project Card Component
function ProjectCard({ 
    project, 
    index, 
    isOverdue, 
    isDueSoon 
}: { 
    project: StudentProjectAssignment
    index: number
    isOverdue: (d: Date | null) => boolean
    isDueSoon: (d: Date | null) => boolean
}) {
    const overdue = isOverdue(project.deadline)
    const dueSoon = isDueSoon(project.deadline)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
        >
            <Link href={`/project/${project.slug}`}>
                <div className={`bg-white dark:bg-neutral-950 border rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group ${
                    overdue && project.status !== "completed"
                        ? "border-red-300 dark:border-red-700" 
                        : dueSoon && project.status !== "completed"
                            ? "border-amber-300 dark:border-amber-700"
                            : "border-neutral-200 dark:border-neutral-800"
                }`}>
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <FolderGit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                        {project.title}
                                    </h3>
                                    {project.description && (
                                        <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                                            {project.description}
                                        </p>
                                    )}
                                </div>
                                {project.status === "completed" ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                ) : (
                                    <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                                )}
                            </div>

                            {/* Progress bar for in-progress projects */}
                            {project.status === "in_progress" && project.progress !== undefined && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-neutral-500">Progress</span>
                                        <span className="text-blue-600 font-medium">{project.progress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-500 rounded-full transition-all"
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                <Badge variant="secondary" className="text-[10px]">
                                    {project.difficulty}
                                </Badge>
                                {project.deadline && (
                                    <span className={`flex items-center gap-1 text-xs ${
                                        overdue && project.status !== "completed"
                                            ? "text-red-600 dark:text-red-400" 
                                            : dueSoon && project.status !== "completed"
                                                ? "text-amber-600 dark:text-amber-400"
                                                : "text-neutral-500"
                                    }`}>
                                        {overdue && project.status !== "completed" ? (
                                            <AlertCircle className="w-3 h-3" />
                                        ) : (
                                            <Calendar className="w-3 h-3" />
                                        )}
                                        {overdue && project.status !== "completed" ? "Overdue: " : dueSoon && project.status !== "completed" ? "Due Soon: " : "Due: "}
                                        {new Date(project.deadline).toLocaleDateString()}
                                    </span>
                                )}
                                {project.creditsRequired && (
                                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                                        <Coins className="w-3 h-3" />
                                        {project.creditsRequired} credits
                                    </span>
                                )}
                                {project.classNames.length > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                                        <Tag className="w-3 h-3" />
                                        {project.classNames.join(", ")}
                                    </span>
                                )}
                            </div>
                            
                            {project.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {project.technologies.slice(0, 4).map(tech => (
                                        <span key={tech} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                            {tech}
                                        </span>
                                    ))}
                                    {project.technologies.length > 4 && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                            +{project.technologies.length - 4}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

// Mock Card Component
function MockCard({ 
    mock, 
    index, 
    isOverdue, 
    isDueSoon 
}: { 
    mock: StudentMockAssignment
    index: number
    isOverdue: (d: Date | null) => boolean
    isDueSoon: (d: Date | null) => boolean
}) {
    const overdue = isOverdue(mock.deadline)
    const dueSoon = isDueSoon(mock.deadline)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
        >
            <Link href={`/mock/${mock.id}`}>
                <div className={`bg-white dark:bg-neutral-950 border rounded-2xl p-5 hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer group ${
                    overdue && mock.status !== "completed"
                        ? "border-red-300 dark:border-red-700" 
                        : dueSoon && mock.status !== "completed"
                            ? "border-amber-300 dark:border-amber-700"
                            : "border-neutral-200 dark:border-neutral-800"
                }`}>
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                            <Mic className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-neutral-900 dark:text-white group-hover:text-purple-600 transition-colors">
                                        {mock.title}
                                    </h3>
                                    {mock.description && (
                                        <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                                            {mock.description}
                                        </p>
                                    )}
                                </div>
                                {mock.status === "completed" ? (
                                    <div className="flex items-center gap-2">
                                        {mock.score !== undefined && (
                                            <span className="text-sm font-medium text-green-600">{mock.score}%</span>
                                        )}
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    </div>
                                ) : (
                                    <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-purple-600 transition-colors flex-shrink-0" />
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                <Badge variant="secondary" className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                    {mock.category}
                                </Badge>
                                <Badge variant="outline" className="text-[10px]">
                                    {mock.level}
                                </Badge>
                                {mock.deadline && (
                                    <span className={`flex items-center gap-1 text-xs ${
                                        overdue && mock.status !== "completed"
                                            ? "text-red-600 dark:text-red-400" 
                                            : dueSoon && mock.status !== "completed"
                                                ? "text-amber-600 dark:text-amber-400"
                                                : "text-neutral-500"
                                    }`}>
                                        {overdue && mock.status !== "completed" ? (
                                            <AlertCircle className="w-3 h-3" />
                                        ) : (
                                            <Calendar className="w-3 h-3" />
                                        )}
                                        {overdue && mock.status !== "completed" ? "Overdue: " : dueSoon && mock.status !== "completed" ? "Due Soon: " : "Due: "}
                                        {new Date(mock.deadline).toLocaleDateString()}
                                    </span>
                                )}
                                {mock.creditsRequired && (
                                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                                        <Coins className="w-3 h-3" />
                                        {mock.creditsRequired} credits
                                    </span>
                                )}
                                {mock.classNames.length > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                                        <Tag className="w-3 h-3" />
                                        {mock.classNames.join(", ")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

// Quiz Card Component
function QuizCard({ 
    quiz, 
    index, 
    isOverdue, 
    isDueSoon 
}: { 
    quiz: StudentQuizAssignment
    index: number
    isOverdue: (d: Date | null) => boolean
    isDueSoon: (d: Date | null) => boolean
}) {
    const overdue = isOverdue(quiz.deadline)
    const dueSoon = isDueSoon(quiz.deadline)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
        >
            <Link href={`/assessments/${quiz.id}`}>
                <div className={`bg-white dark:bg-neutral-950 border rounded-2xl p-5 hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer group ${
                    quiz.liveSessionActive
                        ? "border-red-400 dark:border-red-600 ring-2 ring-red-200 dark:ring-red-900"
                        : overdue && quiz.status !== "completed"
                            ? "border-red-300 dark:border-red-700" 
                            : dueSoon && quiz.status !== "completed"
                                ? "border-amber-300 dark:border-amber-700"
                                : "border-neutral-200 dark:border-neutral-800"
                }`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${quiz.liveSessionActive ? "bg-red-100 dark:bg-red-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
                            {quiz.liveSessionActive ? (
                                <Zap className="w-5 h-5 text-red-600 dark:text-red-400 animate-pulse" />
                            ) : (
                                <FileQuestion className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-neutral-900 dark:text-white group-hover:text-amber-600 transition-colors">
                                            {quiz.title}
                                        </h3>
                                        {quiz.liveSessionActive && (
                                            <Badge variant="destructive" className="text-[10px] animate-pulse">
                                                LIVE NOW
                                            </Badge>
                                        )}
                                    </div>
                                    {quiz.description && (
                                        <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                                            {quiz.description}
                                        </p>
                                    )}
                                </div>
                                {quiz.status === "completed" ? (
                                    <div className="flex items-center gap-2">
                                        {quiz.score !== undefined && (
                                            <span className="text-sm font-medium text-green-600">{Math.round(quiz.score)}%</span>
                                        )}
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    </div>
                                ) : quiz.liveSessionActive ? (
                                    <Button size="sm" variant="destructive" className="flex-shrink-0">
                                        <Play className="w-3 h-3 mr-1" />
                                        Join
                                    </Button>
                                ) : (
                                    <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-600 transition-colors flex-shrink-0" />
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                <Badge variant="secondary" className="text-[10px]">
                                    {quiz.difficulty}
                                </Badge>
                                <span className="flex items-center gap-1 text-xs text-neutral-500">
                                    <FileQuestion className="w-3 h-3" />
                                    {quiz.questionCount} questions
                                </span>
                                {quiz.timeLimit && (
                                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                                        <Clock className="w-3 h-3" />
                                        {quiz.timeLimit} min
                                    </span>
                                )}
                                {quiz.deadline && !quiz.liveSessionActive && (
                                    <span className={`flex items-center gap-1 text-xs ${
                                        overdue && quiz.status !== "completed"
                                            ? "text-red-600 dark:text-red-400" 
                                            : dueSoon && quiz.status !== "completed"
                                                ? "text-amber-600 dark:text-amber-400"
                                                : "text-neutral-500"
                                    }`}>
                                        {overdue && quiz.status !== "completed" ? (
                                            <AlertCircle className="w-3 h-3" />
                                        ) : (
                                            <Calendar className="w-3 h-3" />
                                        )}
                                        {overdue && quiz.status !== "completed" ? "Overdue: " : dueSoon && quiz.status !== "completed" ? "Due Soon: " : "Due: "}
                                        {new Date(quiz.deadline).toLocaleDateString()}
                                    </span>
                                )}
                                {quiz.creditsRequired && (
                                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                                        <Coins className="w-3 h-3" />
                                        {quiz.creditsRequired} credits
                                    </span>
                                )}
                                {quiz.classNames.length > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                                        <Tag className="w-3 h-3" />
                                        {quiz.classNames.join(", ")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

// Empty State Component
function EmptyState({ searchQuery, type }: { searchQuery: string; type?: string }) {
    const messages = {
        projects: "You don't have any project assignments yet.",
        mocks: "You don't have any mock interview assignments yet.",
        quizzes: "You don't have any quiz assignments yet.",
        default: "You don't have any assignments yet."
    }

    return (
        <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                {searchQuery ? "No Assignments Found" : "All Caught Up!"}
            </h2>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                {searchQuery
                    ? "No assignments match your search criteria."
                    : messages[type as keyof typeof messages] || messages.default}
            </p>
        </div>
    )
}
