"use client"

import { useSession } from "@repo/auth/client"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import {
    HeadDashboard,
    DepartmentHeadDashboard,
    FacultyDashboard,
    PlacementOfficerDashboard,
    FinanceOfficerDashboard,
    TeachingAssistantDashboard
} from "@/components/dashboard"
import { getCurrentMemberDetails } from "@/actions/auth"
import type { UniversityMemberRole } from "@/types"

export default function UniversityHomePage() {
    const { data: session, status } = useSession()
    const [memberRole, setMemberRole] = useState<UniversityMemberRole | null>(null)
    const [departmentName, setDepartmentName] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(true)

    const userName = session?.user?.name?.split(" ")[0] || "there"

    useEffect(() => {
        async function fetchMemberDetails() {
            if (status === "authenticated") {
                try {
                    const result = await getCurrentMemberDetails()
                    if (result.success && result.member) {
                        setMemberRole(result.member.role as UniversityMemberRole)
                        // Get department name if exists
                        if (result.member.department) {
                            setDepartmentName((result.member.department as { name?: string })?.name)
                        }
                    }
                } catch (error) {
                    console.error("Error fetching member details:", error)
                } finally {
                    setIsLoading(false)
                }
            }
        }
        fetchMemberDetails()
    }, [status])

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                    <p className="text-sm text-neutral-500 font-mono">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    // Render role-based dashboard
    switch (memberRole) {
        case "HEAD":
            return <HeadDashboard userName={userName} />

        case "DEPARTMENT_HEAD":
            return (
                <DepartmentHeadDashboard
                    userName={userName}
                    departmentName={departmentName}
                />
            )

        case "FACULTY":
            return <FacultyDashboard userName={userName} />

        case "PLACEMENT_OFFICER":
            return <PlacementOfficerDashboard userName={userName} />

        case "FINANCE_OFFICER":
            return <FinanceOfficerDashboard userName={userName} />

        case "TEACHING_ASSISTANT":
            return <TeachingAssistantDashboard userName={userName} />

        default:
            // Default to Faculty dashboard if role is unknown
            return <FacultyDashboard userName={userName} />
    }
}