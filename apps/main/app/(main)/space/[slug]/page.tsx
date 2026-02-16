import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSpace } from '@/actions/(main)/space/space.action';
import SpaceHeader from './_components/space-header';
import SpaceTimeline from './_components/space-timeline';
import SpaceSidebar from './_components/space-sidebar';
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
        <div className="w-full h-screen flex flex-col bg-white dark:bg-neutral-950" data-hide-ai-chat="true">
            <SpaceHeader space={space} />

            <div className="flex-1 w-full px-4 py-4 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                    <div className="h-full overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                        <Suspense fallback={<SpaceTimelineSkeleton />}>
                            <SpaceTimeline space={space} />
                        </Suspense>
                    </div>
                    <div className="h-full overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
                        <SpaceSidebar
                            spaceTitle={space.title}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}