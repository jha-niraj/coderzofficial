import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getKnowMeProfileByUsername } from '@/actions/(main)/knowme';
import PublicChatInterface from './_components/public-chat-interface';
import PublicChatSkeleton from './_components/public-chat-skeleton';

interface Props {
    params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;
    const result = await getKnowMeProfileByUsername(username);

    if (!result.success || !result.data) {
        return {
            title: 'Profile Not Found | KnowMe',
        };
    }

    const profile = result.data;
    const name = profile.user.name || profile.user.username || 'User';

    return {
        title: `Chat with ${name}'s AI | KnowMe`,
        description: `Ask questions about ${name}'s skills, projects, and experience. Powered by KnowMe AI.`,
        openGraph: {
            title: `Chat with ${name}'s AI`,
            description: profile.user.bio || `Learn about ${name}'s professional background through AI-powered chat.`,
            images: profile.user.image ? [profile.user.image] : [],
        },
    };
}

export default async function PublicKnowMePage({ params }: Props) {
    const { username } = await params;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            <Suspense fallback={<PublicChatSkeleton />}>
                <PublicChatContent username={username} />
            </Suspense>
        </div>
    );
}

async function PublicChatContent({ username }: { username: string }) {
    const result = await getKnowMeProfileByUsername(username);

    if (!result.success || !result.data) {
        notFound();
    }

    return <PublicChatInterface profile={result.data} />;
}