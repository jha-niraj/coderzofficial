import { Suspense } from 'react';
import { Metadata } from 'next';
import { auth } from '@repo/auth';
import {
    getSpaces, getUserSpaces
} from '@/actions/(main)/space/space.action';
import SpacesList from './_components/spaces-list';
import SpacesListSkeleton from './_components/spaces-list-skeleton';
import SpacesMetrics from './_components/spaces-metrics';
import SpaceDashboardHeader from './_components/space-dashboard-header';
import SpaceTabs from './myspaces/_components/space-tabs';

export const metadata: Metadata = {
    title: 'Spaces | The Coderz',
    description: 'Collaborative learning spaces where you can learn together, track progress, and build your learning journey.',
};

export default async function SpacesPage() {
    const session = await auth();
    const userId = session?.user?.id;

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <SpaceDashboardHeader />

                <SpaceTabs />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        <Suspense fallback={<SpacesListSkeleton />}>
                            <SpacesContent userId={userId} />
                        </Suspense>
                    </div>
                    <div className="lg:col-span-1">
                        <SpacesMetrics userId={userId} />
                    </div>
                </div>
            </div>
        </div>
    );
}

async function SpacesContent({ userId }: { userId?: string }) {
    if (userId) {
        const result = await getUserSpaces();
        if (result.success && result.data) {
            const spaces = result.data.spaces;
            const createdSpaces = spaces.filter(s => s.creatorId === userId);
            const joinedSpaces = spaces.filter(s => s.creatorId !== userId);

            return (
                <div className="space-y-10">
                    {
                        createdSpaces.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="text-xl">✨</span>
                                    Your Spaces
                                    <span className="ml-2 text-sm font-normal text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                                        {createdSpaces.length}
                                    </span>
                                </h2>
                                <SpacesList spaces={createdSpaces} columns={2} showEmpty={false} />
                            </section>
                        )
                    }
                    {
                        joinedSpaces.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="text-xl">🎯</span>
                                    Joined Spaces
                                    <span className="ml-2 text-sm font-normal text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                                        {joinedSpaces.length}
                                    </span>
                                </h2>
                                <SpacesList spaces={joinedSpaces} columns={2} showEmpty={false} />
                            </section>
                        )
                    }
                    {
                        createdSpaces.length === 0 && joinedSpaces.length === 0 && (
                            <SpacesList spaces={[]} />
                        )
                    }
                </div>
            );
        }
    }

    // Show public spaces if not logged in
    const result = await getSpaces({ visibility: 'PUBLIC', limit: 20 });
    if (result.success && result.data) {
        return <SpacesList spaces={result.data.spaces} columns={2} />;
    }

    return <SpacesList spaces={[]} />;
}