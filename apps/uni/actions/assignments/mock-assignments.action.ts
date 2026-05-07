"use server"

import { db, mockInterviewVoice, mockVoiceSession, universityClasses, classEnrollments, users } from "@repo/db"
import { eq, and, inArray, desc } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import type { UniversityPermission } from "@/types";

// ============================================
// TYPES
// ============================================

interface CreateMockAssignmentPayload {
    title: string;
    description: string;
    category: "TECHNICAL" | "BEHAVIORAL" | "HR" | "SYSTEM_DESIGN" | "CODING" | "GENERAL";
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
    duration: number;
    questionsCount: number;
    knowledgeBase: string;
    tags: string[];
    classIds: string[];
    deadline?: Date;
    credits?: number;
    instructions?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getCurrentMember() {
    const session = await getSession(headers());
    if (!session?.user?.id) throw new Error("Not authenticated");

    const member = await db.query.universityMembers.findFirst({
        where: (tbl, { eq }) => eq(tbl.userId, session.user.id),
        with: {
            university: { columns: { id: true, name: true } },
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

        if (!await hasPermission(member, "create_assignments")) {
            return { success: false, error: "You don't have permission to create assignments" };
        }

        if (payload.classIds.length === 0) {
            return { success: false, error: "Please select at least one class" };
        }

        const validClasses = await db.query.universityClasses.findMany({
            where: and(
                inArray(universityClasses.id, payload.classIds),
                eq(universityClasses.universityId, member.universityId),
            ),
        });

        if (validClasses.length !== payload.classIds.length) {
            return { success: false, error: "Invalid class selection" };
        }

        const mockRows = await db.insert(mockInterviewVoice).values({
            title: payload.title,
            description: payload.description,
            category: payload.category,
            level: payload.level,
            duration: payload.duration,
            questionsCount: payload.questionsCount,
            knowledgeBase: payload.knowledgeBase,
            tags: payload.tags,
            isPublic: false,
            isPredefined: false,
            createdById: member.userId,
            isUniversityMock: true,
            universityId: member.universityId,
            teacherMemberId: member.id,
            classIds: payload.classIds,
            assignmentDeadline: payload.deadline || null,
            assignmentCredits: payload.credits || null,
            assignmentInstructions: payload.instructions || null,
            creditsRequired: payload.credits || 15,
        }).returning();

        const mock = mockRows[0];
        if (!mock) {
            return { success: false, error: "Failed to create mock assignment" };
        }

        return {
            success: true,
            data: {
                id: mock.id,
                title: mock.title,
            },
        };
    } catch (error: unknown) {
        console.error("Create mock assignment error:", error);
        return { success: false, error: (error as Error).message || "Failed to create mock assignment" };
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

        const mocks = await db.query.mockInterviewVoice.findMany({
            where: (tbl, { and, eq }) => {
                const conditions = [
                    eq(tbl.isUniversityMock, true),
                    eq(tbl.universityId, member.universityId),
                ]
                if (member.role !== "HEAD") {
                    conditions.push(eq(tbl.teacherMemberId, member.id))
                }
                return and(...conditions)
            },
            orderBy: desc(mockInterviewVoice.createdAt),
        });

        // Apply class and status filters in-memory
        let filtered = mocks
        if (filters?.classId) {
            filtered = filtered.filter(m => m.classIds.includes(filters.classId!))
        }
        if (filters?.status === "active") {
            filtered = filtered.filter(m => !m.assignmentDeadline || m.assignmentDeadline >= new Date())
        } else if (filters?.status === "past") {
            filtered = filtered.filter(m => m.assignmentDeadline && m.assignmentDeadline < new Date())
        }

        // Get class names
        const allClassIds = filtered.flatMap(m => m.classIds)
        const classes = allClassIds.length > 0
            ? await db.query.universityClasses.findMany({
                where: inArray(universityClasses.id, allClassIds),
                columns: { id: true, name: true, code: true },
            })
            : []
        const classMap = new Map(classes.map(c => [c.id, c]))

        const enrichedMocks = filtered.map(mock => ({
            ...mock,
            classes: mock.classIds.map(id => classMap.get(id)).filter(Boolean),
        }));

        return {
            success: true,
            data: enrichedMocks,
        };
    } catch (error: unknown) {
        console.error("Get mock assignments error:", error);
        return { success: false, error: (error as Error).message || "Failed to fetch mock assignments" };
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

        const mock = await db.query.mockInterviewVoice.findFirst({
            where: and(
                eq(mockInterviewVoice.id, mockId),
                eq(mockInterviewVoice.universityId, member.universityId),
            ),
        });

        if (!mock) {
            return { success: false, error: "Mock not found or you don't have access" };
        }

        const updateData: Record<string, unknown> = {};
        if (updates.classIds !== undefined) updateData.classIds = updates.classIds;
        if (updates.deadline !== undefined) updateData.assignmentDeadline = updates.deadline;
        if (updates.credits !== undefined) {
            updateData.assignmentCredits = updates.credits;
            updateData.creditsRequired = updates.credits;
        }
        if (updates.instructions !== undefined) updateData.assignmentInstructions = updates.instructions;

        await db.update(mockInterviewVoice).set(updateData).where(eq(mockInterviewVoice.id, mockId));

        return { success: true, message: "Mock assignment updated" };
    } catch (error: unknown) {
        console.error("Update mock assignment error:", error);
        return { success: false, error: (error as Error).message || "Failed to update mock assignment" };
    }
}

/**
 * Remove mock assignment
 */
export async function removeMockAssignment(mockId: string) {
    try {
        const member = await getCurrentMember();

        const mock = await db.query.mockInterviewVoice.findFirst({
            where: and(
                eq(mockInterviewVoice.id, mockId),
                eq(mockInterviewVoice.universityId, member.universityId),
            ),
        });

        if (!mock) {
            return { success: false, error: "Mock not found or you don't have access" };
        }

        await db.update(mockInterviewVoice).set({
            isUniversityMock: false,
            universityId: null,
            teacherMemberId: null,
            classIds: [],
            assignmentDeadline: null,
            assignmentCredits: null,
            assignmentInstructions: null,
        }).where(eq(mockInterviewVoice.id, mockId));

        return { success: true, message: "Mock assignment removed" };
    } catch (error: unknown) {
        console.error("Remove mock assignment error:", error);
        return { success: false, error: (error as Error).message || "Failed to remove mock assignment" };
    }
}

/**
 * Get student results for a mock interview assignment
 */
export async function getMockStudentResults(mockId: string) {
    try {
        const member = await getCurrentMember();

        const mock = await db.query.mockInterviewVoice.findFirst({
            where: and(
                eq(mockInterviewVoice.id, mockId),
                eq(mockInterviewVoice.universityId, member.universityId),
            ),
            columns: { classIds: true, title: true },
        });

        if (!mock) {
            return { success: false, error: "Mock not found" };
        }

        // Get students from the assigned classes
        const classEnrollmentRows = mock.classIds.length > 0
            ? await db.query.classEnrollments.findMany({
                where: and(
                    inArray(classEnrollments.classId, mock.classIds),
                    eq(classEnrollments.isActive, true),
                ),
                with: {
                    studentLink: { columns: { userId: true } },
                },
            })
            : []

        const studentUserIds = classEnrollmentRows.map(ce => ce.studentLink.userId)

        const userRows = studentUserIds.length > 0
            ? await db.query.users.findMany({
                where: inArray(users.id, studentUserIds),
                columns: { id: true, name: true, email: true, image: true },
            })
            : []
        const userMap = new Map(userRows.map(u => [u.id, u]))

        // Get sessions for these students
        const sessions = studentUserIds.length > 0
            ? await db.query.mockVoiceSession.findMany({
                where: and(
                    eq(mockVoiceSession.mockId, mockId),
                    inArray(mockVoiceSession.userId, studentUserIds),
                ),
                orderBy: desc(mockVoiceSession.createdAt),
            })
            : []

        // Group sessions by user (take the latest)
        const sessionMap = new Map<string, (typeof sessions)[0]>();
        sessions.forEach((s) => {
            if (!sessionMap.has(s.userId)) {
                sessionMap.set(s.userId, s);
            }
        });

        const studentResults = studentUserIds.map(userId => {
            const user = userMap.get(userId);
            const session = sessionMap.get(userId);

            let score: number | null = null;
            if (session?.aiAnalysis) {
                const analysis = session.aiAnalysis as Record<string, number>;
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
    } catch (error: unknown) {
        console.error("Get mock student results error:", error);
        return { success: false, error: (error as Error).message || "Failed to fetch student results" };
    }
}
