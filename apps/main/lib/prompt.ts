export const studyPlanGenerationPrompt = `
    Generate a comprehensive learning plan for the provided subject that follows a strict JSON schema. The learning plan should be structured as follows:

    {
        "subject": "[The main topic being studied]",
        "duration": [Total hours required to complete the plan],
        "level": "[One of: Beginner, Intermediate, Advanced]",
        "dailyTasks": [Array of daily tasks]
    }

    For the dailyTasks array, create a sequence of daily learning activities with clear progression. Each day should include:

    {
        "day": [Day number, starting from 1],
        "tasks": [Array of tasks for this day],
        "quiz": {
            "questions": [Array of quiz questions]
        },
        "codingQuestion": {
            "question": "[Programming challenge description]",
            "hints": [Array of hints]
        }
    }

    For each task within a day, include:

    {
        "title": "[Clear, concise title]",
        "description": "[Detailed explanation of what to learn/do]",
        "taskType": "[One of: Reading, Video, Coding, Quiz]",
        "resources": {
            "docs": "[Documentation URL or null]",
            "blog": "[Blog post URL or null]",
            "youtube": "[YouTube video URL or null]"
        }
    }

    For each quiz, include 2-3 multiple-choice questions in this format:

    {
        "question": "[Question text]",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "[The correct option exactly as written in options]"
    }

    Day-specific guidance:
    - Day 1: Focus on introducing fundamental concepts with simple tasks
        • Include basic terminology and core principles
        • Provide beginner-friendly resources
        • Create entry-level quiz questions
        • Design a simple coding question for practice

    - Day 2: Build upon basics with slightly more complex materials
        • Connect concepts from Day 1 to new information
        • Include practical applications of the fundamentals
        • Quiz should test understanding of relationships between concepts
        • Coding question should require applying Day 1 knowledge

    - Day 3-4: Introduce intermediate concepts
        • Present more detailed technical information
        • Include hands-on activities that apply multiple concepts
        • Quiz questions should require deeper understanding
        • Coding questions should involve problem-solving with multiple steps

    - Day 5-6: Expand knowledge with advanced topics (for Intermediate/Advanced plans)
        • Introduce specialized aspects of the subject
        • Include resources that dive deeper into specific areas
        • Quiz questions should test nuanced understanding
        • Coding questions should require integration of multiple skills

    - Final day: Focus on synthesis and practical application
        • Tasks should involve bringing together concepts from previous days
        • Include a comprehensive review activity
        • Quiz should cover the entire learning journey
        • Final coding challenge should demonstrate mastery of the subject

    Adjust the number of days based on the duration and complexity of the subject. Ensure the plan follows a logical learning sequence where each day builds upon previous knowledge. All content should be appropriate for the specified difficulty level.
`