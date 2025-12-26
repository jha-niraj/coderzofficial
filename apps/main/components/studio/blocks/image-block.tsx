"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
	Image as ImageIcon, Download, Maximize2, X, Sparkles
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";

interface StudioImageBlockProps {
	media?: {
		id: string;
		url: string;
		prompt?: string | null;
		width?: number | null;
		height?: number | null;
	};
	data?: {
		url: string;
		prompt: string;
	};
}

export default function StudioImageBlock({ media, data }: StudioImageBlockProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);

	const imageUrl = media?.url || data?.url;
	const prompt = media?.prompt || data?.prompt;

	if (!imageUrl) {
		return (
			<div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center bg-neutral-50 dark:bg-neutral-900">
				<ImageIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
				<p className="text-neutral-600 dark:text-neutral-400">
					Image data not found. Try regenerating.
				</p>
			</div>
		);
	}

	const handleDownload = async () => {
		try {
			const response = await fetch(imageUrl);
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `ai-generated-${Date.now()}.png`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Download failed:", error);
		}
	};

	return (
		<>
			<div className="group relative border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-900">
				<div className="relative aspect-[4/3] w-full">
					{
						!isLoaded && (
							<div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
								<motion.div
									className="h-8 w-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
									animate={{ rotate: 360 }}
									transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
								/>
							</div>
						)
					}
					<Image
						src={imageUrl}
						alt={prompt || "AI Generated Image"}
						fill
						className={cn(
							"object-cover transition-opacity duration-300",
							isLoaded ? "opacity-100" : "opacity-0"
						)}
						onLoad={() => setIsLoaded(true)}
					/>
					<div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
						<Button
							variant="secondary"
							size="icon"
							onClick={() => setIsExpanded(true)}
							className="h-10 w-10"
						>
							<Maximize2 className="h-5 w-5" />
						</Button>
						<Button
							variant="secondary"
							size="icon"
							onClick={handleDownload}
							className="h-10 w-10"
						>
							<Download className="h-5 w-5" />
						</Button>
					</div>
				</div>
				{
					prompt && (
						<div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
							<div className="flex items-start gap-2">
								<Sparkles className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
								<p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
									&quot;{prompt}&quot;
								</p>
							</div>
						</div>
					)
				}
			</div>
			{
				isExpanded && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-8"
						onClick={() => setIsExpanded(false)}
					>
						<Button
							variant="ghost"
							size="icon"
							className="absolute top-4 right-4 text-white hover:bg-white/20"
							onClick={() => setIsExpanded(false)}
						>
							<X className="h-6 w-6" />
						</Button>
						<motion.div
							initial={{ scale: 0.9 }}
							animate={{ scale: 1 }}
							className="relative max-w-4xl max-h-[80vh] w-full h-full"
							onClick={(e) => e.stopPropagation()}
						>
							<Image
								src={imageUrl}
								alt={prompt || "AI Generated Image"}
								fill
								className="object-contain"
							/>
						</motion.div>

						{
							prompt && (
								<div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 max-w-2xl">
									<p className="text-white text-center text-sm">&quot;{prompt}&quot;</p>
								</div>
							)
						}
					</motion.div>
				)
			}
		</>
	);
}