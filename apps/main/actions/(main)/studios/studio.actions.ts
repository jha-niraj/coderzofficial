"use server"

import { db, studios, studioSteps } from "@repo/db"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { eq, and, asc } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { revalidatePath } from "next/cache"

export type StudioWithSteps = typeof studios.$inferSelect & {
    studioSteps: (typeof studioSteps.$inferSelect)[]
}

export async function getStudioWithSteps(studioId: string): Promise<{ success: boolean; studio?: StudioWithSteps; error?: string }> {
    try {
        const studio = await db.query.studios.findFirst({
            where: eq(studios.id, studioId),
            with: { studioSteps: { orderBy: [asc(studioSteps.orderNumber)] } },
        })
        if (!studio) return { success: false, error: "Studio not found" }
        return { success: true, studio: studio as StudioWithSteps }
    } catch (error) {
        console.error("getStudioWithSteps error:", error)
        return { success: false, error: "Failed to fetch studio" }
    }
}

export async function createStudio({ title, source = "MANUAL" }: { title: string; source?: "MANUAL" | "PATHFINDER" | "SPACE" }) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) return { error: "Unauthorized", studio: null }

        const slug = `${title.toLowerCase().replace(/\s+/g, "-")}-${createId().slice(0, 8)}`
        const [studio] = await db.insert(studios).values({
            userId: session.user.id,
            title,
            slug,
            source,
        }).returning()

        return { studio, error: null }
    } catch (error) {
        console.error("createStudio error:", error)
        return { error: "Failed to create studio", studio: null }
    }
}

export async function updateStudioStep(stepId: string, content: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) return { success: false, error: "Unauthorized" }

        const step = await db.query.studioSteps.findFirst({
            where: eq(studioSteps.id, stepId),
            with: { studio: { columns: { userId: true } } },
        })
        if (!step || (step.studio as { userId: string }).userId !== session.user.id) {
            return { success: false, error: "Unauthorized" }
        }

        await db.update(studioSteps).set({ content }).where(eq(studioSteps.id, stepId))
        return { success: true }
    } catch (error) {
        console.error("updateStudioStep error:", error)
        return { success: false, error: "Failed to update step" }
    }
}

export async function saveStep({ studioId, stepId, type, content, metadata, source }: {
    studioId: string;
    stepId: string;
    type: string;
    content: string;
    metadata?: Record<string, unknown>;
    source: "AI" | "USER";
}) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) return { success: false, error: "Unauthorized" }

        const step = await db.query.studioSteps.findFirst({
            where: eq(studioSteps.id, stepId),
            with: { studio: { columns: { userId: true } } },
        })
        if (!step || (step.studio as { userId: string }).userId !== session.user.id) {
            return { success: false, error: "Unauthorized" }
        }

        await db.update(studioSteps)
            .set({ content, metadata: metadata ?? {}, source })
            .where(eq(studioSteps.id, stepId))

        return { success: true }
    } catch (error) {
        console.error("saveStep error:", error)
        return { success: false, error: "Failed to save step" }
    }
}

export async function addStudioStep(studioId: string, data: {
    type: string; content?: string; source: "AI" | "USER"; orderNumber: number
}) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) return { success: false, error: "Unauthorized" }

        const studio = await db.query.studios.findFirst({
            where: and(eq(studios.id, studioId), eq(studios.userId, session.user.id)),
            columns: { id: true },
        })
        if (!studio) return { success: false, error: "Studio not found or unauthorized" }

        const [step] = await db.insert(studioSteps).values({
            studioId,
            ...data,
            metadata: {},
        }).returning()

        await db.update(studios)
            .set({ stepCount: db.$count(studioSteps, eq(studioSteps.studioId, studioId)) as unknown as number })
            .where(eq(studios.id, studioId))

        revalidatePath(`/pathfinder`)
        return { success: true, step }
    } catch (error) {
        console.error("addStudioStep error:", error)
        return { success: false, error: "Failed to add step" }
    }
}
