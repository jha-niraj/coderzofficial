"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search, Filter, Building2, ChevronRight, Users, MapPin,
    CheckCircle2, Briefcase, Star, Globe, ExternalLink
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Badge } from "@repo/ui/components/ui/badge"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@repo/ui/components/ui/sheet"
import Link from "next/link"

interface Company {
    id: string
    name: string
    slug: string
    logoUrl: string | null
    website: string | null
    industry: string | null
    companySize: string | null
    description: string | null
    verificationStatus: string
    headquarters: string | null
    activeJobsCount: number
    hasTransparentProcess: boolean
}

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

interface CompaniesContentProps {
    initialCompanies: Company[]
    initialPagination: Pagination
    featuredCompanies: Company[]
}

export function CompaniesContent({
    initialCompanies,
    initialPagination,
    featuredCompanies
}: CompaniesContentProps) {
    const [companies] = useState<Company[]>(initialCompanies)
    const [searchQuery, setSearchQuery] = useState("")
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                        Discover Companies
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Find companies with transparent interview processes
                    </p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search companies by name or industry..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                    />
                </div>
                <Button 
                    variant="outline" 
                    className="rounded-xl"
                    onClick={() => setIsFilterOpen(true)}
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </Button>
            </div>

            {/* Featured Companies */}
            {featuredCompanies.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Featured Companies
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featuredCompanies.slice(0, 6).map((company, index) => (
                            <Link key={company.id} href={`/companies/${company.slug}`}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-gradient-to-br from-neutral-50 to-neutral-100/50 dark:from-neutral-900 dark:to-neutral-800/50 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all h-full"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
                                            {company.logoUrl ? (
                                                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="w-7 h-7 text-neutral-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-neutral-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {company.name}
                                                </h3>
                                                {company.verificationStatus === "VERIFIED" && (
                                                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-sm text-neutral-500">{company.industry}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-4 text-sm text-neutral-500">
                                        {company.headquarters && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{company.headquarters}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Briefcase className="w-4 h-4" />
                                            <span>{company.activeJobsCount} open jobs</span>
                                        </div>
                                    </div>

                                    {company.hasTransparentProcess && (
                                        <div className="flex items-center gap-2 mt-3 text-xs text-green-600 dark:text-green-400">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>Transparent Interview Process</span>
                                        </div>
                                    )}
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* All Companies */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        All Companies
                    </h2>
                    <span className="text-sm text-neutral-500">
                        {initialPagination.total} companies
                    </span>
                </div>

                <AnimatePresence mode="popLayout">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {companies.map((company, index) => (
                            <Link key={company.id} href={`/companies/${company.slug}`}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all h-full"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
                                            {company.logoUrl ? (
                                                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="w-6 h-6 text-neutral-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-neutral-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {company.name}
                                                </h3>
                                                {company.verificationStatus === "VERIFIED" && (
                                                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                                                )}
                                            </div>
                                            {company.industry && (
                                                <p className="text-sm text-neutral-500">{company.industry}</p>
                                            )}
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors shrink-0" />
                                    </div>

                                    {company.description && (
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3 line-clamp-2">
                                            {company.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-3 text-sm text-neutral-500">
                                            {company.companySize && (
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    <span>{company.companySize}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Briefcase className="w-4 h-4" />
                                                <span>{company.activeJobsCount} jobs</span>
                                            </div>
                                        </div>
                                        {company.hasTransparentProcess && (
                                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                                                Transparent
                                            </Badge>
                                        )}
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </AnimatePresence>

                {/* Empty State */}
                {companies.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <Building2 className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-neutral-900 dark:text-white mb-2">
                            No companies found
                        </h3>
                        <p className="text-neutral-500 max-w-md mx-auto">
                            Try adjusting your filters or check back later.
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Filters Sheet */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetContent className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Filter Companies</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                        <p className="text-neutral-500 text-sm">Filter controls coming soon...</p>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
