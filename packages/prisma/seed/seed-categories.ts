import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CATEGORIES = [
    {
        slug: 'ui-ux', name: 'UI/UX Projects', icon: 'Palette', color: 'from-pink-500 to-rose-500',
        description: 'Design, prototyping, and front-end experience creation.',
        technologies: [
            { slug: 'figma', name: 'Figma', icon: '🎨', color: 'from-pink-400 to-pink-600', description: 'Interface design & prototyping', learningOutcomes: ['Create wireframes and interactive flows', 'Use components and auto-layout', 'Prepare developer handoffs', 'Conduct usability testing'] },
            { slug: 'tailwind', name: 'Tailwind CSS', icon: '💨', color: 'from-sky-400 to-sky-600', description: 'Utility-first CSS framework', learningOutcomes: ['Build responsive layouts', 'Create reusable component classes', 'Optimize bundle sizes', 'Integrate with React/Vue'] },
            { slug: 'framer', name: 'Framer Motion', icon: '✨', color: 'from-violet-400 to-violet-600', description: 'UI animations for React', learningOutcomes: ['Animate component transitions', 'Use spring physics', 'Coordinate animations with variants', 'Optimize for mobile'] },
        ]
    },
    {
        slug: 'web-development', name: 'Web Development', icon: 'Globe', color: 'from-blue-500 to-cyan-500',
        description: 'Frontend and full-stack applications.',
        technologies: [
            { slug: 'react', name: 'React', icon: '⚛️', color: 'from-indigo-400 to-indigo-600', description: 'UI library for building web apps', learningOutcomes: ['Build component-based UIs', 'Manage state with hooks', 'Compose reusable patterns', 'Optimize rendering'] },
            { slug: 'nextjs', name: 'Next.js', icon: '▲', color: 'from-sky-400 to-sky-600', description: 'React full-stack framework', learningOutcomes: ['Understand SSR, SSG, ISR', 'Build API routes', 'Implement middleware', 'Optimize for production'] },
            { slug: 'vue', name: 'Vue.js', icon: '💚', color: 'from-emerald-400 to-emerald-600', description: 'Progressive UI framework', learningOutcomes: ['Create reactive templates', 'Manage state with Vuex', 'Use Vue Router', 'Structure maintainable apps'] },
            { slug: 'angular', name: 'Angular', icon: '🅰️', color: 'from-red-400 to-red-600', description: 'Enterprise web platform', learningOutcomes: ['Build modular apps', 'Use DI and RxJS', 'Implement forms and validation', 'Set up lazy loading'] },
            { slug: 'svelte', name: 'Svelte', icon: '🔥', color: 'from-orange-400 to-orange-600', description: 'Compiler-first UI framework', learningOutcomes: ['Write reactive components', 'Understand compile-time reactivity', 'Integrate with SvelteKit', 'Optimize bundle size'] },
            { slug: 'html-css-js', name: 'HTML/CSS/JS', icon: '🌐', color: 'from-gray-400 to-gray-600', description: 'Core frontend technologies', learningOutcomes: ['Structure semantic HTML', 'Style with Flex/Grid', 'Write vanilla JavaScript', 'Debug and optimize'] },
        ]
    },
    {
        slug: 'app-development', name: 'App Development', icon: 'Smartphone', color: 'from-purple-500 to-indigo-500',
        description: 'Native and cross-platform mobile apps.',
        technologies: [
            { slug: 'react-native', name: 'React Native', icon: '📱', color: 'from-violet-400 to-violet-600', description: 'Cross-platform mobile apps', learningOutcomes: ['Build cross-platform UI', 'Handle navigation and native modules', 'Optimize for mobile', 'Set up CI for iOS/Android'] },
            { slug: 'flutter', name: 'Flutter', icon: '🦋', color: 'from-blue-400 to-blue-600', description: 'Google UI toolkit', learningOutcomes: ['Compose UI using widgets', 'Implement responsive layouts', 'Use build pipelines', 'Handle animations'] },
            { slug: 'swift', name: 'Swift', icon: '🍎', color: 'from-red-400 to-red-600', description: 'Native iOS development', learningOutcomes: ['Develop with SwiftUI', 'Manage app lifecycle', 'Implement notifications', 'Prepare for App Store'] },
            { slug: 'kotlin', name: 'Kotlin', icon: '🤖', color: 'from-green-400 to-green-600', description: 'Native Android development', learningOutcomes: ['Build with Jetpack Compose', 'Use architecture components', 'Integrate networking', 'Optimize for devices'] },
        ]
    },
    {
        slug: 'backend', name: 'Backend Development', icon: 'Server', color: 'from-green-500 to-emerald-500',
        description: 'APIs, microservices, and backend engineering.',
        technologies: [
            { slug: 'nodejs', name: 'Node.js', icon: '🟢', color: 'from-green-400 to-green-600', description: 'JavaScript server runtime', learningOutcomes: ['Build RESTful APIs', 'Understand event-loop', 'Integrate databases', 'Deploy to production'] },
            { slug: 'expressjs', name: 'Express.js', icon: '🚂', color: 'from-yellow-400 to-yellow-600', description: 'Minimal Node.js framework', learningOutcomes: ['Create routes and middleware', 'Structure for maintainability', 'Implement auth', 'Secure Express apps'] },
            { slug: 'fastapi', name: 'FastAPI', icon: '⚡', color: 'from-indigo-400 to-indigo-600', description: 'High-performance Python API', learningOutcomes: ['Design async APIs', 'Implement auth and WebSockets', 'Integrate with ORMs', 'Deploy with Uvicorn'] },
            { slug: 'django', name: 'Django', icon: '🎩', color: 'from-teal-400 to-teal-600', description: 'Python full-stack framework', learningOutcomes: ['Use Django ORM', 'Build REST APIs with DRF', 'Implement permissions', 'Scale with caching'] },
            { slug: 'golang', name: 'Go', icon: '🔵', color: 'from-blue-400 to-blue-600', description: 'High-performance backend', learningOutcomes: ['Build HTTP services', 'Apply concurrency patterns', 'Structure with clean architecture', 'Deploy as cloud-native'] },
        ]
    },
    {
        slug: 'blockchain', name: 'Blockchain', icon: 'Link2', color: 'from-orange-500 to-amber-500',
        description: 'Smart contracts, decentralized apps, and Web3.',
        technologies: [
            { slug: 'solidity', name: 'Solidity', icon: '⛓️', color: 'from-yellow-400 to-yellow-600', description: 'Ethereum smart contracts', learningOutcomes: ['Write smart contracts', 'Understand EVM and gas', 'Use Hardhat/Truffle', 'Deploy contracts'] },
            { slug: 'web3js', name: 'Web3.js', icon: '🌐', color: 'from-sky-400 to-sky-600', description: 'Connect JS with Ethereum', learningOutcomes: ['Interact with contracts', 'Handle providers', 'Read on-chain data', 'Implement wallet auth'] },
        ]
    },
    {
        slug: 'ai-ml', name: 'AI & Machine Learning', icon: 'Brain', color: 'from-violet-500 to-purple-500',
        description: 'Classical ML, deep learning, agents, and LLMs.',
        technologies: [
            { slug: 'classical-ml', name: 'Classical ML', icon: '📊', color: 'from-yellow-400 to-yellow-600', description: 'Traditional ML methods', learningOutcomes: ['Prepare datasets', 'Train and evaluate models', 'Interpret metrics', 'Deploy models'] },
            { slug: 'deep-learning', name: 'Deep Learning', icon: '🧠', color: 'from-red-400 to-red-600', description: 'Neural networks', learningOutcomes: ['Design neural networks', 'Use GPUs and batching', 'Debug training loops', 'Transfer learning'] },
            { slug: 'generative-ai', name: 'Generative AI', icon: '✨', color: 'from-violet-400 to-violet-600', description: 'LLMs and diffusion models', learningOutcomes: ['Understand LLM architectures', 'Build RAG pipelines', 'Use diffusion models', 'Deploy LLM endpoints'] },
            { slug: 'ai-agents', name: 'AI Agents', icon: '🤖', color: 'from-gray-400 to-gray-600', description: 'Autonomous task-driven systems', learningOutcomes: ['Design agent workflows', 'Implement planner/executor', 'Manage safety', 'Evaluate agent behavior'] },
            { slug: 'computer-vision', name: 'Computer Vision', icon: '👁️', color: 'from-orange-400 to-orange-600', description: 'Image-based ML', learningOutcomes: ['Extract features', 'Train classifiers', 'Apply augmentation', 'Deploy CV models'] },
            { slug: 'nlp', name: 'NLP', icon: '📝', color: 'from-emerald-400 to-emerald-600', description: 'Text and language models', learningOutcomes: ['Preprocess text', 'Train sequence models', 'Fine-tune transformers', 'Build text pipelines'] },
        ]
    },
    {
        slug: 'data-science', name: 'Data Science', icon: 'Database', color: 'from-teal-500 to-cyan-500',
        description: 'Analytics, visualization, and insights.',
        technologies: [
            { slug: 'pandas', name: 'Pandas', icon: '🐼', color: 'from-green-400 to-green-600', description: 'Data manipulation', learningOutcomes: ['Load and clean data', 'Use groupby and merge', 'Prepare datasets', 'Optimize memory'] },
            { slug: 'jupyter', name: 'Jupyter', icon: '📓', color: 'from-amber-400 to-amber-600', description: 'Interactive notebooks', learningOutcomes: ['Create reproducible notebooks', 'Use widgets', 'Organize experiments', 'Convert to scripts'] },
        ]
    },
    {
        slug: 'cybersecurity', name: 'Cybersecurity', icon: 'Shield', color: 'from-red-500 to-rose-500',
        description: 'Pen-testing, threat modeling, and security.',
        technologies: [
            { slug: 'kali', name: 'Kali Linux', icon: '🛡️', color: 'from-gray-400 to-gray-600', description: 'Penetration testing', learningOutcomes: ['Use Kali toolset', 'Understand attack vectors', 'Perform exploitation', 'Document findings'] },
        ]
    },
    {
        slug: 'devops', name: 'DevOps', icon: 'Settings', color: 'from-slate-500 to-gray-500',
        description: 'Automation, CI/CD, and infrastructure.',
        technologies: [
            { slug: 'docker', name: 'Docker', icon: '🐳', color: 'from-blue-400 to-blue-600', description: 'Containerization', learningOutcomes: ['Containerize applications', 'Use Docker Compose', 'Understand image layers', 'Integrate with CI/CD'] },
            { slug: 'kubernetes', name: 'Kubernetes', icon: '☸️', color: 'from-green-400 to-green-600', description: 'Container orchestration', learningOutcomes: ['Deploy with Deployments', 'Manage config and secrets', 'Understand pod networking', 'Use Helm'] },
            { slug: 'github-actions', name: 'GitHub Actions', icon: '⚙️', color: 'from-purple-400 to-purple-600', description: 'CI/CD Automation', learningOutcomes: ['Author workflows', 'Use actions and secrets', 'Integrate checks', 'Troubleshoot pipelines'] },
        ]
    },
    {
        slug: 'game-development', name: 'Game Development', icon: 'Gamepad2', color: 'from-yellow-500 to-orange-500',
        description: 'Game engines, game logic, and interactive experiences.',
        technologies: [
            { slug: 'unity', name: 'Unity', icon: '🎮', color: 'from-gray-400 to-gray-600', description: '2D/3D game engine', learningOutcomes: ['Build game scenes', 'Script with C#', 'Handle physics', 'Publish games'] },
            { slug: 'godot', name: 'Godot', icon: '🕹️', color: 'from-blue-400 to-blue-600', description: 'Open-source game engine', learningOutcomes: ['Use GDScript', 'Build 2D/3D games', 'Handle input systems', 'Export to platforms'] },
        ]
    },
]

