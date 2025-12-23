import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@repo/auth';

export async function GET(req: NextRequest) {
	try {
		const session = await auth();

		if (!session || !session.user?.email) {
			return NextResponse.json({
				success: false,
				error: 'Unauthorized'
			}, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { email: session.user.email }
		});

		if (!user) {
			return NextResponse.json({
				success: false,
				error: 'User not found'
			}, { status: 404 });
		}

		const transfers = await prisma.creditTransferOut.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' },
			take: 100 // Limit to last 100 transfers
		});

		return NextResponse.json({
			success: true,
			transfers
		});

	} catch (error) {
		console.error('Error fetching transfers:', error);
		return NextResponse.json({
			success: false,
			error: 'Internal server error'
		}, { status: 500 });
	}
} 