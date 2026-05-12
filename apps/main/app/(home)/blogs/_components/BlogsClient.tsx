'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Spotlight } from '@repo/ui/components/ui/spotlight'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Clock, ArrowRight } from 'lucide-react'
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

    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full bg-white dark:bg-neutral-950 overflow-hidden">
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
            <section className="relative z-10">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-full backdrop-blur-sm">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Knowledge Base</span>
                        </div>
                        <h1 className="mt-5 text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-neutral-50 dark:to-neutral-400">
                            The BuildrHQ Blog
                        </h1>
                        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Deep dives into software engineering careers, interview prep, portfolio building, and the tools that get developers hired.
                        </p>
                    </motion.div>

                    {/* Category filters */}
                    <div className="mb-8 flex flex-wrap items-center gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                    activeCategory === cat
                                        ? 'bg-neutral-950 text-white border-neutral-950 dark:bg-white dark:text-neutral-950 dark:border-white'
                                        : 'bg-transparent text-neutral-600 border-neutral-300 hover:border-neutral-500 dark:text-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Featured post */}
                    {featured && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="mb-10"
                        >
                            <Link href={`/blogs/${featured.slug}`} className="group block">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-sm">
                                    <div className="relative aspect-[16/9] lg:aspect-auto bg-neutral-100 dark:bg-neutral-800 min-h-[240px]">
                                        <Image
                                            src={featured.heroImage}
                                            alt={featured.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                        />
                                    </div>
                                    <div className="p-8 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-medium">{featured.category}</span>
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {featured.readingTime} min read</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
                                            {featured.title}
                                        </h2>
                                        <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-5">{featured.description}</p>
                                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 dark:text-orange-400">
                                            Read article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    )}

                    {/* Post grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rest.map((post, idx) => (
                            <motion.div
                                key={post.slug}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                            >
                                <Link href={`/blogs/${post.slug}`} className="block group h-full">
                                    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 shadow-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 overflow-hidden transition-all">
                                        <div className="relative aspect-[16/9] bg-neutral-100 dark:bg-neutral-800">
                                            <Image
                                                src={post.heroImage}
                                                alt={post.title}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                            />
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium border border-neutral-200 dark:border-neutral-700">
                                                    {post.category}
                                                </span>
                                                <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {post.readingTime} min
                                                </span>
                                            </div>
                                            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug flex-1">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4">{post.description}</p>
                                            <span className="text-xs text-neutral-400 dark:text-neutral-500">
                                                {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    )
}
