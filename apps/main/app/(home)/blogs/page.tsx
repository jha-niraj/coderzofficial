'use client'

import Link from 'next/link'
import { Spotlight } from '@repo/ui/components/ui/spotlight'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import Footer from '@/components/landingpage/footer'

const posts = [
	{
		slug: 'integratingrazorpay',
		title: 'Integrating Razorpay for Credits: Complete Guide',
		description: 'End-to-end implementation: purchase flow, APIs, verification, schema, and edge cases with webhooks.',
		badge: 'Payments',
		date: 'Nov 2025',
	}
]

export default function BlogsIndexPage() {
	const categories = useMemo(() => ['All', ...Array.from(new Set(posts.map(p => p.badge)))], [])
	const [activeCategory, setActiveCategory] = useState('All')
	const filtered = useMemo(() => activeCategory === 'All' ? posts : posts.filter(p => p.badge === activeCategory), [activeCategory])

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
							The Coder&apos;z Blogs
						</h1>
						<p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
							Deep dives into platform architecture, integrations, and best practices.
						</p>
					</motion.div>
					<div className="mb-8 flex flex-wrap items-center gap-2">
						{
							categories.map(cat => (
								<button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-full text-sm border transition-all ${activeCategory === cat ? 'bg-white text-neutral-900 border-white' : 'bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800'}`}>
									{cat}
								</button>
							))
						}
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{
							filtered.map((post, idx) => (
								<motion.div key={post.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.05 }}>
									<Link href={`/blogs/${post.slug}`} className="block group">
										<div className="relative overflow-hidden bg-white dark:bg-neutral-900 shadow-2xl p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
											<div className="absolute inset-0 bg-gradient-to-br from-neutral-200/0 dark:from-neutral-800/0 to-neutral-300/0 dark:to-neutral-900/0 group-hover:from-neutral-200/20 dark:group-hover:from-neutral-800/10 group-hover:to-neutral-300/30 dark:group-hover:to-neutral-900/20 transition-all" />
											<div className="relative z-10 flex items-center justify-between mb-3">
												<span className="text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">{post.badge}</span>
												<span className="text-xs text-neutral-500 dark:text-neutral-400">{post.date}</span>
											</div>
											<h3 className="relative z-10 text-lg font-semibold text-neutral-900 dark:text-white mb-1 group-hover:underline underline-offset-4">{post.title}</h3>
											<p className="relative z-10 text-sm text-neutral-600 dark:text-neutral-400">{post.description}</p>
										</div>
									</Link>
								</motion.div>
							))
						}
					</div>
				</div>
			</section>
			<Footer />
		</div>
	)
}