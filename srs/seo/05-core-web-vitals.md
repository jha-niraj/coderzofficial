# Core Web Vitals — What They Are, Why They Matter, How to Fix Them

> Core Web Vitals are direct ranking factors. If your site fails them, you have an active penalty.
> This file explains each metric and gives specific fixes for Next.js + Cloudflare deployments.

---

## The Key Distinction: Synthetic vs Real-World

| Tool | Measures | Used by Google for ranking? |
|---|---|---|
| Lighthouse (Chrome DevTools) | Synthetic — simulated throttled connection | NO |
| PageSpeed Insights Lab Data | Same as Lighthouse | NO |
| PageSpeed Insights Field Data | CrUX — real users, real devices | YES |
| GSC Core Web Vitals Report | CrUX — real users | YES |

**Critical lesson from getcreatr:** Lighthouse showed LCP 0.8s on desktop. CrUX showed LCP 4.5s on desktop. Both are real measurements. Google ranks on CrUX. Always check PageSpeed Insights Field Data, not just the Lighthouse score.

**Why they differ:** Lighthouse runs in a controlled environment with throttled CPU and network. CrUX measures real users visiting from cold cache states, on real mobile devices, on real mobile networks. The difference can be 5–10x.

---

## The Three Metrics

### LCP — Largest Contentful Paint
**What it is:** Time until the largest visible element (usually a hero image or large text block) is fully rendered.

**Google's thresholds:**
- ✅ Good: under 2.5 seconds
- ⚠️ Needs Improvement: 2.5–4.0 seconds
- ❌ Poor: over 4.0 seconds

**Most common LCP elements:** Hero image, above-fold `<h1>`, large banner image.

**How to find your LCP element:**
1. Open PageSpeed Insights → enter your URL
2. Scroll to "Diagnostics" → "Largest Contentful Paint element"
3. It shows you exactly what element is the LCP

### CLS — Cumulative Layout Shift
**What it is:** How much the page content jumps around while loading. Zero means nothing moves.

**Google's thresholds:**
- ✅ Good: under 0.1
- ⚠️ Needs Improvement: 0.1–0.25
- ❌ Poor: over 0.25

**Causes:** Images without explicit width/height, fonts causing text reflow, dynamically injected content above existing content, ads that load after content.

### INP — Interaction to Next Paint
**What it is:** Responsiveness. Time from user interaction (click, tap, keypress) to the next visible update.

**Google's thresholds:**
- ✅ Good: under 200ms
- ⚠️ Needs Improvement: 200–500ms
- ❌ Poor: over 500ms

**Causes:** Heavy JavaScript on the main thread, large event handlers, synchronous operations blocking UI updates.

---

## How to Fix LCP

### Fix 1: Identify and Optimize the LCP Element

**If LCP is an image:**

```typescript
// ❌ Wrong — no preload priority
<Image src="/hero.webp" alt="Hero" width={1920} height={1080} />

// ✅ Correct — fetchPriority tells browser to preload this first
<Image src="/hero.webp" alt="Hero" width={1920} height={1080} fetchPriority="high" />

// For static hero images that don't need image optimization:
<Image src="/hero.webp" alt="Hero" width={1920} height={1080} unoptimized fetchPriority="high" />
```

**If LCP is text (heading):**
- Make sure the font is either system font or preloaded
- Avoid `font-display: block` — use `swap` or `optional`

### Fix 2: Cloudflare Workers Image Caching (Critical)

**The problem unique to opennextjs-cloudflare:**
`/_next/image` (Next.js image optimization) is NOT edge-cached on Cloudflare Workers. Every request hits the Worker → IMAGES binding → full transform. This takes ~500ms+ per request.

**The fix: serve static, pre-optimized images from the ASSETS binding**

```typescript
// ❌ Goes through /_next/image — not cached at edge
<Image src="/hero.jpg" width={1920} height={1080} />

// ✅ Served from /_next/static/media — edge-cached with immutable headers
<Image src="/hero.webp" width={1920} height={1080} unoptimized />
```

**Pre-generate WebP files:**
```bash
# For hero/carousel images — 1920px wide
cwebp -q 85 -m 6 -resize 1920 0 hero.jpg -o hero.webp

# For blog post images — resize to 2× container width
cwebp -q 85 -m 6 -resize 1344 0 post-image.jpg -o post-image.webp
```

