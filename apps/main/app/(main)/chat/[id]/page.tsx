import { getConversations } from "@/actions/(chat)/conversation.action"
import { redirect } from "next/navigation"
import ChatConversation from "@/components/chat/chat-conversation"

export default async function ConversationPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const { conversations } = await getConversations()
    const conversation = conversations.find(c => c.id === id)

    if (!conversation) {
        redirect("/chat")
    }

    return <ChatConversation conversationId={id} />
}