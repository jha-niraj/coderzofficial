"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { Switch } from '@repo/ui/components/ui/switch';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@repo/ui/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger
} from '@repo/ui/components/ui/alert-dialog';
import {
    ArrowLeft, Settings, Globe, Lock, Shield, Users, Loader2, Trash2,
    Save
} from 'lucide-react';
import toast from '@repo/ui/components/ui/sonner';
import { updateSpace, deleteSpace } from '@/actions/(main)/space/space.action';
import type { SpaceWithDetails } from '@/types/space';
import { SpaceVisibility } from '@repo/prisma/client';

interface SpaceSettingsClientProps {
    space: SpaceWithDetails;
}

export default function SpaceSettingsClient({ space }: SpaceSettingsClientProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        title: space.title,
        description: space.description || '',
        emoji: space.emoji || '🚀',
        visibility: space.visibility,
        allowMemberContent: space.allowMemberContent,
        enableProgressTracking: space.enableProgressTracking,
        enableBranches: space.enableBranches,
        enableComments: space.enableComments,
        enableLikes: space.enableLikes,
        isAssignmentMode: space.isAssignmentMode,
    });

    const handleSave = async () => {
        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }

        setSaving(true);
        const result = await updateSpace(space.id, {
            title: formData.title,
            description: formData.description || undefined,
            emoji: formData.emoji,
            visibility: formData.visibility as SpaceVisibility,
            allowMemberContent: formData.allowMemberContent,
            enableProgressTracking: formData.enableProgressTracking,
            enableBranches: formData.enableBranches,
            enableComments: formData.enableComments,
            enableLikes: formData.enableLikes,
            isAssignmentMode: formData.isAssignmentMode,
        });

        setSaving(false);

        if (result.success) {
            toast.success('Settings saved successfully!');
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to save settings');
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        const result = await deleteSpace(space.id);

        if (result.success) {
            toast.success('Space deleted successfully');
            router.push('/space');
        } else {
            toast.error(result.error || 'Failed to delete space');
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Header */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-10">
                <div className="container mx-auto max-w-4xl px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={`/space/${space.slug}`}>
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                                    <Settings className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                                        Space Settings
                                    </h1>
                                    <p className="text-sm text-neutral-500">
                                        {space.title}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto max-w-4xl py-8 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Update your space&apos;s basic details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>Emoji</Label>
                                    <Input
                                        value={formData.emoji}
                                        onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                                        className="text-center text-2xl h-12"
                                        maxLength={2}
                                    />
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label>Title *</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Space title"
                                        className="h-12"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe what this space is about..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visibility */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-blue-500" />
                                Visibility & Access
                            </CardTitle>
                            <CardDescription>
                                Control who can see and join this space
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Space Visibility</Label>
                                <Select
                                    value={formData.visibility}
                                    onValueChange={(value) => setFormData({ ...formData, visibility: value as SpaceVisibility })}
                                >
                                    <SelectTrigger className="h-12">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PUBLIC">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-green-500" />
                                                Public - Anyone can join
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="PRIVATE">
                                            <div className="flex items-center gap-2">
                                                <Lock className="w-4 h-4 text-red-500" />
                                                Private - Invite only
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="PROTECTED">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-amber-500" />
                                                Protected - Access code required
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {space.accessCode && formData.visibility === 'PROTECTED' && (
                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-amber-900 dark:text-amber-100">
                                                Access Code
                                            </div>
                                            <div className="text-sm text-amber-700 dark:text-amber-300">
                                                Share this with people who should have access
                                            </div>
                                        </div>
                                        <code className="px-3 py-2 bg-amber-100 dark:bg-amber-900 rounded-lg font-mono text-lg">
                                            {space.accessCode}
                                        </code>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <div className="font-medium">Allow Member Content</div>
                                        <div className="text-sm text-neutral-500">
                                            Members can add content to the timeline
                                        </div>
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.allowMemberContent}
                                    onCheckedChange={(checked) => setFormData({ ...formData, allowMemberContent: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Features */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Features</CardTitle>
                            <CardDescription>
                                Enable or disable space features
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { key: 'enableProgressTracking', label: 'Progress Tracking', desc: 'Track member progress through the timeline' },
                                { key: 'enableBranches', label: 'Branches', desc: 'Allow members to create their own branches' },
                                { key: 'enableComments', label: 'Comments', desc: 'Allow comments on timeline steps' },
                                { key: 'enableLikes', label: 'Likes', desc: 'Allow likes on timeline steps' },
                                { key: 'isAssignmentMode', label: 'Assignment Mode', desc: 'Enable teacher/assignment features' },
                            ].map((feature) => (
                                <div
                                    key={feature.key}
                                    className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900"
                                >
                                    <div>
                                        <div className="font-medium">{feature.label}</div>
                                        <div className="text-sm text-neutral-500">{feature.desc}</div>
                                    </div>
                                    <Switch
                                        checked={formData[feature.key as keyof typeof formData] as boolean}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, [feature.key]: checked })
                                        }
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-800">
                        <CardHeader>
                            <CardTitle className="text-red-600 dark:text-red-400">
                                Danger Zone
                            </CardTitle>
                            <CardDescription>
                                Irreversible actions - proceed with caution
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={deleting}>
                                        {deleting ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
                                        ) : (
                                            <><Trash2 className="w-4 h-4 mr-2" /> Delete Space</>
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the space
                                            &quot;{space.title}&quot; and all its content, including steps, member progress,
                                            and activity history.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            Delete Space
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

