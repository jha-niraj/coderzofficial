"use server";

import { auth } from '@repo/auth';
import prisma from "@repo/prisma";
import { revalidatePath } from "next/cache";

export async function getActiveChallenges(): Promise<any[]> {
	try {
		const challenges = await prisma.collectiveChallenge.findMany({
			where: {
				status: "ACTIVE",
				startDate: { lte: new Date() },
				endDate: { gte: new Date() },
			},
			include: {
				proposal: {
					include: {
						proposer: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
					},
				},
				_count: {
					select: {
						participations: true,
						steps: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return challenges;
	} catch (error) {
		console.error("Error fetching active challenges:", error);
		return [];
	}
}

export async function joinChallenge(challengeId: string) {
	const session = await auth();
	if (!session?.user?.id) {
		throw new Error("Authentication required");
	}

	try {
		// Check if user already joined
		const existingParticipation = await prisma.challengeParticipation.findUnique({
			where: {
				userId_challengeId: {
					userId: session.user.id,
					challengeId,
				},
			},
		});

		if (existingParticipation) {
			throw new Error("You have already joined this challenge");
		}

		// Create participation
		await prisma.challengeParticipation.create({
			data: {
				userId: session.user.id,
				challengeId,
			},
		});

		revalidatePath("/communityhub");
		return { success: true };
	} catch (error) {
		console.error("Error joining challenge:", error);
		throw new Error("Failed to join challenge");
	}
}

export async function getChallengeDetails(challengeId: string) {
	const session = await auth();

	try {
		const challenge = await prisma.collectiveChallenge.findUnique({
			where: { id: challengeId },
			include: {
				proposal: {
					include: {
						proposer: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
					},
				},
				steps: {
					orderBy: {
						stepNumber: "asc",
					},
				},
				participations: session?.user?.id ? {
					where: {
						userId: session.user.id,
					},
					include: {
						submissions: {
							include: {
								step: true,
							},
						},
					},
				} : false,
				leaderboard: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
					},
					orderBy: {
						rank: "asc",
					},
					take: 10,
				},
			},
		});

		return challenge;
	} catch (error) {
		console.error("Error fetching challenge details:", error);
		return null;
	}
}

export async function submitStep(formData: FormData) {
	const session = await auth();
	if (!session?.user?.id) {
		throw new Error("Authentication required");
	}

	const stepId = formData.get("stepId") as string;
	const challengeId = formData.get("challengeId") as string;
	const content = formData.get("content") as string;
	const projectUrl = formData.get("projectUrl") as string;
	const quizAnswers = formData.get("quizAnswers") as string;

	try {
		// Get participation
		const participation = await prisma.challengeParticipation.findUnique({
			where: {
				userId_challengeId: {
					userId: session.user.id,
					challengeId,
				},
			},
		});

		if (!participation) {
			throw new Error("You must join the challenge first");
		}

		// Check if already submitted
		const existingSubmission = await prisma.stepSubmission.findUnique({
			where: {
				participationId_stepId: {
					participationId: participation.id,
					stepId,
				},
			},
		});

		if (existingSubmission) {
			throw new Error("You have already submitted this step");
		}

		// Create submission
		const submissionData: any = {
			participationId: participation.id,
			stepId,
		};

		if (content) submissionData.content = content;
		if (projectUrl) submissionData.projectUrl = projectUrl;
		if (quizAnswers) submissionData.quizAnswers = JSON.parse(quizAnswers);

		await prisma.stepSubmission.create({
			data: submissionData,
		});

		revalidatePath("/communityhub");
		return { success: true };
	} catch (error) {
		console.error("Error submitting step:", error);
		throw new Error("Failed to submit step");
	}
}

export async function getChallengeLeaderboard(challengeId: string) {
	try {
		const leaderboard = await prisma.challengeLeaderboard.findMany({
			where: { challengeId },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						image: true,
						username: true,
					},
				},
			},
			orderBy: {
				rank: "asc",
			},
		});

		return leaderboard;
	} catch (error) {
		console.error("Error fetching leaderboard:", error);
		return [];
	}
}

export async function getUserProgress(challengeId: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return null;
	}

	try {
		const participation = await prisma.challengeParticipation.findUnique({
			where: {
				userId_challengeId: {
					userId: session.user.id,
					challengeId,
				},
			},
			include: {
				submissions: {
					include: {
						step: true,
					},
					orderBy: {
						submittedAt: "asc",
					},
				},
				challenge: {
					include: {
						steps: {
							orderBy: {
								stepNumber: "asc",
							},
						},
					},
				},
			},
		});

		return participation;
	} catch (error) {
		console.error("Error fetching user progress:", error);
		return null;
	}
}