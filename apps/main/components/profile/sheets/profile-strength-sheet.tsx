"use client";
import {
	Sheet, SheetContent, SheetHeader, SheetTitle
} from "@repo/ui/components/ui/sheet";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import {
	Target, User, Briefcase, FolderKanban, GraduationCap, Award,
	Link2, Check, ArrowRight, Sparkles
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";

interface ProfileStrengthSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	completionScore: number;
	user: {
		name: string | null;
		image?: string | null;
		bio: string | null;
		location?: string | null;
		careerGoals?: string[];
		targetCompanies?: string[];
		expectedSalary?: string | null;
		experiences?: Array<unknown>;
		portfolioProjects?: Array<unknown>;
		university?: string | null;
		certifications?: Array<unknown>;
		skills?: Array<unknown>;
		socialLinks?: Array<unknown>;
		website?: string | null;
		userProfile?: Record<string, unknown> | null;
	};
}

const defaultImage = "https://tse4.mm.bing.net/th?id=OIP.-BS8Y2nH1k93GJiitUVBCAHaHa&pid=Api&P=0";

const RESUME_CREATOR_LINK = "/ai/resume/create";

export function ProfileStrengthSheet({
	open,
	onOpenChange,
	completionScore,
	user,
}: ProfileStrengthSheetProps) {
	const hasBasicInfo = !!(user.name && user.bio && user.image && user.image !== defaultImage);
	const hasLocation = !!user.location;
	const hasProfileCustom = !!(user.userProfile?.coverGradient || user.userProfile?.tagline || user.userProfile?.theme);
	const hasCareerDetails = !!(
		(user.careerGoals && user.careerGoals.length > 0) ||
		(user.targetCompanies && user.targetCompanies.length > 0) ||
		user.expectedSalary
	);
	const hasSkills = !!(user.skills && user.skills.length > 0);
	const hasExperience = !!(user.experiences && user.experiences.length > 0);
	const hasEducation = !!(user.university || (user.certifications && user.certifications.length > 0));
	const hasProjects = !!(user.portfolioProjects && user.portfolioProjects.length > 0);
	const hasSocials = !!(user.socialLinks && user.socialLinks.length > 0 || user.website);

	const items = [
		{
			id: "basic",
			label: "Basic Information",
			description: "Name, bio, profile picture, location",
			completed: hasBasicInfo && hasLocation,
			icon: User,
			link: "/profile",
			tab: "Edit Profile",
		},
		{
			id: "profile",
			label: "Profile Customization",
			description: "Cover gradient, tagline, theme",
			completed: hasProfileCustom,
			icon: Target,
			link: "/profile",
			tab: "Edit Profile",
		},
		{
			id: "career",
			label: "Career Details",
			description: "Career goals, target companies, expected salary",
			completed: hasCareerDetails,
			icon: Target,
			link: "/profile",
			tab: "Edit Profile",
		},
		{
			id: "experience",
			label: "Work Experience",
			description: "Add your work history",
			completed: hasExperience,
			icon: Briefcase,
			link: RESUME_CREATOR_LINK,
			tab: "Experience tab",
		},
		{
			id: "education",
			label: "Education & Certifications",
			description: "University, certifications",
			completed: hasEducation,
			icon: GraduationCap,
			link: RESUME_CREATOR_LINK,
			tab: "Education tab",
		},
		{
			id: "projects",
			label: "Portfolio Projects",
			description: "Showcase your projects",
			completed: hasProjects,
			icon: FolderKanban,
			link: RESUME_CREATOR_LINK,
			tab: "Projects tab",
		},
		{
			id: "skills",
			label: "Skills",
			description: "Technical skills",
			completed: hasSkills,
			icon: Award,
			link: RESUME_CREATOR_LINK,
			tab: "Skills tab",
		},
		{
			id: "socials",
			label: "Social Links & Website",
			description: "GitHub, LinkedIn, portfolio",
			completed: hasSocials,
			icon: Link2,
			link: RESUME_CREATOR_LINK,
			tab: "Socials tab",
		},
	];

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 flex flex-col">
				<div className="w-full max-w-3xl mx-auto flex flex-col h-full">
					<SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
						<SheetTitle className="flex items-center gap-2">
							<Target className="w-5 h-5 text-primary" />
							Profile Strength
						</SheetTitle>
					</SheetHeader>
					<div className="flex-1 overflow-y-auto px-6 py-6">
						<div className="text-center mb-8">
							<div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
								<span className="text-3xl font-bold text-primary">{completionScore}%</span>
							</div>
							<Progress value={completionScore} className="h-3 max-w-xs mx-auto" />
							<p className="text-sm text-muted-foreground mt-2">
								{completionScore >= 100
									? "Your profile is complete!"
									: `Complete the items below to reach 100%`}
							</p>
						</div>
						<div className="space-y-3">
							{items.map((item) => {
								const Icon = item.icon;
								return (
									<div
										key={item.id}
										className={cn(
											"flex items-center gap-4 p-4 rounded-xl border transition-colors",
											item.completed
												? "bg-green-500/5 border-green-500/20"
												: "bg-muted/30 border-border hover:bg-muted/50"
										)}
									>
										<div
											className={cn(
												"w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
												item.completed ? "bg-green-500/20" : "bg-muted"
											)}
										>
											{item.completed ? (
												<Check className="w-5 h-5 text-green-600" />
											) : (
												<Icon className="w-5 h-5 text-muted-foreground" />
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium">{item.label}</p>
											<p className="text-xs text-muted-foreground">{item.description}</p>
										</div>
										{!item.completed && (
											<Button variant="outline" size="sm" asChild>
												<Link href={item.link} onClick={() => onOpenChange(false)}>
													Add
													<ArrowRight className="w-4 h-4 ml-1" />
												</Link>
											</Button>
										)}
									</div>
								);
							})}
						</div>
						<div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
							<p className="text-sm flex items-center gap-2">
								<Sparkles className="w-4 h-4 text-primary" />
								<strong>Tip:</strong> Use the{" "}
								<Link href={RESUME_CREATOR_LINK} className="text-primary hover:underline font-medium">
									Resume Creator
								</Link>{" "}
								to add work experience, projects, education, skills & socials. You can also polish
								project descriptions with AI there.
							</p>
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
