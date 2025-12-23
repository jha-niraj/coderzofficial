export default function StudioListSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{
				[...Array(6)].map((_, i) => (
					<div
						key={i}
						className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 animate-pulse"
					>
						<div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded mb-3" />
						<div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
						<div className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded mb-4" />
						<div className="flex gap-2">
							<div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
							<div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
						</div>
					</div>
				))
			}
		</div>
	);
}