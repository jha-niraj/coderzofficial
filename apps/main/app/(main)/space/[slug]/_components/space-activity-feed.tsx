import {
    Card, CardContent, CardHeader, CardTitle
} from '@repo/ui/components/ui/card';
import { getSpaceActivities } from '@/actions/(main)/space/activity.action';
import {
    CheckCircle2, Users, Plus, GitBranch
} from 'lucide-react';
import { SpaceActivityType } from '@repo/prisma/client';

function formatDistanceToNow(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

interface SpaceActivityFeedProps {
    spaceId: string;
}

const activityIcons: Record<string, typeof CheckCircle2> = {
    STEP_COMPLETED: CheckCircle2,
    BRANCH_CREATED: GitBranch,
    CONTENT_ADDED: Plus,
    MEMBER_JOINED: Users,
    COMMENT_ADDED: CheckCircle2,
    LIKE_ADDED: CheckCircle2,
};

export default async function SpaceActivityFeed({ spaceId }: SpaceActivityFeedProps) {
    const result = await getSpaceActivities(spaceId, 1, 20);

    if (!result.success || !result.data) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Activity Feed</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Failed to load activities
                    </p>
                </CardContent>
            </Card>
        );
    }

    const activities = result.data.activities;

    return (
        <div>
            <div>
                <CardTitle className="text-lg">Activity Feed</CardTitle>
            </div>
            <div>
                {
                    activities.length === 0 ? (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            No recent activity
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {
                                activities.map((activity) => {
                                    const Icon = activityIcons[activity.type] || CheckCircle2;
                                    const userName = activity.user.name || activity.user.username || 'Unknown';

                                    let message = '';
                                    switch (activity.type) {
                                        case SpaceActivityType.STEP_COMPLETED:
                                            message = `${userName} completed a step`;
                                            break;
                                        case SpaceActivityType.BRANCH_CREATED:
                                            message = `${userName} created a branch`;
                                            break;
                                        case SpaceActivityType.CONTENT_ADDED:
                                            message = `${userName} added content`;
                                            break;
                                        case SpaceActivityType.MEMBER_JOINED:
                                            message = `${userName} joined the space`;
                                            break;
                                        default:
                                            message = `${userName} performed an action`;
                                    }

                                    return (
                                        <div key={activity.id} className="flex items-start gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800">
                                                <Icon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-neutral-900 dark:text-white">
                                                    {message}
                                                </p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                                                    {formatDistanceToNow(new Date(activity.createdAt))}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    )
                }
            </div>
        </div>
    );
}