# KnowMe Technical Guide: Vector Databases & AI Embeddings

## 📋 Table of Contents

1. [Introduction to Vector Databases](#introduction)
2. [Understanding Embeddings](#embeddings)
3. [How KnowMe Works](#how-knowme-works)
4. [Complete Architecture Flow](#architecture)
5. [Implementation Details](#implementation)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## 1. Introduction to Vector Databases {#introduction}

### What is a Vector Database?

A **vector database** is a specialized database designed to store and query high-dimensional vectors (arrays of numbers). Unlike traditional databases that search for exact matches, vector databases find items based on **similarity**.

```
Traditional Database:
┌─────────────────────────────────────┐
│ SELECT * FROM users WHERE name = 'John'  │
│ → Exact match only                       │
└─────────────────────────────────────┘

Vector Database:
┌─────────────────────────────────────┐
│ Find vectors similar to [0.1, 0.5, 0.3, ...] │
│ → Returns similar items ranked by score      │
└─────────────────────────────────────┘
```

### Why Use Upstash Vector?

KnowMe uses **Upstash Vector** for several reasons:

| Feature | Benefit |
|---------|---------|
| **Serverless** | No server management, auto-scaling |
| **Pay-per-use** | Cost-effective for variable workloads |
| **Global** | Low latency worldwide |
| **REST API** | Easy integration with Next.js |
| **Namespaces** | Isolate data per user |

### Key Learns

```
┌─────────────────────────────────────────────────────────────┐
│                    VECTOR DATABASE LearnS                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Vector          = [0.1, 0.5, 0.3, ..., 0.8]               │
│                    Array of 1536 floating-point numbers     │
│                                                              │
│  Embedding       = Converting text to vector                │
│                    "I love coding" → [0.2, 0.7, ...]       │
│                                                              │
│  Namespace       = Isolated space for a user's data         │
│                    user_123/ ← All vectors for user 123     │
│                                                              │
│  Similarity      = How close two vectors are (0-1)          │
│                    0.95 = very similar, 0.3 = not similar   │
│                                                              │
│  Metadata        = Extra info stored with vector            │
│                    { type: "project", title: "My App" }     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Understanding Embeddings {#embeddings}

### What are Embeddings?

**Embeddings** are numerical representations of text that capture semantic meaning. Similar texts have similar embeddings.

```
Text Input:
"I have experience with React"    → [0.12, 0.85, 0.34, ...]
"I know React framework"          → [0.11, 0.84, 0.35, ...]  ← Similar!
"I like pizza"                    → [0.78, 0.21, 0.92, ...]  ← Different

The first two vectors are close because they mean similar things.
```

### How OpenAI Creates Embeddings

```
┌─────────────────────────────────────────────────────────────────┐
│                      EMBEDDING PROCESS                           │
│                                                                  │
│                                                                  │
│    "I have 3 years of React experience"                         │
│                      │                                           │
│                      ▼                                           │
│            ┌─────────────────┐                                  │
│            │   OpenAI API    │                                  │
│            │ text-embedding- │                                  │
│            │   3-small       │                                  │
│            └────────┬────────┘                                  │
│                     │                                           │
│                     ▼                                           │
│    [0.023, -0.156, 0.342, 0.089, ..., 0.234]                   │
│    └─────────────── 1536 dimensions ────────────────┘          │
│                                                                  │
│    This vector "captures" the meaning of the text               │
└─────────────────────────────────────────────────────────────────┘
```

### Why 1536 Dimensions?

OpenAI's `text-embedding-3-small` model outputs 1536-dimensional vectors. Each dimension represents a learned feature of the text:

- Dimension 1 might correlate with "technical content"
- Dimension 234 might correlate with "experience level"
- Dimension 891 might correlate with "programming Learns"

The model learns these features automatically during training.

### Cosine Similarity

To compare embeddings, we use **cosine similarity**:

```
Cosine Similarity Formula:

similarity = (A · B) / (||A|| × ||B||)

Where:
- A · B is the dot product of vectors A and B
- ||A|| and ||B|| are the magnitudes

Result ranges from -1 to 1:
-  1.0 = Identical direction (very similar)
-  0.0 = Perpendicular (unrelated)
- -1.0 = Opposite direction (opposite meaning)

For text, scores typically range from 0.3 to 0.95
```

---

## 3. How KnowMe Works {#how-knowme-works}

### The Big Picture

KnowMe uses **RAG (Retrieval-Augmented Generation)** to answer questions about users:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         RAG WORKFLOW                                 │
│                                                                      │
│  1. USER ASKS: "What's your experience with React?"                 │
│                                                                      │
│  2. EMBED QUESTION:                                                 │
│     "What's your experience with React?" → [0.2, 0.5, ...]         │
│                                                                      │
│  3. SEARCH VECTOR DB:                                               │
│     Find chunks similar to question embedding                        │
│     → "3 years React experience building apps..."                   │
│     → "React project: E-commerce platform..."                       │
│                                                                      │
│  4. BUILD CONTEXT:                                                  │
│     Combine relevant chunks into context                            │
│                                                                      │
│  5. GENERATE RESPONSE:                                              │
│     Send question + context to GPT-4o-mini                          │
│                                                                      │
│  6. RETURN ANSWER:                                                  │
│     "I have 3+ years of React experience, including an              │
│      e-commerce platform with 10K users..."                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Why RAG? Why Not Just Use ChatGPT?

| Without RAG (Pure LLM) | With RAG (KnowMe) |
|------------------------|-------------------|
| "I don't have information about John's projects" | "John has 5 React projects, including..." |
| Generic, made-up responses | Accurate, data-driven responses |
| Hallucinations common | Grounded in real data |
| Can't update without retraining | Updates instantly with new data |

---

## 4. Complete Architecture Flow {#architecture}

### Data Ingestion Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA INGESTION FLOW                              │
│                                                                          │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                    USER DATA SOURCES                            │   │
│   │                                                                  │   │
│   │  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐       │   │
│   │  │ Profile │   │Projects │   │Assessmt │   │ Resume  │       │   │
│   │  │  Data   │   │  Data   │   │  Data   │   │  File   │       │   │
│   │  └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘       │   │
│   │       │             │             │             │              │   │
│   └───────┼─────────────┼─────────────┼─────────────┼──────────────┘   │
│           │             │             │             │                   │
│           ▼             ▼             ▼             ▼                   │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                      CHUNKING LAYER                             │   │
│   │                                                                  │   │
│   │  • Split text into meaningful chunks (~500 tokens each)         │   │
│   │  • Preserve context within chunks                               │   │
│   │  • Add metadata (source type, title, etc.)                      │   │
│   │                                                                  │   │
│   └────────────────────────────┬───────────────────────────────────┘   │
│                                │                                        │
│                                ▼                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                    EMBEDDING GENERATION                         │   │
│   │                                                                  │   │
│   │  ┌──────────────────────────────────────────────────────────┐ │   │
│   │  │  Chunk: "3 years React experience building apps..."      │ │   │
│   │  │                          │                                │ │   │
│   │  │                          ▼                                │ │   │
│   │  │                   ┌──────────────┐                        │ │   │
│   │  │                   │   OpenAI     │                        │ │   │
│   │  │                   │  Embedding   │                        │ │   │
│   │  │                   │     API      │                        │ │   │
│   │  │                   └──────┬───────┘                        │ │   │
│   │  │                          │                                │ │   │
│   │  │                          ▼                                │ │   │
│   │  │  Embedding: [0.12, 0.85, 0.34, ..., 0.67]               │ │   │
│   │  └──────────────────────────────────────────────────────────┘ │   │
│   │                                                                  │   │
│   └────────────────────────────┬───────────────────────────────────┘   │
│                                │                                        │
│                                ▼                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                    VECTOR DATABASE STORAGE                      │   │
│   │                                                                  │   │
│   │                      Upstash Vector                             │   │
│   │  ┌──────────────────────────────────────────────────────────┐ │   │
│   │  │                                                            │ │   │
│   │  │  Namespace: user_profile_id_123                           │ │   │
│   │  │  ┌────────────────────────────────────────────────────┐  │ │   │
│   │  │  │ Vector ID: profile_123_project_1_0                 │  │ │   │
│   │  │  │ Embedding: [0.12, 0.85, ...]                       │  │ │   │
│   │  │  │ Metadata: {                                         │  │ │   │
│   │  │  │   text: "3 years React experience...",             │  │ │   │
│   │  │  │   sourceType: "PROJECT",                           │  │ │   │
│   │  │  │   title: "E-commerce Platform"                     │  │ │   │
│   │  │  │ }                                                   │  │ │   │
│   │  │  └────────────────────────────────────────────────────┘  │ │   │
│   │  │                                                            │ │   │
│   │  │  ┌────────────────────────────────────────────────────┐  │ │   │
│   │  │  │ Vector ID: profile_123_assessment_1_0              │  │ │   │
│   │  │  │ ...                                                │  │ │   │
│   │  │  └────────────────────────────────────────────────────┘  │ │   │
│   │  │                                                            │ │   │
│   │  └──────────────────────────────────────────────────────────┘ │   │
│   │                                                                  │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Question Answering Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       QUESTION ANSWERING FLOW                            │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ VISITOR: "What's your experience with React?"                    │  │
│   └────────────────────────────┬────────────────────────────────────┘  │
│                                │                                        │
│                                ▼                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                    STEP 1: EMBED QUESTION                       │   │
│   │                                                                  │   │
│   │  "What's your experience with React?"                           │   │
│   │                       │                                          │   │
│   │                       ▼                                          │   │
│   │              OpenAI Embedding API                                │   │
│   │                       │                                          │   │
│   │                       ▼                                          │   │
│   │  Question Embedding: [0.23, 0.67, 0.45, ..., 0.89]             │   │
│   │                                                                  │   │
│   └────────────────────────────┬───────────────────────────────────┘   │
│                                │                                        │
│                                ▼                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                    STEP 2: SEARCH VECTORS                       │   │
│   │                                                                  │   │
│   │  Query Upstash Vector:                                          │   │
│   │  ┌──────────────────────────────────────────────────────────┐ │   │
│   │  │ namespace: "profile_123"                                  │ │   │
│   │  │ vector: [0.23, 0.67, 0.45, ..., 0.89]                    │ │   │
│   │  │ topK: 5                                                   │ │   │
│   │  │ minScore: 0.5                                             │ │   │
│   │  └──────────────────────────────────────────────────────────┘ │   │
│   │                                                                  │   │
│   │  Results:                                                        │   │
│   │  ┌──────────────────────────────────────────────────────────┐ │   │
│   │  │ 1. Score: 0.92 - "3 years React experience building..."  │ │   │
│   │  │ 2. Score: 0.88 - "React project: E-commerce platform..." │ │   │
│   │  │ 3. Score: 0.82 - "95% on React assessment..."            │ │   │
│   │  │ 4. Score: 0.75 - "Technologies: React, Redux, TS..."     │ │   │
│   │  │ 5. Score: 0.71 - "Frontend skills: React, Vue..."        │ │   │
│   │  └──────────────────────────────────────────────────────────┘ │   │
│   │                                                                  │   │
│   └────────────────────────────┬───────────────────────────────────┘   │
│                                │                                        │
│                                ▼                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                    STEP 3: BUILD CONTEXT                        │   │
│   │                                                                  │   │
│   │  System Prompt:                                                  │   │
│   │  ┌──────────────────────────────────────────────────────────┐ │   │
│   │  │ "You are an AI assistant representing John Developer.    │ │   │
│   │  │  Answer questions in first person based on the context.  │ │   │
│   │  │  Never make up information..."                            │ │   │
│   │  └──────────────────────────────────────────────────────────┘ │   │
│   │                                                                  │   │
│   │  User Prompt:                                                    │   │
│   │  ┌──────────────────────────────────────────────────────────┐ │   │
│   │  │ "Based on this context about me, answer the question:    │ │   │
│   │  │                                                           │ │   │
│   │  │  CONTEXT:                                                 │ │   │
│   │  │  [Context 1] - E-commerce Platform (project)              │ │   │
│   │  │  3 years React experience building production apps...     │ │   │
│   │  │                                                           │ │   │
│   │  │  [Context 2] - Assessment                                 │ │   │
│   │  │  95% on React assessment...                               │ │   │
│   │  │  ...                                                      │ │   │
│   │  │                                                           │ │   │
│   │  │  QUESTION: What's your experience with React?"            │ │   │
│   │  └──────────────────────────────────────────────────────────┘ │   │
│   │                                                                  │   │
│   └────────────────────────────┬───────────────────────────────────┘   │
│                                │                                        │
│                                ▼                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                    STEP 4: GENERATE RESPONSE                    │   │
│   │                                                                  │   │
│   │                     ┌──────────────────┐                        │   │
│   │                     │    GPT-4o-mini   │                        │   │
│   │                     │                  │                        │   │
│   │  System Prompt ───► │                  │ ───► Generated Answer  │   │
│   │  User Prompt   ───► │                  │                        │   │
│   │                     └──────────────────┘                        │   │
│   │                                                                  │   │
│   └────────────────────────────┬───────────────────────────────────┘   │
│                                │                                        │
│                                ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ RESPONSE: "I have 3+ years of React experience! I've built     │  │
│   │ an e-commerce platform with 10K+ users using React, Redux,     │  │
│   │ and TypeScript. I also scored 95% on my React assessment.      │  │
│   │                                                                  │  │
│   │ 📊 View my projects →                                           │  │
│   │ 💼 Interested? Let's connect!"                                  │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Implementation Details {#implementation}

### Text Chunking Strategy

```typescript
// apps/main/utils/knowme/chunking.ts

const CHUNK_CONFIG = {
  maxTokens: 500,        // Max tokens per chunk
  overlap: 50,           // Overlap between chunks for context
  minChunkSize: 100,     // Don't create tiny chunks
};

// Example: Chunking a project description
function createProjectChunks(profileId: string, projectId: string, data: {
  title: string;
  description: string;
  technologies: string[];
}) {
  const text = `
    Project: ${data.title}
    
    Description: ${data.description}
    
    Technologies: ${data.technologies.join(", ")}
  `;
  
  return chunkText(text).map((chunk, index) => ({
    text: chunk,
    metadata: {
      profileId,
      sourceType: "PROJECT",
      sourceId: projectId,
      chunkIndex: index,
      title: data.title,
      techStack: data.technologies,
    },
  }));
}
```

### Embedding Generation

```typescript
// apps/main/utils/knowme/embeddings.ts

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",  // Cost-effective model
    input: text.trim(),
  });
  
  return response.data[0].embedding;  // Returns 1536-dim vector
}

// Batch processing for efficiency
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts.map(t => t.trim()),
  });
  
  return response.data.map(d => d.embedding);
}
```

### Vector Database Operations

```typescript
// apps/main/utils/knowme/vector-db.ts

