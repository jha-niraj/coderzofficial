import prisma from '@repo/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { name, email, subject, message } = await req.json()

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        console.log(name, email, subject, message);

        const submission = await prisma.message.create({
            data: {
                name,
                email,
                subject,
                message
            },
        })

        return NextResponse.json(
            { message: 'Message sent successfully', data: submission },
            { status: 201 }
        )
    } catch (err) {
        const error = err as Error;
        console.error('Submission error:', error)
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        )
    }
}