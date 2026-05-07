"use server";

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { getSession } from "@repo/auth";
import { headers } from "next/headers";

// ─────────────────────────────────────────────
// VOICE TOKEN GENERATION
// ─────────────────────────────────────────────

let _client: ElevenLabsClient | null = null;

function getElevenLabsClient(): ElevenLabsClient {
    if (!_client) {
        if (!process.env.ELEVENLABS_AI_KEY) {
            throw new Error("ELEVENLABS_AI_KEY is not configured");
        }
        _client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_AI_KEY });
    }
    return _client;
}

/**
 * Generate a single-use Scribe token for client-side speech-to-text.
 * The token is short-lived and scoped to the `realtime_scribe` product.
 * Used by the `useScribe` hook from `@elevenlabs/react` on the client.
 */
export async function getScribeToken(): Promise<
    { success: true; token: string } | { success: false; error: string }
> {
    const session = await getSession(await headers());
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const client = getElevenLabsClient();
        const tokenResponse = await client.tokens.singleUse.create("realtime_scribe");

        if (!tokenResponse?.token) {
            return { success: false, error: "Failed to generate voice token" };
        }

        return { success: true, token: tokenResponse.token };
    } catch (err) {
        console.error("[getScribeToken] Error:", err);
        return { success: false, error: "Voice service unavailable" };
    }
}

/**
 * Generate TTS audio for AI feedback using ElevenLabs Text-to-Speech.
 * Returns a base64-encoded audio string for client-side playback.
 */
export async function generateTTSAudio(
    text: string,
    voiceId: string = "JBFqnCBsd6RMkjVDRZzb" // George — professional male voice
): Promise<{ success: true; audioBase64: string } | { success: false; error: string }> {
    const session = await getSession(await headers());
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const client = getElevenLabsClient();

        const audioStream = await client.textToSpeech.convert(voiceId, {
            text,
            modelId: "eleven_turbo_v2_5",
            outputFormat: "mp3_44100_128",
        });

        // Collect chunks from the stream
        const chunks: Uint8Array[] = [];
        const reader = audioStream.getReader();
        let done = false;
        while (!done) {
            const result = await reader.read();
            done = result.done;
            if (result.value) {
                chunks.push(result.value);
            }
        }

        const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
        }

        const audioBase64 = Buffer.from(combined).toString("base64");
        return { success: true, audioBase64 };
    } catch (err) {
        console.error("[generateTTSAudio] Error:", err);
        return { success: false, error: "Text-to-speech unavailable" };
    }
}