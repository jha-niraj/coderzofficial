"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Save, Briefcase, MapPin, DollarSign, Clock } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import Link from "next/link"
import { useState } from "react"

export default function NewJobPage() {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // TODO: Implement job creation
        setTimeout(() => setLoading(false), 1000)
    }

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/jobs">
                    <Button variant="ghost" size="icon" className="rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                        Create New Job
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Fill in the details to post a new position
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl space-y-8"
                >
                    {/* Basic Info */}
                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <h2 className="font-bold text-lg text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                            <Briefcase className="w-5 h-5" />
                            Basic Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title" className="text-sm font-medium">Job Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Senior Frontend Developer"
                                    className="mt-2 rounded-xl"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                                    <Select>
                                        <SelectTrigger className="mt-2 rounded-xl">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="engineering">Engineering</SelectItem>
                                            <SelectItem value="design">Design</SelectItem>
                                            <SelectItem value="product">Product</SelectItem>
                                            <SelectItem value="marketing">Marketing</SelectItem>
                                            <SelectItem value="sales">Sales</SelectItem>
                                            <SelectItem value="hr">Human Resources</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="type" className="text-sm font-medium">Employment Type</Label>
                                    <Select>
                                        <SelectTrigger className="mt-2 rounded-xl">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fulltime">Full-time</SelectItem>
                                            <SelectItem value="parttime">Part-time</SelectItem>
                                            <SelectItem value="contract">Contract</SelectItem>
                                            <SelectItem value="internship">Internship</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <h2 className="font-bold text-lg text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Location
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="location" className="text-sm font-medium">Work Location</Label>
                                <Select>
                                    <SelectTrigger className="mt-2 rounded-xl">
                                        <SelectValue placeholder="Select work model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="remote">Remote</SelectItem>
                                        <SelectItem value="onsite">On-site</SelectItem>
                                        <SelectItem value="hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="city" className="text-sm font-medium">City (if applicable)</Label>
                                <Input
                                    id="city"
                                    placeholder="e.g. San Francisco, CA"
                                    className="mt-2 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Compensation */}
                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <h2 className="font-bold text-lg text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Compensation
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="minSalary" className="text-sm font-medium">Minimum Salary</Label>
                                <Input
                                    id="minSalary"
                                    type="number"
                                    placeholder="50000"
                                    className="mt-2 rounded-xl"
                                />
                            </div>
                            <div>
                                <Label htmlFor="maxSalary" className="text-sm font-medium">Maximum Salary</Label>
                                <Input
                                    id="maxSalary"
                                    type="number"
                                    placeholder="80000"
                                    className="mt-2 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <h2 className="font-bold text-lg text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Job Details
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="description" className="text-sm font-medium">Job Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                                    className="mt-2 rounded-xl min-h-[200px]"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="requirements" className="text-sm font-medium">Requirements</Label>
                                <Textarea
                                    id="requirements"
                                    placeholder="List the skills, experience, and qualifications required..."
                                    className="mt-2 rounded-xl min-h-[150px]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Link href="/jobs">
                            <Button type="button" variant="outline" className="rounded-xl">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? "Publishing..." : "Publish Job"}
                        </Button>
                    </div>
                </motion.div>
            </form>
        </div>
    )
}
