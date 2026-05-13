'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Clock, ArrowRight, ArrowUpRight } from 'lucide-react'
import Footer from '@/components/landingpage/footer'
import type { BlogPost } from '@/content/blog'

interface Props {
    posts: BlogPost[]
}

export default function BlogsClient({ posts }: Props) {
    const categories = useMemo(() => ['All', ...Array.from(new Set(posts.map(p => p.category)))], [posts])
    const [activeCategory, setActiveCategory] = useState('All')
    const filtered = useMemo(
        () => activeCategory === 'All' ? posts : posts.filter(p => p.category === activeCategory),
        [activeCategory, posts]
    )
    const featured = filtered.filter(p => p.featured).slice(0, 1)[0]
    const rest = filtered.filter(p => !featured || p.slug !== featured.slug)

    const publishDate = (iso: string) =>
        new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans">

            {/* ── Page header ── */}
            <div className="border-b border-neutral-100 dark:border-neutral-900">
                <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                    >
                        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-400 mb-4">
                            The BuildrHQ Blog
                        </p>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[0.95] mb-6">
                            Engineering<br />
                            <span className="text-neutral-300 dark:text-neutral-700">Intelligence.</span>
                        </h1>
                        <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-xl leading-relaxed">
                            Deep dives into software careers, interview prep, portfolio building, and the tools that get developers hired.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* ── Category filter ── */}
            <div className="max-w-7xl mx-auto px-6 pt-8 pb-0">
                <div className="flex flex-wrap items-center gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${activeCategory === cat
                                ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white'
                                : 'bg-transparent text-neutral-500 border-neutral-200 hover:border-neutral-400 dark:text-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 pb-24">

                {/* ── Featured post ── */}
                {featured && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-14"
                    >
                        <Link href={`/blogs/${featured.slug}`} className="group block">
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
                                {/* Image */}
                                <div className="lg:col-span-3 relative aspect-[16/9] lg:aspect-auto min-h-[260px] bg-neutral-100 dark:bg-neutral-900">
                                    <Image
                                        src={featured.heroImage}
                                        alt={featured.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 100vw, 60vw"
                                        priority
                                    />
                                </div>
                                {/* Content */}
                                <div className="lg:col-span-2 flex flex-col justify-between p-8 lg:p-10 border-t lg:border-t-0 lg:border-l border-neutral-200 dark:border-neutral-800">
                                    <div>
                                        <div className="flex items-center gap-2 mb-5">
                                            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full text-neutral-600 dark:text-neutral-400">
                                                {featured.category}
                                            </span>
                                            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-600 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {featured.readingTime} min
                                            </span>
                                        </div>
                                        <h2 className="text-2xl lg:text-[1.6rem] font-bold text-neutral-900 dark:text-white leading-snug tracking-tight mb-4">
                                            {featured.title}
                                        </h2>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                            {featured.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                                        <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                                            {publishDate(featured.publishedAt)}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-white group-hover:gap-2.5 transition-all">
                                            Read <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* ── Section label ── */}
                {rest.length > 0 && (
                    <div className="flex items-center gap-4 mb-8">
                        <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-neutral-400">
                            {featured ? 'More articles' : 'All articles'}
                        </p>
                        <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-900" />
                        <span className="text-[10px] font-mono text-neutral-400">{rest.length}</span>
                    </div>
                )}

                {/* ── Article grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-100 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-900 rounded-2xl overflow-hidden">
                    {rest.map((post, idx) => (
                        <motion.div
                            key={post.slug}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: idx * 0.05 }}
                            className="bg-white dark:bg-neutral-950"
                        >
                            <Link href={`/blogs/${post.slug}`} className="group flex flex-col h-full p-6 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors">
                                {/* Thumbnail */}
                                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 mb-5 flex-shrink-0">
                                    <Image
                                        src={post.heroImage}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                    />
                                </div>

                                {/* Meta */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                                        {post.category}
                                    </span>
                                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-600 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {post.readingTime} min
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-snug tracking-tight mb-2.5 flex-1 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                                    {post.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                                    {post.description}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                    <span className="text-xs font-mono text-neutral-400 dark:text-neutral-600">
                                        {publishDate(post.publishedAt)}
                                    </span>
                                    <ArrowUpRight className="w-4 h-4 text-neutral-300 dark:text-neutral-700 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Empty state */}
                {filtered.length === 0 && (
                    <div className="text-center py-24">
                        <p className="text-neutral-400 dark:text-neutral-600">No posts in this category yet.</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}
