'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { 
    Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@repo/ui/components/ui/card'
import {
    Building2, Sparkles, Target, TrendingUp, CheckCircle,
    ArrowLeft, Plus, Star, Users, Trophy, ArrowRight, Search
} from 'lucide-react'
import { 
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle 
} from '@repo/ui/components/ui/sheet'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Label } from '@repo/ui/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/ui/radio-group'
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@repo/ui/components/ui/select'
import toast from '@repo/ui/components/ui/sonner'

// Mock company data
const companies = [
    {
        id: 'google',
        name: 'Google',
        logo: '🔵',
        totalMocks: 45,
        activeUsers: 2340,
        avgRating: 4.8,
        featured: true
    },
    {
        id: 'amazon',
        name: 'Amazon',
        logo: '🟠',
        totalMocks: 38,
        activeUsers: 1890,
        avgRating: 4.7,
        featured: true
    },
    {
        id: 'microsoft',
        name: 'Microsoft',
        logo: '🟦',
        totalMocks: 42,
        activeUsers: 2150,
        avgRating: 4.6,
        featured: true
    },
    {
        id: 'meta',
        name: 'Meta',
        logo: '🔷',
        totalMocks: 35,
        activeUsers: 1650,
        avgRating: 4.5,
        featured: true
    },
    {
        id: 'apple',
        name: 'Apple',
        logo: '⚪',
        totalMocks: 30,
        activeUsers: 1420,
        avgRating: 4.7,
        featured: true
    },
    {
        id: 'netflix',
        name: 'Netflix',
        logo: '🔴',
        totalMocks: 28,
        activeUsers: 1280,
        avgRating: 4.6,
        featured: false
    },
    {
        id: 'salesforce',
        name: 'Salesforce',
        logo: '🔷',
        totalMocks: 25,
        activeUsers: 980,
        avgRating: 4.5,
        featured: false
    },
    {
        id: 'uber',
        name: 'Uber',
        logo: '⚫',
        totalMocks: 22,
        activeUsers: 850,
        avgRating: 4.4,
        featured: false
    }
]

const features = [
    {
        icon: <Building2 className="w-5 h-5" />,
        title: 'Company-Specific Questions',
        description: 'Practice with questions tailored to each company\'s interview style and culture.'
    },
    {
        icon: <Target className="w-5 h-5" />,
        title: 'Real Interview Rounds',
        description: 'Experience authentic interview rounds based on actual company processes.'
    },
    {
        icon: <Users className="w-5 h-5" />,
        title: 'Community Insights',
        description: 'Learn from others who have interviewed at your target companies.'
    },
    {
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Success Tracking',
        description: 'Track your performance and see how you compare to successful candidates.'
    },
]

