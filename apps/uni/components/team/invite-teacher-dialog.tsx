"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    Mail, User, Briefcase, Building, Shield, Loader2, Copy, Check,
    AlertCircle, UserPlus
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@repo/ui/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/components/ui/select"
import { inviteTeacherWithCredentials } from "@/actions/team/team.action"
import type { UniversityMemberRole, UniversityMemberJobTitle, Department } from "@/types"

interface InviteTeacherDialogProps {
    departments: Department[]
    onSuccess?: () => void
}

const ROLE_OPTIONS: { value: UniversityMemberRole; label: string }[] = [
    { value: "FACULTY", label: "Faculty" },
    { value: "DEPARTMENT_HEAD", label: "Department Head" },
    { value: "TEACHING_ASSISTANT", label: "Teaching Assistant" },
    { value: "PLACEMENT_OFFICER", label: "Placement Officer" },
    { value: "FINANCE_OFFICER", label: "Finance Officer" },
]

const JOB_TITLE_OPTIONS: { value: UniversityMemberJobTitle; label: string }[] = [
    { value: "PROFESSOR", label: "Professor" },
    { value: "ASSOCIATE_PROFESSOR", label: "Associate Professor" },
    { value: "ASSISTANT_PROFESSOR", label: "Assistant Professor" },
    { value: "LECTURER", label: "Lecturer" },
    { value: "HOD", label: "Head of Department" },
    { value: "DEAN", label: "Dean" },
    { value: "TEACHING_ASSISTANT", label: "Teaching Assistant" },
    { value: "LAB_INSTRUCTOR", label: "Lab Instructor" },
    { value: "PLACEMENT_COORDINATOR", label: "Placement Coordinator" },
    { value: "PLACEMENT_OFFICER", label: "Placement Officer" },
    { value: "OTHER", label: "Other" },
]

export function InviteTeacherDialog({ departments, onSuccess }: InviteTeacherDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [tempPassword, setTempPassword] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const [formData, setFormData] = useState({
        email: "",
        name: "",
        role: "FACULTY" as UniversityMemberRole,
        jobTitle: "LECTURER" as UniversityMemberJobTitle,
        departmentId: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const result = await inviteTeacherWithCredentials({
                email: formData.email,
                name: formData.name,
                role: formData.role,
                jobTitle: formData.jobTitle,
                departmentId: formData.departmentId || undefined,
            })

            if (result.success) {
                setSuccess(true)
                setTempPassword(result.temporaryPassword || null)
                onSuccess?.()
            } else {
                setError(result.error || "Failed to invite teacher")
            }
        } catch (err) {
            console.error("Invite error:", err)
            setError("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    const handleCopyPassword = async () => {
        if (tempPassword) {
            await navigator.clipboard.writeText(tempPassword)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleClose = () => {
        setOpen(false)
        // Reset form after close animation
        setTimeout(() => {
            setFormData({
                email: "",
                name: "",
                role: "FACULTY",
                jobTitle: "LECTURER",
                departmentId: "",
            })
            setError(null)
            setSuccess(false)
            setTempPassword(null)
        }, 300)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Faculty
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            <UserPlus className="w-4 h-4 text-violet-600" />
                        </div>
                        Invite Faculty Member
                    </DialogTitle>
                    <DialogDescription>
                        Create an account with temporary credentials. They&apos;ll receive an email to sign in.
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-6"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2">
                                Invitation Sent!
                            </h3>
                            <p className="text-sm text-neutral-500 mb-4">
                                An email with login credentials has been sent to <span className="font-medium text-neutral-700 dark:text-neutral-300">{formData.email}</span>
                            </p>

                            {tempPassword && (
                                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                                        Temporary password (in case email fails):
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 px-3 py-2 bg-white dark:bg-neutral-900 rounded-lg font-mono text-sm border border-amber-200 dark:border-amber-800">
                                            {tempPassword}
                                        </code>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handleCopyPassword}
                                            className="shrink-0"
                                        >
                                            {copied ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleClose}
                                className="mt-6 w-full rounded-xl"
                            >
                                Done
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="teacher@university.edu"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="rounded-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Dr. John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="rounded-lg"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role" className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Role
                                </Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({ ...formData, role: value as UniversityMemberRole })}
                                >
                                    <SelectTrigger className="rounded-lg">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLE_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jobTitle" className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    Job Title
                                </Label>
                                <Select
                                    value={formData.jobTitle}
                                    onValueChange={(value) => setFormData({ ...formData, jobTitle: value as UniversityMemberJobTitle })}
                                >
                                    <SelectTrigger className="rounded-lg">
                                        <SelectValue placeholder="Select title" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {JOB_TITLE_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {departments.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="department" className="flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    Department (Optional)
                                </Label>
                                <Select
                                    value={formData.departmentId}
                                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                                >
                                    <SelectTrigger className="rounded-lg">
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">No Department</SelectItem>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.name} {dept.code && `(${dept.code})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Send Credentials
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
