import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ email: string }> }
) {
    try {
        const { email } = await params;

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { 
                email,
                emailVerified: true
            },
            select: {
                id: true,
                email: true,
                name: true,
                emailVerified: true,
                verifyTokenExpiry: true
            }
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error('Error checking verification status:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
} 