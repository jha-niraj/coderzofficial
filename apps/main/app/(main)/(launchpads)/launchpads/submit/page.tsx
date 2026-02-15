"use client"

import { useState, useTransition, useRef } from "react"
import { motion } from "framer-motion"
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Label } from "@repo/ui/components/ui/label"
import { Badge } from "@repo/ui/components/ui/badge"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select"
import {
    Rocket, ArrowLeft, Plus, X, Globe, Github, Twitter, CheckCircle,
    Info, Sparkles, Loader2, Upload, Image as ImageIcon
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import toast from "@repo/ui/components/ui/sonner"
import { createLaunchpadProduct } from "@/actions/(main)/launchpads"
import { uploadImageToCloudinary } from "@/actions/(common)/shared/upload.action"
import { useLaunchpadsStore } from "@/app/store/launchpadsStore"
import type { LaunchpadProduct } from "@/types/launchpads"

const categories = [
    { value: 'LEARNING', label: 'Learning & Education' },
    { value: 'PRODUCTIVITY', label: 'Productivity' },
    { value: 'CAREER', label: 'Career & Growth' },
    { value: 'COMMUNITY', label: 'Community & Social' },
    { value: 'DEVELOPER_TOOLS', label: 'Developer Tools' },
    { value: 'AI_POWERED', label: 'AI Powered' },
    { value: 'OTHER', label: 'Other' }
]

export default function SubmitProductPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { addCommunityProduct } = useLaunchpadsStore()

    const [formData, setFormData] = useState({
        name: '',
        tagline: '',
        description: '',
        logo: '',
        websiteUrl: '',
        demoUrl: '',
        githubUrl: '',
        twitterUrl: '',
        category: 'OTHER',
        pricing: 'Free'
    })

    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')
    const [features, setFeatures] = useState<string[]>([])
    const [featureInput, setFeatureInput] = useState('')
    const [techStack, setTechStack] = useState<string[]>([])
    const [techInput, setTechInput] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
            setTags([...tags, tagInput.trim().toLowerCase()])
            setTagInput('')
        }
    }

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag))
    }

    const addFeature = () => {
        if (featureInput.trim() && !features.includes(featureInput.trim())) {
            setFeatures([...features, featureInput.trim()])
            setFeatureInput('')
        }
    }

    const removeFeature = (feature: string) => {
        setFeatures(features.filter(f => f !== feature))
    }

    const addTech = () => {
        if (techInput.trim() && !techStack.includes(techInput.trim())) {
            setTechStack([...techStack, techInput.trim()])
            setTechInput('')
        }
    }

    const removeTech = (tech: string) => {
        setTechStack(techStack.filter(t => t !== tech))
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a JPG, PNG, or WebP image')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be smaller than 5MB')
            return
        }

        // Show preview immediately
        const reader = new FileReader()
        reader.onload = (event) => {
            setLogoPreview(event.target?.result as string)
        }
        reader.readAsDataURL(file)

        // Upload to cloudinary
        setIsUploading(true)
        try {
            const formDataUpload = new FormData()
            formDataUpload.append('file', file)

            const result = await uploadImageToCloudinary(formDataUpload)

            if (result.success && result.url) {
                setFormData(prev => ({ ...prev, logo: result.url! }))
                toast.success('Logo uploaded successfully')
            } else {
                toast.error(result.message || 'Failed to upload logo')
                setLogoPreview(null)
            }
        } catch {
            toast.error('Failed to upload logo')
            setLogoPreview(null)
        } finally {
            setIsUploading(false)
        }
    }

    const handleSubmit = () => {
        if (!formData.name || !formData.tagline || !formData.description) {
            toast.error('Please fill in all required fields')
            return
        }

        startTransition(async () => {
            const result = await createLaunchpadProduct({
                ...formData,
                coverImage: '',
                tags,
                features,
                techStack
            })

            if (result.success && result.product) {
                addCommunityProduct(result.product as LaunchpadProduct)
                toast.success('Product submitted successfully! It will be reviewed shortly.')
                router.push('/launchpads')
            } else {
                toast.error(result.error || 'Failed to submit product')
            }
        })
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-neutral-950">
            <header className="flex-shrink-0 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/launchpads">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <Rocket className="w-5 h-5" />
                                Submit Your Product
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Share your creation with the Coderz community
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || isUploading}
                        className="bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-full px-6"
                    >
                        {
                            isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Submit Product
                                </>
                            )
                        }
                    </Button>
                </div>
            </header>
            <ScrollArea className="flex-1">
                <div className="max-w-3xl mx-auto p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                    >
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                                    Submission Guidelines
                                </h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                    Your product will be reviewed by our team before being published.
                                    Make sure to provide accurate information and a high-quality logo.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-8"
                    >
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                Basic Information
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name" className="text-neutral-900 dark:text-white">
                                        Product Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., CodeMentor AI"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="mt-2 h-12 border-neutral-200 dark:border-neutral-800"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="tagline" className="text-neutral-900 dark:text-white">
                                        Tagline <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="tagline"
                                        placeholder="A short, catchy description (max 100 characters)"
                                        maxLength={100}
                                        value={formData.tagline}
                                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                        className="mt-2 h-12 border-neutral-200 dark:border-neutral-800"
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">
                                        {formData.tagline.length}/100 characters
                                    </p>
                                </div>
                                <div>
                                    <Label htmlFor="description" className="text-neutral-900 dark:text-white">
                                        Description <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe your product in detail. What does it do? What problem does it solve?"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="mt-2 min-h-[150px] border-neutral-200 dark:border-neutral-800"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="category" className="text-neutral-900 dark:text-white">
                                            Category <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(v) => setFormData({ ...formData, category: v })}
                                        >
                                            <SelectTrigger className="mt-2 h-12 border-neutral-200 dark:border-neutral-800">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    categories.map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="pricing" className="text-neutral-900 dark:text-white">
                                            Pricing
                                        </Label>
                                        <Select
                                            value={formData.pricing}
                                            onValueChange={(v) => setFormData({ ...formData, pricing: v })}
                                        >
                                            <SelectTrigger className="mt-2 h-12 border-neutral-200 dark:border-neutral-800">
                                                <SelectValue placeholder="Select pricing" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Free">Free</SelectItem>
                                                <SelectItem value="Freemium">Freemium</SelectItem>
                                                <SelectItem value="Paid">Paid</SelectItem>
                                                <SelectItem value="Open Source">Open Source</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                Logo
                            </h2>
                            <div>
                                <Label className="text-neutral-900 dark:text-white">
                                    Product Logo
                                </Label>
                                <p className="text-xs text-neutral-500 mt-1 mb-3">
                                    Upload a square image, at least 256x256px (JPG, PNG, or WebP)
                                </p>
                                <div className="flex items-start gap-4">
                                    <div className="relative">
                                        {
                                            logoPreview || formData.logo ? (
                                                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
                                                    <Image
                                                        src={logoPreview || formData.logo}
                                                        alt="Logo preview"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    {
                                                        isUploading && (
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
                                                    <ImageIcon className="w-8 h-8 text-neutral-400" />
                                                </div>
                                            )
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="h-12"
                                        >
                                            {
                                                isUploading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        {logoPreview || formData.logo ? 'Change Logo' : 'Upload Logo'}
                                                    </>
                                                )
                                            }
                                        </Button>
                                        {
                                            (logoPreview || formData.logo) && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setLogoPreview(null)
                                                        setFormData(prev => ({ ...prev, logo: '' }))
                                                    }}
                                                    className="ml-2 text-red-500 hover:text-red-600"
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Remove
                                                </Button>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                Links
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="websiteUrl" className="text-neutral-900 dark:text-white flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        Website
                                    </Label>
                                    <Input
                                        id="websiteUrl"
                                        placeholder="https://yourproduct.com"
                                        value={formData.websiteUrl}
                                        onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                                        className="mt-2 h-12 border-neutral-200 dark:border-neutral-800"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="demoUrl" className="text-neutral-900 dark:text-white flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Demo URL
                                    </Label>
                                    <Input
                                        id="demoUrl"
                                        placeholder="https://demo.yourproduct.com"
                                        value={formData.demoUrl}
                                        onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                                        className="mt-2 h-12 border-neutral-200 dark:border-neutral-800"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="githubUrl" className="text-neutral-900 dark:text-white flex items-center gap-2">
                                        <Github className="w-4 h-4" />
                                        GitHub
                                    </Label>
                                    <Input
                                        id="githubUrl"
                                        placeholder="https://github.com/username/repo"
                                        value={formData.githubUrl}
                                        onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                                        className="mt-2 h-12 border-neutral-200 dark:border-neutral-800"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="twitterUrl" className="text-neutral-900 dark:text-white flex items-center gap-2">
                                        <Twitter className="w-4 h-4" />
                                        Twitter/X
                                    </Label>
                                    <Input
                                        id="twitterUrl"
                                        placeholder="https://twitter.com/yourproduct"
                                        value={formData.twitterUrl}
                                        onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                                        className="mt-2 h-12 border-neutral-200 dark:border-neutral-800"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                Features
                            </h2>
                            <div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a feature (e.g., Real-time collaboration)"
                                        value={featureInput}
                                        onChange={(e) => setFeatureInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                        className="h-12 border-neutral-200 dark:border-neutral-800"
                                    />
                                    <Button
                                        type="button"
                                        onClick={addFeature}
                                        variant="outline"
                                        className="h-12 px-4"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                {
                                    features.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {
                                                features.map((feature, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                        className="px-3 py-1 flex items-center gap-1"
                                                    >
                                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                                        {feature}
                                                        <button onClick={() => removeFeature(feature)} className="ml-1">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                Tech Stack
                            </h2>
                            <div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add technology (e.g., React, Node.js)"
                                        value={techInput}
                                        onChange={(e) => setTechInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                                        className="h-12 border-neutral-200 dark:border-neutral-800"
                                    />
                                    <Button
                                        type="button"
                                        onClick={addTech}
                                        variant="outline"
                                        className="h-12 px-4"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                {
                                    techStack.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {
                                                techStack.map((tech, index) => (
                                                    <Badge
                                                        key={index}
                                                        className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 flex items-center gap-1"
                                                    >
                                                        {tech}
                                                        <button onClick={() => removeTech(tech)} className="ml-1">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                Tags
                            </h2>
                            <div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a tag (e.g., ai, productivity)"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        className="h-12 border-neutral-200 dark:border-neutral-800"
                                    />
                                    <Button
                                        type="button"
                                        onClick={addTag}
                                        variant="outline"
                                        className="h-12 px-4"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                {
                                    tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {
                                                tags.map((tag, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="outline"
                                                        className="px-3 py-1 flex items-center gap-1"
                                                    >
                                                        #{tag}
                                                        <button onClick={() => removeTag(tag)} className="ml-1">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
                            <Button
                                onClick={handleSubmit}
                                disabled={isPending || isUploading}
                                className="w-full h-14 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-xl text-lg font-medium"
                            >
                                {
                                    isPending ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Submit Product for Review
                                        </>
                                    )
                                }
                            </Button>
                            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-4">
                                By submitting, you agree to our community guidelines
                            </p>
                        </div>
                    </motion.div>
                </div>
            </ScrollArea>
        </div>
    )
}