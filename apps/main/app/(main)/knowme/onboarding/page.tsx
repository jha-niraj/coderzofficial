import { redirect } from 'next/navigation';

// Onboarding has been moved to a sheet on the main KnowMe page
// This page now redirects there
export default function KnowMeOnboardingPage() {
    redirect('/knowme');
}