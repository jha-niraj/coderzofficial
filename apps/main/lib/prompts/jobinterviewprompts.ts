/**
 * Job Interview Assistant Prompts
 * 
 * This file contains all the prompts used for generating and evaluating job interview questions.
 * All prompts are organized into functions with typed parameters for better maintainability.
 */

// Types for prompt parameters
export interface InterviewGenerationParams {
  position: string;
  jobDescription: string;
  resumeText?: string | null;
  companyTitle?: string | null;
  includeAnswers: boolean;
  counts: {
    technical: number;
    behavioral: number;
    coding: number;
  };
}

export interface CodeEvaluationParams {
  questionText: string;
  userCode: string;
  language: string;
}

export interface AnswerGenerationParams {
  questionText: string;
  questionType: 'technical' | 'behavioral' | 'coding';
}

export interface UserResponseEvaluationParams {
  questionText: string;
  userAnswer: string;
  questionType: 'technical' | 'behavioral';
  expertAnswer: string;
}

/**
 * Generate the main interview questions prompt with balanced DSA/Development distribution
 */
export function getInterviewGenerationPrompt(params: InterviewGenerationParams): string {
  const { position, jobDescription, resumeText, companyTitle, includeAnswers, counts } = params;

  // Calculate coding questions distribution
  const getCodingDistribution = (totalCoding: number) => {
    if (totalCoding === 1) {
      return `- 1 Development question (practical coding scenario)`;
    } else if (totalCoding === 2) {
      return `- 1 Development question (practical coding scenario)
- 1 DSA question (data structures & algorithms)`;
    } else if (totalCoding === 3) {
      return `- 2 Development questions (practical coding scenarios)
- 1 DSA question (data structures & algorithms)`;
    } else if (totalCoding === 4) {
      return `- 2 Development questions (practical coding scenarios)
- 2 DSA questions (data structures & algorithms)`;
    } else if (totalCoding === 5) {
      return `- 3 Development questions (practical coding scenarios)
- 2 DSA questions (data structures & algorithms)`;
    } else if (totalCoding === 6) {
      return `- 3 Development questions (practical coding scenarios)
- 3 DSA questions (data structures & algorithms)`;
    } else {
      return `- ${Math.ceil(totalCoding / 2)} Development questions (practical coding scenarios)
- ${Math.floor(totalCoding / 2)} DSA questions (data structures & algorithms)`;
    }
  };

  return `Generate interview questions in valid JSON format. Response must be a complete JSON object.

Position: ${position}
Job Description: ${jobDescription}
${resumeText ? `Resume: ${resumeText.substring(0, 500)}...` : ''}
${companyTitle ? `Company: ${companyTitle}` : ''}

Generate exactly this JSON structure:
{
  "technicalQuestions": [
    {
      "question": "technical question here",
      ${includeAnswers ? '"answer": "detailed comprehensive answer here",' : ''}
      "difficulty": "Easy|Medium|Hard",
      "category": "relevant category"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "behavioral question here"${includeAnswers ? ',\n      "answer": "detailed STAR method answer here",\n      "tips": "interview tips and advice here"' : ''}
    }
  ],
  "codingQuestions": [
    {
      "question": "coding problem statement here",
      "hints": ["hint 1", "hint 2", "hint 3"],
      "testCases": [
        {
          "input": "example input",
          "output": "expected output",
          "explanation": "why this output is expected"
        }
      ],
      "difficulty": "Easy|Medium|Hard",
      "questionType": "DSA|Development"
    }
  ]
}

Requirements:
- ${counts.technical} technical questions relevant to ${position}
- ${counts.behavioral} behavioral questions  
- ${counts.coding} coding questions
- All strings must be properly escaped
- Response must be complete valid JSON
- Each question must be complete and properly terminated
- No trailing commas in arrays or objects
- All property names must be in double quotes
- All string values must be in double quotes and properly escaped

IMPORTANT - Coding Questions Distribution:
For ${counts.coding} coding questions, distribute them as follows:
${getCodingDistribution(counts.coding)}

Development Questions should focus on:
- Building real-world features and components
- API design and implementation
- Database queries and optimizations
- System design Learns
- Framework-specific implementations
- Code architecture and patterns
- Debugging and troubleshooting scenarios

DSA Questions should focus on:
- Arrays, strings, linked lists, trees, graphs
- Sorting and searching algorithms
- Dynamic programming
- Recursion and backtracking
- Time and space complexity optimization

${includeAnswers ? `For Technical Questions:
- Provide comprehensive, detailed answers
- Include implementation details, best practices, and considerations
- Cover edge cases and potential solutions

For Behavioral Questions:
- Provide structured STAR method answers (Situation, Task, Action, Result)
- Include specific examples and metrics where possible
- Add interview tips and advice for answering effectively

For Coding Questions:
- Generate ONLY hints and test cases, NO solutions
- Provide 3-4 helpful hints that guide without giving away the solution
- Include 2-3 comprehensive test cases with inputs, outputs, and explanations
- For DSA questions: provide straightforward input/output test cases
- For Development questions: provide detailed scenario descriptions with expected behaviors and examples
- Specify questionType as either "DSA" or "Development"` : 'Generate questions only without answers, hints, or test cases'}`;
}

