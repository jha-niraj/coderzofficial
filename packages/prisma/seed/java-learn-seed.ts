import { prisma } from '@repo/prisma';

export async function seedCppLearnContent() {
    console.log('📚 Seeding C++ Learn Content...');

    // Find admin user
    const admin = await prisma.user.findFirst({ where: { role: 'Admin' } });
    if (!admin) { console.log('⚠️ No admin user found, skipping C++ seed'); return; }
    const creatorId = admin.id;

    // 1. Create Main Category
    const programming = await prisma.learnMainCategory.upsert({
        where: { slug: 'programming' },
        update: {},
        create: { slug: 'programming', name: 'Programming', description: 'Learn programming languages and fundamentals', icon: '💻', color: '#3B82F6', order: 1 },
    });

    // 2. Create Sub Category
    const cpp = await prisma.learnSubCategory.upsert({
        where: { slug: 'cpp' },
        update: {},
        create: { slug: 'cpp', name: 'C++', description: 'Master C++ programming from basics to advanced concepts', mainCategoryId: programming.id, icon: '🔷', color: '#00599C', order: 1 },
    });

    // Helper to create a learn with steps
    async function createLearn(data: {
        slug: string; title: string; description: string; difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
        unitNumber: number; unitTitle: string; estimatedTime: number; tags: string[]; iconEmoji: string;
        steps: {
            order: number; title: string; type: string; content: string; tips?: string[]; stepData?: object;
            codeBlocks?: { order: number; title: string; language: string; code: string; explanation: string; highlightLines?: number[]; isRunnable?: boolean }[];
        }[];
    }) {
        const existing = await prisma.learn.findUnique({ where: { slug: data.slug } });
        if (existing) { console.log(`  ⏭️ Skipping ${data.slug} (exists)`); return existing; }

        const learn = await prisma.learn.create({
            data: {
                slug: data.slug, title: data.title, description: data.description,
                difficulty: data.difficulty as any, tags: data.tags, unitNumber: data.unitNumber, unitTitle: data.unitTitle,
                estimatedTime: data.estimatedTime, iconEmoji: data.iconEmoji, accentColor: '#00599C',
                status: 'PUBLISHED', publishedAt: new Date(), creatorId,
                mainCategoryId: programming.id, subCategoryId: cpp.id,
            },
        });

        for (const step of data.steps) {
            const createdStep = await prisma.learnStep.create({
                data: {
                    learnId: learn.id, order: step.order, title: step.title,
                    type: step.type as any, content: step.content,
                    tips: step.tips || [], stepData: step.stepData ? (step.stepData as any) : undefined,
                },
            });
            if (step.codeBlocks) {
                for (const cb of step.codeBlocks) {
                    await prisma.learnCodeBlock.create({
                        data: {
                            stepId: createdStep.id, order: cb.order, title: cb.title,
                            language: cb.language, code: cb.code, explanation: cb.explanation,
                            highlightLines: cb.highlightLines || [], showLineNumbers: true, isRunnable: cb.isRunnable ?? true,
                        },
                    });
                }
            }
        }
        console.log(`  ✅ Created: ${data.title} (${data.steps.length} steps)`);
        return learn;
    }

    

}