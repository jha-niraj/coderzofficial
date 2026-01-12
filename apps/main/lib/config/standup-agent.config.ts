/**
 * ElevenLabs Agent Configuration for Daily Standups
 * 
 * This file contains the configuration data needed to set up an ElevenLabs
 * Conversational AI agent for conducting daily standup meetings.
 * 
 * Usage:
 * 1. Go to ElevenLabs Dashboard: https://elevenlabs.io/app/conversational-ai
 * 2. Create a new Agent with the configurations below
 * 3. Copy the Agent ID and set it as NEXT_PUBLIC_STANDUP_AGENT_ID in your .env
 */

export const STANDUP_AGENT_CONFIG = {
    /**
     * Agent Name
     */
    name: "Daily Standup Scrum Master",

    /**
     * Agent Description
     */
    description: "A friendly and professional AI Scrum Master that conducts daily standup meetings with team members, asking about progress, plans, and blockers.",

    /**
     * Voice Configuration
     * Available voices: https://elevenlabs.io/docs/conversational-ai/voices
     */
    voice: {
        // Recommended: Professional, clear voices
        voiceId: "pNInz6obpgDQGcFmaJgB", // Adam - Professional male voice
        // Alternatives:
        // "EXAVITQu4vr4xnSDxMaL" - Bella - Professional female voice
        // "ErXwobaYiN019PkySvjV" - Antoni - Warm male voice
        // "MF3mGyEYCl7XYWbV9V6O" - Elli - Young professional female voice
    },

    /**
     * System Prompt Template
     * Variables like {{project_name}} and {{user_name}} will be replaced at runtime
     */
    systemPrompt: `You are a friendly and professional Scrum Master conducting a daily standup meeting.

CONTEXT:
- Project: {{project_name}}
- Team Member: {{user_name}}
- Date: {{current_date}}
{{#if previous_standup}}
- Previous standup context available
{{/if}}

YOUR ROLE:
1. Greet the team member warmly and professionally
2. Ask the three standup questions one at a time:
   - What did you accomplish yesterday (or since your last standup)?
   - What do you plan to work on today?
   - Do you have any blockers or need help with anything?
3. Listen actively and ask clarifying questions when needed
4. Keep the conversation focused and time-efficient (5-10 minutes max)
5. Summarize the key points at the end
6. Provide encouragement and close the standup positively

CONVERSATION STYLE:
- Professional but warm and approachable
- Supportive and encouraging
- Concise but thorough
- Focus on understanding their progress and challenges
- Never interrupt or rush the speaker

IMPORTANT BEHAVIORS:
- If an answer is vague, ask follow-up questions to get specifics
- Help identify potential risks or blockers proactively
- Celebrate accomplishments, no matter how small
- When blockers are mentioned, offer to note them for follow-up
- Keep track of what was planned vs completed
- End with a clear summary of what was discussed

SAFETY:
- Stay on topic related to work and project progress
- Redirect off-topic conversations politely
- Don't provide technical advice outside of standup facilitation`,

    /**
     * First Message Template
     */
    firstMessage: "Good {{time_of_day}}, {{user_name}}! Ready for your daily standup for {{project_name}}? Let's make this quick and productive. First, what did you work on since your last standup?",

    /**
     * Agent Behavior Settings
     */
    settings: {
        // How long to wait before responding (ms)
        responseDelay: 500,

        // Maximum conversation duration (minutes)
        maxDuration: 15,

        // Enable/disable interruption
        allowInterruption: true,

        // Enable/disable active listening cues
        activeListen: true,

        // Language settings
        language: "en",

        // Temperature for response generation (0-1)
        temperature: 0.7,

        // Stability for voice (0-1)
        stability: 0.75,

        // Similarity boost for voice (0-1)
        similarityBoost: 0.75,
    },

    /**
     * Conversation Analysis Settings
     * Configure what insights to extract from the conversation
     */
    analysis: {
        extractTasks: true,
        extractBlockers: true,
        extractMood: true,
        summarize: true,
    },

    /**
     * Cost Estimate (per session)
     * Based on average standup duration
     */
    costEstimate: {
        averageDurationMinutes: 7,
        creditsPerSession: 5,
    }
}

/**
 * Environment Variables Required
 * Add these to your .env.local file
 */
export const REQUIRED_ENV_VARS = {
    // Your ElevenLabs API Key
    ELEVENLABS_API_KEY: "your_elevenlabs_api_key_here",

    // The Agent ID from ElevenLabs Dashboard
    NEXT_PUBLIC_STANDUP_AGENT_ID: "your_standup_agent_id_here",
}

/**
 * Runtime Variables
 * These are passed when starting a session
 */
export interface StandupSessionVariables {
    user_name: string
    project_name: string
    project_id: string
    current_date: string
    time_of_day: 'morning' | 'afternoon' | 'evening'
    previous_standup?: {
        date: string
        completed_tasks: string[]
        planned_tasks: string[]
        blockers: string[]
    }
}

/**
 * Generate session variables for the standup
 */
export function generateStandupVariables(
    userName: string,
    projectName: string,
    projectId: string,
    previousStandup?: {
        date: string
        completedTasks: string[]
        plannedTasks: string[]
        blockers?: string[]
    }
): StandupSessionVariables {
    const now = new Date()
    const hour = now.getHours()

    let timeOfDay: 'morning' | 'afternoon' | 'evening'
    if (hour < 12) timeOfDay = 'morning'
    else if (hour < 17) timeOfDay = 'afternoon'
    else timeOfDay = 'evening'

    return {
        user_name: userName,
        project_name: projectName,
        project_id: projectId,
        current_date: now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        time_of_day: timeOfDay,
        ...(previousStandup && {
            previous_standup: {
                date: previousStandup.date,
                completed_tasks: previousStandup.completedTasks,
                planned_tasks: previousStandup.plannedTasks,
                blockers: previousStandup.blockers || []
            }
        })
    }
}

/**
 * Agent Overrides for ElevenLabs startSession
 * Use this when calling conversation.startSession()
 */
export function getStandupAgentOverrides(variables: StandupSessionVariables) {
    const prompt = STANDUP_AGENT_CONFIG.systemPrompt
        .replace(/\{\{project_name\}\}/g, variables.project_name)
        .replace(/\{\{user_name\}\}/g, variables.user_name)
        .replace(/\{\{current_date\}\}/g, variables.current_date)
        .replace(/\{\{#if previous_standup\}\}[\s\S]*?\{\{\/if\}\}/g,
            variables.previous_standup ? '- Previous standup info is available for context' : ''
        )

    const firstMessage = STANDUP_AGENT_CONFIG.firstMessage
        .replace(/\{\{time_of_day\}\}/g, variables.time_of_day)
        .replace(/\{\{user_name\}\}/g, variables.user_name)
        .replace(/\{\{project_name\}\}/g, variables.project_name)

    return {
        agent: {
            prompt: {
                prompt
            },
            firstMessage
        }
    }
}