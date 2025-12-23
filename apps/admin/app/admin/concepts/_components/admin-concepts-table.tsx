"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
	ConceptCategory, ConceptDifficulty, ConceptStatus
} from "@prisma/client";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
	DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
	DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Avatar, AvatarFallback, AvatarImage
} from "@/components/ui/avatar";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
	AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
	AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
	MoreHorizontal, Search, Eye, Edit, Trash2, CheckCircle, XCircle, Archive,
	Heart, Bookmark, Layers
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
	publishConcept, unpublishConcept, archiveConcept, deleteConcept
} from "@/actions/(main)/concepts/concept.action";

interface ConceptItem {
	id: string;
	title: string;
	slug: string;
	category: ConceptCategory;
	difficulty: ConceptDifficulty;
	status: ConceptStatus;
	viewCount: number;
	createdAt: Date;
	updatedAt: Date;
	creator: {
		id: string;
		name: string | null;
		image: string | null;
	};
	_count: {
		steps: number;
		likes: number;
		bookmarks: number;
		views: number;
	};
}

interface AdminConceptsTableProps {
	concepts: ConceptItem[];
}

const statusStyles: Record<ConceptStatus, { label: string; color: string }> = {
	DRAFT: { label: "Draft", color: "bg-gray-500/10 text-gray-500" },
	PUBLISHED: { label: "Published", color: "bg-green-500/10 text-green-500" },
	ARCHIVED: { label: "Archived", color: "bg-amber-500/10 text-amber-500" },
};

const difficultyStyles: Record<ConceptDifficulty, { label: string; color: string }> = {
	BEGINNER: { label: "Beginner", color: "bg-green-500/10 text-green-500" },
	INTERMEDIATE: { label: "Intermediate", color: "bg-amber-500/10 text-amber-500" },
	ADVANCED: { label: "Advanced", color: "bg-orange-500/10 text-orange-500" },
	EXPERT: { label: "Expert", color: "bg-red-500/10 text-red-500" },
};

