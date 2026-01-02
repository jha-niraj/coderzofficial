import {
    Home, Users, UserPlus, School, BookOpen, FolderKanban, Briefcase,
    BarChart3, Building2, CreditCard, Settings, HelpCircle,
    LayoutDashboard
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

export const uniNavigation: NavigationConfig = {
    primary: [
        { name: "Dashboard", path: "home", icon: Home },
        { name: "Students", path: "students", icon: Users },
        { name: "Faculty", path: "faculty", icon: UserPlus },
        { name: "Classes", path: "classes", icon: School },
        { name: "Assignments", path: "assignments", icon: BookOpen },
        { name: "Departments", path: "departments", icon: FolderKanban },
        { name: "Placements", path: "placements", icon: Briefcase },
        { name: "Analytics", path: "analytics", icon: BarChart3 },
    ],
    secondary: [
        { name: "University", path: "university", icon: Building2 },
        { name: "Billing", path: "billing", icon: CreditCard },
        { name: "Settings", path: "settings", icon: Settings },
        { name: "Help", path: "help", icon: HelpCircle },
    ]
}