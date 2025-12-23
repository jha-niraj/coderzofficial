"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, Github, ExternalLink, Filter, Search, Calendar, Clock } from "lucide-react"

// Generate demo projects
const generateProjects = (count: number) => {
    const projectNames = [
        "Eco-Solar App",
        "Green Chatbot",
        "Carbon Tracker",
        "Tree Planner",
        "Waste Reducer",
        "Ocean Cleaner",
        "Energy Saver",
        "Recycling Helper",
        "Climate Monitor",
        "Sustainable Shop",
        "Green Transport",
        "Eco Calculator",
    ]

    const descriptions = [
        "A solar panel efficiency calculator with carbon offset tracking",
        "AI assistant that helps users make environmentally friendly choices",
        "Track and reduce your carbon footprint with gamification elements",
        "Plan and track tree planting initiatives in your local area",
        "Smart waste sorting and reduction tracking system",
        "Monitor and visualize ocean cleanup efforts worldwide",
        "Smart home energy optimization and tracking",
        "Learn proper recycling techniques through AR",
        "Real-time climate change impact visualization",
        "Marketplace for sustainable and eco-friendly products",
        "Carbon-neutral transportation route planner",
        "Calculate the environmental impact of daily activities",
    ]

    const names = [
        "Alice Chen",
        "Bob Smith",
        "Charlie Kim",
        "Diana Patel",
        "Ethan Johnson",
        "Fiona Williams",
        "George Lee",
        "Hannah Garcia",
    ]

    const tags = [
        ["React", "TailwindCSS", "Solar API"],
        ["AI", "NLP", "Node.js"],
        ["Vue.js", "Firebase", "D3.js"],
        ["React Native", "Maps API", "MongoDB"],
        ["Angular", "TypeScript", "PostgreSQL"],
        ["Three.js", "WebGL", "REST API"],
        ["Svelte", "GraphQL", "AWS"],
        ["Flutter", "Dart", "Firebase"],
    ]

    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: projectNames[i % projectNames.length],
        description: descriptions[i % descriptions.length],
        author: {
            name: names[i % names.length],
            image: `/placeholder.svg?height=40&width=40&text=${names[i % names.length].charAt(0)}`,
        },
        likes: Math.floor(Math.random() * 21) + 5, // 5-25 likes
        tags: tags[i % tags.length],
        submittedAt: `${Math.floor(Math.random() * 23) + 1}h ago`,
    }))
}

const demoProjects = generateProjects(50)

