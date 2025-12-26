'use client'

import { useState } from 'react'
import {
    X, Link as LinkIcon, Image as ImageIcon, Loader2, Check
} from 'lucide-react'
import Image from 'next/image'
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Label } from '@repo/ui/components/ui/label'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import { Badge } from '@repo/ui/components/ui/badge'
import toast from '@repo/ui/components/ui/sonner'
import { submitProjectIdea } from '@/actions/(main)/projects/project-ideas.action'
import { uploadImageToCloudinary } from '@/actions/(common)/shared/upload.action'

interface SubmitProjectIdeaSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SubmitProjectIdeaSheet({ open, onOpenChange }: SubmitProjectIdeaSheetProps) {
    const [loading, setLoading] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)

    const [formData, setFormData] = useState({
        projectTitle: '',
        projectDescription: '',
        generationType: '',
        difficulty: '',
        primaryLanguageOrFramework: '',
        technology: '',
        technologies: [] as string[],
        categories: [] as string[],
        images: [] as string[],
        figmaLinks: [] as string[],
        resourceLinks: [] as string[],
    })

    const [techInput, setTechInput] = useState('')
    const [categoryInput, setCategoryInput] = useState('')
    const [figmaInput, setFigmaInput] = useState('')
    const [resourceInput, setResourceInput] = useState('')

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB')
            return
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file')
            return
        }

        setUploadingImage(true)
        try {
            const uploadFormData = new FormData()
            uploadFormData.append('file', file)

            const result = await uploadImageToCloudinary(uploadFormData)

            if (result.success && result.url) {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, result.url!],
                }))
                toast.success('Image uploaded successfully')
            } else {
                toast.error(result.message || 'Failed to upload image')
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload image')
        } finally {
            setUploadingImage(false)
        }
    }

    const handleSubmit = async () => {
        // Validation
        if (!formData.projectTitle.trim()) {
            toast.error('Please enter a project title')
            return
        }

        if (!formData.projectDescription.trim()) {
            toast.error('Please enter a project description')
            return
        }

        if (!formData.generationType) {
            toast.error('Please select a generation type')
            return
        }

        if (!formData.difficulty) {
            toast.error('Please select a difficulty level')
            return
        }

        if (!formData.technology) {
            toast.error('Please select a technology')
            return
        }

        setLoading(true)
        try {
            const result = await submitProjectIdea(formData)

            if (result.success) {
                toast.success(result.message || 'Project idea submitted successfully!')
                onOpenChange(false)
                // Reset form
                setFormData({
                    projectTitle: '',
                    projectDescription: '',
                    generationType: '',
                    difficulty: '',
                    primaryLanguageOrFramework: '',
                    technology: '',
                    technologies: [],
                    categories: [],
                    images: [],
                    figmaLinks: [],
                    resourceLinks: [],
                })
            } else {
                toast.error(result.error || 'Failed to submit project idea')
            }
        } catch (error) {
            console.error('Submit error:', error)
            toast.error('Failed to submit project idea')
        } finally {
            setLoading(false)
        }
    }

    const addTechnology = () => {
        if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
            setFormData(prev => ({
                ...prev,
                technologies: [...prev.technologies, techInput.trim()],
            }))
            setTechInput('')
        }
    }

    const removeTechnology = (tech: string) => {
        setFormData(prev => ({
            ...prev,
            technologies: prev.technologies.filter(t => t !== tech),
        }))
    }

    const addCategory = () => {
        if (categoryInput.trim() && !formData.categories.includes(categoryInput.trim())) {
            setFormData(prev => ({
                ...prev,
                categories: [...prev.categories, categoryInput.trim()],
            }))
            setCategoryInput('')
        }
    }

    const removeCategory = (cat: string) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c !== cat),
        }))
    }

    const addFigmaLink = () => {
        if (figmaInput.trim() && !formData.figmaLinks.includes(figmaInput.trim())) {
            setFormData(prev => ({
                ...prev,
                figmaLinks: [...prev.figmaLinks, figmaInput.trim()],
            }))
            setFigmaInput('')
        }
    }

    const addResourceLink = () => {
        if (resourceInput.trim() && !formData.resourceLinks.includes(resourceInput.trim())) {
            setFormData(prev => ({
                ...prev,
                resourceLinks: [...prev.resourceLinks, resourceInput.trim()],
            }))
            setResourceInput('')
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Submit Project Idea</SheetTitle>
                    <SheetDescription>
                        Share your project idea with the community. You&qpos;ll earn 20 XP once it&apos;s approved!
                    </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                    <div>
                        <Label htmlFor="title">Project Title *</Label>
                        <Input
                            id="title"
                            placeholder="e.g., React Task Manager"
                            value={formData.projectTitle}
                            onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <Label htmlFor="description">Project Description *</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe what the project does, key features, and learning outcomes..."
                            value={formData.projectDescription}
                            onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                            rows={4}
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <Label>Generation Type *</Label>
                        <Select
                            value={formData.generationType}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, generationType: value }))}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FRONTEND">Frontend</SelectItem>
                                <SelectItem value="FULL_STACK">Full Stack</SelectItem>
                                <SelectItem value="BACKEND">Backend</SelectItem>
                                <SelectItem value="AI_AGENT">AI Agent</SelectItem>
                                <SelectItem value="PROGRAMS">Programs</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Difficulty Level *</Label>
                        <Select
                            value={formData.difficulty}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BEGINNER">Beginner</SelectItem>
                                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                <SelectItem value="ADVANCED">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Main Technology *</Label>
                        <Select
                            value={formData.technology}
                            onValueChange={(value) => {
                                setFormData(prev => ({
                                    ...prev,
                                    technology: value,
                                    primaryLanguageOrFramework: value,
                                }))
                            }}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select technology" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="React">React</SelectItem>
                                <SelectItem value="Next.js">Next.js</SelectItem>
                                <SelectItem value="Vue.js">Vue.js</SelectItem>
                                <SelectItem value="Angular">Angular</SelectItem>
                                <SelectItem value="Node.js">Node.js</SelectItem>
                                <SelectItem value="Python">Python</SelectItem>
                                <SelectItem value="Java">Java</SelectItem>
                                <SelectItem value="Go">Go</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Additional Technologies</Label>
                        <div className="flex gap-2 mt-2">
                            <Input
                                placeholder="e.g., TypeScript, Tailwind CSS"
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                            />
                            <Button onClick={addTechnology} variant="outline">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {
                                formData.technologies.map((tech) => (
                                    <Badge key={tech} variant="secondary" className="cursor-pointer" onClick={() => removeTechnology(tech)}>
                                        {tech} ×
                                    </Badge>
                                ))
                            }
                        </div>
                    </div>
                    <div>
                        <Label>Categories</Label>
                        <div className="flex gap-2 mt-2">
                            <Input
                                placeholder="e.g., Web Development, E-Commerce"
                                value={categoryInput}
                                onChange={(e) => setCategoryInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                            />
                            <Button onClick={addCategory} variant="outline">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {
                                formData.categories.map((cat) => (
                                    <Badge key={cat} variant="secondary" className="cursor-pointer" onClick={() => removeCategory(cat)}>
                                        {cat} ×
                                    </Badge>
                                ))
                            }
                        </div>
                    </div>
                    <div>
                        <Label>UI Images (Optional)</Label>
                        <div className="mt-2">
                            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploadingImage}
                                />
                                <div className="text-center">
                                    {
                                        uploadingImage ? (
                                            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-neutral-400" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                                        )
                                    }
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-1">Max 5MB</p>
                                </div>
                            </label>
                        </div>
                        {
                            formData.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {
                                        formData.images.map((img, i) => (
                                            <div key={i} className="relative group">
                                                <Image 
                                                src={img} 
                                                alt="Project preview" 
                                                width={200} 
                                                height={96} 
                                                className="w-full h-24 object-cover rounded-lg" 
                                                />
                                                <button
                                                    onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))
                                    }
                                </div>
                            )
                        }
                    </div>
                    <div>
                        <Label>Figma Links (Optional)</Label>
                        <div className="flex gap-2 mt-2">
                            <Input
                                placeholder="https://figma.com/..."
                                value={figmaInput}
                                onChange={(e) => setFigmaInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFigmaLink())}
                            />
                            <Button onClick={addFigmaLink} variant="outline">
                                <LinkIcon className="w-4 h-4" />
                            </Button>
                        </div>
                        {
                            formData.figmaLinks.length > 0 && (
                                <div className="space-y-1 mt-2">
                                    {
                                        formData.figmaLinks.map((link, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-blue-500">
                                                <LinkIcon className="w-3 h-3" />
                                                <span className="truncate flex-1">{link}</span>
                                                <button onClick={() => setFormData(prev => ({ ...prev, figmaLinks: prev.figmaLinks.filter((_, idx) => idx !== i) }))}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))
                                    }
                                </div>
                            )
                        }
                    </div>
                    <div>
                        <Label>Resource Links (Optional)</Label>
                        <div className="flex gap-2 mt-2">
                            <Input
                                placeholder="https://..."
                                value={resourceInput}
                                onChange={(e) => setResourceInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResourceLink())}
                            />
                            <Button onClick={addResourceLink} variant="outline">
                                <LinkIcon className="w-4 h-4" />
                            </Button>
                        </div>
                        {
                            formData.resourceLinks.length > 0 && (
                                <div className="space-y-1 mt-2">
                                    {
                                        formData.resourceLinks.map((link, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-blue-500">
                                                <LinkIcon className="w-3 h-3" />
                                                <span className="truncate flex-1">{link}</span>
                                                <button onClick={() => setFormData(prev => ({ ...prev, resourceLinks: prev.resourceLinks.filter((_, idx) => idx !== i) }))}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))
                                    }
                                </div>
                            )
                        }
                    </div>
                    <div className="flex gap-2 pt-4">
                        <Button
                            onClick={() => onOpenChange(false)}
                            variant="outline"
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90"
                            disabled={loading}
                        >
                            {
                                loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Submit Idea
                                    </>
                                )
                            }
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}