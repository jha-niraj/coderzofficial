"use client";

export default function PublicChatSkeleton() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-200 dark:border-neutral-800">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-neutral-800 animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-6 w-32 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse" />
                                <div className="h-4 w-48 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-b border-slate-200 dark:border-neutral-800">
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse" />
                            <div className="flex flex-wrap gap-2">
                                {
                                    [1, 2, 3].map((i) => (
                                        <div key={i} className="h-8 w-40 bg-slate-200 dark:bg-neutral-800 rounded-full animate-pulse" />
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                    <div className="h-80 p-6 bg-slate-50 dark:bg-neutral-900">
                        <div className="flex items-center justify-center h-full">
                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-neutral-800 animate-pulse" />
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-200 dark:border-neutral-800">
                        <div className="flex gap-3">
                            <div className="flex-1 h-12 bg-slate-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
                            <div className="w-12 h-12 bg-slate-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}