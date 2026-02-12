"use client"

import { useState } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Plus, Trash2, Loader2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/components/ui/select"
import toast from "@repo/ui/components/ui/sonner"

type SocialLink = {
    id: string
    platform: string
    url: string
}

const PLATFORMS = [
    { value: "GITHUB", label: "GitHub", example: "https://github.com/your-profile" },
    { value: "LINKEDIN", label: "LinkedIn", example: "https://linkedin.com/in/your-profile" },
    { value: "TWITTER", label: "Twitter/X", example: "https://x.com/your-profile" },
    { value: "PORTFOLIO", label: "Portfolio", example: "https://yourportfolio.com" },
]

export function SocialsTabForm({
    socialLinks,
    onAdd,
    onDelete,
    onSuccess,
}: {
    socialLinks: SocialLink[]
    onAdd: (data: { platform: string; url: string }) => Promise<{ success: boolean; message?: string }>
    onDelete: (id: string) => Promise<{ success: boolean; message?: string }>
    onSuccess: () => void | Promise<void>
}) {
    const [adding, setAdding] = useState(false)
    const [newPlatform, setNewPlatform] = useState(PLATFORMS[0].value)
    const [newUrl, setNewUrl] = useState("")

    const handleAdd = async () => {
        if (!newUrl.trim()) {
            toast.error("Enter a profile URL")
            return
        }
        setAdding(true)
        const res = await onAdd({
            platform: newPlatform,
            url: newUrl.trim(),
        })
        setAdding(false)
        if (res.success) {
            toast.success("Social link added")
            setNewUrl("")
            await onSuccess()
        } else {
            toast.error(res.message || "Failed to add")
        }
    }

    const handleDelete = async (id: string) => {
        const res = await onDelete(id)
        if (res.success) {
            toast.success("Link removed")
            await onSuccess()
        } else {
            toast.error(res.message || "Failed to remove")
        }
    }

    const usedPlatforms = socialLinks.map((l) => l.platform)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Social Platforms</h3>
                <Button
                    onClick={handleAdd}
                    size="sm"
                    className="gap-1.5"
                    disabled={adding || !newUrl.trim()}
                >
                    {adding ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Plus className="w-4 h-4" />
                    )}
                    Add Social
                </Button>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-4">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <Label>Platform</Label>
                        <Select
                            value={newPlatform}
                            onValueChange={setNewPlatform}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PLATFORMS.filter(
                                    (p) => !usedPlatforms.includes(p.value)
                                ).map((p) => (
                                    <SelectItem key={p.value} value={p.value}>
                                        {p.label}
                                    </SelectItem>
                                ))}
                                {PLATFORMS.filter((p) =>
                                    usedPlatforms.includes(p.value)
                                ).map((p) => (
                                    <SelectItem
                                        key={p.value}
                                        value={p.value}
                                        disabled
                                    >
                                        {p.label} (added)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <Label>Profile URL</Label>
                        <Input
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder={
                                PLATFORMS.find((p) => p.value === newPlatform)
                                    ?.example || "https://..."
                            }
                        />
                    </div>
                </div>
            </div>

            {socialLinks.length > 0 && (
                <div className="space-y-3">
                    <Label>Your links</Label>
                    <div className="space-y-2">
                        {socialLinks.map((link) => (
                            <div
                                key={link.id}
                                className="flex items-center justify-between gap-4 rounded-lg border p-4"
                            >
                                <div>
                                    <p className="font-medium">
                                        {
                                            PLATFORMS.find(
                                                (p) => p.value === link.platform
                                            )?.label || link.platform
                                        }
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                        {link.url}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(link.id)}
                                    className="text-destructive shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
