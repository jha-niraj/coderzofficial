import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@repo/auth';
import {
    getMyKnowMeProfile, getApiConfig
} from '@/actions/(main)/knowme';
import KnowMeSettings from './_components/knowme-settings';
import SettingsSkeleton from './_components/settings-skeleton';

export const metadata: Metadata = {
    title: 'KnowMe Settings | The Coderz',
    description: 'Configure your AI-powered portfolio assistant settings.',
};

interface Props {
    searchParams: Promise<{ tab?: string }>;
}

export default async function KnowMeSettingsPage({ searchParams }: Props) {
    const session = await auth();
    const params = await searchParams;

    if (!session?.user?.id) {
        redirect('/login?callbackUrl=/knowme/settings');
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            <Suspense fallback={<SettingsSkeleton />}>
                <SettingsContent userId={session.user.id} initialTab={params.tab} />
            </Suspense>
        </div>
    );
}

async function SettingsContent({ userId, initialTab }: { userId: string; initialTab?: string }) {
    const [profileResult, apiConfigResult] = await Promise.all([
        getMyKnowMeProfile(),
        getApiConfig(),
    ]);

    if (!profileResult.success || !profileResult.data) {
        redirect('/knowme');
    }

    return (
        <KnowMeSettings
            profile={profileResult.data}
            apiConfig={apiConfigResult.success ? apiConfigResult.data : null}
            initialTab={initialTab}
        />
    );
}