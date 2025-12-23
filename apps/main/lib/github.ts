import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
	auth: process.env.GITHUB_NIRAJ_JHA_TOKEN,
});

// ==========================================
// REPOSITORY STATS
// ==========================================

export async function getRepoStats(owner: string, repo: string) {
	try {
		const [commits, pulls, contributors] = await Promise.all([
			octokit.repos.getCommitActivityStats({
				owner,
				repo,
			}),
			octokit.pulls.list({
				owner,
				repo,
				state: "all",
				per_page: 1,
			}),
			octokit.repos.getContributorsStats({
				owner,
				repo,
			}),
		]);

		return {
			totalCommits: commits.data.reduce((acc, week) => acc + week.total, 0),
			totalPRs: pulls.data[0]?.number || 0,
			contributors: contributors.data?.length || 0,
		};
	} catch (error) {
		console.error("Error fetching GitHub stats:", error);
		return {
			totalCommits: 0,
			totalPRs: 0,
			contributors: 0,
		};
	}
}

// ==========================================
// USER CONTRIBUTIONS
// ==========================================

export async function getUserContributions(owner: string, repo: string, username: string) {
	try {
		const [commits, pulls] = await Promise.all([
			octokit.repos.listCommits({
				owner,
				repo,
				author: username,
			}),
			octokit.pulls.list({
				owner,
				repo,
				state: "all",
				creator: username,
			}),
		]);

		return {
			commits: commits.data.length,
			pullRequests: pulls.data.length,
			contributions: commits.data.map((commit) => ({
				message: commit.commit.message,
				date: commit.commit.author?.date,
				url: commit.html_url,
			})),
		};
	} catch (error) {
		console.error("Error fetching user contributions:", error);
		return {
			commits: 0,
			pullRequests: 0,
			contributions: [],
		};
	}
}

// ==========================================
// REPOSITORY DETAILS
// ==========================================

export async function getRepoDetails(owner: string, repo: string) {
	try {
		const { data } = await octokit.repos.get({
			owner,
			repo,
		});

		return {
			success: true,
			name: data.name,
			fullName: data.full_name,
			description: data.description,
			stars: data.stargazers_count,
			forks: data.forks_count,
			watchers: data.watchers_count,
			openIssues: data.open_issues_count,
			language: data.language,
			topics: data.topics || [],
			defaultBranch: data.default_branch,
			createdAt: data.created_at,
			updatedAt: data.updated_at,
			htmlUrl: data.html_url,
			homepage: data.homepage,
			license: data.license?.name,
		};
	} catch (error) {
		console.error("Error fetching repo details:", error);
		return {
			success: false,
			error: "Failed to fetch repository details",
		};
	}
}

// ==========================================
// ISSUES MANAGEMENT
// ==========================================

export async function listRepoIssues(owner: string, repo: string, options?: {
	state?: "open" | "closed" | "all";
	labels?: string;
	per_page?: number;
	page?: number;
}) {
	try {
		const { data } = await octokit.issues.listForRepo({
			owner,
			repo,
			state: options?.state || "open",
			labels: options?.labels,
			per_page: options?.per_page || 30,
			page: options?.page || 1,
		});

		// Filter out pull requests (GitHub API returns PRs as issues)
		const issues = data.filter((issue) => !issue.pull_request);

		return {
			success: true,
			issues: issues.map((issue) => ({
				number: issue.number,
				title: issue.title,
				body: issue.body,
				state: issue.state,
				labels: issue.labels.map((l) => (typeof l === "string" ? l : l.name)),
				assignee: issue.assignee?.login,
				assignees: issue.assignees?.map((a) => a.login) || [],
				createdAt: issue.created_at,
				updatedAt: issue.updated_at,
				closedAt: issue.closed_at,
				htmlUrl: issue.html_url,
				user: issue.user?.login,
				comments: issue.comments,
			})),
		};
	} catch (error) {
		console.error("Error listing issues:", error);
		return {
			success: false,
			issues: [],
			error: "Failed to list issues",
		};
	}
}

