'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import {
	Brain, Sparkles, TrendingUp, Trophy, Target, Star, Award, ChevronRight,
	Code, FileQuestion, Mic, BookOpen, Zap, ArrowRight, Play, Flame, Medal,
	GraduationCap, BarChart3, Eye, Heart, Clock, Loader2, Users
} from 'lucide-react'
import { cn } from '@repo/ui/lib/utils'
import { getPublicPracticeSets, getPublicExamSets } from '@/actions/(main)/assessments/user-sets.action'
import type { PracticeSetPreview, ExamSetPreview } from '@/types/assessment'

// Types for the component
type AssessmentLanguage = 'JAVASCRIPT' | 'PYTHON' | 'C' | 'CPP' | 'REACTJS' | 'NODEJS' | 'TYPESCRIPT'
type AssessmentMode = 'QUIZ' | 'CODE' | 'MOCK' | 'MIXED'
type QuestionDifficulty = 'EASY' | 'INTERMEDIATE' | 'ADVANCED'

// Language Configuration
const LANGUAGES: Array<{
	value: AssessmentLanguage
	label: string
	icon: string
	color: string
	description: string
}> = [
		{ value: 'JAVASCRIPT', label: 'JavaScript', icon: '🟨', color: '#f7df1e', description: 'Modern JS, ES6+, DOM, Async' },
		{ value: 'PYTHON', label: 'Python', icon: '🐍', color: '#3776ab', description: 'Core Python, OOP, Libraries' },
		{ value: 'C', label: 'C', icon: '🔷', color: '#00599c', description: 'Pointers, Memory, Systems' },
		{ value: 'CPP', label: 'C++', icon: '🔶', color: '#f34b7d', description: 'OOP, STL, Templates' },
		{ value: 'REACTJS', label: 'React.js', icon: '⚛️', color: '#61dafb', description: 'Hooks, State, Components' },
		{ value: 'NODEJS', label: 'Node.js', icon: '🟩', color: '#339933', description: 'Express, APIs, Backend' },
		{ value: 'TYPESCRIPT', label: 'TypeScript', icon: '🔵', color: '#3178c6', description: 'Types, Generics, Advanced' },
	]

// Mode Configuration
const MODES: Array<{
	value: AssessmentMode
	label: string
	icon: React.ReactNode
	description: string
}> = [
		{ value: 'QUIZ', label: 'Quiz Mode', icon: <FileQuestion className="w-5 h-5" />, description: 'MCQs and theory questions' },
		{ value: 'CODE', label: 'Code Mode', icon: <Code className="w-5 h-5" />, description: 'Code output and debugging' },
		{ value: 'MOCK', label: 'Mock Mode', icon: <Mic className="w-5 h-5" />, description: 'Interview-style scenarios' },
		{ value: 'MIXED', label: 'Mixed Mode', icon: <Sparkles className="w-5 h-5" />, description: 'All question types' },
	]

// Difficulty Configuration
const DIFFICULTIES: Array<{
	value: QuestionDifficulty
	label: string
	color: string
	description: string
	timeLimit: string
	passingScore: number
}> = [
		{ value: 'EASY', label: 'Easy', color: '#22c55e', description: 'Beginner friendly', timeLimit: '20 min', passingScore: 60 },
		{ value: 'INTERMEDIATE', label: 'Intermediate', color: '#f59e0b', description: 'Working knowledge', timeLimit: '30 min', passingScore: 65 },
		{ value: 'ADVANCED', label: 'Advanced', color: '#ef4444', description: 'Expert level', timeLimit: '45 min', passingScore: 70 },
	]

// Stats
const stats = [
	{ icon: Trophy, value: '10K+', label: 'Assessments Taken' },
	{ icon: Star, value: '4.8/5', label: 'Avg Rating' },
	{ icon: Award, value: '5K+', label: 'Certificates Issued' },
	{ icon: TrendingUp, value: '92%', label: 'Pass Rate' },
]

// Features
const features = [
	{
		icon: <Brain className="w-5 h-5" />,
		title: 'AI-Generated Exams',
		description: 'Unique questions generated for each exam attempt.',
	},
	{
		icon: <BookOpen className="w-5 h-5" />,
		title: 'Structured Practice',
		description: 'Learn progressively with topic-wise sub-modules.',
	},
	{
		icon: <Zap className="w-5 h-5" />,
		title: 'Instant Feedback',
		description: 'Get detailed explanations for every question.',
	},
	{
		icon: <GraduationCap className="w-5 h-5" />,
		title: 'Verified Certificates',
		description: 'Earn certificates valid for 1 year.',
	},
]

