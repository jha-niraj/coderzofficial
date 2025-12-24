"use client"

import Link from "next/link"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent } from "@repo/ui/components/ui/card"
import { Badge } from "@repo/ui/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar"
import { CalendarDays, Trophy, Users, ThumbsUp, ExternalLink, Github, Clock, Check } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/ui/dialog"
import SmoothScroll from "@/components/smoothscroll"
import { useState } from "react"

const generateContests = () => {
    return [
        {
            id: 1,
            title: "Eco-Tech Revolution",
            description: "Build something that helps the environment. Because saving the planet is cool, even for coders.",
            status: "active",
            startDate: "April 21, 2025",
            endDate: "April 28, 2025",
            participants: 124,
            daysLeft: 6,
        },
        {
            id: 2,
            title: "AI for Good",
            description: "Create an AI solution that makes the world a better place. No Skynet allowed.",
            status: "upcoming",
            startDate: "May 5, 2025",
            endDate: "May 12, 2025",
            participants: 0,
            daysLeft: 13,
        },
        {
            id: 3,
            title: "Fintech Revolution",
            description: "Revolutionize the way people handle money. Make finance fun (if that's even possible).",
            status: "upcoming",
            startDate: "May 19, 2025",
            endDate: "May 26, 2025",
            participants: 0,
            daysLeft: 27,
        },
        {
            id: 4,
            title: "Web3 Wonders",
            description: "Build something amazing with blockchain. No, not another NFT marketplace, please.",
            status: "past",
            startDate: "April 7, 2025",
            endDate: "April 14, 2025",
            participants: 98,
            winners: [
                { name: "Decentralized Identity", author: "Alice Chen", likes: 45 },
                { name: "Smart Contract Auditor", author: "Bob Smith", likes: 38 },
                { name: "DeFi Dashboard", author: "Charlie Kim", likes: 32 },
            ],
        },
        {
            id: 5,
            title: "Mobile Marvels",
            description:
                "Create a mobile app that solves a real problem. No, another social media app is not solving a problem.",
            status: "past",
            startDate: "March 24, 2025",
            endDate: "March 31, 2025",
            participants: 112,
            winners: [
                { name: "Accessibility Navigator", author: "Diana Patel", likes: 56 },
                { name: "Local Food Finder", author: "Ethan Johnson", likes: 49 },
                { name: "Mental Health Tracker", author: "Fiona Williams", likes: 41 },
            ],
        },
    ]
}

const contests = generateContests()
const activeContest = contests.find((contest) => contest.status === "active")

// Generate demo benefits
const benefits = [
    {
        title: "Showcase Your Skills",
        description: "Put your coding prowess on display and get recognized by peers and potential employers.",
        icon: <Trophy className="h-10 w-10 text-[#00C4B4]" />,
    },
    {
        title: "Learn New Technologies",
        description: "Each contest theme pushes you to explore new frameworks, libraries, and approaches.",
        icon: <ExternalLink className="h-10 w-10 text-[#00C4B4]" />,
    },
    {
        title: "Build Your Portfolio",
        description: "Add impressive projects to your portfolio and stand out in the job market.",
        icon: <Github className="h-10 w-10 text-[#00C4B4]" />,
    },
    {
        title: "Connect with Peers",
        description: "Join a community of like-minded developers and forge valuable connections.",
        icon: <Users className="h-10 w-10 text-[#00C4B4]" />,
    },
]

// Generate top projects
const topProjects = [
    {
        id: 1,
        name: "Eco-Solar App",
        description: "A solar panel efficiency calculator with carbon offset tracking",
        author: {
            name: "Alice Chen",
            image: "/placeholder.svg?height=40&width=40",
        },
        likes: 25,
        tags: ["React", "TailwindCSS", "Solar API"],
    },
    {
        id: 2,
        name: "Green Chatbot",
        description: "AI assistant that helps users make environmentally friendly choices",
        author: {
            name: "Bob Smith",
            image: "/placeholder.svg?height=40&width=40",
        },
        likes: 18,
        tags: ["AI", "NLP", "Node.js"],
    },
    {
        id: 3,
        name: "Carbon Tracker",
        description: "Track and reduce your carbon footprint with gamification elements",
        author: {
            name: "Charlie Kim",
            image: "/placeholder.svg?height=40&width=40",
        },
        likes: 16,
        tags: ["Vue.js", "Firebase", "D3.js"],
    },
]

