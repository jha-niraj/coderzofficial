# Blog System Setup — MDX in Next.js App Router

> This documents the exact pattern used on getcreatr.com.
> Copy this pattern to set up a production-quality blog in any Next.js project.

---

## Overview

The getcreatr blog system has four principles:
1. **Metadata lives in TypeScript, not MDX frontmatter** — centralized, type-safe, tree-shakeable
2. **MDX files are pure content** — components imported at top, no YAML, no special syntax
3. **Routing is automatic** — add a key to the metadata object, the URL exists
4. **SEO is automatic** — title, description, og:image, JSON-LD all generated from metadata

---

## File Structure

```
src/
├── content/
│   ├── sections.ts          ← metadata for all essays + case studies
│   ├── vs.ts                ← metadata for comparison pages
│   ├── authors.ts           ← author profiles
│   ├── your-post-slug.mdx   ← content file
│   └── vs/
│       └── competitor.mdx   ← VS comparison content
├── app/
│   ├── [section]/
│   │   └── page.tsx         ← dynamic route for essays/case studies
│   └── vs/
│       └── [tool]/
│           └── page.tsx     ← dynamic route for VS pages
└── components/
    └── case-study/
        ├── essay-body.tsx   ← wrapper for essay content
        ├── essay-hero.tsx   ← optional hero section
        └── author-byline.tsx← author credit footer
```

---

## Step 1: Define the Metadata Schema

Create `src/content/sections.ts`:

```typescript
import type { AuthorKey } from './authors'

export type SectionMeta = {
  title: string           // Short title for listings
  pageTitle: string       // Full SEO title (browser tab, OG)
  description: string     // Meta description (~155 chars)
  ogImage: string         // Path to OG image e.g. '/og/post-slug.png'
  author?: AuthorKey      // Optional — maps to authors.ts
  datePublished: string   // ISO date: '2026-05-12'
  dateModified: string    // ISO date: '2026-05-12'
  keywords?: readonly string[]  // SEO keywords array
  // For case studies only:
  about?: { name: string; description: string }
  mentions?: readonly string[]
}

export const ESSAYS: Record<string, SectionMeta> = {
  'your-post-slug': {
    title: 'Short display title',
    pageTitle: 'Full SEO Title Including Keyword — Brand Name',
    description: 'Meta description, ~155 characters, includes keyword, has a reason to click.',
    ogImage: '/og/your-post-slug.png',
    author: 'your-author-key',
    datePublished: '2026-05-12',
    dateModified: '2026-05-12',
    keywords: ['primary keyword', 'secondary keyword', 'long tail keyword'],
  },
}

export const CASE_STUDIES: Record<string, SectionMeta> = {
  'client-name': {
    title: 'Client Name',
    pageTitle: 'Client Name: what got built and why it mattered',
    description: 'Specific description of the project and outcome.',
    ogImage: '/og/client-name.png',
    author: 'your-author-key',
    datePublished: '2026-05-12',
    dateModified: '2026-05-12',
    about: {
      name: 'Client Name',
      description: 'One line about the client company.',
    },
    mentions: ['Stripe', 'Supabase'],  // APIs/tools used
  },
}

export const SECTIONS = [
  ...Object.keys(ESSAYS),
  ...Object.keys(CASE_STUDIES),
] as const

export type SectionSlug = (typeof SECTIONS)[number]
```

---

## Step 2: Define Authors

Create `src/content/authors.ts`:

```typescript
export type Author = {
  name: string
  role: string
  email: string
  bio: string
  sameAs: string[]  // LinkedIn, Twitter, GitHub
}

export type AuthorKey = 'founder' | 'cofounder'  // your actual keys

export const AUTHORS: Record<AuthorKey, Author> = {
  founder: {
    name: 'Your Name',
    role: 'Founder, YourCompany',
    email: 'you@company.com',
    bio: 'One sentence bio.',
    sameAs: ['https://linkedin.com/in/yourprofile', 'https://x.com/yourhandle'],
  },
}
```

---

## Step 3: Build the Dynamic Route

Create `src/app/[section]/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ESSAYS, CASE_STUDIES } from '@/content/sections'
import { AUTHORS } from '@/content/authors'
import { SITE_URL } from '@/lib/site'

// Tell Next.js what pages to pre-render at build time
export function generateStaticParams() {
  return [
    ...Object.keys(ESSAYS).map((section) => ({ section })),
    ...Object.keys(CASE_STUDIES).map((section) => ({ section })),
  ]
}

// Generate SEO metadata for each page
export async function generateMetadata(
  { params }: { params: Promise<{ section: string }> }
): Promise<Metadata> {
  const { section } = await params
  const meta = ESSAYS[section] ?? CASE_STUDIES[section]
  if (!meta) return {}

  return {
    title: meta.pageTitle,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.pageTitle,
      description: meta.description,
      url: `${SITE_URL}/${section}`,
      images: [{ url: meta.ogImage, width: 1200, height: 630 }],
      type: 'article',
      publishedTime: meta.datePublished,
      modifiedTime: meta.dateModified,
    },
    alternates: {
      canonical: `${SITE_URL}/${section}`,
    },
  }
}

export default async function SectionPage(
  { params }: { params: Promise<{ section: string }> }
) {
  const { section } = await params

  // Determine which type this is
  let meta, kind
  if (section in CASE_STUDIES) {
    meta = CASE_STUDIES[section as keyof typeof CASE_STUDIES]
    kind = 'case-study'
  } else if (section in ESSAYS) {
    meta = ESSAYS[section as keyof typeof ESSAYS]
    kind = 'essay'
  } else {
    notFound()
  }

  // Dynamically import the MDX file
  const { default: Content } = await import(`@/content/${section}.mdx`)
    .catch(() => notFound())

  // Add JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.pageTitle,
    description: meta.description,
    datePublished: meta.datePublished,
    dateModified: meta.dateModified,
    image: `${SITE_URL}${meta.ogImage}`,
    author: meta.author ? {
      '@type': 'Person',
      name: AUTHORS[meta.author as keyof typeof AUTHORS]?.name,
    } : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Content />
    </>
  )
}
```

