"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
    School, Search, BookOpen, Users, Clock, ArrowRight, Filter
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import Link from "next/link"
import {
    getStudentUniversityDashboard
} from "@/actions/university/university.action"

interface ClassData {
    id: string
    name: string
    code: string | null
    semester: string | null
    department?: {
        id: string
        name: string
    }
    _count?: {
        enrollments: number
        assignments: number
    }
}

export default function UniClassesPage() {
    const [classes, setClasses] = useState<ClassData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await getStudentUniversityDashboard()
                if (response.success && response.data) {
                    setClasses(response.data.classes || [])
                }
            } catch (error) {
                console.error("Error fetching classes:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchClasses()
    }, [])

    const filteredClasses = classes.filter(
        (cls) =>
            cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (cls.code && cls.code.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    if (loading) {
        return (
            <div className="min-h-full p-6 lg:p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {
                            [1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-48 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
                            ))
                        }
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-full p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <School className="w-5 h-5 text-violet-500" />
                            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                                My Classes
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                            Enrolled Classes
                        </h1>
                        <p className="text-neutral-500 mt-1">
                            View and manage your enrolled classes
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-xl">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                    </div>
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
            >
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search classes..."
                        className="pl-10 rounded-xl"
                    />
                </div>
            </motion.div>

            {
                filteredClasses.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {
                            filteredClasses.map((cls, index) => (
                                <motion.div
                                    key={cls.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    <Link href={`/uni/classes/${cls.id}`}>
                                        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-all group cursor-pointer h-full">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                                                    <School className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-violet-600 transition-colors" />
                                            </div>
                                            <h3 className="font-bold text-neutral-900 dark:text-white mb-1 line-clamp-2">
                                                {cls.name}
                                            </h3>
                                            <p className="text-sm text-violet-600 dark:text-violet-400 font-medium mb-4">
                                                {cls.code}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-neutral-500">
                                                {
                                                    cls.semester && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            Sem {cls.semester}
                                                        </span>
                                                    )
                                                }
                                                {
                                                    cls._count?.assignments !== undefined && (
                                                        <span className="flex items-center gap-1">
                                                            <BookOpen className="w-3 h-3" />
                                                            {cls._count.assignments} assignments
                                                        </span>
                                                    )
                                                }
                                                {
                                                    cls._count?.enrollments !== undefined && (
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3 h-3" />
                                                            {cls._count.enrollments} students
                                                        </span>
                                                    )
                                                }
                                            </div>

                                            {
                                                cls.department && (
                                                    <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                                        <p className="text-xs text-neutral-500">
                                                            {cls.department.name}
                                                        </p>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        }
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6">
                            <School className="w-10 h-10 text-violet-500" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                            No Classes Found
                        </h2>
                        <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                            {
                                searchQuery
                                    ? "No classes match your search. Try a different keyword."
                                    : "You haven't been enrolled in any classes yet. Contact your university admin."
                            }
                        </p>
                    </motion.div>
                )
            }
        </div>
    )
}