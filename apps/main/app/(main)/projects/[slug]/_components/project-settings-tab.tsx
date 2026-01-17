'use client'

import { useState } from 'react'
import {
    Users, UserPlus, Mail, Shield, Clock,
    Crown, Settings, Eye, EyeOff, Trash2, MoreVertical, XCircle
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from '@repo/ui/components/ui/tabs'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '@repo/ui/components/ui/dropdown-menu'
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar'
import { Switch } from '@repo/ui/components/ui/switch'
import toast from '@repo/ui/components/ui/sonner'

// ============================================================================
// Types
// ============================================================================

export interface TeamMember {
    id: string
    userId: string
    role: 'ADMIN' | 'MEMBER'
    joinedAt: Date
    user: {
        id: string
        name: string | null
        username: string | null
        email: string
        image: string | null
    }
}

export interface ProjectInvitation {
    id: string
    invitedEmail: string | null
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
    createdAt: Date
    invitedUser?: {
        id: string
        name: string | null
        username: string | null
        image: string | null
    } | null
}

interface ProjectSettingsTabProps {
    projectId: string
    projectTitle: string
    isCreator: boolean
    visibility: 'PRIVATE' | 'PUBLIC'
    members: TeamMember[]
    pendingInvitations: ProjectInvitation[]
    isTeamProject: boolean
    onInviteMember?: (email: string) => Promise<void>
    onRemoveMember?: (memberId: string) => Promise<void>
    onUpdateMemberRole?: (memberId: string, role: 'ADMIN' | 'MEMBER') => Promise<void>
    onCancelInvitation?: (invitationId: string) => Promise<void>
    onUpdateVisibility?: (visibility: 'PRIVATE' | 'PUBLIC') => Promise<void>
    onToggleTeamMode?: (enabled: boolean) => Promise<void>
}

// ============================================================================
// Project Settings Tab Component (Simplified - Invitations Only)
// ============================================================================

export function ProjectSettingsTab({
    isCreator,
    visibility,
    members,
    pendingInvitations,
    isTeamProject,
    onInviteMember,
    onRemoveMember,
    onUpdateMemberRole,
    onCancelInvitation,
    onUpdateVisibility,
    onToggleTeamMode
}: ProjectSettingsTabProps) {
    const [inviteEmail, setInviteEmail] = useState('')
    const [isInviting, setIsInviting] = useState(false)
    const [settingsTab, setSettingsTab] = useState('team')

    const handleInvite = async () => {
        if (!inviteEmail.trim() || !onInviteMember) return
        setIsInviting(true)
        try {
            await onInviteMember(inviteEmail.trim())
            setInviteEmail('')
            toast.success('Invitation sent successfully')
        } catch {
            toast.error('Failed to send invitation')
        } finally {
            setIsInviting(false)
        }
    }

    if (!isCreator) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Shield className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-4" />
                <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                    Creator Access Required
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-500 max-w-md">
                    Only the project creator can access settings. You can suggest features or report issues in the Community tab.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Settings Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        Project Settings
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Manage team members and project visibility
                    </p>
                </div>
            </div>

            <Tabs value={settingsTab} onValueChange={setSettingsTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="team" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Team
                        {members.length > 1 && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                                {members.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        General
                    </TabsTrigger>
                </TabsList>

                {/* Team Tab */}
                <TabsContent value="team" className="space-y-6 mt-6">
                    {/* Team Mode Toggle */}
                    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                                            Team Collaboration Mode
                                        </h3>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Enable to invite others to collaborate on this project
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={isTeamProject}
                                    onCheckedChange={onToggleTeamMode}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {isTeamProject && (
                        <>
                            {/* Invite Members */}
                            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <UserPlus className="w-5 h-5" />
                                        Invite Team Members
                                    </CardTitle>
                                    <CardDescription>
                                        Send invitations by email address
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Label htmlFor="email" className="sr-only">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="teammate@example.com"
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                                            />
                                        </div>
                                        <Button
                                            onClick={handleInvite}
                                            disabled={!inviteEmail.trim() || isInviting}
                                        >
                                            <Mail className="w-4 h-4 mr-1" />
                                            {isInviting ? 'Sending...' : 'Invite'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pending Invitations */}
                            {pendingInvitations.length > 0 && (
                                <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-yellow-500" />
                                            Pending Invitations
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {pendingInvitations.map((invitation) => (
                                                <div
                                                    key={invitation.id}
                                                    className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarImage src={invitation.invitedUser?.image || ''} />
                                                            <AvatarFallback>
                                                                {(invitation.invitedEmail ?? '?').charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                                                {invitation.invitedUser?.name || invitation.invitedEmail}
                                                            </p>
                                                            <p className="text-xs text-neutral-500">
                                                                Sent {new Date(invitation.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onCancelInvitation?.(invitation.id)}
                                                    >
                                                        <XCircle className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Team Members */}
                            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Team Members ({members.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {members.map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-10 h-10">
                                                        <AvatarImage src={member.user.image || ''} />
                                                        <AvatarFallback>
                                                            {(member.user.name ?? member.user.email).charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                                                {member.user.name || member.user.username || member.user.email}
                                                            </p>
                                                            {member.role === 'ADMIN' && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    <Crown className="w-3 h-3 mr-1" />
                                                                    Admin
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-neutral-500">
                                                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                {member.role !== 'ADMIN' && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => onUpdateMemberRole?.(member.id, 'ADMIN')}
                                                            >
                                                                <Crown className="w-4 h-4 mr-2" />
                                                                Promote to Admin
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() => onRemoveMember?.(member.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Remove
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </TabsContent>

                {/* General Settings Tab */}
                <TabsContent value="general" className="space-y-6 mt-6">
                    {/* Visibility */}
                    <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                {visibility === 'PUBLIC' ? (
                                    <Eye className="w-5 h-5 text-green-500" />
                                ) : (
                                    <EyeOff className="w-5 h-5 text-amber-500" />
                                )}
                                Project Visibility
                            </CardTitle>
                            <CardDescription>
                                Control who can see and access this project
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                        {visibility === 'PUBLIC' ? 'Public' : 'Private'}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        {visibility === 'PUBLIC'
                                            ? 'Anyone can view this project'
                                            : 'Only you and team members can view'}
                                    </p>
                                </div>
                                <Switch
                                    checked={visibility === 'PUBLIC'}
                                    onCheckedChange={(checked) =>
                                        onUpdateVisibility?.(checked ? 'PUBLIC' : 'PRIVATE')
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
