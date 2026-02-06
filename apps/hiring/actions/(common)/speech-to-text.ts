"use server"

/**
 * Speech to Text Server Actions using ElevenLabs API
 * These actions provide speech-to-text functionality that can be reused across the platform
 */

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"

// Initialize ElevenLabs client lazily
function getElevenLabsClient() {
    return new ElevenLabsClient({
        apiKey: process.env.ELEVENLABS_API_KEY
    })
}

export interface TranscriptionResult {
    success: boolean
    text?: string
    error?: string
    words?: Array<{
        text: string
        start: number
        end: number
    }>
    language?: string
    confidence?: number
}

export interface TranscriptionOptions {
    languageCode?: string
    tagAudioEvents?: boolean
    diarize?: boolean
}

/**
 * Convert speech audio to text using ElevenLabs Scribe API
 * @param audioBase64 - Base64 encoded audio data
 * @param mimeType - The MIME type of the audio (e.g., "audio/webm", "audio/mp3")
 * @param options - Additional transcription options
 */
export async function transcribeAudio(
    audioBase64: string,
    mimeType: string = "audio/webm",
    options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
    try {
        if (!process.env.ELEVENLABS_API_KEY) {
            return {
                success: false,
                error: "ElevenLabs API key not configured"
            }
        }

        const elevenlabs = getElevenLabsClient()

        // Convert base64 to Blob
        const audioBuffer = Buffer.from(audioBase64, "base64")
        const audioBlob = new Blob([audioBuffer], { type: mimeType })

        // Call ElevenLabs Speech to Text API
        const transcription = await elevenlabs.speechToText.convert({
            file: audioBlob,
            modelId: "scribe_v1", // Using scribe_v1 for standard transcription
            languageCode: options.languageCode || "eng",
            tagAudioEvents: options.tagAudioEvents ?? false,
            diarize: options.diarize ?? false
        })

        // Extract the transcribed text
        if (transcription && typeof transcription === 'object' && 'text' in transcription) {
            return {
                success: true,
                text: (transcription as { text: string }).text,
                language: options.languageCode || "eng"
            }
        }

        // Handle different response formats
        if (typeof transcription === 'string') {
            return {
                success: true,
                text: transcription
            }
        }

        return {
            success: false,
            error: "Unexpected response format from ElevenLabs"
        }

    } catch (error) {
        console.error("Speech to text error:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to transcribe audio"
        }
    }
}

/**
 * Batch transcribe multiple audio files
 * @param audioFiles - Array of audio files with base64 data and mime types
 * @param options - Transcription options
 */
export async function batchTranscribeAudio(
    audioFiles: Array<{ base64: string; mimeType: string }>,
    options: TranscriptionOptions = {}
): Promise<TranscriptionResult[]> {
    const results = await Promise.all(
        audioFiles.map(file => transcribeAudio(file.base64, file.mimeType, options))
    )
    return results
}

/**
 * Simple helper to check if ElevenLabs is configured
 */
export async function checkSpeechToTextAvailability(): Promise<{ available: boolean; message?: string }> {
    if (!process.env.ELEVENLABS_API_KEY) {
        return {
            available: false,
            message: "Speech to text service is not configured"
        }
    }
    return { available: true }
}