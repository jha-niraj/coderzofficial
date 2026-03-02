import { prisma } from '@repo/prisma'
import bcrypt from 'bcryptjs'
import { seedCppLearnContent } from './cpp-learn-seed'
import { seedGolangLearnContent } from './golang-learn-seed'

async function main() {
    console.log('🌱 Starting database seeding...\n')

    try {
        // Seed C++ Learning Content
        console.log('\n📘 Seeding C++ Learning Content...')
        await seedCppLearnContent()
        console.log('✅ C++ learning content seeded successfully!')
    } catch (error) {
        console.error('⚠️ Error seeding C++ learning content:', error)
    }

    try {
        // Seed Golang Learning Content
        console.log('\n📘 Seeding Golang Learning Content...')
        await seedGolangLearnContent()
        console.log('✅ Golang learning content seeded successfully!')
    } catch (error) {
        console.error('⚠️ Error seeding Golang learning content:', error)
    }

    console.log('🎉 Seeding completed!\n')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
