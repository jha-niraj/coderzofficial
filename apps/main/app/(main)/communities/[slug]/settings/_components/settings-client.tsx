'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft, Upload, Save, Loader2, Users, Mail, Shield, FileText, Settings,
    Globe, Lock, UserPlus, Trash, RefreshCw, Check, X, Plus, AlertTriangle,
    MessageSquare, Calendar, Trophy, Code2, HelpCircle, Briefcase,
    Link as LinkIcon, Twitter, Instagram, Github
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Label } from '@repo/ui/components/ui/label'
import { Badge } from '@repo/ui/components/ui/badge'
import { Switch } from '@repo/ui/components/ui/switch'
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from '@repo/ui/components/ui/tabs'
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@repo/ui/components/ui/card'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
    DialogTitle, DialogTrigger
} from '@repo/ui/components/ui/dialog'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger
} from '@repo/ui/components/ui/alert-dialog'
import { Separator } from '@repo/ui/components/ui/separator'
import { cn } from '@repo/ui/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import toast from '@repo/ui/components/ui/sonner'
import { updateCommunity, deleteCommunity } from '@/actions/(main)/community/community.action'
import {
    createCommunityInvite, cancelCommunityInvite, resendCommunityInvite
} from '@/actions/(main)/community/invite.action'
import { uploadCommunityImage } from '@/actions/(main)/community/upload.action'

// ==================== TYPES ====================
interface CommunitySettings {
    id: string
    name: string
    slug: string
    description: string
    shortDescription?: string
    logo?: string
    coverImage?: string
    themeColor: string
    category: string
    visibility: string
    isVerified: boolean
    enabledSections: string[]
    rules: string[]
    tags: string[]
    memberCount: number
    postCount: number
    userRole?: string
    websiteUrl?: string
    contactEmail?: string
    twitterUrl?: string
    instagramUrl?: string
    discordUrl?: string
    githubUrl?: string
}

interface CommunityInvite {
    id: string
    code: string
    inviteeEmail: string | null
    isUsed: boolean
    usedAt: Date | null
    expiresAt: Date | null
    createdAt: Date
    status?: string
    inviter: {
        id: string
        name: string | null
        image: string | null
    }
}

interface SettingsClientProps {
    community: CommunitySettings
    initialInvites: CommunityInvite[]
}

// Available sections for communities
const AVAILABLE_SECTIONS = [
    { id: 'FEED', label: 'Feed', icon: MessageSquare, description: 'General posts and discussions' },
    { id: 'QA', label: 'Q&A', icon: HelpCircle, description: 'Questions and answers' },
    { id: 'RESOURCES', label: 'Resources', icon: FileText, description: 'Shared files and resources' },
    { id: 'SHOWCASE', label: 'Showcase', icon: Code2, description: 'Project showcases' },
    { id: 'EVENTS', label: 'Events', icon: Calendar, description: 'Community events' },
    { id: 'CHALLENGES', label: 'Challenges', icon: Trophy, description: 'Coding challenges' },
    { id: 'JOBS', label: 'Jobs', icon: Briefcase, description: 'Job postings' },
]

const VISIBILITY_OPTIONS = [
    { value: 'PUBLIC', label: 'Public', icon: Globe, description: 'Anyone can find and join' },
    { value: 'RESTRICTED', label: 'Restricted', icon: UserPlus, description: 'Anyone can find, approval required to join' },
    { value: 'PRIVATE', label: 'Private', icon: Lock, description: 'Invite only' },
]

const THEME_COLORS = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F97316',
    '#EAB308', '#22C55E', '#14B8A6', '#06B6D4', '#6366F1',
]

