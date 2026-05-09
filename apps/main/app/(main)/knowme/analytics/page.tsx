import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@repo/auth'
import { headers } from 'next/headers';
import {
    getKnowMeAnalytics, hasKnowMeProfile
} from '@/actions/(main)/knowme';
import KnowMeAnalytics from './_components/knowme-analytics';
import AnalyticsSkeleton from './_components/analytics-skeleton';

export const metadata: Metadata = {
    title: 'KnowMe Analytics | BuildrHQ',
    description: 'View insights and analytics for your AI-powered portfolio assistant.',
};

interface Props {
    searchParams: Promise<{ range?: string }>;
}

export default async function KnowMeAnalyticsPage({ searchParams }: Props) {
    const session = await getSession(headers());
    const params = await searchParams;

    if (!session?.user?.id) {
        redirect('/login?callbackUrl=/knowme/analytics');
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            <Suspense fallback={<AnalyticsSkeleton />}>
                <AnalyticsContent timeRange={params.range as "7d" | "30d" | "90d" | "all" || "30d"} />
            </Suspense>
        </div>
    );
}

async function AnalyticsContent({ timeRange }: { timeRange: "7d" | "30d" | "90d" | "all" }) {
    const profileCheck = await hasKnowMeProfile();

    if (!profileCheck.success || !profileCheck.data?.exists || profileCheck.data.status !== 'ACTIVE') {
        redirect('/knowme');
    }

    const analyticsResult = await getKnowMeAnalytics(timeRange);

    if (!analyticsResult.success || !analyticsResult.data) {
        redirect('/knowme');
    }

    return <KnowMeAnalytics analytics={analyticsResult.data} initialRange={timeRange} />;
}