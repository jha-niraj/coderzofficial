"use client"

import { useState, useEffect } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Textarea } from "@repo/ui/components/ui/textarea"
import {
    Plus, Trash2, Loader2, CalendarIcon
} from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@repo/ui/components/ui/calendar"
import {
    Popover, PopoverContent, PopoverTrigger
} from "@repo/ui/components/ui/popover"
import toast from "@repo/ui/components/ui/sonner"

type Education = {
    id: string
    degree?: string | null
    institution: string
    startDate: Date
    endDate?: Date | null
    bulletPoints?: string[]
}

export function EducationTabForm({
    educations,
    onAdd,
    onUpdate,
    onDelete,
    onAddSuccess,
    onUpdateSuccess,
    onDeleteSuccess,
}: {
    educations: Education[]
    onAdd: (data: {
        institution: string
        degree?: string
        startDate: Date
        endDate?: Date
        bulletPoints?: string[]
    }) => Promise<{ success: boolean; message?: string; data?: unknown }>
    onUpdate: (id: string, data: Partial<{
        institution: string
        degree: string
        startDate: Date
        endDate: Date
        bulletPoints: string[]
    }>) => Promise<{ success: boolean; message?: string; data?: unknown }>
    onDelete: (id: string) => Promise<{ success: boolean; message?: string }>
    onAddSuccess?: (edu: Education) => void
    onUpdateSuccess?: (edu: Education) => void
    onDeleteSuccess?: (id: string) => void
}) {
    const [localEducations, setLocalEducations] = useState(educations)
    useEffect(() => { setLocalEducations(educations) }, [educations])

    const handleAdd = async () => {
        const tempId = `temp-edu-${Date.now()}`
        const tempEdu: Education = { id: tempId, institution: "New Institution", startDate: new Date() }
        setLocalEducations((prev) => [...prev, tempEdu])
        const res = await onAdd({ institution: tempEdu.institution, startDate: tempEdu.startDate })
        if (res.success && res.data && typeof res.data === "object" && "id" in res.data) {
            const raw = res.data as { id: string; institution: string; degree?: string | null; startDate: Date; endDate?: Date | null; bulletPoints?: string[] }
            const realEdu: Education = {
                id: raw.id,
                institution: raw.institution,
                degree: raw.degree ?? undefined,
                startDate: new Date(raw.startDate),
                endDate: raw.endDate ? new Date(raw.endDate) : undefined,
                bulletPoints: raw.bulletPoints,
            }
            setLocalEducations((prev) => prev.map((e) => (e.id === tempId ? realEdu : e)))
            onAddSuccess?.(realEdu)
        } else if (!res.success) {
            setLocalEducations((prev) => prev.filter((e) => e.id !== tempId))
            toast.error(res.message || "Failed to add")
        }
    }

    const handleDelete = async (id: string) => {
        if (id.startsWith("temp-")) {
            setLocalEducations((prev) => prev.filter((e) => e.id !== id))
            return
        }
        const res = await onDelete(id)
        if (res.success) {
            setLocalEducations((prev) => prev.filter((e) => e.id !== id))
            onDeleteSuccess?.(id)
        } else {
            toast.error(res.message || "Failed to remove")
        }
    }

    const descStr = (e: Education) =>
        e.bulletPoints?.length ? e.bulletPoints.join("\n") : ""

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Education</h3>
                <Button onClick={handleAdd} size="sm" className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    Add Education
                </Button>
            </div>

            {
                localEducations.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground text-sm">
                        No education yet. Click &quot;Add Education&quot; to add one.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {
                            localEducations.map((edu) => (
                                <EducationCard
                                    key={edu.id}
                                    edu={edu}
                                    descStr={descStr}
                                    onUpdate={onUpdate}
                                    onDelete={() => handleDelete(edu.id)}
                                    onUpdateSuccess={onUpdateSuccess}
                                />
                            ))
                        }
                    </div>
                )
            }
        </div>
    )
}

function EducationCard({
    edu,
    descStr,
    onUpdate,
    onDelete,
    onUpdateSuccess,
}: {
    edu: Education
    descStr: (e: Education) => string
    onUpdate: (id: string, data: Partial<{
        institution: string
        degree: string
        startDate: Date
        endDate: Date
        bulletPoints: string[]
    }>) => Promise<{ success: boolean; message?: string; data?: unknown }>
    onDelete: () => void
    onUpdateSuccess?: (edu: Education) => void
}) {
    const [saving, setSaving] = useState(false)
    const [local, setLocal] = useState({
        degree: edu.degree || "",
        institution: edu.institution,
        description: descStr(edu),
        startDate: edu.startDate,
        endDate: edu.endDate,
    })

    const handleSave = async () => {
        setSaving(true)
        const lines = local.description.split("\n").filter(Boolean)
        const res = await onUpdate(edu.id, {
            degree: local.degree || undefined,
            institution: local.institution,
            bulletPoints: lines,
            startDate: new Date(local.startDate),
            endDate: local.endDate ? new Date(local.endDate) : undefined,
        })
        setSaving(false)
        if (res.success && res.data && typeof res.data === "object" && "id" in res.data) {
            const raw = res.data as { id: string; institution: string; degree?: string | null; startDate: Date; endDate?: Date | null; bulletPoints?: string[] }
            onUpdateSuccess?.({ id: raw.id, institution: raw.institution, degree: raw.degree ?? undefined, startDate: new Date(raw.startDate), endDate: raw.endDate ? new Date(raw.endDate) : undefined, bulletPoints: raw.bulletPoints })
        } else if (!res.success) {
            toast.error(res.message || "Failed to save")
        }
    }

    return (
        <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 grid gap-3 sm:grid-cols-2">
                    <div>
                        <Label>Institution</Label>
                        <Input
                            value={local.institution}
                            onChange={(e) =>
                                setLocal((p) => ({ ...p, institution: e.target.value }))
                            }
                            placeholder="e.g. MIT"
                        />
                    </div>
                    <div>
                        <Label>Degree (Optional)</Label>
                        <Input
                            value={local.degree}
                            onChange={(e) =>
                                setLocal((p) => ({ ...p, degree: e.target.value }))
                            }
                            placeholder="e.g. B.Tech in CSE"
                        />
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    className="text-destructive shrink-0"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
            <div>
                <Label>Details (Optional)</Label>
                <Textarea
                    value={local.description}
                    onChange={(e) =>
                        setLocal((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="One point per line..."
                    rows={3}
                    className="resize-none"
                />
            </div>
            <div className="flex flex-wrap gap-4 items-end">
                <div>
                    <Label>Start Date</Label>
                    <Popover>
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
                                onSelect={(d) =>
                                    d && setLocal((p) => ({ ...p, startDate: d }))
                                }
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <Label>End Date (Optional)</Label>
                    <Popover>
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
                                    setLocal((p) => ({ ...p, endDate: d ?? undefined }))
                                }
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <Button onClick={handleSave} disabled={saving} size="sm">
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