/**
 * Generate code evaluation prompt
 */
export function getCodeEvaluationPrompt(params: CodeEvaluationParams): string {
  const { questionText, userCode, language } = params;

  return `You are a senior software engineer conducting a technical interview. Evaluate the following code submission:

**Question:** ${questionText}

**User's Code (${language}):**
\`\`\`${language}
${userCode}
\`\`\`

Please provide a comprehensive evaluation in the following JSON format:
{
  "score": <number between 0-100>,
  "feedback": "<detailed feedback about the solution>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "improvements": ["<improvement 1>", "<improvement 2>", ...],
  "correctness": "<assessment of logical correctness>",
  "efficiency": "<assessment of time/space complexity>",
  "codeQuality": "<assessment of code style and readability>"
}

Evaluation criteria:
- Correctness (40%): Does the code solve the problem correctly?
- Efficiency (25%): What's the time/space complexity? Is it optimal?
- Code Quality (20%): Is the code clean, readable, and well-structured?
- Best Practices (15%): Does it follow language-specific conventions?

Provide constructive feedback that helps the candidate improve.`;
}

/**
 * Generate coding solution prompt for coding questions
 */
export function getCodingAnswerPrompt(params: AnswerGenerationParams): string {
  const { questionText } = params;

  return `You are a senior software engineer. Generate a complete coding solution for this problem.

PROBLEM:
${questionText}

IMPORTANT: Respond with ONLY a valid JSON object in this exact format:
{
"solution": "// Complete JavaScript solution with comments\nfunction solutionName() {\n  // Your code here\n  return result;\n}",
"explanation": "Step-by-step explanation of the approach and algorithm used",
"timeComplexity": "O(n) or O(log n) etc.",
"spaceComplexity": "O(1) or O(n) etc.",
"language": "javascript"
}

Requirements:
- Write clean, well-commented JavaScript code
- Provide a clear step-by-step explanation
- Include proper time and space complexity analysis
- Do not include any text outside the JSON object
- Ensure all strings are properly escaped`;
}

/**
 * Generate general answer prompt for technical/behavioral questions
 */
export function getGeneralAnswerPrompt(params: AnswerGenerationParams): string {
  const { questionText, questionType } = params;

  return `You are an experienced interview coach. Generate a comprehensive answer for this ${questionType} question.

QUESTION:
${questionText}

IMPORTANT: Respond with ONLY a valid JSON object in this exact format:
{
"answer": "Detailed answer content that addresses the question comprehensively",
"tips": ["Practical tip 1", "Practical tip 2", "Practical tip 3"],
"keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
}

Requirements:
- Provide a comprehensive and helpful answer
- Include 3-4 practical interview tips
- Include 3-4 key points to remember
- Make the answer professional and interview-appropriate
- Do not include any text outside the JSON object
- Ensure all strings are properly escaped`;
}

/**
 * Generate detailed individual answer prompt for technical/behavioral questions
 */