Commit the `.webp` files to `public/`. Serve them as `unoptimized`. Edge-cached at ~50ms cold, ~5ms warm.

### Fix 3: Preload LCP Image in Document Head

```typescript
// app/layout.tsx or app/head.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <link
          rel="preload"
          as="image"
          href="/hero.webp"
          fetchPriority="high"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

> Note: Only preload the actual LCP image. Preloading too many images hurts performance.

### Fix 4: Server-Side Render the LCP Element

Never render the LCP element client-side. If it's in a `useEffect` or behind a client component, it won't render until JS hydrates — adding 500ms–2000ms.

```typescript
// ❌ LCP image hidden until client hydration
'use client'
export function Hero() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => setLoaded(true), [])
  if (!loaded) return null  // LCP hidden until JS
  return <img src="/hero.webp" />
}

// ✅ LCP image in the HTML from the server
export function Hero() {
  return <img src="/hero.webp" />  // In HTML immediately
}
```

---

## How to Fix CLS

### Fix 1: Always Specify Image Dimensions

```typescript
// ❌ No dimensions — browser doesn't know size until image loads, page jumps
<img src="/hero.webp" alt="Hero" />

// ✅ Dimensions set — browser reserves space before image loads
<img src="/hero.webp" alt="Hero" width={1200} height={630} />

// Or use aspect-ratio CSS:
<div style={{ aspectRatio: '16/9' }}>
  <img src="/hero.webp" alt="Hero" className="w-full h-full object-cover" />
</div>
```

### Fix 2: Use `font-display: swap` for Custom Fonts

```css
@font-face {
  font-family: 'YourFont';
  src: url('/fonts/YourFont.woff2') format('woff2');
  font-display: swap;  /* Shows fallback font immediately, swaps when ready */
}
```

### Fix 3: Reserve Space for Dynamic Content

If you load ads, banners, or dynamic content above the fold:

```typescript
// Reserve space so existing content doesn't jump
<div className="min-h-[90px]">  {/* Reserve exact height */}
  <DynamicAd />
</div>
```

---

## How to Fix INP

### Fix 1: Defer Heavy JavaScript

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ['heavy-library-name'],
  },
}
```

### Fix 2: Use Dynamic Imports for Non-Critical Components

```typescript
import dynamic from 'next/dynamic'

// Load heavy components only when needed
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false,  // Don't SSR if it's purely client-side
})
```

### Fix 3: Avoid Synchronous Operations in Event Handlers

```typescript
// ❌ Blocks the main thread
button.onClick = () => {
  const result = heavyCalculation()  // 500ms of work
  setData(result)
}

// ✅ Break up with setTimeout or use web workers
button.onClick = () => {
  setTimeout(() => {
    const result = heavyCalculation()
    setData(result)
  }, 0)
}
```

---

## How to Check Your Scores

1. **PageSpeed Insights:** pagespeed.web.dev — enter your URL, check Field Data
2. **GSC Core Web Vitals Report:** GSC → Experience → Core Web Vitals
3. **Chrome DevTools:** Performance tab → tick "Web Vitals" checkbox

**For Cloudflare Workers specifically:**
```bash
# Check TTFB from edge cache (should be <100ms if cached)
curl -so /dev/null -w "TTFB: %{time_starttransfer}s\n" https://yourdomain.com

# Second request (should be faster — edge-cached)
curl -so /dev/null -w "TTFB: %{time_starttransfer}s\n" https://yourdomain.com
```

---

## Mobile vs Desktop: Which to Prioritize

**Always prioritize mobile.** Google uses mobile-first indexing — it crawls and ranks based on the mobile version of your site.

A common trap: your desktop LCP is 1.2s (good) but mobile LCP is 4.8s (failing). Google is ranking the mobile version. Fix mobile first.

Why mobile is harder:
- Slower CPUs and RAM on mobile devices
- Slower network connections (4G, not fiber)
- Images are still large if not properly resized
- JavaScript execution takes longer

---

## Realistic Timeline After Fixing

```
Week 1:  Deploy fixes
Week 2-3: CrUX data starts reflecting new numbers (28-day rolling window)
Week 4:  GSC Core Web Vitals report shows improvement
Month 2: Ranking improvement visible in GSC Performance report
```

Core Web Vitals changes take ~28 days to fully reflect in CrUX data. Don't panic if scores don't change immediately after a fix — the data is a rolling average.
