import { withAuth, type NextRequestWithAuth } from "@repo/auth/middleware"
import { NextResponse } from "next/server"

// Protected routes that require authentication
const protectedRoutes = [
    '/dashboard',
    '/settings',
    '/profile',
    '/jobs',
    '/candidates',
    '/applications',
    '/analytics',
    '/team',
    '/billing',
    '/company',
    '/interviews',
    '/assessments',
]

// Public routes that don't require authentication
const publicRoutes = [
    '/',
    '/signin',
    '/register',
    '/verify',
    '/forgotpassword',
    '/resetpassword',
    '/error',
    '/privacy',
    '/terms',
    '/about',
    '/pricing',
    '/contactus'
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

export default withAuth(
    function middleware(req: NextRequestWithAuth) {
        const { nextUrl } = req
        const isLoggedIn = !!req.nextauth.token
        const onboardingCompleted = req.nextauth.token?.onboardingCompleted || false

        console.log(`[Hiring] Middleware: ${nextUrl.pathname}, isLoggedIn: ${isLoggedIn}, onboarding: ${onboardingCompleted}`)

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

        // Check if current path is a protected route
        const isProtectedRoute = protectedRoutes.some(route =>
            nextUrl.pathname.startsWith(route)
        )

        // If user is not logged in and trying to access protected route
        if (!isLoggedIn && isProtectedRoute) {
            const signInUrl = new URL('/signin', nextUrl.origin)
            signInUrl.searchParams.set('callbackUrl', nextUrl.pathname)
            return NextResponse.redirect(signInUrl)
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
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl

                // Allow access to public routes
                if (publicRoutes.some(route =>
                    pathname === route || (route !== '/' && pathname.startsWith(route))
                )) {
                    return true
                }

                // Allow access to API routes
                if (apiRoutes.some(route => pathname.startsWith(route))) {
                    return true
                }

                // Check if route is protected
                const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

                // If it's a protected route, require authentication
                if (isProtectedRoute) {
                    return !!token
                }

                // Allow everything else
                return true
            },
        },
        pages: {
            signIn: '/signin',
        },
    }
)

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
