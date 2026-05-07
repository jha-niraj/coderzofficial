import { saveFeatureNotifyInterest } from "@/actions/(main)/feature-notify.action";
import { FeatureNotifySection } from "@repo/db";

export type NotifyParams = {
    section: FeatureNotifySection;
    title: string;
    description?: string | null;
};

/**
 * Saves user's interest for a feature and returns success/error.
 * Use with toast: on success show "You'll receive an email at launch!"
 */
export async function notifyFeatureInterest(params: NotifyParams) {
    return saveFeatureNotifyInterest(params);
}