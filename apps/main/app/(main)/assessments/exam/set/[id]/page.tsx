"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
	ArrowLeft,
	Clock,
	Trophy,
	Users,
	Heart,
	Play,
	Lock,
	CheckCircle2,
	Code2,
	MessageSquare,
	Shuffle,
	Eye,
	Loader2,
	Share2,
	Award
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Separator } from "@repo/ui/components/ui/separator";
import { getExamSetDetails, toggleExamSetLike, startExamSetAttempt } from "@/actions/(main)/assessments/user-sets.action";
import { toast } from "sonner";
import type { ExamSetDetails } from "@/types/assessment";

const modeIcons = {
	QUIZ: CheckCircle2,
	CODE: Code2,
	MOCK: MessageSquare,
	MIXED: Shuffle,
};

const modeColors = {
	QUIZ: "bg-blue-500/10 text-blue-500 border-blue-500/20",
	CODE: "bg-green-500/10 text-green-500 border-green-500/20",
	MOCK: "bg-purple-500/10 text-purple-500 border-purple-500/20",
	MIXED: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

const difficultyColors = {
	BEGINNER: "bg-emerald-500/10 text-emerald-500",
	EASY: "bg-green-500/10 text-green-500",
	INTERMEDIATE: "bg-yellow-500/10 text-yellow-500",
	ADVANCED: "bg-orange-500/10 text-orange-500",
	EXPERT: "bg-red-500/10 text-red-500",
};

export default function ExamSetDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const [examSet, setExamSet] = useState<ExamSetDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [starting, setStarting] = useState(false);
	const [isLiked, setIsLiked] = useState(false);

	useEffect(() => {
		const fetchDetails = async () => {
			if (!params.id) return;

			setLoading(true);
			const result = await getExamSetDetails(params.id as string);

			if (result.success && result.data) {
				setExamSet(result.data as ExamSetDetails);
				setIsLiked(result.data.isLiked || false);
			} else {
				toast.error(result.error || "Failed to load exam set");
				router.push("/assessments/community/exam");
			}
			setLoading(false);
		};

		fetchDetails();
	}, [params.id, router]);

	const handleLike = async () => {
		const result = await toggleExamSetLike(params.id as string);
		if (result.success) {
			setIsLiked(result.liked || false);
			setExamSet((prev) => prev ? ({
				...prev,
				_count: {
					...prev._count,
					likedBy: prev._count.likedBy + (result.liked ? 1 : -1),
				},
			}) : null);
		}
	};

	const handleStartExam = async () => {
		setStarting(true);
		const result = await startExamSetAttempt(params.id as string);

		if (result.success) {
			router.push(`/assessments/exam/attempt/${result.attemptId}`);
		} else {
			toast.error(result.error || "Failed to start exam");
			setStarting(false);
		}
	};

	const handleShare = () => {
		navigator.clipboard.writeText(window.location.href);
		toast.success("Link copied to clipboard!");
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!examSet) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center gap-4">
				<Lock className="h-16 w-16 text-muted-foreground" />
				<h1 className="text-2xl font-bold">Exam Set Not Found</h1>
				<p className="text-muted-foreground">This exam set doesn't exist or you don't have access.</p>
				<Button onClick={() => router.push("/assessments/community/exam")}>
					Browse Exam Sets
				</Button>
			</div>
		);
	}

	const ModeIcon = modeIcons[examSet.mode as keyof typeof modeIcons] || CheckCircle2;

	return (
		<div className="min-h-screen bg-background py-8">
			<div className="container max-w-5xl mx-auto px-4">
				{/* Back Button */}
				<Button
					variant="ghost"
					className="mb-6"
					onClick={() => router.back()}
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Button>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Header */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
						>
							<div className="flex items-start gap-4">
								<div className={`p-4 rounded-xl ${modeColors[examSet.mode as keyof typeof modeColors]}`}>
									<ModeIcon className="h-8 w-8" />
								</div>
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
											<Award className="h-3 w-3 mr-1" />
											Exam
										</Badge>
										<Badge variant="outline">{examSet.language}</Badge>
										<Badge className={difficultyColors[examSet.difficulty as keyof typeof difficultyColors]}>
											{examSet.difficulty}
										</Badge>
									</div>
									<h1 className="text-3xl font-bold mb-2">{examSet.title}</h1>
									{examSet.description && (
										<p className="text-muted-foreground">{examSet.description}</p>
									)}
								</div>
							</div>
						</motion.div>

						{/* Stats */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="flex flex-wrap gap-6"
						>
							<div className="flex items-center gap-2 text-muted-foreground">
								<CheckCircle2 className="h-5 w-5" />
								<span>{examSet.questions?.length || examSet._count?.questions || 0} Questions</span>
							</div>
							{examSet.timeLimit && (
								<div className="flex items-center gap-2 text-muted-foreground">
									<Clock className="h-5 w-5" />
									<span>{Math.floor(examSet.timeLimit / 60)} mins</span>
								</div>
							)}
							<div className="flex items-center gap-2 text-muted-foreground">
								<Users className="h-5 w-5" />
								<span>{examSet._count?.attempts || 0} Attempts</span>
							</div>
							<div className="flex items-center gap-2 text-muted-foreground">
								<Eye className="h-5 w-5" />
								<span>{examSet.views || 0} Views</span>
							</div>
						</motion.div>

						{/* Topic Info */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
						>
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Topic Coverage</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<span className="text-sm text-muted-foreground">Topic</span>
										<p className="font-medium">{examSet.topic?.name || "General"}</p>
									</div>
								</CardContent>
							</Card>
						</motion.div>						{/* Questions Preview */}
						{examSet.questions && examSet.questions.length > 0 && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
							>
								<Card>
									<CardHeader>
										<CardTitle className="text-lg">Questions Overview</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											{examSet.questions.slice(0, 5).map((q, index) => (
												<div
													key={q.id}
													className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
												>
													<span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-medium">
														{index + 1}
													</span>
													<p className="text-sm line-clamp-2">{q.question}</p>
												</div>
											))}
											{examSet.questions.length > 5 && (
												<p className="text-sm text-muted-foreground text-center pt-2">
													+{examSet.questions.length - 5} more questions
												</p>
											)}
										</div>
									</CardContent>
								</Card>
							</motion.div>
						)}
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Creator Card */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 }}
						>
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Created By</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-3">
										<Avatar className="h-12 w-12">
											<AvatarImage src={examSet.creator?.image || undefined} />
											<AvatarFallback>
												{examSet.creator?.name?.charAt(0) || "U"}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium">{examSet.creator?.name || "Anonymous"}</p>
											<p className="text-sm text-muted-foreground">
												{new Date(examSet.createdAt).toLocaleDateString()}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>

						{/* Action Card */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.3 }}
						>
							<Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
								<CardContent className="pt-6 space-y-4">
									<div className="text-center">
										<div className="flex items-center justify-center gap-1 mb-2">
											<Trophy className="h-5 w-5 text-yellow-500" />
											<span className="text-2xl font-bold">Ready to Test?</span>
										</div>
										<p className="text-sm text-muted-foreground">
											Challenge yourself with this exam set
										</p>
									</div>

									<Separator />

									<Button
										className="w-full"
										size="lg"
										onClick={handleStartExam}
										disabled={starting}
									>
										{starting ? (
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										) : (
											<Play className="h-4 w-4 mr-2" />
										)}
										Start Exam
									</Button>

									<div className="flex gap-2">
										<Button
											variant="outline"
											className="flex-1"
											onClick={handleLike}
										>
											<Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
											{examSet._count?.likedBy || 0}
										</Button>
										<Button
											variant="outline"
											className="flex-1"
											onClick={handleShare}
										>
											<Share2 className="h-4 w-4 mr-2" />
											Share
										</Button>
									</div>
								</CardContent>
							</Card>
						</motion.div>

						{/* Exam Warning */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.4 }}
						>
							<Card className="border-orange-500/20 bg-orange-500/5">
								<CardContent className="pt-6">
									<div className="flex items-start gap-3">
										<Clock className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
										<div>
											<p className="font-medium text-orange-500">Exam Mode</p>
											<p className="text-sm text-muted-foreground mt-1">
												This is an exam set with intermediate to advanced difficulty.
												Make sure you're prepared before starting.
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
}