export default function Home() {
    const [ joinDialog, setJoinDialog ] = useState(false);

    const handleJoinDialog = () => {

    }

    return (
        <SmoothScroll>
            <div className="min-h-screen">
                {
                    activeContest && (
                        <section className="bg-gradient-to-b from-[#00C4B4]/10 to-transparent pt-48">
                            <div className="container">
                                <div className="mx-auto max-w-4xl text-center">
                                    <Badge className="mb-4 bg-[#00C4B4] text-white">ACTIVE CONTEST</Badge>
                                    <h1 className="mb-4 text-4xl font-bold text-[#1A202C] sm:text-5xl md:text-6xl">
                                        Bi-Weekly Coding Smackdown
                                    </h1>
                                    <p className="mb-4 text-xl text-[#718096]">
                                        Current Theme: <span className="font-semibold text-[#00C4B4]">{activeContest.title}</span>
                                    </p>
                                    <p className="mb-8 text-lg text-[#718096]">{activeContest.description}</p>
                                    <div className="mb-8 flex flex-wrap justify-center gap-6">
                                        <div className="flex items-center gap-2 text-[#718096]">
                                            <CalendarDays className="h-5 w-5 text-[#00C4B4]" />
                                            <span>
                                                {activeContest.startDate} - {activeContest.endDate}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[#718096]">
                                            <Clock className="h-5 w-5 text-[#00C4B4]" />
                                            <span>Ends in {activeContest.daysLeft} days</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[#718096]">
                                            <Users className="h-5 w-5 text-[#00C4B4]" />
                                            <span>{activeContest.participants} participants</span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setJoinDialog(true)}
                                        className="bg-[#00C4B4] text-white hover:bg-[#00B4A4]"
                                    >
                                        Join the Contest
                                    </Button>
                                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="bg-[#00C4B4] text-white hover:bg-[#00B4A4]">Join the Contest</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle className="text-2xl font-bold text-[#00C4B4]">{activeContest.title}</DialogTitle>
                                                    <DialogDescription className="text-[#718096]">
                                                        You&apos;re about to embark on a 7-day coding adventure!
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="rounded-md bg-[#00C4B4]/10 p-4">
                                                        <h4 className="mb-2 font-semibold text-[#1A202C]">Contest Details</h4>
                                                        <p className="text-[#718096]">{activeContest.description}</p>
                                                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#718096]">
                                                            <div className="flex items-center gap-2">
                                                                <CalendarDays className="h-4 w-4 text-[#00C4B4]" />
                                                                <span>
                                                                    {activeContest.startDate} - {activeContest.endDate}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4 text-[#00C4B4]" />
                                                                <span>Ends in {activeContest.daysLeft} days</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h4 className="font-semibold text-[#1A202C]">What you&apos;ll get:</h4>
                                                        <ul className="space-y-2 text-[#718096]">
                                                            <li className="flex items-start gap-2">
                                                                <Check className="mt-0.5 h-4 w-4 text-[#00C4B4]" />
                                                                <span>Showcase your skills to thousands of developers</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <Check className="mt-0.5 h-4 w-4 text-[#00C4B4]" />
                                                                <span>Receive valuable feedback from the community</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <Check className="mt-0.5 h-4 w-4 text-[#00C4B4]" />
                                                                <span>Chance to win prizes and recognition</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <Check className="mt-0.5 h-4 w-4 text-[#00C4B4]" />
                                                                <span>Add an impressive project to your portfolio</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <DialogFooter className="sm:justify-center">
                                                    <Link href="/contest-hub">
                                                        <Button className="w-full bg-[#00C4B4] text-white hover:bg-[#00B4A4]">
                                                            Count Me In! Let&apos;s Code
                                                        </Button>
                                                    </Link>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        <Link href="/rules">
                                            <Button variant="outline" className="border-[#4299E1] text-[#4299E1]">
                                                View Rules
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )
                }
                <section className="py-16 max-w-7xl mx-auto">
                    <div className="container py-24">
                        <h2 className="mb-12 text-center text-3xl font-bold text-[#1A202C]">Why Join Our Coding Contests?</h2>
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {
                                benefits.map((benefit, index) => (
                                    <Card key={index} className="border-none shadow-lg">
                                        <CardContent className="flex flex-col items-center p-6 text-center">
                                            <div className="mb-4 rounded-full bg-[#00C4B4]/10 p-4">{benefit.icon}</div>
                                            <h3 className="mb-2 text-xl font-semibold text-[#1A202C]">{benefit.title}</h3>
                                            <p className="text-[#718096]">{benefit.description}</p>
                                        </CardContent>
                                    </Card>
                                ))
                            }
                        </div>
                    </div>
                </section>
                <section className="max-w-7xl mx-auto bg-gray-50 py-16">
                    <div className="container">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[#1A202C]">Top Projects This Week</h2>
                            <Link href="/contest-hub" className="text-[#00C4B4] hover:underline">
                                View All Projects
                            </Link>
                        </div>
                        <div className="grid gap-6 md:grid-cols-3">
                            {
                                topProjects.map((project) => (
                                    <Card key={project.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                                        <CardContent className="p-0">
                                            <div className="p-6">
                                                <div className="mb-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={project.author.image || "/placeholder.svg"} alt={project.author.name} />
                                                            <AvatarFallback>{project.author.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h3 className="font-semibold text-[#1A202C]">{project.name}</h3>
                                                            <p className="text-sm text-[#718096]">by {project.author.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[#718096]">
                                                        <ThumbsUp className="h-4 w-4" />
                                                        <span>{project.likes}</span>
                                                    </div>
                                                </div>
                                                <p className="mb-4 text-[#718096]">{project.description}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {
                                                        project.tags.map((tag, index) => (
                                                            <Badge key={index} variant="secondary" className="bg-[#00C4B4]/10 text-[#00C4B4]">
                                                                {tag}
                                                            </Badge>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                            <div className="flex border-t">
                                                <Link
                                                    href={`/projects/${project.id}`}
                                                    className="flex w-full items-center justify-center gap-2 p-3 text-[#4299E1] transition-colors hover:bg-[#4299E1]/5"
                                                >
                                                    View Project
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            }
                        </div>
                    </div>
                </section>
                <section className="py-16 max-w-7xl mx-auto">
                    <div className="container">
                        <h2 className="mb-12 text-center text-3xl font-bold text-[#1A202C]">Contest Timeline</h2>
                        <div className="space-y-12">
                            <div>
                                <h3 className="mb-6 inline-block border-b-2 border-[#4299E1] pb-2 text-2xl font-semibold text-[#1A202C]">
                                    Upcoming Contests
                                </h3>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {
                                        contests
                                            .filter((contest) => contest.status === "upcoming")
                                            .map((contest) => (
                                                <Card key={contest.id} className="border-l-4 border-l-[#4299E1] shadow-md">
                                                    <CardContent className="p-6">
                                                        <Badge className="mb-2 bg-[#4299E1] text-white">Upcoming</Badge>
                                                        <h4 className="mb-2 text-xl font-semibold text-[#1A202C]">{contest.title}</h4>
                                                        <p className="mb-4 text-[#718096]">{contest.description}</p>
                                                        <div className="mb-4 space-y-2 text-sm text-[#718096]">
                                                            <div className="flex items-center gap-2">
                                                                <CalendarDays className="h-4 w-4 text-[#4299E1]" />
                                                                <span>
                                                                    {contest.startDate} - {contest.endDate}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4 text-[#4299E1]" />
                                                                <span>Starts in {(contest.daysLeft ?? 0) - 7} days</span>
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" className="w-full border-[#4299E1] text-[#4299E1]">
                                                            Get Notified
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            ))
                                    }
                                </div>
                            </div>
                            <div>
                                <h3 className="mb-6 inline-block border-b-2 border-[#718096] pb-2 text-2xl font-semibold text-[#1A202C]">
                                    Past Contests
                                </h3>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {
                                        contests
                                            .filter((contest) => contest.status === "past")
                                            .map((contest) => (
                                                <Card key={contest.id} className="border-l-4 border-l-[#718096] shadow-md">
                                                    <CardContent className="p-6">
                                                        <Badge className="mb-2 bg-[#718096] text-white">Completed</Badge>
                                                        <h4 className="mb-2 text-xl font-semibold text-[#1A202C]">{contest.title}</h4>
                                                        <p className="mb-4 text-[#718096]">{contest.description}</p>
                                                        <div className="mb-4 space-y-2 text-sm text-[#718096]">
                                                            <div className="flex items-center gap-2">
                                                                <CalendarDays className="h-4 w-4 text-[#718096]" />
                                                                <span>
                                                                    {contest.startDate} - {contest.endDate}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Users className="h-4 w-4 text-[#718096]" />
                                                                <span>{contest.participants} participants</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Trophy className="h-4 w-4 text-[#718096]" />
                                                                <span>Winner: {contest.winners?.[0]?.name}</span>
                                                            </div>
                                                        </div>
                                                        <Link href={`/hall-of-fame#contest-${contest.id}`}>
                                                            <Button variant="outline" className="w-full">
                                                                View Results
                                                            </Button>
                                                        </Link>
                                                    </CardContent>
                                                </Card>
                                            ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="bg-[#00C4B4]/10 py-16 max-w-7xl mx-auto">
                    <div className="container">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="mb-4 text-3xl font-bold text-[#1A202C]">Ready to Show Off Your Coding Skills?</h2>
                            <p className="mb-8 text-lg text-[#718096]">
                                Join our bi-weekly coding contests and build something epic. No pressure, just pure coding fun!
                            </p>
                            <Button 
                                onClick={() => setJoinDialog(true)}
                                className="bg-[#00C4B4] text-white hover:bg-[#00B4A4]"
                            >
                                Join the Current Contest
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </SmoothScroll>
    )
}
