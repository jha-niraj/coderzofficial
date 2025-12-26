"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
	Camera, Edit2, Share2, Settings, MapPin, Briefcase, Calendar,
	Link as LinkIcon, Mail, Check, Copy
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import toast from "@repo/ui/components/ui/sonner";
import Link from "next/link";

interface ProfileHeaderProps {
	user: {
		id: string;
		name: string | null;
		username: string | null;
		image: string | null;
		bio: string | null;
		location: string | null;
		company: string | null;
		occupation: string | null;
		website: string | null;
		createdAt: Date;
		currentLevel: number;
		totalXp: number;
		userProfile?: {
			coverImage: string | null;
			coverGradient: string | null;
			tagline: string | null;
			theme: string;
			profileViews: number;
			completionScore: number;
		} | null;
	};
	stats: {
		projectsCount: number;
		skillsCount: number;
		followersCount: number;
		followingCount: number;
		xp: number;
		level: number;
		credits: number;
		achievementsCount: number;
	};
	isOwnProfile: boolean;
	isFollowing?: boolean;
	onEditProfile?: () => void;
	onShareProfile?: () => void;
	onOpenSettings?: () => void;
	onFollowToggle?: () => void;
}

// Theme gradients
const THEME_GRADIENTS = {
	OCEAN_BLUE: "from-blue-600 via-cyan-500 to-teal-400",
	SUNSET_ORANGE: "from-orange-500 via-amber-500 to-yellow-400",
	FOREST_GREEN: "from-emerald-600 via-green-500 to-lime-400",
	PURPLE_DREAM: "from-purple-600 via-violet-500 to-pink-400",
	DARK_MODE: "from-gray-800 via-gray-700 to-gray-600",
};

