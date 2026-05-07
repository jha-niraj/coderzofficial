"use server"

import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import {
    db, projectV2FeatureSuggestions, projectsV2, projectV2Tasks, projectV2Sprints,
    userProjectV2Progress, userTaskV2Statuses
} from "@repo/db"
import { eq, and, desc, asc, sql } from "drizzle-orm"
import { uploadImageToCloudinary } from "@/actions/(common)/shared/upload.action"
import { revalidatePath } from "next/cache"
import type { FeatureSuggestionWithUser } from "@/types/projectv2"

export async function createFeatureSuggestion(formData: FormData) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" }
        }

        const projectId = formData.get("projectId") as string
        const title = formData.get("title") as string
        const description = formData.get("description") as string
        const type = formData.get("type") as string
        const tagsString = formData.get("tags") as string
        const imageFile = formData.get("image") as File | null

        if (!projectId || !title || !description) {
            return { success: false, message: "Missing required fields" }
        }

        if (title.length < 5 || title.length > 100) {
            return { success: false, message: "Title must be between 5 and 100 characters" }
        }

        if (description.length < 20 || description.length > 1000) {
            return { success: false, message: "Description must be between 20 and 1000 characters" }
        }

        // Get the project and check enrollment
        const project = await db.query.projectsV2.findFirst({
            where: eq(projectsV2.id, projectId),
            with: {
                userProgress: {
                    where: (progress: any, { eq }: any) => eq(progress.userId, session.user.id),
                    columns: { id: true }
                }
            }
        })

        if (!project) {
            return { success: false, message: "Project not found" }
        }

        const isCreator = project.createdBy === session.user.id
        const isEnrolled = project.userProgress.length > 0

        let suggestedBy: "CREATOR" | "ENROLLED_USER" | "VISITOR"
        if (isCreator) {
            suggestedBy = "CREATOR"
        } else if (isEnrolled) {
            suggestedBy = "ENROLLED_USER"
        } else {
            suggestedBy = "VISITOR"
        }

        const tags = tagsString ? tagsString.split(",").map(tag => tag.trim()).filter(Boolean) : []

        let imageUrl: string | null = null
        if (imageFile && imageFile.size > 0) {
            const imageFormData = new FormData()
            imageFormData.append("file", imageFile)
            const uploadResult = await uploadImageToCloudinary(imageFormData)

            if (uploadResult.success && uploadResult.url) {
                imageUrl = uploadResult.url
            }
        }

        if (isCreator || isEnrolled) {
            let userProgress = await db.query.userProjectV2Progress.findFirst({
                where: and(
                    eq(userProjectV2Progress.userId, session.user.id),
                    eq(userProjectV2Progress.projectId, projectId)
                )
            })

            if (!userProgress && isCreator) {
                const [taskCount] = await db
                    .select({ count: sql<number>`count(*)` })
                    .from(projectV2Tasks)
                    .where(
                        sql`${projectV2Tasks.sprintId} IN (
                            SELECT id FROM "ProjectV2Sprint" WHERE "projectId" = ${projectId}
                        )`
                    )

                const [created] = await db
                    .insert(userProjectV2Progress)
                    .values({
                        userId: session.user.id,
                        projectId,
                        status: "IN_PROGRESS",
                        totalTasks: Number(taskCount?.count ?? 0),
                        startedAt: new Date()
                    })
                    .returning()

                userProgress = created
            }

            if (!userProgress) {
                return { success: false, message: "Could not find or create progress record" }
            }

            // Find a sprint to add the task to
            const firstSprint = await db.query.projectV2Sprints.findFirst({
                where: eq(projectV2Sprints.projectId, projectId),
                orderBy: [asc(projectV2Sprints.orderIndex)]
            })

            let sprintId = firstSprint?.id
            if (!sprintId) {
                const [newSprint] = await db
                    .insert(projectV2Sprints)
                    .values({
                        projectId,
                        name: "General",
                        sprintNumber: 1,
                        duration: "2 weeks",
                        goal: "General tasks",
                        orderIndex: 0
                    })
                    .returning()
                if (!newSprint) throw new Error("Failed to create sprint")
                sprintId = newSprint.id
            }

            const [taskCount] = await db
                .select({ count: sql<number>`count(*)` })
                .from(projectV2Tasks)
                .where(
                    sql`${projectV2Tasks.sprintId} IN (
                        SELECT id FROM "ProjectV2Sprint" WHERE "projectId" = ${projectId}
                    )`
                )

            const [task] = await db
                .insert(projectV2Tasks)
                .values({
                    sprintId,
                    title,
                    description: [
                        description,
                        "Implement this feature according to the requirements",
                        "Test the implementation thoroughly"
                    ],
                    criteria: [
                        "Feature implemented as described",
                        "Code follows project standards",
                        "Properly tested and working"
                    ],
                    hints: tags.length > 0 ? tags.map(tag => `Consider the ${tag} aspect`) : ["Review the requirements carefully"],
                    badges: [type],
                    tags,
                    difficulty: "INTERMEDIATE",
                    orderIndex: Number(taskCount?.count ?? 0)
                })
                .returning()

            if (!task) throw new Error("Failed to create task")

            await db.insert(userTaskV2Statuses).values({
                userId: session.user.id,
                projectId,
                taskId: task.id,
                status: "TO_DO",
                progressId: userProgress.id
            })

            await db
                .update(userProjectV2Progress)
                .set({ totalTasks: sql`${userProjectV2Progress.totalTasks} + 1` })
                .where(eq(userProjectV2Progress.id, userProgress.id))

            const [suggestion] = await db
                .insert(projectV2FeatureSuggestions)
                .values({
                    userId: session.user.id,
                    projectId,
                    title,
                    description,
                    type: type as any,
                    tags,
                    imageUrl,
                    status: isCreator ? "APPROVED" : "PENDING",
                    addedToTasks: true,
                    taskId: task.id,
                    suggestedBy,
                    addedByUsers: [session.user.id]
                })
                .returning()

            revalidatePath(`/projects/${project.slug}`)
            revalidatePath(`/projects/${project.slug}/tasks`)

            return {
                success: true,
                message: isCreator
                    ? "Task added successfully! It's now available for all enrolled users as a suggestion."
                    : "Task added to your list! Other enrolled users can adopt it from suggestions.",
                data: suggestion
            }
        } else {
            const [suggestion] = await db
                .insert(projectV2FeatureSuggestions)
                .values({
                    userId: session.user.id,
                    projectId,
                    title,
                    description,
                    type: type as any,
                    tags,
                    imageUrl,
                    status: "PENDING",
                    suggestedBy
                })
                .returning()

            revalidatePath(`/projects/${project.slug}`)

            return {
                success: true,
                message: "Feature suggestion submitted successfully!",
                data: suggestion
            }
        }
    } catch (error) {
        console.error("Error creating feature suggestion:", error)
        return {
            success: false,
            message: "Failed to submit suggestion. Please try again."
        }
    }
}

