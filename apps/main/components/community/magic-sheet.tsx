'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
    Plus, Users, Mic, GraduationCap, Code2, Video, Lightbulb, Rocket, ChevronRight,
    ExternalLink, Loader2, Share2, ArrowLeft, Briefcase, BookOpen,
    Palette, Presentation, Zap, UserPlus
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Label } from '@repo/ui/components/ui/label'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
    SheetTrigger
} from '@repo/ui/components/ui/sheet'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import { cn } from '@repo/ui/lib/utils'
import toast from '@repo/ui/components/ui/sonner'

// ==================== TYPES ====================
interface ShareableItem {
    id: string
    type: 'interview' | 'project' | 'space' | 'studio' | 'concept' | 'quiz' | 'challenge'
    title: string
    description?: string
    thumbnail?: string
    url?: string
    metadata?: Record<string, unknown>
}

interface MagicSheetProps {
    communityId?: string
    communitySlug?: string
    onShare?: (item: ShareableItem) => void
}

// ==================== PLATFORM FEATURES ====================
const PLATFORM_FEATURES = [
    {
        category: 'Interviews',
        description: 'Practice and share interview experiences',
        items: [
            {
                id: 'peer-interview',
                icon: Users,
                label: 'Peer Mock Interview',
                description: 'Practice with peers in real-time',
                color: 'bg-gradient-to-br from-violet-500 to-purple-600',
                href: '/peer-session/create',
                isCreatable: true
            },
            {
                id: 'sde-interview',
                icon: Briefcase,
                label: 'SDE Interview',
                description: 'Software Developer interview prep',
                color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
                href: '/interview/sde',
                isCreatable: true
            },
            {
                id: 'mock-interview',
                icon: Mic,
                label: 'AI Mock Interview',
                description: 'Practice with AI interviewer',
                color: 'bg-gradient-to-br from-orange-500 to-pink-600',
                href: '/mock-interview',
                isCreatable: true
            },
        ]
    },
    {
        category: 'Learning & Practice',
        description: 'Educational content and challenges',
        items: [
            {
                id: 'quiz',
                icon: GraduationCap,
                label: 'Quiz',
                description: 'Create and share quizzes',
                color: 'bg-gradient-to-br from-green-500 to-emerald-600',
                isCreatable: true
            },
            {
                id: 'challenge',
                icon: Zap,
                label: 'Coding Challenge',
                description: 'Challenge the community',
                color: 'bg-gradient-to-br from-amber-500 to-orange-600',
                href: '/challenges/create',
                isCreatable: true
            },
            {
                id: 'concept',
                icon: BookOpen,
                label: 'Concept Explainer',
                description: 'Share a concept visually',
                color: 'bg-gradient-to-br from-teal-500 to-cyan-600',
                href: '/concepts/create',
                isCreatable: true
            },
        ]
    },
    {
        category: 'Collaboration',
        description: 'Work together with the community',
        items: [
            {
                id: 'project',
                icon: Rocket,
                label: 'Project',
                description: 'Showcase your project',
                color: 'bg-gradient-to-br from-pink-500 to-rose-600',
                href: '/projects',
                isShareable: true
            },
            {
                id: 'space',
                icon: Presentation,
                label: 'Space',
                description: 'Collaborative workspace',
                color: 'bg-gradient-to-br from-indigo-500 to-violet-600',
                href: '/spaces',
                isShareable: true
            },
            {
                id: 'studio',
                icon: Palette,
                label: 'Studio',
                description: 'Creative studio project',
                color: 'bg-gradient-to-br from-fuchsia-500 to-purple-600',
                href: '/studio',
                isShareable: true
            },
        ]
    },
    {
        category: 'Live Sessions',
        description: 'Real-time interactive sessions',
        items: [
            {
                id: 'code-review',
                icon: Code2,
                label: 'Code Review Request',
                description: 'Get your code reviewed',
                color: 'bg-gradient-to-br from-red-500 to-rose-600',
                isCreatable: true
            },
            {
                id: 'live-help',
                icon: Lightbulb,
                label: 'Live Help Session',
                description: 'Get or give real-time help',
                color: 'bg-gradient-to-br from-yellow-500 to-amber-600',
                isCreatable: true
            },
            {
                id: 'screen-share',
                icon: Video,
                label: 'Screen Share',
                description: 'Quick collaboration session',
                color: 'bg-gradient-to-br from-sky-500 to-blue-600',
                isCreatable: true
            },
        ]
    },
]

