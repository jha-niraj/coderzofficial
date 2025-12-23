import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { generateJobInterviewQuestions } from '@/actions/(main)/ai/jobinterview.action';

// Configure maximum duration for this function (60 seconds)
export const maxDuration = 60;

export async function POST(req: NextRequest) {
	console.log('🚀 [API] /api/ai/job-interview/generate - Starting direct generation');
	
	try {
		const session = await auth();
		console.log('🔐 [API] Authentication check:', { userId: session?.user?.id });

		if (!session?.user?.id) {
			console.log('❌ [API] Unauthorized access attempt');
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const body = await req.json();
		console.log('📥 [API] Request body received:', body);
		
	const {
		position,
		jobDescription,
		companyUrl,
		includeAnswers = false,
		includePractice = false,
		makePublic = false,
		counts = { technical: 8, behavioral: 8, coding: 3 }
	} = body;

		// Validate required fields
		if (!position || !jobDescription) {
			console.log('❌ [API] Missing required fields:', { position: !!position, jobDescription: !!jobDescription });
			return NextResponse.json(
				{ error: 'Position and job description are required' },
				{ status: 400 }
			);
		}

	console.log('📋 [API] Generation parameters:', {
		position,
		jobDescriptionLength: jobDescription.length,
		companyUrl: !!companyUrl,
		includeAnswers,
		includePractice,
		makePublic,
		counts
	});

		// Call the action directly
		console.log('🤖 [API] Calling generateJobInterviewQuestions directly...');
		const result = await generateJobInterviewQuestions(
			position,
			jobDescription,
			companyUrl || '',
			includeAnswers,
			includePractice,
			counts
		);

		console.log('📊 [API] Generation result:', {
			success: result.success,
			hasData: !!result.data,
			error: result.error
		});

		if (result.success) {
			console.log('✅ [API] Generation completed successfully');
			return NextResponse.json({
				success: true,
				data: result.data
			});
		} else {
			console.log('❌ [API] Generation failed:', result.error);
			return NextResponse.json(
				{ 
					success: false,
					error: result.error || 'Failed to generate interview questions' 
				},
				{ status: 400 }
			);
		}

	} catch (error) {
		console.error('❌ [API] Error in generation:', error);
		return NextResponse.json(
			{ 
				success: false,
				error: error instanceof Error ? error.message : 'Internal server error' 
			},
			{ status: 500 }
		);
	}
} 