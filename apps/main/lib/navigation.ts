import {
    MessageSquare, FolderKanban, Sparkles, User, User2,
    Briefcase, Video, Brain, Cable, LayoutDashboard, Heading,
    Home, LucideWandSparkles, GraduationCap,
    Target, FileText, Code2,
    Network, Globe, Server
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
    secondary: NavigationItem[]
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
            name: "Inbox",
            path: "inbox",
            icon: MessageSquare,
            status: "active"
        },
        {
            name: "Pathfinder",
            path: "pathfinder",
            icon: Target,
            status: "active"
        },
        {
            name: "Practice",
            path: "practice",
            icon: Code2,
            status: "active",
            children: [
                {
                    name: 'DSA',
                    path: 'practice/dsa',
                    icon: Code2
                },
                {
                    name: 'System Design',
                    path: 'practice/system-design',
                    icon: Network
                },
                {
                    name: 'Web Frontend',
                    path: 'practice/web-frontend',
                    icon: Globe
                },
                {
                    name: 'Web Backend',
                    path: 'practice/web-backend',
                    icon: Server
                }
            ]
        },
        {
            name: "Projects",
            path: "projects",
            icon: FolderKanban,
            status: "active",
            children: [
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
            name: "Mock Interview",
            path: "mock",
            icon: Video,
            status: "active",
            children: [
                {
                    name: 'Voice Mock',
                    path: 'mock/voice',
                    icon: Brain
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
                {
                    name: 'Resume',
                    path: 'ai/resume',
                    icon: FileText
                },
                {
                    name: 'Cover Letter',
                    path: 'ai/resume/cover-letter',
                    icon: FileText
                },
            ]
        },
        {
            name: "KnowMe AI",
            path: "knowme",
            icon: LucideWandSparkles,
            status: "active"
        },
        {
            name: "Jobs",
            path: "jobs",
            icon: Briefcase,
            status: "active"
        },
        {
            name: "University",
            path: "uni",
            icon: GraduationCap,
            status: "active"
        }
    ],
    secondary: []
}
