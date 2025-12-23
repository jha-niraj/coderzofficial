'use client'

import { Suspense, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
	Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs"
import {
	Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet"
import {
	Plus, Users, Trophy, Clock, Vote, HelpCircle, Sparkles, Target,
	Award, Zap, CheckCircle, ChevronRight, ArrowRight, Flame
} from "lucide-react"
import Link from "next/link"
import SmoothScroll from "@/components/smoothscroll"
import { getProposals } from "@/actions/(main)/collective/proposal.actions"
import { getActiveChallenges } from "@/actions/(main)/collective/challenge.actions"
import { ProposalCard } from "./_components/proposal-card"
import { ChallengeCard } from "./_components/challenge-card"
import { CreateProposalDialog } from "./_components/create-proposal-dialog"

// --- Data Constants ---
const features = [
	{
		icon: Users,
		title: "Community-Driven",
		description: "The curriculum isn't set in stone. You propose the topics, you vote on the roadmap.",
	},
	{
		icon: Trophy,
		title: "Competitive Edge",
		description: "Climb the global leaderboard and earn badges that prove your skills to recruiters.",
	},
	{
		icon: Target,
		title: "Real-World Impact",
		description: "Stop building to-do apps. Tackle complex challenges that mimic actual industry problems.",
	},
	{
		icon: Award,
		title: "Tangible Rewards",
		description: "Earn XP and credits for every contribution, unlockable for premium perks.",
	}
]

const stats = [
	{ label: "Active Learners", value: "2.4K", icon: Users, suffix: "+" },
	{ label: "Challenges Solved", value: "850", icon: CheckCircle, suffix: "+" },
	{ label: "Community Proposals", value: "120", icon: Vote, suffix: "" },
	{ label: "Completion Rate", value: "87", icon: TrendingUp, suffix: "%" },
]

// Top Contributors Dummy Data (You can replace with real data fetch later)
const topContributors = [
	{ name: "Alex Chen", points: "12,400 XP", role: "Full Stack Wizard", avatar: "AC" },
	{ name: "Sarah Miller", points: "10,200 XP", role: "UI Architect", avatar: "SM" },
	{ name: "Jordan Lee", points: "9,800 XP", role: "Algorithm Pro", avatar: "JL" },
]

const howItWorks = [
	{
		step: 1,
		title: "Propose a Challenge",
		description: "Share your idea for a learning challenge. What do you want to master next?",
		icon: Sparkles
	},
	{
		step: 2,
		title: "Community Votes",
		description: "The community rallies behind the best ideas. Democracy drives the curriculum.",
		icon: Vote
	},
	{
		step: 3,
		title: "Official Launch",
		description: "Winning proposals are forged into structured challenges with test cases.",
		icon: Target
	},
	{
		step: 4,
		title: "Compete & Evolve",
		description: "Submit your solution, climb the ranks, and earn your place in history.",
		icon: Trophy
	}
]

import { TrendingUp } from "lucide-react" // Import missed above
import { Card } from "@/components/ui/card"

export default function CollectivePage() {
	const [showHowItWorks, setShowHowItWorks] = useState(false)

	return (
		<SmoothScroll>
			<div className="min-h-screen bg-white dark:bg-neutral-950 font-sans selection:bg-neutral-100 dark:selection:bg-neutral-800">
				<section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-neutral-100 dark:border-neutral-800">
					<div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-neutral-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
					<div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-200 opacity-20 blur-[100px] dark:bg-blue-900"></div>

					<div className="max-w-7xl mx-auto px-6 relative z-10">
						<motion.div
							className="flex flex-col items-center text-center space-y-8"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
						>
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.2 }}
							>
								<Badge variant="outline" className="px-4 py-1.5 rounded-full border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-medium text-sm backdrop-blur-sm">
									<Users className="w-3.5 h-3.5 mr-2 text-blue-500" />
									The Collective Engine
								</Badge>
							</motion.div>
							<motion.h1
								className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-950 dark:text-white max-w-4xl"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
							>
								Don't just learn. <br className="hidden md:block" />
								<span className="text-neutral-400 dark:text-neutral-500">Decide what's next.</span>
							</motion.h1>
							<motion.p
								className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.4 }}
							>
								Welcome to the <strong>Collective</strong>. Propose the challenges you want to solve,
								vote on community ideas, and prove your skills in the arena you built.
							</motion.p>
							<motion.div
								className="flex flex-wrap items-center justify-center gap-4 pt-4"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5 }}
							>
								<CreateProposalDialog>
									<Button size="lg" className="h-12 px-8 text-base bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 shadow-xl shadow-neutral-500/10 rounded-full transition-all duration-300">
										<Plus className="w-4 h-4 mr-2" />
										Propose Challenge
									</Button>
								</CreateProposalDialog>
								<Button variant="outline" size="lg" asChild className="h-12 px-8 text-base border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-full">
									<Link href="#active-challenges">
										<Trophy className="w-4 h-4 mr-2" />
										Browse Challenges
									</Link>
								</Button>
							</motion.div>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.6 }}
							>
								<Sheet open={showHowItWorks} onOpenChange={setShowHowItWorks}>
									<SheetTrigger asChild>
										<button className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1 mt-4">
											<HelpCircle className="w-4 h-4" />
											How does the Collective work?
										</button>
									</SheetTrigger>
									<SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800">
										<SheetHeader className="pb-6 border-b border-neutral-100 dark:border-neutral-800">
											<SheetTitle className="text-2xl font-bold">The Collective Framework</SheetTitle>
											<SheetDescription>
												A simple 4-step process to shape your learning journey.
											</SheetDescription>
										</SheetHeader>
										<div className="mt-8 space-y-8">
											{
												howItWorks.map((item, index) => {
													const Icon = item.icon
													return (
														<div key={index} className="flex gap-5">
															<div className="flex-shrink-0">
																<div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white font-bold">
																	<Icon className="w-5 h-5" />
																</div>
															</div>
															<div>
																<h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
																	{item.title}
																</h3>
																<p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
																	{item.description}
																</p>
															</div>
														</div>
													)
												})
											}
											<div className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
												<h4 className="font-semibold mb-4 flex items-center gap-2 text-neutral-900 dark:text-white">
													<Zap className="w-5 h-5 text-yellow-500" />
													Why Participate?
												</h4>
												<ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
													{
														[
															"Earn XP and credits for completing challenges",
															"Climb leaderboards and showcase your skills",
															"Build real-world projects for your portfolio",
															"Connect with a community of passionate learners"
														].map((point, i) => (
															<li key={i} className="flex items-start gap-3">
																<CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
																<span>{point}</span>
															</li>
														))
													}
												</ul>
											</div>
										</div>
									</SheetContent>
								</Sheet>
							</motion.div>
						</motion.div>
					</div>
				</section>
				<section className="py-12 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950">
					<div className="max-w-7xl mx-auto px-6">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
							{
								stats.map((stat, index) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, y: 10 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ delay: index * 0.1 }}
										className="flex flex-col items-center text-center group"
									>
										<div className="mb-3 text-neutral-400 dark:text-neutral-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
											<stat.icon className="w-6 h-6" />
										</div>
										<div className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
											{stat.value}<span className="text-neutral-400 dark:text-neutral-600 ml-0.5 text-2xl">{stat.suffix}</span>
										</div>
										<div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">
											{stat.label}
										</div>
									</motion.div>
								))
							}
						</div>
					</div>
				</section>
				<section className="py-24 bg-white dark:bg-neutral-950">
					<div className="max-w-7xl mx-auto px-6">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className="text-center mb-16"
						>
							<h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
								Why Join the Collective?
							</h2>
							<p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
								Experience a learning environment that evolves as fast as you do.
							</p>
						</motion.div>
						<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
							{
								features.map((feature, index) => {
									const Icon = feature.icon
									return (
										<motion.div
											key={index}
											initial={{ opacity: 0, y: 20 }}
											whileInView={{ opacity: 1, y: 0 }}
											viewport={{ once: true }}
											transition={{ delay: index * 0.1 }}
											className="relative pl-6 border-l border-neutral-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-300"
										>
											<div className="mb-4 w-10 h-10 rounded-lg bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-900 dark:text-white">
												<Icon className="w-5 h-5" />
											</div>
											<h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">
												{feature.title}
											</h3>
											<p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
												{feature.description}
											</p>
										</motion.div>
									)
								})
							}
						</div>
					</div>
				</section>
				<section className="py-16 bg-neutral-50/50 dark:bg-neutral-900/30 border-y border-neutral-100 dark:border-neutral-800">
					<div className="max-w-7xl mx-auto px-6">
						<div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
							<div>
								<h3 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
									<Flame className="w-6 h-6 text-orange-500" />
									Community Spotlight
								</h3>
								<p className="text-neutral-500 dark:text-neutral-400 mt-1">
									Top contributors shaping the platform this week.
								</p>
							</div>
							<Button variant="ghost" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
								View Leaderboard <ArrowRight className="ml-2 w-4 h-4" />
							</Button>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{
								topContributors.map((user, i) => (
									<motion.div
										key={i}
										initial={{ opacity: 0, x: -20 }}
										whileInView={{ opacity: 1, x: 0 }}
										viewport={{ once: true }}
										transition={{ delay: i * 0.1 }}
										className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl"
									>
										<div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-900 dark:text-white">
											{user.avatar}
										</div>
										<div>
											<div className="font-semibold text-neutral-900 dark:text-white">{user.name}</div>
											<div className="text-xs text-neutral-500">{user.role}</div>
										</div>
										<div className="ml-auto font-mono font-medium text-blue-600 dark:text-blue-400 text-sm">
											{user.points}
										</div>
									</motion.div>
								))
							}
						</div>
					</div>
				</section>
				<section id="active-challenges" className="py-24 bg-white dark:bg-neutral-950">
					<div className="max-w-7xl mx-auto px-6">
						<Tabs defaultValue="active" className="space-y-12">
							<div className="flex flex-col items-center">
								<TabsList className="h-14 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800">
									<TabsTrigger value="active" className="h-full rounded-full px-8 text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm transition-all">
										<Trophy className="w-4 h-4 mr-2" />
										Active Challenges
									</TabsTrigger>
									<TabsTrigger value="proposed" className="h-full rounded-full px-8 text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm transition-all">
										<Vote className="w-4 h-4 mr-2" />
										Voting Phase
									</TabsTrigger>
								</TabsList>
							</div>
							<TabsContent value="active" className="focus:outline-none">
								<div className="space-y-8">
									<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
										<div>
											<h2 className="text-3xl font-bold text-neutral-900 dark:text-white">Active Challenges</h2>
											<p className="text-neutral-500 dark:text-neutral-400 mt-1">
												Live challenges ready for you to solve.
											</p>
										</div>
										<Badge className="w-fit bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 border-green-200 dark:border-green-900">
											<div className="w-2 h-2 rounded-full bg-green-600 mr-2 animate-pulse" />
											System Operational
										</Badge>
									</div>
									<Suspense fallback={<ChallengesSkeleton />}>
										<ActiveChallengesList />
									</Suspense>
								</div>
							</TabsContent>
							<TabsContent value="proposed" className="focus:outline-none">
								<div className="space-y-8">
									<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
										<div>
											<h2 className="text-3xl font-bold text-neutral-900 dark:text-white">Community Proposals</h2>
											<p className="text-neutral-500 dark:text-neutral-400 mt-1">
												Vote for the challenges you want to see built next.
											</p>
										</div>
										<CreateProposalDialog>
											<Button variant="outline" size="sm" className="hidden md:flex">
												<Plus className="w-4 h-4 mr-2" />
												New Proposal
											</Button>
										</CreateProposalDialog>
									</div>
									<Suspense fallback={<ProposalsSkeleton />}>
										<ProposalsList />
									</Suspense>
								</div>
							</TabsContent>
						</Tabs>
					</div>
				</section>
			</div>
		</SmoothScroll>
	)
}

