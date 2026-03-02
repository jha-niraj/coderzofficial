import { prisma } from "@repo/prisma";

async function seedPracticeProblems() {
    console.log("🧠 Seeding Practice Problems...\n");

    const problems = [
        // ═══════════════════════════════════════════
        // DSA — Arrays & Hashing
        // ═══════════════════════════════════════════
        {
            slug: "two-sum",
            title: "Two Sum",
            description: `## Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return **indices of the two numbers** such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

### Examples

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] == 9, so return [0, 1].
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

**Example 3:**
\`\`\`
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\`

### Constraints
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- **Only one valid answer exists.**`,
            module: "DSA" as const,
            category: "arrays-and-hashing",
            difficulty: "EASY" as const,
            requirements: [
                "Return two indices that add up to target",
                "Achieve O(n) time complexity using a hash map",
                "Handle negative numbers correctly",
                "Do not use the same element twice",
            ],
            hints: [
                "A brute force solution would check every pair — O(n²). Can you do better?",
                "Think about using a hash map to store values you've already seen.",
                "For each number, check if (target - num) already exists in your map.",
            ],
            starterCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your solution here
}`,
            tags: ["array", "hash-map", "easy", "classic"],
            sortOrder: 1,
        },
        {
            slug: "contains-duplicate",
            title: "Contains Duplicate",
            description: `## Contains Duplicate

Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, and return \`false\` if every element is distinct.

### Examples

**Example 1:**
\`\`\`
Input: nums = [1,2,3,1]
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [1,2,3,4]
Output: false
\`\`\`

**Example 3:**
\`\`\`
Input: nums = [1,1,1,3,3,4,3,2,4,2]
Output: true
\`\`\`

### Constraints
- \`1 <= nums.length <= 10^5\`
- \`-10^9 <= nums[i] <= 10^9\``,
            module: "DSA" as const,
            category: "arrays-and-hashing",
            difficulty: "EASY" as const,
            requirements: [
                "Return true if any duplicate exists",
                "Achieve O(n) time complexity",
                "Use a Set or Hash Map for efficient lookup",
            ],
            hints: [
                "A brute force approach compares every pair. Can you use extra space to speed it up?",
                "A Set gives you O(1) lookup. Add elements and check if they already exist.",
            ],
            starterCode: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function containsDuplicate(nums) {
    // Your solution here
}`,
            tags: ["array", "hash-set", "easy"],
            sortOrder: 2,
        },
        {
            slug: "valid-anagram",
            title: "Valid Anagram",
            description: `## Valid Anagram

Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an **anagram** of \`s\`, and \`false\` otherwise.

An **anagram** is a word formed by rearranging the letters of a different word, using all the original letters exactly once.

### Examples

**Example 1:**
\`\`\`
Input: s = "anagram", t = "nagaram"
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: s = "rat", t = "car"
Output: false
\`\`\`

### Constraints
- \`1 <= s.length, t.length <= 5 * 10^4\`
- \`s\` and \`t\` consist of lowercase English letters.`,
            module: "DSA" as const,
            category: "arrays-and-hashing",
            difficulty: "EASY" as const,
            requirements: [
                "Return true if t is an anagram of s",
                "Handle different string lengths",
                "Count character frequencies accurately",
            ],
            hints: [
                "If the lengths differ, it can't be an anagram.",
                "Count the frequency of each character in both strings and compare.",
                "You can use a single frequency map: increment for s, decrement for t, then check all are 0.",
            ],
            starterCode: `/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
function isAnagram(s, t) {
    // Your solution here
}`,
            tags: ["string", "hash-map", "sorting", "easy"],
            sortOrder: 3,
        },
        {
            slug: "group-anagrams",
            title: "Group Anagrams",
            description: `## Group Anagrams

Given an array of strings \`strs\`, group the **anagrams** together. You can return the answer in **any order**.

### Examples

**Example 1:**
\`\`\`
Input: strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]
\`\`\`

**Example 2:**
\`\`\`
Input: strs = [""]
Output: [[""]]
\`\`\`

**Example 3:**
\`\`\`
Input: strs = ["a"]
Output: [["a"]]
\`\`\`

### Constraints
- \`1 <= strs.length <= 10^4\`
- \`0 <= strs[i].length <= 100\`
- \`strs[i]\` consists of lowercase English letters.`,
            module: "DSA" as const,
            category: "arrays-and-hashing",
            difficulty: "MEDIUM" as const,
            requirements: [
                "Group all anagram strings together",
                "Handle empty strings",
                "Use a hash map with a canonical key for each anagram group",
            ],
            hints: [
                "Two strings are anagrams if sorting them produces the same string.",
                "Use the sorted string as a hash map key to group anagrams.",
                "Alternatively, use a character-count tuple as the key for O(n·k) instead of O(n·k·log k).",
            ],
            starterCode: `/**
 * @param {string[]} strs
 * @return {string[][]}
 */
function groupAnagrams(strs) {
    // Your solution here
}`,
            tags: ["array", "hash-map", "string", "medium"],
            sortOrder: 4,
        },

        // ═══════════════════════════════════════════
        // DSA — Two Pointers
        // ═══════════════════════════════════════════
        {
            slug: "valid-palindrome",
            title: "Valid Palindrome",
            description: `## Valid Palindrome

A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.

### Examples

**Example 1:**
\`\`\`
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.
\`\`\`

**Example 2:**
\`\`\`
Input: s = "race a car"
Output: false
\`\`\`

### Constraints
- \`1 <= s.length <= 2 * 10^5\`
- \`s\` consists only of printable ASCII characters.`,
            module: "DSA" as const,
            category: "two-pointers",
            difficulty: "EASY" as const,
            requirements: [
                "Ignore non-alphanumeric characters",
                "Case-insensitive comparison",
                "Use O(1) extra space with two pointers",
            ],
            hints: [
                "Use two pointers: one at the start, one at the end.",
                "Skip non-alphanumeric characters by advancing the pointers.",
                "Compare characters in lowercase.",
            ],
            starterCode: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
    // Your solution here
}`,
            tags: ["string", "two-pointers", "easy"],
            sortOrder: 1,
        },
        {
            slug: "three-sum",
            title: "3Sum",
            description: `## 3Sum

Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain **duplicate triplets**.

### Examples

**Example 1:**
\`\`\`
Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [0,1,1]
Output: []
\`\`\`

### Constraints
- \`3 <= nums.length <= 3000\`
- \`-10^5 <= nums[i] <= 10^5\``,
            module: "DSA" as const,
            category: "two-pointers",
            difficulty: "MEDIUM" as const,
            requirements: [
                "Find all unique triplets summing to zero",
                "No duplicate triplets in the result",
                "Achieve O(n²) time complexity",
                "Sort the array first, then use two pointers",
            ],
            hints: [
                "Sort the array first. This helps you skip duplicates and use two pointers.",
                "Fix one number, then find two numbers that sum to its negation using two pointers.",
                "Skip duplicates by checking if current == previous for both the fixed element and pointers.",
            ],
            starterCode: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
    // Your solution here
}`,
            tags: ["array", "two-pointers", "sorting", "medium", "classic"],
            sortOrder: 2,
        },

        // ═══════════════════════════════════════════
        // DSA — Stack
        // ═══════════════════════════════════════════
        {
            slug: "valid-parentheses",
            title: "Valid Parentheses",
            description: `## Valid Parentheses

Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

