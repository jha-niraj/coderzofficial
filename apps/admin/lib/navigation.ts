import {
    LayoutDashboard, Users, CreditCard, FolderKanban, Mic, ClipboardCheck,
    Trophy, MessageSquare, MessageCircle, Lightbulb, BarChart3, Settings,
    Shield, FileText, type LucideIcon, Coins, Receipt, ArrowLeftRight,
    UserCheck, BookOpen, Flame, Zap, Vote, Flag, Activity, Database, User,
    Lock, Building2, GraduationCap, Briefcase, School
} from "lucide-react"

export interface NavigationItem {
    name: string
    path: string
    icon: LucideIcon
    children?: NavigationItem[]
    requiredPermission?: string
}

export interface PlatformNavigationItem {
    name: string
    path: string
    children?: NavigationItem[]
}

export interface NavigationConfig {
    global: NavigationItem[]
    platforms: PlatformNavigationItem[]
    secondary: NavigationItem[]
}

// Admin navigation configuration
export const adminNavigation: NavigationConfig = {
    global: [
        {
            name: "Dashboard",
            path: "dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Users",
            path: "users",
            icon: Users,
            requiredPermission: "users",
            children: [
                { 
                    name: "All Users", 
                    path: "main/users", 
                    icon: Users },
                { 
                    name: "Roles & Access", 
                    path: "main/users/roles", 
                    icon: Shield },
            ]
        },
        {
            name: "Credits",
            path: "credits",
            icon: CreditCard,
            requiredPermission: "credits",
            children: [
                { 
                    name: "Transactions", 
                    path: "credits/transactions", 
                    icon: Receipt },
                { 
                    name: "Requests", 
                    path: "credits/requests", 
                    icon: FileText },
                { 
                    name: "Transfers", 
                    path: "credits/transfers", 
                    icon: ArrowLeftRight },
                { 
                    name: "Payments", 
                    path: "credits/payments", 
                    icon: Coins },
            ]
        },
        {
            name: "Feedback",
            path: "feedback",
            icon: MessageCircle,
            requiredPermission: "feedback"
        },
        {
            name: "Analytics",
            path: "main/analytics",
            icon: BarChart3,
            requiredPermission: "analytics",
        },
    ],
    platforms: [
        {
            name: "Main Platform",
            path: "main",
            children: [
                {
                    name: "Projects",
                    path: "main/projects",
                    icon: FolderKanban,
                    requiredPermission: "projects",
                    children: [
                        { 
                            name: "All Projects", 
                            path: "main/projects", 
                            icon: FolderKanban },
                        { 
                            name: "Project Ideas", 
                            path: "main/projects/ideas", 
                            icon: Lightbulb },
                    ]
                },
                {
                    name: "Mock Interviews",
                    path: "main/mocks",
                    icon: Mic,
                    requiredPermission: "mocks",
                    children: [
                        { 
                            name: "Voice Mocks", 
                            path: "main/mocks", 
                            icon: Mic },
                        { 
                            name: "Sessions", 
                            path: "main/mocks/sessions", 
                            icon: Activity },
                    ]
                },
                {
                    name: "Assessments",
                    path: "main/assessments",
                    icon: ClipboardCheck,
                    requiredPermission: "assessments",
                    children: [
                        { name: "Topics", path: "main/assessments", icon: BookOpen },
                        { name: "Questions", path: "main/assessments/questions", icon: FileText },
                    ]
                },
                {
                    name: "Challenges",
                    path: "main/challenges",
                    icon: Trophy,
                    requiredPermission: "challenges",
                    children: [
                        { name: "Forge Tracks", path: "main/challenges/forge", icon: Flame },
                        { name: "Crucible Events", path: "main/challenges/crucible", icon: Zap },
                        { name: "Collective", path: "main/challenges/collective", icon: Vote },
                    ]
                },
                {
                    name: "Communities",
                    path: "main/communities",
                    icon: MessageSquare,
                    requiredPermission: "communities",
                    children: [
                        { name: "All Communities", path: "main/communities", icon: MessageSquare },
                        { name: "Reports", path: "main/communities/reports", icon: Flag },
                    ]
                },

            ]
        },
        {
            name: "Hiring Platform",
            path: "hiring",
            children: [
                {
                    name: "Companies",
                    path: "hiring/companies",
                    icon: Building2,
                    requiredPermission: "admin_management", // using generic permission for now
                    children: [
                        { name: "Verification", path: "hiring/companies/verification", icon: Shield },
                        { name: "All Companies", path: "hiring/companies", icon: Building2 },
                    ]
                },
                {
                    name: "Jobs",
                    path: "hiring/jobs",
                    icon: Briefcase,
                    requiredPermission: "admin_management",
                }
            ]
        },
        {
            name: "University Platform",
            path: "uni",
            children: [
                {
                    name: "Universities",
                    path: "uni/universities",
                    icon: School, // Using School icon for universities
                    requiredPermission: "admin_management",
                    children: [
                        { name: "Verification", path: "uni/universities/verification", icon: Shield },
                        { name: "All Universities", path: "uni/universities", icon: School },
                    ]
                },
                {
                    name: "Students",
                    path: "uni/students",
                    icon: GraduationCap,
                    requiredPermission: "users",
                }
            ]
        }
    ],
    secondary: [
        {
            name: "Admin Management",
            path: "admins",
            icon: Shield,
            requiredPermission: "admin_management",
            children: [
                { name: "All Admins", path: "admins", icon: UserCheck },
                { name: "Access Control", path: "admins/access", icon: Lock },
                { name: "My Profile", path: "admins/profile", icon: User },
                { name: "Invitations", path: "admins/invitations", icon: FileText },
                { name: "Audit Logs", path: "admins/audit", icon: Activity },
            ]
        },
        {
            name: "System",
            path: "system",
            icon: Settings,
            requiredPermission: "system",
            children: [
                { name: "Settings", path: "system/settings", icon: Settings },
                { name: "Database", path: "system/database", icon: Database },
            ]
        },
    ]
}

