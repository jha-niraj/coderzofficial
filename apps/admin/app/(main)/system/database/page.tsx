"use client"

import { useState, useEffect } from "react"
import { 
    Database, Activity, RefreshCw, Loader2, CheckCircle, AlertCircle 
} from "lucide-react"
import { 
    getDatabaseStats, getSystemHealth 
} from "@/actions/system.action"
import { toast } from "@repo/ui/components/ui/sonner"
import { format } from "date-fns"

export default function DatabaseHealthPage() {
    const [dbStats, setDbStats] = useState<any>(null)
    const [health, setHealth] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        if (!loading) setRefreshing(true)
        
        try {
            const [statsResult, healthResult] = await Promise.all([
                getDatabaseStats(),
                getSystemHealth()
            ])

            if (statsResult.success) {
                setDbStats(statsResult.data)
            }

            if (healthResult.success) {
                setHealth(healthResult.data)
            }
        } catch (error) {
            console.error("Fetch error:", error)
            toast.error("Failed to fetch system data")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    if (loading) {
        return (
            <div className="p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-500 dark:text-neutral-400">Loading system data...</p>
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
                        <Database className="w-7 h-7" />
                        Database & System Health
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Monitor database statistics and system health
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-lg hover:from-red-600 hover:to-orange-600 disabled:opacity-50 transition-colors"
                >
                    {refreshing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4" />
                    )}
                    Refresh
                </button>
            </div>

            {/* System Health Status */}
            {health && (
                <div className="mb-8">
                    <div className={`p-6 rounded-xl border ${
                        health.databaseStatus === 'healthy' 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                        <div className="flex items-center gap-3 mb-4">
                            {health.databaseStatus === 'healthy' ? (
                                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            )}
                            <div>
                                <h2 className={`text-xl font-bold ${
                                    health.databaseStatus === 'healthy'
                                        ? 'text-emerald-900 dark:text-emerald-200'
                                        : 'text-red-900 dark:text-red-200'
                                }`}>
                                    System Status: {health.databaseStatus === 'healthy' ? 'Healthy' : 'Unhealthy'}
                                </h2>
                                <p className={`text-sm ${
                                    health.databaseStatus === 'healthy'
                                        ? 'text-emerald-700 dark:text-emerald-300'
                                        : 'text-red-700 dark:text-red-300'
                                }`}>
                                    Last checked: {health.timestamp ? format(new Date(health.timestamp), "MMM dd, yyyy HH:mm:ss") : 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-4 rounded-lg ${
                                health.databaseStatus === 'healthy'
                                    ? 'bg-white dark:bg-neutral-800'
                                    : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Database Connection</p>
                                <p className={`text-lg font-semibold ${
                                    health.databaseStatus === 'healthy'
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {health.databaseStatus === 'healthy' ? 'Connected' : 'Disconnected'}
                                </p>
                            </div>
                            <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg">
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Active Users (24h)</p>
                                <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    {health.activeUsersLast24h?.toLocaleString() || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Database Statistics */}
            {dbStats && (
                <>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                        Database Statistics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <StatCard
                            label="Users"
                            value={dbStats.users}
                            icon="👥"
                            color="blue"
                        />
                        <StatCard
                            label="Projects"
                            value={dbStats.projects}
                            icon="📁"
                            color="purple"
                        />
                        <StatCard
                            label="Communities"
                            value={dbStats.communities}
                            icon="🌐"
                            color="emerald"
                        />
                        <StatCard
                            label="Mock Interviews"
                            value={dbStats.mockInterviews}
                            icon="🎤"
                            color="amber"
                        />
                        <StatCard
                            label="Feedback"
                            value={dbStats.feedback}
                            icon="💬"
                            color="red"
                        />
                        <StatCard
                            label="Credit Transactions"
                            value={dbStats.creditTransactions}
                            icon="💰"
                            color="indigo"
                        />
                        <StatCard
                            label="Assessment Questions"
                            value={dbStats.assessmentQuestions}
                            icon="❓"
                            color="pink"
                        />
                        <StatCard
                            label="Forge Tracks"
                            value={dbStats.forgeTracks}
                            icon="🛤️"
                            color="orange"
                        />
                        <StatCard
                            label="Crucible Events"
                            value={dbStats.crucibleEvents}
                            icon="🔥"
                            color="cyan"
                        />
                    </div>
                </>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    System Monitoring
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Page auto-refreshes every 30 seconds</li>
                    <li>• Database health checks connection status</li>
                    <li>• Statistics show real-time record counts</li>
                    <li>• Active users based on last 24 hours of activity</li>
                </ul>
            </div>
        </div>
    )
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
        emerald: 'from-emerald-500 to-emerald-600',
        amber: 'from-amber-500 to-amber-600',
        red: 'from-red-500 to-red-600',
        indigo: 'from-indigo-500 to-indigo-600',
        pink: 'from-pink-500 to-pink-600',
        orange: 'from-orange-500 to-orange-600',
        cyan: 'from-cyan-500 to-cyan-600',
    }

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
            <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center text-white text-xl`}>
                    {icon}
                </div>
                <div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {value?.toLocaleString()}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
                </div>
            </div>
        </div>
    )
}