### Examples

**Example 1:**
\`\`\`
Input: s = "()"
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`

**Example 3:**
\`\`\`
Input: s = "(]"
Output: false
\`\`\`

### Constraints
- \`1 <= s.length <= 10^4\`
- \`s\` consists of parentheses only \`'()[]{}'\`.`,
            module: "DSA" as const,
            category: "stack",
            difficulty: "EASY" as const,
            requirements: [
                "Handle all three bracket types: (), [], {}",
                "Use a stack data structure",
                "Return true only if all brackets are properly matched and nested",
            ],
            hints: [
                "Use a stack. Push opening brackets, pop for closing brackets.",
                "When you encounter a closing bracket, check if the top of the stack is the matching opening bracket.",
                "If the stack is empty at the end, the string is valid.",
            ],
            starterCode: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    // Your solution here
}`,
            tags: ["string", "stack", "easy", "classic"],
            sortOrder: 1,
        },

        // ═══════════════════════════════════════════
        // DSA — Binary Search
        // ═══════════════════════════════════════════
        {
            slug: "binary-search",
            title: "Binary Search",
            description: `## Binary Search

Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, return its index. Otherwise, return \`-1\`.

You must write an algorithm with **O(log n)** runtime complexity.

### Examples

**Example 1:**
\`\`\`
Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [-1,0,3,5,9,12], target = 2
Output: -1
\`\`\`

### Constraints
- \`1 <= nums.length <= 10^4\`
- All integers in \`nums\` are **unique** and sorted in ascending order.`,
            module: "DSA" as const,
            category: "binary-search",
            difficulty: "EASY" as const,
            requirements: [
                "Achieve O(log n) time complexity",
                "Handle target not found case",
                "Correctly manage left and right boundaries",
            ],
            hints: [
                "Start with left = 0 and right = nums.length - 1.",
                "Calculate mid = Math.floor((left + right) / 2).",
                "If nums[mid] === target, return mid. If less, search right half. If more, search left half.",
            ],
            starterCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
    // Your solution here
}`,
            tags: ["array", "binary-search", "easy", "classic"],
            sortOrder: 1,
        },

        // ═══════════════════════════════════════════
        // DSA — Linked List
        // ═══════════════════════════════════════════
        {
            slug: "reverse-linked-list",
            title: "Reverse Linked List",
            description: `## Reverse Linked List

Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.

### Examples

**Example 1:**
\`\`\`
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]
\`\`\`

**Example 2:**
\`\`\`
Input: head = [1,2]
Output: [2,1]
\`\`\`

**Example 3:**
\`\`\`
Input: head = []
Output: []
\`\`\`

### Constraints
- The number of nodes in the list is in \`[0, 5000]\`.
- \`-5000 <= Node.val <= 5000\`

### Follow up
Can you solve it both iteratively and recursively?`,
            module: "DSA" as const,
            category: "linked-list",
            difficulty: "EASY" as const,
            requirements: [
                "Reverse the linked list in-place",
                "Handle empty list and single node",
                "Return the new head of the reversed list",
            ],
            hints: [
                "Use three pointers: prev, current, and next.",
                "At each step, point current.next to prev, then advance all pointers.",
                "When current is null, prev is the new head.",
            ],
            starterCode: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */

/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
    // Your solution here
}`,
            tags: ["linked-list", "recursion", "easy", "classic"],
            sortOrder: 1,
        },

        // ═══════════════════════════════════════════
        // DSA — Trees
        // ═══════════════════════════════════════════
        {
            slug: "invert-binary-tree",
            title: "Invert Binary Tree",
            description: `## Invert Binary Tree

