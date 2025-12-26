"use client"

import { motion } from "framer-motion"
import {
	ArrowRight, Sparkles, Users, FolderKanban, Zap, Trophy, Rocket,
	Lightbulb, Shield, Heart, TrendingUp, Calendar, Clock, Plus, ChevronRight
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import {
	Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from "@repo/ui/components/ui/sheet"
import { Input } from "@repo/ui/components/ui/input"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Label } from "@repo/ui/components/ui/label"
import Link from "next/link"
import SmoothScroll from "@/components/smoothscroll"
import { useState } from "react"
import toast from '@repo/ui/components/ui/sonner'
import { submitProductIdea } from "@/actions/(main)/products/products.action"

// --- Data Constants ---
const products = [
	{
		icon: Users,
		name: "Collective",
		description: "A centralized ecosystem for developers to connect, share knowledge, and collaborate on open-source initiatives.",
		features: ["Threaded Discussions", "Knowledge Base", "Peer Mentorship", "Event Calendar"],
		status: "Coming Soon",
		launchDate: "Q2 2026",
		category: "Community"
	},
	{
		icon: FolderKanban,
		name: "Spaces",
		description: "Real-time collaborative workspaces designed for student teams to build, manage, and ship projects faster.",
		features: ["Live Kanban Boards", "Doc Collaboration", "Asset Management", "Team Chat"],
		status: "In Development",
		launchDate: "Q3 2026",
		category: "Productivity"
	}
]

const stats = [
	{ label: "Products in Pipeline", value: "12", icon: Rocket, suffix: "+" },
	{ label: "Student Ideas Submitted", value: "480", icon: Lightbulb, suffix: "+" },
	{ label: "Active Beta Users", value: "5.2K", icon: Users, suffix: "" },
	{ label: "Satisfaction Score", value: "98", icon: Trophy, suffix: "%" },
]

const benefits = [
	{
		icon: Shield,
		title: "Student-Centric Architecture",
		description: "Engineered specifically for the academic ecosystem, prioritizing privacy, accessibility, and ease of use."
	},
	{
		icon: Zap,
		title: "Unified Ecosystem",
		description: "Seamlessly interconnected tools that eliminate context switching and streamline your workflow."
	},
	{
		icon: Heart,
		title: "Community Driven",
		description: "Built on feedback from thousands of students. Your needs directly shape our development roadmap."
	},
	{
		icon: TrendingUp,
		title: "Rapid Evolution",
		description: "Weekly deployment cycles ensure you always have access to the latest features and improvements."
	}
]

export default function ProductsPage() {
	const [isSheetOpen, setIsSheetOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		helpDescription: "",
		link: "",
		category: "Learning Tool"
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.title || !formData.description || !formData.helpDescription) {
			toast.error("Please fill in all required fields")
			return
		}

		setIsSubmitting(true)
		try {
			const result = await submitProductIdea(formData)

			if (result.success) {
				toast.success("Idea submitted successfully! Thank you for contributing.")
				setFormData({
					title: "",
					description: "",
					helpDescription: "",
					link: "",
					category: "Learning Tool"
				})
				setIsSheetOpen(false)
			} else {
				toast.error(result.error || "Failed to submit product idea")
			}
		} catch (error) {
			toast.error("An error occurred while submitting")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<SmoothScroll>
			<div className="min-h-screen bg-white dark:bg-neutral-950 font-sans selection:bg-neutral-100 dark:selection:bg-neutral-800">
				<section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-neutral-100 dark:border-neutral-800">
					<div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-neutral-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
					<div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-neutral-200 opacity-20 blur-[100px] dark:bg-neutral-800"></div>
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
									<Sparkles className="w-3.5 h-3.5 mr-2 text-neutral-500" />
									Engineering the Future of Education
								</Badge>
							</motion.div>
							<motion.h1
								className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-950 dark:text-white max-w-4xl"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
							>
								Products that empower <br className="hidden md:block" />
								<span className="text-neutral-400 dark:text-neutral-500">the next generation.</span>
							</motion.h1>
							<motion.p
								className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.4 }}
							>
								Explore a suite of open-source tools designed to help you learn faster, collaborate better, and build your portfolio.
							</motion.p>
							<motion.div
								className="flex flex-wrap items-center justify-center gap-4 pt-4"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5 }}
							>
								<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
									<SheetTrigger asChild>
										<Button size="lg" className="h-12 px-8 text-base bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 shadow-xl shadow-neutral-500/10 rounded-full transition-all duration-300">
											Submit Idea
											<ChevronRight className="ml-2 w-4 h-4" />
										</Button>
									</SheetTrigger>
									<SheetContent className="sm:max-w-[540px] overflow-y-auto bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 p-0">
										<div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
											<SheetHeader>
												<SheetTitle className="text-2xl font-bold">Submit Product Idea</SheetTitle>
												<SheetDescription className="text-neutral-500">
													Help us build the next great tool for students.
												</SheetDescription>
											</SheetHeader>
										</div>
										<div className="p-6">
											<form onSubmit={handleSubmit} className="space-y-6">
												<div className="space-y-3">
													<Label htmlFor="title" className="text-neutral-900 dark:text-white font-medium">Product Name <span className="text-red-500">*</span></Label>
													<Input
														id="title"
														placeholder="e.g., Study Group Matcher"
														value={formData.title}
														onChange={(e) => setFormData({ ...formData, title: e.target.value })}
														className="h-12 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white rounded-lg"
													/>
												</div>
												<div className="space-y-3">
													<Label htmlFor="description" className="text-neutral-900 dark:text-white font-medium">The Concept <span className="text-red-500">*</span></Label>
													<Textarea
														id="description"
														placeholder="What does it do? Who is it for?"
														value={formData.description}
														onChange={(e) => setFormData({ ...formData, description: e.target.value })}
														className="min-h-[120px] border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white rounded-lg resize-none p-4"
													/>
												</div>
												<div className="space-y-3">
													<Label htmlFor="helpDescription" className="text-neutral-900 dark:text-white font-medium">Impact <span className="text-red-500">*</span></Label>
													<Textarea
														id="helpDescription"
														placeholder="How does this improve the student experience?"
														value={formData.helpDescription}
														onChange={(e) => setFormData({ ...formData, helpDescription: e.target.value })}
														className="min-h-[120px] border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white rounded-lg resize-none p-4"
													/>
												</div>
												<div className="grid grid-cols-2 gap-4">
													<div className="space-y-3">
														<Label htmlFor="category" className="text-neutral-900 dark:text-white font-medium">Category</Label>
														<div className="relative">
															<select
																id="category"
																value={formData.category}
																onChange={(e) => setFormData({ ...formData, category: e.target.value })}
																className="w-full h-12 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white appearance-none"
															>
																<option>Learning Tool</option>
																<option>Collaboration</option>
																<option>Career & Growth</option>
																<option>Community</option>
																<option>Productivity</option>
																<option>Other</option>
															</select>
															<div className="absolute right-3 top-3.5 pointer-events-none text-neutral-500">
																<ChevronRight className="w-4 h-4 rotate-90" />
															</div>
														</div>
													</div>
													<div className="space-y-3">
														<Label htmlFor="link" className="text-neutral-900 dark:text-white font-medium">Ref Link (Optional)</Label>
														<Input
															id="link"
															type="url"
															placeholder="https://..."
															value={formData.link}
															onChange={(e) => setFormData({ ...formData, link: e.target.value })}
															className="h-12 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white rounded-lg"
														/>
													</div>
												</div>
												<Button
													type="submit"
													disabled={isSubmitting}
													className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 font-medium rounded-lg mt-4"
												>
													{
														isSubmitting ? (
															<span className="flex items-center gap-2">
																<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
																Sending...
															</span>
														) : "Submit Proposal"
													}
												</Button>
											</form>
										</div>
									</SheetContent>
								</Sheet>
								<Button size="lg" variant="outline" asChild className="h-12 px-8 text-base border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-full">
									<Link href="#products">
										Browse Products
									</Link>
								</Button>
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
										<div className="mb-3 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
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
				<section id="products" className="py-24 bg-neutral-50/50 dark:bg-neutral-950">
					<div className="max-w-7xl mx-auto px-6">
						<div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
							<div className="max-w-2xl">
								<h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
									Product Roadmap
								</h2>
								<p className="text-lg text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
									We are building a comprehensive ecosystem. Here is what&apos;s currently in the pipeline.
								</p>
							</div>
							<Button variant="ghost" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white hidden md:flex">
								View Full Roadmap <ArrowRight className="ml-2 w-4 h-4" />
							</Button>
						</div>
						<div className="grid md:grid-cols-2 gap-8">
							{
								products.map((product, index) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ delay: index * 0.1 }}
									>
										<div className="group relative h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-neutral-900/5 dark:hover:shadow-black/50 transition-all duration-500">
											<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-200 via-neutral-400 to-neutral-200 dark:from-neutral-800 dark:via-neutral-600 dark:to-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
											<div className="p-8">
												<div className="flex items-start justify-between mb-6">
													<div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-900 dark:text-white">
														<product.icon className="w-6 h-6" />
													</div>
													<Badge variant="secondary" className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium px-3 py-1">
														{product.status}
													</Badge>
												</div>
												<div className="mb-6">
													<div className="text-sm font-medium text-neutral-400 dark:text-neutral-500 mb-2 uppercase tracking-wider">
														{product.category}
													</div>
													<h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
														{product.name}
													</h3>
													<p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
														{product.description}
													</p>
												</div>
												<div className="space-y-3 mb-8">
													{
														product.features.map((feature, idx) => (
															<div key={idx} className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
																<div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
																{feature}
															</div>
														))
													}
												</div>
												<div className="flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800">
													<div className="flex items-center gap-2 text-xs font-medium text-neutral-400 dark:text-neutral-500">
														<Calendar className="w-3.5 h-3.5" />
														Target: {product.launchDate}
													</div>
													<Button disabled variant="ghost" size="sm" className="text-neutral-400 hover:bg-transparent cursor-not-allowed">
														Notify Me <Clock className="ml-2 w-3.5 h-3.5" />
													</Button>
												</div>
											</div>
										</div>
									</motion.div>
								))
							}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.2 }}
								className="h-full min-h-[400px]"
							>
								<div
									onClick={() => setIsSheetOpen(true)}
									className="h-full border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-300 group"
								>
									<div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
										<Plus className="w-8 h-8 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
									</div>
									<h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">Have a Better Idea?</h3>
									<p className="text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto mb-6">
										We build what you need. Submit your product request and help shape the roadmap.
									</p>
									<span className="text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-900 dark:border-white pb-0.5">
										Submit Request
									</span>
								</div>
							</motion.div>
						</div>
					</div>
				</section>
				<section className="py-24 bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800">
					<div className="max-w-7xl mx-auto px-6">
						<div className="text-center mb-16">
							<h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
								Why Build With Us?
							</h2>
							<p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
								Our platform is architected for the unique needs of the modern student developer.
							</p>
						</div>
						<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
							{
								benefits.map((benefit, index) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ delay: index * 0.1 }}
										className="relative pl-6 border-l border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-neutral-100 transition-colors duration-300"
									>
										<div className="mb-4 text-neutral-900 dark:text-white">
											<benefit.icon className="w-6 h-6" />
										</div>
										<h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">
											{benefit.title}
										</h3>
										<p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
											{benefit.description}
										</p>
									</motion.div>
								))
							}
						</div>
					</div>
				</section>
				<section className="py-24 relative overflow-hidden">
					<div className="absolute inset-0 bg-neutral-900 dark:bg-neutral-900">
						<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neutral-800/50 rounded-full blur-[100px] pointer-events-none" />
					</div>
					<div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className="space-y-8"
						>
							<h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
								Ready to Shape the Future?
							</h2>
							<p className="text-xl text-neutral-400 max-w-2xl mx-auto font-light">
								Your insights drive our innovation. Join thousands of students contributing to a better learning ecosystem.
							</p>
							<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
								<Button
									size="lg"
									onClick={() => setIsSheetOpen(true)}
									className="h-14 px-8 bg-white text-neutral-900 hover:bg-neutral-100 font-semibold text-lg rounded-full"
								>
									Submit Your Idea
								</Button>
								<Button
									size="lg"
									variant="outline"
									className="h-14 px-8 bg-transparent text-white border-neutral-700 hover:bg-neutral-800 hover:text-white font-semibold text-lg rounded-full"
								>
									Join Community
								</Button>
							</div>
						</motion.div>
					</div>
				</section>
			</div>
		</SmoothScroll>
	)
}