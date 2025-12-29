"use client"

import { motion } from "framer-motion"
import { Building2, Globe, MapPin, Save, Upload } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Textarea } from "@repo/ui/components/ui/textarea"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select"
import { useState } from "react"

export default function CompanyPage() {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // TODO: Implement company update
        setTimeout(() => setLoading(false), 1000)
    }

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                    Company Profile
                </h1>
                <p className="text-neutral-500 mt-1">
                    Manage your company information and branding
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl space-y-8"
                >
                    {/* Logo & Branding */}
                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <h2 className="font-bold text-lg text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Branding
                        </h2>
                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center">
                                <Upload className="w-8 h-8 text-neutral-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-neutral-900 dark:text-white mb-1">Company Logo</h3>
                                <p className="text-sm text-neutral-500 mb-4">
                                    Upload a square logo at least 200x200px in PNG or JPG format.
                                </p>
                                <Button type="button" variant="outline" size="sm" className="rounded-xl">
                                    Upload Logo
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <h2 className="font-bold text-lg text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Company Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name" className="text-sm font-medium">Company Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Your company name"
                                    className="mt-2 rounded-xl"
                                />
                            </div>
                            <div>
                                <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                                <Input
                                    id="website"
                                    placeholder="https://example.com"
                                    className="mt-2 rounded-xl"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
                                    <Select>
                                        <SelectTrigger className="mt-2 rounded-xl">
                                            <SelectValue placeholder="Select industry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="technology">Technology</SelectItem>
                                            <SelectItem value="finance">Finance</SelectItem>
                                            <SelectItem value="healthcare">Healthcare</SelectItem>
                                            <SelectItem value="education">Education</SelectItem>
                                            <SelectItem value="ecommerce">E-commerce</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="size" className="text-sm font-medium">Company Size</Label>
                                    <Select>
                                        <SelectTrigger className="mt-2 rounded-xl">
                                            <SelectValue placeholder="Select size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1-10">1-10 employees</SelectItem>
                                            <SelectItem value="11-50">11-50 employees</SelectItem>
                                            <SelectItem value="51-200">51-200 employees</SelectItem>
                                            <SelectItem value="201-500">201-500 employees</SelectItem>
                                            <SelectItem value="500+">500+ employees</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="description" className="text-sm font-medium">Company Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Tell candidates about your company, culture, and mission..."
                                    className="mt-2 rounded-xl min-h-[120px]"
                                />
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
                                <Label htmlFor="headquarters" className="text-sm font-medium">Headquarters</Label>
                                <Input
                                    id="headquarters"
                                    placeholder="City, Country"
                                    className="mt-2 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </motion.div>
            </form>
        </div>
    )
}
