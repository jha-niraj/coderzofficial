"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Users, Shield, Search, UserPlus, MoreVertical, Crown,
    Loader2, Check, X, Mail, Building, Edit2, UserX,
    UserCheck, AlertCircle, GraduationCap
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Textarea } from "@repo/ui/components/ui/textarea"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select"
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from "@repo/ui/components/ui/sheet"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@repo/ui/components/ui/dropdown-menu"
import { useSession } from "@repo/auth/client"
import {
    getTeamMembers, getDepartments, updateTeamMember, inviteTeamMember,
    deactivateTeamMember, reactivateTeamMember, revokeInvitation, getPendingInvitations
} from "@/actions/team/team.action"
import type {
    TeamMember, Department, UniversityMemberRole, UniversityMemberJobTitle,
    UniversityPermission, InviteTeamMemberPayload,
} from "@/types"

// Job title display mapping
const JOB_TITLE_LABELS: Record<UniversityMemberJobTitle, string> = {
    CHANCELLOR: "Chancellor",
    PRINCIPAL: "Principal",
    REGISTRAR: "Registrar",
    DEAN: "Dean",
    HOD: "Head of Department",
    PROFESSOR: "Professor",
    ASSOCIATE_PROFESSOR: "Associate Professor",
    ASSISTANT_PROFESSOR: "Assistant Professor",
    LECTURER: "Lecturer",
    PLACEMENT_COORDINATOR: "Placement Coordinator",
    PLACEMENT_OFFICER: "Placement Officer",
    FINANCE_MANAGER: "Finance Manager",
    ACCOUNTS_OFFICER: "Accounts Officer",
    TEACHING_ASSISTANT: "Teaching Assistant",
    LAB_INSTRUCTOR: "Lab Instructor",
    OTHER: "Other",
}

// Role display mapping
const ROLE_LABELS: Record<UniversityMemberRole, string> = {
    HEAD: "University Admin",
    DEPARTMENT_HEAD: "Department Head",
    PLACEMENT_OFFICER: "Placement Officer",
    FINANCE_OFFICER: "Finance Officer",
    FACULTY: "Faculty",
    TEACHING_ASSISTANT: "Teaching Assistant",
}

const ROLE_COLORS: Record<UniversityMemberRole, string> = {
    HEAD: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    DEPARTMENT_HEAD: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    PLACEMENT_OFFICER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    FINANCE_OFFICER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    FACULTY: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    TEACHING_ASSISTANT: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
}

// All available permissions
const ALL_PERMISSIONS: { key: UniversityPermission; label: string; description: string; category: string }[] = [
    // Class & Teaching
    { key: "view_classes", label: "View Classes", description: "View all university classes", category: "Classes" },
    { key: "create_classes", label: "Create Classes", description: "Create new classes", category: "Classes" },
    { key: "edit_classes", label: "Edit Classes", description: "Modify class details", category: "Classes" },
    { key: "delete_classes", label: "Delete Classes", description: "Remove classes", category: "Classes" },
    // Assignments
    { key: "create_assignments", label: "Create Assignments", description: "Create new assignments", category: "Assignments" },
    { key: "edit_assignments", label: "Edit Assignments", description: "Modify assignments", category: "Assignments" },
    { key: "delete_assignments", label: "Delete Assignments", description: "Remove assignments", category: "Assignments" },
    { key: "grade_submissions", label: "Grade Submissions", description: "Grade student work", category: "Assignments" },
    // Students
    { key: "view_students", label: "View Students", description: "Access student info", category: "Students" },
    { key: "verify_students", label: "Verify Students", description: "Verify student accounts", category: "Students" },
    { key: "manage_student_credits", label: "Manage Credits", description: "Allocate credits to students", category: "Students" },
    // Admin
    { key: "manage_departments", label: "Manage Departments", description: "Create and edit departments", category: "Admin" },
    { key: "manage_members", label: "Manage Members", description: "Update team roles", category: "Admin" },
    { key: "invite_members", label: "Invite Members", description: "Invite new faculty", category: "Admin" },
    { key: "manage_university", label: "Manage University", description: "University settings", category: "Admin" },
    { key: "manage_billing", label: "Manage Billing", description: "Handle payments", category: "Admin" },
    { key: "manage_credits", label: "Manage Credits", description: "Credit pool management", category: "Admin" },
    // Placements
    { key: "manage_placements", label: "Manage Placements", description: "Job partnerships", category: "Placements" },
    { key: "view_job_applications", label: "View Applications", description: "Student job applications", category: "Placements" },
    // Analytics
    { key: "view_analytics", label: "View Analytics", description: "Access analytics", category: "Analytics" },
    { key: "view_reports", label: "View Reports", description: "Generate reports", category: "Analytics" },
]

