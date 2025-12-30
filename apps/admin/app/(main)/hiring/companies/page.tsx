"use client"

import { useState, useEffect } from "react"
import {
    Building2, Search, Filter, MoreHorizontal, Globe,
    Activity, ArrowLeft, CheckCircle, Clock, Users, Briefcase, Download
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

interface Company {
    id: string
    name: string
    website: string
    industry: string
    size: string
    verificationStatus: "VERIFIED" | "PENDING" | "REJECTED"
    membersCount: number
    jobsCount: number
    createdAt: string
}

const mockCompanies: Company[] = [
    { id: "1", name: "TechCorp Solutions", website: "techcorp.io", industry: "Software", size: "51-200", verificationStatus: "VERIFIED", membersCount: 12, jobsCount: 8, createdAt: "2024-11-15" },
    { id: "2", name: "DataFlow Analytics", website: "dataflow.com", industry: "Data Analytics", size: "11-50", verificationStatus: "VERIFIED", membersCount: 5, jobsCount: 3, createdAt: "2024-12-01" },
    { id: "3", name: "CloudNest Technologies", website: "cloudnest.tech", industry: "Cloud Services", size: "201-500", verificationStatus: "PENDING", membersCount: 0, jobsCount: 0, createdAt: "2024-12-28" },
    { id: "4", name: "InnovateTech Labs", website: "innovatetech.in", industry: "R&D", size: "11-50", verificationStatus: "VERIFIED", membersCount: 8, jobsCount: 5, createdAt: "2024-10-20" },
    { id: "5", name: "FinServe Global", website: "finserve.com", industry: "Fintech", size: "501-1000", verificationStatus: "VERIFIED", membersCount: 25, jobsCount: 15, createdAt: "2024-09-15" },
]

export default function HiringCompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    useEffect(() => {
        const timer = setTimeout(() => {
            setCompanies(mockCompanies)
            setIsLoading(false)
        }, 500)
        return () => clearTimeout(timer)
    }, [])

    const filteredCompanies = companies.filter(company => {
        const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.website.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || company.verificationStatus.toLowerCase() === statusFilter.toLowerCase()
        return matchesSearch && matchesStatus
    })

    const statusColors = {
        VERIFIED: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
        PENDING: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
        REJECTED: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
    }

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Activity className="w-12 h-12 animate-spin text-emerald-400 mx-auto mb-4" />
                    <p className="text-neutral-500">Loading companies...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 w-full mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link href="/hiring" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Hiring Platform
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-8 rounded-full bg-emerald-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                Companies
                            </h1>
                            <p className="text-neutral-500 dark:text-neutral-400">
                                Manage registered companies
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/hiring/companies/verification">
                            <Button variant="outline" size="sm" className="text-amber-600 border-amber-300 hover:bg-amber-50">
                                <Clock className="w-4 h-4 mr-2" />
                                Pending ({companies.filter(c => c.verificationStatus === "PENDING").length})
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search companies..."
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

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                    <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
                        <Building2 className="w-4 h-4" />
                        Total
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{companies.length}</p>
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                    <div className="flex items-center gap-2 text-emerald-500 text-sm mb-1">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {companies.filter(c => c.verificationStatus === "VERIFIED").length}
                    </p>
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                    <div className="flex items-center gap-2 text-blue-500 text-sm mb-1">
                        <Users className="w-4 h-4" />
                        Members
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {companies.reduce((acc, c) => acc + c.membersCount, 0)}
                    </p>
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                    <div className="flex items-center gap-2 text-purple-500 text-sm mb-1">
                        <Briefcase className="w-4 h-4" />
                        Active Jobs
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {companies.reduce((acc, c) => acc + c.jobsCount, 0)}
                    </p>
                </div>
            </div>

            {/* Companies Table */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Company</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Industry</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Size</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Members</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Jobs</th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {filteredCompanies.map((company) => (
                                <motion.tr
                                    key={company.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900 dark:text-white">{company.name}</p>
                                                <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-500 hover:underline flex items-center gap-1">
                                                    <Globe className="w-3 h-3" />
                                                    {company.website}
                                                </a>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-neutral-900 dark:text-white">{company.industry}</td>
                                    <td className="px-4 py-4 text-neutral-500">{company.size}</td>
                                    <td className="px-4 py-4">
                                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColors[company.verificationStatus])}>
                                            {company.verificationStatus}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="font-mono text-neutral-900 dark:text-white">{company.membersCount}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="font-mono text-neutral-900 dark:text-white">{company.jobsCount}</span>
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
                                                <DropdownMenuItem>View Members</DropdownMenuItem>
                                                <DropdownMenuItem>View Jobs</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">Suspend</DropdownMenuItem>
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
