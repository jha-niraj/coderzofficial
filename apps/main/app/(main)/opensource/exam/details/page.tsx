import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@repo/auth'
import { generateThreePhaseExam } from '@/actions/(main)/opensource'
import ExamClient from '@/components/opensource/exam/exam-client'

export default async function ExamDetailsPage() {
    const session = await auth()
    
    if (!session?.user?.id) {
        redirect('/signin?callbackUrl=/opensource/exam')
    }

    // Generate exam questions server-side
    const examResult = await generateThreePhaseExam()

    if (!examResult.success || !examResult.exam) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 flex items-center justify-center">
                <div className="text-center p-8 max-w-md">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Failed to Generate Exam</h2>
                    <p className="text-neutral-400 mb-6">
                        {examResult.error || 'An error occurred while generating exam questions. Please try again.'}
                    </p>
                    <Link 
                        href="/opensource/exam" 
                        className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
                    >
                        Go Back
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <ExamClient exam={examResult.exam} />
    )
}