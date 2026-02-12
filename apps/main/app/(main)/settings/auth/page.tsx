import { auth } from '@repo/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Shield } from 'lucide-react'

export const metadata = {
    title: 'Auth & Security | Settings | Coderz',
    description: 'Manage authentication and security settings',
}

export default async function AuthSettingsPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-foreground">Auth & Security</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Additional security settings and session management
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Security
                    </CardTitle>
                    <CardDescription>
                        Manage your security preferences
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        More security options coming soon. For now, manage your password
                        and connected accounts from the Account settings.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
