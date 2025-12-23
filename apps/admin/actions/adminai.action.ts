"use server"

import prisma from '@/lib/prisma';

// Types
export interface AdminJobInterviewSession {
	id: string;
	userId: string;
	userName: string;
	position: string;
	companyUrl: string;
	status: string;
	score?: number;
	createdAt: string;
	includeAnswers: boolean;
	technicalCount: number;
	behavioralCount: number;
	codingCount: number;
}

// Job Interview Sessions
export async function getAdminJobInterviewSessions(page = 1, limit = 30, searchTerm?: string) {
	const skip = (page - 1) * limit;
	const where: any = {};

	if (searchTerm) {
		where.OR = [
			{ position: { contains: searchTerm, mode: 'insensitive' } },
			{ companyUrl: { contains: searchTerm, mode: 'insensitive' } },
			{ 
				user: {
					OR: [
						{ name: { contains: searchTerm, mode: 'insensitive' } },
						{ email: { contains: searchTerm, mode: 'insensitive' } }
					]
				}
			}
		];
	}

	try {
		const [sessions, totalCount] = await Promise.all([
			prisma.jobInterviewAssistant.findMany({
				where,
				skip,
				take: limit,
				include: { 
					user: { 
						select: { 
							name: true,
							email: true 
						} 
					} 
				},
				orderBy: { createdAt: 'desc' }
			}),
			prisma.jobInterviewAssistant.count({ where })
		]);

		const formatted: AdminJobInterviewSession[] = sessions.map((s: any) => ({
			id: s.id,
			userId: s.userId,
			userName: s.user?.name || 'Unknown',
			position: s.position,
			companyUrl: s.companyUrl,
			status: 'COMPLETED', // Since we don't have status in schema, default to COMPLETED
			createdAt: s.createdAt.toISOString(),
			includeAnswers: s.includeAnswers,
			technicalCount: s.technicalCount,
			behavioralCount: s.behavioralCount,
			codingCount: s.codingCount
		}));

		return { 
			success: true, 
			data: { 
				sessions: formatted, 
				totalCount, 
				totalPages: Math.ceil(totalCount / limit),
				currentPage: page
			} 
		};
	} catch (error) {
		console.error('Error fetching job interview sessions:', error);
		return {
			success: false,
			error: 'Failed to fetch sessions'
		};
	}
}

// Job Interview Stats
export async function getAdminJobInterviewStats() {
	try {
		// Get total sessions
		const totalSessions = await prisma.jobInterviewAssistant.count();

		// Get popular positions
		const popularPositions = await prisma.jobInterviewAssistant.groupBy({
			by: ['position'],
			_count: true,
			orderBy: {
				position: 'desc'
			},
			take: 5
		});

		return {
			success: true,
			data: {
				totalSessions,
				completedSessions: totalSessions, // All sessions are completed
				averageScore: 0, // No score field in schema
				completionRate: 100, // All sessions are considered completed
				popularPositions: popularPositions.map((p: any) => ({
					position: p.position,
					count: p._count,
					avgScore: 0 // No score field in schema
				}))
			}
		};
	} catch (error) {
		console.error('Error fetching job interview stats:', error);
		return {
			success: false,
			error: 'Failed to fetch stats'
		};
	}
}