import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar } from 'lucide-react'
import { allPosts, getPostBySlug } from '@/content/blog'
import { authors } from '@/content/authors'
import { getPostContent } from '@/lib/blog-renderer'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.buildrhq.com'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
    return allPosts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const post = getPostBySlug(slug)
    if (!post) return {}

    return {
        title: post.title,
        description: post.description,
        authors: [{ name: authors[post.author]?.name ?? 'BuildrHQ' }],
        openGraph: {
            type: 'article',
            url: `${BASE_URL}/blogs/${post.slug}`,
            title: post.title,
            description: post.description,
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt ?? post.publishedAt,
            authors: [authors[post.author]?.name ?? 'BuildrHQ'],
            tags: post.tags,
            images: [{ url: post.ogImage, width: 1200, height: 630, alt: post.title }],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
            images: [post.ogImage],
        },
        alternates: { canonical: `/blogs/${post.slug}` },
    }
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params
    const post = getPostBySlug(slug)
    if (!post) notFound()

    const author = authors[post.author]
    const htmlContent = await getPostContent(post.slug)

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": post.description,
        "image": `${BASE_URL}${post.heroImage}`,
        "datePublished": post.publishedAt,
        "dateModified": post.updatedAt ?? post.publishedAt,
        "author": {
            "@type": "Person",
            "name": author?.name ?? "BuildrHQ",
            "url": BASE_URL,
        },
        "publisher": {
            "@type": "Organization",
            "name": "BuildrHQ",
            "logo": { "@type": "ImageObject", "url": `${BASE_URL}/mainlogo.png` }
        },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/blogs/${post.slug}` },
    }

    const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    })

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <div className="min-h-screen bg-white dark:bg-neutral-950">

                {/* ── Article Header ── */}
                <div className="max-w-[740px] mx-auto px-6 pt-10 pb-0">

                    {/* Back link */}
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-10 group transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        All posts
                    </Link>

                    {/* Category + tags row */}
                    <div className="flex flex-wrap items-center gap-2 mb-5">
                        <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                            {post.category}
                        </span>
                        {post.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[11px] font-mono text-neutral-400 dark:text-neutral-600">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-[2.6rem] font-bold text-neutral-900 dark:text-white leading-[1.18] tracking-tight mb-5">
                        {post.title}
                    </h1>

                    {/* Description */}
                    <p className="text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8">
                        {post.description}
                    </p>

                    {/* Author + meta */}
                    <div className="flex items-center justify-between py-5 border-t border-b border-neutral-100 dark:border-neutral-800 mb-10">
                        <div className="flex items-center gap-3">
                            {author?.avatar && (
                                <Image
                                    src={author.avatar}
                                    alt={author.name}
                                    width={36}
                                    height={36}
                                    className="rounded-full ring-1 ring-neutral-200 dark:ring-neutral-700"
                                />
                            )}
                            <div>
                                <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-tight">
                                    {author?.name}
                                </p>
                                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                                    {author?.role}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-neutral-400 dark:text-neutral-500 font-mono">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {publishedDate}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {post.readingTime} min read
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Hero image ── */}
                <div className="max-w-[900px] mx-auto px-6 mb-12">
                    <div className="relative w-full aspect-[1200/630] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <Image
                            src={post.heroImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, 900px"
                        />
                    </div>
                </div>

                {/* ── Article body ── */}
                <div className="max-w-[740px] mx-auto px-6 pb-24">
                    <article
                        className="blog-content"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />

                    {/* Divider */}
                    <div className="mt-16 mb-12 border-t border-neutral-100 dark:border-neutral-800" />

                    {/* Author bio */}
                    {author && (
                        <div className="flex items-start gap-4 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 mb-8">
                            <Image
                                src={author.avatar}
                                alt={author.name}
                                width={52}
                                height={52}
                                className="rounded-full flex-shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-700"
                            />
                            <div>
                                <p className="text-sm font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1">
                                    Written by
                                </p>
                                <p className="font-bold text-neutral-900 dark:text-white">
                                    {author.name}
                                </p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                                    {author.role}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="p-8 rounded-2xl bg-neutral-950 dark:bg-neutral-900 border border-neutral-800 text-center">
                        <p className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 mb-3">
                            BuildrHQ
                        </p>
                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                            Build your engineering career.
                        </h3>
                        <p className="text-neutral-400 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
                            Join thousands of developers using AI tools, portfolio projects, and mock interviews to land top engineering roles.
                        </p>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
                        >
                            Get started free →
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}
