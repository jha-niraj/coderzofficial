"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Textarea } from "@repo/ui/components/ui/textarea"
import {
    Plus, Trash2, Loader2, CalendarIcon, Sparkles, Mic, Square
} from "lucide-react"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select"
import { Switch } from "@repo/ui/components/ui/switch"
import { format } from "date-fns"
import { Calendar } from "@repo/ui/components/ui/calendar"
import {
    Popover, PopoverContent, PopoverTrigger
} from "@repo/ui/components/ui/popover"
import toast from "@repo/ui/components/ui/sonner"
import {
    polishWorkExperienceBullets, transcribeAndPolishWorkExperience
} from "@/actions/(main)/ai/resume-ai.action"

type Experience = {
    id: string
    companyName: string
    roleTitle: string
    companyWebsite?: string | null
    description?: string | null
    bulletPoints?: string[]
    startDate: Date
    endDate?: Date | null
    isCurrentlyWorking: boolean
}

const ROLE_OPTIONS = [
    "Junior Software Engineer",
    "Junior Full Stack Engineer",
    "Software Engineer",
    "Full Stack Engineer",
    "Senior Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "DevOps Engineer",
    "ML Engineer",
    "Other",
    "Custom",
]

function mapToExperience(raw: {
        id: string
        companyName: string
        roleTitle: string
        companyWebsite?: string | null
        description?: string | null
        bulletPoints?: string[]
        startDate: Date
        endDate?: Date | null
        isCurrentlyWorking: boolean
    }): Experience {
    return {
        id: raw.id,
        companyName: raw.companyName,
        roleTitle: raw.roleTitle,
        companyWebsite: raw.companyWebsite ?? undefined,
        description: raw.description ?? undefined,
        bulletPoints: raw.bulletPoints,
        startDate: new Date(raw.startDate),
        endDate: raw.endDate ? new Date(raw.endDate) : null,
        isCurrentlyWorking: raw.isCurrentlyWorking,
    }
}

export function ExperienceTabForm({
    experiences,
    onAdd,
    onUpdate,
    onDelete,
    onAddSuccess,
    onUpdateSuccess,
    onDeleteSuccess,
}: {
    experiences: Experience[]
    onAdd: (data: {
        companyName: string
        roleTitle: string
        companyWebsite?: string
        description?: string
        bulletPoints?: string[]
        startDate: Date
        endDate?: Date
        isCurrentlyWorking: boolean
    }) => Promise<{ success: boolean; message?: string; data?: unknown }>
    onUpdate: (id: string, data: Partial<{
        companyName: string
        roleTitle: string
        companyWebsite: string
        description: string
        bulletPoints: string[]
        startDate: Date
        endDate: Date
        isCurrentlyWorking: boolean
    }>) => Promise<{ success: boolean; message?: string; data?: unknown }>
    onDelete: (id: string) => Promise<{ success: boolean; message?: string }>
    onAddSuccess?: (exp: Experience) => void
    onUpdateSuccess?: (exp: Experience) => void
    onDeleteSuccess?: (id: string) => void
}) {
    const [saving, setSaving] = useState<string | null>(null)
    const [localExperiences, setLocalExperiences] = useState(experiences)

    useEffect(() => {
        setLocalExperiences(experiences)
    }, [experiences])

    const handleAdd = async () => {
        const tempId = `temp-exp-${Date.now()}`
        const tempExp: Experience = {
            id: tempId,
            companyName: "New Company",
            roleTitle: ROLE_OPTIONS[0] ?? "Software Engineer",
            startDate: new Date(),
            isCurrentlyWorking: false,
        }
        setLocalExperiences((prev) => [...prev, tempExp])
        const res = await onAdd({
            companyName: tempExp.companyName,
            roleTitle: tempExp.roleTitle,
            startDate: tempExp.startDate,
            isCurrentlyWorking: tempExp.isCurrentlyWorking,
        })
        if (res.success && res.data && typeof res.data === "object" && "id" in res.data) {
            const realExp = mapToExperience(res.data as Parameters<typeof mapToExperience>[0])
            setLocalExperiences((prev) => prev.map((e) => (e.id === tempId ? realExp : e)))
            onAddSuccess?.(realExp)
        } else if (!res.success) {
            setLocalExperiences((prev) => prev.filter((e) => e.id !== tempId))
            toast.error(res.message || "Failed to add")
        }
    }

    const handleDelete = async (id: string) => {
        if (id.startsWith("temp-")) {
            setLocalExperiences((prev) => prev.filter((e) => e.id !== id))
            return
        }
        const res = await onDelete(id)
        if (res.success) {
            setLocalExperiences((prev) => prev.filter((e) => e.id !== id))
            onDeleteSuccess?.(id)
        } else {
            toast.error(res.message || "Failed to remove")
        }
    }

    const handleSave = async (
        exp: Experience,
        data: Partial<{
            companyName: string
            roleTitle: string
            companyWebsite: string
            description: string
            bulletPoints: string[]
            startDate: Date
            endDate: Date | null
            isCurrentlyWorking: boolean
        }>
    ) => {
        setSaving(exp.id)
        const toSend: Record<string, unknown> = { ...data }
        if (data.description !== undefined) {
            const lines = data.description.split("\n").filter(Boolean)
            toSend.bulletPoints = lines
        }
        const res = await onUpdate(exp.id, toSend as Parameters<typeof onUpdate>[1])
        setSaving(null)
        if (res.success && res.data && typeof res.data === "object" && "id" in res.data) {
            onUpdateSuccess?.(mapToExperience(res.data as Parameters<typeof mapToExperience>[0]))
        } else if (!res.success) {
            toast.error(res.message || "Failed to save")
        }
    }

    const descriptionToString = (exp: Experience) => {
        if (exp.bulletPoints?.length) return exp.bulletPoints.join("\n")
        return exp.description || ""
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Work Experience</h3>
                <Button onClick={handleAdd} size="sm" className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    Add Experience
                </Button>
            </div>

            {
                localExperiences.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground text-sm">
                        No work experience yet. Click &quot;Add Experience&quot; to add one.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {
                            localExperiences.map((exp) => (
                                <ExperienceCard
                                    key={exp.id}
                                    exp={exp}
                                    descriptionToString={descriptionToString}
                                    onSave={(data) => handleSave(exp, data)}
                                    onDelete={() => handleDelete(exp.id)}
                                    saving={saving === exp.id}
                                    roleOptions={ROLE_OPTIONS}
                                />
                            ))
                        }
                    </div>
                )
            }
        </div>
    )
}