import { Index } from "@upstash/vector";

const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

// Store a vector
export async function upsertVector(
  id: string,
  embedding: number[],
  metadata: Record<string, unknown>,
  namespace: string  // User's profile ID
) {
  await vectorIndex.upsert(
    [{ id, vector: embedding, metadata }],
    { namespace }
  );
}

// Search for similar vectors
export async function queryVectors(
  queryEmbedding: number[],
  namespace: string,
  options: { topK?: number; minScore?: number }
) {
  const results = await vectorIndex.query(
    {
      vector: queryEmbedding,
      topK: options.topK || 5,
      includeMetadata: true,
    },
    { namespace }
  );
  
  return results.filter(r => (r.score ?? 0) >= (options.minScore || 0.5));
}
```

### RAG Response Generation

```typescript
// apps/main/utils/knowme/ai-response.ts

import OpenAI from "openai";

export async function generateResponse(
  question: string,
  contextChunks: VectorSearchResult[],
  userInfo: { name: string; occupation: string | null },
  viewerType: string
) {
  const systemPrompt = buildSystemPrompt(userInfo, viewerType);
  const context = formatContextForPrompt(contextChunks);
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: `Based on this context about me:\n\n${context}\n\nAnswer: ${question}`
      },
    ],
    temperature: 0.7,
    max_tokens: 800,
  });
  
  return {
    answer: response.choices[0].message.content,
    sources: extractSources(contextChunks),
    tokensUsed: response.usage?.total_tokens || 0,
  };
}
```

---

## 6. API Reference {#api-reference}

### External API Endpoint

```
POST /api/v1/knowme/chat

