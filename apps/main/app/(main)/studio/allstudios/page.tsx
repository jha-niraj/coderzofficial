import { Suspense } from 'react';
import { Metadata } from 'next';
import { getPublicStudios } from '@/actions/(main)/studios/studio.action';
import StudiosList from '../_components/studios-list';
import StudiosListSkeleton from '../_components/studios-list-skeleton';
import StudioTabs from '../_components/studio-tabs';
import AllStudiosHeader from './_components/allstudios-header';
import CategoryTabs from './_components/category-tabs';
import SearchFilters from './_components/search-filters';

export const metadata: Metadata = {
    title: 'Discover Studios | The Coderz',
    description: 'Explore public AI-powered learning workspaces created by the community',
};

interface PageProps {
    searchParams: Promise<{
        search?: string;
        category?: string;
        sortBy?: string;
        page?: string;
    }>;
}

export default async function AllStudiosPage({ searchParams }: PageProps) {
    const params = await searchParams;

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <AllStudiosHeader />
                <StudioTabs />
                <CategoryTabs />
                <SearchFilters />
                <Suspense fallback={<StudiosListSkeleton />}>
                    <AllStudiosContent
                        search={params.search}
                        category={params.category}
                        sortBy={params.sortBy as 'latest' | 'popular' | 'views' | 'likes'}
                        page={params.page ? parseInt(params.page) : 1}
                    />
                </Suspense>
            </div>
        </div>
    );
}

async function AllStudiosContent({
    search,
    category,
    sortBy = 'popular',
    page = 1
}: {
    search?: string;
    category?: string;
    sortBy?: 'latest' | 'popular' | 'views' | 'likes';
    page?: number;
}) {
    const result = await getPublicStudios({
        search,
        category,
        sortBy,
        page,
        limit: 12
    });

    if (result.error || !result.studios) {
        return <StudiosList studios={[]} emptyMessage="No public studios found." emptyAction={false} />;
    }

    return (
        <div>
            <StudiosList
                studios={result.studios}
                columns={3}
                showCreator={true}
                emptyMessage="No public studios found. Be the first to share your knowledge!"
            />
            {
                result.pagination && result.pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            Showing page {result.pagination.page} of {result.pagination.totalPages} ({result.pagination.total} studios)
                        </div>
                    </div>
                )
            }
        </div>
    );
}


