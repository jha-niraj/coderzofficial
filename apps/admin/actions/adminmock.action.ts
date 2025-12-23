import prisma from '@/lib/prisma';

// Types
export interface AdminMockSession {
	id: string;
	userId: string;
	userName: string;
	mockType: string;
	companyName?: string;
	startTime: string;
	endTime?: string;
	duration?: number;
	status: string;
	createdAt: string;
}

// All Mock Sessions (company, peer, general)
export async function getAdminMockSessions(page = 1, limit = 10, typeFilter?: string, searchTerm?: string) {
	const skip = (page - 1) * limit;
	let where: any = {};
	if (typeFilter && typeFilter !== 'ALL') {
		where.mockType = typeFilter;
	}
	if (searchTerm) {
		where.OR = [
			{ companyName: { contains: searchTerm, mode: 'insensitive' } },
			{ user: { name: { contains: searchTerm, mode: 'insensitive' } } }
		];
	}
	// Voice and Peer mocks
	const [voiceMocks, peer] = await Promise.all([
		prisma.mockVoiceSession.findMany({
			where,
			skip,
			take: limit,
			include: { 
				user: { 
					select: { 
						name: true 
					} 
				},
				mock: { 
					select: { 
						title: true 
					} 
				}
			},
			orderBy: { createdAt: 'desc' }
		}),
		prisma.peerToPeerSession.findMany({
			where,
			skip,
			take: limit,
			include: { creator: { select: { name: true } } },
			orderBy: { createdAt: 'desc' }
		})
	]);
	// Flatten and format
	const formatted: AdminMockSession[] = [
		...voiceMocks.map((s: any) => ({
			id: s.id,
			userId: s.userId,
			userName: s.user?.name || 'Unknown',
			mockType: 'VOICE',
			companyName: s.mock?.title,
			startTime: s.createdAt.toISOString(),
			endTime: s.completedAt ? s.completedAt.toISOString() : undefined,
			status: s.status,
			createdAt: s.createdAt.toISOString()
		})),
		...peer.map((s: any) => ({
			id: s.id,
			userId: s.creatorId,
			userName: s.creator?.name || 'Unknown',
			mockType: 'PEER',
			startTime: s.scheduledTime.toISOString(),
			status: s.status,
			createdAt: s.createdAt.toISOString()
		}))
	];
	return { success: true, data: { sessions: formatted, totalCount: formatted.length, totalPages: Math.ceil(formatted.length / limit) } };
}

// Mock Stats
export async function getAdminMockStats() {
	const totalVoice = await prisma.mockVoiceSession.count();
	const totalPeer = await prisma.peerToPeerSession.count();
	return { success: true, data: { totalVoice, totalPeer, total: totalVoice + totalPeer } };
} 