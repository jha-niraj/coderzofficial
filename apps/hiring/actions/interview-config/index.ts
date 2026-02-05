"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"

// Types for interview process
export interface InterviewRoundInput {
    roundNumber: number
    roundType: string
    title: string
    durationMinutes?: number
    format?: string
    description: string
    whatToExpect?: string[]
    sampleQuestions?: string[]
    evaluationCriteria?: string[]
    topicsCovered?: string[]
    tipsForCandidates?: string[]
    passRatePercent?: number
    daysToNextRound?: number
    hasMockInterview?: boolean
    mockKnowledgeBase?: string
}

export interface InterviewProcessInput {
    name: string
    description?: string
    isDefault?: boolean
    estimatedDurationWeeks?: number
    rounds: InterviewRoundInput[]
}

// Get current user's company membership
async function getCompanyMember() {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const member = await prisma.companyMember.findFirst({
        where: { userId: session.user.id },
        include: { company: true }
    })

    if (!member) {
        throw new Error("Not a company member")
    }

    return member
}

// Check if user can manage interview config (FOUNDER, ADMIN, HIRING_MANAGER)
function canManageInterviewConfig(role: string): boolean {
    return ["FOUNDER", "ADMIN", "HIRING_MANAGER"].includes(role)
}

// Get all interview processes for a company
export async function getInterviewProcesses() {
    try {
        const member = await getCompanyMember()

        const processes = await prisma.interviewProcess.findMany({
            where: { companyId: member.companyId },
            include: {
                rounds: {
                    orderBy: { roundNumber: "asc" }
                },
                _count: {
                    select: { jobs: true }
                }
            },
            orderBy: [
                { isDefault: "desc" },
                { createdAt: "desc" }
            ]
        })

        return { success: true, data: processes }
    } catch (error) {
        console.error("Error fetching interview processes:", error)
        return { success: false, error: "Failed to fetch interview processes" }
    }
}

// Get a single interview process by ID
export async function getInterviewProcess(processId: string) {
    try {
        const member = await getCompanyMember()

        const process = await prisma.interviewProcess.findFirst({
            where: {
                id: processId,
                companyId: member.companyId
            },
            include: {
                rounds: {
                    orderBy: { roundNumber: "asc" }
                },
                jobs: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        status: true
                    }
                }
            }
        })

        if (!process) {
            return { success: false, error: "Interview process not found" }
        }

        return { success: true, data: process }
    } catch (error) {
        console.error("Error fetching interview process:", error)
        return { success: false, error: "Failed to fetch interview process" }
    }
}

// Create a new interview process
export async function createInterviewProcess(input: InterviewProcessInput) {
    try {
        const member = await getCompanyMember()

        if (!canManageInterviewConfig(member.role)) {
            return { success: false, error: "You don't have permission to create interview processes" }
        }

        // If this is set as default, unset other defaults
        if (input.isDefault) {
            await prisma.interviewProcess.updateMany({
                where: {
                    companyId: member.companyId,
                    isDefault: true
                },
                data: { isDefault: false }
            })
        }

        const process = await prisma.interviewProcess.create({
            data: {
                companyId: member.companyId,
                name: input.name,
                description: input.description,
                isDefault: input.isDefault ?? false,
                estimatedDurationWeeks: input.estimatedDurationWeeks,
                rounds: {
                    create: input.rounds.map((round) => ({
                        roundNumber: round.roundNumber,
                        roundType: round.roundType as any,
                        title: round.title,
                        durationMinutes: round.durationMinutes,
                        format: round.format as any ?? "VIDEO",
                        description: round.description,
                        whatToExpect: round.whatToExpect ?? [],
                        sampleQuestions: round.sampleQuestions ?? [],
                        evaluationCriteria: round.evaluationCriteria ?? [],
                        topicsCovered: round.topicsCovered ?? [],
                        tipsForCandidates: round.tipsForCandidates ?? [],
                        passRatePercent: round.passRatePercent,
                        daysToNextRound: round.daysToNextRound,
                        hasMockInterview: round.hasMockInterview ?? true,
                        mockKnowledgeBase: round.mockKnowledgeBase
                    }))
                }
            },
            include: {
                rounds: {
                    orderBy: { roundNumber: "asc" }
                }
            }
        })

        revalidatePath("/interview-config")
        return { success: true, data: process }
    } catch (error) {
        console.error("Error creating interview process:", error)
        return { success: false, error: "Failed to create interview process" }
    }
}

