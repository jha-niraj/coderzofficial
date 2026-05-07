'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from "@repo/auth";
import { headers } from "next/headers";
import {
    db,
    users,
    projectsV2,
    projectV2Sprints,
    projectV2Tasks,
} from "@repo/db";
import { eq, and } from "drizzle-orm";
import type OpenAI from 'openai'
import { openai } from '@/lib/openai-client'

// ============================================================================
// Helper Functions
// ============================================================================

async function getCurrentUser() {
    const session = await getSession(headers());
    if (!session?.user?.email) throw new Error('Not authenticated')
    const [user] = await db.select().from(users).where(eq(users.email, session.user.email));
    if (!user) throw new Error('User not found')
    return user
}

// ============================================================================
// Types
// ============================================================================

interface ActionResult<T = void> {
    success: boolean
    data?: T
    error?: string
}

interface GeneratedTask {
    title: string
    description: string[]
    successCriteria: string[]
    hints: string[]
    estimatedMinutes: number
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    category: string | null
    estimatedTime: string | null
    checkpoints: string[]
    relatedPages: string[]
    dependencies: string[]
    badges: string[]
    tags: string[]
    terminalCommand: string | null
    orderIndex: number
}

interface GeneratedSprint {
    name: string
    goal: string
    duration: string
    tasks: GeneratedTask[]
}

// ============================================================================
// Sprint Generation Actions
// ============================================================================

/**
 * Generate a sprint with tasks using AI
 */
export async function generateSprintWithAI(
    projectId: string,
    sprintDescription: string
): Promise<ActionResult<GeneratedSprint>> {
    try {
        const user = await getCurrentUser()

        const project = await db.query.projectsV2.findFirst({
            where: eq(projectsV2.id, projectId),
            with: {
                sprints: {
                    orderBy: (sprints: any, { asc }: any) => [asc(sprints.orderIndex)],
                    with: { tasks: true }
                }
            }
        });

        if (!project) {
            return { success: false, error: 'Project not found' }
        }

        const existingSprintsContext = project.sprints.map((s: any) => ({
            name: s.name,
            goal: s.goal,
            tasksCount: s.tasks.length
        }))

        const nextSprintNumber = project.sprints.length + 1

        const systemPrompt = `You are an expert software development coach helping create project sprints with detailed tasks.

Given a sprint description, generate a comprehensive sprint structure with 3-6 actionable tasks.

Project Context:
- Title: ${project.title}
- Description: ${project.shortDescription || 'Not specified'}
- Technologies: ${project.technologies?.join(', ') || 'Not specified'}
- Tech Stack: ${JSON.stringify(project.stacks || {})}
- Existing Sprints: ${existingSprintsContext.length > 0 ? JSON.stringify(existingSprintsContext) : 'None yet'}

Generate a sprint that:
1. Has a clear, actionable name
2. Has a specific goal that describes what will be accomplished
3. Has a realistic duration (e.g., "1-2 days", "3-4 hours", "1 week")
4. Contains 3-6 well-structured tasks

Each task should have:
- Clear, descriptive title
- Step-by-step description (3-7 steps)
- Measurable success criteria (2-4 items)
- Helpful hints for learners (2-3 hints)
- Appropriate difficulty (BEGINNER, INTERMEDIATE, ADVANCED)
- Category (e.g., "setup", "frontend", "backend", "database", "api", "testing", "deployment")
- Estimated time (e.g., "30 mins", "1 hour", "2-3 hours")
- Checkpoints to verify progress (2-4 items)
- Related pages/routes if applicable
- Task dependencies (reference to other task titles if needed)
- Relevant badges/achievements
- Tags for categorization
- Terminal command if applicable (for setup/build tasks)

Respond with valid JSON only, no markdown or explanation.`

        const userPrompt = `Generate Sprint #${nextSprintNumber}: "${sprintDescription}"

Return a JSON object with this exact structure:
{
  "name": "Sprint Name",
  "goal": "What this sprint accomplishes",
  "duration": "Estimated time",
  "tasks": [
    {
      "title": "Task Title",
      "description": ["Step 1", "Step 2", "Step 3"],
      "successCriteria": ["Criterion 1", "Criterion 2"],
      "hints": ["Hint 1", "Hint 2"],
      "estimatedMinutes": 60,
      "difficulty": "BEGINNER",
      "category": "frontend",
      "estimatedTime": "1 hour",
      "checkpoints": ["Checkpoint 1", "Checkpoint 2"],
      "relatedPages": ["/dashboard", "/profile"],
      "dependencies": [],
      "badges": ["UI Master"],
      "tags": ["react", "components"],
      "terminalCommand": null,
      "orderIndex": 0
    }
  ]
}`

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 3000,
            response_format: { type: 'json_object' }
        })

        const responseContent = completion.choices[0]?.message?.content

        if (!responseContent) {
            return { success: false, error: 'Failed to generate sprint content' }
        }

        const generatedSprint: GeneratedSprint = JSON.parse(responseContent)

        generatedSprint.tasks = generatedSprint.tasks.map((task, idx) => ({
            ...task,
            orderIndex: idx
        }))

        return { success: true, data: generatedSprint }
    } catch (error) {
        console.error('Error generating sprint:', error)
        return { success: false, error: 'Failed to generate sprint' }
    }
}