export default function AssessmentsPage() {
	// State
	const [activeLanguage, setActiveLanguage] = useState<AssessmentLanguage>('JAVASCRIPT')
	const [selectedMode, setSelectedMode] = useState<AssessmentMode>('QUIZ')
	const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty>('EASY')
	const [languageProgress, setLanguageProgress] = useState<Record<string, number>>({})

	// Public sets state
	const [publicPracticeSets, setPublicPracticeSets] = useState<PracticeSetPreview[]>([])
	const [publicExamSets, setPublicExamSets] = useState<ExamSetPreview[]>([])
	const [isLoadingPublicSets, setIsLoadingPublicSets] = useState(true)

	// Fetch public sets
	const fetchPublicSets = useCallback(async () => {
		setIsLoadingPublicSets(true)
		try {
			const [practiceResult, examResult] = await Promise.all([
				getPublicPracticeSets({ limit: 6, sortBy: 'newest' }),
				getPublicExamSets({ limit: 6, sortBy: 'newest' })
			])
			
			if (practiceResult.success && Array.isArray(practiceResult.data)) {
				setPublicPracticeSets(practiceResult.data as PracticeSetPreview[])
			}
			if (examResult.success && Array.isArray(examResult.data)) {
				setPublicExamSets(examResult.data as ExamSetPreview[])
			}
		} catch (error) {
			console.error('Error fetching public sets:', error)
		}
		setIsLoadingPublicSets(false)
	}, [])

	useEffect(() => {
		fetchPublicSets()
	}, [fetchPublicSets])

	// Mock data for demonstration (will be replaced with actual API calls)
	useEffect(() => {
		// Simulate loading progress
		setLanguageProgress({
			JAVASCRIPT: 45,
			PYTHON: 30,
			C: 10,
			CPP: 15,
			REACTJS: 60,
			NODEJS: 25,
			TYPESCRIPT: 35,
		})
	}, [])

	const currentLanguage = LANGUAGES.find(l => l.value === activeLanguage)
	const currentMode = MODES.find(m => m.value === selectedMode)
	const currentDifficulty = DIFFICULTIES.find(d => d.value === selectedDifficulty)

	const handleStartPractice = () => {
		// Navigate to practice page
		window.location.href = `/assessments/practice?language=${activeLanguage}&mode=${selectedMode}`
	}

	const handleStartExam = () => {
		// Navigate to exam page
		window.location.href = `/assessments/exam?language=${activeLanguage}&difficulty=${selectedDifficulty}`
	}

	return (
		<main className="min-h-screen bg-white dark:bg-neutral-950">
			<section className="relative overflow-hidden py-16 bg-white dark:bg-neutral-950">
				<div className="absolute inset-0 overflow-hidden">
					<motion.div
						className="absolute top-20 left-1/4 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl"
						animate={{
							scale: [1, 1.2, 1],
							opacity: [0.3, 0.5, 0.3],
						}}
						transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
					/>
					<motion.div
						className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl"
						animate={{
							scale: [1, 1.3, 1],
							opacity: [0.2, 0.4, 0.2],
						}}
						transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
					/>
				</div>
				<div className="relative max-w-7xl mx-auto px-6">
					<motion.div
						className="text-center space-y-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
							<Badge className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 px-4">
								<Brain className="w-3 h-3 mr-1.5" />
								Skill Assessments
							</Badge>
						</motion.div>
						<motion.h1
							className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
						>
							Master Your Skills.
							<br />
							Get Certified.
						</motion.h1>
						<motion.p
							className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 }}
						>
							Practice with structured modules, take AI-generated exams, and earn
							verified certificates to showcase your expertise.
						</motion.p>
						<motion.div
							className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4 }}
						>
							<Button
								size="lg"
								className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
								onClick={() => document.getElementById('assessment-section')?.scrollIntoView({ behavior: 'smooth' })}
							>
								Start Assessment
								<ArrowRight className="w-4 h-4 ml-2" />
							</Button>
							<Link href="/assessments/certificates">
								<Button
									size="lg"
									variant="outline"
									className="border-neutral-300 dark:border-neutral-700"
								>
									<Medal className="w-4 h-4 mr-2" />
									View Certificates
								</Button>
							</Link>
						</motion.div>
						<motion.div
							className="flex flex-wrap gap-3 justify-center pt-4"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
						>
							<Link href="/assessments/practice">
								<Button variant="ghost" size="sm" className="text-neutral-600 dark:text-neutral-400">
									<BookOpen className="w-4 h-4 mr-2" />
									Practice Mode
								</Button>
							</Link>
							<Link href="/assessments/leaderboard">
								<Button variant="ghost" size="sm" className="text-neutral-600 dark:text-neutral-400">
									<Trophy className="w-4 h-4 mr-2" />
									Leaderboard
								</Button>
							</Link>
							<Link href="/assessments/history">
								<Button variant="ghost" size="sm" className="text-neutral-600 dark:text-neutral-400">
									<BarChart3 className="w-4 h-4 mr-2" />
									My Progress
								</Button>
							</Link>
						</motion.div>
					</motion.div>
				</div>
			</section>
			<section className="py-8 border-y border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
				<div className="max-w-7xl mx-auto px-6">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
						{
							stats.map((stat, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, scale: 0.9 }}
									whileInView={{ opacity: 1, scale: 1 }}
									transition={{ delay: index * 0.1 }}
									viewport={{ once: true }}
									className="text-center"
								>
									<div className="flex justify-center mb-2">
										<stat.icon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
									</div>
									<div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
										{stat.value}
									</div>
									<div className="text-sm text-neutral-600 dark:text-neutral-400">
										{stat.label}
									</div>
								</motion.div>
							))
						}
					</div>
				</div>
			</section>
			<section id="assessment-section" className="py-12 bg-white dark:bg-neutral-950">
				<div className="max-w-7xl mx-auto px-6">
					<div className="flex items-center justify-between mb-8">
						<div>
							<h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-1">
								🎯 Choose Your Assessment
							</h2>
							<p className="text-neutral-600 dark:text-neutral-400">
								Select a language and start practicing or take an exam
							</p>
						</div>
					</div>
					<div className="flex flex-col lg:flex-row gap-6">
						<div className="lg:w-1/3">
							<div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sticky top-4">
								<h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
									<Code className="w-4 h-4" />
									Languages
								</h3>
								<ScrollArea className="h-auto lg:max-h-[500px]">
									<div className="space-y-1">
										{
											LANGUAGES.map((language) => (
												<button
													key={language.value}
													onClick={() => setActiveLanguage(language.value)}
													className={cn(
														"w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
														activeLanguage === language.value
															? "bg-neutral-900 dark:bg-white text-white dark:text-black"
															: "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
													)}
												>
													<span className="text-lg">{language.icon}</span>
													<div className="flex-1 min-w-0">
														<span className="font-medium block">{language.label}</span>
														<span className={cn(
															"text-xs truncate block",
															activeLanguage === language.value
																? "text-neutral-300 dark:text-neutral-600"
																: "text-neutral-500 dark:text-neutral-500"
														)}>
															{language.description}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="w-12 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
															<div
																className="h-full rounded-full transition-all"
																style={{
																	width: `${languageProgress[language.value] || 0}%`,
																	backgroundColor: language.color
																}}
															/>
														</div>
														<ChevronRight className={cn(
															"w-4 h-4 transition-transform flex-shrink-0",
															activeLanguage === language.value && "rotate-90"
														)} />
													</div>
												</button>
											))
										}
									</div>
								</ScrollArea>
							</div>
						</div>
						<div className="lg:w-2/3">
							<AnimatePresence mode="wait">
								<motion.div
									key={activeLanguage}
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20 }}
									transition={{ duration: 0.2 }}
									className="space-y-6"
								>
									<div className="flex items-center gap-3 mb-6">
										<span className="text-3xl">{currentLanguage?.icon}</span>
										<div>
											<h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
												{currentLanguage?.label}
											</h3>
											<p className="text-neutral-600 dark:text-neutral-400">
												{currentLanguage?.description}
											</p>
										</div>
										<div className="ml-auto">
											<Badge
												variant="outline"
												className="px-3 py-1"
												style={{ borderColor: currentLanguage?.color, color: currentLanguage?.color }}
											>
												{languageProgress[activeLanguage] || 0}% Complete
											</Badge>
										</div>
									</div>
									<div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50 p-6">
										<div className="flex items-start gap-4 mb-4">
											<div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">
												<BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
											</div>
											<div className="flex-1">
												<h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
													Practice Mode
												</h4>
												<p className="text-sm text-neutral-600 dark:text-neutral-400">
													Learn at your own pace with topic-wise modules and instant feedback
												</p>
											</div>
										</div>
										<div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
											{
												MODES.map((mode) => (
													<button
														key={mode.value}
														onClick={() => setSelectedMode(mode.value)}
														className={cn(
															"flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
															selectedMode === mode.value
																? "bg-emerald-600 border-emerald-600 text-white"
																: "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-emerald-400"
														)}
													>
														{mode.icon}
														<span className="text-xs font-medium">{mode.label}</span>
													</button>
												))
											}
										</div>
										<Button
											className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
											onClick={handleStartPractice}
										>
											<Play className="w-4 h-4 mr-2" />
											Start Practice ({currentMode?.label})
										</Button>
									</div>
									<div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-200 dark:border-amber-800/50 p-6">
										<div className="flex items-start gap-4 mb-4">
											<div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
												<GraduationCap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
											</div>
											<div className="flex-1">
												<h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
													Take Exam
												</h4>
												<p className="text-sm text-neutral-600 dark:text-neutral-400">
													AI-generated unique questions • Timed assessment • Get certified
												</p>
											</div>
										</div>
										<div className="grid grid-cols-3 gap-3 mb-4">
											{
												DIFFICULTIES.map((diff) => (
													<button
														key={diff.value}
														onClick={() => setSelectedDifficulty(diff.value)}
														className={cn(
															"flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
															selectedDifficulty === diff.value
																? "border-2"
																: "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:border-amber-400"
														)}
														style={{
															borderColor: selectedDifficulty === diff.value ? diff.color : undefined,
															backgroundColor: selectedDifficulty === diff.value
																? `${diff.color}15`
																: undefined
														}}
													>
														<span
															className="text-sm font-bold"
															style={{ color: diff.color }}
														>
															{diff.label}
														</span>
														<span className="text-xs text-neutral-500 dark:text-neutral-400">
															{diff.timeLimit}
														</span>
														<span className="text-xs text-neutral-500 dark:text-neutral-400">
															Pass: {diff.passingScore}%
														</span>
													</button>
												))
											}
										</div>
										<Button
											className="w-full bg-amber-600 hover:bg-amber-700 text-white"
											onClick={handleStartExam}
										>
											<Target className="w-4 h-4 mr-2" />
											Start {currentDifficulty?.label} Exam
										</Button>
									</div>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 text-center">
											<div className="text-2xl font-bold text-neutral-900 dark:text-white">150+</div>
											<div className="text-xs text-neutral-500">Questions</div>
										</div>
										<div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 text-center">
											<div className="text-2xl font-bold text-neutral-900 dark:text-white">8</div>
											<div className="text-xs text-neutral-500">Sub-Modules</div>
										</div>
										<div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 text-center">
											<div className="text-2xl font-bold text-emerald-600">45%</div>
											<div className="text-xs text-neutral-500">Your Progress</div>
										</div>
										<div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 text-center">
											<div className="text-2xl font-bold text-amber-600">2</div>
											<div className="text-xs text-neutral-500">Certificates</div>
										</div>
									</div>
								</motion.div>
							</AnimatePresence>
						</div>
					</div>
				</div>
			</section>
			<section className="py-12 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800">
				<div className="max-w-7xl mx-auto px-6">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-center mb-8"
					>
						<h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">
							Why Take Assessments?
						</h2>
						<p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
							Validate your skills with structured assessments and earn industry-recognized certificates
						</p>
					</motion.div>
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
						{
							features.map((feature, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
									viewport={{ once: true }}
									className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
								>
									<div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 w-fit mb-4">
										{feature.icon}
									</div>
									<h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
										{feature.title}
									</h3>
									<p className="text-sm text-neutral-600 dark:text-neutral-400">
										{feature.description}
									</p>
								</motion.div>
							))
						}
					</div>
				</div>
			</section>

			{/* Public Practice & Exam Sets Section */}
			<section className="py-12 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
				<div className="max-w-7xl mx-auto px-6">
					{/* Public Practice Sets */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="mb-12"
					>
						<div className="flex items-center justify-between mb-6">
							<div>
								<h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
									📚 Community Practice Sets
								</h2>
								<p className="text-neutral-600 dark:text-neutral-400">
									Explore practice sets created by the community
								</p>
							</div>
							<Link href="/assessments/community/practice">
								<Button variant="outline">
									View All
									<ArrowRight className="w-4 h-4 ml-2" />
								</Button>
							</Link>
						</div>

						{isLoadingPublicSets ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
							</div>
						) : publicPracticeSets.length === 0 ? (
							<div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
								<BookOpen className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
								<p className="text-neutral-600 dark:text-neutral-400">
									No public practice sets yet. Be the first to create one!
								</p>
							</div>
						) : (
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
								{publicPracticeSets.map((set, index) => (
									<motion.div
										key={set.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.05 }}
									>
										<Link href={`/assessments/practice/set/${set.id}`}>
											<Card className="h-full hover:border-emerald-500/50 transition-all cursor-pointer">
												<CardContent className="p-4">
													<div className="flex items-start justify-between mb-2">
														<div className="flex items-center gap-2">
															<span className="text-xl">
																{LANGUAGES.find(l => l.value === set.language)?.icon || '📝'}
															</span>
															<Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
																Practice
															</Badge>
														</div>
														<Badge variant="secondary" className="text-xs">
															{set.difficulty}
														</Badge>
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
																{set.questionCount}
															</span>
															<span className="flex items-center gap-1">
																<Users className="w-3 h-3" />
																{set._count?.attempts || 0}
															</span>
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
													{set.creator && (
														<div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
															<div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
															<span className="text-xs text-neutral-500">
																by {set.creator.name || 'Anonymous'}
															</span>
														</div>
													)}
												</CardContent>
											</Card>
										</Link>
									</motion.div>
								))}
							</div>
						)}
					</motion.div>

					{/* Public Exam Sets */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
					>
						<div className="flex items-center justify-between mb-6">
							<div>
								<h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
									🏆 Community Exam Sets
								</h2>
								<p className="text-neutral-600 dark:text-neutral-400">
									Challenge yourself with community-created exams
								</p>
							</div>
							<Link href="/assessments/community/exam">
								<Button variant="outline">
									View All
									<ArrowRight className="w-4 h-4 ml-2" />
								</Button>
							</Link>
						</div>

						{isLoadingPublicSets ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
							</div>
						) : publicExamSets.length === 0 ? (
							<div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
								<Award className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
								<p className="text-neutral-600 dark:text-neutral-400">
									No public exam sets yet. Be the first to create one!
								</p>
							</div>
						) : (
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
								{publicExamSets.map((set, index) => (
									<motion.div
										key={set.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.05 }}
									>
										<Link href={`/assessments/exam/set/${set.id}`}>
											<Card className="h-full hover:border-amber-500/50 transition-all cursor-pointer">
												<CardContent className="p-4">
													<div className="flex items-start justify-between mb-2">
														<div className="flex items-center gap-2">
															<span className="text-xl">
																{LANGUAGES.find(l => l.value === set.language)?.icon || '📝'}
															</span>
															<Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
																Exam
															</Badge>
														</div>
														<Badge variant="secondary" className="text-xs">
															{set.difficulty}
														</Badge>
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
																{set.questionCount}
															</span>
															<span className="flex items-center gap-1">
																<Clock className="w-3 h-3" />
																{Math.floor(set.timeLimit / 60)}m
															</span>
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
													{set.creator && (
														<div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
															<div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
															<span className="text-xs text-neutral-500">
																by {set.creator.name || 'Anonymous'}
															</span>
														</div>
													)}
												</CardContent>
											</Card>
										</Link>
									</motion.div>
								))}
							</div>
						)}
					</motion.div>
				</div>
			</section>

			<section className="py-16 bg-white dark:bg-neutral-950">
				<div className="max-w-4xl mx-auto px-6 text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-100 dark:to-neutral-200 rounded-2xl p-8 md:p-12"
					>
						<Badge className="bg-white/20 dark:bg-black/20 text-white dark:text-black mb-4">
							<Flame className="w-3 h-3 mr-1" />
							Start Today
						</Badge>
						<h2 className="text-2xl md:text-3xl font-bold text-white dark:text-black mb-4">
							Ready to Prove Your Skills?
						</h2>
						<p className="text-neutral-300 dark:text-neutral-700 mb-6 max-w-xl mx-auto">
							Join thousands of developers who have validated their expertise and earned certificates through our assessments.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button
								size="lg"
								className="bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
								onClick={() => document.getElementById('assessment-section')?.scrollIntoView({ behavior: 'smooth' })}
							>
								Take Assessment
								<ArrowRight className="w-4 h-4 ml-2" />
							</Button>
							<Link href="/assessments/practice">
								<Button
									size="lg"
									variant="outline"
									className="border-white/30 dark:border-black/30 text-white dark:text-black hover:bg-white/10 dark:hover:bg-black/10"
								>
									Start Practicing
								</Button>
							</Link>
						</div>
					</motion.div>
				</div>
			</section>
		</main>
	)
}