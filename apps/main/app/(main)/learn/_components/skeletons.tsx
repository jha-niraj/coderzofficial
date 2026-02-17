import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
    Card, CardContent, CardFooter
} from "@repo/ui/components/ui/card";

export function LearnsHeroSkeleton() {
    return (
        <div className="border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950">
            <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
                <div className="text-center max-w-3xl mx-auto">
                    <Skeleton className="h-8 w-40 mx-auto mb-6 rounded-full" />
                    <Skeleton className="h-12 w-96 mx-auto mb-4" />
                    <Skeleton className="h-6 w-[500px] max-w-full mx-auto mb-8" />
                    <Skeleton className="h-14 max-w-xl mx-auto mb-8 rounded-xl" />
                    <div className="flex items-center justify-center gap-4 mb-12">
                        <Skeleton className="h-12 w-40 rounded-xl" />
                        <Skeleton className="h-12 w-32 rounded-xl" />
                    </div>
                    <div className="flex items-center justify-center gap-8">
                        <div className="text-center">
                            <Skeleton className="h-8 w-12 mx-auto mb-1" />
                            <Skeleton className="h-4 w-16 mx-auto" />
                        </div>
                        <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700" />
                        <div className="text-center">
                            <Skeleton className="h-8 w-12 mx-auto mb-1" />
                            <Skeleton className="h-4 w-24 mx-auto" />
                        </div>
                        <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700" />
                        <div className="text-center">
                            <Skeleton className="h-8 w-12 mx-auto mb-1" />
                            <Skeleton className="h-4 w-20 mx-auto" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CategoriesGridSkeleton() {
    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </div>
                <Skeleton className="h-4 w-20" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {
                    Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-xl" />
                    ))
                }
            </div>
        </section>
    );
}

export function TrendingLearnsSkeleton() {
    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-48 mt-2" />
                </div>
                <Skeleton className="h-4 w-20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-40 w-full" />
                            <CardContent className="p-5">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-full mb-1" />
                                <Skeleton className="h-4 w-2/3 mb-4" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                            </CardContent>
                            <CardFooter className="px-5 py-3 bg-neutral-50 dark:bg-neutral-900/50 border-t">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="w-6 h-6 rounded-full" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </CardFooter>
                        </Card>
                    ))
                }
            </div>
        </section>
    );
}

export function ContinueLearningSkeleton() {
    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-40 mt-2" />
                </div>
                <Skeleton className="h-4 w-28" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <Skeleton className="w-16 h-16 rounded-xl" />
                                    <div className="flex-1">
                                        <div className="flex gap-2 mb-2">
                                            <Skeleton className="h-5 w-24" />
                                            <Skeleton className="h-5 w-16" />
                                        </div>
                                        <Skeleton className="h-5 w-3/4 mb-3" />
                                        <Skeleton className="h-2 w-full mb-2" />
                                        <div className="flex justify-between">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-7 w-24" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                }
            </div>
        </section>
    );
}

export function RecentLearnsSkeleton() {
    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Skeleton className="h-8 w-44" />
                    <Skeleton className="h-4 w-40 mt-2" />
                </div>
                <Skeleton className="h-4 w-20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {
                    Array.from({ length: 8 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3 mb-3">
                                    <Skeleton className="w-12 h-12 rounded-lg" />
                                    <Skeleton className="h-5 w-full" />
                                </div>
                                <div className="flex gap-2 mb-3">
                                    <Skeleton className="h-5 w-20" />
                                    <Skeleton className="h-5 w-16" />
                                </div>
                                <div className="flex justify-between">
                                    <div className="flex gap-3">
                                        <Skeleton className="h-4 w-8" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                    <Skeleton className="h-4 w-8" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                }
            </div>
        </section>
    );
}