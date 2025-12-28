'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, MessageCircle, HelpCircle, FileText, Users, Mic, BarChart3,
    GraduationCap, Code2, Video, Calendar, Lightbulb, Rocket
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
    SheetTrigger
} from '@repo/ui/components/ui/sheet'
import { cn } from '@repo/ui/lib/utils'

// interface MagicSheetProps {
//     communityId?: string
//     communitySlug?: string
// }

const QUICK_ACTIONS = [
    {
        category: 'Create',
        items: [
            { icon: MessageCircle, label: 'New Post', href: '#', color: 'bg-blue-500', action: 'post' },
            { icon: HelpCircle, label: 'Ask Question', href: '#', color: 'bg-orange-500', action: 'question' },
            { icon: FileText, label: 'Share Resource', href: '#', color: 'bg-green-500', action: 'resource' },
            { icon: Calendar, label: 'Create Event', href: '#', color: 'bg-purple-500', action: 'event' },
        ]
    },
    {
        category: 'Platform Features',
        items: [
            { icon: Mic, label: 'Start Peer Mock', href: '/peer-session/create', color: 'bg-rose-500', description: 'Practice interviews with peers' },
            { icon: Rocket, label: 'Share Project', href: '/projects', color: 'bg-cyan-500', description: 'Showcase your work' },
            { icon: BarChart3, label: 'Create Poll', href: '#', color: 'bg-indigo-500', description: 'Get community opinions' },
            { icon: GraduationCap, label: 'Study Room', href: '#', color: 'bg-amber-500', description: 'Learn together' },
        ]
    },
    {
        category: 'Collaborate',
        items: [
            { icon: Users, label: 'Find Partner', href: '#', color: 'bg-teal-500', description: 'Find study/project partners' },
            { icon: Video, label: 'Screen Share', href: '#', color: 'bg-pink-500', description: 'Quick collaboration' },
            { icon: Code2, label: 'Code Review', href: '#', color: 'bg-violet-500', description: 'Request code review' },
            { icon: Lightbulb, label: 'Ask for Help', href: '#', color: 'bg-yellow-500', description: 'Get immediate help' },
        ]
    }
]

export function MagicSheet() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <motion.div
                className="fixed bottom-20 right-6 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button
                            size="lg"
                            className={cn(
                                "w-14 h-14 rounded-full shadow-xl transition-all duration-300",
                                isOpen
                                    ? "bg-neutral-900 dark:bg-white rotate-45"
                                    : "bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            )}
                        >
                            <Plus className="w-6 h-6 text-white dark:text-neutral-900" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-white dark:bg-neutral-950 p-0">
                        <SheetHeader className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                            <SheetTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
                                Quick Actions
                            </SheetTitle>
                            <SheetDescription className="text-neutral-600 dark:text-neutral-400">
                                Access platform features from anywhere
                            </SheetDescription>
                        </SheetHeader>
                        <div className="p-6 space-y-8">
                            {
                                QUICK_ACTIONS.map((section) => (
                                    <div key={section.category}>
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4">
                                            {section.category}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {
                                                section.items.map((item) => {
                                                    const Icon = item.icon
                                                    return (
                                                        <motion.button
                                                            key={item.label}
                                                            onClick={() => {
                                                                if (item.href !== '#') {
                                                                    window.location.href = item.href
                                                                }
                                                                setIsOpen(false)
                                                            }}
                                                            className="flex flex-col items-start gap-2 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all duration-200 text-left bg-white dark:bg-neutral-900"
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <div className={cn(
                                                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                                                item.color
                                                            )}>
                                                                <Icon className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-sm text-neutral-900 dark:text-white">
                                                                    {item.label}
                                                                </div>
                                                                {
                                                                    'description' in item && (
                                                                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                                                            {item.description}
                                                                        </div>
                                                                    )
                                                                }
                                                            </div>
                                                        </motion.button>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                ))
                            }
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4">
                                    Quick Connect
                                </h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-6 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
                                    Your recent connections will appear here
                                </p>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </motion.div>
            <AnimatePresence>
                {
                    isOpen && (
                        <motion.div
                            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />
                    )
                }
            </AnimatePresence>
        </>
    )
}

// Mini version that shows inline quick actions
export function QuickActionsBar() {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {
                QUICK_ACTIONS[0]?.items?.slice(0, 4).map((item) => {
                    const Icon = item.icon
                    return (
                        <Button
                            key={item.label}
                            variant="outline"
                            size="sm"
                            className="gap-2 whitespace-nowrap rounded-full border-neutral-200 dark:border-neutral-700"
                        >
                            <Icon className="w-4 h-4" />
                            {item.label}
                        </Button>
                    )
                })
            }
        </div>
    )
}