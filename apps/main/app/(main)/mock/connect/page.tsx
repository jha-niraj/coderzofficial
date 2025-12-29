'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@repo/ui/components/ui/card'
import {
    Phone, Target, ArrowLeft, Star, Users, Trophy, Calendar, Clock,
    Award, Shield, Briefcase
} from 'lucide-react'
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet'
import {
    Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious
} from '@repo/ui/components/ui/pagination'
import toast from '@repo/ui/components/ui/sonner'

// Mock mentor data
interface Mentor {
    id: string
    name: string
    avatar: string
    company: string
    role: string
    specialty: string
    experience: number
    rating: string
    sessionsCompleted: number
    pricePerSession: number
    availability: {
        [key: string]: number[]
    }
    bio: string
}

const generateMentors = (): Mentor[] => {
    const companies = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Uber', 'Airbnb']
    const roles = ['Senior Engineer', 'Staff Engineer', 'Engineering Manager', 'Tech Lead', 'Principal Engineer']
    const specialties = ['System Design', 'Frontend', 'Backend', 'Full Stack', 'Mobile', 'Data Engineering']

    return Array.from({ length: 50 }, (_, i) => ({
        id: `mentor-${i + 1}`,
        name: `Mentor ${i + 1}`,
        avatar: `👤`,
        company: companies[i % companies.length] || 'Google',
        role: roles[i % roles.length] || 'Senior Engineer',
        specialty: specialties[i % specialties.length] || 'System Design',
        experience: Math.floor(Math.random() * 10) + 5,
        rating: (4 + Math.random()).toFixed(1),
        sessionsCompleted: Math.floor(Math.random() * 200) + 50,
        pricePerSession: Math.floor(Math.random() * 50) + 50,
        availability: {
            monday: [9, 10, 14, 15, 16],
            tuesday: [10, 11, 15, 16],
            wednesday: [9, 13, 14, 15],
            thursday: [10, 11, 14, 16],
            friday: [9, 10, 15, 16],
            saturday: [],
            sunday: []
        },
        bio: 'Experienced engineer passionate about mentoring aspiring developers. Specialized in technical interviews and career guidance.'
    }))
}

const mentors = generateMentors()

const features = [
    {
        icon: <Users className="w-5 h-5" />,
        title: 'Expert Mentors',
        description: 'Learn from engineers at top tech companies with years of interview experience.'
    },
    {
        icon: <Target className="w-5 h-5" />,
        title: 'Personalized Guidance',
        description: 'Get customized advice tailored to your background and target companies.'
    },
    {
        icon: <Calendar className="w-5 h-5" />,
        title: 'Flexible Scheduling',
        description: 'Book sessions at times that work for you with mentors across time zones.'
    },
    {
        icon: <Trophy className="w-5 h-5" />,
        title: 'Proven Success',
        description: 'Our mentors have helped hundreds of candidates land their dream jobs.'
    },
    {
        icon: <Shield className="w-5 h-5" />,
        title: 'Quality Assured',
        description: 'All mentors are vetted professionals with proven track records.'
    },
    {
        icon: <Award className="w-5 h-5" />,
        title: 'Real-World Insights',
        description: 'Get insider knowledge about company cultures and interview processes.'
    },
]

const ITEMS_PER_PAGE = 20

