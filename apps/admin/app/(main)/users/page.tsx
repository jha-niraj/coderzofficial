"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Users, Search, ChevronLeft, ChevronRight,
    Mail, Shield, CreditCard, Download, UserPlus, Loader2,
    MoreHorizontal
} from "lucide-react"
import {
    Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter,
    SheetClose
} from "@repo/ui/components/ui/sheet"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
    getAllUsers, bulkUpdateUsers, adminSendEmail
} from "@/actions/user.action"
import { toast } from "@repo/ui/components/ui/sonner"
import { Input } from "@repo/ui/components/ui/input"
import { Select, SelectItem } from "@repo/ui/components/ui/select"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { Button } from "@repo/ui/components/ui/button"
import Image from "next/image"


interface User {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
    username?: string | null;
    role: "Student" | "Admin";
    credits: number;
    currentXp: number;
    currentLevel: number;
    emailVerified: boolean | null;
    createdAt: Date | string;
    status: "active" | "inactive";
}

interface UserSheetData extends User {
    phone?: string | null;
    location?: string | null;
    yearofbirth?: number | null;
    tagline?: string | null;
    aboutme?: string | null;
    college?: string | null;
    interests?: string[];
    skills?: string[];
    github?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
    website?: string | null;
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
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserSheetData | null>(null)

