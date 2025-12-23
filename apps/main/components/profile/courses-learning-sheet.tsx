"use client"

import type React from "react"
import { useState } from "react"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { X, Plus } from "lucide-react"
import type { UserCourse, UserLearningPath } from "@/types"

interface CoursesAndLearningSheetProps {
    open: boolean
    onClose: () => void
    onSave: (data: { courses: UserCourse[]; learningPaths: UserLearningPath[] }) => void
    initialData: {
        courses: UserCourse[]
        learningPaths: UserLearningPath[]
    }
}

export const CoursesAndLearningSheet = ({ open, onClose, onSave, initialData }: CoursesAndLearningSheetProps) => {
    const [courses, setCourses] = useState<UserCourse[]>(initialData.courses || [])
    const [learningPaths, setLearningPaths] = useState<UserLearningPath[]>(initialData.learningPaths || [])

    const handleAddCourse = () => {
        setCourses([
            ...courses,
            { id: `temp-${Date.now()}`, title: "", progress: 0, lastAccessed: new Date().toISOString() },
        ])
    }

    const handleRemoveCourse = (index: number) => {
        setCourses(courses.filter((_, i) => i !== index))
    }

    const handleCourseChange = (index: number, field: keyof UserCourse, value: any) => {
        const updatedCourses = [...courses]
        updatedCourses[index] = { ...updatedCourses[index], [field]: value }
        setCourses(updatedCourses)
    }

    const handleAddLearningPath = () => {
        setLearningPaths([
            ...learningPaths,
            {
                id: `temp-${Date.now()}`,
                name: "",
                progress: 0,
                completedCourses: 0,
                totalCourses: 1,
            },
        ])
    }

    const handleRemoveLearningPath = (index: number) => {
        setLearningPaths(learningPaths.filter((_, i) => i !== index))
    }

    const handleLearningPathChange = (index: number, field: keyof UserLearningPath, value: any) => {
        const updatedLearningPaths = [...learningPaths]
        updatedLearningPaths[index] = { ...updatedLearningPaths[index], [field]: value }

        // If we're updating completed courses, also update the progress
        if (field === "completedCourses") {
            const totalCourses = updatedLearningPaths[index].totalCourses || 1
            updatedLearningPaths[index].progress = Math.round((value / totalCourses) * 100)
        }

        // If we're updating total courses, also update the progress
        if (field === "totalCourses") {
            const completedCourses = updatedLearningPaths[index].completedCourses || 0
            updatedLearningPaths[index].progress = Math.round((completedCourses / value) * 100)
        }

        setLearningPaths(updatedLearningPaths)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave({
            courses,
            learningPaths,
        })
    }

    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-md md:max-w-xl p-0 border-l border-gray-100 dark:border-gray-800 overflow-y-auto"
            >
                <SheetHeader className="pb-4 border-b border-gray-100 dark:border-gray-800 p-6">
                    <SheetTitle className="text-xl font-bold text-gray-900 dark:text-gray-50">
                        Courses & Learning Paths
                    </SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-8 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Courses</h3>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={handleAddCourse}
                                    className="border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Course
                                </Button>
                            </div>
                            {
                                courses.map((course, index) => (
                                    <div
                                        key={course.id}
                                        className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="flex justify-between items-start">
                                            <Label htmlFor={`course-${index}`} className="text-gray-700 dark:text-gray-300">
                                                Course Title
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveCourse(index)}
                                                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            >
                                                <X className="h-4 w-4" />
                                                <span className="sr-only">Remove</span>
                                            </Button>
                                        </div>
                                        <Input
                                            id={`course-${index}`}
                                            value={course.title}
                                            onChange={(e) => handleCourseChange(index, "title", e.target.value)}
                                            placeholder="e.g. Introduction to React"
                                            className="border-gray-200 dark:border-gray-700"
                                        />
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <Label htmlFor={`course-progress-${index}`} className="text-gray-700 dark:text-gray-300">
                                                    Progress
                                                </Label>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{course.progress}%</span>
                                            </div>
                                            <Slider
                                                id={`course-progress-${index}`}
                                                value={[course.progress]}
                                                min={0}
                                                max={100}
                                                step={1}
                                                onValueChange={([value]) => handleCourseChange(index, "progress", value)}
                                                className="bg-gray-100 dark:bg-gray-700"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`course-accessed-${index}`} className="text-gray-700 dark:text-gray-300">
                                                Last Accessed
                                            </Label>
                                            <Input
                                                id={`course-accessed-${index}`}
                                                type="date"
                                                value={
                                                    typeof course.lastAccessed === "string"
                                                        ? course.lastAccessed.substring(0, 10)
                                                        : course.lastAccessed
                                                            ? new Date(course.lastAccessed).toISOString().substring(0, 10)
                                                            : new Date().toISOString().substring(0, 10)
                                                }
                                                onChange={(e) => handleCourseChange(index, "lastAccessed", e.target.value)}
                                                className="border-gray-200 dark:border-gray-700"
                                            />
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        <Separator className="bg-gray-100 dark:bg-gray-800" />
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Learning Paths</h3>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={handleAddLearningPath}
                                    className="border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Learning Path
                                </Button>
                            </div>
                            {
                                learningPaths.map((path, index) => (
                                    <div
                                        key={path.id}
                                        className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="flex justify-between items-start">
                                            <Label htmlFor={`path-${index}`} className="text-gray-700 dark:text-gray-300">
                                                Learning Path Name
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveLearningPath(index)}
                                                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            >
                                                <X className="h-4 w-4" />
                                                <span className="sr-only">Remove</span>
                                            </Button>
                                        </div>
                                        <Input
                                            id={`path-${index}`}
                                            value={path.name}
                                            onChange={(e) => handleLearningPathChange(index, "name", e.target.value)}
                                            placeholder="e.g. Full-Stack Web Development"
                                            className="border-gray-200 dark:border-gray-700"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`path-completed-${index}`} className="text-gray-700 dark:text-gray-300">
                                                    Completed Courses
                                                </Label>
                                                <Input
                                                    id={`path-completed-${index}`}
                                                    type="number"
                                                    min={0}
                                                    max={path.totalCourses}
                                                    value={path.completedCourses}
                                                    onChange={(e) =>
                                                        handleLearningPathChange(index, "completedCourses", Number.parseInt(e.target.value))
                                                    }
                                                    className="border-gray-200 dark:border-gray-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`path-total-${index}`} className="text-gray-700 dark:text-gray-300">
                                                    Total Courses
                                                </Label>
                                                <Input
                                                    id={`path-total-${index}`}
                                                    type="number"
                                                    min={1}
                                                    value={path.totalCourses}
                                                    onChange={(e) =>
                                                        handleLearningPathChange(index, "totalCourses", Number.parseInt(e.target.value))
                                                    }
                                                    className="border-gray-200 dark:border-gray-700"
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{path.progress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end space-x-4">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="px-6 border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="px-8 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    )
}