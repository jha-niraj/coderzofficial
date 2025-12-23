"use client"

import React from "react"
import { SessionProvider } from "@repo/auth"

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}

