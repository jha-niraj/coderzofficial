import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSpace } from '@/actions/(main)/space/space.action';
import SpaceHeader from './_components/space-header';
import SpaceTimeline from './_components/space-timeline';
import SpaceSidebar from './_components/space-sidebar';
import SpaceActivityFeed from './_components/space-activity-feed';
import SpaceTimelineSkeleton from './_components/space-timeline-skeleton';

interface SpacePageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SpacePageProps): Promise<Metadata> {
    const { slug } = await params;
    const result = await getSpace(slug);

    if (!result.success || !result.data) {
        return {
            title: 'Space Not Found | The Coderz',
        };
    }

    return {
        title: `${result.data.title} | Spaces | The Coderz`,
        description: result.data.description || 'Collaborative learning space',
    };
}

export default async function SpacePage({ params }: SpacePageProps) {
    const { slug } = await params;
    const result = await getSpace(slug);

    if (!result.success || !result.data) {
        notFound();
    }

    const space = result.data;

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <SpaceHeader space={space} />

            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <Suspense fallback={<div className="h-64 bg-neutral-100 dark:bg-neutral-900 rounded-lg animate-pulse" />}>
                            <SpaceActivityFeed spaceId={space.id} />
                        </Suspense>
                    </div>
                    <div className="lg:col-span-2 order-1 lg:order-2">
                        <Suspense fallback={<SpaceTimelineSkeleton />}>
                            <SpaceTimeline space={space} />
                        </Suspense>
                    </div>
                    <div className="lg:col-span-1 order-3">
                        <Suspense fallback={<div className="h-64 bg-neutral-100 dark:bg-neutral-900 rounded-lg animate-pulse" />}>
                            <SpaceSidebar space={space} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}