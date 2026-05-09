"use server"

import { openai } from '@/lib/openai-client'
import { transcribeWithElevenLabs } from "@/lib/elevenlabs-speech"


const BULLET_SYSTEM = `You are a professional resume writer. Your task is to convert the given text into professional resume bullet points.
Rules:
1. Output ONLY bullet points, one per line
2. Each bullet should start with a strong action verb (e.g., Developed, Implemented, Led, Designed)
3. Include quantifiable results when possible (%, numbers, scale)
4. Use past tense for past roles
5. Be concise and impactful
6. Output plain text, one bullet per line, no markdown or numbering
7. 3-6 bullets is ideal`

export async function polishWorkExperienceBullets(text: string): Promise<{ success: boolean; bullets?: string; error?: string }> {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return { success: false, error: "AI is not configured" }
        }
        if (!text?.trim()) {
            return { success: false, error: "No text to polish" }
        }

        const res = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: BULLET_SYSTEM },
                {
                    role: "user",
                    content: `Convert this into professional resume bullet points (one per line):\n\n${text.trim()}`,
                },
            ],
            max_tokens: 500,
            temperature: 0.5,
        })

        const bullets = res.choices[0]?.message?.content?.trim()
        if (!bullets) return { success: false, error: "No response from AI" }

        return { success: true, bullets }
    } catch (err) {
        console.error("Resume AI polish error:", err)
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to polish",
        }
    }
}

export async function transcribeAndPolishWorkExperience(audioBase64: string, mimeType: string): Promise<{ success: boolean; bullets?: string; error?: string }> {
    try {
        if (!process.env.ELEVENLABS_AI_KEY) {
            return { success: false, error: "Voice transcription is not configured" }
        }

        const buffer = Buffer.from(audioBase64, "base64")
        const blob = new Blob([buffer], { type: mimeType })
        const file = new File([blob], "recording.webm", { type: mimeType })

        const transcriptRes = await transcribeWithElevenLabs(file, {
            timestamps_granularity: "none",
            tag_audio_events: false,
        })

        if (!transcriptRes.success || !transcriptRes.data?.transcript) {
            return { success: false, error: transcriptRes.error || "Transcription failed" }
        }

        return polishWorkExperienceBullets(transcriptRes.data.transcript)
    } catch (err) {
        console.error("Voice + polish error:", err)
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to process",
        }
    }
}
