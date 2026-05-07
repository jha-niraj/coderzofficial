import { db, contactMessages } from '@repo/db';
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

        const [submission] = await db.insert(contactMessages).values({
            name,
            email,
            subject,
            message,
        }).returning();

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