// ==================== PEER INTERVIEW FORM ====================
function PeerInterviewForm({
    onSubmit,
    onCancel,
    isSubmitting
}: {
    onSubmit: (data: { title: string; description: string; role: string; level: string }) => void
    onCancel: () => void
    isSubmitting: boolean
}) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [role, setRole] = useState('sde')
    const [level, setLevel] = useState('mid')

    return (
        <div className="space-y-6 p-4">
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="icon" onClick={onCancel}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h3 className="text-xl font-bold">Create Peer Interview</h3>
                    <p className="text-sm text-neutral-500">Set up a mock interview session</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Session Title</Label>
                    <Input
                        id="title"
                        placeholder="e.g., Frontend Developer Mock Interview"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="What topics will be covered? Any specific requirements?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sde">Software Developer</SelectItem>
                                <SelectItem value="frontend">Frontend Developer</SelectItem>
                                <SelectItem value="backend">Backend Developer</SelectItem>
                                <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                                <SelectItem value="data">Data Engineer</SelectItem>
                                <SelectItem value="ml">ML Engineer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Level</Label>
                        <Select value={level} onValueChange={setLevel}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="intern">Intern</SelectItem>
                                <SelectItem value="junior">Junior (0-2 yrs)</SelectItem>
                                <SelectItem value="mid">Mid (2-5 yrs)</SelectItem>
                                <SelectItem value="senior">Senior (5+ yrs)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-medium text-violet-900 dark:text-violet-100">
                                Share to Find a Partner
                            </p>
                            <p className="text-sm text-violet-600 dark:text-violet-300">
                                This will be shared to the community. Members can accept your request.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    className="flex-1 gap-2"
                    onClick={() => onSubmit({ title, description, role, level })}
                    disabled={!title.trim() || isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Share2 className="w-4 h-4" />
                    )}
                    Share to Community
                </Button>
            </div>
        </div>
    )
}

// ==================== PROJECT SHARE FORM ====================
function ProjectShareForm({
    onSubmit,
    onCancel,
    isSubmitting
}: {
    onSubmit: (data: { url: string; title: string; description: string }) => void
    onCancel: () => void
    isSubmitting: boolean
}) {
    const [url, setUrl] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')

    return (
        <div className="space-y-6 p-4">
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="icon" onClick={onCancel}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h3 className="text-xl font-bold">Share Project</h3>
                    <p className="text-sm text-neutral-500">Share your project with the community</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="projectUrl">Project URL</Label>
                    <Input
                        id="projectUrl"
                        placeholder="https://your-project.com or /projects/your-project"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="projectTitle">Title</Label>
                    <Input
                        id="projectTitle"
                        placeholder="Project name"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="projectDescription">Description</Label>
                    <Textarea
                        id="projectDescription"
                        placeholder="Tell us about your project..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    className="flex-1 gap-2"
                    onClick={() => onSubmit({ url, title, description })}
                    disabled={!url.trim() || !title.trim() || isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Share2 className="w-4 h-4" />
                    )}
                    Share Project
                </Button>
            </div>
        </div>
    )
}

