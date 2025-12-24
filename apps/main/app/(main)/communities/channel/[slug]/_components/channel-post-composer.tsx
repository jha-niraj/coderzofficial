'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Send, Loader2 } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar'
import { Badge } from '@repo/ui/components/ui/badge'
import { createChannelPost } from '@/actions/(main)/community/channel.action'
import toast from '@repo/ui/components/ui/sonner'

interface ChannelPostComposerProps {
    channel: string
    user: {
        id: string
        name: string | null
        image: string | null
    }
    onSuccess: () => void
    onCancel: () => void
}

export function ChannelPostComposer({
    channel,
    user,
    onSuccess,
    onCancel
}: ChannelPostComposerProps) {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
            setTags([...tags, tagInput.trim().toLowerCase()])
            setTagInput('')
        }
    }

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag))
    }

    const handleSubmit = async () => {
        if (!content.trim()) {
            toast.error('Please write some content')
            return
        }

        setIsSubmitting(true)
        try {
            const result = await createChannelPost({
                channel,
                title: title.trim() || undefined,
                content: content.trim(),
                tags
            })

            if (result.success) {
                toast.success('Post created successfully!')
                onSuccess()
            } else {
                toast.error(result.error || 'Failed to create post')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
        >
            <div className="flex items-start gap-3 mb-4">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800">
                        {user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-white">
                        {user.name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-neutral-500">Creating a new post</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onCancel}>
                    <X className="w-4 h-4" />
                </Button>
            </div>
            <div className="space-y-4">
                <Input
                    placeholder="Title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg font-medium"
                />
                <Textarea
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="resize-none"
                />
                <div>
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {
                            tags.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="gap-1 cursor-pointer"
                                    onClick={() => handleRemoveTag(tag)}
                                >
                                    #{tag}
                                    <X className="w-3 h-3" />
                                </Badge>
                            ))
                        }
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add tags..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            className="flex-1"
                        />
                        <Button variant="outline" size="sm" onClick={handleAddTag}>
                            Add
                        </Button>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !content.trim()}
                        className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    >
                        {
                            isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Post
                                </>
                            )
                        }
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}