// Default permissions per role
const DEFAULT_ROLE_PERMISSIONS: Record<UniversityMemberRole, UniversityPermission[]> = {
    HEAD: [
        "view_classes", "create_classes", "edit_classes", "delete_classes",
        "create_assignments", "edit_assignments", "delete_assignments", "grade_submissions",
        "view_students", "verify_students", "manage_student_credits",
        "manage_departments", "manage_members", "invite_members", "manage_university", "manage_billing", "manage_credits",
        "manage_placements", "view_job_applications",
        "view_analytics", "view_reports",
    ],
    DEPARTMENT_HEAD: [
        "view_classes", "create_classes", "edit_classes",
        "create_assignments", "edit_assignments", "delete_assignments", "grade_submissions",
        "view_students", "invite_members",
        "view_analytics",
    ],
    PLACEMENT_OFFICER: [
        "view_students", "manage_placements", "view_job_applications", "view_analytics",
    ],
    FINANCE_OFFICER: [
        "manage_billing", "manage_credits", "manage_student_credits", "view_analytics", "view_reports",
    ],
    FACULTY: [
        "view_classes", "create_assignments", "edit_assignments", "grade_submissions", "view_students",
    ],
    TEACHING_ASSISTANT: [
        "view_classes", "grade_submissions", "view_students",
    ],
}

interface Invitation {
    id: string
    email: string
    name: string | null
    role: UniversityMemberRole
    jobTitle: UniversityMemberJobTitle
    status: string
    createdAt: Date
    expiresAt: Date
}

