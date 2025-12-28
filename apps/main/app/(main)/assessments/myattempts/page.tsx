"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
	History, Trophy, Clock, CheckCircle2, Calendar, BookOpen, Award,
	TrendingUp, BarChart3, Loader2, ChevronRight
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
	Card, CardContent,
} from "@repo/ui/components/ui/card";
import {
	Tabs, TabsContent, TabsList, TabsTrigger
} from "@repo/ui/components/ui/tabs";
import { Progress } from "@repo/ui/components/ui/progress";
import {
	getUserPracticeAttempts, getUserExamAttempts
} from "@/actions/(main)/assessments/user-sets.action";
import type {
	PracticeAttemptListItem, ExamAttemptListItem
} from "@/types/assessment";

const difficultyColors = {
	BEGINNER: "text-emerald-500",
	EASY: "text-green-500",
	INTERMEDIATE: "text-yellow-500",
	ADVANCED: "text-orange-500",
	EXPERT: "text-red-500",
};

// const getScoreColor = (score: number) => {
// 	if (score >= 80) return "text-green-500";
// 	if (score >= 60) return "text-yellow-500";
// 	if (score >= 40) return "text-orange-500";
// 	return "text-red-500";
// };

const getScoreBadgeVariant = (score: number) => {
	if (score >= 80) return "bg-green-500/10 text-green-500 border-green-500/20";
	if (score >= 60) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
	if (score >= 40) return "bg-orange-500/10 text-orange-500 border-orange-500/20";
	return "bg-red-500/10 text-red-500 border-red-500/20";
};

