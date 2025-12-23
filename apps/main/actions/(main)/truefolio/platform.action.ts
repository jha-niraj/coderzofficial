"use server"

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { validateGithubProfile, fetchGithubData } from "@/lib/utils/github";
import { validateLeetCodeProfile, fetchLeetCodeData } from "@/lib/utils/leetcode";
import { validateLinkedInProfile, fetchLinkedInData } from "@/lib/utils/linkedin";
import { validateTwitterProfile, fetchTwitterData } from "@/lib/utils/twitter";
import { PlatformType } from "@/lib/generated/prisma";

export async function validatePlatformUrl(type: PlatformType, url: string) {
	switch (type) {
		case PlatformType.GITHUB:
			return await validateGithubProfile(url);
		case PlatformType.LEETCODE:
			return await validateLeetCodeProfile(url);
		case PlatformType.LINKEDIN:
			return await validateLinkedInProfile(url);
		case PlatformType.TWITTER:
			return await validateTwitterProfile(url);
		default:
			return null;
	}
}

export async function savePlatformData(type: PlatformType, url: string) {
	console.log("savePlatformData", type, url);

	try {
		const { userId } = await auth();
		if (!userId) throw new Error('Unauthorized');

		// Validate URL and extract username
		const username = await validatePlatformUrl(type, url);
		if (!username) throw new Error('Invalid platform URL');

		// Get user from database
		const user = await prisma.user.findFirst({
			where: { clerkId: userId }
		});
		if (!user) throw new Error('User not found');

		// Fetch platform data
		let platformData;
		switch (type) {
			case PlatformType.GITHUB:
				platformData = await fetchGithubData(username);
				break;
			case PlatformType.LEETCODE:
				platformData = await fetchLeetCodeData(username);
				break;
			case PlatformType.LINKEDIN:
				platformData = await fetchLinkedInData(username);
				break;
			case PlatformType.TWITTER:
				platformData = await fetchTwitterData(username);
				break;
			default:
				throw new Error('Unsupported platform');
		}

		// Save or update platform data
		const platform = await prisma.platform.upsert({
			where: {
				userId_type: {
					userId: user.id,
					type: type,
				},
			},
			update: {
				username,
				profileUrl: url,
				data: platformData,
				lastSynced: new Date(),
			},
			create: {
				userId: user.id,
				type: type,
				username,
				profileUrl: url,
				data: platformData,
			},
		});

		return platform;
	} catch (error) {
		console.error('Error saving platform data:', error);
		throw error;
	}
}

