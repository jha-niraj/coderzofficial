# Google Search Console — Setup, Reports & Actions

> GSC is the single most important free SEO tool. Everything about how Google sees your site lives here.
> This guide covers setup, what each report means, and exactly what actions to take.

---

## Initial Setup (Do This Day 1)

### Step 1: Add Your Property

1. Go to search.google.com/search-console
2. Click "Add Property"
3. Choose **"Domain"** type (not URL prefix) — covers all subdomains and both HTTP/HTTPS
4. Enter your domain: `yourdomain.com`

### Step 2: Verify Ownership

**Best method: DNS TXT record**
1. GSC gives you a TXT record like: `google-site-verification=AbCdEfGh123...`
2. Log into your DNS provider (Cloudflare, Namecheap, etc.)
3. Add a new TXT record for `@` (root domain) with that value
4. Click Verify in GSC — takes 1–5 minutes

**Alternative: HTML file**
1. Download the `googleXXXXXXX.html` file from GSC
2. Place it at `public/googleXXXXXXX.html` in your project
3. Deploy
4. Click Verify in GSC

**Alternative: Meta tag**
1. Copy the meta tag from GSC
2. Add to your root layout `<head>`
3. Deploy and verify

### Step 3: Submit Sitemap

1. GSC → Sitemaps (left sidebar)
2. Enter: `sitemap.xml`
3. Click Submit
4. Status should change to "Success" within a few hours

### Step 4: Link to Google Analytics

1. GSC Settings → Associations
2. Link to your GA4 property
3. This lets you see organic traffic data inside GA4

---

## The 5 Reports You Actually Need

### 1. Performance Report

**Location:** GSC → Search results

**What you see:**
- Total Clicks, Total Impressions, Average CTR, Average Position
- Breakdown by Query (what people searched), Page, Country, Device, Date

**What to look for:**
- **Branded vs non-branded split** — Filter queries, look for your brand name. If 90%+ of clicks are branded, you have near-zero organic discovery. That's a content problem, not a technical one.
- **High impressions, low CTR** — Page is ranking but nobody clicks. Fix the title tag and meta description.
- **Positions 8–15 for good keywords** — These can be pushed to page 1 with content improvements. Lower-hanging fruit than brand new keywords.
- **GSC Insight:** 3-month view shows trends. 16-month view shows seasonality.

**Actions to take:**
```
1. Export all queries to a spreadsheet
2. Filter for non-branded, position < 20
3. Sort by impressions descending
4. Top 10 = your quick-win targets for content improvement
```

### 2. Coverage / Indexing Report

**Location:** GSC → Indexing → Pages

**What you see:**
- Indexed pages
- Not indexed pages, organized by reason

**Status categories that matter:**

| Status | What It Means | Action |
|---|---|---|
| Indexed | Google has it | Good — monitor |
| Crawled — currently not indexed | Google saw it but decided not to index | Review content quality. If thin page, noindex it. If important, improve it. |
| Discovered — currently not indexed | Google knows it exists but hasn't crawled it | Submit sitemap, request indexing for important pages |
| Not found (404) | Page returns 404 | Fix with 301 redirect or restore the page |
| Redirect error | Redirect chain is broken | Fix the redirect |
| Blocked by robots.txt | Your robots.txt is blocking it | Intentional? If not, fix robots.txt |
| Duplicate without canonical | Same content on multiple URLs | Add canonical tag |
| Page with redirect | URL redirects to another | Expected if you intentionally redirect old URLs |

**Common trap:** "Crawled — currently not indexed" on important pages means Google thinks the content isn't good enough. The fix is improving the content quality, not technical changes.

### 3. Core Web Vitals Report

**Location:** GSC → Experience → Core Web Vitals

**What you see:**
- Good / Needs Improvement / Poor pages for mobile and desktop
- Based on real user data (CrUX), NOT Lighthouse

**The key insight:** 
> Lighthouse scores and CrUX scores are completely different. Lighthouse runs in a simulated environment. CrUX is real users on real devices on real networks. A 0.8s Lighthouse LCP can be a 4.5s CrUX LCP. Google ranks on CrUX, not Lighthouse.

**Actions to take:**
1. Click "Open Report" on mobile
2. Click "Poor URLs" to see which pages are failing
3. Click any failing URL → "Why pages are failing" → shows the specific metric (LCP, CLS, INP)
4. Fix that metric. See `05-core-web-vitals.md`.

