# Dynamic Sitemap Setup in Next.js

> Never write a sitemap.xml file by hand. Let Next.js generate it from your content metadata.
> This file documents the exact pattern and common bugs.

---

## The Pattern (Copy This)

Create `src/app/sitemap.ts`:

```typescript
import type { MetadataRoute } from 'next'
import { CASE_STUDIES, ESSAYS } from '@/content/sections'
import { VS_TOOLS } from '@/content/vs'
import { SITE_URL as SITE } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Static pages — hardcode their dates (use actual publish date, not today)
    {
      url: SITE,
      lastModified: new Date('2026-04-23'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE}/pricing`,
      lastModified: new Date('2026-04-23'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },

    // Dynamic pages — pull dates from content metadata
    ...Object.entries(ESSAYS).map(([slug, meta]) => ({
      url: `${SITE}/${slug}`,
      lastModified: new Date(meta.dateModified),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...Object.entries(CASE_STUDIES).map(([slug, meta]) => ({
      url: `${SITE}/${slug}`,
      lastModified: new Date(meta.dateModified),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),

    // Low-priority static pages
    {
      url: `${SITE}/privacy`,
      lastModified: new Date('2026-04-23'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE}/terms`,
      lastModified: new Date('2026-04-23'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
```

---

## Priority Values Guide

| Page Type | Priority | Why |
|---|---|---|
| Homepage | 1.0 | Most important page |
| Product/Pricing | 0.9 | High conversion intent |
| VS Comparison pages | 0.9 | High commercial intent |
| Case Studies | 0.8 | Social proof, trust |
| Blog posts / Essays | 0.6–0.7 | Content pages |
| Privacy, Terms | 0.3 | Nobody searches for these |

> Note: Google uses priority as a hint, not a command. It primarily affects crawl frequency when Googlebot decides what to revisit.

---

## Change Frequency Guide

| Value | Use For |
|---|---|
| `always` | Real-time data (stock prices, live scores) |
| `hourly` | News sites, live dashboards |
| `daily` | Frequently updated listings |
| `weekly` | Homepage, active product pages |
| `monthly` | Blog posts, case studies |
| `yearly` | Privacy policy, terms |
| `never` | Archived content |

---

## The Critical Bug: lastModified Always Showing Today

**The bug:**
```typescript
// ❌ WRONG — every page always shows today's date
const now = new Date()

export default function sitemap() {
  return [
    { url: `${SITE}/post-one`, lastModified: now },
    { url: `${SITE}/post-two`, lastModified: now },
  ]
}
```

**Why it matters:** When every page always shows today as its modification date, Google sees your entire site as freshly updated on every crawl. This trains Google to ignore your `lastModified` signals entirely. It also misrepresents when content was actually changed, which can negatively affect how Google prioritizes recrawling.

**The fix:**
```typescript
// ✅ CORRECT — each page uses its actual modification date from metadata
...Object.entries(ESSAYS).map(([slug, meta]) => ({
  url: `${SITE}/${slug}`,
  lastModified: new Date(meta.dateModified),  // from sections.ts
  changeFrequency: 'monthly' as const,
  priority: 0.7,
})),
```

---

## How to Add New Pages Automatically

**Rule:** Never manually add URLs to `sitemap.ts` for content pages.

Instead:
1. Define your content metadata in a TypeScript object (`sections.ts`)
2. The sitemap reads from that object with `Object.entries()`
3. Every new key you add to the metadata object automatically appears in the sitemap

Example metadata structure:
```typescript
// src/content/sections.ts
export const ESSAYS = {
  'post-one': { dateModified: '2026-05-01', ... },
  'post-two': { dateModified: '2026-05-12', ... },
  // Adding 'post-three' here automatically adds it to the sitemap
}
```

---

## Verifying Your Sitemap

After deploying, visit `https://yourdomain.com/sitemap.xml` directly.

Check:
1. All your important pages are listed
2. Dates look correct (not all the same, not all today)
3. URLs use the correct domain (not localhost)
4. No 404 pages are included

---

## Robots.txt — Reference the Sitemap

Create `src/app/robots.ts`:

```typescript
import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      // Allow AI crawlers to build brand presence in AI search
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
```

---

## After Adding New Content: Deployment Checklist

```
1. Add entry to sections.ts (or vs.ts)
2. Create the .mdx file
3. Add OG image to public/og/
4. npm run deploy (or git push if CI handles deploy)
5. Visit yourdomain.com/sitemap.xml — verify new URL appears
6. GSC → URL Inspection → paste URL → Request Indexing
```

---

## Multi-Section Sites

If your site has multiple content types with different URL patterns:

```typescript
// src/app/sitemap.ts — handling multiple URL patterns

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Blog posts at /blog/[slug]
    ...Object.entries(BLOG_POSTS).map(([slug, meta]) => ({
      url: `${SITE}/blog/${slug}`,
      lastModified: new Date(meta.dateModified),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    // Product pages at /products/[slug]
    ...Object.entries(PRODUCTS).map(([slug, meta]) => ({
      url: `${SITE}/products/${slug}`,
      lastModified: new Date(meta.dateModified),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    // Landing pages at /[slug] — static, hardcode dates
    { url: `${SITE}/about`, lastModified: new Date('2026-01-01'), changeFrequency: 'yearly', priority: 0.5 },
  ]
}
```

---

## Sitemap Index (For Large Sites, 1000+ Pages)

If you have more than 1000 URLs, split into multiple sitemaps:

```typescript
// src/app/sitemap.ts — returns the sitemap index
export default function sitemap(): MetadataRoute.Sitemap {
  // This automatically becomes a sitemap index if you return > 50,000 URLs
  // Next.js handles the splitting automatically
  return [...]
}
```

Next.js automatically generates a sitemap index at `/sitemap.xml` and individual sitemaps at `/sitemap/1.xml`, `/sitemap/2.xml` etc. when the count exceeds 50,000 entries. For most projects this is irrelevant.
