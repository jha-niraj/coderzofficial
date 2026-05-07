"use server";

import { db, featureNotifyInterests } from "@repo/db";
import { getSession } from "@repo/auth";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

export type NotifyInterestInput = {
    section: "AI_TOOLS" | "MOCK_VIDEO" | "MOCK_COMPANYWISE" | "MOCK_PEERTOPEER" | "MOCK_CONNECT" | "AI_PORTFOLIO_AUDIT" | "AI_SYSTEM_ARCHITECT" | "AI_PROJECT_SCOPER" | "AI_OSS_SCOUT" | "AI_DOCUSMITH" | "AI_CODE_SENTINEL" | "AI_TEST_FORGE";
    title: string;
    description?: string | null;
};

export async function saveFeatureNotifyInterest(input: NotifyInterestInput) {
    try {
        const session = await getSession(headers());
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in to get notified" };
        }

        const email = session.user.email;
        if (!email) {
            return { success: false, error: "No email found for your account" };
        }

        await db.insert(featureNotifyInterests).values({
            userId: session.user.id,
            email,
            section: input.section,
            title: input.title,
            description: input.description ?? null,
        }).onConflictDoUpdate({
            target: [featureNotifyInterests.userId, featureNotifyInterests.section, featureNotifyInterests.title],
            set: {
                email,
                description: input.description ?? null,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("saveFeatureNotifyInterest:", error);
        return { success: false, error: "Failed to save. Please try again." };
    }
}
