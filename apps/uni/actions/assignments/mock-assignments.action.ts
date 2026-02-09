"use server"

import { prisma } from "@repo/prisma";
import { auth } from "@repo/auth";
import type { UniversityPermission } from "@/types";

// ============================================
// TYPES
// ============================================

interface CreateMockAssignmentPayload {
    title: string;
    description: string;
    category: "TECHNICAL" | "BEHAVIORAL" | "HR" | "SYSTEM_DESIGN" | "CODING" | "GENERAL";
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
    duration: number; // in minutes
    questionsCount: number;
    knowledgeBase: string;
    tags: string[];
    // University-specific fields
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

// ============================================
// MOCK INTERVIEW ASSIGNMENT ACTIONS
// ============================================

/**
 * Create a new mock interview assignment for university students
 */
export async function createMockAssignment(payload: CreateMockAssignmentPayload) {
    try {
        const member = await getCurrentMember();

        // Check permission
        if (!await hasPermission(member, "create_assignments")) {
            return { success: false, error: "You don't have permission to create assignments" };
        }

        // Validate classes
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

        // Create the mock interview
        const mock = await prisma.mockInterviewVoice.create({
            data: {
                title: payload.title,
                description: payload.description,
                category: payload.category,
                level: payload.level,
                duration: payload.duration,
                questionsCount: payload.questionsCount,
                knowledgeBase: payload.knowledgeBase,
                tags: payload.tags,
                isPublic: false, // University mocks are private
                isPredefined: false,
                createdById: member.userId,
                // University-specific fields
                isUniversityMock: true,
                universityId: member.universityId,
                teacherMemberId: member.id,
                classIds: payload.classIds,
                assignmentDeadline: payload.deadline || null,
                assignmentCredits: payload.credits || null,
                assignmentInstructions: payload.instructions || null,
                creditsRequired: payload.credits || 15,
            },
        });

        return {
            success: true,
            data: {
                id: mock.id,
                title: mock.title,
            },
        };
    } catch (error: any) {
        console.error("Create mock assignment error:", error);
        return { success: false, error: error.message || "Failed to create mock assignment" };
    }
}

/**
 * Get all mock interview assignments for the teacher's university
 */
export async function getMockAssignments(filters?: {
    classId?: string;
    status?: "active" | "past" | "all";
}) {
    try {
        const member = await getCurrentMember();

        const whereClause: any = {
            isUniversityMock: true,
            universityId: member.universityId,
        };

        // If not HEAD, only show mocks they created
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

        const mocks = await prisma.mockInterviewVoice.findMany({
            where: whereClause,
            select: {
                id: true,
                title: true,
                description: true,
                category: true,
                level: true,
                duration: true,
                questionsCount: true,
                classIds: true,
                assignmentDeadline: true,
                assignmentCredits: true,
                assignmentInstructions: true,
                totalSessions: true,
                averageRating: true,
                createdAt: true,
                _count: {
                    select: {
                        sessions: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Get class names
        const allClassIds = mocks.flatMap(m => m.classIds);
        const classes = await prisma.universityClass.findMany({
            where: { id: { in: allClassIds } },
            select: { id: true, name: true, code: true },
        });
        const classMap = new Map(classes.map(c => [c.id, c]));

        // Get completion stats by counting unique users who completed sessions
        const enrichedMocks = await Promise.all(mocks.map(async (mock) => {
            const completedSessions = await prisma.mockVoiceSession.findMany({
                where: {
                    mockId: mock.id,
                    status: "COMPLETED",
                },
                select: {
                    userId: true,
                },
                distinct: ["userId"],
            });

            return {
                ...mock,
                classes: mock.classIds.map(id => classMap.get(id)).filter(Boolean),
                studentsStarted: mock._count.sessions,
                studentsCompleted: completedSessions.length,
            };
        }));

        return {
            success: true,
            data: enrichedMocks,
        };
    } catch (error: any) {
        console.error("Get mock assignments error:", error);
        return { success: false, error: error.message || "Failed to fetch mock assignments" };
    }
}

/**
 * Update mock assignment details
 */
export async function updateMockAssignment(
    mockId: string,
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
        const mock = await prisma.mockInterviewVoice.findFirst({
            where: {
                id: mockId,
                universityId: member.universityId,
                OR: [
                    { teacherMemberId: member.id },
                    ...(member.role === "HEAD" ? [{ universityId: member.universityId }] : []),
                ],
            },
        });

        if (!mock) {
            return { success: false, error: "Mock not found or you don't have access" };
        }

        const updateData: any = {};
        if (updates.classIds !== undefined) updateData.classIds = updates.classIds;
        if (updates.deadline !== undefined) updateData.assignmentDeadline = updates.deadline;
        if (updates.credits !== undefined) {
            updateData.assignmentCredits = updates.credits;
            updateData.creditsRequired = updates.credits;
        }
        if (updates.instructions !== undefined) updateData.assignmentInstructions = updates.instructions;

        await prisma.mockInterviewVoice.update({
            where: { id: mockId },
            data: updateData,
        });

        return { success: true, message: "Mock assignment updated" };
    } catch (error: any) {
        console.error("Update mock assignment error:", error);
        return { success: false, error: error.message || "Failed to update mock assignment" };
    }
}

/**
 * Remove mock assignment (doesn't delete the mock, just removes university linking)
 */
export async function removeMockAssignment(mockId: string) {
    try {
        const member = await getCurrentMember();

        const mock = await prisma.mockInterviewVoice.findFirst({
            where: {
                id: mockId,
                universityId: member.universityId,
                OR: [
                    { teacherMemberId: member.id },
                    ...(member.role === "HEAD" ? [{ universityId: member.universityId }] : []),
                ],
            },
        });

        if (!mock) {
            return { success: false, error: "Mock not found or you don't have access" };
        }

        await prisma.mockInterviewVoice.update({
            where: { id: mockId },
            data: {
                isUniversityMock: false,
                universityId: null,
                teacherMemberId: null,
                classIds: [],
                assignmentDeadline: null,
                assignmentCredits: null,
                assignmentInstructions: null,
            },
        });

        return { success: true, message: "Mock assignment removed" };
    } catch (error: any) {
        console.error("Remove mock assignment error:", error);
        return { success: false, error: error.message || "Failed to remove mock assignment" };
    }
}

/**
 * Get student results for a mock interview assignment
 */
export async function getMockStudentResults(mockId: string) {
    try {
        const member = await getCurrentMember();

        // Verify access
        const mock = await prisma.mockInterviewVoice.findFirst({
            where: {
                id: mockId,
                universityId: member.universityId,
            },
            select: {
                classIds: true,
                title: true,
            },
        });

        if (!mock) {
            return { success: false, error: "Mock not found" };
        }

        // Get students from the assigned classes
        const classEnrollments = await prisma.classEnrollment.findMany({
            where: {
                classId: { in: mock.classIds },
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

        // Get user info
        const users = await prisma.user.findMany({
            where: { id: { in: studentUserIds } },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            },
        });
        const userMap = new Map(users.map(u => [u.id, u]));

        // Get sessions for these students
        const sessions = await prisma.mockVoiceSession.findMany({
            where: {
                mockId,
                userId: { in: studentUserIds },
            },
            select: {
                userId: true,
                status: true,
                startedAt: true,
                completedAt: true,
                duration: true,
                aiAnalysis: true,
                userRating: true,
            },
            orderBy: { createdAt: "desc" },
        });

        // Group sessions by user (take the latest)
        const sessionMap = new Map<string, typeof sessions[0]>();
        sessions.forEach(s => {
            if (!sessionMap.has(s.userId)) {
                sessionMap.set(s.userId, s);
            }
        });

        // Combine data
        const studentResults = studentUserIds.map(userId => {
            const user = userMap.get(userId);
            const session = sessionMap.get(userId);

            // Extract score from AI analysis if available
            let score: number | null = null;
            if (session?.aiAnalysis) {
                const analysis = session.aiAnalysis as any;
                score = analysis.overallScore || analysis.score || null;
            }

            return {
                user: user || { id: userId, name: null, email: null, image: null },
                status: session?.status || "not_started",
                startedAt: session?.startedAt || null,
                completedAt: session?.completedAt || null,
                duration: session?.duration || null,
                score,
                rating: session?.userRating || null,
            };
        });

        return {
            success: true,
            data: {
                mockTitle: mock.title,
                results: studentResults,
            },
        };
    } catch (error: any) {
        console.error("Get mock student results error:", error);
        return { success: false, error: error.message || "Failed to fetch student results" };
    }
}