export default function ContestDetailsPage({ slug } : { slug : string }) {
    const [searchQuery, setSearchQuery] = useState("")
    const [projects, setProjects] = useState(demoProjects)
    const [githubUrl, setGithubUrl] = useState("")
    const [demoUrl, setDemoUrl] = useState("")

    const handleLike = (id: number) => {
        setProjects(projects.map((project) => (project.id === id ? { ...project, likes: project.likes + 1 } : project)))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Mock submission
        alert("Your masterpiece has been submitted! May the code gods be ever in your favor.")
        setGithubUrl("")
        setDemoUrl("")
    }

    const filteredProjects = projects.filter(
        (project) =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    return (
        <div className="container py-12">
            <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold text-[#1A202C]">Eco-Tech Revolution Contest</h1>
                <div className="flex flex-wrap items-center gap-4 text-[#718096]">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#00C4B4]" />
                        <span>April 21 - April 28, 2025</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#00C4B4]" />
                        <span>Ends in 6 days</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Sidebar */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Submit Project Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-[#1A202C]">Submit Your Project</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="github-url" className="text-sm font-medium text-[#718096]">
                                        GitHub Repository URL
                                    </label>
                                    <div className="flex items-center rounded-md border px-3">
                                        <Github className="mr-2 h-4 w-4 text-[#718096]" />
                                        <Input
                                            id="github-url"
                                            placeholder="https://github.com/yourusername/project"
                                            value={githubUrl}
                                            onChange={(e) => setGithubUrl(e.target.value)}
                                            className="border-0 shadow-none focus-visible:ring-0"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="demo-url" className="text-sm font-medium text-[#718096]">
                                        Live Demo URL (Optional)
                                    </label>
                                    <div className="flex items-center rounded-md border px-3">
                                        <ExternalLink className="mr-2 h-4 w-4 text-[#718096]" />
                                        <Input
                                            id="demo-url"
                                            placeholder="https://your-demo-site.com"
                                            value={demoUrl}
                                            onChange={(e) => setDemoUrl(e.target.value)}
                                            className="border-0 shadow-none focus-visible:ring-0"
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-[#00C4B4] text-white hover:bg-[#00B4A4]">
                                    Submit Your Masterpiece
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Contest Rules Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-[#00C4B4]">Contest Rules</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="rounded-md bg-[#00C4B4]/10 p-3">
                                <p className="text-[#1A202C]">• Build your project in 7 days—procrastinators, we see you!</p>
                            </div>
                            <div className="rounded-md bg-[#00C4B4]/10 p-3">
                                <p className="text-[#1A202C]">• One vote per user per project—choose wisely, you clever soul.</p>
                            </div>
                            <div className="rounded-md bg-[#00C4B4]/10 p-3">
                                <p className="text-[#1A202C]">• No self-voting—save that ego for your GitHub bio.</p>
                            </div>
                            <div className="rounded-md bg-[#00C4B4]/10 p-3">
                                <p className="text-[#1A202C]">• Submit via GitHub by April 28, or it&apos;s a no-show.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contest Tips Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-[#00C4B4]">Contest Gossip</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-[#718096]">Tip: Test your code—our bots don&apos;t like surprises!</p>
                            <p className="text-[#718096]">Rumor has it the judges are partial to clean code. Just saying.</p>
                            <p className="text-[#718096]">
                                Last contest&apos;s winner debugged their entire project 5 minutes before the deadline. No pressure.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2">
                    {/* Search and Filter */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
                            <Input
                                placeholder="Search projects, tags, or users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                    </div>

                    {/* Projects Tabs */}
                    <Tabs defaultValue="newest" className="mb-6">
                        <TabsList className="w-full justify-start border-b bg-transparent p-0">
                            <TabsTrigger
                                value="newest"
                                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#00C4B4] data-[state=active]:bg-transparent data-[state=active]:text-[#00C4B4]"
                            >
                                Newest
                            </TabsTrigger>
                            <TabsTrigger
                                value="popular"
                                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#00C4B4] data-[state=active]:bg-transparent data-[state=active]:text-[#00C4B4]"
                            >
                                Most Popular
                            </TabsTrigger>
                            <TabsTrigger
                                value="trending"
                                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#00C4B4] data-[state=active]:bg-transparent data-[state=active]:text-[#00C4B4]"
                            >
                                Trending
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="newest" className="mt-6">
                            <div className="space-y-6">
                                {filteredProjects
                                    .sort((a, b) => b.id - a.id)
                                    .map((project) => (
                                        <ProjectCard key={project.id} project={project} onLike={handleLike} />
                                    ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="popular" className="mt-6">
                            <div className="space-y-6">
                                {filteredProjects
                                    .sort((a, b) => b.likes - a.likes)
                                    .map((project) => (
                                        <ProjectCard key={project.id} project={project} onLike={handleLike} />
                                    ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="trending" className="mt-6">
                            <div className="space-y-6">
                                {filteredProjects
                                    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt) || b.likes - a.likes)
                                    .map((project) => (
                                        <ProjectCard key={project.id} project={project} onLike={handleLike} />
                                    ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

interface Project {
    id: number
    name: string
    description: string
    author: {
        name: string
        image: string
    }
    likes: number
    tags: string[]
    submittedAt: string
}

interface ProjectCardProps {
    project: Project
    onLike: (id: number) => void
}

function ProjectCard({ project, onLike }: ProjectCardProps) {
    return (
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
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
                            <span className="text-xs">{project.submittedAt}</span>
                        </div>
                    </div>
                    <p className="mb-4 text-[#718096]">{project.description}</p>
                    <div className="mb-4 flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="bg-[#00C4B4]/10 text-[#00C4B4]">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 text-[#718096] hover:text-[#00C4B4]"
                            onClick={() => onLike(project.id)}
                        >
                            <ThumbsUp className="h-4 w-4" />
                            <span>{project.likes}</span>
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="text-xs">
                                View Demo
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                                GitHub
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
