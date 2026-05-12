import type { Metadata } from 'next'
import { allPosts } from '@/content/blog'
import BlogsClient from './_components/BlogsClient'

export const metadata: Metadata = {
    title: 'Developer Blog — Career, Interviews & Engineering',
    description: 'Deep dives into software engineering careers, technical interview prep, portfolio building, DSA, system design, and the AI tools that get developers hired.',
    openGraph: {
        title: 'BuildrHQ Blog — Career, Interviews & Engineering',
        description: 'Deep dives into software engineering careers, technical interview prep, portfolio building, DSA, and system design.',
        images: [{ url: '/og/blog/blog-index-hero.png', width: 1200, height: 630 }],
    },
    alternates: { canonical: '/blogs' },
}

export default function BlogsPage() {
    return <BlogsClient posts={allPosts} />
}
