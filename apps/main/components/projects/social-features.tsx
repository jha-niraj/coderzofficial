"use client"

import { useState } from "react"
import {
	Share2, Bookmark, BookmarkCheck, Heart, MessageCircle, UserPlus, UserCheck,
	Twitter, Facebook, Linkedin, Copy, Check, Flag, Eye
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import {
	Card, CardContent
} from "@repo/ui/components/ui/card"
import {
	Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@repo/ui/components/ui/dialog"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Label } from "@repo/ui/components/ui/label"
import { Separator } from "@repo/ui/components/ui/separator"
import toast from "@repo/ui/components/ui/sonner"
import Image from "next/image"

interface ProjectSocialData {
	id: string
	title: string
	description: string
	slug: string
	creator: {
		id: string
		name: string
		username: string
		avatar: string
		isFollowing: boolean
		followerCount: number
	}
	stats: {
		views: number
		likes: number
		bookmarks: number
		shares: number
		comments: number
	}
	userInteractions: {
		isLiked: boolean
		isBookmarked: boolean
		hasShared: boolean
	}
	url: string
}

interface SocialFeaturesProps {
	project: ProjectSocialData
	onLike?: () => void
	onBookmark?: () => void
	onFollow?: () => void
	onShare?: (platform: string) => void
	onReport?: (reason: string) => void
	className?: string
}

export function ProjectSocialFeatures({
	project,
	onLike,
	onBookmark,
	onFollow,
	onShare,
	onReport,
	className
}: SocialFeaturesProps) {
	const [showShareDialog, setShowShareDialog] = useState(false)
	const [showReportDialog, setShowReportDialog] = useState(false)
	const [copiedLink, setCopiedLink] = useState(false)
	const [reportReason, setReportReason] = useState("")

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(project.url)
			setCopiedLink(true)
			toast.success("Link copied to clipboard!")
			setTimeout(() => setCopiedLink(false), 2000)
		} catch (error) {
			console.log("Error occurred while copying link: " + error);
			toast.error("Failed to copy link")
		}
	}

	const handleSocialShare = (platform: string) => {
		const shareData = {
			title: project.title,
			description: project.description,
			url: project.url
		}

		let shareUrl = ""

		switch (platform) {
			case "twitter":
				shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
					`Check out this amazing project: ${shareData.title}`
				)}&url=${encodeURIComponent(shareData.url)}`
				break
			case "facebook":
				shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`
				break
			case "linkedin":
				shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
					shareData.url
				)}&title=${encodeURIComponent(shareData.title)}&summary=${encodeURIComponent(shareData.description)}`
				break
			case "reddit":
				shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(
					shareData.url
				)}&title=${encodeURIComponent(shareData.title)}`
				break
		}

		if (shareUrl) {
			window.open(shareUrl, "_blank", "width=600,height=400")
			onShare?.(platform)
			toast.success(`Shared on ${platform}!`)
		}
	}

	const handleNativeShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: project.title,
					text: project.description,
					url: project.url,
				})
				onShare?.("native")
			} catch (error) {
				console.log("Share cancelled: " + error)
			}
		} else {
			setShowShareDialog(true)
		}
	}

	const handleReport = () => {
		if (reportReason.trim()) {
			onReport?.(reportReason)
			setReportReason("")
			setShowReportDialog(false)
			toast.success("Report submitted. Thank you for helping keep our community safe.")
		}
	}

	return (
		<div className={`space-y-6 ${className}`}>
			<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900/50">
				<CardContent className="pt-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="font-semibold text-gray-900 dark:text-white">Project Actions</h3>
						<div className="flex items-center gap-2">
							<Badge variant="outline" className="text-xs">
								<Eye className="w-3 h-3 mr-1" />
								{project.stats.views.toLocaleString()} views
							</Badge>
						</div>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
						<Button
							variant={project.userInteractions.isLiked ? "default" : "outline"}
							size="sm"
							onClick={onLike}
							className={`flex items-center gap-2 ${project.userInteractions.isLiked
								? "bg-red-600 hover:bg-red-700 text-white"
								: "hover:bg-red-50 dark:hover:bg-red-950/20"}`}
						>
							<Heart className={`w-4 h-4 ${project.userInteractions.isLiked ? "fill-current" : ""}`} />
							<span className="hidden sm:inline">{project.stats.likes}</span>
						</Button>
						<Button
							variant={project.userInteractions.isBookmarked ? "default" : "outline"}
							size="sm"
							onClick={onBookmark}
							className={`flex items-center gap-2 ${project.userInteractions.isBookmarked
								? "bg-blue-600 hover:bg-blue-700 text-white"
								: "hover:bg-blue-50 dark:hover:bg-blue-950/20"}`}
						>
							{
								project.userInteractions.isBookmarked ? (
									<BookmarkCheck className="w-4 h-4" />
								) : (
									<Bookmark className="w-4 h-4" />
								)
							}
							<span className="hidden sm:inline">{project.stats.bookmarks}</span>
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleNativeShare}
							className="flex items-center gap-2 hover:bg-green-50 dark:hover:bg-green-950/20"
						>
							<Share2 className="w-4 h-4" />
							<span className="hidden sm:inline">{project.stats.shares}</span>
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/20"
						>
							<MessageCircle className="w-4 h-4" />
							<span className="hidden sm:inline">{project.stats.comments}</span>
						</Button>
					</div>
				</CardContent>
			</Card>
			<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900/50">
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Image
								src={project.creator.avatar}
								alt={project.creator.name}
								className="w-12 h-12 rounded-full"
								width={48}
								height={48}
							/>
							<div>
								<div className="font-semibold text-gray-900 dark:text-white">
									{project.creator.name}
								</div>
								<div className="text-sm text-gray-600 dark:text-gray-400">
									@{project.creator.username} • {project.creator.followerCount.toLocaleString()} followers
								</div>
							</div>
						</div>
						<Button
							variant={project.creator.isFollowing ? "outline" : "default"}
							size="sm"
							onClick={onFollow}
							className={project.creator.isFollowing
								? "border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20"
								: "bg-purple-600 hover:bg-purple-700 text-white"}
						>
							{
								project.creator.isFollowing ? (
									<>
										<UserCheck className="w-4 h-4 mr-2" />
										Following
									</>
								) : (
									<>
										<UserPlus className="w-4 h-4 mr-2" />
										Follow
									</>
								)
							}
						</Button>
					</div>
				</CardContent>
			</Card>
			<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900/50">
				<CardContent className="pt-6">
					<div className="space-y-3">
						<h4 className="font-medium text-gray-900 dark:text-white text-sm">More Actions</h4>
						<div className="flex flex-wrap gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowShareDialog(true)}
								className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
							>
								<Share2 className="w-4 h-4 mr-2" />
								Share Project
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleCopyLink}
								className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
							>
								{
									copiedLink ? (
										<><Check className="w-4 h-4 mr-2" />Copied!</>
									) : (
										<><Copy className="w-4 h-4 mr-2" />Copy Link</>
									)
								}
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowReportDialog(true)}
								className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
							>
								<Flag className="w-4 h-4 mr-2" />
								Report
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
			<Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Share Project</DialogTitle>
						<DialogDescription>
							Share &quot;{project.title}&quot; with your network
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label className="text-sm font-medium">Copy Link</Label>
							<div className="flex gap-2 mt-1">
								<div className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-700 dark:text-gray-300 truncate">
									{project.url}
								</div>
								<Button size="sm" onClick={handleCopyLink} variant="outline">
									{copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
								</Button>
							</div>
						</div>

						<Separator />

						<div>
							<Label className="text-sm font-medium mb-3 block">Share on Social Media</Label>
							<div className="grid grid-cols-2 gap-3">
								<Button
									variant="outline"
									onClick={() => handleSocialShare("twitter")}
									className="flex items-center gap-2 justify-start"
								>
									<Twitter className="w-4 h-4 text-blue-400" />
									Twitter
								</Button>
								<Button
									variant="outline"
									onClick={() => handleSocialShare("facebook")}
									className="flex items-center gap-2 justify-start"
								>
									<Facebook className="w-4 h-4 text-blue-600" />
									Facebook
								</Button>
								<Button
									variant="outline"
									onClick={() => handleSocialShare("linkedin")}
									className="flex items-center gap-2 justify-start"
								>
									<Linkedin className="w-4 h-4 text-blue-700" />
									LinkedIn
								</Button>
								<Button
									variant="outline"
									onClick={() => handleSocialShare("reddit")}
									className="flex items-center gap-2 justify-start"
								>
									<MessageCircle className="w-4 h-4 text-orange-600" />
									Reddit
								</Button>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
			<Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Report Project</DialogTitle>
						<DialogDescription>
							Help us maintain a safe and respectful community by reporting inappropriate content.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="report-reason">Reason for reporting</Label>
							<Textarea
								id="report-reason"
								placeholder="Please describe why you're reporting this project..."
								value={reportReason}
								onChange={(e) => setReportReason(e.target.value)}
								className="mt-1"
							/>
						</div>
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setShowReportDialog(false)
									setReportReason("")
								}}
							>
								Cancel
							</Button>
							<Button
								onClick={handleReport}
								disabled={!reportReason.trim()}
								className="bg-red-600 hover:bg-red-700 text-white"
							>
								Submit Report
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

