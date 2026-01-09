import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@repo/auth';
import {
    hasKnowMeProfile, getMyKnowMeProfile
} from '@/actions/(main)/knowme';
import OnboardingWizard from './_components/onboarding-wizard';
import OnboardingSkeleton from './_components/onboarding-skeleton';

export const metadata: Metadata = {
    title: 'KnowMe Setup | The Coderz',
    description: 'Set up your AI-powered portfolio assistant in just 2 minutes.',
};

export default async function KnowMeOnboardingPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login?callbackUrl=/knowme/onboarding');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/20">
            <Suspense fallback={<OnboardingSkeleton />}>
                <OnboardingContent userId={session.user.id} />
            </Suspense>
        </div>
    );
}

async function OnboardingContent({ userId }: { userId: string }) {
    const profileCheck = await hasKnowMeProfile();

    if (!profileCheck.success || !profileCheck.data?.exists) {
        redirect('/knowme');
    }

    // If already completed, redirect to dashboard
    if (profileCheck.data.status === 'ACTIVE') {
        redirect('/knowme');
    }

    const profileResult = await getMyKnowMeProfile();

    if (!profileResult.success || !profileResult.data) {
        redirect('/knowme');
    }

    return (
        <OnboardingWizard
            profile={profileResult.data}
            userId={userId}
        />
    );
}