import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        const searchParams = request.nextUrl.searchParams
        const redirectUri = searchParams.get('redirect_uri')
        const state = searchParams.get('state')

        // If user is not authenticated, redirect to signin page with callback
        if (!session?.user) {
            const callbackUrl = redirectUri ? `${redirectUri}?state=${encodeURIComponent(state || '')}` : undefined
            const signinUrl = new URL('/signin', request.nextUrl.origin)
            if (callbackUrl) {
                signinUrl.searchParams.set('callbackUrl', callbackUrl)
            }
            return NextResponse.redirect(signinUrl)
        }

        // User is authenticated, create JWT token and redirect back to learn platform
        if (redirectUri) {
            const jwt = await createJWTForUser(session.user)
            const callbackUrl = new URL(redirectUri)
            callbackUrl.searchParams.set('token', jwt)
            if (state) {
                callbackUrl.searchParams.set('state', state)
            }
            return NextResponse.redirect(callbackUrl)
        }

        return NextResponse.json({ error: 'Missing redirect_uri parameter' }, { status: 400 })
    } catch (error) {
        console.error('SSO signin error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

async function createJWTForUser(user: any) {
    const { SignJWT } = await import('jose')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'ZDgHApfCZD33Dk4aPAVzhlMkRynpGk9hf8bceQE4jGc=')

    const jwt = await new SignJWT({
        sub: user.id,
        email: user.email,
        name: user.name,
        picture: user.image,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
        iss: process.env.NEXTAUTH_URL || 'https://coderzai.xyz'
    })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secret)

    return jwt
}