// Update an interview process
export async function updateInterviewProcess(processId: string, input: Partial<InterviewProcessInput>) {
    try {
        const member = await getCompanyMember()

        if (!canManageInterviewConfig(member.role)) {
            return { success: false, error: "You don't have permission to update interview processes" }
        }

        // Verify the process belongs to this company
        const existingProcess = await prisma.interviewProcess.findFirst({
            where: {
                id: processId,
                companyId: member.companyId
            }
        })

        if (!existingProcess) {
            return { success: false, error: "Interview process not found" }
        }

        // If this is set as default, unset other defaults
        if (input.isDefault) {
            await prisma.interviewProcess.updateMany({
                where: {
                    companyId: member.companyId,
                    isDefault: true,
                    id: { not: processId }
                },
                data: { isDefault: false }
            })
        }

        const process = await prisma.interviewProcess.update({
            where: { id: processId },
            data: {
                name: input.name,
                description: input.description,
                isDefault: input.isDefault,
                estimatedDurationWeeks: input.estimatedDurationWeeks
            },
            include: {
                rounds: {
                    orderBy: { roundNumber: "asc" }
                }
            }
        })

        revalidatePath("/interview-config")
        return { success: true, data: process }
    } catch (error) {
        console.error("Error updating interview process:", error)
        return { success: false, error: "Failed to update interview process" }
    }
}

// Delete an interview process
export async function deleteInterviewProcess(processId: string) {
    try {
        const member = await getCompanyMember()

        if (!canManageInterviewConfig(member.role)) {
            return { success: false, error: "You don't have permission to delete interview processes" }
        }

        // Verify the process belongs to this company
        const existingProcess = await prisma.interviewProcess.findFirst({
            where: {
                id: processId,
                companyId: member.companyId
            },
            include: {
                _count: { select: { jobs: true } }
            }
        })

        if (!existingProcess) {
            return { success: false, error: "Interview process not found" }
        }

        if (existingProcess._count.jobs > 0) {
            return { success: false, error: "Cannot delete: This process is linked to active jobs" }
        }

        await prisma.interviewProcess.delete({
            where: { id: processId }
        })

        revalidatePath("/interview-config")
        return { success: true }
    } catch (error) {
        console.error("Error deleting interview process:", error)
        return { success: false, error: "Failed to delete interview process" }
    }
}

// Add a round to an interview process
export async function addInterviewRound(processId: string, round: InterviewRoundInput) {
    try {
        const member = await getCompanyMember()

        if (!canManageInterviewConfig(member.role)) {
            return { success: false, error: "You don't have permission to modify interview rounds" }
        }

        // Verify the process belongs to this company
        const existingProcess = await prisma.interviewProcess.findFirst({
            where: {
                id: processId,
                companyId: member.companyId
            }
        })

        if (!existingProcess) {
            return { success: false, error: "Interview process not found" }
        }

        const newRound = await prisma.interviewRound.create({
            data: {
                processId: processId,
                roundNumber: round.roundNumber,
                roundType: round.roundType as any,
                title: round.title,
                durationMinutes: round.durationMinutes,
                format: round.format as any ?? "VIDEO",
                description: round.description,
                whatToExpect: round.whatToExpect ?? [],
                sampleQuestions: round.sampleQuestions ?? [],
                evaluationCriteria: round.evaluationCriteria ?? [],
                topicsCovered: round.topicsCovered ?? [],
                tipsForCandidates: round.tipsForCandidates ?? [],
                passRatePercent: round.passRatePercent,
                daysToNextRound: round.daysToNextRound,
                hasMockInterview: round.hasMockInterview ?? true,
                mockKnowledgeBase: round.mockKnowledgeBase
            }
        })

        revalidatePath("/interview-config")
        return { success: true, data: newRound }
    } catch (error) {
        console.error("Error adding interview round:", error)
        return { success: false, error: "Failed to add interview round" }
    }
}

// Update an interview round
export async function updateInterviewRound(roundId: string, input: Partial<InterviewRoundInput>) {
    try {
        const member = await getCompanyMember()

        if (!canManageInterviewConfig(member.role)) {
            return { success: false, error: "You don't have permission to modify interview rounds" }
        }

        // Verify the round belongs to this company
        const existingRound = await prisma.interviewRound.findFirst({
            where: { id: roundId },
            include: {
                process: {
                    select: { companyId: true }
                }
            }
        })

        if (!existingRound || existingRound.process.companyId !== member.companyId) {
            return { success: false, error: "Interview round not found" }
        }

        const round = await prisma.interviewRound.update({
            where: { id: roundId },
            data: {
                roundNumber: input.roundNumber,
                roundType: input.roundType as any,
                title: input.title,
                durationMinutes: input.durationMinutes,
                format: input.format as any,
                description: input.description,
                whatToExpect: input.whatToExpect,
                sampleQuestions: input.sampleQuestions,
                evaluationCriteria: input.evaluationCriteria,
                topicsCovered: input.topicsCovered,
                tipsForCandidates: input.tipsForCandidates,
                passRatePercent: input.passRatePercent,
                daysToNextRound: input.daysToNextRound,
                hasMockInterview: input.hasMockInterview,
                mockKnowledgeBase: input.mockKnowledgeBase
            }
        })

        revalidatePath("/interview-config")
        return { success: true, data: round }
    } catch (error) {
        console.error("Error updating interview round:", error)
        return { success: false, error: "Failed to update interview round" }
    }
}