export function CommunitySettingsClient({
    community,
    initialInvites
}: SettingsClientProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('information')
    const [isSaving, setIsSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    // Form states
    const [name, setName] = useState(community.name)
    const [description, setDescription] = useState(community.description)
    const [shortDescription, setShortDescription] = useState(community.shortDescription || '')
    const [logo, setLogo] = useState(community.logo)
    const [coverImage, setCoverImage] = useState(community.coverImage)
    const [themeColor, setThemeColor] = useState(community.themeColor)
    const [visibility, setVisibility] = useState(community.visibility)
    const [enabledSections, setEnabledSections] = useState(community.enabledSections)
    const [rules, setRules] = useState(community.rules)
    const [newRule, setNewRule] = useState('')

    // Social links
    const [websiteUrl, setWebsiteUrl] = useState(community.websiteUrl || '')
    const [contactEmail, setContactEmail] = useState(community.contactEmail || '')
    const [twitterUrl, setTwitterUrl] = useState(community.twitterUrl || '')
    const [instagramUrl, setInstagramUrl] = useState(community.instagramUrl || '')
    const [discordUrl, setDiscordUrl] = useState(community.discordUrl || '')
    const [githubUrl, setGithubUrl] = useState(community.githubUrl || '')

    // Invites
    const [invites, setInvites] = useState(initialInvites)
    const [inviteEmail, setInviteEmail] = useState('')
    const [isSendingInvite, setIsSendingInvite] = useState(false)
    const [showInviteDialog, setShowInviteDialog] = useState(false)

    // File uploads
    const logoInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)
    const [isUploadingLogo, setIsUploadingLogo] = useState(false)
    const [isUploadingCover, setIsUploadingCover] = useState(false)

    const markAsChanged = useCallback(() => {
        setHasChanges(true)
    }, [])

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploadingLogo(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'communities/logos')

            const result = await uploadCommunityImage(formData)
            if (result.success && result.url) {
                setLogo(result.url)
                markAsChanged()
                toast.success('Logo uploaded!')
            }
        } catch {
            toast.error('Failed to upload logo')
        } finally {
            setIsUploadingLogo(false)
        }
    }

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploadingCover(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'communities/covers')

            const result = await uploadCommunityImage(formData)
            if (result.success && result.url) {
                setCoverImage(result.url)
                markAsChanged()
                toast.success('Cover image uploaded!')
            }
        } catch {
            toast.error('Failed to upload cover')
        } finally {
            setIsUploadingCover(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const result = await updateCommunity(community.id, {
                name,
                description,
                shortDescription: shortDescription || undefined,
                logo,
                coverImage,
                themeColor,
                visibility: visibility as 'PUBLIC' | 'PRIVATE' | 'RESTRICTED',
                enabledSections,
                rules,
                websiteUrl: websiteUrl || undefined,
                contactEmail: contactEmail || undefined,
                twitterUrl: twitterUrl || undefined,
                instagramUrl: instagramUrl || undefined,
                discordUrl: discordUrl || undefined,
                githubUrl: githubUrl || undefined,
            })

            if (result.success) {
                toast.success('Settings saved!')
                setHasChanges(false)
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to save')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSendInvite = async () => {
        if (!inviteEmail.trim()) return

        setIsSendingInvite(true)
        try {
            const result = await createCommunityInvite({
                email: inviteEmail.trim(),
                communityId: community.id
            })
            if (result.success && result.data) {
                const newInvite: CommunityInvite = {
                    id: result.data.id,
                    code: result.data.code,
                    inviteeEmail: result.data.inviteeEmail,
                    isUsed: result.data.isUsed,
                    usedAt: result.data.usedAt,
                    expiresAt: result.data.expiresAt,
                    createdAt: result.data.createdAt,
                    inviter: {
                        id: result.data.inviter?.name || '',
                        name: result.data.inviter?.name || null,
                        image: null
                    }
                }
                setInvites(prev => [newInvite, ...prev])
                setInviteEmail('')
                setShowInviteDialog(false)
                toast.success('Invitation sent!')
            } else {
                toast.error(result.error || 'Failed to send invite')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setIsSendingInvite(false)
        }
    }

    const handleCancelInvite = async (inviteId: string) => {
        try {
            const result = await cancelCommunityInvite(inviteId)
            if (result.success) {
                setInvites(prev => prev.filter(i => i.id !== inviteId))
                toast.success('Invite cancelled')
            }
        } catch {
            toast.error('Failed to cancel invite')
        }
    }

    const handleResendInvite = async (inviteId: string) => {
        try {
            const result = await resendCommunityInvite(inviteId)
            if (result.success) {
                toast.success('Invite resent!')
            }
        } catch {
            toast.error('Failed to resend invite')
        }
    }

    const handleAddRule = () => {
        if (newRule.trim() && rules.length < 10) {
            setRules([...rules, newRule.trim()])
            setNewRule('')
            markAsChanged()
        }
    }

    const handleRemoveRule = (index: number) => {
        setRules(rules.filter((_, i) => i !== index))
        markAsChanged()
    }

    const toggleSection = (sectionId: string) => {
        setEnabledSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(s => s !== sectionId)
                : [...prev, sectionId]
        )
        markAsChanged()
    }

    const getInviteStatusBadge = (invite: CommunityInvite) => {
        if (invite.isUsed) {
            return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><Check className="w-3 h-3 mr-1" />Accepted</Badge>
        }
        if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
            return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><X className="w-3 h-3 mr-1" />Expired</Badge>
        }
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Pending</Badge>
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/communities/${community.slug}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                                {community.name} Admin Settings
                            </h1>
                            <p className="text-sm text-neutral-500">
                                Manage information and settings for your community
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !hasChanges}
                        className="gap-2"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full justify-start border-b border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none p-0 h-auto mb-8">
                        <TabsTrigger
                            value="information"
                            className="px-4 py-3 border-b-2 border-transparent rounded-none data-[state=active]:border-neutral-900 dark:data-[state=active]:border-white data-[state=active]:bg-transparent"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Information
                        </TabsTrigger>
                        <TabsTrigger
                            value="members"
                            className="px-4 py-3 border-b-2 border-transparent rounded-none data-[state=active]:border-neutral-900 dark:data-[state=active]:border-white data-[state=active]:bg-transparent"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Members
                        </TabsTrigger>
                        <TabsTrigger
                            value="invites"
                            className="px-4 py-3 border-b-2 border-transparent rounded-none data-[state=active]:border-neutral-900 dark:data-[state=active]:border-white data-[state=active]:bg-transparent"
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            Invites
                        </TabsTrigger>
                        <TabsTrigger
                            value="submissions"
                            className="px-4 py-3 border-b-2 border-transparent rounded-none data-[state=active]:border-neutral-900 dark:data-[state=active]:border-white data-[state=active]:bg-transparent"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Submissions
                        </TabsTrigger>
                        <TabsTrigger
                            value="moderation"
                            className="px-4 py-3 border-b-2 border-transparent rounded-none data-[state=active]:border-neutral-900 dark:data-[state=active]:border-white data-[state=active]:bg-transparent"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Moderation
                        </TabsTrigger>
                    </TabsList>

                    {/* Information Tab */}
                    <TabsContent value="information" className="space-y-6">
                        {/* Appearance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>
                                    Customize your community&apos;s visual identity
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Logo */}
                                    <div className="space-y-2">
                                        <Label>Icon</Label>
                                        <div className="flex flex-col items-center gap-3 p-4 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
                                            <div
                                                className="w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold text-white cursor-pointer hover:opacity-80 transition-opacity"
                                                style={{ background: logo ? `url(${logo}) center/cover` : themeColor }}
                                                onClick={() => logoInputRef.current?.click()}
                                            >
                                                {!logo && name.charAt(0)}
                                            </div>
                                            <input
                                                type="file"
                                                ref={logoInputRef}
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleLogoUpload}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => logoInputRef.current?.click()}
                                                disabled={isUploadingLogo}
                                            >
                                                {isUploadingLogo ? (
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                ) : (
                                                    <Upload className="w-4 h-4 mr-2" />
                                                )}
                                                Upload Icon
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Banner */}
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Banner</Label>
                                        <div
                                            className="relative aspect-[3/1] rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => coverInputRef.current?.click()}
                                        >
                                            {coverImage ? (
                                                <Image
                                                    src={coverImage}
                                                    alt="Cover"
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400">
                                                    <Upload className="w-8 h-8 mb-2" />
                                                    <span className="text-sm">Click to upload banner</span>
                                                </div>
                                            )}
                                            {isUploadingCover && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            ref={coverInputRef}
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleCoverUpload}
                                        />
                                    </div>
                                </div>

                                {/* Theme Color */}
                                <div className="space-y-2">
                                    <Label>Community Color</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {THEME_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => { setThemeColor(color); markAsChanged() }}
                                                className={cn(
                                                    "w-10 h-10 rounded-lg transition-all",
                                                    themeColor === color && "ring-2 ring-offset-2 ring-neutral-900 dark:ring-white"
                                                )}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                        <input
                                            type="color"
                                            value={themeColor}
                                            onChange={(e) => { setThemeColor(e.target.value); markAsChanged() }}
                                            className="w-10 h-10 rounded-lg cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Community Bio */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Community Bio</CardTitle>
                                <CardDescription>
                                    Core details and identifiers for your community
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => { setName(e.target.value); markAsChanged() }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Slug</Label>
                                        <Input
                                            id="slug"
                                            value={community.slug}
                                            disabled
                                            className="bg-neutral-100 dark:bg-neutral-800"
                                        />
                                        <p className="text-xs text-neutral-500">Community URL cannot be changed</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shortDescription">Short Description</Label>
                                    <Input
                                        id="shortDescription"
                                        value={shortDescription}
                                        onChange={(e) => { setShortDescription(e.target.value); markAsChanged() }}
                                        placeholder="A brief tagline for your community"
                                        maxLength={150}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => { setDescription(e.target.value); markAsChanged() }}
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Visibility & Access */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Visibility & Access</CardTitle>
                                <CardDescription>
                                    Control who can discover and join your community
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {VISIBILITY_OPTIONS.map((option) => {
                                        const Icon = option.icon
                                        return (
                                            <div
                                                key={option.value}
                                                onClick={() => { setVisibility(option.value); markAsChanged() }}
                                                className={cn(
                                                    "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                                                    visibility === option.value
                                                        ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800"
                                                        : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                                    visibility === option.value
                                                        ? "bg-neutral-900 dark:bg-white"
                                                        : "bg-neutral-100 dark:bg-neutral-800"
                                                )}>
                                                    <Icon className={cn(
                                                        "w-5 h-5",
                                                        visibility === option.value
                                                            ? "text-white dark:text-neutral-900"
                                                            : "text-neutral-600 dark:text-neutral-400"
                                                    )} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{option.label}</p>
                                                    <p className="text-sm text-neutral-500">{option.description}</p>
                                                </div>
                                                {visibility === option.value && (
                                                    <Check className="w-5 h-5 text-neutral-900 dark:text-white" />
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sections */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Enabled Sections</CardTitle>
                                <CardDescription>
                                    Choose which sections are available in your community
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {AVAILABLE_SECTIONS.map((section) => {
                                        const Icon = section.icon
                                        const isEnabled = enabledSections.includes(section.id)
                                        return (
                                            <div
                                                key={section.id}
                                                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-700"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{section.label}</p>
                                                        <p className="text-xs text-neutral-500">{section.description}</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={isEnabled}
                                                    onCheckedChange={() => toggleSection(section.id)}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rules */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Community Rules</CardTitle>
                                <CardDescription>
                                    Define guidelines for your community members
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {rules.map((rule, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                                        >
                                            <span className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium">
                                                {index + 1}
                                            </span>
                                            <span className="flex-1 text-sm">{rule}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="w-6 h-6"
                                                onClick={() => handleRemoveRule(index)}
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                {rules.length < 10 && (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add a new rule"
                                            value={newRule}
                                            onChange={(e) => setNewRule(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
                                        />
                                        <Button variant="outline" onClick={handleAddRule}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Contact & Social */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact & Social Information</CardTitle>
                                <CardDescription>
                                    Provide ways for members to connect with your community
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <LinkIcon className="w-4 h-4" />
                                            Website URL
                                        </Label>
                                        <Input
                                            placeholder="https://example.com"
                                            value={websiteUrl}
                                            onChange={(e) => { setWebsiteUrl(e.target.value); markAsChanged() }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            Contact Email
                                        </Label>
                                        <Input
                                            placeholder="contact@example.com"
                                            value={contactEmail}
                                            onChange={(e) => { setContactEmail(e.target.value); markAsChanged() }}
                                        />
                                    </div>
                                </div>
                                <Separator />
                                <Label className="text-base font-semibold">Social Media</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Twitter className="w-4 h-4" />
                                            Twitter / X
                                        </Label>
                                        <Input
                                            placeholder="https://twitter.com/username"
                                            value={twitterUrl}
                                            onChange={(e) => { setTwitterUrl(e.target.value); markAsChanged() }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Instagram className="w-4 h-4" />
                                            Instagram
                                        </Label>
                                        <Input
                                            placeholder="https://instagram.com/username"
                                            value={instagramUrl}
                                            onChange={(e) => { setInstagramUrl(e.target.value); markAsChanged() }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            Discord
                                        </Label>
                                        <Input
                                            placeholder="https://discord.gg/invite"
                                            value={discordUrl}
                                            onChange={(e) => { setDiscordUrl(e.target.value); markAsChanged() }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Github className="w-4 h-4" />
                                            GitHub
                                        </Label>
                                        <Input
                                            placeholder="https://github.com/organization"
                                            value={githubUrl}
                                            onChange={(e) => { setGithubUrl(e.target.value); markAsChanged() }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Danger Zone */}
                        <Card className="border-red-200 dark:border-red-800">
                            <CardHeader>
                                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                                <CardDescription>
                                    Irreversible and destructive actions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="gap-2">
                                            <Trash className="w-4 h-4" />
                                            Delete Community
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                                Are you absolutely sure?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the
                                                community <strong>{community.name}</strong> and all its data including
                                                posts, members, and resources.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-red-600 hover:bg-red-700"
                                                onClick={async () => {
                                                    try {
                                                        const result = await deleteCommunity(community.id)
                                                        if (result.success) {
                                                            toast.success('Community deleted')
                                                            router.push('/communities')
                                                        } else {
                                                            toast.error(result.error || 'Failed to delete')
                                                        }
                                                    } catch {
                                                        toast.error('Something went wrong')
                                                    }
                                                }}
                                            >
                                                Delete Community
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Members Tab */}
                    <TabsContent value="members" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Members ({community.memberCount})</CardTitle>
                                <CardDescription>
                                    Manage your community members
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-neutral-500 py-8">
                                    Member management coming soon
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Invites Tab */}
                    <TabsContent value="invites" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Invitations</CardTitle>
                                        <CardDescription>
                                            Send and manage email invitations
                                        </CardDescription>
                                    </div>
                                    <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                                        <DialogTrigger asChild>
                                            <Button className="gap-2">
                                                <Plus className="w-4 h-4" />
                                                Send Invite
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Send Invitation</DialogTitle>
                                                <DialogDescription>
                                                    Enter the email address of the person you want to invite.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="inviteEmail">Email Address</Label>
                                                    <Input
                                                        id="inviteEmail"
                                                        type="email"
                                                        placeholder="example@email.com"
                                                        value={inviteEmail}
                                                        onChange={(e) => setInviteEmail(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleSendInvite} disabled={isSendingInvite}>
                                                    {isSendingInvite && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                                    Send Invitation
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {invites.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Mail className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                                        <p className="text-neutral-500">No invitations sent yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {invites.map((invite) => (
                                            <div
                                                key={invite.id}
                                                className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                                                        <Mail className="w-5 h-5 text-neutral-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{invite.inviteeEmail}</p>
                                                        <p className="text-sm text-neutral-500">
                                                            Sent {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {getInviteStatusBadge(invite)}
                                                    {!invite.isUsed && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleResendInvite(invite.id)}
                                                                title="Resend"
                                                            >
                                                                <RefreshCw className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleCancelInvite(invite.id)}
                                                                className="text-red-500"
                                                                title="Cancel"
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Submissions Tab */}
                    <TabsContent value="submissions" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending Submissions</CardTitle>
                                <CardDescription>
                                    Review and approve pending content
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-neutral-500 py-8">
                                    No pending submissions
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Moderation Tab */}
                    <TabsContent value="moderation" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Moderation Settings</CardTitle>
                                <CardDescription>
                                    Configure moderation rules and filters
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                    <div>
                                        <p className="font-medium">Auto-moderation</p>
                                        <p className="text-sm text-neutral-500">Automatically filter inappropriate content</p>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                    <div>
                                        <p className="font-medium">Require approval for new posts</p>
                                        <p className="text-sm text-neutral-500">All posts need admin approval before publishing</p>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                    <div>
                                        <p className="font-medium">Allow media uploads</p>
                                        <p className="text-sm text-neutral-500">Members can upload images and files</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
