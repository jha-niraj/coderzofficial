// Remove static imports and use dynamic imports only on server
// import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Add stealth plugin to avoid detection - will be done dynamically
// puppeteer.use(StealthPlugin());

interface TwitterProfile {
	name: string;
	username: string;
	bio: string;
	location: string;
	website: string;
	joinDate: string;
	followers: number;
	following: number;
	tweets: number;
	verified: boolean;
}

interface TwitterTweet {
	id: string;
	text: string;
	createdAt: string;
	retweets: number;
	likes: number;
	replies: number;
}

export async function validateTwitterProfile(url: string): Promise<string | null> {
	try {
		const urlObj = new URL(url);
		if (!urlObj.hostname.includes('twitter.com') && !urlObj.hostname.includes('x.com')) {
			return null;
		}

		let username: string | null = null;
		const pathParts = urlObj.pathname.split('/').filter(Boolean);

		// Twitter URLs are usually in format: twitter.com/username or x.com/username
		if (pathParts.length >= 1) {
			username = pathParts[0];
		}

		if (!username) {
			return null;
		}

		// Remove @ if present
		if (username.startsWith('@')) {
			username = username.substring(1);
		}

		// Basic validation for Twitter username
		if (username.length < 1 || username.length > 15 || /[^a-zA-Z0-9_]/.test(username)) {
			return null;
		}

		return username;
	} catch (error) {
		console.error('Error validating Twitter profile:', error);
		return null;
	}
}

export async function fetchTwitterData(username: string): Promise<Record<string, any>> {
	try {
		console.log('Fetching Twitter data for username:', username);
		
		// Enhanced mock data structure with realistic developer profile
		const mockData = {
			username,
			profile: {
				name: "Tech Developer",
				username: username,
				bio: "Senior Software Engineer 🚀 | Building scalable web apps with React & Node.js | Open source contributor | Sharing tech insights & coding tips",
				location: "San Francisco, CA",
				website: "https://techdev.example.com",
				joinDate: getRandomJoinDate(),
				profileImageUrl: null,
				bannerImageUrl: null,
				verified: Math.random() > 0.8, // 20% chance of verification
				isProtected: false,
				followersCount: Math.floor(Math.random() * 5000) + 500, // 500-5500
				followingCount: Math.floor(Math.random() * 1000) + 200, // 200-1200
				statusesCount: Math.floor(Math.random() * 2000) + 100, // 100-2100
				listedCount: Math.floor(Math.random() * 50) + 5 // 5-55
			},
			metrics: {
				followers: Math.floor(Math.random() * 5000) + 500,
				following: Math.floor(Math.random() * 1000) + 200,
				tweets: Math.floor(Math.random() * 2000) + 100,
				likes: Math.floor(Math.random() * 10000) + 1000,
				impressions: Math.floor(Math.random() * 50000) + 10000,
				engagementRate: `${(Math.random() * 4 + 1).toFixed(1)}%`,
				averageLikes: Math.floor(Math.random() * 50) + 10,
				averageRetweets: Math.floor(Math.random() * 20) + 3,
				averageReplies: Math.floor(Math.random() * 15) + 2
			},
			activity: {
				tweetsLastMonth: Math.floor(Math.random() * 80) + 20, // 20-100
				avgLikesPerTweet: (Math.random() * 40 + 5).toFixed(1), // 5-45
				avgRetweetsPerTweet: (Math.random() * 15 + 1).toFixed(1), // 1-16
				engagementRate: `${(Math.random() * 3 + 1).toFixed(1)}%`, // 1-4%
				topHashtags: generateTechHashtags(),
				postingFrequency: Math.random() > 0.5 ? "Daily" : "Several times a week",
				bestTimeToPost: getRandomTimeSlot(),
				audienceGrowthRate: `+${Math.floor(Math.random() * 15) + 2}% monthly`
			},
			recentTweets: generateRecentTweets(username),
			engagement: {
				totalEngagements: Math.floor(Math.random() * 10000) + 2000,
				avgEngagementPerPost: (Math.random() * 30 + 5).toFixed(1),
				bestPerformingTweetLikes: Math.floor(Math.random() * 500) + 100,
				mentionsReceived: Math.floor(Math.random() * 200) + 30,
				repliesGiven: Math.floor(Math.random() * 150) + 50,
				quoteTweets: Math.floor(Math.random() * 80) + 20
			},
			content: {
				topTopics: ["JavaScript", "React", "Web Development", "Software Engineering", "Tech Career"],
				contentTypes: {
					original: `${Math.floor(Math.random() * 30) + 40}%`,
					retweets: `${Math.floor(Math.random() * 20) + 15}%`,
					replies: `${Math.floor(Math.random() * 25) + 20}%`,
					quotes: `${Math.floor(Math.random() * 15) + 5}%`
				},
				sentiment: Math.random() > 0.3 ? "Positive" : "Neutral",
				languageDistribution: { "English": "95%", "Spanish": "3%", "Other": "2%" }
			},
			networking: {
				mentionsOfInfluencers: Math.floor(Math.random() * 20) + 5,
				repliesFromInfluencers: Math.floor(Math.random() * 10) + 1,
				collaborativeThreads: Math.floor(Math.random() * 8) + 2,
				techCommunityEngagement: "High"
			}
		};

		return mockData;
	} catch (error) {
		console.error('Twitter API error:', error);
		throw error;
	}
}

