export const integratingRazorpayData = {
    metadata: {
        title: 'Integrating Razorpay for Credits: Complete Guide',
        description: 'An end-to-end walkthrough for a robust credits purchase flow: client UI, order creation, checkout, verification, schema, webhooks, and edge cases.',
        category: 'Payments',
        date: 'Nov 2025',
    },
    toc: [
        { id: 'overview', label: 'Overview' },
        { id: 'purchase-ui', label: 'Purchase UI (Client)' },
        { id: 'create-order', label: 'Create Order API' },
        { id: 'open-checkout', label: 'Open Razorpay Checkout' },
        { id: 'verify-payment', label: 'Verify Payment API' },
        { id: 'schema', label: 'Example Schema' },
        { id: 'advanced', label: 'Advanced: Webhooks & Reconciliation' },
        { id: 'edge-cases', label: 'Edge Cases & Playbook' },
    ],
    codeSnippets: {
        createOrder: `import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { auth } from '@repo/auth';
import prisma from '@repo/prisma';
import { creditPackages, convertToPaise, calculatePrice, paymentConfig } from '@/lib/payment-config';
import { Currency } from '@repo/prisma/client';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { credits, currency = 'INR' } = await req.json();

        if (!credits || credits < paymentConfig.minCredits || credits > paymentConfig.maxCredits) {
            return NextResponse.json({
                message: 'Credits must be between ' + paymentConfig.minCredits + ' and ' + paymentConfig.maxCredits
            }, { status: 400 });
        }

        // Validate currency
        if (currency !== 'INR' && currency !== 'USD') {
            return NextResponse.json({ message: 'Invalid currency. Only INR and USD are supported' }, { status: 400 });
        }

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ message: 'Razorpay credentials not configured' }, { status: 500 });
        }

        // Get user details
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, name: true, email: true }
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Calculate amount
        const packageInfo = creditPackages.find(pkg => pkg.credits === credits);
        let amount: number;
        
        if (packageInfo) {
            amount = currency === 'INR' ? packageInfo.inr : packageInfo.usd;
        } else {
            amount = calculatePrice(credits, currency as 'INR' | 'USD');
        }

        // Convert to paise for Razorpay (smallest currency unit)
        const amountInPaise = convertToPaise(amount, currency as 'INR' | 'USD');

        // Generate receipt
        const shortUserId = user.id.slice(0, 8);
        const timestamp = Date.now().toString().slice(-8);
        const receipt = 'rcpt_' + shortUserId + '_' + timestamp;

        // Create Razorpay order
        const razorpayOptions = {
            amount: amountInPaise,
            currency: currency === 'INR' ? 'INR' : 'USD',
            receipt: receipt,
            notes: {
                userId: user.id,
                userEmail: user.email || '',
                credits: credits.toString(),
                packageName: packageInfo?.badge || 'Custom',
            }
        };

        const razorpayOrder = await razorpay.orders.create(razorpayOptions);

        // Store payment record in database
        const paymentRecord = await prisma.payment.create({
            data: {
                userId: user.id,
                credits: credits,
                amount: amount,
                currency: currency === 'INR' ? Currency.INR : Currency.USD,
                status: 'PENDING',
                orderId: razorpayOrder.id,
                razorpayOrderId: razorpayOrder.id,
                receipt: receipt,
                notes: {
                    packageName: packageInfo?.badge || 'Custom',
                    originalAmount: packageInfo ? (currency === 'INR' ? packageInfo.originalInr : packageInfo.originalUsd) : null,
                }
            }
        });

        // Return order details to frontend
        return NextResponse.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: amount,
            currency: currency,
            receipt: receipt,
            paymentId: paymentRecord.id,
            credits: credits,
            packageInfo: packageInfo || null,
        });
    } catch (error: unknown) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json({
            message: 'Failed to create payment order',
            error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        }, { status: 500 });
    }
}`,
        openCheckout: `// Inside initiatePayment function on purchase page
const initiatePayment = async (credits: number, price: number) => {
    if (!session?.user) {
        toast.error('Please sign in to purchase credits');
        return;
    }

    try {
        setIsProcessing(true);
        setIsProcessingDialogOpen(true);
        setProcessingStatus('initializing');

        // Create order via API
        setProcessingStatus('processing');
        const response = await fetch('/api/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                credits,
                currency,
            }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to create order');
        }

        // Convert amount to paise (for INR) or cents (for USD)
        const amountInSmallestUnit = currency === 'INR'
            ? Math.round(price * 100) // INR to paise
            : Math.round(price * 100); // USD to cents

        // Initialize Razorpay checkout
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: amountInSmallestUnit,
            currency: currency,
            name: 'TheCoderz',
            description: 'Purchase ' + credits + ' Credits',
            image: '/titlelogo.jpeg',
            order_id: data.orderId,
            handler: async function (response: any) {
                // Handle payment success
                try {
                    setProcessingStatus('verifying');
                    const verifyResponse = await fetch('/api/verify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                    });

                    const verifyData = await verifyResponse.json();

                    if (verifyResponse.ok && verifyData.success) {
                        setProcessingStatus('redirecting');
                        // Redirect to success page
                        setTimeout(() => {
                            window.location.href = '/purchase/success?paymentId=' + verifyData.paymentId + '&credits=' + credits + '&amount=' + price + '&currency=' + currency;
                        }, 1000);
                    } else {
                        throw new Error(verifyData.message || 'Payment verification failed');
                    }
                } catch (error: any) {
                    console.error('Payment verification error:', error);
                    toast.error(error.message || 'Payment verification failed');
                    setIsProcessingDialogOpen(false);
                    setIsProcessing(false);
                }
            },
            prefill: {
                name: session.user.name || '',
                email: session.user.email || '',
            },
            theme: {
                color: '#80c6e8',
            },
            modal: {
                ondismiss: function () {
                    setIsProcessingDialogOpen(false);
                    setIsProcessing(false);
                },
            },
        };

        const rzp = new window.Razorpay(options);

        rzp.on('payment.failed', function (response: any) {
            console.error('Payment failed:', response);
            toast.error('Payment failed. Please try again.');
            setIsProcessingDialogOpen(false);
            setIsProcessing(false);
        });

        rzp.open();
    } catch (error: any) {
        console.error('Error initiating payment:', error);
        toast.error(error.message || 'Failed to initiate payment');
        setIsProcessingDialogOpen(false);
        setIsProcessing(false);
    }
};`,
        verifyPayment: `import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { auth } from '@repo/auth';
import prisma from '@repo/prisma';
import { CreditType } from '@repo/prisma/client';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return NextResponse.json({
            message: 'Missing payment verification details'
        }, { status: 400 });
    }

    try {
        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        // Verify the signature
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            console.error('Signature verification failed');
            return NextResponse.json({
                message: 'Payment verification failed: Invalid signature'
            }, { status: 400 });
        }

        // Fetch payment details from Razorpay
        const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

        // Verify payment status
        if (paymentDetails.status !== 'captured') {
            // Update payment status to failed
            await prisma.payment.updateMany({
                where: { orderId: razorpay_order_id },
                data: { status: 'FAILED' }
            });

            return NextResponse.json({
                message: 'Payment not captured. Status: ' + paymentDetails.status
            }, { status: 400 });
        }

        // Find the payment in database
        const payment = await prisma.payment.findFirst({
            where: { orderId: razorpay_order_id },
            include: { user: true },
        });

        if (!payment) {
            return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
        }

        // Check if already processed
        if (payment.status === 'COMPLETED') {
            return NextResponse.json({
                success: true,
                message: 'Payment already processed',
                paymentId: payment.id,
                credits: payment.credits
            });
        }

        // Update payment status
        const updatedPayment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'COMPLETED',
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                completedAt: new Date(),
            },
        });

        // Add credits to user account
        await prisma.user.update({
            where: { id: payment.userId },
            data: {
                credits: {
                    increment: payment.credits
                }
            }
        });

        // Create credit transaction record
        await prisma.creditTransaction.create({
            data: {
                userId: payment.userId,
                currency: payment.currency,
                amount: payment.credits,
                type: CreditType.PURCHASE,
                description: 'Purchased ' + payment.credits + ' credits via Razorpay',
                paymentId: payment.id!
            }
        });

        return NextResponse.json({
            success: true,
            paymentId: updatedPayment.id,
            razorpayPaymentId: razorpay_payment_id,
            credits: payment.credits,
            amount: payment.amount.toString(),
            currency: payment.currency,
            receipt: payment.receipt,
            completedAt: updatedPayment.completedAt,
        });
    } catch (err) {
        const error = err as Error;
        console.error('Payment verification error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json(
            {
                error: error.message || 'An unexpected error occurred during payment verification'
            },
            { status: 500 }
        );
    }
}`,
        schema: `// prisma/schema.prisma (simplified example)
enum PaymentStatus {
    PENDING
    COMPLETED
    FAILED
    REFUNDED
    CANCELLED
}

model Payment {
    id              String        @id @default(cuid())
    userId          String
    credits         Int           // Credits purchased
    amount          Decimal       @db.Decimal(10, 2) // Payment amount in currency
    currency        Currency      @default(INR)
    status          PaymentStatus @default(PENDING)
    orderId         String?       @unique // Razorpay order ID
    paymentId       String?       @unique // Razorpay payment ID
    razorpayOrderId String?       @unique // Additional razorpay order reference
    signature       String?       // Razorpay signature for verification
    receipt         String?       // Receipt number
    notes           Json?          // Additional metadata
    createdAt       DateTime      @default(now())
    updatedAt        DateTime      @updatedAt
    completedAt     DateTime?     // When payment was completed

    user               User               @relation(fields: [userId], references: [id])
    creditTransactions CreditTransaction[] @relation("PaymentToCreditTransaction")

    @@index([userId])
    @@index([status])
    @@index([orderId])
    @@index([paymentId])
    @@index([createdAt])
}

model Transaction {
    id          String     @id @default(uuid())
    userId      String
    currency    Currency
    amount      Int
    type        CreditType
    description String
    createdAt   DateTime   @default(now())
    paymentId   String?    // Link to Payment if this is a purchase

    user    User     @relation(fields: [userId], references: [id])
    payment Payment? @relation("PaymentToCreditTransaction", fields: [paymentId], references: [id])

    @@index([userId])
    @@index([paymentId])
    @@index([createdAt])
}`,
        webhook: `// app/api/webhook/route.ts (Learnual - coming soon)
// This is a placeholder for the webhook implementation

export async function POST(req: NextRequest) {
    // 1. Verify webhook signature from Razorpay
    // 2. Parse event type: payment.captured, order.paid, etc.
    // 3. Reconcile by orderId/paymentId idempotently
    // 4. Update Payment status to COMPLETED if captured
    // 5. Credit user account if not already credited
    // 6. Create CreditTransaction record
    // 7. Return 200 to acknowledge receipt
}`,
    },
    content: {
        overview: {
            title: 'Overview',
            paragraphs: [
                'This guide documents the exact implementation used in our platform for one-time credits purchase using Razorpay. It covers the user journey, server APIs, client checkout integration, verification, schema, and operational best practices.',
            ],
            steps: [
                'User selects a package or custom credits.',
                'We open a usage sheet explaining what those credits unlock.',
                'On "Proceed to Pay", client calls `/api/payments/create-order`.',
                'Server calculates price, creates Razorpay order, stores a PENDING `Payment`, returns `orderId`.',
                'Client opens Razorpay Checkout with that `orderId`.',
                'On success, client posts identifiers + signature to `/api/payments/verify`.',
                'Server verifies signature, checks capture from Razorpay, marks COMPLETED, credits user, records `CreditTransaction`.',
            ],
        },
        purchaseUI: {
            title: 'Purchase UI (Client)',
            paragraphs: [
                'The purchase page opens a usage sheet, then initializes payment with a processing dialog indicating states (initializing → processing → verifying → redirecting). On success, we redirect to a success page with receipt details.',
            ],
        },
        createOrder: {
            title: 'Create Order API',
            paragraphs: [
                'Server receives credits and currency, validates range, calculates price strictly on the server, creates a Razorpay order, stores a PENDING `Payment`, and returns `orderId`. Do not trust client amounts.',
            ],
        },
        openCheckout: {
            title: 'Open Razorpay Checkout',
            paragraphs: [
                'On success, the handler posts `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` to the verify API. For failures, Razorpay suggests retry flows in the widget.',
            ],
        },
        verifyPayment: {
            title: 'Verify Payment API',
            paragraphs: [
                'Server verifies signature, fetches Razorpay payment, ensures captured status, safely marks `Payment` as COMPLETED, credits the user, and records a `CreditTransaction`—idempotently.',
            ],
        },
        schema: {
            title: 'Example Schema',
            paragraphs: [
                'A simplified example showing `Payment` and `CreditTransaction` with useful indices and statuses.',
            ],
        },
        advanced: {
            title: 'Advanced: Webhooks & Reconciliation',
            paragraphs: [
                'Implement Razorpay webhooks for `payment.captured`/`order.paid`. On capture, verify signature, reconcile by `orderId` and idempotently mark COMPLETED. Add a periodic job to re-check old PENDING payments.',
                'Also consider a callback URL fallback and a resume-on-return banner for robustness against client interruptions.',
            ],
        },
        edgeCases: {
            title: 'Edge Cases & Playbook',
            paragraphs: [
                'Below are detailed scenarios and how to handle them in production. Code samples for these will be added soon.',
            ],
            cases: [
                {
                    title: 'Client disconnected after pay',
                    description: 'Use webhooks to finalize capture; on next visit, show a banner to resume/confirm status. Callback URL can also help.',
                },
                {
                    title: 'Duplicate clicks/requests',
                    description: 'Use idempotency keys (receipt, orderId) and check existing PENDING/COMPLETED records before creating new ones.',
                },
                {
                    title: 'Amount tampering',
                    description: 'Never trust client amount; compute server-side from SKU/config and re-validate against Razorpay amount in verify step.',
                },
                {
                    title: 'Order expiry',
                    description: 'Detect on verify; recreate order and prompt retry with a fresh orderId.',
                },
                {
                    title: 'Webhook security',
                    description: 'Verify webhook signature; whitelist IPs if applicable; handle only expected events.',
                },
                {
                    title: 'Partial captures/refunds',
                    description: 'Reflect status transitions (FAILED/REFUNDED/CANCELLED) and adjust credits accordingly.',
                },
                {
                    title: 'Observability',
                    description: 'Log state transitions; add metrics and alerts for stuck PENDING or frequent failures.',
                },
            ],
            note: 'Coming soon: production-ready webhook handler examples and reconciliation jobs.',
        },
    },
};