function ExperienceCard({
    exp,
    descriptionToString,
    onSave,
    onDelete,
    saving,
    roleOptions,
}: {
    exp: Experience
    descriptionToString: (e: Experience) => string
    onSave: (data: Partial<{
        companyName: string
        roleTitle: string
        companyWebsite: string
        description: string
        bulletPoints: string[]
        startDate: Date
        endDate: Date
        isCurrentlyWorking: boolean
    }>) => void
    onDelete: () => void
    saving: boolean
    roleOptions: string[]
}) {
    const [local, setLocal] = useState({
        companyName: exp.companyName,
        roleTitle: exp.roleTitle,
        companyWebsite: exp.companyWebsite || "",
        description: descriptionToString(exp),
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrentlyWorking: exp.isCurrentlyWorking,
    })
    const [startDateOpen, setStartDateOpen] = useState(false)
    const [endDateOpen, setEndDateOpen] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [voiceRecording, setVoiceRecording] = useState(false)
    const [voiceLoading, setVoiceLoading] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)

    const handleField = (field: string, value: string | Date | boolean | null) => {
        setLocal((p) => ({ ...p, [field]: value }))
    }

    const save = () => {
        const lines = local.description.split("\n").filter(Boolean)
        onSave({
            companyName: local.companyName,
            roleTitle: local.roleTitle,
            companyWebsite: local.companyWebsite || undefined,
            bulletPoints: lines,
            startDate: new Date(local.startDate),
            endDate: local.endDate ? new Date(local.endDate) : undefined,
            isCurrentlyWorking: local.isCurrentlyWorking,
        })
    }

    return (
        <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 grid gap-3 sm:grid-cols-2">
                    <div>
                        <Label>Company Name</Label>
                        <Input
                            value={local.companyName}
                            onChange={(e) => handleField("companyName", e.target.value)}
                            placeholder="e.g. Acme Inc"
                        />
                    </div>
                    <div>
                        <Label>Role Title</Label>
                        <Select
                            value={roleOptions.includes(local.roleTitle) ? local.roleTitle : "Custom"}
                            onValueChange={(v) => handleField("roleTitle", v === "Custom" ? local.roleTitle : v)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    roleOptions.filter((r) => r !== "Custom").map((r) => (
                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                    ))
                                }
                                <SelectItem value="Custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                        {
                            !roleOptions.includes(local.roleTitle) && (
                                <Input
                                    className="mt-2"
                                    value={local.roleTitle}
                                    onChange={(e) => handleField("roleTitle", e.target.value)}
                                    placeholder="Enter your role title"
                                />
                            )
                        }
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                        <Switch
                            id={`currently-working-${exp.id}`}
                            checked={local.isCurrentlyWorking}
                            onCheckedChange={(v) => handleField("isCurrentlyWorking", v)}
                        />
                        <Label htmlFor={`currently-working-${exp.id}`} className="text-xs font-normal cursor-pointer">
                            Currently working here
                        </Label>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDelete}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <div>
                <Label>Company Website (Optional)</Label>
                <Input
                    value={local.companyWebsite}
                    onChange={(e) => handleField("companyWebsite", e.target.value)}
                    placeholder="https://company.com"
                />
            </div>
            <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                    <Label>Description / Bullet Points</Label>
                    <div className="flex gap-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            disabled={aiLoading || voiceLoading}
                            onClick={async () => {
                                setAiLoading(true)
                                const res = await polishWorkExperienceBullets(local.description)
                                setAiLoading(false)
                                if (res.success && res.bullets) {
                                    handleField("description", res.bullets)
                                    toast.success("AI polished your bullets")
                                } else {
                                    toast.error(res.error || "AI polish failed")
                                }
                            }}
                        >
                            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            AI Polish
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            disabled={aiLoading || voiceLoading}
                            onClick={async () => {
                                if (voiceRecording) {
                                    mediaRecorderRef.current?.stop()
                                    setVoiceRecording(false)
                                    return
                                }
                                try {
                                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                                    const recorder = new MediaRecorder(stream)
                                    const chunks: Blob[] = []
                                    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data)
                                    recorder.onstop = async () => {
                                        stream.getTracks().forEach((t) => t.stop())
                                        if (chunks.length === 0) {
                                            setVoiceLoading(false)
                                            toast.error("No audio recorded")
                                            return
                                        }
                                        const blob = new Blob(chunks, { type: "audio/webm" })
                                        const reader = new FileReader()
                                        reader.onloadend = async () => {
                                            const base64 = (reader.result as string).split(",")[1]
                                            if (!base64) {
                                                setVoiceLoading(false)
                                                toast.error("Failed to encode audio")
                                                return
                                            }
                                            const res = await transcribeAndPolishWorkExperience(base64, "audio/webm")
                                            setVoiceLoading(false)
                                            if (res.success && res.bullets) {
                                                handleField("description", res.bullets)
                                                toast.success("Voice converted to bullets")
                                            } else {
                                                toast.error(res.error || "Voice processing failed")
                                            }
                                        }
                                        reader.readAsDataURL(blob)
                                    }
                                    recorder.start()
                                    mediaRecorderRef.current = recorder
                                    setVoiceRecording(true)
                                    setVoiceLoading(true)
                                } catch {
                                    toast.error("Microphone access denied")
                                    setVoiceLoading(false)
                                }
                            }}
                        >
                            {voiceRecording ? <Square className="w-3 h-3" /> : voiceLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mic className="w-3 h-3" />}
                            {voiceRecording ? "Stop" : "Voice"}
                        </Button>
                    </div>
                </div>
                <Textarea
                    value={local.description}
                    onChange={(e) => handleField("description", e.target.value)}
                    placeholder="One point per line. Use AI or Voice to generate professional bullets."
                    rows={5}
                    maxLength={2000}
                    className="resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                    {local.description.length}/2000 characters
                </p>
            </div>
            <div className="flex flex-wrap gap-4 items-end">
                <div>
                    <Label>Start Date</Label>
                    <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-[200px] justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(new Date(local.startDate), "MMMM d, yyyy")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={new Date(local.startDate)}
                                onSelect={(d) => d && handleField("startDate", d)}
                                onDayClick={() => setStartDateOpen(false)}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                {
                    !local.isCurrentlyWorking && (
                        <div>
                            <Label>End Date</Label>
                            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-[200px] justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {
                                            local.endDate
                                                ? format(new Date(local.endDate), "MMMM d, yyyy")
                                                : "Select"
                                        }
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={
                                            local.endDate
                                                ? new Date(local.endDate)
                                                : undefined
                                        }
                                        onSelect={(d) =>
                                            handleField("endDate", d ?? null)
                                        } onDayClick={() => setEndDateOpen(false)} />
                                </PopoverContent>
                            </Popover>
                        </div>
                    )
                }
            </div>
            <Button onClick={save} disabled={saving} size="sm">
                {
                    saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        "Save Changes"
                    )
                }
            </Button>
        </div>
    )
}