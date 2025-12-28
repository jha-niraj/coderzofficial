"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@repo/ui/lib/utils";
import {
	LayoutGrid, FolderKanban, Activity, Code2, FileText, User
} from "lucide-react";

export type ProfileTab =
	| "overview"
	| "projects"
	| "activity"
	| "skills"
	| "resume"
	| "about";

interface ProfileTabsProps {
	activeTab: ProfileTab;
	onTabChange: (tab: ProfileTab) => void;
	isOwnProfile?: boolean;
}

const tabs: {
	id: ProfileTab;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	description: string;
}[] = [
		{
			id: "overview",
			label: "Overview",
			icon: LayoutGrid,
			description: "Profile summary and highlights",
		},
		{
			id: "projects",
			label: "Projects",
			icon: FolderKanban,
			description: "Completed and ongoing projects",
		},
		{
			id: "activity",
			label: "Activity",
			icon: Activity,
			description: "Recent contributions and activity",
		},
		{
			id: "skills",
			label: "Skills",
			icon: Code2,
			description: "Technical skills and endorsements",
		},
		{
			id: "resume",
			label: "Resume",
			icon: FileText,
			description: "Experience and qualifications",
		},
		{
			id: "about",
			label: "About",
			icon: User,
			description: "Personal information and bio",
		},
	];

export function ProfileTabs({
	activeTab,
	onTabChange,
}: ProfileTabsProps) {
	const [hoveredTab, setHoveredTab] = useState<ProfileTab | null>(null);

	return (
		<div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
			<div className="w-full overflow-x-auto scrollbar-hide">
				<nav className="flex items-center gap-1 px-4 md:px-8 min-w-max" role="tablist">
					{
						tabs.map((tab) => {
							const Icon = tab.icon;
							const isActive = activeTab === tab.id;
							const isHovered = hoveredTab === tab.id;

							return (
								<button
									key={tab.id}
									role="tab"
									aria-selected={isActive}
									aria-controls={`tab-panel-${tab.id}`}
									onClick={() => onTabChange(tab.id)}
									onMouseEnter={() => setHoveredTab(tab.id)}
									onMouseLeave={() => setHoveredTab(null)}
									className={cn(
										"relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
										"hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
										isActive
											? "text-foreground"
											: "text-muted-foreground hover:text-foreground/80"
									)}
								>
									<Icon
										className={cn(
											"w-4 h-4 transition-colors",
											isActive ? "text-primary" : ""
										)}
									/>
									<span className="hidden sm:inline">{tab.label}</span>
									{
										isActive && (
											<motion.div
												layoutId="activeTabIndicator"
												className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 to-amber-500"
												initial={false}
												transition={{
													type: "spring",
													stiffness: 500,
													damping: 30,
												}}
											/>
										)
									}
									{
										isHovered && !isActive && (
											<motion.div
												className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted-foreground/20"
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												transition={{ duration: 0.15 }}
											/>
										)
									}
								</button>
							);
						})
					}
				</nav>
			</div>
			<div className="sr-only" aria-live="polite">
				{tabs.find((t) => t.id === activeTab)?.description}
			</div>
		</div>
	);
}

// Mobile-friendly tab selector (dropdown alternative)
export function ProfileTabsDropdown({
	activeTab,
	onTabChange,
}: ProfileTabsProps) {


	return (
		<div className="sm:hidden">
			<select
				value={activeTab}
				onChange={(e) => onTabChange(e.target.value as ProfileTab)}
				className="w-full p-3 bg-background border rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary"
			>
				{
					tabs.map((tab) => (
						<option key={tab.id} value={tab.id}>
							{tab.label}
						</option>
					))
				}
			</select>
		</div>
	);
}