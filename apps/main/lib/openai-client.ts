import OpenAI from 'openai'

let _instance: OpenAI | null = null

function getInstance(): OpenAI {
    if (!_instance) {
        _instance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    }
    return _instance
}

// Proxy-based lazy singleton: defers instantiation until first property access.
// This prevents build failures when OPENAI_API_KEY is not set in the build environment.
export const openai = new Proxy({} as OpenAI, {
    get(_, prop) {
        return Reflect.get(getInstance(), prop)
    }
})
