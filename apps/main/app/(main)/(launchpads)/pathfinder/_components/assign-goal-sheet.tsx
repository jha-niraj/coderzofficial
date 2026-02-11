'use client'

import { useState } from 'react'
import { Button } from '@repo/ui/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@repo/ui/components/ui/sheet'
import { Check, FolderOpen, Loader2, X } from 'lucide-react'
import { assignGoalToGroup } from '@/actions/(main)/pathfinder'
import { useRouter } from 'next/navigation'
import { cn } from '@repo/ui/lib/utils'

interface Group {
    id: string
    name: string
    emoji: string | null
    color: string | null
    _count: { goals: number }
}

interface AssignGoalSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    goalId: string | null
    groups: Group[]
}

export function AssignGoalSheet({ open, onOpenChange, goalId, groups }: AssignGoalSheetProps) {
    const router = useRouter()
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleAssign = async () => {
        if (!goalId) return

        setIsLoading(true)

        try {
            const result = await assignGoalToGroup(goalId, selectedGroupId)

            if (result.success) {
                onOpenChange(false)
                router.refresh()
            }
        } catch (err) {
            console.error('Failed to assign goal:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemoveFromGroup = async () => {
        if (!goalId) return

        setIsLoading(true)

        try {
            const result = await assignGoalToGroup(goalId, null)

            if (result.success) {
                onOpenChange(false)
                router.refresh()
            }
        } catch (err) {
            console.error('Failed to remove from group:', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-auto max-h-[60vh] rounded-t-2xl">
                <SheetHeader className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg mb-3">
                        <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <SheetTitle>Move to Group</SheetTitle>
                    <SheetDescription>
                        Select a group to organize this goal, or remove from current group.
                    </SheetDescription>
                </SheetHeader>

                <div className="max-w-md mx-auto space-y-4">
                    {/* Groups List */}
                    <div className="space-y-2">
                        {groups.length === 0 ? (
                            <p className="text-sm text-neutral-500 text-center py-8">
                                No groups created yet. Create a group first.
                            </p>
                        ) : (
                            groups.map((group) => (
                                <button
                                    key={group.id}
                                    onClick={() => setSelectedGroupId(group.id === selectedGroupId ? null : group.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                                        selectedGroupId === group.id
                                            ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                                            : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                                    )}
                                >
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                                        style={{ backgroundColor: group.color || '#7c3aed' }}
                                    >
                                        {group.emoji || '📁'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-neutral-900 dark:text-white">
                                            {group.name}
                                        </div>
                                        <div className="text-xs text-neutral-500">
                                            {group._count.goals} goals
                                        </div>
                                    </div>
                                    {selectedGroupId === group.id && (
                                        <Check className="w-5 h-5 text-violet-500" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={handleRemoveFromGroup}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Remove from Group
                        </Button>
                        <Button
                            onClick={handleAssign}
                            disabled={isLoading || !selectedGroupId}
                            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4 mr-2" />
                            )}
                            Move to Group
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
