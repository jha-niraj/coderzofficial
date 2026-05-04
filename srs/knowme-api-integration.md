# KnowMe API Integration Guide

## 🚀 Quick Start

Add a personal AI assistant to your portfolio in minutes!

```html
<!-- Add to your website -->
<script src="https://cdn.coderz.com/knowme/widget.js"></script>
<script>
  KnowMe.init({
    apiKey: 'your-api-key-here',
    theme: 'dark'
  });
</script>
```

---

## 📋 Table of Contents

1. [Getting Your API Key](#getting-api-key)
2. [API Endpoints](#api-endpoints)
3. [Widget Integration](#widget-integration)
4. [Custom Integration](#custom-integration)
5. [React Component Example](#react-example)
6. [Error Handling](#error-handling)
7. [Rate Limits](#rate-limits)
8. [Security Best Practices](#security)

---

## 1. Getting Your API Key {#getting-api-key}

### Step 1: Enable API Access

1. Go to **KnowMe → Settings → API Integration**
2. Toggle **Enable External API Access**
3. Copy your API key

### Step 2: Secure Your Key

```
⚠️ IMPORTANT: Never expose your API key in client-side code!

✅ GOOD: Use environment variables on your backend
✅ GOOD: Use a proxy endpoint to hide your key
❌ BAD: Hardcode in JavaScript that runs in browser
❌ BAD: Commit to public repositories
```

---

## 2. API Endpoints {#api-endpoints}

### Base URL
```
https://coderz.com/api/v1/knowme
```

### Chat Endpoint

```http
POST /api/v1/knowme/chat
```

**Headers:**
```
Authorization: Bearer <YOUR_API_KEY>
Content-Type: application/json
```

**Request Body:**
```json
{
  "question": "What are your main technical skills?",
  "sessionId": "optional-session-id"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "answer": "My main technical skills include React, TypeScript, Node.js, and Python. I have 3+ years of experience building full-stack applications...",
    "sources": [
      {
        "type": "profile",
        "title": "Skills & Experience",
        "snippet": "React, TypeScript, Node.js..."
      },
      {
        "type": "project",
        "title": "E-commerce Platform",
        "url": "/projects/ecommerce"
      }
    ],
    "category": "TECHNICAL_SKILLS",
    "sessionId": "sess_abc123def456",
    "messageId": "msg_789xyz",
    "tokensUsed": 342
  },
  "rateLimit": {
    "remaining": 94,
    "total": 100,
    "resetAt": "2024-01-10T00:00:00Z"
  },
  "poweredBy": "Coderz KnowMe",
  "profileUrl": "https://coderz.com/knowme/johndoe"
}
```

**Error Response (4xx/5xx):**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 3600
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_API_KEY` | API key is invalid or missing |
| `API_DISABLED` | API access is disabled for this profile |
| `RATE_LIMIT_EXCEEDED` | Daily rate limit exceeded |
| `SESSION_LIMIT_EXCEEDED` | Too many questions in one session |
| `INVALID_REQUEST` | Request body is malformed |
| `NO_CONTEXT_FOUND` | No relevant data to answer question |
| `INTERNAL_ERROR` | Server error, try again later |

---

## 3. Widget Integration {#widget-integration}

The easiest way to add KnowMe to your website.

### Basic Integration

```html
<!-- Add before </body> -->
<script src="https://cdn.coderz.com/knowme/widget.js"></script>
<script>
  KnowMe.init({
    apiKey: 'km_live_abc123...',  // Your API key
    position: 'bottom-right',      // Widget position
    theme: 'auto',                 // 'light', 'dark', or 'auto'
  });
</script>
```

### Configuration Options

```javascript
KnowMe.init({
  // Required
  apiKey: 'km_live_abc123...',
  
  // Appearance
  position: 'bottom-right',    // 'bottom-right' | 'bottom-left'
  theme: 'auto',               // 'light' | 'dark' | 'auto'
  accentColor: '#6366f1',      // Custom accent color
  avatarUrl: '/my-avatar.jpg', // Custom avatar
  
  // Behavior
  autoOpen: false,             // Auto-open on load
  greeting: 'Hi! Ask me anything about my experience!',
  suggestedQuestions: [
    'What are your main skills?',
    'Tell me about your projects',
    'Are you available for work?'
  ],
  
  // Branding
  showBranding: true,          // Show "Powered by KnowMe"
  
  // Callbacks
  onReady: () => console.log('Widget ready!'),
  onMessage: (msg) => console.log('New message:', msg),
  onError: (err) => console.error('Error:', err),
});
```

### Widget Methods

```javascript
// Open the chat widget
KnowMe.open();

// Close the chat widget
KnowMe.close();

// Toggle the widget
KnowMe.toggle();

// Send a message programmatically
KnowMe.sendMessage('What are your skills?');

// Destroy the widget
KnowMe.destroy();
```

### Custom Button Trigger

```html
<button onclick="KnowMe.open()">
  💬 Chat with My AI
</button>
```

---

## 4. Custom Integration {#custom-integration}

For full control, build your own chat interface.

### Backend Proxy (Recommended)

Create a serverless function to proxy requests:

```javascript
// /api/knowme-proxy.js (Next.js API Route)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://coderz.com/api/v1/knowme/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.KNOWME_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: req.body.question,
        sessionId: req.body.sessionId,
      }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch response' });
  }
}
```

### Frontend Chat Component

```javascript
// chat.js
class KnowMeChat {
  constructor(options = {}) {
    this.proxyUrl = options.proxyUrl || '/api/knowme-proxy';
    this.sessionId = localStorage.getItem('knowme_session') || null;
    this.messages = [];
  }

  async sendMessage(question) {
    // Add user message
    this.messages.push({ role: 'user', content: question });
    this.renderMessage('user', question);

    // Show typing indicator
    this.showTyping();

    try {
      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, sessionId: this.sessionId }),
      });

      const result = await response.json();

      if (result.success) {
        // Store session ID for continuity
        this.sessionId = result.data.sessionId;
        localStorage.setItem('knowme_session', this.sessionId);

        // Add assistant message
        this.messages.push({ role: 'assistant', content: result.data.answer });
        this.renderMessage('assistant', result.data.answer, result.data.sources);

        // Handle rate limits
        if (result.rateLimit.remaining < 10) {
          this.showRateLimitWarning(result.rateLimit);
        }
      } else {
        this.renderError(result.error);
      }
    } catch (error) {
      this.renderError('Failed to get response. Please try again.');
    } finally {
      this.hideTyping();
    }
  }

  renderMessage(role, content, sources = []) {
    const container = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.innerHTML = `
      <div class="content">${this.formatMarkdown(content)}</div>
      ${sources.length > 0 ? this.renderSources(sources) : ''}
    `;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
  }

  renderSources(sources) {
    return `
      <div class="sources">
        <span class="label">Sources:</span>
        ${sources.map(s => `<a href="${s.url}" target="_blank">${s.title}</a>`).join(', ')}
      </div>
    `;
  }

  formatMarkdown(text) {
    // Basic markdown formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  showTyping() {
    document.getElementById('typing-indicator').style.display = 'block';
  }

  hideTyping() {
    document.getElementById('typing-indicator').style.display = 'none';
  }

  renderError(message) {
    const container = document.getElementById('chat-messages');
    container.innerHTML += `<div class="message error">${message}</div>`;
  }

  showRateLimitWarning(rateLimit) {
    console.warn(`Rate limit warning: ${rateLimit.remaining} requests remaining`);
  }
}

// Usage
const chat = new KnowMeChat({ proxyUrl: '/api/knowme-proxy' });

document.getElementById('send-btn').addEventListener('click', () => {
  const input = document.getElementById('message-input');
  if (input.value.trim()) {
    chat.sendMessage(input.value);
    input.value = '';
  }
});
```

---

## 5. React Component Example {#react-example}

A complete React chat component:

```tsx
// components/KnowMeChat.tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ type: string; title: string; url?: string }>;
  timestamp: Date;
}

