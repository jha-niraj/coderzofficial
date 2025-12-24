"use client"

import { useState, useEffect } from "react"
import { 
    Users, Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight,
    Mail, Shield, CreditCard, Download, UserPlus, Loader2
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { 
    getAllUsers, bulkUpdateUsers 
} from "@/actions/user.action"
import { toast } from "@repo/ui/components/ui/sonner"

interface User {
    id: string
    name: string | null
    email: string
    image?: string | null
    username?: string | null
    role: "Student" | "Admin"
    credits: number
    currentXp: number
    currentLevel: number
    emailVerified: boolean | null
    createdAt: Date | string
    status: "active" | "inactive"
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [totalUsers, setTotalUsers] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState<"all" | "Student" | "Admin">("all")
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const itemsPerPage = 10

    // Fetch users
    useEffect(() => {
        fetchUsers()
    }, [currentPage, searchQuery, roleFilter, statusFilter])

    async function fetchUsers() {
        setIsLoading(true)
        try {
            const result = await getAllUsers(
                {
                    search: searchQuery || undefined,
                    role: roleFilter,
                    status: statusFilter,
                },
                {
                    page: currentPage,
                    limit: itemsPerPage,
                }
            )

            if (result.success && result.data) {
                setUsers(result.data.users)
                setTotalUsers(result.data.total)
                setTotalPages(result.data.pages)
            } else {
                toast.error(result.error || "Failed to fetch users")
            }
        } catch (error) {
            console.error("Failed to fetch users:", error)
            toast.error("Failed to fetch users")
        } finally {
            setIsLoading(false)
        }
    }

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage === 1) {
                fetchUsers()
            } else {
                setCurrentPage(1)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery])

    // Reset to page 1 when filters change
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1)
        }
    }, [roleFilter, statusFilter])

    // Handle bulk add credits
    async function handleBulkAddCredits() {
        const amount = prompt("Enter credits amount to add:")
        if (!amount || isNaN(Number(amount))) return

        try {
            const result = await bulkUpdateUsers(selectedUsers, {
                addCredits: Number(amount),
            })

            if (result.success) {
                toast.success(`Added ${amount} credits to ${selectedUsers.length} users`)
                setSelectedUsers([])
                fetchUsers()
            } else {
                toast.error(result.error || "Failed to update users")
            }
        } catch (error) {
            toast.error("Failed to update users")
        }
    }

    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(users.map(u => u.id))
        }
    }

    const toggleSelectUser = (userId: string) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    if (isLoading && users.length === 0) {
        return (
            <div className="p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-500 dark:text-neutral-400">Loading users...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                        <Users className="w-7 h-7" />
                        Users Management
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Manage and monitor all users on the platform
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors">
                        <UserPlus className="w-4 h-4" />
                        Add User
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as any)}
                        className="px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    >
                        <option value="all">All Roles</option>
                        <option value="Student">Student</option>
                        <option value="Admin">Admin</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                                <th className="text-left p-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.length === users.length && users.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-red-500 focus:ring-red-500"
                                    />
                                </th>
                                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">User</th>
                                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Role</th>
                                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Credits</th>
                                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">XP</th>
                                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Status</th>
                                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Joined</th>
                                <th className="text-left p-4 w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mx-auto" />
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                <tr 
                                    key={user.id}
                                    className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                                >
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={() => toggleSelectUser(user.id)}
                                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-red-500 focus:ring-red-500"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <Link href={`/users/${user.id}`} className="flex items-center gap-3 group">
                                            {user.image ? (
                                                <img
                                                    src={user.image}
                                                    alt={user.name || user.email}
                                                    className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-800"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-bold text-neutral-600 dark:text-neutral-300">
                                                        {(user.name || user.email)?.[0]?.toUpperCase() || ""}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-neutral-900 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
                                                    {user.name || "No name"}
                                                </p>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</p>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="p-4">
                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                                            user.role === "Admin" 
                                                ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                                                : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                        )}>
                                            {user.role === "Admin" && <Shield className="w-3 h-3" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-medium text-neutral-900 dark:text-white">
                                            {user.credits.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-medium text-neutral-900 dark:text-white">
                                            {user.currentXp.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                                            user.status === "active"
                                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                                        )}>
                                            <span className={cn(
                                                "w-1.5 h-1.5 rounded-full mr-1.5",
                                                user.status === "active" ? "bg-emerald-500" : "bg-neutral-400"
                                            )} />
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                                            <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                                        </button>
                                    </td>
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400 px-3">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl shadow-2xl p-4 flex items-center gap-4 z-50"
                >
                    <span className="text-sm font-medium">{selectedUsers.length} selected</span>
                    <div className="h-4 w-px bg-neutral-700 dark:bg-neutral-300" />
                    <button 
                        onClick={handleBulkAddCredits}
                        className="flex items-center gap-2 text-sm font-medium hover:text-red-400 dark:hover:text-red-600 transition-colors"
                    >
                        <CreditCard className="w-4 h-4" />
                        Add Credits
                    </button>
                    <button className="flex items-center gap-2 text-sm font-medium hover:text-red-400 dark:hover:text-red-600 transition-colors">
                        <Mail className="w-4 h-4" />
                        Send Email
                    </button>
                    <button 
                        onClick={() => setSelectedUsers([])}
                        className="text-sm font-medium text-neutral-400 dark:text-neutral-600 hover:text-white dark:hover:text-neutral-900 transition-colors"
                    >
                        Clear
                    </button>
                </motion.div>
            )}
        </div>
    )
}