// Compact version for project cards
interface CompactSocialFeaturesProps {
	project: Pick<ProjectSocialData, "id" | "stats" | "userInteractions">
	onLike?: () => void
	onBookmark?: () => void
	onShare?: () => void
	className?: string
}

export function CompactSocialFeatures({
	project,
	onLike,
	onBookmark,
	onShare,
	className
}: CompactSocialFeaturesProps) {
	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<Button
				variant="ghost"
				size="sm"
				onClick={onLike}
				className={`p-1 h-auto ${project.userInteractions.isLiked
					? "text-red-600"
					: "text-gray-400 hover:text-red-600"}`}
			>
				<Heart className={`w-4 h-4 ${project.userInteractions.isLiked ? "fill-current" : ""}`} />
				<span className="ml-1 text-xs">{project.stats.likes}</span>
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={onBookmark}
				className={`p-1 h-auto ${project.userInteractions.isBookmarked
					? "text-blue-600"
					: "text-gray-400 hover:text-blue-600"}`}
			>
				{
					project.userInteractions.isBookmarked ? (
						<BookmarkCheck className="w-4 h-4" />
					) : (
						<Bookmark className="w-4 h-4" />
					)
				}
				<span className="ml-1 text-xs">{project.stats.bookmarks}</span>
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={onShare}
				className="p-1 h-auto text-gray-400 hover:text-green-600"
			>
				<Share2 className="w-4 h-4" />
				<span className="ml-1 text-xs">{project.stats.shares}</span>
			</Button>
		</div>
	)
}

