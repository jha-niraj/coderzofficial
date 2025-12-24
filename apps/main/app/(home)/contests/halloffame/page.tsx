"use client"

import { useState } from "react"
import { Card, CardContent } from "@repo/ui/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar"
import { Badge } from "@repo/ui/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { ThumbsUp, Trophy, Medal } from "lucide-react"

// Define interfaces for type safety
interface Contest {
    id: number;
    title: string;
    date: string;
    description: string;
    participants: number;
}

interface Project {
    name: string;
    description: string;
    author: {
        name: string;
        image: string;
    };
    likes: number;
    tags: string[];
}

interface ProjectWinner extends Project {
    place: number;
}

interface ContestWinners {
    [key: number]: ProjectWinner[];
}

const pastContests: Contest[] = [
    {
        id: 1,
        title: "Web3 Wonders",
        date: "April 2025",
        description: "Build something amazing with blockchain. No, not another NFT marketplace, please.",
        participants: 98,
    },
    {
        id: 2,
        title: "Mobile Marvels",
        date: "March 2025",
        description:
            "Create a mobile app that solves a real problem. No, another social media app is not solving a problem.",
        participants: 112,
    },
    {
        id: 3,
        title: "AI for Good",
        date: "February 2025",
        description: "Create an AI solution that makes the world a better place. No Skynet allowed.",
        participants: 143,
    },
    {
        id: 4,
        title: "Fintech Revolution",
        date: "January 2025",
        description: "Revolutionize the way people handle money. Make finance fun (if that's even possible).",
        participants: 87,
    },
]

// Generate winners for each contest
const generateWinners = (): ContestWinners => {
    const contestWinners: ContestWinners = {};

    const projects: Project[] = [
        {
            name: "Decentralized Identity",
            description: "A blockchain-based identity verification system that puts users in control of their data.",
            author: {
                name: "Alice Chen",
                image: "/placeholder.svg?height=40&width=40&text=A",
            },
            likes: 45,
            tags: ["Blockchain", "Identity", "Privacy"],
        },
        {
            name: "Smart Contract Auditor",
            description: "Automated tool that scans smart contracts for vulnerabilities and suggests fixes.",
            author: {
                name: "Bob Smith",
                image: "/placeholder.svg?height=40&width=40&text=B",
            },
            likes: 38,
            tags: ["Solidity", "Security", "Automation"],
        },
        {
            name: "DeFi Dashboard",
            description: "All-in-one dashboard for managing DeFi investments across multiple chains.",
            author: {
                name: "Charlie Kim",
                image: "/placeholder.svg?height=40&width=40&text=C",
            },
            likes: 32,
            tags: ["DeFi", "Dashboard", "Multi-chain"],
        },
        {
            name: "Accessibility Navigator",
            description: "Mobile app that helps people with disabilities navigate cities more easily.",
            author: {
                name: "Diana Patel",
                image: "/placeholder.svg?height=40&width=40&text=D",
            },
            likes: 56,
            tags: ["Accessibility", "Navigation", "React Native"],
        },
        {
            name: "Local Food Finder",
            description: "App connecting consumers with local farmers and food producers in their area.",
            author: {
                name: "Ethan Johnson",
                image: "/placeholder.svg?height=40&width=40&text=E",
            },
            likes: 49,
            tags: ["Local", "Food", "Community"],
        },
        {
            name: "Mental Health Tracker",
            description: "Privacy-focused app for tracking mood and mental health patterns over time.",
            author: {
                name: "Fiona Williams",
                image: "/placeholder.svg?height=40&width=40&text=F",
            },
            likes: 41,
            tags: ["Health", "Privacy", "Analytics"],
        },
        {
            name: "AI Tutor",
            description: "Personalized AI tutor that adapts to individual learning styles and needs.",
            author: {
                name: "George Lee",
                image: "/placeholder.svg?height=40&width=40&text=G",
            },
            likes: 62,
            tags: ["Education", "AI", "Personalization"],
        },
        {
            name: "Healthcare Predictor",
            description: "AI system that predicts potential health issues based on anonymized medical data.",
            author: {
                name: "Hannah Garcia",
                image: "/placeholder.svg?height=40&width=40&text=H",
            },
            likes: 54,
            tags: ["Healthcare", "AI", "Prediction"],
        },
        {
            name: "Education Equalizer",
            description: "Platform bringing quality education to underserved communities worldwide.",
            author: {
                name: "Ian Patel",
                image: "/placeholder.svg?height=40&width=40&text=I",
            },
            likes: 47,
            tags: ["Education", "Equality", "Global"],
        },
        {
            name: "Budget Buddy",
            description: "Personal finance app that uses behavioral psychology to improve saving habits.",
            author: {
                name: "Julia Kim",
                image: "/placeholder.svg?height=40&width=40&text=J",
            },
            likes: 58,
            tags: ["Finance", "Psychology", "Habits"],
        },
        {
            name: "Crypto Simplifier",
            description: "Makes cryptocurrency accessible to non-technical users with simple explanations.",
            author: {
                name: "Kevin Johnson",
                image: "/placeholder.svg?height=40&width=40&text=K",
            },
            likes: 51,
            tags: ["Crypto", "Education", "UX"],
        },
        {
            name: "Invoice Ninja",
            description: "Automated invoicing system for freelancers with payment reminders and tracking.",
            author: {
                name: "Laura Chen",
                image: "/placeholder.svg?height=40&width=40&text=L",
            },
            likes: 43,
            tags: ["Freelance", "Finance", "Automation"],
        },
    ]

    pastContests.forEach((contest, index) => {
        // Assign different projects to each contest
        const startIdx = (index * 3) % projects.length
        contestWinners[contest.id] = [
            { ...projects[startIdx % projects.length], place: 1 },
            { ...projects[(startIdx + 1) % projects.length], place: 2 },
            { ...projects[(startIdx + 2) % projects.length], place: 3 },
            { ...projects[(startIdx + 3) % projects.length], place: 4 },
            { ...projects[(startIdx + 4) % projects.length], place: 5 },
            { ...projects[(startIdx + 5) % projects.length], place: 6 },
            { ...projects[(startIdx + 6) % projects.length], place: 7 },
            { ...projects[(startIdx + 7) % projects.length], place: 8 },
            { ...projects[(startIdx + 8) % projects.length], place: 9 },
            { ...projects[(startIdx + 9) % projects.length], place: 10 },
        ]
    })

    return contestWinners
}

