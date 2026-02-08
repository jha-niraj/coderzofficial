import {
    GraduationCap, Home, BookOpen, School, Award, ClipboardCheck,
    Briefcase, CreditCard, User, Settings, HelpCircle, FileText,
    Video, Brain, Trophy, Calendar, Bell
} from "lucide-react"

export type LucideIcon = typeof GraduationCap

export interface NavigationItem {
    name: string
    path: string
    icon: LucideIcon
    children?: NavigationItem[]
    status?: string | "active" | "coming"
    comingSoon?: boolean
    badge?: string | number
}

export interface UniNavigationConfig {
    primary: NavigationItem[]
    secondary: NavigationItem[]
}

export const uniNavigation: UniNavigationConfig = {
    primary: [
        {
            name: "Dashboard",
            path: "uni",
            icon: Home,
            status: "active"
        },
        {
            name: "My Classes",
            path: "uni/classes",
            icon: School,
            status: "active"
        },
        {
            name: "Assignments",
            path: "uni/assignments",
            icon: ClipboardCheck,
            status: "active"
        },
        {
            name: "Grades",
            path: "uni/grades",
            icon: Award,
            status: "active"
        },
        {
            name: "Schedule",
            path: "uni/schedule",
            icon: Calendar,
            status: "active",
            comingSoon: true
        },
    ],
    secondary: [
        {
            name: "University Jobs",
            path: "uni/jobs",
            icon: Briefcase,
            status: "active"
        },
        {
            name: "Mock Interviews",
            path: "uni/mock",
            icon: Video,
            status: "active"
        },
        {
            name: "Studio Projects",
            path: "uni/studio",
            icon: Brain,
            status: "active"
        },
        {
            name: "Credits",
            path: "uni/credits",
            icon: CreditCard,
            status: "active"
        },
        {
            name: "Leaderboard",
            path: "uni/leaderboard",
            icon: Trophy,
            status: "active"
        },
        {
            name: "Notifications",
            path: "uni/notifications",
            icon: Bell,
            status: "active"
        },
    ]
}