export async function getIssue(owner: string, repo: string, issueNumber: number) {
	try {
		const { data } = await octokit.issues.get({
			owner,
			repo,
			issue_number: issueNumber,
		});

		return {
			success: true,
			issue: {
				number: data.number,
				title: data.title,
				body: data.body,
				state: data.state,
				labels: data.labels.map((l) => (typeof l === "string" ? l : l.name)),
				assignee: data.assignee?.login,
				assignees: data.assignees?.map((a) => a.login) || [],
				createdAt: data.created_at,
				updatedAt: data.updated_at,
				closedAt: data.closed_at,
				htmlUrl: data.html_url,
				user: data.user?.login,
				comments: data.comments,
			},
		};
	} catch (error) {
		console.error("Error fetching issue:", error);
		return {
			success: false,
			error: "Failed to fetch issue",
		};
	}
}

export async function createIssue(owner: string, repo: string, data: {
	title: string;
	body?: string;
	labels?: string[];
	assignees?: string[];
}) {
	try {
		const { data: issue } = await octokit.issues.create({
			owner,
			repo,
			title: data.title,
			body: data.body,
			labels: data.labels,
			assignees: data.assignees,
		});

		return {
			success: true,
			issue: {
				number: issue.number,
				title: issue.title,
				htmlUrl: issue.html_url,
			},
		};
	} catch (error) {
		console.error("Error creating issue:", error);
		return {
			success: false,
			error: "Failed to create issue",
		};
	}
}

export async function assignIssue(owner: string, repo: string, issueNumber: number, assignees: string[]) {
	try {
		await octokit.issues.addAssignees({
			owner,
			repo,
			issue_number: issueNumber,
			assignees,
		});

		return { success: true };
	} catch (error) {
		console.error("Error assigning issue:", error);
		return {
			success: false,
			error: "Failed to assign issue",
		};
	}
}

export async function unassignIssue(owner: string, repo: string, issueNumber: number, assignees: string[]) {
	try {
		await octokit.issues.removeAssignees({
			owner,
			repo,
			issue_number: issueNumber,
			assignees,
		});

		return { success: true };
	} catch (error) {
		console.error("Error unassigning issue:", error);
		return {
			success: false,
			error: "Failed to unassign issue",
		};
	}
}

export async function addIssueComment(owner: string, repo: string, issueNumber: number, body: string) {
	try {
		const { data } = await octokit.issues.createComment({
			owner,
			repo,
			issue_number: issueNumber,
			body,
		});

		return {
			success: true,
			comment: {
				id: data.id,
				body: data.body,
				htmlUrl: data.html_url,
			},
		};
	} catch (error) {
		console.error("Error adding comment:", error);
		return {
			success: false,
			error: "Failed to add comment",
		};
	}
}

export async function closeIssue(owner: string, repo: string, issueNumber: number) {
	try {
		await octokit.issues.update({
			owner,
			repo,
			issue_number: issueNumber,
			state: "closed",
		});

		return { success: true };
	} catch (error) {
		console.error("Error closing issue:", error);
		return {
			success: false,
			error: "Failed to close issue",
		};
	}
}

// ==========================================
// PULL REQUESTS MANAGEMENT
// ==========================================

export async function listPullRequests(owner: string, repo: string, options?: {
	state?: "open" | "closed" | "all";
	per_page?: number;
	page?: number;
}) {
	try {
		const { data } = await octokit.pulls.list({
			owner,
			repo,
			state: options?.state || "open",
			per_page: options?.per_page || 30,
			page: options?.page || 1,
		});

		return {
			success: true,
			pullRequests: data.map((pr) => ({
				number: pr.number,
				title: pr.title,
				body: pr.body,
				state: pr.state,
				draft: pr.draft,
				merged: pr.merged_at !== null,
				user: pr.user?.login,
				headBranch: pr.head.ref,
				baseBranch: pr.base.ref,
				createdAt: pr.created_at,
				updatedAt: pr.updated_at,
				mergedAt: pr.merged_at,
				closedAt: pr.closed_at,
				htmlUrl: pr.html_url,
			})),
		};
	} catch (error) {
		console.error("Error listing pull requests:", error);
		return {
			success: false,
			pullRequests: [],
			error: "Failed to list pull requests",
		};
	}
}