export async function generatePortfolioInsights(userId: string) {
	try {
		console.log('🔍 Starting generatePortfolioInsights with userId:', userId);

		// Get user from database first to get the internal user ID
		console.log('👤 Looking up user in database with clerkId:', userId);
		const user = await prisma.user.findFirst({
			where: { clerkId: userId }
		});
		console.log('👤 Database user lookup result:', user ? `Found user with id: ${user.id}` : 'User not found');

		if (!user) {
			console.log('❌ User not found in database with clerkId:', userId);
			throw new Error('User not found in database. Please ensure your account is properly set up.');
		}

		// Check if we already have recent insights using the internal user ID
		const existingInsight = await prisma.portfolioInsight.findFirst({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' }
		});

		console.log('💾 Existing insight check:', {
			found: !!existingInsight,
			createdAt: existingInsight?.createdAt,
			ageInDays: existingInsight ? Math.floor((new Date().getTime() - existingInsight.createdAt.getTime()) / (24 * 60 * 60 * 1000)) : 'N/A'
		});

		// If insights are less than 10 days old, return cached version
		if (existingInsight) {
			const ageInMs = new Date().getTime() - existingInsight.createdAt.getTime();
			const ageInDays = Math.floor(ageInMs / (24 * 60 * 60 * 1000));
			const cacheValidityDays = 10;
			
			console.log('🕰️ Cache validity check:', {
				ageInDays,
				cacheValidityDays,
				isValid: ageInDays < cacheValidityDays
			});

			if (ageInDays < cacheValidityDays) {
				console.log('✅ Returning cached insights (less than 10 days old)');
				return {
					...(existingInsight.data as any),
					_cached: true,
					_cacheAge: ageInDays
				};
			} else {
				console.log('⏰ Cached insights are older than 10 days, generating fresh insights');
			}
		} else {
			console.log('📭 No existing insights found, generating new insights');
		}

		// Fetch all platform data for the user using the internal user ID
		console.log('🔍 Fetching platforms for internal userId:', user.id);
		const platforms = await prisma.platform.findMany({
			where: { userId: user.id }
		});

		console.log('📊 Platform query result:', {
			platformCount: platforms.length,
			platforms: platforms.map(p => ({
				id: p.id,
				type: p.type,
				username: p.username,
				profileUrl: p.profileUrl,
				hasData: !!p.data,
				lastSynced: p.lastSynced
			}))
		});

		if (platforms.length === 0) {
			console.log('❌ No platform data found for userId:', user.id);
			throw new Error('No platform data found. Please connect your GitHub and LeetCode profiles first.');
		}

		// Prepare data for Sarvam AI
		const githubData = platforms.find(p => p.type === PlatformType.GITHUB)?.data;
		const leetcodeData = platforms.find(p => p.type === PlatformType.LEETCODE)?.data;
		const linkedinData = platforms.find(p => p.type === PlatformType.LINKEDIN)?.data;
		const twitterData = platforms.find(p => p.type === PlatformType.TWITTER)?.data;

		console.log('🔍 Platform data analysis:', {
			hasGithubData: !!githubData,
			hasLeetcodeData: !!leetcodeData,
			hasLinkedinData: !!linkedinData,
			hasTwitterData: !!twitterData,
			githubDataKeys: githubData ? Object.keys(githubData as any) : [],
			leetcodeDataKeys: leetcodeData ? Object.keys(leetcodeData as any) : [],
			linkedinDataKeys: linkedinData ? Object.keys(linkedinData as any) : [],
			twitterDataKeys: twitterData ? Object.keys(twitterData as any) : []
		});

		const prompt = `
You are an expert technical recruiter and software engineering career advisor. Analyze the following developer profile data from multiple platforms and provide detailed insights in JSON format.

IMPORTANT: Respond ONLY with valid JSON, no additional text or explanations.

Expected JSON structure:
{
  "summary": {
    "title": "Professional title based on skills and experience (e.g., 'Full Stack Developer', 'Backend Engineer', 'Frontend Specialist')",
    "description": "Compelling 2-3 sentence professional summary highlighting key achievements and expertise",
    "yearOfExperience": "Estimated years of experience based on activity"
  },
  "skills": {
    "languages": ["Top 5-8 programming languages found in repos and problems"],
    "frameworks": ["Frameworks and libraries identified from projects"],
    "tools": ["Development tools, databases, cloud services, etc."],
    "specializations": ["Areas of expertise like 'Data Structures', 'System Design', 'Web Development']"
  },
  "insights": {
    "code": {
      "strengths": ["4-5 specific technical coding strengths with details"],
      "improvements": ["3-4 constructive areas for coding growth"],
      "recommendations": ["4-5 actionable coding recommendations"],
      "projectHighlights": ["2-3 notable projects or achievements"]
    },
    "social": {
      "strengths": ["3-4 social media and networking strengths"],
      "improvements": ["3-4 areas for social media improvement"],
      "recommendations": ["4-5 actionable social media recommendations"],
      "highlights": ["2-3 notable social media achievements or content"]
    }
  },
  "metrics": {
    "githubActivity": "Detailed analysis of GitHub activity including repos, commits, collaboration",
    "codingProficiency": "Analysis of LeetCode performance including problem-solving patterns",
    "professionalPresence": "Analysis of LinkedIn professional networking and content",
    "socialEngagement": "Analysis of Twitter engagement and tech community involvement",
    "overallScore": "Numerical score out of 100",
    "activityLevel": "High/Medium/Low based on recent activity",
    "collaborationScore": "Assessment of teamwork and open source contributions"
  },
  "careerPath": {
    "currentLevel": "Junior/Mid/Senior level assessment",
    "nextSteps": ["3-4 specific next career steps"],
    "roleRecommendations": ["3-4 suitable job roles"],
    "salaryRange": "Estimated salary range based on skills and experience"
  },
  "platformData": {
    "connectedPlatforms": ["List of connected platforms"],
    "codeScore": "Score based on GitHub + LeetCode data",
    "socialScore": "Score based on LinkedIn + Twitter data"
  }
}

Connected Platform Data:
${githubData ? `GitHub Data: ${JSON.stringify(githubData, null, 2)}` : 'GitHub: Not connected'}
${leetcodeData ? `LeetCode Data: ${JSON.stringify(leetcodeData, null, 2)}` : 'LeetCode: Not connected'}
${linkedinData ? `LinkedIn Data: ${JSON.stringify(linkedinData, null, 2)}` : 'LinkedIn: Not connected'}
${twitterData ? `Twitter Data: ${JSON.stringify(twitterData, null, 2)}` : 'Twitter: Not connected'}

Analyze thoroughly and provide specific, actionable insights. Focus on concrete examples from the available platform data. Adjust recommendations based on which platforms are connected.`;

		console.log('🤖 Calling Sarvam AI API...');

		// Debug API key
		const apiKey = process.env.SARVAM_API_KEY;
		console.log('🔑 API Key status:', {
			exists: !!apiKey,
			length: apiKey ? apiKey.length : 0,
			starts_with: apiKey ? apiKey.substring(0, 10) + '...' : 'Not found'
		});

		if (!apiKey) {
			console.log('❌ SARVAM_API_KEY environment variable not found');
			throw new Error('Sarvam AI API key not configured');
		}

		// Call Sarvam AI API
		const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				messages: [{ role: "user", content: prompt }],
				model: "sarvam-m",
				max_tokens: 2000,
				temperature: 0.7
			}),
		});

		console.log('🤖 AI API Response status:', response.status, response.statusText);

		// Get more detailed error info
		if (!response.ok) {
			let errorBody = '';
			try {
				errorBody = await response.text();
				console.log('❌ AI API error body:', errorBody);
			} catch (e) {
				console.log('❌ Could not read error body');
			}
			
			console.log('❌ AI API error details:', {
				status: response.status,
				statusText: response.statusText,
				headers: Object.fromEntries(response.headers.entries()),
				body: errorBody
			});
			
			throw new Error(`AI API error: ${response.status} ${response.statusText} - ${errorBody}`);
		}

		const aiResponse = await response.json();
		console.log('🤖 AI Response received, parsing...');
		
		if (!aiResponse.choices?.[0]?.message?.content) {
			console.log('❌ Invalid AI response format:', aiResponse);
			throw new Error('Invalid AI response format');
		}

		let insights;
		try {
			let content = aiResponse.choices[0].message.content;
			console.log('🤖 Raw AI response content:', content);
			
			// Remove markdown code blocks if present
			if (content.includes('```json')) {
				content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
				console.log('🛠️ Cleaned content (removed markdown):', content);
			}
			
			// Additional cleanup - remove any leading/trailing whitespace
			content = content.trim();
			
			insights = JSON.parse(content);
			console.log('✅ AI insights parsed successfully');
		} catch (parseError) {
			console.error('❌ Failed to parse AI response:', {
				error: parseError,
				originalContent: aiResponse.choices[0].message.content
			});
			throw new Error('Failed to parse AI insights. The AI response format was invalid.');
		}

		// Delete old insights before saving new ones to prevent duplicates
		console.log('🗑️ Removing old insights to prevent duplicates...');
		await prisma.portfolioInsight.deleteMany({
			where: { userId: user.id }
		});

		// Save insights to database
		console.log('💾 Saving new insights to database...');
		await prisma.portfolioInsight.create({
			data: {
				userId: user.id,
				data: insights
			}
		});

		console.log('✅ Portfolio insights generated and saved successfully');
		return {
			...(insights as any),
			_cached: false,
			_cacheAge: 0
		};
	} catch (error) {
		console.error('❌ Error generating portfolio insights:', error);
		throw error;
	}
}

