/**
 * Billing Types
 * All billing-related types for subscriptions, payments, and invoices
 * for the University platform
 */

import type { UniversitySubscriptionPlanType } from "@/lib/dodopayments"

// ============================================
// INVOICE TYPES
// ============================================

export interface InvoiceLineItem {
    description: string
    quantity: number
    unitPrice: number
    amount: number
}

export interface InvoiceDetails {
    id: string
    invoiceNumber: string
    status: InvoiceStatus
    invoiceDate: Date
    dueDate: Date | null
    paidAt: Date | null
    
    // Amounts
    subtotal: number
    taxAmount: number
    taxRate: number
    discount: number
    totalAmount: number
    currency: string
    
    // Line items
    lineItems: InvoiceLineItem[]
    
    // Billing info
    billingName: string | null
    billingEmail: string | null
    billingAddress: string | null
    billingCity: string | null
    billingState: string | null
    billingCountry: string | null
    billingPincode: string | null
    gstNumber: string | null
    
    // PDF
    pdfUrl: string | null
    notes: string | null
    
    // Payment info
    paymentId: string | null
    paymentStatus: string
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface PaymentRecord {
    id: string
    amount: number
    currency: string
    status: PaymentStatus
    createdAt: Date
    description?: string | null
    paidAt?: Date | null
}

export interface WebhookPaymentData {
    paymentId: string
    subscriptionId?: string
    customerId: string
    amount: number
    currency: string
    status: string
    metadata?: Record<string, string>
}

// ============================================
// SUBSCRIPTION TYPES
// ============================================

export interface SubscriptionDetails {
    id: string
    plan: UniversitySubscriptionPlanType
    planName: string
    status: SubscriptionStatus
    
    // Limits (match Prisma schema fields)
    maxStudents: number
    maxFaculty: number
    maxDepartments: number
    maxClassesPerFaculty: number
    maxCreditsPerMonth: number
    
    // Features (match Prisma schema fields)
    hasAnalytics: boolean
    hasAdvancedReports: boolean
    hasPlacementModule: boolean
    hasCompanyPortal: boolean
    hasAPIAccess: boolean
    hasPrioritySupport: boolean
    hasWhiteLabel: boolean
    hasCustomBranding: boolean
    
    // Billing details
    currentPeriodStart: Date
    currentPeriodEnd: Date | null
    trialEndsAt: Date | null
    amount: number
    currency: string
    billingCycle: string
    
    // Dodo Payment info
    dodoSubscriptionId: string | null
    dodoCustomerId: string | null
}

export interface UsageStats {
    // Students
    studentsUsed: number
    studentsLimit: number
    
    // Faculty
    facultyUsed: number
    facultyLimit: number
    
    // Departments
    departmentsUsed: number
    departmentsLimit: number
    
    // Classes
    classesUsed: number
    classesPerFacultyLimit: number
    
    // Credits
    creditsUsed: number
    creditsLimit: number
}

// ============================================
// BILLING OVERVIEW
// ============================================

export interface BillingOverview {
    totalSpent: number
    invoicesCount: number
    pendingInvoices: number
    lastPaymentDate: Date | null
    currentPlan: UniversitySubscriptionPlanType | null
    subscriptionStatus: SubscriptionStatus | null
    nextBillingDate: Date | null
    nextBillingAmount: number | null
}

// ============================================
// STATUS TYPES
// ============================================

export type PaymentStatus = 
    | "SUCCEEDED" 
    | "PENDING" 
    | "PROCESSING" 
    | "FAILED" 
    | "REFUNDED" 
    | "CANCELLED"

export type InvoiceStatus = 
    | "PAID" 
    | "PENDING" 
    | "DRAFT" 
    | "OVERDUE" 
    | "CANCELLED" 
    | "REFUNDED"

export type SubscriptionStatus = 
    | "ACTIVE" 
    | "CANCELLED" 
    | "PAST_DUE" 
    | "INCOMPLETE"
    | "TRIALING"
    | "EXPIRED"

// ============================================
// PLAN FEATURE TYPES
// ============================================

export interface PlanFeature {
    name: string
    included: boolean
    limit?: number | string
    description?: string
}

export interface PlanDetails {
    id: UniversitySubscriptionPlanType
    name: string
    description: string
    monthlyPrice: number
    yearlyPrice: number
    currency: string
    features: PlanFeature[]
    limits: {
        maxStudents: number
        maxFaculty: number
        maxDepartments: number
        maxClassesPerFaculty: number
        maxCreditsPerMonth: number
    }
    isPopular?: boolean
    badge?: string
}

// ============================================
// CHECKOUT TYPES
// ============================================

export interface CheckoutSessionData {
    url: string
    sessionId: string
}

export interface CreateCheckoutPayload {
    plan: UniversitySubscriptionPlanType
    billingCycle: "MONTHLY" | "YEARLY"
    successUrl?: string
    cancelUrl?: string
}

export interface BillingPortalPayload {
    returnUrl?: string
}

// ============================================
// WEBHOOK TYPES
// ============================================

export interface DodoWebhookEvent {
    type: string
    data: {
        payment_id?: string
        subscription_id?: string
        customer_id?: string
        amount?: number
        currency?: string
        status?: string
        metadata?: Record<string, string>
    }
}

// ============================================
// BILLING INFO TYPES (for checkout)
// ============================================

export interface BillingInfo {
    name: string
    email: string
    address?: string
    city?: string
    state?: string
    country: string
    pincode?: string
    gstNumber?: string
}

export interface UpdateBillingInfoPayload {
    billingName?: string
    billingEmail?: string
    billingAddress?: string
    billingCity?: string
    billingState?: string
    billingCountry?: string
    billingPincode?: string
    gstNumber?: string
}
