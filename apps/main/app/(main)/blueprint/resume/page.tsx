import { auth } from '@repo/auth'
import { getForgeTemplates, getMyTemplateStats } from '@/actions/(main)/ai/resume-marketplace.action'
import { BlueprintClient } from './_components/blueprint-client'

export const metadata = {
    title: 'Blueprint — Resume Templates | Coderz',
    description: 'Buy, sell, and discover professional resume templates. Earn credits as a creator.',
}

type SortOption = 'popular' | 'newest' | 'price_asc' | 'price_desc'
const VALID_SORTS: SortOption[] = ['popular', 'newest', 'price_asc', 'price_desc']

export default async function BlueprintPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string; search?: string; tag?: string; sort?: string }>
}) {
    const session = await auth()
    const sp = await searchParams
    const sort = VALID_SORTS.includes(sp.sort as SortOption) ? (sp.sort as SortOption) : undefined

    const [blueprintRes, statsRes] = await Promise.all([
        getForgeTemplates({ search: sp.search, tag: sp.tag, sort }),
        session?.user?.id ? getMyTemplateStats() : Promise.resolve(null),
    ])

    const myStats = statsRes && 'templates' in statsRes && 'earnings' in statsRes && 'totalEarned' in statsRes
        ? {
            templates: statsRes.templates as { id: string; name: string; isMarketplace: boolean; marketplacePrice: number; totalSales: number; totalRevenue: number; _count: { purchases: number } }[],
            earnings: statsRes.earnings as { id: string; amount: number; createdAt: Date }[],
            totalEarned: statsRes.totalEarned as number,
          }
        : null

    return (
        <BlueprintClient
            templates={blueprintRes.templates ?? []}
            myStats={myStats}
            userId={session?.user?.id}
            activeTab={sp.tab ?? 'browse'}
        />
    )
}
