'use client'

import { useState, useEffect } from 'react'
import {
    Book, Users, AlertTriangle
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import ResourcesList from '@/components/projects/resources-list'
import { FeatureSuggestionsList } from '@/components/projects/feature-suggestions-list'
import ErrorsTab from '@/components/projects/errors-tab'
import { getProjectResources } from '@/actions/(main)/projects/resources.action'
import { getFeatureSuggestions } from '@/actions/(main)/projects/feature-suggestions.action'
import { getProjectErrorStats } from '@/actions/(main)/projects/project-errors.action'
import { Suggestion } from '@/types/project'

interface ProjectAssistantButtonsProps {
    projectId: string
    projectSlug: string
    isCreator: boolean
    isEnrolled: boolean
    currentUserId?: string | null
}

export function ProjectAssistantButtons({
    projectId,
    projectSlug,
    isCreator,
    isEnrolled,
    currentUserId
}: ProjectAssistantButtonsProps) {
    const [resourcesOpen, setResourcesOpen] = useState(false)
    const [suggestionsOpen, setSuggestionsOpen] = useState(false)
    const [errorsOpen, setErrorsOpen] = useState(false)

    // Counts for badges
    const [resourcesCount, setResourcesCount] = useState(0)
    const [suggestionsCount, setSuggestionsCount] = useState(0)
    const [errorsCount, setErrorsCount] = useState(0)
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])


    // Fetch counts on mount
    useEffect(() => {
        const fetchCounts = async () => {

            try {
                const [resourcesRes, suggestionsRes, errorsRes] = await Promise.all([
                    getProjectResources({ projectId }),
                    getFeatureSuggestions(projectId),
                    getProjectErrorStats(projectId)
                ])

                if (resourcesRes.success && resourcesRes.resources) {
                    setResourcesCount(resourcesRes.resources.length)
                }
                if (suggestionsRes.success && suggestionsRes.data) {
                    setSuggestionsCount(suggestionsRes.data.length)
                    setSuggestions(suggestionsRes.data)
                }
                if (errorsRes.success && errorsRes.data) {
                    setErrorsCount(errorsRes.data.totalErrors || 0)
                }
            } catch (e) {
                console.error('Failed to fetch counts:', e)
            }
        }
        fetchCounts()
    }, [projectId])

    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResourcesOpen(true)}
                    className="relative gap-2"
                >
                    <Book className="w-4 h-4" />
                    <span className="hidden sm:inline">Resources</span>
                    {
                        resourcesCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-blue-600 text-white rounded-full px-1">
                                {resourcesCount}
                            </span>
                        )
                    }
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSuggestionsOpen(true)}
                    className="relative gap-2"
                >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Community</span>
                    {
                        suggestionsCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-indigo-600 text-white rounded-full px-1">
                                {suggestionsCount}
                            </span>
                        )
                    }
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setErrorsOpen(true)}
                    className="relative gap-2"
                >
                    <AlertTriangle className="w-4 h-4" />
                    <span className="hidden sm:inline">Errors</span>
                    {
                        errorsCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-amber-600 text-white rounded-full px-1">
                                {errorsCount}
                            </span>
                        )
                    }
                </Button>
            </div>
            <Sheet open={resourcesOpen} onOpenChange={setResourcesOpen}>
                <SheetContent side="bottom" className="h-[90vh] w-full p-0">
                    <div className="h-full flex flex-col">
                        <SheetHeader className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                            <SheetTitle className="flex items-center gap-2">
                                <Book className="w-5 h-5 text-blue-600" />
                                Resources Library
                            </SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="flex-1">
                            <div className="max-w-7xl mx-auto px-6 py-6">
                                <ResourcesList
                                    projectId={projectId}
                                    currentUserId={currentUserId}
                                    isCreator={isCreator}
                                />
                            </div>
                        </ScrollArea>
                    </div>
                </SheetContent>
            </Sheet>
            <Sheet open={suggestionsOpen} onOpenChange={setSuggestionsOpen}>
                <SheetContent side="bottom" className="h-[90vh] w-full p-0">
                    <div className="h-full flex flex-col">
                        <SheetHeader className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                            <SheetTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600" />
                                Community Suggestions
                            </SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="flex-1">
                            <div className="max-w-7xl mx-auto px-6 py-6">
                                <FeatureSuggestionsList
                                    suggestions={suggestions}
                                    projectSlug={projectSlug}
                                    isCreator={isCreator}
                                    isEnrolled={isEnrolled}
                                    currentUserId={currentUserId}
                                />
                            </div>
                        </ScrollArea>
                    </div>
                </SheetContent>
            </Sheet>
            <Sheet open={errorsOpen} onOpenChange={setErrorsOpen}>
                <SheetContent side="bottom" className="h-[90vh] w-full p-0">
                    <div className="h-full flex flex-col">
                        <SheetHeader className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                            <SheetTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                                Errors & Mistakes
                            </SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="flex-1">
                            <div className="max-w-7xl mx-auto px-6 py-6">
                                <ErrorsTab
                                    projectId={projectId}
                                    isEnrolled={isEnrolled}
                                    isCreator={isCreator}
                                />
                            </div>
                        </ScrollArea>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}