async function seedCategories() {
    console.log('🌱 Seeding categories and technologies...\n')

    for (let i = 0; i < CATEGORIES.length; i++) {
        const cat = CATEGORIES[i]
        const category = await prisma.projectCategory.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name, description: cat.description, icon: cat.icon, color: cat.color, orderIndex: i },
            create: { slug: cat.slug, name: cat.name, description: cat.description, icon: cat.icon, color: cat.color, orderIndex: i },
        })
        console.log(`  ✅ Category: ${category.name}`)

        for (let j = 0; j < cat.technologies.length; j++) {
            const tech = cat.technologies[j]
            await prisma.projectTechnology.upsert({
                where: { slug: tech.slug },
                update: { name: tech.name, description: tech.description, icon: tech.icon, color: tech.color, learningOutcomes: tech.learningOutcomes, categoryId: category.id, orderIndex: j },
                create: { slug: tech.slug, name: tech.name, description: tech.description, icon: tech.icon, color: tech.color, learningOutcomes: tech.learningOutcomes, categoryId: category.id, orderIndex: j },
            })
            console.log(`     📦 Technology: ${tech.name}`)
        }
    }

    console.log('\n✅ Categories and technologies seeded successfully!')
}

seedCategories()
    .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
    .finally(() => prisma.$disconnect())
