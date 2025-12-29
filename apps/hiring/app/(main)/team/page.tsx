"use client"

import { motion } from "framer-motion"
import { UserPlus, Users, Shield, Mail, MoreVertical } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { useSession } from "@repo/auth/client"

export default function TeamPage() {
    const { data: session } = useSession()

    const teamMembers: Array<{
        id: string
        name: string
        email: string
        role: "HEAD" | "RECRUITER"
        status: "active" | "pending"
        joinedDate: string
    }> = []

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                        Team Members
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Manage your hiring team and permissions
                    </p>
                </div>
                <Button className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Member
                </Button>
            </div>

            {/* Current User */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 mb-6"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            <span className="text-lg font-bold text-neutral-600 dark:text-neutral-400">
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
                        <span className="text-xs px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Admin
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Team List */}
            {teamMembers.length > 0 ? (
                <div className="space-y-4">
                    {teamMembers.map((member) => (
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
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                        {member.role}
                                    </span>
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
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-neutral-400" />
                    </div>
                    <h3 className="font-bold text-xl text-neutral-900 dark:text-white mb-2">
                        Invite your team
                    </h3>
                    <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                        Add team members to collaborate on hiring and manage candidates together.
                    </p>
                    <Button className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                        <Mail className="w-4 h-4 mr-2" />
                        Send Invite
                    </Button>
                </motion.div>
            )}
        </div>
    )
}