export function getDetailedAnswerPrompt(params: AnswerGenerationParams): string {
  const { questionText, questionType } = params;

  if (questionType === 'technical') {
    return `You are a senior technical expert. Provide a comprehensive answer to this technical question:

**Question:** ${questionText}

Provide your response in this JSON format:
{
  "answer": "detailed technical answer with examples and best practices",
  "keyPoints": ["key point 1", "key point 2", ...],
  "examples": ["practical example 1", "practical example 2", ...],
  "bestPractices": ["best practice 1", "best practice 2", ...],
  "commonMistakes": ["mistake 1", "mistake 2", ...],
  "furtherReading": ["resource 1", "resource 2", ...]
}

Requirements:
- Provide technically accurate and detailed explanations
- Include practical examples and use cases
- Mention best practices and common pitfalls
- Use proper technical terminology
- Structure the answer logically`;
  } else {
    return `You are an experienced HR professional and behavioral interview expert. Provide a comprehensive answer to this behavioral question:

**Question:** ${questionText}

Provide your response in this JSON format:
{
  "answer": "structured STAR method answer with specific example",
  "starBreakdown": {
    "situation": "specific context and background",
    "task": "your role and responsibilities",
    "action": "detailed steps you took",
    "result": "quantifiable outcomes and impact"
  },
  "tips": ["interview tip 1", "interview tip 2", ...],
  "keyQualities": ["demonstrated quality 1", "demonstrated quality 2", ...],
  "commonMistakes": ["mistake to avoid 1", "mistake to avoid 2", ...]
}

Requirements:
- Use the STAR method (Situation, Task, Action, Result)
- Provide specific, measurable examples
- Include quantifiable results when possible
- Demonstrate key competencies and soft skills
- Offer practical interview tips`;
  }
}

/**
 * Generate technical user response evaluation prompt
 */
export function getTechnicalResponseEvaluationPrompt(params: UserResponseEvaluationParams): string {
  const { questionText, userAnswer, expertAnswer } = params;

  return `You are a strict technical interviewer evaluating a candidate's response. Your evaluation must be thorough, honest, and critical. Do not give credit for vague or generic answers.

QUESTION:
${questionText}

CANDIDATE'S ANSWER:
${userAnswer}

EXPERT ANSWER (Reference):
${expertAnswer}

STRICT EVALUATION CRITERIA:
1. Technical Accuracy (40%)
- Completely correct technical Learns and terminology
- No misunderstandings or misLearnions
- Accurate explanation of underlying principles
- Proper use of technical terms

2. Implementation Understanding (30%)
- Clear explanation of how to implement the solution
- Correct discussion of data structures and algorithms
- Understanding of time/space complexity
- Awareness of edge cases and limitations

3. Best Practices & Architecture (20%)
- Discussion of scalability considerations
- Mention of relevant design patterns
- Understanding of performance implications
- Security and error handling awareness

4. Communication (10%)
- Clear and structured response
- Proper technical vocabulary
- Logical flow of ideas
- Concise yet complete explanations

SCORING GUIDELINES:
90-100: Exceptional - Near perfect answer with deep technical insight
80-89: Strong - Very good understanding with minor gaps
70-79: Acceptable - Good basic understanding but some weaknesses
60-69: Borderline - Several gaps or misLearnions
Below 60: Insufficient - Major gaps or incorrect understanding

IMPORTANT RULES:
1. Do NOT give credit for:
- Generic or vague statements
- Buzzwords without proper context
- Incorrect technical terms
- Superficial explanations
- Wrong implementation approaches
- Misunderstood Learns

2. STRICTLY compare with expert answer for:
- Technical accuracy
- Implementation details
- Architecture considerations
- Best practices mentioned
- Edge cases covered

3. DEDUCT points for:
- Each technical inaccuracy (-5 points)
- Missing key Learns (-5 points per Learn)
- Incorrect implementations (-10 points)
- Poor structure (-5 points)
- Vague explanations (-5 points)

IMPORTANT: Your response must be a VALID JSON object with NO MARKDOWN formatting. Do not include any text outside the JSON object.

{
  "score": <number between 0-100>,
  "feedback": "<single string with detailed critical analysis>",
  "strengths": [
    "<specific strength with example>",
    "<specific strength with example>"
  ],
  "improvements": [
    "<specific improvement with example>",
    "<specific improvement with example>"
  ],
  "comparedToExpert": {
    "similarities": [
      "<exact technical Learn that matches>",
      "<exact technical Learn that matches>"
    ],
    "missingPoints": [
      "<specific technical point from expert answer that was missing>",
      "<specific technical point from expert answer that was missing>"
    ]
  },
  "technicalAccuracy": {
    "score": <number between 0-40>,
    "details": "<breakdown of technical accuracy scoring>"
  },
  "implementationUnderstanding": {
    "score": <number between 0-30>,
    "details": "<breakdown of implementation scoring>"
  },
  "bestPractices": {
    "score": <number between 0-20>,
    "details": "<breakdown of best practices scoring>"
  },
  "communication": {
    "score": <number between 0-10>,
    "details": "<breakdown of communication scoring>"
  }
}`;
}

