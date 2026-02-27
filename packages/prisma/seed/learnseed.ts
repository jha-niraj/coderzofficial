import { prisma } from '@repo/prisma'
import bcrypt from 'bcryptjs'
import { seedCppLearnContent } from './cpp-learn-seed'

async function main() {
    console.log('🌱 Starting database seeding...\n')

    try {
        // Seed C++ Learning Content
        console.log('\n📘 Seeding C++ Learning Content...')
        await seedCppLearnContent()
        console.log('✅ C++ learning content seeded successfully!')
    } catch (error) {
        console.error('⚠️ Error seeding C++ learning content:', error)
    } finally {
        console.log('🎉 Seeding completed!\n')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