    const fetchUsers = useCallback(async () => {
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
        } catch (err) {
            console.error("Failed to fetch users:", err)
            toast.error("Failed to fetch users")
        } finally {
            setIsLoading(false)
        }
    }, [searchQuery, roleFilter, statusFilter, currentPage, itemsPerPage]);

    // Fetch users
    useEffect(() => {
        fetchUsers()
    }, [currentPage, searchQuery, roleFilter, statusFilter, fetchUsers])

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
    }, [searchQuery, currentPage, fetchUsers])

    // Reset to page 1 when filters change
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1)
        }
    }, [roleFilter, statusFilter, currentPage])

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
        } catch (err) {
            console.error("Failed to update users:", err)
            toast.error("Failed to update users")
        }
    }

    const fetchUserDetails = async (userId: string) => {
        // Replace with your actual fetch logic or server action
        // For now, just find from users list (simulate details)
        const user = users.find(u => u.id === userId)
        if (user) {
            setSelectedUser({ ...user })
            setSheetOpen(true)
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
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <Input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        />
                    </div>
                    <Select
                        value={roleFilter}
                        onValueChange={(value) => setRoleFilter(value as "all" | "Student" | "Admin")}
                    >
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                    </Select>
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value as "all" | "active" | "inactive")}
                    >
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </Select>
                </div>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                                <th className="text-left p-4 w-12">
                                    <Input
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
                            {
                                isLoading ? (
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
                                                <Checkbox
                                                    checked={selectedUsers.includes(user.id)}
                                                    onChange={() => toggleSelectUser(user.id)}
                                                    className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-red-500 focus:ring-red-500"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <Link href={`/users/${user.id}`} className="flex items-center gap-3 group">
                                                    {
                                                        user.image ? (
                                                            <Image
                                                                src={user.image}
                                                                alt={user.name || user.email}
                                                                className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-800"
                                                                height={32}
                                                                width={32}
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-sm font-bold text-neutral-600 dark:text-neutral-300">
                                                                    {(user.name || user.email)?.[0]?.toUpperCase() || ""}
                                                                </span>
                                                            </div>
                                                        )
                                                    }
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
                                                <Sheet open={sheetOpen && selectedUser?.id === user.id} onOpenChange={setSheetOpen}>
                                                    <SheetTrigger asChild>
                                                        <Button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors" onClick={() => fetchUserDetails(user.id)}>
                                                            <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                                                        </Button>
                                                    </SheetTrigger>
                                                    <SheetContent side="right" className="max-w-md w-full">
                                                        <SheetHeader>
                                                            <SheetTitle>User Details</SheetTitle>
                                                        </SheetHeader>
                                                        {
                                                            selectedUser && (
                                                                <div className="space-y-4">
                                                                    <div className="flex flex-col items-center gap-2">
                                                                        {
                                                                            selectedUser.image ? (
                                                                                <Image src={selectedUser.image} alt={selectedUser.name || selectedUser.email} className="w-20 h-20 rounded-full border" width={80} height={80} />
                                                                            ) : (
                                                                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                                                                                    <span className="text-2xl font-bold text-neutral-600">{(selectedUser.name || selectedUser.email)?.[0]?.toUpperCase() || ""}</span>
                                                                                </div>
                                                                            )
                                                                        }
                                                                        <div className="text-center">
                                                                            <div className="text-xl font-bold">{selectedUser.name}</div>
                                                                            <div className="text-sm text-neutral-500">{selectedUser.email}</div>
                                                                            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                                                                                <span className="px-2 py-1 rounded bg-neutral-100 text-xs">{selectedUser.role}</span>
                                                                                {selectedUser.emailVerified && <span className="px-2 py-1 rounded bg-emerald-100 text-xs">Verified</span>}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4" /> {selectedUser.email}</div>
                                                                        {selectedUser.phone && <div className="flex items-center gap-2 text-sm"><span>📞</span> {selectedUser.phone}</div>}
                                                                        {selectedUser.location && <div className="flex items-center gap-2 text-sm"><span>📍</span> {selectedUser.location}</div>}
                                                                        {selectedUser.yearofbirth && <div className="flex items-center gap-2 text-sm"><span>🎂</span> {selectedUser.yearofbirth}</div>}
                                                                    </div>
                                                                    <div className="flex flex-col gap-2">
                                                                        <div className="font-semibold">Credits: <span className="font-normal">{selectedUser.credits}</span></div>
                                                                        <div className="font-semibold">XP: <span className="font-normal">{selectedUser.currentXp}</span></div>
                                                                        <div className="font-semibold">Level: <span className="font-normal">{selectedUser.currentLevel}</span></div>
                                                                    </div>
                                                                    <div className="flex flex-col gap-2">
                                                                        <Button variant="outline" className="w-full flex items-center gap-2"><Mail className="w-4 h-4" />Send Email</Button>
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 20 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl shadow-2xl p-4 flex items-center gap-4 z-50"
                                                                        >
                                                                            <span className="text-sm font-medium">{selectedUsers.length} selected</span>
                                                                            <div className="h-4 w-px bg-neutral-700 dark:bg-neutral-300" />
                                                                            <Button
                                                                                onClick={handleBulkAddCredits}
                                                                                className="flex items-center gap-2 text-sm font-medium hover:text-red-400 dark:hover:text-red-600 transition-colors"
                                                                            >
                                                                                <CreditCard className="w-4 h-4" />
                                                                                Add Credits
                                                                            </Button>
                                                                            {
                                                                                (() => {
                                                                                    const [showEmailBox, setShowEmailBox] = useState(false);
                                                                                    const [emailContent, setEmailContent] = useState("");
                                                                                    const [sending, setSending] = useState(false);

                                                                                    const handleSendEmail = async () => {
                                                                                        if (!emailContent.trim()) {
                                                                                            toast.error("Email content cannot be empty");
                                                                                            return;
                                                                                        }
                                                                                        setSending(true);
                                                                                        try {
                                                                                            const result = await adminSendEmail({
                                                                                                to: selectedUser?.email || "",
                                                                                                subject: "Message from Admin",
                                                                                                text: emailContent,
                                                                                            });
                                                                                            if (result.success) {
                                                                                                toast.success("Email sent successfully");
                                                                                                setShowEmailBox(false);
                                                                                                setEmailContent("");
                                                                                            } else {
                                                                                                toast.error(result.error || "Failed to send email");
                                                                                            }
                                                                                        } catch (err) {
                                                                                            toast.error("Failed to send email");
                                                                                        } finally {
                                                                                            setSending(false);
                                                                                        }
                                                                                    };

                                                                                    return showEmailBox ? (
                                                                                        <div className="flex flex-col gap-2 w-full">
                                                                                            <textarea
                                                                                                className="w-full min-h-[80px] rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                                                                                placeholder="Write your message to the user..."
                                                                                                value={emailContent}
                                                                                                onChange={e => setEmailContent(e.target.value)}
                                                                                                disabled={sending}
                                                                                            />
                                                                                            <div className="flex gap-2">
                                                                                                <Button
                                                                                                    variant="secondary"
                                                                                                    className="flex-1"
                                                                                                    onClick={() => setShowEmailBox(false)}
                                                                                                    disabled={sending}
                                                                                                >
                                                                                                    Cancel
                                                                                                </Button>
                                                                                                <Button
                                                                                                    className="flex-1"
                                                                                                    onClick={handleSendEmail}
                                                                                                    disabled={sending}
                                                                                                >
                                                                                                    {sending ? "Sending..." : "Send Email"}
                                                                                                </Button>
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <Button
                                                                                            className="flex items-center gap-2 text-sm font-medium hover:text-red-400 dark:hover:text-red-600 transition-colors"
                                                                                            onClick={() => setShowEmailBox(true)}
                                                                                        >
                                                                                            <Mail className="w-4 h-4" />
                                                                                            Send Email
                                                                                        </Button>
                                                                                    );
                                                                                })()
                                                                            }
                                                                            <Button
                                                                                onClick={() => setSelectedUsers([])}
                                                                                className="text-sm font-medium text-neutral-400 dark:text-neutral-600 hover:text-white dark:hover:text-neutral-900 transition-colors"
                                                                            >
                                                                                Clear
                                                                            </Button>
                                                                        </motion.div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                        <SheetFooter className="mt-6">
                                                            <SheetClose asChild>
                                                                <Button variant="secondary" className="w-full">Close</Button>
                                                            </SheetClose>
                                                        </SheetFooter>
                                                    </SheetContent>
                                                </Sheet>
                                            </td>
                                        </tr>
                                    ))
                                )
                            }
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between p-4 border-t border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400 px-3">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}