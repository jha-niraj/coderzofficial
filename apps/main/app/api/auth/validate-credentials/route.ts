import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'EMAIL_PASSWORD_REQUIRED' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'USER_NOT_FOUND' },
                { status: 404 }
            );
        }

        if (!user.hashedPassword) {
            return NextResponse.json(
                { success: false, error: 'OAUTH_ACCOUNT' },
                { status: 400 }
            );
        }

        if (!user.emailVerified) {
            return NextResponse.json(
                { success: false, error: 'EMAIL_NOT_VERIFIED' },
                { status: 400 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
        
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, error: 'INVALID_CREDENTIALS' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );
    } catch (error) {
        console.error('Credential validation error:', error);
        return NextResponse.json(
            { success: false, error: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
} 