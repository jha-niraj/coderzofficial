import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { getTeamMembers, getPendingInvites, getTeamStats } from "@/actions/team"
import { TeamContent } from "./team-content"

export const metadata = {
    title: "Team | FlowSync",
    description: "Manage your hiring team"
}

export default async function TeamPage() {
    const [membersResult, invitesResult, statsResult] = await Promise.all([
        getTeamMembers(),
        getPendingInvites(),
        getTeamStats()
    ])

    const members = membersResult.success && membersResult.data ? membersResult.data : []
    const pendingInvites = invitesResult.success && invitesResult.data ? invitesResult.data : []
    const stats = statsResult.success && statsResult.data ? statsResult.data : null

    return (
        <Suspense 
            fallback={
                <div className="min-h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            }
        >
            <TeamContent 
                initialMembers={members}
                initialInvites={pendingInvites}
                stats={stats}
            />
        </Suspense>
    )
}
