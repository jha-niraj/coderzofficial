'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Progress } from '@repo/ui/components/ui/progress'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import {
	Tabs, TabsContent, TabsList, TabsTrigger
} from '@repo/ui/components/ui/tabs'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import {
	ArrowLeft, BookOpen, ChevronRight, Code, FileQuestion, Loader2, Lock,
	Mic, Play, Plus, Sparkles, Target, Eye, Heart
} from 'lucide-react'
import { cn } from '@repo/ui/lib/utils'
import toast from '@repo/ui/components/ui/sonner'
import {
	AssessmentLanguage, AssessmentMode
} from '@prisma/client'
import { CreateSetSheet } from '@/components/assessments/CreateSetSheet'
import { getTopicsByLanguage } from '@/actions/(main)/assessments/practice.action'
import { getUserPracticeSets } from '@/actions/(main)/assessments/user-sets.action'
import type {
	TopicWithSubModules, SubModuleWithProgress
} from '@/actions/(main)/assessments/practice.action'
import type { PracticeSetPreview } from '@/types/assessment'

// Local language config with colors and icons
const LANGUAGES: Record<AssessmentLanguage, { label: string; icon: string; color: string }> = {
	JAVASCRIPT: { label: 'JavaScript', icon: '🟨', color: '#f7df1e' },
	PYTHON: { label: 'Python', icon: '🐍', color: '#3776ab' },
	C: { label: 'C', icon: '🔷', color: '#00599c' },
	CPP: { label: 'C++', icon: '🔶', color: '#f34b7d' },
	REACTJS: { label: 'React.js', icon: '⚛️', color: '#61dafb' },
	TYPESCRIPT: { label: 'TypeScript', icon: '🔵', color: '#3178c6' },
	JAVA: { label: 'Java', icon: '☕', color: '#b07219' },
	GO: { label: 'Go', icon: '🐹', color: '#00add8' },
	RUST: { label: 'Rust', icon: '🦀', color: '#dea584' },
}

// Mode configuration with icons
const MODES: Record<AssessmentMode, { label: string; icon: React.ReactNode; description: string }> = {
	QUIZ: {
		label: 'Quiz',
		icon: <FileQuestion className="w-4 h-4" />,
		description: 'MCQs and theory'
	},
	CODE: {
		label: 'Coding',
		icon: <Code className="w-4 h-4" />,
		description: 'Write code'
	},
	MOCK: {
		label: 'Mock',
		icon: <Mic className="w-4 h-4" />,
		description: 'Interview style'
	},
	MIXED: {
		label: 'Mixed',
		icon: <Sparkles className="w-4 h-4" />,
		description: 'All types'
	},
}

const statusColors = {
	GENERATING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
	ACTIVE: 'bg-green-500/10 text-green-500 border-green-500/20',
	ARCHIVED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
}

