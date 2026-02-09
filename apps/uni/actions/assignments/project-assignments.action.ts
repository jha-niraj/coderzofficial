"use server"

import { prisma } from "@repo/prisma";
import { auth } from "@repo/auth";
import crypto from 'crypto';
import type { UniversityPermission } from "@/types";

// ============================================
// TYPES
// ============================================

interface CreateProjectAssignmentPayload {
    projectTitle: string;
    projectDescription: string;
    generationType: "FULL_STACK" | "FRONTEND" | "APP" | "PROGRAMS" | "AI/ML" | "AI_AGENT" | "OTHER";
    difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    visibility: "PUBLIC" | "PRIVATE";
    includeAssessment: boolean;
    stacks: {
        frontend?: string;
        backend?: string;
        database?: string;
        deployment?: string;
        aiProvider?: string;
    };
    // University-specific fields
    classIds: string[];
    deadline?: Date;
    credits?: number;
    instructions?: string;
}

interface AssignExistingProjectPayload {
    projectId: string;
    classIds: string[];
    deadline?: Date;
    credits?: number;
    instructions?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getCurrentMember() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    const member = await prisma.universityMember.findFirst({
        where: { userId: session.user.id },
        include: { 
            university: { select: { id: true, name: true } },
        },
    });

    if (!member) throw new Error("Not a university member");
    return member;
}

async function hasPermission(member: { permissions: unknown }, permission: UniversityPermission): Promise<boolean> {
    if (!member.permissions) return false;
    try {
        const permissions = typeof member.permissions === "string" 
            ? JSON.parse(member.permissions) 
            : member.permissions;
        return Array.isArray(permissions) && permissions.includes(permission);
    } catch {
        return false;
    }
}

async function issueWorkerToken(action: string, jobId?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    const secret = process.env.WORKER_SECRET;
    if (!secret) throw new Error("Worker secret not configured");

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        userId: session.user.id,
        action,
        jobId,
        iat: now,
        exp: now + 300 // 5 minutes
    };

    const data = JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url');
    const encodedPayload = Buffer.from(data).toString('base64url');

    return `${encodedPayload}.${signature}`;
}

// ============================================
// PROJECT ASSIGNMENT ACTIONS
// ============================================

/**
 * Create a new project assignment using AI generation
 * This creates a BackgroundJob and calls the worker to generate the project
 */
