import axios from 'axios';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const BASE_URL = 'https://api.github.com';

const headers = GITHUB_TOKEN ? {
	Authorization: `Bearer ${GITHUB_TOKEN}`
} : {};

interface GithubProfile {
	name: string;
	bio: string;
	location: string;
	public_repos: number;
	followers: number;
	following: number;
	profile_url: string;
	avatar_url: string;
}

interface GithubRepo {
	name: string;
	description: string;
	url: string;
	commitsCount: number;
	lastCommit: string | null;
	techStack: string[];
}

export async function validateGithubProfile(url: string): Promise<string | null> {
	try {
		const username = url.split('github.com/').pop()?.split('/')[0];
		if (!username) return null;

		const response = await axios.get(`${BASE_URL}/users/${username}`, { headers });
		return response.status === 200 ? username : null;
	} catch (error) {
		return null;
	}
}

export async function fetchGithubData(username: string): Promise<Record<string, any>> {
	try {
		// Fetch user profile
		const profileRes = await axios.get(`${BASE_URL}/users/${username}`, { headers });
		const profile = {
			name: profileRes.data.name,
			bio: profileRes.data.bio,
			location: profileRes.data.location,
			public_repos: profileRes.data.public_repos,
			followers: profileRes.data.followers,
			following: profileRes.data.following,
			profile_url: profileRes.data.html_url,
			avatar_url: profileRes.data.avatar_url,
		};

		// Fetch repositories
		const reposRes = await axios.get(`${BASE_URL}/users/${username}/repos?per_page=10&sort=updated`, { headers });
		const repos = reposRes.data;

		const detailedRepos = await Promise.all(
			repos.map(async (repo: any) => {
				try {
					const [commitsRes, languagesRes] = await Promise.all([
						axios.get(`${BASE_URL}/repos/${username}/${repo.name}/commits`, { headers }),
						axios.get(`${BASE_URL}/repos/${username}/${repo.name}/languages`, { headers }),
					]);

					return {
						name: repo.name,
						description: repo.description,
						url: repo.html_url,
						commitsCount: commitsRes.data.length,
						lastCommit: commitsRes.data[0]?.commit?.committer?.date || null,
						techStack: Object.keys(languagesRes.data),
					};
				} catch (error) {
					return {
						name: repo.name,
						description: repo.description,
						url: repo.html_url,
						commitsCount: 0,
						lastCommit: null,
						techStack: [],
					};
				}
			})
		);

		return {
			profile: { ...profile },
			repositories: detailedRepos.map(repo => ({ ...repo })),
			summary: {
				totalRepos: profile.public_repos,
				totalCommits: detailedRepos.reduce((sum, repo) => sum + repo.commitsCount, 0),
				primaryLanguages: detailedRepos.reduce((acc: Record<string, number>, repo) => {
					repo.techStack.forEach((lang: string) => {
						acc[lang] = (acc[lang] || 0) + 1;
					});
					return acc;
				}, {}),
			}
		};
	} catch (err) {
		const error = err as Error;
		throw new Error(`Failed to fetch GitHub data: ${error.message}`);
	}
} 