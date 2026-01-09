import { Suspense } from 'react';
import { Metadata } from 'next';
import { auth } from '@repo/auth';
import { redirect } from 'next/navigation';
import { getMyStudios } from '@/actions/(main)/studios/studio.action';
import StudiosList from '../_components/studios-list';
import StudiosListSkeleton from '../_components/studios-list-skeleton';
import StudioTabs from '../_components/studio-tabs';
import MyStudiosHeader from './_components/mystudios-header';
import SearchFilters from './_components/search-filters';

export const metadata: Metadata = {
    title: 'My Studios | The Coderz',
    description: 'Manage your AI-powered learning workspaces',
};

interface PageProps {
    searchParams: Promise<{
        search?: string;
        category?: string;
        sortBy?: string;
        page?: string;
    }>;
}

export default async function MyStudiosPage({ searchParams }: PageProps) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login?callbackUrl=/studio/mystudios');
    }

    const params = await searchParams;

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <MyStudiosHeader />
                <StudioTabs />
                <SearchFilters />
                <Suspense fallback={<StudiosListSkeleton />}>
                    <MyStudiosContent
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

async function MyStudiosContent({
    search,
    category,
    sortBy = 'latest',
    page = 1
}: {
    search?: string;
    category?: string;
    sortBy?: 'latest' | 'popular' | 'views' | 'likes';
    page?: number;
}) {
    const result = await getMyStudios({
        search,
        category,
        sortBy,
        page,
        limit: 12
    });

    if (result.error || !result.studios) {
        return <StudiosList studios={[]} emptyMessage="Failed to load studios. Please try again." />;
    }

    return (
        <div>
            <StudiosList studios={result.studios} columns={3} showCreator={false} />
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