Headers:
  Authorization: Bearer <API_KEY>
  Content-Type: application/json

Body:
{
  "question": "What's your experience with React?",
  "sessionId": "optional-session-id-for-continuity"
}

Response:
{
  "success": true,
  "answer": "I have 3+ years of React experience...",
  "sources": [
    {
      "type": "project",
      "title": "E-commerce Platform",
      "url": "/projects/ecommerce"
    }
  ],
  "sessionId": "abc123",
  "rateLimit": {
    "remaining": 95,
    "resetAt": "2024-01-09T23:59:59Z"
  },
  "poweredBy": "Coderz KnowMe",
  "profileUrl": "https://coderz.com/knowme/username"
}
```

### Server Actions

```typescript
// Available server actions for KnowMe

// Profile Management
getMyKnowMeProfile()
getKnowMeProfileByUsername(username: string)
initializeKnowMeProfile()
updateKnowMeProfile(data: UpdateData)
deleteKnowMeProfile()

// Chat
getOrCreateChatSession(profileId: string, sessionToken?: string)
sendChatMessage(sessionId: string, question: string)
getChatHistory(sessionToken: string)
submitMessageFeedback(messageId: string, helpful: boolean)

// Embeddings
generateProfileEmbeddings()
triggerManualUpdate()
deleteAllEmbeddings()
getEmbeddingJobStatus(jobId: string)

