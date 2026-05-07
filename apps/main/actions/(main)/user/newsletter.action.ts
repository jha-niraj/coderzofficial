'use server';

import { z } from "zod";
import { db, newsletters } from "@repo/db";
import { eq } from "drizzle-orm";

const newsletterSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

export async function subscribeToNewsletter(email: string) {
    try {
        // Validate email
        const validatedData = newsletterSchema.parse({ email });

        // Check if email already exists
        const existing = await db.query.newsletters.findFirst({
            where: eq(newsletters.email, validatedData.email),
        });

        if (existing) {
            if (existing.isActive) {
                return {
                    success: false,
                    message: "This email is already subscribed to our newsletter!",
                };
            } else {
                // Reactivate subscription
                await db.update(newsletters).set({
                    isActive: true,
                    subscribedAt: new Date()
                }).where(eq(newsletters.email, validatedData.email));
                return {
                    success: true,
                    message: "Welcome back! Your newsletter subscription has been reactivated.",
                };
            }
        }

        // Create new subscription
        await db.insert(newsletters).values({
            email: validatedData.email,
        });

        return {
            success: true,
            message: "Thank you for subscribing! You'll receive our latest updates.",
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                message: error.message,
            };
        }

        console.error("Newsletter subscription error:", error);
        return {
            success: false,
            message: "Something went wrong. Please try again later.",
        };
    }
}

export async function unsubscribeFromNewsletter(email: string) {
    try {
        const validatedData = newsletterSchema.parse({ email });

        await db.update(newsletters).set({
            isActive: false
        }).where(eq(newsletters.email, validatedData.email));

        return {
            success: true,
            message: "You have been unsubscribed from our newsletter.",
        };
    } catch (error) {
        console.error("Newsletter unsubscribe error:", error);
        return {
            success: false,
            message: "Something went wrong. Please try again later.",
        };
    }
}
