"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
    return (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const inline = !match;
                        return inline ? (
                            <code
                                className="bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded text-sm font-mono"
                                {...props}
                            >
                                {children}
                            </code>
                        ) : (
                            <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-lg !mt-3 !mb-3 text-sm"
                            >
                                {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                        );
                    },
                    h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mt-6 mb-4 text-neutral-900 dark:text-white">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-xl font-semibold mt-5 mb-3 text-neutral-900 dark:text-white">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-lg font-semibold mt-4 mb-2 text-neutral-900 dark:text-white">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-base font-semibold mt-3 mb-2 text-neutral-900 dark:text-white">
                            {children}
                        </h4>
                    ),
                    p: ({ children }) => (
                        <p className="mb-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                            {children}
                        </p>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-4 space-y-2 text-neutral-700 dark:text-neutral-300 ml-2">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-2 text-neutral-700 dark:text-neutral-300 ml-2">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="ml-2 leading-relaxed">
                            {children}
                        </li>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg text-neutral-700 dark:text-neutral-300 italic">
                            {children}
                        </blockquote>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-semibold text-neutral-900 dark:text-white">
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-neutral-700 dark:text-neutral-300">
                            {children}
                        </em>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2"
                        >
                            {children}
                        </a>
                    ),
                    hr: () => (
                        <hr className="my-6 border-neutral-200 dark:border-neutral-800" />
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
                            <table className="min-w-full border-collapse border border-neutral-200 dark:border-neutral-700 rounded-lg">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-neutral-100 dark:bg-neutral-800">
                            {children}
                        </thead>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-2 text-left font-semibold text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-2 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                            {children}
                        </td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

export default MarkdownRenderer;