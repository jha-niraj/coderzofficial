"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Users,
    FileText, Save, Send, Plus, X, Sparkles, Building2
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Label } from "@repo/ui/components/ui/label"
import { Badge } from "@repo/ui/components/ui/badge"
import { Switch } from "@repo/ui/components/ui/switch"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select"
import Link from "next/link"
import toast from "@repo/ui/components/ui/sonner"
import { createJob } from "@/actions/jobs"
import { createJobSchema } from "@/types/job-schema"
import type {
    JobLocationType, EmploymentType
} from "@/types"

// ============================================
// TYPES
// ============================================

// Simplified interview process type for job form selection
interface InterviewProcessOption {
    id: string
    name: string
    description?: string | null
    isDefault?: boolean
    rounds: Array<{
        id: string
        roundType: string
        title: string
    }>
}

interface JobFormContentProps {
    interviewProcesses: InterviewProcessOption[]
}

interface FormData {
    title: string
    description: string
    department: string
    location: string
    locationType: JobLocationType
    employmentType: EmploymentType
    experienceMin: string
    experienceMax: string
    salaryMin: string
    salaryMax: string
    salaryCurrency: string
    salaryDisclosed: boolean
    skillsRequired: string[]
    skillsPreferred: string[]
    requirements: string[]
    responsibilities: string[]
    benefits: string[]
    hasAssignment: boolean
    assignmentTitle: string
    assignmentDescription: string
    assignmentDeadlineDays: string
    interviewProcessId: string
}

// ============================================
// CONSTANTS
// ============================================

const LOCATION_TYPES: { value: JobLocationType; label: string }[] = [
    { value: "REMOTE", label: "Remote" },
    { value: "HYBRID", label: "Hybrid" },
    { value: "ONSITE", label: "On-site" },
]

const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
    { value: "FULL_TIME", label: "Full-time" },
    { value: "PART_TIME", label: "Part-time" },
    { value: "CONTRACT", label: "Contract" },
    { value: "INTERNSHIP", label: "Internship" },
    { value: "FREELANCE", label: "Freelance" },
]

const EXPERIENCE_PRESETS = [
    { label: "Fresher", min: 0, max: 1 },
    { label: "Junior", min: 1, max: 3 },
    { label: "Mid-level", min: 3, max: 5 },
    { label: "Senior", min: 5, max: 8 },
    { label: "Lead", min: 8, max: 12 },
    { label: "Principal", min: 12, max: 20 },
]

const SKILL_SUGGESTIONS = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
    "Java", "Go", "Rust", "AWS", "Docker", "Kubernetes", "PostgreSQL",
    "MongoDB", "Redis", "GraphQL", "REST API", "Git", "CI/CD", "Agile"
]

const CURRENCIES = [
    { value: "INR", label: "₹ INR" },
    { value: "USD", label: "$ USD" },
    { value: "EUR", label: "€ EUR" },
    { value: "GBP", label: "£ GBP" },
]

// ============================================
// LIST INPUT COMPONENT
// ============================================

function ListInput({
    label,
    placeholder,
    items,
    onAdd,
    onRemove,
}: {
    label: string
    placeholder: string
    items: string[]
    onAdd: (item: string) => void
    onRemove: (index: number) => void
}) {
    const [inputValue, setInputValue] = useState("")

    const handleAdd = () => {
        if (inputValue.trim()) {
            onAdd(inputValue.trim())
            setInputValue("")
        }
    }

    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-[#0F172A]">{label}</Label>
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
                    className="h-10"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            {
                items.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {
                            items.map((item, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="bg-[#F1F5F9] text-[#475569] pl-2 pr-1 py-1"
                                >
                                    {item}
                                    <button
                                        type="button"
                                        onClick={() => onRemove(index)}
                                        className="ml-1 p-0.5 hover:bg-[#e2e8f0] rounded"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))
                        }
                    </div>
                )
            }
        </div>
    )
}

// ============================================
// SKILLS INPUT COMPONENT
// ============================================

