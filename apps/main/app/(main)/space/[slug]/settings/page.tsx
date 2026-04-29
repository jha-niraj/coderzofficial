import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSpace } from '@/actions/(main)/space/space.action';
import SpaceSettingsClient from './_components/space-settings-client';

interface SpaceSettingsPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SpaceSettingsPageProps): Promise<Metadata> {
    const { slug } = await params;
    const result = await getSpace(slug);

    if (!result.success || !result.data) {
        return {
            title: 'Settings | The Coderz',
        };
    }

    return {
        title: `Settings - ${result.data.title} | Spaces | The Coderz`,
    };
}

export default async function SpaceSettingsPage({ params }: SpaceSettingsPageProps) {
    const { slug } = await params;
    const result = await getSpace(slug);

    if (!result.success || !result.data) {
        notFound();
    }

    return (
        <Suspense fallback={<SettingsSkeleton />}>
            <SpaceSettingsClient space={result.data} />
        </Suspense>
    );
}

function SettingsSkeleton() {
    return (
        <div>
            <div className="border-b border-neutral-200 dark:border-neutral-800 p-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                </div>
            </div>
            <div className="container mx-auto max-w-4xl py-8 px-4">
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
                            <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-4" />
                            <div className="h-10 w-full bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