export default function RolesPage() {
    const { data: session } = useSession()

    // Data
    const [members, setMembers] = useState<TeamMember[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [invitations, setInvitations] = useState<Invitation[]>([])
    const [isHead, setIsHead] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // Loading
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Sheets
    const [inviteSheetOpen, setInviteSheetOpen] = useState(false)
    const [editSheetOpen, setEditSheetOpen] = useState(false)
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

    // Forms
    const [inviteForm, setInviteForm] = useState<InviteTeamMemberPayload>({
        email: "",
        name: "",
        role: "FACULTY",
        jobTitle: "LECTURER",
        departmentId: "",
        permissions: DEFAULT_ROLE_PERMISSIONS["FACULTY"],
        message: "",
    })
    const [editPermissions, setEditPermissions] = useState<UniversityPermission[]>([])
    const [editRole, setEditRole] = useState<UniversityMemberRole>("FACULTY")
    const [editJobTitle, setEditJobTitle] = useState<UniversityMemberJobTitle>("LECTURER")
    const [editDepartmentId, setEditDepartmentId] = useState<string>("")

    // Messages
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    // Fetch data
    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                const [membersRes, deptsRes, invitesRes] = await Promise.all([
                    getTeamMembers(),
                    getDepartments(),
                    getPendingInvitations(),
                ])

                if (membersRes.success && membersRes.data) {
                    setMembers(membersRes.data)
                    setIsHead(membersRes.isHead ?? false)
                }

                if (deptsRes.success && deptsRes.data) {
                    setDepartments(deptsRes.data)
                }

                if (invitesRes.success && invitesRes.data) {
                    setInvitations(invitesRes.data as Invitation[])
                }
            } catch (error) {
                console.error("Failed to fetch team data:", error)
            } finally {
                setLoading(false)
            }
        }

        if (session?.user?.id) {
            fetchData()
        }
    }, [session?.user?.id])

    // Filter members
    const filteredMembers = members.filter((member) => {
        const searchLower = searchQuery.toLowerCase()
        return (
            member.email.toLowerCase().includes(searchLower) ||
            (member.displayName?.toLowerCase().includes(searchLower)) ||
            ROLE_LABELS[member.role].toLowerCase().includes(searchLower)
        )
    })

    // Handle role change in invite form
    const handleInviteRoleChange = (role: UniversityMemberRole) => {
        setInviteForm(prev => ({
            ...prev,
            role,
            permissions: DEFAULT_ROLE_PERMISSIONS[role],
        }))
    }

    // Handle invite submit
    const handleInviteSubmit = async () => {
        if (!inviteForm.email) {
            setMessage({ type: "error", text: "Email is required" })
            return
        }

        setSaving(true)
        setMessage(null)

        try {
            const result = await inviteTeamMember(inviteForm)

            if (result.success) {
                setMessage({ type: "success", text: "Invitation sent successfully" })
                setInviteSheetOpen(false)
                setInviteForm({
                    email: "",
                    name: "",
                    role: "FACULTY",
                    jobTitle: "LECTURER",
                    departmentId: "",
                    permissions: DEFAULT_ROLE_PERMISSIONS["FACULTY"],
                    message: "",
                })
                // Refresh invitations
                const invitesRes = await getPendingInvitations()
                if (invitesRes.success && invitesRes.data) {
                    setInvitations(invitesRes.data as Invitation[])
                }
            } else {
                setMessage({ type: "error", text: result.error || "Failed to send invitation" })
            }
        } catch (error) {
            console.error("Invite error:", error)
            setMessage({ type: "error", text: "An unexpected error occurred" })
        } finally {
            setSaving(false)
        }
    }

    // Open edit sheet
    const openEditSheet = (member: TeamMember) => {
        setSelectedMember(member)
        setEditRole(member.role)
        setEditJobTitle(member.jobTitle)
        setEditDepartmentId(member.departmentId || "")
        setEditPermissions([...member.permissions])
        setEditSheetOpen(true)
    }

    // Handle edit submit
    const handleEditSubmit = async () => {
        if (!selectedMember) return

        setSaving(true)
        setMessage(null)

        try {
            const result = await updateTeamMember(selectedMember.id, {
                role: editRole,
                jobTitle: editJobTitle,
                departmentId: editDepartmentId || undefined,
                permissions: editPermissions,
            })

            if (result.success) {
                setMessage({ type: "success", text: "Member updated successfully" })
                setEditSheetOpen(false)
                // Refresh members
                const membersRes = await getTeamMembers()
                if (membersRes.success && membersRes.data) {
                    setMembers(membersRes.data)
                }
            } else {
                setMessage({ type: "error", text: result.error || "Failed to update member" })
            }
        } catch (error) {
            console.error("Update error:", error)
            setMessage({ type: "error", text: "An unexpected error occurred" })
        } finally {
            setSaving(false)
        }
    }

    // Handle deactivate
    const handleDeactivate = async (memberId: string) => {
        setSaving(true)
        try {
            const result = await deactivateTeamMember(memberId)
            if (result.success) {
                const membersRes = await getTeamMembers()
                if (membersRes.success && membersRes.data) {
                    setMembers(membersRes.data)
                }
                setMessage({ type: "success", text: "Member deactivated" })
            } else {
                setMessage({ type: "error", text: result.error || "Failed to deactivate" })
            }
        } catch (error) {
            console.error("Deactivate error:", error)
        } finally {
            setSaving(false)
        }
    }

    // Handle reactivate
    const handleReactivate = async (memberId: string) => {
        setSaving(true)
        try {
            const result = await reactivateTeamMember(memberId)
            if (result.success) {
                const membersRes = await getTeamMembers()
                if (membersRes.success && membersRes.data) {
                    setMembers(membersRes.data)
                }
                setMessage({ type: "success", text: "Member reactivated" })
            } else {
                setMessage({ type: "error", text: result.error || "Failed to reactivate" })
            }
        } catch (error) {
            console.error("Reactivate error:", error)
        } finally {
            setSaving(false)
        }
    }

    // Handle revoke invitation
    const handleRevokeInvitation = async (inviteId: string) => {
        setSaving(true)
        try {
            const result = await revokeInvitation(inviteId)
            if (result.success) {
                setInvitations(prev => prev.filter(i => i.id !== inviteId))
                setMessage({ type: "success", text: "Invitation revoked" })
            } else {
                setMessage({ type: "error", text: result.error || "Failed to revoke invitation" })
            }
        } catch (error) {
            console.error("Revoke error:", error)
        } finally {
            setSaving(false)
        }
    }

    // Toggle permission
    const togglePermission = (perm: UniversityPermission, list: UniversityPermission[], setList: (p: UniversityPermission[]) => void) => {
        if (list.includes(perm)) {
            setList(list.filter(p => p !== perm))
        } else {
            setList([...list, perm])
        }
    }

    if (loading) {
        return (
            <div className="min-h-full flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                    <p className="text-neutral-500">Loading team members...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <Users className="w-7 h-7 text-violet-500" />
                        Team & Roles
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Manage faculty, staff, and their permissions
                    </p>
                </div>
                {
                    isHead && (
                        <Button
                            onClick={() => setInviteSheetOpen(true)}
                            className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Invite Member
                        </Button>
                    )
                }
            </div>

            {/* Message */}
            <AnimatePresence>
                {
                    message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === "success"
                                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                                }`}
                        >
                            {message.type === "success" ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            {message.text}
                            <button onClick={() => setMessage(null)} className="ml-auto cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )
                }
            </AnimatePresence>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search members..."
                        className="pl-10 rounded-xl"
                    />
                </div>
            </div>

            {/* Pending Invitations */}
            {
                isHead && invitations.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-amber-500" />
                            Pending Invitations
                        </h2>
                        <div className="grid gap-3">
                            {
                                invitations.map((invite) => (
                                    <div
                                        key={invite.id}
                                        className="flex items-center justify-between p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                                    >
                                        <div>
                                            <p className="font-medium text-neutral-900 dark:text-white">{invite.email}</p>
                                            <p className="text-sm text-neutral-500">
                                                {ROLE_LABELS[invite.role]} • Expires {new Date(invite.expiresAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRevokeInvitation(invite.id)}
                                            disabled={saving}
                                            className="rounded-lg text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            Revoke
                                        </Button>
                                    </div>
                                ))
                            }
                        </div>
                    </motion.div>
                )
            }

            {/* Members Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {
                    filteredMembers.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`relative p-5 rounded-2xl border transition-all ${member.isActive
                                ? "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 hover:border-violet-300 dark:hover:border-violet-700"
                                : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 opacity-60"
                                }`}
                        >
                            {/* Role badge */}
                            {
                                member.role === "HEAD" && (
                                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                                        <Crown className="w-4 h-4 text-white" />
                                    </div>
                                )
                            }

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center shrink-0">
                                    <GraduationCap className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-neutral-900 dark:text-white truncate">
                                        {member.displayName || member.email.split("@")[0]}
                                    </p>
                                    <p className="text-sm text-neutral-500 truncate">{member.email}</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[member.role]}`}>
                                            <Shield className="w-3 h-3" />
                                            {ROLE_LABELS[member.role]}
                                        </span>
                                        {
                                            member.department && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                    <Building className="w-3 h-3" />
                                                    {member.department.code || member.department.name}
                                                </span>
                                            )
                                        }
                                        {
                                            !member.isActive && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                                    <UserX className="w-3 h-3" />
                                                    Inactive
                                                </span>
                                            )
                                        }
                                    </div>
                                </div>
                                {
                                    isHead && member.role !== "HEAD" && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-lg cursor-pointer">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => openEditSheet(member)} className="cursor-pointer">
                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                    Edit Role & Permissions
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {
                                                    member.isActive ? (
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeactivate(member.id)}
                                                            className="text-red-600 cursor-pointer"
                                                        >
                                                            <UserX className="w-4 h-4 mr-2" />
                                                            Deactivate
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            onClick={() => handleReactivate(member.id)}
                                                            className="text-green-600 cursor-pointer"
                                                        >
                                                            <UserCheck className="w-4 h-4 mr-2" />
                                                            Reactivate
                                                        </DropdownMenuItem>
                                                    )
                                                }
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )
                                }
                            </div>

                            {/* Permissions preview */}
                            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <p className="text-xs text-neutral-500 mb-2">Permissions</p>
                                <div className="flex flex-wrap gap-1">
                                    {
                                        member.permissions.slice(0, 4).map((perm) => (
                                            <span
                                                key={perm}
                                                className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400"
                                            >
                                                {perm.replace(/_/g, " ")}
                                            </span>
                                        ))
                                    }
                                    {
                                        member.permissions.length > 4 && (
                                            <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-xs text-violet-600 dark:text-violet-400">
                                                +{member.permissions.length - 4} more
                                            </span>
                                        )
                                    }
                                </div>
                            </div>
                        </motion.div>
                    ))
                }
            </div>

            {/* Invite Sheet */}
            <Sheet open={inviteSheetOpen} onOpenChange={setInviteSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-violet-500" />
                            Invite Team Member
                        </SheetTitle>
                        <SheetDescription>
                            Send an invitation to a faculty or staff member
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                        <div>
                            <Label className="text-sm font-medium">Email Address *</Label>
                            <Input
                                value={inviteForm.email}
                                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="faculty@university.edu"
                                className="mt-2 rounded-xl"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Name (Optional)</Label>
                            <Input
                                value={inviteForm.name || ""}
                                onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Dr. John Doe"
                                className="mt-2 rounded-xl"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Role</Label>
                                <Select
                                    value={inviteForm.role}
                                    onValueChange={(v) => handleInviteRoleChange(v as UniversityMemberRole)}
                                >
                                    <SelectTrigger className="mt-2 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            Object.entries(ROLE_LABELS).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Job Title</Label>
                                <Select
                                    value={inviteForm.jobTitle}
                                    onValueChange={(v) => setInviteForm(prev => ({ ...prev, jobTitle: v as UniversityMemberJobTitle }))}
                                >
                                    <SelectTrigger className="mt-2 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            Object.entries(JOB_TITLE_LABELS).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Department (Optional)</Label>
                            <Select
                                value={inviteForm.departmentId || "none"}
                                onValueChange={(v) => setInviteForm(prev => ({ ...prev, departmentId: v === "none" ? "" : v }))}
                            >
                                <SelectTrigger className="mt-2 rounded-xl">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Department</SelectItem>
                                    {
                                        departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.name} {dept.code && `(${dept.code})`}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Welcome Message (Optional)</Label>
                            <Textarea
                                value={inviteForm.message || ""}
                                onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Add a personal message to the invitation..."
                                className="mt-2 rounded-xl resize-none"
                                rows={3}
                            />
                        </div>

                        {/* Permissions */}
                        <div>
                            <Label className="text-sm font-medium mb-3 block">Permissions</Label>
                            <div className="space-y-4 max-h-64 overflow-y-auto p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
                                {
                                    ["Classes", "Assignments", "Students", "Admin", "Placements", "Analytics"].map((category) => (
                                        <div key={category}>
                                            <p className="text-xs font-medium text-neutral-500 uppercase mb-2">{category}</p>
                                            <div className="space-y-2">
                                                {
                                                    ALL_PERMISSIONS.filter(p => p.category === category).map((perm) => (
                                                        <div key={perm.key} className="flex items-center gap-2">
                                                            <Checkbox
                                                                id={`invite-${perm.key}`}
                                                                checked={inviteForm.permissions?.includes(perm.key) || false}
                                                                onCheckedChange={() => {
                                                                    const current = inviteForm.permissions || []
                                                                    if (current.includes(perm.key)) {
                                                                        setInviteForm(prev => ({
                                                                            ...prev,
                                                                            permissions: current.filter(p => p !== perm.key),
                                                                        }))
                                                                    } else {
                                                                        setInviteForm(prev => ({
                                                                            ...prev,
                                                                            permissions: [...current, perm.key],
                                                                        }))
                                                                    }
                                                                }}
                                                            />
                                                            <label htmlFor={`invite-${perm.key}`} className="text-sm cursor-pointer">
                                                                {perm.label}
                                                            </label>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        <Button
                            onClick={handleInviteSubmit}
                            disabled={saving || !inviteForm.email}
                            className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
                        >
                            {
                                saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Send Invitation
                                    </>
                                )
                            }
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Edit Sheet */}
            <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Edit2 className="w-5 h-5 text-violet-500" />
                            Edit Member
                        </SheetTitle>
                        <SheetDescription>
                            Update role and permissions for {selectedMember?.displayName || selectedMember?.email}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Role</Label>
                                <Select value={editRole} onValueChange={(v) => setEditRole(v as UniversityMemberRole)}>
                                    <SelectTrigger className="mt-2 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            Object.entries(ROLE_LABELS).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Job Title</Label>
                                <Select value={editJobTitle} onValueChange={(v) => setEditJobTitle(v as UniversityMemberJobTitle)}>
                                    <SelectTrigger className="mt-2 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            Object.entries(JOB_TITLE_LABELS).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Department</Label>
                            <Select
                                value={editDepartmentId || "none"}
                                onValueChange={(v) => setEditDepartmentId(v === "none" ? "" : v)}
                            >
                                <SelectTrigger className="mt-2 rounded-xl">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Department</SelectItem>
                                    {
                                        departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.name} {dept.code && `(${dept.code})`}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Apply default permissions button */}
                        <div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditPermissions([...DEFAULT_ROLE_PERMISSIONS[editRole]])}
                                className="rounded-lg cursor-pointer"
                            >
                                <Shield className="w-4 h-4 mr-2" />
                                Apply Default Permissions for {ROLE_LABELS[editRole]}
                            </Button>
                        </div>

                        {/* Permissions */}
                        <div>
                            <Label className="text-sm font-medium mb-3 block">Permissions</Label>
                            <div className="space-y-4 max-h-64 overflow-y-auto p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
                                {
                                    ["Classes", "Assignments", "Students", "Admin", "Placements", "Analytics"].map((category) => (
                                        <div key={category}>
                                            <p className="text-xs font-medium text-neutral-500 uppercase mb-2">{category}</p>
                                            <div className="space-y-2">
                                                {
                                                    ALL_PERMISSIONS.filter(p => p.category === category).map((perm) => (
                                                        <div key={perm.key} className="flex items-center gap-2">
                                                            <Checkbox
                                                                id={`edit-${perm.key}`}
                                                                checked={editPermissions.includes(perm.key)}
                                                                onCheckedChange={() => togglePermission(perm.key, editPermissions, setEditPermissions)}
                                                            />
                                                            <label htmlFor={`edit-${perm.key}`} className="text-sm cursor-pointer">
                                                                {perm.label}
                                                            </label>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        <Button
                            onClick={handleEditSubmit}
                            disabled={saving}
                            className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
                        >
                            {
                                saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )
                            }
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
