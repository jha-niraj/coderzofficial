"use server"

// ForgeTrack, CrucibleEvent, ForgeEnrollment, CrucibleParticipation models are not yet
// implemented in the Prisma schema. All functions return stub responses until these
// features are built out.

interface Response<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

const NOT_IMPLEMENTED = { success: false, error: "Feature not yet implemented" } as const

export async function getAllForgeTracks(_params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
}): Promise<Response> {
    return {
        success: true,
        data: {
            tracks: [],
            pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
        },
    }
}

export async function getAllCrucibleEvents(_params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
}): Promise<Response> {
    return {
        success: true,
        data: {
            events: [],
            pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
        },
    }
}

export async function createForgeTrack(_data: {
    name: string
    slug: string
    description: string
    technology: string
    level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}): Promise<Response> {
    return NOT_IMPLEMENTED
}

export async function createCrucibleEvent(_data: {
    name: string
    slug: string
    description: string
    eventType: string
    startTime: Date
    endTime: Date
    maxParticipants?: number
}): Promise<Response> {
    return NOT_IMPLEMENTED
}

export async function updateForgeTrack(_id: string, _data: {
    name?: string
    description?: string
    status?: string
    level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}): Promise<Response> {
    return NOT_IMPLEMENTED
}

export async function updateCrucibleEvent(_id: string, _data: {
    name?: string
    description?: string
    status?: 'UPCOMING' | 'ACTIVE' | 'ENDED' | 'ARCHIVED'
    startTime?: Date
    endTime?: Date
}): Promise<Response> {
    return NOT_IMPLEMENTED
}

export async function deleteForgeTrack(_id: string): Promise<Response> {
    return NOT_IMPLEMENTED
}

export async function deleteCrucibleEvent(_id: string): Promise<Response> {
    return NOT_IMPLEMENTED
}

export async function getChallengeStats(): Promise<Response> {
    return {
        success: true,
        data: {
            forgeTracks: 0,
            crucibleEvents: 0,
            totalEnrollments: 0,
            totalParticipants: 0,
        },
    }
}
