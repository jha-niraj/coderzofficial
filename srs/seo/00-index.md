# SEO Knowledge Base — Index

> Built from a live SEO audit and implementation session on getcreatr.com (May 2026).
> Every file here is actionable. Read it, apply it, don't start from scratch again.

---

## What's In This Folder

| File | What It Covers |
|---|---|
| `01-technical-seo-checklist.md` | The full technical SEO checklist — what to fix first, what matters most |
| `02-blog-mdx-setup.md` | How to build an MDX blog system in Next.js App Router from scratch |
| `03-google-search-console.md` | GSC setup, what every report means, what actions to take |
| `04-sitemap-setup.md` | Dynamic sitemap in Next.js — code, patterns, common bugs |
| `05-core-web-vitals.md` | LCP, CLS, INP — what they are, why they matter, how to fix each |
| `06-json-ld-schemas.md` | Structured data schemas for Google — copy-paste templates |
| `07-content-strategy.md` | How to build a content ecosystem that ranks — clusters, cadence, EEAT |
| `08-keyword-research-process.md` | Step-by-step keyword research without paid tools |
| `09-blog-writing-guide.md` | How to write blog posts that actually rank — structure, voice, proof |
| `10-image-seo.md` | OG images, WebP conversion, alt text, Cloudflare Workers image gotchas |
| `11-cloudflare-workers-seo.md` | Next.js on Cloudflare Workers — specific SEO gotchas and fixes |

---

## The Three Layers of SEO (Read This First)

SEO is not one thing. It is three layers that must be built in order. Skipping a layer means the layer above doesn't hold.

```
Layer 3: Authority          ← Backlinks, citations, brand mentions (Month 3+)
Layer 2: Content Ecosystem  ← Blog posts targeting real buyer searches (Month 1–3)
Layer 1: Technical Health   ← Fast site, clean indexing, correct signals (NOW)
```

**Start with Layer 1 every time.** A slow site with great content still ranks poorly. A fast site with no content gets no traffic. Authority comes naturally once the first two are solid.

---

## The Honest Timeline

```
Month 1:  Google indexes new posts. No visible ranking change yet.
Month 2:  First non-branded impressions appear in GSC.
Month 3:  First non-branded clicks. Early keyword positions visible.
Month 6:  Meaningful non-branded traffic if publishing was consistent.
Month 12: SEO becomes a reliable inbound channel.
```

There is no shortcut. Ads produce leads faster but stop when you stop paying. SEO compounds — a post written in month 1 keeps ranking in month 12.

---

## Quick Start for a New Project

1. Read `01-technical-seo-checklist.md` — work through Layer 1 items
2. Set up GSC using `03-google-search-console.md`
3. Build the blog system using `02-blog-mdx-setup.md`
4. Plan first 10 posts using `07-content-strategy.md` + `08-keyword-research-process.md`
5. Write posts using `09-blog-writing-guide.md`
6. Fix Core Web Vitals using `05-core-web-vitals.md`

---

## Key Decisions That Block Everything Else

These are the three decisions that, if not made early, slow everything down:

**1. Content ownership** — Who writes the posts? Founder voice is critical for EEAT. Google rewards genuine expertise. If the founder writes the first 8 posts, the voice is established. After that, a briefed writer can maintain it.

**2. Keyword tool budget** — Ahrefs or Semrush at ~$100–130/month. Without this, keyword research is manual and slow. With it, you see exact volumes, difficulty scores, and what competitors rank for. Worth it immediately once even one post ranks.

**3. Core Web Vitals priority** — Mobile LCP must be under 2.5s. If it's not, you have a ranking penalty active right now. This needs engineering time, not a content sprint.
