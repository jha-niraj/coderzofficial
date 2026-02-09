"use server"

import { prisma } from "@repo/prisma";
import { auth } from "@repo/auth";
import type { UniversityPermission } from "@/types";

// ============================================
// TYPES
// ============================================

interface CreateAssessmentPayload {
    title: string;
    description: string;
    language: string; // Programming language or topic
    mode: "QUIZ" | "CODE" | "MIXED";
    difficulty: "EASY" | "MEDIUM" | "HARD";
    questionCount: number;
    timeLimit?: number; // in seconds
    // University-specific fields
    classIds: string[];
    deadline?: Date;
    credits?: number;
    instructions?: string;
    // Live session config
    isLiveSession?: boolean;
}

interface GenerateQuestionsPayload {
    assessmentId: string;
    topic: string;
    subtopics?: string[];
    questionTypes?: ("MCQ" | "MULTI_SELECT" | "TRUE_FALSE" | "CODING")[];
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

        // Create the assessment
        const assessment = await prisma.userPracticeSet.create({
            data: {
                creatorId: member.userId,
                title: payload.title,
                description: payload.description,
                slug: generateSlug(payload.title),
                language: payload.language as any,
                mode: payload.mode,
                difficulty: payload.difficulty as any,
                questionCount: payload.questionCount,
                timeLimit: payload.timeLimit || null,
                isPublic: false, // University assessments are private
                status: "DRAFT", // Will be set to READY after questions are generated
                creditsCost: 0, // No cost for university assessments
                // University-specific fields
                isUniversityAssessment: true,
                universityId: member.universityId,
                teacherMemberId: member.id,
                classIds: payload.classIds,
                assignmentDeadline: payload.deadline || null,
                assignmentCredits: payload.credits || null,
                assignmentInstructions: payload.instructions || null,
                // Live session config
                isLiveSession: payload.isLiveSession || false,
            },
        });

        return {
            success: true,
            data: {
                id: assessment.id,
                title: assessment.title,
                slug: assessment.slug,
            },
        };
    } catch (error: any) {
        console.error("Create assessment assignment error:", error);
        return { success: false, error: error.message || "Failed to create assessment assignment" };
    }
}

