"use client"

import { motion } from "framer-motion"
import { Building2, Globe, MapPin, Save, Upload, Mail, Phone, GraduationCap, Shield, Copy, RefreshCw } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Textarea } from "@repo/ui/components/ui/textarea"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select"
import { useState } from "react"

export default function UniversityProfilePage() {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // TODO: Implement university update
        setTimeout(() => setLoading(false), 1000)
    }

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                    University Profile
                </h1>
                <p className="text-neutral-500 mt-1">
                    Manage your university information and settings
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl space-y-8"
                >
                    {/* Verification Status */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-emerald-800 dark:text-emerald-300">Verified University</h3>
                                <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">
                                    Your university has been verified by the platform.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Logo & Branding */}
                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <h2 className="font-bold text-lg text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-violet-600" />
                            Branding
                        </h2>
                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 border-2 border-dashed border-violet-300 dark:border-violet-700 flex items-center justify-center">
                                <Upload className="w-8 h-8 text-violet-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-neutral-900 dark:text-white mb-1">University Logo</h3>
                                <p className="text-sm text-neutral-500 mb-4">
                                    Upload your university&apos;s official logo at least 200x200px in PNG or JPG format.
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
                            <Building2 className="w-5 h-5 text-violet-600" />
                            University Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name" className="text-sm font-medium">University Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Delhi Technical University"
                                    className="mt-2 rounded-xl"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="emailDomain" className="text-sm font-medium">Email Domain</Label>
                                    <Input
                                        id="emailDomain"
                                        placeholder="e.g., dtu.ac.in"
                                        className="mt-2 rounded-xl"
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">Students will verify with this domain</p>
                                </div>
                                <div>
                                    <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                                    <Input
                                        id="website"
                                        placeholder="https://example.edu"
                                        className="mt-2 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="type" className="text-sm font-medium">University Type</Label>
                                    <Select>
                                        <SelectTrigger className="mt-2 rounded-xl">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="public">Public University</SelectItem>
                                            <SelectItem value="private">Private University</SelectItem>
                                            <SelectItem value="deemed">Deemed University</SelectItem>
                                            <SelectItem value="autonomous">Autonomous College</SelectItem>
                                            <SelectItem value="affiliated">Affiliated College</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="established" className="text-sm font-medium">Established Year</Label>
                                    <Input
                                        id="established"
                                        type="number"
                                        placeholder="e.g., 1941"
                                        className="mt-2 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="accreditation" className="text-sm font-medium">Accreditation</Label>
                                <Input
                                    id="accreditation"
                                    placeholder="e.g., NAAC A++, NBA Accredited"
                                    className="mt-2 rounded-xl"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description" className="text-sm font-medium">University Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Tell students and companies about your university, programs, and achievements..."
                                    className="mt-2 rounded-xl min-h-[120px]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <h2 className="font-bold text-lg text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-violet-600" />
                            Contact Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="email" className="text-sm font-medium">Contact Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admissions@university.edu"
                                    className="mt-2 rounded-xl"
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                                <div className="flex items-center gap-2 mt-2">
                                    <Phone className="w-4 h-4 text-neutral-400" />
                                    <Input
                                        id="phone"
                                        placeholder="+91 11 2345 6789"
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <h2 className="font-bold text-lg text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-violet-600" />
                            Location
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                                <Input
                                    id="address"
                                    placeholder="Full address"
                                    className="mt-2 rounded-xl"
                                />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="city" className="text-sm font-medium">City</Label>
                                    <Input
                                        id="city"
                                        placeholder="City"
                                        className="mt-2 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="state" className="text-sm font-medium">State</Label>
                                    <Input
                                        id="state"
                                        placeholder="State"
                                        className="mt-2 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                                    <Input
                                        id="country"
                                        placeholder="India"
                                        defaultValue="India"
                                        className="mt-2 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="pincode" className="text-sm font-medium">PIN Code</Label>
                                    <Input
                                        id="pincode"
                                        placeholder="110001"
                                        className="mt-2 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invite Codes */}
                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <h2 className="font-bold text-lg text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-violet-600" />
                            Invite Codes
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium">Faculty Invite Code</Label>
                                <div className="flex items-center gap-2 mt-2">
                                    <Input
                                        readOnly
                                        value="UNI-FAC-XXXXXX"
                                        className="rounded-xl bg-neutral-50 dark:bg-neutral-900 font-mono"
                                    />
                                    <Button type="button" variant="outline" size="icon" className="rounded-xl shrink-0">
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button type="button" variant="outline" size="icon" className="rounded-xl shrink-0">
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-neutral-500 mt-1">Share this code with faculty to join</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Student Invite Code (Optional)</Label>
                                <div className="flex items-center gap-2 mt-2">
                                    <Input
                                        readOnly
                                        value="UNI-STU-XXXXXX"
                                        className="rounded-xl bg-neutral-50 dark:bg-neutral-900 font-mono"
                                    />
                                    <Button type="button" variant="outline" size="icon" className="rounded-xl shrink-0">
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button type="button" variant="outline" size="icon" className="rounded-xl shrink-0">
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-neutral-500 mt-1">Secondary verification for students (in addition to email)</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
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