// Permission checking
export type AdminPermission =
    | "users"
    | "credits"
    | "projects"
    | "mocks"
    | "assessments"
    | "challenges"
    | "communities"
    | "feedback"
    | "analytics"
    | "admin_management"
    | "system"

export type PermissionLevel = "read" | "write" | "delete" | "full"

export interface AdminPermissions {
    [key: string]: PermissionLevel[]
}

// Default permissions for each role
export const defaultPermissionsByRole: Record<string, AdminPermissions> = {
    SUPER_ADMIN: {
        users: ["read", "write", "delete", "full"],
        credits: ["read", "write", "delete", "full"],
        projects: ["read", "write", "delete", "full"],
        mocks: ["read", "write", "delete", "full"],
        assessments: ["read", "write", "delete", "full"],
        challenges: ["read", "write", "delete", "full"],
        communities: ["read", "write", "delete", "full"],
        feedback: ["read", "write", "delete", "full"],
        analytics: ["read", "write", "full"],
        admin_management: ["read", "write", "delete", "full"],
        system: ["read", "write", "full"],
    },
    CONTENT_ADMIN: {
        users: ["read"],
        credits: ["read"],
        projects: ["read", "write", "delete"],
        mocks: ["read", "write", "delete"],
        assessments: ["read", "write", "delete"],
        challenges: ["read", "write", "delete"],
        communities: ["read"],
        feedback: ["read", "write"],
        analytics: ["read"],
    },
    FINANCE_ADMIN: {
        users: ["read"],
        credits: ["read", "write", "delete", "full"],
        projects: ["read"],
        mocks: ["read"],
        assessments: ["read"],
        challenges: ["read"],
        communities: ["read"],
        feedback: ["read"],
        analytics: ["read", "write"],
    },
    COMMUNITY_ADMIN: {
        users: ["read", "write"],
        credits: ["read"],
        projects: ["read"],
        mocks: ["read"],
        assessments: ["read"],
        challenges: ["read"],
        communities: ["read", "write", "delete", "full"],
        feedback: ["read", "write", "delete"],
        analytics: ["read"],
    },
    MODULE_MANAGER: {
        // Permissions set per invitation
    },
    VIEWER: {
        users: ["read"],
        credits: ["read"],
        projects: ["read"],
        mocks: ["read"],
        assessments: ["read"],
        challenges: ["read"],
        communities: ["read"],
        feedback: ["read"],
        analytics: ["read"],
    },
}

// Helper function to check if admin has permission
export function hasPermission(
    permissions: AdminPermissions,
    module: AdminPermission,
    level: PermissionLevel
): boolean {
    const modulePermissions = permissions[module]
    if (!modulePermissions) return false
    return modulePermissions.includes(level) || modulePermissions.includes("full")
}

// Filter navigation based on permissions
export function getNavigationForPermissions(permissions: AdminPermissions): NavigationConfig {
    const filterItems = (items: NavigationItem[]): NavigationItem[] => {
        return items.filter(item => {
            if (!item.requiredPermission) return true
            return hasPermission(permissions, item.requiredPermission as AdminPermission, "read")
        }).map(item => ({
            ...item,
            children: item.children ? filterItems(item.children) : undefined
        }))
    }

    // For platforms, we need to filter the children of each platform
    const filterPlatforms = (platforms: PlatformNavigationItem[]): PlatformNavigationItem[] => {
        return platforms.map(platform => ({
            ...platform,
            children: platform.children ? filterItems(platform.children) : undefined
        })).filter(platform => platform.children && platform.children.length > 0)
    }

    return {
        global: filterItems(adminNavigation.global),
        platforms: filterPlatforms(adminNavigation.platforms),
        secondary: filterItems(adminNavigation.secondary),
    }
}