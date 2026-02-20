declare module '@elevenlabs/client' {
    export class Conversation {
        static startSession(...args: any[]): Promise<any>
        prototype: any
    }
}

declare module '@elevenlabs/client/dist/utils/events' {
    export interface ErrorMessageEvent {
        error_event?: {
            error_type?: string
            type?: string
            message?: string
            reason?: string
            code?: string | number
            debug_message?: string
            details?: unknown
        }
        code?: string | number
        debug_message?: string
        details?: unknown
    }
}