export default function MyAttemptsPage() {
	const [practiceAttempts, setPracticeAttempts] = useState<PracticeAttemptListItem[]>([]);
	const [examAttempts, setExamAttempts] = useState<ExamAttemptListItem[]>([]);
	const [practiceLoading, setPracticeLoading] = useState(true);
	const [examLoading, setExamLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("practice");
	const [practicePagination, setPracticePagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		totalPages: 0,
	});
	const [examPagination, setExamPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		totalPages: 0,
	});

	const fetchPracticeAttempts = async (page = 1) => {
		setPracticeLoading(true);
		const result = await getUserPracticeAttempts(page, 10);
		if (result.success) {
			setPracticeAttempts(Array.isArray(result.data) ? result.data as PracticeAttemptListItem[] : []);
			if (result.pagination) {
				setPracticePagination(result.pagination);
			}
		}
		setPracticeLoading(false);
	};

	const fetchExamAttempts = async (page = 1) => {
		setExamLoading(true);
		const result = await getUserExamAttempts(page, 10);
		if (result.success) {
			setExamAttempts(Array.isArray(result.data) ? result.data as ExamAttemptListItem[] : []);
			if (result.pagination) {
				setExamPagination(result.pagination);
			}
		}
		setExamLoading(false);
	};

	useEffect(() => {
		fetchPracticeAttempts();
		fetchExamAttempts();
	}, []);

	// Calculate stats
	const practiceStats = {
		total: practicePagination.total,
		completed: practiceAttempts.filter(a => a.completedAt).length,
		avgScore: practiceAttempts.length > 0
			? Math.round(practiceAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / practiceAttempts.length)
			: 0,
	};

	const examStats = {
		total: examPagination.total,
		completed: examAttempts.filter(a => a.completedAt).length,
		avgScore: examAttempts.length > 0
			? Math.round(examAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / examAttempts.length)
			: 0,
	};

	const renderAttemptCard = (attempt: PracticeAttemptListItem | ExamAttemptListItem, type: "practice" | "exam") => {
		const set = type === "practice"
			? (attempt as PracticeAttemptListItem).practiceSet
			: (attempt as ExamAttemptListItem).examSet;
		const isCompleted = !!attempt.completedAt;
		const score = attempt.score || 0;

		return (
			<motion.div
				key={attempt.id}
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
			>
				<Card className="hover:shadow-md transition-shadow">
					<CardContent className="p-4">
						<div className="flex items-start gap-4">
							<div className={`p-2 rounded-lg ${isCompleted ? "bg-green-500/10" : "bg-yellow-500/10"}`}>
								{
									isCompleted ? (
										<CheckCircle2 className="h-5 w-5 text-green-500" />
									) : (
										<Clock className="h-5 w-5 text-yellow-500" />
									)
								}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between gap-4">
									<div>
										<h3 className="font-semibold truncate">{set?.title || "Untitled"}</h3>
										<div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
											<Badge variant="outline" className="text-xs">
												{set?.language || "Unknown"}
											</Badge>
											<span>•</span>
											<span className={difficultyColors[set?.difficulty as keyof typeof difficultyColors] || ""}>
												{set?.difficulty || "Unknown"}
											</span>
											<span>•</span>
											<span>{set?.mode || "Unknown"}</span>
										</div>
									</div>
									{
										isCompleted && (
											<Badge variant="outline" className={getScoreBadgeVariant(score)}>
												<Trophy className="h-3 w-3 mr-1" />
												{score}%
											</Badge>
										)
									}
								</div>
								<div className="mt-3 flex items-center justify-between">
									<div className="flex items-center gap-4 text-xs text-muted-foreground">
										<span className="flex items-center gap-1">
											<Calendar className="h-3.5 w-3.5" />
											{new Date(attempt.startedAt).toLocaleDateString()}
										</span>
										<span className="flex items-center gap-1">
											<CheckCircle2 className="h-3.5 w-3.5" />
											{attempt.correctAnswers || 0}/{attempt.questionsAnswered || 0} correct
										</span>
									</div>
									<Link href={`/assessments/${type}/set/${set?.id}`}>
										<Button variant="ghost" size="sm">
											View Details
											<ChevronRight className="h-4 w-4 ml-1" />
										</Button>
									</Link>
								</div>
								{
									isCompleted && (
										<div className="mt-3">
											<Progress value={score} className="h-2" />
										</div>
									)
								}
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		);
	};

	return (
		<div className="min-h-screen bg-background py-8">
			<div className="container max-w-5xl mx-auto px-4">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8"
				>
					<div className="flex items-center gap-3 mb-4">
						<div className="p-3 rounded-xl bg-primary/10">
							<History className="h-8 w-8 text-primary" />
						</div>
						<div>
							<h1 className="text-3xl font-bold">My Attempts</h1>
							<p className="text-muted-foreground">Track your learning progress and performance</p>
						</div>
					</div>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
				>
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-blue-500/10">
									<BookOpen className="h-5 w-5 text-blue-500" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Practice Attempts</p>
									<p className="text-2xl font-bold">{practiceStats.total}</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-red-500/10">
									<Award className="h-5 w-5 text-red-500" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Exam Attempts</p>
									<p className="text-2xl font-bold">{examStats.total}</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-green-500/10">
									<TrendingUp className="h-5 w-5 text-green-500" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Avg Practice Score</p>
									<p className="text-2xl font-bold">{practiceStats.avgScore}%</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-purple-500/10">
									<BarChart3 className="h-5 w-5 text-purple-500" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Avg Exam Score</p>
									<p className="text-2xl font-bold">{examStats.avgScore}%</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="mb-6">
							<TabsTrigger value="practice" className="gap-2">
								<BookOpen className="h-4 w-4" />
								Practice ({practicePagination.total})
							</TabsTrigger>
							<TabsTrigger value="exam" className="gap-2">
								<Award className="h-4 w-4" />
								Exams ({examPagination.total})
							</TabsTrigger>
						</TabsList>
						<TabsContent value="practice">
							{
								practiceLoading ? (
									<div className="flex justify-center py-20">
										<Loader2 className="h-8 w-8 animate-spin text-primary" />
									</div>
								) : practiceAttempts.length === 0 ? (
									<Card>
										<CardContent className="py-16 text-center">
											<BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
											<h3 className="text-lg font-semibold mb-2">No practice attempts yet</h3>
											<p className="text-muted-foreground mb-4">
												Start practicing to track your progress
											</p>
											<Link href="/assessments/community/practice">
												<Button>Browse Practice Sets</Button>
											</Link>
										</CardContent>
									</Card>
								) : (
									<div className="space-y-4">
										{practiceAttempts.map(attempt => renderAttemptCard(attempt, "practice"))}

										{
											practicePagination.totalPages > 1 && (
												<div className="flex justify-center gap-2 pt-4">
													<Button
														variant="outline"
														size="sm"
														disabled={practicePagination.page === 1}
														onClick={() => fetchPracticeAttempts(practicePagination.page - 1)}
													>
														Previous
													</Button>
													<span className="flex items-center px-3 text-sm text-muted-foreground">
														Page {practicePagination.page} of {practicePagination.totalPages}
													</span>
													<Button
														variant="outline"
														size="sm"
														disabled={practicePagination.page === practicePagination.totalPages}
														onClick={() => fetchPracticeAttempts(practicePagination.page + 1)}
													>
														Next
													</Button>
												</div>
											)
										}
									</div>
								)
							}
						</TabsContent>
						<TabsContent value="exam">
							{
								examLoading ? (
									<div className="flex justify-center py-20">
										<Loader2 className="h-8 w-8 animate-spin text-primary" />
									</div>
								) : examAttempts.length === 0 ? (
									<Card>
										<CardContent className="py-16 text-center">
											<Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
											<h3 className="text-lg font-semibold mb-2">No exam attempts yet</h3>
											<p className="text-muted-foreground mb-4">
												Take an exam to test your knowledge
											</p>
											<Link href="/assessments/community/exam">
												<Button>Browse Exam Sets</Button>
											</Link>
										</CardContent>
									</Card>
								) : (
									<div className="space-y-4">
										{examAttempts.map(attempt => renderAttemptCard(attempt, "exam"))}

										{
											examPagination.totalPages > 1 && (
												<div className="flex justify-center gap-2 pt-4">
													<Button
														variant="outline"
														size="sm"
														disabled={examPagination.page === 1}
														onClick={() => fetchExamAttempts(examPagination.page - 1)}
													>
														Previous
													</Button>
													<span className="flex items-center px-3 text-sm text-muted-foreground">
														Page {examPagination.page} of {examPagination.totalPages}
													</span>
													<Button
														variant="outline"
														size="sm"
														disabled={examPagination.page === examPagination.totalPages}
														onClick={() => fetchExamAttempts(examPagination.page + 1)}
													>
														Next
													</Button>
												</div>
											)
										}
									</div>
								)
							}
						</TabsContent>
					</Tabs>
				</motion.div>
			</div>
		</div>
	);
}