async function ActiveChallengesList() {
	const challenges = await getActiveChallenges()

	if (challenges.length === 0) {
		return (
			<Card className="py-16 text-center border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/50 shadow-none">
				<Trophy className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
				<h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No Active Challenges</h3>
				<p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">
					The arena is currently empty. Be the first to propose a new challenge!
				</p>
				<CreateProposalDialog>
					<Button>
						<Plus className="w-4 h-4 mr-2" />
						Propose Challenge
					</Button>
				</CreateProposalDialog>
			</Card>
		)
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{
				challenges.map((challenge, index) => (
					<motion.div
						key={challenge.id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.05 }}
						className="h-full"
					>
						<ChallengeCard challenge={challenge} />
					</motion.div>
				))
			}
		</div>
	)
}

async function ProposalsList() {
	const proposals = await getProposals("proposed")

	if (proposals.length === 0) {
		return (
			<Card className="py-16 text-center border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/50 shadow-none">
				<Vote className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
				<h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No Proposals Yet</h3>
				<p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">
					The voice of the community is silent. Start the conversation.
				</p>
				<CreateProposalDialog>
					<Button>
						<Plus className="w-4 h-4 mr-2" />
						Create Proposal
					</Button>
				</CreateProposalDialog>
			</Card>
		)
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{
				proposals.map((proposal, index) => (
					<motion.div
						key={proposal.id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.05 }}
						className="h-full"
					>
						<ProposalCard proposal={proposal} />
					</motion.div>
				))
			}
		</div>
	)
}

function ChallengesSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{
				Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
						<div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-3/4 animate-pulse" />
						<div className="h-32 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
						<div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-1/2 animate-pulse" />
					</div>
				))
			}
		</div>
	)
}

function ProposalsSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{
				Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
						<div className="flex justify-between">
							<div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-1/3 animate-pulse" />
							<div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-8 animate-pulse" />
						</div>
						<div className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
						<div className="flex gap-2 pt-2">
							<div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded w-full animate-pulse" />
							<div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded w-full animate-pulse" />
						</div>
					</div>
				))
			}
		</div>
	)
}