Given the \`root\` of a binary tree, invert the tree, and return its root.

### Examples

**Example 1:**
\`\`\`
Input: root = [4,2,7,1,3,6,9]
Output: [4,7,2,9,6,3,1]
\`\`\`

**Example 2:**
\`\`\`
Input: root = [2,1,3]
Output: [2,3,1]
\`\`\`

**Example 3:**
\`\`\`
Input: root = []
Output: []
\`\`\`

### Constraints
- The number of nodes is in \`[0, 100]\`.
- \`-100 <= Node.val <= 100\``,
            module: "DSA" as const,
            category: "trees",
            difficulty: "EASY" as const,
            requirements: [
                "Swap left and right children at every node",
                "Handle null/empty tree",
                "Use recursion or BFS/DFS",
            ],
            hints: [
                "At each node, swap its left and right children.",
                "Recursively invert the left subtree and right subtree.",
                "Base case: if root is null, return null.",
            ],
            starterCode: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */

/**
 * @param {TreeNode} root
 * @return {TreeNode}
 */
function invertTree(root) {
    // Your solution here
}`,
            tags: ["tree", "recursion", "bfs", "dfs", "easy", "classic"],
            sortOrder: 1,
        },

        // ═══════════════════════════════════════════
        // DSA — Dynamic Programming
        // ═══════════════════════════════════════════
        {
            slug: "climbing-stairs",
            title: "Climbing Stairs",
            description: `## Climbing Stairs

You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?

### Examples

**Example 1:**
\`\`\`
Input: n = 2
Output: 2
Explanation: 1+1, 2
\`\`\`

**Example 2:**
\`\`\`
Input: n = 3
Output: 3
Explanation: 1+1+1, 1+2, 2+1
\`\`\`

### Constraints
- \`1 <= n <= 45\``,
            module: "DSA" as const,
            category: "dynamic-programming",
            difficulty: "EASY" as const,
            requirements: [
                "Calculate the number of distinct ways to climb n stairs",
                "Use dynamic programming (not pure recursion)",
                "Achieve O(n) time and O(1) or O(n) space",
            ],
            hints: [
                "This is similar to the Fibonacci sequence.",
                "dp[i] = dp[i-1] + dp[i-2] — you can reach step i from step i-1 or i-2.",
                "You only need the last two values, so you can optimize to O(1) space.",
            ],
            starterCode: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
    // Your solution here
}`,
            tags: ["dynamic-programming", "math", "easy", "classic"],
            sortOrder: 1,
        },
        {
            slug: "longest-increasing-subsequence",
            title: "Longest Increasing Subsequence",
            description: `## Longest Increasing Subsequence

Given an integer array \`nums\`, return the length of the **longest strictly increasing subsequence**.

A **subsequence** is derived from an array by deleting some or no elements without changing the order of the remaining elements.

### Examples

**Example 1:**
\`\`\`
Input: nums = [10,9,2,5,3,7,101,18]
Output: 4
Explanation: The longest increasing subsequence is [2,3,7,101].
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [0,1,0,3,2,3]
Output: 4
\`\`\`

**Example 3:**
\`\`\`
Input: nums = [7,7,7,7,7,7,7]
Output: 1
\`\`\`

### Constraints
- \`1 <= nums.length <= 2500\`
- \`-10^4 <= nums[i] <= 10^4\`

### Follow up
Can you come up with an algorithm with O(n log n) time complexity?`,
            module: "DSA" as const,
            category: "dynamic-programming",
            difficulty: "MEDIUM" as const,
            requirements: [
                "Find the length of the longest strictly increasing subsequence",
                "Implement at least an O(n²) DP solution",
                "Handle arrays with all identical elements",
            ],
            hints: [
                "Define dp[i] as the length of the longest increasing subsequence ending at index i.",
                "For each i, check all j < i: if nums[j] < nums[i], then dp[i] = max(dp[i], dp[j] + 1).",
                "For O(n log n), maintain a tails array and use binary search.",
            ],
            starterCode: `/**
 * @param {number[]} nums
 * @return {number}
 */
function lengthOfLIS(nums) {
    // Your solution here
}`,
            tags: ["array", "dynamic-programming", "binary-search", "medium"],
            sortOrder: 2,
        },

        // ═══════════════════════════════════════════
        // DSA — Graphs
        // ═══════════════════════════════════════════
        {
            slug: "number-of-islands",
            title: "Number of Islands",
            description: `## Number of Islands

Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return the **number of islands**.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are surrounded by water.

### Examples

**Example 1:**
\`\`\`
Input: grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]
Output: 1
\`\`\`

**Example 2:**
\`\`\`
Input: grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
Output: 3
\`\`\`

### Constraints
- \`m == grid.length\`
- \`n == grid[i].length\`
- \`1 <= m, n <= 300\`
- \`grid[i][j]\` is \`'0'\` or \`'1'\`.`,
            module: "DSA" as const,
            category: "graphs",
            difficulty: "MEDIUM" as const,
            requirements: [
                "Count connected components of '1's",
                "Use DFS or BFS to traverse each island",
                "Mark visited cells to avoid counting them twice",
            ],
            hints: [
                "Iterate through the grid. When you find a '1', increment count and flood-fill to mark the whole island.",
                "Use DFS: recursively visit all 4 neighbors that are '1', marking them as visited.",
                "You can mark visited cells by changing '1' to '0' in-place.",
            ],
            starterCode: `/**
 * @param {character[][]} grid
 * @return {number}
 */
function numIslands(grid) {
    // Your solution here
}`,
            tags: ["graph", "dfs", "bfs", "matrix", "medium", "classic"],
            sortOrder: 1,
        },

        // ═══════════════════════════════════════════
        // DSA — Sliding Window
        // ═══════════════════════════════════════════
        {
            slug: "best-time-to-buy-and-sell-stock",
            title: "Best Time to Buy and Sell Stock",
            description: `## Best Time to Buy and Sell Stock

You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i-th\` day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the **maximum profit** you can achieve. If you cannot achieve any profit, return \`0\`.

### Examples

**Example 1:**
\`\`\`
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 5.
\`\`\`

**Example 2:**
\`\`\`
Input: prices = [7,6,4,3,1]
Output: 0
Explanation: No profitable transaction possible.
\`\`\`

### Constraints
- \`1 <= prices.length <= 10^5\`
- \`0 <= prices[i] <= 10^4\``,
            module: "DSA" as const,
            category: "sliding-window",
            difficulty: "EASY" as const,
            requirements: [
                "Find the maximum profit from a single buy-sell pair",
                "Buy must happen before sell",
                "Return 0 if no profit is possible",
                "Achieve O(n) time complexity",
            ],
            hints: [
                "Track the minimum price seen so far as you iterate.",
                "At each day, calculate profit = price - minPrice, and update maxProfit.",
                "This is a one-pass solution: O(n) time, O(1) space.",
            ],
            starterCode: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
    // Your solution here
}`,
            tags: ["array", "sliding-window", "greedy", "easy", "classic"],
            sortOrder: 1,
        },

        // ═══════════════════════════════════════════
        // SYSTEM DESIGN — Fundamentals
        // ═══════════════════════════════════════════
        {
            slug: "design-url-shortener",
            title: "Design a URL Shortener (like bit.ly)",
            description: `## Design a URL Shortener

