"use client"

import { JobsTabs, type TabCounts } from "./jobs-tabs"

interface JobsTabsWrapperProps {
    counts: TabCounts
    isAuthenticated: boolean
}

export function JobsTabsWrapper({ counts, isAuthenticated }: JobsTabsWrapperProps) {
    return (
        <JobsTabs 
            counts={counts} 
            isAuthenticated={isAuthenticated} 
        />
    )
}
