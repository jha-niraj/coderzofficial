export const demoQuestions = [
    {
        id: "q1",
        questionType: "coding",
        language: "javascript",
        question: "Implement a function that finds the maximum subarray sum in an array of integers.",
        description:
            "Given an array of integers, find the contiguous subarray with the largest sum and return that sum. For example, given the array [-2, 1, -3, 4, -1, 2, 1, -5, 4], the contiguous subarray with the largest sum is [4, -1, 2, 1], with a sum of 6.",
        hints: [
            "Consider using Kadane's algorithm for an O(n) solution.",
            "Keep track of the current sum and the maximum sum seen so far.",
        ],
    },
    {
        id: "q2",
        questionType: "system-design",
        question: "Design a URL shortening service like bit.ly.",
        description:
            "Design a URL shortening service that can handle millions of requests per day. Consider the following aspects: API design, database schema, encoding algorithm, analytics, and scalability.",
        hints: [
            "Think about how to generate unique short URLs efficiently.",
            "Consider the read-to-write ratio and how it affects your database choice.",
            "How would you handle analytics and tracking?",
        ],
    },
    {
        id: "q3",
        questionType: "mcq",
        answerType: "single",
        question: "Which of the following time complexities is most efficient for large inputs?",
        options: [
            { id: "a", text: "O(n²)" },
            { id: "b", text: "O(n log n)" },
            { id: "c", text: "O(n)" },
            { id: "d", text: "O(log n)" },
        ],
        correctAnswer: "d",
    },
    {
        id: "q4",
        questionType: "coding",
        language: "javascript",
        question: "Implement a function to check if a binary tree is balanced.",
        description:
            "A balanced binary tree is defined as a tree such that the height of the left and right subtrees of any node differ by no more than 1. Write a function that takes the root of a binary tree and returns true if the tree is balanced, and false otherwise.",
        hints: [
            "Consider using a recursive approach to check the height of each subtree.",
            "You can use a depth-first traversal to calculate heights.",
        ],
    },
    {
        id: "q5",
        questionType: "mcq",
        answerType: "multiple",
        question: "Which of the following are valid ways to optimize React applications? (Select all that apply)",
        options: [
            { id: "a", text: "Using React.memo for functional components" },
            { id: "b", text: "Adding random keys to list items" },
            { id: "c", text: "Using useCallback for event handlers passed to child components" },
            { id: "d", text: "Putting all state in the top-level component" },
        ],
        correctAnswer: ["a", "c"],
    },
]