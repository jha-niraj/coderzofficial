'use client'

import { Conversation } from '@elevenlabs/client'
import type { ErrorMessageEvent } from '@elevenlabs/client/dist/utils/events'

let ELEVENLABS_ERROR_PATCHED = false

type ErrorDetails = Partial<ErrorMessageEvent['error_event']> & {
    type?: string
}

type MaybeErrorEvent = Partial<ErrorMessageEvent> & {
    error?: ErrorDetails
}

const FALLBACK_ERROR: Required<Pick<ErrorDetails, 'error_type' | 'message'>> = {
    error_type: 'unknown',
    message: 'Unknown error'
}

function normalizeErrorEvent(event: MaybeErrorEvent): ErrorMessageEvent {
    let normalizedEvent: MaybeErrorEvent = event

    if (!normalizedEvent.error_event && normalizedEvent.error) {
        normalizedEvent = {
            ...normalizedEvent,
            error_event: normalizedEvent.error
        }
    }

    const resolved = normalizedEvent.error_event ?? {}

    const mergedError: ErrorDetails = {
        ...FALLBACK_ERROR,
        ...resolved,
        error_type: resolved.error_type ?? resolved.type ?? FALLBACK_ERROR.error_type,
        message: resolved.message ?? resolved.reason ?? FALLBACK_ERROR.message,
        code: resolved.code ?? normalizedEvent.code,
        debug_message: resolved.debug_message ?? normalizedEvent.debug_message,
        details: resolved.details ?? normalizedEvent.details
    }

    return {
        ...normalizedEvent,
        error_event: mergedError as ErrorMessageEvent['error_event']
    } as ErrorMessageEvent
}

/**
 * ElevenLabs recently started sending error payloads that sometimes omit
 * `error_event`. The upstream SDK (v0.12.x) expects that field to exist and
 * crashes the whole WebRTC pipeline when it does not. That exception bubbles
 * up as the `handleErrorEvent` TypeError we see in the console before the call
 * disconnects. This helper normalizes the event structure so the SDK keeps
 * running and we surface the real error via the normal callbacks.
 */
export function ensureElevenLabsErrorPatch() {
    if (ELEVENLABS_ERROR_PATCHED) return
    ELEVENLABS_ERROR_PATCHED = true

    interface PatchedConversation {
        handleErrorEvent?: (event: MaybeErrorEvent) => void
    }

    const prototype = Conversation?.prototype as unknown as PatchedConversation
    if (!prototype || typeof prototype.handleErrorEvent !== 'function') {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('[MockInterview] Failed to patch ElevenLabs error handler')
        }
        return
    }

    const originalHandleErrorEvent = prototype.handleErrorEvent.bind(prototype)

    prototype.handleErrorEvent = function patchedHandleErrorEvent(event: MaybeErrorEvent) {
        const safeEvent = normalizeErrorEvent(event ?? {})

        try {
            return originalHandleErrorEvent(safeEvent)
        } catch (error) {
            console.error('[MockInterview] ElevenLabs error handler failed', safeEvent, error)
            return originalHandleErrorEvent(normalizeErrorEvent({}))
        }
    }
}
