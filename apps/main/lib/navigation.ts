import {
    Notebook, Users2, MessageSquare, FolderKanban, Sparkles, User, User2,
    Briefcase, Trophy, Video, Brain, Cable, LayoutDashboard,
    Heading, BookAIcon, Home, Orbit, Globe, LucideWandSparkles, OrbitIcon,
    GraduationCap, Rocket, Activity, Share2, Target
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
            name: "Home",
            path: "home",
            icon: Home,
            status: "active"
        },
        {
            name: "Spaces",
            path: "space",
            icon: Orbit,
            status: "active",
            children: [
                {
                    name: 'Spaces',
                    path: 'space',
                    icon: OrbitIcon
                },
                {
                    name: 'My Spaces',
                    path: 'space/myspaces',
                    icon: User
                },
                {
                    name: 'All Spaces',
                    path: 'space/allspaces',
                    icon: Globe
                },
            ]
        },
        {
            name: "Studio",
            path: "studio",
            icon: Notebook,
            status: "active",
            children: [
                {
                    name: 'Studio',
                    path: 'studio',
                    icon: Notebook
                },
                {
                    name: 'My Studios',
                    path: 'studio/mystudios',
                    icon: User
                },
                {
                    name: 'All Studios',
                    path: 'studio/allstudios',
                    icon: Globe
                }
            ]
        },
        {
            name: "Pathfinder",
            path: "pathfinder",
            icon: Target,
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
                { 
                    name: 'Projects', 
                    path: 'projects', 
                    icon: FolderKanban 
                },
                { 
                    name: 'Ideas', 
                    path: 'projects/ideas', 
                    icon: Heading 
                },
                { 
                    name: 'My Projects', 
                    path: 'projects/myprojects', 
                    icon: User 
                },
                { 
                    name: 'All Projects', 
                    path: 'projects/allprojects', 
                    icon: User2 
                }
            ]
        },
        {
            name: "AI Tools",
            path: "ai",
            icon: Sparkles,
            status: "active",
            children: [
                { 
                    name: 'Job Interview', 
                    path: 'ai/jobinterviewassistant', 
                    icon: Briefcase 
                },
            ]
        },
        {
            name: "Launchpads",
            path: "launchpads",
            icon: Rocket,
            status: "active",
            children: [
                { 
                    name: 'Discover', 
                    path: 'launchpads', 
                    icon: Rocket 
                },
                { 
                    name: 'KnowMe AI', 
                    path: 'knowme', 
                    icon: LucideWandSparkles 
                },
                { 
                    name: 'Activity Tracker', 
                    path: 'activity', 
                    icon: Activity,
                    comingSoon: true 
                },
                { 
                    name: 'Social Posting', 
                    path: 'socialpost', 
                    icon: Share2,
                    comingSoon: true 
                }
            ]
        },
        {
            name: "Mock Interview",
            path: "mock",
            icon: Video,
            status: "active",
            children: [
                { 
                    name: 'Mock Overview', 
                    path: 'mock', 
                    icon: Brain 
                },
                { 
                    name: 'Voice Mock', 
                    path: 'mock/voice', 
                    icon: Brain, 
                    comingSoon: true 
                },
                { 
                    name: 'Video Mock', 
                    path: 'mock/video', 
                    icon: Video, 
                    comingSoon: true 
                },
                { 
                    name: 'Peer to Peer', 
                    path: 'mock/peertopeer', 
                    icon: MessageSquare, 
                    comingSoon: true 
                },
                { 
                    name: 'Connect', 
                    path: 'mock/connect', 
                    icon: Cable, 
                    comingSoon: true 
                }
            ]
        },
        {
            name: "Interview Prep",
            path: "interview",
            icon: BookAIcon,
            status: "active",
            children: [
                { 
                    name: 'Company Wise', 
                    path: 'companywise', 
                    icon: Trophy, 
                    comingSoon: true 
                }
            ]
        },
        {
            name: "University",
            path: "uni",
            icon: GraduationCap,
            status: "active"
        },
        {
            name: "Jobs",
            path: "jobs",
            icon: Briefcase,
            status: "active"
        },
    ],
    secondary: []
}