"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
	ArrowLeft, Clock, Award, Users
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import {
	Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card"
import { Badge } from "@repo/ui/components/ui/badge"
import {
	Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
	DialogTrigger
} from "@repo/ui/components/ui/dialog"
import {
	companies, publicInterviews
} from "@/app/(main)/interview/_components/mockdata"
import type { Company, Role } from "@/types/interview"

export default function RoleDetailPage() {
	const params = useParams()
	const companyId = params.company as string
	const roleId = params.role as string

	const company = companies.find((c) => c.id === companyId) as Company | undefined
	const role = company?.roles.find((r) => r.id === roleId) as Role | undefined

	const [showPublicPrivateDialog, setShowPublicPrivateDialog] = useState(false)
	const [, setSelectedType] = useState<"public" | "private" | null>(null)

	if (!company || !role) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Role not found</h1>
					<Link href="/interview/companies">
						<Button>Back to Companies</Button>
					</Link>
				</div>
			</div>
		)
	}

	const rolePublicInterviews = publicInterviews.filter(
		(interview) => interview.companyId === companyId && interview.roleId === roleId,
	)

	const handlePrepareClick = (type: "public" | "private") => {
		setSelectedType(type)
		// Here you would typically navigate to the interview prep page
		// For now, we'll just show the dialog
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
				<div className="container flex h-16 items-center justify-between px-4 md:px-6">
					<Link href={`/interview/${company.id}`} className="flex items-center gap-2">
						<ArrowLeft className="size-5" />
						<span className="font-medium">Back</span>
					</Link>
					<div className="flex items-center gap-2 font-bold">
						<span className="text-2xl">{company.logo}</span>
						<span>{role.name}</span>
					</div>
					<div className="w-20" />
				</div>
			</header>
			<main className="container px-4 py-12 md:px-6 md:py-20">
				<div className="grid gap-8 lg:grid-cols-3">
					<div className="lg:col-span-2 space-y-8">
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
							<h1 className="text-4xl font-bold tracking-tight mb-4">{role.name}</h1>
							<p className="text-lg text-muted-foreground mb-6">{role.description}</p>

							<div className="grid grid-cols-3 gap-4 mb-8">
								<Card className="bg-gradient-to-b from-background to-muted/10">
									<CardContent className="p-4">
										<div className="flex items-center gap-2 mb-2">
											<Clock className="size-4 text-primary" />
											<span className="text-xs text-muted-foreground">Duration</span>
										</div>
										<p className="text-2xl font-bold">{role.totalDuration}</p>
										<p className="text-xs text-muted-foreground">minutes</p>
									</CardContent>
								</Card>
								<Card className="bg-gradient-to-b from-background to-muted/10">
									<CardContent className="p-4">
										<div className="flex items-center gap-2 mb-2">
											<Users className="size-4 text-primary" />
											<span className="text-xs text-muted-foreground">Rounds</span>
										</div>
										<p className="text-2xl font-bold">{role.rounds.length}</p>
										<p className="text-xs text-muted-foreground">total</p>
									</CardContent>
								</Card>
								<Card className="bg-gradient-to-b from-background to-muted/10">
									<CardContent className="p-4">
										<div className="flex items-center gap-2 mb-2">
											<Award className="size-4 text-primary" />
											<span className="text-xs text-muted-foreground">Level</span>
										</div>
										<p className="text-2xl font-bold capitalize">{role.level}</p>
									</CardContent>
								</Card>
							</div>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="space-y-4"
						>
							<h2 className="text-2xl font-bold">Interview Rounds</h2>

							{
								role.rounds.map((round, index) => (
									<Card
										key={round.id}
										className="overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur hover:shadow-md transition-all"
									>
										<CardContent className="p-6">
											<div className="flex gap-4">
												<div className="flex-shrink-0">
													<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
														{index + 1}
													</div>
												</div>
												<div className="flex-grow">
													<div className="flex items-start justify-between mb-2">
														<div>
															<h3 className="font-bold text-lg">{round.name}</h3>
															<p className="text-sm text-muted-foreground">
																{round.duration} minutes • {round.type}
															</p>
														</div>
														<Badge variant="outline">{round.type}</Badge>
													</div>
													<p className="text-sm mb-4">{round.description}</p>
													<div className="space-y-2">
														<p className="text-xs font-semibold text-muted-foreground">Tips for success:</p>
														<ul className="text-sm space-y-1">
															{
																round.tips.map((tip, i) => (
																	<li key={i} className="text-muted-foreground flex gap-2">
																		<span className="text-primary">•</span>
																		<span>{tip}</span>
																	</li>
																))
															}
														</ul>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								))
							}
						</motion.div>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8 text-center"
						>
							<h3 className="text-2xl font-bold mb-4">Ready to Practice?</h3>
							<p className="text-muted-foreground mb-6">Choose how you want to prepare for this interview.</p>

							<Dialog open={showPublicPrivateDialog} onOpenChange={setShowPublicPrivateDialog}>
								<DialogTrigger asChild>
									<Button size="lg" className="rounded-full">
										Start Preparing
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Choose Interview Type</DialogTitle>
										<DialogDescription>
											Select whether you want to keep your interview private or share it publicly.
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4 my-6">
										<div
											className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
											onClick={() => handlePrepareClick("private")}
										>
											<p className="font-semibold mb-1">Private Interview</p>
											<p className="text-sm text-muted-foreground mb-3">Only you can see your results and progress</p>
											<p className="text-lg font-bold text-primary">50 Credits</p>
										</div>
										<div
											className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
											onClick={() => handlePrepareClick("public")}
										>
											<p className="font-semibold mb-1">Public Interview</p>
											<p className="text-sm text-muted-foreground mb-3">
												Share your experience and appear on the leaderboard
											</p>
											<p className="text-lg font-bold text-primary">25 Credits</p>
										</div>
									</div>
									<div className="flex gap-3">
										<Button
											variant="outline"
											className="flex-1 bg-transparent"
											onClick={() => setShowPublicPrivateDialog(false)}
										>
											Cancel
										</Button>
										<Link href="/purchase" className="flex-1">
											<Button className="w-full">Get Credits</Button>
										</Link>
									</div>
								</DialogContent>
							</Dialog>
						</motion.div>
					</div>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
					>
						<Card className="sticky top-20 overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Award className="size-5" />
									Leaderboard
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{
									rolePublicInterviews.length === 0 ? (
										<p className="text-sm text-muted-foreground text-center py-4">
											No public interviews yet. Be the first!
										</p>
									) : (
										<div className="space-y-3">
											{
												rolePublicInterviews
													.sort((a, b) => b.overallScore - a.overallScore)
													.slice(0, 5)
													.map((interview, index) => (
														<div
															key={interview.id}
															className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
														>
															<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-sm">
																{index + 1}
															</div>
															<div className="flex-grow min-w-0">
																<p className="font-semibold text-sm truncate">{interview.userName}</p>
																<p className="text-xs text-muted-foreground truncate">{interview.userSchool}</p>
															</div>
															<div className="flex-shrink-0 text-right">
																<p className="font-bold text-sm">{interview.overallScore.toFixed(1)}</p>
																<p className="text-xs text-muted-foreground">score</p>
															</div>
														</div>
													))
											}
										</div>
									)
								}
								<Button variant="outline" className="w-full mt-4 bg-transparent">
									View Full Leaderboard
								</Button>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</main>
		</div>
	)
};