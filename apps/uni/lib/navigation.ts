import {
    Home, Users, GraduationCap, BookOpen, FileText, BarChart3, 
    CreditCard, Settings, HelpCircle, LayoutDashboard, Plus, 
    Clock, CheckCircle, XCircle, PieChart, TrendingUp, Activity, 
    Receipt, ArrowLeftRight, Briefcase, Award, Coins, ClipboardList, 
    FolderKanban
} from "lucide-react"

export type LucideIcon = typeof LayoutDashboard

export interface NavigationItem {
    name: string
    path: string
    icon: LucideIcon
    children?: NavigationItem[]
    requiredPermission?: string
    badge?: string
    isImportant?: boolean
}

export interface NavigationConfig {
    primary: NavigationItem[]
    secondary: NavigationItem[]
}

export const uniNavigation: NavigationConfig = {
    primary: [
        { 
            name: "Home", 
            path: "home", 
            icon: Home 
        },
        { 
            name: "Students", 
            path: "students", 
            icon: GraduationCap,
            requiredPermission: "view_students",
            children: [
                { name: "All Students", path: "students", icon: GraduationCap },
                { name: "Pending Verification", path: "students?status=pending", icon: Clock },
                { name: "Verified", path: "students?status=verified", icon: CheckCircle },
                { name: "Rejected", path: "students?status=rejected", icon: XCircle },
            ]
        },
        { 
            name: "Faculty", 
            path: "faculty", 
            icon: Users,
            children: [
                { name: "All Faculty", path: "faculty", icon: Users },
                { name: "Invite Member", path: "faculty/invite", icon: Plus },
            ]
        },
        { 
            name: "Departments", 
            path: "departments", 
            icon: FolderKanban,
            requiredPermission: "manage_departments",
            children: [
                { name: "All Departments", path: "departments", icon: FolderKanban },
                { name: "Create Department", path: "departments/new", icon: Plus },
            ]
        },
        { 
            name: "Classes", 
            path: "classes", 
            icon: BookOpen,
            requiredPermission: "view_classes",
            children: [
                { name: "All Classes", path: "classes", icon: BookOpen },
                { name: "Create Class", path: "classes/new", icon: Plus },
                { name: "Active Classes", path: "classes?status=active", icon: CheckCircle },
            ]
        },
        { 
            name: "Assignments", 
            path: "assignments", 
            icon: ClipboardList,
            children: [
                { name: "All Assignments", path: "assignments", icon: ClipboardList },
                { name: "Create Assignment", path: "assignments/new", icon: Plus },
                { name: "Due Soon", path: "assignments?filter=due-soon", icon: Clock },
                { name: "Grading Pending", path: "assignments?filter=pending-grading", icon: FileText },
            ]
        },
        { 
            name: "Placements", 
            path: "placements", 
            icon: Briefcase,
            requiredPermission: "manage_placements",
            children: [
                { name: "Job Listings", path: "placements", icon: Briefcase },
                { name: "Applications", path: "placements/applications", icon: FileText },
                { name: "Statistics", path: "placements/stats", icon: TrendingUp },
            ]
        },
        { 
            name: "Credits", 
            path: "credits", 
            icon: Coins,
            requiredPermission: "manage_credits",
            children: [
                { name: "Overview", path: "credits", icon: Coins },
                { name: "Allocate Credits", path: "credits/allocate", icon: Plus },
                { name: "Usage History", path: "credits/history", icon: Activity },
            ]
        },
        { 
            name: "Analytics", 
            path: "analytics", 
            icon: BarChart3,
            requiredPermission: "view_analytics",
            children: [
                { name: "Overview", path: "analytics", icon: PieChart },
                { name: "Students", path: "analytics/students", icon: GraduationCap },
                { name: "Assignments", path: "analytics/assignments", icon: ClipboardList },
                { name: "Placements", path: "analytics/placements", icon: TrendingUp },
            ]
        },
    ],
    secondary: [
        { 
            name: "University", 
            path: "university", 
            icon: Award,
            requiredPermission: "manage_university",
        },
        { 
            name: "Billing", 
            path: "billing", 
            icon: CreditCard,
            requiredPermission: "manage_billing",
            children: [
                { name: "Plans & Usage", path: "billing", icon: CreditCard },
                { name: "Payments", path: "billing/payments", icon: ArrowLeftRight },
                { name: "Invoices", path: "billing/invoices", icon: Receipt },
            ]
        },
        { 
            name: "Settings", 
            path: "settings", 
            icon: Settings 
        },
        { 
            name: "Help", 
            path: "help", 
            icon: HelpCircle 
        },
    ]
}

/**
 * Get navigation items based on user permissions
 */
export function getFilteredNavigation(
    permissions: string[]
): NavigationConfig {
    const filterItems = (items: NavigationItem[]): NavigationItem[] => {
        return items.filter(item => {
            if (item.requiredPermission) {
                return permissions.includes(item.requiredPermission)
            }
            return true
        }).map(item => ({
            ...item,
            children: item.children ? filterItems(item.children) : undefined,
        }))
    }

    return {
        primary: filterItems(uniNavigation.primary),
        secondary: filterItems(uniNavigation.secondary),
    }
}

/**
 * Get breadcrumb path from navigation
 */
export function getBreadcrumbFromPath(path: string): { name: string; path: string }[] {
    const breadcrumbs: { name: string; path: string }[] = []
    const allItems = [...uniNavigation.primary, ...uniNavigation.secondary]

    // Find the matching item
    const findItem = (items: NavigationItem[]): boolean => {
        for (const item of items) {
            if (path === item.path || path.startsWith(`${item.path}/`)) {
                breadcrumbs.push({ name: item.name, path: item.path })
                
                if (item.children) {
                    findItem(item.children)
                }
                return true
            }
        }
        return false
    }

    findItem(allItems)
    return breadcrumbs
}

/**
 * Check if a navigation item is active
 */
export function isNavItemActive(itemPath: string, currentPath: string): boolean {
    // Remove leading slash and query params
    const cleanCurrent = currentPath.replace(/^\//, "").split("?")[0]
    const cleanItem = itemPath.replace(/^\//, "").split("?")[0]
    
    // Exact match
    if (cleanCurrent === cleanItem) return true
    
    // Check if current path starts with item path (for nested routes)
    if (cleanCurrent?.startsWith(`${cleanItem}/`)) return true
    
    return false
}