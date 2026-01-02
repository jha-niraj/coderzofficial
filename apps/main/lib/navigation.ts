import {
    Notebook, Users2, MessageSquare, FolderKanban, Sparkles, User, User2,
    Briefcase, Users, Trophy, Video, Brain, Building2, Cable, LayoutDashboard
} from "lucide-react"

export type LucideIcon = typeof LayoutDashboard

export interface NavigationItem {
    name: string
    path: string
    icon: LucideIcon
    children?: NavigationItem[]
    requiredPermission?: string
    status?: string | "active" | "coming"
    comingSoon?: boolean
}

export interface NavigationConfig {
    primary: NavigationItem[]
    secondary: NavigationItem[] // Main app might not have a distinct secondary section in current layout, but keeping interface consistent
}

export const mainNavigation: NavigationConfig = {
    primary: [
        {
            name: "Studio",
            path: "studio",
            icon: Notebook,
            status: "active"
        },
        {
            name: "Communities",
            path: "communities",
            icon: Users2,
            status: "active"
        },
        {
            name: "Chat",
            path: "chat",
            icon: MessageSquare,
            status: "active"
        },
        {
            name: "Projects",
            path: "projects",
            icon: FolderKanban,
            status: "active",
            children: [
                { name: 'Generate Project', path: 'projects/generate', icon: Sparkles },
                { name: 'My Projects', path: 'projects/myprojects', icon: User },
                { name: 'All Projects', path: 'projects/allprojects', icon: User2 }
            ]
        },
        {
            name: "AI Tools",
            path: "ai",
            icon: Sparkles,
            status: "active",
            children: [
                { name: 'Job Interview', path: 'ai/jobinterviewassistant', icon: Briefcase },
            ]
        },
        {
            name: "Products",
            path: "products",
            icon: Users,
            status: "active",
            children: [
                { name: 'Collective', path: 'collective', icon: Trophy, comingSoon: true }
            ]
        },
        {
            name: "Mock Interview",
            path: "mock",
            icon: Video,
            status: "active",
            children: [
                { name: 'Mock Overview', path: 'mock', icon: Brain },
                { name: 'Voice Mock', path: 'mock/voice', icon: Brain, comingSoon: true },
                { name: 'AI Video Mock', path: 'mock/video', icon: Video, comingSoon: true },
                { name: 'Peer to Peer Mock', path: 'mock/peertopeer', icon: MessageSquare, comingSoon: true },
                { name: 'Company Wise Mock', path: 'mock/companywise', icon: Building2, comingSoon: true },
                { name: 'Connect', path: 'mock/connect', icon: Cable, comingSoon: true }
            ]
        }
    ],
    secondary: []
}