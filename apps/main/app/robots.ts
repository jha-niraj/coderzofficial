import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.buildrhq.com'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/home/',
                    '/settings/',
                    '/profile/',
                    '/transactions/',
                    '/sharecredits/',
                    '/onboarding/',
                    '/_next/',
                    '/admin/',
                    '/signin',
                    '/register',
                    '/verify',
                    '/forgotpassword',
                    '/resetpassword',
                ],
            },
            // Allow AI crawlers explicitly (drives LLM-sourced referral traffic)
            { userAgent: 'GPTBot', allow: '/' },
            { userAgent: 'ClaudeBot', allow: '/' },
            { userAgent: 'PerplexityBot', allow: '/' },
            { userAgent: 'Googlebot', allow: '/' },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    }
}
