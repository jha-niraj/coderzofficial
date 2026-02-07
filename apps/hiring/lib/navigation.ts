import {
    Home, Briefcase, Users, FileText, ClipboardList, UserPlus, BarChart3,
    Building2, CreditCard, Settings, HelpCircle, LayoutDashboard, ListChecks,
    Plus, Eye, Clock, CheckCircle, XCircle, UserCheck, MessageSquare,
    Video, Calendar, TrendingUp, PieChart, Activity, Receipt, ArrowLeftRight
} from "lucide-react"

export type LucideIcon = typeof LayoutDashboard

export interface NavigationItem {
    name: string
    path: string
    icon: LucideIcon
    children?: NavigationItem[]
    requiredPermission?: string
    badge?: string // For showing "Required" or notification badges
    isImportant?: boolean // For showing important indicator icon
}

export interface NavigationConfig {
    primary: NavigationItem[]
    secondary: NavigationItem[]
}

export const hiringNavigation: NavigationConfig = {
    primary: [
        { 
            name: "Home", 
            path: "home", 
            icon: Home 
        },
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
            isImportant: true // Shows indicator icon instead of "Required" text
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
            name: "Assignments", 
            path: "assignments", 
            icon: ClipboardList,
            children: [
                { name: "All Assignments", path: "assignments", icon: ClipboardList },
                { name: "Create Assignments", path: "assignments/new", icon: Plus },
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
        { 
            name: "Billing", 
            path: "billing", 
            icon: CreditCard,
            children: [
                { name: "Plans & Usage", path: "billing", icon: CreditCard },
                { name: "Transactions", path: "transactions", icon: ArrowLeftRight },
                { name: "Invoices", path: "invoices", icon: Receipt },
            ]
        },
        { name: "Settings", path: "settings", icon: Settings },
        { name: "Help", path: "help", icon: HelpCircle },
    ]
}