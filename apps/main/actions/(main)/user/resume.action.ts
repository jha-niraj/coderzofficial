"use server"

import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { db, users } from "@repo/db"
import { eq } from "drizzle-orm"
import {
    S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client for Supabase Storage
const s3Client = new S3Client({
    forcePathStyle: true,
    region: process.env.SUPABASE_REGION || 'us-east-1',
    endpoint: process.env.SUPABASE_STORAGE_ENDPOINT,
    credentials: {
        accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY!,
    },
})

const BUCKET_NAME = 'userresume'

export async function uploadResume(file: File, resumeText?: string) {
    const session = await getSession(headers())
    if (!session?.user?.id) {
        throw new Error("You must be logged in to upload a resume")
    }

    const userId = session.user.id

    // Check if S3 is properly configured
    if (!process.env.SUPABASE_STORAGE_ENDPOINT ||
        !process.env.SUPABASE_ACCESS_KEY_ID ||
        !process.env.SUPABASE_SECRET_ACCESS_KEY) {
        console.warn("S3/Supabase storage is not configured. Saving resume text only.")

        // Save resume text to database without file upload
        if (resumeText) {
            await db.update(users).set({
                hasResume: true,
                resumeText: resumeText,
            }).where(eq(users.id, userId))
            revalidatePath("/profile")
            return { success: true, url: undefined, message: "Resume text saved (file upload disabled)" }
        }

        return { success: false, url: undefined, message: "Storage not configured and no resume text provided" }
    }

    try {
        // Convert file to buffer
        const buffer = await file.arrayBuffer()
        const uint8Buffer = new Uint8Array(buffer)

        // Generate unique filename
        const timestamp = Date.now()
        const fileName = `${userId}-${timestamp}-${file.name}`

        // Upload to Supabase Storage S3
        const uploadCommand = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: uint8Buffer,
            ContentType: file.type,
            Metadata: {
                userId: userId,
                originalName: file.name,
                uploadDate: new Date().toISOString(),
            },
        })

        await s3Client.send(uploadCommand)

        console.log("Resume uploaded successfully:", fileName)

        // Update user record in database with FILE PATH (not signed URL)
        // We'll generate signed URLs on-demand when needed
        await db.update(users).set({
            hasResume: true,
            resume: fileName, // Store the file path, not the URL
            ...(resumeText && { resumeText }), // Only update if text is provided
        }).where(eq(users.id, userId))

        // Generate a signed URL for immediate use (7 days expiration)
        const signedUrl = await generateSignedUrl(fileName, 7 * 24 * 60 * 60) // 7 days in seconds

        revalidatePath("/profile")
        return { success: true, url: signedUrl }

    } catch (error) {
        console.error("Resume upload failed:", error)

        // If upload fails but we have resume text, save that at least
        if (resumeText) {
            try {
                await db.update(users).set({
                    hasResume: true,
                    resumeText: resumeText,
                }).where(eq(users.id, userId))
                revalidatePath("/profile")
                return {
                    success: true,
                    url: undefined,
                    message: "Resume text saved but file upload failed. Please check storage configuration."
                }
            } catch (dbError) {
                console.error("Failed to save resume text:", dbError)
            }
        }

        throw new Error("Failed to upload resume. Please try again or contact support if the issue persists.")
    }
}

// Helper function to generate signed URL (can be called anytime)
async function generateSignedUrl(fileName: string, expiresIn: number = 7 * 24 * 60 * 60): Promise<string> {
    try {
        const getCommand = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
        })

        const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn })
        return signedUrl
    } catch (error) {
        console.error("Failed to generate signed URL:", error)
        throw new Error("Failed to generate access URL for resume")
    }
}

export async function deleteResume() {
    const session = await getSession(headers())
    if (!session?.user?.id) {
        throw new Error("You must be logged in to delete your resume")
    }

    const userId = session.user.id

    try {
        // Get current user to find the resume file
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                hasResume: true,
                resume: true,
            },
        })

        // Delete from S3 if resume exists
        if (user?.hasResume && user?.resume) {
            try {
                // user.resume now contains the file path directly
                const fileName = user.resume

                const deleteCommand = new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: fileName,
                })

                await s3Client.send(deleteCommand)
                console.log("Resume deleted from S3:", fileName)
            } catch (error) {
                console.error("Failed to delete resume from S3:", error)
                // Continue with database update even if S3 deletion fails
            }
        }

        // Update user record and clear resume text
        await db.update(users).set({
            hasResume: false,
            resume: null,
            resumeText: null,
        }).where(eq(users.id, userId))

        revalidatePath("/profile")
        return { success: true }

    } catch (error) {
        console.error("Resume deletion failed:", error)
        throw new Error("Failed to delete resume. Please try again.")
    }
}

export async function getResume() {
    const session = await getSession(headers())
    if (!session?.user?.id) {
        return null
    }

    const userId = session.user.id

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                hasResume: true,
                resume: true,
            },
        })

        if (!user?.hasResume || !user?.resume) {
            return null
        }

        // Generate a fresh signed URL (7 days expiration)
        const signedUrl = await generateSignedUrl(user.resume, 7 * 24 * 60 * 60)

        // Extract original filename from the stored path
        const originalName = user.resume.split('-').slice(2).join('-') || 'resume.pdf'

        return {
            url: signedUrl,
            name: originalName
        }

    } catch (error) {
        console.error("Failed to fetch resume:", error)
        return null
    }
}

// Public function to get a fresh signed URL (can be called from components)
export async function getResumeSignedUrl(expiresIn: number = 7 * 24 * 60 * 60) {
    const session = await getSession(headers())
    if (!session?.user?.id) {
        return null
    }

    const userId = session.user.id

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                hasResume: true,
                resume: true,
            },
        })

        if (!user?.hasResume || !user?.resume) {
            return null
        }

        // user.resume now contains the file path (not URL)
        const fileName = user.resume

        // Generate a fresh signed URL
        const signedUrl = await generateSignedUrl(fileName, expiresIn)

        // Extract original filename
        const originalName = fileName.split('-').slice(2).join('-') || 'resume.pdf'

        return {
            url: signedUrl,
            name: originalName
        }

    } catch (error) {
        console.error("Failed to generate signed URL:", error)
        return null
    }
}
