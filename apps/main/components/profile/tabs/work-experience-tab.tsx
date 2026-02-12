"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@repo/ui/components/ui/card"
import { Button } from "@repo/ui/components/ui/button"
import {
    FileText, Eye, Loader2, Pencil
} from "lucide-react"
import Link from "next/link"
import toast from "@repo/ui/components/ui/sonner"
import { uploadResume } from "@/actions/(main)/user/resume.action"
import { getResumeSignedUrl } from "@/actions/(main)/user/resume.action"
import { ResumePublicView } from "@/components/resume/resume-public-view"

interface WorkExperienceTabProps {
    user: {
        id: string
        name?: string | null
        username?: string | null
        image?: string | null
        location?: string | null
        occupation?: string | null
        resume?: string | null
        hasResume?: boolean
        experiences?: Array<{
            id: string
            companyName: string
            roleTitle: string
            description?: string | null
            bulletPoints?: string[]
            startDate: Date
            endDate?: Date | null
            isCurrentlyWorking?: boolean
        }>
        portfolioProjects?: Array<{
            id: string
            projectName: string
            description?: string | null
            bulletPoints?: string[]
            technologies?: string[]
            startDate: Date
            endDate?: Date | null
        }>
        educations?: Array<{
            id: string
            degree?: string | null
            institution: string
            startDate: Date
            endDate?: Date | null
        }>
        certifications?: Array<{
            id: string
            name: string
            issuer: string
            issuedDate: Date
            link: string
        }>
        skills?: Array<{ id: string; name: string; category?: string }>
        socialLinks?: Array<{ id: string; platform: string; url: string }>
    }
    isOwnProfile: boolean
    onUploadResume?: () => void | Promise<void>
}

export function WorkExperienceTab({
    user,
    isOwnProfile,
    onUploadResume,
}: WorkExperienceTabProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [resumeViewUrl, setResumeViewUrl] = useState<string | null>(null)

    const handleUploadClick = () => fileInputRef.current?.click()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
        if (!allowed.includes(file.type)) {
            toast.error("Please upload a PDF or DOC/DOCX file")
            return
        }
        setUploading(true)
        try {
            const result = await uploadResume(file)
            if (result.url || result.success) {
                toast.success("Resume uploaded successfully!")
                await onUploadResume?.()
            } else {
                toast.error(result.message || "Upload failed")
            }
        } catch {
            toast.error("Failed to upload resume")
        } finally {
            setUploading(false)
            e.target.value = ""
        }
    }

    const handleViewResume = async () => {
        if (resumeViewUrl) {
            window.open(resumeViewUrl, "_blank")
            return
        }
        const res = await getResumeSignedUrl()
        if (res?.url) {
            setResumeViewUrl(res.url)
            window.open(res.url, "_blank")
        } else {
            toast.error("Could not load resume")
        }
    }

    const resumeData = {
        name: user.name,
        occupation: user.occupation,
        location: user.location,
        image: user.image,
        experiences: user.experiences ?? [],
        portfolioProjects: user.portfolioProjects ?? [],
        skills: user.skills ?? [],
        educations: user.educations ?? [],
        certifications: user.certifications ?? [],
        socialLinks: user.socialLinks ?? [],
    }

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                                    <FileText className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Uploaded Resume</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {user.hasResume && user.resume
                                            ? "PDF document available"
                                            : "No resume uploaded yet"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 shrink-0">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                {
                                    isOwnProfile && (
                                        <Button variant="outline" size="sm" className="gap-2" asChild>
                                            <Link href="/ai/resumecreator">
                                                <Pencil className="w-4 h-4" />
                                                Edit in Resume Creator
                                            </Link>
                                        </Button>
                                    )
                                }
                                {
                                    user.hasResume && user.resume ? (
                                        <>
                                            <Button variant="outline" size="sm" className="gap-2" onClick={handleViewResume}>
                                                <Eye className="w-4 h-4" />
                                                View
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600"
                                                onClick={handleViewResume}
                                            >
                                                Download
                                            </Button>
                                        </>
                                    ) : (
                                        isOwnProfile && (
                                            <Button
                                                onClick={handleUploadClick}
                                                disabled={uploading}
                                                className="gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600"
                                            >
                                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                                {uploading ? "Uploading..." : "Upload Resume"}
                                            </Button>
                                        )
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Platform Resume</h3>
                    {
                        isOwnProfile && user.username && (
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/resume/${user.username}`} target="_blank" rel="noopener noreferrer">
                                        View public resume
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/ai/resumecreator">
                                        <Pencil className="w-4 h-4 mr-1" />
                                        Edit
                                    </Link>
                                </Button>
                            </div>
                        )
                    }
                </div>
                <ResumePublicView user={resumeData} embedded />
            </motion.div>
        </div>
    )
}