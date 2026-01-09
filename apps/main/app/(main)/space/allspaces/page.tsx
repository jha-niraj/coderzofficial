import { Suspense } from 'react';
import { Metadata } from 'next';
import { getSpaces, getSpaceStats } from '@/actions/(main)/space/space.action';
import SpacesList from '../_components/spaces-list';
import SpacesListSkeleton from '../_components/spaces-list-skeleton';
import SpacesHeader from './_components/spaces-header';
import CategoryTabs from './_components/category-tabs';
import SearchAndFilters from './_components/search-filters';

export const metadata: Metadata = {
    title: 'Discover Spaces | The Coderz',
    description: 'Discover public learning spaces created by the community. Find spaces on topics like DSA, System Design, Frontend, Backend, and more.',
};

interface PageProps {
    searchParams: Promise<{
        search?: string;
        sort?: 'latest' | 'popular' | 'members' | 'views';
        page?: string;
    }>;
}

export default async function AllSpacesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    
    // Fetch stats for the header
    const statsResult = await getSpaceStats();
    const stats = statsResult.success && statsResult.data 
        ? statsResult.data 
        : { totalSpaces: 0, totalLearners: 0, averageCompletion: 0 };

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <SpacesHeader stats={stats} />

                <CategoryTabs />

                <SearchAndFilters />

                <Suspense fallback={<SpacesListSkeleton />}>
                    <AllSpacesContent
                        search={params.search}
                        sortBy={params.sort}
                        page={params.page ? parseInt(params.page) : 1}
                    />
                </Suspense>
            </div>
        </div>
    );
}

async function AllSpacesContent({
    search,
    sortBy = 'popular',
    page = 1
}: {
    search?: string;
    sortBy?: 'latest' | 'popular' | 'members' | 'views';
    page?: number;
}) {
    const result = await getSpaces({
        visibility: 'PUBLIC',
        search,
        sortBy,
        page,
        limit: 12
    });

    if (result.success && result.data) {
        return (
            <div>
                <SpacesList spaces={result.data.spaces} columns={3} />
                {
                    result.data.pagination.totalPages > 1 && (
                        <div className="mt-8 flex justify-center">
                            <PaginationInfo pagination={result.data.pagination} />
                        </div>
                    )
                }
            </div>
        );
    }

    return <SpacesList spaces={[]} emptyMessage="No public spaces found. Be the first to create one!" />;
}

function PaginationInfo({ pagination }: { pagination: { page: number; totalPages: number; total: number } }) {
    return (
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} spaces)
        </div>
    );
}
