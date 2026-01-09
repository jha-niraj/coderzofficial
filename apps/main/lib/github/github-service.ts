import { Octokit } from '@octokit/rest'
import { prisma } from '@repo/prisma'

// Create Octokit instance with the organization token
const getOctokit = () => {
    const token = process.env.GITHUB_NIRAJ_JHA_TOKEN
    if (!token) {
        throw new Error('GITHUB_NIRAJ_JHA_TOKEN is not configured')
    }
    return new Octokit({ auth: token })
}

export interface GitHubRepo {
    id: number
    name: string
    full_name: string
    description: string | null
    html_url: string
    default_branch: string
    stargazers_count: number
    forks_count: number
    watchers_count: number
    open_issues_count: number
    language: string | null
    topics: string[]
    created_at: string
    updated_at: string
    pushed_at: string
}

export interface GitHubIssue {
    id: number
    number: number
    title: string
    body?: string | null
    html_url: string
    state: 'open' | 'closed'
    labels: Array<{ name: string; color: string }>
    assignee: GitHubUser | null
    assignees: GitHubUser[]
    created_at: string
    updated_at: string
    closed_at: string | null
}

export interface GitHubPullRequest {
    id: number
    number: number
    title: string
    body?: string | null
    html_url: string
    state: 'open' | 'closed'
    merged: boolean
    merged_at: string | null
    merged_by?: GitHubUser | null
    created_at: string
    updated_at: string
    closed_at: string | null
    user: GitHubUser
    head: {
        ref: string
        sha: string
        repo: {
            full_name: string
        } | null
    }
    base: {
        ref: string
    }
    additions: number
    deletions: number
    changed_files: number
    commits: number
    labels: Array<{ name: string; color: string }>
}

export interface GitHubUser {
    id: number
    login: string
    avatar_url: string
    html_url: string
    name?: string | null
    email?: string | null
    bio?: string | null
    location?: string | null
    company?: string | null
    blog?: string | null
    public_repos?: number
    public_gists?: number
    followers?: number
    following?: number
}

export interface GitHubCommit {
    sha: string
    message: string
    author: {
        name: string
        email: string
        date: string
    }
    committer: {
        name: string
        email: string
        date: string
    }
    html_url: string
}

// ============================================
// REPOSITORY OPERATIONS
// ============================================

/**
 * Get repository information
 */
export async function getRepository(owner: string, repo: string): Promise<GitHubRepo | null> {
    try {
        const octokit = getOctokit()
        const { data } = await octokit.repos.get({ owner, repo })
        
        return {
            id: data.id,
            name: data.name,
            full_name: data.full_name,
            description: data.description,
            html_url: data.html_url,
            default_branch: data.default_branch,
            stargazers_count: data.stargazers_count,
            forks_count: data.forks_count,
            watchers_count: data.watchers_count,
            open_issues_count: data.open_issues_count,
            language: data.language,
            topics: data.topics || [],
            created_at: data.created_at,
            updated_at: data.updated_at,
            pushed_at: data.pushed_at || data.updated_at,
        }
    } catch (error) {
        console.error('Error fetching repository:', error)
        return null
    }
}

/**
 * Get repository README content
 */
export async function getReadmeContent(owner: string, repo: string): Promise<string | null> {
    try {
        const octokit = getOctokit()
        const { data } = await octokit.repos.getReadme({
            owner,
            repo,
            mediaType: { format: 'raw' }
        })
        
        return typeof data === 'string' ? data : null
    } catch (error) {
        console.error('Error fetching README:', error)
        return null
    }
}

/**
 * Get CONTRIBUTING.md content
 */
export async function getContributingGuide(owner: string, repo: string): Promise<string | null> {
    try {
        const octokit = getOctokit()
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: 'CONTRIBUTING.md',
            mediaType: { format: 'raw' }
        })
        
        return typeof data === 'string' ? data : null
    } catch (error) {
        // CONTRIBUTING.md might not exist
        return null
    }
}

// ============================================
// ISSUE OPERATIONS
// ============================================

/**
 * Get all issues for a repository
 */