Design a URL shortening service like **bit.ly** or **TinyURL**.

### Requirements

**Functional:**
- Given a long URL, generate a short unique URL
- Given a short URL, redirect to the original long URL
- Users can optionally customize the short URL
- URLs expire after a configurable time (default: no expiry)
- Track analytics: click count, geographic distribution, referrers

**Non-Functional:**
- High availability (99.99% uptime)
- Low latency redirection (< 100ms)
- Short URLs should be as short as possible
- System should handle 100M URLs created per month
- 10:1 read-to-write ratio

### Things to Consider
- How do you generate unique short URLs?
- How do you handle collisions?
- What database to use and why?
- How do you scale reads vs writes?
- Caching strategy for hot URLs
- How to handle expired URLs?

### Diagram Expectations
Draw the system architecture showing:
1. Client → API Gateway → Application Servers
2. URL generation service
3. Database (SQL vs NoSQL decision)
4. Cache layer (Redis)
5. CDN for redirects
6. Analytics pipeline`,
            module: "SYSTEM_DESIGN" as const,
            category: "fundamentals",
            difficulty: "MEDIUM" as const,
            requirements: [
                "Draw a clear system architecture diagram",
                "Explain the URL shortening algorithm (base62, hash, etc.)",
                "Design the database schema",
                "Address scalability with caching (Redis)",
                "Handle collision resolution",
                "Include analytics tracking",
            ],
            hints: [
                "Start with the API design: POST /shorten and GET /:shortCode",
                "Consider base62 encoding of an auto-incrementing ID vs MD5/SHA hash truncation.",
                "A cache (Redis) in front of the DB handles the read-heavy workload.",
                "Think about partitioning the database by short code range.",
            ],
            tags: ["system-design", "url-shortener", "caching", "medium", "classic"],
            sortOrder: 1,
        },
        {
            slug: "design-rate-limiter",
            title: "Design a Rate Limiter",
            description: `## Design a Rate Limiter

Design a rate limiting system that controls the rate of requests a client can send to an API.

### Requirements

**Functional:**
- Limit the number of requests a client can make in a given time window
- Support different rate limit rules per API endpoint
- Return appropriate error responses (HTTP 429) when limit exceeded
- Support multiple algorithms: Fixed Window, Sliding Window, Token Bucket, Leaky Bucket

**Non-Functional:**
- Low latency — rate checking should add < 5ms overhead
- Highly available — system should work even if parts fail (fail-open vs fail-closed)
- Distributed — work across multiple servers
- Accurate — minimize race conditions in distributed environments

### Things to Consider
- Where does the rate limiter sit? (Client, API Gateway, Middleware)
- How do you identify a client? (IP, API key, user ID)
- Which algorithm and why?
- How to handle distributed rate limiting with Redis?
- What happens when the rate limiter itself fails?

### Diagram Expectations
Draw the architecture showing:
1. Client requests flow
2. Rate limiter placement (API Gateway or middleware)
3. Redis for distributed counting
4. Rules engine for configurable limits
5. Response flow for allowed vs rejected requests`,
            module: "SYSTEM_DESIGN" as const,
            category: "fundamentals",
            difficulty: "MEDIUM" as const,
            requirements: [
                "Draw a system architecture showing rate limiter placement",
                "Explain at least 2 rate limiting algorithms with trade-offs",
                "Design the distributed counting mechanism (Redis)",
                "Handle edge cases: distributed environment, clock drift",
                "Define the rules/configuration schema",
            ],
            hints: [
                "Start with the simplest algorithm (Fixed Window Counter) and discuss its limitations.",
                "Token Bucket is widely used by companies like Stripe and AWS.",
                "Redis INCR with EXPIRE is a common implementation for distributed rate limiting.",
                "Consider using Lua scripts in Redis for atomic operations.",
            ],
            tags: ["system-design", "rate-limiter", "redis", "medium", "classic"],
            sortOrder: 2,
        },

        // ═══════════════════════════════════════════
        // SYSTEM DESIGN — Data-Intensive
        // ═══════════════════════════════════════════
        {
            slug: "design-twitter-feed",
            title: "Design Twitter's News Feed",
            description: `## Design Twitter's News Feed

Design a social media news feed system similar to Twitter's home timeline.

### Requirements

