'use client'

import { useEffect, useState } from 'react'
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, 
    DialogTitle
} from '@repo/ui/components/ui/dialog'
import {
    Sparkles, CheckCircle2, Brain, Rocket
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface GenerationProgressDialogProps {
    open: boolean
    progress?: number
    status?: string
}

type ProgressStage = 'generating' | 'finalizing' | 'almost-done'

const PROGRESS_MESSAGES = [
    "🧠 Analyzing your project requirements...",
    "🎨 Designing the perfect architecture...",
    "📝 Creating detailed task breakdowns...",
    "� Gienerating implementation guides...",
    "✨ Adding learning resources...",
    "🚀 Finalizing your project blueprint...",
]

export function GenerationProgressDialog({ open, progress = 0, status = 'waiting' }: GenerationProgressDialogProps) {
    const [elapsedTime, setElapsedTime] = useState(0)
    const [stage, setStage] = useState<ProgressStage>('generating')
    const [currentMessage, setCurrentMessage] = useState(0)

    useEffect(() => {
        if (!open) {
            setElapsedTime(0)
            setStage('generating')
            setCurrentMessage(0)
            return
        }

        const interval = setInterval(() => {
            setElapsedTime((prev) => {
                const newTime = prev + 1

                // Update stage based on progress
                if (progress >= 90) {
                    setStage('almost-done')
                } else if (progress >= 60) {
                    setStage('finalizing')
                } else {
                    setStage('generating')
                }

                // Cycle through messages every 10 seconds
                if (newTime % 10 === 0) {
                    setCurrentMessage((prev) => (prev + 1) % PROGRESS_MESSAGES.length)
                }

                return newTime
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [open, progress])

    const getStageInfo = () => {
        switch (stage) {
            case 'generating':
                return {
                    title: 'Generating Your Project',
                    description: PROGRESS_MESSAGES[currentMessage],
                    icon: Brain,
                    color: 'text-blue-500',
                    bgColor: 'bg-blue-500/10',
                }
            case 'finalizing':
                return {
                    title: 'Almost There!',
                    description: 'Finalizing tasks and organizing everything perfectly...',
                    icon: Sparkles,
                    color: 'text-purple-500',
                    bgColor: 'bg-purple-500/10',
                }
            case 'almost-done':
                return {
                    title: 'Just a Moment Longer',
                    description: 'Putting the finishing touches on your project...',
                    icon: Rocket,
                    color: 'text-orange-500',
                    bgColor: 'bg-orange-500/10',
                }
        }
    }

    const stageInfo = getStageInfo()
    const Icon = stageInfo.icon

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Calculate actual progress percentage
    const progressPercentage = Math.min(progress, 100)

    return (
        <Dialog open={open}>
            <DialogContent className="sm:max-w-md [&>button]:hidden">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={stage}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="space-y-2"
                            >
                                <div className="flex items-center justify-center mb-4">
                                    <div className={`p-4 rounded-full ${stageInfo.bgColor}`}>
                                        <Icon className={`w-8 h-8 ${stageInfo.color} animate-spin`} />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold">{stageInfo.title}</h3>
                            </motion.div>
                        </AnimatePresence>
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={stage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-sm text-neutral-600 dark:text-neutral-400"
                            >
                                {stageInfo.description}
                            </motion.p>
                        </AnimatePresence>
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                    <div className="relative">
                        <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full ${stage === 'generating'
                                        ? 'bg-blue-500'
                                        : stage === 'finalizing'
                                            ? 'bg-purple-500'
                                            : 'bg-orange-500'
                                    }`}
                                animate={{
                                    width: `${progressPercentage}%`,
                                }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                {status === 'waiting' ? 'Queued' : status === 'active' ? 'Processing' : 'Completed'}
                            </span>
                            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                {progressPercentage}%
                            </span>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-mono font-bold text-neutral-900 dark:text-neutral-100">
                            {formatTime(elapsedTime)}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            Time elapsed
                        </p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className={`w-4 h-4 ${progress >= 40 ? 'text-green-500' : 'text-neutral-300 dark:text-neutral-600'}`} />
                                <span className={progress >= 40 ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400 dark:text-neutral-500'}>
                                    Analyzing requirements
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className={`w-4 h-4 ${progress >= 55 ? 'text-green-500' : 'text-neutral-300 dark:text-neutral-600'}`} />
                                <span className={progress >= 55 ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400 dark:text-neutral-500'}>
                                    Creating project structure
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className={`w-4 h-4 ${progress >= 70 ? 'text-green-500' : 'text-neutral-300 dark:text-neutral-600'}`} />
                                <span className={progress >= 70 ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400 dark:text-neutral-500'}>
                                    Generating detailed tasks
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className={`w-4 h-4 ${progress >= 90 ? 'text-green-500' : 'text-neutral-300 dark:text-neutral-600'}`} />
                                <span className={progress >= 90 ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400 dark:text-neutral-500'}>
                                    Finalizing project
                                </span>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
                        ⏱️ This usually takes around 60-90 seconds. Please be patient!
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}