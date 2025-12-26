"use server";

// NOTE: This file is disabled because the Prisma models it references 
// (quizzes, userQuizAttempts) do not exist in the current schema.
// The Studio quiz functionality uses StudioQuiz model instead.
// This file needs to be refactored to use the correct Prisma models.

export async function generateQuiz(_input: {
    topic: string;
    quiz_type: string;
    num_questions: number;
    difficulty: string;
    is_public: boolean;
}) {
    return { error: "Quiz generation is currently disabled" };
}

export async function saveQuizAttempt(
    _userId: string,
    _quizId: string,
    _userAnswers: Record<string, string[]>,
    _score: number
) {
    return null;
}