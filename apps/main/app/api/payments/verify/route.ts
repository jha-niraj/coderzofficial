import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { auth } from '@repo/auth';
import prisma from '@/lib/prisma';
import { CreditType } from '@prisma/client';

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
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            console.error('Signature verification failed');
            return NextResponse.json({
                message: 'Payment verification failed: Invalid signature'
            }, { status: 400 });
        }

        // Fetch payment details from Razorpay
        console.log('Fetching payment details from Razorpay');
        const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
        console.log('Payment details received:', {
            id: paymentDetails.id,
            status: paymentDetails.status,
            order_id: paymentDetails.order_id,
            amount: paymentDetails.amount
        });

        // Verify payment status
        if (paymentDetails.status !== 'captured') {
            console.log('Payment not captured, status:', paymentDetails.status);
            
            // Update payment status to failed
            await prisma.payment.updateMany({
                where: { orderId: razorpay_order_id },
                data: { status: 'FAILED' }
            });

            return NextResponse.json({
                message: `Payment not captured. Status: ${paymentDetails.status}`
            }, { status: 400 });
        }

        // Find the payment in database
        const payment = await prisma.payment.findFirst({
            where: { orderId: razorpay_order_id },
            include: { user: true },
        });

        if (!payment) {
            console.log('Payment not found in database for order_id:', razorpay_order_id);
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

        console.log('Payment updated successfully');

        // Add credits to user account
        await prisma.user.update({
            where: { id: payment.userId },
            data: {
                credits: {
                    increment: payment.credits
                }
            }
        });

        console.log(`Credits added: ${payment.credits} to user ${payment.userId}`);

        // Create credit transaction record
        const creditTransaction = await prisma.creditTransaction.create({
            data: {
                userId: payment.userId,
                currency: payment.currency,
                amount: payment.credits,
                type: CreditType.PURCHASE,
                description: `Purchased ${payment.credits} credits via Razorpay`,
                paymentId: payment.id!
            }
        });

        console.log('Credit transaction created:', creditTransaction.id);

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
}

