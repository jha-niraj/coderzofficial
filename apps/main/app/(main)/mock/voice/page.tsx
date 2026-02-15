
import {
    getUserMockSessions, getCreatedVoiceMocks, getPublicVoiceMocks
} from '@/actions/(main)/mockvoice/voice.action'
import { VoiceMainContent } from './_components/voice-main-content'
import { MOCK_CATEGORIES } from './_constants/mock-categories'

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

interface MockData {
    id: string
    title: string
    description: string
    category?: string
    level: string
    duration: number
    creditsRequired: number
    questionsCount?: number
    isPublic?: boolean
    byAdmin?: boolean
    isFeatured?: boolean
    createdAt?: Date
    popularity?: number
    totalSessions?: number
    averageRating?: number | null
    tags?: string[]
    createdBy?: {
        image: string | null
        name: string | null
        username: string | null
    } | null
}

interface SessionData {
    id: string
    status: string
    createdAt: Date
    completedAt: Date | null
    duration: number | null
    creditsUsed: number
    mock: {
        id: string
        title: string
        description: string
        level: string
        category: string
        duration: number | null
        creditsRequired: number
    }
}

export default async function VoiceMockInterviewPage({ searchParams }: PageProps) {
    const params = await searchParams
    const view = (params.view as 'all-mocks' | 'my-mocks' | 'my-sessions') || undefined
    const category = params.category as string | undefined
    const page = Number(params.page) || 1
    const search = (params.search as string) || undefined
    const level = (params.level as string) || undefined

    // Determine effective view logic
    let effectiveView: 'all-mocks' | 'my-mocks' | 'my-sessions' | 'category' = 'all-mocks'
    if (view) effectiveView = view
    if (category) effectiveView = 'category'

    let mocks: MockData[] = []
    let sessions: SessionData[] = []
    let total = 0
    let totalPages = 1
    let categoryLabel = ''

    try {
        if (effectiveView === 'my-sessions') {
            const result = await getUserMockSessions()
            if (result.success && result.sessions) {
                sessions = result.sessions
                // Client-side filtering for sessions if needed
                total = sessions.length
            }
        } else if (effectiveView === 'my-mocks') {
            // Get user created mocks
            const result = await getCreatedVoiceMocks(
                undefined, // category
                100 // limit
            )
            if (result.success && result.mocks) {
                mocks = result.mocks
                // Filter locally if search/level provided (since action might not support it yet)
                if (search || (level && level !== 'ALL')) {
                    mocks = mocks.filter(m => {
                        const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase())
                        const matchLevel = !level || level === 'ALL' || m.level === level
                        return matchSearch && matchLevel
                    })
                }
                total = mocks.length
            }
        } else {
            // All Mocks or Category Mocks
            // Use getPublicVoiceMocks or getAllPublicMocks depending on admin filter preference.
            // getAllPublicMocks includes admin + user mocks if verified?
            // "getAllPublicMocks" in action file seems to fetch all public.

            const result = await getPublicVoiceMocks({
                page,
                limit: 12,
                category: category !== 'ALL' ? category : undefined,
                level: level !== 'ALL' ? level : undefined,
                search: search,
                includeAdmin: true // We want to see admin mocks too
            })

            if (result.success) {
                mocks = result.mocks || []
                total = result.total || 0
                totalPages = result.totalPages || 1
            }

            if (category) {
                const catObj = MOCK_CATEGORIES.find(c => c.value === category)
                categoryLabel = catObj?.label || category
            }
        }
    } catch (error) {
        console.error('Error fetching voice page data:', error)
    }

    return (
        <VoiceMainContent
            mocks={mocks}
            sessions={sessions}
            total={total}
            totalPages={totalPages}
            currentPage={page}
            view={effectiveView}
            categoryLabel={categoryLabel}
        />
    )
}