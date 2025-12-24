'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
    Hammer, Flame, ChevronRight, Zap, Users, Trophy, Clock, Star, Lock, 
    CheckCircle2, Play, Sparkles, Code2, Brain, Target, TrendingUp, ArrowRight
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { 
    Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@repo/ui/components/ui/card'
import { Progress } from '@repo/ui/components/ui/progress'
import { seedSampleChallenges } from '@/actions/(main)/challenges/seed-challenges.action'
import toast from '@repo/ui/components/ui/sonner'
import { cn } from '@repo/ui/lib/utils'

interface ForgeTrack {
    id: string
    name: string
    slug: string
    description: string
    shortDescription?: string | null
    icon?: string | null
    coverImage?: string | null
    themeColor: string
    technology: string
    level: string
    estimatedHours: number
    creditsRequired: number
    isFree: boolean
    totalXp: number
    enrollmentCount: number
    completionCount: number
    _count?: {
        steps: number
        enrollments: number
        completions: number
    }
}

interface CrucibleEvent {
    id: string
    name: string
    slug: string
    description: string
    shortDescription?: string | null
    icon?: string | null
    coverImage?: string | null
    themeColor: string
    eventType: string
    status: string
    startsAt?: Date | null
    endsAt?: Date | null
    isFree: boolean
    totalParticipants: number
    totalProblems: number
    _count?: {
        problems: number
        participations: number
    }
}

interface UserProgress {
    enrollments: Array<{
        trackId: string
        completedSteps: number
        totalXpEarned: number
        isCompleted: boolean
        track: {
            _count: { steps: number }
        }
    }>
    completions: Array<{ trackId: string }>
}

interface ChallengesHubClientProps {
    user: { id: string; name: string | null; image: string | null } | null
    forgeTracks: ForgeTrack[]
    crucibleEvents: CrucibleEvent[]
    userProgress: UserProgress | null
}

const levelColors: Record<string, string> = {
    BEGINNER: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    INTERMEDIATE: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    ADVANCED: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
}

const statusColors: Record<string, string> = {
    UPCOMING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    ACTIVE: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    ENDED: 'bg-neutral-100 dark:bg-neutral-900/30 text-neutral-700 dark:text-neutral-400',
}

export function ChallengesHubClient({
    user,
    forgeTracks,
    crucibleEvents,
    userProgress
}: ChallengesHubClientProps) {
    const [seeding, setSeeding] = useState(false)

    const handleSeed = async () => {
        setSeeding(true)
        try {
            const result = await seedSampleChallenges()
            if (result.success) {
                toast.success(result.message)
                window.location.reload()
            } else {
                toast.error(result.error || 'Failed to seed')
            }
        } catch {
            toast.error('Failed to seed challenges')
        } finally {
            setSeeding(false)
        }
    }

    const getUserEnrollment = (trackId: string) => {
        return userProgress?.enrollments.find(e => e.trackId === trackId)
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-neutral-200 dark:border-neutral-800">
                {/* Background Pattern */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <Badge 
                            variant="outline" 
                            className="mb-6 px-4 py-1.5 rounded-full border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-neutral-900/50"
                        >
                            <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
                            Master Through Building & Solving
                        </Badge>
                        
                        <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight">
                            The Coderz{' '}
                            <span className="bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
                                Challenges
                            </span>
                        </h1>
                        
                        <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                            Two paths to mastery. Build real things with <strong className="text-amber-600 dark:text-amber-400">The Forge</strong> or sharpen your logic with <strong className="text-rose-600 dark:text-rose-400">The Crucible</strong>.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="#forge">
                                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white h-12 px-8 rounded-xl gap-2">
                                    <Hammer className="w-5 h-5" />
                                    Explore The Forge
                                </Button>
                            </Link>
                            <Link href="#crucible">
                                <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl gap-2 border-neutral-300 dark:border-neutral-700">
                                    <Flame className="w-5 h-5 text-rose-500" />
                                    Enter The Crucible
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Tech Tracks', value: forgeTracks.length || '0', icon: Code2, color: 'text-amber-500' },
                            { label: 'Logic Events', value: crucibleEvents.length || '0', icon: Brain, color: 'text-rose-500' },
                            { label: 'Total Enrollments', value: forgeTracks.reduce((acc, t) => acc + t.enrollmentCount, 0).toLocaleString(), icon: Users, color: 'text-blue-500' },
                            { label: 'Problems Solved', value: '1000+', icon: Target, color: 'text-emerald-500' },
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <stat.icon className={cn("w-8 h-8 mx-auto mb-2", stat.color)} />
                                <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Forge Section */}
            <section id="forge" className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                                <Hammer className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
                                    The Forge
                                </h2>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    Master technologies by building real things
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mt-4">
                            <div className="flex items-center gap-1">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <span>Paid tracks</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                <span>Project-based learning</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <Trophy className="w-4 h-4" />
                                <span>Earn certificates</span>
                            </div>
                        </div>
                    </motion.div>

                    {forgeTracks.length === 0 ? (
                        <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                            <Hammer className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                No tracks available yet
                            </h3>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                                Be the first to explore when we launch!
                            </p>
                            <Button onClick={handleSeed} disabled={seeding}>
                                {seeding ? 'Seeding...' : 'Seed Sample Challenges'}
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {forgeTracks.map((track, index) => {
                                const enrollment = getUserEnrollment(track.id)
                                const progress = enrollment 
                                    ? Math.round((enrollment.completedSteps / (track._count?.steps || 1)) * 100)
                                    : 0

                                return (
                                    <motion.div
                                        key={track.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link href={`/challenges/forge/${track.slug}`}>
                                            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-neutral-200 dark:border-neutral-800 overflow-hidden group">
                                                {/* Color bar */}
                                                <div 
                                                    className="h-2 w-full"
                                                    style={{ backgroundColor: track.themeColor }}
                                                />
                                                
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="text-4xl mb-2">
                                                            {track.icon || '📘'}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {enrollment?.isCompleted && (
                                                                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                    Complete
                                                                </Badge>
                                                            )}
                                                            <Badge className={levelColors[track.level]}>
                                                                {track.level}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <CardTitle className="text-xl group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                        {track.name}
                                                    </CardTitle>
                                                    <CardDescription className="line-clamp-2">
                                                        {track.shortDescription || track.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                
                                                <CardContent className="pt-0 space-y-4">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-4 text-neutral-500 dark:text-neutral-400">
                                                            <span className="flex items-center gap-1">
                                                                <Code2 className="w-4 h-4" />
                                                                {track._count?.steps || 0} steps
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4" />
                                                                {track.estimatedHours}h
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 font-semibold">
                                                            {track.isFree ? (
                                                                <span className="text-emerald-600 dark:text-emerald-400">Free</span>
                                                            ) : (
                                                                <>
                                                                    <Zap className="w-4 h-4 text-amber-500" />
                                                                    <span>{track.creditsRequired}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {enrollment && !enrollment.isCompleted && (
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-neutral-500">Progress</span>
                                                                <span className="font-medium">{progress}%</span>
                                                            </div>
                                                            <Progress value={progress} className="h-2" />
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between text-xs text-neutral-400">
                                                        <span>{track.enrollmentCount.toLocaleString()} enrolled</span>
                                                        <span>{track.totalXp} XP total</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* The Crucible Section */}
            <section id="crucible" className="py-16 md:py-24 bg-neutral-50 dark:bg-neutral-900/50">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                                <Flame className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
                                    The Crucible
                                </h2>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    Sharpen your logic through pure problem solving
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mt-4">
                            <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Free to join</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <Brain className="w-4 h-4" />
                                <span>Story-driven puzzles</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                <span>Leaderboards</span>
                            </div>
                        </div>
                    </motion.div>

                    {crucibleEvents.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                            <Flame className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                No events available yet
                            </h3>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                                Check back soon for exciting challenges!
                            </p>
                            <Button onClick={handleSeed} disabled={seeding} variant="outline">
                                {seeding ? 'Seeding...' : 'Seed Sample Challenges'}
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {crucibleEvents.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link href={`/challenges/crucible/${event.slug}`}>
                                        <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-neutral-200 dark:border-neutral-800 overflow-hidden group bg-white dark:bg-neutral-900">
                                            {/* Color bar */}
                                            <div 
                                                className="h-2 w-full"
                                                style={{ backgroundColor: event.themeColor }}
                                            />
                                            
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="text-4xl mb-2">
                                                        {event.icon || '🔥'}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={statusColors[event.status]}>
                                                            {event.status === 'ACTIVE' && (
                                                                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1 animate-pulse" />
                                                            )}
                                                            {event.status}
                                                        </Badge>
                                                        {event.isFree && (
                                                            <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                                                Free
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <CardTitle className="text-xl group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                                    {event.name}
                                                </CardTitle>
                                                <CardDescription className="line-clamp-2">
                                                    {event.shortDescription || event.description}
                                                </CardDescription>
                                            </CardHeader>
                                            
                                            <CardContent className="pt-0 space-y-4">
                                                <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                                                    <span className="flex items-center gap-1">
                                                        <Brain className="w-4 h-4" />
                                                        {event._count?.problems || event.totalProblems} problems
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {event.totalParticipants.toLocaleString()} participants
                                                    </span>
                                                </div>

                                                <Button 
                                                    className="w-full bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 gap-2"
                                                >
                                                    {event.status === 'ACTIVE' ? 'Join Now' : 'View Details'}
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 border-t border-neutral-200 dark:border-neutral-800">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                            Ready to Level Up?
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
                            Choose your path and start your journey. Whether you want to build real projects or solve algorithmic puzzles, we've got you covered.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {!user && (
                                <Link href="/signin">
                                    <Button size="lg" className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 h-12 px-8 rounded-xl">
                                        Sign In to Start
                                    </Button>
                                </Link>
                            )}
                            <Link href="/community">
                                <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl">
                                    <Users className="w-5 h-5 mr-2" />
                                    Join Community
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}


