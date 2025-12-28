import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@repo/ui/components/ui/tabs"
import {
    getFollowRequests, getSentFollowRequests
} from "@/actions/(main)/community/follow.action"
import RequestCard from "@/components/chat/request-card"
import { UserPlus, Send } from "lucide-react"

// Force dynamic rendering to prevent static prerendering errors
export const dynamic = 'force-dynamic'

export default async function RequestsPage() {
    const { requests: receivedRequests } = await getFollowRequests()
    const { requests: sentRequests } = await getSentFollowRequests()

    return (
        <div className="h-full flex flex-col">
            <div className="border-b border-border/50 p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                    Follow Requests
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your follow requests and connections
                </p>
            </div>
            <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="received" className="h-full flex flex-col">
                    <div className="px-6 pt-4">
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="received" className="gap-2">
                                <UserPlus className="w-4 h-4" />
                                Received
                                {
                                    receivedRequests.length > 0 && (
                                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-yellow-500 text-black rounded-full">
                                            {receivedRequests.length}
                                        </span>
                                    )
                                }
                            </TabsTrigger>
                            <TabsTrigger value="sent" className="gap-2">
                                <Send className="w-4 h-4" />
                                Sent
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="received" className="flex-1 overflow-y-auto p-6 space-y-3">
                        {
                            receivedRequests.length === 0 ? (
                                <EmptyState
                                    icon={<UserPlus className="w-12 h-12 text-muted-foreground" />}
                                    title="No pending requests"
                                    description="You don't have any follow requests at the moment"
                                />
                            ) : (
                                receivedRequests.map((request) => (
                                    <RequestCard
                                        key={request.id}
                                        requestId={request.id}
                                        user={request.sender}
                                        type="received"
                                        status={request.status}
                                    />
                                ))
                            )
                        }
                    </TabsContent>
                    <TabsContent value="sent" className="flex-1 overflow-y-auto p-6 space-y-3">
                        {
                            sentRequests.length === 0 ? (
                                <EmptyState
                                    icon={<Send className="w-12 h-12 text-muted-foreground" />}
                                    title="No sent requests"
                                    description="You haven't sent any follow requests recently"
                                />
                            ) : (
                                sentRequests.map((request) => (
                                    <RequestCard
                                        key={request.id}
                                        requestId={request.id}
                                        user={request.receiver}
                                        type="sent"
                                        status={request.status}
                                    />
                                ))
                            )
                        }
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function EmptyState({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="p-6 rounded-2xl bg-muted/50 border border-border/50">
                {icon}
            </div>
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
            </div>
        </div>
    )
}