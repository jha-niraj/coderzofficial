'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageCircle, HelpCircle, FileText, Image as ImageIcon, Code2, X,
    Loader2, Plus, Hash, Link as LinkIcon, Send, ExternalLink
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
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
    DialogTitle, DialogTrigger
} from '@repo/ui/components/ui/dialog'
import { Label } from '@repo/ui/components/ui/label'
import { cn } from '@repo/ui/lib/utils'
import { CommunityPostType } from '@repo/prisma/client'
import { createPost } from '@/actions/(main)/community/post.action'
import toast from '@repo/ui/components/ui/sonner'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { uploadCommunityImage } from '@/actions/(main)/community/upload.action'

// Dynamically import CodeEditor to avoid SSR issues
const CodeEditor = dynamic(() => import('@/components/main/code-editor'), { ssr: false })

interface PostComposerProps {
    communityId: string
    communitySlug?: string
    channelSlug?: string
    sectionType?: string // For section-specific posting (FEED, RESOURCES, QA, SHOWCASE, etc.)
    channels?: Array<{
        id: string
        name: string
        slug: string
        icon?: string | null
    }>
    user: {
        id: string | null
        name: string | null
        image: string | null
    }
    onPostCreated?: () => void
    defaultType?: CommunityPostType
    compact?: boolean
}

const POST_TYPES = [
    { value: 'DISCUSSION', label: 'Discussion', icon: MessageCircle, description: 'Start a conversation' },
    { value: 'QUESTION', label: 'Question', icon: HelpCircle, description: 'Ask the community' },
    { value: 'RESOURCE', label: 'Resource', icon: FileText, description: 'Share something useful' },
    { value: 'SHOWCASE', label: 'Showcase', icon: ImageIcon, description: 'Show your work' },
    { value: 'HELP_REQUEST', label: 'Need Help', icon: Code2, description: 'Request assistance' },
] as const

interface ImageAttachment {
    url: string
    name: string
    type: 'image'
}

interface LinkAttachment {
    url: string
    title: string
    description?: string
    type: 'link'
}

interface CodeAttachment {
    code: string
    language: string
    type: 'code'
}

type Attachment = ImageAttachment | LinkAttachment | CodeAttachment