export async function getPullRequest(owner: string, repo: string, prNumber: number) {
	try {
		const { data } = await octokit.pulls.get({
			owner,
			repo,
			pull_number: prNumber,
		});

		return {
			success: true,
			pullRequest: {
				number: data.number,
				title: data.title,
				body: data.body,
				state: data.state,
				draft: data.draft,
				merged: data.merged,
				mergeable: data.mergeable,
				mergeableState: data.mergeable_state,
				user: data.user?.login,
				headBranch: data.head.ref,
				headSha: data.head.sha,
				baseBranch: data.base.ref,
				createdAt: data.created_at,
				updatedAt: data.updated_at,
				mergedAt: data.merged_at,
				closedAt: data.closed_at,
				htmlUrl: data.html_url,
				diffUrl: data.diff_url,
				additions: data.additions,
				deletions: data.deletions,
				changedFiles: data.changed_files,
				commits: data.commits,
			},
		};
	} catch (error) {
		console.error("Error fetching pull request:", error);
		return {
			success: false,
			error: "Failed to fetch pull request",
		};
	}
}

export async function getPullRequestFiles(owner: string, repo: string, prNumber: number) {
	try {
		const { data } = await octokit.pulls.listFiles({
			owner,
			repo,
			pull_number: prNumber,
		});

		return {
			success: true,
			files: data.map((file) => ({
				filename: file.filename,
				status: file.status,
				additions: file.additions,
				deletions: file.deletions,
				changes: file.changes,
				patch: file.patch,
				blobUrl: file.blob_url,
			})),
		};
	} catch (error) {
		console.error("Error fetching PR files:", error);
		return {
			success: false,
			files: [],
			error: "Failed to fetch PR files",
		};
	}
}

export async function mergePullRequest(owner: string, repo: string, prNumber: number, options?: {
	commitTitle?: string;
	commitMessage?: string;
	mergeMethod?: "merge" | "squash" | "rebase";
}) {
	try {
		const { data } = await octokit.pulls.merge({
			owner,
			repo,
			pull_number: prNumber,
			commit_title: options?.commitTitle,
			commit_message: options?.commitMessage,
			merge_method: options?.mergeMethod || "squash",
		});

		return {
			success: true,
			merged: data.merged,
			message: data.message,
			sha: data.sha,
		};
	} catch (error) {
		console.error("Error merging pull request:", error);
		return {
			success: false,
			error: "Failed to merge pull request",
		};
	}
}

export async function addPRReview(owner: string, repo: string, prNumber: number, review: {
	body: string;
	event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT";
}) {
	try {
		const { data } = await octokit.pulls.createReview({
			owner,
			repo,
			pull_number: prNumber,
			body: review.body,
			event: review.event,
		});

		return {
			success: true,
			review: {
				id: data.id,
				state: data.state,
				htmlUrl: data.html_url,
			},
		};
	} catch (error) {
		console.error("Error adding PR review:", error);
		return {
			success: false,
			error: "Failed to add review",
		};
	}
}

// ==========================================
// COMMITS
// ==========================================

export async function getCommitDetails(owner: string, repo: string, sha: string) {
	try {
		const { data } = await octokit.repos.getCommit({
			owner,
			repo,
			ref: sha,
		});

		return {
			success: true,
			commit: {
				sha: data.sha,
				message: data.commit.message,
				author: data.commit.author?.name,
				authorEmail: data.commit.author?.email,
				date: data.commit.author?.date,
				htmlUrl: data.html_url,
				stats: {
					additions: data.stats?.additions || 0,
					deletions: data.stats?.deletions || 0,
					total: data.stats?.total || 0,
				},
				files: data.files?.map((file) => ({
					filename: file.filename,
					status: file.status,
					additions: file.additions,
					deletions: file.deletions,
				})) || [],
			},
		};
	} catch (error) {
		console.error("Error fetching commit:", error);
		return {
			success: false,
			error: "Failed to fetch commit",
		};
	}
}

// ==========================================
// CONTRIBUTORS
// ==========================================

