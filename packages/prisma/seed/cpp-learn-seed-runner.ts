import { prisma } from '@repo/prisma'
import { seedCppLearnContent } from './cpp-learn-seed'

async function main() {
    console.log('🌱 Starting C++ Learn seeding...\n')

    try {
        await seedCppLearnContent()
        console.log('\n✅ C++ learning content seeded successfully!')
    } catch (error) {
        console.error('⚠️ Error seeding C++ learning content:', error)
    }

    console.log('🎉 C++ seeding completed!\n')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
