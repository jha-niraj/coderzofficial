"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle
} from "@repo/ui/components/ui/sheet"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Separator } from "@repo/ui/components/ui/separator"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select"
import { X, Plus, Loader, CalendarIcon } from "lucide-react"
import { useUserStore } from "@/app/store/useUserStore"
import { UserSkill, UserCertification } from "@/types/user"
import { toast } from "sonner"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover, PopoverContent, PopoverTrigger
} from "@repo/ui/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@repo/ui/lib/utils"

interface SkillsAndCertificationsSheetProps {
    open: boolean
    onClose: () => void
    onSuccess?: () => void
}

export const SkillsAndCertificationsSheet = ({
    open,
    onClose,
    onSuccess
}: SkillsAndCertificationsSheetProps) => {
    const { user, updateUserSkills, updateUserCertifications } = useUserStore()
    const [skills, setSkills] = useState<UserSkill[]>([])
    const [certifications, setCertifications] = useState<UserCertification[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [datePickerOpen, setDatePickerOpen] = useState<number | null>(null)

    useEffect(() => {
        if (user) {
            setSkills(user.skills || [])
            setCertifications(user.certifications || [])
        }
    }, [user])

    const handleAddSkill = () => {
        setSkills([...skills, { name: "", level: 1 }])
    }

    const handleRemoveSkill = (index: number) => {
        setSkills(skills.filter((_, i) => i !== index))
    }

    const handleSkillChange = (index: number, field: "name" | "level", value: any) => {
        const updatedSkills = [...skills]
        updatedSkills[index] = { ...updatedSkills[index], [field]: value }
        setSkills(updatedSkills)
    }

    const handleAddCertification = () => {
        setCertifications([
            ...certifications,
            { name: "", issuer: "", issuedDate: new Date(), link: "" },
        ])
    }

    const handleRemoveCertification = (index: number) => {
        setCertifications(certifications.filter((_, i) => i !== index))
    }

    const handleCertificationChange = (index: number, field: "name" | "issuer" | "issueDate" | "link", value: any) => {
        const updatedCertifications = [...certifications]

        if (field === "issueDate") {
            updatedCertifications[index] = {
                ...updatedCertifications[index],
                issuedDate: new Date(value)
            }
        } else {
            updatedCertifications[index] = {
                ...updatedCertifications[index],
                [field]: value
            }
        }

        setCertifications(updatedCertifications)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const preparedSkills = skills.map(skill => {
                if (!skill.id || skill.id.startsWith('temp-')) {
                    const { id, ...skillWithoutId } = skill;
                    return skillWithoutId;
                }
                return skill;
            });

            const preparedCertifications = certifications.map(cert => {
                if (!cert.id || cert.id.startsWith('temp-')) {
                    const { id, ...certWithoutId } = cert;
                    return certWithoutId;
                }
                return cert;
            });

            await updateUserSkills(preparedSkills)
            await updateUserCertifications(preparedCertifications)

            toast.success("Skills and certifications updated successfully")
            onSuccess?.()
            onClose()
        } catch (error) {
            console.error("Error updating skills and certifications:", error)
            toast.error("Failed to update skills and certifications")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-md md:max-w-xl p-0 border-l border-gray-100 dark:border-gray-800 overflow-y-auto"
            >
                <SheetHeader className="pb-4 border-b border-gray-100 dark:border-gray-800 p-6">
                    <SheetTitle className="text-xl font-bold text-gray-900 dark:text-gray-50">Skills & Certifications</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-8 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Skills</h3>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={handleAddSkill}
                                    className="border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Skill
                                </Button>
                            </div>
                            {
                                skills.map((skill, index) => (
                                    <div
                                        key={skill.id || `new-skill-${index}`}
                                        className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="flex justify-between items-start">
                                            <Label htmlFor={`skill-${index}`} className="text-gray-700 dark:text-gray-300">
                                                Skill Name
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveSkill(index)}
                                                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            >
                                                <X className="h-4 w-4" />
                                                <span className="sr-only">Remove</span>
                                            </Button>
                                        </div>
                                        <Input
                                            id={`skill-${index}`}
                                            value={skill.name}
                                            onChange={(e) => handleSkillChange(index, "name", e.target.value)}
                                            placeholder="e.g. JavaScript, React, UI Design"
                                            className="border-gray-200 dark:border-gray-700"
                                        />
                                        <div className="space-y-2">
                                            <Label htmlFor={`skill-level-${index}`} className="text-gray-700 dark:text-gray-300">
                                                Proficiency Level
                                            </Label>
                                            <Select
                                                value={skill.level.toString()}
                                                onValueChange={(value) => handleSkillChange(index, "level", Number.parseInt(value))}
                                            >
                                                <SelectTrigger id={`skill-level-${index}`} className="border-gray-200 dark:border-gray-700">
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">Beginner</SelectItem>
                                                    <SelectItem value="2">Intermediate</SelectItem>
                                                    <SelectItem value="3">Advanced</SelectItem>
                                                    <SelectItem value="4">Expert</SelectItem>
                                                    <SelectItem value="5">Master</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        <Separator className="bg-gray-100 dark:bg-gray-800" />
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Certifications</h3>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={handleAddCertification}
                                    className="border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Certification
                                </Button>
                            </div>
                            {
                                certifications.map((cert, index) => (
                                    <div
                                        key={cert.id || `new-cert-${index}`}
                                        className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="flex justify-between items-start">
                                            <Label htmlFor={`cert-${index}`} className="text-gray-700 dark:text-gray-300">
                                                Certification Name
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveCertification(index)}
                                                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            >
                                                <X className="h-4 w-4" />
                                                <span className="sr-only">Remove</span>
                                            </Button>
                                        </div>
                                        <Input
                                            id={`cert-${index}`}
                                            value={cert.name}
                                            onChange={(e) => handleCertificationChange(index, "name", e.target.value)}
                                            placeholder="e.g. AWS Solutions Architect"
                                            className="border-gray-200 dark:border-gray-700"
                                        />
                                        <div className="space-y-2">
                                            <Label htmlFor={`cert-issuer-${index}`} className="text-gray-700 dark:text-gray-300">
                                                Issuing Organization
                                            </Label>
                                            <Input
                                                id={`cert-issuer-${index}`}
                                                value={cert.issuer}
                                                onChange={(e) => handleCertificationChange(index, "issuer", e.target.value)}
                                                placeholder="e.g. Amazon Web Services"
                                                className="border-gray-200 dark:border-gray-700"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`cert-date-${index}`} className="text-gray-700 dark:text-gray-300">
                                                Issue Date
                                            </Label>
                                            <Popover open={datePickerOpen === index} onOpenChange={(isOpen) => setDatePickerOpen(isOpen ? index : null)}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal border-gray-200 dark:border-gray-700",
                                                            !cert.issuedDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {cert.issuedDate ? format(new Date(cert.issuedDate), "PPP") : "Pick a date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={cert.issuedDate ? new Date(cert.issuedDate) : undefined}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                handleCertificationChange(index, "issueDate", date.toISOString())
                                                            }
                                                        }}
                                                        onDayClick={() => setDatePickerOpen(null)}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`cert-link-${index}`} className="text-gray-700 dark:text-gray-300">
                                                Certification Link
                                            </Label>
                                            <Input
                                                id={`cert-link-${index}`}
                                                value={cert.link}
                                                onChange={(e) => handleCertificationChange(index, "link", e.target.value)}
                                                placeholder="https://www.coursera.org/metafrontenddeveloper"
                                                className="border-gray-200 dark:border-gray-700"
                                            />
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
                                disabled={isSubmitting}
                                className="px-8 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
                            >
                                {
                                    isSubmitting ? (
                                        <div className="flex gap-2 items-center">
                                            <Loader className="h-4 w-4 animate-spin" />
                                            <span>Saving...</span>
                                        </div>
                                    ) : (
                                        "Save Changes"
                                    )
                                }
                            </Button>
                        </div>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    )
}