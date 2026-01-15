'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
    Plus, Users, Mic, GraduationCap, Code2, Video, Lightbulb, Rocket, ChevronRight,
    ExternalLink, Loader2, Share2, ArrowLeft, Briefcase, BookOpen,
    Palette, Presentation, Zap, UserPlus, Search, RefreshCw, Layers, Sparkles
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
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { cn } from '@repo/ui/lib/utils'
import toast from '@repo/ui/components/ui/sonner'
import ProjectGenerateSheet from '@/components/projects/project-generate-sheet'

// Actions
import { getUserProjects } from '@/actions/(main)/projects/project.action'
import { getUserSpaces } from '@/actions/(main)/space/space.action'
import { getMyStudios } from '@/actions/(main)/studios/studio.action'
import { getUserCreatedMocks } from '@/actions/(main)/mockvoice/voice.action'

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

interface UserItem {
    id: string
    title: string
    description?: string
    imageUrl?: string
    type: string
    createdAt: Date
    url: string
    metadata?: any
}

// ==================== PLATFORM FEATURES ====================
const PLATFORM_FEATURES = [
    {
        category: 'Interviews',
        description: 'Practice and share interview experiences',
        items: [
            {
                id: 'mock-interview',
                icon: Mic,
                label: 'Voice Mock Interview',
                description: 'Practice with AI interviewer',
                color: 'bg-gradient-to-br from-orange-500 to-pink-600',
                isFetchable: true,
                fetchType: 'MOCK_INTERVIEW',
                createUrl: '/mockinterview'
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
                isFetchable: true,
                fetchType: 'PROJECT',
                createAction: 'PROJECT_GENERATE'
            },
            {
                id: 'space',
                icon: Presentation,
                label: 'Space',
                description: 'Collaborative workspace',
                color: 'bg-gradient-to-br from-indigo-500 to-violet-600',
                isFetchable: true,
                fetchType: 'SPACE',
                createUrl: '/space/create' // Placeholder or direct action
            },
            {
                id: 'studio',
                icon: Palette,
                label: 'Studio',
                description: 'Creative studio project',
                color: 'bg-gradient-to-br from-fuchsia-500 to-purple-600',
                isFetchable: true,
                fetchType: 'STUDIO',
                createUrl: '/studio' // Placeholder
            },
        ]
    }
]



// ==================== CONFIRM SHARE MODAL ====================
function ConfirmShareDialog({
    isOpen,
    onClose,
    onConfirm,
    item
}: {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    item: UserItem | null
}) {
    if (!item) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-neutral-200 dark:border-neutral-800 relative z-[70]"
                    >
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                                <Share2 className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                                Share to Community?
                            </h3>
                            <p className="text-neutral-500 dark:text-neutral-400">
                                You are about to share <strong>{item.title}</strong> with the community.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={onConfirm}>
                                <Share2 className="w-4 h-4" />
                                Share Now
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}


