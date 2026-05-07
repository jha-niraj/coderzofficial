import { getSessionFromRequest, redirectToSignIn } from "@repo/auth/middleware"
import { NextRequest, NextResponse } from "next/server"

// Protected routes that require authentication
const protectedRoutes = [
    '/dashboard',
    '/settings',
    '/profile',
    '/students',
    '/faculty',
    '/classes',
    '/departments',
    '/assignments',
    '/analytics',
    '/billing',
    '/placements',
    '/university',
]

// API routes that should be excluded from auth checks
const apiRoutes = [
    '/api/auth',
    '/api/health',
    '/api/webhooks',
    '/api/verify-otp',
    '/api/forgotpassword',
    '/api/resetpassword',
    '/api/resend-verification',
    '/api/user/verify-status',
]

export default async function middleware(req: NextRequest) {
    const { nextUrl } = req

    // Allow API routes to pass through
    if (apiRoutes.some(route => nextUrl.pathname.startsWith(route))) {
        return NextResponse.next()
    }

    // Allow static files and Next.js internals
    if (
        nextUrl.pathname.startsWith('/_next/') ||
        nextUrl.pathname.startsWith('/api/') ||
        nextUrl.pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    const session = await getSessionFromRequest(req)
    const isLoggedIn = !!session
    const onboardingCompleted = (session?.user as { onboardingCompleted?: boolean } | undefined)?.onboardingCompleted ?? false

    console.log(`[University] Middleware: ${nextUrl.pathname}, isLoggedIn: ${isLoggedIn}, onboarding: ${onboardingCompleted}`)

    // Check if current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route =>
        nextUrl.pathname.startsWith(route)
    )

    // If user is not logged in and trying to access protected route
    if (!isLoggedIn && isProtectedRoute) {
        return redirectToSignIn(req)
    }

    // Handle post-login redirection logic
    if (isLoggedIn) {
        // Check onboarding status
        if (!onboardingCompleted && nextUrl.pathname !== '/onboarding' && nextUrl.pathname !== '/verify') {
            // Redirect to onboarding if not completed (except verify and onboarding itself)
            return NextResponse.redirect(new URL('/onboarding', nextUrl.origin))
        }

        // If onboarding is completed and user tries to access onboarding page, redirect to dashboard
        if (onboardingCompleted && nextUrl.pathname === '/onboarding') {
            return NextResponse.redirect(new URL('/dashboard', nextUrl.origin))
        }

        // If user is trying to access signin/register, redirect based on onboarding status
        if (nextUrl.pathname === '/signin' || nextUrl.pathname === '/register') {
            const redirectUrl = onboardingCompleted ? '/dashboard' : '/onboarding'
            return NextResponse.redirect(new URL(redirectUrl, nextUrl.origin))
        }

        // For the root path, redirect authenticated users based on onboarding status
        if (nextUrl.pathname === '/') {
            const redirectUrl = onboardingCompleted ? '/dashboard' : '/onboarding'
            return NextResponse.redirect(new URL(redirectUrl, nextUrl.origin))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         * - files with extensions (images, etc.)
         * - webhook endpoints
         */
        '/((?!api/auth|api/webhooks|_next/static|_next/image|favicon.ico|public/|.*\\..*).*)',
    ],
}
