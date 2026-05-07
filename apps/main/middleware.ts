import { getSessionFromRequest, redirectToSignIn } from "@repo/auth/middleware"
import { NextRequest, NextResponse } from "next/server"

// Protected routes that require authentication (only core user-specific functionality)
const protectedRoutes = [
	'/home',
	'/profile',
	'/settings',
	'/transactions',
	'/sharecredits',
]

// Public routes that don't require authentication (allow exploration)
const publicRoutes = [
	'/',
	'/signin',
	'/register',
	'/verify',
	'/forgotpassword',
	'/resetpassword',
	'/error',
	'/aboutus',
	'/careers',
	'/search',
	'/practice',
	'/quizdemo',
	'/contests',
	'/behindthemagic',
	'/projects',
	'/ai',
	'/mock',
	'/interviewprep',
	'/assessments',
	'/communities',
	'/leaderboard',
	'/feedback',
	'/devconfessions',
	'/coderzforge',
	'/opensource',
	'/store',
	'/purchase',
	'/onboarding',
	'/dashboard',  // Keep for redirect
	'/explore',    // Keep for redirect
]

// API routes that should be excluded from auth checks
const apiRoutes = [
	'/api/auth',
	'/api/health',
	'/api/user',
	'/api/webhooks',
	'/api/register',
	'/api/verifyemail',
	'/api/forgotpassword',
	'/api/resend-verification',
	'/api/user/verify-status',
	'/api/auth/verify-password'
]

export default async function middleware(req: NextRequest) {
	const { nextUrl } = req
	const pathname = nextUrl.pathname

	// Pass through static assets and Next.js internals
	if (
		pathname.startsWith('/_next/') ||
		pathname.includes('.') ||
		apiRoutes.some(r => pathname.startsWith(r))
	) {
		return NextResponse.next()
	}

	const session = await getSessionFromRequest(req)
	const isLoggedIn = !!session?.user
	const onboardingCompleted = (session?.user as { onboardingDone?: boolean })?.onboardingDone ?? false

	const isProtected = protectedRoutes.some(r => pathname.startsWith(r))

	if (!isLoggedIn && isProtected) {
		return redirectToSignIn(req)
	}

	if (isLoggedIn) {
		if (!onboardingCompleted && pathname !== '/onboarding' && pathname !== '/verify') {
			return NextResponse.redirect(new URL('/onboarding', nextUrl.origin))
		}
		if (onboardingCompleted && pathname === '/onboarding') {
			return NextResponse.redirect(new URL('/home', nextUrl.origin))
		}
		if (pathname === '/signin' || pathname === '/register') {
			return NextResponse.redirect(new URL(onboardingCompleted ? '/home' : '/onboarding', nextUrl.origin))
		}
		if (pathname === '/') {
			return NextResponse.redirect(new URL(onboardingCompleted ? '/home' : '/onboarding', nextUrl.origin))
		}
		if (pathname === '/dashboard' || pathname === '/explore') {
			return NextResponse.redirect(new URL('/home', nextUrl.origin))
		}
	}

	return NextResponse.next()
}

export const config = {
	// More specific matcher to avoid catching static files and API routes
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