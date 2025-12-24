'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import {
    Video, Sparkles, Eye, Smile, TrendingUp, CheckCircle,
    ArrowLeft, Bell, Calendar, Star, Users, Trophy, Target
} from 'lucide-react'
import toast from '@repo/ui/components/ui/sonner'

const features = [
    {
        icon: <Video className="w-5 h-5" />,
        title: 'Face-to-Face Practice',
        description: 'Experience realistic video interviews with AI that analyzes your visual presence.'
    },
    {
        icon: <Eye className="w-5 h-5" />,
        title: 'Body Language Analysis',
        description: 'Get insights on your posture, eye contact, and non-verbal communication.'
    },
    {
        icon: <Smile className="w-5 h-5" />,
        title: 'Facial Expression Feedback',
        description: 'Understand how your expressions impact your interview performance.'
    },
    {
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Comprehensive Reports',
        description: 'Receive detailed analysis combining voice, video, and behavioral insights.'
    },
]

const upcomingFeatures = [
    'Real-time video processing',
    'Multi-angle camera support',
    'Background blur and virtual backgrounds',
    'Dress code and grooming suggestions',
    'Side-by-side comparison with previous interviews',
    'Integration with popular video platforms'
]

// Mock data for future video interviews
const mockVideoInterviews = [
    {
        id: '1',
        title: 'Senior Frontend Engineer',
        description: 'Technical interview focusing on React, TypeScript, and system design',
        level: 'ADVANCED',
        duration: 45,
        category: 'TECHNICAL'
    },
    {
        id: '2',
        title: 'Product Manager Interview',
        description: 'Behavioral and product sense questions',
        level: 'INTERMEDIATE',
        duration: 30,
        category: 'BEHAVIORAL'
    },
    {
        id: '3',
        title: 'Leadership & Team Management',
        description: 'Leadership scenarios and decision-making questions',
        level: 'EXPERT',
        duration: 40,
        category: 'LEADERSHIP'
    }
]

export default function AIVideoMockPage() {
    const [notified, setNotified] = useState(false)

    const handleNotify = () => {
        toast.success('You\'ll be notified when AI Video Mock launches!')
        setNotified(true)
    }

    return (
        <main className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <Link href="/mockinterview">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Mock Interviews
                    </Button>
                </Link>
            </div>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 bg-white dark:bg-neutral-950">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center space-y-6"
                    >
                        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-0 px-4 py-1.5">
                            <Video className="w-3 h-3 mr-1.5" />
                            Coming Soon
                        </Badge>

                        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400">
                            AI Video Mock Interview
                        </h1>

                        <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            The future of interview preparation. Practice with AI-powered video interviews that analyze not just what you say, but how you present yourself.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button
                                size="lg"
                                className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                onClick={handleNotify}
                                disabled={notified}
                            >
                                <Bell className="w-4 h-4 mr-2" />
                                {notified ? 'You\'ll Be Notified!' : 'Notify Me When Available'}
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-neutral-300 dark:border-neutral-700"
                                asChild
                            >
                                <Link href="/mockinterview/voice">
                                    Try Voice Mock Instead
                                </Link>
                            </Button>
                        </div>

                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/20 rounded-full border border-amber-200 dark:border-amber-800">
                            <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Expected Launch: Q1 2026</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-neutral-50 dark:bg-neutral-900/50 border-y border-neutral-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
                            What's Coming
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Advanced features to make your video mock interviews incredibly effective
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="bg-white dark:bg-neutral-900 shadow-lg rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 h-full">
                                    <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 w-fit mb-4">
                                        {feature.icon}
                                    </div>
                                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Preview Mocks */}
            <section className="py-16 bg-white dark:bg-neutral-950">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4 text-center">
                            Preview: Upcoming Interviews
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto text-center mb-12">
                            Here's a sneak peek at the types of video mock interviews we're preparing
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {mockVideoInterviews.map((interview, index) => (
                            <motion.div
                                key={interview.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card className="h-full bg-white dark:bg-neutral-900 shadow-lg border border-neutral-200 dark:border-neutral-800">
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-2">
                                            <Badge className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-0">
                                                {interview.level}
                                            </Badge>
                                            <Video className="w-5 h-5 text-neutral-400" />
                                        </div>
                                        <CardTitle className="text-lg">{interview.title}</CardTitle>
                                        <CardDescription className="text-sm">{interview.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                            <Target className="w-4 h-4" />
                                            <span>{interview.category}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                            <Calendar className="w-4 h-4" />
                                            <span>{interview.duration} minutes</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Upcoming Features */}
            <section className="py-16 bg-neutral-50 dark:bg-neutral-900/50 border-y border-neutral-200 dark:border-neutral-800">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white text-center mb-12">
                            Planned Features
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {upcomingFeatures.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex items-start gap-3 p-4 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800"
                                >
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-neutral-700 dark:text-neutral-300">{feature}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white dark:bg-neutral-950">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl p-12 border border-neutral-200 dark:border-neutral-800 text-center"
                    >
                        <Video className="w-16 h-16 mx-auto mb-6 text-neutral-700 dark:text-neutral-300" />
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
                            Be Among the First
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
                            Sign up to get early access to AI Video Mock Interviews and exclusive launch benefits.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                onClick={handleNotify}
                                disabled={notified}
                            >
                                <Bell className="w-4 h-4 mr-2" />
                                {notified ? 'You\'ll Be Notified!' : 'Get Early Access'}
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-neutral-300 dark:border-neutral-700"
                                asChild
                            >
                                <Link href="/mockinterview/voice">
                                    Try Voice Mock Now
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    )
}
