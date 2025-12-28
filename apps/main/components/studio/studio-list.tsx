"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
	Plus, FileText, BookOpen, Code, MoreVertical, Trash2,
	Edit, Globe, Lock, Clock, Sparkles, Users
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@repo/ui/components/ui/button";
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import {
	DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@repo/ui/components/ui/dropdown-menu";
import {
	Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
	DialogTitle, DialogTrigger
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select";
import { Switch } from "@repo/ui/components/ui/switch";
import { Badge } from "@repo/ui/components/ui/badge";
import {
	getStudios, createStudio, deleteStudio
} from "@/actions/(main)/studios/studio.action";
import toast from "@repo/ui/components/ui/sonner";
import type {
	StudioListItem, StudioCategory
} from "@/types/studio";
import { STUDIO_CATEGORIES, getCategoryColor } from "@/types/studio";

export default function StudioList() {
	const router = useRouter();
	const [studios, setStudios] = useState<StudioListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [creating, setCreating] = useState(false);
	const [formData, setFormData] = useState<{
		title: string;
		description: string;
		category: StudioCategory;
		isPublic: boolean;
	}>({
		title: "",
		description: "",
		category: "PROGRAMMING",
		isPublic: false,
	});

	useEffect(() => {
		loadStudios();
	}, []);

	const loadStudios = async () => {
		setLoading(true);
		const result = await getStudios();
		if (result.studios) {
			setStudios(result.studios as unknown as StudioListItem[]);
		}
		setLoading(false);
	};

	const handleCreateStudio = async () => {
		if (!formData.title.trim()) {
			toast.error("Please enter a title");
			return;
		}

		setCreating(true);
		const result = await createStudio({
			title: formData.title,
			description: formData.description || undefined,
			category: formData.category,
			visibility: formData.isPublic ? "PUBLIC" : "PRIVATE",
		});

		if (result.error) {
			toast.error(result.error);
		} else if (result.studio) {
			toast.success("Studio created successfully!");
			setCreateDialogOpen(false);
			setFormData({ title: "", description: "", category: "PROGRAMMING", isPublic: false });
			router.push(`/studio/${result.studio.id}`);
		}
		setCreating(false);
	};

	const handleDeleteStudio = async (studioId: string) => {
		const result = await deleteStudio(studioId);
		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success("Studio deleted successfully!");
			loadStudios();
		}
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	};

	if (loading) {
		return <StudioListSkeleton />;
	}

	return (
		<div>
			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogTrigger asChild>
					<Button
						className="mb-6 gap-2"
						size="lg"
					>
						<Plus className="h-5 w-5" />
						Create New Studio
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[500px] bg-white dark:bg-neutral-900">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Sparkles className="h-5 w-5 text-primary" />
							Create New Studio
						</DialogTitle>
						<DialogDescription>
							Create a new AI-powered learning workspace
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								placeholder="e.g., JavaScript Fundamentals"
								value={formData.title}
								onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description (optional)</Label>
							<Textarea
								id="description"
								placeholder="What will you learn in this studio?"
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="category">Category</Label>
							<Select
								value={formData.category}
								onValueChange={(value) => setFormData({ ...formData, category: value as StudioCategory })}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a category" />
								</SelectTrigger>
								<SelectContent>
									{
										STUDIO_CATEGORIES.map((cat) => (
											<SelectItem key={cat.value} value={cat.value}>
												{cat.label}
											</SelectItem>
										))
									}
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center justify-between rounded-lg border p-4 dark:border-neutral-800">
							<div className="space-y-0.5">
								<Label htmlFor="public" className="text-sm font-medium">
									Make Public
								</Label>
								<p className="text-sm text-neutral-500 dark:text-neutral-400">
									Allow others to view this studio
								</p>
							</div>
							<Switch
								id="public"
								checked={formData.isPublic}
								onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleCreateStudio} disabled={creating}>
							{
								creating ? (
									<motion.div
										className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
										animate={{ rotate: 360 }}
										transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
									/>
								) : (
									"Create Studio"
								)
							}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			{
				studios.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex flex-col items-center justify-center py-20 text-center"
					>
						<div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
							<FileText className="h-10 w-10 text-primary" />
						</div>
						<h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
							No studios yet
						</h3>
						<p className="text-neutral-600 dark:text-neutral-400 max-w-md mb-6">
							Create your first studio to start learning with AI-powered quizzes, flashcards, and more.
						</p>
						<Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
							<Plus className="h-4 w-4" />
							Create Your First Studio
						</Button>
					</motion.div>
				) : (
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
					>
						{
							studios.map((studio) => (
								<motion.div key={studio.id} variants={itemVariants}>
									<Card
										className="group cursor-pointer bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all hover:shadow-lg"
										onClick={() => router.push(`/studio/${studio.id}`)}
									>
										<CardHeader className="pb-3">
											<div className="flex items-start justify-between">
												<div className="flex-1 min-w-0">
													<CardTitle className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
														{studio.title}
													</CardTitle>
													<CardDescription className="mt-1 line-clamp-2">
														{studio.description || "No description"}
													</CardDescription>
												</div>
												<DropdownMenu>
													<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
														<Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
															<MoreVertical className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={(e) => {
															e.stopPropagation();
															router.push(`/studio/${studio.id}`);
														}}>
															<Edit className="h-4 w-4 mr-2" />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															className="text-red-600 dark:text-red-400"
															onClick={(e) => {
																e.stopPropagation();
																handleDeleteStudio(studio.id);
															}}
														>
															<Trash2 className="h-4 w-4 mr-2" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</CardHeader>
										<CardContent>
											<div className="flex flex-wrap gap-2 mb-4">
												<Badge className={getCategoryColor(studio.category)}>
													{STUDIO_CATEGORIES.find((c) => c.value === studio.category)?.label || studio.category}
												</Badge>
												<Badge variant="outline" className="gap-1">
													{
														studio.visibility === "PUBLIC" ? (
															<>
																<Globe className="h-3 w-3" />
																Public
															</>
														) : studio.visibility === "COMMUNITY" ? (
															<>
																<Users className="h-3 w-3" />
																Community
															</>
														) : (
															<>
																<Lock className="h-3 w-3" />
																Private
															</>
														)
													}
												</Badge>
											</div>
											<div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
												{
													studio._count.quizzes > 0 && (
														<div className="flex items-center gap-1">
															<BookOpen className="h-4 w-4" />
															{studio._count.quizzes} Quiz{studio._count.quizzes !== 1 && "zes"}
														</div>
													)
												}
												{
													studio._count.flashcardDecks > 0 && (
														<div className="flex items-center gap-1">
															<FileText className="h-4 w-4" />
															{studio._count.flashcardDecks} Deck{studio._count.flashcardDecks !== 1 && "s"}
														</div>
													)
												}
												{
													studio._count.codeBlocks > 0 && (
														<div className="flex items-center gap-1">
															<Code className="h-4 w-4" />
															{studio._count.codeBlocks} Code
														</div>
													)
												}
											</div>
											<div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-500 mt-4">
												<Clock className="h-3 w-3" />
												Updated {format(new Date(studio.updatedAt), "MMM d, yyyy")}
											</div>
										</CardContent>
									</Card>
								</motion.div>
							))
						}
					</motion.div>
				)
			}
		</div>
	);
}

function StudioListSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{
				[...Array(6)].map((_, i) => (
					<div
						key={i}
						className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 animate-pulse"
					>
						<div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded mb-3" />
						<div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
						<div className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded mb-4" />
						<div className="flex gap-2">
							<div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
							<div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
						</div>
					</div>
				))
			}
		</div>
	);
}