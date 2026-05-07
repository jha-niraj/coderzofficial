"use server"

import { db, userPracticeSets, userPracticeSetQuestions, userPracticeSetAttempts, universityClasses, classEnrollments, users } from "@repo/db"
import { eq, and, inArray, desc } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import type { UniversityPermission } from "@/types";

// ============================================
// TYPES
// ============================================

interface CreateAssessmentPayload {
    title: string;
    description: string;
    language: string;
    mode: "QUIZ" | "CODE" | "MIXED";
    difficulty: "EASY" | "MEDIUM" | "HARD";
    questionCount: number;
    timeLimit?: number;
    classIds: string[];
    deadline?: Date;
    credits?: number;
    instructions?: string;
    isLiveSession?: boolean;
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

function generateSlug(title: string): string {
    const base = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${base}-${suffix}`;
}

// ============================================
// ASSESSMENT ASSIGNMENT ACTIONS
// ============================================

/**
 * Create a new quiz/assessment assignment for university students
 */
export async function createAssessmentAssignment(payload: CreateAssessmentPayload) {
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

        const assessmentRows = await db.insert(userPracticeSets).values({
            creatorId: member.userId,
            title: payload.title,
            description: payload.description,
            slug: generateSlug(payload.title),
            language: payload.language as "JAVASCRIPT" | "PYTHON" | "C" | "CPP" | "REACTJS" | "TYPESCRIPT" | "JAVA" | "GO" | "RUST",
            mode: payload.mode,
            difficulty: payload.difficulty as "EASY" | "INTERMEDIATE" | "HARD",
            questionCount: payload.questionCount,
            timeLimit: payload.timeLimit || null,
            isPublic: false,
            status: "DRAFT",
            creditsCost: 0,
            isUniversityAssessment: true,
            universityId: member.universityId,
            teacherMemberId: member.id,
            classIds: payload.classIds,
            assignmentDeadline: payload.deadline || null,
            assignmentCredits: payload.credits || null,
            assignmentInstructions: payload.instructions || null,
            isLiveSession: payload.isLiveSession || false,
        }).returning();

        const assessment = assessmentRows[0];
        if (!assessment) {
            return { success: false, error: "Failed to create assessment" };
        }

        return {
            success: true,
            data: {
                id: assessment.id,
                title: assessment.title,
                slug: assessment.slug,
            },
        };
    } catch (error: unknown) {
        console.error("Create assessment assignment error:", error);
        return { success: false, error: (error as Error).message || "Failed to create assessment assignment" };
    }
}

/**
 * Add questions to an assessment
 */
export async function addAssessmentQuestions(
    assessmentId: string,
    questions: Array<{
        question: string;
        type: "MCQ" | "MULTI_SELECT" | "TRUE_FALSE" | "CODING";
        options?: string[];
        correctAnswer: string | string[];
        explanation?: string;
        difficulty?: "EASY" | "MEDIUM" | "HARD";
        codeSnippet?: string;
        testCases?: Array<{ input: string; expectedOutput: string }>;
    }>
) {
    try {
        const member = await getCurrentMember();

        const assessment = await db.query.userPracticeSets.findFirst({
            where: and(
                eq(userPracticeSets.id, assessmentId),
                eq(userPracticeSets.universityId, member.universityId),
            ),
        });

        if (!assessment) {
            return { success: false, error: "Assessment not found or you don't have access" };
        }

        // Create questions via direct db inserts
        const createdQuestions = await Promise.all(
            questions.map((q, index) =>
                db.insert(userPracticeSetQuestions).values({
                    practiceSetId: assessmentId,
                    question: q.question,
                    type: q.type as "MCQ" | "MULTIPLE_SELECT" | "CODE_OUTPUT" | "CODE_WRITE" | "CODE_DEBUG" | "CODE_COMPLETE" | "SCENARIO" | "TRUE_FALSE",
                    options: (q.options || []).filter(o => o.trim() !== '').map((opt, i) => ({
                        id: `opt-${i}`,
                        text: opt,
                        isCorrect: q.correctAnswer.includes(opt),
                    })),
                    correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer.join(',') : q.correctAnswer,
                    answerExplanation: q.explanation || null,
                    difficulty: (q.difficulty || assessment.difficulty) as "EASY" | "INTERMEDIATE" | "HARD",
                    orderIndex: index,
                    codeSnippet: q.codeSnippet || null,
                    testCases: q.testCases || undefined,
                }).returning()
            )
        );

        await db.update(userPracticeSets).set({
            status: "GENERATING",
            questionCount: createdQuestions.length,
        }).where(eq(userPracticeSets.id, assessmentId));

        return {
            success: true,
            data: {
                questionsAdded: createdQuestions.length,
            },
        };
    } catch (error: unknown) {
        console.error("Add assessment questions error:", error);
        return { success: false, error: (error as Error).message || "Failed to add questions" };
    }
}

/**
 * Get all assessment assignments for the teacher's university
 */
export async function getAssessmentAssignments(filters?: {
    classId?: string;
    status?: "active" | "past" | "all";
    mode?: "QUIZ" | "CODE" | "MIXED";
}) {
    try {
        const member = await getCurrentMember();

        const assessments = await db.query.userPracticeSets.findMany({
            where: (tbl, { and, eq }) => {
                const conditions = [
                    eq(tbl.isUniversityAssessment, true),
                    eq(tbl.universityId, member.universityId),
                ]
                if (member.role !== "HEAD") {
                    conditions.push(eq(tbl.teacherMemberId, member.id))
                }
                if (filters?.mode) conditions.push(eq(tbl.mode, filters.mode))
                return and(...conditions)
            },
            orderBy: desc(userPracticeSets.createdAt),
        });

        // Apply class and status filters in-memory (array contains not easily done in drizzle)
        let filtered = assessments
        if (filters?.classId) {
            filtered = filtered.filter(a => a.classIds.includes(filters.classId!))
        }
        if (filters?.status === "active") {
            filtered = filtered.filter(a => !a.assignmentDeadline || a.assignmentDeadline >= new Date())
        } else if (filters?.status === "past") {
            filtered = filtered.filter(a => a.assignmentDeadline && a.assignmentDeadline < new Date())
        }

        // Get class names
        const allClassIds = filtered.flatMap(a => a.classIds)
        const classes = allClassIds.length > 0
            ? await db.query.universityClasses.findMany({
                where: inArray(universityClasses.id, allClassIds),
                columns: { id: true, name: true, code: true },
            })
            : []
        const classMap = new Map(classes.map(c => [c.id, c]))

        const enrichedAssessments = filtered.map(assessment => ({
            ...assessment,
            classes: assessment.classIds.map(id => classMap.get(id)).filter(Boolean),
        }));

        return {
            success: true,
            data: enrichedAssessments,
        };
    } catch (error: unknown) {
        console.error("Get assessment assignments error:", error);
        return { success: false, error: (error as Error).message || "Failed to fetch assessment assignments" };
    }
}

/**
 * Update assessment assignment details
 */
export async function updateAssessmentAssignment(
    assessmentId: string,
    updates: {
        classIds?: string[];
        deadline?: Date | null;
        credits?: number | null;
        instructions?: string | null;
        timeLimit?: number | null;
    }
) {
    try {
        const member = await getCurrentMember();

        const assessment = await db.query.userPracticeSets.findFirst({
            where: and(
                eq(userPracticeSets.id, assessmentId),
                eq(userPracticeSets.universityId, member.universityId),
            ),
        });

        if (!assessment) {
            return { success: false, error: "Assessment not found or you don't have access" };
        }

        const updateData: Record<string, unknown> = {};
        if (updates.classIds !== undefined) updateData.classIds = updates.classIds;
        if (updates.deadline !== undefined) updateData.assignmentDeadline = updates.deadline;
        if (updates.credits !== undefined) updateData.assignmentCredits = updates.credits;
        if (updates.instructions !== undefined) updateData.assignmentInstructions = updates.instructions;
        if (updates.timeLimit !== undefined) updateData.timeLimit = updates.timeLimit;

        await db.update(userPracticeSets).set(updateData).where(eq(userPracticeSets.id, assessmentId));

        return { success: true, message: "Assessment assignment updated" };
    } catch (error: unknown) {
        console.error("Update assessment assignment error:", error);
        return { success: false, error: (error as Error).message || "Failed to update assessment assignment" };
    }
}

/**
 * Remove assessment assignment
 */
export async function removeAssessmentAssignment(assessmentId: string) {
    try {
        const member = await getCurrentMember();

        const assessment = await db.query.userPracticeSets.findFirst({
            where: and(
                eq(userPracticeSets.id, assessmentId),
                eq(userPracticeSets.universityId, member.universityId),
            ),
        });

        if (!assessment) {
            return { success: false, error: "Assessment not found or you don't have access" };
        }

        await db.update(userPracticeSets).set({
            isUniversityAssessment: false,
            universityId: null,
            teacherMemberId: null,
            classIds: [],
            assignmentDeadline: null,
            assignmentCredits: null,
            assignmentInstructions: null,
        }).where(eq(userPracticeSets.id, assessmentId));

        return { success: true, message: "Assessment assignment removed" };
    } catch (error: unknown) {
        console.error("Remove assessment assignment error:", error);
        return { success: false, error: (error as Error).message || "Failed to remove assessment assignment" };
    }
}

/**
 * Get student results for an assessment
 */
export async function getAssessmentStudentResults(assessmentId: string) {
    try {
        const member = await getCurrentMember();

        const assessment = await db.query.userPracticeSets.findFirst({
            where: and(
                eq(userPracticeSets.id, assessmentId),
                eq(userPracticeSets.universityId, member.universityId),
            ),
            columns: { classIds: true, title: true, questionCount: true },
        });

        if (!assessment) {
            return { success: false, error: "Assessment not found" };
        }

        // Get students from the assigned classes
        const classEnrollmentRows = assessment.classIds.length > 0
            ? await db.query.classEnrollments.findMany({
                where: and(
                    inArray(classEnrollments.classId, assessment.classIds),
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

        // Get attempts
        const attempts = studentUserIds.length > 0
            ? await db.query.userPracticeSetAttempts.findMany({
                where: and(
                    eq(userPracticeSetAttempts.practiceSetId, assessmentId),
                    inArray(userPracticeSetAttempts.userId, studentUserIds),
                ),
            })
            : []

        // Group attempts by user (take the best score)
        const attemptMap = new Map<string, (typeof attempts)[0]>();
        attempts.forEach((a) => {
            const existing = attemptMap.get(a.userId);
            if (!existing || (a.score || 0) > (existing.score || 0)) {
                attemptMap.set(a.userId, a);
            }
        });

        const studentResults = studentUserIds.map(userId => {
            const user = userMap.get(userId);
            const attempt = attemptMap.get(userId);

            return {
                user: user || { id: userId, name: null, email: null, image: null },
                status: attempt?.status || "not_started",
                startedAt: attempt?.startedAt || null,
                completedAt: attempt?.completedAt || null,
                score: attempt?.score || null,
                totalQuestions: attempt?.totalQuestions || assessment.questionCount,
                correctAnswers: attempt?.correctCount || 0,
                timeSpent: attempt?.timeSpent || null,
            };
        });

        return {
            success: true,
            data: {
                assessmentTitle: assessment.title,
                results: studentResults,
            },
        };
    } catch (error: unknown) {
        console.error("Get assessment student results error:", error);
        return { success: false, error: (error as Error).message || "Failed to fetch student results" };
    }
}

// ============================================
// LIVE SESSION ACTIONS
// ============================================

/**
 * Start a live session for an assessment
 */
export async function startLiveSession(assessmentId: string) {
    try {
        const member = await getCurrentMember();

        const assessment = await db.query.userPracticeSets.findFirst({
            where: and(
                eq(userPracticeSets.id, assessmentId),
                eq(userPracticeSets.universityId, member.universityId),
                eq(userPracticeSets.isLiveSession, true),
            ),
        });

        if (!assessment) {
            return { success: false, error: "Assessment not found or not configured for live sessions" };
        }

        if (assessment.liveSessionActive) {
            return { success: false, error: "Live session is already active" };
        }

        await db.update(userPracticeSets).set({
            liveSessionActive: true,
            liveSessionStartedAt: new Date(),
        }).where(eq(userPracticeSets.id, assessmentId));

        return { success: true, message: "Live session started" };
    } catch (error: unknown) {
        console.error("Start live session error:", error);
        return { success: false, error: (error as Error).message || "Failed to start live session" };
    }
}

/**
 * End a live session
 */
export async function endLiveSession(assessmentId: string) {
    try {
        const member = await getCurrentMember();

        const assessment = await db.query.userPracticeSets.findFirst({
            where: and(
                eq(userPracticeSets.id, assessmentId),
                eq(userPracticeSets.universityId, member.universityId),
                eq(userPracticeSets.liveSessionActive, true),
            ),
        });

        if (!assessment) {
            return { success: false, error: "Assessment not found or no active live session" };
        }

        await db.update(userPracticeSets).set({
            liveSessionActive: false,
            liveSessionEndedAt: new Date(),
        }).where(eq(userPracticeSets.id, assessmentId));

        return { success: true, message: "Live session ended" };
    } catch (error: unknown) {
        console.error("End live session error:", error);
        return { success: false, error: (error as Error).message || "Failed to end live session" };
    }
}

/**
 * Get live session status
 */
export async function getLiveSessionStatus(assessmentId: string) {
    try {
        const member = await getCurrentMember();

        const assessment = await db.query.userPracticeSets.findFirst({
            where: and(
                eq(userPracticeSets.id, assessmentId),
                eq(userPracticeSets.universityId, member.universityId),
            ),
            columns: {
                id: true,
                title: true,
                isLiveSession: true,
                liveSessionActive: true,
                liveSessionStartedAt: true,
                liveSessionEndedAt: true,
                questionCount: true,
                timeLimit: true,
                classIds: true,
            },
        });

        if (!assessment) {
            return { success: false, error: "Assessment not found" };
        }

        return {
            success: true,
            data: {
                assessment,
                participants: [],
                totalParticipants: 0,
                completedCount: 0,
            },
        };
    } catch (error: unknown) {
        console.error("Get live session status error:", error);
        return { success: false, error: (error as Error).message || "Failed to get live session status" };
    }
}
