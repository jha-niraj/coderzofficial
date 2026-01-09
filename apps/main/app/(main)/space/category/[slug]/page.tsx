import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSpaces } from '@/actions/(main)/space/space.action';
import SpacesList from '../../_components/spaces-list';
import SpacesListSkeleton from '../../_components/spaces-list-skeleton';
import CategoryHeader from './_components/category-header';
import CategoryTabs from '../../allspaces/_components/category-tabs';
import SearchAndFilters from '../../allspaces/_components/search-filters';
import { SpaceCategory } from '@repo/prisma/client';

const categoryConfig: Record<string, {
    category: SpaceCategory;
    title: string;
    description: string;
    emoji: string;
    gradient: string;
}> = {
    'frontend': {
        category: 'FRONTEND',
        title: 'Frontend Development',
        description: 'Master HTML, CSS, JavaScript, React, Vue, and modern frontend frameworks.',
        emoji: '🎨',
        gradient: 'from-cyan-500 to-blue-600'
    },
    'backend': {
        category: 'BACKEND',
        title: 'Backend Development',
        description: 'Learn Node.js, Python, Java, Go, databases, and server-side architecture.',
        emoji: '⚙️',
        gradient: 'from-emerald-500 to-teal-600'
    },
    'fullstack': {
        category: 'FULLSTACK',
        title: 'Full Stack Development',
        description: 'Become a complete developer with end-to-end web development skills.',
        emoji: '🚀',
        gradient: 'from-violet-500 to-purple-600'
    },
    'dsa': {
        category: 'DSA',
        title: 'Data Structures & Algorithms',
        description: 'Master arrays, trees, graphs, dynamic programming, and coding interviews.',
        emoji: '🧮',
        gradient: 'from-amber-500 to-orange-600'
    },
    'system-design': {
        category: 'SYSTEM_DESIGN',
        title: 'System Design',
        description: 'Learn to design scalable systems, microservices, and distributed architectures.',
        emoji: '🏗️',
        gradient: 'from-rose-500 to-pink-600'
    },
    'ai-ml': {
        category: 'AI_ML',
        title: 'AI & Machine Learning',
        description: 'Explore machine learning, deep learning, NLP, and AI applications.',
        emoji: '🤖',
        gradient: 'from-fuchsia-500 to-purple-600'
    },
    'devops': {
        category: 'DEVOPS',
        title: 'DevOps & Infrastructure',
        description: 'Master CI/CD, Docker, Kubernetes, cloud platforms, and automation.',
        emoji: '🔧',
        gradient: 'from-indigo-500 to-blue-600'
    },
    'mobile': {
        category: 'MOBILE',
        title: 'Mobile Development',
        description: 'Build iOS and Android apps with React Native, Flutter, or native development.',
        emoji: '📱',
        gradient: 'from-green-500 to-emerald-600'
    },
    'database': {
        category: 'DATABASE',
        title: 'Database & SQL',
        description: 'Learn SQL, NoSQL, database design, and data management.',
        emoji: '🗄️',
        gradient: 'from-slate-500 to-gray-600'
    },
    'security': {
        category: 'SECURITY',
        title: 'Cybersecurity',
        description: 'Understand security fundamentals, ethical hacking, and secure coding.',
        emoji: '🔒',
        gradient: 'from-red-500 to-rose-600'
    },
    'blockchain': {
        category: 'BLOCKCHAIN',
        title: 'Blockchain & Web3',
        description: 'Explore blockchain technology, smart contracts, and decentralized apps.',
        emoji: '⛓️',
        gradient: 'from-yellow-500 to-amber-600'
    },
    'cloud': {
        category: 'CLOUD',
        title: 'Cloud Computing',
        description: 'Master AWS, Azure, GCP, and cloud architecture patterns.',
        emoji: '☁️',
        gradient: 'from-sky-500 to-cyan-600'
    },
    'interview-prep': {
        category: 'INTERVIEW_PREP',
        title: 'Interview Preparation',
        description: 'Prepare for technical interviews with practice problems and mock interviews.',
        emoji: '💼',
        gradient: 'from-lime-500 to-green-600'
    },
    'project-based': {
        category: 'PROJECT_BASED',
        title: 'Project-Based Learning',
        description: 'Learn by building real-world projects and portfolio pieces.',
        emoji: '🎯',
        gradient: 'from-orange-500 to-red-600'
    },
    'career': {
        category: 'CAREER',
        title: 'Career Development',
        description: 'Build your tech career with resume tips, portfolio advice, and career paths.',
        emoji: '📈',
        gradient: 'from-blue-500 to-indigo-600'
    },
};

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{
        search?: string;
        sort?: 'latest' | 'popular' | 'members' | 'views';
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
        title: `${config.title} Spaces | The Coderz`,
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
                    emoji={config.emoji}
                    gradient={config.gradient}
                />

                <CategoryTabs />

                <SearchAndFilters />

                <Suspense fallback={<SpacesListSkeleton />}>
                    <CategorySpacesContent
                        category={config.category}
                        search={queryParams.search}
                        sortBy={queryParams.sort}
                        page={queryParams.page ? parseInt(queryParams.page) : 1}
                    />
                </Suspense>
            </div>
        </div>
    );
}

async function CategorySpacesContent({
    category,
    search,
    sortBy = 'popular',
    page = 1
}: {
    category: SpaceCategory;
    search?: string;
    sortBy?: 'latest' | 'popular' | 'members' | 'views';
    page?: number;
}) {
    const result = await getSpaces({
        visibility: 'PUBLIC',
        category,
        search,
        sortBy,
        page,
        limit: 12
    });

    if (result.success && result.data && result.data.spaces.length > 0) {
        return (
            <div>
                <SpacesList spaces={result.data.spaces} columns={3} />
                {
                    result.data.pagination.totalPages > 1 && (
                        <div className="mt-8 flex justify-center">
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                Showing page {result.data.pagination.page} of {result.data.pagination.totalPages} ({result.data.pagination.total} spaces)
                            </div>
                        </div>
                    )
                }
            </div>
        );
    }

    return <SpacesList spaces={[]} emptyMessage="No spaces found in this category yet. Be the first to create one!" />;
}