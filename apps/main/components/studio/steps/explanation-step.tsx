"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";
import type { StudioStep, ExplanationMetadata } from "@/types/studios";

interface ExplanationStepProps {
	step: StudioStep;
}

export function ExplanationStep({ step }: ExplanationStepProps) {
	const metadata = (step.metadata || {}) as Partial<ExplanationMetadata>;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="py-8"
		>
			<div className="prose prose-neutral dark:prose-invert max-w-none">
				<ReactMarkdown
					components={{
						code({ className, children, ...props }) {
							const match = /language-(\w+)/.exec(className || "");
							const inline = !match;

							return inline ? (
								<code
									className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-sm font-mono text-purple-600 dark:text-purple-400"
									{...props}
								>
									{children}
								</code>
							) : (
								<SyntaxHighlighter
									style={oneDark}
									language={match[1]}
									PreTag="div"
									className="rounded-xl !my-6"
								>
									{String(children).replace(/\n$/, "")}
								</SyntaxHighlighter>
							);
						},
						h1: ({ children }) => (
							<h1 className="text-3xl font-bold text-neutral-900 dark:text-white mt-8 mb-4">
								{children}
							</h1>
						),
						h2: ({ children }) => (
							<h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mt-6 mb-3">
								{children}
							</h2>
						),
						h3: ({ children }) => (
							<h3 className="text-xl font-medium text-neutral-900 dark:text-white mt-4 mb-2">
								{children}
							</h3>
						),
						p: ({ children }) => (
							<p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
								{children}
							</p>
						),
						ul: ({ children }) => (
							<ul className="list-disc list-inside space-y-2 mb-4 text-neutral-700 dark:text-neutral-300">
								{children}
							</ul>
						),
						ol: ({ children }) => (
							<ol className="list-decimal list-inside space-y-2 mb-4 text-neutral-700 dark:text-neutral-300">
								{children}
							</ol>
						),
						blockquote: ({ children }) => (
							<blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-4 italic text-neutral-600 dark:text-neutral-400 bg-purple-50 dark:bg-purple-950/20 rounded-r">
								{children}
							</blockquote>
						),
						a: ({ children, href }) => (
							<a
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								className="text-purple-600 dark:text-purple-400 hover:underline"
							>
								{children}
							</a>
						),
					}}
				>
					{step.content || ""}
				</ReactMarkdown>
			</div>

			{step.source === "AI" && metadata.prompt && (
				<div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
					<p className="text-xs text-neutral-500 dark:text-neutral-400">
						Generated from: &quot;{metadata.prompt}&quot;
					</p>
				</div>
			)}
		</motion.div>
	);
}