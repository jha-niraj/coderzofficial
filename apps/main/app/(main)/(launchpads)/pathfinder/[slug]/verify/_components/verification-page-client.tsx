'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@repo/ui/components/ui/button'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet'
import {
    Target, ArrowLeft, Brain, Code, Mic, Wrench, Trophy,
    Sparkles, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { VerificationContent } from './verification-content'
import { generateVerificationContent } from '@/actions/(main)/pathfinder'
import { usePathfinderStore } from '@/app/store/pathfinderStore'
import { 
    PathfinderCategory, PathfinderLevel, VerificationSectionStatus 
} from '@repo/prisma/client'
import type { VerificationAIPlan } from '@/types/pathfinder'
import toast from '@repo/ui/components/ui/sonner'

interface Goal {
    id: string
    title: string
    slug?: string
    category: PathfinderCategory
    level: PathfinderLevel
    aiGeneratedPlan: unknown
    mockInterviewId: string | null
}

interface Verification {
    id: string
    quizStatus: VerificationSectionStatus
    codingStatus: VerificationSectionStatus
    mockStatus: VerificationSectionStatus
    projectStatus: VerificationSectionStatus
    quizScore: number | null
    codingScore: number | null
    mockScore: number | null
    projectComplete: boolean
    quizAttempts: number
    codingAttempts: number
    mockAttempts: number
    overallScore: number | null
    passed: boolean
}

interface VerificationPageClientProps {
    goal: Goal
    verification: Verification | null
}

export function VerificationPageClient({ goal: initialGoal, verification }: VerificationPageClientProps) {
    const setVerificationAIPlan = usePathfinderStore((s) => s.setVerificationAIPlan)
    const storedPlan = usePathfinderStore((s) => s.verificationAIPlan[initialGoal.id])
    const [generateSheetOpen, setGenerateSheetOpen] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const aiPlan = (storedPlan ?? initialGoal.aiGeneratedPlan) as VerificationAIPlan | null
    const hasQuestions = Boolean(aiPlan?.quizQuestions?.length ?? 0)

    const handleGenerate = async () => {
        setGenerateSheetOpen(true)
        setIsGenerating(true)
        try {
            const result = await generateVerificationContent(initialGoal.id)
            if (result.success && result.plan) {
                setVerificationAIPlan(initialGoal.id, result.plan)
                toast.success('Verification questions ready!')
                setGenerateSheetOpen(false)
                // Instant display via store - no router.refresh needed
            } else {
                toast.error(result.error ?? 'Failed to generate questions')
            }
        } catch {
            toast.error('Failed to generate questions')
        } finally {
            setIsGenerating(false)
        }
    }

    if (hasQuestions) {
        return (
            <VerificationContent
                goal={{ ...initialGoal, aiGeneratedPlan: aiPlan ?? initialGoal.aiGeneratedPlan }}
                verification={verification}
            />
        )
    }

    return (
        <>
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-6 py-4">
                    <Link
                        href={`/pathfinder/${initialGoal.slug ?? initialGoal.id}`}
                        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Goal
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                                Verify this Goal
                            </h1>
                            <p className="text-sm text-neutral-500">{initialGoal.title}</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-lg text-center"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            <Trophy className="w-10 h-10 text-violet-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                            Ready to Verify Your Knowledge?
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                            We&apos;ll generate personalized quiz and coding questions based on what you&apos;ve learned.
                            Your practice tasks and progress will help create relevant verification content.
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-left mb-8">
                            <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
                                <Brain className="w-5 h-5 text-violet-500" />
                                <span className="text-sm">20-25 Quiz Questions</span>
                            </div>
                            <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
                                <Code className="w-5 h-5 text-violet-500" />
                                <span className="text-sm">3-8 Coding Challenges</span>
                            </div>
                            <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
                                <Mic className="w-5 h-5 text-violet-500" />
                                <span className="text-sm">Mock Interview</span>
                            </div>
                            <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
                                <Wrench className="w-5 h-5 text-violet-500" />
                                <span className="text-sm">Project Verification</span>
                            </div>
                        </div>
                        <Button
                            size="lg"
                            className="gap-2 bg-violet-600 hover:bg-violet-700"
                            onClick={handleGenerate}
                        >
                            <Sparkles className="w-4 h-4" />
                            Generate Verification Questions
                        </Button>
                    </motion.div>
                </div>
            </div>
            <Sheet
                open={generateSheetOpen}
                onOpenChange={(open) => !isGenerating && setGenerateSheetOpen(open)}
            >
                <SheetContent side="bottom" className="h-[40vh]">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                            Generating Verification Questions
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col items-center justify-center py-12">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="w-16 h-16 rounded-full border-2 border-neutral-200 dark:border-neutral-700 border-t-violet-500 mb-4"
                        />
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-sm">
                            Creating personalized quiz and coding questions based on your learning progress.
                            This usually takes 30-60 seconds.
                        </p>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}