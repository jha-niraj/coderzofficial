import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@repo/auth';
import { prisma } from '@repo/prisma';
import AnalyticsDashboard from './_components/analytics-dashboard';
import AnalyticsSkeleton from './_components/analytics-skeleton';

export const metadata: Metadata = {
    title: 'Space Analytics | The Coderz',
    description: 'View detailed analytics and insights for your learning space.',
};

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function SpaceAnalyticsPage({ params }: PageProps) {
    const session = await auth();
    const { slug } = await params;

    if (!session?.user?.id) {
        redirect(`/login?callbackUrl=/space/${slug}/analytics`);
    }

    const space = await prisma.space.findUnique({
        where: { slug },
        select: {
            id: true,
            slug: true,
            title: true,
            creatorId: true,
        }
    });

    if (!space) {
        notFound();
    }

    // Check if user is the creator
    if (space.creatorId !== session.user.id) {
        redirect(`/space/${slug}`);
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Suspense fallback={<AnalyticsSkeleton />}>
                    <AnalyticsDashboard spaceId={space.id} spaceSlug={space.slug} spaceTitle={space.title} />
                </Suspense>
            </div>
        </div>
    );
}