export default function CompanywiseMockPage() {
    const [createSheetOpen, setCreateSheetOpen] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState('')
    const [position, setPosition] = useState('')
    const [description, setDescription] = useState('')
    const [questionsCount, setQuestionsCount] = useState('5')
    const [visibility, setVisibility] = useState<'public' | 'private'>('public')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const featuredCompanies = companies.filter(c => c.featured)

    const calculateCredits = () => {
        const baseCredits = 10
        const questionsCredits = parseInt(questionsCount) * 2
        const visibilityDiscount = visibility === 'public' ? 0.5 : 1
        return Math.round((baseCredits + questionsCredits) * visibilityDiscount)
    }

    const handleCreateMock = () => {
        const credits = calculateCredits()
        toast.success(`Mock created for ${selectedCompany}! ${credits} credits deducted.`)
        setCreateSheetOpen(false)
    }

    return (
        <main className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <Link href="/mockinterview">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Mock Interviews
                    </Button>
                </Link>
            </div>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 bg-white dark:bg-neutral-950">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center space-y-6"
                    >
                        <Badge className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 px-4 py-1.5">
                            <Building2 className="w-3 h-3 mr-1.5" />
                            Company-Specific Mock Interviews
                        </Badge>

                        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400">
                            Prepare for Your
                            <br />
                            Dream Company
                        </h1>

                        <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Practice with company-specific interview questions and formats. Ace your FAANG and
                            top-tier tech company interviews with realistic practice sessions.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button
                                size="lg"
                                className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                onClick={() => setCreateSheetOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Company Mock
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-neutral-300 dark:border-neutral-700"
                                onClick={() => document.getElementById('companies')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Browse Companies
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 border-y border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: '12K+', label: 'Total Mocks', icon: Target },
                            { value: '50+', label: 'Companies', icon: Building2 },
                            { value: '4.7/5', label: 'Avg Rating', icon: Star },
                            { value: '87%', label: 'Success Rate', icon: Trophy },
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="flex justify-center mb-2">
                                    <stat.icon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                                </div>
                                <div className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white dark:bg-neutral-950">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
                            Why Company-Specific Practice?
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Each company has unique interview styles and expectations
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="bg-white dark:bg-neutral-900 shadow-lg rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 h-full">
                                    <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 w-fit mb-4">
                                        {feature.icon}
                                    </div>
                                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Companies */}
            <section className="py-16 bg-neutral-50 dark:bg-neutral-900/50 border-y border-neutral-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-2 text-center">
                            ⭐ Top FAANG Companies
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-400 text-center">
                            Most popular companies for interview preparation
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {featuredCompanies.map((company, index) => (
                            <motion.div
                                key={company.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Link href={`/mockinterview/companywise/${company.id}`}>
                                    <Card className="h-full bg-white dark:bg-neutral-900 shadow-lg border border-neutral-200 dark:border-neutral-800 hover:shadow-2xl transition-all cursor-pointer group">
                                        <CardHeader className="text-center">
                                            <div className="text-6xl mb-4">{company.logo}</div>
                                            <CardTitle className="text-lg group-hover:underline underline-offset-4">
                                                {company.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-center">
                                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                                {company.totalMocks} mocks
                                            </div>
                                            <div className="flex items-center justify-center gap-1">
                                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                <span className="text-sm font-medium">{company.avgRating}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* All Companies */}
            <section id="companies" className="py-16 bg-white dark:bg-neutral-950">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-2">
                                    All Companies
                                </h2>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    Browse all available companies for interview preparation
                                </p>
                            </div>
                            <Button
                                className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                onClick={() => setCreateSheetOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Mock
                            </Button>
                        </div>

                        <div className="mb-6">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <Input
                                    placeholder="Search companies..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredCompanies.map((company, index) => (
                                <motion.div
                                    key={company.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    viewport={{ once: true }}
                                >
                                    <Link href={`/mockinterview/companywise/${company.id}`}>
                                        <Card className="h-full bg-white dark:bg-neutral-900 shadow-lg border border-neutral-200 dark:border-neutral-800 hover:shadow-2xl transition-all cursor-pointer group">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="text-4xl">{company.logo}</div>
                                                    {company.featured && (
                                                        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-0 text-xs">
                                                            Featured
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardTitle className="text-lg group-hover:underline underline-offset-4">
                                                    {company.name}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-neutral-600 dark:text-neutral-400">Mocks</span>
                                                    <span className="font-medium text-neutral-900 dark:text-white">{company.totalMocks}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-neutral-600 dark:text-neutral-400">Users</span>
                                                    <span className="font-medium text-neutral-900 dark:text-white">{company.activeUsers.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-neutral-600 dark:text-neutral-400">Rating</span>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                        <span className="font-medium text-neutral-900 dark:text-white">{company.avgRating}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl p-12 border border-neutral-200 dark:border-neutral-800 text-center"
                    >
                        <Building2 className="w-16 h-16 mx-auto mb-6 text-neutral-700 dark:text-neutral-300" />
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
                            Target Your Dream Company
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
                            Practice with company-specific questions and increase your chances of success.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                onClick={() => setCreateSheetOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Company Mock
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-neutral-300 dark:border-neutral-700"
                                onClick={() => document.getElementById('companies')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Browse All Companies
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Create Company Mock Sheet */}
            <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Create Company-Specific Mock</SheetTitle>
                        <SheetDescription>
                            Create a tailored mock interview for a specific company
                        </SheetDescription>
                    </SheetHeader>
                    
                    <div className="space-y-6 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a company" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map(company => (
                                        <SelectItem key={company.id} value={company.name}>
                                            <div className="flex items-center gap-2">
                                                <span>{company.logo}</span>
                                                <span>{company.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="position">Position/Role</Label>
                            <Input
                                id="position"
                                placeholder="e.g., Senior Software Engineer"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Any specific areas you want to focus on?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="questionsCount">Number of Questions</Label>
                            <Select value={questionsCount} onValueChange={setQuestionsCount}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 questions</SelectItem>
                                    <SelectItem value="10">10 questions</SelectItem>
                                    <SelectItem value="15">15 questions</SelectItem>
                                    <SelectItem value="20">20 questions</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                Base: 10 credits + {parseInt(questionsCount) * 2} credits for {questionsCount} questions
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Label>Visibility</Label>
                            <RadioGroup value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                                <div className="flex items-center space-x-2 p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                                    <RadioGroupItem value="public" id="public-company" />
                                    <Label htmlFor="public-company" className="flex-1">
                                        <div>
                                            <div className="font-medium">Public (50% off)</div>
                                            <div className="text-xs text-neutral-600 dark:text-neutral-400">Share with the community</div>
                                        </div>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                                    <RadioGroupItem value="private" id="private-company" />
                                    <Label htmlFor="private-company" className="flex-1">
                                        <div>
                                            <div className="font-medium">Private</div>
                                            <div className="text-xs text-neutral-600 dark:text-neutral-400">Only for you</div>
                                        </div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Total Credits Required</span>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {calculateCredits()}
                                </span>
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                {visibility === 'public' ? '50% discount applied for public mocks' : 'Full price for private mocks'}
                            </p>
                        </div>

                        <div className="pt-4">
                            <Button 
                                className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                onClick={handleCreateMock}
                                disabled={!selectedCompany || !position}
                            >
                                Create Mock Interview
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </main>
    )
}
