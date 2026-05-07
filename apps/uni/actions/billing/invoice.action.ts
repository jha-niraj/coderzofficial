"use server"

import { db, universityMembers, universityInvoices, universityPayments, universities } from "@repo/db"
import { eq, and, count } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import type {
    InvoiceDetails, InvoiceStatus, InvoiceLineItem
} from "@/types"

// ============================================
// HELPERS
// ============================================

async function getUserUniversity() {
    const session = await getSession(headers())
    if (!session?.user?.id) return null

    const member = await db.query.universityMembers.findFirst({
        where: eq(universityMembers.userId, session.user.id),
        with: { university: true },
    })

    return member
}

function generateInvoiceNumber(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `UNI-${year}${month}-${random}`
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Get invoice list for the university
 */
export async function getInvoices(options?: {
    page?: number
    pageSize?: number
    status?: InvoiceStatus
}): Promise<{
    success: boolean
    invoices: {
        id: string
        invoiceNumber: string
        status: InvoiceStatus
        invoiceDate: Date
        dueDate: Date | null
        totalAmount: number
        currency: string
        pdfUrl: string | null
    }[]
    totalCount: number
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, invoices: [], totalCount: 0, error: "Unauthorized" }
        }

        const page = options?.page || 1
        const pageSize = options?.pageSize || 10
        const skip = (page - 1) * pageSize

        const totalCountResult = await db.select({ count: count() }).from(universityInvoices).where(eq(universityInvoices.universityId, member.universityId))
        const totalCount = totalCountResult[0]?.count ?? 0

        const invoices = await db.query.universityInvoices.findMany({
            where: eq(universityInvoices.universityId, member.universityId),
            orderBy: (tbl, { desc }) => desc(tbl.invoiceDate),
            offset: skip,
            limit: pageSize,
        })

        return {
            success: true,
            invoices: invoices.map(inv => ({
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                status: inv.status as InvoiceStatus,
                invoiceDate: inv.invoiceDate,
                dueDate: inv.dueDate,
                totalAmount: inv.totalAmount,
                currency: inv.currency,
                pdfUrl: inv.pdfUrl,
            })),
            totalCount,
        }
    } catch (error) {
        console.error("Get invoices error:", error)
        return { success: false, invoices: [], totalCount: 0, error: "Failed to fetch invoices" }
    }
}

/**
 * Get a specific invoice by ID
 */
export async function getInvoice(invoiceId: string): Promise<{
    success: boolean
    invoice?: InvoiceDetails
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const invoice = await db.query.universityInvoices.findFirst({
            where: and(
                eq(universityInvoices.id, invoiceId),
                eq(universityInvoices.universityId, member.universityId),
            ),
        })

        if (!invoice) {
            return { success: false, error: "Invoice not found" }
        }

        return {
            success: true,
            invoice: {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                status: invoice.status as InvoiceStatus,
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
                paymentStatus: invoice.status === "PAID" ? "SUCCEEDED" : "PENDING",
            }
        }
    } catch (error) {
        console.error("Get invoice error:", error)
        return { success: false, error: "Failed to fetch invoice" }
    }
}

/**
 * Create an invoice from a payment
 */
