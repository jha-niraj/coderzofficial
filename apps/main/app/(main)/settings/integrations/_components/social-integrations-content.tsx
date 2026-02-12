'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    Twitter, Linkedin, Link2, Unlink,
    CheckCircle2, AlertCircle, ArrowLeft
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
    AlertDialogTitle
} from '@repo/ui/components/ui/alert-dialog'
import { cn } from '@repo/ui/lib/utils'
import toast from '@repo/ui/components/ui/sonner'
import Link from 'next/link'
import Image from 'next/image'
import { disconnectSocialAccount } from '@/actions/(main)/achievements/social-share.action'

interface Connection {
    id: string
    provider: 'TWITTER' | 'LINKEDIN'
    accountName: string | null
    accountHandle: string | null
    accountImage: string | null
    isActive: boolean
    connectedAt: Date
}

interface SocialIntegrationsContentProps {
    connections: Connection[]
}

const PLATFORMS = [
    {
        id: 'TWITTER' as const,
        name: 'Twitter / X',
        icon: Twitter,
        color: '#1DA1F2',
        bgLight: 'bg-blue-50',
        bgDark: 'dark:bg-blue-950',
        description: 'Share your achievements and progress on Twitter',
        connectUrl: '/api/auth/twitter', // Will be OAuth URL
    },
    {
        id: 'LINKEDIN' as const,
        name: 'LinkedIn',
        icon: Linkedin,
        color: '#0A66C2',
        bgLight: 'bg-blue-50',
        bgDark: 'dark:bg-blue-950',
        description: 'Showcase your achievements professionally on LinkedIn',
        connectUrl: '/api/auth/linkedin', // Will be OAuth URL
    },
]

export function SocialIntegrationsContent({ connections }: SocialIntegrationsContentProps) {
    const [disconnecting, setDisconnecting] = useState<string | null>(null)
    const [confirmDialog, setConfirmDialog] = useState<{open: boolean, provider: 'TWITTER' | 'LINKEDIN' | null}>({
        open: false,
        provider: null,
    })

    const getConnection = (provider: 'TWITTER' | 'LINKEDIN') => {
        return connections.find(c => c.provider === provider && c.isActive)
    }

    const handleConnect = (_platform: typeof PLATFORMS[number]) => {
        // In production, this would redirect to OAuth flow
        // For now, show a toast
        toast.info('OAuth integration coming soon!', {
            description: 'Social account connection requires API setup.',
        })
    }

    const handleDisconnect = async () => {
        if (!confirmDialog.provider) return
        setDisconnecting(confirmDialog.provider)

        try {
            const result = await disconnectSocialAccount(confirmDialog.provider)
            
            if (result.success) {
                toast.success('Account disconnected')
            } else {
                toast.error(result.error || 'Failed to disconnect')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setDisconnecting(null)
            setConfirmDialog({ open: false, provider: null })
        }
    }

    return (
        <div className="h-screen bg-neutral-50 dark:bg-neutral-950">
            <ScrollArea className="h-full">
                <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Link href="/achievements">
                            <Button variant="ghost" size="icon" className="shrink-0">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Social Integrations</h1>
                            <p className="text-neutral-500 mt-1">Connect your accounts to share achievements</p>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                            <Link2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                    Connect your social accounts to automatically share your achievements, badges, and milestones with your network.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Platforms */}
                    <div className="space-y-4">
                        {PLATFORMS.map((platform, idx) => {
                            const connection = getConnection(platform.id)
                            const isConnected = !!connection
                            const Icon = platform.icon

                            return (
                                <motion.div
                                    key={platform.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={cn(
                                        "bg-white dark:bg-neutral-900 rounded-xl border p-5 transition-all",
                                        isConnected 
                                            ? "border-emerald-200 dark:border-emerald-800"
                                            : "border-neutral-200 dark:border-neutral-800"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div 
                                                className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center",
                                                    platform.bgLight, platform.bgDark
                                                )}
                                            >
                                                <Icon 
                                                    className="w-6 h-6" 
                                                    style={{ color: platform.color }}
                                                />
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                        {platform.name}
                                                    </h3>
                                                    {isConnected && (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Connected
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-neutral-500 mt-1">
                                                    {platform.description}
                                                </p>

                                                {/* Connected account info */}
                                                {isConnected && connection && (
                                                    <div className="mt-3 flex items-center gap-2">
                                                        {connection.accountImage && (
                                                            <Image
                                                                src={connection.accountImage}
                                                                alt={connection.accountName || 'Profile'}
                                                                width={24}
                                                                height={24}
                                                                className="w-6 h-6 rounded-full"
                                                            />
                                                        )}
                                                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                                            {connection.accountHandle 
                                                                ? `@${connection.accountHandle}`
                                                                : connection.accountName || 'Connected'}
                                                        </span>
                                                        <span className="text-xs text-neutral-400">
                                                            · Connected {new Date(connection.connectedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div>
                                            {isConnected ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setConfirmDialog({ open: true, provider: platform.id })}
                                                    disabled={disconnecting === platform.id}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                                >
                                                    <Unlink className="w-4 h-4 mr-2" />
                                                    Disconnect
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleConnect(platform)}
                                                    size="sm"
                                                    style={{ 
                                                        backgroundColor: platform.color,
                                                        color: 'white',
                                                    }}
                                                    className="hover:opacity-90"
                                                >
                                                    <Link2 className="w-4 h-4 mr-2" />
                                                    Connect
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Features Section */}
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">What you can share</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FeatureItem
                                title="Badges & Achievements"
                                description="Share when you earn new badges"
                            />
                            <FeatureItem
                                title="Level Ups"
                                description="Celebrate reaching new levels"
                            />
                            <FeatureItem
                                title="Project Completions"
                                description="Showcase completed projects"
                            />
                            <FeatureItem
                                title="Certifications"
                                description="Share your earned certifications"
                            />
                        </div>
                    </div>

                    {/* Privacy Notice */}
                    <div className="bg-neutral-100 dark:bg-neutral-900 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                <p className="font-medium mb-1">Privacy & Security</p>
                                <p>
                                    We only request the minimum permissions needed to post on your behalf. 
                                    We never read your messages, access your contacts, or post without your explicit action. 
                                    You can disconnect your accounts at any time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* Disconnect Confirmation Dialog */}
            <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, provider: confirmDialog.provider })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Disconnect Account?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to disconnect your {confirmDialog.provider === 'TWITTER' ? 'Twitter' : 'LinkedIn'} account? 
                            You won&apos;t be able to share achievements to this platform until you reconnect.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDisconnect}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function FeatureItem({ title, description }: { title: string; description: string }) {
    return (
        <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{title}</p>
                <p className="text-xs text-neutral-500">{description}</p>
            </div>
        </div>
    )
}