export async function getFeatureSuggestions(projectId: string) {
    try {
        const session = await getSession(headers())

        const suggestions = await db.query.projectV2FeatureSuggestions.findMany({
            where: eq(projectV2FeatureSuggestions.projectId, projectId),
            orderBy: [desc(projectV2FeatureSuggestions.createdAt)],
            with: {
                user: {
                    columns: { id: true, name: true, image: true }
                }
            }
        })

        let userTaskIds: string[] = []
        if (session?.user?.id) {
            const userTasks = await db
                .select({ taskId: userTaskV2Statuses.taskId })
                .from(userTaskV2Statuses)
                .where(
                    and(
                        eq(userTaskV2Statuses.userId, session.user.id),
                        eq(userTaskV2Statuses.projectId, projectId)
                    )
                )
            userTaskIds = userTasks.map((t: { taskId: string }) => t.taskId)
        }

        const suggestionsWithTasks: FeatureSuggestionWithUser[] = await Promise.all(
            suggestions.map(async (s: any): Promise<FeatureSuggestionWithUser> => {
                let task = null
                if (s.taskId) {
                    task = await db.query.projectV2Tasks.findFirst({
                        where: eq(projectV2Tasks.id, s.taskId),
                        columns: { id: true, title: true }
                    })
                }
                return {
                    ...s,
                    task,
                    adoptedByCurrentUser: s.taskId ? userTaskIds.includes(s.taskId) : false
                }
            })
        )

        return { success: true, data: suggestionsWithTasks }
    } catch (error) {
        console.error("Error fetching feature suggestions:", error)
        return { success: false, data: [] }
    }
}

