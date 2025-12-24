import {
    Users, MessageCircle, Sparkles
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

export default function ChatPage() {
    return (
        <div className="h-full flex items-center justify-center p-8">
            <div className="max-w-md text-center space-y-6">
                <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full" />
                    <div className="relative bg-gradient-to-br from-yellow-500/10 to-amber-500/10 p-6 rounded-2xl border border-yellow-500/20">
                        <MessageCircle className="w-16 h-16 text-yellow-500" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                        Start a Conversation
                    </h2>
                    <p className="text-muted-foreground">
                        Select a conversation from the sidebar to start chatting
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span>No conversations yet?</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Join the community and follow other developers to start meaningful conversations
                    </p>
                </div>
                <Button
                    asChild
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold"
                >
                    <Link href="/explore">
                        <Users className="w-4 h-4 mr-2" />
                        Explore Community
                    </Link>
                </Button>
            </div>
        </div>
    )
}