export async function getIssues(
    owner: string, 
    repo: string, 
    options?: {
        state?: 'open' | 'closed' | 'all'
        labels?: string
        per_page?: number
        page?: number
    }
): Promise<GitHubIssue[]> {
    try {
        const octokit = getOctokit()
        const { data } = await octokit.issues.listForRepo({
            owner,
            repo,
            state: options?.state || 'open',
            labels: options?.labels,
            per_page: options?.per_page || 100,
            page: options?.page || 1,
        })
        
        // Filter out pull requests (GitHub API includes them in issues)
        return data
            .filter(issue => !issue.pull_request)
            .map(issue => ({
                id: issue.id,
                number: issue.number,
                title: issue.title,
                body: issue.body,
                html_url: issue.html_url,
                state: issue.state as 'open' | 'closed',
                labels: issue.labels.map(l => 
                    typeof l === 'string' 
                        ? { name: l, color: '000000' } 
                        : { name: l.name || '', color: l.color || '000000' }
                ),
                assignee: issue.assignee ? {
                    id: issue.assignee.id,
                    login: issue.assignee.login,
                    avatar_url: issue.assignee.avatar_url,
                    html_url: issue.assignee.html_url,
                } : null,
                assignees: (issue.assignees || []).map(a => ({
                    id: a.id,
                    login: a.login,
                    avatar_url: a.avatar_url,
                    html_url: a.html_url,
                })),
                created_at: issue.created_at,
                updated_at: issue.updated_at,
                closed_at: issue.closed_at,
            }))
    } catch (error) {
        console.error('Error fetching issues:', error)
        return []
    }
}

/**
 * Get a single issue
 */
export async function getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue | null> {
    try {
        const octokit = getOctokit()
        const { data: issue } = await octokit.issues.get({
            owner,
            repo,
            issue_number: issueNumber,
        })
        
        return {
            id: issue.id,
            number: issue.number,
            title: issue.title,
            body: issue.body,
            html_url: issue.html_url,
            state: issue.state as 'open' | 'closed',
            labels: issue.labels.map(l => 
                typeof l === 'string' 
                    ? { name: l, color: '000000' } 
                    : { name: l.name || '', color: l.color || '000000' }
            ),
            assignee: issue.assignee ? {
                id: issue.assignee.id,
                login: issue.assignee.login,
                avatar_url: issue.assignee.avatar_url,
                html_url: issue.assignee.html_url,
            } : null,
            assignees: (issue.assignees || []).map(a => ({
                id: a.id,
                login: a.login,
                avatar_url: a.avatar_url,
                html_url: a.html_url,
            })),
            created_at: issue.created_at,
            updated_at: issue.updated_at,
            closed_at: issue.closed_at,
        }
    } catch (error) {
        console.error('Error fetching issue:', error)
        return null
    }
}

/**
 * Assign a user to an issue
 */
export async function assignIssue(
    owner: string, 
    repo: string, 
    issueNumber: number, 
    assignee: string
): Promise<boolean> {
    try {
        const octokit = getOctokit()
        await octokit.issues.addAssignees({
            owner,
            repo,
            issue_number: issueNumber,
            assignees: [assignee],
        })
        return true
    } catch (error) {
        console.error('Error assigning issue:', error)
        return false
    }
}

/**
 * Unassign a user from an issue
 */
export async function unassignIssue(
    owner: string, 
    repo: string, 
    issueNumber: number, 
    assignee: string
): Promise<boolean> {
    try {
        const octokit = getOctokit()
        await octokit.issues.removeAssignees({
            owner,
            repo,
            issue_number: issueNumber,
            assignees: [assignee],
        })
        return true
    } catch (error) {
        console.error('Error unassigning issue:', error)
        return false
    }
}

/**
 * Add a comment to an issue
 */
export async function addIssueComment(
    owner: string, 
    repo: string, 
    issueNumber: number, 
    body: string
): Promise<boolean> {
    try {
        const octokit = getOctokit()
        await octokit.issues.createComment({
            owner,
            repo,
            issue_number: issueNumber,
            body,
        })
        return true
    } catch (error) {
        console.error('Error adding comment:', error)
        return false
    }
}

// ============================================
// PULL REQUEST OPERATIONS
// ============================================

/**
 * Get all pull requests for a repository
 */
