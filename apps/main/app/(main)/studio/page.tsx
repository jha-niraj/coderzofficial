import { Suspense } from 'react';
import { Metadata } from 'next';
import { auth } from '@repo/auth';
import { getMyStudios } from '@/actions/(main)/studios/studio.action';
import StudiosList from './_components/studios-list';
import StudiosListSkeleton from './_components/studios-list-skeleton';
import StudioDashboardHeader from './_components/studio-dashboard-header';
import StudioTabs from './_components/studio-tabs';

export const metadata: Metadata = {
    title: 'Studio | The Coderz',
    description: 'Your personal AI-powered learning workspace',
};

export default async function StudioPage() {
    const session = await auth();
    const userId = session?.user?.id;

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <StudioDashboardHeader />
                <StudioTabs />
                <Suspense fallback={<StudiosListSkeleton />}>
                    <StudiosContent userId={userId} />
                </Suspense>
            </div>
        </div>
    );
}

async function StudiosContent({ userId }: { userId?: string }) {
    if (!userId) {
        return <StudiosList studios={[]} emptyMessage="Sign in to create your own studios!" />;
    }

    const result = await getMyStudios({ limit: 10 });

    if (result.error || !result.studios) {
        return <StudiosList studios={[]} emptyMessage="Failed to load studios. Please try again." />;
    }

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    Your Recent Studios
                    <span className="ml-2 text-sm font-normal text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                        {result.studios.length}
                    </span>
                </h2>
                <StudiosList
                    studios={result.studios}
                    columns={3}
                    showCreator={false}
                />
            </section>
        </div>
    );
}
