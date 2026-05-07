"use server"

import { db, studios, pathfinderSubGoals } from "@repo/db"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

export async function createStudioForGoal(goalId: string, subGoalId: string, title: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) return { success: false, error: "Unauthorized" }

        const slug = `pathfinder-${subGoalId.slice(0, 8)}-${createId().slice(0, 6)}`

        const [studio] = await db.insert(studios).values({
            userId: session.user.id,
            title,
            slug,
            source: "PATHFINDER",
            sourceId: goalId,
        }).returning()

        await db.update(pathfinderSubGoals)
            .set({ studioId: studio.id })
            .where(eq(pathfinderSubGoals.id, subGoalId))

        return { success: true, studioId: studio.id }
    } catch (error) {
        console.error("createStudioForGoal error:", error)
        return { success: false, error: "Failed to create studio for goal" }
    }
}
