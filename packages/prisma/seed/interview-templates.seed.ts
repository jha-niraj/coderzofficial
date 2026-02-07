// Interview Process Templates Seed Data
// Run: npx prisma db seed

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const templates = [
    // STARTUP Style Templates
    {
        name: "Startup Software Engineer",
        description: "Fast-paced interview process for early-stage startups. Focus on practical skills and cultural fit.",
        style: "STARTUP",
        category: "ENGINEERING",
        estimatedDurationWeeks: 1,
        roundCount: 3,
        isPublic: true,
        rounds: [
            {
                roundType: "PHONE_SCREEN",
                title: "Intro Call",
                durationMinutes: 30,
                format: "VOICE",
                description: "Quick chat to understand your background and what you're looking for."
            },
            {
                roundType: "TECHNICAL_CODING",
                title: "Technical Round",
                durationMinutes: 60,
                format: "LIVE_CODING",
                description: "Hands-on coding session with real-world problems we face."
            },
            {
                roundType: "CULTURE_FIT",
                title: "Founder Chat",
                durationMinutes: 45,
                format: "VIDEO",
                description: "Meet the founders, discuss vision, and ensure mutual fit."
            }
        ]
    },
    {
        name: "Startup Product Manager",
        description: "Lean PM interview focusing on execution and adaptability in a fast-moving environment.",
        style: "STARTUP",
        category: "PRODUCT",
        estimatedDurationWeeks: 1,
        roundCount: 3,
        isPublic: true,
        rounds: [
            {
                roundType: "PHONE_SCREEN",
                title: "Intro Call",
                durationMinutes: 30,
                format: "VOICE",
                description: "Discuss your PM experience and approach to product development."
            },
            {
                roundType: "CUSTOM",
                title: "Product Case",
                durationMinutes: 45,
                format: "VIDEO",
                description: "Walk us through how you'd tackle a product challenge we're facing."
            },
            {
                roundType: "HIRING_MANAGER",
                title: "Leadership Chat",
                durationMinutes: 45,
                format: "VIDEO",
                description: "Meet leadership and discuss how you'd fit into our product vision."
            }
        ]
    },

    // FAANG Style Templates
    {
        name: "FAANG Software Engineer",
        description: "Comprehensive technical interview process similar to top tech companies. Heavy focus on algorithms and system design.",
        style: "FAANG",
        category: "ENGINEERING",
        estimatedDurationWeeks: 4,
        roundCount: 6,
        isPublic: true,
        rounds: [
            {
                roundType: "PHONE_SCREEN",
                title: "Recruiter Screen",
                durationMinutes: 30,
                format: "VOICE",
                description: "Initial screening call with recruiter to discuss background and role fit."
            },
            {
                roundType: "TECHNICAL_CODING",
                title: "Phone Technical",
                durationMinutes: 45,
                format: "LIVE_CODING",
                description: "First technical screen with an engineer. 1-2 algorithm problems."
            },
            {
                roundType: "TECHNICAL_CODING",
                title: "Onsite Coding 1",
                durationMinutes: 60,
                format: "LIVE_CODING",
                description: "In-depth algorithm and data structure problems with senior engineer."
            },
            {
                roundType: "TECHNICAL_CODING",
                title: "Onsite Coding 2",
                durationMinutes: 60,
                format: "LIVE_CODING",
                description: "More complex algorithmic challenges, focus on optimization."
            },
            {
                roundType: "SYSTEM_DESIGN",
                title: "System Design",
                durationMinutes: 60,
                format: "WHITEBOARD",
                description: "Design a large-scale distributed system. Cover scalability, reliability, and trade-offs."
            },
            {
                roundType: "BEHAVIORAL",
                title: "Behavioral / Leadership",
                durationMinutes: 45,
                format: "VIDEO",
                description: "Leadership principles and behavioral questions using STAR method."
            }
        ]
    },
    {
        name: "FAANG Product Manager",
        description: "Rigorous PM interview process focusing on product sense, analytical thinking, and leadership.",
        style: "FAANG",
        category: "PRODUCT",
        estimatedDurationWeeks: 4,
        roundCount: 5,
        isPublic: true,
        rounds: [
            {
                roundType: "PHONE_SCREEN",
                title: "Recruiter Screen",
                durationMinutes: 30,
                format: "VOICE",
                description: "Initial screening and role overview."
            },
            {
                roundType: "CUSTOM",
                title: "Product Sense",
                durationMinutes: 45,
                format: "VIDEO",
                description: "Design a product for a specific user segment. Show creativity and user empathy."
            },
            {
                roundType: "CUSTOM",
                title: "Analytical / Metrics",
                durationMinutes: 45,
                format: "VIDEO",
                description: "Define success metrics, root cause analysis, and data-driven decision making."
            },
            {
                roundType: "CUSTOM",
                title: "Execution / Strategy",
                durationMinutes: 60,
                format: "VIDEO",
                description: "Prioritization framework, roadmap planning, and stakeholder management."
            },
            {
                roundType: "BEHAVIORAL",
                title: "Leadership Principles",
                durationMinutes: 45,
                format: "VIDEO",
                description: "Deep dive into leadership experiences and company culture fit."
            }
        ]
    },
    {
        name: "FAANG Data Scientist",
        description: "Technical data science interview with focus on ML, statistics, and product application.",
        style: "FAANG",
        category: "DATA_SCIENCE",
        estimatedDurationWeeks: 4,
        roundCount: 5,
        isPublic: true,
        rounds: [
            {
                roundType: "PHONE_SCREEN",
                title: "Recruiter Screen",
                durationMinutes: 30,
                format: "VOICE",
                description: "Background discussion and role fit assessment."
            },
            {
                roundType: "TECHNICAL_CODING",
                title: "SQL / Coding",
                durationMinutes: 60,
                format: "LIVE_CODING",
                description: "SQL queries, Python/R coding for data manipulation."
            },
            {
                roundType: "CUSTOM",
                title: "Statistics & ML",
                durationMinutes: 60,
                format: "WHITEBOARD",
                description: "Probability, statistics fundamentals, ML algorithms deep dive."
            },
            {
                roundType: "CUSTOM",
                title: "Product / Business Case",
                durationMinutes: 45,
                format: "VIDEO",
                description: "Apply data science to solve a real business problem."
            },
            {
                roundType: "BEHAVIORAL",
                title: "Behavioral Round",
                durationMinutes: 45,
                format: "VIDEO",
                description: "Communication skills, collaboration, and cultural fit."
            }
        ]
    },

    // MNC Style Templates
    {
        name: "MNC Software Engineer",
        description: "Traditional corporate interview process with multiple panel rounds and HR involvement.",
        style: "MNC",
        category: "ENGINEERING",
        estimatedDurationWeeks: 3,
        roundCount: 5,
        isPublic: true,
        rounds: [
            {
                roundType: "PHONE_SCREEN",
                title: "HR Screening",
                durationMinutes: 30,
                format: "VOICE",
                description: "Initial HR call to verify qualifications and salary expectations."
            },
            {
                roundType: "TECHNICAL_CODING",
                title: "Technical Written",
                durationMinutes: 90,
                format: "WRITTEN_TEST",
                description: "Online assessment with MCQs and coding problems."
            },
            {
                roundType: "TECHNICAL_CODING",
                title: "Technical Interview",
                durationMinutes: 60,
                format: "VIDEO",
                description: "Technical discussion with senior engineers on projects and problem-solving."
            },
            {
                roundType: "PANEL",
                title: "Panel Interview",
                durationMinutes: 60,
                format: "VIDEO",
                description: "Interview with multiple team members covering various aspects."
            },
            {
                roundType: "HR_FINAL",
                title: "HR Final",
                durationMinutes: 30,
                format: "VIDEO",
                description: "Final HR discussion on compensation, benefits, and joining formalities."
            }
        ]
    },
    {
        name: "MNC Manager",
        description: "Leadership role interview with focus on management experience and strategic thinking.",
        style: "MNC",
        category: "OPERATIONS",
        estimatedDurationWeeks: 3,
        roundCount: 4,
        isPublic: true,
        rounds: [
            {
                roundType: "PHONE_SCREEN",
                title: "HR Screening",
                durationMinutes: 30,
                format: "VOICE",
                description: "Initial screening on background and leadership experience."
            },
            {
                roundType: "BEHAVIORAL",
                title: "Competency Interview",
                durationMinutes: 60,
                format: "VIDEO",
                description: "Assess management competencies using situational questions."
            },
            {
                roundType: "PANEL",
                title: "Leadership Panel",
                durationMinutes: 60,
                format: "VIDEO",
                description: "Meet with senior leadership to discuss vision and strategy."
            },
            {
                roundType: "HR_FINAL",
                title: "HR Final",
                durationMinutes: 30,
                format: "VIDEO",
                description: "Compensation discussion and offer process."
            }
        ]
    },

    // General Templates
    {
        name: "Designer Interview",
        description: "Portfolio-focused interview process for UX/UI design roles.",
        style: "CUSTOM",
        category: "DESIGN",
        estimatedDurationWeeks: 2,
        roundCount: 4,
        isPublic: true,
        rounds: [
            {
                roundType: "CUSTOM",
                title: "Portfolio Review",
                durationMinutes: 45,
                format: "VIDEO",
                description: "Walk through your design portfolio and discuss your process."
            },
            {
                roundType: "TAKE_HOME",
                title: "Design Challenge",
                durationMinutes: 240,
                format: "TAKE_HOME",
                description: "Complete a design exercise showcasing your skills."
            },
            {
                roundType: "CUSTOM",
                title: "Design Critique",
                durationMinutes: 60,
                format: "VIDEO",
                description: "Present your challenge solution and receive feedback."
            },
            {
                roundType: "CULTURE_FIT",
                title: "Team Fit",
                durationMinutes: 45,
                format: "VIDEO",
                description: "Meet the design team and discuss collaboration."
            }
        ]
    },
    {
        name: "Intern Interview",
        description: "Simplified process for internship hiring.",
        style: "CUSTOM",
        category: "INTERN",
        estimatedDurationWeeks: 1,
        roundCount: 2,
        isPublic: true,
        rounds: [
            {
                roundType: "PHONE_SCREEN",
                title: "Intro Call",
                durationMinutes: 20,
                format: "VOICE",
                description: "Quick intro to understand your interests and goals."
            },
            {
                roundType: "TECHNICAL_CODING",
                title: "Technical Discussion",
                durationMinutes: 45,
                format: "LIVE_CODING",
                description: "Simple coding problems appropriate for your experience level."
            }
        ]
    },
    {
        name: "Marketing Manager",
        description: "Interview process for marketing leadership roles.",
        style: "CUSTOM",
        category: "MARKETING",
        estimatedDurationWeeks: 2,
        roundCount: 4,
        isPublic: true,
        rounds: [
            {
                roundType: "PHONE_SCREEN",
                title: "Recruiter Screen",
                durationMinutes: 30,
                format: "VOICE",
                description: "Initial discussion on marketing experience and role expectations."
            },
            {
                roundType: "CUSTOM",
                title: "Marketing Case",
                durationMinutes: 60,
                format: "VIDEO",
                description: "Present a marketing strategy for a given scenario."
            },
            {
                roundType: "BEHAVIORAL",
                title: "Leadership Assessment",
                durationMinutes: 45,
                format: "VIDEO",
                description: "Discuss your leadership style and team management approach."
            },
            {
                roundType: "HIRING_MANAGER",
                title: "Hiring Manager",
                durationMinutes: 45,
                format: "VIDEO",
                description: "Final discussion with the hiring manager."
            }
        ]
    },
    {
        name: "Sales Representative",
        description: "Sales-focused interview with role-play scenarios.",
        style: "CUSTOM",
        category: "SALES",
        estimatedDurationWeeks: 1,
        roundCount: 3,
        isPublic: true,
        rounds: [
            {
                roundType: "PHONE_SCREEN",
                title: "Phone Screen",
                durationMinutes: 30,
                format: "VOICE",
                description: "Discuss your sales background and track record."
            },
            {
                roundType: "CUSTOM",
                title: "Sales Role Play",
                durationMinutes: 45,
                format: "VIDEO",
                description: "Demonstrate your sales skills in a mock scenario."
            },
            {
                roundType: "HIRING_MANAGER",
                title: "Sales Manager",
                durationMinutes: 45,
                format: "VIDEO",
                description: "Meet with the sales manager to discuss targets and team."
            }
        ]
    }
]

export async function seedInterviewTemplates() {
    console.log("🌱 Seeding interview process templates...")

    for (const template of templates) {
        const existing = await prisma.interviewProcessTemplate.findFirst({
            where: { 
                name: template.name,
                style: template.style as "STARTUP" | "FAANG" | "MNC" | "CUSTOM"
            }
        })

        if (!existing) {
            await prisma.interviewProcessTemplate.create({
                data: {
                    name: template.name,
                    description: template.description,
                    style: template.style as "STARTUP" | "FAANG" | "MNC" | "CUSTOM",
                    category: template.category as "ENGINEERING" | "PRODUCT" | "DESIGN" | "DATA_SCIENCE" | "MARKETING" | "SALES" | "OPERATIONS" | "INTERN" | "GENERAL",
                    rounds: template.rounds,
                    estimatedDurationWeeks: template.estimatedDurationWeeks,
                    roundCount: template.roundCount,
                    isPublic: template.isPublic,
                    isAiGenerated: false
                }
            })
            console.log(`  ✅ Created template: ${template.name}`)
        } else {
            console.log(`  ⏭️ Template already exists: ${template.name}`)
        }
    }

    console.log("✅ Interview templates seeding complete!")
}

// Export only - this is called from seed.ts
