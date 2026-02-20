'use client'

import { useConversation as useElevenLabsConversation } from '@elevenlabs/react'

import { ensureElevenLabsErrorPatch } from './patch-client-errors'

ensureElevenLabsErrorPatch()

type UseConversationArgs = Parameters<typeof useElevenLabsConversation>[0]

export function useConversation(options: UseConversationArgs) {
    return useElevenLabsConversation(options)
}