**Functional:**
- Users can post tweets (text, images, videos)
- Users can follow/unfollow other users
- Home feed shows tweets from followed users in reverse chronological order
- Support for retweets and likes
- Real-time feed updates

**Non-Functional:**
- Feed generation < 500ms
- Support 500M daily active users
- Highly available
- Eventually consistent (slight delay in feed update is OK)
- Handle celebrity accounts (millions of followers)

### Things to Consider
- Fan-out on write vs fan-out on read
- How to handle celebrity accounts (hybrid approach)?
- Feed ranking and relevance scoring
- Real-time updates via WebSockets or SSE
- Media storage and CDN
- Caching strategy for feeds

### Diagram Expectations
Draw architecture showing:
1. Post service → Fan-out service
2. Feed cache (Redis) per user
3. Social graph service (follow relationships)
4. Media service + CDN
5. Notification service
6. Feed ranking service`,
            module: "SYSTEM_DESIGN" as const,
            category: "social-and-feed",
            difficulty: "HARD" as const,
            requirements: [
                "Draw complete architecture with fan-out strategy",
                "Explain fan-out on write vs read trade-offs",
                "Design the social graph storage",
                "Address the celebrity problem (hybrid approach)",
                "Include caching and CDN strategy",
                "Handle real-time feed updates",
            ],
            hints: [
                "Fan-out on write: pre-compute feeds. Fast reads but expensive writes for celebrities.",
                "Fan-out on read: compute feed at request time. Better for celebrities but slower reads.",
                "Most systems use a hybrid: fan-out on write for normal users, fan-out on read for celebrities.",
                "Redis sorted sets are great for per-user feed caches.",
            ],
            tags: ["system-design", "twitter", "feed", "fan-out", "hard", "classic"],
            sortOrder: 1,
        },

        // ═══════════════════════════════════════════
        // SYSTEM DESIGN — Real-Time
        // ═══════════════════════════════════════════
        {
            slug: "design-chat-system",
            title: "Design a Chat System (like WhatsApp)",
            description: `## Design a Chat System

Design a real-time messaging system like WhatsApp or Slack.

### Requirements

**Functional:**
- 1-on-1 messaging
- Group chat (up to 500 members)
- Online/offline status
- Read receipts (sent, delivered, read)
- Message history and search
- File/image sharing
- Push notifications for offline users

**Non-Functional:**
- Real-time message delivery (< 200ms for online users)
- Message ordering guaranteed
- At-least-once delivery
- Support 1B+ registered users, 100M DAU
- End-to-end encryption
- 99.99% availability

### Diagram Expectations
Draw architecture showing:
1. WebSocket Gateway for real-time connections
2. Message Service for processing/routing
3. Message Storage (Cassandra/HBase)
4. Presence Service (online/offline)
5. Push Notification Service (APNs/FCM)
6. Media Service + Object Storage
7. User Service + Session Management`,
            module: "SYSTEM_DESIGN" as const,
            category: "real-time",
            difficulty: "HARD" as const,
            requirements: [
                "Draw complete real-time architecture with WebSocket layer",
                "Design message delivery flow with receipts",
                "Explain database choice for message storage",
                "Handle group messaging with fan-out",
                "Design presence/online-status system",
                "Address message ordering and idempotency",
            ],
            hints: [
                "WebSocket connections provide bidirectional real-time communication.",
                "Use a message queue (Kafka) between the gateway and message service for reliability.",
                "Cassandra is a good choice for message storage: write-heavy, partitioned by chat_id.",
                "For presence, use heartbeats and a distributed cache (Redis).",
            ],
            tags: ["system-design", "chat", "websocket", "real-time", "hard", "classic"],
            sortOrder: 1,
        },

        // ═══════════════════════════════════════════
        // WEB FRONTEND — React Components
        // ═══════════════════════════════════════════
        {
            slug: "build-todo-app",
            title: "Build a Todo App",
            description: `## Build a Todo App

Build a fully functional **Todo application** using HTML, CSS, and JavaScript in the browser.

### Requirements

**Core Features:**
- Add new todos with a text input and submit button
- Display a list of all todos
- Mark todos as completed (toggle with click/checkbox)
- Delete individual todos
- Show count of remaining (incomplete) todos

**Styling:**
- Clean, modern UI with proper spacing
- Visual distinction between completed and incomplete todos (strikethrough, opacity change)
- Responsive design that works on mobile
- Hover effects on interactive elements
- Smooth transitions for adding/removing todos

**Bonus:**
- Filter todos: All / Active / Completed
- "Clear Completed" button
- Local storage persistence
- Edit todo text on double-click

### Starter Structure
The HTML should have a container, input field, and list area. Use CSS for styling and vanilla JS for functionality.`,
            module: "WEB_FRONTEND" as const,
            category: "react-components",
            difficulty: "EASY" as const,
            requirements: [
                "Add, complete, and delete todos",
                "Show remaining count",
                "Clean, responsive UI with proper styling",
                "Visual feedback for completed items",
                "Handle empty state gracefully",
            ],
            hints: [
                "Start with the HTML structure: input + button + ul for the list.",
                "Use event delegation on the list for handling clicks on individual todo items.",
                "Toggle a 'completed' class for styling completed todos.",
                "Use CSS transitions for smooth add/remove animations.",
            ],
            starterCode: `<!-- HTML -->
<div id="app">
  <h1>📝 Todo App</h1>
  <div class="input-container">
    <input type="text" id="todoInput" placeholder="What needs to be done?" />
    <button id="addBtn">Add</button>
  </div>
  <ul id="todoList"></ul>
  <div class="footer">
    <span id="count">0 items left</span>
  </div>
</div>

<script>
  // Your JavaScript here
