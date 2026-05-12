# JSON-LD Structured Data Schemas

> Structured data helps Google understand your pages and enables rich snippets.
> Copy-paste templates for every schema type a SaaS/content site needs.

---

## What JSON-LD Is and Why It Matters

JSON-LD is a block of JSON you embed in your `<head>` that tells Google what your page is about in a structured, machine-readable way. It doesn't change how the page looks. It changes how Google understands and displays it.

**Benefits:**
- Rich snippets (FAQ dropdowns, article dates, breadcrumbs visible in search results)
- Better understanding → better matching to relevant queries
- Citations in AI answers (ChatGPT, Perplexity, Google AI Overviews pull from structured data)
- Sitelinks on branded searches

---

## How to Add JSON-LD in Next.js

```typescript
// In any page.tsx or layout.tsx
export default function Page() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    // ... schema fields
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* rest of page */}
    </>
  )
}
```

---

## Schema 1: Organization (Homepage)

Put this on the homepage. Tells Google about the company.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "YourCompany",
  "url": "https://yourdomain.com",
  "logo": "https://yourdomain.com/logo.png",
  "description": "One-sentence description of what the company does.",
  "email": "hello@yourdomain.com",
  "sameAs": [
    "https://twitter.com/yourhandle",
    "https://linkedin.com/company/yourcompany",
    "https://github.com/yourorg"
  ],
  "founder": [
    {
      "@type": "Person",
      "name": "Founder Name",
      "jobTitle": "Co-Founder & CEO",
      "url": "https://linkedin.com/in/foundername"
    }
  ],
  "foundingDate": "2025",
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": 10
  }
}
```

---

## Schema 2: SoftwareApplication (Product/Pricing Page)

For SaaS products. Can enable star ratings and price information in snippets.

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "YourProduct",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://yourdomain.com",
  "description": "What the software does in one clear sentence.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free trial available"
  },
  "featureList": [
    "Feature one",
    "Feature two",
    "Feature three"
  ],
  "screenshot": "https://yourdomain.com/og/product-screenshot.png"
}
```

---

## Schema 3: Article (Blog Posts)

Put on every blog post / essay. Helps Google understand the content type, author, and freshness.

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Full Post Title Here",
  "description": "Meta description — what the post is about.",
  "datePublished": "2026-05-12",
  "dateModified": "2026-05-12",
  "image": "https://yourdomain.com/og/post-slug.png",
  "url": "https://yourdomain.com/post-slug",
  "author": {
    "@type": "Person",
    "name": "Author Full Name",
    "url": "https://linkedin.com/in/authorname",
    "sameAs": [
      "https://linkedin.com/in/authorname",
      "https://twitter.com/authorhandle"
    ]
  },
  "publisher": {
    "@type": "Organization",
    "name": "YourCompany",
    "logo": {
      "@type": "ImageObject",
      "url": "https://yourdomain.com/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://yourdomain.com/post-slug"
  }
}
```

**In Next.js — generate dynamically from metadata:**

```typescript
function buildArticleSchema(meta: SectionMeta, slug: string, author?: Author) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.pageTitle,
    description: meta.description,
    datePublished: meta.datePublished,
    dateModified: meta.dateModified,
    image: `${SITE_URL}${meta.ogImage}`,
    url: `${SITE_URL}/${slug}`,
    author: author ? {
      '@type': 'Person',
      name: author.name,
      sameAs: author.sameAs,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'YourCompany',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  }
}
```

---

## Schema 4: FAQPage (FAQ Pages)

Enables FAQ rich snippet — answer dropdowns visible directly in search results. High CTR boost.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is YourProduct?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "YourProduct is a [what it does] that [benefit]. Unlike [alternative], it [differentiator]."
      }
    },
    {
      "@type": "Question",
      "name": "How much does YourProduct cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "YourProduct starts at $X/month. A free trial is available with no credit card required."
      }
    },
    {
      "@type": "Question",
      "name": "How long does it take to get started?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most users are up and running within [timeframe]. [Specific details about the onboarding process]."
      }
    }
  ]
}
```

**Guidelines for FAQ schema:**
- Each question must be a real question your users ask
- Answers must be factually accurate and match the visible page content
- Google will penalize if schema content doesn't match visible content
- Maximum 10 Q&As — Google shows up to 3 in snippets

---

## Schema 5: BreadcrumbList (Content Pages)

Enables breadcrumb navigation visible in search results (e.g., `YourSite > Blog > Post Title`).

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://yourdomain.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://yourdomain.com/blog"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Post Title",
      "item": "https://yourdomain.com/blog/post-slug"
    }
  ]
}
```

**In Next.js — generate dynamically:**

```typescript
function buildBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// Usage:
buildBreadcrumbSchema([
  { name: 'Home', url: 'https://yourdomain.com' },
  { name: 'Blog', url: 'https://yourdomain.com/blog' },
  { name: meta.title, url: `https://yourdomain.com/${slug}` },
])
```

---

## Schema 6: WebSite (Homepage — Enables Sitelinks Search)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "YourCompany",
  "url": "https://yourdomain.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://yourdomain.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

> Only add `potentialAction` if your site has actual search functionality. Otherwise omit it.

---

## How to Combine Multiple Schemas

You can put multiple schemas on one page using `@graph`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "YourCompany"
      // ... org fields
    },
    {
      "@type": "WebSite",
      "name": "YourCompany"
      // ... website fields
    }
  ]
}
```

Or just include multiple `<script type="application/ld+json">` tags — both approaches work.

---

## Testing Your Schemas

1. **Google Rich Results Test:** search.google.com/test/rich-results — paste your URL, see which rich results you're eligible for
2. **Schema.org Validator:** validator.schema.org — paste your JSON, check for errors
3. **GSC Enhancements Report:** after deploying, GSC shows warnings and errors for structured data

---

## Which Schemas to Implement First

| Priority | Schema | Where | Impact |
|---|---|---|---|
| 1 | Article | Every blog post | Author credibility, EEAT |
| 2 | Organization | Homepage | Brand understanding |
| 3 | FAQPage | FAQ page, pricing page | Rich snippet CTR boost |
| 4 | BreadcrumbList | All content pages | Navigation snippets |
| 5 | SoftwareApplication | Product page | Category signals |
| 6 | WebSite | Homepage | Sitelinks search |
