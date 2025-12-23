"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
	Plus, BookOpen, Settings
} from "lucide-react";
import Link from "next/link";

export function AdminConceptsHeader() {
	return (
		<div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-blue-500/10 py-12 mb-8">
			<div className="container max-w-7xl mx-auto px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
				>
					<div>
						<div className="flex items-center gap-3 mb-2">
							<div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
								<Settings className="h-5 w-5 text-primary" />
							</div>
							<h1 className="text-2xl md:text-3xl font-bold">Manage Concepts</h1>
						</div>
						<p className="text-muted-foreground">
							Create, edit, and manage all learning concepts on the platform.
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button asChild variant="outline">
							<Link href="/concepts">
								<BookOpen className="mr-2 h-4 w-4" />
								View Public
							</Link>
						</Button>
						<Button asChild>
							<Link href="/concepts/create">
								<Plus className="mr-2 h-4 w-4" />
								Create Concept
							</Link>
						</Button>
					</div>
				</motion.div>
			</div>
		</div>
	);
}