// ==================== MAIN COMPONENT ====================
export function MagicSheet({ communityId: _communityId, communitySlug: _communitySlug, onShare }: MagicSheetProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [activeForm, setActiveForm] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Reserved for future use
    void _communityId
    void _communitySlug

    const handleFeatureClick = useCallback((item: typeof PLATFORM_FEATURES[0]['items'][0]) => {
        if ('isCreatable' in item && item.isCreatable) {
            setActiveForm(item.id)
        } else if ('href' in item && item.href) {
            router.push(item.href)
            setIsOpen(false)
        }
    }, [router])

    const handleSubmit = useCallback(async (type: string, data: Record<string, unknown>) => {
        setIsSubmitting(true)
        try {
            // Create shareable post
            const shareableItem: ShareableItem = {
                id: crypto.randomUUID(),
                type: type as ShareableItem['type'],
                title: data.title as string,
                description: data.description as string,
                metadata: data
            }

            onShare?.(shareableItem)

            toast.success('Shared to community!')
            setActiveForm(null)
            setIsOpen(false)
        } catch {
            toast.error('Failed to share')
        } finally {
            setIsSubmitting(false)
        }
    }, [onShare])

    const renderForm = () => {
        switch (activeForm) {
            case 'peer-interview':
            case 'sde-interview':
            case 'mock-interview':
                return (
                    <PeerInterviewForm
                        onSubmit={(data) => handleSubmit('interview', data)}
                        onCancel={() => setActiveForm(null)}
                        isSubmitting={isSubmitting}
                    />
                )
            case 'project':
                return (
                    <ProjectShareForm
                        onSubmit={(data) => handleSubmit('project', data)}
                        onCancel={() => setActiveForm(null)}
                        isSubmitting={isSubmitting}
                    />
                )
            default:
                return null
        }
    }

    return (
        <>
            {/* Floating Action Button */}
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
                <Sheet open={isOpen} onOpenChange={(open) => { setIsOpen(open); setActiveForm(null) }}>
                    <SheetTrigger asChild>
                        <Button
                            size="lg"
                            className={cn(
                                "w-14 h-14 rounded-full shadow-2xl transition-all duration-300",
                                isOpen
                                    ? "bg-neutral-900 dark:bg-white rotate-45"
                                    : "bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            )}
                        >
                            <Plus className="w-6 h-6 text-white dark:text-neutral-900" />
                        </Button>
                    </SheetTrigger>

                    <SheetContent
                        side="bottom"
                        className="h-[85vh] rounded-t-3xl p-0 overflow-hidden"
                    >
                        <div className="max-w-5xl mx-auto h-full flex flex-col">
                            {/* Handle */}
                            <div className="flex justify-center pt-4 pb-2">
                                <div className="w-12 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                            </div>

                            {activeForm ? (
                                <div className="flex-1 overflow-y-auto">
                                    {renderForm()}
                                </div>
                            ) : (
                                <>
                                    {/* Header */}
                                    <SheetHeader className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                                        <SheetTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
                                            Share with Community
                                        </SheetTitle>
                                        <SheetDescription className="text-neutral-600 dark:text-neutral-400">
                                            Create and share platform features with the community
                                        </SheetDescription>
                                    </SheetHeader>

                                    {/* Content */}
                                    <div className="flex-1 overflow-y-auto p-6">
                                        <div className="space-y-8">
                                            {PLATFORM_FEATURES.map((section) => (
                                                <div key={section.category}>
                                                    <div className="mb-4">
                                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                                            {section.category}
                                                        </h3>
                                                        <p className="text-xs text-neutral-400 dark:text-neutral-500">
                                                            {section.description}
                                                        </p>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {section.items.map((item) => {
                                                            const Icon = item.icon
                                                            return (
                                                                <motion.button
                                                                    key={item.id}
                                                                    onClick={() => handleFeatureClick(item)}
                                                                    className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-lg transition-all duration-200 text-left bg-white dark:bg-neutral-900 group"
                                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                                    whileTap={{ scale: 0.98 }}
                                                                >
                                                                    <div className={cn(
                                                                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg",
                                                                        item.color
                                                                    )}>
                                                                        <Icon className="w-6 h-6 text-white" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                            {item.label}
                                                                        </div>
                                                                        <div className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                                                                            {item.description}
                                                                        </div>
                                                                    </div>
                                                                    <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 flex-shrink-0" />
                                                                </motion.button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </motion.div>

            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    )
}

// Export preview cards for different share types
export function SharedInterviewCard({
    title,
    description,
    role,
    level,
    author,
    onAccept
}: {
    title: string
    description?: string
    role: string
    level: string
    author: { name: string; image?: string }
    onAccept?: () => void
}) {
    return (
        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                            Peer Interview
                        </Badge>
                    </div>
                    <h4 className="font-semibold text-lg text-neutral-900 dark:text-white mb-1">
                        {title}
                    </h4>
                    {description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                            {description}
                        </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                        <Badge variant="outline">{role}</Badge>
                        <Badge variant="outline">{level}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                {author.image && (
                                    <Image src={author.image} alt={author.name} width={24} height={24} />
                                )}
                            </div>
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                {author.name}
                            </span>
                        </div>
                        {onAccept && (
                            <Button size="sm" className="gap-2" onClick={onAccept}>
                                <UserPlus className="w-4 h-4" />
                                Accept Request
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export function SharedProjectCard({
    title,
    description,
    url,
    thumbnail,
    author
}: {
    title: string
    description?: string
    url: string
    thumbnail?: string
    author: { name: string; image?: string }
}) {
    return (
        <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            {thumbnail && (
                <div className="aspect-video relative">
                    <Image src={thumbnail} alt={title} fill className="object-cover" />
                </div>
            )}
            <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300">
                        Project
                    </Badge>
                </div>
                <h4 className="font-semibold text-lg text-neutral-900 dark:text-white mb-1">
                    {title}
                </h4>
                {description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        {description}
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                            {author.image && (
                                <Image src={author.image} alt={author.name} width={24} height={24} />
                            )}
                        </div>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {author.name}
                        </span>
                    </div>
                    <Button asChild size="sm" variant="outline" className="gap-2">
                        <Link href={url} target="_blank">
                            <ExternalLink className="w-4 h-4" />
                            Visit
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}