'use client'

import { motion } from 'framer-motion'
import { CodeBlock } from '@/components/blog/CodeBlock'
import { integratingRazorpayData } from '@/lib/blogdata/integratingrazorpay'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function IntegratingRazorpayBlog() {
    const { metadata, toc, codeSnippets, content } = integratingRazorpayData

    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full bg-white dark:bg-neutral-950 overflow-hidden">
            <section className="relative z-10">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="mb-8"
                            >
                                <div className="flex gap-4">
                                    <Link href="/blogs" className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-full backdrop-blur-sm">
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Blogs
                                    </Link>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-full backdrop-blur-sm">
                                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{metadata.category}</span>
                                    </div>
                                </div>
                                <h1 className="mt-4 text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-neutral-50 dark:to-neutral-400">
                                    {metadata.title}
                                </h1>
                                <p className="mt-3 text-neutral-600 dark:text-neutral-400 max-w-2xl">
                                    {metadata.description}
                                </p>
                            </motion.div>
                            <article className="prose prose-neutral dark:prose-invert max-w-none">
                                <section id="overview" className="scroll-mt-24">
                                    <h2>{content.overview.title}</h2>
                                    {
                                        content.overview.paragraphs.map((p, i) => (
                                            <p key={i}>{p}</p>
                                        ))
                                    }
                                    <ul>
                                        {
                                            content.overview.steps.map((step, i) => (
                                                <li key={i}>{step}</li>
                                            ))
                                        }
                                    </ul>
                                </section>
                                <section id="purchase-ui" className="scroll-mt-24">
                                    <h2>{content.purchaseUI.title}</h2>
                                    {
                                        content.purchaseUI.paragraphs.map((p, i) => (
                                            <p key={i}>{p}</p>
                                        ))
                                    }
                                    <CodeBlock language="typescript" code={codeSnippets.openCheckout} />
                                </section>
                                <section id="create-order" className="scroll-mt-24">
                                    <h2>{content.createOrder.title}</h2>
                                    {
                                        content.createOrder.paragraphs.map((p, i) => (
                                            <p key={i}>{p}</p>
                                        ))
                                    }
                                    <CodeBlock language="typescript" code={codeSnippets.createOrder} />
                                </section>
                                <section id="open-checkout" className="scroll-mt-24">
                                    <h2>{content.openCheckout.title}</h2>
                                    {
                                        content.openCheckout.paragraphs.map((p, i) => (
                                            <p key={i}>{p}</p>
                                        ))
                                    }
                                    <CodeBlock language="typescript" code={codeSnippets.openCheckout} />
                                </section>
                                <section id="verify-payment" className="scroll-mt-24">
                                    <h2>{content.verifyPayment.title}</h2>
                                    {
                                        content.verifyPayment.paragraphs.map((p, i) => (
                                            <p key={i}>{p}</p>
                                        ))
                                    }
                                    <CodeBlock language="typescript" code={codeSnippets.verifyPayment} />
                                </section>
                                <section id="schema" className="scroll-mt-24">
                                    <h2>{content.schema.title}</h2>
                                    {
                                        content.schema.paragraphs.map((p, i) => (
                                            <p key={i}>{p}</p>
                                        ))
                                    }
                                    <CodeBlock language="prisma" code={codeSnippets.schema} />
                                </section>
                                <section id="advanced" className="scroll-mt-24">
                                    <h2>{content.advanced.title}</h2>
                                    {
                                        content.advanced.paragraphs.map((p, i) => (
                                            <p key={i}>{p}</p>
                                        ))
                                    }
                                    <CodeBlock language="typescript" code={codeSnippets.webhook} />
                                </section>
                                <section id="edge-cases" className="scroll-mt-24">
                                    <h2>{content.edgeCases.title}</h2>
                                    {
                                        content.edgeCases.paragraphs.map((p, i) => (
                                            <p key={i}>{p}</p>
                                        ))
                                    }
                                    <ul>
                                        {
                                            content.edgeCases.cases.map((edgeCase, i) => (
                                                <li key={i}>
                                                    <strong>{edgeCase.title}:</strong> {edgeCase.description}
                                                </li>
                                            ))
                                        }
                                    </ul>
                                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                                        {content.edgeCases.note}
                                    </p>
                                </section>
                            </article>
                        </div>
                        <aside className="hidden lg:block">
                            <div className="fixed top-24 right-4 space-y-3">
                                <div className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-2">
                                    On this page
                                </div>
                                <nav className="bg-white dark:bg-neutral-900 shadow-2xl p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                                    <ul className="space-y-2">
                                        {
                                            toc.map((item) => (
                                                <li key={item.id}>
                                                    <a
                                                        href={`#${item.id}`}
                                                        className="text-sm text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                                    >
                                                        {item.label}
                                                    </a>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </nav>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </div>
    )
}
