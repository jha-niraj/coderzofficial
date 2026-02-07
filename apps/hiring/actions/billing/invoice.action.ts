"use server"

import { prisma } from "@repo/prisma"
import { Prisma } from "@prisma/client"
import { auth } from "@repo/auth"
import { 
    HIRING_SUBSCRIPTION_PLANS, type HiringSubscriptionPlanType 
} from "@/lib/dodopayments"
import type { InvoiceLineItem, InvoiceDetails } from "@/types"

// Re-export types for backward compatibility
export type { InvoiceLineItem, InvoiceDetails }

// ============================================
// HELPERS
// ============================================

async function getUserCompany() {
    const session = await auth()
    if (!session?.user?.id) return null

    const member = await prisma.companyMember.findFirst({
        where: { userId: session.user.id },
        include: { company: true }
    })

    return member
}

function generateInvoiceNumber(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `INV-${year}${month}-${random}`
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Get all invoices for the company
 */
export async function getInvoices(limit: number = 20): Promise<{
    success: boolean
    invoices: InvoiceDetails[]
    error?: string
}> {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, invoices: [], error: "Unauthorized" }
        }

        const invoices = await prisma.companyInvoice.findMany({
            where: { companyId: member.companyId },
            orderBy: { invoiceDate: "desc" },
            take: limit,
            include: {
                payment: true,
            }
        })

        return {
            success: true,
            invoices: invoices.map(inv => ({
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                status: inv.status,
                invoiceDate: inv.invoiceDate,
                dueDate: inv.dueDate,
                paidAt: inv.paidAt,
                subtotal: inv.subtotal,
                taxAmount: inv.taxAmount,
                taxRate: inv.taxRate,
                discount: inv.discount,
                totalAmount: inv.totalAmount,
                currency: inv.currency,
                lineItems: (inv.lineItems as unknown as InvoiceLineItem[]) || [],
                billingName: inv.billingName,
                billingEmail: inv.billingEmail,
                billingAddress: inv.billingAddress,
                billingCity: inv.billingCity,
                billingState: inv.billingState,
                billingCountry: inv.billingCountry,
                billingPincode: inv.billingPincode,
                gstNumber: inv.gstNumber,
                pdfUrl: inv.pdfUrl,
                notes: inv.notes,
                paymentId: inv.paymentId,
                paymentStatus: inv.payment.status,
            }))
        }
    } catch (error) {
        console.error("Get invoices error:", error)
        return { success: false, invoices: [], error: "Failed to fetch invoices" }
    }
}

/**
 * Get a single invoice by ID
 */
export async function getInvoiceById(invoiceId: string): Promise<{
    success: boolean
    invoice: InvoiceDetails | null
    error?: string
}> {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, invoice: null, error: "Unauthorized" }
        }

        const invoice = await prisma.companyInvoice.findFirst({
            where: { 
                id: invoiceId,
                companyId: member.companyId 
            },
            include: {
                payment: true,
            }
        })

        if (!invoice) {
            return { success: false, invoice: null, error: "Invoice not found" }
        }

        return {
            success: true,
            invoice: {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                status: invoice.status,
                invoiceDate: invoice.invoiceDate,
                dueDate: invoice.dueDate,
                paidAt: invoice.paidAt,
                subtotal: invoice.subtotal,
                taxAmount: invoice.taxAmount,
                taxRate: invoice.taxRate,
                discount: invoice.discount,
                totalAmount: invoice.totalAmount,
                currency: invoice.currency,
                lineItems: (invoice.lineItems as unknown as InvoiceLineItem[]) || [],
                billingName: invoice.billingName,
                billingEmail: invoice.billingEmail,
                billingAddress: invoice.billingAddress,
                billingCity: invoice.billingCity,
                billingState: invoice.billingState,
                billingCountry: invoice.billingCountry,
                billingPincode: invoice.billingPincode,
                gstNumber: invoice.gstNumber,
                pdfUrl: invoice.pdfUrl,
                notes: invoice.notes,
                paymentId: invoice.paymentId,
                paymentStatus: invoice.payment.status,
            }
        }
    } catch (error) {
        console.error("Get invoice error:", error)
        return { success: false, invoice: null, error: "Failed to fetch invoice" }
    }
}

/**
 * Create an invoice for a payment
 * This should be called when a payment succeeds
 */
