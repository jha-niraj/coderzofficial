import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        // const token = searchParams.get('token')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        // Handle errors from learn platform
        if (error) {
            const errorUrl = new URL('/error', request.nextUrl.origin)
            errorUrl.searchParams.set('error', error)
            return NextResponse.redirect(errorUrl)
        }

        // If we have a state parameter, redirect to that URL
        if (state) {
            try {
                const decodedState = decodeURIComponent(state)
                // Validate that the URL is safe to redirect to
                const stateUrl = new URL(decodedState, request.nextUrl.origin)
                return NextResponse.redirect(stateUrl)
            } catch (error) {
                console.error('Invalid state parameter:', error)
            }
        }

        // Default redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin))
    } catch (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/error', request.nextUrl.origin))
    }
}
