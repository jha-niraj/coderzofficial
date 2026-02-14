'use client'

import { useState } from 'react'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    CheckCircle2, Lock, Mic, Play
} from 'lucide-react'
import { VerificationSectionStatus } from '@repo/prisma/client'
import Link from 'next/link'
import { CreateMockSheet } from '@/app/(main)/mock/_components/create-mock-sheet'

interface MockConfig {
    title: string
    description: string
    duration: number
    questionsCount: number
    knowledgeBase: string
}

interface MockVerificationProps {
    mockInterviewId: string | null
    mockConfig?: MockConfig
    status: VerificationSectionStatus
    score: number | null
    attempts: number
}

export function MockVerification({
    mockInterviewId,
    mockConfig,
    status,
    score,
    attempts
}: MockVerificationProps) {
    const [showMockSheet, setShowMockSheet] = useState(false)

    // Show completed state
    if (status === 'COMPLETED') {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Mock Interview Passed!</h3>
                    <p className="text-neutral-500 mb-4">You scored {score}%</p>
                    <Badge variant="secondary">Attempts: {attempts}</Badge>
                </div>
            </div>
        )
    }

    // Show locked state
    if (status === 'LOCKED') {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                        <Lock className="w-10 h-10 text-neutral-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Mock Interview Locked</h3>
                    <p className="text-neutral-500">Complete the Coding section first to unlock Mock Interview.</p>
                </div>
            </div>
        )
    }

    // Show mock interview start screen
    return (
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-lg">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-6 shadow-lg">
                    <Mic className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    {mockConfig?.title || 'Mock Interview'}
                </h3>
                <p className="text-neutral-500 mb-6">
                    {mockConfig?.description || 'Complete an AI-powered voice interview to demonstrate your knowledge.'}
                </p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                            {mockConfig?.duration || 15}m
                        </div>
                        <div className="text-xs text-neutral-500">Duration</div>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                            {mockConfig?.questionsCount || 5}
                        </div>
                        <div className="text-xs text-neutral-500">Questions</div>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">70%</div>
                        <div className="text-xs text-neutral-500">To Pass</div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-left">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Before you start:</h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Make sure you&apos;re in a quiet environment</li>
                            <li>• Allow microphone access when prompted</li>
                            <li>• Speak clearly and take your time</li>
                            <li>• The AI will ask follow-up questions based on your answers</li>
                        </ul>
                    </div>

                    {
                        mockInterviewId ? (
                            <Link href={`/mock/voice/interview/${mockInterviewId}`}>
                                <Button size="lg" className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90">
                                    <Play className="w-5 h-5 mr-2" />
                                    Start Mock Interview
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Button
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
                                    onClick={() => setShowMockSheet(true)}
                                >
                                    <Play className="w-5 h-5 mr-2" />
                                    Create & Start Interview
                                </Button>
                                <CreateMockSheet
                                    open={showMockSheet}
                                    onOpenChange={setShowMockSheet}
                                    trigger={<></>}
                                />
                            </>
                        )
                    }

                    {
                        attempts > 0 && (
                            <p className="text-sm text-neutral-500">
                                Previous attempts: {attempts}
                            </p>
                        )
                    }
                </div>
            </div>
        </div>
    )
}