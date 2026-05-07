import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@repo/db';
import { and, eq } from 'drizzle-orm';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ email: string }> }
) {
    try {
        const { email } = await params;

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                emailVerified: users.emailVerified,
                verifyTokenExpiry: users.verifyTokenExpiry,
            })
            .from(users)
            .where(
                and(
                    eq(users.email, email),
                    eq(users.emailVerified, true)
                )
            )
            .limit(1);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error('Error checking verification status:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
