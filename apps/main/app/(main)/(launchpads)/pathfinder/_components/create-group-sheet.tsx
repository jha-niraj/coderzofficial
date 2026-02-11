'use client'

import { useState } from 'react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@repo/ui/components/ui/sheet'
import { FolderPlus, Loader2 } from 'lucide-react'
import { createPathfinderGroup } from '@/actions/(main)/pathfinder'
import { useRouter } from 'next/navigation'

interface CreateGroupSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const colorOptions = [
    '#7c3aed', // violet
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
    '#8b5cf6', // purple
    '#06b6d4', // cyan
]

const emojiOptions = ['📁', '🎯', '💻', '🚀', '📚', '🧠', '⚡', '🔥', '💡', '🎨']

export function CreateGroupSheet({ open, onOpenChange }: CreateGroupSheetProps) {
    const router = useRouter()
    const [name, setName] = useState('')
    const [emoji, setEmoji] = useState('📁')
    const [color, setColor] = useState('#7c3aed')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            setError('Please enter a group name')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const result = await createPathfinderGroup({
                name: name.trim(),
                emoji,
                color,
            })

            if (result.success) {
                setName('')
                setEmoji('📁')
                setColor('#7c3aed')
                onOpenChange(false)
                router.refresh()
            } else {
                setError(result.error || 'Failed to create group')
            }
        } catch {
            setError('An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl">
                <SheetHeader className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg mb-3">
                        <FolderPlus className="w-6 h-6 text-white" />
                    </div>
                    <SheetTitle>Create New Group</SheetTitle>
                    <SheetDescription>
                        Organize your learning goals into groups for better management.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
                    {/* Group Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Group Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Frontend, Backend, DSA"
                            className="h-11"
                        />
                    </div>

                    {/* Emoji Selection */}
                    <div className="space-y-2">
                        <Label>Emoji</Label>
                        <div className="flex flex-wrap gap-2">
                            {emojiOptions.map((e) => (
                                <button
                                    key={e}
                                    type="button"
                                    onClick={() => setEmoji(e)}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                                        emoji === e
                                            ? 'bg-violet-100 dark:bg-violet-900/30 ring-2 ring-violet-500'
                                            : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                    }`}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex flex-wrap gap-2">
                            {colorOptions.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-lg transition-all ${
                                        color === c ? 'ring-2 ring-offset-2 ring-neutral-400' : ''
                                    }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                                style={{ backgroundColor: color }}
                            >
                                {emoji}
                            </div>
                            <div>
                                <div className="font-medium text-neutral-900 dark:text-white">
                                    {name || 'Group Name'}
                                </div>
                                <div className="text-xs text-neutral-500">Preview</div>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <FolderPlus className="w-4 h-4 mr-2" />
                                Create Group
                            </>
                        )}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    )
}
