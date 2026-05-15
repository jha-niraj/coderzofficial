"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@repo/ui/components/ui/button"
import {
    MessageSquare, Upload, X
} from "lucide-react"
import FeedbackList from "./feedbacklist"
import { Sheet, SheetContent } from "@repo/ui/components/ui/sheet"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select"
import { Textarea } from "@repo/ui/components/ui/textarea"
import {
    SheetFooter, SheetHeader, SheetTitle, SheetDescription
} from "@repo/ui/components/ui/sheet"
import toast from "@repo/ui/components/ui/sonner"
import { FeedbackCategory, FeedbackStatus } from "@repo/db"
import { useFeedbackStore } from "@/app/store/feedbackStore"
import { motion } from "framer-motion"
import { uploadImageToCloudinary } from "@/actions/(common)/shared/upload.action"
import { compressImage } from "@/utils/imageCompression"
import Image from "next/image"

interface FormData {
    title: string;
    description: string;
    category: FeedbackCategory;
    imageUrl?: string;
}

export default function FeedbackPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [formData, setFormData] = useState<FormData>({
        title: "",
        description: "",
        category: FeedbackCategory.BUG,
        imageUrl: undefined,
    })
    const { submitFeedback, fetchFeedback, feedbackByStatus } = useFeedbackStore();

    useEffect(() => {
        // Fetch all statuses on mount
        fetchFeedback(FeedbackStatus.UNDER_REVIEW);
        fetchFeedback(FeedbackStatus.PLANNED);
        fetchFeedback(FeedbackStatus.COMPLETED);
    }, [fetchFeedback]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleCategoryChange = (value: string) => {
        setFormData((prev) => ({ ...prev, category: value as FeedbackCategory }))
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be smaller than 5MB')
            return
        }

        setIsUploading(true)
        const originalSize = (file.size / 1024 / 1024).toFixed(2)

        // Use a single toast with ID for smooth updates
        const toastId = toast.loading('Compressing image...')

        try {
            // Compress image before uploading
            const compressedBlob = await compressImage(file, 1200, 1200, 0.85)
            const compressedSize = (compressedBlob.size / 1024 / 1024).toFixed(2)

            // Convert blob to file
            const compressedFile = new File([compressedBlob], file.name, { type: file.type })

            // Update the same toast
            toast.loading('Uploading image...', { id: toastId })

            const formData = new FormData()
            formData.append('file', compressedFile)
            const result = await uploadImageToCloudinary(formData)

            if (result.success && result.url) {
                setFormData(prev => ({ ...prev, imageUrl: result.url! }))
                setImagePreview(result.url)
                toast.success(`Image uploaded! (${originalSize}MB → ${compressedSize}MB)`, { id: toastId })
            } else {
                toast.error(result.message || 'Failed to upload image', { id: toastId })
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload image', { id: toastId })
        } finally {
            setIsUploading(false)
        }
    }

    const removeImage = () => {
        setImagePreview(null)
        setFormData(prev => ({ ...prev, imageUrl: undefined }))
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            await submitFeedback({
                ...formData,
            });

            setFormData({
                title: "",
                description: "",
                category: FeedbackCategory.BUG,
                imageUrl: undefined,
            })
            setImagePreview(null)

            setIsSheetOpen(false)
        } catch (err) {
            const error = err as Error;
            console.error('Error submitting feedback:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleOpenSubmitForm = () => {
        setIsSheetOpen(true)
    }

    const underReviewCount = feedbackByStatus["under-review"]?.length || 0;
    const plannedCount = feedbackByStatus["planned"]?.length || 0;
    const inProgressCount = feedbackByStatus["completed"]?.length || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50 dark:from-neutral-950 dark:to-blue-950/30">
            <div className="w-full mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400">
                                Feedback
                            </h1>
                            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                                Share ideas and help us improve • Earn rewards for valuable feedback
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleOpenSubmitForm}
                        className="bg-white dark:bg-neutral-900 shadow-2xl rounded-xl text-black dark:text-white font-semibold"
                        size="lg"
                    >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        PROVIDE FEEDBACK
                    </Button>
                </motion.div>
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800">
                        <form onSubmit={handleSubmit}>
                            <SheetHeader className="mb-6">
                                <SheetTitle className="text-2xl font-bold text-neutral-900 dark:text-white">Submit Feedback</SheetTitle>
                                <SheetDescription className="text-neutral-600 dark:text-neutral-400">
                                    Share your thoughts, report bugs, or request new features.
                                    You&apos;ll earn 25 XP for each submission and may receive additional rewards for valuable feedback!
                                </SheetDescription>
                            </SheetHeader>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="Brief summary of your feedback"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={formData.category} onValueChange={handleCategoryChange} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FeedbackCategory.BUG}>Bug Report</SelectItem>
                                            <SelectItem value={FeedbackCategory.FEATURE}>Feature Request</SelectItem>
                                            <SelectItem value={FeedbackCategory.UI}>UI Suggestion</SelectItem>
                                            <SelectItem value={FeedbackCategory.OTHER}>Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Provide details about your feedback"
                                        className="min-h-32"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Image (Optional)</Label>
                                    <div className="space-y-3">
                                        {
                                            imagePreview ? (
                                                <div className="relative group">
                                                    <Image
                                                        src={imagePreview}
                                                        alt="Feedback preview"
                                                        width={400}
                                                        height={300}
                                                        className="w-full h-48 object-cover rounded-lg border border-neutral-200 dark:border-neutral-800"
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="destructive"
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={removeImage}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-8 text-center cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                                                >
                                                    <Upload className="w-8 h-8 mx-auto mb-3 text-neutral-400 dark:text-neutral-600" />
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                                                        {isUploading ? 'Uploading...' : 'Click to upload an image'}
                                                    </p>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-500">
                                                        PNG, JPG, WEBP up to 5MB
                                                    </p>
                                                </div>
                                            )
                                        }
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={isUploading}
                                        />
                                    </div>
                                </div>
                            </div>
                            <SheetFooter className="mt-6">
                                <Button type="button" variant="outline" onClick={() => {
                                    setIsSheetOpen(false);
                                    setImagePreview(null);
                                    setFormData({
                                        title: "",
                                        description: "",
                                        category: FeedbackCategory.BUG,
                                        imageUrl: undefined,
                                    });
                                }}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || isUploading}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                                </Button>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                Under Review
                            </h2>
                            <span className="px-3 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium">
                                {underReviewCount}
                            </span>
                        </div>
                        <div className="flex-1 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 overflow-y-auto">
                            <FeedbackList
                                status="under-review"
                                onStatusChange={() => { }}
                                setFeedbackSheetStatus={() => setIsSheetOpen(true)}
                            />
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                Planned
                            </h2>
                            <span className="px-3 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium">
                                {plannedCount}
                            </span>
                        </div>
                        <div className="flex-1 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 overflow-y-auto">
                            <FeedbackList
                                status="planned"
                                onStatusChange={() => { }}
                                setFeedbackSheetStatus={() => setIsSheetOpen(true)}
                            />
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                In Progress
                            </h2>
                            <span className="px-3 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium">
                                {inProgressCount}
                            </span>
                        </div>
                        <div className="flex-1 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 overflow-y-auto">
                            <FeedbackList
                                status="completed"
                                onStatusChange={() => { }}
                                setFeedbackSheetStatus={() => setIsSheetOpen(true)}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}