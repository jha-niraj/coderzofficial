import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Helper to create slug
const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// System user ID for platform-seeded projects (we'll use the first admin or create one)
async function getSystemUserId() {
    const admin = await prisma.user.findFirst({ where: { role: 'Admin' }, select: { id: true } })
    if (admin) return admin.id
    const anyUser = await prisma.user.findFirst({ select: { id: true } })
    if (anyUser) return anyUser.id
    throw new Error('No users found in database. Please create at least one user first.')
}

interface ProjectSeed {
    title: string; description: string; shortDescription: string; difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    technologies: string[]; generationType: string; estimatedHours: number; category: string; technology: string
    blueprintOverview: string; vision: string; targetAudience: string; problemSolution: string
    keyOutcomes: string[]; recruiterSignal: string; estimatedDuration: string
    features: { name: string; description: string; priority: string; complexity: string }[]
    stacks: { frontend?: string; backend?: string; database?: string; deployment?: string }
    sprints: { name: string; goal: string; duration: string; tasks: { title: string; description: string[]; criteria: string[]; hints: string[]; difficulty: string; estimatedTime: string; category: string }[] }[]
}

// ======================== WEB DEVELOPMENT PROJECTS ========================
const WEB_PROJECTS: ProjectSeed[] = [
    {
        title: 'Real-Time Collaborative Code Editor', shortDescription: 'Build a VS Code-like collaborative code editor with live cursors and syntax highlighting',
        description: 'Create a real-time collaborative code editor similar to CodeSandbox or Replit. Users can write code together with live cursors, syntax highlighting, file trees, and terminal integration. Uses WebSockets for real-time sync and Monaco Editor for the coding experience.',
        difficulty: 'ADVANCED', technologies: ['React', 'Next.js', 'WebSocket', 'Monaco Editor', 'Node.js'], generationType: 'FULL_STACK',
        estimatedHours: 45, category: 'web-development', technology: 'react',
        blueprintOverview: 'A full-stack collaborative code editor with real-time synchronization using CRDTs, Monaco editor integration, file system management, and WebSocket-based live collaboration features.',
        vision: 'Enable developers to code together in real-time from anywhere in the world.', targetAudience: 'Developers learning real-time systems and collaborative tools',
        problemSolution: 'Traditional code editors are single-user. This project solves the challenge of multi-user real-time editing with conflict resolution.',
        keyOutcomes: ['Working collaborative editor with live cursors', 'Real-time sync with CRDT/OT', 'File tree management', 'Syntax highlighting for 10+ languages', 'User presence indicators'],
        recruiterSignal: 'Demonstrates WebSocket mastery, CRDT algorithms, complex state management, and real-time systems — key skills for companies like Figma, Notion, and Google Docs.',
        estimatedDuration: '4-6 weeks',
        features: [
            { name: 'Monaco Editor Integration', description: 'VS Code-like editing experience', priority: 'must-have', complexity: 'high' },
            { name: 'Real-time Collaboration', description: 'Live cursors and text sync via WebSockets', priority: 'must-have', complexity: 'high' },
            { name: 'File Tree', description: 'Create, rename, delete files and folders', priority: 'must-have', complexity: 'medium' },
            { name: 'User Presence', description: 'Show who is editing and where', priority: 'should-have', complexity: 'medium' },
        ],
        stacks: { frontend: 'React', backend: 'Node.js/Express', database: 'PostgreSQL', deployment: 'Vercel' },
        sprints: [
            {
                name: 'Foundation & Setup', goal: 'Set up project structure, Monaco editor, and basic UI', duration: '1 week', tasks: [
                    { title: 'Initialize Next.js project with TypeScript', description: ['Create a new Next.js 14 project with TypeScript', 'Set up folder structure (components, lib, hooks, types)', 'Install core dependencies: Monaco Editor, Socket.io'], criteria: ['Project runs locally', 'TypeScript configured', 'Dependencies installed'], hints: ['Use create-next-app with TypeScript template', 'Consider App Router for modern patterns'], difficulty: 'BEGINNER', estimatedTime: '1 hour', category: 'Setup' },
                    { title: 'Integrate Monaco Editor', description: ['Install @monaco-editor/react', 'Create an EditorPane component', 'Support syntax highlighting for JavaScript, TypeScript, Python', 'Handle editor value changes'], criteria: ['Editor renders correctly', 'Syntax highlighting works', 'Can type and see output'], hints: ['Use dynamic import for Monaco to avoid SSR issues', 'Check monaco-editor docs for language support'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'Frontend' },
                    { title: 'Build file tree sidebar', description: ['Create a recursive FileTree component', 'Support file creation, renaming, and deletion', 'Highlight the active file', 'Store file contents in state'], criteria: ['File tree renders with nested folders', 'Can create new files', 'Active file is highlighted'], hints: ['Use a recursive tree data structure', 'Consider using a Map for O(1) file lookups'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Frontend' },
                    { title: 'Create the layout with split panes', description: ['Build a resizable split-pane layout', 'Left: file tree, Center: editor, Right: preview/output', 'Add a top toolbar with project name and actions'], criteria: ['Layout is responsive', 'Panes are resizable', 'Toolbar shows project info'], hints: ['Use CSS Grid or a library like react-resizable-panels'], difficulty: 'BEGINNER', estimatedTime: '2 hours', category: 'Frontend' },
                ]
            },
            {
                name: 'Backend & Real-time', goal: 'Set up WebSocket server and real-time text sync', duration: '1.5 weeks', tasks: [
                    { title: 'Set up WebSocket server with Socket.io', description: ['Create a Node.js WebSocket server', 'Handle connection, disconnection events', 'Create rooms for each document/project', 'Broadcast changes to all connected clients'], criteria: ['Server starts and accepts connections', 'Clients can join rooms', 'Messages broadcast to room members'], hints: ['Use Socket.io for easier WebSocket management', 'Consider using namespaces for different features'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'Backend' },
                    { title: 'Implement real-time text synchronization', description: ['Send editor changes as operations to the server', 'Broadcast operations to other clients', 'Apply received operations to local editor', 'Handle cursor position sync'], criteria: ['Two users see each others changes in real-time', 'No data loss during concurrent edits', 'Cursor positions sync across clients'], hints: ['Start with simple last-write-wins, then upgrade to OT/CRDT', 'Consider using Yjs for CRDT implementation'], difficulty: 'ADVANCED', estimatedTime: '8 hours', category: 'Backend' },
                    { title: 'Add user presence and live cursors', description: ['Show connected users avatars', 'Display remote cursors with user colors', 'Show which file each user is viewing', 'Handle user join/leave notifications'], criteria: ['Can see other users cursors', 'Each user has a unique color', 'Presence updates in real-time'], hints: ['Use Monaco decoration API for remote cursors', 'Store presence data in memory on the server'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Frontend' },
                    { title: 'Set up database for projects and files', description: ['Design schema for projects, files, and users', 'Implement CRUD API routes for projects', 'Add file persistence - save to DB on changes', 'Implement auto-save with debouncing'], criteria: ['Projects persist across sessions', 'Files save automatically', 'Can load existing projects'], hints: ['Use Prisma as ORM', 'Debounce saves to avoid excessive DB writes'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Backend' },
                ]
            },
            {
                name: 'Polish & Deploy', goal: 'Add authentication, error handling, and deploy', duration: '1 week', tasks: [
                    { title: 'Add authentication with NextAuth', description: ['Set up NextAuth with GitHub provider', 'Protect editor routes', 'Show user info in toolbar', 'Associate projects with users'], criteria: ['Users can sign in with GitHub', 'Protected routes redirect to login', 'User avatar shows in toolbar'], hints: ['Use NextAuth.js v5 for App Router support'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'Auth' },
                    { title: 'Add error handling and edge cases', description: ['Handle disconnection gracefully', 'Show reconnection status', 'Handle concurrent saves', 'Add loading states throughout'], criteria: ['App handles offline gracefully', 'Reconnection works automatically', 'No data loss on disconnect'], hints: ['Use Socket.io reconnection features', 'Show a banner when connection is lost'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'Polish' },
                    { title: 'Deploy to production', description: ['Deploy frontend to Vercel', 'Deploy WebSocket server to Railway/Render', 'Set up environment variables', 'Test real-time features in production'], criteria: ['App is live and accessible', 'Real-time features work in production', 'Multiple users can collaborate'], hints: ['WebSocket servers need separate hosting from Vercel', 'Use environment variables for server URLs'], difficulty: 'BEGINNER', estimatedTime: '2 hours', category: 'DevOps' },
                ]
            },
        ],
    },
    {
        title: 'AI-Powered Resume Builder with ATS Checker', shortDescription: 'Build a resume builder that uses AI to optimize content and check ATS compatibility',
        description: 'Create a professional resume builder with AI-powered content suggestions, ATS score checking, multiple templates, and PDF export. Users can input their experience and get AI-optimized bullet points tailored to specific job descriptions.',
        difficulty: 'INTERMEDIATE', technologies: ['Next.js', 'OpenAI API', 'Tailwind CSS', 'Puppeteer'], generationType: 'FULL_STACK',
        estimatedHours: 30, category: 'web-development', technology: 'nextjs',
        blueprintOverview: 'A full-stack resume builder with drag-and-drop sections, AI content generation via OpenAI, ATS score analysis, multiple premium templates, and PDF export.',
        vision: 'Help job seekers create ATS-optimized resumes that land interviews.', targetAudience: 'Job seekers and developers learning AI integration',
        problemSolution: 'Most resumes get rejected by ATS systems. This tool helps optimize resumes for both humans and machines.',
        keyOutcomes: ['Multi-template resume builder', 'AI-powered bullet point generator', 'ATS compatibility score', 'PDF export', 'Job description matching'],
        recruiterSignal: 'Shows ability to integrate AI APIs, handle complex form state, generate PDFs, and build practical SaaS products.',
        estimatedDuration: '3-4 weeks',
        features: [
            { name: 'Resume Editor', description: 'Drag-and-drop sections with live preview', priority: 'must-have', complexity: 'high' },
            { name: 'AI Content Generation', description: 'OpenAI-powered bullet point suggestions', priority: 'must-have', complexity: 'medium' },
            { name: 'ATS Score Checker', description: 'Analyze resume against job descriptions', priority: 'must-have', complexity: 'medium' },
            { name: 'PDF Export', description: 'High-quality PDF generation', priority: 'must-have', complexity: 'medium' },
        ],
        stacks: { frontend: 'Next.js', backend: 'Next.js API', database: 'PostgreSQL', deployment: 'Vercel' },
        sprints: [
            {
                name: 'Resume Editor Foundation', goal: 'Build the core resume editor with sections and templates', duration: '1 week', tasks: [
                    { title: 'Set up Next.js project with Tailwind CSS', description: ['Initialize Next.js 14 with App Router', 'Configure Tailwind CSS with custom design tokens', 'Set up project structure'], criteria: ['Project runs', 'Tailwind works', 'Folder structure organized'], hints: ['Use create-next-app'], difficulty: 'BEGINNER', estimatedTime: '1 hour', category: 'Setup' },
                    { title: 'Build resume data model and form', description: ['Define TypeScript interfaces for resume sections', 'Create forms for personal info, experience, education, skills', 'Implement state management for resume data'], criteria: ['All sections have working forms', 'Data persists in state', 'Validation works'], hints: ['Use react-hook-form for form management', 'Consider Zod for validation'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Frontend' },
                    { title: 'Create live preview with templates', description: ['Build a live preview panel showing the resume', 'Create at least 2 resume templates', 'Sync preview with form changes in real-time'], criteria: ['Preview updates as user types', 'Templates render differently', 'Layout is professional'], hints: ['Use CSS print styles for accuracy'], difficulty: 'INTERMEDIATE', estimatedTime: '5 hours', category: 'Frontend' },
                ]
            },
            {
                name: 'AI Integration & ATS', goal: 'Add AI content generation and ATS scoring', duration: '1.5 weeks', tasks: [
                    { title: 'Integrate OpenAI for bullet point generation', description: ['Set up OpenAI API route', 'Create prompt engineering for resume bullets', 'Add "Improve with AI" button for each experience entry', 'Stream AI responses to the UI'], criteria: ['AI generates relevant bullet points', 'Streaming works smoothly', 'Results are contextually accurate'], hints: ['Use streaming for better UX', 'Include job title and company in prompt context'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'AI' },
                    { title: 'Build ATS score checker', description: ['Create a job description input field', 'Parse and compare keywords between resume and JD', 'Calculate and display an ATS compatibility score', 'Suggest missing keywords'], criteria: ['Score calculates correctly', 'Missing keywords are highlighted', 'Suggestions are actionable'], hints: ['Focus on keyword matching and density', 'Consider using TF-IDF for better matching'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'AI' },
                    { title: 'Add PDF export functionality', description: ['Use Puppeteer or html2pdf for PDF generation', 'Ensure PDF matches the live preview exactly', 'Support A4 and Letter sizes', 'Handle multi-page resumes'], criteria: ['PDF looks identical to preview', 'Multi-page works', 'Download works reliably'], hints: ['Consider using @react-pdf/renderer for client-side generation'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'Export' },
                ]
            },
            {
                name: 'Auth, Storage & Deploy', goal: 'Add user accounts, save resumes, and deploy', duration: '1 week', tasks: [
                    { title: 'Add authentication and resume storage', description: ['Set up NextAuth with email/GitHub', 'Create database schema for users and resumes', 'Implement save/load resume functionality', 'Support multiple resumes per user'], criteria: ['Users can sign in', 'Resumes save to database', 'Can load saved resumes'], hints: ['Use Prisma for database operations'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Backend' },
                    { title: 'Polish UI and add final features', description: ['Add section reordering with drag-and-drop', 'Implement undo/redo', 'Add loading states and error handling', 'Make responsive for mobile viewing'], criteria: ['Drag-and-drop works', 'UI is polished', 'Error states handled'], hints: ['Use dnd-kit for drag-and-drop'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Frontend' },
                    { title: 'Deploy and test end-to-end', description: ['Deploy to Vercel', 'Test full user flow', 'Optimize performance', 'Set up monitoring'], criteria: ['App is live', 'All features work in production', 'Performance is good'], hints: ['Test PDF generation in production environment'], difficulty: 'BEGINNER', estimatedTime: '2 hours', category: 'DevOps' },
                ]
            },
        ],
    },
    {
        title: 'E-Commerce Dashboard with Analytics', shortDescription: 'Build a comprehensive admin dashboard for e-commerce with real-time analytics',
        description: 'Create a modern e-commerce admin dashboard with real-time sales analytics, product management, order tracking, customer insights, and inventory management. Features interactive charts, data tables, and notification systems.',
        difficulty: 'INTERMEDIATE', technologies: ['React', 'Next.js', 'Recharts', 'Prisma', 'PostgreSQL'], generationType: 'FULL_STACK',
        estimatedHours: 35, category: 'web-development', technology: 'nextjs',
        blueprintOverview: 'A feature-rich e-commerce dashboard with sales analytics, product CRUD, order management, customer segmentation, and responsive design.',
        vision: 'Provide e-commerce businesses with actionable insights through beautiful data visualization.',
        targetAudience: 'Developers building SaaS dashboards', problemSolution: 'E-commerce owners need a centralized view of their business metrics.',
        keyOutcomes: ['Interactive analytics dashboard', 'Product management CRUD', 'Order tracking system', 'Customer insights', 'Responsive admin panel'],
        recruiterSignal: 'Shows data visualization skills, complex CRUD operations, dashboard design patterns — essential for SaaS companies.',
        estimatedDuration: '3-4 weeks',
        features: [
            { name: 'Sales Analytics', description: 'Interactive charts showing revenue, orders, and trends', priority: 'must-have', complexity: 'high' },
            { name: 'Product Management', description: 'Full CRUD with image upload and variants', priority: 'must-have', complexity: 'medium' },
            { name: 'Order Tracking', description: 'View and manage orders with status updates', priority: 'must-have', complexity: 'medium' },
        ],
        stacks: { frontend: 'Next.js', backend: 'Next.js API', database: 'PostgreSQL', deployment: 'Vercel' },
        sprints: [
            {
                name: 'Dashboard Foundation', goal: 'Build layout, navigation, and analytics overview', duration: '1 week', tasks: [
                    { title: 'Set up project and design system', description: ['Initialize Next.js with TypeScript and Tailwind', 'Create a reusable component library (Button, Card, Table, Badge)', 'Set up dark mode support'], criteria: ['Components render correctly', 'Dark mode toggles', 'Design is consistent'], hints: ['Use shadcn/ui as a starting point'], difficulty: 'BEGINNER', estimatedTime: '2 hours', category: 'Setup' },
                    { title: 'Build sidebar and top navigation', description: ['Create a collapsible sidebar with navigation links', 'Add top bar with search, notifications, and user menu', 'Implement responsive layout for mobile'], criteria: ['Sidebar collapses', 'Navigation works', 'Mobile responsive'], hints: ['Use CSS Grid for the overall layout'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'Frontend' },
                    { title: 'Create analytics overview cards and charts', description: ['Build stat cards (revenue, orders, customers, growth)', 'Add line chart for revenue over time using Recharts', 'Add bar chart for top-selling products', 'Make charts interactive with tooltips'], criteria: ['Stats display mock data', 'Charts render with animations', 'Tooltips show on hover'], hints: ['Use Recharts for React-native chart components'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Frontend' },
                ]
            },
            {
                name: 'Products & Orders', goal: 'Implement product CRUD and order management', duration: '1.5 weeks', tasks: [
                    { title: 'Set up database schema with Prisma', description: ['Define models for Products, Orders, Customers, Categories', 'Create seed data for development', 'Set up Prisma client and migrations'], criteria: ['Schema is defined', 'Seed data populates', 'Prisma client works'], hints: ['Use prisma db push for development'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'Backend' },
                    { title: 'Build product management pages', description: ['Create products list with search, filter, and pagination', 'Build product create/edit form with image upload', 'Add product delete with confirmation', 'Implement category filtering'], criteria: ['CRUD operations work', 'Image upload works', 'Pagination functions correctly'], hints: ['Use server actions for mutations'], difficulty: 'INTERMEDIATE', estimatedTime: '5 hours', category: 'Full Stack' },
                    { title: 'Build order management', description: ['Create orders list with status filters', 'Build order detail view with items and customer info', 'Add status update functionality', 'Implement order search'], criteria: ['Orders list with filters', 'Detail view shows all info', 'Status updates persist'], hints: ['Use optimistic updates for status changes'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Full Stack' },
                ]
            },
            {
                name: 'Polish & Deploy', goal: 'Add auth, real data connections, and deploy', duration: '1 week', tasks: [
                    { title: 'Add authentication and role-based access', description: ['Set up NextAuth', 'Create admin and viewer roles', 'Protect routes based on roles'], criteria: ['Auth works', 'Roles restrict access', 'Protected routes redirect'], hints: ['Use middleware for route protection'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'Auth' },
                    { title: 'Connect analytics to real data', description: ['Replace mock data with database queries', 'Add date range filtering to analytics', 'Optimize queries with aggregation'], criteria: ['Charts show real data', 'Date filters work', 'Queries are performant'], hints: ['Use Prisma aggregations'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Backend' },
                    { title: 'Deploy and optimize', description: ['Deploy to Vercel', 'Set up database on Neon/Supabase', 'Optimize images and bundle size', 'Test all features'], criteria: ['App is live', 'All features work', 'Performance is good'], hints: ['Use next/image for optimization'], difficulty: 'BEGINNER', estimatedTime: '2 hours', category: 'DevOps' },
                ]
            },
        ],
    },
]

// ======================== APP DEVELOPMENT PROJECTS ========================
const APP_PROJECTS: ProjectSeed[] = [
    {
        title: 'Fitness Tracker with Workout Plans', shortDescription: 'Build a cross-platform fitness app with workout tracking, progress charts, and AI-generated plans',
        description: 'Create a comprehensive fitness tracking app using React Native. Features include workout logging, exercise library, progress visualization with charts, AI-generated workout plans, and social sharing. Supports both iOS and Android.',
        difficulty: 'INTERMEDIATE', technologies: ['React Native', 'Expo', 'Firebase', 'Chart Kit'], generationType: 'APP',
        estimatedHours: 35, category: 'app-development', technology: 'react-native',
        blueprintOverview: 'A cross-platform fitness app with exercise database, workout logging, progress tracking with charts, and personalized AI workout plans.',
        vision: 'Make fitness tracking intuitive and motivating for everyone.', targetAudience: 'Mobile app developers and fitness enthusiasts',
        problemSolution: 'Most fitness apps are bloated. This creates a focused, fast experience for tracking workouts.',
        keyOutcomes: ['Cross-platform mobile app', 'Exercise library with animations', 'Progress charts and stats', 'AI workout plan generation', 'Social sharing'],
        recruiterSignal: 'Demonstrates React Native proficiency, complex state management, chart integration, and API consumption on mobile.',
        estimatedDuration: '3-4 weeks',
        features: [
            { name: 'Workout Logger', description: 'Log exercises with sets, reps, and weight', priority: 'must-have', complexity: 'medium' },
            { name: 'Progress Charts', description: 'Visualize strength and body metrics over time', priority: 'must-have', complexity: 'medium' },
            { name: 'Exercise Library', description: 'Browse exercises by muscle group', priority: 'must-have', complexity: 'low' },
        ],
        stacks: { frontend: 'React Native (Expo)', backend: 'Firebase', database: 'Firebase' },
        sprints: [
            {
                name: 'App Foundation', goal: 'Set up Expo project, navigation, and basic screens', duration: '1 week', tasks: [
                    { title: 'Initialize Expo project with TypeScript', description: ['Create new Expo project', 'Set up TypeScript configuration', 'Install core dependencies (navigation, icons, storage)'], criteria: ['App runs on both platforms', 'TypeScript works', 'Dependencies installed'], hints: ['Use npx create-expo-app with TypeScript template'], difficulty: 'BEGINNER', estimatedTime: '1 hour', category: 'Setup' },
                    { title: 'Set up tab navigation and screens', description: ['Create bottom tab navigation (Home, Workouts, Progress, Profile)', 'Build placeholder screens for each tab', 'Add stack navigation within workout tab'], criteria: ['Tabs navigate correctly', 'Stack navigation works', 'Icons display properly'], hints: ['Use @react-navigation/bottom-tabs'], difficulty: 'BEGINNER', estimatedTime: '2 hours', category: 'Navigation' },
                    { title: 'Build exercise library screen', description: ['Create exercise data model', 'Build exercise list grouped by muscle group', 'Add exercise detail view with instructions', 'Implement search and filter'], criteria: ['Exercises grouped by muscle', 'Detail view shows instructions', 'Search works'], hints: ['Start with hardcoded exercise data, then move to Firebase'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Frontend' },
                ]
            },
            {
                name: 'Workout Tracking', goal: 'Build workout logging and history', duration: '1.5 weeks', tasks: [
                    { title: 'Build workout creation flow', description: ['Create "Start Workout" screen', 'Add exercise picker to workout', 'Build set/rep/weight input for each exercise', 'Add rest timer between sets'], criteria: ['Can create a workout', 'Can add exercises with sets/reps', 'Timer works'], hints: ['Use a reducer for complex workout state'], difficulty: 'INTERMEDIATE', estimatedTime: '5 hours', category: 'Frontend' },
                    { title: 'Set up Firebase and data persistence', description: ['Configure Firebase project', 'Set up Firestore collections for users, workouts, exercises', 'Implement save workout functionality', 'Add workout history list'], criteria: ['Workouts save to Firestore', 'History loads correctly', 'Works offline'], hints: ['Use Firebase offline persistence'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Backend' },
                    { title: 'Build progress charts', description: ['Add chart library (react-native-chart-kit)', 'Create weight progress line chart', 'Add workout frequency bar chart', 'Calculate and display personal records'], criteria: ['Charts render with real data', 'PR tracking works', 'Charts are interactive'], hints: ['Use react-native-chart-kit or Victory Native'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Frontend' },
                ]
            },
            {
                name: 'AI Plans & Polish', goal: 'Add AI workout plans, auth, and polish the app', duration: '1 week', tasks: [
                    { title: 'Add authentication', description: ['Set up Firebase Auth with email/password', 'Add Google sign-in', 'Create profile screen', 'Protect routes for authenticated users'], criteria: ['Auth works on both platforms', 'Profile displays user info', 'Routes protected'], hints: ['Use expo-auth-session for OAuth'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'Auth' },
                    { title: 'Build AI workout plan generator', description: ['Create API endpoint that calls OpenAI', 'Generate personalized workout plans based on goals', 'Display generated plan with exercises', 'Allow saving generated plans'], criteria: ['AI generates relevant plans', 'Plans display correctly', 'Can save plans'], hints: ['Pass user fitness level and goals as context to AI'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'AI' },
                    { title: 'Polish and prepare for store', description: ['Add app icons and splash screen', 'Implement push notifications for workout reminders', 'Test on multiple devices', 'Create store screenshots'], criteria: ['App looks professional', 'Notifications work', 'No crashes on test devices'], hints: ['Use expo-notifications for push'], difficulty: 'BEGINNER', estimatedTime: '3 hours', category: 'Polish' },
                ]
            },
        ],
    },
]

// ======================== AI/ML PROJECTS ========================
const AI_PROJECTS: ProjectSeed[] = [
    {
        title: 'RAG-Powered Customer Support Bot', shortDescription: 'Build an AI chatbot that answers questions from your documentation using RAG',
        description: 'Create a Retrieval-Augmented Generation (RAG) chatbot that ingests a knowledge base (documentation, FAQs, guides) and answers user questions accurately. Uses vector embeddings for semantic search and LLMs for response generation.',
        difficulty: 'ADVANCED', technologies: ['Python', 'FastAPI', 'OpenAI', 'Pinecone', 'React'], generationType: 'AI/ML',
        estimatedHours: 40, category: 'ai-ml', technology: 'generative-ai',
        blueprintOverview: 'A RAG pipeline with document ingestion, vector storage, semantic search, and LLM-powered response generation with citation support.',
        vision: 'Democratize customer support with AI that actually knows your product.',
        targetAudience: 'Developers learning RAG and LLM integration', problemSolution: 'Traditional chatbots use rigid decision trees. RAG enables dynamic, knowledge-grounded responses.',
        keyOutcomes: ['Working RAG pipeline', 'Document ingestion system', 'Vector search with embeddings', 'Chat interface with streaming', 'Source citation in responses'],
        recruiterSignal: 'Demonstrates RAG architecture, vector databases, prompt engineering, and production AI systems — highly sought after by AI-first companies.',
        estimatedDuration: '4-5 weeks',
        features: [
            { name: 'Document Ingestion', description: 'Upload and process PDFs, markdown, and text files', priority: 'must-have', complexity: 'high' },
            { name: 'Vector Search', description: 'Semantic search using embeddings', priority: 'must-have', complexity: 'high' },
            { name: 'Chat Interface', description: 'Streaming chat with AI responses', priority: 'must-have', complexity: 'medium' },
            { name: 'Source Citations', description: 'Show which documents were used for answers', priority: 'should-have', complexity: 'medium' },
        ],
        stacks: { frontend: 'React', backend: 'Python/FastAPI', database: 'PostgreSQL' },
        sprints: [
            {
                name: 'RAG Pipeline Foundation', goal: 'Set up document ingestion and vector storage', duration: '1.5 weeks', tasks: [
                    { title: 'Set up FastAPI project structure', description: ['Initialize Python project with FastAPI', 'Configure virtual environment and dependencies', 'Set up project structure (routes, services, models)', 'Add OpenAI and Pinecone client setup'], criteria: ['FastAPI server runs', 'API docs accessible at /docs', 'Dependencies installed'], hints: ['Use Poetry for dependency management'], difficulty: 'BEGINNER', estimatedTime: '1 hour', category: 'Setup' },
                    { title: 'Build document processing pipeline', description: ['Create file upload endpoint (PDF, MD, TXT)', 'Implement text extraction from PDFs using PyPDF2', 'Chunk documents into overlapping segments', 'Clean and preprocess text chunks'], criteria: ['Can upload files', 'Text extracted correctly', 'Chunks are properly sized'], hints: ['Use 500-token chunks with 50-token overlap', 'Consider using LangChain text splitters'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Backend' },
                    { title: 'Set up vector storage with embeddings', description: ['Generate embeddings using OpenAI text-embedding-ada-002', 'Store embeddings in Pinecone vector database', 'Implement semantic search endpoint', 'Return top-k relevant chunks for a query'], criteria: ['Embeddings generate correctly', 'Vector search returns relevant results', 'Search is fast (< 500ms)'], hints: ['Use batch embedding for efficiency', 'Consider cosine similarity for search'], difficulty: 'ADVANCED', estimatedTime: '5 hours', category: 'AI' },
                ]
            },
            {
                name: 'Chat & Response Generation', goal: 'Build the chat system with LLM response generation', duration: '1.5 weeks', tasks: [
                    { title: 'Implement RAG response generation', description: ['Create the retrieval + generation pipeline', 'Build a prompt template with context injection', 'Generate responses using GPT-4', 'Add source citation to responses'], criteria: ['Responses are grounded in documents', 'Citations reference correct sources', 'Quality is high'], hints: ['Use system prompt to instruct citation format', 'Include top 3-5 relevant chunks as context'], difficulty: 'ADVANCED', estimatedTime: '5 hours', category: 'AI' },
                    { title: 'Add streaming response support', description: ['Implement SSE (Server-Sent Events) for streaming', 'Stream LLM tokens as they are generated', 'Handle stream completion and errors'], criteria: ['Tokens stream to client in real-time', 'No buffering delays', 'Errors handled gracefully'], hints: ['Use OpenAI streaming API', 'Use FastAPI StreamingResponse'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'Backend' },
                    { title: 'Build React chat interface', description: ['Create a chat UI with message bubbles', 'Implement streaming text display', 'Add source citation display', 'Support conversation history'], criteria: ['Chat feels like ChatGPT', 'Streaming text renders smoothly', 'Citations are clickable'], hints: ['Use react-markdown for rendering', 'Handle partial markdown during streaming'], difficulty: 'INTERMEDIATE', estimatedTime: '5 hours', category: 'Frontend' },
                ]
            },
            {
                name: 'Polish & Production', goal: 'Add knowledge base management UI and deploy', duration: '1 week', tasks: [
                    { title: 'Build knowledge base management UI', description: ['Create document list with upload/delete', 'Show processing status for each document', 'Add search/filter for documents', 'Display chunk count and last updated'], criteria: ['Can manage documents', 'Processing status shows', 'CRUD operations work'], hints: ['Use a file upload component with drag-and-drop'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Frontend' },
                    { title: 'Add conversation history and feedback', description: ['Store conversations in database', 'Add thumbs up/down for response quality', 'Show conversation history sidebar', 'Implement conversation search'], criteria: ['Conversations persist', 'Feedback saves', 'History is browsable'], hints: ['Use a simple rating system'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'Full Stack' },
                    { title: 'Deploy and optimize', description: ['Containerize with Docker', 'Deploy backend to Railway', 'Deploy frontend to Vercel', 'Optimize token usage and costs'], criteria: ['App is live', 'RAG pipeline works in production', 'Costs are reasonable'], hints: ['Monitor token usage closely', 'Consider caching frequent queries'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'DevOps' },
                ]
            },
        ],
    },
]

// ======================== AI AGENT PROJECTS ========================
const AI_AGENT_PROJECTS: ProjectSeed[] = [
    {
        title: 'AI Email Triage Agent', shortDescription: 'Build an autonomous AI agent that reads, classifies, and drafts replies to emails',
        description: 'Create an AI agent that connects to an email inbox, classifies incoming emails by priority and category, summarizes them, and drafts context-aware replies. Uses tool-calling LLMs with a ReAct loop to autonomously decide when to search knowledge bases, schedule meetings, or escalate.',
        difficulty: 'ADVANCED', technologies: ['Python', 'LangChain', 'OpenAI', 'FastAPI', 'Redis'], generationType: 'AI_AGENT',
        estimatedHours: 40, category: 'ai-ml', technology: 'langchain',
        blueprintOverview: 'An autonomous email agent with IMAP integration, LLM-powered classification, tool usage (calendar, KB search), and draft reply generation.',
        vision: 'Free professionals from email overload with an AI agent that handles routine correspondence.', targetAudience: 'Developers learning AI agent architectures and tool-calling patterns',
        problemSolution: 'Email overload wastes hours daily. An AI agent can classify, prioritize, and draft replies — letting humans focus on important decisions.',
        keyOutcomes: ['Working autonomous email agent', 'ReAct reasoning loop', 'Tool-calling with 3+ tools', 'Email classification pipeline', 'Draft reply generation with tone control'],
        recruiterSignal: 'Demonstrates AI agent design, tool-calling patterns, LangChain proficiency, and production-grade autonomous systems — in demand at every AI company.',
        estimatedDuration: '4-5 weeks',
        features: [
            { name: 'Email Ingestion', description: 'Connect to IMAP inbox and fetch emails', priority: 'must-have', complexity: 'medium' },
            { name: 'Classification Agent', description: 'LLM classifies emails by priority/category', priority: 'must-have', complexity: 'high' },
            { name: 'Tool Calling', description: 'Agent uses tools: KB search, calendar, CRM lookup', priority: 'must-have', complexity: 'high' },
            { name: 'Draft Replies', description: 'Generate context-aware reply drafts', priority: 'must-have', complexity: 'medium' },
        ],
        stacks: { backend: 'Python/FastAPI', database: 'PostgreSQL', deployment: 'Docker' },
        sprints: [
            {
                name: 'Agent Foundation', goal: 'Set up email ingestion and basic LLM classification', duration: '1.5 weeks', tasks: [
                    { title: 'Set up Python project with FastAPI', description: ['Initialize Python project with Poetry', 'Install LangChain, OpenAI, imaplib dependencies', 'Create project structure: agents/, tools/, services/'], criteria: ['Server runs at localhost:8000', 'Dependencies installed', 'Project structure organized'], hints: ['Use Poetry for dependency management'], difficulty: 'BEGINNER', estimatedTime: '1 hour', category: 'Setup' },
                    { title: 'Build email fetching service', description: ['Connect to IMAP server using imaplib', 'Fetch unread emails with subject, body, sender', 'Parse email headers and attachments', 'Store raw emails in database'], criteria: ['Fetches emails from test inbox', 'Parses HTML and plain text', 'Stores in DB correctly'], hints: ['Use Gmail App Passwords for testing', 'Handle multipart MIME messages'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Backend' },
                    { title: 'Build email classification agent', description: ['Create LangChain agent with classification prompt', 'Classify emails into: urgent, action-required, informational, spam', 'Extract key entities (names, dates, amounts)', 'Output structured classification result'], criteria: ['Classification accuracy > 80%', 'Structured output with categories', 'Handles diverse email types'], hints: ['Use few-shot examples in prompt', 'Consider using structured output with Pydantic'], difficulty: 'ADVANCED', estimatedTime: '5 hours', category: 'AI' },
                ]
            },
            {
                name: 'Tools & Reasoning', goal: 'Add tool-calling capabilities and ReAct loop', duration: '1.5 weeks', tasks: [
                    { title: 'Implement ReAct reasoning loop', description: ['Build the Thought-Action-Observation loop', 'Agent decides which tool to call based on email content', 'Handle multi-step reasoning chains', 'Add logging for agent decisions'], criteria: ['Agent reasons through steps', 'Selects appropriate tools', 'Logs decision chain'], hints: ['Use LangChain AgentExecutor', 'Start with a simple 2-tool setup'], difficulty: 'ADVANCED', estimatedTime: '6 hours', category: 'AI' },
                    { title: 'Build agent tools', description: ['Knowledge Base search tool (vector similarity)', 'Calendar availability checker tool', 'Contact/CRM lookup tool', 'Each tool has clear input/output schema'], criteria: ['3 tools work independently', 'Agent calls them correctly', 'Results integrate into reasoning'], hints: ['Define clear tool descriptions for the LLM', 'Use Pydantic for tool schemas'], difficulty: 'INTERMEDIATE', estimatedTime: '5 hours', category: 'AI' },
                    { title: 'Build draft reply generator', description: ['Generate reply drafts based on classification + tool results', 'Support multiple tones (formal, casual, empathetic)', 'Include relevant context from KB search', 'Allow human review before sending'], criteria: ['Drafts are contextually accurate', 'Tone selection works', 'Human-in-the-loop works'], hints: ['Use separate prompt for reply generation', 'Include original email as context'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'AI' },
                ]
            },
            {
                name: 'Dashboard & Deploy', goal: 'Build monitoring dashboard and deploy', duration: '1 week', tasks: [
                    { title: 'Build agent monitoring dashboard', description: ['Create React dashboard showing processed emails', 'Display classification results and agent decisions', 'Show draft replies for human review', 'Add approve/reject controls'], criteria: ['Dashboard shows email pipeline', 'Can review and approve drafts', 'Agent stats visible'], hints: ['Use a simple React + Vite setup'], difficulty: 'INTERMEDIATE', estimatedTime: '5 hours', category: 'Frontend' },
                    { title: 'Add background scheduling and queue', description: ['Set up periodic email polling with Redis queue', 'Process emails asynchronously', 'Handle rate limits and retries', 'Add email processing status tracking'], criteria: ['Emails process on schedule', 'Queue handles failures', 'Status updates in real-time'], hints: ['Use Celery or RQ for task queue', 'Poll every 5 minutes'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Backend' },
                    { title: 'Deploy with Docker', description: ['Create Dockerfile for the agent service', 'Set up docker-compose with Redis and PostgreSQL', 'Deploy to Railway or Render', 'Configure environment variables'], criteria: ['Docker build works', 'All services run together', 'Deployed and accessible'], hints: ['Use multi-stage Docker builds'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'DevOps' },
                ]
            },
        ],
    },
    {
        title: 'AI Code Review Agent', shortDescription: 'Build an AI agent that reviews pull requests, finds bugs, and suggests improvements',
        description: 'Create an autonomous code review agent that connects to GitHub, analyzes pull requests, identifies bugs and security issues, suggests improvements, and posts review comments. Uses multi-step reasoning to understand code context across files.',
        difficulty: 'ADVANCED', technologies: ['TypeScript', 'Node.js', 'OpenAI', 'GitHub API', 'LangChain'], generationType: 'AI_AGENT',
        estimatedHours: 35, category: 'ai-ml', technology: 'langchain',
        blueprintOverview: 'A GitHub-integrated AI agent that analyzes PR diffs, reasons about code quality, security, and best practices, then posts actionable review comments.',
        vision: 'Automate tedious code reviews so developers can focus on architecture and design decisions.', targetAudience: 'Developers building developer tools and AI agents',
        problemSolution: 'Code reviews are time-consuming bottlenecks. An AI agent can catch common issues instantly, reducing review cycles.',
        keyOutcomes: ['GitHub PR integration', 'Multi-file code analysis', 'Bug and security detection', 'Automated review comments', 'Configurable review rules'],
        recruiterSignal: 'Demonstrates GitHub API mastery, AI agent architecture, code analysis skills, and developer tooling expertise.',
        estimatedDuration: '3-4 weeks',
        features: [
            { name: 'GitHub Integration', description: 'Listen for PR events via webhooks', priority: 'must-have', complexity: 'medium' },
            { name: 'Code Analysis', description: 'Parse and analyze PR diffs with AI', priority: 'must-have', complexity: 'high' },
            { name: 'Review Comments', description: 'Post inline review comments on PRs', priority: 'must-have', complexity: 'medium' },
        ],
        stacks: { backend: 'Node.js/Express', database: 'PostgreSQL', deployment: 'Railway' },
        sprints: [
            {
                name: 'GitHub Integration', goal: 'Connect to GitHub and parse PR diffs', duration: '1 week', tasks: [
                    { title: 'Set up Node.js project with GitHub App', description: ['Initialize TypeScript Node.js project', 'Create a GitHub App with PR permissions', 'Set up webhook endpoint for PR events', 'Handle installation and PR opened events'], criteria: ['Webhook receives PR events', 'GitHub App installed on test repo', 'Events logged correctly'], hints: ['Use Probot framework for easier GitHub App setup', 'Use smee.io for local webhook testing'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'Setup' },
                    { title: 'Parse and structure PR diffs', description: ['Fetch PR diff using GitHub API', 'Parse unified diff format into structured data', 'Group changes by file with context lines', 'Identify added, removed, and modified lines'], criteria: ['Diffs parse correctly', 'File grouping works', 'Context lines included'], hints: ['Use parse-diff library', 'Include surrounding context lines for better AI analysis'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'Backend' },
                    { title: 'Fetch repository context', description: ['Get file tree of the repository', 'Fetch full content of modified files', 'Identify related files (imports, tests)', 'Build context window for AI analysis'], criteria: ['Full file content available', 'Related files identified', 'Context is comprehensive'], hints: ['Use GitHub Contents API', 'Limit context to relevant files to save tokens'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'Backend' },
                ]
            },
            {
                name: 'AI Review Engine', goal: 'Build AI analysis pipeline and post reviews', duration: '1.5 weeks', tasks: [
                    { title: 'Build code analysis agent', description: ['Create LLM prompt for code review with structured output', 'Analyze for: bugs, security issues, performance, style', 'Generate severity ratings for each finding', 'Include fix suggestions with code snippets'], criteria: ['Finds real issues in test PRs', 'Severity ratings are accurate', 'Suggestions are actionable'], hints: ['Use GPT-4 for best code understanding', 'Include language-specific best practices in prompt'], difficulty: 'ADVANCED', estimatedTime: '6 hours', category: 'AI' },
                    { title: 'Post review comments on GitHub', description: ['Map AI findings to specific lines in the diff', 'Post inline review comments using GitHub API', 'Create a review summary comment', 'Handle rate limits and pagination'], criteria: ['Comments appear on correct lines', 'Summary is clear and useful', 'Rate limits handled'], hints: ['Use the Pull Request Review API for batch comments', 'Group findings by severity'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Backend' },
                    { title: 'Add configuration and rules', description: ['Create .codereview.yml config file support', 'Allow disabling specific check categories', 'Support custom review rules and patterns', 'Respect file ignore patterns'], criteria: ['Config file is read', 'Rules can be toggled', 'Ignore patterns work'], hints: ['Look for config in repo root on each PR'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'Backend' },
                ]
            },
            {
                name: 'Dashboard & Polish', goal: 'Add web dashboard and deploy', duration: '1 week', tasks: [
                    { title: 'Build review history dashboard', description: ['Create web UI showing all reviewed PRs', 'Display findings with severity and status', 'Show review metrics (issues found, false positive rate)', 'Add ability to mark false positives'], criteria: ['Dashboard shows review history', 'Metrics are accurate', 'False positive marking works'], hints: ['Use a simple React dashboard'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Frontend' },
                    { title: 'Optimize and deploy', description: ['Add caching for repeated file fetches', 'Optimize token usage with smart chunking', 'Deploy to Railway with GitHub App', 'Set up logging and monitoring'], criteria: ['App deployed and receiving webhooks', 'Reviews post automatically', 'Costs are manageable'], hints: ['Cache file contents for the duration of a PR review'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'DevOps' },
                ]
            },
        ],
    },
]

// ======================== BACKEND / CLI PROJECTS ========================
const BACKEND_PROJECTS: ProjectSeed[] = [
    {
        title: 'Rate Limiter API Gateway', shortDescription: 'Build a production-grade API gateway with rate limiting, auth, and request logging',
        description: 'Create a high-performance API gateway in Go or Node.js with sliding window rate limiting, JWT authentication, request/response logging, circuit breaker pattern, and real-time analytics dashboard.',
        difficulty: 'ADVANCED', technologies: ['Node.js', 'Redis', 'TypeScript', 'Docker'], generationType: 'PROGRAMS',
        estimatedHours: 30, category: 'backend', technology: 'nodejs',
        blueprintOverview: 'An API gateway with configurable rate limiting algorithms, JWT auth middleware, circuit breaker for upstream services, and monitoring dashboard.',
        vision: 'Understand production infrastructure by building a core piece of it from scratch.', targetAudience: 'Backend developers learning system design',
        problemSolution: 'APIs need protection from abuse. This project builds the exact infrastructure that protects production systems.',
        keyOutcomes: ['Sliding window rate limiter', 'JWT auth middleware', 'Circuit breaker pattern', 'Request logging and analytics', 'Redis-backed distributed state'],
        recruiterSignal: 'Shows deep backend knowledge: rate limiting algorithms, distributed systems patterns, and production infrastructure — prized at companies like Stripe, Cloudflare, and Kong.',
        estimatedDuration: '3 weeks',
        features: [
            { name: 'Rate Limiting', description: 'Sliding window counter with Redis', priority: 'must-have', complexity: 'high' },
            { name: 'JWT Auth', description: 'Token validation and refresh', priority: 'must-have', complexity: 'medium' },
            { name: 'Circuit Breaker', description: 'Protect against cascading failures', priority: 'should-have', complexity: 'high' },
        ],
        stacks: { backend: 'Node.js/Express', database: 'PostgreSQL', deployment: 'Docker' },
        sprints: [
            {
                name: 'Gateway Core', goal: 'Build proxy, rate limiter, and auth', duration: '1.5 weeks', tasks: [
                    { title: 'Set up reverse proxy with Express', description: ['Create Express server that proxies requests to upstream services', 'Implement configurable routing table', 'Add request/response logging middleware', 'Handle errors and timeouts gracefully'], criteria: ['Proxy forwards requests correctly', 'Routing table is configurable', 'Logging captures all requests'], hints: ['Use http-proxy-middleware', 'Consider YAML config for routes'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'Backend' },
                    { title: 'Implement sliding window rate limiter', description: ['Set up Redis connection', 'Implement sliding window counter algorithm', 'Support per-IP and per-API-key limits', 'Return proper 429 responses with retry-after header'], criteria: ['Rate limits enforce correctly', 'Window slides properly', 'Headers include rate limit info'], hints: ['Use Redis sorted sets for sliding window', 'Include X-RateLimit headers'], difficulty: 'ADVANCED', estimatedTime: '5 hours', category: 'Backend' },
                    { title: 'Add JWT authentication middleware', description: ['Create JWT token generation endpoint', 'Build validation middleware', 'Support token refresh flow', 'Handle expired and invalid tokens'], criteria: ['JWT creates and validates', 'Refresh flow works', 'Invalid tokens return 401'], hints: ['Use jsonwebtoken library', 'Store refresh tokens in Redis'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'Auth' },
                ]
            },
            {
                name: 'Resilience & Monitoring', goal: 'Add circuit breaker, analytics, and deploy', duration: '1.5 weeks', tasks: [
                    { title: 'Implement circuit breaker pattern', description: ['Build circuit breaker state machine (closed, open, half-open)', 'Track failure rates per upstream service', 'Auto-trip on failure threshold', 'Implement half-open recovery with gradual traffic increase'], criteria: ['Circuit trips on failures', 'Half-open allows test requests', 'Recovery works automatically'], hints: ['Use 3 states: closed (normal), open (failing), half-open (testing)'], difficulty: 'ADVANCED', estimatedTime: '5 hours', category: 'Backend' },
                    { title: 'Build analytics dashboard', description: ['Create API to query request logs', 'Build React dashboard with charts', 'Show: requests/sec, error rates, latency P50/P95/P99', 'Display rate limit hits and circuit breaker status'], criteria: ['Dashboard shows real-time stats', 'Charts update automatically', 'All metrics displayed'], hints: ['Use Recharts for visualization', 'Poll API every 5 seconds'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Frontend' },
                    { title: 'Containerize and deploy', description: ['Create Dockerfile for gateway', 'Set up docker-compose with Redis', 'Add health check endpoints', 'Deploy to Railway or Fly.io'], criteria: ['Docker build works', 'Services communicate correctly', 'Health checks pass'], hints: ['Use Docker networks for service communication'], difficulty: 'INTERMEDIATE', estimatedTime: '3 hours', category: 'DevOps' },
                ]
            },
        ],
    },
]

// ======================== WEB EXTRA PROJECTS ========================
const WEB_EXTRA_PROJECTS: ProjectSeed[] = [
    {
        title: 'Real-Time Kanban Board with AI Task Decomposition', shortDescription: 'Build a Trello-like kanban board with AI that breaks down tasks into subtasks',
        description: 'Create a collaborative kanban board with drag-and-drop cards, real-time updates via WebSockets, and an AI feature that decomposes large tasks into actionable subtasks. Supports multiple boards, labels, due dates, and team collaboration.',
        difficulty: 'INTERMEDIATE', technologies: ['React', 'Next.js', 'Prisma', 'Socket.io', 'OpenAI'], generationType: 'FULL_STACK',
        estimatedHours: 30, category: 'web-development', technology: 'nextjs',
        blueprintOverview: 'A full-stack kanban app with drag-and-drop, real-time collaboration, and AI-powered task decomposition.',
        vision: 'Make project management smarter with AI that helps break down complex tasks.', targetAudience: 'Full-stack developers learning real-time apps and AI integration',
        problemSolution: 'Large tasks are overwhelming. AI decomposition makes them actionable and manageable.',
        keyOutcomes: ['Drag-and-drop kanban board', 'Real-time collaboration', 'AI task decomposition', 'Board sharing and permissions', 'Labels and due dates'],
        recruiterSignal: 'Shows drag-and-drop mastery, real-time systems, AI integration, and SaaS product skills — valued at productivity tool companies.',
        estimatedDuration: '3 weeks',
        features: [
            { name: 'Kanban Board', description: 'Drag-and-drop columns and cards', priority: 'must-have', complexity: 'high' },
            { name: 'Real-time Sync', description: 'Live updates across clients', priority: 'must-have', complexity: 'medium' },
            { name: 'AI Decomposition', description: 'Break tasks into subtasks with AI', priority: 'must-have', complexity: 'medium' },
        ],
        stacks: { frontend: 'Next.js', backend: 'Next.js API', database: 'PostgreSQL', deployment: 'Vercel' },
        sprints: [
            {
                name: 'Kanban Foundation', goal: 'Build board layout with drag-and-drop', duration: '1 week', tasks: [
                    { title: 'Set up project with Next.js and Prisma', description: ['Initialize Next.js 14 with TypeScript', 'Configure Prisma with Board, Column, Card models', 'Set up seed data for development', 'Install dnd-kit for drag-and-drop'], criteria: ['Project runs', 'Database schema ready', 'Seed data populates'], hints: ['Use @dnd-kit/core and @dnd-kit/sortable'], difficulty: 'BEGINNER', estimatedTime: '2 hours', category: 'Setup' },
                    { title: 'Build kanban board with drag-and-drop', description: ['Create Board, Column, and Card components', 'Implement drag-and-drop between columns', 'Support card reordering within columns', 'Persist order changes to database'], criteria: ['Cards drag between columns', 'Order persists on refresh', 'Animations are smooth'], hints: ['Use dnd-kit sensors for mouse and touch', 'Debounce order updates'], difficulty: 'INTERMEDIATE', estimatedTime: '5 hours', category: 'Frontend' },
                    { title: 'Add card details modal', description: ['Create modal for card editing', 'Support title, description, labels, due date', 'Add checklist/subtasks support', 'Implement card delete and archive'], criteria: ['Modal opens and closes', 'All fields save correctly', 'Subtasks toggle on/off'], hints: ['Use a Sheet/Drawer component for the detail view'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Frontend' },
                ]
            },
            {
                name: 'Real-time & AI', goal: 'Add live collaboration and AI task decomposition', duration: '1.5 weeks', tasks: [
                    { title: 'Add real-time updates with Socket.io', description: ['Set up Socket.io server', 'Broadcast card moves, edits, and creations', 'Show live cursor/presence of collaborators', 'Handle concurrent edit conflicts'], criteria: ['Two users see updates in real-time', 'No data loss on concurrent edits', 'Presence indicators work'], hints: ['Use rooms per board'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Backend' },
                    { title: 'Build AI task decomposition feature', description: ['Create "Decompose with AI" button on cards', 'Send task title + description to OpenAI', 'Parse response into subtask list', 'Auto-create subtask cards in the same column'], criteria: ['AI generates relevant subtasks', 'Subtasks create as cards', 'Works for various task types'], hints: ['Include board context in prompt for better results'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'AI' },
                    { title: 'Add auth, boards, and sharing', description: ['Set up NextAuth with GitHub', 'Support multiple boards per user', 'Add board sharing with email invites', 'Implement viewer/editor permissions'], criteria: ['Auth works', 'Multiple boards supported', 'Sharing works correctly'], hints: ['Use a join table for board membership'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Full Stack' },
                ]
            },
            {
                name: 'Polish & Deploy', goal: 'Add filters, search, and deploy', duration: '1 week', tasks: [
                    { title: 'Add filtering, search, and views', description: ['Filter cards by label, assignee, and due date', 'Add search across all cards', 'Create list view as alternative to board view', 'Add keyboard shortcuts for power users'], criteria: ['Filters work correctly', 'Search is fast', 'List view renders properly'], hints: ['Use URL params for filter state'], difficulty: 'INTERMEDIATE', estimatedTime: '4 hours', category: 'Frontend' },
                    { title: 'Deploy and optimize', description: ['Deploy to Vercel', 'Set up database on Neon', 'Deploy Socket.io server separately', 'Test end-to-end in production'], criteria: ['App is live', 'Real-time works in production', 'All features functional'], hints: ['Use a separate server for WebSockets'], difficulty: 'BEGINNER', estimatedTime: '2 hours', category: 'DevOps' },
                ]
            },
        ],
    },
]

const ALL_PROJECTS = [...WEB_PROJECTS, ...APP_PROJECTS, ...AI_PROJECTS, ...AI_AGENT_PROJECTS, ...BACKEND_PROJECTS, ...WEB_EXTRA_PROJECTS]

async function seedProjects() {
    const creatorId = await getSystemUserId()
    console.log(`\n🌱 Seeding ${ALL_PROJECTS.length} platform projects...\n`)

    for (const p of ALL_PROJECTS) {
        const slug = slugify(p.title)
        const existing = await prisma.projectV2.findUnique({ where: { slug } })
        if (existing) { console.log(`  ⏭️  Skipping (exists): ${p.title}`); continue }

        const project = await prisma.projectV2.create({
            data: {
                slug, title: p.title, shortDescription: p.shortDescription, description: p.description,
                difficulty: p.difficulty, technologies: p.technologies, generationType: p.generationType,
                estimatedHours: p.estimatedHours, visibility: 'PUBLIC',
                isPlatformSeeded: true, projectSource: 'PLATFORM_SEEDED', guidedModeEnabled: true,
                blueprintOverview: p.blueprintOverview, vision: p.vision, targetAudience: p.targetAudience,
                problemSolution: p.problemSolution, keyOutcomes: p.keyOutcomes, recruiterSignal: p.recruiterSignal,
                estimatedDuration: p.estimatedDuration, features: p.features,
                stacks: p.stacks, assistantEcho: {}, assistantRaw: {},
                createdBy: creatorId, includeAssessment: true,
            },
        })

        // Create sprints and tasks
        for (let si = 0; si < p.sprints.length; si++) {
            const s = p.sprints[si]
            const sprint = await prisma.projectV2Sprint.create({
                data: {
                    projectId: project.id, sprintNumber: si + 1, name: s.name, goal: s.goal,
                    duration: s.duration, orderIndex: si, createdBy: creatorId, isApproved: true,
                },
            })
            for (let ti = 0; ti < s.tasks.length; ti++) {
                const t = s.tasks[ti]
                await prisma.projectV2Task.create({
                    data: {
                        sprintId: sprint.id, projectV2Id: project.id, title: t.title,
                        description: t.description, criteria: t.criteria, hints: t.hints,
                        difficulty: t.difficulty as any, orderIndex: ti,
                        estimatedTime: t.estimatedTime, category: t.category,
                    },
                })
            }
        }

        console.log(`  ✅ Created: ${p.title} (${p.sprints.length} sprints, ${p.sprints.reduce((a, s) => a + s.tasks.length, 0)} tasks)`)
    }

    console.log('\n✅ All projects seeded successfully!')
}

seedProjects()
    .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
    .finally(() => prisma.$disconnect())
