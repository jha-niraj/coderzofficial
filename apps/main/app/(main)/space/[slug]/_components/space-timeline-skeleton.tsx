import { Card, CardContent, CardHeader } from '@repo/ui/components/ui/card';

export default function SpaceTimelineSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-2" />
                <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
                {
                    [1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-6 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                                        <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                                        <div className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-10 w-full bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                            </CardContent>
                        </Card>
                    ))
                }
            </div>
        </div>
    );
}