export async function listContributors(owner: string, repo: string, options?: {
	per_page?: number;
	page?: number;
}) {
	try {
		const { data } = await octokit.repos.listContributors({
			owner,
			repo,
			per_page: options?.per_page || 30,
			page: options?.page || 1,
		});

		return {
			success: true,
			contributors: data.map((contributor) => ({
				login: contributor.login,
				avatarUrl: contributor.avatar_url,
				contributions: contributor.contributions,
				htmlUrl: contributor.html_url,
				type: contributor.type,
			})),
		};
	} catch (error) {
		console.error("Error listing contributors:", error);
		return {
			success: false,
			contributors: [],
			error: "Failed to list contributors",
		};
	}
}

// ==========================================
// LABELS
// ==========================================

export async function listLabels(owner: string, repo: string) {
	try {
		const { data } = await octokit.issues.listLabelsForRepo({
			owner,
			repo,
		});

		return {
			success: true,
			labels: data.map((label) => ({
				name: label.name,
				color: label.color,
				description: label.description,
			})),
		};
	} catch (error) {
		console.error("Error listing labels:", error);
		return {
			success: false,
			labels: [],
			error: "Failed to list labels",
		};
	}
}

export async function addLabelsToIssue(owner: string, repo: string, issueNumber: number, labels: string[]) {
	try {
		await octokit.issues.addLabels({
			owner,
			repo,
			issue_number: issueNumber,
			labels,
		});

		return { success: true };
	} catch (error) {
		console.error("Error adding labels:", error);
		return {
			success: false,
			error: "Failed to add labels",
		};
	}
}

// ==========================================
// FORKS & STARS
// ==========================================

export async function listForks(owner: string, repo: string, options?: {
	per_page?: number;
	page?: number;
}) {
	try {
		const { data } = await octokit.repos.listForks({
			owner,
			repo,
			per_page: options?.per_page || 30,
			page: options?.page || 1,
		});

		return {
			success: true,
			forks: data.map((fork) => ({
				fullName: fork.full_name,
				owner: fork.owner.login,
				htmlUrl: fork.html_url,
				createdAt: fork.created_at,
			})),
		};
	} catch (error) {
		console.error("Error listing forks:", error);
		return {
			success: false,
			forks: [],
			error: "Failed to list forks",
		};
	}
}

// ==========================================
// WEBHOOK VERIFICATION (for GitHub webhooks)
// ==========================================

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
	const crypto = require('crypto');
	const hmac = crypto.createHmac('sha256', secret);
	const digest = 'sha256=' + hmac.update(payload).digest('hex');
	return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

// ==========================================
// USER PROFILE
// ==========================================

export async function getGitHubUser(username: string) {
	try {
		const { data } = await octokit.users.getByUsername({
			username,
		});

		return {
			success: true,
			user: {
				login: data.login,
				name: data.name,
				avatarUrl: data.avatar_url,
				bio: data.bio,
				location: data.location,
				company: data.company,
				blog: data.blog,
				publicRepos: data.public_repos,
				publicGists: data.public_gists,
				followers: data.followers,
				following: data.following,
				createdAt: data.created_at,
				htmlUrl: data.html_url,
			},
		};
	} catch (error) {
		console.error("Error fetching GitHub user:", error);
		return {
			success: false,
			error: "Failed to fetch GitHub user",
		};
	}
}

// ==========================================
// UTILITY: Validate GitHub username exists
// ==========================================

export async function validateGitHubUsername(username: string): Promise<boolean> {
	try {
		await octokit.users.getByUsername({ username });
		return true;
	} catch {
		return false;
	}
}

// ==========================================
// UTILITY: Check if user has forked a repo
// ==========================================

export async function hasUserForkedRepo(owner: string, repo: string, username: string): Promise<boolean> {
	try {
		// Get user's repos and check if any is a fork of the target repo
		const { data: userRepos } = await octokit.repos.listForUser({
			username,
			type: "all",
			per_page: 100,
		});

		const targetName = repo.toLowerCase();
		// Check if user has a fork - forks typically have similar names
		return userRepos.some((r) => r.fork && r.name.toLowerCase() === targetName);
	} catch {
		return false;
	}
}