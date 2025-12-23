"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import {
	Code, Users, PenTool, Mail, Github, Code2, Linkedin, Twitter, FileText, Hash, Plus,
	CheckCircle, ArrowRight, Sparkles, Instagram, Youtube, Globe, Briefcase, MessageSquare,
	Lock, CreditCard, Zap, Star
} from "lucide-react"
import { savePlatformData, getUserPlatforms, generatePortfolioInsights, purchasePlatformCredits } from "@/actions/platform.action"
import { PlatformType } from "@/lib/generated/prisma"

interface UserData {
	code: { platform: string; link: string }[]
	socials: { platform: string; link: string }[]
	blogs: { platform: string; link: string }[]
	contact: { platform: string; link: string }[]
}

export default function InputPage() {
	const router = useRouter()
	const { user } = useUser()
	const [userData, setUserData] = useState<UserData>({
		code: [],
		socials: [],
		blogs: [],
		contact: [],
	})
	const [dialogOpen, setDialogOpen] = useState(false)
	const [creditDialogOpen, setCreditDialogOpen] = useState(false)
	const [selectedPlatform, setSelectedPlatform] = useState("")
	const [currentCategory, setCurrentCategory] = useState<keyof UserData>("code")
	const [inputLink, setInputLink] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
	const [credits, setCredits] = useState(10)
	const [pendingPlatform, setPendingPlatform] = useState<{ type: string, category: keyof UserData } | null>(null)
	const [socialUnlocked, setSocialUnlocked] = useState(false)

	useEffect(() => {
		const fetchPlatforms = async () => {
			try {
				const platforms = await getUserPlatforms();
				if (platforms.length > 0) {
					setUserData(prev => ({
						...prev,
						code: platforms.filter(p => ['github', 'leetcode'].includes(p.platform)).map(p => ({
							platform: p.platform,
							link: p.link
						})),
						socials: platforms.filter(p => ['linkedin', 'twitter'].includes(p.platform)).map(p => ({
							platform: p.platform,
							link: p.link
						}))
					}));
				}
			} catch (error) {
				console.error('Error fetching platforms:', error);
				toast.error('Failed to load existing platforms');
			}
		};

		if (user?.id) {
			fetchPlatforms();
		}
	}, [user?.id]);

	const categories = [
		{
			key: "code" as keyof UserData,
			title: "Coding Platforms",
			description: "Your development profiles (Enhanced Analysis Available)",
			icon: Code,
			color: "from-blue-500 to-purple-500",
			options: [
				{ value: "github", label: "GitHub", icon: Github, active: false, creditsRequired: 0, connected: userData.code.some(item => item.platform === 'github') },
				{ value: "leetcode", label: "LeetCode", icon: Code2, active: false, creditsRequired: 0, connected: userData.code.some(item => item.platform === 'leetcode') },
				{ value: "codechef", label: "CodeChef", icon: Code, active: false, creditsRequired: 0, comingSoon: true },
				{ value: "codeforces", label: "Codeforces", icon: Code, active: false, creditsRequired: 0, comingSoon: true },
				{ value: "hackerrank", label: "HackerRank", icon: Code, active: false, creditsRequired: 0, comingSoon: true },
				{ value: "kaggle", label: "Kaggle", icon: Code, active: false, creditsRequired: 0, comingSoon: true },
				{ value: "gitlab", label: "GitLab", icon: Github, active: false, creditsRequired: 0, comingSoon: true },
				{ value: "bitbucket", label: "Bitbucket", icon: Github, active: false, creditsRequired: 0, comingSoon: true },
			],
		},
		{
			key: "socials" as keyof UserData,
			title: "Social Networks",
			description: "Professional networking and social presence",
			icon: Users,
			color: "from-green-500 to-emerald-500",
			options: [
				{ value: "linkedin", label: "LinkedIn", icon: Linkedin, active: false, creditsRequired: 4, connected: userData.socials.some(item => item.platform === 'linkedin'), locked: true },
				{ value: "twitter", label: "Twitter", icon: Twitter, active: false, creditsRequired: 4, connected: userData.socials.some(item => item.platform === 'twitter'), locked: true },
				{ value: "instagram", label: "Instagram", icon: Instagram, active: false, creditsRequired: 3, comingSoon: true },
				{ value: "youtube", label: "YouTube", icon: Youtube, active: false, creditsRequired: 3, comingSoon: true },
				{ value: "discord", label: "Discord", icon: MessageSquare, active: false, creditsRequired: 3, comingSoon: true },
				{ value: "telegram", label: "Telegram", icon: MessageSquare, active: false, creditsRequired: 3, comingSoon: true },
			],
		},
		{
			key: "blogs" as keyof UserData,
			title: "Content Platforms",
			description: "Showcase your writing and content",
			icon: PenTool,
			color: "from-orange-500 to-red-500",
			options: [
				{ value: "medium", label: "Medium", icon: FileText, active: false, creditsRequired: 3, comingSoon: true },
				{ value: "hashnode", label: "Hashnode", icon: Hash, active: false, creditsRequired: 3, comingSoon: true },
				{ value: "devto", label: "Dev.to", icon: FileText, active: false, creditsRequired: 3, comingSoon: true },
				{ value: "substack", label: "Substack", icon: FileText, active: false, creditsRequired: 3, comingSoon: true },
				{ value: "personal-blog", label: "Personal Blog", icon: Globe, active: false, creditsRequired: 3, comingSoon: true },
				{ value: "notion", label: "Notion", icon: FileText, active: false, creditsRequired: 3, comingSoon: true },
			],
		},
		{
			key: "contact" as keyof UserData,
			title: "Contact Information",
			description: "How employers can reach you",
			icon: Mail,
			color: "from-pink-500 to-rose-500",
			options: [
				{ value: "email", label: "Email", icon: Mail, active: false, creditsRequired: 0, comingSoon: true },
				{ value: "phone", label: "Phone", icon: Mail, active: false, creditsRequired: 0, comingSoon: true },
				{ value: "website", label: "Personal Website", icon: Globe, active: false, creditsRequired: 0, comingSoon: true },
				{ value: "portfolio", label: "Portfolio Site", icon: Briefcase, active: false, creditsRequired: 0, comingSoon: true },
			],
		},
	]

	const handlePlatformSelect = (category: keyof UserData, platform: string) => {
		const option = categories.find(cat => cat.key === category)?.options.find(opt => opt.value === platform);

		if (!option) return;

		// If platform is already connected, do nothing
		if (option.connected) {
			toast.info(`${option.label} is already connected!`);
			return;
		}

		// Handle locked social platforms
		if (category === 'socials' && (platform === 'linkedin' || platform === 'twitter') && !socialUnlocked) {
			toast.info(`Please unlock Social Networks first to connect ${option.label}`);
			return;
		}

		// If platform is not active or coming soon
		if ((!option.active && !socialUnlocked) || option.comingSoon) {
			toast.info(`${option.label} integration coming soon!`);
			return;
		}

		// If platform requires individual credits (not social platforms)
		if (option.creditsRequired > 0 && !(category === 'socials' && socialUnlocked)) {
			setPendingPlatform({ type: platform, category });
			setCreditDialogOpen(true);
			return;
		}

		// Available platforms - either free or unlocked social platforms
		setCurrentCategory(category);
		setSelectedPlatform(platform);
		setDialogOpen(true);
	}

	const handleCreditPayment = () => {
		if (!pendingPlatform) return;

		const option = categories.find(cat => cat.key === pendingPlatform.category)?.options.find(opt => opt.value === pendingPlatform.type);

		if (!option || credits < option.creditsRequired) {
			toast.error('Insufficient credits!');
			return;
		}

		setCredits(prev => prev - option.creditsRequired);
		toast.success(`🎉 Paid ${option.creditsRequired} credits! You can now connect ${option.label}`);

		setCurrentCategory(pendingPlatform.category);
		setSelectedPlatform(pendingPlatform.type);
		setCreditDialogOpen(false);
		setPendingPlatform(null);
		setDialogOpen(true);
	}

	const handleSubmit = async () => {
		if (!inputLink.trim() || !selectedPlatform) return;

		setIsLoading(true);
		try {
			let platformType: PlatformType;

			switch (selectedPlatform) {
				case 'github':
					platformType = PlatformType.GITHUB;
					break;
				case 'leetcode':
					platformType = PlatformType.LEETCODE;
					break;
				case 'linkedin':
					platformType = PlatformType.LINKEDIN;
					break;
				case 'twitter':
					platformType = PlatformType.TWITTER;
					break;
				default:
					throw new Error('Unsupported platform');
			}

			await savePlatformData(platformType, inputLink.trim());

			setUserData((prev) => ({
				...prev,
				[currentCategory]: [...prev[currentCategory], {
					platform: selectedPlatform,
					link: inputLink.trim()
				}]
			}));

			toast.success(`${selectedPlatform} profile connected successfully!`);
			setInputLink("");
			setSelectedPlatform("");
			setDialogOpen(false);
		} catch (error) {
			toast.error(`Failed to connect ${selectedPlatform} profile. Please try again.`);
		} finally {
			setIsLoading(false);
		}
	}

	const handleEnhancePortfolio = async () => {
		setIsGeneratingInsights(true);
		try {
			await generatePortfolioInsights(user?.id || "");
			toast.success("🚀 Portfolio enhanced successfully!");
			router.push("/portfolio/demo");
		} catch (error) {
			toast.error("Failed to enhance portfolio. Please try again.");
		} finally {
			setIsGeneratingInsights(false);
		}
	}

	const getCompletionPercentage = () => {
		const totalPlatforms = categories.reduce((acc, cat) => acc + cat.options.length, 0);
		const connectedPlatforms = Object.values(userData).reduce((acc, cat) => acc + cat.length, 0);
		return Math.round((connectedPlatforms / totalPlatforms) * 100);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/5">
			<div className="max-w-4xl mx-auto px-6 py-12">
				<motion.div
					className="text-center mb-12"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
						Connect Your Platforms
					</h1>
					<p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
						Link your coding and social platforms to create a comprehensive AI-powered portfolio
					</p>
					<div className="flex items-center justify-center gap-4 mb-6">
						<div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2">
							<Zap className="h-4 w-4 text-yellow-500" />
							<span className="font-semibold text-foreground">{credits} Credits</span>
						</div>
						<Progress value={getCompletionPercentage()} className="w-48" />
						<span className="text-sm text-muted-foreground">{getCompletionPercentage()}% Complete</span>
					</div>
				</motion.div>
				<div className="space-y-8 mb-12">
					{
						categories.map((category, index) => (
							<motion.div
								key={category.key}
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
							>
								<Card className="border-border/40 hover:shadow-xl transition-all duration-300">
									<CardHeader className="pb-6">
										<div className="flex items-center gap-4">
											<div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center shadow-lg`}>
												<category.icon className="h-6 w-6 text-white" />
											</div>
											<div className="flex-1">
												<CardTitle className="text-xl text-foreground">{category.title}</CardTitle>
												<CardDescription className="text-muted-foreground">{category.description}</CardDescription>
											</div>
											{
												category.key === 'socials' && !socialUnlocked && (
													<Button
														onClick={() => {
															const socialCreditsRequired = 4;
															if (credits < socialCreditsRequired) {
																toast.error('Insufficient credits!');
																return;
															}
															setCredits(prev => prev - socialCreditsRequired);
															setSocialUnlocked(true);
															toast.success(`🎉 Paid ${socialCreditsRequired} credits! LinkedIn and Twitter are now unlocked`);
														}}
														className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
													>
														<CreditCard className="h-4 w-4" />
														Unlock Social (4 credits)
													</Button>
												)
											}
											{
												category.key === 'socials' && socialUnlocked && (
													<Badge className="bg-green-500/10 text-green-600 border-green-500/20">
														<CheckCircle className="h-3 w-3 mr-1" />
														Unlocked
													</Badge>
												)
											}
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-2 gap-3">
											{
												category.options.map((option) => {
													const isConnected = option.connected;
													const isDeactivated = !option.active && !(category.key === 'socials' && socialUnlocked);
													const comingSoon = option.comingSoon;
													const isLocked = category.key === 'socials' && (option.value === 'linkedin' || option.value === 'twitter') && !socialUnlocked;
													const requiresCredits = option.creditsRequired > 0 && !isLocked;

													return (
														<button
															key={option.value}
															onClick={() => handlePlatformSelect(category.key, option.value)}
															className={`relative flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 ${isConnected
																	? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-300"
																	: isLocked
																		? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 cursor-not-allowed"
																		: isDeactivated || comingSoon
																			? "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
																			: requiresCredits
																				? "bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-300 hover:shadow-lg hover:shadow-purple-500/10"
																				: "bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/30 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg hover:shadow-purple-500/10"
																}`}
															disabled={isConnected || isDeactivated || comingSoon || isLocked}
														>
															{
																(isDeactivated || isLocked) && !comingSoon && (
																	<div className="absolute top-2 right-2">
																		<Lock className="h-3 w-3 text-gray-400" />
																	</div>
																)
															}
															{
																requiresCredits && !isConnected && !isDeactivated && !comingSoon && !isLocked && (
																	<div className="absolute top-2 right-2">
																		<Badge className="bg-purple-500 text-white text-xs">
																			{option.creditsRequired} <CreditCard className="h-2 w-2 ml-1" />
																		</Badge>
																	</div>
																)
															}
															{
																comingSoon && (
																	<div className="absolute top-2 right-2">
																		<Badge variant="secondary" className="text-xs">
																			Soon
																		</Badge>
																	</div>
																)
															}
															<option.icon className="h-5 w-5" />
															<div className="text-left flex-1">
																<span className="font-medium">{option.label}</span>
																{
																	requiresCredits && !isConnected && !isDeactivated && !comingSoon && !isLocked && (
																		<div className="text-xs text-purple-500 dark:text-purple-400">
																			Pay {option.creditsRequired} credits to unlock
																		</div>
																	)
																}
																{
																	isDeactivated && !comingSoon && !isLocked && (
																		<div className="text-xs text-gray-400">
																			Enhanced analysis available
																		</div>
																	)
																}
																{
																	isLocked && (
																		<div className="text-xs text-red-400">
																			Unlock Social Networks first
																		</div>
																	)
																}
															</div>
															{
																isConnected && (
																	<CheckCircle className="h-5 w-5 text-emerald-500" />
																)
															}
														</button>
													);
												})
											}
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))
					}
				</div>
				<motion.div
					className="flex flex-col sm:flex-row gap-4 justify-center"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<Button
						onClick={handleEnhancePortfolio}
						disabled={isGeneratingInsights || Object.values(userData).every(cat => cat.length === 0)}
						size="lg"
						className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-pink-600/90 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
					>
						{
							isGeneratingInsights ? (
								<>
									<motion.div
										animate={{ rotate: 360 }}
										transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
										className="mr-3"
									>
										<Sparkles className="h-5 w-5" />
									</motion.div>
									Enhancing Portfolio...
								</>
							) : (
								<>
									<Star className="mr-3 h-5 w-5" />
									Enhance Portfolio
								</>
							)
						}
					</Button>
					<Button
						variant="outline"
						onClick={() => router.push("/portfolio/demo")}
						size="lg"
						className="px-8 py-6 text-lg border-2 hover:bg-muted/50"
					>
						View Current Portfolio
						<ArrowRight className="ml-3 h-5 w-5" />
					</Button>
				</motion.div>
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle className="text-xl flex items-center gap-2">
								Connect {selectedPlatform}
							</DialogTitle>
							<DialogDescription>
								Enter your {selectedPlatform} profile URL to connect this platform.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<Label htmlFor="platform-url">Profile URL</Label>
								<Input
									id="platform-url"
									value={inputLink}
									onChange={(e) => setInputLink(e.target.value)}
									placeholder={`Enter your ${selectedPlatform} profile URL`}
									className="mt-1"
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setDialogOpen(false)}>
								Cancel
							</Button>
							<Button onClick={handleSubmit} disabled={isLoading || !inputLink.trim()}>
								{isLoading ? "Connecting..." : "Connect"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				<Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle className="text-xl flex items-center gap-2">
								<CreditCard className="h-5 w-5 text-purple-500" />
								Unlock Platform
							</DialogTitle>
							<DialogDescription>
								Pay credits to unlock {pendingPlatform && categories.find(cat => cat.key === pendingPlatform.category)?.options.find(opt => opt.value === pendingPlatform.type)?.label} integration
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
								<div className="flex items-center justify-between mb-2">
									<span className="font-medium">Current Credits</span>
									<span className="text-lg font-bold text-purple-600">{credits}</span>
								</div>
								<div className="flex items-center justify-between mb-2">
									<span className="font-medium">Cost</span>
									<span className="text-lg font-bold text-purple-600">
										{pendingPlatform && categories.find(cat => cat.key === pendingPlatform.category)?.options.find(opt => opt.value === pendingPlatform.type)?.creditsRequired} Credits
									</span>
								</div>
								<hr className="border-border my-2" />
								<div className="flex items-center justify-between">
									<span className="font-medium">Remaining</span>
									<span className="text-lg font-bold text-purple-600">
										{pendingPlatform && credits - (categories.find(cat => cat.key === pendingPlatform.category)?.options.find(opt => opt.value === pendingPlatform.type)?.creditsRequired || 0)}
									</span>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setCreditDialogOpen(false)}>
								Cancel
							</Button>
							<Button
								onClick={handleCreditPayment}
								disabled={!pendingPlatform || credits < (categories.find(cat => cat.key === pendingPlatform.category)?.options.find(opt => opt.value === pendingPlatform.type)?.creditsRequired || 0)}
								className="bg-purple-500 hover:bg-purple-600 text-white"
							>
								<CreditCard className="h-4 w-4 mr-2" />
								Pay Credits
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	)
}