export function PostComposer({
    communityId,
    channelSlug,
    sectionType,
    channels = [],
    user,
    onPostCreated,
    defaultType = 'DISCUSSION',
    compact = false
}: PostComposerProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [postType, setPostType] = useState<CommunityPostType>(defaultType)
    const [selectedChannel, setSelectedChannel] = useState<string>(channelSlug ? '' : '')
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')

    // Attachments
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Dialogs
    const [showLinkDialog, setShowLinkDialog] = useState(false)
    const [showCodeDialog, setShowCodeDialog] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [linkTitle, setLinkTitle] = useState('')
    const [linkDescription, setLinkDescription] = useState('')
    const [codeContent, setCodeContent] = useState('')
    const [codeLanguage, setCodeLanguage] = useState('javascript')

    const handleSubmit = async () => {
        if (!content.trim()) {
            toast.error('Please write something')
            return
        }

        setIsSubmitting(true)
        try {
            const result = await createPost({
                communityId: communityId || '',
                channelId: selectedChannel || undefined,
                officialChannel: channelSlug || undefined,
                title: title.trim() || undefined,
                content: content.trim(),
                type: postType,
                tags,
                attachments: attachments.length > 0 ? attachments.map(a => ({
                    type: a.type,
                    url: 'url' in a ? a.url : '',
                    name: 'name' in a ? a.name : ('title' in a ? a.title : 'Code snippet'),
                    ...(a.type === 'code' && { code: a.code, language: a.language }),
                    ...(a.type === 'link' && { description: a.description }),
                })) : undefined,
                codeBlocks: attachments
                    .filter((a): a is CodeAttachment => a.type === 'code')
                    .map(c => ({ code: c.code, language: c.language }))
            })

            if (result.success) {
                toast.success('Post created!')
                setIsExpanded(false)
                setTitle('')
                setContent('')
                setTags([])
                setAttachments([])
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const file = files[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB')
            return
        }

        setIsUploadingImage(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'communities')

            const result = await uploadCommunityImage(formData)
            if (result.success && result.url) {
                setAttachments(prev => [...prev, {
                    url: result.url!,
                    name: file.name,
                    type: 'image'
                }])
                toast.success('Image uploaded!')
            } else {
                toast.error(result.error || 'Failed to upload image')
            }
        } catch {
            toast.error('Failed to upload image')
        } finally {
            setIsUploadingImage(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleAddLink = () => {
        if (!linkUrl.trim()) {
            toast.error('Please enter a URL')
            return
        }

        // Validate URL
        try {
            new URL(linkUrl)
        } catch {
            toast.error('Please enter a valid URL')
            return
        }

        setAttachments(prev => [...prev, {
            url: linkUrl.trim(),
            title: linkTitle.trim() || linkUrl.trim(),
            description: linkDescription.trim() || undefined,
            type: 'link'
        }])

        setLinkUrl('')
        setLinkTitle('')
        setLinkDescription('')
        setShowLinkDialog(false)
        toast.success('Link added!')
    }

    const handleAddCode = () => {
        if (!codeContent.trim()) {
            toast.error('Please enter some code')
            return
        }

        setAttachments(prev => [...prev, {
            code: codeContent.trim(),
            language: codeLanguage,
            type: 'code'
        }])

        setCodeContent('')
        setCodeLanguage('javascript')
        setShowCodeDialog(false)
        toast.success('Code snippet added!')
    }

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <CardContent className={compact ? "p-3" : "p-4"}>
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
                                {sectionType === 'QA' ? 'Ask a question...' :
                                    sectionType === 'RESOURCES' ? 'Share a resource...' :
                                        sectionType === 'SHOWCASE' ? 'Showcase your work...' :
                                            'Share something with the community...'}
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
                                    channels.length > 0 && !channelSlug && (
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

                                {/* Attachments Preview */}
                                {attachments.length > 0 && (
                                    <div className="space-y-2">
                                        {attachments.map((attachment, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                                            >
                                                {attachment.type === 'image' && (
                                                    <>
                                                        <div className="w-16 h-16 rounded overflow-hidden bg-neutral-100 dark:bg-neutral-700 flex-shrink-0">
                                                            <Image
                                                                src={attachment.url}
                                                                alt={attachment.name}
                                                                width={64}
                                                                height={64}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{attachment.name}</p>
                                                            <p className="text-xs text-neutral-500">Image</p>
                                                        </div>
                                                    </>
                                                )}
                                                {attachment.type === 'link' && (
                                                    <>
                                                        <div className="w-10 h-10 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                                            <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{attachment.title}</p>
                                                            <p className="text-xs text-neutral-500 truncate">{attachment.url}</p>
                                                        </div>
                                                    </>
                                                )}
                                                {attachment.type === 'code' && (
                                                    <>
                                                        <div className="w-10 h-10 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                                            <Code2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium">Code Snippet</p>
                                                            <p className="text-xs text-neutral-500">{attachment.language}</p>
                                                        </div>
                                                    </>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 flex-shrink-0"
                                                    onClick={() => removeAttachment(index)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

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
                                    <div className="flex gap-1">
                                        {/* Image Upload */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-9 h-9 text-neutral-500"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploadingImage}
                                        >
                                            {isUploadingImage ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <ImageIcon className="w-5 h-5" />
                                            )}
                                        </Button>

                                        {/* Link Dialog */}
                                        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-9 h-9 text-neutral-500">
                                                    <LinkIcon className="w-5 h-5" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Add Link</DialogTitle>
                                                    <DialogDescription>
                                                        Add a link to your post
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="linkUrl">URL</Label>
                                                        <Input
                                                            id="linkUrl"
                                                            placeholder="https://example.com"
                                                            value={linkUrl}
                                                            onChange={(e) => setLinkUrl(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="linkTitle">Title (optional)</Label>
                                                        <Input
                                                            id="linkTitle"
                                                            placeholder="Link title"
                                                            value={linkTitle}
                                                            onChange={(e) => setLinkTitle(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="linkDescription">Description (optional)</Label>
                                                        <Textarea
                                                            id="linkDescription"
                                                            placeholder="Brief description"
                                                            value={linkDescription}
                                                            onChange={(e) => setLinkDescription(e.target.value)}
                                                            rows={2}
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleAddLink}>
                                                        Add Link
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                        {/* Code Dialog */}
                                        <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-9 h-9 text-neutral-500">
                                                    <Code2 className="w-5 h-5" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>Add Code Snippet</DialogTitle>
                                                    <DialogDescription>
                                                        Add code to your post
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label>Language</Label>
                                                            <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="javascript">JavaScript</SelectItem>
                                                                    <SelectItem value="typescript">TypeScript</SelectItem>
                                                                    <SelectItem value="python">Python</SelectItem>
                                                                    <SelectItem value="java">Java</SelectItem>
                                                                    <SelectItem value="cpp">C++</SelectItem>
                                                                    <SelectItem value="c">C</SelectItem>
                                                                    <SelectItem value="csharp">C#</SelectItem>
                                                                    <SelectItem value="go">Go</SelectItem>
                                                                    <SelectItem value="rust">Rust</SelectItem>
                                                                    <SelectItem value="html">HTML</SelectItem>
                                                                    <SelectItem value="css">CSS</SelectItem>
                                                                    <SelectItem value="sql">SQL</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Code</Label>
                                                            <CodeEditor
                                                                code={codeContent}
                                                                language={codeLanguage}
                                                                height="300px"
                                                                onChange={(code) => setCodeContent(code)}
                                                                onLanguageChange={(lang) => setCodeLanguage(lang)}
                                                                showLanguageSelector={false}
                                                                showCopyButton={true}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setShowCodeDialog(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleAddCode}>
                                                        Add Code
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
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