export function AdminConceptsTable({ concepts: initialConcepts }: AdminConceptsTableProps) {
	const [concepts, setConcepts] = useState(initialConcepts);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [conceptToDelete, setConceptToDelete] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState<string | null>(null);

	const filteredConcepts = concepts.filter((concept) => {
		const matchesSearch = concept.title.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = statusFilter === "all" || concept.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const handlePublish = async (conceptId: string) => {
		setIsProcessing(conceptId);
		try {
			const result = await publishConcept(conceptId);
			if ('concept' in result) {
				setConcepts((prev) =>
					prev.map((c) =>
						c.id === conceptId ? { ...c, status: "PUBLISHED" as ConceptStatus } : c
					)
				);
				toast.success("Concept published successfully");
			} else {
				toast.error(result.error || "Failed to publish");
			}
		} catch (error) {
			toast.error("Something went wrong");
		} finally {
			setIsProcessing(null);
		}
	};

	const handleUnpublish = async (conceptId: string) => {
		setIsProcessing(conceptId);
		try {
			const result = await unpublishConcept(conceptId);
			if ('concept' in result) {
				setConcepts((prev) =>
					prev.map((c) =>
						c.id === conceptId ? { ...c, status: "DRAFT" as ConceptStatus } : c
					)
				);
				toast.success("Concept unpublished");
			} else {
				toast.error(result.error || "Failed to unpublish");
			}
		} catch (error) {
			toast.error("Something went wrong");
		} finally {
			setIsProcessing(null);
		}
	};

	const handleArchive = async (conceptId: string) => {
		setIsProcessing(conceptId);
		try {
			const result = await archiveConcept(conceptId);
			if ('concept' in result) {
				setConcepts((prev) =>
					prev.map((c) =>
						c.id === conceptId ? { ...c, status: "ARCHIVED" as ConceptStatus } : c
					)
				);
				toast.success("Concept archived");
			} else {
				toast.error(result.error || "Failed to archive");
			}
		} catch (error) {
			toast.error("Something went wrong");
		} finally {
			setIsProcessing(null);
		}
	};

	const handleDelete = async () => {
		if (!conceptToDelete) return;

		setIsProcessing(conceptToDelete);
		try {
			const result = await deleteConcept(conceptToDelete);
			if (result.success) {
				setConcepts((prev) => prev.filter((c) => c.id !== conceptToDelete));
				toast.success("Concept deleted");
			} else {
				toast.error(result.error || "Failed to delete");
			}
		} catch (error) {
			toast.error("Something went wrong");
		} finally {
			setIsProcessing(null);
			setDeleteDialogOpen(false);
			setConceptToDelete(null);
		}
	};

	return (
		<div className="space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex flex-col sm:flex-row gap-4"
			>
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search concepts..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						<SelectItem value="DRAFT">Draft</SelectItem>
						<SelectItem value="PUBLISHED">Published</SelectItem>
						<SelectItem value="ARCHIVED">Archived</SelectItem>
					</SelectContent>
				</Select>
			</motion.div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="grid grid-cols-2 md:grid-cols-4 gap-4"
			>
				<div className="p-4 rounded-lg bg-muted/50">
					<p className="text-2xl font-bold">{concepts.length}</p>
					<p className="text-sm text-muted-foreground">Total Concepts</p>
				</div>
				<div className="p-4 rounded-lg bg-green-500/10">
					<p className="text-2xl font-bold text-green-500">
						{concepts.filter((c) => c.status === "PUBLISHED").length}
					</p>
					<p className="text-sm text-muted-foreground">Published</p>
				</div>
				<div className="p-4 rounded-lg bg-gray-500/10">
					<p className="text-2xl font-bold text-gray-500">
						{concepts.filter((c) => c.status === "DRAFT").length}
					</p>
					<p className="text-sm text-muted-foreground">Drafts</p>
				</div>
				<div className="p-4 rounded-lg bg-blue-500/10">
					<p className="text-2xl font-bold text-blue-500">
						{concepts.reduce((acc, c) => acc + c.viewCount, 0)}
					</p>
					<p className="text-sm text-muted-foreground">Total Views</p>
				</div>
			</motion.div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
				className="rounded-lg border"
			>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[300px]">Concept</TableHead>
							<TableHead>Author</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Difficulty</TableHead>
							<TableHead className="text-center">Stats</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{
							filteredConcepts.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
										No concepts found
									</TableCell>
								</TableRow>
							) : (
								filteredConcepts.map((concept) => {
									const statusStyle = statusStyles[concept.status];
									const difficultyStyle = difficultyStyles[concept.difficulty];
									const isLoading = isProcessing === concept.id;

									return (
										<TableRow key={concept.id}>
											<TableCell>
												<div>
													<Link
														href={`/concepts/${concept.slug}`}
														className="font-medium hover:text-primary transition-colors line-clamp-1"
													>
														{concept.title}
													</Link>
													<p className="text-xs text-muted-foreground mt-1">
														{concept.category.replace(/_/g, " ")}
													</p>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Avatar className="h-6 w-6">
														<AvatarImage src={concept.creator.image || undefined} />
														<AvatarFallback className="text-xs">
															{concept.creator.name?.[0] || "U"}
														</AvatarFallback>
													</Avatar>
													<span className="text-sm">{concept.creator.name || "Unknown"}</span>
												</div>
											</TableCell>
											<TableCell>
												<Badge className={statusStyle.color}>{statusStyle.label}</Badge>
											</TableCell>
											<TableCell>
												<Badge className={difficultyStyle.color}>{difficultyStyle.label}</Badge>
											</TableCell>
											<TableCell>
												<div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
													<span className="flex items-center gap-1">
														<Layers className="h-3 w-3" />
														{concept._count.steps}
													</span>
													<span className="flex items-center gap-1">
														<Eye className="h-3 w-3" />
														{concept.viewCount}
													</span>
													<span className="flex items-center gap-1">
														<Heart className="h-3 w-3" />
														{concept._count.likes}
													</span>
													<span className="flex items-center gap-1">
														<Bookmark className="h-3 w-3" />
														{concept._count.bookmarks}
													</span>
												</div>
											</TableCell>
											<TableCell className="text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															disabled={isLoading}
															className={isLoading ? "animate-pulse" : ""}
														>
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuSeparator />
														<DropdownMenuItem asChild>
															<Link href={`/concepts/${concept.slug}`}>
																<Eye className="mr-2 h-4 w-4" />
																View
															</Link>
														</DropdownMenuItem>
														<DropdownMenuItem asChild>
															<Link href={`/concepts/create?edit=${concept.id}`}>
																<Edit className="mr-2 h-4 w-4" />
																Edit
															</Link>
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														{
															concept.status !== "PUBLISHED" && (
																<DropdownMenuItem onClick={() => handlePublish(concept.id)}>
																	<CheckCircle className="mr-2 h-4 w-4" />
																	Publish
																</DropdownMenuItem>
															)
														}
														{
															concept.status === "PUBLISHED" && (
																<DropdownMenuItem onClick={() => handleUnpublish(concept.id)}>
																	<XCircle className="mr-2 h-4 w-4" />
																	Unpublish
																</DropdownMenuItem>
															)
														}
														{
															concept.status !== "ARCHIVED" && (
																<DropdownMenuItem onClick={() => handleArchive(concept.id)}>
																	<Archive className="mr-2 h-4 w-4" />
																	Archive
																</DropdownMenuItem>
															)
														}
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-red-500 focus:text-red-500"
															onClick={() => {
																setConceptToDelete(concept.id);
																setDeleteDialogOpen(true);
															}}
														>
															<Trash2 className="mr-2 h-4 w-4" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									);
								})
							)
						}
					</TableBody>
				</Table>
			</motion.div>
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the concept
							and all its steps, progress data, likes, and bookmarks.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-red-500 hover:bg-red-600"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}