'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageCircle, HelpCircle, FileText, Image as ImageIcon, Code2, X, Loader2, Plus,
    Hash, Link as LinkIcon, Send
} from 'lucide-react'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import { cn } from '@repo/ui/lib/utils'
import { CommunityPostType } from '@prisma/client'
import { createPost } from '@/actions/(main)/community/post.action'
import toast from '@repo/ui/components/ui/sonner'

interface PostComposerProps {
    communityId: string
    communitySlug: string
    channels?: Array<{
        id: string
        name: string
        slug: string
        icon?: string | null
    }>
    user: {
        id: string
        name: string | null
        image: string | null
    }
    onPostCreated?: () => void
    defaultType?: CommunityPostType
}

const POST_TYPES = [
    { value: 'DISCUSSION', label: 'Discussion', icon: MessageCircle, description: 'Start a conversation' },
    { value: 'QUESTION', label: 'Question', icon: HelpCircle, description: 'Ask the community' },
    { value: 'RESOURCE', label: 'Resource', icon: FileText, description: 'Share something useful' },
    { value: 'SHOWCASE', label: 'Showcase', icon: ImageIcon, description: 'Show your work' },
    { value: 'HELP_REQUEST', label: 'Need Help', icon: Code2, description: 'Request assistance' },
] as const

export function PostComposer({
    communityId,
    communitySlug,
    channels = [],
    user,
    onPostCreated,
    defaultType = 'DISCUSSION'
}: PostComposerProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [postType, setPostType] = useState<CommunityPostType>(defaultType)
    const [selectedChannel, setSelectedChannel] = useState<string>('')
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')

    const handleSubmit = async () => {
        if (!content.trim()) {
            toast.error('Please write something')
            return
        }

        setIsSubmitting(true)
        try {
            const result = await createPost({
                communityId,
                channelId: selectedChannel || undefined,
                title: title.trim() || undefined,
                content: content.trim(),
                type: postType,
                tags
            })

            if (result.success) {
                toast.success('Post created!')
                setIsExpanded(false)
                setTitle('')
                setContent('')
                setTags([])
                onPostCreated?.()
            } else {
                toast.error(result.error || 'Failed to create post')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAddTag = () => {
        const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        if (tag && !tags.includes(tag) && tags.length < 5) {
            setTags([...tags, tag])
            setTagInput('')
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove))
    }

    return (
        <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <CardContent className="p-4">
                {
                    !isExpanded && (
                        <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => setIsExpanded(true)}
                        >
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={user.image ?? undefined} />
                                <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800">
                                    {user.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 py-2.5 px-4 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                                Share something with the community...
                            </div>
                        </div>
                    )
                }
                <AnimatePresence>
                    {
                        isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={user.image ?? undefined} />
                                            <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800">
                                                {user.name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-sm text-neutral-900 dark:text-white">
                                                {user.name || 'You'}
                                            </div>
                                            <div className="text-xs text-neutral-500">Creating a post</div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-8 h-8"
                                        onClick={() => setIsExpanded(false)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {
                                        POST_TYPES.map((type) => {
                                            const Icon = type.icon
                                            const isSelected = postType === type.value
                                            return (
                                                <Button
                                                    key={type.value}
                                                    variant={isSelected ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setPostType(type.value)}
                                                    className={cn(
                                                        "rounded-full gap-1.5",
                                                        isSelected
                                                            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                                            : "border-neutral-200 dark:border-neutral-700"
                                                    )}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {type.label}
                                                </Button>
                                            )
                                        })
                                    }
                                </div>
                                {
                                    channels.length > 0 && (
                                        <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                                            <SelectTrigger className="w-full bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                                                <SelectValue placeholder="Select a channel (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="general_channel">General</SelectItem>
                                                {
                                                    channels.map((channel) => (
                                                        <SelectItem key={channel.id} value={channel.id}>
                                                            {channel.icon} {channel.name}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    )
                                }
                                {
                                    (postType === 'QUESTION' || postType === 'RESOURCE' || postType === 'SHOWCASE') && (
                                        <Input
                                            placeholder={
                                                postType === 'QUESTION'
                                                    ? "What's your question?"
                                                    : postType === 'RESOURCE'
                                                        ? "Resource title"
                                                        : "Give your showcase a title"
                                            }
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                                        />
                                    )
                                }
                                <Textarea
                                    placeholder={
                                        postType === 'QUESTION'
                                            ? "Provide more details about your question..."
                                            : postType === 'HELP_REQUEST'
                                                ? "Describe what you need help with..."
                                                : "Write your thoughts..."
                                    }
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={4}
                                    className="bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-none"
                                />
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        {
                                            tags.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="bg-neutral-100 dark:bg-neutral-800 gap-1"
                                                >
                                                    #{tag}
                                                    <button
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="ml-1 hover:text-red-500"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))
                                        }
                                    </div>
                                    {
                                        tags.length < 5 && (
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                                    <Input
                                                        placeholder="Add tag"
                                                        value={tagInput}
                                                        onChange={(e) => setTagInput(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                handleAddTag()
                                                            }
                                                        }}
                                                        className="pl-9 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                                                    />
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={handleAddTag}
                                                    disabled={!tagInput.trim()}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )
                                    }
                                    <p className="text-xs text-neutral-500">Add up to 5 tags</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="w-9 h-9 text-neutral-500">
                                            <ImageIcon className="w-5 h-5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="w-9 h-9 text-neutral-500">
                                            <LinkIcon className="w-5 h-5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="w-9 h-9 text-neutral-500">
                                            <Code2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !content.trim()}
                                        className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 gap-2"
                                    >
                                        {
                                            isSubmitting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )
                                        }
                                        Post
                                    </Button>
                                </div>
                            </motion.div>
                        )
                    }
                </AnimatePresence>
            </CardContent>
        </Card>
    )
}