</script>`,
            starterCss: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #1a1a2e;
  color: #eee;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding-top: 60px;
}

#app {
  width: 100%;
  max-width: 500px;
  padding: 0 20px;
}

h1 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 28px;
}

/* Add your styles here */
`,
            tags: ["html", "css", "javascript", "todo", "easy", "classic"],
            sortOrder: 1,
        },
        {
            slug: "build-weather-dashboard",
            title: "Build a Weather Dashboard",
            description: `## Build a Weather Dashboard

Build a **Weather Dashboard** UI that displays weather information with a clean, modern design.

### Requirements

**Core Features:**
- Search bar to type a city name
- Display current weather: temperature, condition (sunny/cloudy/rainy), humidity, wind speed
- Show a 5-day forecast with daily highs/lows
- Weather icons/emojis based on conditions
- Loading state while "fetching" data

**Styling:**
- Gradient background that changes based on weather condition
- Glass-morphism cards for weather data
- Smooth transitions between city searches
- Mobile-responsive layout
- Temperature unit toggle (°C / °F)

**Implementation Notes:**
- Use mock data (no real API needed) — create a data object with weather for several cities
- Focus on the UI quality and responsiveness
- Use CSS animations for weather effects (optional: rain drops, sun rays)

### Mock Data Structure
\`\`\`javascript
const weatherData = {
  "New York": { temp: 72, condition: "sunny", humidity: 45, wind: 8, forecast: [...] },
  "London": { temp: 58, condition: "rainy", humidity: 80, wind: 15, forecast: [...] },
  // ...
};
\`\`\``,
            module: "WEB_FRONTEND" as const,
            category: "api-integration",
            difficulty: "MEDIUM" as const,
            requirements: [
                "Search bar with city lookup",
                "Display temperature, condition, humidity, wind",
                "5-day forecast section",
                "Responsive glass-morphism card design",
                "Loading state and error handling",
                "Temperature unit toggle (°C/°F)",
            ],
            hints: [
                "Create a mock data object with 5-6 cities for demo purposes.",
                "Use CSS backdrop-filter: blur() for the glass-morphism effect.",
                "Change the gradient background dynamically based on the weather condition.",
                "Use CSS Grid or Flexbox for the forecast cards layout.",
            ],
            starterCode: `<!-- HTML -->
<div id="app">
  <div class="search-container">
    <input type="text" id="searchInput" placeholder="Search city..." />
  </div>
  <div id="weatherCard" class="weather-card hidden">
    <!-- Weather content will go here -->
  </div>
</div>

<script>
  // Mock weather data
  const weatherData = {
    "New York": { temp: 72, condition: "sunny", humidity: 45, wind: 8 },
    "London": { temp: 58, condition: "rainy", humidity: 80, wind: 15 },
    "Tokyo": { temp: 68, condition: "cloudy", humidity: 60, wind: 10 },
    "Dubai": { temp: 104, condition: "sunny", humidity: 20, wind: 5 },
    "Paris": { temp: 63, condition: "cloudy", humidity: 65, wind: 12 },
  };

  // Your JavaScript here
</script>`,
            starterCss: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  padding-top: 60px;
  color: #fff;
}

/* Add your styles here */
`,
            tags: ["html", "css", "javascript", "dashboard", "ui", "medium"],
            sortOrder: 2,
        },

        // ═══════════════════════════════════════════
        // WEB FRONTEND — CSS & Layout
        // ═══════════════════════════════════════════
        {
            slug: "responsive-pricing-page",
            title: "Build a Responsive Pricing Page",
            description: `## Build a Responsive Pricing Page

Create a **responsive pricing page** with three pricing tiers, commonly seen on SaaS landing pages.

### Requirements

**Core Features:**
- Three pricing cards: Free, Pro, Enterprise
- Each card shows: plan name, price, feature list, CTA button
- Highlight the "recommended" plan (Pro) with a different style
- Monthly/Yearly toggle that updates prices (yearly = monthly × 10)
- Feature comparison checkmarks

**Styling:**
- Cards should be side-by-side on desktop, stacked on mobile
- Smooth hover effects on cards (scale, shadow)
- The recommended card should be slightly larger or elevated
- Clean typography hierarchy
- Use CSS Grid or Flexbox
- Animations on the billing toggle

**Responsive Breakpoints:**
- Desktop: 3 cards in a row
- Tablet: 3 cards with reduced padding
- Mobile: single column, stacked vertically`,
            module: "WEB_FRONTEND" as const,
            category: "css-and-layout",
            difficulty: "EASY" as const,
            requirements: [
                "Three pricing tiers with proper content",
                "Monthly/Yearly billing toggle",
                "Highlighted recommended plan",
                "Fully responsive (desktop, tablet, mobile)",
                "Hover effects and smooth transitions",
            ],
            hints: [
                "Use CSS Grid with grid-template-columns: repeat(3, 1fr) for the card layout.",
                "Use @media queries to switch to single column on mobile.",
                "Add transform: scale(1.05) on the recommended card to make it stand out.",
                "Use a CSS variable for the price and update it with JS on toggle.",
            ],
            starterCode: `<!-- HTML -->
<div class="pricing-container">
  <h1>Choose Your Plan</h1>
  <div class="billing-toggle">
    <span>Monthly</span>
    <label class="switch">
      <input type="checkbox" id="billingToggle" />
      <span class="slider"></span>
    </label>
    <span>Yearly <span class="save-badge">Save 17%</span></span>
  </div>
  <div class="cards" id="pricingCards">
    <!-- Cards will be generated here or written manually -->
  </div>
</div>

<script>
  // Your JavaScript here
