"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Bell, Check, Info, CheckCircle2, AlertTriangle, XCircle, Mail
} from "lucide-react"
import {
    Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle,
    SheetDescription
} from "@repo/ui/components/ui/sheet"
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"
import { Button } from "@repo/ui/components/ui/button"

import { io } from "socket.io-client"
import { useSession } from "@repo/auth/client"
import toast from "@repo/ui/components/ui/sonner"
import { cn } from "@repo/ui/lib/utils"
import {
    getNotifications, markAllAsRead, markAsRead
} from "@/actions/(main)/notifications/notification.action"
import { formatDistanceToNow } from "date-fns"

interface Notification {
    id: string
    title: string
    message: string
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
    read: boolean
    createdAt: Date
    actionUrl?: string | null
}

export function NotificationsSheet({ isCollapsed }: { isCollapsed?: boolean }) {
    const { data: session } = useSession()
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)


    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!session?.user?.id) return
        try {
            const result = await getNotifications(1, 50)
            if (result.success && result.data) {
                setNotifications(result.data.notifications as unknown as Notification[])
                setUnreadCount(result.data.totalUnread)
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error)
        }
    }, [session?.user?.id])

    // Initial fetch when opening or session loads
    useEffect(() => {
        if (session?.user?.id) {
            fetchNotifications()
        }
    }, [session?.user?.id, fetchNotifications])

    // WebSocket connection
    useEffect(() => {
        if (!session?.user?.id || !process.env.NEXT_PUBLIC_WORKER_URL) return

        // Connect to Worker WebSocket
        // Ensure path matches server config
        const socketInstance = io(process.env.NEXT_PUBLIC_WORKER_URL, {
            path: '/api/v1/ws',
            query: {
                userId: session.user.id
            },
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        })

        socketInstance.on('connect', () => {
            console.log('Connected to Notification Service')
        })

        socketInstance.on('notification', (data: Notification) => {
            // Add new notification to top
            setNotifications(prev => [data, ...prev])
            setUnreadCount(prev => prev + 1)
            toast.info(data.title || "New Notification")
        })

        // setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    }, [session?.user?.id])

    const handleMarkAllRead = async () => {
        try {
            setLoading(true)
            const result = await markAllAsRead()
            if (result.success) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                setUnreadCount(0)
                toast.success("All notifications marked as read")
            } else {
                toast.error("Failed to mark all as read")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleMarkRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))

        const result = await markAsRead(id)
        if (!result.success) {
            // Revert if failed (omitted for simplicity usually)
            console.error("Failed to mark read")
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-green-500" />
            case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
            case 'ERROR': return <XCircle className="w-5 h-5 text-red-500" />
            default: return <Info className="w-5 h-5 text-blue-500" />
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className={cn(
                    "flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 w-full outline-none",
                    isCollapsed && "aspect-square"
                )}>
                    <div className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-600 border border-white dark:border-neutral-950 animate-pulse" />
                        )}
                    </div>
                    {!isCollapsed && <span className="ml-2">Inbox</span>}
                </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
                <SheetHeader className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                        <SheetTitle>Notifications</SheetTitle>
                        {
                            unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleMarkAllRead}
                                    disabled={loading}
                                    className="text-xs h-8"
                                >
                                    <Check className="w-3 h-3 mr-1" />
                                    Mark all as read
                                </Button>
                            )
                        }
                    </div>
                    <SheetDescription>
                        Stay updated with your project generation status and alerts.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col p-2">
                        {
                            notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-neutral-500 gap-4">
                                    <Mail className="w-12 h-12 opacity-20" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {
                                        notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={cn(
                                                    "flex items-start gap-3 p-4 rounded-xl transition-all duration-200 border",
                                                    notification.read
                                                        ? "bg-transparent border-transparent opacity-70 hover:opacity-100 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                                                        : "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800"
                                                )}
                                                onClick={() => !notification.read && handleMarkRead(notification.id)}
                                            >
                                                <div className="mt-1 flex-shrink-0">
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className={cn(
                                                            "text-sm font-semibold",
                                                            notification.read ? "text-neutral-700 dark:text-neutral-300" : "text-neutral-900 dark:text-white"
                                                        )}>
                                                            {notification.title}
                                                        </h4>
                                                        <span className="text-[10px] text-neutral-400 whitespace-nowrap ml-2">
                                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                {
                                                    !notification.read && (
                                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                                    )
                                                }
                                            </div>
                                        ))
                                    }
                                </div>
                            )
                        }
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}