/**
 * Add a generated sprint to the project
 */
export async function addSprintToProject(
    projectId: string,
    sprintData: GeneratedSprint,
    autoAccept: boolean = false
): Promise<ActionResult<{ sprintId: string, isPersonal: boolean }>> {
    try {
        const user = await getCurrentUser()

        const project = await db.query.projectsV2.findFirst({
            where: eq(projectsV2.id, projectId),
            with: {
                sprints: {
                    orderBy: (sprints: any, { desc }: any) => [desc(sprints.orderIndex)],
                    limit: 1,
                }
            }
        });

        if (!project) {
            return { success: false, error: 'Project not found' }
        }

        const isCreator = project.createdBy === user.id
        const nextSprintNumber = (project.sprints[0]?.sprintNumber || 0) + 1
        const nextOrderIndex = (project.sprints[0]?.orderIndex || 0) + 1

        if (isCreator || autoAccept) {
            const [sprint] = await db.insert(projectV2Sprints).values({
                projectId,
                sprintNumber: nextSprintNumber,
                name: sprintData.name,
                goal: sprintData.goal,
                duration: sprintData.duration,
                orderIndex: nextOrderIndex,
                createdBy: user.id,
                isApproved: true,
            }).returning();

            if (sprintData.tasks.length > 0) {
                await db.insert(projectV2Tasks).values(
                    sprintData.tasks.map((task, idx) => ({
                        sprintId: sprint!.id,
                        projectV2Id: projectId,
                        title: task.title,
                        description: task.description,
                        hints: task.hints,
                        estimatedMinutes: task.estimatedMinutes,
                        difficulty: task.difficulty,
                        orderIndex: idx,
                        category: task.category,
                        estimatedTime: task.estimatedTime,
                        checkpoints: task.checkpoints,
                        relatedPages: task.relatedPages,
                        dependencies: task.dependencies,
                        badges: task.badges,
                        tags: task.tags,
                        terminalCommand: task.terminalCommand,
                        criteria: task.successCriteria
                    }))
                );
            }

            revalidatePath(`/projects/${project.slug}`)

            return { success: true, data: { sprintId: sprint!.id, isPersonal: false } }
        } else {
            const [sprint] = await db.insert(projectV2Sprints).values({
                projectId,
                sprintNumber: nextSprintNumber,
                name: sprintData.name,
                goal: sprintData.goal,
                duration: sprintData.duration,
                orderIndex: nextOrderIndex,
                createdBy: user.id,
                isApproved: false,
                isPersonal: true,
            }).returning();

            if (sprintData.tasks.length > 0) {
                await db.insert(projectV2Tasks).values(
                    sprintData.tasks.map((task, idx) => ({
                        sprintId: sprint!.id,
                        projectV2Id: projectId,
                        title: task.title,
                        description: task.description,
                        hints: task.hints,
                        estimatedMinutes: task.estimatedMinutes,
                        difficulty: task.difficulty,
                        orderIndex: idx,
                        category: task.category,
                        estimatedTime: task.estimatedTime,
                        checkpoints: task.checkpoints,
                        relatedPages: task.relatedPages,
                        dependencies: task.dependencies,
                        badges: task.badges,
                        tags: task.tags,
                        terminalCommand: task.terminalCommand,
                        criteria: task.successCriteria
                    }))
                );
            }

            revalidatePath(`/projects/${project.slug}`)

            return { success: true, data: { sprintId: sprint!.id, isPersonal: true } }
        }
    } catch (error) {
        console.error('Error adding sprint to project:', error)
        return { success: false, error: 'Failed to add sprint' }
    }
}