const contestWinners = generateWinners()

export default function HallOfFamePage() {
    const [selectedContest, setSelectedContest] = useState(pastContests[0].id.toString())

    return (
        <div className="container py-12">
            <div className="mb-12 text-center">
                <h1 className="mb-4 text-4xl font-bold text-[#1A202C]">Hall of Fame</h1>
                <p className="mx-auto max-w-2xl text-lg text-[#718096]">
                    Celebrating the brilliant minds behind our winning projects. These coding heroes have earned their place in
                    the Coderz history books!
                </p>
            </div>
            <Tabs value={selectedContest} onValueChange={setSelectedContest} className="space-y-8">
                <div className="sticky top-16 z-10 bg-white pb-4">
                    <TabsList className="flex w-full justify-start gap-2 overflow-x-auto bg-transparent p-0">
                        {
                            pastContests.map((contest) => (
                                <TabsTrigger
                                    key={contest.id}
                                    value={contest.id.toString()}
                                    className="rounded-full border border-[#00C4B4] bg-transparent px-4 py-2 data-[state=active]:bg-[#00C4B4] data-[state=active]:text-white"
                                >
                                    {contest.title}
                                </TabsTrigger>
                            ))
                        }
                    </TabsList>
                </div>
                {
                    pastContests.map((contest) => (
                        <TabsContent key={contest.id} value={contest.id.toString()} className="space-y-12">
                            <div className="rounded-lg bg-gradient-to-r from-[#00C4B4]/20 to-transparent p-8">
                                <h2 className="mb-2 text-3xl font-bold text-[#1A202C]">{contest.title}</h2>
                                <p className="mb-4 text-lg text-[#718096]">{contest.description}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-[#718096]">
                                    <div>Date: {contest.date}</div>
                                    <div>Participants: {contest.participants}</div>
                                </div>
                            </div>
                            <div>
                                <h3 className="mb-8 text-center text-2xl font-bold text-[#1A202C]">Top 3 Winners</h3>
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                    {
                                        contestWinners[contest.id]
                                            .filter((winner) => winner.place <= 3)
                                            .sort((a, b) => a.place - b.place)
                                            .map((winner) => (
                                                <div
                                                    key={winner.place}
                                                    className={`relative rounded-lg ${winner.place === 1
                                                        ? "bg-gradient-to-b from-yellow-50 to-white"
                                                        : winner.place === 2
                                                            ? "bg-gradient-to-b from-gray-50 to-white"
                                                            : "bg-gradient-to-b from-amber-50 to-white"
                                                        } p-6 shadow-lg`}
                                                >
                                                    <div className="absolute -right-3 -top-3">
                                                        {
                                                            winner.place === 1 ? (
                                                                <Trophy className="h-12 w-12 text-yellow-500" />
                                                            ) : winner.place === 2 ? (
                                                                <Medal className="h-10 w-10 text-gray-400" />
                                                            ) : (
                                                                <Medal className="h-10 w-10 text-amber-700" />
                                                            )
                                                        }
                                                    </div>
                                                    <div className="mb-4 flex items-center gap-4">
                                                        <Avatar className="h-16 w-16 border-2 border-[#00C4B4]">
                                                            <AvatarImage src={winner.author.image || "/placeholder.svg"} alt={winner.author.name} />
                                                            <AvatarFallback className="text-lg">{winner.author.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h4 className="text-xl font-bold text-[#1A202C]">{winner.name}</h4>
                                                            <p className="text-[#718096]">by {winner.author.name}</p>
                                                        </div>
                                                    </div>
                                                    <p className="mb-4 text-[#718096]">{winner.description}</p>
                                                    <div className="mb-4 flex flex-wrap gap-2">
                                                        {
                                                            winner.tags.map((tag, index) => (
                                                                <Badge key={index} variant="secondary" className="bg-[#00C4B4]/10 text-[#00C4B4]">
                                                                    {tag}
                                                                </Badge>
                                                            ))
                                                        }
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[#718096]">
                                                        <ThumbsUp className="h-4 w-4" />
                                                        <span>{winner.likes} likes</span>
                                                    </div>
                                                </div>
                                            ))
                                    }
                                </div>
                            </div>
                            <div>
                                <h3 className="mb-8 text-center text-2xl font-bold text-[#1A202C]">Honorable Mentions</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {
                                        contestWinners[contest.id]
                                            .filter((winner) => winner.place > 3)
                                            .map((winner) => (
                                                <Card key={winner.place} className="overflow-hidden">
                                                    <CardContent className="p-4">
                                                        <div className="mb-3 flex items-center gap-3">
                                                            <Avatar>
                                                                <AvatarImage src={winner.author.image || "/placeholder.svg"} alt={winner.author.name} />
                                                                <AvatarFallback>{winner.author.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <h4 className="font-semibold text-[#1A202C]">{winner.name}</h4>
                                                                <p className="text-sm text-[#718096]">by {winner.author.name}</p>
                                                            </div>
                                                        </div>
                                                        <p className="mb-3 text-sm text-[#718096]">{winner.description}</p>
                                                        <div className="mb-3 flex flex-wrap gap-1">
                                                            {
                                                                winner.tags.map((tag, index) => (
                                                                    <Badge key={index} variant="secondary" className="bg-[#00C4B4]/10 text-xs text-[#00C4B4]">
                                                                        {tag}
                                                                    </Badge>
                                                                ))
                                                            }
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-[#718096]">
                                                            <ThumbsUp className="h-3 w-3" />
                                                            <span>{winner.likes} likes</span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                    }
                                </div>
                            </div>
                        </TabsContent>
                    ))
                }
            </Tabs>
        </div>
    )
}