### 4. Enhancements Report

**Location:** GSC → Enhancements

**What you see:**
- Breadcrumbs
- FAQ
- Sitelinks Searchbox
- Any rich result types your structured data enables

**Why it matters:** Correct JSON-LD structured data can unlock rich snippets — FAQ dropdowns, breadcrumbs, article dates — in search results. These improve CTR without improving ranking.

**Actions to take:**
1. Check for any warnings or errors
2. If "Breadcrumbs" shows errors, your breadcrumb schema is malformed
3. If "FAQ" shows errors, your FAQ schema is malformed
4. Fix schemas using `06-json-ld-schemas.md`

### 5. Links Report

**Location:** GSC → Links

**What you see:**
- External links (backlinks): which sites link to you, which pages they link to
- Internal links: which pages have the most internal links pointing to them

**Why it matters:** Internal links signal importance to Google. A page with 0 internal links pointing to it is effectively invisible. A page with 20 internal links is treated as high priority.

**Actions to take:**
1. Check internal links for your most important content (homepage, main product pages)
2. If they have few internal links, add links from blog posts
3. Check external links for patterns — which content earns natural links

---

## URL Inspection Tool

**Location:** Type any URL into the search bar at the top of GSC

**Use for:**
- Checking if a specific page is indexed
- Seeing Google's cached version of the page
- Requesting indexing for a new or updated page

**After publishing any new blog post:**
1. Go to GSC → paste the full URL
2. Click "Request Indexing"
3. Google crawls it within hours, not days

**After making significant updates to an existing post:**
1. Same process — request indexing again
2. GSC picks up the new `dateModified` and recrawls promptly

---

## URL Removals (For Old/Dead Content)

**Location:** GSC → Removals

**When to use:**
- Old subdomain (`docs.yourdomain.com`) that no longer exists
- Old pages that are 404ing and were crawled
- Content you want removed from Google urgently (not just noindexed)

**The right way to remove an old subdomain:**
1. GSC → Removals → New Request
2. Select "Remove all URLs with this prefix"
3. Enter: `https://docs.yourdomain.com/` (with trailing slash, with https://)
4. Submit

**Important:** Individual page removals expire after 6 months. Prefix removals are permanent for as long as the 404/gone state exists. Always use prefix for whole subdomains.

---

## What to Check Weekly (5-Minute Routine)

```
1. Performance → last 7 days vs previous 7 days — clicks going up or down?
2. Coverage → any new "Not found (404)" URLs appearing?
3. Core Web Vitals → any pages moved from "Good" to "Poor"?
4. Manual Actions → any penalties applied? (usually empty, important to know)
```

---

## What to Check Monthly (30-Minute Review)

```
1. Performance → top 20 non-branded queries by impressions
   - Any new keywords appearing? Opportunity to write more about that topic.
   - Any keywords dropping in position? Content needs updating.

2. Coverage → has the indexing count grown with new posts?
   - New posts should appear indexed within 2–4 weeks of publishing

3. Links → any new external sites linking to your content?
   - If a post earned links, double down on that topic

4. Enhancements → any new errors from schema changes?
```

---

## Common GSC Mistakes to Avoid

**Mistake 1: Submitting every page manually instead of using sitemap**
Submitting a sitemap tells Google about all pages at once and keeps it updated automatically. Manual submission is only needed for urgent cases (new post, major update).

**Mistake 2: Panicking about "Crawled — currently not indexed"**
This status just means Google crawled the page and decided the content isn't strong enough to include in search results. More common on thin pages, duplicate content, or low-quality pages. Fix the content, not the technical setup.

**Mistake 3: Using Lighthouse to check Core Web Vitals**
Lighthouse is synthetic. CrUX is real. They can be very different. Always use PageSpeed Insights (pagespeed.web.dev) which shows both — and always read the "Field Data" (CrUX), not just the "Lab Data" (Lighthouse).

**Mistake 4: Removing individual pages that expire**
URL removal requests expire after 6 months. For whole subdomains or folders, always use prefix removal. For permanent removal, also add a `noindex` meta tag to the page.

**Mistake 5: Ignoring the "Position" column**
A page at position 8–15 for a good keyword is on page 1 or just below it. A targeted content improvement (adding more depth, updating examples, improving the intro) can move it to positions 1–5 much faster than starting a brand new post.
