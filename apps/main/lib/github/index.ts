// Re-export functions from github-service (user-specific authenticated calls)
export * from './github-service'

// Re-export specific functions from github.ts that don't conflict
export {
    getRepoStats,
    getUserContributions,
    getRepoDetails,
    listRepoIssues,
    getIssue,
    createIssue,
    assignIssue,
    unassignIssue,
    closeIssue,
    listPullRequests,
    getPullRequest,
    getPullRequestFiles,
    mergePullRequest,
    addPRReview,
    getCommitDetails,
    listContributors,
    listLabels,
    addLabelsToIssue,
    listForks,
    verifyWebhookSignature,
    getGitHubUser,
    validateGitHubUsername,
    hasUserForkedRepo
} from '../github'

// Default export for convenience
import githubService from './github-service'
export default githubService