export async function adoptSuggestionToMyTasks(suggestionId: string, projectSlug: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" }
        }

        const [suggestion] = await db
            .select()
            .from(projectV2FeatureSuggestions)
            .where(eq(projectV2FeatureSuggestions.id, suggestionId))
            .limit(1)

        if (!suggestion) {
            return { success: false, message: "Suggestion not found" }
        }

        if (!suggestion.taskId) {
            return { success: false, message: "This suggestion hasn't been converted to a task yet" }
        }

        const [project] = await db
            .select({ id: projectsV2.id, createdBy: projectsV2.createdBy })
            .from(projectsV2)
            .where(eq(projectsV2.id, suggestion.projectId))
            .limit(1)

        if (!project) {
            return { success: false, message: "Project not found" }
        }

        const enrollment = await db.query.userProjectV2Progress.findFirst({
            where: and(
                eq(userProjectV2Progress.userId, session.user.id),
                eq(userProjectV2Progress.projectId, project.id)
            )
        })

        if (!enrollment && project.createdBy !== session.user.id) {
            return { success: false, message: "You must be enrolled in this project to adopt suggestions" }
        }

        if (!enrollment) {
            return { success: false, message: "Progress record not found" }
        }

        const [existingTask] = await db
            .select({ id: userTaskV2Statuses.id })
            .from(userTaskV2Statuses)
            .where(
                and(
                    eq(userTaskV2Statuses.userId, session.user.id),
                    eq(userTaskV2Statuses.taskId, suggestion.taskId),
                    eq(userTaskV2Statuses.projectId, project.id)
                )
            )
            .limit(1)

        if (existingTask) {
            return { success: false, message: "You've already added this task to your list" }
        }

        await db.insert(userTaskV2Statuses).values({
            userId: session.user.id,
            projectId: project.id,
            taskId: suggestion.taskId,
            status: "TO_DO",
            progressId: enrollment.id
        })

        await db
            .update(userProjectV2Progress)
            .set({ totalTasks: sql`${userProjectV2Progress.totalTasks} + 1` })
            .where(eq(userProjectV2Progress.id, enrollment.id))

        await db
            .update(projectV2FeatureSuggestions)
            .set({
                addedByUsers: [...suggestion.addedByUsers, session.user.id]
            })
            .where(eq(projectV2FeatureSuggestions.id, suggestionId))

        revalidatePath(`/projects/${projectSlug}`)
        revalidatePath(`/projects/${projectSlug}/tasks`)

        return { success: true, message: "Task added to your list successfully!" }
    } catch (error) {
        console.error("Error adopting suggestion to tasks:", error)
        return { success: false, message: "Failed to add task. Please try again." }
    }
}

