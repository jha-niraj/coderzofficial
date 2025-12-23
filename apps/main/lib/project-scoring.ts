/**
 * Project V2 Scoring System
 * 
 * Total Score: 100 points
 * - Tasks: 50 points (distributed based on difficulty)
 * - Quiz: 25 points
 * - Mock AI Interview: 25 points
 * 
 * Task Difficulty Weights:
 * - BEGINNER: 1x
 * - INTERMEDIATE: 2x
 * - ADVANCED: 4x
 */

type TaskDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

interface Task {
    id: string
    difficulty: TaskDifficulty
}

interface ScoreCalculation {
    totalScore: number
    tasksScore: number
    quizScore: number
    mockScore: number
    taskBreakdown: {
        taskId: string
        difficulty: TaskDifficulty
        points: number
    }[]
}

const DIFFICULTY_WEIGHTS = {
    BEGINNER: 1,
    INTERMEDIATE: 2,
    ADVANCED: 4
} as const

const TOTAL_POINTS = 100
const TASKS_ALLOCATION = 50
const QUIZ_ALLOCATION = 25
const MOCK_ALLOCATION = 25

/**
 * Calculate points per task based on difficulty distribution
 */
export function calculateTaskScoring(tasks: Task[]): ScoreCalculation['taskBreakdown'] {
    if (tasks.length === 0) {
        return []
    }

    // Calculate total weight
    const totalWeight = tasks.reduce((sum, task) => {
        return sum + DIFFICULTY_WEIGHTS[task.difficulty]
    }, 0)

    // Calculate points per unit weight
    const pointsPerWeight = TASKS_ALLOCATION / totalWeight

    // Distribute points to each task
    const taskBreakdown = tasks.map(task => ({
        taskId: task.id,
        difficulty: task.difficulty,
        points: Number((DIFFICULTY_WEIGHTS[task.difficulty] * pointsPerWeight).toFixed(2))
    }))

    return taskBreakdown
}

/**
 * Calculate quiz score based on correct answers
 */
export function calculateQuizScore(
    correctAnswers: number,
    totalQuestions: number
): number {
    if (totalQuestions === 0) return 0
    return Number(((correctAnswers / totalQuestions) * QUIZ_ALLOCATION).toFixed(2))
}

/**
 * Calculate mock interview score (already out of 100, normalize to 25)
 */
export function calculateMockScore(mockScore: number): number {
    // Mock score is already 0-100, normalize to 25 points
    return Number(((mockScore / 100) * MOCK_ALLOCATION).toFixed(2))
}

/**
 * Calculate total project score
 */
export function calculateTotalScore(
    completedTasks: { taskId: string; difficulty: TaskDifficulty }[],
    allTasks: Task[],
    quizCorrect: number,
    quizTotal: number,
    mockScore: number | null
): ScoreCalculation {
    // Task scoring
    const taskBreakdown = calculateTaskScoring(allTasks)
    const completedTaskIds = new Set(completedTasks.map(t => t.taskId))
    const tasksScore = taskBreakdown
        .filter(t => completedTaskIds.has(t.taskId))
        .reduce((sum, t) => sum + t.points, 0)

    // Quiz scoring
    const quizScore = calculateQuizScore(quizCorrect, quizTotal)

    // Mock scoring
    const mockScorePoints = mockScore !== null ? calculateMockScore(mockScore) : 0

    return {
        totalScore: Number((tasksScore + quizScore + mockScorePoints).toFixed(2)),
        tasksScore: Number(tasksScore.toFixed(2)),
        quizScore: Number(quizScore.toFixed(2)),
        mockScore: Number(mockScorePoints.toFixed(2)),
        taskBreakdown
    }
}

/**
 * Calculate score for a single completed task
 */
export function getTaskPoints(
    taskId: string,
    taskDifficulty: TaskDifficulty,
    allTasks: Task[]
): number {
    const breakdown = calculateTaskScoring(allTasks)
    const taskPoints = breakdown.find(t => t.taskId === taskId)
    return taskPoints?.points || 0
}

/**
 * Calculate progress percentage
 */
export function calculateProgressPercentage(
    tasksCompleted: number,
    totalTasks: number,
    hasQuizCompleted: boolean,
    hasMockCompleted: boolean
): number {
    const totalComponents = totalTasks + (hasQuizCompleted ? 1 : 0) + (hasMockCompleted ? 1 : 0)
    const completedComponents = tasksCompleted + (hasQuizCompleted ? 1 : 0) + (hasMockCompleted ? 1 : 0)
    
    if (totalComponents === 0) return 0
    return Number(((completedComponents / totalComponents) * 100).toFixed(2))
}

/**
 * Get rank suffix (1st, 2nd, 3rd, 4th, etc.)
 */
export function getRankSuffix(rank: number): string {
    const j = rank % 10
    const k = rank % 100
    
    if (j === 1 && k !== 11) return `${rank}st`
    if (j === 2 && k !== 12) return `${rank}nd`
    if (j === 3 && k !== 13) return `${rank}rd`
    return `${rank}th`
}

/**
 * Format score for display
 */
export function formatScore(score: number): string {
    return score.toFixed(2)
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600 dark:text-green-400'
    if (score >= 75) return 'text-blue-600 dark:text-blue-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
}

/**
 * Get rank badge color
 */
export function getRankBadgeColor(rank: number): string {
    if (rank === 1) return 'bg-yellow-500 text-white'
    if (rank === 2) return 'bg-gray-400 text-white'
    if (rank === 3) return 'bg-amber-600 text-white'
    return 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white'
}
