import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar, Tag } from 'lucide-react'
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

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <div className="min-h-screen bg-white dark:bg-neutral-950">
                <div className="max-w-3xl mx-auto px-6 py-12">
                    {/* Back link */}
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-8 group transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        All posts
                    </Link>

                    {/* Category + tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-medium">
                            {post.category}
                        </span>
                        {post.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                                <Tag className="w-3 h-3" />{tag}
                            </span>
                        ))}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white leading-tight mb-4">
                        {post.title}
                    </h1>

                    {/* Description */}
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                        {post.description}
                    </p>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800 mb-8">
                        {author?.avatar && (
                            <Image src={author.avatar} alt={author.name} width={36} height={36} className="rounded-full" />
                        )}
                        <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">{author?.name}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{author?.role}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {post.readingTime} min read
                            </span>
                        </div>
                    </div>

                    {/* Hero image */}
                    <div className="relative w-full aspect-[1200/630] mb-10 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                        <Image
                            src={post.heroImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, 768px"
                        />
                    </div>

                    {/* Article body */}
                    <article
                        className="prose prose-neutral dark:prose-invert max-w-none
                            prose-headings:font-bold prose-headings:tracking-tight
                            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                            prose-p:leading-relaxed prose-p:text-neutral-700 dark:prose-p:text-neutral-300
                            prose-a:text-orange-600 dark:prose-a:text-orange-400 prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-neutral-900 dark:prose-strong:text-white
                            prose-code:bg-neutral-100 dark:prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal
                            prose-pre:bg-neutral-900 dark:prose-pre:bg-neutral-800 prose-pre:rounded-xl
                            prose-img:rounded-xl prose-img:shadow-md
                            prose-ul:text-neutral-700 dark:prose-ul:text-neutral-300
                            prose-ol:text-neutral-700 dark:prose-ol:text-neutral-300
                            prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50 dark:prose-blockquote:bg-orange-950/20 prose-blockquote:py-1 prose-blockquote:rounded-r-lg"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />

                    {/* CTA */}
                    <div className="mt-14 p-8 rounded-2xl bg-neutral-950 dark:bg-white text-center">
                        <h3 className="text-xl font-bold text-white dark:text-neutral-900 mb-2">
                            Ready to build your engineering career?
                        </h3>
                        <p className="text-neutral-400 dark:text-neutral-600 text-sm mb-5">
                            Join thousands of developers using BuildrHQ to ace interviews, build portfolios, and land top engineering roles.
                        </p>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
                        >
                            Get started free →
                        </Link>
                    </div>

                    {/* Author bio */}
                    {author && (
                        <div className="mt-10 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-start gap-4">
                            <Image src={author.avatar} alt={author.name} width={48} height={48} className="rounded-full flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-neutral-900 dark:text-white">{author.name}</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{author.role}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
