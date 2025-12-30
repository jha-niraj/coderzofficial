import {
    LayoutDashboard, Users, CreditCard, FolderKanban, Mic, ClipboardCheck, Trophy,
    MessageSquare, MessageCircle, BarChart3, Settings, Shield, FileText,
    type LucideIcon, Coins, Receipt, ArrowLeftRight, UserCheck, BookOpen, Flame, Zap,
    Vote, Flag, Activity, Database, User, Lock, Building2, GraduationCap, Briefcase,
    Code, UserPlus, CheckCircle, School, Users2, BookMarked
} from "lucide-react"

export interface NavigationItem {
    name: string
    path: string
    icon: LucideIcon
    children?: NavigationItem[]
    requiredPermission?: string
    badge?: string | number
}

export interface PlatformNavigationItem extends NavigationItem {
    color: "blue" | "emerald" | "violet" | "neutral"
    description?: string
}

export interface NavigationConfig {
    global: NavigationItem[]
    platforms: PlatformNavigationItem[]
    secondary: NavigationItem[]
}

// Multi-platform admin navigation configuration
export const adminNavigation: NavigationConfig = {
    global: [
        {
            name: "Dashboard",
            path: "dashboard",
            icon: LayoutDashboard,
        },
    ],
    platforms: [
        {
            name: "Main Platform",
            path: "main",
            icon: Code,
            color: "blue",
            description: "Coder'z learning platform",
            requiredPermission: "main",
            children: [
                { name: "Overview", path: "main", icon: LayoutDashboard },
                {
                    name: "Users",
                    path: "main/users",
                    icon: Users,
                    requiredPermission: "main.users",
                    children: [
                        { name: "All Users", path: "main/users", icon: Users },
                        { name: "Roles & Access", path: "main/users/roles", icon: Shield },
                    ]
                },
                {
                    name: "Credits",
                    path: "main/credits",
                    icon: CreditCard,
                    requiredPermission: "main.credits",
                    children: [
                        { name: "Overview", path: "main/credits", icon: Coins },
                        { name: "Transactions", path: "main/credits/transactions", icon: Receipt },
                        { name: "Requests", path: "main/credits/requests", icon: FileText },
                        { name: "Transfers", path: "main/credits/transfers", icon: ArrowLeftRight },
                        { name: "Payments", path: "main/credits/payments", icon: Coins },
                    ]
                },
                {
                    name: "Projects",
                    path: "main/projects",
                    icon: FolderKanban,
                    requiredPermission: "main.projects",
                },
                {
                    name: "Mock Interviews",
                    path: "main/mocks",
                    icon: Mic,
                    requiredPermission: "main.mocks",
                },
                {
                    name: "Assessments",
                    path: "main/assessments",
                    icon: ClipboardCheck,
                    requiredPermission: "main.assessments",
                },
                {
                    name: "Challenges",
                    path: "main/challenges",
                    icon: Trophy,
                    requiredPermission: "main.challenges",
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
                    requiredPermission: "main.communities",
                    children: [
                        { name: "All Communities", path: "main/communities", icon: MessageSquare },
                        { name: "Reports", path: "main/communities/reports", icon: Flag },
                    ]
                },
                {
                    name: "Feedback",
                    path: "main/feedback",
                    icon: MessageCircle,
                    requiredPermission: "main.feedback",
                },
                {
                    name: "Analytics",
                    path: "main/analytics",
                    icon: BarChart3,
                    requiredPermission: "main.analytics",
                },
            ]
        },
        {
            name: "Hiring Platform",
            path: "hiring",
            icon: Building2,
            color: "emerald",
            description: "Coder'z Hiring platform",
            requiredPermission: "hiring",
            children: [
                { name: "Overview", path: "hiring", icon: LayoutDashboard },
                {
                    name: "Companies",
                    path: "hiring/companies",
                    icon: Building2,
                    requiredPermission: "hiring.companies",
                    children: [
                        { name: "All Companies", path: "hiring/companies", icon: Building2 },
                        { name: "Verification", path: "hiring/companies/verification", icon: CheckCircle },
                    ]
                },
                {
                    name: "Members",
                    path: "hiring/members",
                    icon: Users,
                    requiredPermission: "hiring.members",
                },
                {
                    name: "Jobs",
                    path: "hiring/jobs",
                    icon: Briefcase,
                    requiredPermission: "hiring.jobs",
                },
                {
                    name: "Candidates",
                    path: "hiring/candidates",
                    icon: UserCheck,
                    requiredPermission: "hiring.candidates",
                },
                {
                    name: "Applications",
                    path: "hiring/applications",
                    icon: FileText,
                    requiredPermission: "hiring.applications",
                },
                {
                    name: "Invitations",
                    path: "hiring/invitations",
                    icon: UserPlus,
                    requiredPermission: "hiring.invitations",
                },
                {
                    name: "Analytics",
                    path: "hiring/analytics",
                    icon: BarChart3,
                    requiredPermission: "hiring.analytics",
                },
            ]
        },
        {
            name: "University Platform",
            path: "uni",
            icon: GraduationCap,
            color: "violet",
            description: "Coder'z University platform",
            requiredPermission: "uni",
            children: [
                { name: "Overview", path: "uni", icon: LayoutDashboard },
                {
                    name: "Universities",
                    path: "uni/universities",
                    icon: School,
                    requiredPermission: "uni.universities",
                    children: [
                        { name: "All Universities", path: "uni/universities", icon: School },
                        { name: "Verification", path: "uni/universities/verification", icon: CheckCircle },
                    ]
                },
                {
                    name: "Departments",
                    path: "uni/departments",
                    icon: Building2,
                    requiredPermission: "uni.departments",
                },
                {
                    name: "Faculty",
                    path: "uni/faculty",
                    icon: Users2,
                    requiredPermission: "uni.faculty",
                },
                {
                    name: "Students",
                    path: "uni/students",
                    icon: UserCheck,
                    requiredPermission: "uni.students",
                },
                {
                    name: "Classes",
                    path: "uni/classes",
                    icon: BookOpen,
                    requiredPermission: "uni.classes",
                },
                {
                    name: "Assignments",
                    path: "uni/assignments",
                    icon: BookMarked,
                    requiredPermission: "uni.assignments",
                },
                {
                    name: "Placements",
                    path: "uni/placements",
                    icon: Briefcase,
                    requiredPermission: "uni.placements",
                },
                {
                    name: "Credits",
                    path: "uni/credits",
                    icon: Coins,
                    requiredPermission: "uni.credits",
                },
                {
                    name: "Analytics",
                    path: "uni/analytics",
                    icon: BarChart3,
                    requiredPermission: "uni.analytics",
                },
            ]
        },
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

// Permission types
export type PermissionLevel = "read" | "write" | "delete" | "full"

// Admin permission module names (for type checking)
// Includes both new platform-prefixed and legacy flat permission names for backward compatibility
export type AdminPermission =
    // Global permissions
    | "admin_management"
    | "system"
    // Main platform (new prefixed format)
    | "main"
    | "main.users"
    | "main.credits"
    | "main.projects"
    | "main.mocks"
    | "main.assessments"
    | "main.challenges"
    | "main.communities"
    | "main.feedback"
    | "main.analytics"
    // Hiring platform
    | "hiring"
    | "hiring.companies"
    | "hiring.members"
    | "hiring.jobs"
    | "hiring.candidates"
    | "hiring.applications"
    | "hiring.invitations"
    | "hiring.analytics"
    // University platform
    | "uni"
    | "uni.universities"
    | "uni.departments"
    | "uni.faculty"
    | "uni.students"
    | "uni.classes"
    | "uni.assignments"
    | "uni.placements"
    | "uni.credits"
    | "uni.analytics"
    // Legacy flat permission names (for backward compatibility)
    | "users"
    | "credits"
    | "projects"
    | "mocks"
    | "assessments"
    | "challenges"
    | "communities"
    | "feedback"
    | "analytics"

// Platform permission modules
export interface MainPlatformPermissions {
    users?: PermissionLevel[]
    credits?: PermissionLevel[]
    projects?: PermissionLevel[]
    mocks?: PermissionLevel[]
    assessments?: PermissionLevel[]
    challenges?: PermissionLevel[]
    communities?: PermissionLevel[]
    feedback?: PermissionLevel[]
    analytics?: PermissionLevel[]
}

export interface HiringPlatformPermissions {
    companies?: PermissionLevel[]
    members?: PermissionLevel[]
    jobs?: PermissionLevel[]
    candidates?: PermissionLevel[]
    applications?: PermissionLevel[]
    invitations?: PermissionLevel[]
    analytics?: PermissionLevel[]
}

export interface UniversityPlatformPermissions {
    universities?: PermissionLevel[]
    departments?: PermissionLevel[]
    faculty?: PermissionLevel[]
    students?: PermissionLevel[]
    classes?: PermissionLevel[]
    assignments?: PermissionLevel[]
    placements?: PermissionLevel[]
    credits?: PermissionLevel[]
    analytics?: PermissionLevel[]
}

export interface AdminPermissions {
    // Global permissions
    admin_management?: PermissionLevel[]
    system?: PermissionLevel[]

    // Platform-level permissions
    main?: MainPlatformPermissions
    hiring?: HiringPlatformPermissions
    uni?: UniversityPlatformPermissions
}

// Default permissions for each role
export const defaultPermissionsByRole: Record<string, AdminPermissions> = {
    SUPER_ADMIN: {
        admin_management: ["read", "write", "delete", "full"],
        system: ["read", "write", "full"],
        main: {
            users: ["read", "write", "delete", "full"],
            credits: ["read", "write", "delete", "full"],
            projects: ["read", "write", "delete", "full"],
            mocks: ["read", "write", "delete", "full"],
            assessments: ["read", "write", "delete", "full"],
            challenges: ["read", "write", "delete", "full"],
            communities: ["read", "write", "delete", "full"],
            feedback: ["read", "write", "delete", "full"],
            analytics: ["read", "write", "full"],
        },
        hiring: {
            companies: ["read", "write", "delete", "full"],
            members: ["read", "write", "delete", "full"],
            jobs: ["read", "write", "delete", "full"],
            candidates: ["read", "write", "delete", "full"],
            applications: ["read", "write", "delete", "full"],
            invitations: ["read", "write", "delete", "full"],
            analytics: ["read", "write", "full"],
        },
        uni: {
            universities: ["read", "write", "delete", "full"],
            departments: ["read", "write", "delete", "full"],
            faculty: ["read", "write", "delete", "full"],
            students: ["read", "write", "delete", "full"],
            classes: ["read", "write", "delete", "full"],
            assignments: ["read", "write", "delete", "full"],
            placements: ["read", "write", "delete", "full"],
            credits: ["read", "write", "delete", "full"],
            analytics: ["read", "write", "full"],
        },
    },
    MAIN_PLATFORM_ADMIN: {
        main: {
            users: ["read", "write", "delete", "full"],
            credits: ["read", "write", "delete", "full"],
            projects: ["read", "write", "delete", "full"],
            mocks: ["read", "write", "delete", "full"],
            assessments: ["read", "write", "delete", "full"],
            challenges: ["read", "write", "delete", "full"],
            communities: ["read", "write", "delete", "full"],
            feedback: ["read", "write", "delete", "full"],
            analytics: ["read", "write", "full"],
        },
    },
    HIRING_PLATFORM_ADMIN: {
        hiring: {
            companies: ["read", "write", "delete", "full"],
            members: ["read", "write", "delete", "full"],
            jobs: ["read", "write", "delete", "full"],
            candidates: ["read", "write", "delete", "full"],
            applications: ["read", "write", "delete", "full"],
            invitations: ["read", "write", "delete", "full"],
            analytics: ["read", "write", "full"],
        },
    },
    UNI_PLATFORM_ADMIN: {
        uni: {
            universities: ["read", "write", "delete", "full"],
            departments: ["read", "write", "delete", "full"],
            faculty: ["read", "write", "delete", "full"],
            students: ["read", "write", "delete", "full"],
            classes: ["read", "write", "delete", "full"],
            assignments: ["read", "write", "delete", "full"],
            placements: ["read", "write", "delete", "full"],
            credits: ["read", "write", "delete", "full"],
            analytics: ["read", "write", "full"],
        },
    },
    CONTENT_ADMIN: {
        main: {
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
    },
    FINANCE_ADMIN: {
        main: {
            users: ["read"],
            credits: ["read", "write", "delete", "full"],
            analytics: ["read", "write"],
        },
        hiring: {
            analytics: ["read"],
        },
        uni: {
            credits: ["read", "write", "delete", "full"],
            analytics: ["read"],
        },
    },
    MODULE_MANAGER: {
        // Permissions set per invitation
    },
    VIEWER: {
        main: {
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
        hiring: {
            companies: ["read"],
            members: ["read"],
            jobs: ["read"],
            candidates: ["read"],
            applications: ["read"],
            invitations: ["read"],
            analytics: ["read"],
        },
        uni: {
            universities: ["read"],
            departments: ["read"],
            faculty: ["read"],
            students: ["read"],
            classes: ["read"],
            assignments: ["read"],
            placements: ["read"],
            credits: ["read"],
            analytics: ["read"],
        },
    },
}

// Helper function to check if admin has permission
export function hasPermission(
    permissions: AdminPermissions,
    permissionPath: string,
    level: PermissionLevel
): boolean {
    const parts = permissionPath.split(".")

    // Global permission (e.g., "admin_management", "system") or legacy flat permission
    if (parts.length === 1) {
        const key = parts[0]
        if (!key) return false
        // Check if it's a global permission
        if (key === "admin_management" || key === "system") {
            const modulePermissions = permissions[key]
            if (!modulePermissions || !Array.isArray(modulePermissions)) return false
            return modulePermissions.includes(level) || modulePermissions.includes("full")
        }

        // Check if it's a platform-level permission (main, hiring, uni)
        if (key === "main" || key === "hiring" || key === "uni") {
            return !!permissions[key]
        }

        // Legacy flat permission - check in main platform
        const mainPerms = permissions.main
        if (mainPerms && typeof mainPerms === "object") {
            const modulePerms = (mainPerms as Record<string, PermissionLevel[] | undefined>)[key]
            if (modulePerms && Array.isArray(modulePerms)) {
                return modulePerms.includes(level) || modulePerms.includes("full")
            }
        }

        return false
    }

    // Module-level permission (e.g., "main.users", "hiring.companies")
    if (parts.length === 2) {
        const [platform, module] = parts
        if (!platform || !module) return false

        if (platform === "main" || platform === "hiring" || platform === "uni") {
            const platformPerms = permissions[platform]
            if (!platformPerms || typeof platformPerms !== "object") return false

            const modulePerms = (platformPerms as Record<string, PermissionLevel[] | undefined>)[module]
            if (!modulePerms || !Array.isArray(modulePerms)) return false
            return modulePerms.includes(level) || modulePerms.includes("full")
        }
    }

    return false
}

// Check if admin has access to a platform
export function hasPlatformAccess(permissions: AdminPermissions, platform: "main" | "hiring" | "uni"): boolean {
    const platformPerms = permissions[platform]
    if (!platformPerms) return false
    return Object.keys(platformPerms).length > 0
}

// Filter navigation based on permissions
export function getNavigationForPermissions(permissions: AdminPermissions): NavigationConfig {
    const filterItems = (items: NavigationItem[]): NavigationItem[] => {
        return items.filter(item => {
            if (!item.requiredPermission) return true
            return hasPermission(permissions, item.requiredPermission, "read")
        }).map(item => ({
            ...item,
            children: item.children ? filterItems(item.children) : undefined
        }))
    }

    const filterPlatforms = (platforms: PlatformNavigationItem[]): PlatformNavigationItem[] => {
        return platforms.filter(platform => {
            if (!platform.requiredPermission) return true
            const platformKey = platform.requiredPermission as "main" | "hiring" | "uni"
            return hasPlatformAccess(permissions, platformKey)
        }).map(platform => ({
            ...platform,
            children: platform.children ? filterItems(platform.children) : undefined
        }))
    }

    return {
        global: filterItems(adminNavigation.global),
        platforms: filterPlatforms(adminNavigation.platforms),
        secondary: filterItems(adminNavigation.secondary),
    }
}

// Get platform color class
export function getPlatformColorClass(platform: "main" | "hiring" | "uni" | string, type: "bg" | "text" | "border" = "bg"): string {
    const colors = {
        main: {
            bg: "bg-blue-500",
            text: "text-blue-600 dark:text-blue-400",
            border: "border-blue-500",
        },
        hiring: {
            bg: "bg-emerald-500",
            text: "text-emerald-600 dark:text-emerald-400",
            border: "border-emerald-500",
        },
        uni: {
            bg: "bg-violet-500",
            text: "text-violet-600 dark:text-violet-400",
            border: "border-violet-500",
        },
    }

    return colors[platform as keyof typeof colors]?.[type] || "bg-neutral-500"
}
