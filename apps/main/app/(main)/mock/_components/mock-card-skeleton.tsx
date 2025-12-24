import { 
    Card, CardContent, CardFooter, CardHeader 
} from '@repo/ui/components/ui/card'
import { Skeleton } from '@repo/ui/components/ui/skeleton'

export function MockCardSkeleton() {
    return (
        <Card className="h-full flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <CardHeader className="p-5 pb-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-6 rounded" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </CardHeader>
            
            <CardContent className="px-5 pb-4 flex-1 space-y-3.5">
                <div className="flex flex-wrap gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                
                <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </CardContent>
            
            <CardFooter className="p-5 pt-0">
                <Skeleton className="h-9 w-full" />
            </CardFooter>
        </Card>
    )
}

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                    <Skeleton className="h-10 w-10 rounded-xl mx-auto mb-3" />
                    <Skeleton className="h-8 w-24 mx-auto mb-1" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                </div>
            ))}
        </div>
    )
}


