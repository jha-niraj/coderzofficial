import { NextResponse } from 'next/server';
import { db, users, creditTransactions } from '@repo/db';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@repo/auth';
import { headers } from 'next/headers';

export async function GET() {
    try {
        const session = await getSession(await headers());

        if (!session || !session.user?.email) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, session.user.email),
            columns: { id: true },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'User not found'
            }, { status: 404 });
        }

        const transactions = await db.query.creditTransactions.findMany({
            where: eq(creditTransactions.userId, user.id),
            orderBy: [desc(creditTransactions.createdAt)],
            limit: 100,
        });

        return NextResponse.json({
            success: true,
            transactions
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
