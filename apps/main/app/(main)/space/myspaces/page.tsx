import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@repo/auth';
import { getUserSpaces } from '@/actions/(main)/space/space.action';
import SpacesList from '../_components/spaces-list';
import SpacesListSkeleton from '../_components/spaces-list-skeleton';
import MySpacesHeader from './_components/myspaces-header';
import SpaceTabs from './_components/space-tabs';

export const metadata: Metadata = {
    title: 'My Spaces | The Coderz',
    description: 'Manage your private and protected learning spaces.',
};

export default async function MySpacesPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login?callbackUrl=/space/myspaces');
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <MySpacesHeader />

                <SpaceTabs />

                <Suspense fallback={<SpacesListSkeleton />}>
                    <MySpacesContent />
                </Suspense>
            </div>
        </div>
    );
}

async function MySpacesContent() {
    const result = await getUserSpaces();

    if (result.success && result.data) {
        const { spaces } = result.data;

        // Separate created and joined spaces
        const session = await auth();
        const userId = session?.user?.id;

        const createdSpaces = spaces.filter(s => s.creatorId === userId);
        const joinedSpaces = spaces.filter(s => s.creatorId !== userId);

        return (
            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        Spaces You Created
                        <span className="ml-2 text-sm font-normal text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                            {createdSpaces.length}
                        </span>
                    </h2>
                    <SpacesList
                        spaces={createdSpaces}
                        columns={3}
                        emptyMessage="You haven't created any spaces yet. Start your first learning journey!"
                    />
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                        <span className="text-2xl">🎯</span>
                        Spaces You&apos;ve joined
                        <span className="ml-2 text-sm font-normal text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                            {joinedSpaces.length}
                        </span>
                    </h2>
                    <SpacesList
                        spaces={joinedSpaces}
                        columns={3}
                        emptyMessage="You haven't joined any spaces yet. Explore public spaces to find interesting learning paths!"
                        emptyAction={false}
                    />
                </section>
            </div>
        );
    }

    return <SpacesList spaces={[]} />;
}