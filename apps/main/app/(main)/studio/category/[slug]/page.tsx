import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicStudios } from '@/actions/(main)/studios/studio.action';
import StudiosList from '../../_components/studios-list';
import StudiosListSkeleton from '../../_components/studios-list-skeleton';
import CategoryHeader from './_components/category-header';
import CategoryTabs from '../../allstudios/_components/category-tabs';
import SearchFilters from '../../allstudios/_components/search-filters';

const categoryConfig: Record<string, {
    category: string;
    title: string;
    description: string;
    gradient: string;
}> = {
    programming: {
        category: 'PROGRAMMING',
        title: 'Programming',
        description: 'Core programming concepts, languages, and paradigms',
        gradient: 'from-blue-500 to-cyan-600',
    },
    'web-development': {
        category: 'WEB_DEVELOPMENT',
        title: 'Web Development',
        description: 'Frontend, backend, and full-stack web development',
        gradient: 'from-emerald-500 to-teal-600',
    },
    'data-science': {
        category: 'DATA_SCIENCE',
        title: 'Data Science',
        description: 'Data analysis, visualization, and statistical modeling',
        gradient: 'from-purple-500 to-violet-600',
    },
    'mobile-development': {
        category: 'MOBILE_DEVELOPMENT',
        title: 'Mobile Development',
        description: 'iOS, Android, and cross-platform mobile apps',
        gradient: 'from-orange-500 to-red-600',
    },
    devops: {
        category: 'DEVOPS',
        title: 'DevOps',
        description: 'CI/CD, infrastructure, and deployment automation',
        gradient: 'from-indigo-500 to-blue-600',
    },
    database: {
        category: 'DATABASE',
        title: 'Database',
        description: 'SQL, NoSQL, and database design',
        gradient: 'from-slate-500 to-gray-600',
    },
    security: {
        category: 'SECURITY',
        title: 'Security',
        description: 'Cybersecurity, ethical hacking, and secure coding',
        gradient: 'from-red-500 to-rose-600',
    },
    'ai-ml': {
        category: 'AI_ML',
        title: 'AI & Machine Learning',
        description: 'Artificial intelligence, deep learning, and ML models',
        gradient: 'from-fuchsia-500 to-purple-600',
    },
    cloud: {
        category: 'CLOUD',
        title: 'Cloud Computing',
        description: 'AWS, GCP, Azure, and cloud architecture',
        gradient: 'from-sky-500 to-cyan-600',
    },
    'system-design': {
        category: 'SYSTEM_DESIGN',
        title: 'System Design',
        description: 'Scalable architecture and distributed systems',
        gradient: 'from-amber-500 to-orange-600',
    },
    dsa: {
        category: 'DSA',
        title: 'Data Structures & Algorithms',
        description: 'Essential DSA concepts for coding interviews',
        gradient: 'from-lime-500 to-green-600',
    },
    'interview-prep': {
        category: 'INTERVIEW_PREP',
        title: 'Interview Prep',
        description: 'Technical interview preparation and practice',
        gradient: 'from-pink-500 to-rose-600',
    },
};

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{
        search?: string;
        sortBy?: string;
        page?: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const config = categoryConfig[slug];

    if (!config) {
        return { title: 'Category Not Found' };
    }

    return {
        title: `${config.title} Studios | The Coderz`,
        description: config.description,
    };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const queryParams = await searchParams;
    const config = categoryConfig[slug];

    if (!config) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <CategoryHeader
                    title={config.title}
                    description={config.description}
                    gradient={config.gradient}
                />
                <CategoryTabs />
                <SearchFilters />
                <Suspense fallback={<StudiosListSkeleton />}>
                    <CategoryStudiosContent
                        category={config.category}
                        search={queryParams.search}
                        sortBy={queryParams.sortBy as 'latest' | 'popular' | 'views' | 'likes'}
                        page={queryParams.page ? parseInt(queryParams.page) : 1}
                    />
                </Suspense>
            </div>
        </div>
    );
}

async function CategoryStudiosContent({
    category,
    search,
    sortBy = 'popular',
    page = 1
}: {
    category: string;
    search?: string;
    sortBy?: 'latest' | 'popular' | 'views' | 'likes';
    page?: number;
}) {
    const result = await getPublicStudios({
        category,
        search,
        sortBy,
        page,
        limit: 12
    });

    if (result.error || !result.studios) {
        return <StudiosList studios={[]} emptyMessage="No studios found in this category." emptyAction={false} />;
    }

    return (
        <div>
            <StudiosList
                studios={result.studios}
                columns={3}
                emptyMessage="No studios found in this category yet. Be the first to create one!"
            />
            {
                result.pagination && result.pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            Showing page {result.pagination.page} of {result.pagination.totalPages} ({result.pagination.total} studios)
                        </div>
                    </div>
                )
            }
        </div>
    );
}