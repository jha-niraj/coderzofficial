"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
    getMessages, sendMessage, markMessagesAsRead
} from "@/actions/(chat)/message.action"
import { getConversations } from "@/actions/(chat)/conversation.action"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Avatar, AvatarFallback, AvatarImage
} from "@/components/ui/avatar"
import {
    Send, Image as ImageIcon, Loader2, MoreVertical
} from "lucide-react"
import { useSession } from "next-auth/react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "../../lib/utils"
import { toast } from "sonner"
import { uploadImageToCloudinary } from "@/actions/(common)/shared/upload.action"
import Image from "next/image"

type Message = {
    id: string
    content: string
    type: "TEXT" | "IMAGE"
    imageUrl: string | null
    status: "SENT" | "DELIVERED" | "READ"
    createdAt: Date
    readAt: Date | null
    sender: {
        id: string
        name: string | null
        username: string | null
        image: string | null
    }
}

export default function ChatConversation({ conversationId }: { conversationId: string }) {
    const { data: session } = useSession()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [sending, setSending] = useState(false)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [otherUser, setOtherUser] = useState<any>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const loadConversationDetails = useCallback(async () => {
        const { conversations } = await getConversations()
        const conv = conversations.find(c => c.id === conversationId)
        if (conv) {
            setOtherUser(conv.otherParticipant)
        }
    }, [conversationId]);

    const loadMessages = useCallback(async (silent = false) => {
        if (!silent) setLoading(true)
        const { messages: msgs } = await getMessages(conversationId, 50)
        setMessages(msgs as any)
        if (!silent) setLoading(false)

        // Scroll to bottom after loading
        setTimeout(() => scrollToBottom(), 100)
    }, [conversationId]);

    useEffect(() => {
        loadMessages()
        loadConversationDetails()

        // Mark messages as read when entering conversation
        markMessagesAsRead(conversationId)

        // Auto-refresh messages every 5 seconds
        const interval = setInterval(() => {
            loadMessages(true)
        }, 5000)

        return () => clearInterval(interval)
    }, [conversationId, loadConversationDetails, loadMessages])

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return

        setSending(true)
        const content = newMessage
        setNewMessage("")

        const result = await sendMessage(conversationId, content, "TEXT")

        if (result.success && result.message) {
            setMessages(prev => [...prev, result.message as any])
            scrollToBottom()
        } else {
            toast.error(result.error || "Failed to send message")
            setNewMessage(content) // Restore message on error
        }

        setSending(false)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file")
            return
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB")
            return
        }

        setUploading(true)

        try {
            const formData = new FormData()
            formData.append("file", file)

            const uploadResult = await uploadImageToCloudinary(formData)

            if (uploadResult.success && uploadResult.url) {
                const result = await sendMessage(conversationId, "Sent an image", "IMAGE", uploadResult.url)

                if (result.success && result.message) {
                    setMessages(prev => [...prev, result.message as any])
                    scrollToBottom()
                    toast.success("Image sent successfully")
                } else {
                    toast.error(result.error || "Failed to send image")
                }
            } else {
                toast.error("Failed to upload image")
            }
        } catch (error) {
            console.error("Image upload error:", error)
            toast.error("Failed to upload image")
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            <div className="border-b border-border/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={otherUser?.image || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-500 text-black font-semibold">
                            {otherUser?.name?.[0] || otherUser?.username?.[0] || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">
                            {otherUser?.name || otherUser?.username || "Unknown User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            @{otherUser?.username || "unknown"}
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </div>
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {
                        messages.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-center text-muted-foreground text-sm">
                                <div className="space-y-2">
                                    <p className="text-lg">👋</p>
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            </div>
                        ) : (
                            messages.map((message) => {
                                const isOwn = message.sender.id === session?.user?.id
                                const isDeleted = message.content === "Message deleted"

                                return (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            "flex gap-3",
                                            isOwn ? "flex-row-reverse" : "flex-row"
                                        )}
                                    >
                                        {
                                            !isOwn && (
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={message.sender.image || ""} />
                                                    <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-500 text-black text-xs">
                                                        {message.sender.name?.[0] || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )
                                        }
                                        <div
                                            className={cn(
                                                "max-w-[70%] space-y-1",
                                                isOwn ? "items-end" : "items-start"
                                            )}
                                        >
                                            {
                                                message.type === "IMAGE" && message.imageUrl ? (
                                                    <div className={cn(
                                                        "rounded-2xl overflow-hidden border",
                                                        isOwn ? "border-yellow-500/20" : "border-border/50"
                                                    )}>
                                                        <Image
                                                            src={message.imageUrl}
                                                            alt="Sent image"
                                                            className="max-w-full h-auto max-h-80 object-cover"
                                                            width={400}
                                                            height={400}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={cn(
                                                            "px-4 py-2 rounded-2xl",
                                                            isOwn
                                                                ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-black"
                                                                : "bg-muted",
                                                            isDeleted && "italic opacity-60"
                                                        )}
                                                    >
                                                        <p className="text-sm whitespace-pre-wrap break-words">
                                                            {message.content}
                                                        </p>
                                                    </div>
                                                )
                                            }
                                            <div
                                                className={cn(
                                                    "flex items-center gap-2 px-1 text-xs text-muted-foreground",
                                                    isOwn ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <span>
                                                    {
                                                        formatDistanceToNow(new Date(message.createdAt), {
                                                            addSuffix: true,
                                                        })
                                                    }
                                                </span>
                                                {
                                                    isOwn && (
                                                        <span>
                                                            {
                                                                message.status === "READ"
                                                                    ? "✓✓"
                                                                    : message.status === "DELIVERED"
                                                                        ? "✓"
                                                                        : "·"
                                                            }
                                                        </span>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )
                    }
                </div>
            </ScrollArea>
            <div className="border-t border-border/50 p-4">
                <div className="flex items-end gap-2">
                    <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {
                            uploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ImageIcon className="w-4 h-4" />
                            )
                        }
                    </Button>
                    <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={sending}
                        className="flex-1"
                    />

                    <Button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sending}
                        className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black"
                    >
                        {
                            sending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )
                        }
                    </Button>
                </div>
            </div>
        </div>
    )
}