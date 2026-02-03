"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    UserPlus, Users, Shield, Mail, MoreVertical, Briefcase, 
    CheckCircle, Clock, X, RefreshCw, Trash2, UserMinus, Crown
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Badge } from "@repo/ui/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@repo/ui/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/components/ui/select"
import { useSession } from "@repo/auth/client"
import { 
    inviteTeamMember, cancelInvitation, resendInvitation, 
    updateMemberRole, removeTeamMember 
} from "@/actions/team"
import { toast } from "sonner"

interface TeamMember {
    id: string
    userId: string
    role: string
    status: string
    user: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
    createdAt: Date
    jobsPosted?: number
}

interface PendingInvite {
    id: string
    email: string
    role: string
    status: string
    createdAt: Date
    expiresAt: Date
    invitedBy: {
        name: string | null
    }
}

interface TeamStats {
    totalMembers: number
    pendingInvites: number
    jobsPosted: number
    candidatesProcessed: number
}

interface TeamContentProps {
    initialMembers: TeamMember[]
    initialInvites: PendingInvite[]
    stats: TeamStats | null
}

export function TeamContent({ initialMembers, initialInvites, stats }: TeamContentProps) {
    const { data: session } = useSession()
    const [members, setMembers] = useState(initialMembers)
    const [invites, setInvites] = useState(initialInvites)
    const [isPending, startTransition] = useTransition()
    
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
    const [inviteEmail, setInviteEmail] = useState("")
    const [inviteRole, setInviteRole] = useState<"HEAD" | "RECRUITER">("RECRUITER")

    const currentUserMember = members.find(m => m.userId === session?.user?.id)
    const isHead = currentUserMember?.role === "HEAD"

    const handleInvite = async () => {
        if (!inviteEmail.trim()) {
            toast.error("Please enter an email address")
            return
        }

        startTransition(async () => {
            const result = await inviteTeamMember(inviteEmail, inviteRole)
            if (result.success) {
                toast.success("Invitation sent successfully")
                setInvites(prev => [result.data as PendingInvite, ...prev])
                setInviteDialogOpen(false)
                setInviteEmail("")
                setInviteRole("RECRUITER")
            } else {
                toast.error(result.error || "Failed to send invitation")
            }
        })
    }

    const handleCancelInvite = async (inviteId: string) => {
        startTransition(async () => {
            const result = await cancelInvitation(inviteId)
            if (result.success) {
                setInvites(prev => prev.filter(i => i.id !== inviteId))
                toast.success("Invitation cancelled")
            } else {
                toast.error(result.error || "Failed to cancel invitation")
            }
        })
    }

    const handleResendInvite = async (inviteId: string) => {
        startTransition(async () => {
            const result = await resendInvitation(inviteId)
            if (result.success) {
                toast.success("Invitation resent")
            } else {
                toast.error(result.error || "Failed to resend invitation")
            }
        })
    }

    const handleUpdateRole = async (memberId: string, newRole: "HEAD" | "RECRUITER") => {
        startTransition(async () => {
            const result = await updateMemberRole(memberId, newRole)
            if (result.success) {
                setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m))
                toast.success("Role updated successfully")
            } else {
                toast.error(result.error || "Failed to update role")
            }
        })
    }

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm("Are you sure you want to remove this team member?")) return
        
        startTransition(async () => {
            const result = await removeTeamMember(memberId)
            if (result.success) {
                setMembers(prev => prev.filter(m => m.id !== memberId))
                toast.success("Team member removed")
            } else {
                toast.error(result.error || "Failed to remove member")
            }
        })
    }

    const getRoleBadge = (role: string) => {
        if (role === "HEAD") {
            return (
                <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 gap-1">
                    <Crown className="w-3 h-3" />
                    Head
                </Badge>
            )
        }
        return (
            <Badge variant="outline">Recruiter</Badge>
        )
    }

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                        Team Members
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Manage your hiring team and permissions
                    </p>
                </div>
                {isHead && (
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Invite Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Invite Team Member</DialogTitle>
                                <DialogDescription>
                                    Send an invitation to join your hiring team
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <Input
                                        type="email"
                                        placeholder="colleague@company.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Role</label>
                                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="RECRUITER">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    <span>Recruiter</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="HEAD">
                                                <div className="flex items-center gap-2">
                                                    <Crown className="w-4 h-4" />
                                                    <span>Head (Admin)</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-neutral-500">
                                        {inviteRole === "HEAD" 
                                            ? "Heads can manage team, settings, and billing" 
                                            : "Recruiters can post jobs and manage candidates"
                                        }
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setInviteDialogOpen(false)} className="rounded-xl">
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleInvite} 
                                    disabled={isPending || !inviteEmail.trim()}
                                    className="rounded-xl"
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Send Invitation
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-neutral-400" />
                            <span className="text-xs text-neutral-500">Team Size</span>
                        </div>
                        <span className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalMembers}</span>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs text-neutral-500">Pending</span>
                        </div>
                        <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingInvites}</span>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-neutral-500">Jobs Posted</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.jobsPosted}</span>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-neutral-500">Processed</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.candidatesProcessed}</span>
                    </motion.div>
                </div>
            )}

            {/* Pending Invites */}
            {invites.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-500" />
                        Pending Invitations
                    </h2>
                    <div className="space-y-3">
                        <AnimatePresence>
                            {invites.map((invite, index) => (
                                <motion.div
                                    key={invite.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-xl p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                                <Mail className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900 dark:text-white">{invite.email}</p>
                                                <p className="text-xs text-neutral-500">
                                                    Invited as {invite.role} • Expires {new Date(invite.expiresAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => handleResendInvite(invite.id)}
                                                disabled={isPending}
                                                className="text-yellow-600 hover:text-yellow-700"
                                            >
                                                <RefreshCw className="w-4 h-4 mr-1" />
                                                Resend
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => handleCancelInvite(invite.id)}
                                                disabled={isPending}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Team Members */}
            <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-neutral-400" />
                    Team Members ({members.length})
                </h2>
                <div className="space-y-4">
                    <AnimatePresence>
                        {members.map((member, index) => {
                            const isCurrentUser = member.userId === session?.user?.id
                            
                            return (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                                                {member.user.image ? (
                                                    <img src={member.user.image} alt={member.user.name || ""} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-lg font-bold text-neutral-600 dark:text-neutral-400">
                                                        {member.user.name?.charAt(0) || member.user.email.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                                    {member.user.name || member.user.email}
                                                    {isCurrentUser && (
                                                        <Badge className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs">
                                                            You
                                                        </Badge>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-neutral-500">{member.user.email}</p>
                                                {member.jobsPosted !== undefined && member.jobsPosted > 0 && (
                                                    <p className="text-xs text-neutral-400 mt-1">
                                                        {member.jobsPosted} jobs posted
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {getRoleBadge(member.role)}
                                            
                                            {isHead && !isCurrentUser && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {member.role === "RECRUITER" && (
                                                            <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "HEAD")}>
                                                                <Crown className="w-4 h-4 mr-2" />
                                                                Promote to Head
                                                            </DropdownMenuItem>
                                                        )}
                                                        {member.role === "HEAD" && (
                                                            <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "RECRUITER")}>
                                                                <Users className="w-4 h-4 mr-2" />
                                                                Change to Recruiter
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            onClick={() => handleRemoveMember(member.id)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <UserMinus className="w-4 h-4 mr-2" />
                                                            Remove from Team
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Empty State */}
            {members.length === 0 && invites.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl"
                >
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-neutral-400" />
                    </div>
                    <h3 className="font-bold text-xl text-neutral-900 dark:text-white mb-2">
                        Build Your Team
                    </h3>
                    <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                        Invite colleagues to collaborate on hiring and manage candidates together.
                    </p>
                    {isHead && (
                        <Button 
                            onClick={() => setInviteDialogOpen(true)}
                            className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            Send Your First Invite
                        </Button>
                    )}
                </motion.div>
            )}
        </div>
    )
}