// Social Stats Component
interface SocialStatsProps {
	stats: ProjectSocialData["stats"]
	className?: string
}

export function SocialStats({ stats, className }: SocialStatsProps) {
	return (
		<div className={`flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 ${className}`}>
			<div className="flex items-center gap-1">
				<Heart className="w-4 h-4" />
				{stats.likes.toLocaleString()} likes
			</div>
			<div className="flex items-center gap-1">
				<Bookmark className="w-4 h-4" />
				{stats.bookmarks.toLocaleString()} saved
			</div>
			<div className="flex items-center gap-1">
				<Share2 className="w-4 h-4" />
				{stats.shares.toLocaleString()} shares
			</div>
			<div className="flex items-center gap-1">
				<MessageCircle className="w-4 h-4" />
				{stats.comments.toLocaleString()} comments
			</div>
		</div>
	)
}

// Follow Button Component
interface FollowButtonProps {
	user: ProjectSocialData["creator"]
	onFollow?: () => void
	size?: "sm" | "md" | "lg"
	className?: string
}

export function FollowButton({ user, onFollow, size = "md", className }: FollowButtonProps) {
	// Map size to valid Button sizes
	const buttonSize = size === "md" ? "default" : size === "lg" ? "lg" : "sm"

	return (
		<Button
			variant={user.isFollowing ? "outline" : "default"}
			size={buttonSize}
			onClick={onFollow}
			className={`${user.isFollowing
				? "border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20"
				: "bg-purple-600 hover:bg-purple-700 text-white"} ${className}`}
		>
			{
				user.isFollowing ? (
					<>
						<UserCheck className="w-4 h-4 mr-2" />
						Following
					</>
				) : (
					<>
						<UserPlus className="w-4 h-4 mr-2" />
						Follow
					</>
				)
			}
		</Button>
	)
}