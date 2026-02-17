import {
    Palette, Globe, Smartphone, Server, Link2, Brain, Database, Shield, Settings,
    Gamepad2, Cloud, MoreHorizontal, LucideIcon
} from 'lucide-react'

export interface Category {
    id: string
    name: string
    description: string
    icon: LucideIcon
    color: string
    technologies: Technology[]
}

export interface Technology {
    id: string
    name: string
    description: string
    icon: string
    projectCount?: number
    color: string
    learningOutcomes: string[]
}

export const categories: Category[] = [
    // ---------------- UI/UX ----------------
    {
        id: 'ui-ux',
        name: 'UI/UX Projects',
        description: 'Design, prototyping, and front-end experience creation.',
        icon: Palette,
        color: 'from-pink-500 to-rose-500',
        technologies: [
            {
                id: 'figma',
                name: 'Figma',
                description: 'Interface design & prototyping',
                icon: '🎨',
                color: 'from-pink-400 to-pink-600',
                learningOutcomes: [
                    'Create wireframes, high-fidelity prototypes and interactive flows',
                    'Use components, variants and auto-layout for scalable design systems',
                    'Prepare developer handoffs with asset export and design tokens',
                    'Conduct basic usability testing and iterate on feedback'
                ]
            },
            {
                id: 'tailwind',
                name: 'Tailwind CSS',
                description: 'Utility-first CSS framework',
                icon: '💨',
                color: 'from-sky-400 to-sky-600',
                learningOutcomes: [
                    'Build responsive layouts using utility classes and responsive prefixes',
                    'Create reusable component classes with @apply and design tokens',
                    'Optimize styles for maintainability and small bundle sizes',
                    'Integrate Tailwind with React/Vue projects and JIT mode'
                ]
            },
            {
                id: 'framer',
                name: 'Framer Motion',
                description: 'UI animations for React',
                icon: '✨',
                color: 'from-violet-400 to-violet-600',
                learningOutcomes: [
                    'Animate component entrance/exit and layout transitions',
                    'Use motion primitives and spring physics for natural animations',
                    'Coordinate sequential and parallel animations with variants',
                    'Optimize animations for performance on mobile devices'
                ]
            },
            {
                id: 'adobe-xd',
                name: 'Adobe XD',
                description: 'UI/UX design toolkit',
                icon: '🅾️',
                color: 'from-red-400 to-red-600',
                learningOutcomes: [
                    'Produce interactive prototypes and design specifications',
                    'Use repeat grids, symbols, and responsive resize for layouts',
                    'Export assets and collaborate with developers',
                    'Document user flows and design rationale for stakeholders'
                ]
            },
            {
                id: 'canva',
                name: 'Canva',
                description: 'Quick design creation',
                icon: '🖼️',
                color: 'from-amber-400 to-amber-600',
                learningOutcomes: [
                    'Design marketing creatives and simple UI mockups quickly',
                    'Apply visual hierarchy, typography and color theory',
                    'Export optimized assets for web and social platforms',
                    'Collaborate on templates and brand kits for consistency'
                ]
            }
        ]
    },

    // ---------------- Web Development ----------------
    {
        id: 'web-development',
        name: 'Web Development',
        description: 'Frontend and full-stack applications.',
        icon: Globe,
        color: 'from-blue-500 to-cyan-500',
        technologies: [
            {
                id: 'react',
                name: 'React',
                description: 'UI library for building web apps',
                icon: '⚛️',
                color: 'from-indigo-400 to-indigo-600',
                learningOutcomes: [
                    'Build component-based UIs using function components and hooks',
                    'Manage state with context, reducers or state libraries',
                    'Compose reusable component libraries and patterns',
                    'Optimize rendering performance and avoid common anti-patterns'
                ]
            },
            {
                id: 'nextjs',
                name: 'Next.js',
                description: 'React full-stack framework',
                icon: '▲',
                color: 'from-sky-400 to-sky-600',
                learningOutcomes: [
                    'Understand SSR, SSG, ISR and client-side rendering tradeoffs',
                    'Build API routes and integrate server-side logic',
                    'Implement routing, middleware and edge functions',
                    'Optimize asset delivery and performance for production'
                ]
            },
            {
                id: 'vue',
                name: 'Vue.js',
                description: 'Progressive UI framework',
                icon: '💚',
                color: 'from-emerald-400 to-emerald-600',
                learningOutcomes: [
                    'Create reactive templates and component composition',
                    'Manage state with Vuex or the Composition API',
                    'Use Vue Router and server-side rendering where needed',
                    'Structure maintainable Vue applications and components'
                ]
            },
            {
                id: 'angular',
                name: 'Angular',
                description: 'Enterprise web application platform',
                icon: '🅰️',
                color: 'from-red-400 to-red-600',
                learningOutcomes: [
                    'Build modular applications using modules, components and services',
                    'Use Angular CLI, DI, and RxJS for reactive programming',
                    'Implement forms, validation, and reactive state management',
                    'Set up AOT compilation, lazy loading, and production optimizations'
                ]
            },
            {
                id: 'svelte',
                name: 'Svelte',
                description: 'Compiler-first UI framework',
                icon: '🔥',
                color: 'from-orange-400 to-orange-600',
                learningOutcomes: [
                    'Write highly-performant reactive components with minimal runtime',
                    'Understand compile-time reactivity and stores',
                    'Integrate Svelte with routing and server rendering (SvelteKit)',
                    'Optimize bundle size and runtime performance'
                ]
            },
            {
                id: 'html-css-js',
                name: 'HTML/CSS/JS',
                description: 'Core frontend technologies',
                icon: '🌐',
                color: 'from-gray-400 to-gray-600',
                learningOutcomes: [
                    'Structure semantic HTML for accessibility and SEO',
                    'Style responsive layouts with modern CSS (Flex/Grid)',
                    'Write clean, vanilla JavaScript for DOM and event handling',
                    'Debug, test, and optimize front-end performance'
                ]
            }
        ]
    },

    // ---------------- App Development ----------------
    {
        id: 'app-development',
        name: 'App Development',
        description: 'Native and cross-platform mobile apps.',
        icon: Smartphone,
        color: 'from-purple-500 to-indigo-500',
        technologies: [
            {
                id: 'react-native',
                name: 'React Native',
                description: 'Cross-platform mobile apps',
                icon: '📱',
                color: 'from-violet-400 to-violet-600',
                learningOutcomes: [
                    'Build cross-platform UI with React Native components',
                    'Handle navigation, native modules and platform APIs',
                    'Optimize performance and memory for mobile devices',
                    'Set up builds and CI for iOS and Android'
                ]
            },
            {
                id: 'flutter',
                name: 'Flutter',
                description: 'Google’s UI toolkit for mobile and desktop',
                icon: '🦋',
                color: 'from-blue-400 to-blue-600',
                learningOutcomes: [
                    'Compose UI using widgets and manage state effectively',
                    'Implement responsive layouts and platform channels',
                    'Use build & release pipelines for Android/iOS',
                    'Optimize rendering and handle animations smoothly'
                ]
            },
            {
                id: 'swift',
                name: 'Swift',
                description: 'Native iOS development',
                icon: '🍎',
                color: 'from-red-400 to-red-600',
                learningOutcomes: [
                    'Develop native iOS apps using Swift and SwiftUI/UIKit',
                    'Manage app lifecycle, data persistence and networking',
                    'Implement platform features (notifications, permissions)',
                    'Prepare apps for App Store distribution and beta testing'
                ]
            },
            {
                id: 'kotlin',
                name: 'Kotlin',
                description: 'Native Android development',
                icon: '🤖',
                color: 'from-green-400 to-green-600',
                learningOutcomes: [
                    'Build Android apps using Kotlin and Jetpack Compose',
                    'Use Android architecture components and lifecycle-aware code',
                    'Integrate networking, storage and background work',
                    'Prepare APKs/AABs and optimize for device compatibility'
                ]
            },
            {
                id: 'ionic',
                name: 'Ionic',
                description: 'Hybrid mobile framework',
                icon: '⚡',
                color: 'from-cyan-400 to-cyan-600',
                learningOutcomes: [
                    'Create hybrid mobile apps using web technologies',
                    'Use Capacitor/Cordova to access native device APIs',
                    'Design responsive UI that adapts to devices',
                    'Manage app packaging for multiple platforms'
                ]
            }
        ]
    },

    // ---------------- Backend ----------------
    {
        id: 'backend',
        name: 'Backend Development',
        description: 'APIs, microservices, and backend engineering.',
        icon: Server,
        color: 'from-green-500 to-emerald-500',
        technologies: [
            {
                id: 'nodejs',
                name: 'Node.js',
                description: 'JavaScript server runtime',
                icon: '🟢',
                color: 'from-green-400 to-green-600',
                learningOutcomes: [
                    'Build HTTP servers and RESTful APIs using Node.js',
                    'Understand event-loop, async patterns, and streams',
                    'Integrate databases, authentication, and middleware',
                    'Package and deploy Node services to production'
                ]
            },
            {
                id: 'expressjs',
                name: 'Express.js',
                description: 'Minimal Node.js backend framework',
                icon: '🚂',
                color: 'from-yellow-400 to-yellow-600',
                learningOutcomes: [
                    'Create routes, middleware, and REST endpoints with Express',
                    'Structure projects for maintainability and testing',
                    'Implement authentication, validation and error handling',
                    'Optimize performance and secure Express apps'
                ]
            },
            {
                id: 'fastapi',
                name: 'FastAPI',
                description: 'High-performance Python API framework',
                icon: '⚡',
                color: 'from-indigo-400 to-indigo-600',
                learningOutcomes: [
                    'Design fast async APIs with Pydantic models and type hints',
                    'Implement authentication, background tasks and WebSockets',
                    'Integrate with async ORMs and build production-ready services',
                    'Deploy FastAPI with Uvicorn/Gunicorn and containerization'
                ]
            },
            {
                id: 'django',
                name: 'Django',
                description: 'Python full-stack web framework',
                icon: '🎩',
                color: 'from-teal-400 to-teal-600',
                learningOutcomes: [
                    'Use Django ORM, admin, and form systems effectively',
                    'Build REST APIs with Django REST Framework (DRF)',
                    'Implement user auth, permissions and admin customizations',
                    'Scale and deploy Django apps with caching and worker queues'
                ]
            },
            {
                id: 'flask',
                name: 'Flask',
                description: 'Lightweight Python web framework',
                icon: '🍶',
                color: 'from-amber-400 to-amber-600',
                learningOutcomes: [
                    'Build modular Flask apps with blueprints and extensions',
                    'Integrate databases, authentication and background workers',
                    'Serve ML models or microservices via Flask endpoints',
                    'Containerize and deploy Flask services reliably'
                ]
            },
            {
                id: 'spring-boot',
                name: 'Spring Boot',
                description: 'Enterprise Java backend framework',
                icon: '☕',
                color: 'from-red-400 to-red-600',
                learningOutcomes: [
                    'Create REST APIs with Spring Boot, controllers and services',
                    'Use Spring Data JPA, transactions and database migrations',
                    'Secure applications with Spring Security and JWT',
                    'Architect microservices and integrate with message queues'
                ]
            },
            {
                id: 'golang',
                name: 'Go',
                description: 'High-performance backend development',
                icon: '🔵',
                color: 'from-blue-400 to-blue-600',
                learningOutcomes: [
                    'Build performant HTTP services using Go idioms',
                    'Apply concurrency with goroutines and channels safely',
                    'Structure services with clean architecture and testing',
                    'Deploy Go services as cloud-native, containerized apps'
                ]
            }
        ]
    },

    // ---------------- Blockchain ----------------
    {
        id: 'blockchain',
        name: 'Blockchain',
        description: 'Smart contracts, decentralized apps, and Web3 systems.',
        icon: Link2,
        color: 'from-orange-500 to-amber-500',
        technologies: [
            {
                id: 'solidity',
                name: 'Solidity',
                description: 'Ethereum smart contracts',
                icon: '⛓️',
                color: 'from-yellow-400 to-yellow-600',
                learningOutcomes: [
                    'Write and test Solidity smart contracts with best practices',
                    'Understand EVM, gas costs and contract security patterns',
                    'Use tools like Hardhat/Truffle for compilation and testing',
                    'Deploy contracts and interact via web3 providers'
                ]
            },
            {
                id: 'hardhat',
                name: 'Hardhat',
                description: 'Ethereum dev environment',
                icon: '⚒️',
                color: 'from-gray-400 to-gray-600',
                learningOutcomes: [
                    'Configure Hardhat projects and write deployment scripts',
                    'Write automated unit and integration tests for contracts',
                    'Debug and simulate EVM behavior with local networks',
                    'Integrate with explorer plugins and contract verification'
                ]
            },
            {
                id: 'web3js',
                name: 'Web3.js',
                description: 'Connect JavaScript with Ethereum',
                icon: '🌐',
                color: 'from-sky-400 to-sky-600',
                learningOutcomes: [
                    'Interact with smart contracts and wallets from JS apps',
                    'Handle provider connections, signing and transactions',
                    'Read on-chain data and parse events effectively',
                    'Implement wallet-based auth and transaction flows'
                ]
            },
            {
                id: 'ethersjs',
                name: 'Ethers.js',
                description: 'Modern Ethereum JS library',
                icon: '🪙',
                color: 'from-indigo-400 to-indigo-600',
                learningOutcomes: [
                    'Use Ethers for clean contract interaction and providers',
                    'Create wallets, sign transactions and handle providers securely',
                    'Use contract ABIs and utilities for on-chain data parsing',
                    'Integrate Ethers with frontend frameworks and backend scripts'
                ]
            },
            {
                id: 'rust-solana',
                name: 'Solana Rust',
                description: 'Solana smart contracts in Rust',
                icon: '🧱',
                color: 'from-emerald-400 to-emerald-600',
                learningOutcomes: [
                    'Develop Solana programs using Rust and Anchor framework',
                    'Understand Solana accounts, PDAs and transaction model',
                    'Write tests and deploy to devnet/mainnet safely',
                    'Integrate Solana programs with client SDKs and wallets'
                ]
            }
        ]
    },

    // ---------------- AI/ML ----------------
    {
        id: 'ai-ml',
        name: 'AI & Machine Learning',
        description: 'Classical ML, deep learning, agents, and LLMs.',
        icon: Brain,
        color: 'from-violet-500 to-purple-500',
        technologies: [
            {
                id: 'classical-ml',
                name: 'Classical ML',
                description: 'Traditional ML methods',
                icon: '📊',
                color: 'from-yellow-400 to-yellow-600',
                learningOutcomes: [
                    'Prepare datasets: cleaning, feature engineering and splitting',
                    'Train and evaluate models (LR, SVM, RF) with cross-validation',
                    'Interpret model metrics and avoid overfitting',
                    'Deploy simple models and integrate into apps or notebooks'
                ]
            },
            {
                id: 'deep-learning',
                name: 'Deep Learning',
                description: 'Neural networks & training',
                icon: '🧠',
                color: 'from-red-400 to-red-600',
                learningOutcomes: [
                    'Design and train neural networks using frameworks (PyTorch/TensorFlow)',
                    'Use GPUs and batching, implement optimizers and regularization',
                    'Debug training loops, implement checkpoints and callbacks',
                    'Transfer learning and fine-tuning for small datasets'
                ]
            },
            {
                id: 'computer-vision',
                name: 'Computer Vision',
                description: 'Image-based ML tasks',
                icon: '👁️',
                color: 'from-orange-400 to-orange-600',
                learningOutcomes: [
                    'Extract classical and deep features for image tasks',
                    'Train image classifiers, detectors and segmentation models',
                    'Apply augmentation and evaluation metrics for vision tasks',
                    'Deploy CV models and optimize inference performance'
                ]
            },
            {
                id: 'nlp',
                name: 'Natural Language Processing',
                description: 'Text and language models',
                icon: '📝',
                color: 'from-emerald-400 to-emerald-600',
                learningOutcomes: [
                    'Preprocess text: tokenization, embeddings and feature extraction',
                    'Train classifiers and sequence models for text tasks',
                    'Work with pre-trained transformers and fine-tuning',
                    'Build pipelines for production text processing and evaluation'
                ]
            },
            {
                id: 'generative-ai',
                name: 'Generative AI',
                description: 'LLMs, diffusion, generation',
                icon: '✨',
                color: 'from-violet-400 to-violet-600',
                learningOutcomes: [
                    'Understand LLM architectures and prompt engineering basics',
                    'Build RAG pipelines and integrate vector search',
                    'Use diffusion models for image generation and conditioning',
                    'Deploy LLM-powered endpoints with cost & safety controls'
                ]
            },
            {
                id: 'ai-agents',
                name: 'AI Agents',
                description: 'Autonomous task-driven systems',
                icon: '🤖',
                color: 'from-gray-400 to-gray-600',
                learningOutcomes: [
                    'Design multi-step agent workflows and tool integrations',
                    'Implement planner, executor and memory components',
                    'Manage agent safety, rate limits and resource usage',
                    'Evaluate agent behavior and implement fallback strategies'
                ]
            },
            {
                id: 'reinforcement-learning',
                name: 'Reinforcement Learning',
                description: 'Action-reward learning systems',
                icon: '🎮',
                color: 'from-blue-400 to-blue-600',
                learningOutcomes: [
                    'Formulate environments, rewards and training loops',
                    'Implement Q-learning, DQN and policy-gradient algorithms',
                    'Use simulators and evaluate RL policies robustly',
                    'Scale RL training and manage exploration–exploitation tradeoffs'
                ]
            },
            {
                id: 'mlops',
                name: 'MLOps',
                description: 'Deployment, serving, and monitoring',
                icon: '⚙️',
                color: 'from-slate-400 to-slate-600',
                learningOutcomes: [
                    'Package and containerize models for production inference',
                    'Create CI/CD pipelines for model training and deployment',
                    'Monitor model performance, drift and set up alerts',
                    'Integrate model versioning and reproducible pipelines'
                ]
            },
            {
                id: 'data-engineering-ai',
                name: 'Data Engineering AI',
                description: 'Pipelines & feature stores',
                icon: '🛠️',
                color: 'from-amber-400 to-amber-600',
                learningOutcomes: [
                    'Design ETL pipelines and schedule data workflows',
                    'Implement streaming ingestion and data validation',
                    'Build feature stores and manage feature lineage',
                    'Optimize storage formats and query performance'
                ]
            },
            {
                id: 'applied-ai',
                name: 'Applied AI',
                description: 'Real products powered by AI',
                icon: '🚀',
                color: 'from-teal-400 to-teal-600',
                learningOutcomes: [
                    'Translate model outputs into product features and UX',
                    'Design end-to-end AI pipelines from data to inference',
                    'Measure business impact and iterate on model/product fit',
                    'Manage costs, latency and privacy considerations in deployment'
                ]
            }
        ]
    },

    // ---------------- Data Science ----------------
    {
        id: 'data-science',
        name: 'Data Science',
        description: 'Analytics, visualization, and insights extraction.',
        icon: Database,
        color: 'from-teal-500 to-cyan-500',
        technologies: [
            {
                id: 'pandas',
                name: 'Pandas',
                description: 'Data manipulation',
                icon: '🐼',
                color: 'from-green-400 to-green-600',
                learningOutcomes: [
                    'Load, clean and transform tabular data efficiently',
                    'Use groupby, pivot and merge operations effectively',
                    'Prepare datasets for modeling and reporting',
                    'Optimize memory usage and vectorized operations'
                ]
            },
            {
                id: 'numpy',
                name: 'NumPy',
                description: 'Numerical computing',
                icon: '🔢',
                color: 'from-indigo-400 to-indigo-600',
                learningOutcomes: [
                    'Work with n-dimensional arrays and broadcasting rules',
                    'Perform vectorized numerical operations and linear algebra',
                    'Integrate NumPy with higher-level ML libraries',
                    'Optimize numeric workloads for speed and memory'
                ]
            },
            {
                id: 'matplotlib',
                name: 'Matplotlib',
                description: 'Visualization library',
                icon: '📉',
                color: 'from-red-400 to-red-600',
                learningOutcomes: [
                    'Create basic charts and customize plots for clarity',
                    'Layer plots and manage figure layouts effectively',
                    'Export publication-quality graphics and dashboards',
                    'Combine Matplotlib with pandas for exploratory analysis'
                ]
            },
            {
                id: 'seaborn',
                name: 'Seaborn',
                description: 'Statistical visualizations',
                icon: '📊',
                color: 'from-cyan-400 to-cyan-600',
                learningOutcomes: [
                    'Produce informative statistical plots and summaries',
                    'Visualize categorical and continuous variable relationships',
                    'Customize visual styles for reporting and presentations',
                    'Use Seaborn for rapid exploratory data analysis'
                ]
            },
            {
                id: 'jupyter',
                name: 'Jupyter',
                description: 'Interactive notebooks',
                icon: '📓',
                color: 'from-amber-400 to-amber-600',
                learningOutcomes: [
                    'Create reproducible notebooks for exploration and demos',
                    'Use magics, widgets and visualization inline',
                    'Organize experiments and share notebooks with stakeholders',
                    'Convert notebooks to scripts and production artifacts'
                ]
            }
        ]
    },

    // ---------------- Cybersecurity ----------------
    {
        id: 'cybersecurity',
        name: 'Cybersecurity',
        description: 'Pen-testing, threat modeling, and security tooling.',
        icon: Shield,
        color: 'from-red-500 to-rose-500',
        technologies: [
            {
                id: 'kali',
                name: 'Kali Linux',
                description: 'Penetration testing environment',
                icon: '🛡️',
                color: 'from-gray-400 to-gray-600',
                learningOutcomes: [
                    'Use Kali toolset for reconnaissance and vulnerability scanning',
                    'Understand common attack vectors and mitigation strategies',
                    'Perform basic exploitation in isolated lab environments',
                    'Document findings and prepare security reports'
                ]
            },
            {
                id: 'metasploit',
                name: 'Metasploit',
                description: 'Security exploitation framework',
                icon: '🧨',
                color: 'from-orange-400 to-orange-600',
                learningOutcomes: [
                    'Use Metasploit modules for controlled exploitation tests',
                    'Create and run payloads in lab environments',
                    'Validate remediation by re-testing vulnerabilities',
                    'Automate repetitive pentest tasks responsibly'
                ]
            },
            {
                id: 'burp-suite',
                name: 'Burp Suite',
                description: 'Web vulnerability scanning',
                icon: '🕷️',
                color: 'from-red-400 to-red-600',
                learningOutcomes: [
                    'Proxy and inspect HTTP(S) traffic for vulnerability discovery',
                    'Use scanner, intruder and repeater for testing',
                    'Identify and exploit common web vulnerabilities',
                    'Report security issues with proof-of-Learn steps'
                ]
            },
            {
                id: 'wireshark',
                name: 'Wireshark',
                description: 'Network packet analysis',
                icon: '🌐',
                color: 'from-blue-400 to-blue-600',
                learningOutcomes: [
                    'Capture and analyze network traffic with filters and dissectors',
                    'Diagnose network issues and protocol-level problems',
                    'Correlate network activity with application behavior',
                    'Use packet captures for forensic and debugging purposes'
                ]
            }
        ]
    },

    // ---------------- DevOps ----------------
    {
        id: 'devops',
        name: 'DevOps',
        description: 'Automation, CI/CD, infrastructure, and monitoring.',
        icon: Settings,
        color: 'from-slate-500 to-gray-500',
        technologies: [
            {
                id: 'docker',
                name: 'Docker',
                description: 'Containerization',
                icon: '🐳',
                color: 'from-blue-400 to-blue-600',
                learningOutcomes: [
                    'Containerize applications and manage images effectively',
                    'Compose multi-service applications with Docker Compose',
                    'Understand image layers, caching and build performance',
                    'Integrate containers into CI/CD and orchestration systems'
                ]
            },
            {
                id: 'kubernetes',
                name: 'Kubernetes',
                description: 'Container orchestration',
                icon: '☸️',
                color: 'from-green-400 to-green-600',
                learningOutcomes: [
                    'Deploy and scale containerized apps with Deployments and Services',
                    'Manage config, secrets, and rolling updates safely',
                    'Understand pod networking, volumes and resource requests',
                    'Use Helm and operators for repeatable deployments'
                ]
            },
            {
                id: 'github-actions',
                name: 'GitHub Actions',
                description: 'CI/CD Automation',
                icon: '⚙️',
                color: 'from-purple-400 to-purple-600',
                learningOutcomes: [
                    'Author workflows for build, test and deployment pipelines',
                    'Use actions, secrets and matrix builds for automation',
                    'Integrate checks and gated releases for quality control',
                    'Monitor and troubleshoot pipeline failures effectively'
                ]
            },
            {
                id: 'terraform',
                name: 'Terraform',
                description: 'Infrastructure as Code',
                icon: '🏗️',
                color: 'from-indigo-400 to-indigo-600',
                learningOutcomes: [
                    'Model infrastructure as reusable, versioned code',
                    'Manage state safely and use modules for composition',
                    'Provision cloud resources across providers reliably',
                    'Plan, apply and review infrastructure changes in CI'
                ]
            },
            {
                id: 'ansible',
                name: 'Ansible',
                description: 'Automation & provisioning',
                icon: '📦',
                color: 'from-red-400 to-red-600',
                learningOutcomes: [
                    'Automate server configuration with idempotent playbooks',
                    'Use roles, inventories and vaults for scalable infra',
                    'Integrate Ansible into provisioning and CI workflows',
                    'Test and validate playbooks in controlled environments'
                ]
            }
        ]
    },

    // ---------------- Game Development ----------------
    {
        id: 'game-dev',
        name: 'Game Development',
        description: 'Game engines and interactive experience development.',
        icon: Gamepad2,
        color: 'from-fuchsia-500 to-pink-500',
        technologies: [
            {
                id: 'unity',
                name: 'Unity',
                description: '2D/3D engine',
                icon: '🎮',
                color: 'from-cyan-400 to-cyan-600',
                learningOutcomes: [
                    'Build scenes, prefabs and game object lifecycles',
                    'Program gameplay logic and physics using scripts',
                    'Optimize assets and performance for target platforms',
                    'Implement input, UI and cross-platform builds'
                ]
            },
            {
                id: 'unreal',
                name: 'Unreal Engine',
                description: 'AAA-grade game engine',
                icon: '🎯',
                color: 'from-indigo-400 to-indigo-600',
                learningOutcomes: [
                    'Use Blueprints and C++ to prototype and implement gameplay mechanics',
                    'Work with rendering pipeline, materials and lighting',
                    'Optimize large scenes and streaming for performance',
                    'Package games for PC and consoles with best practices'
                ]
            },
            {
                id: 'godot',
                name: 'Godot',
                description: 'Open-source game engine',
                icon: '🤖',
                color: 'from-green-400 to-green-600',
                learningOutcomes: [
                    'Create scenes and nodes and compose reusable assets',
                    'Script gameplay using GDScript or C#',
                    'Export to multiple platforms and manage resource pipelines',
                    'Prototype mechanics quickly with Godot’s lightweight tooling'
                ]
            }
        ]
    },

    // ---------------- Cloud ----------------
    {
        id: 'cloud',
        name: 'Cloud Computing',
        description: 'Cloud architecture, serverless, and distributed systems.',
        icon: Cloud,
        color: 'from-sky-500 to-blue-500',
        technologies: [
            {
                id: 'aws',
                name: 'AWS',
                description: 'Amazon cloud platform',
                icon: '☁️',
                color: 'from-orange-400 to-orange-600',
                learningOutcomes: [
                    'Provision core cloud services (EC2, S3, RDS, IAM)',
                    'Design secure networking and VPC patterns',
                    'Use platform services for scaling and resilience',
                    'Optimize cost and monitor workloads in production'
                ]
            },
            {
                id: 'azure',
                name: 'Azure',
                description: 'Microsoft cloud services',
                icon: '🔷',
                color: 'from-blue-400 to-blue-600',
                learningOutcomes: [
                    'Deploy applications using App Services and AKS',
                    'Manage identity with Azure AD and RBAC',
                    'Integrate Azure storage, databases and serverless functions',
                    'Monitor and secure resources using Azure tools'
                ]
            },
            {
                id: 'gcp',
                name: 'Google Cloud',
                description: 'Google cloud platform',
                icon: '🌩️',
                color: 'from-blue-400 to-blue-600',
                learningOutcomes: [
                    'Use GCP services like Compute Engine, Cloud Storage and BigQuery',
                    'Design data pipelines and serverless architectures',
                    'Implement IAM, networking and security best practices',
                    'Leverage GCP managed services for analytics and ML'
                ]
            },
            {
                id: 'serverless',
                name: 'Serverless',
                description: 'Functions and cloud-native apps',
                icon: '⚡',
                color: 'from-yellow-400 to-yellow-600',
                learningOutcomes: [
                    'Build event-driven apps using serverless functions',
                    'Manage cold starts, concurrency and cost optimizations',
                    'Design stateless APIs and integrate managed services',
                    'Deploy serverless apps using frameworks and CI/CD'
                ]
            }
        ]
    },

    // ---------------- Others ----------------
    {
        id: 'others',
        name: 'Others',
        description: 'Unique, emerging, and specialized tech categories.',
        icon: MoreHorizontal,
        color: 'from-neutral-500 to-stone-500',
        technologies: [
            {
                id: 'iot',
                name: 'IoT',
                description: 'Internet of Things',
                icon: '📡',
                color: 'from-green-400 to-green-600',
                learningOutcomes: [
                    'Design end-to-end IoT data flows from device to cloud',
                    'Implement device communication protocols and security',
                    'Process and analyze telemetry data at scale',
                    'Deploy edge and cloud components with reliability in mind'
                ]
            },
            {
                id: 'arduino',
                name: 'Arduino',
                description: 'Electronics & hardware',
                icon: '🔌',
                color: 'from-red-400 to-red-600',
                learningOutcomes: [
                    'Prototype circuits and control hardware with Arduino boards',
                    'Program sensors and actuators with C/C++ sketches',
                    'Integrate hardware with mobile or web interfaces',
                    'Build safe and power-conscious embedded projects'
                ]
            },
            {
                id: 'raspberry-pi',
                name: 'Raspberry Pi',
                description: 'Microcomputer projects',
                icon: '🍓',
                color: 'from-purple-400 to-purple-600',
                learningOutcomes: [
                    'Set up Linux-based microcomputers and networking',
                    'Run edge services and lightweight ML workloads',
                    'Interface with hardware GPIO and peripherals',
                    'Automate tasks and deploy small-scale services'
                ]
            },
            {
                id: 'robotics',
                name: 'Robotics',
                description: 'Mechanical & autonomous robotics',
                icon: '🤖',
                color: 'from-gray-400 to-gray-600',
                learningOutcomes: [
                    'Integrate sensors, actuators and control loops',
                    'Design basic robot navigation and state machines',
                    'Simulate robotics workflows and test in controlled environments',
                    'Apply ROS or alternative middleware for modular robotics systems'
                ]
            }
        ]
    }
]

// Helper functions (unchanged)
export function getCategoryById(id: string): Category | undefined {
    return categories.find(cat => cat.id === id)
}

export function getTechnologyById(categoryId: string, techId: string): Technology | undefined {
    const category = getCategoryById(categoryId)
    return category?.technologies.find(tech => tech.id === techId)
}

/**
 * Find which category a technology belongs to.
 * Useful for reverse lookup (e.g., when a project only stores techId).
 */
export function getCategoryOfTechnology(techId: string): Category | undefined {
    return categories.find(category =>
        category.technologies.some(tech => tech.id === techId)
    )
}

/**
 * Flatten all technologies across all categories.
 * Useful for search suggestions, filters, admin dashboards, etc.
 */
export function getAllTechnologiesFlat(): {
    categoryId: string;
    categoryName: string;
    tech: Technology
}[] {
    return categories.flatMap(category =>
        category.technologies.map(tech => ({
            categoryId: category.id,
            categoryName: category.name,
            tech
        }))
    )
}