export async function getPullRequests(
    owner: string, 
    repo: string,
    options?: {
        state?: 'open' | 'closed' | 'all'
        per_page?: number
        page?: number
    }
): Promise<GitHubPullRequest[]> {
    try {
        const octokit = getOctokit()
        const { data } = await octokit.pulls.list({
            owner,
            repo,
            state: options?.state || 'all',
            per_page: options?.per_page || 100,
            page: options?.page || 1,
        })
        
        return data.map(pr => ({
            id: pr.id,
            number: pr.number,
            title: pr.title,
            body: pr.body,
            html_url: pr.html_url,
            state: pr.state as 'open' | 'closed',
            merged: pr.merged_at !== null,
            merged_at: pr.merged_at,
            merged_by: pr.merged_by ? {
                id: pr.merged_by?.id || 0,
                login: pr.merged_by?.login || '',
                avatar_url: pr.merged_by?.avatar_url || '',
                html_url: pr.merged_by?.html_url || '',
            } : null,
            created_at: pr.created_at,
            updated_at: pr.updated_at,
            closed_at: pr.closed_at,
            user: {
                id: pr.user?.id || 0,
                login: pr.user?.login || '',
                avatar_url: pr.user?.avatar_url || '',
                html_url: pr.user?.html_url || '',
            },
            head: {
                ref: pr.head.ref,
                sha: pr.head.sha,
                repo: pr.head.repo ? { full_name: pr.head.repo.full_name } : null,
            },
            base: {
                ref: pr.base.ref,
            },
            additions: 0, // Need separate API call
            deletions: 0,
            changed_files: 0,
            commits: 0,
            labels: pr.labels.map(l => ({ name: l.name || '', color: l.color || '000000' })),
        }))
    } catch (error) {
        console.error('Error fetching pull requests:', error)
        return []
    }
}

/**
 * Get a single pull request with full details
 */
export async function getPullRequest(
    owner: string, 
    repo: string, 
    prNumber: number
): Promise<GitHubPullRequest | null> {
    try {
        const octokit = getOctokit()
        const { data: pr } = await octokit.pulls.get({
            owner,
            repo,
            pull_number: prNumber,
        })
        
        return {
            id: pr.id,
            number: pr.number,
            title: pr.title,
            body: pr.body,
            html_url: pr.html_url,
            state: pr.state as 'open' | 'closed',
            merged: pr.merged,
            merged_at: pr.merged_at,
            merged_by: pr.merged_by ? {
                id: pr.merged_by.id,
                login: pr.merged_by.login,
                avatar_url: pr.merged_by.avatar_url,
                html_url: pr.merged_by.html_url,
            } : null,
            created_at: pr.created_at,
            updated_at: pr.updated_at,
            closed_at: pr.closed_at,
            user: {
                id: pr.user?.id || 0,
                login: pr.user?.login || '',
                avatar_url: pr.user?.avatar_url || '',
                html_url: pr.user?.html_url || '',
            },
            head: {
                ref: pr.head.ref,
                sha: pr.head.sha,
                repo: pr.head.repo ? { full_name: pr.head.repo.full_name } : null,
            },
            base: {
                ref: pr.base.ref,
            },
            additions: pr.additions,
            deletions: pr.deletions,
            changed_files: pr.changed_files,
            commits: pr.commits,
            labels: pr.labels.map(l => ({ name: l.name || '', color: l.color || '000000' })),
        }
    } catch (error) {
        console.error('Error fetching pull request:', error)
        return null
    }
}

/**
 * Get pull requests by user
 */
export async function getPullRequestsByUser(
    owner: string,
    repo: string,
    username: string
): Promise<GitHubPullRequest[]> {
    try {
        const allPRs = await getPullRequests(owner, repo, { state: 'all' })
        return allPRs.filter(pr => pr.user.login.toLowerCase() === username.toLowerCase())
    } catch (error) {
        console.error('Error fetching user PRs:', error)
        return []
    }
}

// ============================================
// USER OPERATIONS
// ============================================

/**
 * Get GitHub user information
 */
export async function getUser(username: string): Promise<GitHubUser | null> {
    try {
        const octokit = getOctokit()
        const { data } = await octokit.users.getByUsername({ username })
        
        return {
            id: data.id,
            login: data.login,
            avatar_url: data.avatar_url,
            html_url: data.html_url,
            name: data.name,
            email: data.email,
            bio: data.bio,
            location: data.location,
            company: data.company,
            blog: data.blog,
            public_repos: data.public_repos,
            public_gists: data.public_gists,
            followers: data.followers,
            following: data.following,
        }
    } catch (error) {
        console.error('Error fetching user:', error)
        return null
    }
}

/**
 * Get contributors for a repository
 */
export async function getContributors(owner: string, repo: string): Promise<GitHubUser[]> {
    try {
        const octokit = getOctokit()
        const { data } = await octokit.repos.listContributors({
            owner,
            repo,
            per_page: 100,
        })
        
        return data.map(c => ({
            id: c.id || 0,
            login: c.login || '',
            avatar_url: c.avatar_url || '',
            html_url: c.html_url || '',
        }))
    } catch (error) {
        console.error('Error fetching contributors:', error)
        return []
    }
}

// ============================================
// SYNC OPERATIONS
// ============================================

/**
 * Sync project data from GitHub
 */
