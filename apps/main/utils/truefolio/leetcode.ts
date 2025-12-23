interface LeetCodeUserStats {
	totalSolved: number;
	totalQuestions: number;
	easySolved: number;
	mediumSolved: number;
	hardSolved: number;
	acceptanceRate: string;
	ranking: number;
}

interface LeetCodeSubmission {
	title: string;
	titleSlug: string;
	timestamp: string;
	statusDisplay: string;
	lang: string;
}

export async function fetchLeetCodeDataViaAPI(username: string): Promise<Record<string, any>> {
	try {
		// GraphQL query for user profile
		const userProfileQuery = `
			query getUserProfile($username: String!) {
				matchedUser(username: $username) {
					username
					profile {
						realName
						aboutMe
						userAvatar
						reputation
						ranking
					}
					submitStats: submitStatsGlobal {
						acSubmissionNum {
							difficulty
							count
							submissions
						}
					}
				}
			}
		`;

		// GraphQL query for recent submissions
		const recentSubmissionsQuery = `
			query getRecentSubmissions($username: String!, $limit: Int) {
				recentSubmissionList(username: $username, limit: $limit) {
					title
					titleSlug
					timestamp
					statusDisplay
					lang
				}
			}
		`;

		// Fetch user profile data
		const profileResponse = await fetch('https://leetcode.com/graphql', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
				'Referer': 'https://leetcode.com/',
				'Origin': 'https://leetcode.com'
			},
			body: JSON.stringify({
				query: userProfileQuery,
				variables: { username }
			})
		});

		if (!profileResponse.ok) {
			throw new Error(`Profile API request failed: ${profileResponse.status}`);
		}

		const profileData = await profileResponse.json();

		if (profileData.errors || !profileData.data?.matchedUser) {
			throw new Error('User not found or profile is private');
		}

		// Fetch recent submissions
		const submissionsResponse = await fetch('https://leetcode.com/graphql', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
				'Referer': 'https://leetcode.com/',
				'Origin': 'https://leetcode.com'
			},
			body: JSON.stringify({
				query: recentSubmissionsQuery,
				variables: { username, limit: 10 }
			})
		});

		let submissionsData = null;
		if (submissionsResponse.ok) {
			submissionsData = await submissionsResponse.json();
		}

		// Process the data
		const user = profileData.data.matchedUser;
		const submitStats = user.submitStats.acSubmissionNum;

		// Calculate stats
		const totalSolved = submitStats.reduce((sum: number, stat: any) => sum + stat.count, 0);
		const easySolved = submitStats.find((stat: any) => stat.difficulty === 'Easy')?.count || 0;
		const mediumSolved = submitStats.find((stat: any) => stat.difficulty === 'Medium')?.count || 0;
		const hardSolved = submitStats.find((stat: any) => stat.difficulty === 'Hard')?.count || 0;

		const totalSubmissions = submitStats.reduce((sum: number, stat: any) => sum + stat.submissions, 0);
		const acceptanceRate = totalSubmissions > 0 ?
		 	((totalSolved / totalSubmissions) * 100).toFixed(1) + '%' : '0%';

		const stats = {
			totalSolved,
			totalQuestions: 3000, // Approximate, as this isn't provided by the API
			easySolved,
			mediumSolved,
			hardSolved,
			acceptanceRate,
			ranking: user.profile.ranking || 0,
			contributionPoints: 0, // Not available in API
			reputation: user.profile.reputation || 0
		};

		// Process submissions
		const submissions = submissionsData?.data?.recentSubmissionList?.map((sub: any) => ({
			title: sub.title,
			difficulty: '', // Not provided in recent submissions API
			status: sub.statusDisplay,
			language: sub.lang,
			timestamp: new Date(parseInt(sub.timestamp) * 1000).toLocaleDateString()
		})) || [];

		// Calculate metrics
		const metrics = {
			problemsSolvedPercentage: totalSolved > 0 ?
				((totalSolved / 3000) * 100).toFixed(1) : '0.0',
			difficultyDistribution: {
				easy: totalSolved > 0 ?
					((easySolved / totalSolved) * 100).toFixed(1) : '0.0',
				medium: totalSolved > 0 ?
					((mediumSolved / totalSolved) * 100).toFixed(1) : '0.0',
				hard: totalSolved > 0 ?
					((hardSolved / totalSolved) * 100).toFixed(1) : '0.0',
			},
		};

		return {
			username,
			stats,
			submissions,
			metrics,
			profile: {
				realName: user.profile.realName,
				aboutMe: user.profile.aboutMe,
				avatar: user.profile.userAvatar,
				reputation: user.profile.reputation,
				ranking: user.profile.ranking
			}
		};

	} catch (error) {
		console.error('LeetCode API error:', error);
		throw error;
	}
}

// Updated validation function remains the same
export async function validateLeetCodeProfile(url: string): Promise<string | null> {
	try {
		const urlObj = new URL(url);
		if (!urlObj.hostname.includes('leetcode.com')) {
			return null;
		}

		let username: string | null = null;
		const pathParts = urlObj.pathname.split('/').filter(Boolean);

		if (pathParts.length > 0) {
			if (pathParts[0] === 'u') {
				username = pathParts[1];
			} else {
				username = pathParts[0];
			}
		}

		if (!username) {
			return null;
		}

		if (username.length < 3 || /[^a-zA-Z0-9-_]/.test(username)) {
			return null;
		}

		return username;
	} catch (error) {
		console.error('Error validating LeetCode profile:', error);
		return null;
	}
}

// Main function that tries API first, falls back to scraping
export async function fetchLeetCodeData(username: string): Promise<Record<string, any>> {
	try {
		// Try API approach first
		console.log('Attempting to fetch data via GraphQL API...');
		return await fetchLeetCodeDataViaAPI(username);
	} catch (apiError) {
		console.warn('API approach failed, falling back to scraping:', apiError);

		// Fallback to the enhanced scraping approach
		// (You would implement the enhanced scraping function here)
		throw new Error(`Both API and scraping approaches failed. API error: ${apiError}`);
	}
}