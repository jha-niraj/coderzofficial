"use client"

import { create } from 'zustand'

interface AuthDialogState {
    open: boolean
    callbackUrl?: string
    openAuth: (options?: { callbackUrl?: string }) => void
    closeAuth: () => void
}

export const useAuthDialog = create<AuthDialogState>((set) => ({
    open: false,
    callbackUrl: undefined,
    openAuth: (options) => set({
        open: true,
        callbackUrl: options?.callbackUrl
    }),
    closeAuth: () => set({
        open: false,
        callbackUrl: undefined
    }),
}))