function SkillsInput({
    label,
    skills,
    onAdd,
    onRemove,
    suggestions = SKILL_SUGGESTIONS,
}: {
    label: string
    skills: string[]
    onAdd: (skill: string) => void
    onRemove: (index: number) => void
    suggestions?: string[]
}) {
    const [inputValue, setInputValue] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(false)

    const filteredSuggestions = suggestions.filter(
        (s) =>
            s.toLowerCase().includes(inputValue.toLowerCase()) &&
            !skills.includes(s)
    ).slice(0, 6)

    const handleAdd = (skill: string) => {
        if (skill.trim() && !skills.includes(skill)) {
            onAdd(skill.trim())
            setInputValue("")
            setShowSuggestions(false)
        }
    }

    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-[#0F172A]">{label}</Label>
            <div className="relative">
                <Input
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value)
                        setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Type a skill and press Enter"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault()
                            handleAdd(inputValue)
                        }
                    }}
                    className="h-10"
                />
                {
                    showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-[#e6e6e6] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {
                                filteredSuggestions.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() => handleAdd(suggestion)}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-[#F1F5F9] transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))
                            }
                        </div>
                    )
                }
            </div>
            {
                skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {
                            skills.map((skill, index) => (
                                <Badge
                                    key={index}
                                    className="bg-[#0F172A] text-white pl-2 pr-1 py-1"
                                >
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => onRemove(index)}
                                        className="ml-1 p-0.5 hover:bg-[#334155] rounded"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))
                        }
                    </div>
                )
            }
        </div>
    )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function JobFormContent({ interviewProcesses }: JobFormContentProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [errors, setErrors] = useState<Record<string, string>>({})

    const [formData, setFormData] = useState<FormData>({
        title: "",
        description: "",
        department: "",
        location: "",
        locationType: "REMOTE",
        employmentType: "FULL_TIME",
        experienceMin: "",
        experienceMax: "",
        salaryMin: "",
        salaryMax: "",
        salaryCurrency: "INR",
        salaryDisclosed: true,
        skillsRequired: [],
        skillsPreferred: [],
        requirements: [],
        responsibilities: [],
        benefits: [],
        hasAssignment: false,
        assignmentTitle: "",
        assignmentDescription: "",
        assignmentDeadlineDays: "7",
        interviewProcessId: "",
    })

    const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const addToList = (field: keyof FormData, item: string) => {
        const current = formData[field] as string[]
        updateField(field, [...current, item] as FormData[typeof field])
    }

    const removeFromList = (field: keyof FormData, index: number) => {
        const current = formData[field] as string[]
        updateField(field, current.filter((_, i) => i !== index) as FormData[typeof field])
    }

    const setExperiencePreset = (preset: typeof EXPERIENCE_PRESETS[0]) => {
        updateField("experienceMin", preset.min.toString())
        updateField("experienceMax", preset.max.toString())
    }

    const validateForm = (): boolean => {
        const result = createJobSchema.safeParse({
            title: formData.title,
            description: formData.description,
            locationType: formData.locationType,
            employmentType: formData.employmentType,
            location: formData.location || null,
            experienceMin: formData.experienceMin ? parseInt(formData.experienceMin) : null,
            experienceMax: formData.experienceMax ? parseInt(formData.experienceMax) : null,
            salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
            salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
            salaryCurrency: formData.salaryCurrency,
            salaryDisclosed: formData.salaryDisclosed,
            skillsRequired: formData.skillsRequired,
            skillsPreferred: formData.skillsPreferred,
            requirements: formData.requirements,
            responsibilities: formData.responsibilities,
            benefits: formData.benefits,
            hasAssignment: formData.hasAssignment,
            assignmentDetails: formData.hasAssignment ? {
                title: formData.assignmentTitle,
                description: formData.assignmentDescription,
                requirements: [],
                resources: [],
                deliverables: [],
            } : null,
            assignmentDeadlineDays: formData.hasAssignment ? parseInt(formData.assignmentDeadlineDays) : null,
            interviewProcessId: formData.interviewProcessId || null,
        })

        if (!result.success) {
            const newErrors: Record<string, string> = {}
            result.error.errors.forEach((err) => {
                const path = err.path.join(".")
                newErrors[path] = err.message
            })
            setErrors(newErrors)
            return false
        }

        return true
    }

    const handleSubmit = async (status: "DRAFT" | "ACTIVE") => {
        if (!validateForm()) {
            toast.error("Please fix the errors before submitting")
            return
        }

        startTransition(async () => {
            const result = await createJob({
                title: formData.title,
                description: formData.description,
                locationType: formData.locationType,
                employmentType: formData.employmentType,
                location: formData.location || undefined,
                experienceMin: formData.experienceMin ? parseInt(formData.experienceMin) : undefined,
                experienceMax: formData.experienceMax ? parseInt(formData.experienceMax) : undefined,
                salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
                salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
                salaryCurrency: formData.salaryCurrency,
                salaryDisclosed: formData.salaryDisclosed,
                skillsRequired: formData.skillsRequired,
                skillsPreferred: formData.skillsPreferred,
                requirements: formData.requirements,
                responsibilities: formData.responsibilities,
                benefits: formData.benefits,
                hasAssignment: formData.hasAssignment,
                assignmentDetails: formData.hasAssignment ? {
                    title: formData.assignmentTitle,
                    description: formData.assignmentDescription,
                    requirements: [],
                    resources: [],
                    deliverables: [],
                } : undefined,
                assignmentDeadlineDays: formData.hasAssignment ? parseInt(formData.assignmentDeadlineDays) : undefined,
                interviewProcessId: formData.interviewProcessId || undefined,
                status,
            })

            if (result.success) {
                toast.success(status === "DRAFT" ? "Job saved as draft" : "Job published successfully!")
                router.push("/jobs")
            } else {
                toast.error(result.error || "Failed to create job")
            }
        })
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <div className="bg-white border-b border-[#e6e6e6]">
                <div className="container mx-auto px-6 py-6">
                    <Link
                        href="/jobs"
                        className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] text-sm mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Jobs
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-[#0F172A]">Create New Job</h1>
                            <p className="text-[#64748B] mt-1">Fill in the details to post a new job opening</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => handleSubmit("DRAFT")}
                                disabled={isPending}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Draft
                            </Button>
                            <Button
                                onClick={() => handleSubmit("ACTIVE")}
                                disabled={isPending}
                                className="bg-[#0F172A] hover:bg-[#1e293b] text-white"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Publish Job
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-6 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-[#e6e6e6] p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-[#F1F5F9]">
                                <Briefcase className="h-5 w-5 text-[#0F172A]" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-[#0F172A]">Basic Information</h2>
                                <p className="text-sm text-[#64748B]">Job title and description</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-[#0F172A]">Job Title *</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => updateField("title", e.target.value)}
                                    placeholder="e.g., Senior Frontend Developer"
                                    className={`h-11 mt-1 ${errors.title ? "border-red-500" : ""}`}
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-[#0F172A]">Description *</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => updateField("description", e.target.value)}
                                    placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                                    rows={6}
                                    className={`mt-1 ${errors.description ? "border-red-500" : ""}`}
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-[#0F172A]">Department</Label>
                                <Input
                                    value={formData.department}
                                    onChange={(e) => updateField("department", e.target.value)}
                                    placeholder="e.g., Engineering, Product, Design"
                                    className="h-11 mt-1"
                                />
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl border border-[#e6e6e6] p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-[#F1F5F9]">
                                <MapPin className="h-5 w-5 text-[#0F172A]" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-[#0F172A]">Location & Employment</h2>
                                <p className="text-sm text-[#64748B]">Work arrangement and job type</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-[#0F172A]">Work Type *</Label>
                                <Select
                                    value={formData.locationType}
                                    onValueChange={(v) => updateField("locationType", v as JobLocationType)}
                                >
                                    <SelectTrigger className="h-11 mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            LOCATION_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-[#0F172A]">Employment Type *</Label>
                                <Select
                                    value={formData.employmentType}
                                    onValueChange={(v) => updateField("employmentType", v as EmploymentType)}
                                >
                                    <SelectTrigger className="h-11 mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            EMPLOYMENT_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>

                            {
                                formData.locationType !== "REMOTE" && (
                                    <div className="md:col-span-2">
                                        <Label className="text-sm font-medium text-[#0F172A]">Location</Label>
                                        <Input
                                            value={formData.location}
                                            onChange={(e) => updateField("location", e.target.value)}
                                            placeholder="e.g., Bangalore, India"
                                            className="h-11 mt-1"
                                        />
                                    </div>
                                )
                            }
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white rounded-xl border border-[#e6e6e6] p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-[#F1F5F9]">
                                <Clock className="h-5 w-5 text-[#0F172A]" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-[#0F172A]">Experience Level</h2>
                                <p className="text-sm text-[#64748B]">Required years of experience</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {
                                EXPERIENCE_PRESETS.map((preset) => (
                                    <Button
                                        key={preset.label}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setExperiencePreset(preset)}
                                        className={`${formData.experienceMin === preset.min.toString() &&
                                                formData.experienceMax === preset.max.toString()
                                                ? "bg-[#0F172A] text-white border-[#0F172A]"
                                                : ""
                                            }`}
                                    >
                                        {preset.label} ({preset.min}-{preset.max} yrs)
                                    </Button>
                                ))
                            }
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-[#0F172A]">Minimum (years)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.experienceMin}
                                    onChange={(e) => updateField("experienceMin", e.target.value)}
                                    placeholder="0"
                                    className="h-11 mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-[#0F172A]">Maximum (years)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.experienceMax}
                                    onChange={(e) => updateField("experienceMax", e.target.value)}
                                    placeholder="5"
                                    className="h-11 mt-1"
                                />
                            </div>
                        </div>
                        {errors.experienceMin && <p className="text-red-500 text-sm mt-2">{errors.experienceMin}</p>}
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl border border-[#e6e6e6] p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#F1F5F9]">
                                    <DollarSign className="h-5 w-5 text-[#0F172A]" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-[#0F172A]">Compensation</h2>
                                    <p className="text-sm text-[#64748B]">Salary range for this position</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.salaryDisclosed}
                                    onCheckedChange={(v) => updateField("salaryDisclosed", v)}
                                />
                                <Label className="text-sm text-[#64748B]">Show salary</Label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-[#0F172A]">Currency</Label>
                                <Select
                                    value={formData.salaryCurrency}
                                    onValueChange={(v) => updateField("salaryCurrency", v)}
                                >
                                    <SelectTrigger className="h-11 mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            CURRENCIES.map((curr) => (
                                                <SelectItem key={curr.value} value={curr.value}>
                                                    {curr.label}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-[#0F172A]">Minimum (Annual)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.salaryMin}
                                    onChange={(e) => updateField("salaryMin", e.target.value)}
                                    placeholder="e.g., 800000"
                                    className="h-11 mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-[#0F172A]">Maximum (Annual)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.salaryMax}
                                    onChange={(e) => updateField("salaryMax", e.target.value)}
                                    placeholder="e.g., 1500000"
                                    className="h-11 mt-1"
                                />
                            </div>
                        </div>
                        {errors.salaryMin && <p className="text-red-500 text-sm mt-2">{errors.salaryMin}</p>}
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-white rounded-xl border border-[#e6e6e6] p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-[#F1F5F9]">
                                <Sparkles className="h-5 w-5 text-[#0F172A]" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-[#0F172A]">Skills</h2>
                                <p className="text-sm text-[#64748B]">Required and preferred skills</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <SkillsInput
                                label="Required Skills *"
                                skills={formData.skillsRequired}
                                onAdd={(skill) => addToList("skillsRequired", skill)}
                                onRemove={(index) => removeFromList("skillsRequired", index)}
                            />

                            {errors.skillsRequired && <p className="text-red-500 text-sm">{errors.skillsRequired}</p>}

                            <SkillsInput
                                label="Preferred Skills"
                                skills={formData.skillsPreferred}
                                onAdd={(skill) => addToList("skillsPreferred", skill)}
                                onRemove={(index) => removeFromList("skillsPreferred", index)}
                            />
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl border border-[#e6e6e6] p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-[#F1F5F9]">
                                <FileText className="h-5 w-5 text-[#0F172A]" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-[#0F172A]">Job Details</h2>
                                <p className="text-sm text-[#64748B]">Requirements, responsibilities, and benefits</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <ListInput
                                label="Requirements"
                                placeholder="Add a requirement"
                                items={formData.requirements}
                                onAdd={(item) => addToList("requirements", item)}
                                onRemove={(index) => removeFromList("requirements", index)}
                            />

                            <ListInput
                                label="Responsibilities"
                                placeholder="Add a responsibility"
                                items={formData.responsibilities}
                                onAdd={(item) => addToList("responsibilities", item)}
                                onRemove={(index) => removeFromList("responsibilities", index)}
                            />

                            <ListInput
                                label="Benefits"
                                placeholder="Add a benefit"
                                items={formData.benefits}
                                onAdd={(item) => addToList("benefits", item)}
                                onRemove={(index) => removeFromList("benefits", index)}
                            />
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="bg-white rounded-xl border border-[#e6e6e6] p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-[#F1F5F9]">
                                <Users className="h-5 w-5 text-[#0F172A]" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-[#0F172A]">Interview Process</h2>
                                <p className="text-sm text-[#64748B]">Select an interview process for this job</p>
                            </div>
                        </div>

                        {
                            interviewProcesses.length > 0 ? (
                                <Select
                                    value={formData.interviewProcessId}
                                    onValueChange={(v) => updateField("interviewProcessId", v)}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select an interview process" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            interviewProcesses.map((process) => (
                                                <SelectItem key={process.id} value={process.id}>
                                                    <div className="flex items-center gap-2">
                                                        {process.name}
                                                        {
                                                            process.isDefault && (
                                                                <Badge variant="secondary" className="text-xs">Default</Badge>
                                                            )
                                                        }
                                                    </div>
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="p-4 bg-[#F8FAFC] rounded-lg text-center">
                                    <p className="text-[#64748B] text-sm mb-2">No interview processes configured yet</p>
                                    <Link href="/interview-config">
                                        <Button variant="outline" size="sm">
                                            Configure Interview Process
                                        </Button>
                                    </Link>
                                </div>
                            )
                        }
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-xl border border-[#e6e6e6] p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#F1F5F9]">
                                    <Building2 className="h-5 w-5 text-[#0F172A]" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-[#0F172A]">Take-Home Assignment</h2>
                                    <p className="text-sm text-[#64748B]">Optional coding assignment for candidates</p>
                                </div>
                            </div>
                            <Switch
                                checked={formData.hasAssignment}
                                onCheckedChange={(v) => updateField("hasAssignment", v)}
                            />
                        </div>

                        {
                            formData.hasAssignment && (
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-[#0F172A]">Assignment Title *</Label>
                                        <Input
                                            value={formData.assignmentTitle}
                                            onChange={(e) => updateField("assignmentTitle", e.target.value)}
                                            placeholder="e.g., Build a REST API"
                                            className="h-11 mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-[#0F172A]">Assignment Description *</Label>
                                        <Textarea
                                            value={formData.assignmentDescription}
                                            onChange={(e) => updateField("assignmentDescription", e.target.value)}
                                            placeholder="Describe what candidates need to build..."
                                            rows={4}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="w-48">
                                        <Label className="text-sm font-medium text-[#0F172A]">Deadline (days)</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="30"
                                            value={formData.assignmentDeadlineDays}
                                            onChange={(e) => updateField("assignmentDeadlineDays", e.target.value)}
                                            className="h-11 mt-1"
                                        />
                                    </div>
                                    {
                                        errors.assignmentDeadlineDays && (
                                            <p className="text-red-500 text-sm">{errors.assignmentDeadlineDays}</p>
                                        )
                                    }
                                </div>
                            )
                        }
                    </motion.div>
                    <div className="flex items-center gap-3 lg:hidden pb-8">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleSubmit("DRAFT")}
                            disabled={isPending}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button
                            className="flex-1 bg-[#0F172A] hover:bg-[#1e293b] text-white"
                            onClick={() => handleSubmit("ACTIVE")}
                            disabled={isPending}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Publish
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}