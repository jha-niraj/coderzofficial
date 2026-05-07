"use server";

import { getSession } from "@repo/auth";
import { headers } from "next/headers";

const ELEVENLABS_API = "https://api.elevenlabs.io/v1";

function getApiKey(): string {
    const key = process.env.ELEVENLABS_AI_KEY;
    if (!key) throw new Error("ELEVENLABS_AI_KEY is not configured");
    return key;
}

export async function getScribeToken(): Promise<
    { success: true; token: string } | { success: false; error: string }
> {
    const session = await getSession(await headers());
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const apiKey = getApiKey();
        const response = await fetch(`${ELEVENLABS_API}/tokens/single-use`, {
            method: "POST",
            headers: {
                "xi-api-key": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ type: "realtime_scribe" }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`ElevenLabs token error ${response.status}: ${err}`);
        }

        const data = await response.json() as { token?: string };
        if (!data?.token) {
            return { success: false, error: "Failed to generate voice token" };
        }

        return { success: true, token: data.token };
    } catch (err) {
        console.error("[getScribeToken] Error:", err);
        return { success: false, error: "Voice service unavailable" };
    }
}

export async function generateTTSAudio(
    text: string,
    voiceId: string = "JBFqnCBsd6RMkjVDRZzb"
): Promise<{ success: true; audioBase64: string } | { success: false; error: string }> {
    const session = await getSession(await headers());
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const apiKey = getApiKey();
        const response = await fetch(`${ELEVENLABS_API}/text-to-speech/${voiceId}`, {
            method: "POST",
            headers: {
                "xi-api-key": apiKey,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg",
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_turbo_v2_5",
                output_format: "mp3_44100_128",
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`ElevenLabs TTS error ${response.status}: ${err}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioBase64 = Buffer.from(arrayBuffer).toString("base64");
        return { success: true, audioBase64 };
    } catch (err) {
        console.error("[generateTTSAudio] Error:", err);
        return { success: false, error: "Text-to-speech unavailable" };
    }
}
