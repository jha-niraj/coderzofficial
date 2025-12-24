"use client"

import { useState, useEffect } from "react"
import { getConversations } from "@/actions/(chat)/conversation.action"
import { getTotalUnreadCount } from "@/actions/(chat)/message.action"
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"
import { Input } from "@repo/ui/components/ui/input"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar"
import {
    Search, UserPlus, Settings, MessageSquare
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@repo/ui/lib/utils"

type Conversation = {
    id: string
    otherParticipant: {
        id: string
        name: string | null
        username: string | null
        image: string | null
    }
    lastMessage: {
        content: string
        type: "TEXT" | "IMAGE"
        createdAt: Date
        senderId: string
    } | null
    lastMessageAt: Date | null
    unreadCount: number
}

export default function ChatSidebar() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [totalUnread, setTotalUnread] = useState(0)
    const [loading, setLoading] = useState(true)
    const pathname = usePathname()

    useEffect(() => {
        loadConversations()
    }, [])

    const loadConversations = async () => {
        const { conversations: convs } = await getConversations()
        const { count } = await getTotalUnreadCount()
        setConversations(convs as any)
        setTotalUnread(count)
        setLoading(false)
    }

    const filteredConversations = conversations.filter(conv => {
        const searchLower = searchQuery.toLowerCase()
        return (
            conv.otherParticipant.name?.toLowerCase().includes(searchLower) ||
            conv.otherParticipant.username?.toLowerCase().includes(searchLower)
        )
    })

    return (
        <div className="h-full flex flex-col bg-muted/30">
            <div className="p-4 border-b border-border/50 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-yellow-500" />
                        <h2 className="font-semibold text-lg">Messages</h2>
                        {
                            totalUnread > 0 && (
                                <Badge variant="default" className="bg-yellow-500 text-black hover:bg-yellow-600">
                                    {totalUnread}
                                </Badge>
                            )
                        }
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                    >
                        <Link href="/chat/settings">
                            <Settings className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={pathname === "/chat" || pathname.startsWith("/chat/") && !pathname.includes("/requests") && !pathname.includes("/settings") ? "default" : "outline"}
                        size="sm"
                        className={cn(
                            "flex-1",
                            pathname === "/chat" || pathname.startsWith("/chat/") && !pathname.includes("/requests") && !pathname.includes("/settings")
                                ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-600 hover:to-amber-600"
                                : ""
                        )}
                        asChild
                    >
                        <Link href="/chat">All</Link>
                    </Button>
                    <Button
                        variant={pathname === "/chat/requests" ? "default" : "outline"}
                        size="sm"
                        className={cn(
                            "flex-1 gap-2",
                            pathname === "/chat/requests"
                                ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-600 hover:to-amber-600"
                                : ""
                        )}
                        asChild
                    >
                        <Link href="/chat/requests">
                            <UserPlus className="w-4 h-4" />
                            Requests
                        </Link>
                    </Button>
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {
                        loading ? (
                            <div className="p-4 space-y-3">
                                {
                                    [...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 animate-pulse">
                                            <div className="w-12 h-12 bg-muted rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-muted rounded w-3/4" />
                                                <div className="h-3 bg-muted rounded w-1/2" />
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                {searchQuery ? "No conversations found" : "No conversations yet"}
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <ConversationItem
                                    key={conv.id}
                                    conversation={conv}
                                    isActive={pathname === `/chat/${conv.id}`}
                                />
                            ))
                        )
                    }
                </div>
            </ScrollArea>
        </div>
    )
}

function ConversationItem({
    conversation,
    isActive,
}: {
    conversation: Conversation
    isActive: boolean
}) {
    const { otherParticipant, lastMessage, lastMessageAt, unreadCount } = conversation

    return (
        <Link href={`/chat/${conversation.id}`}>
            <div
                className={cn(
                    "flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                    isActive && "bg-muted"
                )}
            >
                <Avatar className="w-12 h-12">
                    <AvatarImage src={otherParticipant.image || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-500 text-black font-semibold">
                        {otherParticipant.name?.[0] || otherParticipant.username?.[0] || "U"}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">
                            {otherParticipant.name || otherParticipant.username || "Unknown User"}
                        </p>
                        {
                            lastMessageAt && (
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDistanceToNow(new Date(lastMessageAt), { addSuffix: false })}
                                </span>
                            )
                        }
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground truncate">
                            {
                                lastMessage
                                    ? lastMessage.type === "IMAGE"
                                        ? "📷 Image"
                                        : lastMessage.content
                                    : "No messages yet"
                            }
                        </p>
                        {
                            unreadCount > 0 && (
                                <Badge className="bg-yellow-500 text-black h-5 min-w-5 px-1.5 text-xs">
                                    {unreadCount}
                                </Badge>
                            )
                        }
                    </div>
                </div>
            </div>
        </Link>
    )
}