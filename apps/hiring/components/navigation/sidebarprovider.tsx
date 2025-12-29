"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface SidebarContextType {
    isCollapsed: boolean
    setIsCollapsed: (value: boolean) => void
    isMobileOpen: boolean
    setIsMobileOpen: (value: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (!context) {
        return {
            isCollapsed: false,
            setIsCollapsed: () => { },
            isMobileOpen: false,
            setIsMobileOpen: () => { },
        }
    }
    return context
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Persist collapsed state
    useEffect(() => {
        const saved = localStorage.getItem("hiring-sidebar-collapsed")
        if (saved !== null) {
            setIsCollapsed(JSON.parse(saved))
        }
    }, [])

    useEffect(() => {
        localStorage.setItem("hiring-sidebar-collapsed", JSON.stringify(isCollapsed))
    }, [isCollapsed])

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }}>
            {children}
        </SidebarContext.Provider>
    )
}