/**
 * Add questions to an assessment (manual or AI-generated)
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

        // Verify ownership
        const assessment = await prisma.userPracticeSet.findFirst({
            where: {
                id: assessmentId,
                universityId: member.universityId,
                OR: [
                    { teacherMemberId: member.id },
                    ...(member.role === "HEAD" ? [{ universityId: member.universityId }] : []),
                ],
            },
        });

        if (!assessment) {
            return { success: false, error: "Assessment not found or you don't have access" };
        }

        // Create questions
        const createdQuestions = await Promise.all(
            questions.map((q, index) => 
                prisma.userPracticeSetQuestion.create({
                    data: {
                        practiceSetId: assessmentId,
                        question: q.question,
                        type: q.type as any,
                        options: (q.options || []).filter(o => o.trim() !== '').map((opt, i) => ({
                            id: `opt-${i}`,
                            text: opt,
                            isCorrect: q.correctAnswer.includes(opt),
                        })),
                        correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer.join(',') : q.correctAnswer,
                        answerExplanation: q.explanation || null,
                        difficulty: (q.difficulty || assessment.difficulty) as any,
                        orderIndex: index,
                        codeSnippet: q.codeSnippet || null,
                        testCases: q.testCases || undefined,
                    },
                })
            )
        );

        // Update assessment status and question count
        await prisma.userPracticeSet.update({
            where: { id: assessmentId },
            data: {
                status: "GENERATING", // Mark as ready - status is UserContentStatus
                questionCount: createdQuestions.length,
            },
        });

        return {
            success: true,
            data: {
                questionsAdded: createdQuestions.length,
            },
        };
    } catch (error: any) {
        console.error("Add assessment questions error:", error);
        return { success: false, error: error.message || "Failed to add questions" };
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

        const whereClause: any = {
            isUniversityAssessment: true,
            universityId: member.universityId,
        };

        // If not HEAD, only show assessments they created
        if (member.role !== "HEAD") {
            whereClause.teacherMemberId = member.id;
        }

        // Filter by class if provided
        if (filters?.classId) {
            whereClause.classIds = { has: filters.classId };
        }

        // Filter by mode
        if (filters?.mode) {
            whereClause.mode = filters.mode;
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

        const assessments = await prisma.userPracticeSet.findMany({
            where: whereClause,
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                language: true,
                mode: true,
                difficulty: true,
                questionCount: true,
                timeLimit: true,
                status: true,
                classIds: true,
                assignmentDeadline: true,
                assignmentCredits: true,
                assignmentInstructions: true,
                isLiveSession: true,
                liveSessionActive: true,
                totalAttempts: true,
                avgScore: true,
                completions: true,
                createdAt: true,
                _count: {
                    select: {
                        attempts: true,
                        questions: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Get class names
        const allClassIds = assessments.flatMap(a => a.classIds);
        const classes = await prisma.universityClass.findMany({
            where: { id: { in: allClassIds } },
            select: { id: true, name: true, code: true },
        });
        const classMap = new Map(classes.map(c => [c.id, c]));

        // Enrich assessments
        const enrichedAssessments = assessments.map(assessment => ({
            ...assessment,
            classes: assessment.classIds.map(id => classMap.get(id)).filter(Boolean),
            questionsCount: assessment._count.questions,
            studentsAttempted: assessment._count.attempts,
        }));

        return {
            success: true,
            data: enrichedAssessments,
        };
    } catch (error: any) {
        console.error("Get assessment assignments error:", error);
        return { success: false, error: error.message || "Failed to fetch assessment assignments" };
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

        // Verify ownership
        const assessment = await prisma.userPracticeSet.findFirst({
            where: {
                id: assessmentId,
                universityId: member.universityId,
                OR: [
                    { teacherMemberId: member.id },
                    ...(member.role === "HEAD" ? [{ universityId: member.universityId }] : []),
                ],
            },
        });

        if (!assessment) {
            return { success: false, error: "Assessment not found or you don't have access" };
        }

        const updateData: any = {};
        if (updates.classIds !== undefined) updateData.classIds = updates.classIds;
        if (updates.deadline !== undefined) updateData.assignmentDeadline = updates.deadline;
        if (updates.credits !== undefined) updateData.assignmentCredits = updates.credits;
        if (updates.instructions !== undefined) updateData.assignmentInstructions = updates.instructions;
        if (updates.timeLimit !== undefined) updateData.timeLimit = updates.timeLimit;

        await prisma.userPracticeSet.update({
            where: { id: assessmentId },
            data: updateData,
        });

        return { success: true, message: "Assessment assignment updated" };
    } catch (error: any) {
        console.error("Update assessment assignment error:", error);
        return { success: false, error: error.message || "Failed to update assessment assignment" };
    }
}

/**
 * Remove assessment assignment
 */
export async function removeAssessmentAssignment(assessmentId: string) {
    try {
        const member = await getCurrentMember();

        const assessment = await prisma.userPracticeSet.findFirst({
            where: {
                id: assessmentId,
                universityId: member.universityId,
                OR: [
                    { teacherMemberId: member.id },
                    ...(member.role === "HEAD" ? [{ universityId: member.universityId }] : []),
                ],
            },
        });

        if (!assessment) {
            return { success: false, error: "Assessment not found or you don't have access" };
        }

        await prisma.userPracticeSet.update({
            where: { id: assessmentId },
            data: {
                isUniversityAssessment: false,
                universityId: null,
                teacherMemberId: null,
                classIds: [],
                assignmentDeadline: null,
                assignmentCredits: null,
                assignmentInstructions: null,
            },
        });

        return { success: true, message: "Assessment assignment removed" };
    } catch (error: any) {
        console.error("Remove assessment assignment error:", error);
        return { success: false, error: error.message || "Failed to remove assessment assignment" };
    }
}

/**
 * Get student results for an assessment
 */
