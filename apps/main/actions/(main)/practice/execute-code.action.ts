'use server'

import { auth } from '@repo/auth'

export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'c'

export interface TestCase {
    input: string
    expectedOutput: string
    description?: string
}

export interface TestCaseResult {
    passed: boolean
    input: string
    expectedOutput: string
    actualOutput: string
    description?: string
}

export interface ExecuteCodeResult {
    success: boolean
    stdout?: string
    stderr?: string
    exitCode?: number
    executionTimeMs?: number
    testResults?: TestCaseResult[]
    allTestsPassed?: boolean
    error?: string
}

export async function executeCode(
    code: string,
    language: SupportedLanguage,
    testCases?: TestCase[]
): Promise<ExecuteCodeResult> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized. Please sign in to run code.' }
    }

    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL
    if (!workerUrl) {
        return {
            success: true,
            stdout: '⚠️ Code execution is not configured. Set NEXT_PUBLIC_WORKER_URL to enable.',
            stderr: '',
            exitCode: 0,
            executionTimeMs: 0,
        }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15_000)

    try {
        const response = await fetch(`${workerUrl}/api/v1/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.WORKER_SECRET || ''}`,
            },
            body: JSON.stringify({
                code,
                language,
                testCases: testCases || [],
            }),
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error')
            return {
                success: false,
                error: `Code execution service returned ${response.status}: ${errorText}`,
            }
        }

        const data = await response.json()

        const result: ExecuteCodeResult = {
            success: data.success ?? true,
            stdout: data.stdout ?? '',
            stderr: data.stderr ?? '',
            exitCode: data.exitCode ?? 0,
            executionTimeMs: data.executionTimeMs ?? data.execution_time_ms ?? 0,
        }

        if (data.testResults || data.test_results) {
            const rawResults: Array<Record<string, unknown>> = data.testResults ?? data.test_results ?? []
            result.testResults = rawResults.map((r) => ({
                passed: Boolean(r.passed),
                input: String(r.input ?? ''),
                expectedOutput: String(r.expectedOutput ?? r.expected_output ?? ''),
                actualOutput: String(r.actualOutput ?? r.actual_output ?? ''),
                description: r.description ? String(r.description) : undefined,
            }))
            result.allTestsPassed =
                data.allTestsPassed ??
                data.all_tests_passed ??
                result.testResults.every((t) => t.passed)
        }

        return result
    } catch (err: unknown) {
        clearTimeout(timeoutId)

        if (err instanceof Error && err.name === 'AbortError') {
            return {
                success: false,
                error: 'Code execution timed out after 15 seconds.',
            }
        }

        console.error('[executeCode] fetch error:', err)
        return {
            success: false,
            error: 'Code execution service unavailable',
        }
    }
}
