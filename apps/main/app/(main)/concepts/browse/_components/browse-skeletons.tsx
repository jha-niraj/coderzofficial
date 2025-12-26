import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
    Card, CardContent, CardFooter
} from "@repo/ui/components/ui/card";

export function ConceptsGridSkeleton() {
    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {
                    Array.from({ length: 9 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-36 w-full" />
                            <CardContent className="p-4">
                                <Skeleton className="h-5 w-24 mb-2" />
                                <Skeleton className="h-5 w-3/4 mb-1" />
                                <Skeleton className="h-4 w-full mb-1" />
                                <Skeleton className="h-4 w-2/3 mb-3" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-14" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                            </CardContent>
                            <CardFooter className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900/50 border-t">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="w-5 h-5 rounded-full" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                    <Skeleton className="h-3 w-10" />
                                </div>
                            </CardFooter>
                        </Card>
                    ))
                }
            </div>
        </div>
    );
}