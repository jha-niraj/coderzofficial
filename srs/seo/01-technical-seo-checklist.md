# Technical SEO Checklist

> This is Layer 1. Everything else depends on this being solid.
> Work through this list before writing a single blog post.

---

## How to Use This Checklist

Each item has:
- **Status tags:** `[ ]` not done, `[x]` done, `[~]` partial / in progress
- **Severity:** HIGH = ranking penalty today, MEDIUM = missed opportunity, LOW = polish
- **Who fixes it:** Engineering (code change), Manual (GSC action), Content (on-page change)

---

## 1. Indexing & Crawlability

### Sitemap
- `[ ]` **Sitemap exists at `/sitemap.xml`** — verify by visiting the URL directly  
  *Severity: HIGH | Who: Engineering*
- `[ ]` **Sitemap submitted to GSC** — GSC → Sitemaps → Submit  
  *Severity: HIGH | Who: Manual*
- `[ ]` **Sitemap `lastModified` dates are accurate** — NOT using `new Date()` (always today)  
  *Severity: MEDIUM | Who: Engineering*  
  > Common bug: `const now = new Date()` used for all pages means every page always shows today as modified. Fix: pull `dateModified` from your content metadata object per page. See `04-sitemap-setup.md`.
- `[ ]` **Sitemap only includes indexable pages** — no noindex pages, no 404s, no redirects  
  *Severity: MEDIUM | Who: Engineering*
- `[ ]` **Sitemap is referenced in robots.txt** — `Sitemap: https://yourdomain.com/sitemap.xml`  
  *Severity: LOW | Who: Engineering*

### Robots.txt
- `[ ]` **`/robots.txt` exists and is accessible**  
  *Severity: HIGH | Who: Engineering*
- `[ ]` **Robots.txt allows Googlebot** — `User-agent: *` with correct Allow/Disallow rules  
  *Severity: HIGH | Who: Engineering*
- `[ ]` **API routes disallowed** — `Disallow: /api/` prevents crawling internal endpoints  
  *Severity: MEDIUM | Who: Engineering*
- `[ ]` **AI crawlers allowed (optional but recommended)** — GPTBot, ClaudeBot, PerplexityBot allowed unless you have a reason to block  
  *Severity: LOW | Who: Engineering*

### 404 and Redirect Hygiene
- `[ ]` **No important pages returning 404** — check GSC Coverage report → "Not found (404)"  
  *Severity: HIGH | Who: Engineering*
- `[ ]` **Old URLs redirect with 301** — not 302, not soft 404  
  *Severity: HIGH | Who: Engineering*
- `[ ]` **`/index.html` redirects to `/`** — many external links point to this  
  *Severity: MEDIUM | Who: Engineering*
- `[ ]` **Old subdomains cleaned up** — if `docs.yourdomain.com` no longer exists, submit URL removal in GSC  
  *Severity: HIGH | Who: Manual*  
  > Lesson from getcreatr: `doc.getcreatr.com` had 102 crawled-but-not-indexed pages dragging down domain quality. Submit full prefix removal (`https://doc.getcreatr.com/`) in GSC → Removals → New Request. Individual page removals expire after 6 months — prefix removal is permanent.

### Canonical Tags
- `[ ]` **Every page has a canonical tag pointing to its own URL**  
  *Severity: HIGH | Who: Engineering*
- `[ ]` **UTM parameter URLs canonicalize to base URL** — `?utm_source=X` → canonical to `/page`  
  *Severity: MEDIUM | Who: Engineering*
- `[ ]` **HTTP version redirects to HTTPS** with canonical on HTTPS version  
  *Severity: HIGH | Who: Engineering / Hosting*

---

## 2. On-Page SEO

### Title Tags & Meta Descriptions
- `[ ]` **Every page has a unique `<title>` tag** — 50–60 characters, includes primary keyword  
  *Severity: HIGH | Who: Content + Engineering*
- `[ ]` **Every page has a unique meta description** — 150–160 characters, includes keyword, has a reason to click  
  *Severity: MEDIUM | Who: Content*
- `[ ]` **Homepage title includes brand name + primary value proposition**  
  *Severity: HIGH | Who: Content*
- `[ ]` **Blog post titles include the target keyword naturally** — not stuffed, reads like a real title  
  *Severity: HIGH | Who: Content*

### Heading Structure
- `[ ]` **One `<h1>` per page** — not zero, not two  
  *Severity: HIGH | Who: Engineering / Content*
- `[ ]` **H1 includes the primary keyword** — or a close variation  
  *Severity: HIGH | Who: Content*
- `[ ]` **Headings follow logical hierarchy** — H1 → H2 → H3, never skipping levels  
  *Severity: LOW | Who: Content*

### URL Structure
- `[ ]` **URLs are lowercase, hyphenated, descriptive** — `/how-to-build-crm` not `/post?id=123`  
  *Severity: MEDIUM | Who: Engineering*
