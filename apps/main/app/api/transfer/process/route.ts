import { NextRequest, NextResponse } from 'next/server';
import prisma from '@repo/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
	try {
		const apiKey = req.headers.get('X-API-Key');
		const signature = req.headers.get('X-Signature');
		const userAgent = req.headers.get('User-Agent');
		const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

		if (!apiKey || apiKey !== process.env.TRUEFOOL_API_KEY) {
			console.log('Invalid API key:', apiKey);
			return NextResponse.json({
				success: false,
				error: 'Unauthorized'
			}, { status: 401 });
		}

		const transferData = await req.json();
		const { id, userEmail, creditsRequested, timestamp } = transferData;
		// console.log(transferData);

		if (!id || !userEmail || !creditsRequested || !timestamp) {
			return NextResponse.json({
				success: false,
				error: 'Missing required fields'
			}, { status: 400 });
		}

		if (creditsRequested <= 0 || creditsRequested > 1000) {
			return NextResponse.json({
				success: false,
				error: 'Invalid credit amount'
			}, { status: 400 });
		}

		if (!signature) {
			return NextResponse.json({
				success: false,
				error: 'Missing signature'
			}, { status: 400 });
		}

		const expectedSignature = crypto
			.createHmac('sha256', process.env.INTER_PLATFORM_SECRET!)
			.update(JSON.stringify(transferData))
			.digest('hex');

		if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
			console.log('Invalid signature');
			return NextResponse.json({
				success: false,
				error: 'Invalid signature'
			}, { status: 400 });
		}

		const requestAge = Date.now() - new Date(timestamp).getTime();
		if (requestAge > 5 * 60 * 1000) {
			return NextResponse.json({
				success: false,
				error: 'Request expired'
			}, { status: 400 });
		}

		const user = await prisma.user.findUnique({
			where: { email: userEmail }
		});

		if (!user) {
			return NextResponse.json({
				success: false,
				error: 'User not found'
			}, { status: 404 });
		}

		if (user.credits < creditsRequested) {
			return NextResponse.json({
				success: false,
				error: 'Insufficient credits'
			}, { status: 400 });
		}

		const existingTransfer = await prisma.creditTransferOut.findFirst({
			where: { transferId: id }
		});

		if (existingTransfer) {
			return NextResponse.json({
				success: false,
				error: 'Transfer already processed'
			}, { status: 400 });
		}

		const result = await prisma.$transaction(async (tx) => {
			const updatedUser = await tx.user.update({
				where: { id: user.id },
				data: { credits: user.credits - creditsRequested }
			});

			const transferLog = await tx.creditTransferOut.create({
				data: {
					userId: user.id,
					userEmail: userEmail,
					creditsTransferred: creditsRequested,
					destinationPlatform: 'truefool',
					transferId: id,
					status: 'COMPLETED',
					ipAddress: clientIP,
					userAgent: userAgent || 'Unknown'
				}
			});

			await tx.creditTransaction.create({
				data: {
					userId: user.id,
					currency: 'INR',
					amount: creditsRequested,
					type: 'SPEND',
					description: `Credit transfer to TrueFool platform - Transfer ID: ${id}`
				}
			});

			return {
				transferLog,
				remainingCredits: updatedUser.credits
			};
		});

		return NextResponse.json({
			success: true,
			transferId: result.transferLog.id,
			remainingCredits: result.remainingCredits
		});
	} catch (error) {
		console.error('Transfer processing error:', error);
		return NextResponse.json({
			success: false,
			error: 'Internal server error'
		}, { status: 500 });
	}
}

// Health check endpoint
export async function GET() {
	return NextResponse.json({
		status: 'ok',
		service: 'credit-transfer',
		timestamp: new Date().toISOString()
	});
}

// CORS preflight handler
export async function OPTIONS(request: NextRequest) {
	const origin = request.headers.get('origin');
	const allowedOrigins = [
		'https://truefool.in',
		'https://www.truefool.in',
		'http://localhost:3000',
		process.env.TRUEFOOL_DOMAIN
	].filter(Boolean);

	const headers: Record<string, string> = {
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Signature',
		'Access-Control-Max-Age': '86400',
	};

	if (origin && allowedOrigins.includes(origin)) {
		headers['Access-Control-Allow-Origin'] = origin;
	}

	return new NextResponse(null, {
		status: 200,
		headers
	});
} 