---

## Step 4: Install and Configure MDX

Install dependencies:

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react
```

Add to `next.config.ts`:

```typescript
import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
}

export default withMDX(nextConfig)
```

---

## Step 5: Create MDX Components

Create `src/mdx-components.tsx`:

```typescript
import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'

// Custom image components with WebP auto-conversion
function toWebp(src: string): string {
  return src.replace(/\.(png|jpe?g)$/i, '.webp')
}

export function HeaderImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-full my-8 rounded-xl overflow-hidden">
      <img
        src={toWebp(src)}
        alt={alt}
        className="w-full h-auto"
        loading="eager"
      />
    </div>
  )
}

export function InlineImage({
  src,
  alt,
  caption,
  aspectRatio = '16/9',
}: {
  src: string
  alt: string
  caption?: string
  aspectRatio?: string
}) {
  return (
    <figure className="my-8">
      <img
        src={toWebp(src)}
        alt={alt}
        className="w-full rounded-lg"
        style={{ aspectRatio }}
        loading="lazy"
      />
      {caption && (
        <figcaption className="text-sm text-gray-500 mt-2 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="text-base leading-relaxed mb-4 text-gray-700">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-6">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    HeaderImage,
    InlineImage,
    ...components,
  }
}
```

---

## Step 6: Create Layout Components

### EssayBody Component

`src/components/case-study/essay-body.tsx`:

```typescript
export default function EssayBody({ children }: { children: React.ReactNode }) {
  return (
    <article className="max-w-2xl mx-auto px-4 py-16">
      <div className="prose prose-gray max-w-none">
        {children}
      </div>
    </article>
  )
}
```

### AuthorByline Component

`src/components/case-study/author-byline.tsx`:

```typescript
import { AUTHORS, type AuthorKey } from '@/content/authors'

interface AuthorBylineProps {
  authorKey: AuthorKey
  dateModified: string
  bare?: boolean  // bare = no surrounding box, just inline text
}

export default function AuthorByline({ authorKey, dateModified, bare }: AuthorBylineProps) {
  const author = AUTHORS[authorKey]
  if (!author) return null

  const formattedDate = new Date(dateModified).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (bare) {
    return (
      <p className="text-sm text-gray-500 mt-8">
        By {author.name} · {formattedDate}
      </p>
    )
  }

  return (
    <div className="border-t border-gray-200 pt-8 mt-8">
      <p className="font-semibold">{author.name}</p>
      <p className="text-sm text-gray-500">{author.role}</p>
      <p className="text-sm text-gray-600 mt-2">{author.bio}</p>
      <p className="text-xs text-gray-400 mt-1">Updated {formattedDate}</p>
    </div>
  )
}
```

---

## Step 7: Write MDX Content Files

Every MDX post follows this structure:

```mdx
import EssayBody from '@/components/case-study/essay-body';
import AuthorByline from '@/components/case-study/author-byline';
import { HeaderImage, InlineImage } from '@/mdx-components';

<EssayBody>
# Your Post Title Here

Opening paragraph. No preamble. Start with something concrete.

<HeaderImage
  src="/your-hero-image.jpg"
  alt="Descriptive alt text for the image"
/>

First section of content. Short paragraphs. Real examples.

---

## Section Two

Content continues...

> Blockquote for the most important single insight in this section.

<InlineImage
  src="/inline-image.jpg"
  alt="Description"
  caption="Caption text shown below image"
  aspectRatio="16/9"
/>

---

## Closing Section

Practical takeaway. What should the reader do now?

---

<AuthorByline authorKey="founder" dateModified="2026-05-12" bare />

</EssayBody>
```

---

## Step 8: Wire Up the Sitemap

See `04-sitemap-setup.md` for the full sitemap code.

The sitemap reads from `sections.ts` automatically — every key you add appears in the sitemap on next deploy. No manual updates ever.

---

## OG Image Requirement

Every post needs an OG image at `public/og/your-post-slug.png`.
- **Size:** exactly 1200×630px
- **Format:** PNG
- **If missing:** the page works but social share previews break

---

## Publishing Checklist for Every New Post

```
[ ] MDX file created at src/content/your-slug.mdx
[ ] Metadata entry added to ESSAYS in sections.ts
[ ] OG image created at public/og/your-slug.png (1200×630px)
[ ] npm run build — no errors
[ ] npm run deploy
[ ] GSC → URL Inspection → Request Indexing
```

---

## Voice and Writing Style Notes

The getcreatr essays follow a specific voice. Key rules:

1. **No AI openers** — never "In today's world", "In this article we'll explore", "Here's why this matters"
2. **Start concrete** — open with a scenario, a stat, a specific example, or a contradiction
3. **Short paragraphs** — 2–4 sentences. One idea per paragraph.
4. **Second person** — "you" throughout, not "founders" or "users"
5. **Real specificity** — "$2,000+", "session 20", "8% open rate" not "some cost" or "most users"
6. **Blockquote = the one thing** — one blockquote per section maximum, for the most important insight
7. **`---` for major breaks** — not every section needs an H2 header; some transitions just need a `---`

See `09-blog-writing-guide.md` for the full writing system.