export async function getAssessmentStudentResults(assessmentId: string) {
    try {
        const member = await getCurrentMember();

        // Verify access
        const assessment = await prisma.userPracticeSet.findFirst({
            where: {
                id: assessmentId,
                universityId: member.universityId,
            },
            select: {
                classIds: true,
                title: true,
                questionCount: true,
            },
        });

        if (!assessment) {
            return { success: false, error: "Assessment not found" };
        }

        // Get students from the assigned classes
        const classEnrollments = await prisma.classEnrollment.findMany({
            where: {
                classId: { in: assessment.classIds },
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

        // Get attempts for these students
        const attempts = await prisma.userPracticeSetAttempt.findMany({
            where: {
                practiceSetId: assessmentId,
                userId: { in: studentUserIds },
            },
            select: {
                userId: true,
                status: true,
                startedAt: true,
                completedAt: true,
                score: true,
                totalQuestions: true,
                correctCount: true,
                timeSpent: true,
            },
            orderBy: { createdAt: "desc" },
        });

        // Group attempts by user (take the best score)
        const attemptMap = new Map<string, typeof attempts[0]>();
        attempts.forEach(a => {
            const existing = attemptMap.get(a.userId);
            if (!existing || (a.score || 0) > (existing.score || 0)) {
                attemptMap.set(a.userId, a);
            }
        });

        // Combine data
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
    } catch (error: any) {
        console.error("Get assessment student results error:", error);
        return { success: false, error: error.message || "Failed to fetch student results" };
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

        const assessment = await prisma.userPracticeSet.findFirst({
            where: {
                id: assessmentId,
                universityId: member.universityId,
                isLiveSession: true,
                OR: [
                    { teacherMemberId: member.id },
                    ...(member.role === "HEAD" ? [{ universityId: member.universityId }] : []),
                ],
            },
        });

        if (!assessment) {
            return { success: false, error: "Assessment not found or not configured for live sessions" };
        }

        if (assessment.liveSessionActive) {
            return { success: false, error: "Live session is already active" };
        }

        await prisma.userPracticeSet.update({
            where: { id: assessmentId },
            data: {
                liveSessionActive: true,
                liveSessionStartedAt: new Date(),
            },
        });

        return { success: true, message: "Live session started" };
    } catch (error: any) {
        console.error("Start live session error:", error);
        return { success: false, error: error.message || "Failed to start live session" };
    }
}

/**
 * End a live session
 */
export async function endLiveSession(assessmentId: string) {
    try {
        const member = await getCurrentMember();

        const assessment = await prisma.userPracticeSet.findFirst({
            where: {
                id: assessmentId,
                universityId: member.universityId,
                liveSessionActive: true,
                OR: [
                    { teacherMemberId: member.id },
                    ...(member.role === "HEAD" ? [{ universityId: member.universityId }] : []),
                ],
            },
        });

        if (!assessment) {
            return { success: false, error: "Assessment not found or no active live session" };
        }

        await prisma.userPracticeSet.update({
            where: { id: assessmentId },
            data: {
                liveSessionActive: false,
                liveSessionEndedAt: new Date(),
            },
        });

        return { success: true, message: "Live session ended" };
    } catch (error: any) {
        console.error("End live session error:", error);
        return { success: false, error: error.message || "Failed to end live session" };
    }
}

/**
 * Get live session status with real-time participant info
 */
export async function getLiveSessionStatus(assessmentId: string) {
    try {
        const member = await getCurrentMember();

        const assessment = await prisma.userPracticeSet.findFirst({
            where: {
                id: assessmentId,
                universityId: member.universityId,
            },
            select: {
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

        // Get active participants (students who started during this session)
        const participants = await prisma.userPracticeSetAttempt.findMany({
            where: {
                practiceSetId: assessmentId,
                startedAt: assessment.liveSessionStartedAt ? { gte: assessment.liveSessionStartedAt } : undefined,
            },
            select: {
                userId: true,
                status: true,
                score: true,
                correctCount: true,
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
        });

        return {
            success: true,
            data: {
                assessment,
                participants,
                totalParticipants: participants.length,
                completedCount: participants.filter(p => p.status === "COMPLETED").length,
            },
        };
    } catch (error: any) {
        console.error("Get live session status error:", error);
        return { success: false, error: error.message || "Failed to get live session status" };
    }
}