// Analytics
getKnowMeAnalytics(timeRange: TimeRange)
exportAnalyticsData(timeRange: TimeRange)

// API Management
getApiConfig()
toggleApiAccess(enabled: boolean)
regenerateApiKey()
```

---

## 7. Troubleshooting {#troubleshooting}

### Common Issues

#### 1. "No relevant context found" Responses

```
Problem: AI says it doesn't have information about a topic

Causes:
- Not enough data in the knowledge base
- Data not yet embedded
- Similarity threshold too high

Solutions:
1. Check if embeddings exist: Profile → Settings → Data Sources
2. Trigger manual update if data was added recently
3. Add more relevant content (projects, skills, etc.)
```

#### 2. Slow Response Times

```
Problem: Chat responses take too long

Causes:
- Large context being processed
- API rate limits
- Network latency

Solutions:
1. Reduce topK results (default is 5)
2. Check OpenAI API status
3. Implement response streaming (future feature)
```

#### 3. API Key Issues

```
Problem: External API returns 401 Unauthorized

Causes:
- Invalid or expired API key
- API access disabled
- Rate limit exceeded

Solutions:
1. Regenerate API key in Settings → API
2. Ensure API access is enabled
3. Check daily usage limits
```

### Debug Checklist

```
□ Check environment variables are set:
  - OPENAI_API_KEY
  - UPSTASH_VECTOR_REST_URL
  - UPSTASH_VECTOR_REST_TOKEN

