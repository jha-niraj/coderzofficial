"use client";

import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { 
	Card, CardContent 
} from "@repo/ui/components/ui/card";

export function ProgressSkeleton() {
	return (
		<div className="space-y-10">
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{
					[...Array(4)].map((_, i) => (
						<Card key={i}>
							<CardContent className="pt-6">
								<Skeleton className="h-10 w-10 rounded-lg mb-3" />
								<Skeleton className="h-8 w-16 mb-2" />
								<Skeleton className="h-4 w-20" />
							</CardContent>
						</Card>
					))
				}
			</div>
			<div>
				<div className="flex items-center gap-2 mb-4">
					<Skeleton className="h-5 w-5 rounded-full" />
					<Skeleton className="h-6 w-28" />
					<Skeleton className="h-5 w-6 rounded-full" />
				</div>
				<div className="grid gap-4">
					{
						[...Array(2)].map((_, i) => (
							<Card key={i}>
								<CardContent className="p-6">
									<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
										<div className="flex-1 space-y-3">
											<div className="flex gap-2">
												<Skeleton className="h-5 w-24 rounded-full" />
												<Skeleton className="h-5 w-20 rounded-full" />
											</div>
											<Skeleton className="h-6 w-3/4" />
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-2 w-full mt-4" />
										</div>
										<Skeleton className="h-10 w-28" />
									</div>
								</CardContent>
							</Card>
						))
					}
				</div>
			</div>
			<div>
				<div className="flex items-center gap-2 mb-4">
					<Skeleton className="h-5 w-5 rounded-full" />
					<Skeleton className="h-6 w-24" />
					<Skeleton className="h-5 w-6 rounded-full" />
				</div>
				<div className="grid gap-4">
					{
						[...Array(3)].map((_, i) => (
							<Card key={i}>
								<CardContent className="p-6">
									<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
										<div className="flex-1 space-y-3">
											<div className="flex gap-2">
												<Skeleton className="h-5 w-24 rounded-full" />
												<Skeleton className="h-5 w-20 rounded-full" />
												<Skeleton className="h-5 w-24 rounded-full" />
											</div>
											<Skeleton className="h-6 w-3/4" />
											<Skeleton className="h-4 w-full" />
										</div>
										<Skeleton className="h-10 w-24" />
									</div>
								</CardContent>
							</Card>
						))
					}
				</div>
			</div>
		</div>
	);
}