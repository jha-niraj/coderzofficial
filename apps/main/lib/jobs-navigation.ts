import {
    Briefcase, Search, Heart, ClipboardCheck, Building2, Star,
    TrendingUp, Bell, FileText
} from "lucide-react"

export type LucideIcon = typeof Briefcase

export interface NavigationItem {
    name: string
    path: string
    icon: LucideIcon
    children?: NavigationItem[]
    status?: string | "active" | "coming"
    comingSoon?: boolean
    badge?: string | number
}

export interface JobsNavigationConfig {
    primary: NavigationItem[]
    secondary: NavigationItem[]
}

export const jobsNavigation: JobsNavigationConfig = {
    primary: [
        {
            name: "Browse Jobs",
            path: "jobs",
            icon: Search,
            status: "active"
        },
        {
            name: "My Applications",
            path: "jobs/applications",
            icon: ClipboardCheck,
            status: "active"
        },
        {
            name: "Saved Jobs",
            path: "jobs/saved",
            icon: Heart,
            status: "active"
        },
        {
            name: "Job Alerts",
            path: "jobs/alerts",
            icon: Bell,
            status: "active",
            comingSoon: true
        },
    ],
    secondary: [
        {
            name: "Companies",
            path: "companies",
            icon: Building2,
            status: "active"
        },
        {
            name: "Following",
            path: "companies/following",
            icon: Star,
            status: "active"
        },
        {
            name: "Company Reviews",
            path: "companies/reviews",
            icon: FileText,
            status: "active",
            comingSoon: true
        },
        {
            name: "Salary Insights",
            path: "jobs/salaries",
            icon: TrendingUp,
            status: "active",
            comingSoon: true
        },
    ]
}