// ==================== MAIN COMPONENT ====================
export function MagicSheet({ communityId: _communityId, communitySlug: _communitySlug, onShare }: MagicSheetProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [view, setView] = useState<'CATEGORIES' | 'LIST' | 'FORM'>('CATEGORIES')
    const [activeCategory, setActiveCategory] = useState<any>(null)
    const [activeForm, setActiveForm] = useState<string | null>(null)

    // Data Loading
    const [isLoading, setIsLoading] = useState(false)
    const [items, setItems] = useState<UserItem[]>([])
    const [selectedItem, setSelectedItem] = useState<UserItem | null>(null)
    const [showConfirmShare, setShowConfirmShare] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Project Generate Sheet
    const [showProjectGenerate, setShowProjectGenerate] = useState(false)

    // Reserved for future use
    void _communityId
    void _communitySlug

    // Reset when closing
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setView('CATEGORIES')
                setActiveCategory(null)
                setActiveForm(null)
                setItems([])
            }, 300)
        }
    }, [isOpen])

    const fetchItems = async (type: string) => {
        setIsLoading(true)
        setItems([])
        try {
            let data: UserItem[] = []

            if (type === 'PROJECT') {
                const res = await getUserProjects(1, 100)
                if (res.success && res.data?.projects) {
                    data = res.data.projects.map((p: any) => ({
                        id: p.id,
                        title: p.title,
                        description: p.shortDescription || p.description,
                        type: 'project',
                        createdAt: new Date(p.createdAt),
                        url: `/projects/${p.slug}`,
                        metadata: { slug: p.slug, technologies: p.technologies }
                    }))
                }
            } else if (type === 'SPACE') {
                const res = await getUserSpaces()
                if (res.success && res.data?.spaces) {
                    data = res.data.spaces.map((s: any) => ({
                        id: s.id,
                        title: s.title,
                        description: s.description,
                        imageUrl: s.coverImage,
                        type: 'space',
                        createdAt: new Date(s.createdAt),
                        url: `/space/${s.slug}`,
                        metadata: { slug: s.slug, emoji: s.emoji }
                    }))
                }
            } else if (type === 'STUDIO') {
                const res = await getMyStudios()
                if (res.studios) {
                    data = res.studios.map((s: any) => ({
                        id: s.id,
                        title: s.title,
                        description: s.description,
                        type: 'studio',
                        createdAt: new Date(s.updatedAt),
                        url: `/studio/${s.slug || s.id}`,
                        metadata: { category: s.category }
                    }))
                }
            } else if (type === 'MOCK_INTERVIEW') {
                const res = await getUserCreatedMocks()
                if (res.success && res.mocks) {
                    data = res.mocks.map((m: any) => ({
                        id: m.id,
                        title: m.title,
                        description: m.description,
                        type: 'mock-interview',
                        createdAt: new Date(m.createdAt),
                        url: `/mockinterview/${m.id}`, // Placeholder
                        metadata: { level: m.level, duration: m.duration }
                    }))
                }
            }

            setItems(data)
        } catch (error) {
            console.error(error)
            toast.error('Failed to load items')
        } finally {
            setIsLoading(false)
        }
    }

    const handleItemClick = (feature: any) => {
        if (feature.isAction) {
            setActiveForm(feature.actionView)
            setView('FORM')
        } else if (feature.isFetchable) {
            setActiveCategory(feature)
            setView('LIST')
            fetchItems(feature.fetchType)
        } else if (feature.createUrl) {
            router.push(feature.createUrl)
            setIsOpen(false)
        }
    }

    const handleCreateNew = () => {
        if (!activeCategory) return

        if (activeCategory.createAction === 'PROJECT_GENERATE') {
            setShowProjectGenerate(true)
            setIsOpen(false)
        } else if (activeCategory.createUrl) {
            router.push(activeCategory.createUrl)
            setIsOpen(false)
        } else {
            // Fallback for types not implemented
            toast.info('Create feature coming soon!')
        }
    }

    const handleShareItem = (item: UserItem) => {
        setSelectedItem(item)
        setShowConfirmShare(true)
    }

    const confirmShare = async () => {
        if (!selectedItem) return

        setIsSubmitting(true)
        try {
            const shareableItem: ShareableItem = {
                id: crypto.randomUUID(),
                type: selectedItem.type as any,
                title: selectedItem.title,
                description: selectedItem.description,
                url: selectedItem.url,
                metadata: selectedItem.metadata,
                thumbnail: selectedItem.imageUrl
            }

            onShare?.(shareableItem)
            toast.success('Shared to community!')
            setShowConfirmShare(false)
            setIsOpen(false)
        } catch (error) {
            toast.error('Failed to share')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFormSubmit = async (type: string, data: any) => {
        setIsSubmitting(true)
        try {
            const shareableItem: ShareableItem = {
                id: crypto.randomUUID(),
                type: 'interview', // Map to correct type
                title: data.title,
                description: data.description,
                metadata: data
            }
            onShare?.(shareableItem)
            toast.success('Shared to community!')
            setIsOpen(false)
        } catch {
            toast.error('Failed to share')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <ProjectGenerateSheet
                isOpen={showProjectGenerate}
                onOpenChange={setShowProjectGenerate}
            />

            <ConfirmShareDialog
                isOpen={showConfirmShare}
                onClose={() => setShowConfirmShare(false)}
                onConfirm={confirmShare}
                item={selectedItem}
            />

            {/* Floating Action Button */}
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button
                            size="lg"
                            className={cn(
                                "w-14 h-14 rounded-full shadow-2xl transition-all duration-500 hover:scale-105",
                                isOpen
                                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rotate-90"
                                    : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white animate-in zoom-in"
                            )}
                        >
                            {isOpen ? (
                                <Plus className="w-6 h-6 rotate-45" />
                            ) : (
                                <Sparkles className="w-6 h-6 animate-pulse" />
                            )}
                        </Button>
                    </SheetTrigger>

                    <SheetContent
                        side="bottom"
                        className="h-[85vh] rounded-t-3xl p-0 overflow-hidden outline-none border-t-0"
                    >
                        <div className="max-w-5xl mx-auto h-full flex flex-col bg-white dark:bg-neutral-950">
                            {/* Handle */}
                            <div className="flex justify-center pt-4 pb-2">
                                <div className="w-12 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                            </div>

                            {view === 'CATEGORIES' && (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <SheetHeader className="px-6 py-4 flex-shrink-0">
                                        <SheetTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
                                            Share with Community
                                        </SheetTitle>
                                        <SheetDescription className="text-neutral-600 dark:text-neutral-400">
                                            Pick a tool to create or share content
                                        </SheetDescription>
                                    </SheetHeader>

                                    <ScrollArea className="flex-1 px-6">
                                        <div className="pb-10 space-y-8">
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
                                                                    onClick={() => handleItemClick(item)}
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
                                    </ScrollArea>
                                </div>
                            )}

                            {view === 'LIST' && activeCategory && (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-4 flex-shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setView('CATEGORIES')}
                                            className="-ml-2"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </Button>
                                        <div>
                                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                                My {activeCategory.label}s
                                            </h3>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                Select an item to share or create new
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-hidden relative">
                                        {isLoading ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                                                <p className="text-sm text-neutral-500">Loading your items...</p>
                                            </div>
                                        ) : items.length === 0 ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                                <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                                                    <activeCategory.icon className="w-8 h-8 text-neutral-400" />
                                                </div>
                                                <h4 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                                                    No {activeCategory.label}s found
                                                </h4>
                                                <p className="text-sm text-neutral-500 mb-6 max-w-xs">
                                                    You haven&apos;t created any {activeCategory.label.toLowerCase()}s yet.
                                                </p>
                                                <Button onClick={handleCreateNew}>
                                                    Create your first {activeCategory.label}
                                                </Button>
                                            </div>
                                        ) : (
                                            <ScrollArea className="h-full px-6 py-4">
                                                <div className="space-y-3 pb-24">
                                                    {items.map((item) => (
                                                        <motion.div
                                                            key={item.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                                                        >
                                                            <div className={cn(
                                                                "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                                                                activeCategory.color
                                                            )}>
                                                                {item.imageUrl ? (
                                                                    <Image
                                                                        src={item.imageUrl}
                                                                        alt={item.title}
                                                                        width={48}
                                                                        height={48}
                                                                        className="w-full h-full object-cover rounded-lg"
                                                                    />
                                                                ) : (
                                                                    <activeCategory.icon className="w-6 h-6 text-white" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-neutral-900 dark:text-white truncate">
                                                                    {item.title}
                                                                </h4>
                                                                <p className="text-sm text-neutral-500 truncate">
                                                                    {item.description || "No description"}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                                                                    <span>{item.type}</span>
                                                                    <span>•</span>
                                                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="gap-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-200 dark:group-hover:border-blue-800"
                                                                onClick={() => handleShareItem(item)}
                                                            >
                                                                <Share2 className="w-4 h-4" />
                                                                Share
                                                            </Button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        )}
                                    </div>

                                    {/* Footer Create Action */}
                                    <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex-shrink-0">
                                        <Button
                                            size="lg"
                                            className="w-full gap-2 shadow-lg"
                                            onClick={handleCreateNew}
                                        >
                                            <Plus className="w-5 h-5" />
                                            Create New {activeCategory.label}
                                        </Button>
                                    </div>
                                </div>
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