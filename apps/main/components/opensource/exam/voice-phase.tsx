'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useConversation } from '@/lib/elevenlabs/use-conversation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff,
    Loader2, CheckCircle2, AlertCircle
} from 'lucide-react'
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Orb, AgentState } from '@/components/main/orb'
import toast from '@repo/ui/components/ui/sonner'
import { getElevenLabsToken } from '@/actions/(main)/mockvoice/session.action'

interface VoicePhaseProps {
    voicePrompt: string
    topics: string[]
    isCompleted: boolean
    score: number | null
    onComplete: (score: number) => void
}

export default function VoicePhase({
    voicePrompt,
    topics,
    isCompleted,
    score,
    onComplete
}: VoicePhaseProps) {
    const [hasStarted, setHasStarted] = useState(false)
    const [agentState, setAgentState] = useState<AgentState>(null)
    const [isMicMuted, setIsMicMuted] = useState(false)
    const [volume, setVolume] = useState(0.8)
    const [isProcessing, setIsProcessing] = useState(false)
    const [interviewDuration, setInterviewDuration] = useState(0)

    const conversationIdRef = useRef<string | null>(null)
    const intentionalEndRef = useRef(false)
    const startTimeRef = useRef<Date | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_GENERAL_MOCK || ''

    // Handle conversation end
    const handleConversationEnd = useCallback(async () => {
        if (isProcessing) return
        setIsProcessing(true)

        try {
            // Calculate duration-based score (for demo - in production, use AI evaluation)
            // The longer the conversation, the better (up to 7 minutes)
            const durationMinutes = interviewDuration / 60
            const durationScore = Math.min(100, Math.round((durationMinutes / 7) * 100))

            // For a real implementation, you would:
            // 1. Get the transcript from ElevenLabs
            // 2. Send it to OpenAI for evaluation
            // 3. Calculate score based on technical accuracy, communication, etc.

            // For now, we'll use a simulated score based on duration
            const simulatedScore = Math.max(60, Math.min(95, durationScore + Math.random() * 20))
            const finalScore = Math.round(simulatedScore)

            onComplete(finalScore)
            toast.success('Voice interview completed!')
        } catch (error) {
            console.error('Error processing voice interview:', error)
            toast.error('Failed to process interview')
            onComplete(0)
        } finally {
            setIsProcessing(false)
        }
    }, [interviewDuration, onComplete, isProcessing])

    const conversation = useConversation({
        micMuted: isMicMuted,
        volume,
        onConnect: () => {
            console.log('[VoicePhase] Connected')
            setAgentState('listening')
            startTimeRef.current = new Date()
            // Start duration timer
            timerRef.current = setInterval(() => {
                if (startTimeRef.current) {
                    const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000)
                    setInterviewDuration(elapsed)
                }
            }, 1000)
            toast.success('Interview started!')
        },
        onDisconnect: () => {
            console.log('[VoicePhase] Disconnected')
            setAgentState(null)
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
            if (intentionalEndRef.current && conversationIdRef.current) {
                handleConversationEnd()
            }
        },
        onModeChange: (mode: { mode: string }) => {
            setAgentState(mode.mode === 'speaking' ? 'talking' : 'listening')
        },
        onError: (error: unknown) => {
            console.error('[VoicePhase] Error:', error)
            toast.error('Connection error. Please try again.')
            setAgentState(null)
            setHasStarted(false)
        }
    })

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [])

    const startInterview = async () => {
        if (!agentId) {
            toast.error('Voice interview not configured')
            return
        }

        try {
            setHasStarted(true)
            setAgentState('thinking')

            const tokenResult = await getElevenLabsToken(agentId)
            if (!tokenResult.success || !tokenResult.token) {
                toast.error('Failed to authenticate with voice agent')
                setAgentState(null)
                setHasStarted(false)
                return
            }

            const conversationId = await conversation.startSession({
                conversationToken: tokenResult.token,
                connectionType: 'webrtc',
                overrides: {
                    agent: {
                        prompt: {
                            prompt: voicePrompt
                        },
                        firstMessage: `Hello! I'm your interviewer for the Git certification exam. I'll be asking you some questions about Git and GitHub to assess your understanding. Don't worry - just explain things as you would to a colleague. Are you ready to begin?`
                    }
                }
            })

            conversationIdRef.current = conversationId
        } catch (error) {
            console.error('Error starting interview:', error)
            toast.error('Failed to start interview')
            setAgentState(null)
            setHasStarted(false)
        }
    }

    const endInterview = useCallback(async () => {
        try {
            intentionalEndRef.current = true
            await conversation.endSession()
            setAgentState(null)
        } catch (error) {
            console.error('Error ending interview:', error)
        }
    }, [conversation])

    const toggleMic = () => {
        setIsMicMuted(!isMicMuted)
        toast.info(isMicMuted ? 'Microphone unmuted' : 'Microphone muted')
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Already completed state
    if (isCompleted && score !== null) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Mic className="w-5 h-5 text-purple-500" />
                        <span className="font-medium text-neutral-900 dark:text-white">
                            Voice Interview Phase
                        </span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Completed
                        </Badge>
                    </div>
                </div>

                <Card className="border-neutral-800 bg-neutral-900/50">
                    <CardContent className="py-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Interview Completed!</h3>
                        <p className="text-4xl font-bold text-green-400 mb-2">{score}%</p>
                        <p className="text-neutral-400">Your voice interview has been evaluated</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-purple-500" />
                    <span className="font-medium text-neutral-900 dark:text-white">
                        Voice Interview Phase
                    </span>
                    {hasStarted && (
                        <Badge variant="outline" className="text-xs">
                            {formatTime(interviewDuration)}
                        </Badge>
                    )}
                </div>
                <Badge className="bg-purple-500/20 text-purple-400">35% weight</Badge>
            </div>

            {/* Topics */}
            <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                    <CardTitle className="text-lg">Interview Topics</CardTitle>
                    <CardDescription>
                        You will be asked questions covering these areas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {topics.map((topic, idx) => (
                            <Badge key={idx} variant="outline" className="text-sm">
                                {topic}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Interview Area */}
            <Card className="border-neutral-800 bg-neutral-900/50">
                <CardContent className="py-8">
                    {!hasStarted ? (
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
                                <Mic className="w-12 h-12 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Ready for Voice Interview?</h3>
                            <p className="text-neutral-400 mb-6 max-w-md mx-auto">
                                You&apos;ll have a 5-7 minute conversation with an AI interviewer about Git and GitHub Learns.
                                Speak clearly and explain your answers thoroughly.
                            </p>
                            <Button
                                size="lg"
                                onClick={startInterview}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2 cursor-pointer"
                            >
                                <Phone className="w-5 h-5" />
                                Start Interview
                            </Button>
                        </div>
                    ) : isProcessing ? (
                        <div className="text-center py-8">
                            <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Processing Interview...</h3>
                            <p className="text-neutral-400">Evaluating your responses</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Orb Visualization */}
                            <div className="relative w-full aspect-square max-w-xs mx-auto">
                                <Orb
                                    agentState={agentState}
                                    volumeMode="auto"
                                    getInputVolume={conversation.getInputVolume}
                                    getOutputVolume={conversation.getOutputVolume}
                                    colors={['#8b5cf6', '#6366f1']}
                                />
                            </div>

                            {/* Status Text */}
                            <div className="text-center">
                                <AnimatePresence mode="wait">
                                    {agentState === 'thinking' && (
                                        <motion.div
                                            key="thinking"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <h3 className="text-xl font-bold text-white mb-1">Connecting...</h3>
                                            <p className="text-neutral-400">Setting up your interview</p>
                                        </motion.div>
                                    )}
                                    {agentState === 'listening' && (
                                        <motion.div
                                            key="listening"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <h3 className="text-xl font-bold text-white mb-1">Listening...</h3>
                                            <p className="text-neutral-400">Your turn to speak</p>
                                        </motion.div>
                                    )}
                                    {agentState === 'talking' && (
                                        <motion.div
                                            key="talking"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <h3 className="text-xl font-bold text-white mb-1">Interviewer Speaking...</h3>
                                            <p className="text-neutral-400">Listen to the question</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    size="lg"
                                    variant={isMicMuted ? 'destructive' : 'outline'}
                                    onClick={toggleMic}
                                    className="rounded-full w-14 h-14 cursor-pointer"
                                >
                                    {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </Button>
                                <Button
                                    size="lg"
                                    variant="destructive"
                                    onClick={endInterview}
                                    className="rounded-full w-16 h-16 cursor-pointer"
                                >
                                    <PhoneOff className="w-6 h-6" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => {
                                        const newVolume = volume > 0 ? 0 : 0.8
                                        setVolume(newVolume)
                                        conversation.setVolume({ volume: newVolume })
                                    }}
                                    className="rounded-full w-14 h-14 cursor-pointer"
                                >
                                    {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                                </Button>
                            </div>

                            {/* Timer */}
                            <div className="text-center">
                                <Badge variant="outline" className="text-lg px-4 py-2">
                                    Duration: {formatTime(interviewDuration)}
                                </Badge>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tips */}
            {!hasStarted && (
                <Card className="border-yellow-500/30 bg-yellow-500/5">
                    <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-400 mb-1">Tips for a great interview</p>
                                <ul className="text-sm text-yellow-300/70 space-y-1">
                                    <li>• Speak clearly and at a normal pace</li>
                                    <li>• Explain your reasoning, not just the answer</li>
                                    <li>• It&apos;s okay to think out loud</li>
                                    <li>• If you don&apos;t know something, say so honestly</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
