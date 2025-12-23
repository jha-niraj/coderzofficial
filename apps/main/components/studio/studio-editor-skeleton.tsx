export default function StudioEditorSkeleton() {
	return (
		<div className="flex h-screen bg-white dark:bg-neutral-950">
			<div className="flex-1 flex flex-col overflow-hidden">
				<div className="h-14 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-4 gap-4 animate-pulse">
					<div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-800 rounded" />
					<div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
					<div className="ml-auto flex items-center gap-2">
						<div className="h-8 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
						<div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-800 rounded" />
					</div>
				</div>
				<div className="flex-1 overflow-y-auto p-8">
					<div className="max-w-3xl mx-auto space-y-4 animate-pulse">
						<div className="h-10 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
						<div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
						<div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
						<div className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
						<div className="h-32 w-full bg-neutral-200 dark:bg-neutral-800 rounded mt-8" />
						<div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
						<div className="h-4 w-5/6 bg-neutral-200 dark:bg-neutral-800 rounded" />
					</div>
				</div>
			</div>
			<div className="w-[380px] border-l border-neutral-200 dark:border-neutral-800 flex flex-col animate-pulse">
				<div className="h-14 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-4">
					<div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
				</div>
				<div className="flex-1 p-4">
					<div className="space-y-4">
						{
							[...Array(3)].map((_, i) => (
								<div key={i} className="flex gap-3">
									<div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-800 rounded-full shrink-0" />
									<div className="flex-1 space-y-2">
										<div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
										<div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
									</div>
								</div>
							))
						}
					</div>
				</div>
				<div className="h-16 border-t border-neutral-200 dark:border-neutral-800 p-4">
					<div className="h-10 w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
				</div>
			</div>
		</div>
	);
}