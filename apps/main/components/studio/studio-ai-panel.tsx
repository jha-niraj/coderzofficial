"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Send, Sparkles, User, Bot, Trash2, Copy, Check
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import toast from "@repo/ui/components/ui/sonner";
import {
	sendChatMessage, clearChatHistory
} from "@/actions/(main)/studios/studio.action";
import { cn } from "@repo/ui/lib/utils";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type {
	StudioChatMessage, StudioAIPanelProps
} from "@/types/studio";

export default function StudioAIPanel({ studioId, initialMessages }: StudioAIPanelProps) {
	const [messages, setMessages] = useState<StudioChatMessage[]>(initialMessages);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Scroll to bottom when messages change
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!input.trim() || isLoading) return;

		const userMessage = input.trim();
		setInput("");
		setIsLoading(true);

		// Add user message optimistically
		const tempUserMessage: StudioChatMessage = {
			id: `temp-${Date.now()}`,
			studioId: studioId,
			role: "user",
			content: userMessage,
			createdAt: new Date(),
		};
		setMessages((prev) => [...prev, tempUserMessage]);

		const result = await sendChatMessage(studioId, userMessage);

		if (result.error) {
			toast.error(result.error);
			// Remove the optimistic message
			setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
		} else if (result.message) {
			// Replace temp message with real one and add assistant response
			setMessages((prev) => [
				...prev.filter((m) => m.id !== tempUserMessage.id),
				{ ...tempUserMessage, id: `user-${Date.now()}` },
				result.message as StudioChatMessage,
			]);
		}

		setIsLoading(false);
		textareaRef.current?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	const handleCopy = async (content: string, id: string) => {
		await navigator.clipboard.writeText(content);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 2000);
	};

	const handleClearHistory = async () => {
		const result = await clearChatHistory(studioId);
		if (result.error) {
			toast.error(result.error);
		} else {
			setMessages([]);
			toast.success("Chat history cleared");
		}
	};

	return (
		<div className="flex flex-col h-full">
			<div className="h-14 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4">
				<div className="flex items-center gap-2">
					<div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
						<Sparkles className="h-4 w-4 text-white" />
					</div>
					<div>
						<h3 className="font-semibold text-neutral-900 dark:text-white text-sm">
							AI Assistant
						</h3>
						<p className="text-xs text-neutral-500">Powered by GPT-4o</p>
					</div>
				</div>
				{
					messages.length > 0 && (
						<Button
							variant="ghost"
							size="icon"
							onClick={handleClearHistory}
							className="h-8 w-8 text-neutral-500 hover:text-red-500"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					)
				}
			</div>
			<ScrollArea ref={scrollRef} className="flex-1 p-4">
				{
					messages.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-center py-8">
							<div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
								<Sparkles className="h-8 w-8 text-purple-500" />
							</div>
							<h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
								How can I help you?
							</h4>
							<p className="text-sm text-neutral-500 max-w-[250px]">
								Ask me anything about your notes, or let me help you understand concepts better.
							</p>
							<div className="mt-6 space-y-2 w-full max-w-[280px]">
								{
									[
										"Explain this code to me",
										"Create a study plan",
										"What are the key concepts?",
									].map((suggestion) => (
										<Button
											key={suggestion}
											variant="outline"
											className="w-full text-left justify-start text-sm"
											onClick={() => setInput(suggestion)}
										>
											{suggestion}
										</Button>
									))
								}
							</div>
						</div>
					) : (
						<div className="space-y-4">
							<AnimatePresence mode="popLayout">
								{
									messages.map((message) => (
										<motion.div
											key={message.id}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											className={cn(
												"flex gap-3",
												message.role === "user" ? "justify-end" : "justify-start"
											)}
										>
											{
												message.role === "assistant" && (
													<div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
														<Bot className="h-4 w-4 text-white" />
													</div>
												)
											}
											<div
												className={cn(
													"group relative max-w-[85%] rounded-2xl px-4 py-3",
													message.role === "user"
														? "bg-primary text-primary-foreground"
														: "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
												)}
											>
												{
													message.role === "assistant" ? (
														<div className="prose prose-sm dark:prose-invert max-w-none">
															<ReactMarkdown
																components={{
																	code({ className, children, ...props }) {
																		const match = /language-(\w+)/.exec(className || "");
																		const inline = !match;
																		return inline ? (
																			<code
																				className="bg-neutral-200 dark:bg-neutral-700 px-1 py-0.5 rounded text-sm"
																				{...props}
																			>
																				{children}
																			</code>
																		) : (
																			<SyntaxHighlighter
																				style={oneDark}
																				language={match[1]}
																				PreTag="div"
																				className="rounded-lg !mt-2 !mb-2"
																			>
																				{String(children).replace(/\n$/, "")}
																			</SyntaxHighlighter>
																		);
																	},
																}
																}
															>
																{message.content}
															</ReactMarkdown>
														</div>
													) : (
														<p className="text-sm whitespace-pre-wrap">{message.content}</p>
													)
												}
												<Button
													variant="ghost"
													size="icon"
													className={cn(
														"absolute -bottom-8 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
														message.role === "user" && "hidden"
													)}
													onClick={() => handleCopy(message.content, message.id)}
												>
													{
														copiedId === message.id ? (
															<Check className="h-3 w-3" />
														) : (
															<Copy className="h-3 w-3" />
														)
													}
												</Button>
											</div>
											{
												message.role === "user" && (
													<div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0">
														<User className="h-4 w-4" />
													</div>
												)
											}
										</motion.div>
									))
								}
							</AnimatePresence>
							{
								isLoading && (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										className="flex gap-3"
									>
										<div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
											<Bot className="h-4 w-4 text-white" />
										</div>
										<div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-4 py-3">
											<div className="flex items-center gap-2">
												<motion.div
													className="h-2 w-2 rounded-full bg-purple-500"
													animate={{ scale: [1, 1.2, 1] }}
													transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
												/>
												<motion.div
													className="h-2 w-2 rounded-full bg-purple-500"
													animate={{ scale: [1, 1.2, 1] }}
													transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
												/>
												<motion.div
													className="h-2 w-2 rounded-full bg-purple-500"
													animate={{ scale: [1, 1.2, 1] }}
													transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
												/>
											</div>
										</div>
									</motion.div>
								)
							}
						</div>
					)
				}
			</ScrollArea>
			<div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
				<form onSubmit={handleSubmit} className="relative">
					<Textarea
						ref={textareaRef}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Ask me anything..."
						className="min-h-[44px] max-h-[120px] pr-12 resize-none bg-neutral-100 dark:bg-neutral-800 border-0"
						rows={1}
					/>
					<Button
						type="submit"
						size="icon"
						disabled={!input.trim() || isLoading}
						className="absolute right-2 bottom-2 h-8 w-8"
					>
						<Send className="h-4 w-4" />
					</Button>
				</form>
			</div>
		</div>
	);
}