export async function syncProjectFromGitHub(projectId: string): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const project = await prisma.openSourceProject.findUnique({
            where: { id: projectId }
        })
        
        if (!project) {
            return { success: false, error: 'Project not found' }
        }
        
        const { githubOwner, githubRepo } = project
        
        // Get repository info
        const repoData = await getRepository(githubOwner, githubRepo)
        if (!repoData) {
            return { success: false, error: 'Failed to fetch repository data' }
        }
        
        // Get issues
        const [openIssues, closedIssues] = await Promise.all([
            getIssues(githubOwner, githubRepo, { state: 'open' }),
            getIssues(githubOwner, githubRepo, { state: 'closed' }),
        ])
        
        // Get README
        const readmeContent = await getReadmeContent(githubOwner, githubRepo)
        
        // Get CONTRIBUTING guide
        const contributingGuide = await getContributingGuide(githubOwner, githubRepo)
        
        // Get contributors
        const contributors = await getContributors(githubOwner, githubRepo)
        
        // Update project in database
        await prisma.openSourceProject.update({
            where: { id: projectId },
            data: {
                stars: repoData.stargazers_count,
                forks: repoData.forks_count,
                watchers: repoData.watchers_count,
                totalIssues: openIssues.length + closedIssues.length,
                openIssues: openIssues.length,
                closedIssues: closedIssues.length,
                totalContributors: contributors.length,
                defaultBranch: repoData.default_branch,
                readmeContent,
                contributingGuide,
                lastSyncedAt: new Date(),
                syncError: null,
            }
        })
        
        // Sync issues to database
        for (const issue of openIssues) {
            await prisma.oSIssue.upsert({
                where: {
                    projectId_githubIssueNumber: {
                        projectId,
                        githubIssueNumber: issue.number
                    }
                },
                update: {
                    title: issue.title,
                    description: issue.body || '',
                    githubIssueUrl: issue.html_url,
                    githubIssueId: String(issue.id),
                    labels: issue.labels.map(l => l.name),
                    status: issue.state === 'open' ? 'OPEN' : 'COMPLETED',
                    lastSyncedAt: new Date(),
                },
                create: {
                    projectId,
                    githubIssueNumber: issue.number,
                    githubIssueUrl: issue.html_url,
                    githubIssueId: String(issue.id),
                    title: issue.title,
                    description: issue.body || '',
                    labels: issue.labels.map(l => l.name),
                    status: 'OPEN',
                    difficulty: 'EASY', // Default, should be set manually
                    requirements: [],
                    acceptanceCriteria: [],
                    hints: [],
                    lastSyncedAt: new Date(),
                }
            })
        }
        
        return { success: true }
    } catch (error) {
        console.error('Error syncing project:', error)
        
        // Update project with error
        await prisma.openSourceProject.update({
            where: { id: projectId },
            data: {
                syncError: error instanceof Error ? error.message : 'Unknown sync error',
                lastSyncedAt: new Date(),
            }
        })
        
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Sync failed' 
        }
    }
}

/**
 * Sync contribution status from GitHub PR
 */
export async function syncContributionFromGitHub(contributionId: string): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const contribution = await prisma.oSContribution.findUnique({
            where: { id: contributionId },
            include: { project: true }
        })
        
        if (!contribution || !contribution.githubPrNumber) {
            return { success: false, error: 'Contribution or PR not found' }
        }
        
        const pr = await getPullRequest(
            contribution.project.githubOwner,
            contribution.project.githubRepo,
            contribution.githubPrNumber
        )
        
        if (!pr) {
            return { success: false, error: 'PR not found on GitHub' }
        }
        
        // Update contribution
        await prisma.oSContribution.update({
            where: { id: contributionId },
            data: {
                linesAdded: pr.additions,
                linesRemoved: pr.deletions,
                filesChanged: pr.changed_files,
                commitsCount: pr.commits,
                isMerged: pr.merged,
                mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
                mergedBy: pr.merged_by?.login,
                closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
                status: pr.merged ? 'MERGED' : (pr.state === 'closed' ? 'REJECTED' : 'IN_REVIEW'),
                lastSyncedAt: new Date(),
            }
        })
        
        return { success: true }
    } catch (error) {
        console.error('Error syncing contribution:', error)
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Sync failed' 
        }
    }
}

export default {
    getRepository,
    getReadmeContent,
    getContributingGuide,
    getIssues,
    getIssue,
    assignIssue,
    unassignIssue,
    addIssueComment,
    getPullRequests,
    getPullRequest,
    getPullRequestsByUser,
    getUser,
    getContributors,
    syncProjectFromGitHub,
    syncContributionFromGitHub,
}





