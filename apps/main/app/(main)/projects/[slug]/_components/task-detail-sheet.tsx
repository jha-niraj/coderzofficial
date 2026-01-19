'use client'

import { useState } from 'react'
import {
    Clock, CheckCircle2, Circle, Lightbulb, Target, Code2, Link2,
    ArrowLeft, ArrowRight, Copy, Check, Terminal, ChevronDown
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter
} from '@repo/ui/components/ui/sheet'
import {
    Collapsible, CollapsibleContent, CollapsibleTrigger
} from '@repo/ui/components/ui/collapsible'
import { cn } from '@repo/ui/lib/utils'

export interface TaskData {
    id: string
    title: string
    description: string[]
    criteria?: string[]
    hints?: string[]
    badges?: string[]
    tags?: string[]
    difficulty: string
    category?: string | null
    estimatedTime?: string | null
    checkpoints?: string[]
    relatedPages?: string[]
    dependencies?: string[]
    terminalCommand?: string | null
    orderIndex: number
    status?: string
}

interface TaskDetailSheetProps {
    task: TaskData | null
    isOpen: boolean
    onClose: () => void
    onNavigate: (direction: 'prev' | 'next') => void
    hasPrev: boolean
    hasNext: boolean
    difficultyColors?: Record<string, string>
    categoryColors?: Record<string, string>
    taskStatus?: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED'
    onStatusChange?: (status: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED') => void
    hasStarted?: boolean
}

export function TaskDetailSheet({
    task,
    isOpen,
    onClose,
    onNavigate,
    hasPrev,
    hasNext,
    difficultyColors = {
        BEGINNER: 'text-green-600 bg-green-50 dark:bg-green-950/30',
        INTERMEDIATE: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
        ADVANCED: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30'
    },
    categoryColors = {},
    taskStatus = 'TO_DO',
    onStatusChange,
    hasStarted
}: TaskDetailSheetProps) {
    const [copied, setCopied] = useState(false)
    const [hintsOpen, setHintsOpen] = useState(false)

    if (!task) return null

    const handleCopyCommand = () => {
        if (task.terminalCommand) {
            navigator.clipboard.writeText(task.terminalCommand)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const statusOptions = [
        { value: 'TO_DO', label: 'To Do', icon: Circle, color: 'text-neutral-500' },
        { value: 'IN_PROGRESS', label: 'In Progress', icon: Clock, color: 'text-yellow-500' },
        { value: 'COMPLETED', label: 'Completed', icon: CheckCircle2, color: 'text-green-500' }
    ] as const

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="bottom" className="h-[90vh] w-full overflow-y-auto">
                <SheetHeader className="text-left pb-6 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="max-w-7xl mx-auto w-full">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <SheetTitle className="text-xl mb-2">{task.title}</SheetTitle>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className={difficultyColors[task.difficulty] || ''}>
                                        {task.difficulty}
                                    </Badge>
                                    {task.category && (
                                        <Badge variant="outline" className={categoryColors[task.category] || ''}>
                                            {task.category}
                                        </Badge>
                                    )}
                                    {task.estimatedTime && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {task.estimatedTime}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            {hasStarted && onStatusChange && (
                                <div className="flex gap-1">
                                    {statusOptions.map((option) => {
                                        const Icon = option.icon
                                        return (
                                            <Button
                                                key={option.value}
                                                variant={taskStatus === option.value ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => onStatusChange(option.value)}
                                                className={cn(
                                                    'gap-1',
                                                    taskStatus === option.value && 'bg-indigo-600 hover:bg-indigo-700'
                                                )}
                                            >
                                                <Icon className={cn('w-3 h-3', taskStatus !== option.value && option.color)} />
                                                <span className="hidden sm:inline">{option.label}</span>
                                            </Button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                        {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                                {task.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </SheetHeader>

                <div className="max-w-7xl mx-auto py-6 space-y-6">
                    {/* Description Steps */}
                    {task.description && task.description.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                                <Code2 className="w-4 h-4" />
                                What to Build
                            </h4>
                            <ol className="space-y-3">
                                {task.description.map((step, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-medium">
                                            {idx + 1}
                                        </span>
                                        <span className="leading-relaxed pt-0.5">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* Success Criteria */}
                    {task.criteria && task.criteria.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Success Criteria
                            </h4>
                            <ul className="space-y-2">
                                {task.criteria.map((criterion, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                        {criterion}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Checkpoints */}
                    {task.checkpoints && task.checkpoints.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Checkpoints
                            </h4>
                            <ul className="space-y-2">
                                {task.checkpoints.map((checkpoint, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                        <div className="w-4 h-4 rounded border-2 border-neutral-300 dark:border-neutral-600 flex-shrink-0 mt-0.5" />
                                        {checkpoint}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Hints (Collapsible) */}
                    {task.hints && task.hints.length > 0 && (
                        <Collapsible open={hintsOpen} onOpenChange={setHintsOpen}>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between p-4 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-xl">
                                    <span className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                        <Lightbulb className="w-4 h-4" />
                                        {task.hints.length} Hints Available
                                    </span>
                                    <ChevronDown className={cn('w-4 h-4 transition-transform', hintsOpen && 'rotate-180')} />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <ul className="mt-3 space-y-2 p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl">
                                    {task.hints.map((hint, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
                                            <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            {hint}
                                        </li>
                                    ))}
                                </ul>
                            </CollapsibleContent>
                        </Collapsible>
                    )}

                    {/* Related Pages */}
                    {task.relatedPages && task.relatedPages.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                                <Link2 className="w-4 h-4" />
                                Related Pages
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {task.relatedPages.map((page, idx) => (
                                    <Badge key={idx} variant="secondary">
                                        {page}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dependencies */}
                    {task.dependencies && task.dependencies.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Dependencies
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {task.dependencies.map((dep, idx) => (
                                    <Badge key={idx} variant="outline" className="text-orange-600 border-orange-300">
                                        {dep}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Terminal Command */}
                    {task.terminalCommand && (
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                Terminal Command
                            </h4>
                            <div className="flex items-center gap-2 p-3 bg-neutral-900 dark:bg-black rounded-xl">
                                <code className="flex-1 text-sm text-green-400 font-mono">
                                    $ {task.terminalCommand}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopyCommand}
                                    className="text-neutral-400 hover:text-white"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <SheetFooter className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="max-w-7xl mx-auto w-full flex justify-between">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onNavigate('prev')}
                                disabled={!hasPrev}
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => onNavigate('next')}
                                disabled={!hasNext}
                            >
                                Next
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