export async function createInvoiceFromPayment(
    paymentId: string,
    billingInfo?: {
        billingName?: string
        billingEmail?: string
        billingAddress?: string
        billingCity?: string
        billingState?: string
        billingCountry?: string
        billingPincode?: string
        gstNumber?: string
    }
): Promise<{
    success: boolean
    invoiceId?: string
    invoiceNumber?: string
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const payment = await db.query.universityPayments.findFirst({
            where: and(
                eq(universityPayments.id, paymentId),
                eq(universityPayments.universityId, member.universityId),
            ),
        })

        if (!payment) {
            return { success: false, error: "Payment not found" }
        }

        // Check if invoice already exists
        const existingInvoice = await db.query.universityInvoices.findFirst({
            where: eq(universityInvoices.paymentId, paymentId),
        })

        if (existingInvoice) {
            return {
                success: true,
                invoiceId: existingInvoice.id,
                invoiceNumber: existingInvoice.invoiceNumber,
            }
        }

        const taxRate = 18
        const subtotal = Math.round(payment.amount / 1.18)
        const taxAmount = payment.amount - subtotal

        const metadata = payment.metadata as { plan?: string; billingCycle?: string } | null
        const lineItems: InvoiceLineItem[] = [
            {
                description: payment.description || `Subscription - ${metadata?.plan || 'Unknown'} (${metadata?.billingCycle || 'monthly'})`,
                quantity: 1,
                unitPrice: subtotal,
                amount: subtotal,
            }
        ]

        const invoiceNumber = generateInvoiceNumber()

        const invoiceRows = await db.insert(universityInvoices).values({
            universityId: member.universityId,
            paymentId,
            invoiceNumber,
            status: payment.status === "SUCCEEDED" ? "PAID" : "PENDING",
            invoiceDate: new Date(),
            dueDate: payment.status === "SUCCEEDED" ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            paidAt: payment.status === "SUCCEEDED" ? payment.paidAt : null,

            subtotal,
            taxAmount,
            taxRate,
            discount: 0,
            totalAmount: payment.amount,
            currency: payment.currency,

            lineItems: lineItems as unknown,

            billingName: billingInfo?.billingName || member.university.name,
            billingEmail: billingInfo?.billingEmail || member.university.email || member.email,
            billingAddress: billingInfo?.billingAddress || member.university.address,
            billingCity: billingInfo?.billingCity || member.university.city,
            billingState: billingInfo?.billingState || member.university.state,
            billingCountry: billingInfo?.billingCountry || member.university.country,
            billingPincode: billingInfo?.billingPincode || member.university.pincode,
            gstNumber: billingInfo?.gstNumber || null,
        }).returning()

        const invoice = invoiceRows[0];
        if (!invoice) {
            return { success: false, error: "Failed to create invoice record" }
        }

        return {
            success: true,
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
        }
    } catch (error) {
        console.error("Create invoice error:", error)
        return { success: false, error: "Failed to create invoice" }
    }
}

/**
 * Get invoice PDF URL
 */
export async function getInvoicePdf(invoiceId: string): Promise<{
    success: boolean
    pdfUrl?: string
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const invoice = await db.query.universityInvoices.findFirst({
            where: and(
                eq(universityInvoices.id, invoiceId),
                eq(universityInvoices.universityId, member.universityId),
            ),
        })

        if (!invoice) {
            return { success: false, error: "Invoice not found" }
        }

        if (invoice.pdfUrl) {
            return { success: true, pdfUrl: invoice.pdfUrl }
        }

        return { success: false, error: "PDF generation not yet implemented" }
    } catch (error) {
        console.error("Get invoice PDF error:", error)
        return { success: false, error: "Failed to get invoice PDF" }
    }
}

/**
 * Get invoice summary/overview
 */
export async function getInvoiceSummary(): Promise<{
    success: boolean
    summary?: {
        totalInvoices: number
        paidInvoices: number
        pendingInvoices: number
        overdueInvoices: number
        totalRevenue: number
        pendingAmount: number
    }
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const invoices = await db.query.universityInvoices.findMany({
            where: eq(universityInvoices.universityId, member.universityId),
        })

        const now = new Date()
        const paidInvoices = invoices.filter(i => i.status === "PAID")
        const pendingInvoices = invoices.filter(i => i.status === "PENDING")
        const overdueInvoices = invoices.filter(i =>
            i.status === "PENDING" && i.dueDate && i.dueDate < now
        )

        return {
            success: true,
            summary: {
                totalInvoices: invoices.length,
                paidInvoices: paidInvoices.length,
                pendingInvoices: pendingInvoices.length,
                overdueInvoices: overdueInvoices.length,
                totalRevenue: paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
                pendingAmount: pendingInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
            }
        }
    } catch (error) {
        console.error("Get invoice summary error:", error)
        return { success: false, error: "Failed to fetch invoice summary" }
    }
}

/**
 * Update billing information for future invoices
 */
export async function updateBillingInfo(info: {
    billingName?: string
    billingEmail?: string
    billingAddress?: string
    billingCity?: string
    billingState?: string
    billingCountry?: string
    billingPincode?: string
    gstNumber?: string
}): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const permissions = member.permissions as string[] | null
        if (!permissions || !permissions.includes("manage_billing")) {
            return { success: false, error: "No permission to manage billing" }
        }

        await db.update(universities).set({
            email: info.billingEmail || undefined,
            address: info.billingAddress || undefined,
            city: info.billingCity || undefined,
            state: info.billingState || undefined,
            country: info.billingCountry || undefined,
            pincode: info.billingPincode || undefined,
        }).where(eq(universities.id, member.universityId))

        return { success: true }
    } catch (error) {
        console.error("Update billing info error:", error)
        return { success: false, error: "Failed to update billing info" }
    }
}
