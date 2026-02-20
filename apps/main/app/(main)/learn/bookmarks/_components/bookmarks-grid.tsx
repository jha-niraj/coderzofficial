"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	ChevronRight, Clock, Eye, Heart, Bookmark, BookmarkX, Layers
} from "lucide-react";
import Link from "next/link";
import {
	LearnDifficulty
} from "@repo/prisma/client";
import { toggleLearnBookmark } from "@/actions/(main)/learn/learn.action";
import toast from "@repo/ui/components/ui/sonner";

interface BookmarkItem {
	id: string;
	createdAt: Date;
	learn: {
		id: string;
		title: string;
		slug: string;
		description: string;
		mainCategory: { name: string } | null;
		difficulty: LearnDifficulty;
		estimatedTime: number | null;
		viewCount: number;
		_count: {
			steps: number;
			likes: number;
		};
	};
}

interface BookmarksGridProps {
	bookmarks: BookmarkItem[];
}

// Helper to get a consistent color from a string
function getCategoryColor(category: string) {
	const colors = [
		"text-blue-500 bg-blue-500/10",
		"text-purple-500 bg-purple-500/10",
		"text-green-500 bg-green-500/10",
		"text-pink-500 bg-pink-500/10",
		"text-indigo-500 bg-indigo-500/10",
		"text-amber-500 bg-amber-500/10",
		"text-cyan-500 bg-cyan-500/10",
		"text-sky-500 bg-sky-500/10",
		"text-orange-500 bg-orange-500/10",
		"text-fuchsia-500 bg-fuchsia-500/10",
		"text-red-500 bg-red-500/10",
		"text-emerald-500 bg-emerald-500/10",
		"text-violet-500 bg-violet-500/10",
		"text-teal-500 bg-teal-500/10",
		"text-lime-500 bg-lime-500/10",
		"text-rose-500 bg-rose-500/10",
	];

	let hash = 0;
	for (let i = 0; i < category.length; i++) {
		hash = category.charCodeAt(i) + ((hash << 5) - hash);
	}

	const index = Math.abs(hash) % colors.length;
	return colors[index];
}

const difficultyStyles: Record<LearnDifficulty, { label: string; color: string }> = {
	BEGINNER: { label: "Beginner", color: "text-green-500 bg-green-500/10" },
	INTERMEDIATE: { label: "Intermediate", color: "text-amber-500 bg-amber-500/10" },
	ADVANCED: { label: "Advanced", color: "text-orange-500 bg-orange-500/10" },
	EXPERT: { label: "Expert", color: "text-red-500 bg-red-500/10" },
};

export function BookmarksGrid({ bookmarks: initialBookmarks }: BookmarksGridProps) {
	const [bookmarks, setBookmarks] = useState(initialBookmarks);
	const [removingId, setRemovingId] = useState<string | null>(null);

	const handleRemoveBookmark = async (learnId: string) => {
		setRemovingId(learnId);
		try {
			const result = await toggleLearnBookmark(learnId);
			if ('bookmarked' in result) {
				setBookmarks((prev) => prev.filter((b) => b.learn.id !== learnId));
				toast.success("Bookmark removed");
			} else {
				toast.error(result.error || "Failed to remove bookmark");
			}
		} catch (error) {
			console.log("Error occurred while removing bookmark: " + error);
			toast.error("Something went wrong");
		} finally {
			setRemovingId(null);
		}
	};

	if (bookmarks.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="text-center py-20"
			>
				<div className="h-20 w-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-6">
					<Bookmark className="h-10 w-10 text-muted-foreground" />
				</div>
				<h3 className="text-xl font-semibold mb-2">No Bookmarks Yet</h3>
				<p className="text-muted-foreground mb-6 max-w-md mx-auto">
					Save Learns you want to learn or revisit later. Click the bookmark
					icon on any Learn to add it here.
				</p>
				<Button asChild>
					<Link href="/Learns/browse">
						Browse Learns
						<ChevronRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>
			</motion.div>
		);
	}

	return (
		<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
			<AnimatePresence mode="popLayout">
				{
					bookmarks.map((bookmark, index) => {
						const learn = bookmark.learn;
						const categoryName = learn.mainCategory?.name || "General";
						const categoryClass = getCategoryColor(categoryName);
						const difficultyStyle = difficultyStyles[learn.difficulty as keyof typeof difficultyStyles] || { label: learn.difficulty, color: "text-gray-500 bg-gray-500/10" };
						const isRemoving = removingId === learn.id;

						return (
							<motion.div
								key={bookmark.id}
								layout
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								transition={{ duration: 0.3, delay: index * 0.05 }}
							>
								<Card className="group h-full hover:shadow-lg transition-all duration-300 relative overflow-hidden">
									<CardContent className="p-6 flex flex-col h-full">
										<div className="flex items-center gap-2 flex-wrap mb-4">
											<Badge className={`${categoryClass} border-0`}>
												{categoryName}
											</Badge>
											<Badge className={difficultyStyle.color}>
												{difficultyStyle.label}
											</Badge>
										</div>
										<Link href={`/learn/${learn.slug}`} className="flex-1">
											<h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
												{learn.title}
											</h3>
											<p className="text-sm text-muted-foreground line-clamp-2 mb-4">
												{learn.description}
											</p>
										</Link>
										<div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
											<span className="flex items-center gap-1">
												<Layers className="h-4 w-4" />
												{learn._count.steps} steps
											</span>
											<span className="flex items-center gap-1">
												<Heart className="h-4 w-4" />
												{learn._count.likes}
											</span>
											<span className="flex items-center gap-1">
												<Eye className="h-4 w-4" />
												{(learn as { viewCount?: number }).viewCount ?? 0}
											</span>
											{
												learn.estimatedTime && (
													<span className="flex items-center gap-1">
														<Clock className="h-4 w-4" />
														{learn.estimatedTime}m
													</span>
												)
											}
										</div>
										<div className="flex items-center gap-2">
											<Button asChild className="flex-1">
												<Link href={`/learn/${learn.slug}`}>
													Start Learning
													<ChevronRight className="ml-2 h-4 w-4" />
												</Link>
											</Button>
											<Button
												variant="outline"
												size="icon"
												onClick={() => handleRemoveBookmark(learn.id)}
												disabled={isRemoving}
												className="shrink-0"
											>
												<BookmarkX className={`h-4 w-4 ${isRemoving ? "animate-pulse" : ""}`} />
											</Button>
										</div>
									</CardContent>
									<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
										<Badge variant="secondary" className="text-xs">
											Saved {new Date(bookmark.createdAt).toLocaleDateString()}
										</Badge>
									</div>
								</Card>
							</motion.div>
						);
					})
				}
			</AnimatePresence>
		</div>
	);
}