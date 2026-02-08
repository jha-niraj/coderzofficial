"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import type { 
    InvoiceDetails, InvoiceStatus, InvoiceLineItem 
} from "@/types"

// ============================================
// HELPERS
// ============================================

async function getUserUniversity() {
    const session = await auth()
    if (!session?.user?.id) return null

    const member = await prisma.universityMember.findFirst({
        where: { userId: session.user.id },
        include: { university: true }
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

        // Build where clause
        const where: { universityId: string; status?: string } = {
            universityId: member.universityId,
        }
        if (options?.status) {
            where.status = options.status
        }

        // Get total count
        const totalCount = await prisma.universityInvoice.count({ where })

        // Get invoices
        const invoices = await prisma.universityInvoice.findMany({
            where,
            orderBy: { invoiceDate: "desc" },
            skip,
            take: pageSize,
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

        const invoice = await prisma.universityInvoice.findFirst({
            where: {
                id: invoiceId,
                universityId: member.universityId,
            },
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
                // Payment status is derived from invoice status since we don't have a direct relation
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

        // Get the payment
        const payment = await prisma.universityPayment.findFirst({
            where: {
                id: paymentId,
                universityId: member.universityId,
            }
        })

        if (!payment) {
            return { success: false, error: "Payment not found" }
        }

        // Check if invoice already exists
        const existingInvoice = await prisma.universityInvoice.findFirst({
            where: { paymentId }
        })

        if (existingInvoice) {
            return { 
                success: true, 
                invoiceId: existingInvoice.id,
                invoiceNumber: existingInvoice.invoiceNumber,
            }
        }

        // Calculate tax (assuming 18% GST for Indian entities)
        const taxRate = 18
        const subtotal = Math.round(payment.amount / 1.18) // Reverse calculate subtotal
        const taxAmount = payment.amount - subtotal

        // Create line items
        const metadata = payment.metadata as { plan?: string; billingCycle?: string } | null
        const lineItems: InvoiceLineItem[] = [
            {
                description: payment.description || `Subscription - ${metadata?.plan || 'Unknown'} (${metadata?.billingCycle || 'monthly'})`,
                quantity: 1,
                unitPrice: subtotal,
                amount: subtotal,
            }
        ]

        // Generate invoice number
        const invoiceNumber = generateInvoiceNumber()

        // Create invoice
        const invoice = await prisma.universityInvoice.create({
            data: {
                universityId: member.universityId,
                paymentId,
                invoiceNumber,
                status: payment.status === "SUCCEEDED" ? "PAID" : "PENDING",
                invoiceDate: new Date(),
                dueDate: payment.status === "SUCCEEDED" ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                paidAt: payment.status === "SUCCEEDED" ? payment.paidAt : null,
                
                subtotal,
                taxAmount,
                taxRate,
                discount: 0,
                totalAmount: payment.amount,
                currency: payment.currency,
                
                // Cast to JSON for Prisma storage
                lineItems: lineItems as unknown as import("@prisma/client").Prisma.InputJsonValue,
                
                billingName: billingInfo?.billingName || member.university.name,
                billingEmail: billingInfo?.billingEmail || member.university.email || member.email,
                billingAddress: billingInfo?.billingAddress || member.university.address,
                billingCity: billingInfo?.billingCity || member.university.city,
                billingState: billingInfo?.billingState || member.university.state,
                billingCountry: billingInfo?.billingCountry || member.university.country,
                billingPincode: billingInfo?.billingPincode || member.university.pincode,
                gstNumber: billingInfo?.gstNumber || null,
            }
        })

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
 * Get invoice PDF URL (generate if needed)
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

        const invoice = await prisma.universityInvoice.findFirst({
            where: {
                id: invoiceId,
                universityId: member.universityId,
            }
        })

        if (!invoice) {
            return { success: false, error: "Invoice not found" }
        }

        if (invoice.pdfUrl) {
            return { success: true, pdfUrl: invoice.pdfUrl }
        }

        // TODO: Generate PDF using a PDF generation service
        // For now, return an error
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

        const invoices = await prisma.universityInvoice.findMany({
            where: { universityId: member.universityId }
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

        // Update university with billing info
        await prisma.university.update({
            where: { id: member.universityId },
            data: {
                // Store billing info in university if fields exist
                // Otherwise might need a separate billing info table
                email: info.billingEmail || undefined,
                address: info.billingAddress || undefined,
                city: info.billingCity || undefined,
                state: info.billingState || undefined,
                country: info.billingCountry || undefined,
                pincode: info.billingPincode || undefined,
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Update billing info error:", error)
        return { success: false, error: "Failed to update billing info" }
    }
}
