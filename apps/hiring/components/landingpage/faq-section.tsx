"use client"

import { 
    Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from "@repo/ui/components/ui/accordion"

const faqs = [
    { q: "How does the Open Source Sandbox work?", a: "You link a repository or an issue. Candidates fork the repo, implement the feature, and submit a PR. Our bot analyzes the PR for code quality, tests, and best practices before you even review it." },
    { q: "Can we customize the AI Interviewer?", a: "Yes. You can upload your own technical rubrics, specific API documentation, or system design constraints. The AI will strictly adhere to your evaluation criteria." },
    { q: "Is there plagiarism detection?", a: "Our Assignment Studio includes strict environment controls. We track copy-paste events, browser focus loss, and cross-reference code against public repositories." },
    { q: "Do you integrate with Greenhouse/Lever?", a: "Enterprise plans include bi-directional sync with all major ATS providers. Candidate scores and code reports appear directly in your ATS." },
]

export default function FaqSection() {
    return (
        <section id="faq" className="py-32 bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2 block">
                        Documentation
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-neutral-900 dark:text-white">
                        Technical Queries
                    </h2>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {
                        faqs.map((faq, i) => (
                            <AccordionItem
                                key={i}
                                value={`item-${i}`}
                                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-2"
                            >
                                <AccordionTrigger className="text-left text-neutral-900 dark:text-white hover:no-underline px-4 py-6 font-bold">
                                    {faq.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-neutral-500 dark:text-neutral-400 px-4 pb-6 leading-relaxed">
                                    {faq.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))
                    }
                </Accordion>
            </div>
        </section>
    )
}