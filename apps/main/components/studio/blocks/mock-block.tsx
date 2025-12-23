"use client";

import { motion } from "framer-motion";
import {
	Mic, Sparkles, Clock, MessageSquare, Brain, Target
} from "lucide-react";

export default function StudioMockBlock() {
	return (
		<div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-900">
			<div className="p-8 text-center">
				<motion.div
					className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mx-auto mb-6 flex items-center justify-center"
					animate={{ scale: [1, 1.05, 1] }}
					transition={{ duration: 2, repeat: Infinity }}
				>
					<Mic className="h-10 w-10 text-cyan-500" />
				</motion.div>
				<div className="flex items-center justify-center gap-2 mb-3">
					<h3 className="text-xl font-bold text-neutral-900 dark:text-white">
						AI Mock Interview
					</h3>
					<span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
						Coming Soon
					</span>
				</div>
				<p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-6">
					Practice interviews with AI-powered interviewers. Get real-time feedback
					on your responses, communication skills, and technical knowledge.
				</p>
				<div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
					<Clock className="h-4 w-4" />
					<span>Expected Q1 2025</span>
				</div>
				<div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto">
					<div className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
						<MessageSquare className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
						<p className="text-xs font-medium text-neutral-900 dark:text-white">
							Real-time Conversation
						</p>
					</div>
					<div className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
						<Brain className="h-6 w-6 text-blue-500 mx-auto mb-2" />
						<p className="text-xs font-medium text-neutral-900 dark:text-white">
							AI Feedback
						</p>
					</div>
					<div className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
						<Target className="h-6 w-6 text-purple-500 mx-auto mb-2" />
						<p className="text-xs font-medium text-neutral-900 dark:text-white">
							Skill Assessment
						</p>
					</div>
				</div>
				<div className="mt-6 flex flex-wrap justify-center gap-3">
					{
						["Technical Interviews", "Behavioral", "System Design", "Coding"].map((type) => (
							<span
								key={type}
								className="px-3 py-1 text-xs rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
							>
								{type}
							</span>
						))
					}
				</div>
			</div>
		</div>
	);
}