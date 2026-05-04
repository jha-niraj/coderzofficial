import { z } from 'zod';

const SUPPORTED_LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'c'] as const;

export const TestCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  description: z.string().optional(),
});

export const CodeSubmissionSchema = z.object({
  code: z
    .string()
    .min(1, 'Code cannot be empty')
    .max(50000, 'Code exceeds maximum length of 50,000 characters'),
  language: z.enum(SUPPORTED_LANGUAGES, {
    errorMap: () => ({
      message: `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`,
    }),
  }),
  stdin: z
    .string()
    .max(10000, 'stdin exceeds maximum length of 10,000 characters')
    .optional(),
  testCases: z.array(TestCaseSchema).optional(),
  timeoutMs: z
    .number()
    .int()
    .min(1000, 'Timeout must be at least 1000ms')
    .max(30000, 'Timeout cannot exceed 30,000ms')
    .optional(),
});

export type CodeSubmissionInput = z.infer<typeof CodeSubmissionSchema>;
export type TestCaseInput = z.infer<typeof TestCaseSchema>;
