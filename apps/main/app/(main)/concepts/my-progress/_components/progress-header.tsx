"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ProgressHeader() {
	return (
		<section className="relative overflow-hidden border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 mb-10">
			<div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
			<div className="max-w-6xl mx-auto px-4 py-16">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center max-w-2xl mx-auto"
				>
					<Badge 
						variant="outline" 
						className="mb-6 px-4 py-1.5 rounded-full border-neutral-300 dark:border-neutral-700"
					>
						<TrendingUp className="w-4 h-4 mr-2" />
						Learning Journey
					</Badge>
					<h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight">
						My Progress
					</h1>
					<p className="text-lg text-neutral-600 dark:text-neutral-400">
						Track your learning journey and see how far you&apos;ve come. Keep up the momentum and master new concepts every day.
					</p>
				</motion.div>
			</div>
		</section>
	);
}