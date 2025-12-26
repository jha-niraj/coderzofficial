"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
	ArrowLeft, Clock, CheckCircle2, Play
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import {
	Card, CardContent
} from "@repo/ui/components/ui/card"
import { Badge } from "@repo/ui/components/ui/badge"
import { Progress } from "@repo/ui/components/ui/progress"
import { companies } from "@/app/(main)/interview/_components/mockdata"
import type { Company } from "@/types/interview"

// Mock user interviews data
const userInterviews = [
	{
		id: "int1",
		companyId: "google",
		roleId: "sde1",
		type: "private" as const,
		completedRounds: ["round1", "round2"],
		currentRound: "round3",
		scores: {
			round1: 85,
			round2: 78,
		},
		overallScore: null,
		startedAt: new Date("2024-10-20"),
		completedAt: null,
		status: "in-progress" as const,
	},
	{
		id: "int2",
		companyId: "google",
		roleId: "sde1",
		type: "public" as const,
		completedRounds: ["round1", "round2", "round3", "round4", "round5"],
		currentRound: null,
		scores: {
			round1: 90,
			round2: 85,
			round3: 88,
			round4: 82,
			round5: 92,
		},
		overallScore: 87.4,
		startedAt: new Date("2024-10-10"),
		completedAt: new Date("2024-10-15"),
		status: "completed" as const,
	},
]

export default function MyInterviewsPage() {
	const params = useParams()
	const companyId = params.company as string
	const company = companies.find((c) => c.id === companyId) as Company | undefined

	if (!company) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Company not found</h1>
					<Link href="/interview/companies">
						<Button>Back to Companies</Button>
					</Link>
				</div>
			</div>
		)
	}

	const myCompanyInterviews = userInterviews.filter((interview) => interview.companyId === companyId)

	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	}

	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 },
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
				<div className="container flex h-16 items-center justify-between px-4 md:px-6">
					<Link href={`/interview/${company.id}`} className="flex items-center gap-2">
						<ArrowLeft className="size-5" />
						<span className="font-medium">Back</span>
					</Link>
					<div className="flex items-center gap-2 font-bold">
						<span className="text-2xl">{company.logo}</span>
						<span>My Interviews</span>
					</div>
					<div className="w-20" />
				</div>
			</header>

			<main className="container px-4 py-12 md:px-6 md:py-20">
				{/* Page Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="mb-12"
				>
					<h1 className="text-4xl font-bold tracking-tight mb-4">My {company.name} Interviews</h1>
					<p className="text-lg text-muted-foreground">Track your progress and continue your interview preparations.</p>
				</motion.div>

				{/* Interviews List */}
				{myCompanyInterviews.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center py-12 border border-dashed rounded-lg"
					>
						<p className="text-muted-foreground mb-4">You haven't started any interviews yet.</p>
						<Link href={`/interview/${company.id}`}>
							<Button>Start an Interview</Button>
						</Link>
					</motion.div>
				) : (
					<motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
						{myCompanyInterviews.map((interview) => {
							const role = company.roles.find((r) => r.id === interview.roleId)
							const completionPercentage = role ? (interview.completedRounds.length / role.rounds.length) * 100 : 0

							return (
								<motion.div key={interview.id} variants={item}>
									<Card className="overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur hover:shadow-md transition-all">
										<CardContent className="p-6">
											<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
												{/* Interview Info */}
												<div className="flex-grow">
													<div className="flex items-start justify-between mb-4">
														<div>
															<h3 className="text-xl font-bold mb-2">{role?.name}</h3>
															<div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
																<Clock className="size-4" />
																<span>Started {interview.startedAt.toLocaleDateString()}</span>
															</div>
														</div>
														<div className="flex gap-2">
															<Badge variant={interview.type === "public" ? "default" : "secondary"}>
																{interview.type}
															</Badge>
															<Badge variant={interview.status === "completed" ? "default" : "outline"}>
																{interview.status}
															</Badge>
														</div>
													</div>

													{/* Progress */}
													<div className="space-y-2">
														<div className="flex items-center justify-between text-sm">
															<span className="text-muted-foreground">Progress</span>
															<span className="font-semibold">
																{interview.completedRounds.length} of {role?.rounds.length} rounds
															</span>
														</div>
														<Progress value={completionPercentage} className="h-2" />
													</div>

													{/* Scores */}
													{interview.status === "completed" && (
														<div className="mt-4 p-3 bg-muted/50 rounded-lg">
															<p className="text-sm text-muted-foreground mb-2">Overall Score</p>
															<p className="text-2xl font-bold text-primary">{interview.overallScore?.toFixed(1)}</p>
														</div>
													)}
												</div>

												{/* Actions */}
												<div className="flex flex-col gap-2 md:flex-col md:w-auto">
													{interview.status === "in-progress" ? (
														<>
															<Link href={`/interview/${company.id}/${interview.roleId}`}>
																<Button className="w-full md:w-auto">
																	<Play className="size-4 mr-2" />
																	Continue
																</Button>
															</Link>
															<Button variant="outline" className="w-full md:w-auto bg-transparent">
																Pause
															</Button>
														</>
													) : (
														<>
															<Link href={`/interview/${company.id}/${interview.roleId}`}>
																<Button variant="outline" className="w-full md:w-auto bg-transparent">
																	<CheckCircle2 className="size-4 mr-2" />
																	View Results
																</Button>
															</Link>
															<Button className="w-full md:w-auto">
																<Play className="size-4 mr-2" />
																Retry
															</Button>
														</>
													)}
												</div>
											</div>
										</CardContent>
									</Card>
								</motion.div>
							)
						})}
					</motion.div>
				)}
			</main>
		</div>
	)
};