"use server"

import { auth } from '@repo/auth'
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"

export async function checkUsernameAvailability(username: string) {
    try {
        // Validate username format
        if (!username || username.length < 3 || username.length > 20) {
            return {
                available: false,
                message: "Username must be between 3 and 20 characters"
            }
        }

        // Check if username contains only valid characters (alphanumeric, underscore, hyphen)
        const validUsernameRegex = /^[a-zA-Z0-9_-]+$/
        if (!validUsernameRegex.test(username)) {
            return {
                available: false,
                message: "Username can only contain letters, numbers, underscores, and hyphens"
            }
        }

        // Check if username exists
        const existingUser = await prisma.user.findUnique({
            where: { username: username.toLowerCase() },
        })

        if (existingUser) {
            return {
                available: false,
                message: "Username is already taken"
            }
        }

        return {
            available: true,
            message: "Username is available"
        }
    } catch (error) {
        console.error("Error checking username availability:", error)
        return {
            available: false,
            message: "Error checking username availability"
        }
    }
}

export async function completeOnboarding(data: {
    username: string
    university?: string
    semester?: string
    resume?: string
    resumeText?: string
    learningPreferences?: string[]
    careerGoals?: string[]
    targetCompanies?: string[]
    expectedSalary?: string
    noticePeriod?: string
    workExperience?: string
    location?: string
}) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("You must be logged in to complete onboarding")
    }

    const userId = session.user.id

    try {
        // Check username availability again before updating
        const usernameCheck = await checkUsernameAvailability(data.username)
        if (!usernameCheck.available) {
            throw new Error(usernameCheck.message)
        }

        // Update user with onboarding data
        await prisma.user.update({
            where: { id: userId },
            data: {
                username: data.username.toLowerCase(),
                university: data.university || null,
                semester: data.semester || null,
                resume: data.resume || null,
                resumeText: data.resumeText || null,
                hasResume: data.resume ? true : false,
                learningPreferences: data.learningPreferences || [],
                careerGoals: data.careerGoals || [],
                targetCompanies: data.targetCompanies || [],
                expectedSalary: data.expectedSalary || null,
                noticePeriod: data.noticePeriod || null,
                workExperience: data.workExperience || null,
                location: data.location || null,
                onboardingCompleted: true,
            },
        })

        revalidatePath("/")
        return { success: true }

    } catch (error) {
        console.error("Onboarding completion failed:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to complete onboarding")
    }
}

export async function checkOnboardingStatus() {
    const session = await auth()
    if (!session?.user?.id) {
        return { completed: false }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                onboardingCompleted: true,
            },
        })

        return { completed: user?.onboardingCompleted || false }
    } catch (error) {
        console.error("Error checking onboarding status:", error)
        return { completed: false }
    }
}