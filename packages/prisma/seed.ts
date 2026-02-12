import { prisma } from '@repo/prisma'
import bcrypt from 'bcryptjs'
import { seedOpenSourceLearn } from './seed/opensource-git-learn'
import { seedAchievements } from './seed/achievements-seed'

async function main() {
	console.log('🌱 Starting database seeding...\n')

	// Super Admin credentials
	const SUPER_ADMIN_EMAIL = 'admin@thecoderz.com'
	const SUPER_ADMIN_PASSWORD = 'Admin@123'
	const SUPER_ADMIN_NAME = 'Super Admin'

	try {
		// Check if super admin already exists
		const existingUser = await prisma.user.findUnique({
			where: { email: SUPER_ADMIN_EMAIL },
			include: {
				adminAccess: true
			}
		})

		if (existingUser && existingUser.adminAccess) {
			console.log('✅ Super admin already exists!')
			console.log(`   Email: ${SUPER_ADMIN_EMAIL}`)
			console.log(`   Name: ${existingUser.name}`)
			console.log(`   Role: ${existingUser.adminAccess.adminRole}`)
		} else {
			// Hash password
			const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12)

			// Create or update user
			const user = existingUser || await prisma.user.create({
				data: {
					email: SUPER_ADMIN_EMAIL,
					name: SUPER_ADMIN_NAME,
					hashedPassword,
					emailVerified: true,
					role: 'Admin',
					username: 'superadmin',
					onboardingCompleted: true,
					credits: 10000,
					currentXp: 10000,
					totalXp: 10000,
					currentLevel: 100,
				}
			})

			// Create AdminAccess
			const adminAccess = await prisma.adminAccess.create({
				data: {
					userId: user.id,
					adminRole: 'SUPER_ADMIN',
					status: 'ACTIVE',
					permissions: {
						users: ['read', 'write', 'delete', 'full'],
						credits: ['read', 'write', 'delete', 'full'],
						projects: ['read', 'write', 'delete', 'full'],
						mocks: ['read', 'write', 'delete', 'full'],
						assessments: ['read', 'write', 'delete', 'full'],
						challenges: ['read', 'write', 'delete', 'full'],
						communities: ['read', 'write', 'delete', 'full'],
						feedback: ['read', 'write', 'delete', 'full'],
						analytics: ['read', 'write', 'full'],
						admin_management: ['read', 'write', 'delete', 'full'],
						system: ['read', 'write', 'full'],
					},
					hashedPassword,
					loginCount: 0,
				}
			})

			// Create initial audit log
			await prisma.adminAuditLog.create({
				data: {
					adminId: adminAccess.id,
					action: 'CREATE',
					module: 'system',
					resourceType: 'AdminAccess',
					resourceId: adminAccess.id,
					description: 'Super admin account created via seed script',
				}
			})

			console.log('✅ Super admin created successfully!\n')
			console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
			console.log('📧 Email:    ', SUPER_ADMIN_EMAIL)
			console.log('🔑 Password: ', SUPER_ADMIN_PASSWORD)
			console.log('👤 Name:     ', SUPER_ADMIN_NAME)
			console.log('🛡️  Role:     SUPER_ADMIN')
			console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
			console.log('\n⚠️  IMPORTANT: Change this password after first login!\n')
		}
	} catch (error) {
		console.error('❌ Error creating super admin:', error)
		throw error
	}

	// Seed Git Learning Content
	console.log('\n📚 Seeding Git Learning Content...')
	try {
		await seedOpenSourceLearn()
		console.log('✅ Git learning content seeded successfully!')
	} catch (error) {
		console.error('⚠️ Error seeding Git learning content:', error)
		// Don't throw - allow other seeds to continue
	}

	// Seed Achievements (Badges & Levels)
	console.log('\n🏆 Seeding Achievements System...')
	try {
		await seedAchievements()
		console.log('✅ Achievements system seeded successfully!')
	} catch (error) {
		console.error('⚠️ Error seeding achievements:', error)
		// Don't throw - allow other seeds to continue
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
