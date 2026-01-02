import {
    Home, Briefcase, Users, FileText, ClipboardList, UserPlus, BarChart3,
    Building2, CreditCard, Settings, HelpCircle, LayoutDashboard
} from "lucide-react"

export type LucideIcon = typeof LayoutDashboard

export interface NavigationItem {
    name: string
    path: string
    icon: LucideIcon
    children?: NavigationItem[]
    requiredPermission?: string
}

export interface NavigationConfig {
    primary: NavigationItem[]
    secondary: NavigationItem[]
}

export const hiringNavigation: NavigationConfig = {
    primary: [
        { name: "Dashboard", path: "home", icon: Home },
        { name: "Jobs", path: "jobs", icon: Briefcase },
        { name: "Candidates", path: "candidates", icon: Users },
        { name: "Applications", path: "applications", icon: FileText },
        { name: "Assessments", path: "assessments", icon: ClipboardList },
        { name: "Team", path: "team", icon: UserPlus },
        { name: "Analytics", path: "analytics", icon: BarChart3 },
    ],
    secondary: [
        { name: "Company", path: "company", icon: Building2 },
        { name: "Billing", path: "billing", icon: CreditCard },
        { name: "Settings", path: "settings", icon: Settings },
        { name: "Help", path: "help", icon: HelpCircle },
    ]
}