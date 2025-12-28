"use client"

import { motion } from "framer-motion"
import {
	ArrowRight, Sparkles, Star, Users, Brain, Zap, Trophy, CheckCircle2,
	Rocket, Target, Lightbulb, Award, Briefcase
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@repo/ui/components/ui/card"
import Link from "next/link"
import {
	PublicProjectsGrid
} from "@/app/(main)/projects/_components/public-projects-grid"
import {
	RecentSubmissionsGrid
} from "@/app/(main)/projects/_components/recent-submissions-grid"
import SmoothScroll from "@/components/smoothscroll"

const features = [
	{
		icon: Brain,
		title: "AI-Powered Generation",
		description: "Advanced AI analyzes your skills and generates personalized projects tailored to your learning goals and technology preferences.",
		highlights: ["Personalized difficulty", "Smart tech stack", "Learning objectives"],
	},
	{
		icon: Target,
		title: "Step-by-Step Guidance",
		description: "Follow comprehensive task lists that guide you from initial setup to production deployment, building real-world experience.",
		highlights: ["Detailed roadmaps", "Progressive learning", "Real deployments"],
	},
	{
		icon: Zap,
		title: "Interactive Learning",
		description: "Engage with dynamic content, earn XP for milestones, take knowledge quizzes, and practice with AI-powered mock interviews.",
		highlights: ["XP & achievements", "Knowledge quizzes", "Mock interviews"],
	},
	{
		icon: Users,
		title: "Community Driven",
		description: "Share your completed projects, discover amazing builds from other developers, and get inspired by community creations.",
		highlights: ["Project sharing", "Community voting", "Inspiration gallery"],
	}
]

const stats = [
	{ label: "Projects Generated", value: "10,847", icon: Rocket, suffix: "+" },
	{ label: "Active Builders", value: "5,234", icon: Users, suffix: "+" },
	{ label: "Tasks Completed", value: "125K", icon: CheckCircle2, suffix: "+" },
	{ label: "Success Rate", value: "94", icon: Trophy, suffix: "%" },
]

// const benefits = [
// 	{
// 		icon: Shield,
// 		title: "Production-Ready Skills",
// 		description: "Build projects that employers actually want to see"
// 	},
// 	{
// 		icon: Timer,
// 		title: "Learn 10x Faster",
// 		description: "Hands-on learning beats passive tutorials every time"
// 	},
// 	{
// 		icon: Github,
// 		title: "Portfolio Projects",
// 		description: "Create a GitHub portfolio that stands out from the crowd"
// 	},
// 	{
// 		icon: Lightbulb,
// 		title: "Real Problem Solving",
// 		description: "Tackle challenges you'll face in actual development jobs"
// 	}
// ]

export default function ProjectsHomePage() {
	const scrollToProjects = () => {
		const element = document.getElementById('public-projects-section')
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}
	}

	return (
		<SmoothScroll>
			<div className="min-h-screen bg-white dark:bg-neutral-950">
				<section className="relative overflow-hidden py-20 bg-white dark:bg-neutral-950">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,_var(--tw-gradient-stops))] from-neutral-100/50 via-white to-white dark:from-neutral-900/50 dark:via-neutral-950 dark:to-neutral-950 -z-10" />
					<div className="max-w-7xl mx-auto px-6">
						<motion.div
							className="text-center space-y-4 max-w-4xl mx-auto"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
						>
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.1, duration: 0.5 }}
								className="flex justify-center"
							>
								<div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full shadow-sm">
									<Sparkles className="w-3.5 h-3.5 text-amber-500" />
									<span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 tracking-wide uppercase">
										AI-Powered Project Generator
									</span>
								</div>
							</motion.div>
							<div className="space-y-4">
								<motion.h1
									className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2, duration: 0.6 }}
								>
									Build Real Projects,
									<span className="block text-neutral-600 dark:text-neutral-400">
										Master Real Skills.
									</span>
								</motion.h1>
								<motion.p
									className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.3, duration: 0.6 }}
								>
									Stop watching tutorials that lead nowhere. Generate personalized coding projects with AI,
									follow step-by-step guidance, and build a portfolio that gets you hired.
								</motion.p>
							</div>
							<motion.div
								className="flex flex-col items-center gap-8 pt-4"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4, duration: 0.6 }}
							>
								<div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
									<Link href="/projects/generate" className="w-full sm:w-auto">
										<Button className="w-full sm:w-auto h-14 px-8 text-base bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-xl shadow-xl shadow-neutral-900/10 transition-all hover:-translate-y-0.5 font-semibold">
											<Rocket className="mr-2 h-5 w-5" />
											Generate My Project
										</Button>
									</Link>
									<Link href="/projects/ideas" className="w-full sm:w-auto">
										<Button
											variant="outline"
											className="w-full sm:w-auto h-14 px-8 text-base border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl bg-white dark:bg-neutral-950 font-semibold"
										>
											<Lightbulb className="mr-2 h-5 w-5" />
											Browse Ideas
										</Button>
									</Link>
								</div>
								<div className="flex flex-wrap justify-center gap-3 md:gap-6">
									<Link href="/projects/myprojects">
										<Button variant="ghost" className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-transparent">
											My Projects
										</Button>
									</Link>
									<span className="hidden sm:block text-neutral-300 dark:text-neutral-700 py-2">|</span>
									<Button
										onClick={scrollToProjects}
										variant="ghost"
										className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-transparent"
									>
										Explore All
									</Button>
									<span className="hidden sm:block text-neutral-300 dark:text-neutral-700 py-2">|</span>
									<Link href="/projects/leaderboard">
										<Button variant="ghost" className="text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 px-3">
											<Trophy className="mr-1.5 h-4 w-4" />
											Leaderboard
										</Button>
									</Link>
								</div>
							</motion.div>
						</motion.div>
					</div>
				</section>
				<section className="bg-white dark:bg-neutral-950">
					<div className="max-w-7xl mx-auto px-6">
						<motion.div
							className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
						>
							{
								stats.map((stat, index) => {
									const Icon = stat.icon
									return (
										<motion.div
											key={stat.label}
											className="group bg-white dark:bg-neutral-900 rounded-xl p-6 text-center border border-transparent hover:border-neutral-100 dark:hover:border-neutral-800 transition-colors duration-300"
											initial={{ opacity: 0, scale: 0.95 }}
											whileInView={{ opacity: 1, scale: 1 }}
											viewport={{ once: true }}
											transition={{ delay: index * 0.1, duration: 0.5 }}
										>
											<div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-neutral-900 dark:text-white mb-4 group-hover:scale-110 transition-transform duration-300">
												<Icon className="w-5 h-5" />
											</div>
											<div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1 tracking-tight">
												{stat.value}
												<span className="text-neutral-400 dark:text-neutral-600 ml-0.5 text-2xl">{stat.suffix}</span>
											</div>
											<div className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
												{stat.label}
											</div>
										</motion.div>
									)
								})
							}
						</motion.div>
					</div>
				</section>
				<section className="py-24 bg-white dark:bg-neutral-950">
					<div className="max-w-7xl mx-auto px-6">
						<motion.div
							className="text-center space-y-4 mb-16"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
						>
							<div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-full backdrop-blur-sm">
								<Brain className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
								<span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Powered by Advanced AI</span>
							</div>
							<h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-neutral-50 dark:to-neutral-400">
								Why Choose AI-Generated Projects?
							</h2>
							<p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
								Traditional tutorials teach you to follow instructions. Our AI-powered approach teaches you to think like a developer.
							</p>
						</motion.div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{
								features.map((feature, index) => {
									const Icon = feature.icon
									return (
										<motion.div
											key={feature.title}
											initial={{ opacity: 0, y: 30 }}
											whileInView={{ opacity: 1, y: 0 }}
											viewport={{ once: true }}
											transition={{ delay: index * 0.1, duration: 0.6 }}
										>
											<Card className="h-full bg-white dark:bg-neutral-900 shadow-2xl p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
												<CardHeader className="pb-4 flex items-center justify-center">
													<div className="flex items-center justify-center w-12 h-12 bg-black dark:bg-white rounded-xl text-white dark:text-black mb-4">
														<Icon className="w-6 h-6" />
													</div>
													<CardTitle className="text-xl font-semibold text-neutral-900 dark:text-white">
														{feature.title}
													</CardTitle>
												</CardHeader>
												<CardContent>
													<CardDescription className="text-neutral-600 dark:text-neutral-400 text-base leading-relaxed mb-4">
														{feature.description}
													</CardDescription>
													<div className="flex items-center gap-2 justify-center">
														{
															feature.highlights.map((highlight, idx) => (
																<Badge key={idx} variant="outline" className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
																	<div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full"></div>
																	<span className="font-medium">{highlight}</span>
																</Badge>
															))
														}
													</div>
												</CardContent>
											</Card>
										</motion.div>
									)
								})
							}
						</div>
					</div>
				</section>
				<section id="public-projects-section" className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
					<div className="max-w-7xl mx-auto px-6">
						<motion.div
							className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
						>
							<div>
								<div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-full backdrop-blur-sm mb-4">
									<Users className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
									<span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Community Showcase</span>
								</div>
								<h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-neutral-50 dark:to-neutral-400 mb-2">
									Featured Public Projects
								</h2>
								<p className="text-lg text-neutral-600 dark:text-neutral-400">
									Discover projects built by our community
								</p>
							</div>
							<Link href="/projects/allprojects">
								<Button variant="outline" className="border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-xl">
									View All Projects <ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</Link>
						</motion.div>

						<PublicProjectsGrid />
					</div>
				</section>
				<section className="py-24 bg-white dark:bg-neutral-950">
					<div className="max-w-7xl mx-auto px-6">
						<motion.div
							className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
						>
							<div>
								<div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-full backdrop-blur-sm mb-4">
									<Trophy className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
									<span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Recent Submissions</span>
								</div>
								<h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-neutral-50 dark:to-neutral-400 mb-2">
									Latest Project Submissions
								</h2>
								<p className="text-lg text-neutral-600 dark:text-neutral-400">
									See what our community has been building
								</p>
							</div>
							<Link href="/projects/submissions">
								<Button variant="outline" className="border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-xl">
									View All Submissions <ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</Link>
						</motion.div>

						<RecentSubmissionsGrid />
					</div>
				</section>
				<section className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
					<div className="max-w-7xl mx-auto px-6">
						<motion.div
							className="text-center space-y-4 mb-16"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
						>
							<div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-full backdrop-blur-sm">
								<Award className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
								<span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">More Features</span>
							</div>
							<h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-neutral-50 dark:to-neutral-400">
								Everything You Need to Succeed
							</h2>
						</motion.div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{
								[
									{ icon: Trophy, title: "Leaderboard", desc: "Compete with builders worldwide", link: "/projects/leaderboard" },
									{ icon: Brain, title: "AI Mock Interviews", desc: "Practice with AI-powered interviews", link: null },
									{ icon: Briefcase, title: "Portfolio Ready", desc: "Build projects that impress employers", link: null },
									{ icon: Star, title: "Community Submissions", desc: "See what others have built", link: "/projects/submissions" },
								].map((item, index) => {
									const Icon = item.icon
									return (
										<motion.div
											key={item.title}
											initial={{ opacity: 0, y: 30 }}
											whileInView={{ opacity: 1, y: 0 }}
											viewport={{ once: true }}
											transition={{ delay: index * 0.1, duration: 0.6 }}
										>
											<Card className="h-full bg-white dark:bg-neutral-900 shadow-2xl p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
												<CardContent className="p-0">
													<div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-900 dark:bg-neutral-100 rounded-xl text-white dark:text-neutral-900 mb-4">
														<Icon className="w-6 h-6" />
													</div>
													<h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
														{item.title}
													</h3>
													<p className="text-sm text-neutral-600 dark:text-neutral-400">
														{item.desc}
													</p>
												</CardContent>
											</Card>
										</motion.div>
									)
								})
							}
						</div>
					</div>
				</section>
				<section className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
					<div className="max-w-4xl mx-auto px-6">
						<motion.div
							className="bg-white dark:bg-neutral-900 shadow-2xl p-8 md:p-12 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
						>
							<div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-900 dark:bg-neutral-100 rounded-xl text-white dark:text-neutral-900 mb-6 mx-auto">
								<Rocket className="w-8 h-8" />
							</div>
							<h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-neutral-50 dark:to-neutral-400 mb-4">
								Ready to Build Your Next Project?
							</h2>
							<p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
								Join thousands of developers who are building real projects, earning XP, and advancing their careers through hands-on learning.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Link href="/projects/generate">
									<Button size="lg" className="bg-black text-white dark:bg-white dark:text-black hover:opacity-90 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg transition-all">
										<Sparkles className="mr-2 h-5 w-5" />
										Start Building Now
									</Button>
								</Link>
								<Link href="/projects/leaderboard">
									<Button variant="outline" size="lg" className="border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 px-8 py-6 text-lg font-semibold rounded-xl bg-white dark:bg-neutral-900">
										<Trophy className="mr-2 h-5 w-5" />
										View Leaderboard
									</Button>
								</Link>
							</div>
						</motion.div>
					</div>
				</section>
			</div>
		</SmoothScroll>
	)
}