import { create } from 'zustand';
import { FeedbackCategory, FeedbackStatus } from '@prisma/client';
import toast from '@repo/ui/components/ui/sonner';
import { 
    getFeedbackByStatus, submitFeedback, upvoteFeedback, updateFeedbackStatus, assignReward 
} from '@/actions/(main)/user/feedback.action';

interface FeedbackItem {
    id: string;
    title: string;
    description: string;
    category: FeedbackCategory;
    status: FeedbackStatus;
    createdAt: Date;
    upvotes: number;
    imageUrl?: string | null;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };
    rewards?: {
        id: string;
        type: string;
        credits: number | null;
        xp: number | null;
        description: string;
    } | null;
}

interface FeedbackState {
    feedbackByStatus: Record<string, FeedbackItem[]>;
    loading: Record<string, boolean>;
    fetchFeedback: (status: FeedbackStatus) => Promise<void>;
    submitFeedback: (data: { title: string; description: string; category: FeedbackCategory; imageUrl?: string }) => Promise<void>;
    upvoteFeedback: (id: string) => Promise<void>;
    updateFeedbackStatus: (id: string, newStatus: FeedbackStatus) => Promise<void>;
    assignReward: (
        feedbackId: string,
        reward: { type: string; credits: number; xp: number; description: string }
    ) => Promise<void>;
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
    feedbackByStatus: {
        'under-review': [],
        planned: [],
        completed: [],
    },
    loading: {
        'under-review': false,
        planned: false,
        completed: false,
    },

    fetchFeedback: async (status: FeedbackStatus) => {
        const statusKey = status === FeedbackStatus.UNDER_REVIEW ? 'under-review' : status.toLowerCase();
        set((state) => ({
            loading: { ...state.loading, [statusKey]: true },
        }));

        try {
            const data = await getFeedbackByStatus(status);
            set((state) => ({
                feedbackByStatus: { ...state.feedbackByStatus, [statusKey]: data },
                loading: { ...state.loading, [statusKey]: false },
            }));
        } catch (error) {
            console.error('Error fetching feedback:', error);
            toast.error('Failed to load feedback items');
            set((state) => ({
                loading: { ...state.loading, [statusKey]: false },
            }));
        }
    },

    submitFeedback: async (data: { title: string; description: string; category: FeedbackCategory; imageUrl?: string }) => {
        try {
            const response = await submitFeedback(data);
            if (!response) {
                toast.error('Failed to submit the feedback');
                return;
            }

            toast.success('Feedback submitted', {
                description: 'Your feedback has been submitted successfully. You earned 25 XP!',
            });

            await get().fetchFeedback(FeedbackStatus.UNDER_REVIEW);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error('Error', {
                description: 'There was an error submitting your feedback.',
            });
            throw error;
        }
    },

    upvoteFeedback: async (id: string) => {
        try {
            await upvoteFeedback(id);
            set((state) => ({
                feedbackByStatus: Object.fromEntries(
                    Object.entries(state.feedbackByStatus).map(([status, items]) => [
                        status,
                        items.map((item) =>
                            item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item
                        ),
                    ])
                ),
            }));
            toast.success('Upvoted', {
                description: 'Your vote has been counted.',
            });
        } catch (error) {
            console.error('Error upvoting:', error);
            toast.error('Failed to upvote');
        }
    },

    updateFeedbackStatus: async (id: string, newStatus: FeedbackStatus) => {
        try {
            await updateFeedbackStatus(id, newStatus);
            const oldStatusKey = Object.keys(get().feedbackByStatus).find((key) =>
                get().feedbackByStatus[key].some((item) => item.id === id)
            );
            if (oldStatusKey) {
                set((state) => ({
                    feedbackByStatus: {
                        ...state.feedbackByStatus,
                        [oldStatusKey]: state.feedbackByStatus[oldStatusKey].filter(
                            (item) => item.id !== id
                        ),
                    },
                }));
            }
            await get().fetchFeedback(newStatus);
            toast.success('Status updated', {
                description: `Feedback has been moved to ${newStatus
                    .replace('_', ' ')
                    .toLowerCase()}.`,
            });
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    },

    assignReward: async (
        feedbackId: string,
        reward: { type: string; credits: number; xp: number; description: string }
    ) => {
        try {
            await assignReward(feedbackId, reward);
            set((state) => ({
                feedbackByStatus: Object.fromEntries(
                    Object.entries(state.feedbackByStatus).map(([status, items]) => [
                        status,
                        items.map((item) =>
                            item.id === feedbackId
                                ? {
                                    ...item,
                                    rewards: {
                                        id: 'temp-id',
                                        type: reward.type,
                                        credits: reward.type === 'credits' ? reward.credits : null,
                                        xp: reward.type === 'xp' ? reward.xp : null,
                                        description: reward.description,
                                    },
                                }
                                : item
                        ),
                    ])
                ),
            }));
            toast.success('Reward assigned', {
                description: `A reward has been assigned.`,
            });
        } catch (error) {
            console.error('Error assigning reward:', error);
            toast.error('Failed to assign reward');
        }
    },
}));