export function ProfileHeader({
	user,
	stats,
	isOwnProfile,
	isFollowing,
	onEditProfile,
	onShareProfile,
	onOpenSettings,
	onFollowToggle,
}: ProfileHeaderProps) {
	const [copied, setCopied] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const coverGradient =
		user.userProfile?.coverGradient ||
		THEME_GRADIENTS[user.userProfile?.theme as keyof typeof THEME_GRADIENTS] ||
		THEME_GRADIENTS.OCEAN_BLUE;

	const copyProfileLink = () => {
		const url = `${window.location.origin}/u/${user.username}`;
		navigator.clipboard.writeText(url);
		setCopied(true);
		toast.success("Profile link copied!");
		setTimeout(() => setCopied(false), 2000);
	};

	const statItems = [
		{ label: "Projects", value: stats.projectsCount },
		{ label: "Skills", value: stats.skillsCount },
		{ label: "Followers", value: stats.followersCount },
		{ label: "Following", value: stats.followingCount },
		{ label: "XP", value: stats.xp.toLocaleString() },
		{ label: "Level", value: stats.level },
		{ label: "Credits", value: stats.credits },
		{ label: "Badges", value: stats.achievementsCount },
	];

	return (
		<div className="relative w-full">
			<div
				className={cn(
					"relative h-48 md:h-64 lg:h-72 w-full overflow-hidden rounded-t-2xl",
					!user.userProfile?.coverImage && `bg-gradient-to-r ${coverGradient}`
				)}
			>
				{
					user.userProfile?.coverImage && (
						<Image
							src={user.userProfile.coverImage}
							alt="Cover"
							fill
							className="object-cover"
							priority
						/>
					)
				}
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
				{
					isOwnProfile && (
						<Button
							size="sm"
							variant="secondary"
							className="absolute top-4 right-4 gap-2 opacity-80 hover:opacity-100 transition-opacity"
							onClick={() => fileInputRef.current?.click()}
						>
							<Camera className="w-4 h-4" />
							Edit Cover
						</Button>
					)
				}
			</div>
			<div className="relative px-4 md:px-8 pb-4">
				<div className="absolute -top-16 md:-top-20 left-4 md:left-8">
					<motion.div
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.3 }}
						className="relative"
					>
						<div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-background overflow-hidden bg-background shadow-xl">
							<Image
								src={
									user.image ||
									"https://tse4.mm.bing.net/th?id=OIP.-BS8Y2nH1k93GJiitUVBCAHaHa&pid=Api&P=0"
								}
								alt={user.name || "User"}
								fill
								className="object-cover"
							/>
						</div>
						<div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg border-2 border-background">
							LVL {stats.level}
						</div>
						{
							isOwnProfile && (
								<Button
									size="icon"
									variant="secondary"
									className="absolute bottom-0 left-0 w-8 h-8 rounded-full shadow-lg"
									onClick={() => fileInputRef.current?.click()}
								>
									<Camera className="w-4 h-4" />
								</Button>
							)
						}
					</motion.div>
				</div>
				<div className="pt-16 md:pt-20 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 flex-wrap">
							<h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
								{user.name || "Anonymous User"}
							</h1>
							{
								user.userProfile?.completionScore === 100 && (
									<Badge
										variant="secondary"
										className="bg-green-500/10 text-green-600 border-green-500/20"
									>
										<Check className="w-3 h-3 mr-1" />
										Verified
									</Badge>
								)
							}
						</div>
						{
							user.username && (
								<p className="text-muted-foreground">@{user.username}</p>
							)
						}
						{
							user.userProfile?.tagline && (
								<p className="text-sm md:text-base text-muted-foreground mt-1 max-w-xl">
									{user.userProfile.tagline}
								</p>
							)
						}
						<div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
							{
								user.occupation && (
									<span className="flex items-center gap-1.5">
										<Briefcase className="w-4 h-4" />
										{user.occupation}
									</span>
								)
							}
							{
								user.company && (
									<span className="flex items-center gap-1.5">at {user.company}</span>
								)
							}
							{
								user.location && (
									<span className="flex items-center gap-1.5">
										<MapPin className="w-4 h-4" />
										{user.location}
									</span>
								)
							}
							{
								user.website && (
									<Link
										href={user.website}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-1.5 hover:text-primary transition-colors"
									>
										<LinkIcon className="w-4 h-4" />
										Website
									</Link>
								)
							}
							<span className="flex items-center gap-1.5">
								<Calendar className="w-4 h-4" />
								Joined{" "}
								{
									new Date(user.createdAt).toLocaleDateString("en-US", {
										month: "short",
										year: "numeric",
									})
								}
							</span>
						</div>
					</div>
					<div className="flex items-center gap-2 flex-shrink-0">
						{
							isOwnProfile ? (
								<>
									<Button variant="outline" size="sm" onClick={onEditProfile}>
										<Edit2 className="w-4 h-4 mr-2" />
										Edit Profile
									</Button>
									<Button variant="outline" size="sm" onClick={copyProfileLink}>
										{
											copied ? (
												<Check className="w-4 h-4 mr-2" />
											) : (
												<Copy className="w-4 h-4 mr-2" />
											)
										}
										{copied ? "Copied!" : "Copy Link"}
									</Button>
									<Button variant="outline" size="icon" onClick={onShareProfile}>
										<Share2 className="w-4 h-4" />
									</Button>
									<Button variant="outline" size="icon" onClick={onOpenSettings}>
										<Settings className="w-4 h-4" />
									</Button>
								</>
							) : (
								<>
									<Button
										variant={isFollowing ? "outline" : "default"}
										onClick={onFollowToggle}
										className={
											!isFollowing
												? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600"
												: ""
										}
									>
										{isFollowing ? "Following" : "Follow"}
									</Button>
									<Button variant="outline" size="sm">
										<Mail className="w-4 h-4 mr-2" />
										Message
									</Button>
									<Button variant="outline" size="icon" onClick={copyProfileLink}>
										{
											copied ? (
												<Check className="w-4 h-4" />
											) : (
												<Share2 className="w-4 h-4" />
											)
										}
									</Button>
								</>
							)
						}
					</div>
				</div>
				<div className="mt-6 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-muted/50 border-y overflow-x-auto">
					<div className="flex items-center gap-6 md:gap-8 min-w-max">
						{
							statItems.map((stat, index) => (
								<motion.div
									key={stat.label}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
									className="flex flex-col items-center"
								>
									<span className="text-lg md:text-xl font-bold text-foreground">
										{stat.value}
									</span>
									<span className="text-xs text-muted-foreground">{stat.label}</span>
								</motion.div>
							))
						}
					</div>
				</div>
			</div>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={(e) => {
					// Handle image upload
					const file = e.target.files?.[0];
					if (file) {
						toast.info("Image upload coming soon!");
					}
				}}
			/>
		</div>
	);
}