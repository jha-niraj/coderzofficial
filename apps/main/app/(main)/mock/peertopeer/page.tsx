'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@repo/ui/components/ui/card'
import {
    Users, UserPlus, MessageSquare, TrendingUp, CheckCircle, ArrowLeft,
    Plus, Star, Globe, Lock, Target, Trophy, Calendar, Brain
} from 'lucide-react'
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Label } from '@repo/ui/components/ui/label'
import {
    RadioGroup, RadioGroupItem
} from '@repo/ui/components/ui/radio-group'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import toast from '@repo/ui/components/ui/sonner'

const features = [
    {
        icon: <Users className="w-5 h-5" />,
        title: 'Practice with Peers',
        description: 'Connect with developers at your level or challenge yourself with experienced professionals.'
    },
    {
        icon: <MessageSquare className="w-5 h-5" />,
        title: 'Real-Time Feedback',
        description: 'Give and receive constructive feedback to improve together and learn from each other.'
    },
    {
        icon: <Brain className="w-5 h-5" />,
        title: 'AI-Generated Questions',
        description: 'Get interview questions automatically generated based on your role and preferences.'
    },
    {
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Mutual Growth',
        description: 'Improve your interviewing skills from both sides - as interviewer and interviewee.'
    },
]

const benefits = [
    {
        icon: UserPlus,
        title: 'Collaborative Learning',
        description: 'Learn by practicing with real people'
    },
    {
        icon: Target,
        title: 'Flexible Scheduling',
        description: 'Set your own availability and pace'
    },
    {
        icon: Trophy,
        title: 'Skill Development',
        description: 'Practice both giving and receiving interviews'
    },
    {
        icon: Star,
        title: 'Community Driven',
        description: 'Build connections in developer community'
    }
]

// Mock data for public peer sessions
const publicSessions = [
    {
        id: '1',
        title: 'Frontend React Interview Practice',
        creator: 'Sarah K.',
        level: 'INTERMEDIATE',
        duration: 45,
        participants: 2,
        maxParticipants: 2,
        scheduledFor: '2025-01-20',
        tags: ['React', 'JavaScript', 'TypeScript']
    },
    {
        id: '2',
        title: 'System Design Discussion',
        creator: 'Mike R.',
        level: 'ADVANCED',
        duration: 60,
        participants: 1,
        maxParticipants: 3,
        scheduledFor: '2025-01-21',
        tags: ['System Design', 'Architecture']
    },
    {
        id: '3',
        title: 'Behavioral Interview Prep',
        creator: 'Alex P.',
        level: 'BEGINNER',
        duration: 30,
        participants: 0,
        maxParticipants: 2,
        scheduledFor: '2025-01-22',
        tags: ['Behavioral', 'Communication']
    }
]