export async function adoptVisitorSuggestionToTasks(suggestionId: string, projectSlug: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" }
        }

        const [suggestion] = await db
            .select()
            .from(projectV2FeatureSuggestions)
            .where(eq(projectV2FeatureSuggestions.id, suggestionId))
            .limit(1)

        if (!suggestion) {
            return { success: false, message: "Suggestion not found" }
        }

        if (suggestion.suggestedBy !== "VISITOR") {
            return { success: false, message: "This is not a visitor suggestion" }
        }

        const [project] = await db
            .select({ id: projectsV2.id, createdBy: projectsV2.createdBy, slug: projectsV2.slug })
            .from(projectsV2)
            .where(eq(projectsV2.id, suggestion.projectId))
            .limit(1)

        if (!project) {
            return { success: false, message: "Project not found" }
        }

        const enrollment = await db.query.userProjectV2Progress.findFirst({
            where: and(
                eq(userProjectV2Progress.userId, session.user.id),
                eq(userProjectV2Progress.projectId, project.id)
            )
        })

        const isCreator = project.createdBy === session.user.id

        if (!enrollment && !isCreator) {
            return { success: false, message: "You must be enrolled in this project to add this suggestion" }
        }

        if (!enrollment) {
            return { success: false, message: "Progress record not found" }
        }

        let task
        if (suggestion.taskId) {
            const [existingTask] = await db
                .select({ id: userTaskV2Statuses.id })
                .from(userTaskV2Statuses)
                .where(
                    and(
                        eq(userTaskV2Statuses.userId, session.user.id),
                        eq(userTaskV2Statuses.taskId, suggestion.taskId),
                        eq(userTaskV2Statuses.projectId, project.id)
                    )
                )
                .limit(1)

            if (existingTask) {
                return { success: false, message: "You've already added this task to your list" }
            }

            task = await db.query.projectV2Tasks.findFirst({
                where: eq(projectV2Tasks.id, suggestion.taskId)
            })
        } else {
            const firstSprint = await db.query.projectV2Sprints.findFirst({
                where: eq(projectV2Sprints.projectId, project.id),
                orderBy: [asc(projectV2Sprints.orderIndex)]
            })

            let sprintId = firstSprint?.id
            if (!sprintId) {
                const [newSprint] = await db
                    .insert(projectV2Sprints)
                    .values({
                        projectId: project.id,
                        name: "General",
                        sprintNumber: 1,
                        duration: "2 weeks",
                        goal: "General tasks",
                        orderIndex: 0
                    })
                    .returning()
                if (!newSprint) throw new Error("Failed to create sprint")
                sprintId = newSprint.id
            }

            const [taskCount] = await db
                .select({ count: sql<number>`count(*)` })
                .from(projectV2Tasks)
                .where(
                    sql`${projectV2Tasks.sprintId} IN (
                        SELECT id FROM "ProjectV2Sprint" WHERE "projectId" = ${project.id}
                    )`
                )

            const [newTask] = await db
                .insert(projectV2Tasks)
                .values({
                    sprintId,
                    title: suggestion.title,
                    description: [
                        suggestion.description,
                        "Implement this feature according to the requirements",
                        "Test the implementation thoroughly"
                    ],
                    criteria: [
                        "Feature implemented as suggested",
                        "Code follows project standards",
                        "Properly tested and working"
                    ],
                    hints: suggestion.tags.length > 0
                        ? suggestion.tags.map((tag: string) => `Consider the ${tag} aspect`)
                        : ["Review the suggestion details carefully"],
                    badges: [suggestion.type],
                    tags: suggestion.tags,
                    difficulty: "INTERMEDIATE",
                    orderIndex: Number(taskCount?.count ?? 0)
                })
                .returning()

            if (!newTask) throw new Error("Failed to create task")
            task = newTask

            await db
                .update(projectV2FeatureSuggestions)
                .set({ taskId: task.id, addedToTasks: true })
                .where(eq(projectV2FeatureSuggestions.id, suggestionId))
        }

        if (!task) {
            return { success: false, message: "Failed to create or find task" }
        }

        await db.insert(userTaskV2Statuses).values({
            userId: session.user.id,
            projectId: project.id,
            taskId: task.id,
            status: "TO_DO",
            progressId: enrollment.id
        })

        await db
            .update(userProjectV2Progress)
            .set({ totalTasks: sql`${userProjectV2Progress.totalTasks} + 1` })
            .where(eq(userProjectV2Progress.id, enrollment.id))

        await db
            .update(projectV2FeatureSuggestions)
            .set({ addedByUsers: [...suggestion.addedByUsers, session.user.id] })
            .where(eq(projectV2FeatureSuggestions.id, suggestionId))

        revalidatePath(`/projects/${project.slug}`)
        revalidatePath(`/projects/${project.slug}/tasks`)

        return { success: true, message: "Task added to your list successfully!" }
    } catch (error) {
        console.error("Error adopting visitor suggestion to tasks:", error)
        return { success: false, message: "Failed to add task. Please try again." }
    }
}