interface KnowMeChatProps {
  proxyUrl: string;
  suggestedQuestions?: string[];
  greeting?: string;
  accentColor?: string;
}

export function KnowMeChat({
  proxyUrl,
  suggestedQuestions = [
    'What are your main skills?',
    'Tell me about your projects',
    'Are you available for work?'
  ],
  greeting = "Hi! I'm an AI assistant. Ask me anything about my experience!",
  accentColor = '#6366f1'
}: KnowMeChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content: greeting,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Restore session from localStorage
    const savedSession = localStorage.getItem('knowme_session');
    if (savedSession) setSessionId(savedSession);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, sessionId })
      });

      const result = await response.json();

      if (result.success) {
        setSessionId(result.data.sessionId);
        localStorage.setItem('knowme_session', result.data.sessionId);

        const assistantMessage: Message = {
          id: result.data.messageId,
          role: 'assistant',
          content: result.data.answer,
          sources: result.data.sources,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `Sorry, I couldn't process that: ${result.error}`,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div 
        className="px-4 py-3 border-b border-slate-200 dark:border-neutral-800"
        style={{ backgroundColor: accentColor }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Assistant</h3>
            <p className="text-white/80 text-sm">Ask me anything!</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-200/30 dark:border-neutral-700">
                    <p className="text-xs opacity-70 mb-1">Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.sources.map((source, idx) => (
                        <span 
                          key={idx}
                          className="text-xs px-2 py-1 rounded-full bg-white/20 dark:bg-white/10"
                        >
                          {source.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-slate-100 dark:bg-neutral-800 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(question)}
                className="text-sm px-3 py-1.5 rounded-full border border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-200 dark:border-neutral-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-full border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            style={{ backgroundColor: accentColor }}
          >
            Send
          </button>
        </form>
        
        <p className="text-center text-xs text-slate-400 mt-3">
          Powered by <a href="https://coderz.com/knowme" target="_blank" className="underline">Coderz KnowMe</a>
        </p>
      </div>
    </div>
  );
}
```

**Usage:**
```tsx
import { KnowMeChat } from '@/components/KnowMeChat';

export default function PortfolioPage() {
  return (
    <div className="container mx-auto py-8">
      <h1>My Portfolio</h1>
      {/* ... other content ... */}
      
      <section className="mt-12">
        <h2>Chat with My AI</h2>
        <KnowMeChat 
          proxyUrl="/api/knowme-proxy"
          greeting="Hey! I'm John's AI assistant. Ask me about his skills, projects, or experience!"
          accentColor="#10b981"
        />
      </section>
    </div>
  );
}
```

---

## 6. Error Handling {#error-handling}

### Recommended Error Handling Pattern

```javascript
async function handleKnowMeRequest(question) {
  try {
    const response = await fetch('/api/knowme-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, sessionId })
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new KnowMeError(errorData.error, errorData.code, response.status);
    }

    const result = await response.json();

    // Handle API-level errors
    if (!result.success) {
      throw new KnowMeError(result.error, result.code);
    }

    return result.data;
  } catch (error) {
    if (error instanceof KnowMeError) {
      switch (error.code) {
        case 'RATE_LIMIT_EXCEEDED':
          showRateLimitMessage(error.retryAfter);
          break;
        case 'INVALID_API_KEY':
          logApiKeyError();
          showGenericError();
          break;
        case 'NO_CONTEXT_FOUND':
          showNoContextMessage();
          break;
        default:
          showGenericError();
      }
    } else {
      // Network or unexpected error
      showNetworkError();
    }
    
    throw error;
  }
}

class KnowMeError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
```

---

## 7. Rate Limits {#rate-limits}

### Default Limits

| Plan | Daily Requests | Per-Session Limit |
|------|---------------|-------------------|
| Free | 100 | 20 |
| Pro | 1,000 | 50 |
| Enterprise | Custom | Custom |

### Handling Rate Limits

```javascript
function handleRateLimit(rateLimitInfo) {
  const { remaining, total, resetAt } = rateLimitInfo;
  
  if (remaining <= 0) {
    const resetTime = new Date(resetAt);
    const waitMinutes = Math.ceil((resetTime - new Date()) / 60000);
    
    showMessage(`Rate limit reached. Please try again in ${waitMinutes} minutes.`);
    disableInput();
    
    // Auto re-enable when limit resets
    setTimeout(() => {
      enableInput();
    }, resetTime - new Date());
  } else if (remaining < 10) {
    showWarning(`${remaining} questions remaining today`);
  }
}
```

---

## 8. Security Best Practices {#security}

### DO ✅

1. **Use a backend proxy** to hide your API key
2. **Validate user input** before sending to API
3. **Implement rate limiting** on your proxy endpoint
4. **Monitor API usage** for unusual patterns
5. **Regenerate keys** if exposed

### DON'T ❌

1. **Never expose API keys** in client-side JavaScript
2. **Never commit API keys** to version control
3. **Don't trust client input** - validate on server

### Example: Secure Proxy with Rate Limiting

```javascript
// /api/knowme-proxy.js
import rateLimit from 'express-rate-limit';

// In-memory rate limiter (use Redis in production)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window per IP
  message: { error: 'Too many requests, please try again later' }
});

export default async function handler(req, res) {
  // Apply rate limiting
  await new Promise((resolve, reject) => {
    limiter(req, res, (result) => {
      if (result instanceof Error) reject(result);
      resolve(result);
    });
  });

  // Validate input
  const { question, sessionId } = req.body;
  
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Question is required' });
  }
  
  if (question.length > 500) {
    return res.status(400).json({ error: 'Question too long (max 500 chars)' });
  }

  // Sanitize input
  const sanitizedQuestion = question
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML
    .substring(0, 500);

  // Forward to KnowMe API
  try {
    const response = await fetch('https://coderz.com/api/v1/knowme/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.KNOWME_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: sanitizedQuestion,
        sessionId: sessionId || undefined
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('KnowMe API error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
```

---

## Need Help?

- 📖 [Full Documentation](https://docs.coderz.com/knowme)
- 💬 [Community Discord](https://discord.gg/coderz)
- 📧 [Support Email](mailto:support@coderz.com)
- 🐛 [Report Issues](https://github.com/coderz/knowme/issues)

---

*Happy building! 🚀*


