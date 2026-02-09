"use client"

import { useState, useEffect } from "react"
import {
    GraduationCap, Search, Filter, MoreHorizontal, Globe, Activity,
    ArrowLeft, CheckCircle, Clock, Users, Building2, Download
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

interface University {
    id: string
    name: string
    website: string
    emailDomain: string
    universityType: "PUBLIC" | "PRIVATE" | "DEEMED" | "AUTONOMOUS" | "STATE" | "CENTRAL" | "AFFILIATED" | "COMMUNITY_COLLEGE" | "TECHNICAL_INSTITUTE" | "OTHER"
    city: string
    state: string
    verificationStatus: "VERIFIED" | "PENDING" | "REJECTED"
    departmentsCount: number
    studentsCount: number
    facultyCount: number
    createdAt: string
}

const mockUniversities: University[] = [
    { id: "1", name: "Delhi Technical University", website: "dtu.ac.in", emailDomain: "dtu.ac.in", universityType: "PUBLIC", city: "Delhi", state: "Delhi", verificationStatus: "VERIFIED", departmentsCount: 12, studentsCount: 8500, facultyCount: 450, createdAt: "2024-10-15" },
    { id: "2", name: "IIT Bombay", website: "iitb.ac.in", emailDomain: "iitb.ac.in", universityType: "PUBLIC", city: "Mumbai", state: "Maharashtra", verificationStatus: "VERIFIED", departmentsCount: 18, studentsCount: 12000, facultyCount: 680, createdAt: "2024-09-20" },
    { id: "3", name: "BITS Pilani", website: "bits-pilani.ac.in", emailDomain: "pilani.bits-pilani.ac.in", universityType: "DEEMED", city: "Pilani", state: "Rajasthan", verificationStatus: "VERIFIED", departmentsCount: 15, studentsCount: 9800, facultyCount: 520, createdAt: "2024-11-01" },
    { id: "4", name: "VIT Vellore", website: "vit.ac.in", emailDomain: "vit.ac.in", universityType: "PRIVATE", city: "Vellore", state: "Tamil Nadu", verificationStatus: "PENDING", departmentsCount: 0, studentsCount: 0, facultyCount: 0, createdAt: "2024-12-28" },
    { id: "5", name: "NIT Trichy", website: "nitt.edu", emailDomain: "nitt.edu", universityType: "PUBLIC", city: "Tiruchirappalli", state: "Tamil Nadu", verificationStatus: "VERIFIED", departmentsCount: 10, studentsCount: 6500, facultyCount: 340, createdAt: "2024-08-15" },
]

export default function UniUniversitiesPage() {
    const [universities, setUniversities] = useState<University[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    useEffect(() => {
        const timer = setTimeout(() => {
            setUniversities(mockUniversities)
            setIsLoading(false)
        }, 500)
        return () => clearTimeout(timer)
    }, [])

    const filteredUniversities = universities.filter(uni => {
        const matchesSearch = uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            uni.website.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || uni.verificationStatus.toLowerCase() === statusFilter.toLowerCase()
        return matchesSearch && matchesStatus
    })

    const statusColors = {
        VERIFIED: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
        PENDING: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
        REJECTED: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
    }

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Activity className="w-12 h-12 animate-spin text-violet-400 mx-auto mb-4" />
                    <p className="text-neutral-500">Loading universities...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 w-full mx-auto">
            <div className="mb-8">
                <Link href="/uni" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to University Platform
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-8 rounded-full bg-violet-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                Universities
                            </h1>
                            <p className="text-neutral-500 dark:text-neutral-400">
                                Manage registered universities
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/uni/universities/verification">
                            <Button variant="outline" size="sm" className="text-amber-600 border-amber-300 hover:bg-amber-50">
                                <Clock className="w-4 h-4 mr-2" />
                                Pending ({universities.filter(u => u.verificationStatus === "PENDING").length})
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search universities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                    <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
                        <GraduationCap className="w-4 h-4" />
                        Total
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{universities.length}</p>
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                    <div className="flex items-center gap-2 text-violet-500 text-sm mb-1">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {universities.filter(u => u.verificationStatus === "VERIFIED").length}
                    </p>
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                    <div className="flex items-center gap-2 text-blue-500 text-sm mb-1">
                        <Users className="w-4 h-4" />
                        Students
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {universities.reduce((acc, u) => acc + u.studentsCount, 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                    <div className="flex items-center gap-2 text-emerald-500 text-sm mb-1">
                        <Building2 className="w-4 h-4" />
                        Departments
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {universities.reduce((acc, u) => acc + u.departmentsCount, 0)}
                    </p>
                </div>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">University</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Location</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Students</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Faculty</th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {
                                filteredUniversities.map((uni) => (
                                    <motion.tr
                                        key={uni.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                                                    <GraduationCap className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-neutral-900 dark:text-white">{uni.name}</p>
                                                    <a href={`https://${uni.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-500 hover:underline flex items-center gap-1">
                                                        <Globe className="w-3 h-3" />
                                                        {uni.website}
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-neutral-900 dark:text-white">{uni.universityType}</td>
                                        <td className="px-4 py-4 text-neutral-500">{uni.city}, {uni.state}</td>
                                        <td className="px-4 py-4">
                                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColors[uni.verificationStatus])}>
                                                {uni.verificationStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="font-mono text-neutral-900 dark:text-white">{uni.studentsCount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="font-mono text-neutral-900 dark:text-white">{uni.facultyCount}</span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem>View Departments</DropdownMenuItem>
                                                    <DropdownMenuItem>View Students</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">Suspend</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </motion.tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}