/**
 * Generate behavioral user response evaluation prompt
 */
export function getBehavioralResponseEvaluationPrompt(params: UserResponseEvaluationParams): string {
  const { questionText, userAnswer, expertAnswer } = params;

  return `You are a strict behavioral interviewer evaluating a candidate's response. Your evaluation must be thorough, honest, and critical. Do not give credit for vague or generic answers.

QUESTION:
${questionText}

CANDIDATE'S ANSWER:
${userAnswer}

EXPERT ANSWER (Reference):
${expertAnswer}

STRICT EVALUATION CRITERIA:
1. STAR Method Implementation (40%)
- Situation: Clear context and background
- Task: Specific role and responsibilities
- Action: Detailed steps taken
- Result: Quantifiable outcomes

2. Specificity & Evidence (30%)
- Concrete examples and details
- Measurable results and metrics
- Names of technologies/tools used
- Timeline and scope information

3. Relevance & Impact (20%)
- Direct answer to the question
- Demonstration of key competencies
- Clear impact on business/team
- Learning and growth shown

4. Professional Maturity (10%)
- Self-awareness
- Decision-making process
- Handling of challenges
- Professional communication

SCORING GUIDELINES:
90-100: Exceptional - Perfect STAR format with compelling evidence
80-89: Strong - Very good structure with solid examples
70-79: Acceptable - Good basic response but some missing elements
60-69: Borderline - Weak structure or lack of specifics
Below 60: Insufficient - Major structural issues or too generic

IMPORTANT RULES:
1. Do NOT give credit for:
- Generic or cliché responses
- Missing STAR components
- Vague or unquantified results
- Irrelevant examples
- Unprofessional language

2. STRICTLY check for:
- Complete STAR format
- Specific metrics and numbers
- Relevant competencies
- Professional language
- Clear outcomes

3. DEDUCT points for:
- Missing STAR components (-10 points each)
- Lack of specifics (-5 points per instance)
- No measurable results (-10 points)
- Irrelevant examples (-10 points)
- Generic responses (-5 points)

IMPORTANT: Your response must be a VALID JSON object with NO MARKDOWN formatting. Do not include any text outside the JSON object.

{
  "score": <number between 0-100>,
  "feedback": "<single string with detailed critical analysis>",
  "strengths": [
    "<specific strength with example>",
    "<specific strength with example>"
  ],
  "improvements": [
    "<specific improvement with example>",
    "<specific improvement with example>"
  ],
  "comparedToExpert": {
    "similarities": [
      "<exact example that matches expert answer>",
      "<exact example that matches expert answer>"
    ],
    "missingPoints": [
      "<specific point from expert answer that was missing>",
      "<specific point from expert answer that was missing>"
    ]
  },
  "starAnalysis": {
    "situation": {
      "score": <number between 0-10>,
      "feedback": "<specific feedback on situation component>"
    },
    "task": {
      "score": <number between 0-10>,
      "feedback": "<specific feedback on task component>"
    },
    "action": {
      "score": <number between 0-10>,
      "feedback": "<specific feedback on action component>"
    },
    "result": {
      "score": <number between 0-10>,
      "feedback": "<specific feedback on result component>"
    }
  },
  "specificity": {
    "score": <number between 0-30>,
    "details": "<analysis of specific examples and metrics>"
  },
  "relevance": {
    "score": <number between 0-20>,
    "details": "<analysis of relevance to question>"
  },
  "professionalism": {
    "score": <number between 0-10>,
    "details": "<analysis of professional communication>"
  }
}`;
}
