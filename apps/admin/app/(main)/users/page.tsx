"use client"

import { useState, useEffect } from "react"
import { 
    Users, Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight,
    Mail, Shield, CreditCard, Download, UserPlus, Loader2
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface User {
    id: string
    name: string
    email: string
    image?: string
    role: "Student" | "Admin"
    credits: number
    xp: number
    createdAt: string
    status: "active" | "inactive"
}

// Mock data - replace with actual API
const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 10 === 0 ? "Admin" : "Student",
    credits: Math.floor(Math.random() * 5000),
    xp: Math.floor(Math.random() * 10000),
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: Math.random() > 0.1 ? "active" : "inactive"
}))

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>(mockUsers)
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState<"all" | "Student" | "Admin">("all")
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const itemsPerPage = 10

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = roleFilter === "all" || user.role === roleFilter
        const matchesStatus = statusFilter === "all" || user.status === statusFilter
        return matchesSearch && matchesRole && matchesStatus
    })

    // Paginate
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const toggleSelectAll = () => {
        if (selectedUsers.length === paginatedUsers.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(paginatedUsers.map(u => u.id))
        }
    }

    const toggleSelectUser = (userId: string) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
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
                                        checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
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
                            {paginatedUsers.map((user) => (
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
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-bold text-neutral-600 dark:text-neutral-300">
                                                    {user.name[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
                                                    {user.name}
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
                                            {user.xp.toLocaleString()}
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
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
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
                    <button className="flex items-center gap-2 text-sm font-medium hover:text-red-400 dark:hover:text-red-600 transition-colors">
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