/**
 * Accept a personal sprint
 */
export async function acceptPersonalSprint(
    sprintId: string
): Promise<ActionResult> {
    try {
        const user = await getCurrentUser()

        const sprint = await db.query.projectV2Sprints.findFirst({
            where: eq(projectV2Sprints.id, sprintId),
            with: { project: true }
        });

        if (!sprint) {
            return { success: false, error: 'Sprint not found' }
        }

        if (sprint.createdBy !== user.id) {
            return { success: false, error: 'You can only accept your own sprints' }
        }

        await db.update(projectV2Sprints).set({ isApproved: true }).where(eq(projectV2Sprints.id, sprintId));

        revalidatePath(`/projects/${sprint.project.slug}`)

        return { success: true }
    } catch (error) {
        console.error('Error accepting sprint:', error)
        return { success: false, error: 'Failed to accept sprint' }
    }
}

/**
 * Reject/delete a personal sprint
 */
export async function rejectPersonalSprint(
    sprintId: string
): Promise<ActionResult> {
    try {
        const user = await getCurrentUser()

        const sprint = await db.query.projectV2Sprints.findFirst({
            where: eq(projectV2Sprints.id, sprintId),
            with: { project: true }
        });

        if (!sprint) {
            return { success: false, error: 'Sprint not found' }
        }

        if (sprint.createdBy !== user.id) {
            return { success: false, error: 'You can only reject your own sprints' }
        }

        await db.transaction(async (tx) => {
            await tx.delete(projectV2Tasks).where(eq(projectV2Tasks.sprintId, sprintId));
            await tx.delete(projectV2Sprints).where(eq(projectV2Sprints.id, sprintId));
        });

        revalidatePath(`/projects/${sprint.project.slug}`)

        return { success: true }
    } catch (error) {
        console.error('Error rejecting sprint:', error)
        return { success: false, error: 'Failed to reject sprint' }
    }
}

/**
 * Get user's sprints for a project
 */
export async function getUserSprintsForProject(
    projectId: string
): Promise<ActionResult<{
    approvedSprints: Array<{
        id: string
        sprintNumber: number
        name: string
        goal: string
        duration: string
        tasksCount: number
    }>
    personalSprints: Array<{
        id: string
        sprintNumber: number
        name: string
        goal: string
        duration: string
        tasksCount: number
        isApproved: boolean
    }>
}>> {
    try {
        const user = await getCurrentUser()

        const approvedSprints = await db.query.projectV2Sprints.findMany({
            where: and(
                eq(projectV2Sprints.projectId, projectId),
                eq(projectV2Sprints.isApproved, true),
                eq(projectV2Sprints.isPersonal, false)
            ),
            with: { tasks: true },
            orderBy: (sprints: any, { asc }: any) => [asc(sprints.orderIndex)]
        });

        const personalSprints = await db.query.projectV2Sprints.findMany({
            where: and(
                eq(projectV2Sprints.projectId, projectId),
                eq(projectV2Sprints.createdBy, user.id),
                eq(projectV2Sprints.isPersonal, true)
            ),
            with: { tasks: true },
            orderBy: (sprints: any, { asc }: any) => [asc(sprints.orderIndex)]
        });

        return {
            success: true,
            data: {
                approvedSprints: approvedSprints.map((s: any) => ({
                    id: s.id,
                    sprintNumber: s.sprintNumber,
                    name: s.name,
                    goal: s.goal,
                    duration: s.duration,
                    tasksCount: s.tasks.length
                })),
                personalSprints: personalSprints.map((s: any) => ({
                    id: s.id,
                    sprintNumber: s.sprintNumber,
                    name: s.name,
                    goal: s.goal,
                    duration: s.duration,
                    tasksCount: s.tasks.length,
                    isApproved: s.isApproved
                }))
            }
        }
    } catch (error) {
        console.error('Error getting user sprints:', error)
        return { success: false, error: 'Failed to get sprints' }
    }
}
