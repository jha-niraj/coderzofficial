"use server";

import { auth } from '@repo/auth';
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

interface ActionResponse {
    success: boolean;
    data?: any;
    error?: string;
}

async function getCurrentUser() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Not authenticated");
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("User not found");
    return user;
}

// ========================================
// INPUT SCHEMAS
// ========================================

const CreateErrorSchema = z.object({
    projectId: z.string().min(1),
    title: z.string().min(5).max(200),
    description: z.string().min(20).max(2000),
    solution: z.string().min(20).max(3000),
    severity: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
    category: z.enum([
        "SETUP",
        "CONFIGURATION",
        "DATABASE",
        "API",
        "UI",
        "STATE",
        "DEPLOYMENT",
        "SECURITY",
        "PERFORMANCE",
        "OTHER"
    ]).default("OTHER"),
    taskId: z.string().optional(),
    errorCode: z.string().max(5000).optional(),
    fixedCode: z.string().max(5000).optional(),
    tags: z.array(z.string()).max(10).optional(),
});

const UpdateErrorSchema = CreateErrorSchema.partial().extend({
    id: z.string().min(1),
});

// ========================================
// GET PROJECT ERRORS
// ========================================

/**
 * Get all errors for a project (approved ones for public, all for project owner/admin)
 */
export async function getProjectErrors(
    projectId: string,
    options?: {
        page?: number;
        limit?: number;
        category?: string;
        severity?: string;
        sortBy?: "recent" | "helpful" | "encountered";
        includeAll?: boolean; // For admins/owners to see pending errors
    }
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        const {
            page = 1,
            limit = 20,
            category,
            severity,
            sortBy = "helpful",
            includeAll = false
        } = options || {};

        // Check if user is owner or admin
        const project = await prisma.projectV2.findUnique({
            where: { id: projectId },
            select: { createdBy: true, slug: true }
        });

        if (!project) {
            return { success: false, error: "Project not found" };
        }

        const isOwnerOrAdmin = project.createdBy === user.id || user.role === "Admin";
        
        // Build where clause
        const where: any = {
            projectId,
        };

        // Only show approved errors unless owner/admin wants all
        if (!includeAll || !isOwnerOrAdmin) {
            where.status = "APPROVED";
        }

        if (category && category !== "ALL") {
            where.category = category;
        }

        if (severity && severity !== "ALL") {
            where.severity = severity;
        }

        // Sorting
        let orderBy: any = { helpfulCount: "desc" };
        if (sortBy === "recent") {
            orderBy = { createdAt: "desc" };
        } else if (sortBy === "encountered") {
            orderBy = { encounteredCount: "desc" };
        }

        const skip = (page - 1) * limit;

        const [errors, total] = await Promise.all([
            prisma.projectV2Error.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    submittedBy: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true,
                        }
                    },
                    task: {
                        select: {
                            id: true,
                            title: true,
                        }
                    },
                    votes: {
                        where: { userId: user.id },
                        select: {
                            voteType: true,
                        }
                    }
                }
            }),
            prisma.projectV2Error.count({ where })
        ]);

        // Transform to include user's vote status
        const errorsWithVoteStatus = errors.map(error => ({
            ...error,
            hasVotedHelpful: error.votes.some(v => v.voteType === "helpful"),
            hasVotedEncountered: error.votes.some(v => v.voteType === "encountered"),
            votes: undefined, // Remove raw votes from response
        }));

        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            data: {
                errors: errorsWithVoteStatus,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrevious: page > 1,
                }
            }
        };
    } catch (error: any) {
        console.error("[GET PROJECT ERRORS]:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get a single error by ID
 */
export async function getErrorById(errorId: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const error = await prisma.projectV2Error.findUnique({
            where: { id: errorId },
            include: {
                submittedBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    }
                },
                task: {
                    select: {
                        id: true,
                        title: true,
                    }
                },
                project: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        createdBy: true,
                    }
                },
                votes: {
                    where: { userId: user.id },
                    select: {
                        voteType: true,
                    }
                }
            }
        });

        if (!error) {
            return { success: false, error: "Error not found" };
        }

        // Check visibility - only approved or owner/admin can see
        const isOwnerOrAdmin = error.project.createdBy === user.id || 
                               error.submittedById === user.id ||
                               user.role === "Admin";

        if (error.status !== "APPROVED" && !isOwnerOrAdmin) {
            return { success: false, error: "Error not found" };
        }

        return {
            success: true,
            data: {
                ...error,
                hasVotedHelpful: error.votes.some(v => v.voteType === "helpful"),
                hasVotedEncountered: error.votes.some(v => v.voteType === "encountered"),
                votes: undefined,
            }
        };
    } catch (error: any) {
        console.error("[GET ERROR BY ID]:", error);
        return { success: false, error: error.message };
    }
}

// ========================================
// CREATE ERROR
// ========================================

/**
 * Submit a new error/mistake for a project
 */
