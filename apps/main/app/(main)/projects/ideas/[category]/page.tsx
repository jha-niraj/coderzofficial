'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Code2, Layers, Terminal } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { getCategoryById } from '../data/categories'

export default function CategoryPage() {
    const params = useParams()
    const router = useRouter()
    const categoryId = params.category as string

    const category = getCategoryById(categoryId)

    if (!category) {
        return (
            <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Terminal className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                        Category Not Found
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                        The category you are looking for doesn't exist or has been moved.
                    </p>
                    <Button onClick={() => router.push('/projects/ideas')} variant="default">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Categories
                    </Button>
                </div>
            </div>
        )
    }

    const Icon = category.icon

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans">
            {/* Background Texture */}
            <div className="fixed inset-0 z-0 h-full w-full bg-white dark:bg-neutral-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#171717_1px,transparent_1px)] opacity-50"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-16">

                {/* Navigation */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12"
                >
                    <Link href="/projects/ideas">
                        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Categories
                        </Button>
                    </Link>
                </motion.div>

                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 border-b border-neutral-100 dark:border-neutral-800 pb-12"
                >
                    <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
                        <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                            <Icon className="w-10 h-10 text-neutral-900 dark:text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                                {category.name}
                            </h1>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
                                {category.description}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Technologies Grid */}
                <div>
                    <div className="flex items-center gap-2 mb-8">
                        <Code2 className="w-5 h-5 text-neutral-500" />
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                            Select a Technology
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {category.technologies.map((tech, index) => (
                            <motion.div
                                key={tech.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link href={`/projects/ideas/${categoryId}/${tech.id}`}>
                                    <div className="group h-full bg-white dark:bg-neutral-900 shadow-2xl rounded-xl p-8 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:-translate-y-1 cursor-pointer">

                                        <div className="flex items-start justify-between mb-6">
                                            {/* Tech Icon / Placeholder */}
                                            <div className="text-3xl p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl group-hover:scale-105 transition-transform duration-300">
                                                {/* If tech.icon is a string/emoji render it, else if component render it */}
                                                {tech.icon || <Layers className="w-8 h-8 text-neutral-400" />}
                                            </div>

                                            <ArrowRight className="w-5 h-5 text-neutral-300 dark:text-neutral-700 group-hover:text-neutral-900 dark:group-hover:text-white -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                        </div>

                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                                            {tech.name}
                                        </h3>

                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                                            {tech.description}
                                        </p>

                                        {/* Optional: Add a subtle tag if available in data, e.g. Difficulty */}
                                        {/* <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                                Intermediate
                                            </Badge>
                                        </div> */}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}