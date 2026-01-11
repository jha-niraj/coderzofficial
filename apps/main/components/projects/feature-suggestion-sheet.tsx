"use client"

import { useState } from "react"
import { Button } from "@repo/ui/components/ui/button"
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
    SheetTrigger
} from "@repo/ui/components/ui/sheet"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Textarea } from "@repo/ui/components/ui/textarea"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select"
import { Badge } from "@repo/ui/components/ui/badge"
import {
    Lightbulb, X, Loader2
} from "lucide-react"
import {
    createFeatureSuggestion
} from "@/actions/(main)/projects/feature-suggestions.action"
import toast from "@repo/ui/components/ui/sonner"
import Image from "next/image"

interface FeatureSuggestionSheetProps {
    projectId: string
    projectSlug?: string
    isCreator?: boolean
    isEnrolled?: boolean
}

export function FeatureSuggestionSheet({ projectId, isCreator = false, isEnrolled = false }: FeatureSuggestionSheetProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [type, setType] = useState("FEATURE")
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const handleAddTag = () => {
        if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()])
            setTagInput("")
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size must be less than 5MB")
                return
            }
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append("projectId", projectId)
            formData.append("title", title)
            formData.append("description", description)
            formData.append("type", type)
            formData.append("tags", tags.join(","))
            if (imageFile) {
                formData.append("image", imageFile)
            }

            const result = await createFeatureSuggestion(formData)

            if (result.success) {
                toast.success(result.message)
                setOpen(false)
                // Reset form
                setTitle("")
                setDescription("")
                setType("FEATURE")
                setTags([])
                setImageFile(null)
                setImagePreview(null)
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.log("Error occurred while submitting suggesstion: " + error);
            toast.error("Failed to submit suggestion")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 w-fit">
                    <Lightbulb className="h-4 w-4" />
                    {isCreator ? "Add Task" : isEnrolled ? "Add Task" : "Suggest Feature"}
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] w-full overflow-y-auto">
                <section className="w-full max-w-5xl mx-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {isCreator ? "Add New Task" : isEnrolled ? "Add Task to Project" : "Suggest a Feature"}
                        </SheetTitle>
                        <SheetDescription>
                            {
                                isCreator
                                    ? "Add a new task to your project. It will be available for all enrolled users as a suggestion."
                                    : isEnrolled
                                        ? "Add a new task to the project. Other enrolled users can adopt it from suggestions."
                                        : "Have an idea to improve this project? Share your suggestion with the creator!"
                            }
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Title <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="Brief title for your suggestion"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength={100}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    {title.length}/100 characters
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">
                                    Type <span className="text-red-500">*</span>
                                </Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FEATURE">Feature</SelectItem>
                                        <SelectItem value="IMPROVEMENT">Improvement</SelectItem>
                                        <SelectItem value="BUG_FIX">Bug Fix</SelectItem>
                                        <SelectItem value="UI_UX">UI/UX</SelectItem>
                                        <SelectItem value="PERFORMANCE">Performance</SelectItem>
                                        <SelectItem value="DOCUMENTATION">Documentation</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </section>
                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Description <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Describe your suggestion in detail..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                maxLength={1000}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                {description.length}/1000 characters
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (Max 5)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="tags"
                                    placeholder="Add a tag (e.g., frontend, backend)"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault()
                                            handleAddTag()
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleAddTag}
                                    disabled={tags.length >= 5}
                                >
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {
                                    tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="gap-1">
                                            {tag}
                                            <X
                                                className="h-3 w-3 cursor-pointer"
                                                onClick={() => handleRemoveTag(tag)}
                                            />
                                        </Badge>
                                    ))
                                }
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image">Screenshot/Mockup (Optional)</Label>
                            <div className="space-y-3">
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleImageChange}
                                />
                                {
                                    imagePreview && (
                                        <div className="relative">
                                            <Image
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-48 object-cover rounded-lg border"
                                                height={48}
                                                width={48}
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={() => {
                                                    setImageFile(null)
                                                    setImagePreview(null)
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )
                                }
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Max 5MB. Supports JPG, PNG, WebP
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {
                                    loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isCreator || isEnrolled ? "Adding..." : "Submitting..."}
                                        </>
                                    ) : (
                                        <>
                                            {isCreator ? "Add Task" : isEnrolled ? "Add Task" : "Submit Suggestion"}
                                        </>
                                    )
                                }
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </section>
            </SheetContent>
        </Sheet>
    )
}