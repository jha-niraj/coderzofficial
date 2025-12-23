"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    ArrowRight, Lightbulb, Sparkles, Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { categories, type Category } from './data/categories'
import { useState } from 'react'
import { SubmitProjectIdeaSheet } from '@/components/projects/submit-project-idea-sheet'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '@/components/ui/sheet'

export default function ProjectIdeasPage() {
    const [submitSheetOpen, setSubmitSheetOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [techSheetOpen, setTechSheetOpen] = useState(false)

    const handleCategoryClick = (category: Category) => {
        setSelectedCategory(category)
        setTechSheetOpen(true)
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans selection:bg-neutral-100 dark:selection:bg-neutral-800">
            <div className="fixed inset-0 z-0 h-full w-full bg-white dark:bg-neutral-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-20 max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 text-xs font-medium mb-6">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Curated Development Paths</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6">
                        Build your portfolio with <br />
                        <span className="text-neutral-500 dark:text-neutral-500">real-world projects.</span>
                    </h1>
                    <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-8">
                        Stuck in tutorial hell? Browse curated project ideas ranging from beginner to advanced.
                        Pick a category, choose a tech stack, and start coding.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Button
                            onClick={() => setSubmitSheetOpen(true)}
                            className="rounded-lg h-12 px-6 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all font-medium"
                        >
                            <Lightbulb className="w-4 h-4 mr-2" />
                            Submit an Idea
                        </Button>
                    </div>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {
                        categories.map((category, index) => {
                            const Icon = category.icon

                            return (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div
                                        onClick={() => handleCategoryClick(category)}
                                        className="group h-full bg-white dark:bg-neutral-900 shadow-2xl rounded-xl p-8 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between mb-6">
                                                <div className={`p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors duration-300`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 border border-neutral-100 dark:border-neutral-800 px-2 py-1 rounded-md">
                                                    {category.technologies.length} Stacks
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                                                {category.name}
                                            </h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                                                {category.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                                            Explore Projects
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })
                    }
                </div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-24 text-center"
                >
                    <div className="max-w-2xl mx-auto p-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/50">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                            Missing a category?
                        </h3>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-sm">
                            We are constantly adding new technologies and stacks. If you have a specific request, let us know.
                        </p>
                        <Button
                            onClick={() => setSubmitSheetOpen(true)}
                            variant="outline"
                            className="h-10 border-neutral-200 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800"
                        >
                            Request Category
                        </Button>
                    </div>
                </motion.div>
            </div>
            <Sheet open={techSheetOpen} onOpenChange={setTechSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                    {
                        selectedCategory && (
                            <>
                                <SheetHeader className="mb-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
                                            {selectedCategory.icon && <selectedCategory.icon className="w-7 h-7 text-neutral-900 dark:text-white" />}
                                        </div>
                                    </div>
                                    <SheetTitle className="text-left">{selectedCategory.name}</SheetTitle>
                                    <SheetDescription className="text-left">
                                        {selectedCategory.description}
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Layers className="w-4 h-4 text-neutral-500" />
                                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            Choose a Technology ({selectedCategory.technologies.length})
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {
                                            selectedCategory.technologies.map((tech, index) => (
                                                <motion.div
                                                    key={tech.id}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <Link
                                                        href={`/projects/ideas/${selectedCategory.id}/${tech.id}`}
                                                        onClick={() => setTechSheetOpen(false)}
                                                    >
                                                        <div className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-lg transition-all duration-200 cursor-pointer">
                                                            <div className="flex items-start gap-4">
                                                                <div className="text-3xl flex-shrink-0 p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg group-hover:scale-105 transition-transform">
                                                                    {tech.icon || <Layers className="w-6 h-6 text-neutral-400" />}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h4 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                            {tech.name}
                                                                        </h4>
                                                                        <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
                                                                    </div>
                                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                                                                        {tech.description}
                                                                    </p>
                                                                    {
                                                                        tech.projectCount && (
                                                                            <div className="mt-3 text-xs text-neutral-500">
                                                                                {tech.projectCount} projects available
                                                                            </div>
                                                                        )
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </>
                        )
                    }
                </SheetContent>
            </Sheet>
            <SubmitProjectIdeaSheet
                open={submitSheetOpen}
                onOpenChange={setSubmitSheetOpen}
            />
        </div>
    )
}