export async function addSuggestionToTasks(suggestionId: string, projectSlug: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" }
        }

        const suggestion = await db.query.projectV2FeatureSuggestions.findFirst({
            where: eq(projectV2FeatureSuggestions.id, suggestionId),
            with: {
                project: {
                    columns: { id: true, createdBy: true, slug: true }
                }
            }
        })

        if (!suggestion) {
            return { success: false, message: "Suggestion not found" }
        }

        if (suggestion.project.createdBy !== session.user.id) {
            return { success: false, message: "Only project creators can add visitor suggestions to tasks" }
        }

        if (suggestion.addedToTasks) {
            return { success: false, message: "This suggestion has already been added to tasks" }
        }

        const firstSprint = await db.query.projectV2Sprints.findFirst({
            where: eq(projectV2Sprints.projectId, suggestion.project.id),
            orderBy: [asc(projectV2Sprints.orderIndex)]
        })

        let sprintId = firstSprint?.id
        if (!sprintId) {
            const [newSprint] = await db
                .insert(projectV2Sprints)
                .values({
                    projectId: suggestion.project.id,
                    name: "General",
                    sprintNumber: 1,
                    duration: "2 weeks",
                    goal: "General tasks",
                    orderIndex: 0
                })
                .returning()
            if (!newSprint) throw new Error("Failed to create sprint")
            sprintId = newSprint.id
        }

        const [taskCount] = await db
            .select({ count: sql<number>`count(*)` })
            .from(projectV2Tasks)
            .where(
                sql`${projectV2Tasks.sprintId} IN (
                    SELECT id FROM "ProjectV2Sprint" WHERE "projectId" = ${suggestion.project.id}
                )`
            )

        const [task] = await db
            .insert(projectV2Tasks)
            .values({
                sprintId,
                title: suggestion.title,
                description: [
                    suggestion.description,
                    "Implement the feature according to the requirements",
                    "Test the implementation thoroughly"
                ],
                criteria: [
                    "Feature implemented as suggested",
                    "Code follows project standards",
                    "Properly tested and working"
                ],
                hints: suggestion.tags.length > 0
                    ? suggestion.tags.map((tag: string) => `Consider the ${tag} aspect`)
                    : ["Review the suggestion details carefully", "Consider the user's use case"],
                badges: [suggestion.type],
                tags: suggestion.tags,
                difficulty: "INTERMEDIATE",
                orderIndex: Number(taskCount?.count ?? 0)
            })
            .returning()

        if (!task) throw new Error("Failed to create task")

        let creatorProgress = await db.query.userProjectV2Progress.findFirst({
            where: and(
                eq(userProjectV2Progress.userId, session.user.id),
                eq(userProjectV2Progress.projectId, suggestion.project.id)
            )
        })

        if (!creatorProgress) {
            const [totalTasks] = await db
                .select({ count: sql<number>`count(*)` })
                .from(projectV2Tasks)
                .where(
                    sql`${projectV2Tasks.sprintId} IN (
                        SELECT id FROM "ProjectV2Sprint" WHERE "projectId" = ${suggestion.project.id}
                    )`
                )

            const [created] = await db
                .insert(userProjectV2Progress)
                .values({
                    userId: session.user.id,
                    projectId: suggestion.project.id,
                    status: "IN_PROGRESS",
                    totalTasks: Number(totalTasks?.count ?? 0),
                    startedAt: new Date()
                })
                .returning()

            if (!created) throw new Error("Failed to create progress record")
            creatorProgress = created
        }

        await db.insert(userTaskV2Statuses).values({
            userId: session.user.id,
            projectId: suggestion.project.id,
            taskId: task.id,
            status: "TO_DO",
            progressId: creatorProgress.id
        })

        await db
            .update(projectV2FeatureSuggestions)
            .set({
                addedToTasks: true,
                taskId: task.id,
                status: "APPROVED",
                addedByUsers: [session.user.id]
            })
            .where(eq(projectV2FeatureSuggestions.id, suggestionId))

        revalidatePath(`/projects/${suggestion.project.slug}`)
        revalidatePath(`/projects/${suggestion.project.slug}/tasks`)

        return {
            success: true,
            message: "Successfully added to tasks! It's now available for all enrolled users.",
            taskId: task.id
        }
    } catch (error) {
        console.error("Error adding suggestion to tasks:", error)
        return { success: false, message: "Failed to add to tasks. Please try again." }
    }
}

export async function updateSuggestionStatus(suggestionId: string, status: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" }
        }

        const suggestion = await db.query.projectV2FeatureSuggestions.findFirst({
            where: eq(projectV2FeatureSuggestions.id, suggestionId),
            with: {
                project: {
                    columns: { createdBy: true, slug: true }
                }
            }
        })

        if (!suggestion) {
            return { success: false, message: "Suggestion not found" }
        }

        if (suggestion.project.createdBy !== session.user.id) {
            return {
                success: false,
                message: "Only project creators can update suggestion status"
            }
        }

        await db
            .update(projectV2FeatureSuggestions)
            .set({ status: status as any })
            .where(eq(projectV2FeatureSuggestions.id, suggestionId))

        revalidatePath(`/projects/${suggestion.project.slug}`)

        return { success: true, message: "Status updated successfully" }
    } catch (error) {
        console.error("Error updating suggestion status:", error)
        return { success: false, message: "Failed to update status. Please try again." }
    }
}
