import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@repo/auth';
import { 
    getMyKnowMeProfile, hasKnowMeProfile 
} from '@/actions/(main)/knowme/profile.action';
import KnowMeDashboard from './_components/knowme-dashboard';
import KnowMeDashboardSkeleton from './_components/knowme-dashboard-skeleton';
import KnowMeLandingPage from './_components/knowme-landing';

export const metadata: Metadata = {
    title: 'KnowMe - AI Portfolio Assistant | The Coderz',
    description: 'Create an AI-powered assistant that knows everything about your professional profile. Let visitors ask questions about your work 24/7.',
};

export default async function KnowMePage() {
    const session = await auth();
    
    if (!session?.user?.id) {
        return <KnowMeLandingPage isLoggedIn={false} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            <Suspense fallback={<KnowMeDashboardSkeleton />}>
                <KnowMeContent />
            </Suspense>
        </div>
    );
}

async function KnowMeContent() {
    const profileCheck = await hasKnowMeProfile();
    
    if (!profileCheck.success || !profileCheck.data?.exists) {
        return <KnowMeLandingPage isLoggedIn={true} />;
    }

    // If setup incomplete, redirect to onboarding
    if (profileCheck.data.status === 'SETUP') {
        redirect('/knowme/onboarding');
    }

    const profileResult = await getMyKnowMeProfile();
    
    if (!profileResult.success || !profileResult.data) {
        return <KnowMeLandingPage isLoggedIn={true} />;
    }

    return <KnowMeDashboard profile={profileResult.data} />;
}