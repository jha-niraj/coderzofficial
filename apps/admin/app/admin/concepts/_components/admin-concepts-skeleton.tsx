"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

export function AdminConceptsSkeleton() {
	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row gap-4">
				<Skeleton className="h-10 flex-1" />
				<Skeleton className="h-10 w-[180px]" />
			</div>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{
					[...Array(4)].map((_, i) => (
						<div key={i} className="p-4 rounded-lg bg-muted/50">
							<Skeleton className="h-8 w-16 mb-2" />
							<Skeleton className="h-4 w-24" />
						</div>
					))
				}
			</div>
			<div className="rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[300px]">Concept</TableHead>
							<TableHead>Author</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Difficulty</TableHead>
							<TableHead className="text-center">Stats</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{
							[...Array(5)].map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<div>
											<Skeleton className="h-5 w-48 mb-1" />
											<Skeleton className="h-3 w-24" />
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Skeleton className="h-6 w-6 rounded-full" />
											<Skeleton className="h-4 w-20" />
										</div>
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-20 rounded-full" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-24 rounded-full" />
									</TableCell>
									<TableCell>
										<div className="flex items-center justify-center gap-4">
											<Skeleton className="h-4 w-8" />
											<Skeleton className="h-4 w-8" />
											<Skeleton className="h-4 w-8" />
											<Skeleton className="h-4 w-8" />
										</div>
									</TableCell>
									<TableCell className="text-right">
										<Skeleton className="h-8 w-8 rounded-md ml-auto" />
									</TableCell>
								</TableRow>
							))
						}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}