export default function ConnectMentorsPage() {
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedDay, setSelectedDay] = useState<string | null>(null)
    const [selectedTime, setSelectedTime] = useState<number | null>(null)

    const totalPages = Math.ceil(mentors.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentMentors = mentors.slice(startIndex, endIndex)

    const handleViewDetails = (mentor: Mentor) => {
        setSelectedMentor(mentor)
        setSelectedDay(null)
        setSelectedTime(null)
        setSheetOpen(true)
    }

    const handleDayClick = (day: string) => {
        const availability = selectedMentor?.availability[day.toLowerCase()] || []
        if (availability.length === 0) {
            toast.error('This day is not available')
            return
        }
        setSelectedDay(day)
        setSelectedTime(null)
    }

    const handleTimeClick = (hour: number) => {
        if (!selectedDay) return
        const availability = selectedMentor?.availability[selectedDay.toLowerCase()] || []
        if (!availability.includes(hour)) {
            toast.error('This time slot is not available')
            return
        }
        setSelectedTime(hour)
    }

    const handleBooking = () => {
        if (!selectedDay || selectedTime === null) {
            toast.error('Please select a day and time')
            return
        }
        const credits = selectedMentor?.pricePerSession
        toast.success(`Session booked with ${selectedMentor?.name}! ${credits} credits deducted.`)
        setSheetOpen(false)
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    return (
        <main className="min-h-screen bg-white dark:bg-neutral-950">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <Link href="/mockinterview">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Mock Interviews
                    </Button>
                </Link>
            </div>
            <section className="relative overflow-hidden py-20 bg-white dark:bg-neutral-950">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center space-y-6"
                    >
                        <Badge className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 px-4 py-1.5">
                            <Phone className="w-3 h-3 mr-1.5" />
                            Expert Mentorship
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400">
                            Your Success Story
                            <br />
                            Starts with a Conversation
                        </h1>
                        <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Connect with industry leaders from top tech companies. Get personalized guidance,
                            insider insights, and the confidence to ace your next interview.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button
                                size="lg"
                                className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                onClick={() => document.getElementById('mentors')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Browse Mentors
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-neutral-300 dark:border-neutral-700"
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Learn More
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
            <section className="py-12 border-y border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {
                            [
                                { value: '2K+', label: 'Expert Mentors', icon: Users },
                                { value: '15K+', label: 'Sessions Held', icon: Calendar },
                                { value: '4.9/5', label: 'Avg Rating', icon: Star },
                                { value: '91%', label: 'Success Rate', icon: Trophy },
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
                            ))
                        }
                    </div>
                </div>
            </section>
            <section id="mentors" className="py-16 bg-white dark:bg-neutral-950">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-2 text-center">
                            Meet Our Mentors
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-400 text-center">
                            Showing {startIndex + 1}-{Math.min(endIndex, mentors.length)} of {mentors.length} mentors
                        </p>
                    </motion.div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {
                            currentMentors.map((mentor, index) => (
                                <motion.div
                                    key={mentor.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    viewport={{ once: true }}
                                >
                                    <Card className="h-full bg-white dark:bg-neutral-900 shadow-lg border border-neutral-200 dark:border-neutral-800 hover:shadow-2xl transition-all">
                                        <CardHeader>
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="text-5xl">{mentor.avatar}</div>
                                                <Badge className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-0 text-xs">
                                                    {mentor.company}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-lg">{mentor.name}</CardTitle>
                                            <CardDescription className="text-sm">{mentor.role}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                                <Briefcase className="w-4 h-4" />
                                                <span>{mentor.specialty}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                                <Award className="w-4 h-4" />
                                                <span>{mentor.experience}+ years exp</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                <span className="text-sm font-medium">{mentor.rating}</span>
                                                <span className="text-xs text-neutral-600 dark:text-neutral-400">({mentor.sessionsCompleted})</span>
                                            </div>
                                            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Price</span>
                                                    <span className="text-lg font-bold text-neutral-900 dark:text-white">{mentor.pricePerSession}</span>
                                                </div>
                                                <Button
                                                    className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                                    onClick={() => handleViewDetails(mentor)}
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        }
                    </div>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                            {
                                Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pageNum = currentPage <= 3 ? i + 1 : currentPage + i - 2
                                    if (pageNum > totalPages) return null
                                    return (
                                        <PaginationItem key={i}>
                                            <PaginationLink
                                                onClick={() => setCurrentPage(pageNum)}
                                                isActive={currentPage === pageNum}
                                                className="cursor-pointer"
                                            >
                                                {pageNum}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                })
                            }
                            {
                                currentPage < totalPages - 2 && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )
                            }
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </section>
            <section id="features" className="py-16 bg-neutral-50 dark:bg-neutral-900/50 border-y border-neutral-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
                            Why Choose Our Mentors?
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Get the guidance you need to succeed from those who&apos;ve been there
                        </p>
                    </motion.div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {
                            features.map((feature, index) => (
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
                            ))
                        }
                    </div>
                </div>
            </section>
            <section className="py-20 bg-white dark:bg-neutral-950">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl p-12 border border-neutral-200 dark:border-neutral-800 text-center"
                    >
                        <Phone className="w-16 h-16 mx-auto mb-6 text-neutral-700 dark:text-neutral-300" />
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
                            Start Your Journey Today
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
                            Book a session with an expert mentor and take the first step towards your dream job.
                        </p>
                        <Button
                            size="lg"
                            className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                            onClick={() => document.getElementById('mentors')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Find Your Mentor
                        </Button>
                    </motion.div>
                </div>
            </section>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                    {
                        selectedMentor && (
                            <>
                                <SheetHeader>
                                    <SheetTitle className="text-2xl">{selectedMentor.name}</SheetTitle>
                                    <SheetDescription>
                                        {selectedMentor.role} at {selectedMentor.company}
                                    </SheetDescription>
                                </SheetHeader>

                                <div className="space-y-6 py-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="text-6xl">{selectedMentor.avatar}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                                    <span className="font-bold text-lg">{selectedMentor.rating}</span>
                                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        ({selectedMentor.sessionsCompleted} sessions)
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-0">
                                                        {selectedMentor.specialty}
                                                    </Badge>
                                                    <Badge className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-0">
                                                        {selectedMentor.experience}+ years
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{selectedMentor.bio}</p>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-lg">Select a Day</h3>
                                        <div className="grid grid-cols-7 gap-2">
                                            {
                                                days.map(day => {
                                                    const availability = selectedMentor.availability[day.toLowerCase()] || []
                                                    const isAvailable = availability.length > 0
                                                    const isSelected = selectedDay === day

                                                    return (
                                                        <button
                                                            key={day}
                                                            onClick={() => handleDayClick(day)}
                                                            disabled={!isAvailable}
                                                            className={`p-2 rounded-lg text-xs font-medium transition-all ${isSelected
                                                                ? 'bg-green-500 text-white'
                                                                : isAvailable
                                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                                                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            {day.slice(0, 3)}
                                                        </button>
                                                    )
                                                })
                                            }
                                        </div>
                                        <div className="flex items-center gap-4 text-xs">
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 rounded" />
                                                <span className="text-neutral-600 dark:text-neutral-400">Available</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 bg-green-500 rounded" />
                                                <span className="text-neutral-600 dark:text-neutral-400">Selected</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 bg-neutral-100 dark:bg-neutral-800 rounded" />
                                                <span className="text-neutral-600 dark:text-neutral-400">Unavailable</span>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        selectedDay && (
                                            <div className="space-y-3">
                                                <h3 className="font-semibold text-lg">Select a Time</h3>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {
                                                        Array.from({ length: 12 }, (_, i) => i + 9).map(hour => {
                                                            const availability = selectedMentor.availability[selectedDay.toLowerCase()] || []
                                                            const isAvailable = availability.includes(hour)
                                                            const isSelected = selectedTime === hour

                                                            return (
                                                                <button
                                                                    key={hour}
                                                                    onClick={() => handleTimeClick(hour)}
                                                                    disabled={!isAvailable}
                                                                    className={`p-2 rounded-lg text-sm font-medium transition-all ${isSelected
                                                                        ? 'bg-green-500 text-white'
                                                                        : isAvailable
                                                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                                                                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                                                                        }`}
                                                                >
                                                                    {hour}:00
                                                                </button>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        )
                                    }
                                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Session Price</span>
                                            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                                {selectedMentor.pricePerSession} credits
                                            </span>
                                        </div>
                                        {
                                            selectedDay && selectedTime !== null && (
                                                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    <Clock className="w-4 h-4 inline mr-1" />
                                                    {selectedDay} at {selectedTime}:00 (60 min session)
                                                </div>
                                            )
                                        }
                                    </div>
                                    <Button
                                        className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                        onClick={handleBooking}
                                        disabled={!selectedDay || selectedTime === null}
                                    >
                                        Book Session
                                    </Button>
                                </div>
                            </>
                        )
                    }
                </SheetContent>
            </Sheet>
        </main>
    )
}