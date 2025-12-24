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
	ConceptCategory, ConceptDifficulty
} from "@prisma/client";
import { toggleConceptBookmark } from "@/actions/(main)/concepts/concept.action";
import { toast } from "sonner";

interface BookmarkItem {
	id: string;
	createdAt: Date;
	concept: {
		id: string;
		title: string;
		slug: string;
		description: string;
		category: ConceptCategory;
		difficulty: ConceptDifficulty;
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

const categoryStyles: Record<ConceptCategory, { color: string; bg: string }> = {
	WEB_DEVELOPMENT: { color: "text-blue-500", bg: "bg-blue-500/10" },
	MOBILE_DEVELOPMENT: { color: "text-purple-500", bg: "bg-purple-500/10" },
	DATA_STRUCTURES: { color: "text-green-500", bg: "bg-green-500/10" },
	ALGORITHMS: { color: "text-pink-500", bg: "bg-pink-500/10" },
	SYSTEM_DESIGN: { color: "text-indigo-500", bg: "bg-indigo-500/10" },
	DATABASE: { color: "text-amber-500", bg: "bg-amber-500/10" },
	DEVOPS: { color: "text-cyan-500", bg: "bg-cyan-500/10" },
	CLOUD_COMPUTING: { color: "text-sky-500", bg: "bg-sky-500/10" },
	MACHINE_LEARNING: { color: "text-orange-500", bg: "bg-orange-500/10" },
	ARTIFICIAL_INTELLIGENCE: { color: "text-fuchsia-500", bg: "bg-fuchsia-500/10" },
	CYBERSECURITY: { color: "text-red-500", bg: "bg-red-500/10" },
	BLOCKCHAIN: { color: "text-yellow-500", bg: "bg-yellow-500/10" },
	PROGRAMMING_FUNDAMENTALS: { color: "text-emerald-500", bg: "bg-emerald-500/10" },
	SOFTWARE_ARCHITECTURE: { color: "text-violet-500", bg: "bg-violet-500/10" },
	API_DESIGN: { color: "text-teal-500", bg: "bg-teal-500/10" },
	TESTING: { color: "text-lime-500", bg: "bg-lime-500/10" },
	VERSION_CONTROL: { color: "text-gray-500", bg: "bg-gray-500/10" },
	UI_UX_DESIGN: { color: "text-rose-500", bg: "bg-rose-500/10" },
	GAME_DEVELOPMENT: { color: "text-purple-600", bg: "bg-purple-600/10" },
	NETWORKING: { color: "text-blue-600", bg: "bg-blue-600/10" },
	OPERATING_SYSTEMS: { color: "text-slate-500", bg: "bg-slate-500/10" },
	CUSTOM: { color: "text-gray-400", bg: "bg-gray-400/10" },
};

const difficultyStyles: Record<ConceptDifficulty, { label: string; color: string }> = {
	BEGINNER: { label: "Beginner", color: "text-green-500 bg-green-500/10" },
	INTERMEDIATE: { label: "Intermediate", color: "text-amber-500 bg-amber-500/10" },
	ADVANCED: { label: "Advanced", color: "text-orange-500 bg-orange-500/10" },
	EXPERT: { label: "Expert", color: "text-red-500 bg-red-500/10" },
};

export function BookmarksGrid({ bookmarks: initialBookmarks }: BookmarksGridProps) {
	const [bookmarks, setBookmarks] = useState(initialBookmarks);
	const [removingId, setRemovingId] = useState<string | null>(null);

	const handleRemoveBookmark = async (conceptId: string) => {
		setRemovingId(conceptId);
		try {
			const result = await toggleConceptBookmark(conceptId);
			if ('bookmarked' in result) {
				setBookmarks((prev) => prev.filter((b) => b.concept.id !== conceptId));
				toast.success("Bookmark removed");
			} else {
				toast.error(result.error || "Failed to remove bookmark");
			}
		} catch (error) {
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
					Save concepts you want to learn or revisit later. Click the bookmark
					icon on any concept to add it here.
				</p>
				<Button asChild>
					<Link href="/concepts/browse">
						Browse Concepts
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
						const concept = bookmark.concept;
						const categoryStyle = categoryStyles[concept.category];
						const difficultyStyle = difficultyStyles[concept.difficulty];
						const isRemoving = removingId === concept.id;

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
											<Badge className={`${categoryStyle.bg} ${categoryStyle.color} border-0`}>
												{concept.category.replace(/_/g, " ")}
											</Badge>
											<Badge className={difficultyStyle.color}>
												{difficultyStyle.label}
											</Badge>
										</div>
										<Link href={`/concepts/${concept.slug}`} className="flex-1">
											<h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
												{concept.title}
											</h3>
											<p className="text-sm text-muted-foreground line-clamp-2 mb-4">
												{concept.description}
											</p>
										</Link>
										<div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
											<span className="flex items-center gap-1">
												<Layers className="h-4 w-4" />
												{concept._count.steps} steps
											</span>
											<span className="flex items-center gap-1">
												<Heart className="h-4 w-4" />
												{concept._count.likes}
											</span>
											<span className="flex items-center gap-1">
												<Eye className="h-4 w-4" />
												{concept.viewCount}
											</span>
											{
												concept.estimatedTime && (
													<span className="flex items-center gap-1">
														<Clock className="h-4 w-4" />
														{concept.estimatedTime}m
													</span>
												)
											}
										</div>
										<div className="flex items-center gap-2">
											<Button asChild className="flex-1">
												<Link href={`/concepts/${concept.slug}`}>
													Start Learning
													<ChevronRight className="ml-2 h-4 w-4" />
												</Link>
											</Button>
											<Button
												variant="outline"
												size="icon"
												onClick={() => handleRemoveBookmark(concept.id)}
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