export async function createProjectError(
    input: z.infer<typeof CreateErrorSchema>
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        const validated = CreateErrorSchema.parse(input);

        // Check project exists and user has access
        const project = await prisma.projectV2.findUnique({
            where: { id: validated.projectId },
            select: { id: true, slug: true, createdBy: true }
        });

        if (!project) {
            return { success: false, error: "Project not found" };
        }

        // Check user progress - must be enrolled to submit errors
        const progress = await prisma.userProjectV2Progress.findUnique({
            where: {
                userId_projectId: {
                    userId: user.id,
                    projectId: validated.projectId
                }
            }
        });

        // Owner or enrolled user can submit
        const isOwner = project.createdBy === user.id;
        if (!isOwner && !progress) {
            return { 
                success: false, 
                error: "You must be enrolled in this project to submit errors" 
            };
        }

        // Verify task belongs to project if taskId provided
        if (validated.taskId) {
            const task = await prisma.projectV2Task.findFirst({
                where: {
                    id: validated.taskId,
                    projectId: validated.projectId
                }
            });

            if (!task) {
                return { success: false, error: "Invalid task" };
            }
        }

        // Create error - auto-approve for project owner/admin
        const autoApprove = isOwner || user.role === "Admin";

        const error = await prisma.projectV2Error.create({
            data: {
                projectId: validated.projectId,
                title: validated.title,
                description: validated.description,
                solution: validated.solution,
                severity: validated.severity,
                category: validated.category,
                taskId: validated.taskId,
                errorCode: validated.errorCode,
                fixedCode: validated.fixedCode,
                tags: validated.tags || [],
                submittedById: user.id,
                status: autoApprove ? "APPROVED" : "PENDING",
                approvedAt: autoApprove ? new Date() : null,
            },
            include: {
                submittedBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    }
                }
            }
        });

        revalidatePath(`/projects/${project.slug}`);

        return {
            success: true,
            data: error,
        };
    } catch (error: any) {
        console.error("[CREATE PROJECT ERROR]:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message };
        }
        return { success: false, error: error.message };
    }
}

// ========================================
// UPDATE ERROR
// ========================================

/**
 * Update an existing error (only by submitter or admin)
 */
export async function updateProjectError(
    input: z.infer<typeof UpdateErrorSchema>
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        const validated = UpdateErrorSchema.parse(input);

        const existingError = await prisma.projectV2Error.findUnique({
            where: { id: validated.id },
            include: {
                project: { select: { slug: true, createdBy: true } }
            }
        });

        if (!existingError) {
            return { success: false, error: "Error not found" };
        }

        // Only submitter, project owner, or admin can update
        const canUpdate = existingError.submittedById === user.id ||
                          existingError.project.createdBy === user.id ||
                          user.role === "Admin";

        if (!canUpdate) {
            return { success: false, error: "Unauthorized" };
        }

        // Build update data (only include provided fields)
        const updateData: any = {};
        if (validated.title) updateData.title = validated.title;
        if (validated.description) updateData.description = validated.description;
        if (validated.solution) updateData.solution = validated.solution;
        if (validated.severity) updateData.severity = validated.severity;
        if (validated.category) updateData.category = validated.category;
        if (validated.taskId !== undefined) updateData.taskId = validated.taskId;
        if (validated.errorCode !== undefined) updateData.errorCode = validated.errorCode;
        if (validated.fixedCode !== undefined) updateData.fixedCode = validated.fixedCode;
        if (validated.tags) updateData.tags = validated.tags;

        const error = await prisma.projectV2Error.update({
            where: { id: validated.id },
            data: updateData,
        });

        revalidatePath(`/projects/${existingError.project.slug}`);

        return { success: true, data: error };
    } catch (error: any) {
        console.error("[UPDATE PROJECT ERROR]:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message };
        }
        return { success: false, error: error.message };
    }
}

// ========================================
// DELETE ERROR
// ========================================

/**
 * Delete an error (only by submitter or admin)
 */
export async function deleteProjectError(errorId: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const error = await prisma.projectV2Error.findUnique({
            where: { id: errorId },
            include: {
                project: { select: { slug: true, createdBy: true } }
            }
        });

        if (!error) {
            return { success: false, error: "Error not found" };
        }

        // Only submitter, project owner, or admin can delete
        const canDelete = error.submittedById === user.id ||
                          error.project.createdBy === user.id ||
                          user.role === "Admin";

        if (!canDelete) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.projectV2Error.delete({
            where: { id: errorId }
        });

        revalidatePath(`/projects/${error.project.slug}`);

        return { success: true };
    } catch (error: any) {
        console.error("[DELETE PROJECT ERROR]:", error);
        return { success: false, error: error.message };
    }
}

// ========================================
// VOTING
// ========================================

/**
 * Vote on an error (helpful or encountered)
 */