export async function createInvoiceForPayment(paymentId: string): Promise<{
    success: boolean
    invoiceId?: string
    error?: string
}> {
    try {
        // Get the payment with company info
        const payment = await prisma.companyPayment.findUnique({
            where: { id: paymentId },
            include: {
                company: true,
            }
        })

        if (!payment) {
            return { success: false, error: "Payment not found" }
        }

        // Check if invoice already exists
        const existingInvoice = await prisma.companyInvoice.findUnique({
            where: { paymentId }
        })

        if (existingInvoice) {
            return { success: true, invoiceId: existingInvoice.id }
        }

        // Get plan info from payment metadata
        const metadata = payment.metadata as { plan?: HiringSubscriptionPlanType; billingCycle?: string } | null
        const plan = metadata?.plan || "PRO"
        const billingCycle = metadata?.billingCycle || "monthly"
        const planConfig = HIRING_SUBSCRIPTION_PLANS[plan]

        // Create line items
        const lineItems: InvoiceLineItem[] = [
            {
                description: `${planConfig.name} Plan - ${billingCycle === "annual" ? "Annual" : "Monthly"} Subscription`,
                quantity: 1,
                unitPrice: payment.amount,
                amount: payment.amount,
            }
        ]

        // Calculate tax (18% GST for India)
        const taxRate = payment.currency === "INR" ? 18 : 0
        const subtotal = payment.amount
        const taxAmount = (subtotal * taxRate) / 100
        const totalAmount = subtotal + taxAmount

        // Generate invoice number
        const invoiceNumber = generateInvoiceNumber()

        // Set due date (immediate for already paid)
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 7) // 7 days from now

        // Create invoice
        const invoice = await prisma.companyInvoice.create({
            data: {
                companyId: payment.companyId,
                paymentId: payment.id,
                invoiceNumber,
                status: payment.status === "SUCCEEDED" ? "PAID" : "PENDING",
                lineItems: lineItems as unknown as Prisma.InputJsonValue,
                subtotal,
                taxAmount,
                taxRate,
                discount: 0,
                totalAmount,
                currency: payment.currency,
                billingName: payment.billingName || payment.company.name,
                billingEmail: payment.billingEmail,
                billingAddress: payment.company.address,
                billingCity: payment.company.city,
                billingState: payment.company.state,
                billingCountry: payment.company.country,
                billingPincode: payment.company.pincode,
                invoiceDate: new Date(),
                dueDate,
                paidAt: payment.status === "SUCCEEDED" ? payment.paidAt : null,
                notes: `Thank you for subscribing to ${planConfig.name} plan.`,
            }
        })

        return { success: true, invoiceId: invoice.id }
    } catch (error) {
        console.error("Create invoice error:", error)
        return { success: false, error: "Failed to create invoice" }
    }
}

/**
 * Mark invoice as paid
 */
export async function markInvoicePaid(invoiceId: string): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.companyInvoice.update({
            where: { 
                id: invoiceId,
                companyId: member.companyId 
            },
            data: {
                status: "PAID",
                paidAt: new Date(),
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Mark invoice paid error:", error)
        return { success: false, error: "Failed to update invoice" }
    }
}

/**
 * Get billing overview (summary data)
 */
export async function getBillingOverview(): Promise<{
    success: boolean
    data: {
        totalSpent: number
        currency: string
        invoiceCount: number
        lastPaymentDate: Date | null
        nextBillingDate: Date | null
    } | null
    error?: string
}> {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, data: null, error: "Unauthorized" }
        }

        // Get subscription for next billing date
        const subscription = await prisma.companySubscription.findUnique({
            where: { companyId: member.companyId }
        })

        // Get total from paid invoices
        const paidInvoices = await prisma.companyInvoice.aggregate({
            where: {
                companyId: member.companyId,
                status: "PAID",
            },
            _sum: { totalAmount: true },
            _count: true,
        })

        // Get last payment
        const lastPayment = await prisma.companyPayment.findFirst({
            where: {
                companyId: member.companyId,
                status: "SUCCEEDED",
            },
            orderBy: { paidAt: "desc" },
        })

        return {
            success: true,
            data: {
                totalSpent: paidInvoices._sum.totalAmount || 0,
                currency: subscription?.currency || "INR",
                invoiceCount: paidInvoices._count || 0,
                lastPaymentDate: lastPayment?.paidAt || null,
                nextBillingDate: subscription?.currentPeriodEnd || null,
            }
        }
    } catch (error) {
        console.error("Get billing overview error:", error)
        return { success: false, data: null, error: "Failed to fetch billing overview" }
    }
}
