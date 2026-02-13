"use server";

import prisma from "@repo/prisma";
import { auth } from "@repo/auth";
import { FeatureNotifySection } from "@repo/prisma";

export type NotifyInterestInput = {
    section: FeatureNotifySection;
    title: string;
    description?: string | null;
};

export async function saveFeatureNotifyInterest(input: NotifyInterestInput) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in to get notified" };
        }

        const email = session.user.email;
        if (!email) {
            return { success: false, error: "No email found for your account" };
        }

        await prisma.featureNotifyInterest.upsert({
            where: {
                userId_section_title: {
                    userId: session.user.id,
                    section: input.section,
                    title: input.title,
                },
            },
            create: {
                userId: session.user.id,
                email,
                section: input.section,
                title: input.title,
                description: input.description ?? null,
            },
            update: {
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