export async function voteOnError(
    errorId: string,
    voteType: "helpful" | "encountered"
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const error = await prisma.projectV2Error.findUnique({
            where: { id: errorId },
            select: {
                id: true,
                status: true,
                helpfulCount: true,
                encounteredCount: true,
                project: { select: { slug: true } }
            }
        });

        if (!error) {
            return { success: false, error: "Error not found" };
        }

        if (error.status !== "APPROVED") {
            return { success: false, error: "Cannot vote on unapproved errors" };
        }

        // Check if already voted with this type
        const existingVote = await prisma.projectV2ErrorVote.findUnique({
            where: {
                errorId_userId_voteType: {
                    errorId,
                    userId: user.id,
                    voteType
                }
            }
        });

        if (existingVote) {
            // Remove vote
            await prisma.$transaction([
                prisma.projectV2ErrorVote.delete({
                    where: { id: existingVote.id }
                }),
                prisma.projectV2Error.update({
                    where: { id: errorId },
                    data: {
                        [voteType === "helpful" ? "helpfulCount" : "encounteredCount"]: {
                            decrement: 1
                        }
                    }
                })
            ]);

            revalidatePath(`/projects/${error.project.slug}`);

            return {
                success: true,
                data: {
                    action: "removed",
                    helpfulCount: error.helpfulCount - (voteType === "helpful" ? 1 : 0),
                    encounteredCount: error.encounteredCount - (voteType === "encountered" ? 1 : 0),
                }
            };
        }

        // Add vote
        await prisma.$transaction([
            prisma.projectV2ErrorVote.create({
                data: {
                    errorId,
                    userId: user.id,
                    voteType,
                }
            }),
            prisma.projectV2Error.update({
                where: { id: errorId },
                data: {
                    [voteType === "helpful" ? "helpfulCount" : "encounteredCount"]: {
                        increment: 1
                    }
                }
            })
        ]);

        revalidatePath(`/projects/${error.project.slug}`);

        return {
            success: true,
            data: {
                action: "added",
                helpfulCount: error.helpfulCount + (voteType === "helpful" ? 1 : 0),
                encounteredCount: error.encounteredCount + (voteType === "encountered" ? 1 : 0),
            }
        };
    } catch (error: any) {
        console.error("[VOTE ON ERROR]:", error);
        return { success: false, error: error.message };
    }
}

// ========================================
// MODERATION (Admin/Owner)
// ========================================

/**
 * Approve or reject a pending error
 */
export async function moderateError(
    errorId: string,
    action: "approve" | "reject"
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const error = await prisma.projectV2Error.findUnique({
            where: { id: errorId },
            include: {
                project: { select: { slug: true, createdBy: true } }
            }
        });

        if (!error) {
            return { success: false, error: "Error not found" };
        }

        // Only project owner or admin can moderate
        const canModerate = error.project.createdBy === user.id || user.role === "Admin";

        if (!canModerate) {
            return { success: false, error: "Unauthorized" };
        }

        const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

        await prisma.projectV2Error.update({
            where: { id: errorId },
            data: {
                status: newStatus,
                approvedAt: action === "approve" ? new Date() : null,
            }
        });

        revalidatePath(`/projects/${error.project.slug}`);

        return { success: true };
    } catch (error: any) {
        console.error("[MODERATE ERROR]:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get pending errors for moderation
 */
export async function getPendingErrors(projectId: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const project = await prisma.projectV2.findUnique({
            where: { id: projectId },
            select: { createdBy: true }
        });

        if (!project) {
            return { success: false, error: "Project not found" };
        }

        // Only project owner or admin can see pending
        if (project.createdBy !== user.id && user.role !== "Admin") {
            return { success: false, error: "Unauthorized" };
        }

        const errors = await prisma.projectV2Error.findMany({
            where: {
                projectId,
                status: "PENDING"
            },
            orderBy: { createdAt: "asc" },
            include: {
                submittedBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    }
                },
                task: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            }
        });

        return { success: true, data: errors };
    } catch (error: any) {
        console.error("[GET PENDING ERRORS]:", error);
        return { success: false, error: error.message };
    }
}

// ========================================
// STATS
// ========================================

/**
 * Get error stats for a project
 */
export async function getProjectErrorStats(projectId: string): Promise<ActionResponse> {
    try {
        const [
            totalErrors,
            bySeverity,
            byCategory,
            topHelpful
        ] = await Promise.all([
            prisma.projectV2Error.count({
                where: { projectId, status: "APPROVED" }
            }),
            prisma.projectV2Error.groupBy({
                by: ["severity"],
                where: { projectId, status: "APPROVED" },
                _count: true
            }),
            prisma.projectV2Error.groupBy({
                by: ["category"],
                where: { projectId, status: "APPROVED" },
                _count: true
            }),
            prisma.projectV2Error.findMany({
                where: { projectId, status: "APPROVED" },
                orderBy: { helpfulCount: "desc" },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    helpfulCount: true,
                    encounteredCount: true,
                }
            })
        ]);

        return {
            success: true,
            data: {
                totalErrors,
                bySeverity: bySeverity.reduce((acc, item) => {
                    acc[item.severity] = item._count;
                    return acc;
                }, {} as Record<string, number>),
                byCategory: byCategory.reduce((acc, item) => {
                    acc[item.category] = item._count;
                    return acc;
                }, {} as Record<string, number>),
                topHelpful
            }
        };
    } catch (error: any) {
        console.error("[GET PROJECT ERROR STATS]:", error);
        return { success: false, error: error.message };
    }
}


