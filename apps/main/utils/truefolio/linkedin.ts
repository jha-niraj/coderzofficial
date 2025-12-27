// Remove static imports and use dynamic imports only on server
// import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Add stealth plugin to avoid detection - will be done dynamically
// puppeteer.use(StealthPlugin());

interface LinkedInProfile {
	name: string;
	headline: string;
	location: string;
	connections: string;
	about: string;
	experience: LinkedInExperience[];
	education: LinkedInEducation[];
	skills: string[];
	endorsements: number;
	recommendations: number;
}

interface LinkedInExperience {
	title: string;
	company: string;
	duration: string;
	location: string;
	description: string;
}

interface LinkedInEducation {
	school: string;
	degree: string;
	field: string;
	duration: string;
}

export async function validateLinkedInProfile(url: string): Promise<string | null> {
	try {
		const urlObj = new URL(url);
		if (!urlObj.hostname.includes('linkedin.com')) {
			return null;
		}

		let username: string | null = null;
		const pathParts = urlObj.pathname.split('/').filter(Boolean);

		// LinkedIn URLs are usually in format: linkedin.com/in/username
		if (pathParts.length >= 2 && pathParts[0] === 'in') {
			username = pathParts[1] ?? null;
		}

		if (!username) {
			return null;
		}

		// Basic validation for LinkedIn username
		if (username.length < 3 || /[^a-zA-Z0-9-_]/.test(username)) {
			return null;
		}

		return username;
	} catch (error) {
		console.error('Error validating LinkedIn profile:', error);
		return null;
	}
}

export async function fetchLinkedInData(username: string): Promise<Record<string, any>> {
	try {
		console.log('Fetching LinkedIn data for username:', username);

		// Enhanced mock data structure with realistic profile information
		const mockData = {
			username,
			profile: {
				name: "Professional Developer",
				headline: "Senior Software Engineer | Full Stack Developer | React & Node.js Expert",
				location: "San Francisco Bay Area",
				connections: "500+",
				about: `Passionate software engineer with 5+ years of experience building scalable web applications. 
				
				🚀 Expertise: JavaScript, TypeScript, React, Node.js, Python, AWS
				💡 Focus: Full-stack development, system architecture, and team leadership
				🎯 Current: Leading development of microservices architecture for fintech startup
				
				I love solving complex problems and mentoring junior developers. Always eager to learn new technologies and contribute to open-source projects.`,
				profileUrl: `https://linkedin.com/in/${username}`,
				avatar: null,
				bannerImage: null,
				verified: Math.random() > 0.7, // 30% chance of verification
				openToWork: Math.random() > 0.6, // 40% chance of being open to work
			},
			experience: [
				{
					title: "Senior Software Engineer",
					company: "TechFlow Solutions",
					duration: "Jan 2022 - Present · 2 yrs 3 mos",
					location: "San Francisco, CA",
					description: "• Led development of microservices architecture serving 1M+ users\n• Mentored team of 4 junior developers\n• Improved system performance by 40% through optimization\n• Tech stack: React, Node.js, PostgreSQL, Docker, AWS"
				},
				{
					title: "Full Stack Developer",
					company: "InnovateLab",
					duration: "Jun 2020 - Dec 2021 · 1 yr 7 mos",
					location: "Remote",
					description: "• Built responsive web applications using React and Express.js\n• Implemented real-time features using WebSockets\n• Collaborated with design team to improve UX\n• Reduced load times by 50% through code optimization"
				},
				{
					title: "Frontend Developer",
					company: "StartupHub",
					duration: "Aug 2019 - May 2020 · 10 mos",
					location: "Austin, TX",
					description: "• Developed user interfaces for SaaS platform\n• Integrated third-party APIs and payment systems\n• Participated in agile development process\n• Technologies: React, Redux, Material-UI, Jest"
				}
			],
			education: [
				{
					school: "University of California, Berkeley",
					degree: "Bachelor's Degree",
					field: "Computer Science",
					duration: "2015 - 2019",
					activities: "ACM Programming Club, Hackathon Winner 2018"
				},
				{
					school: "Coursera",
					degree: "Professional Certificate",
					field: "Cloud Architecture",
					duration: "2021",
					activities: "AWS Solutions Architect Certification"
				}
			],
			skills: [
				"JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS",
				"Docker", "PostgreSQL", "MongoDB", "GraphQL", "Redux", "Express.js",
				"Git", "CI/CD", "System Design", "Agile", "Team Leadership", "Mentoring"
			],
			metrics: {
				connections: "500+",
				endorsements: Math.floor(Math.random() * 100) + 50, // 50-150
				recommendations: Math.floor(Math.random() * 15) + 5, // 5-20
				posts: Math.floor(Math.random() * 50) + 10, // 10-60
				articles: Math.floor(Math.random() * 10) + 2, // 2-12
				profileViews: Math.floor(Math.random() * 500) + 100, // 100-600
				searchAppearances: Math.floor(Math.random() * 50) + 20 // 20-70
			},
			activity: {
				recentPosts: Math.floor(Math.random() * 10) + 3, // 3-13
				engagementRate: `${(Math.random() * 3 + 1).toFixed(1)}%`, // 1.0-4.0%
				followerGrowth: `+${Math.floor(Math.random() * 20) + 5}% this month`, // +5-25%
				postFrequency: Math.random() > 0.5 ? "Weekly" : "Bi-weekly",
				topHashtags: ["#javascript", "#react", "#webdev", "#softwareengineering", "#fullstack"]
			},
			certifications: [
				"AWS Certified Solutions Architect",
				"React Developer Certification",
				"Node.js Certified Developer"
			],
			languages: [
				{ name: "English", proficiency: "Native" },
				{ name: "Spanish", proficiency: "Professional" },
				{ name: "French", proficiency: "Conversational" }
			],
			projects: [
				{
					name: "E-commerce Platform",
					description: "Built scalable e-commerce solution with React and Node.js",
					technologies: ["React", "Node.js", "PostgreSQL", "Stripe"],
					link: "https://github.com/example/ecommerce"
				},
				{
					name: "Real-time Chat App",
					description: "WebSocket-based chat application with file sharing",
					technologies: ["React", "Socket.io", "Express", "MongoDB"],
					link: "https://github.com/example/chat-app"
				}
			]
		};

		return mockData;
	} catch (error) {
		console.error('LinkedIn API error:', error);
		throw error;
	}
} 