export async function getUserPlatforms() {
	try {
		const { userId } = await auth();
		if (!userId) throw new Error('Unauthorized');

		const user = await prisma.user.findFirst({
			where: { clerkId: userId }
		});
		if (!user) throw new Error('User not found');

		const platforms = await prisma.platform.findMany({
			where: { userId: user.id }
		});

		return platforms.map(platform => ({
			platform: platform.type.toLowerCase(),
			link: platform.profileUrl,
			username: platform.username,
			data: platform.data
		}));
	} catch (error) {
		console.error('Error fetching user platforms:', error);
		return [];
	}
}

export async function forceRefreshPortfolioInsights(userId: string) {
	try {
		console.log('🔄 Force refreshing portfolio insights for userId:', userId);

		// Get user from database first to get the internal user ID
		console.log('👤 Looking up user in database with clerkId:', userId);
		const user = await prisma.user.findFirst({
			where: { clerkId: userId }
		});
		console.log('👤 Database user lookup result:', user ? `Found user with id: ${user.id}` : 'User not found');

		if (!user) {
			console.log('❌ User not found in database with clerkId:', userId);
			throw new Error('User not found in database. Please ensure your account is properly set up.');
		}

		// Fetch existing platform connections
		console.log('🔍 Fetching existing platform connections for userId:', user.id);
		const platforms = await prisma.platform.findMany({
			where: { userId: user.id }
		});

		console.log('📊 Existing platform connections:', {
			platformCount: platforms.length,
			platforms: platforms.map(p => ({
				id: p.id,
				type: p.type,
				username: p.username,
				profileUrl: p.profileUrl,
				lastSynced: p.lastSynced
			}))
		});

		if (platforms.length === 0) {
			console.log('❌ No platform connections found for userId:', user.id);
			throw new Error('No platform connections found. Please connect your GitHub and LeetCode profiles first.');
		}

		// Fetch fresh data for each platform
		const updatedPlatforms = [];
		
		for (const platform of platforms) {
			try {
				console.log(`🔄 Fetching fresh data for ${platform.type} (${platform.username})...`);
				
				let freshData;
				switch (platform.type) {
					case PlatformType.GITHUB:
						freshData = await fetchGithubData(platform.username);
						console.log('✅ Fresh GitHub data fetched successfully');
						break;
					case PlatformType.LEETCODE:
						freshData = await fetchLeetCodeData(platform.username);
						console.log('✅ Fresh LeetCode data fetched successfully');
						break;
					case PlatformType.LINKEDIN:
						freshData = await fetchLinkedInData(platform.username);
						console.log('✅ Fresh LinkedIn data fetched successfully');
						break;
					case PlatformType.TWITTER:
						freshData = await fetchTwitterData(platform.username);
						console.log('✅ Fresh Twitter data fetched successfully');
						break;
					default:
						console.log(`⚠️ Unknown platform type: ${platform.type}`);
						continue;
				}

				// Update platform data in database
				console.log(`💾 Updating ${platform.type} data in database...`);
				const updatedPlatform = await prisma.platform.update({
					where: { id: platform.id },
					data: {
						data: freshData,
						lastSynced: new Date()
					}
				});

				updatedPlatforms.push(updatedPlatform);
				console.log(`✅ ${platform.type} data updated successfully`);
			} catch (platformError) {
				console.error(`❌ Failed to fetch/update ${platform.type} data:`, platformError);
				// Continue with other platforms even if one fails
				console.log(`⚠️ Continuing with other platforms...`);
			}
		}

		if (updatedPlatforms.length === 0) {
			throw new Error('Failed to fetch fresh data from any connected platforms. Please check your profile connections.');
		}

		console.log(`✅ Successfully updated ${updatedPlatforms.length} platform(s) with fresh data`);

		// Now fetch the updated platform data for AI analysis
		console.log('🔍 Fetching updated platform data for AI analysis...');
		const refreshedPlatforms = await prisma.platform.findMany({
			where: { userId: user.id }
		});

		// Prepare fresh data for Sarvam AI
		const githubData = refreshedPlatforms.find(p => p.type === PlatformType.GITHUB)?.data;
		const leetcodeData = refreshedPlatforms.find(p => p.type === PlatformType.LEETCODE)?.data;
		const linkedinData = refreshedPlatforms.find(p => p.type === PlatformType.LINKEDIN)?.data;
		const twitterData = refreshedPlatforms.find(p => p.type === PlatformType.TWITTER)?.data;

		console.log('🔍 Fresh platform data analysis:', {
			hasGithubData: !!githubData,
			hasLeetcodeData: !!leetcodeData,
			hasLinkedinData: !!linkedinData,
			hasTwitterData: !!twitterData,
			githubDataKeys: githubData ? Object.keys(githubData as any) : [],
			leetcodeDataKeys: leetcodeData ? Object.keys(leetcodeData as any) : [],
			linkedinDataKeys: linkedinData ? Object.keys(linkedinData as any) : [],
			twitterDataKeys: twitterData ? Object.keys(twitterData as any) : []
		});

		const prompt = `
You are an expert technical recruiter and software engineering career advisor. Analyze the following FRESH developer profile data from multiple platforms and provide detailed insights in JSON format.

IMPORTANT: Respond ONLY with valid JSON, no additional text or explanations.

This is a FORCE REFRESH analysis with the latest data from the user's profiles. Pay special attention to:
- Recent activity and commits
- Latest problem-solving patterns
- New skills or technologies used
- Updated repositories and projects
- Current coding frequency and consistency

Expected JSON structure:
{
  "summary": {
    "title": "Professional title based on skills and experience (e.g., 'Full Stack Developer', 'Backend Engineer', 'Frontend Specialist')",
    "description": "Compelling 2-3 sentence professional summary highlighting key achievements and expertise",
    "yearOfExperience": "Estimated years of experience based on activity"
  },
  "skills": {
    "languages": ["Top 5-8 programming languages found in repos and problems"],
    "frameworks": ["Frameworks and libraries identified from projects"],
    "tools": ["Development tools, databases, cloud services, etc."],
    "specializations": ["Areas of expertise like 'Data Structures', 'System Design', 'Web Development']"
  },
  "insights": {
    "code": {
      "strengths": ["4-5 specific technical coding strengths with details"],
      "improvements": ["3-4 constructive areas for coding growth"],
      "recommendations": ["4-5 actionable coding recommendations"],
      "projectHighlights": ["2-3 notable projects or achievements"]
    },
    "social": {
      "strengths": ["3-4 social media and networking strengths"],
      "improvements": ["3-4 areas for social media improvement"],
      "recommendations": ["4-5 actionable social media recommendations"],
      "highlights": ["2-3 notable social media achievements or content"]
    }
  },
  "metrics": {
    "githubActivity": "Detailed analysis of GitHub activity including repos, commits, collaboration",
    "codingProficiency": "Analysis of LeetCode performance including problem-solving patterns",
    "professionalPresence": "Analysis of LinkedIn professional networking and content",
    "socialEngagement": "Analysis of Twitter engagement and tech community involvement",
    "overallScore": "Numerical score out of 100",
    "activityLevel": "High/Medium/Low based on recent activity",
    "collaborationScore": "Assessment of teamwork and open source contributions"
  },
  "careerPath": {
    "currentLevel": "Junior/Mid/Senior level assessment",
    "nextSteps": ["3-4 specific next career steps"],
    "roleRecommendations": ["3-4 suitable job roles"],
    "salaryRange": "Estimated salary range based on skills and experience"
  },
  "platformData": {
    "connectedPlatforms": ["List of connected platforms"],
    "codeScore": "Score based on GitHub + LeetCode data",
    "socialScore": "Score based on LinkedIn + Twitter data"
  }
}

FRESH Connected Platform Data:
${githubData ? `GitHub Data: ${JSON.stringify(githubData, null, 2)}` : 'GitHub: Not connected'}
${leetcodeData ? `LeetCode Data: ${JSON.stringify(leetcodeData, null, 2)}` : 'LeetCode: Not connected'}
${linkedinData ? `LinkedIn Data: ${JSON.stringify(linkedinData, null, 2)}` : 'LinkedIn: Not connected'}
${twitterData ? `Twitter Data: ${JSON.stringify(twitterData, null, 2)}` : 'Twitter: Not connected'}

Analyze thoroughly with focus on the most recent activity and provide specific, actionable insights based on the latest data.`;

		console.log('🤖 Calling Sarvam AI API with fresh data...');

		// Debug API key
		const apiKey = process.env.SARVAM_API_KEY;
		console.log('🔑 API Key status:', {
			exists: !!apiKey,
			length: apiKey ? apiKey.length : 0,
			starts_with: apiKey ? apiKey.substring(0, 10) + '...' : 'Not found'
		});

		if (!apiKey) {
			console.log('❌ SARVAM_API_KEY environment variable not found');
			throw new Error('Sarvam AI API key not configured');
		}

		// Call Sarvam AI API
		const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				messages: [{ role: "user", content: prompt }],
				model: "sarvam-m",
				max_tokens: 2000,
				temperature: 0.7
			}),
		});

		console.log('🤖 AI API Response status:', response.status, response.statusText);

		// Get more detailed error info
		if (!response.ok) {
			let errorBody = '';
			try {
				errorBody = await response.text();
				console.log('❌ AI API error body:', errorBody);
			} catch (e) {
				console.log('❌ Could not read error body');
			}
			
			console.log('❌ AI API error details:', {
				status: response.status,
				statusText: response.statusText,
				headers: Object.fromEntries(response.headers.entries()),
				body: errorBody
			});
			
			throw new Error(`AI API error: ${response.status} ${response.statusText} - ${errorBody}`);
		}

		const aiResponse = await response.json();
		console.log('🤖 AI Response received, parsing...');
		
		if (!aiResponse.choices?.[0]?.message?.content) {
			console.log('❌ Invalid AI response format:', aiResponse);
			throw new Error('Invalid AI response format');
		}

		let insights;
		try {
			let content = aiResponse.choices[0].message.content;
			console.log('🤖 Raw AI response content:', content);
			
			// Remove markdown code blocks if present
			if (content.includes('```json')) {
				content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
				console.log('🛠️ Cleaned content (removed markdown):', content);
			}
			
			// Additional cleanup - remove any leading/trailing whitespace
			content = content.trim();
			
			insights = JSON.parse(content);
			console.log('✅ Fresh AI insights parsed successfully');
		} catch (parseError) {
			console.error('❌ Failed to parse AI response:', {
				error: parseError,
				originalContent: aiResponse.choices[0].message.content
			});
			throw new Error('Failed to parse AI insights. The AI response format was invalid.');
		}

		// Delete old insights and save new ones
		console.log('🗑️ Removing old insights...');
		await prisma.portfolioInsight.deleteMany({
			where: { userId: user.id }
		});

		console.log('💾 Saving fresh insights to database...');
		await prisma.portfolioInsight.create({
			data: {
				userId: user.id,
				data: insights
			}
		});

		console.log('✅ Portfolio force refresh completed successfully with fresh data!');
		console.log(`📊 Updated platforms: ${updatedPlatforms.map(p => p.type).join(', ')}`);
		
		return insights;
	} catch (error) {
		console.error('❌ Error force refreshing portfolio insights:', error);
		throw error;
	}
}

export async function purchasePlatformCredits(platformType: PlatformType, creditsRequired: number) {
	try {
		const { userId } = await auth();
		if (!userId) throw new Error('Unauthorized');

		// Get user from database
		const user = await prisma.user.findFirst({
			where: { clerkId: userId }
		});
		if (!user) throw new Error('User not found');

		// In a real app, you would:
		// 1. Check user's current credit balance from database
		// 2. Deduct credits from balance
		// 3. Record the transaction
		// 4. Unlock the platform for the user

		// For now, we'll just simulate the process
		console.log(`💳 User ${user.id} purchasing ${creditsRequired} credits for ${platformType}`);
		
		// Simulate credit deduction
		return {
			success: true,
			message: `Successfully purchased ${creditsRequired} credits for ${platformType}`,
			remainingCredits: 10 - creditsRequired // Mock remaining credits
		};
	} catch (error) {
		console.error('❌ Error purchasing platform credits:', error);
		throw error;
	}
} 