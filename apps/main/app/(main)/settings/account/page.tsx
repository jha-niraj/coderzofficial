import { auth } from '@repo/auth'
import { redirect } from 'next/navigation'
import { AccountSettingsContent } from './_components/account-settings-content'
import { prisma } from '@repo/prisma'

export const metadata = {
    title: 'Account Settings | Coderz',
    description: 'Manage your account information and security',
}

export default async function AccountSettingsPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    // Get user and linked accounts
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            emailVerified: true,
            hashedPassword: true,
            createdAt: true,
        },
    })

    const accounts = await prisma.account.findMany({
        where: { userId: session.user.id },
        select: {
            provider: true,
            providerAccountId: true,
        },
    })

    if (!user) {
        redirect('/login')
    }

    const linkedProviders = accounts.map((a) => a.provider)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-foreground">Account</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Update your account information and password
                </p>
            </div>
            <AccountSettingsContent
                user={{
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    emailVerified: user.emailVerified,
                    hasPassword: !!user.hashedPassword,
                    createdAt: user.createdAt,
                }}
                linkedProviders={linkedProviders}
            />
        </div>
    )
}
