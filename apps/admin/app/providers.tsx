"use client"

import React from "react"

// BetterAuth does not require a SessionProvider wrapper
export function Providers({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}