"use server"

import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { db, users } from "@repo/db"
import { eq } from "drizzle-orm"
import { uploadToR2, deleteFromR2, getR2SignedUrl, isR2Configured } from "@/lib/r2-client"

async function extractTextFromPDFBuffer(buffer: ArrayBuffer): Promise<string> {
    try {
        const { extractText } = await import("unpdf")
        const uint8 = new Uint8Array(buffer)
        const { text } = await extractText(uint8, { mergePages: true })
        return text?.trim() ?? ""
    } catch (error) {
        console.error("unpdf extraction error:", error)
        return ""
    }
}

async function extractTextFromDOCXBuffer(buffer: ArrayBuffer): Promise<string> {
    try {
        const mammoth = await import("mammoth")
        const result = await mammoth.extractRawText({ arrayBuffer: buffer })
        return result.value?.trim() ?? ""
    } catch {
        return ""
    }
}

export async function extractResumeText(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    const isDocx =
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.toLowerCase().endsWith(".docx")

    if (isPdf) return extractTextFromPDFBuffer(buffer)
    if (isDocx) return extractTextFromDOCXBuffer(buffer)
    return ""
}

export async function uploadResume(file: File, _resumeText?: string) {
    const session = await getSession(headers())
    if (!session?.user?.id) {
        throw new Error("You must be logged in to upload a resume")
    }
    const userId = session.user.id

    // Server-side text extraction using unpdf
    const buffer = await file.arrayBuffer()
    let resumeText = _resumeText ?? ""
    if (!resumeText) {
        resumeText = await extractTextFromPDFBuffer(buffer).catch(() => "")
        if (!resumeText) {
            const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
            const isDocx =
                file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                file.name.toLowerCase().endsWith(".docx")
            if (!isPdf && isDocx) {
                resumeText = await extractTextFromDOCXBuffer(buffer).catch(() => "")
            }
        }
    }
    if (resumeText.length > 50000) resumeText = resumeText.substring(0, 50000)

    if (!isR2Configured()) {
        console.warn("R2 storage not configured. Saving resume text only.")
        if (resumeText) {
            await db.update(users).set({ hasResume: true, resumeText }).where(eq(users.id, userId))
            revalidatePath("/profile")
            return { success: true, url: undefined, message: "Resume text saved (file upload disabled)" }
        }
        return { success: false, url: undefined, message: "Storage not configured and no resume text provided" }
    }

    try {
        const timestamp = Date.now()
        const fileName = `resumes/${userId}-${timestamp}-${file.name}`

        await uploadToR2({
            key: fileName,
            body: new Uint8Array(buffer),
            contentType: file.type,
            metadata: { userId, originalName: file.name, uploadDate: new Date().toISOString() },
        })

        await db.update(users).set({
            hasResume: true,
            resume: fileName,
            ...(resumeText && { resumeText }),
        }).where(eq(users.id, userId))

        const signedUrl = await getR2SignedUrl(fileName)
        revalidatePath("/profile")
        return { success: true, url: signedUrl }
    } catch (error) {
        console.error("Resume upload failed:", error)
        if (resumeText) {
            await db.update(users).set({ hasResume: true, resumeText }).where(eq(users.id, userId))
            revalidatePath("/profile")
            return { success: true, url: undefined, message: "Resume text saved but file upload failed." }
        }
        throw new Error("Failed to upload resume. Please try again.")
    }
}

export async function deleteResume() {
    const session = await getSession(headers())
    if (!session?.user?.id) {
        throw new Error("You must be logged in to delete your resume")
    }
    const userId = session.user.id

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { hasResume: true, resume: true },
        })

        if (user?.hasResume && user?.resume) {
            try {
                await deleteFromR2(user.resume)
            } catch (error) {
                console.error("Failed to delete resume from R2:", error)
            }
        }

        await db.update(users).set({ hasResume: false, resume: null, resumeText: null }).where(eq(users.id, userId))
        revalidatePath("/profile")
        return { success: true }
    } catch (error) {
        console.error("Resume deletion failed:", error)
        throw new Error("Failed to delete resume. Please try again.")
    }
}

export async function getResume() {
    const session = await getSession(headers())
    if (!session?.user?.id) return null
    const userId = session.user.id

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { hasResume: true, resume: true },
        })

        if (!user?.hasResume || !user?.resume) return null

        const signedUrl = await getR2SignedUrl(user.resume)
        const originalName = user.resume.split("-").slice(2).join("-") || "resume.pdf"
        return { url: signedUrl, name: originalName }
    } catch (error) {
        console.error("Failed to fetch resume:", error)
        return null
    }
}

export async function getResumeSignedUrl(expiresIn = 7 * 24 * 60 * 60) {
    const session = await getSession(headers())
    if (!session?.user?.id) return null
    const userId = session.user.id

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { hasResume: true, resume: true },
        })

        if (!user?.hasResume || !user?.resume) return null

        const signedUrl = await getR2SignedUrl(user.resume, expiresIn)
        const originalName = user.resume.split("-").slice(2).join("-") || "resume.pdf"
        return { url: signedUrl, name: originalName }
    } catch (error) {
        console.error("Failed to generate signed URL:", error)
        return null
    }
}
