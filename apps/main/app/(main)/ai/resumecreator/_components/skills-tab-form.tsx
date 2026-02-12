"use client"

import { useState } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import {
    Plus, Trash2, Loader2
} from "lucide-react"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select"
import Link from "next/link"
import toast from "@repo/ui/components/ui/sonner"
import type { UserSkill } from "@/types/user"
import { SkillCategory } from "@repo/prisma/client"

type Skill = { id: string; name: string; category?: string; order?: number }

const CATEGORIES: { value: SkillCategory; label: string }[] = [
    { value: "LANGUAGES", label: "Languages" },
    { value: "FRAMEWORKS_LIBRARIES", label: "Frameworks & Libraries" },
    { value: "TOOLS_DATABASES", label: "Tools & Databases" },
    { value: "PLATFORMS", label: "Platforms" },
    { value: "AI_TOOLS", label: "AI Tools" },
    { value: "FRONTEND", label: "Frontend" },
    { value: "BACKEND", label: "Backend" },
    { value: "API", label: "API" },
    { value: "DATABASE", label: "Database" },
    { value: "DEVOPS", label: "DevOps" },
    { value: "CLOUD", label: "Cloud" },
]

export function SkillsTabForm({
    skills,
    onUpdate,
    onDeleteSkill,
    onSuccess,
}: {
    skills: Skill[]
    onUpdate: (skills: UserSkill[]) => Promise<UserSkill[]>
    onDeleteSkill?: (id: string) => Promise<void>
    onSuccess: () => void | Promise<void>
}) {
    const [local, setLocal] = useState<Skill[]>(skills)
    const [saving, setSaving] = useState(false)
    const [newName, setNewName] = useState("")
    const [newCategory, setNewCategory] = useState<SkillCategory>("LANGUAGES")

    const handleAdd = () => {
        if (!newName.trim()) return
        setLocal((p) => [
            ...p,
            {
                id: `temp-${Date.now()}`,
                name: newName.trim(),
                category: newCategory,
            },
        ])
        setNewName("")
    }

    const handleRemove = (id: string) => {
        setLocal((p) => p.filter((s) => s.id !== id))
    }

    const handleSkillChange = (id: string, field: "name" | "category", value: string) => {
        setLocal((p) =>
            p.map((s) =>
                s.id === id ? { ...s, [field]: value } : s
            )
        )
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const localIds = new Set(local.map((s) => s.id).filter((id) => !id.startsWith("temp-")))
            const originalIds = new Set(skills.map((s) => s.id))
            for (const id of originalIds) {
                if (!localIds.has(id) && onDeleteSkill) {
                    await onDeleteSkill(id)
                }
            }
            const toSend: UserSkill[] = local.map((s) => ({
                id: s.id.startsWith("temp-") ? undefined : s.id,
                name: s.name,
                level: 1,
                category: (s.category as SkillCategory) || "FRONTEND",
            }))
            await onUpdate(toSend)
            toast.success("Skills saved")
            await onSuccess()
        } catch {
            toast.error("Failed to save skills")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Skills</h3>
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
            <div className="rounded-xl border bg-card p-6 space-y-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[150px]">
                        <Label>Skill Name</Label>
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g. React, Python"
                            onKeyDown={(e) =>
                                e.key === "Enter" && (e.preventDefault(), handleAdd())
                            }
                        />
                    </div>
                    <div className="w-[200px]">
                        <Label>Category</Label>
                        <Select
                            value={newCategory}
                            onValueChange={(v) => setNewCategory(v as SkillCategory)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleAdd} size="sm" className="gap-1.5">
                        <Plus className="w-4 h-4" />
                        Add
                    </Button>
                </div>

                {
                    local.length > 0 ? (
                        <div className="space-y-2">
                            <Label>Your skills</Label>
                            <div className="flex flex-wrap gap-2">
                                {
                                    local.map((skill) => (
                                        <div
                                            key={skill.id}
                                            className="flex items-center gap-2 rounded-lg border px-3 py-2 bg-muted/30"
                                        >
                                            <Input
                                                value={skill.name}
                                                onChange={(e) =>
                                                    handleSkillChange(skill.id, "name", e.target.value)
                                                }
                                                className="h-8 w-24 border-0 bg-transparent p-0 focus-visible:ring-0"
                                            />
                                            <Select
                                                value={skill.category || "FRONTEND"}
                                                onValueChange={(v) =>
                                                    handleSkillChange(skill.id, "category", v)
                                                }
                                            >
                                                <SelectTrigger className="h-8 w-[140px] border-0 bg-transparent">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {
                                                        CATEGORIES.map((c) => (
                                                            <SelectItem key={c.value} value={c.value}>
                                                                {c.label}
                                                            </SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive"
                                                onClick={() => handleRemove(skill.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No skills yet. Add skills above. You can also manage skills in{" "}
                            <Link href="/profile/settings?tab=skills" className="text-primary hover:underline">
                                Profile Settings
                            </Link>
                            .
                        </p>
                    )
                }
            </div>
        </div>
    )
}