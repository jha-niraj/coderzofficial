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

// ============================================
// DODO PAYMENTS API HELPERS
// Following official Dodo Payments documentation:
// https://docs.dodopayments.com/llms.txt
// ============================================

export type CountryCode = string

export interface DodoCustomer {
    email: string;
    name: string;
    phone_number?: string;
}

export interface DodoBilling {
    city: string;
    country: CountryCode;
    state: string;
    street: string;
    zipcode: string;
}

export interface DodoProductCartItem {
    product_id: string;
    quantity: number;
}

export interface CreateCheckoutSessionOptions {
    product_cart: DodoProductCartItem[];
    customer: DodoCustomer;
    return_url: string;
    billing?: DodoBilling;
    metadata?: Record<string, string>;
    // For subscription products - optional trial period
    subscription_data?: {
        trial_period_days?: number;
    };
}

export interface CreatePaymentLinkOptions {
    product_cart: DodoProductCartItem[];
    customer: DodoCustomer;
    billing: DodoBilling;
    return_url?: string;
    metadata?: Record<string, string>;
}

function getDodoBaseUrl(): string {
    return process.env.NODE_ENV === 'production'
        ? 'https://live.dodopayments.com'
        : 'https://test.dodopayments.com'
}

function getDodoHeaders() {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY
    if (!apiKey) throw new Error('DODO_PAYMENTS_API_KEY is not set')
    return {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    }
}

// Keep dodoClient as null for backward compat check in checkout.action.ts
export const dodoClient = process.env.DODO_PAYMENTS_API_KEY ? true : null

/**
 * Create a Checkout Session (RECOMMENDED approach per Dodo docs)
 *
 * Use Checkout Sessions to create a secure, hosted checkout experience.
 * Sessions are valid for 24 hours by default.
 *
 * For subscriptions, you can include subscription_data with trial_period_days.
 *
 * @returns Session with checkout_url to redirect customer
 */
export async function createDodoCheckoutSession(options: CreateCheckoutSessionOptions) {
    const res = await fetch(`${getDodoBaseUrl()}/checkouts`, {
        method: 'POST',
        headers: getDodoHeaders(),
        body: JSON.stringify({
            product_cart: options.product_cart,
            customer: options.customer,
            return_url: options.return_url,
            ...(options.billing && { billing: options.billing }),
            ...(options.metadata && { metadata: options.metadata }),
            ...(options.subscription_data && { subscription_data: options.subscription_data }),
        }),
    })
    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Dodo Payments checkout error ${res.status}: ${err}`)
    }
    const session = await res.json() as { checkout_url?: string; session_id?: string }
    return {
        checkout_url: session.checkout_url,
        session_id: session.session_id,
        raw: session,
    }
}

/**
 * Create a Dynamic Payment Link
 *
 * Use when you need a shareable payment link.
 * Note: Checkout Sessions are recommended for most use cases.
 *
 * IMPORTANT: Must pass payment_link: true to get the payment link URL.
 */
export async function createDodoPaymentLink(options: CreatePaymentLinkOptions) {
    const res = await fetch(`${getDodoBaseUrl()}/payments`, {
        method: 'POST',
        headers: getDodoHeaders(),
        body: JSON.stringify({
            payment_link: true,
            product_cart: options.product_cart,
            customer: options.customer,
            billing: options.billing,
            ...(options.return_url && { return_url: options.return_url }),
            ...(options.metadata && { metadata: options.metadata }),
        }),
    })
    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Dodo Payments payment link error ${res.status}: ${err}`)
    }
    const payment = await res.json() as { payment_id?: string; payment_link?: string }
    return {
        payment_id: payment.payment_id,
        payment_link: payment.payment_link,
        raw: payment,
    }
}

/**
 * Retrieve payment details by ID
 * Used to verify payment status after customer returns from checkout.
 */
export async function getDodoPayment(paymentId: string) {
    const res = await fetch(`${getDodoBaseUrl()}/payments/${paymentId}`, {
        headers: getDodoHeaders(),
    })
    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Dodo Payments retrieve error ${res.status}: ${err}`)
    }
    return res.json() as Promise<{ payment_id?: string; status?: string; [key: string]: unknown }>
}