□ Verify embeddings exist:
  - Run generateProfileEmbeddings()
  - Check totalEmbeddingsCount in profile

□ Test vector search:
  - Use queryVectors() directly
  - Verify namespace matches profileId

□ Check API response:
  - Validate API key format
  - Check rate limit status
  - Review error logs
```

---

## 8. Best Practices {#best-practices}

### For Users

1. **Keep Profile Updated**: More data = better answers
2. **Write Descriptive Content**: Detailed projects get better embeddings
3. **Connect Platforms**: GitHub, LeetCode add valuable context
4. **Monitor Analytics**: See what questions are being asked

### For Developers (Future Integration)

```typescript
// Best practices for external API integration

// 1. Store session IDs for conversation continuity
const sessionId = localStorage.getItem('knowme_session');

// 2. Handle rate limits gracefully
if (response.rateLimit.remaining < 5) {
  showRateLimitWarning();
}

// 3. Display sources for transparency
response.sources.forEach(source => {
  addSourceLink(source);
});

// 4. Include "Powered by KnowMe" attribution
<footer>Powered by Coderz KnowMe</footer>
```

### Cost Optimization

```
┌─────────────────────────────────────────────────────────────────┐
│                    COST BREAKDOWN                                │
│                                                                  │
│  1. EMBEDDING GENERATION (One-time per update):                 │
│     - text-embedding-3-small: $0.02 / 1M tokens                │
│     - Average user: ~20K tokens = $0.0004                       │
│                                                                  │
│  2. CHAT RESPONSES (Per question):                              │
│     - gpt-4o-mini: $0.15 / 1M input, $0.60 / 1M output         │
│     - Average question: ~1K tokens = $0.0006                    │
│                                                                  │
│  3. VECTOR DATABASE (Monthly):                                  │
│     - Upstash Vector: Pay-per-use                               │
│     - Average user: ~100 queries/month = ~$0.01                 │
│                                                                  │
│  TOTAL COST PER USER/MONTH: ~$0.05 - $0.50                     │
│  (Depends on usage)                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary

KnowMe leverages three key technologies:

1. **OpenAI Embeddings**: Convert text to semantic vectors
2. **Upstash Vector**: Store and search vectors efficiently
3. **GPT-4o-mini**: Generate natural language responses

The RAG architecture ensures answers are:
- **Accurate**: Based on real user data
- **Relevant**: Found through semantic search
- **Natural**: Generated by state-of-the-art LLM

For questions or support, contact the Coderz team! 🚀