function PracticeContent() {
	const searchParams = useSearchParams()
	const router = useRouter()

	// URL params
	const languageParam = (searchParams.get('language') || 'JAVASCRIPT') as AssessmentLanguage
	const modeParam = (searchParams.get('mode') || 'QUIZ') as AssessmentMode

	// State
	const [selectedLanguage, setSelectedLanguage] = useState<AssessmentLanguage>(languageParam)
	const [selectedMode, setSelectedMode] = useState<AssessmentMode>(modeParam)
	const [selectedTopic, setSelectedTopic] = useState<TopicWithSubModules | null>(null)
	const [selectedSubModule, setSelectedSubModule] = useState<SubModuleWithProgress | null>(null)
	const [topics, setTopics] = useState<TopicWithSubModules[]>([])
	const [isLoadingTopics, setIsLoadingTopics] = useState(true)

	// User's sets state
	const [userSets, setUserSets] = useState<PracticeSetPreview[]>([])
	const [isLoadingUserSets, setIsLoadingUserSets] = useState(true)

	// Create sheet state
	const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)

	// Active tab state
	const [activeTab, setActiveTab] = useState<'topics' | 'my-sets'>('topics')

	// Load topics for selected language
	const loadTopics = useCallback(async () => {
		setIsLoadingTopics(true)
		try {
			const result = await getTopicsByLanguage(selectedLanguage)
			if (result && Array.isArray(result)) {
				setTopics(result)
			} else {
				setTopics([])
			}
		} catch (error) {
			console.error('Error loading topics:', error)
			toast.error('Failed to load topics')
			setTopics([])
		}
		setIsLoadingTopics(false)
	}, [selectedLanguage])

	// Load user's practice sets
	const loadUserSets = useCallback(async () => {
		setIsLoadingUserSets(true)
		try {
			const result = await getUserPracticeSets()
			if (result.success && Array.isArray(result.data)) {
				setUserSets(result.data as PracticeSetPreview[])
			} else {
				setUserSets([])
			}
		} catch (error) {
			console.error('Error loading user sets:', error)
			setUserSets([])
		}
		setIsLoadingUserSets(false)
	}, [])

	useEffect(() => {
		loadTopics()
		loadUserSets()
	}, [loadTopics, loadUserSets])

	useEffect(() => {
		setSelectedTopic(null)
		setSelectedSubModule(null)
	}, [selectedLanguage])

	const languageConfig = LANGUAGES[selectedLanguage] || LANGUAGES.JAVASCRIPT
	const modeConfig = MODES[selectedMode] || MODES.QUIZ

	const handleStartPractice = (topicId: string, subModuleId?: string) => {
		const params = new URLSearchParams({
			language: selectedLanguage,
			mode: selectedMode,
			topic: topicId,
		})
		if (subModuleId) {
			params.set('submodule', subModuleId)
		}
		router.push(`/assessments/practice/session?\${params.toString()}`)
	}

	const handleStartUserSet = (setId: string) => {
		router.push(`/assessments/practice/set/\${setId}`)
	}

	const filteredUserSets = userSets.filter(set => set.language === selectedLanguage)

	return (
		<main className="min-h-screen bg-white dark:bg-neutral-950">
			<section className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 py-8">
				<div className="max-w-7xl mx-auto px-6">
					<div className="flex items-center gap-4 mb-4">
						<Link href="/assessments">
							<Button variant="ghost" size="sm">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back
							</Button>
						</Link>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<span className="text-4xl">{languageConfig.icon}</span>
							<div>
								<h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
									{languageConfig.label} Practice
								</h1>
								<p className="text-neutral-600 dark:text-neutral-400">
									Practice topics or create custom practice sets
								</p>
							</div>
						</div>
						<Button
							onClick={() => setIsCreateSheetOpen(true)}
							className="bg-emerald-600 hover:bg-emerald-700"
						>
							<Plus className="w-4 h-4 mr-2" />
							Create Practice Set
						</Button>
					</div>
				</div>
			</section>
			<section className="py-8">
				<div className="max-w-7xl mx-auto px-6">
					<div className="flex flex-col lg:flex-row gap-6">
						<div className="lg:w-1/3 space-y-4">
							<div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
								<h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
									<Code className="w-4 h-4" />
									Language
								</h3>
								<ScrollArea className="max-h-[200px]">
									<div className="space-y-1">
										{
											Object.entries(LANGUAGES).map(([key, lang]) => (
												<button
													key={key}
													onClick={() => setSelectedLanguage(key as AssessmentLanguage)}
													className={cn(
														"w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm",
														selectedLanguage === key
															? "bg-neutral-900 dark:bg-white text-white dark:text-black"
															: "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
													)}
												>
													<span>{lang.icon}</span>
													<span className="font-medium">{lang.label}</span>
												</button>
											))
										}
									</div>
								</ScrollArea>
							</div>
							<div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
								<h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
									<Target className="w-4 h-4" />
									Practice Mode
								</h3>
								<div className="grid grid-cols-2 gap-2">
									{
										Object.entries(MODES).map(([key, mode]) => (
											<button
												key={key}
												onClick={() => setSelectedMode(key as AssessmentMode)}
												className={cn(
													"flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
													selectedMode === key
														? "bg-emerald-600 border-emerald-600 text-white"
														: "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-emerald-400"
												)}
											>
												{mode.icon}
												<span className="text-xs font-medium">{mode.label}</span>
											</button>
										))
									}
								</div>
							</div>
							{
								selectedSubModule && (
									<Button
										className="w-full bg-emerald-600 hover:bg-emerald-700"
										size="lg"
										onClick={() => handleStartPractice(
											selectedTopic?.id || '',
											selectedSubModule.id
										)}
									>
										<Play className="w-4 h-4 mr-2" />
										Start Practice
									</Button>
								)
							}
						</div>
						<div className="lg:w-2/3">
							<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'topics' | 'my-sets')}>
								<TabsList className="mb-4">
									<TabsTrigger value="topics" className="flex items-center gap-2">
										<BookOpen className="w-4 h-4" />
										Topics
									</TabsTrigger>
									<TabsTrigger value="my-sets" className="flex items-center gap-2">
										<Sparkles className="w-4 h-4" />
										My Practice Sets
										{
											filteredUserSets.length > 0 && (
												<Badge variant="secondary" className="ml-1">
													{filteredUserSets.length}
												</Badge>
											)
										}
									</TabsTrigger>
								</TabsList>
								<TabsContent value="topics">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
											Topics
										</h3>
										<Badge variant="outline">
											{modeConfig.icon}
											<span className="ml-1">{modeConfig.label}</span>
										</Badge>
									</div>
									{
										isLoadingTopics ? (
											<div className="flex items-center justify-center py-12">
												<Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
											</div>
										) : topics.length === 0 ? (
											<div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
												<BookOpen className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
												<h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
													No Topics Available
												</h3>
												<p className="text-neutral-600 dark:text-neutral-400 mb-4">
													Topics for {languageConfig.label} are coming soon.
												</p>
												<Button onClick={() => setIsCreateSheetOpen(true)}>
													<Plus className="w-4 h-4 mr-2" />
													Create Custom Practice Set
												</Button>
											</div>
										) : (
											<div className="space-y-4">
												{
													topics.map((topic, index) => (
														<motion.div
															key={topic.id}
															initial={{ opacity: 0, y: 10 }}
															animate={{ opacity: 1, y: 0 }}
															transition={{ delay: index * 0.05 }}
															className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
														>
															<button
																onClick={() => setSelectedTopic(
																	selectedTopic?.id === topic.id ? null : topic
																)}
																className="w-full flex items-center justify-between"
															>
																<div className="flex items-center gap-3">
																	<span className="text-2xl">{topic.icon || '📚'}</span>
																	<div className="text-left">
																		<h4 className="font-semibold text-neutral-900 dark:text-white">
																			{topic.name}
																		</h4>
																		<p className="text-sm text-neutral-500">
																			{topic.subModules.length} sub-modules • {topic.questionCount} questions
																		</p>
																	</div>
																</div>
																<div className="flex items-center gap-4">
																	<div className="text-right">
																		<div className="text-sm font-medium text-emerald-600">
																			{topic.overallProgress}% complete
																		</div>
																		<Progress
																			value={topic.overallProgress}
																			className="w-24 h-1"
																		/>
																	</div>
																	<ChevronRight className={cn(
																		"w-5 h-5 transition-transform",
																		selectedTopic?.id === topic.id && "rotate-90"
																	)} />
																</div>
															</button>
															<AnimatePresence>
																{
																	selectedTopic?.id === topic.id && (
																		<motion.div
																			initial={{ height: 0, opacity: 0 }}
																			animate={{ height: 'auto', opacity: 1 }}
																			exit={{ height: 0, opacity: 0 }}
																			className="overflow-hidden"
																		>
																			<div className="grid md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
																				{
																					topic.subModules.map((module) => (
																						<button
																							key={module.id}
																							onClick={() => module.isUnlocked && setSelectedSubModule(
																								selectedSubModule?.id === module.id ? null : module
																							)}
																							disabled={!module.isUnlocked}
																							className={cn(
																								"text-left p-3 rounded-lg border transition-all",
																								selectedSubModule?.id === module.id
																									? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500"
																									: module.isUnlocked
																										? "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
																										: "opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-900"
																							)}
																						>
																							<div className="flex items-center justify-between mb-1">
																								<span className="font-medium text-sm text-neutral-900 dark:text-white">
																									{module.name}
																								</span>
																								{!module.isUnlocked && (
																									<Lock className="w-4 h-4 text-neutral-400" />
																								)}
																							</div>
																							<p className="text-xs text-neutral-500 line-clamp-1">
																								{module.description}
																							</p>
																							<div className="flex items-center justify-between mt-2">
																								<span className="text-xs text-neutral-400">
																									{module.questionCount} questions
																								</span>
																								{
																									module.isUnlocked && (
																										<span className="text-xs text-emerald-600">
																											{module.accuracyRate}% accuracy
																										</span>
																									)
																								}
																							</div>
																						</button>
																					))
																				}
																			</div>
																		</motion.div>
																	)
																}
															</AnimatePresence>
														</motion.div>
													))
												}
											</div>
										)
									}
								</TabsContent>
								<TabsContent value="my-sets">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
											My Practice Sets
										</h3>
										<Button
											size="sm"
											onClick={() => setIsCreateSheetOpen(true)}
										>
											<Plus className="w-4 h-4 mr-2" />
											Create New
										</Button>
									</div>

									{
										isLoadingUserSets ? (
											<div className="flex items-center justify-center py-12">
												<Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
											</div>
										) : filteredUserSets.length === 0 ? (
											<div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
												<Sparkles className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
												<h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
													No Practice Sets Yet
												</h3>
												<p className="text-neutral-600 dark:text-neutral-400 mb-4">
													Create custom AI-generated practice sets for {languageConfig.label}.
												</p>
												<Button onClick={() => setIsCreateSheetOpen(true)}>
													<Plus className="w-4 h-4 mr-2" />
													Create Practice Set
												</Button>
											</div>
										) : (
											<div className="grid md:grid-cols-2 gap-4">
												{
													filteredUserSets.map((set, index) => (
														<motion.div
															key={set.id}
															initial={{ opacity: 0, y: 10 }}
															animate={{ opacity: 1, y: 0 }}
															transition={{ delay: index * 0.05 }}
														>
															<Card
																className={cn(
																	"cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-all",
																	set.status !== 'ACTIVE' && "opacity-70"
																)}
																onClick={() => set.status === 'ACTIVE' && handleStartUserSet(set.id)}
															>
																<CardContent className="p-4">
																	<div className="flex items-start justify-between mb-2">
																		<div className="flex items-center gap-2">
																			<span className="text-xl">
																				{LANGUAGES[set.language]?.icon || '📝'}
																			</span>
																			<Badge
																				variant="outline"
																				className={statusColors[set.status as keyof typeof statusColors]}
																			>
																				{set.status === 'ACTIVE' ? 'Ready' : set.status}
																			</Badge>
																		</div>
																		{
																			set.isPublic && (
																				<Badge variant="secondary" className="text-xs">
																					Public
																				</Badge>
																			)
																		}
																	</div>
																	<h4 className="font-semibold text-neutral-900 dark:text-white mb-1 line-clamp-1">
																		{set.title}
																	</h4>
																	<p className="text-sm text-neutral-500 mb-3 line-clamp-2">
																		{set.description || 'No description'}
																	</p>
																	<div className="flex items-center justify-between text-xs text-neutral-500">
																		<div className="flex items-center gap-3">
																			<span className="flex items-center gap-1">
																				<FileQuestion className="w-3 h-3" />
																				{set.questionCount} questions
																			</span>
																			<Badge variant="outline" className="text-xs">
																				{set.difficulty}
																			</Badge>
																		</div>
																		<div className="flex items-center gap-2">
																			<span className="flex items-center gap-1">
																				<Eye className="w-3 h-3" />
																				{set.views}
																			</span>
																			<span className="flex items-center gap-1">
																				<Heart className="w-3 h-3" />
																				{set._count?.likedBy || 0}
																			</span>
																		</div>
																	</div>
																</CardContent>
															</Card>
														</motion.div>
													))
												}
											</div>
										)
									}
								</TabsContent>
							</Tabs>
						</div>
					</div>
				</div>
			</section>

			<CreateSetSheet
				type="practice"
				open={isCreateSheetOpen}
				onOpenChange={setIsCreateSheetOpen}
				defaultLanguage={selectedLanguage}
				defaultMode={selectedMode}
			/>
		</main>
	)
}

export default function PracticePage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
			</div>
		}>
			<PracticeContent />
		</Suspense>
	)
}