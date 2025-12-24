"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
	Card, CardContent
} from "@repo/ui/components/ui/card";

export function BookmarksSkeleton() {
	return (
		<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{
				[...Array(6)].map((_, i) => (
					<Card key={i} className="h-full">
						<CardContent className="p-6 flex flex-col h-full">
							<div className="flex items-center gap-2 mb-4">
								<Skeleton className="h-5 w-28 rounded-full" />
								<Skeleton className="h-5 w-20 rounded-full" />
							</div>
							<div className="flex-1 space-y-2 mb-4">
								<Skeleton className="h-6 w-4/5" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
							</div>
							<div className="flex items-center gap-4 mb-4">
								<Skeleton className="h-4 w-16" />
								<Skeleton className="h-4 w-12" />
								<Skeleton className="h-4 w-12" />
								<Skeleton className="h-4 w-14" />
							</div>
							<div className="flex items-center gap-2">
								<Skeleton className="h-10 flex-1" />
								<Skeleton className="h-10 w-10" />
							</div>
						</CardContent>
					</Card>
				))
			}
		</div>
	);
}