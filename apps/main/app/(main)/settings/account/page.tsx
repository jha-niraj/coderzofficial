import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AccountSettingsContent } from './_components/account-settings-content'
import { db, users, accounts } from '@repo/db'
import { eq } from 'drizzle-orm'

export const metadata = {
    title: 'Account Settings | Coderz',
    description: 'Manage your account information and security',
}

export default async function AccountSettingsPage() {
    const session = await getSession(headers())

    if (!session?.user?.id) {
        redirect('/login')
    }

    const [user] = await db
        .select({ id: users.id, name: users.name, email: users.email, image: users.image, emailVerified: users.emailVerified, hashedPassword: users.hashedPassword, createdAt: users.createdAt })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1)

    if (!user) redirect('/login')

    const linkedAccounts = await db
        .select({ providerId: accounts.providerId })
        .from(accounts)
        .where(eq(accounts.userId, session.user.id))

    const linkedProviders = linkedAccounts.map((a) => a.providerId)

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
                    emailVerified: user.emailVerified ?? false,
                    hasPassword: !!user.hashedPassword,
                    createdAt: user.createdAt,
                }}
                linkedProviders={linkedProviders}
            />
        </div>
    )
}
