"use client"

import { useState, useEffect } from "react"
import {
    Users, Search, Filter, MoreHorizontal, Mail, Calendar, Shield,
    Activity, ArrowLeft, UserCheck, UserX, Download, RefreshCw
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@repo/ui/components/ui/dropdown-menu"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select"

interface User {
    id: string
    name: string
    email: string
    role: string
    credits: number
    createdAt: string
    status: "active" | "inactive" | "suspended"
}

const mockUsers: User[] = [
    { id: "1", name: "Rahul Sharma", email: "rahul@gmail.com", role: "User", credits: 150, createdAt: "2024-12-15", status: "active" },
    { id: "2", name: "Priya Patel", email: "priya@gmail.com", role: "User", credits: 280, createdAt: "2024-12-10", status: "active" },
    { id: "3", name: "Amit Kumar", email: "amit@gmail.com", role: "Pro", credits: 520, createdAt: "2024-11-28", status: "active" },
    { id: "4", name: "Sneha Gupta", email: "sneha@gmail.com", role: "User", credits: 45, createdAt: "2024-12-20", status: "inactive" },
    { id: "5", name: "Vikram Singh", email: "vikram@gmail.com", role: "Admin", credits: 1000, createdAt: "2024-10-05", status: "active" },
]

export default function MainUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setUsers(mockUsers)
            setIsLoading(false)
        }, 500)
        return () => clearTimeout(timer)
    }, [])

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter.toLowerCase()
        return matchesSearch && matchesRole
    })

    const statusColors = {
        active: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
        inactive: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400",
        suspended: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
    }

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Activity className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
                    <p className="text-neutral-500">Loading users...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 w-full mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link href="/main" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Main Platform
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-8 rounded-full bg-blue-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                User Management
                            </h1>
                            <p className="text-neutral-500 dark:text-neutral-400">
                                Manage main platform users
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[150px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                    <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
                        <Users className="w-4 h-4" />
                        Total Users
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{users.length.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                    <div className="flex items-center gap-2 text-emerald-500 text-sm mb-1">
                        <UserCheck className="w-4 h-4" />
                        Active
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {users.filter(u => u.status === "active").length}
                    </p>
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                    <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
                        <UserX className="w-4 h-4" />
                        Inactive
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {users.filter(u => u.status === "inactive").length}
                    </p>
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                    <div className="flex items-center gap-2 text-purple-500 text-sm mb-1">
                        <Shield className="w-4 h-4" />
                        Pro Users
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {users.filter(u => u.role === "Pro").length}
                    </p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">User</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Role</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Credits</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Joined</th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {filteredUsers.map((user) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900 dark:text-white">{user.name}</p>
                                                <p className="text-sm text-neutral-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-xs font-medium",
                                            user.role === "Admin" ? "bg-red-50 dark:bg-red-900/20 text-red-600" :
                                                user.role === "Pro" ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600" :
                                                    "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                                        )}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="font-mono text-neutral-900 dark:text-white">{user.credits}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium capitalize", statusColors[user.status])}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Mail className="w-4 h-4 mr-2" />
                                                    Send Email
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Shield className="w-4 h-4 mr-2" />
                                                    Change Role
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">
                                                    <UserX className="w-4 h-4 mr-2" />
                                                    Suspend User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
