"use client"

import { useState } from "react"
import { Card } from "@repo/ui/components/ui/card"
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet'
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import {
    Lightbulb, Eye, Plus, CheckCircle, ListTodo, Crown, Users2, User
} from "lucide-react"
import {
    addSuggestionToTasks, updateSuggestionStatus, adoptSuggestionToMyTasks,
    adoptVisitorSuggestionToTasks
} from "@/actions/(main)/projects/feature-suggestions.action"
import toast from "@repo/ui/components/ui/sonner"
import Image from "next/image"

interface Suggestion {
    id: string
    title: string
    description: string
    type: string
    tags: string[]
    imageUrl: string | null
    status: string
    addedToTasks: boolean
    suggestedBy: "CREATOR" | "ENROLLED_USER" | "VISITOR"
    addedByUsers: string[]
    adoptedByCurrentUser: boolean
    createdAt: Date
    user: {
        id: string
        name: string | null
        username: string | null
        image: string | null
    }
    task: {
        id: string
        title: string
    } | null
}

interface FeatureSuggestionsListProps {
    suggestions: Suggestion[]
    projectSlug: string
    isCreator: boolean
    isEnrolled: boolean
    currentUserId?: string | null
}

export function FeatureSuggestionsList({
    suggestions,
    projectSlug,
    isCreator,
    isEnrolled,
    currentUserId,
}: FeatureSuggestionsListProps) {
    const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null)
    const [loading, setLoading] = useState<string | null>(null)

    const handleAddToTasks = async (suggestionId: string) => {
        setLoading(suggestionId)
        try {
            const result = await addSuggestionToTasks(suggestionId, projectSlug)
            if (result.success) {
                toast.success(result.message)
                setSelectedSuggestion(null)
                window.location.reload() // Refresh to show updated data
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.log("Error occurred while adding task: " + error);
            toast.error("Failed to add to tasks")
        } finally {
            setLoading(null)
        }
    }

    const handleAdoptToMyTasks = async (suggestionId: string) => {
        setLoading(suggestionId)
        try {
            const result = await adoptSuggestionToMyTasks(suggestionId, projectSlug)
            if (result.success) {
                toast.success(result.message)
                setSelectedSuggestion(null)
                window.location.reload()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.log("Error occurred while adopting task: " + error);
            toast.error("Failed to adopt task")
        } finally {
            setLoading(null)
        }
    }

    const handleAdoptVisitorSuggestion = async (suggestionId: string) => {
        setLoading(suggestionId)
        try {
            const result = await adoptVisitorSuggestionToTasks(suggestionId, projectSlug)
            if (result.success) {
                toast.success(result.message)
                setSelectedSuggestion(null)
                window.location.reload()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.log("Error occurred while adding task: " + error);
            toast.error("Failed to add task")
        } finally {
            setLoading(null)
        }
    }

    const handleUpdateStatus = async (suggestionId: string, status: string) => {
        setLoading(suggestionId)
        try {
            const result = await updateSuggestionStatus(suggestionId, status)
            if (result.success) {
                toast.success(result.message)
                window.location.reload()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.log("Error occurred while updating task: " + error);
            toast.error("Failed to update status")
        } finally {
            setLoading(null)
        }
    }

    const getSuggestionSourceBadge = (source: string) => {
        switch (source) {
            case "CREATOR":
                return (
                    <Badge variant="outline" className="gap-1 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        <Crown className="h-3 w-3" />
                        Creator
                    </Badge>
                )
            case "ENROLLED_USER":
                return (
                    <Badge variant="outline" className="gap-1 bg-blue-500/10 text-blue-500 border-blue-500/20">
                        <Users2 className="h-3 w-3" />
                        Enrolled
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline" className="gap-1 bg-gray-500/10 text-gray-500 border-gray-500/20">
                        <User className="h-3 w-3" />
                        Visitor
                    </Badge>
                )
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED":
                return "bg-green-500/10 text-green-500 border-green-500/20"
            case "REJECTED":
                return "bg-red-500/10 text-red-500 border-red-500/20"
            case "IMPLEMENTED":
                return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            case "UNDER_REVIEW":
                return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
            default:
                return "bg-gray-500/10 text-gray-500 border-gray-500/20"
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case "FEATURE":
                return "bg-purple-500/10 text-purple-500"
            case "BUG_FIX":
                return "bg-red-500/10 text-red-500"
            case "IMPROVEMENT":
                return "bg-blue-500/10 text-blue-500"
            case "UI_UX":
                return "bg-pink-500/10 text-pink-500"
            case "PERFORMANCE":
                return "bg-orange-500/10 text-orange-500"
            default:
                return "bg-gray-500/10 text-gray-500"
        }
    }

    if (suggestions.length === 0) {
        return (
            <Card className="p-12 text-center">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Suggestions Yet</h3>
                <p className="text-muted-foreground">
                    Be the first to suggest a feature for this project!
                </p>
            </Card>
        )
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2">
                {
                    suggestions.map((suggestion) => (
                        <Card key={suggestion.id} className="bg-white dark:bg-neutral-900 p-4 shadow-2xl rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <h3 className="font-semibold line-clamp-1">{suggestion.title}</h3>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <Avatar className="h-5 w-5">
                                                <AvatarImage src={suggestion.user.image || undefined} />
                                                <AvatarFallback>
                                                    {suggestion.user.name?.[0] || suggestion.user.username?.[0] || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-muted-foreground">
                                                {suggestion.user.name || suggestion.user.username}
                                            </span>
                                            <span className="text-xs text-muted-foreground">•</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end">
                                        <Badge className={getTypeColor(suggestion.type)} variant="outline">
                                            {suggestion.type.replace("_", " ")}
                                        </Badge>
                                        {getSuggestionSourceBadge(suggestion.suggestedBy)}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {suggestion.description}
                                </p>
                                {
                                    suggestion.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {
                                                suggestion.tags.slice(0, 3).map((tag) => (
                                                    <Badge key={tag} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))
                                            }
                                            {
                                                suggestion.tags.length > 3 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{suggestion.tags.length - 3}
                                                    </Badge>
                                                )
                                            }
                                        </div>
                                    )
                                }
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div className="flex items-center gap-2">
                                        <Badge className={getStatusColor(suggestion.status)} variant="outline">
                                            {suggestion.status.replace("_", " ")}
                                        </Badge>
                                        {
                                            suggestion.addedToTasks && (
                                                <Badge variant="secondary" className="gap-1">
                                                    <ListTodo className="h-3 w-3" />
                                                    In Tasks
                                                </Badge>
                                            )
                                        }
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedSuggestion(suggestion)}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                }
            </div>
            <Sheet open={!!selectedSuggestion} onOpenChange={() => setSelectedSuggestion(null)}>
                <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
                    {
                        selectedSuggestion && (
                            <>
                                <SheetHeader>
                                    <SheetTitle>{selectedSuggestion.title}</SheetTitle>
                                    <SheetDescription>
                                        Suggested by {selectedSuggestion.user.name || selectedSuggestion.user.username}
                                        {" • "}
                                        {formatDistanceToNow(new Date(selectedSuggestion.createdAt), { addSuffix: true })}
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="mt-6 space-y-6">
                                    {
                                        selectedSuggestion.imageUrl && (
                                            <Image
                                                src={selectedSuggestion.imageUrl}
                                                alt="Suggestion screenshot"
                                                className="w-full rounded-lg border"
                                                height={20}
                                                width={40}
                                            />
                                        )
                                    }
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className={getTypeColor(selectedSuggestion.type)} variant="outline">
                                            {selectedSuggestion.type.replace("_", " ")}
                                        </Badge>
                                        <Badge className={getStatusColor(selectedSuggestion.status)} variant="outline">
                                            {selectedSuggestion.status.replace("_", " ")}
                                        </Badge>
                                        {getSuggestionSourceBadge(selectedSuggestion.suggestedBy)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Description</h3>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {selectedSuggestion.description}
                                        </p>
                                    </div>
                                    {
                                        selectedSuggestion.tags.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold mb-2">Tags</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {
                                                        selectedSuggestion.tags.map((tag) => (
                                                            <Badge key={tag} variant="secondary">
                                                                {tag}
                                                            </Badge>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        )
                                    }
                                    {
                                        isCreator && (selectedSuggestion.suggestedBy === "CREATOR" || selectedSuggestion.suggestedBy === "ENROLLED_USER") && selectedSuggestion.addedToTasks && selectedSuggestion.task && (
                                            <div className="space-y-3 pt-4 border-t">
                                                <h3 className="font-semibold">Add to My Tasks</h3>
                                                {
                                                    !selectedSuggestion.adoptedByCurrentUser ? (
                                                        <div className="space-y-2">
                                                            <p className="text-sm text-muted-foreground">
                                                                This suggestion has been added as a task. You can add it to your task list.
                                                            </p>
                                                            <Button
                                                                onClick={() => handleAdoptToMyTasks(selectedSuggestion.id)}
                                                                disabled={loading === selectedSuggestion.id}
                                                                className="w-full gap-2"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                                Add to My Tasks
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 p-3 rounded-lg">
                                                            <CheckCircle className="h-4 w-4" />
                                                            This task is already in your list
                                                        </div>
                                                    )
                                                }
                                                {
                                                    selectedSuggestion.addedByUsers.length > 0 && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {selectedSuggestion.addedByUsers.length} {selectedSuggestion.addedByUsers.length === 1 ? 'user has' : 'users have'} added this task
                                                        </p>
                                                    )
                                                }
                                            </div>
                                        )
                                    }
                                    {
                                        (isEnrolled || isCreator) && selectedSuggestion.suggestedBy === "VISITOR" && (
                                            <div className="space-y-3 pt-4 border-t">
                                                <h3 className="font-semibold">Visitor Suggestion</h3>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        This is a community suggestion. You can add it to your own task list if you find it useful.
                                                    </p>
                                                    {
                                                        !selectedSuggestion.adoptedByCurrentUser ? (
                                                            <Button
                                                                onClick={() => handleAdoptVisitorSuggestion(selectedSuggestion.id)}
                                                                disabled={loading === selectedSuggestion.id}
                                                                className="w-full gap-2"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                                Add to My Tasks
                                                            </Button>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 p-3 rounded-lg">
                                                                <CheckCircle className="h-4 w-4" />
                                                                This task is already in your list
                                                            </div>
                                                        )
                                                    }
                                                    {
                                                        selectedSuggestion.addedByUsers.length > 0 && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {selectedSuggestion.addedByUsers.length} {selectedSuggestion.addedByUsers.length === 1 ? 'user has' : 'users have'} added this to their tasks
                                                            </p>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        )
                                    }
                                    {
                                        isEnrolled && !isCreator && selectedSuggestion.addedToTasks && selectedSuggestion.task && (
                                            <div className="space-y-3 pt-4 border-t">
                                                <h3 className="font-semibold">Add to My Tasks</h3>
                                                {
                                                    !selectedSuggestion.adoptedByCurrentUser ? (
                                                        <div className="space-y-2">
                                                            <p className="text-sm text-muted-foreground">
                                                                This suggestion has been added as a task. You can add it to your task list.
                                                            </p>
                                                            <Button
                                                                onClick={() => handleAdoptToMyTasks(selectedSuggestion.id)}
                                                                disabled={loading === selectedSuggestion.id}
                                                                className="w-full gap-2"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                                Add to My Tasks
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 p-3 rounded-lg">
                                                            <CheckCircle className="h-4 w-4" />
                                                            This task is already in your list
                                                        </div>
                                                    )
                                                }
                                                {
                                                    selectedSuggestion.addedByUsers.length > 0 && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {selectedSuggestion.addedByUsers.length} {selectedSuggestion.addedByUsers.length === 1 ? 'user has' : 'users have'} added this task
                                                        </p>
                                                    )
                                                }
                                            </div>
                                        )
                                    }
                                    {
                                        !isEnrolled && !isCreator && (selectedSuggestion.suggestedBy === "CREATOR" || selectedSuggestion.suggestedBy === "ENROLLED_USER") && (
                                            <div className="pt-4 border-t">
                                                <div className="flex items-start gap-2 text-sm text-blue-500 bg-blue-500/10 p-3 rounded-lg">
                                                    <Lightbulb className="h-4 w-4 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium">Enroll to access this task</p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            This suggestion was added as a task by {selectedSuggestion.suggestedBy === "CREATOR" ? "the creator" : "an enrolled user"}. Enroll in the project to add it to your task list.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            </>
                        )
                    }
                </SheetContent>
            </Sheet>
        </>
    )
}