// Helper functions for generating realistic mock data
function getRandomJoinDate(): string {
	const years = ['2019', '2020', '2021', '2022', '2023'];
	const months = ['January', 'February', 'March', 'April', 'May', 'June', 
					'July', 'August', 'September', 'October', 'November', 'December'];
	
	const year = years[Math.floor(Math.random() * years.length)];
	const month = months[Math.floor(Math.random() * months.length)];
	
	return `${month} ${year}`;
}

function generateTechHashtags(): string[] {
	const hashtags = [
		"#javascript", "#react", "#nodejs", "#webdev", "#coding", "#programming",
		"#frontend", "#backend", "#fullstack", "#typescript", "#python", "#aws",
		"#docker", "#kubernetes", "#devops", "#opensource", "#tech", "#software",
		"#webdevelopment", "#api", "#database", "#cloud", "#ai", "#machinelearning"
	];
	
	// Return 5-8 random hashtags
	const count = Math.floor(Math.random() * 4) + 5;
	const selected = [];
	const used = new Set();
	
	while (selected.length < count && selected.length < hashtags.length) {
		const index = Math.floor(Math.random() * hashtags.length);
		if (!used.has(index)) {
			used.add(index);
			selected.push(hashtags[index]);
		}
	}
	
	return selected;
}

function getRandomTimeSlot(): string {
	const times = [
		"9:00 AM - 11:00 AM",
		"12:00 PM - 2:00 PM", 
		"3:00 PM - 5:00 PM",
		"7:00 PM - 9:00 PM"
	];
	
	return times[Math.floor(Math.random() * times.length)];
}

function generateRecentTweets(username: string): TwitterTweet[] {
	const tweetTemplates = [
		"Just shipped a new feature using React Server Components! The performance improvements are incredible 🚀 #react #webdev",
		"Working on some interesting TypeScript patterns for better code organization. Thread below 🧵 #typescript #coding",
		"The new Docker multi-stage builds have been a game changer for our CI/CD pipeline. Reduced image size by 60%! #docker #devops",
		"Attending an amazing tech conference today. The talks on AI and web development are mind-blowing 🤯 #tech #ai #webdev",
		"Open source contribution of the day: Fixed a critical bug in a popular React library. Love giving back to the community! #opensource",
		"Building a real-time chat application with WebSockets. The technology never ceases to amaze me #nodejs #websockets #realtime",
		"Hot take: Code reviews are not just about finding bugs, they're about knowledge sharing and team growth 📚 #coding #teamwork",
		"Just published a new blog post about optimizing React performance. Link in bio! #react #performance #webdev",
		"Learning Rust in my spare time. The memory safety features are fascinating compared to other systems languages #rust #learning",
		"Deployed a new microservice to production today. Kubernetes makes scaling so much easier! #kubernetes #microservices #devops"
	];
	
	const count = Math.floor(Math.random() * 5) + 3; // 3-8 tweets
	const tweets: TwitterTweet[] = [];
	
	for (let i = 0; i < count; i++) {
		const template = tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)];
		const date = new Date();
		date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days
		
		tweets.push({
			id: Math.random().toString(36).substr(2, 9),
			text: template,
			createdAt: date.toISOString(),
			retweets: Math.floor(Math.random() * 50) + 1,
			likes: Math.floor(Math.random() * 200) + 5,
			replies: Math.floor(Math.random() * 30) + 1
		});
	}
	
	return tweets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
} 