export async function createProjectAssignment(payload: CreateProjectAssignmentPayload) {
    try {
        const member = await getCurrentMember();

        // Check permission
        if (!await hasPermission(member, "create_assignments")) {
            return { success: false, error: "You don't have permission to create assignments" };
        }

        // Validate classes belong to the university
        if (payload.classIds.length === 0) {
            return { success: false, error: "Please select at least one class" };
        }

        const validClasses = await prisma.universityClass.findMany({
            where: {
                id: { in: payload.classIds },
                universityId: member.universityId,
            },
        });

        if (validClasses.length !== payload.classIds.length) {
            return { success: false, error: "Invalid class selection" };
        }

        // Transform stacks for worker API
        const stacksArray: Array<{ name: string; category: string }> = [];
        if (payload.stacks?.frontend) stacksArray.push({ name: payload.stacks.frontend, category: 'FRONTEND' });
        if (payload.stacks?.backend) stacksArray.push({ name: payload.stacks.backend, category: 'BACKEND' });
        if (payload.stacks?.database) stacksArray.push({ name: payload.stacks.database, category: 'DATABASE' });
        if (payload.stacks?.deployment) stacksArray.push({ name: payload.stacks.deployment, category: 'DEPLOYMENT' });
        if (payload.stacks?.aiProvider) stacksArray.push({ name: payload.stacks.aiProvider, category: 'AI' });

        const workerPayload = {
            projectTitle: payload.projectTitle,
            description: payload.projectDescription,
            generationType: payload.generationType,
            visibility: payload.visibility,
            includeAssessment: payload.includeAssessment,
            stacks: stacksArray,
            userId: member.userId,
            // University-specific fields to be saved after generation
            universityId: member.universityId,
            teacherMemberId: member.id,
            classIds: payload.classIds,
            isUniversityProject: true,
        };

        // Get worker token
        const workerToken = await issueWorkerToken('generate_project');

        // Call worker API to create job
        const response = await fetch(`${process.env.WORKER_API_URL}/api/v1/generateproject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${workerToken}`,
            },
            body: JSON.stringify(workerPayload),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Worker API error: ${error}`);
        }

        const result = await response.json() as {
            success: boolean;
            jobId: string;
            message: string;
        };

        if (!result.success || !result.jobId) {
            throw new Error('Failed to create job in worker');
        }

        // Create job record in database with university metadata
        await prisma.backgroundJob.create({
            data: {
                jobId: result.jobId,
                status: 'waiting',
                progress: 0,
                userId: member.userId,
                input: {
                    ...payload,
                    universityId: member.universityId,
                    teacherMemberId: member.id,
                    isUniversityProject: true,
                } as any,
            }
        });

        return {
            success: true,
            jobId: result.jobId,
            message: "Project generation started",
        };
    } catch (error: any) {
        console.error("Create project assignment error:", error);
        return { success: false, error: error.message || "Failed to create project assignment" };
    }
}

/**
 * Finalize a generated project with university assignment details
 */
export async function finalizeProjectAssignment(jobId: string, workerData: { projectId: string; slug: string; title: string }) {
    try {
        const member = await getCurrentMember();

        // Get the job from database
        const job = await prisma.backgroundJob.findUnique({
            where: { jobId },
        });

        if (!job) {
            return { success: false, error: 'Job not found' };
        }

        const inputData = job.input as any;

        // Update the project with university assignment details
        await prisma.projectV2.update({
            where: { id: workerData.projectId },
            data: {
                isUniversityProject: true,
                universityId: inputData.universityId || member.universityId,
                teacherMemberId: inputData.teacherMemberId || member.id,
                classIds: inputData.classIds || [],
                assignmentDeadline: inputData.deadline ? new Date(inputData.deadline) : null,
                assignmentCredits: inputData.credits || null,
                assignmentInstructions: inputData.instructions || null,
            },
        });

        // Update job status
        await prisma.backgroundJob.update({
            where: { jobId },
            data: {
                status: 'completed',
                progress: 100,
            },
        });

        return {
            success: true,
            message: 'Project assignment created',
            data: {
                projectSlug: workerData.slug,
                projectId: workerData.projectId,
            },
        };
    } catch (error: any) {
        console.error("Finalize project assignment error:", error);
        return { success: false, error: error.message || "Failed to finalize project assignment" };
    }
}

/**
 * Assign an existing project to classes
 */
export async function assignExistingProject(payload: AssignExistingProjectPayload) {
    try {
        const member = await getCurrentMember();

        if (!await hasPermission(member, "create_assignments")) {
            return { success: false, error: "You don't have permission to create assignments" };
        }

        // Verify the project exists and teacher has access
        const project = await prisma.projectV2.findFirst({
            where: {
                id: payload.projectId,
                OR: [
                    { visibility: "PUBLIC" },
                    { createdBy: member.userId },
                    { universityId: member.universityId },
                ],
            },
        });

        if (!project) {
            return { success: false, error: "Project not found or you don't have access" };
        }

        // Validate classes
        const validClasses = await prisma.universityClass.findMany({
            where: {
                id: { in: payload.classIds },
                universityId: member.universityId,
            },
        });

        if (validClasses.length !== payload.classIds.length) {
            return { success: false, error: "Invalid class selection" };
        }

        // If it's already a university project, add to existing classIds
        // Otherwise, convert it to a university project
        const existingClassIds = project.classIds || [];
        const newClassIds = [...new Set([...existingClassIds, ...payload.classIds])];

        await prisma.projectV2.update({
            where: { id: payload.projectId },
            data: {
                isUniversityProject: true,
                universityId: member.universityId,
                teacherMemberId: member.id,
                classIds: newClassIds,
                assignmentDeadline: payload.deadline || project.assignmentDeadline,
                assignmentCredits: payload.credits || project.assignmentCredits,
                assignmentInstructions: payload.instructions || project.assignmentInstructions,
            },
        });

        return {
            success: true,
            message: "Project assigned to classes",
        };
    } catch (error: any) {
        console.error("Assign existing project error:", error);
        return { success: false, error: error.message || "Failed to assign project" };
    }
}

/**
 * Get all project assignments for the teacher's university
 */
export async function getProjectAssignments(filters?: {
    classId?: string;
    status?: "active" | "past" | "all";
}) {
    try {
        const member = await getCurrentMember();

        const whereClause: any = {
            isUniversityProject: true,
            universityId: member.universityId,
        };

        // If not HEAD, only show projects they created
        if (member.role !== "HEAD") {
            whereClause.teacherMemberId = member.id;
        }

        // Filter by class if provided
        if (filters?.classId) {
            whereClause.classIds = { has: filters.classId };
        }

        // Filter by deadline status
        if (filters?.status === "active") {
            whereClause.OR = [
                { assignmentDeadline: null },
                { assignmentDeadline: { gte: new Date() } },
            ];
        } else if (filters?.status === "past") {
            whereClause.assignmentDeadline = { lt: new Date() };
        }

        const projects = await prisma.projectV2.findMany({
            where: whereClause,
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                shortDescription: true,
                difficulty: true,
                generationType: true,
                classIds: true,
                assignmentDeadline: true,
                assignmentCredits: true,
                assignmentInstructions: true,
                teacherMemberId: true,
                createdAt: true,
                _count: {
                    select: {
                        progress: true,
                        submissions: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Get class names for the projects
        const allClassIds = projects.flatMap(p => p.classIds);
        const classes = await prisma.universityClass.findMany({
            where: { id: { in: allClassIds } },
            select: { id: true, name: true, code: true },
        });
        const classMap = new Map(classes.map(c => [c.id, c]));

        // Enrich projects with class info
        const enrichedProjects = projects.map(project => ({
            ...project,
            classes: project.classIds.map(id => classMap.get(id)).filter(Boolean),
            studentsStarted: project._count.progress,
            studentsCompleted: project._count.submissions,
        }));

        return {
            success: true,
            data: enrichedProjects,
        };
    } catch (error: any) {
        console.error("Get project assignments error:", error);
        return { success: false, error: error.message || "Failed to fetch project assignments" };
    }
}

/**
 * Get classes that the teacher can assign projects to
 */
export async function getTeacherClasses() {
    try {
        const member = await getCurrentMember();

        // HEAD can see all classes, others see classes they're assigned to
        const whereClause: any = {
            universityId: member.universityId,
            isActive: true,
        };

        // For non-HEAD, we could add faculty filter here
        // For now, all faculty can assign to any class

        const classes = await prisma.universityClass.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                code: true,
                semester: true,
                academicYear: true,
                studentCount: true,
                department: {
                    select: { name: true, code: true },
                },
            },
            orderBy: [
                { department: { name: "asc" } },
                { name: "asc" },
            ],
        });

        return {
            success: true,
            data: classes,
        };
    } catch (error: any) {
        console.error("Get teacher classes error:", error);
        return { success: false, error: error.message || "Failed to fetch classes" };
    }
}

/**
 * Update project assignment details
 */
export async function updateProjectAssignment(
    projectId: string,
    updates: {
        classIds?: string[];
        deadline?: Date | null;
        credits?: number | null;
        instructions?: string | null;
    }
) {
    try {
        const member = await getCurrentMember();

        // Verify ownership
        const project = await prisma.projectV2.findFirst({
            where: {
                id: projectId,
                universityId: member.universityId,
                OR: [
                    { teacherMemberId: member.id },
                    ...(member.role === "HEAD" ? [{ universityId: member.universityId }] : []),
                ],
            },
        });

        if (!project) {
            return { success: false, error: "Project not found or you don't have access" };
        }

        const updateData: any = {};
        if (updates.classIds !== undefined) updateData.classIds = updates.classIds;
        if (updates.deadline !== undefined) updateData.assignmentDeadline = updates.deadline;
        if (updates.credits !== undefined) updateData.assignmentCredits = updates.credits;
        if (updates.instructions !== undefined) updateData.assignmentInstructions = updates.instructions;

        await prisma.projectV2.update({
            where: { id: projectId },
            data: updateData,
        });

        return { success: true, message: "Assignment updated" };
    } catch (error: any) {
        console.error("Update project assignment error:", error);
        return { success: false, error: error.message || "Failed to update assignment" };
    }
}

/**
 * Remove project assignment (doesn't delete the project, just removes university linking)
 */
export async function removeProjectAssignment(projectId: string) {
    try {
        const member = await getCurrentMember();

        const project = await prisma.projectV2.findFirst({
            where: {
                id: projectId,
                universityId: member.universityId,
                OR: [
                    { teacherMemberId: member.id },
                    ...(member.role === "HEAD" ? [{ universityId: member.universityId }] : []),
                ],
            },
        });

        if (!project) {
            return { success: false, error: "Project not found or you don't have access" };
        }

        await prisma.projectV2.update({
            where: { id: projectId },
            data: {
                isUniversityProject: false,
                universityId: null,
                teacherMemberId: null,
                classIds: [],
                assignmentDeadline: null,
                assignmentCredits: null,
                assignmentInstructions: null,
            },
        });

        return { success: true, message: "Assignment removed" };
    } catch (error: any) {
        console.error("Remove project assignment error:", error);
        return { success: false, error: error.message || "Failed to remove assignment" };
    }
}

/**
 * Get student progress for a project assignment
 */
export async function getProjectStudentProgress(projectId: string) {
    try {
        const member = await getCurrentMember();

        // Verify access
        const project = await prisma.projectV2.findFirst({
            where: {
                id: projectId,
                universityId: member.universityId,
            },
            select: {
                classIds: true,
            },
        });

        if (!project) {
            return { success: false, error: "Project not found" };
        }

        // Get students from the assigned classes
        const classEnrollments = await prisma.classEnrollment.findMany({
            where: {
                classId: { in: project.classIds },
                isActive: true,
            },
            select: {
                studentLink: {
                    select: {
                        userId: true,
                    },
                },
            },
        });

        const studentUserIds = classEnrollments.map(ce => ce.studentLink.userId);

        // Get user info for these students
        const users = await prisma.user.findMany({
            where: {
                id: { in: studentUserIds },
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            },
        });
        const userMap = new Map(users.map(u => [u.id, u]));

        // Get progress for these students
        const progress = await prisma.userProjectV2Progress.findMany({
            where: {
                projectId,
                userId: { in: studentUserIds },
            },
            select: {
                userId: true,
                progressPercentage: true,
                startedAt: true,
                completedAt: true,
                totalScore: true,
            },
        });

        // Get submissions
        const submissions = await prisma.projectV2Submission.findMany({
            where: {
                projectId,
                userId: { in: studentUserIds },
            },
            select: {
                userId: true,
                status: true,
                createdAt: true,
                scores: true,
            },
        });

        const progressMap = new Map(progress.map(p => [p.userId, p]));
        const submissionMap = new Map(submissions.map(s => [s.userId, s]));

        // Combine data
        const studentProgress = studentUserIds.map(userId => {
            const user = userMap.get(userId);
            const userProgress = progressMap.get(userId);
            const userSubmission = submissionMap.get(userId);

            return {
                user: user || { id: userId, name: null, email: null, image: null },
                progress: userProgress?.progressPercentage || 0,
                startedAt: userProgress?.startedAt || null,
                completedAt: userProgress?.completedAt || null,
                totalScore: userProgress?.totalScore || 0,
                submission: userSubmission || null,
                status: userSubmission?.status || (userProgress ? "in_progress" : "not_started"),
            };
        });

        return {
            success: true,
            data: studentProgress,
        };
    } catch (error: any) {
        console.error("Get project student progress error:", error);
        return { success: false, error: error.message || "Failed to fetch student progress" };
    }
}
