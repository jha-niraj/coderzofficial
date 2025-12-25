"use client"

import { useState, useEffect } from "react"
import {
    BarChart3, Users, TrendingUp, Activity, Download, Loader2
} from "lucide-react"
import {
    getOverviewStats, getUserGrowthStats, getEngagementStats, getModuleUsageStats
} from "@/actions/analytics.action"
import { toast } from "@repo/ui/components/ui/sonner"
import type { ChartData } from "@/types/admin"

interface OverviewStats {
    totalUsers?: number
    newUsers?: number
    totalProjects?: number
    activeCommunities?: number
    totalFeedback?: number
}

interface UserGrowthData {
    chartData: ChartData[]
    total: number
}

interface EngagementData {
    projectsStarted?: number
    feedbackSubmitted?: number
    communitiesJoined?: number
    mocksCompleted?: number
}

interface ModuleItem {
    name: string
    count: number
}

interface ModuleUsageData {
    modules: ModuleItem[]
}

export default function AnalyticsPage() {
    const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null)
    const [userGrowth, setUserGrowth] = useState<UserGrowthData | null>(null)
    const [engagement, setEngagement] = useState<EngagementData | null>(null)
    const [moduleUsage, setModuleUsage] = useState<ModuleUsageData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    async function fetchAnalytics() {
        setIsLoading(true)
        try {
            const [overviewRes, growthRes, engagementRes, moduleRes] = await Promise.all([
                getOverviewStats(),
                getUserGrowthStats(),
                getEngagementStats(),
                getModuleUsageStats(),
            ])

            if (overviewRes.success) setOverviewStats(overviewRes.data)
            if (growthRes.success) setUserGrowth(growthRes.data)
            if (engagementRes.success) setEngagement(engagementRes.data)
            if (moduleRes.success) setModuleUsage(moduleRes.data)
        } catch (error) {
            console.error("Failed to fetch analytics:", error)
            toast.error("Failed to load analytics")
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-500 dark:text-neutral-400">Loading analytics...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                        <BarChart3 className="w-7 h-7" />
                        Platform Analytics
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Insights and metrics for your platform
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors">
                    <Download className="w-4 h-4" />
                    Export Report
                </button>
            </div>
            {
            overviewStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {overviewStats.totalUsers?.toLocaleString()}
                                </p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Users</p>
                            </div>
                        </div>
                        <p className="text-xs text-emerald-500">
                            +{overviewStats.newUsers} new this period
                        </p>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {overviewStats.totalProjects?.toLocaleString()}
                                </p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Projects</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {overviewStats.activeCommunities?.toLocaleString()}
                                </p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Communities</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {overviewStats.totalFeedback?.toLocaleString()}
                                </p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Feedback</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
            {
            userGrowth && (
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                        User Growth
                    </h2>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {
                        userGrowth.chartData?.slice(0, 30).map((item: ChartData, index: number) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                                    style={{
                                        height: `${Math.max((item.value / Math.max(...userGrowth.chartData.map((d: ChartData) => d.value))) * 100, 5)}%`,
                                    }}
                                />
                            </div>
                        ))
                        }
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4 text-center">
                        Last 30 days • Total new users: {userGrowth.total}
                    </p>
                </div>
            )
            }
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {
                engagement && (
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                            Engagement Metrics
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-600 dark:text-neutral-400">Projects Started</span>
                                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                                    {engagement.projectsStarted?.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-600 dark:text-neutral-400">Feedback Submitted</span>
                                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                                    {engagement.feedbackSubmitted?.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-600 dark:text-neutral-400">Communities Joined</span>
                                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                                    {engagement.communitiesJoined?.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-600 dark:text-neutral-400">Mocks Completed</span>
                                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                                    {engagement.mocksCompleted?.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )
                }
                {
                moduleUsage && (
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                            Module Usage
                        </h2>
                        <div className="space-y-3">
                            {
                                moduleUsage.modules?.map((module: ModuleItem, index: number) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-neutral-600 dark:text-neutral-400">{module.name}</span>
                                            <span className="font-semibold text-neutral-900 dark:text-white">
                                                {module.count?.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.max((module.count / Math.max(...moduleUsage.modules.map((m: ModuleItem) => m.count))) * 100, 5)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )
                }
            </div>
        </div>
    )
}