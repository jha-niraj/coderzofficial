"use server"

import { auth } from "@repo/auth"
import prisma from "@repo/prisma"
import { uploadImageToCloudinary } from "@/actions/(common)/shared/upload.action"
import { revalidatePath } from "next/cache"
import type {
    FeatureSuggestionWithUser
} from "@/types/projectv2"
import type { FeatureSuggestionType } from "@repo/prisma/client"

export async function createFeatureSuggestion(formData: FormData) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" }
        }

        const projectId = formData.get("projectId") as string
        const title = formData.get("title") as string
        const description = formData.get("description") as string
        const type = formData.get("type") as string
        const tagsString = formData.get("tags") as string
        const imageFile = formData.get("image") as File | null

        // Validation
        if (!projectId || !title || !description) {
            return { success: false, message: "Missing required fields" }
        }

        if (title.length < 5 || title.length > 100) {
            return { success: false, message: "Title must be between 5 and 100 characters" }
        }

        if (description.length < 20 || description.length > 1000) {
            return { success: false, message: "Description must be between 20 and 1000 characters" }
        }

        // Get the project to check user's role
        const project = await prisma.projectV2.findUnique({
            where: { id: projectId },
            include: {
                progress: {
                    where: { userId: session.user.id },
                    select: { id: true }
                }
            }
        })

        if (!project) {
            return { success: false, message: "Project not found" }
        }

        const isCreator = project.createdBy === session.user.id
        const isEnrolled = project.progress.length > 0

        // Determine suggestion source
        let suggestedBy: "CREATOR" | "ENROLLED_USER" | "VISITOR"
        if (isCreator) {
            suggestedBy = "CREATOR"
        } else if (isEnrolled) {
            suggestedBy = "ENROLLED_USER"
        } else {
            suggestedBy = "VISITOR"
        }

        // Parse tags
        const tags = tagsString ? tagsString.split(",").map(tag => tag.trim()).filter(Boolean) : []

        // Upload image if provided
        let imageUrl: string | null = null
        if (imageFile && imageFile.size > 0) {
            const imageFormData = new FormData()
            imageFormData.append("file", imageFile)
            const uploadResult = await uploadImageToCloudinary(imageFormData)

            if (uploadResult.success && uploadResult.url) {
                imageUrl = uploadResult.url
            }
        }

        // If creator or enrolled user, also create the task and add to their list
        if (isCreator || isEnrolled) {
            // Get user's progress record (create if doesn't exist for creator)
            let userProgress = await prisma.userProjectV2Progress.findUnique({
                where: {
                    userId_projectId: {
                        userId: session.user.id,
                        projectId
                    }
                }
            })

            // If creator doesn't have progress yet, create it
            if (!userProgress && isCreator) {
                const taskCount = await prisma.projectV2Task.count({
                    where: { sprint: { projectId } }
                })

                userProgress = await prisma.userProjectV2Progress.create({
                    data: {
                        userId: session.user.id,
                        projectId,
                        status: "IN_PROGRESS",
                        totalTasks: taskCount,
                        startedAt: new Date()
                    }
                })
            }

            if (!userProgress) {
                return {
                    success: false,
                    message: "Could not find or create progress record"
                }
            }

            // Find a sprint to add the task to (use first sprint or create one)
            const firstSprint = await prisma.projectV2Sprint.findFirst({
                where: { projectId },
                orderBy: { orderIndex: 'asc' }
            })

            let sprintId = firstSprint?.id;
            if (!sprintId) {
                const newSprint = await prisma.projectV2Sprint.create({
                    data: {
                        projectId,
                        name: "General",
                        sprintNumber: 1,
                        duration: "2 weeks",
                        goal: "General tasks",
                        orderIndex: 0
                    }
                })
                sprintId = newSprint.id;
            }

            // Get the current task count for order index
            const taskCount = await prisma.projectV2Task.count({
                where: { sprint: { projectId } }
            })

            // Create the task
            const task = await prisma.projectV2Task.create({
                data: {
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
                    orderIndex: taskCount
                }
            })

            // Create task status for the user who added it
            await prisma.userTaskV2Status.create({
                data: {
                    userId: session.user.id,
                    projectId,
                    taskId: task.id,
                    status: "TO_DO",
                    progressId: userProgress.id
                }
            })

            // Update totalTasks count in progress
            await prisma.userProjectV2Progress.update({
                where: { id: userProgress.id },
                data: {
                    totalTasks: { increment: 1 }
                }
            })

            // Create the suggestion with task reference
            const suggestion = await prisma.projectV2FeatureSuggestion.create({
                data: {
                    userId: session.user.id,
                    projectId,
                    title,
                    description,
                    type: type as FeatureSuggestionType,
                    tags,
                    imageUrl,
                    status: isCreator ? "APPROVED" : "PENDING",
                    addedToTasks: true,
                    taskId: task.id,
                    suggestedBy,
                    addedByUsers: [session.user.id] // Track who has this task
                }
            })

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
            // Visitor - only create suggestion
            const suggestion = await prisma.projectV2FeatureSuggestion.create({
                data: {
                    userId: session.user.id,
                    projectId,
                    title,
                    description,
                    type: type as FeatureSuggestionType,
                    tags,
                    imageUrl,
                    status: "PENDING",
                    suggestedBy
                }
            })

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
        const session = await auth()

        const suggestions = await prisma.projectV2FeatureSuggestion.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        // If user is logged in, check which tasks they've already added
        let userTaskIds: string[] = []
        if (session?.user?.id) {
            const userTasks = await prisma.userTaskV2Status.findMany({
                where: {
                    userId: session.user.id,
                    projectId
                },
                select: { taskId: true }
            })
            userTaskIds = userTasks.map((t: { taskId: string }) => t.taskId)
        }

        // Fetch tasks for suggestions that have them
        const suggestionsWithTasks: FeatureSuggestionWithUser[] = await Promise.all(
            suggestions.map(async (s: any): Promise<FeatureSuggestionWithUser> => {
                let task = null
                if (s.taskId) {
                    task = await prisma.projectV2Task.findUnique({
                        where: { id: s.taskId },
                        select: { id: true, title: true }
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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" }
        }

        // Get the suggestion
        const suggestion = await prisma.projectV2FeatureSuggestion.findUnique({
            where: { id: suggestionId }
        })

        if (!suggestion) {
            return { success: false, message: "Suggestion not found" }
        }

        if (!suggestion.taskId) {
            return { success: false, message: "This suggestion hasn't been converted to a task yet" }
        }

        // Get project details
        const project = await prisma.projectV2.findUnique({
            where: {
                id: suggestion.projectId
            },
            select: {
                id: true,
                createdBy: true
            }
        })

        if (!project) {
            return { success: false, message: "Project not found" }
        }

        // Check if user is enrolled in the project
        const enrollment = await prisma.userProjectV2Progress.findUnique({
            where: {
                userId_projectId: {
                    userId: session.user.id,
                    projectId: project.id
                }
            }
        })

        if (!enrollment && project.createdBy !== session.user.id) {
            return { success: false, message: "You must be enrolled in this project to adopt suggestions" }
        }

        // If it's the creator without enrollment, return error
        if (!enrollment) {
            return { success: false, message: "Progress record not found" }
        }

        // Check if user already has this task
        const existingTask = await prisma.userTaskV2Status.findFirst({
            where: {
                userId: session.user.id,
                taskId: suggestion.taskId,
                projectId: project.id
            }
        })

        if (existingTask) {
            return { success: false, message: "You've already added this task to your list" }
        }

        // Add task to user's list
        await prisma.userTaskV2Status.create({
            data: {
                userId: session.user.id,
                projectId: project.id,
                taskId: suggestion.taskId,
                status: "TO_DO",
                progressId: enrollment.id
            }
        })

        // Update totalTasks count in progress
        await prisma.userProjectV2Progress.update({
            where: { id: enrollment.id },
            data: {
                totalTasks: { increment: 1 }
            }
        })

        // Update suggestion to track that this user adopted it
        await prisma.projectV2FeatureSuggestion.update({
            where: { id: suggestionId },
            data: {
                addedByUsers: {
                    push: session.user.id
                }
            }
        })

        revalidatePath(`/projects/${projectSlug}`)
        revalidatePath(`/projects/${projectSlug}/tasks`)

        return {
            success: true,
            message: "Task added to your list successfully!"
        }
    } catch (error) {
        console.error("Error adopting suggestion to tasks:", error)
        return {
            success: false,
            message: "Failed to add task. Please try again."
        }
    }
}

export async function adoptVisitorSuggestionToTasks(suggestionId: string, projectSlug: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" }
        }

        // Get the suggestion
        const suggestion = await prisma.projectV2FeatureSuggestion.findUnique({
            where: { id: suggestionId }
        })

        if (!suggestion) {
            return { success: false, message: "Suggestion not found" }
        }

        // Visitor suggestions shouldn't already have a task - we need to create it
        if (suggestion.suggestedBy !== "VISITOR") {
            return { success: false, message: "This is not a visitor suggestion" }
        }

        // Get project details
        const project = await prisma.projectV2.findUnique({
            where: { id: suggestion.projectId },
            select: { id: true, createdBy: true, slug: true }
        })

        if (!project) {
            return { success: false, message: "Project not found" }
        }

        // Check if user is enrolled or is the creator
        const enrollment = await prisma.userProjectV2Progress.findUnique({
            where: {
                userId_projectId: {
                    userId: session.user.id,
                    projectId: project.id
                }
            }
        })

        const isCreator = project.createdBy === session.user.id

        // Must be enrolled or creator
        if (!enrollment && !isCreator) {
            return { success: false, message: "You must be enrolled in this project to add this suggestion" }
        }

        // If it's the creator without enrollment, return error
        if (!enrollment) {
            return { success: false, message: "Progress record not found" }
        }

        // Check if this suggestion has already been converted to a task
        let task
        if (suggestion.taskId) {
            // Task already exists, check if user already has it
            const existingTask = await prisma.userTaskV2Status.findFirst({
                where: {
                    userId: session.user.id,
                    taskId: suggestion.taskId,
                    projectId: project.id
                }
            })

            if (existingTask) {
                return { success: false, message: "You've already added this task to your list" }
            }

            task = await prisma.projectV2Task.findUnique({
                where: { id: suggestion.taskId }
            })
        } else {
            // Find a sprint to add the task to
            const firstSprint = await prisma.projectV2Sprint.findFirst({
                where: { projectId: project.id },
                orderBy: { orderIndex: 'asc' }
            })

            let sprintId = firstSprint?.id;
            if (!sprintId) {
                const newSprint = await prisma.projectV2Sprint.create({
                    data: {
                        projectId: project.id,
                        name: "General",
                        sprintNumber: 1,
                        duration: "2 weeks",
                        goal: "General tasks",
                        orderIndex: 0
                    }
                })
                sprintId = newSprint.id;
            }

            // Create the task from the visitor suggestion
            const taskCount = await prisma.projectV2Task.count({
                where: { sprint: { projectId: project.id } }
            })

            task = await prisma.projectV2Task.create({
                data: {
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
                    orderIndex: taskCount
                }
            })

            // Update the suggestion with the task ID
            await prisma.projectV2FeatureSuggestion.update({
                where: { id: suggestionId },
                data: {
                    taskId: task.id,
                    addedToTasks: true
                }
            })
        }

        if (!task) {
            return { success: false, message: "Failed to create or find task" }
        }

        // Add task to user's list
        await prisma.userTaskV2Status.create({
            data: {
                userId: session.user.id,
                projectId: project.id,
                taskId: task.id,
                status: "TO_DO",
                progressId: enrollment.id
            }
        })

        // Update totalTasks count in progress
        await prisma.userProjectV2Progress.update({
            where: { id: enrollment.id },
            data: {
                totalTasks: { increment: 1 }
            }
        })

        // Update suggestion to track that this user adopted it
        await prisma.projectV2FeatureSuggestion.update({
            where: { id: suggestionId },
            data: {
                addedByUsers: {
                    push: session.user.id
                }
            }
        })

        revalidatePath(`/projects/${project.slug}`)
        revalidatePath(`/projects/${project.slug}/tasks`)

        return {
            success: true,
            message: "Task added to your list successfully!"
        }
    } catch (error) {
        console.error("Error adopting visitor suggestion to tasks:", error)
        return {
            success: false,
            message: "Failed to add task. Please try again."
        }
    }
}

export async function addSuggestionToTasks(suggestionId: string, projectSlug: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" }
        }

        // Get the suggestion
        const suggestion = await prisma.projectV2FeatureSuggestion.findUnique({
            where: { id: suggestionId },
            include: {
                project: {
                    select: {
                        id: true,
                        createdBy: true,
                        slug: true
                    }
                }
            }
        })

        if (!suggestion) {
            return { success: false, message: "Suggestion not found" }
        }

        // Check if user is the project creator
        if (suggestion.project.createdBy !== session.user.id) {
            return { success: false, message: "Only project creators can add visitor suggestions to tasks" }
        }

        // Check if already added to tasks
        if (suggestion.addedToTasks) {
            return { success: false, message: "This suggestion has already been added to tasks" }
        }

        // Find a sprint to add the task to
        const firstSprint = await prisma.projectV2Sprint.findFirst({
            where: { projectId: suggestion.project.id },
            orderBy: { orderIndex: 'asc' }
        })

        let sprintId = firstSprint?.id;
        if (!sprintId) {
            const newSprint = await prisma.projectV2Sprint.create({
                data: {
                    projectId: suggestion.project.id,
                    name: "General",
                    sprintNumber: 1,
                    duration: "2 weeks",
                    goal: "General tasks",
                    orderIndex: 0
                }
            })
            sprintId = newSprint.id;
        }

        // Get the current task count for order index
        const taskCount = await prisma.projectV2Task.count({
            where: { sprint: { projectId: suggestion.project.id } }
        })

        // Create a new task from the suggestion
        const task = await prisma.projectV2Task.create({
            data: {
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
                orderIndex: taskCount
            }
        })

        // Get creator's progress record (create if doesn't exist)
        let creatorProgress = await prisma.userProjectV2Progress.findUnique({
            where: {
                userId_projectId: {
                    userId: session.user.id,
                    projectId: suggestion.project.id
                }
            }
        })

        // If creator doesn't have progress yet, create it
        if (!creatorProgress) {
            const totalTasks = await prisma.projectV2Task.count({
                where: { sprint: { projectId: suggestion.project.id } }
            })

            creatorProgress = await prisma.userProjectV2Progress.create({
                data: {
                    userId: session.user.id,
                    projectId: suggestion.project.id,
                    status: "IN_PROGRESS",
                    totalTasks,
                    startedAt: new Date()
                }
            })
        }

        // Add task to creator's list
        await prisma.userTaskV2Status.create({
            data: {
                userId: session.user.id,
                projectId: suggestion.project.id,
                taskId: task.id,
                status: "TO_DO",
                progressId: creatorProgress.id
            }
        })

        // Update the suggestion
        await prisma.projectV2FeatureSuggestion.update({
            where: { id: suggestionId },
            data: {
                addedToTasks: true,
                taskId: task.id,
                status: "APPROVED",
                addedByUsers: [session.user.id]
            }
        })

        revalidatePath(`/projects/${suggestion.project.slug}`)
        revalidatePath(`/projects/${suggestion.project.slug}/tasks`)

        return {
            success: true,
            message: "Successfully added to tasks! It's now available for all enrolled users.",
            taskId: task.id
        }
    } catch (error) {
        console.error("Error adding suggestion to tasks:", error)
        return {
            success: false,
            message: "Failed to add to tasks. Please try again."
        }
    }
}

export async function updateSuggestionStatus(suggestionId: string, status: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" }
        }

        const suggestion = await prisma.projectV2FeatureSuggestion.findUnique({
            where: { id: suggestionId },
            include: {
                project: {
                    select: {
                        createdBy: true,
                        slug: true
                    }
                }
            }
        })

        if (!suggestion) {
            return { success: false, message: "Suggestion not found" }
        }

        // Check if user is the project creator
        if (suggestion.project.createdBy !== session.user.id) {
            return {
                success: false,
                message: "Only project creators can update suggestion status"
            }
        }

        await prisma.projectV2FeatureSuggestion.update({
            where: {
                id: suggestionId
            },
            data: {
                status: status as any
            }
        })

        revalidatePath(`/projects/${suggestion.project.slug}`)

        return {
            success: true,
            message: "Status updated successfully"
        }
    } catch (error) {
        console.error("Error updating suggestion status:", error)
        return {
            success: false,
            message: "Failed to update status. Please try again."
        }
    }
}