// Delete an interview round
export async function deleteInterviewRound(roundId: string) {
    try {
        const member = await getCompanyMember()

        if (!canManageInterviewConfig(member.role)) {
            return { success: false, error: "You don't have permission to delete interview rounds" }
        }

        // Verify the round belongs to this company
        const existingRound = await prisma.interviewRound.findFirst({
            where: { id: roundId },
            include: {
                process: {
                    select: { companyId: true }
                }
            }
        })

        if (!existingRound || existingRound.process.companyId !== member.companyId) {
            return { success: false, error: "Interview round not found" }
        }

        await prisma.interviewRound.delete({
            where: { id: roundId }
        })

        revalidatePath("/interview-config")
        return { success: true }
    } catch (error) {
        console.error("Error deleting interview round:", error)
        return { success: false, error: "Failed to delete interview round" }
    }
}

// Check if company has any interview processes configured
export async function hasInterviewProcessConfigured() {
    try {
        const member = await getCompanyMember()

        const count = await prisma.interviewProcess.count({
            where: {
                companyId: member.companyId,
                isActive: true
            }
        })

        return { success: true, hasConfig: count > 0 }
    } catch (error) {
        console.error("Error checking interview config:", error)
        return { success: false, hasConfig: false }
    }
}

// Get interview process statistics
export async function getInterviewProcessStats() {
    try {
        const member = await getCompanyMember()

        const [processCount, totalRounds, jobsWithProcess] = await Promise.all([
            prisma.interviewProcess.count({
                where: { companyId: member.companyId, isActive: true }
            }),
            prisma.interviewRound.count({
                where: {
                    process: { companyId: member.companyId }
                }
            }),
            prisma.job.count({
                where: {
                    companyId: member.companyId,
                    interviewProcessId: { not: null }
                }
            })
        ])

        return {
            success: true,
            data: {
                processCount,
                totalRounds,
                jobsWithProcess
            }
        }
    } catch (error) {
        console.error("Error fetching interview stats:", error)
        return { success: false, error: "Failed to fetch statistics" }
    }
}

// Clone/Duplicate an interview process
export async function cloneInterviewProcess(processId: string, newName?: string) {
    try {
        const member = await getCompanyMember()

        if (!canManageInterviewConfig(member.role)) {
            return { success: false, error: "You don't have permission to clone interview processes" }
        }

        // Get the original process with all rounds
        const originalProcess = await prisma.interviewProcess.findFirst({
            where: {
                id: processId,
                companyId: member.companyId
            },
            include: {
                rounds: {
                    orderBy: { roundNumber: "asc" }
                }
            }
        })

        if (!originalProcess) {
            return { success: false, error: "Interview process not found" }
        }

        // Create the new process with cloned rounds
        const clonedProcess = await prisma.interviewProcess.create({
            data: {
                companyId: member.companyId,
                name: newName || `${originalProcess.name} (Copy)`,
                description: originalProcess.description,
                isDefault: false, // Never clone as default
                estimatedDurationWeeks: originalProcess.estimatedDurationWeeks,
                avgTimeToHireDays: originalProcess.avgTimeToHireDays,
                responseRatePercent: originalProcess.responseRatePercent,
                applicationToInterviewPercent: originalProcess.applicationToInterviewPercent,
                interviewToOfferPercent: originalProcess.interviewToOfferPercent,
                rounds: {
                    create: originalProcess.rounds.map(round => ({
                        roundNumber: round.roundNumber,
                        roundType: round.roundType,
                        title: round.title,
                        durationMinutes: round.durationMinutes,
                        format: round.format,
                        description: round.description,
                        whatToExpect: round.whatToExpect as any,
                        sampleQuestions: round.sampleQuestions as any,
                        evaluationCriteria: round.evaluationCriteria as any,
                        topicsCovered: round.topicsCovered as any,
                        tipsForCandidates: round.tipsForCandidates as any,
                        passRatePercent: round.passRatePercent,
                        daysToNextRound: round.daysToNextRound,
                        hasMockInterview: round.hasMockInterview,
                        mockKnowledgeBase: round.mockKnowledgeBase
                    }))
                }
            },
            include: {
                rounds: {
                    orderBy: { roundNumber: "asc" }
                }
            }
        })

        revalidatePath("/interview-config")
        return { success: true, data: clonedProcess }
    } catch (error) {
        console.error("Error cloning interview process:", error)
        return { success: false, error: "Failed to clone interview process" }
    }
}