- `[ ]` **URLs include the primary keyword** — `/custom-crm-builder` ranks better than `/product-feature`  
  *Severity: HIGH | Who: Engineering / Content*
- `[ ]` **URLs are short** — under 5 words where possible  
  *Severity: LOW | Who: Engineering / Content*

### Internal Linking
- `[ ]` **Blog posts link to related posts** — minimum 2 internal links per post  
  *Severity: MEDIUM | Who: Content*
- `[ ]` **Homepage links to most important content** — case studies, essays, product pages  
  *Severity: HIGH | Who: Engineering*
- `[ ]` **Anchor text is descriptive** — "read our CRM guide" not "click here"  
  *Severity: MEDIUM | Who: Content*

---

## 3. Structured Data (JSON-LD)

- `[ ]` **Organization schema on homepage**  
  *Severity: MEDIUM | Who: Engineering*
- `[ ]` **Article schema on all blog posts** — includes `datePublished`, `dateModified`, `author`, `image`  
  *Severity: MEDIUM | Who: Engineering*
- `[ ]` **FAQ schema on FAQ pages** — enables FAQ rich snippet in Google  
  *Severity: MEDIUM | Who: Engineering*
- `[ ]` **BreadcrumbList schema on content pages**  
  *Severity: LOW | Who: Engineering*
- `[ ]` **SoftwareApplication schema on product/pricing pages**  
  *Severity: LOW | Who: Engineering*

> See `06-json-ld-schemas.md` for copy-paste templates for all of these.

---

## 4. Open Graph & Social Meta Tags

- `[ ]` **Every page has `og:title`, `og:description`, `og:image`, `og:url`**  
  *Severity: MEDIUM | Who: Engineering*
- `[ ]` **OG image is 1200×630px PNG** — this exact size displays correctly everywhere  
  *Severity: MEDIUM | Who: Design*
- `[ ]` **OG image actually exists** — missing image file causes broken preview on social  
  *Severity: HIGH | Who: Design*
- `[ ]` **Twitter card tags present** — `twitter:card`, `twitter:title`, `twitter:image`  
  *Severity: LOW | Who: Engineering*

---

## 5. Core Web Vitals

> Google uses real-world CrUX data for ranking, NOT Lighthouse synthetic scores. A 0.8s Lighthouse score can still fail with a 4.5s CrUX score.

- `[ ]` **LCP (Largest Contentful Paint) under 2.5s on mobile (real-world)**  
  *Severity: HIGH — active ranking penalty if failing | Who: Engineering*
- `[ ]` **LCP under 2.5s on desktop (real-world)**  
  *Severity: HIGH | Who: Engineering*
- `[ ]` **CLS (Cumulative Layout Shift) under 0.1**  
  *Severity: HIGH | Who: Engineering*
- `[ ]` **INP (Interaction to Next Paint) under 200ms**  
  *Severity: HIGH | Who: Engineering*

> How to check real-world scores: PageSpeed Insights (pagespeed.web.dev) → uses CrUX field data.  
> Lighthouse in Chrome DevTools = synthetic only. Don't use it to verify Core Web Vitals status.

> See `05-core-web-vitals.md` for specific fix strategies.

---

## 6. Mobile & Performance

- `[ ]` **Site is fully usable on mobile** — no horizontal scroll, no overlapping elements  
  *Severity: HIGH | Who: Engineering*
- `[ ]` **Font loads don't cause layout shift** — use `font-display: swap` or preload  
  *Severity: MEDIUM | Who: Engineering*
- `[ ]` **Images have explicit `width` and `height`** — prevents layout shift as images load  
  *Severity: MEDIUM | Who: Engineering*
- `[ ]` **No render-blocking resources** — CSS inlined for critical path, JS deferred  
  *Severity: MEDIUM | Who: Engineering*
- `[ ]` **Hero images preloaded** — `fetchPriority="high"` on LCP image element  
  *Severity: HIGH | Who: Engineering*

---

## 7. Search Engine Verification

- `[ ]` **Google Search Console verified** — DNS method, HTML file, or meta tag  
  *Severity: HIGH | Who: Engineering / Manual*
- `[ ]` **Bing Webmaster Tools verified** — ~5% US search share, takes 10 minutes  
  *Severity: LOW | Who: Engineering / Manual*
- `[ ]` **Google Analytics or equivalent installed**  
  *Severity: HIGH | Who: Engineering*

---

## Priority Order (Do This Sequence)

**Day 1 (can be done in hours):**
1. Verify GSC and submit sitemap
2. Fix any 404s with 301 redirects in code
3. Fix sitemap `lastModified` bug if present
4. Submit old subdomain removal in GSC if applicable

**Week 1:**
5. Ensure all pages have unique titles and meta descriptions
6. Add JSON-LD structured data to all pages
7. Verify OG images exist and are correct size
8. Check robots.txt is correct

**Sprint (needs engineering focus):**
9. Fix Core Web Vitals — especially mobile LCP
10. Audit and fix all canonical tags
11. Add internal linking between content pages
