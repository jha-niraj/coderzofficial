// Shared admin types and interfaces
export interface AdminUser {
    id: string
    name: string | null
    email: string
    role: string
    status: string
    permissions?: JSON
    lastLoginAt: Date | null
    createdAt: Date
}

export interface User {
    id: string
    name: string | null
    email: string
    image: string | null
    role: string
    credits: number
    currentXp: number
    createdAt: Date
}

export interface Feedback {
    id: string
    name: string
    category: string
    status: string
    isVerified: boolean
    createdAt: Date
    user: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
}

export interface CreditTransaction {
    id: string
    amount: number
    type: string
    description: string
    createdAt: Date
    user: {
        id: string
        name: string | null
        email: string
    }
}

export interface CreditRequest {
    id: string
    requestedCredits: number
    status: string
    linkedinPostUrl: string
    createdAt: Date
    user: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
}

export interface CreditTransfer {
    id: string
    amount: number
    createdAt: Date
    sender: {
        id: string
        name: string | null
        email: string
    }
    receiver: {
        id: string
        name: string | null
        email: string
    }
}

export interface Payment {
    id: string
    amount: number
    currency: string
    status: string
    credits: number
    createdAt: Date
    user: {
        id: string
        name: string | null
        email: string
    }
}

export interface DatabaseStats {
    users: number
    projects: number
    communities: number
    mockInterviews: number
    feedback: number
    creditTransactions: number
    assessmentQuestions: number
    forgeTracks: number
    crucibleEvents: number
}

export interface SystemHealth {
    databaseStatus: string
    recentErrors: number
    recentActivitiesLast24h: number
    timestamp: Date
}

export interface AdminPermissions {
    [module: string]: string[]
}

export interface StatsData {
    totalUsers?: number
    newUsersToday?: number
    activeUsers?: number
    totalProjects?: number
    totalCommunities?: number
    totalCredits?: number
    totalRevenue?: number
    [key: string]: number | undefined
}

export interface ChartData {
    name: string
    value: number
}