// Reorder interview rounds
export async function reorderInterviewRounds(processId: string, roundIds: string[]) {
    try {
        const member = await getCompanyMember()

        if (!canManageInterviewConfig(member.role)) {
            return { success: false, error: "You don't have permission to reorder interview rounds" }
        }

        // Verify the process belongs to this company
        const existingProcess = await prisma.interviewProcess.findFirst({
            where: {
                id: processId,
                companyId: member.companyId
            }
        })

        if (!existingProcess) {
            return { success: false, error: "Interview process not found" }
        }

        // Update each round with new order
        await Promise.all(
            roundIds.map((roundId, index) =>
                prisma.interviewRound.update({
                    where: { id: roundId },
                    data: { roundNumber: index + 1 }
                })
            )
        )

        revalidatePath("/interview-config")
        return { success: true }
    } catch (error) {
        console.error("Error reordering interview rounds:", error)
        return { success: false, error: "Failed to reorder rounds" }
    }
}

// Get round templates (pre-built templates for common round types)
export async function getRoundTemplates() {
    return {
        success: true,
        data: [
            {
                roundType: "PHONE_SCREEN",
                title: "Phone Screen",
                durationMinutes: 30,
                format: "VOICE",
                description: "Initial phone conversation to assess basic qualifications and cultural fit.",
                whatToExpect: [
                    "Brief introduction and company overview",
                    "Discussion of your background and experience",
                    "Basic technical questions related to the role",
                    "Salary expectations and availability"
                ],
                tipsForCandidates: [
                    "Have your resume ready for reference",
                    "Be prepared to discuss your career goals",
                    "Research the company beforehand",
                    "Have questions ready about the role"
                ]
            },
            {
                roundType: "TECHNICAL_CODING",
                title: "Technical Coding Round",
                durationMinutes: 60,
                format: "LIVE_CODING",
                description: "Coding interview to assess problem-solving skills and coding ability.",
                whatToExpect: [
                    "1-2 coding problems of medium difficulty",
                    "Focus on data structures and algorithms",
                    "Code review and optimization discussion",
                    "Time to ask clarifying questions"
                ],
                tipsForCandidates: [
                    "Practice on LeetCode or HackerRank",
                    "Think out loud while solving problems",
                    "Start with brute force, then optimize",
                    "Test your code with edge cases"
                ]
            },
            {
                roundType: "SYSTEM_DESIGN",
                title: "System Design Round",
                durationMinutes: 60,
                format: "WHITEBOARD",
                description: "Design discussion to evaluate architectural thinking and scalability knowledge.",
                whatToExpect: [
                    "Design a large-scale system from scratch",
                    "Discussion of trade-offs and decisions",
                    "Deep dive into specific components",
                    "Questions about scalability and reliability"
                ],
                tipsForCandidates: [
                    "Clarify requirements before designing",
                    "Start with high-level architecture",
                    "Consider scalability from the beginning",
                    "Discuss trade-offs openly"
                ]
            },
            {
                roundType: "BEHAVIORAL",
                title: "Behavioral Round",
                durationMinutes: 45,
                format: "VIDEO",
                description: "Interview to assess soft skills, teamwork, and cultural fit.",
                whatToExpect: [
                    "Questions about past experiences",
                    "Situational scenarios",
                    "Discussion of teamwork and leadership",
                    "Questions about handling conflict"
                ],
                tipsForCandidates: [
                    "Use the STAR method (Situation, Task, Action, Result)",
                    "Prepare specific examples from your experience",
                    "Be honest about challenges and failures",
                    "Show self-awareness and growth mindset"
                ]
            },
            {
                roundType: "TAKE_HOME",
                title: "Take-Home Assignment",
                durationMinutes: 180,
                format: "TAKE_HOME",
                description: "A practical project to demonstrate your skills in a realistic setting.",
                whatToExpect: [
                    "A real-world problem to solve",
                    "3-5 days to complete typically",
                    "Clear requirements and deliverables",
                    "Follow-up discussion about your solution"
                ],
                tipsForCandidates: [
                    "Read all requirements carefully",
                    "Manage your time effectively",
                    "Write clean, documented code",
                    "Include a README with setup instructions"
                ]
            },
            {
                roundType: "HIRING_MANAGER",
                title: "Hiring Manager Round",
                durationMinutes: 45,
                format: "VIDEO",
                description: "Final discussion with the hiring manager about the role and team.",
                whatToExpect: [
                    "Deep dive into your experience",
                    "Discussion of team dynamics",
                    "Questions about career goals",
                    "Opportunity to ask detailed questions"
                ],
                tipsForCandidates: [
                    "Prepare thoughtful questions about the team",
                    "Be ready to discuss your long-term goals",
                    "Show genuine interest in the role",
                    "Be yourself - this is about mutual fit"
                ]
            }
        ]
    }
}