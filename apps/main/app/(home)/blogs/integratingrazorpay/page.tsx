import type { Metadata } from 'next'
import IntegratingRazorpayClient from './_components/IntegratingRazorpayClient'

export const metadata: Metadata = {
    title: 'Integrating Razorpay in Next.js | BuildrHQ Blog',
    description: 'A complete guide to integrating Razorpay payment gateway in a Next.js application — from creating orders to verifying payments and handling webhooks.',
    openGraph: {
        title: 'Integrating Razorpay in Next.js | BuildrHQ Blog',
        description: 'Step-by-step tutorial for integrating Razorpay with Next.js, covering checkout UI, order creation, payment verification, and edge cases.',
        type: 'article',
    },
}

export default function IntegratingRazorpayPage() {
    return <IntegratingRazorpayClient />
}
