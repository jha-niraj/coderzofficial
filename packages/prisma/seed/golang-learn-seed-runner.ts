import { prisma } from '@repo/prisma'
import { seedGolangLearnContent } from './golang-learn-seed'

async function main() {
    console.log('🌱 Starting Golang Learn seeding...\n')

    try {
        await seedGolangLearnContent()
        console.log('\n✅ Golang learning content seeded successfully!')
    } catch (error) {
        console.error('⚠️ Error seeding Golang learning content:', error)
    }

    console.log('🎉 Golang seeding completed!\n')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
