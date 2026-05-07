"use client"

import { useState } from "react"
import {
    acceptFollowRequest, rejectFollowRequest
} from "@/actions/(main)/social/follow.action"
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { 
    Check, X, Clock, UserCheck, UserX 
} from "lucide-react"
import toast from "@repo/ui/components/ui/sonner"
import { useRouter } from "next/navigation"

type User = {
    id: string
    name: string | null
    username: string | null
    image: string | null
    bio: string | null
}

export default function RequestCard({
    requestId,
    user,
    type,
    status,
}: {
    requestId: string
    user: User
    type: "received" | "sent"
    status: "PENDING" | "ACCEPTED" | "REJECTED"
}) {
    const [loading, setLoading] = useState(false)
    const [currentStatus, setCurrentStatus] = useState(status)
    const router = useRouter()

    const handleAccept = async () => {
        setLoading(true)
        const result = await acceptFollowRequest(requestId)

        if (result.success) {
            setCurrentStatus("ACCEPTED")
            toast.success("Follow request accepted")
            router.refresh()
        } else {
            toast.error(result.error || "Failed to accept request")
        }

        setLoading(false)
    }

    const handleReject = async () => {
        setLoading(true)
        const result = await rejectFollowRequest(requestId)

        if (result.success) {
            setCurrentStatus("REJECTED")
            toast.success("Follow request rejected")
            router.refresh()
        } else {
            toast.error(result.error || "Failed to reject request")
        }

        setLoading(false)
    }

    return (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
            <Avatar className="w-14 h-14">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-500 text-black font-semibold text-lg">
                    {user.name?.[0] || user.username?.[0] || "U"}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold truncate">
                        {user.name || user.username || "Unknown User"}
                    </p>
                    {
                        currentStatus === "ACCEPTED" && (
                            <Badge variant="outline" className="border-green-500/50 text-green-500">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Accepted
                            </Badge>
                        )
                    }
                    {
                        currentStatus === "REJECTED" && (
                            <Badge variant="outline" className="border-red-500/50 text-red-500">
                                <UserX className="w-3 h-3 mr-1" />
                                Rejected
                            </Badge>
                        )
                    }
                    {
                        currentStatus === "PENDING" && (
                            <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                            </Badge>
                        )
                    }
                </div>
                <p className="text-sm text-muted-foreground">
                    @{user.username || "unknown"}
                </p>
                {
                    user.bio && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {user.bio}
                        </p>
                    )
                }
            </div>
            {
                type === "received" && currentStatus === "PENDING" && (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleAccept}
                            disabled={loading}
                            className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                        >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleReject}
                            disabled={loading}
                            className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                        >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                        </Button>
                    </div>
                )
            }
        </div>
    )
}