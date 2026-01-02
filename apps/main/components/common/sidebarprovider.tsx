"use client";

import React, { useState, createContext, useContext } from "react";

export interface SidebarContextType {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (value: boolean) => void;
    isAISidebarOpen: boolean;
    setIsAISidebarOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);

    return (
        <SidebarContext.Provider value={{
            isCollapsed, setIsCollapsed, isMobileOpen,
            setIsMobileOpen, isAISidebarOpen, setIsAISidebarOpen
        }}>
            {children}
        </SidebarContext.Provider>
    );
};
