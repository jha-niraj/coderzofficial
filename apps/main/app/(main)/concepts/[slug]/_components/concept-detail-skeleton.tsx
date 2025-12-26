import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
    Card, CardContent, CardHeader
} from "@repo/ui/components/ui/card";

export default function ConceptDetailSkeleton() {
    return (
        <div>
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-9 w-20" />
                            <div className="hidden sm:flex items-center gap-2">
                                <Skeleton className="w-8 h-8 rounded" />
                                <Skeleton className="h-5 w-48" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-2 w-64" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-9 h-9 rounded-lg" />
                            <Skeleton className="w-9 h-9 rounded-lg" />
                            <Skeleton className="w-9 h-9 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex">
                <aside className="hidden lg:block w-72 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 h-[calc(100vh-4rem)]">
                    <div className="p-4">
                        <Skeleton className="h-4 w-16 mb-4" />
                        <div className="space-y-1">
                            {
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 px-3 py-2">
                                        <Skeleton className="w-6 h-6 rounded-full" />
                                        <Skeleton className="h-4 flex-1" />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </aside>
                <main className="flex-1 min-w-0">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="md:hidden mb-4">
                            <div className="flex justify-between mb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-8" />
                            </div>
                            <Skeleton className="h-2 w-full" />
                        </div>
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-neutral-50 dark:bg-neutral-900/50 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-lg" />
                                        <div>
                                            <Skeleton className="h-5 w-20 mb-1" />
                                            <Skeleton className="h-6 w-48" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-5/6" />
                                <Skeleton className="h-5 w-4/5" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-40 w-full rounded-lg mt-4" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-2/3" />
                            </CardContent>
                        </Card>
                        <div className="flex items-center justify-between mt-6">
                            <Skeleton className="h-10 w-28" />
                            <div className="flex items-center gap-1">
                                {
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <Skeleton key={i} className="w-2.5 h-2.5 rounded-full" />
                                    ))
                                }
                            </div>
                            <Skeleton className="h-10 w-24" />
                        </div>
                        <Card className="mt-8">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <Skeleton className="h-6 w-48 mb-4" />
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-4 w-5/6 mb-2" />
                                        <Skeleton className="h-4 w-4/5" />
                                        <div className="flex gap-2 mt-4">
                                            <Skeleton className="h-6 w-16 rounded-full" />
                                            <Skeleton className="h-6 w-20 rounded-full" />
                                            <Skeleton className="h-6 w-14 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <div>
                                            <Skeleton className="h-4 w-24 mb-1" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 mt-6 pt-6 border-t">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-6 w-20 rounded" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}