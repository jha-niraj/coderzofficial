/**
 * AI API pricing constants for Pathfinder credit calculations.
 * Sources: https://openai.com/api/pricing, https://exa.ai/pricing
 * Last updated: February 2025
 */

// -----------------------------------------------------------------------------
// OPENAI (GPT-4o-mini - used for sub-goal content, verification, etc.)
// -----------------------------------------------------------------------------
export const OPENAI_PRICING = {
    // GPT-4o-mini: $0.15/1M input, $0.60/1M output tokens
    gpt4oMini: {
        inputPerMillion: 0.15,
        outputPerMillion: 0.6,
    },
} as const

// -----------------------------------------------------------------------------
// EXA AI (Answer/Search API - used for videos & documentation)
// -----------------------------------------------------------------------------
// ~$5 per 1,000 answers; we estimate ~1 call per sub-goal = $0.005 per call
export const EXA_PRICING = {
    answerPerCall: 0.005, // Approximate cost per answer call
} as const

// -----------------------------------------------------------------------------
// CREDIT CONVERSION (platform credits)
// 1 credit = base unit. Map USD cost to credits.
// Adjust this based on your credit-to-currency ratio.
// -----------------------------------------------------------------------------
export const CREDIT_RATES = {
    // 1 credit ≈ $0.01 USD (100 credits = $1)
    usdPerCredit: 0.01,
    // Or: 1 credit = X input tokens for gpt-4o-mini
    tokensPerCreditInput: 66_667,  // 1 credit ≈ 66K input tokens at $0.15/1M
    tokensPerCreditOutput: 16_667, // 1 credit ≈ 16K output tokens at $0.60/1M
} as const

// -----------------------------------------------------------------------------
// PATHFINDER-SPECIFIC COSTS
// -----------------------------------------------------------------------------
export const PATHFINDER_CREDITS = {
    /** Private goal creation */
    privateGoalCreation: 5,
    /** Public goal creation */
    publicGoalCreation: 0,
    /** Verification fixed fee (refund based on score) */
    verificationFee: 20,
    /** Block AI usage when pending cost reaches this */
    usageBlockThreshold: 10,
    /** Verification section weights: Quiz 30%, Coding 35%, Mock 35% */
    verificationWeights: {
        quiz: 0.3,
        coding: 0.35,
        mock: 0.35,
    },
} as const

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

/**
 * Convert OpenAI tokens to credit cost (gpt-4o-mini).
 */
export function openaiTokensToCredits(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1_000_000) * OPENAI_PRICING.gpt4oMini.inputPerMillion
    const outputCost = (outputTokens / 1_000_000) * OPENAI_PRICING.gpt4oMini.outputPerMillion
    const usdTotal = inputCost + outputCost
    return Math.ceil(usdTotal / CREDIT_RATES.usdPerCredit)
}

/**
 * Convert Exa call to credit cost.
 */
export function exaCallToCredits(): number {
    const usd = EXA_PRICING.answerPerCall
    return Math.ceil(usd / CREDIT_RATES.usdPerCredit)
}