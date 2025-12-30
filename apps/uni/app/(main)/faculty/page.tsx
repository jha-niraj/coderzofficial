"use client"

import { motion } from "framer-motion"
import { UserPlus, Users, Shield, Mail, MoreVertical, GraduationCap, BookOpen } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { useSession } from "@repo/auth/client"

export default function FacultyPage() {
    const { data: session } = useSession()

    const facultyMembers: Array<{
        id: string
        name: string
        email: string
        role: "HEAD" | "DEPARTMENT_HEAD" | "FACULTY" | "TEACHING_ASSISTANT" | "PLACEMENT_OFFICER"
        department?: string
        status: "active" | "pending"
        classes: number
    }> = []

    const roleColors = {
        HEAD: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
        DEPARTMENT_HEAD: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        FACULTY: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
        TEACHING_ASSISTANT: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
        PLACEMENT_OFFICER: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
    }

    const roleLabels = {
        HEAD: "University Admin",
        DEPARTMENT_HEAD: "Dept. Head",
        FACULTY: "Faculty",
        TEACHING_ASSISTANT: "TA",
        PLACEMENT_OFFICER: "Placement",
    }

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                        Faculty & Staff
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Manage faculty members, department heads, and teaching assistants.
                    </p>
                </div>
                <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Faculty
                </Button>
            </div>

            {/* Role Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
            >
                {[
                    { role: "HEAD", count: 1, icon: Shield },
                    { role: "DEPARTMENT_HEAD", count: 0, icon: GraduationCap },
                    { role: "FACULTY", count: 0, icon: BookOpen },
                    { role: "TEACHING_ASSISTANT", count: 0, icon: Users },
                    { role: "PLACEMENT_OFFICER", count: 0, icon: UserPlus },
                ].map((item) => (
                    <div
                        key={item.role}
                        className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5 text-violet-600" />
                            <div>
                                <p className="text-xl font-bold text-neutral-900 dark:text-white">{item.count}</p>
                                <p className="text-xs text-neutral-500">{roleLabels[item.role as keyof typeof roleLabels]}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Current User */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 mb-6"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                                {session?.user?.name?.charAt(0) || "U"}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                {session?.user?.name || "You"}
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                    You
                                </span>
                            </h3>
                            <p className="text-sm text-neutral-500">{session?.user?.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 ${roleColors.HEAD}`}>
                            <Shield className="w-3 h-3" />
                            University Admin
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Faculty List */}
            {facultyMembers.length > 0 ? (
                <div className="space-y-4">
                    {facultyMembers.map((member) => (
                        <div
                            key={member.id}
                            className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                        <span className="text-lg font-bold text-neutral-600 dark:text-neutral-400">
                                            {member.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900 dark:text-white">{member.name}</h3>
                                        <p className="text-sm text-neutral-500">{member.email}</p>
                                        {member.department && (
                                            <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">{member.department}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${roleColors[member.role]}`}>
                                            {roleLabels[member.role]}
                                        </span>
                                        <p className="text-xs text-neutral-500 mt-1">{member.classes} classes</p>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center py-16 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl"
                >
                    <div className="w-20 h-20 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-violet-600" />
                    </div>
                    <h3 className="font-bold text-xl text-neutral-900 dark:text-white mb-2">
                        Invite your faculty
                    </h3>
                    <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                        Add professors, department heads, and teaching assistants to create and manage assignments.
                    </p>
                    <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                        <Mail className="w-4 h-4 mr-2" />
                        Send Invitation
                    </Button>
                </motion.div>
            )}
        </div>
    )
}
