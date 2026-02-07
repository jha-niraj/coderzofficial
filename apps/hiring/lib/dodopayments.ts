import DodoPayments from 'dodopayments';

// Use server-side only API key
const apiKey = process.env.DODO_PAYMENTS_API_KEY;

if (!apiKey) {
    console.warn('DODO_PAYMENTS_API_KEY is not set in environment variables');
}

export const dodoClient = apiKey ? new DodoPayments({
    bearerToken: apiKey,
    environment: process.env.NODE_ENV === 'production' ? 'live_mode' : 'test_mode',
}) : null;

// Subscription plan configurations for Hiring Platform
export const HIRING_SUBSCRIPTION_PLANS = {
    FREE: {
        name: 'Free',
        priceINR: 0,
        priceUSD: 0,
        billingCycle: 'monthly',
        maxJobPosts: 3,
        maxApplications: 50,
        maxInterviewTemplates: 1,
        maxTeamMembers: 1,
        hasAIScreening: false,
        hasCustomAssignments: false,
        hasPrioritySupport: false,
        hasAPIAccess: false,
        hasSSO: false,
        hasWhiteLabel: false,
        dodoProductId: null,
        features: [
            '3 active job posts',
            'Up to 50 applications/month',
            '1 interview process template',
            'Basic candidate management',
            'Email support',
            'Basic analytics',
        ],
    },
    PRO: {
        name: 'Pro',
        priceINR: 3999,
        priceUSD: 49,
        billingCycle: 'monthly',
        maxJobPosts: 10,
        maxApplications: 500,
        maxInterviewTemplates: 5,
        maxTeamMembers: 5,
        hasAIScreening: true,
        hasCustomAssignments: true,
        hasPrioritySupport: true,
        hasAPIAccess: false,
        hasSSO: false,
        hasWhiteLabel: false,
        dodoProductId: process.env.DODO_PRO_PRODUCT_ID || null,
        features: [
            '10 active job posts',
            'Up to 500 applications/month',
            '5 interview process templates',
            'AI-powered resume screening',
            'Custom take-home assignments',
            'Advanced candidate tracking',
            'Team collaboration (5 members)',
            'Priority support',
            'Advanced analytics',
        ],
    },
    ENTERPRISE: {
        name: 'Enterprise',
        priceINR: 0, // Custom pricing
        priceUSD: 0, // Custom pricing
        billingCycle: 'monthly',
        maxJobPosts: 999999,
        maxApplications: 999999,
        maxInterviewTemplates: 999999,
        maxTeamMembers: 999999,
        hasAIScreening: true,
        hasCustomAssignments: true,
        hasPrioritySupport: true,
        hasAPIAccess: true,
        hasSSO: true,
        hasWhiteLabel: true,
        dodoProductId: null, // Contact sales
        features: [
            'Unlimited job posts',
            'Unlimited applications',
            'Unlimited interview templates',
            'Dedicated account manager',
            'Custom integrations',
            'SSO/SAML authentication',
            'API access',
            'SLA guarantee',
            'White-label options',
            'Unlimited team members',
        ],
    },
} as const;

export type HiringSubscriptionPlanType = keyof typeof HIRING_SUBSCRIPTION_PLANS;

// Helper to get plan by name
export function getHiringPlanConfig(plan: HiringSubscriptionPlanType) {
    return HIRING_SUBSCRIPTION_PLANS[plan];
}

// Helper to get price based on currency
export function getHiringPlanPrice(plan: HiringSubscriptionPlanType, currency: 'INR' | 'USD') {
    const config = HIRING_SUBSCRIPTION_PLANS[plan];
    return currency === 'INR' ? config.priceINR : config.priceUSD;
}