"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
	Moon, Sun, ArrowRight, Star, Search 
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { 
	Card, CardContent 
} from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import {
	AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
	AlertDialogDescription, AlertDialogHeader, AlertDialogTitle
} from "@repo/ui/components/ui/alert-dialog"
import useTheme from "@repo/ui/components/themetoggle"
import { 
	companies, publicInterviews 
} from "@/app/(main)/interview/_components/mockdata"

export default function LandingPage() {
	const [isScrolled, setIsScrolled] = useState(false)
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	const [searchQuery, setSearchQuery] = useState("")
	const [showCompanyDialog, setShowCompanyDialog] = useState(false)
	const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
	const [showRequestDialog, setShowRequestDialog] = useState(false)
	const [requestFormData, setRequestFormData] = useState({ name: "", url: "", description: "" })
	const [showPracticeDialog, setShowPracticeDialog] = useState(false)
	const [selectedPublicInterview, setSelectedPublicInterview] = useState<any>(null)

	const companyList = companies.map((c) => c.name)

	const filteredCompanies = companyList.filter((company) => company.toLowerCase().includes(searchQuery.toLowerCase()))

	const handleCompanySelect = (company: string) => {
		setSelectedCompany(company)
		setShowCompanyDialog(true)
	}

	const handlePracticeClick = (interview: any) => {
		setSelectedPublicInterview(interview)
		setShowPracticeDialog(true)
	}

	const handleRequestSubmit = () => {
		// TODO: Submit request to backend
		console.log("Request submitted:", requestFormData)
		setRequestFormData({ name: "", url: "", description: "" })
		setShowRequestDialog(false)
	}

	useEffect(() => {
		setMounted(true)
		const handleScroll = () => {
			if (window.scrollY > 10) {
				setIsScrolled(true)
			} else {
				setIsScrolled(false)
			}
		}

		window.addEventListener("scroll", handleScroll)
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark")
	}

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

	// Get company ID from name
	const getCompanyId = (name: string) => {
		return companies.find((c) => c.name === name)?.id || ""
	}

	// Get top 10 recent public interviews
	const topPublicInterviews = publicInterviews
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, 10)

	return (
		<div className="flex min-h-[100dvh] flex-col">
			{/* Header - Minimal */}
			<header
				className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"
					}`}
			>
				<div className="container flex h-16 items-center justify-between">
					<div className="flex items-center gap-2 font-bold">
						<div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
							C
						</div>
						<span>CodeEdge</span>
					</div>
					<div className="flex gap-4 items-center">
						<Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
							{mounted && theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
							<span className="sr-only">Toggle theme</span>
						</Button>
					</div>
				</div>
			</header>

			<main className="flex-1">
				{/* Hero Section with Search */}
				<section className="w-full py-20 md:py-32 lg:py-40 overflow-hidden">
					<div className="container px-4 md:px-6 relative">
						<div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="text-center max-w-3xl mx-auto mb-12"
						>
							<Badge className="mb-4 rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
								Launching Soon
							</Badge>
							<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
								Stop guessing how interviews might go.
							</h1>
							<p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
								Start simulating how they actually go. CodeEdge lets you experience the real interview process of top
								tech companies — round by round, AI interviewer included. Because reading Glassdoor questions won&apos;t make
								you ready. Practicing will.
							</p>
							<div className="flex flex-col gap-4 mb-8">
								<div className="relative max-w-md mx-auto w-full">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
									<Input
										type="text"
										placeholder="Search your dream company (e.g., Google, Microsoft, Amazon...)"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10 rounded-full h-12 text-base"
									/>
									{searchQuery && filteredCompanies.length > 0 && (
										<div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-10">
											{filteredCompanies.map((company) => (
												<button
													key={company}
													onClick={() => handleCompanySelect(company)}
													className="w-full text-left px-4 py-2 hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
												>
													{company}
												</button>
											))}
										</div>
									)}
									{searchQuery && filteredCompanies.length === 0 && (
										<div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-10 p-4 text-center text-sm text-muted-foreground">
											Company not found. Request it below!
										</div>
									)}
								</div>
								<p className="text-xs text-muted-foreground">
									We won&apos;t judge your spelling in the search box. (The AI might, though.)
								</p>
							</div>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Link href="/interview/companies">
									<Button size="lg" className="rounded-full h-12 px-8 text-base">
										Explore Companies
										<ArrowRight className="ml-2 size-4" />
									</Button>
								</Link>
								<Link href="/interview/public">
									<Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base bg-transparent">
										Browse Public Interviews
										<ArrowRight className="ml-2 size-4" />
									</Button>
								</Link>
								<Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base bg-transparent">
									My Interviews (Coming Soon)
								</Button>
							</div>
						</motion.div>
					</div>
				</section>

				{/* Company Dialog */}
				<AlertDialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>{selectedCompany} Interview Prep</AlertDialogTitle>
							<AlertDialogDescription>
								Ready to practice your {selectedCompany} interview? Choose your interview type:
							</AlertDialogDescription>
						</AlertDialogHeader>
						<div className="space-y-3 my-4">
							<div className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
								<p className="font-medium">Private Interview</p>
								<p className="text-sm text-muted-foreground">Only you can see your results</p>
								<p className="text-sm font-semibold text-primary mt-2">50 Credits</p>
							</div>
							<div className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
								<p className="font-medium">Public Interview</p>
								<p className="text-sm text-muted-foreground">Share your experience with the community</p>
								<p className="text-sm font-semibold text-primary mt-2">25 Credits</p>
							</div>
						</div>
						<div className="flex gap-3">
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction asChild>
								<Link href="/purchase">Get Credits</Link>
							</AlertDialogAction>
						</div>
					</AlertDialogContent>
				</AlertDialog>

				{/* How It Works Section */}
				<section id="how-it-works" className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
					<div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

					<div className="container px-4 md:px-6 relative">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
							className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
						>
							<Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
								How It Works
							</Badge>
							<h2 className="text-3xl md:text-4xl font-bold tracking-tight">We Turn Panic Into Preparation</h2>
							<p className="max-w-[800px] text-muted-foreground md:text-lg">
								Here&apos;s what happens when you stop pretending to prepare:
							</p>
						</motion.div>

						<div className="grid md:grid-cols-5 gap-8 md:gap-6 relative">
							<div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 z-0"></div>

							{[
								{
									step: "01",
									title: "Choose your company",
									description: "From Google to Zoom — we've mapped the latest interview flows. No guesswork.",
								},
								{
									step: "02",
									title: "Pick your role",
									description: "SDE-1? Data Engineer? Pick your poison. We'll tailor the entire process.",
								},
								{
									step: "03",
									title: "Face your AI interviewer",
									description:
										"Simulated calls, real coding rounds, design boards — the works. (Yes, you can cry between rounds. We support that.)",
								},
								{
									step: "04",
									title: "Get scored, not roasted",
									description: "Receive structured feedback on every round. Learn faster, improve smarter.",
								},
								{
									step: "05",
									title: "Repeat until confidence",
									description: "Practice until caffeine is replaced by actual confidence.",
								},
							].map((step, i) => (
								<motion.div
									key={i}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.5, delay: i * 0.1 }}
									className="relative z-10 flex flex-col items-center text-center space-y-4"
								>
									<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xl font-bold shadow-lg">
										{step.step}
									</div>
									<h3 className="text-lg font-bold">{step.title}</h3>
									<p className="text-sm text-muted-foreground">{step.description}</p>
								</motion.div>
							))}
						</div>

						<div className="flex justify-center mt-12">
							<Button size="lg" variant="outline" className="rounded-full bg-transparent">
								Try a Demo (Coming Soon)
							</Button>
						</div>
					</div>
				</section>

				{/* Public Interviews Section */}
				<section className="w-full py-20 md:py-32">
					<div className="container px-4 md:px-6">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
							className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
						>
							<Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
								Community
							</Badge>
							<h2 className="text-3xl md:text-4xl font-bold tracking-tight">Learn From Real Interview Experiences</h2>
							<p className="max-w-[800px] text-muted-foreground md:text-lg">
								See how others performed, get inspired, and learn from the community&apos;s shared experiences.
							</p>
						</motion.div>

						<motion.div
							variants={container}
							initial="hidden"
							whileInView="show"
							viewport={{ once: true }}
							className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8"
						>
							{topPublicInterviews.map((interview) => {
								const companyName = companies.find((c) => c.id === interview.companyId)?.name || "Unknown"

								return (
									<motion.div key={interview.id} variants={item}>
										<Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md hover:border-primary/50 hover:scale-105">
											<CardContent className="p-5 flex flex-col h-full">
												<div className="mb-4">
													<p className="text-xs font-semibold text-primary mb-1">{companyName}</p>
													<p className="text-sm font-bold text-foreground line-clamp-1">
														{companies.find((c) => c.id === interview.companyId)?.roles[0]?.name || "Interview"}
													</p>
												</div>

												<div className="mb-4 p-3 bg-muted/50 rounded-lg flex-grow">
													<p className="text-xs text-muted-foreground mb-1">Created by</p>
													<p className="font-semibold text-sm text-foreground">{interview.userName}</p>
													<p className="text-xs text-muted-foreground">{interview.userSchool}</p>
												</div>

												<p className="text-xs text-muted-foreground line-clamp-2 mb-4 italic">&quot;{interview.feedback}&quot;</p>

												<div className="flex items-center justify-between pt-3 border-t border-border/40">
													<p className="text-xs text-muted-foreground">
														{new Date(interview.createdAt).toLocaleDateString("en-US", {
															month: "short",
															day: "numeric",
														})}
													</p>
													<Button
														size="sm"
														variant="ghost"
														className="h-7 px-2 text-xs"
														onClick={() => handlePracticeClick(interview)}
													>
														Practice
														<ArrowRight className="ml-1 size-3" />
													</Button>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								)
							})}
						</motion.div>

						<div className="text-center">
							<Link href="/interview/public">
								<Button size="lg" className="rounded-full">
									View All Public Interviews
									<ArrowRight className="ml-2 size-4" />
								</Button>
							</Link>
						</div>
					</div>
				</section>

				{/* Companies Covered Section */}
				<section id="companies" className="w-full py-20 md:py-32 bg-muted/30">
					<div className="container px-4 md:px-6">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
							className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
						>
							<Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
								Companies Covered
							</Badge>
							<h2 className="text-3xl md:text-4xl font-bold tracking-tight">
								We Did Our Homework. So You Don&apos;t Have To.
							</h2>
							<p className="max-w-[800px] text-muted-foreground md:text-lg">
								We&apos;ve mapped interview processes of 100+ top companies so far. Here&apos;s your sneak peek:
							</p>
						</motion.div>

						<motion.div
							variants={container}
							initial="hidden"
							whileInView="show"
							viewport={{ once: true }}
							className="grid gap-4 sm:grid-cols-2 md:grid-cols-5 mb-12"
						>
							{companyList.map((company, i) => (
								<motion.div key={i} variants={item}>
									<Link href={`/interview/${getCompanyId(company)}`}>
										<Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
											<CardContent className="p-6 flex items-center justify-center h-full">
												<p className="font-semibold text-center">{company}</p>
											</CardContent>
										</Card>
									</Link>
								</motion.div>
							))}
						</motion.div>

						<div className="text-center space-y-4">
							<p className="text-muted-foreground">
								Didn&apos;t find your company? Hit &quot;Request&quot; below — we&apos;ll add it before your next panic attack.
							</p>
							<Button size="lg" className="rounded-full" onClick={() => setShowRequestDialog(true)}>
								Request a Company
							</Button>
						</div>
					</div>
				</section>

				{/* What Makes CodeEdge Different */}
				<section className="w-full py-20 md:py-32">
					<div className="container px-4 md:px-6">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
							className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
						>
							<Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
								Why CodeEdge
							</Badge>
							<h2 className="text-3xl md:text-4xl font-bold tracking-tight">
								Other Platforms Give You Questions. We Give You Experience.
							</h2>
							<p className="max-w-[800px] text-muted-foreground md:text-lg">
								You&apos;ve practiced fake interviews long enough. Time to try the real fake interview.
							</p>
						</motion.div>

						<div className="max-w-4xl mx-auto overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-border">
										<th className="text-left py-4 px-4 font-semibold">Others</th>
										<th className="text-left py-4 px-4 font-semibold">CodeEdge</th>
									</tr>
								</thead>
								<tbody>
									{[
										{ others: "One 20-min AI chat", codeEdge: "Full 5-round company-specific simulation" },
										{
											others: "Same questions for everyone",
											codeEdge: "Tailored questions by company, role, and level",
										},
										{ others: "Boring feedback", codeEdge: "Dynamic scoring and voice-based HR reviews" },
										{ others: "Pay and pray", codeEdge: "Earn, share, and save credits (CodeCoins)" },
										{ others: "Mock once", codeEdge: "Build real interview confidence" },
									].map((row, i) => (
										<tr key={i} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
											<td className="py-4 px-4 text-muted-foreground">{row.others}</td>
											<td className="py-4 px-4 font-medium text-foreground">{row.codeEdge}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</section>

				{/* Testimonials Section */}
				<section id="testimonials" className="w-full py-20 md:py-32 bg-muted/30">
					<div className="container px-4 md:px-6">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
							className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
						>
							<Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
								Testimonials
							</Badge>
							<h2 className="text-3xl md:text-4xl font-bold tracking-tight">Brutal. Honest. Effective.</h2>
							<p className="max-w-[800px] text-muted-foreground md:text-lg">Just like the real interviews.</p>
						</motion.div>

						<div className="grid gap-6 md:grid-cols-3">
							{[
								{
									quote: "CodeEdge roasted me harder than my actual Microsoft interviewer. I passed the next week.",
									author: "Rishabh",
									school: "IIT Delhi",
									rating: 5,
								},
								{
									quote: "Finally, a mock that didn't feel like talking to a chatbot with amnesia.",
									author: "Neha",
									school: "PES Bengaluru",
									rating: 5,
								},
								{
									quote: "I scored 52% on my first try. Then 91%. It's addictive, in a painful way.",
									author: "Ankit",
									school: "NIT Trichy",
									rating: 5,
								},
							].map((testimonial, i) => (
								<motion.div
									key={i}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.5, delay: i * 0.1 }}
								>
									<Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
										<CardContent className="p-6 flex flex-col h-full">
											<div className="flex mb-4">
												{Array(testimonial.rating)
													.fill(0)
													.map((_, j) => (
														<Star key={j} className="size-4 text-yellow-500 fill-yellow-500" />
													))}
											</div>
											<p className="text-lg mb-6 flex-grow italic">&quot;{testimonial.quote}&quot;</p>
											<div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/40">
												<div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium">
													{testimonial.author.charAt(0)}
												</div>
												<div>
													<p className="font-medium">{testimonial.author}</p>
													<p className="text-sm text-muted-foreground">{testimonial.school}</p>
												</div>
											</div>
										</CardContent>
									</Card>
								</motion.div>
							))}
						</div>

						<div className="text-center mt-8 text-muted-foreground">
							<p>Don&apos;t worry, you&apos;ll love us after the third attempt.</p>
						</div>
					</div>
				</section>

				{/* Pricing Section - Credits Model */}
				<section id="pricing" className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
					<div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

					<div className="container px-4 md:px-6 relative">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
							className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
						>
							<Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
								Pricing
							</Badge>
							<h2 className="text-3xl md:text-4xl font-bold tracking-tight">CodeCoins — Because Free Isn&apos;t Focused.</h2>
							<p className="max-w-[800px] text-muted-foreground md:text-lg">
								Credits that make you care. Every interview simulation costs a few CodeCoins — our in-app credits. Share
								your experience publicly, pay half. Keep it private, pay full. Motivation meets gamification.
							</p>
						</motion.div>

						<div className="max-w-2xl mx-auto">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5 }}
							>
								<Card className="relative overflow-hidden border-primary shadow-lg bg-gradient-to-b from-background to-muted/10 backdrop-blur">
									<div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
										Interview Prep
									</div>
									<CardContent className="p-8 flex flex-col h-full">
										<h3 className="text-2xl font-bold mb-6">Interview Preparation Plan</h3>

										<div className="space-y-4 mb-8 flex-grow">
											<div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
												<div className="flex items-center justify-between mb-2">
													<p className="font-semibold">Private Interview</p>
													<p className="text-2xl font-bold text-primary">50</p>
												</div>
												<p className="text-sm text-muted-foreground">Credits • Only you can see your results</p>
											</div>

											<div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
												<div className="flex items-center justify-between mb-2">
													<p className="font-semibold">Public Interview</p>
													<p className="text-2xl font-bold text-primary">25</p>
												</div>
												<p className="text-sm text-muted-foreground">
													Credits • Share your experience with the community
												</p>
											</div>
										</div>

										<div className="space-y-3">
											<p className="text-sm text-muted-foreground text-center">
												Because if it costs you nothing, you&apos;ll probably skip it.
											</p>
											<Link href="/purchase" className="block">
												<Button className="w-full rounded-full h-12 text-base">
													Get Credits
													<ArrowRight className="ml-2 size-4" />
												</Button>
											</Link>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						</div>
					</div>
				</section>

				{/* Waitlist Section */}
				<section className="w-full py-20 md:py-32">
					<div className="container px-4 md:px-6">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
							className="flex flex-col items-center justify-center space-y-6 text-center max-w-2xl mx-auto"
						>
							<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
								Launching soon. Real interview simulations. Real anxiety. Real results.
							</h2>
							<p className="text-lg text-muted-foreground">
								Join the waitlist and be among the first to experience CodeEdge.
							</p>

							<div className="w-full max-w-md space-y-4">
								<div className="space-y-3">
									<Input placeholder="Your name" className="rounded-full h-12 px-6" />
									<Input placeholder="Your email" type="email" className="rounded-full h-12 px-6" />
									<Input placeholder="Your dream company" className="rounded-full h-12 px-6" />
								</div>
								<Button className="w-full rounded-full h-12 text-base">
									Join Waitlist
									<ArrowRight className="ml-2 size-4" />
								</Button>
							</div>

							<p className="text-xs text-muted-foreground">We promise fewer emails than your recruiter ghosting you.</p>
						</motion.div>
					</div>
				</section>
			</main>

			<AlertDialog open={showPracticeDialog} onOpenChange={setShowPracticeDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Start Practicing</AlertDialogTitle>
						<AlertDialogDescription className="space-y-4 pt-4">
							<div>
								<p className="font-semibold text-foreground mb-2">
									{selectedPublicInterview && companies.find((c) => c.id === selectedPublicInterview.companyId)?.name}
								</p>
								<p className="text-sm text-muted-foreground">
									Created by <span className="font-medium text-foreground">{selectedPublicInterview?.userName}</span>
								</p>
							</div>
							<div className="bg-muted/50 rounded-lg p-4 space-y-2">
								<p className="text-sm font-medium text-foreground">Interview Type</p>
								<p className="text-sm text-muted-foreground">Public Interview Experience</p>
							</div>
							<div className="bg-primary/10 rounded-lg p-4 space-y-2">
								<p className="text-sm font-medium text-foreground flex items-center gap-2">
									<Star className="size-4 text-primary" />
									Cost: 25 Credits
								</p>
								<p className="text-xs text-muted-foreground">
									Access this public interview experience and learn from the creator&apos;s approach
								</p>
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="flex gap-3">
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction asChild>
							<Link href="/purchase">
								<Button className="w-full">Get Credits & Practice</Button>
							</Link>
						</AlertDialogAction>
					</div>
				</AlertDialogContent>
			</AlertDialog>
			<AlertDialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
				<AlertDialogContent className="max-w-md">
					<AlertDialogHeader>
						<AlertDialogTitle>Request a Company</AlertDialogTitle>
						<AlertDialogDescription>
							Help us add your dream company to CodeEdge. Fill in the details below.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<label className="text-sm font-medium text-foreground">Company Name *</label>
							<Input
								placeholder="e.g., Apple, Netflix, Stripe"
								value={requestFormData.name}
								onChange={(e) => setRequestFormData({ ...requestFormData, name: e.target.value })}
								className="rounded-lg"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium text-foreground">Company Website</label>
							<Input
								placeholder="e.g., https://apple.com"
								value={requestFormData.url}
								onChange={(e) => setRequestFormData({ ...requestFormData, url: e.target.value })}
								className="rounded-lg"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium text-foreground">Why this company?</label>
							<Input
								placeholder="Tell us why you want to practice for this company"
								value={requestFormData.description}
								onChange={(e) => setRequestFormData({ ...requestFormData, description: e.target.value })}
								className="rounded-lg"
							/>
						</div>
					</div>
					<div className="flex gap-3">
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleRequestSubmit} disabled={!requestFormData.name}>
							Submit Request
						</AlertDialogAction>
					</div>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
};