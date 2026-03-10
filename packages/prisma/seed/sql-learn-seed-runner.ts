import { prisma } from '@repo/prisma'
import { seedSqlLearnContent } from './sql-learn-seed'

async function main() {
    console.log('🌱 Starting SQL Learn seeding...\n')

    try {
        await seedSqlLearnContent()
        console.log('\n✅ SQL learning content seeded successfully!')
    } catch (error) {
        console.error('⚠️ Error seeding SQL learning content:', error)
    }

    console.log('🎉 SQL seeding completed!\n')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
