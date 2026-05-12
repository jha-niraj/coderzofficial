# Next.js on Cloudflare Workers — SEO Gotchas and Fixes

> Deploying Next.js via opennextjs-cloudflare introduces specific SEO behaviors
> that differ from Vercel. This documents every one of them.

---

## The Stack

- **Next.js 16+ App Router** with Turbopack
- **opennextjs-cloudflare** (NOT Cloudflare Pages)
- **Wrangler** with ASSETS and IMAGES bindings
- **Deploy:** `npm run deploy` → `opennextjs-cloudflare build && opennextjs-cloudflare deploy`

---

## Critical: `/_next/image` Is Not Edge-Cached

**The problem:**
On Cloudflare Workers, Next.js's built-in image optimization (`/_next/image`) hits the Worker on every request from every new edge location. The Cloudflare IMAGES binding handles the transform, but the response is NOT cached at the edge. Each unique visitor at a new edge location pays ~500ms for image processing.

**What this means for LCP:**
- Hero image served via `/_next/image`: ~500ms on cold cache, every time
- Hero image served via ASSETS binding (`unoptimized`): ~375ms first visit, ~50ms after

**The solution:**
```typescript
// ❌ Goes through /_next/image — not edge-cached
<Image src="/hero.jpg" width={1920} height={1080} />

// ✅ Pre-generate WebP, serve unoptimized — ASSETS binding caches immutably
<Image src="/hero.webp" width={1920} height={1080} unoptimized />

// Or with plain img tag:
<img src="/hero.webp" width={1920} height={1080} loading="eager" fetchPriority="high" />
```

**What to ignore in next.config.ts on Cloudflare Workers:**
```typescript
// These are silently IGNORED by opennextjs-cloudflare:
images: {
  minimumCacheTTL: 60,  // IGNORED
  deviceSizes: [...],   // IGNORED if using unoptimized
}
experimental: {
  optimizeCss: true,    // BREAKS opennextjs-cloudflare build — do NOT enable
}
```

---

## Static Assets: The Edge Cache That Does Work

The ASSETS binding (which serves `/_next/static/*` and your `public/` files) IS edge-cached with:
```
cache-control: public, max-age=31536000, immutable
```

This applies to:
- Pre-built JavaScript and CSS bundles (`/_next/static/`)
- All files in `public/` (images, fonts, videos, icons)
- OG images at `public/og/`

**TTFB benchmarks:**
- First visit (cold): ~375ms
- Repeat visit (warm): ~50ms

**How to extend caching to non-static files via `public/_headers`:**
```
/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/videos/*
  Cache-Control: public, max-age=31536000, immutable

/og/*
  Cache-Control: public, max-age=31536000, immutable
```

> Note: Changes to `_headers` propagate on deploy, but existing cached responses at Cloudflare edge nodes honor the OLD TTL until they expire. A file with `max-age=31536000` will take up to a year to show updated headers at all edge nodes — so set headers correctly the first time.

---

## HTML Response Caching

HTML pages (your Next.js routes) are served via opennext with:
```
cache-control: s-maxage=31536000
```

This means Cloudflare caches the HTML at the edge. Subsequent requests for the same page are served from edge cache (~50–80ms TTFB).

**How to verify edge caching is working:**
```bash
# Check x-nextjs-cache header — "HIT" = served from edge cache
curl -I https://yourdomain.com | grep -i "x-nextjs-cache"
# Expected: x-nextjs-cache: HIT

# Measure TTFB
curl -so /dev/null -w "TTFB: %{time_starttransfer}s\n" https://yourdomain.com
# Expected: under 0.1s when cached
```

---

## Redirects in next.config.ts

On Cloudflare Workers, redirects defined in `next.config.ts` work correctly:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,   // 301 redirect — tells Google to update its index
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ]
  },
}
```

**Use `permanent: true` (301) for:**
- Old pages that no longer exist
- URL restructuring (old slug → new slug)
- Common old URL patterns (index.html, register, signup)

**Use `permanent: false` (302) for:**
- Temporary redirects (A/B tests, maintenance mode)
- Anything you might reverse

**SEO impact:**
- 301 redirects pass link equity to the destination URL
- 302 redirects do NOT pass link equity
- Always use 301 for permanent moves

---

## Headers for SEO

Configure via `public/_headers` (NOT via `next.config.ts` headers — those also work but `_headers` is more predictable on Cloudflare):

```
# OG images — long cache
/og/*
  Cache-Control: public, max-age=31536000, immutable

# Fonts — long cache  
/fonts/*
  Cache-Control: public, max-age=31536000, immutable

# Robots.txt — short cache (you might update it)
/robots.txt
  Cache-Control: public, max-age=86400

# Sitemap — short cache (new posts appear here)
/sitemap.xml
  Cache-Control: public, max-age=3600
```

---

## Noindex for Non-Production Environments

If you have staging/preview environments, they must not be indexed by Google.

The getcreatr approach uses middleware:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/middleware'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''

  // Noindex everything that isn't production
  if (!host.endsWith('yourdomain.com') && host !== 'localhost:3000') {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  return NextResponse.next()
}
```

This adds `X-Robots-Tag: noindex, nofollow` to all responses on non-production domains, preventing Google from indexing preview deployments.

---

## Build and Deploy Checklist

```
Before deploying:
[ ] All WebP images are pre-generated and in public/
[ ] No /_next/image usage for performance-critical images (use unoptimized)
[ ] public/_headers configured with correct cache rules
[ ] Redirects in next.config.ts use permanent: true for permanent moves
[ ] Middleware noindexes non-production hosts
[ ] Sitemap uses actual dateModified per page (not new Date())

After deploying:
[ ] Visit /sitemap.xml — verify all pages listed with correct URLs
[ ] Visit /robots.txt — verify Googlebot is allowed
[ ] curl -I https://yourdomain.com | grep cache-control — verify caching headers
[ ] Check x-nextjs-cache: HIT on second request to same page
[ ] GSC → Request Indexing for any new pages
```

---

## Known Issues / Things That Don't Work as Expected

| Issue | Impact | Fix |
|---|---|---|
| `/_next/image` not edge-cached | High LCP on cold cache | Pre-generate WebP, use `unoptimized` |
| `minimumCacheTTL` in next.config ignored | None if you use `unoptimized` | N/A — use static assets |
| `optimizeCss: true` breaks build | Build fails | Never enable on opennextjs-cloudflare |
| ISR TTLs ignored | Pages don't revalidate on schedule | Use manual deploy for content updates |
| `next/font` with `display: block` causes CLS | LCP image delayed | Use `display: swap` |
| Large `priority` prop deprecated in Next.js 16 | Noisy deprecation warning | Use `fetchPriority="high"` instead |
