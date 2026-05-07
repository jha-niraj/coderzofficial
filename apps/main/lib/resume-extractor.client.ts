/**
 * Resume file validation (client-side only)
 * Text extraction is handled server-side via unpdf
 */

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

export function validateResumeFile(file: File): { valid: boolean; error?: string } {
    if (!file) return { valid: false, error: "No file provided" }
    if (file.size > MAX_SIZE) return { valid: false, error: "File is too large. Maximum size is 5MB." }
    const isAllowed =
        ALLOWED_TYPES.includes(file.type) ||
        file.name.toLowerCase().endsWith(".pdf") ||
        file.name.toLowerCase().endsWith(".docx") ||
        file.name.toLowerCase().endsWith(".doc")
    if (!isAllowed) return { valid: false, error: "Unsupported format. Please upload PDF, DOC, or DOCX." }
    return { valid: true }
}

/**
 * Extract text from a DOCX file using mammoth (browser-compatible).
 * For PDFs, extraction is handled server-side using unpdf.
 */
export async function extractTextFromResume(file: File): Promise<{
    success: boolean
    text?: string
    error?: string
}> {
    const validation = validateResumeFile(file)
    if (!validation.valid) return { success: false, error: validation.error }

    const isDocx =
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.toLowerCase().endsWith(".docx")

    if (isDocx) {
        try {
            const mammoth = await import("mammoth")
            const buffer = await file.arrayBuffer()
            const result = await mammoth.extractRawText({ arrayBuffer: buffer })
            const text = result.value?.trim() ?? ""
            if (text.length < 20) return { success: false, error: "Could not extract enough text from DOCX." }
            return { success: true, text: text.substring(0, 50000) }
        } catch {
            return { success: false, error: "Failed to extract text from DOCX file." }
        }
    }

    // For PDFs and other formats, extraction will happen on the server
    return { success: true, text: undefined }
}

export function formatResumeForAI(resumeText: string): string {
    return resumeText
        .replace(/\s+/g, " ")
        .replace(/\.\s+/g, ".\n")
        .replace(/:\s+/g, ":\n")
        .trim()
}
