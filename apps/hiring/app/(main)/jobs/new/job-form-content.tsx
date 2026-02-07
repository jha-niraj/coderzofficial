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
    assignmentAddLater: boolean // If true, assignment details will be added later
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
            <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{label}</Label>
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
                                    className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 pl-2 pr-1 py-1"
                                >
                                    {item}
                                    <button
                                        type="button"
                                        onClick={() => onRemove(index)}
                                        className="ml-1 p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
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
            <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{label}</Label>
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
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {
                                filteredSuggestions.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() => handleAdd(suggestion)}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-900 dark:text-neutral-100"
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
                                    className="bg-neutral-900 dark:bg-white text-white dark:text-black pl-2 pr-1 py-1"
                                >
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => onRemove(index)}
                                        className="ml-1 p-0.5 hover:bg-neutral-700 dark:hover:bg-neutral-200 rounded"
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
        assignmentAddLater: false,
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
            assignmentDetails: formData.hasAssignment && !formData.assignmentAddLater ? {
                title: formData.assignmentTitle,
                description: formData.assignmentDescription,
                requirements: [],
                resources: [],
                deliverables: [],
            } : null,
            assignmentDeadlineDays: formData.hasAssignment && !formData.assignmentAddLater ? parseInt(formData.assignmentDeadlineDays) : null,
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
                assignmentDetails: formData.hasAssignment && !formData.assignmentAddLater ? {
                    title: formData.assignmentTitle,
                    description: formData.assignmentDescription,
                    requirements: [],
                    resources: [],
                    deliverables: [],
                } : undefined,
                assignmentDeadlineDays: formData.hasAssignment && !formData.assignmentAddLater ? parseInt(formData.assignmentDeadlineDays) : undefined,
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
        <div className="h-screen bg-neutral-50 dark:bg-neutral-950">
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                <div className="container mx-auto px-6 py-6">
                    <Link
                        href="/jobs"
                        className="inline-flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-sm mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Jobs
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Create New Job</h1>
                            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Fill in the details to post a new job opening</p>
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
                                className="bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black"
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
                        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                <Briefcase className="h-5 w-5 text-neutral-900 dark:text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-neutral-900 dark:text-white">Basic Information</h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Job title and description</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Job Title *</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => updateField("title", e.target.value)}
                                    placeholder="e.g., Senior Frontend Developer"
                                    className={`h-11 mt-1 ${errors.title ? "border-red-500" : ""}`}
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Description *</Label>
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
                                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Department</Label>
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
                        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                <MapPin className="h-5 w-5 text-neutral-900 dark:text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-neutral-900 dark:text-white">Location & Employment</h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Work arrangement and job type</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Work Type *</Label>
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
                                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Employment Type *</Label>
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
                                        <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Location</Label>
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
                        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                <Clock className="h-5 w-5 text-neutral-900 dark:text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-neutral-900 dark:text-white">Experience Level</h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Required years of experience</p>
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
                                                ? "bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-900 dark:border-white"
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
                                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Minimum (years)</Label>
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
                                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Maximum (years)</Label>
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
                        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                    <DollarSign className="h-5 w-5 text-neutral-900 dark:text-white" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-neutral-900 dark:text-white">Compensation</h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Salary range for this position</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.salaryDisclosed}
                                    onCheckedChange={(v) => updateField("salaryDisclosed", v)}
                                />
                                <Label className="text-sm text-neutral-500 dark:text-neutral-400">Show salary</Label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Currency</Label>
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
                                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Minimum (Annual)</Label>
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
                                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Maximum (Annual)</Label>
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
                        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                <Sparkles className="h-5 w-5 text-neutral-900 dark:text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-neutral-900 dark:text-white">Skills</h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Required and preferred skills</p>
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
                        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                <FileText className="h-5 w-5 text-neutral-900 dark:text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-neutral-900 dark:text-white">Job Details</h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Requirements, responsibilities, and benefits</p>
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
                        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                <Users className="h-5 w-5 text-neutral-900 dark:text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-neutral-900 dark:text-white">Interview Process</h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Select an interview process for this job</p>
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
                                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg text-center">
                                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-2">No interview processes configured yet</p>
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
                        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                    <Building2 className="h-5 w-5 text-neutral-900 dark:text-white" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-neutral-900 dark:text-white">Take-Home Assignment</h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Optional coding assignment for candidates</p>
                                </div>
                            </div>
                            <Switch
                                checked={formData.hasAssignment}
                                onCheckedChange={(v) => {
                                    updateField("hasAssignment", v)
                                    if (!v) {
                                        updateField("assignmentAddLater", false)
                                    }
                                }}
                            />
                        </div>

                        {
                            formData.hasAssignment && (
                                <div className="space-y-4">
                                    {/* Add Now or Later Toggle */}
                                    <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white">When would you like to add assignment details?</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">You can always edit this later from the job settings</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 rounded-lg p-1 border border-neutral-200 dark:border-neutral-700">
                                            <button
                                                type="button"
                                                onClick={() => updateField("assignmentAddLater", false)}
                                                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                                                    !formData.assignmentAddLater
                                                        ? "bg-neutral-900 dark:bg-white text-white dark:text-black"
                                                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                                }`}
                                            >
                                                Add Now
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateField("assignmentAddLater", true)}
                                                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                                                    formData.assignmentAddLater
                                                        ? "bg-neutral-900 dark:bg-white text-white dark:text-black"
                                                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                                }`}
                                            >
                                                Add Later
                                            </button>
                                        </div>
                                    </div>

                                    {/* Assignment Details - Only show if not adding later */}
                                    {
                                        !formData.assignmentAddLater ? (
                                            <>
                                                <div>
                                                    <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Assignment Title *</Label>
                                                    <Input
                                                        value={formData.assignmentTitle}
                                                        onChange={(e) => updateField("assignmentTitle", e.target.value)}
                                                        placeholder="e.g., Build a REST API"
                                                        className="h-11 mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Assignment Description *</Label>
                                                    <Textarea
                                                        value={formData.assignmentDescription}
                                                        onChange={(e) => updateField("assignmentDescription", e.target.value)}
                                                        placeholder="Describe what candidates need to build..."
                                                        rows={4}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div className="w-48">
                                                    <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Deadline (days)</Label>
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
                                            </>
                                        ) : (
                                            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/50">
                                                <p className="text-sm text-amber-800 dark:text-amber-300">
                                                    <span className="font-medium">Assignment details will be added later.</span>{" "}
                                                    You can configure the assignment from the job settings after publishing. 
                                                    Candidates won&apos;t see the assignment until you complete it.
                                                </p>
                                            </div>
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
                            className="flex-1 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black"
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