export default function PeerToPeerMockPage() {
    const [createSheetOpen, setCreateSheetOpen] = useState(false)
    const [sessionType, setSessionType] = useState<'private' | 'public'>('public')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [level, setLevel] = useState('INTERMEDIATE')
    const [duration, setDuration] = useState('45')
    const [maxParticipants, setMaxParticipants] = useState('2')

    const handleCreateSession = () => {
        toast.success(`${sessionType === 'private' ? 'Private' : 'Public'} session created!`)
        setCreateSheetOpen(false)
    }

    return (
        <main className="">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <Link href="/mockinterview">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Mock Interviews
                    </Button>
                </Link>
            </div>
            <section className="relative overflow-hidden py-20 bg-white dark:bg-neutral-950">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center space-y-6"
                    >
                        <Badge className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 px-4 py-1.5">
                            <Users className="w-3 h-3 mr-1.5" />
                            Peer-to-Peer Interview Practice
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400">
                            Practice Together,
                            <br />
                            Grow Together
                        </h1>
                        <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Connect with fellow developers for realistic mock interviews. Give and receive feedback,
                            practice interviewing skills, and build your professional network.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button
                                size="lg"
                                className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                onClick={() => setCreateSheetOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Session
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-neutral-300 dark:border-neutral-700"
                                onClick={() => document.getElementById('public-sessions')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Browse Public Sessions
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
            <section className="py-12 border-y border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {
                            [
                                { value: '6K+', label: 'Sessions Held', icon: Users },
                                { value: '3.2K', label: 'Active Users', icon: UserPlus },
                                { value: '4.7/5', label: 'Avg Rating', icon: Star },
                                { value: '92%', label: 'Satisfaction', icon: Trophy },
                            ].map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="text-center"
                                >
                                    <div className="flex justify-center mb-2">
                                        <stat.icon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                                    </div>
                                    <div className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))
                        }
                    </div>
                </div>
            </section>
            <section className="py-16 bg-white dark:bg-neutral-950">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Two ways to practice: private sessions with friends or public sessions with the community
                        </p>
                    </motion.div>
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800 h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                                        <Lock className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">Private Sessions</h3>
                                </div>
                                <div className="space-y-4">
                                    {
                                        [
                                            'Create a private session with custom details',
                                            'Get a unique shareable link',
                                            'Send to specific people you want to practice with',
                                            'AI generates interview questions for both participants',
                                            'Practice in a comfortable, private environment'
                                        ].map((step, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-neutral-600 dark:text-neutral-400">{step}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800 h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                                        <Globe className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">Public Sessions</h3>
                                </div>
                                <div className="space-y-4">
                                    {
                                        [
                                            'Create a public session visible to everyone',
                                            'Set max participants and scheduling details',
                                            'Other users can request to join your session',
                                            'Accept requests and schedule the interview',
                                            'AI generates questions for all participants before start'
                                        ].map((step, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-neutral-600 dark:text-neutral-400">{step}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
            <section className="py-16 bg-neutral-50 dark:bg-neutral-900/50 border-y border-neutral-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
                            Why Peer-to-Peer?
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Experience realistic interview scenarios with real people
                        </p>
                    </motion.div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {
                            features.map((feature, index) => (
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
                            ))
                        }
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {
                            benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="text-center"
                                >
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-3">
                                        <benefit.icon className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
                                    </div>
                                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-1 text-sm">
                                        {benefit.title}
                                    </h4>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                        {benefit.description}
                                    </p>
                                </motion.div>
                            ))
                        }
                    </div>
                </div>
            </section>
            <section id="public-sessions" className="py-16 bg-white dark:bg-neutral-950">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-2">
                                    🌍 Public Sessions
                                </h2>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    Join upcoming peer-to-peer mock interviews
                                </p>
                            </div>
                            <Button
                                className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                onClick={() => setCreateSheetOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Session
                            </Button>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {publicSessions.map((session, index) => (
                                <motion.div
                                    key={session.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Card className="h-full bg-white dark:bg-neutral-900 shadow-lg border border-neutral-200 dark:border-neutral-800 hover:shadow-2xl transition-all">
                                        <CardHeader>
                                            <div className="flex items-start justify-between mb-2">
                                                <Badge className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-0">
                                                    {session.level}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                                                    <Users className="w-4 h-4" />
                                                    <span>{session.participants}/{session.maxParticipants}</span>
                                                </div>
                                            </div>
                                            <CardTitle className="text-lg">{session.title}</CardTitle>
                                            <CardDescription className="text-sm">By {session.creator}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(session.scheduledFor).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                                    <Target className="w-4 h-4" />
                                                    <span>{session.duration} minutes</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {
                                                    session.tags.map((tag, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))
                                                }
                                            </div>
                                            <Button
                                                className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                                disabled={session.participants >= session.maxParticipants}
                                            >
                                                {session.participants >= session.maxParticipants ? 'Full' : 'Request to Join'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                            }
                        </div>
                    </motion.div>
                </div>
            </section>
            <section className="py-20 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl p-12 border border-neutral-200 dark:border-neutral-800 text-center"
                    >
                        <Users className="w-16 h-16 mx-auto mb-6 text-neutral-700 dark:text-neutral-300" />
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
                            Ready to Practice?
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
                            Start your peer-to-peer mock interview journey today. Create a session or join an existing one.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                onClick={() => setCreateSheetOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Session
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-neutral-300 dark:border-neutral-700"
                                onClick={() => document.getElementById('public-sessions')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Browse Sessions
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
            <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Create Peer-to-Peer Session</SheetTitle>
                        <SheetDescription>
                            Set up a mock interview session with other developers
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-6 py-6">
                        <div className="space-y-3">
                            <Label>Session Type</Label>
                            <RadioGroup value={sessionType} onValueChange={(value: 'private' | 'public') => setSessionType(value)}>
                                <div className="flex items-center space-x-2 p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900">
                                    <RadioGroupItem value="public" id="public" />
                                    <Label htmlFor="public" className="flex-1 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4" />
                                            <div>
                                                <div className="font-medium">Public</div>
                                                <div className="text-xs text-neutral-600 dark:text-neutral-400">Visible to everyone</div>
                                            </div>
                                        </div>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900">
                                    <RadioGroupItem value="private" id="private" />
                                    <Label htmlFor="private" className="flex-1 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-4 h-4" />
                                            <div>
                                                <div className="font-medium">Private</div>
                                                <div className="text-xs text-neutral-600 dark:text-neutral-400">Share via link</div>
                                            </div>
                                        </div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Session Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Frontend React Interview Practice"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="What will this session focus on?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="level">Level</Label>
                                <Select value={level} onValueChange={setLevel}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                                        <SelectItem value="EXPERT">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (min)</Label>
                                <Select value={duration} onValueChange={setDuration}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="30">30 min</SelectItem>
                                        <SelectItem value="45">45 min</SelectItem>
                                        <SelectItem value="60">60 min</SelectItem>
                                        <SelectItem value="90">90 min</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {
                            sessionType === 'public' && (
                                <div className="space-y-2">
                                    <Label htmlFor="maxParticipants">Max Participants</Label>
                                    <Select value={maxParticipants} onValueChange={setMaxParticipants}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2">2 people</SelectItem>
                                            <SelectItem value="3">3 people</SelectItem>
                                            <SelectItem value="4">4 people</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )
                        }
                        <div className="pt-4 space-y-3">
                            <Button
                                className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                onClick={handleCreateSession}
                            >
                                Create Session
                            </Button>
                            <p className="text-xs text-center text-neutral-600 dark:text-neutral-400">
                                {sessionType === 'private' ?
                                    'You\'ll get a shareable link after creation' :
                                    'AI will generate interview questions before the session'
                                }
                            </p>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </main>
    )
}