</script>`,
            starterCss: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #0f0f0f;
  color: #e5e5e5;
  min-height: 100vh;
  padding: 60px 20px;
}

/* Add your styles here */
`,
            tags: ["html", "css", "layout", "responsive", "easy"],
            sortOrder: 1,
        },

        // ═══════════════════════════════════════════
        // WEB BACKEND — REST APIs
        // ═══════════════════════════════════════════
        {
            slug: "build-rest-api-bookstore",
            title: "Build a Bookstore REST API",
            description: `## Build a Bookstore REST API

Build a complete **RESTful API** for a bookstore using Node.js and Express.

### Requirements

**Endpoints:**
- \`GET /api/books\` — List all books (with pagination, search, filter by genre)
- \`GET /api/books/:id\` — Get a single book by ID
- \`POST /api/books\` — Create a new book
- \`PUT /api/books/:id\` — Update a book
- \`DELETE /api/books/:id\` — Delete a book

**Book Schema:**
\`\`\`json
{
  "id": "string",
  "title": "string",
  "author": "string",
  "genre": "string",
  "price": "number",
  "isbn": "string",
  "publishedYear": "number",
  "inStock": "boolean",
  "createdAt": "timestamp"
}
\`\`\`

**Features:**
- Input validation (title, author required; price > 0; valid ISBN format)
- Proper HTTP status codes (200, 201, 400, 404, 500)
- Error handling middleware
- Pagination: \`?page=1&limit=10\`
- Search: \`?search=harry\` (search in title and author)
- Filter: \`?genre=fiction&inStock=true\`
- Sort: \`?sort=price&order=asc\`

### Implementation Notes
- Use an in-memory array as the "database" (no real DB needed)
- Focus on proper REST conventions and error handling
- Use proper response formats: \`{ success: true, data: ... }\``,
            module: "WEB_BACKEND" as const,
            category: "rest-apis",
            difficulty: "MEDIUM" as const,
            requirements: [
                "Implement all 5 CRUD endpoints",
                "Input validation with proper error messages",
                "Pagination, search, and filter support",
                "Correct HTTP status codes",
                "Consistent response format",
                "Error handling middleware",
            ],
            hints: [
                "Start with the Express app setup and the in-memory books array.",
                "Create a validation function that checks required fields and data types.",
                "Use query parameters for pagination: skip = (page - 1) * limit.",
                "Return a 404 with a clear message when a book is not found.",
            ],
            starterCode: `const express = require('express');
const app = express();
app.use(express.json());

// In-memory database
let books = [];
let nextId = 1;

// Your routes here

const PORT = 3000;
app.listen(PORT, () => {
  console.log(\`Bookstore API running on port \${PORT}\`);
});`,
            testCases: {
                endpoints: [
                    { method: "GET", path: "/api/books", expectedStatus: 200 },
                    { method: "POST", path: "/api/books", body: { title: "Test", author: "Author", genre: "fiction", price: 9.99 }, expectedStatus: 201 },
                    { method: "GET", path: "/api/books/1", expectedStatus: 200 },
                    { method: "PUT", path: "/api/books/1", body: { price: 12.99 }, expectedStatus: 200 },
                    { method: "DELETE", path: "/api/books/1", expectedStatus: 200 },
                    { method: "GET", path: "/api/books/999", expectedStatus: 404 },
                    { method: "POST", path: "/api/books", body: {}, expectedStatus: 400 },
                ],
            },
            tags: ["node", "express", "rest", "api", "crud", "medium", "classic"],
            sortOrder: 1,
        },

        // ═══════════════════════════════════════════
        // WEB BACKEND — Authentication
        // ═══════════════════════════════════════════
        {
            slug: "build-jwt-auth-system",
            title: "Build a JWT Authentication System",
            description: `## Build a JWT Authentication System

Implement a complete **JWT-based authentication system** with registration, login, and protected routes.

### Requirements

**Endpoints:**
- \`POST /api/auth/register\` — Register a new user
- \`POST /api/auth/login\` — Login and receive JWT token
- \`GET /api/auth/me\` — Get current user (protected)
- \`POST /api/auth/refresh\` — Refresh access token
- \`POST /api/auth/logout\` — Invalidate refresh token

**User Schema:**
\`\`\`json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "hashedPassword": "string",
  "createdAt": "timestamp"
}
\`\`\`

**Security Requirements:**
- Password hashing (simulate with a simple hash function)
- Access token expires in 15 minutes
- Refresh token expires in 7 days
- JWT includes user ID and email in payload
- Auth middleware that validates token on protected routes
- Proper error responses for invalid/expired tokens

### Implementation Notes
- Use in-memory storage for users and refresh tokens
- Implement a simple JWT encode/decode (or describe the process)
- Focus on the authentication flow, not cryptographic security`,
            module: "WEB_BACKEND" as const,
            category: "authentication",
            difficulty: "MEDIUM" as const,
            requirements: [
                "Registration with password hashing",
                "Login returning access + refresh tokens",
                "Auth middleware for protected routes",
                "Token refresh flow",
                "Proper error handling for auth failures",
            ],
            hints: [
                "JWTs have three parts: header.payload.signature, each base64 encoded.",
                "Store refresh tokens server-side and validate them on refresh requests.",
                "The auth middleware should extract the token from the Authorization header.",
                "Return 401 for missing/invalid tokens, 403 for expired tokens.",
            ],
            starterCode: `const express = require('express');
const app = express();
app.use(express.json());

// In-memory stores
const users = [];
const refreshTokens = new Set();

// Simple hash function (for demo purposes)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}

// Your routes and middleware here

const PORT = 3000;
app.listen(PORT, () => {
  console.log(\`Auth API running on port \${PORT}\`);
});`,
            tags: ["node", "express", "jwt", "auth", "security", "medium"],
            sortOrder: 1,
        },

        // ═══════════════════════════════════════════
        // WEB BACKEND — Middleware
        // ═══════════════════════════════════════════
        {
            slug: "build-middleware-pipeline",
            title: "Build a Middleware Pipeline System",
            description: `## Build a Middleware Pipeline System

Build a custom **Express-like middleware pipeline** from scratch to understand how middleware works internally.

### Requirements

**Core Implementation:**
- Create a \`App\` class with \`use()\` and \`listen()\` methods
- Implement \`next()\` function for chaining middleware
- Support route-specific middleware: \`app.use('/api', middleware)\`
- Support HTTP method handlers: \`app.get()\`, \`app.post()\`

**Built-in Middleware to Implement:**
1. **Logger** — Log method, URL, status code, response time
2. **CORS** — Set appropriate CORS headers
3. **Body Parser** — Parse JSON request bodies
4. **Rate Limiter** — Limit requests per IP per minute
5. **Error Handler** — Catch errors and return formatted responses

**Features:**
- Middleware executes in the order it's added
- Error-handling middleware catches errors from previous middleware
- Request/response objects have helper methods (\`res.json()\`, \`res.status()\`)

### Implementation Notes
- You can use Node.js \`http\` module as the base
- Focus on the middleware chain pattern
- Each middleware calls \`next()\` to pass control to the next one`,
            module: "WEB_BACKEND" as const,
            category: "middleware",
            difficulty: "HARD" as const,
            requirements: [
                "Implement middleware chain with next() function",
                "Support path-based middleware routing",
                "Build at least 3 middleware functions",
                "Handle errors in the middleware chain",
                "Proper request/response helper methods",
            ],
            hints: [
                "The middleware chain is essentially an array of functions executed sequentially.",
                "next() increments an index and calls the next middleware function.",
                "Error-handling middleware has 4 parameters: (err, req, res, next).",
                "Match request paths against registered middleware paths using startsWith().",
            ],
            starterCode: `const http = require('http');

class App {
  constructor() {
    this.middlewares = [];
  }

  use(pathOrHandler, handler) {
    // Your implementation
  }

  get(path, handler) {
    // Your implementation
  }

  listen(port, callback) {
    // Your implementation
  }
}

// Your middleware implementations here

const app = new App();
app.listen(3000, () => console.log('Server running on port 3000'));`,
            tags: ["node", "middleware", "express", "patterns", "hard"],
            sortOrder: 1,
        },

        // ═══════════════════════════════════════════
        // WEB BACKEND — Error Handling
        // ═══════════════════════════════════════════
        {
            slug: "build-error-handling-system",
            title: "Build a Robust Error Handling System",
            description: `## Build a Robust Error Handling System

Design and implement a **comprehensive error handling system** for a Node.js/Express API.

### Requirements

**Custom Error Classes:**
- \`AppError\` — Base error class with status code, message, and error code
- \`ValidationError\` — For input validation failures (400)
- \`NotFoundError\` — For missing resources (404)
- \`AuthenticationError\` — For auth failures (401)
- \`ForbiddenError\` — For authorization failures (403)
- \`ConflictError\` — For duplicate resources (409)

**Error Handling Middleware:**
- Global error handler that catches all errors
- Different response format for development vs production
- In dev: include stack trace, full error details
- In prod: hide implementation details, show user-friendly message

**Features:**
- Async error wrapper (no try-catch in every route)
- Request validation with detailed error messages
- Structured error response format
- Error logging (console with timestamps)
- Unhandled rejection and uncaught exception handlers

### Error Response Format
\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
\`\`\``,
            module: "WEB_BACKEND" as const,
            category: "error-handling",
            difficulty: "MEDIUM" as const,
            requirements: [
                "Create custom error class hierarchy",
                "Global error handling middleware",
                "Different dev/prod error responses",
                "Async error wrapper utility",
                "Structured error response format",
                "Request validation with detailed feedback",
            ],
            hints: [
                "Extend the built-in Error class for your custom errors.",
                "The async wrapper: const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)",
                "Express error middleware has 4 params: (err, req, res, next).",
                "Use process.env.NODE_ENV to toggle dev vs prod error details.",
            ],
            starterCode: `const express = require('express');
const app = express();
app.use(express.json());

// Your custom error classes here

// Your middleware and routes here

const PORT = 3000;
app.listen(PORT, () => {
  console.log(\`API running on port \${PORT}\`);
});`,
            tags: ["node", "express", "error-handling", "patterns", "medium"],
            sortOrder: 1,
        },
    ];

    let created = 0;
    let skipped = 0;

    for (const problem of problems) {
        const existing = await prisma.practiceProblem.findUnique({
            where: { slug: problem.slug },
        });

        if (existing) {
            skipped++;
            continue;
        }

        await prisma.practiceProblem.create({
            data: {
                slug: problem.slug,
                title: problem.title,
                description: problem.description,
                module: problem.module,
                category: problem.category,
                difficulty: problem.difficulty,
                requirements: problem.requirements,
                hints: problem.hints,
                starterCode: problem.starterCode ?? null,
                starterCss: problem.starterCss ?? null,
                testCases: problem.testCases ?? undefined,
                tags: problem.tags,
                sortOrder: problem.sortOrder,
                isActive: true,
            },
        });
        created++;
    }

    console.log(`✅ Practice Problems: ${created} created, ${skipped} skipped (already exist)`);
}

// ─── Run standalone ─────────────────────────
seedPracticeProblems()
    .then(() => {
        console.log("\n🎉 Practice seed completed!");
    })
    .catch((e) => {
        console.error("❌ Practice seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
