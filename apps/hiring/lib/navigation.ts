import {
    Home, Briefcase, Users, FileText, ClipboardList, UserPlus, BarChart3,
    Building2, CreditCard, Settings, HelpCircle, LayoutDashboard, ListChecks,
    Plus, Search, Eye, Clock, CheckCircle, XCircle, UserCheck, MessageSquare,
    Video, Calendar, TrendingUp, PieChart, Activity
} from "lucide-react"

export type LucideIcon = typeof LayoutDashboard

export interface NavigationItem {
    name: string
    path: string
    icon: LucideIcon
    children?: NavigationItem[]
    requiredPermission?: string
    badge?: string // For showing "Required" or notification badges
}

export interface NavigationConfig {
    primary: NavigationItem[]
    secondary: NavigationItem[]
}

export const hiringNavigation: NavigationConfig = {
    primary: [
        { name: "Dashboard", path: "home", icon: Home },
        { 
            name: "Jobs", 
            path: "jobs", 
            icon: Briefcase,
            children: [
                { name: "All Jobs", path: "jobs", icon: Briefcase },
                { name: "Create Job", path: "jobs/new", icon: Plus },
                { name: "Active Jobs", path: "jobs?status=active", icon: Eye },
                { name: "Drafts", path: "jobs?status=draft", icon: Clock },
            ]
        },
        { 
            name: "Candidates", 
            path: "candidates", 
            icon: Users,
            children: [
                { name: "All Candidates", path: "candidates", icon: Users },
                { name: "Shortlisted", path: "candidates?status=shortlisted", icon: UserCheck },
                { name: "In Review", path: "candidates?status=review", icon: Clock },
                { name: "Rejected", path: "candidates?status=rejected", icon: XCircle },
            ]
        },
        { 
            name: "Applications", 
            path: "applications", 
            icon: FileText,
            children: [
                { name: "All Applications", path: "applications", icon: FileText },
                { name: "New", path: "applications?status=new", icon: Plus },
                { name: "Under Review", path: "applications?status=review", icon: Clock },
                { name: "Shortlisted", path: "applications?status=shortlisted", icon: CheckCircle },
            ]
        },
        { 
            name: "Interview Process", 
            path: "interview-config", 
            icon: ListChecks,
            badge: "Required",
            children: [
                { name: "All Processes", path: "interview-config", icon: ListChecks },
                { name: "Create Process", path: "interview-config/new", icon: Plus },
            ]
        },
        { 
            name: "Interviews", 
            path: "interviews", 
            icon: Video,
            children: [
                { name: "Scheduled", path: "interviews", icon: Calendar },
                { name: "Completed", path: "interviews?status=completed", icon: CheckCircle },
                { name: "Feedback Pending", path: "interviews?status=feedback", icon: MessageSquare },
            ]
        },
        { 
            name: "Assessments", 
            path: "assessments", 
            icon: ClipboardList,
            children: [
                { name: "All Assessments", path: "assessments", icon: ClipboardList },
                { name: "Create Assessment", path: "assessments/new", icon: Plus },
            ]
        },
        { name: "Team", path: "team", icon: UserPlus },
        { 
            name: "Analytics", 
            path: "analytics", 
            icon: BarChart3,
            children: [
                { name: "Overview", path: "analytics", icon: PieChart },
                { name: "Pipeline", path: "analytics/pipeline", icon: TrendingUp },
                { name: "Activity", path: "analytics/activity", icon: Activity },
            ]
        },
    ],
    secondary: [
        { name: "Company", path: "company", icon: Building2 },
        { name: "Billing", path: "billing", icon: CreditCard },
        { name: "Settings", path: "settings", icon: Settings },
        { name: "Help", path: "help", icon: HelpCircle },
    ]
}