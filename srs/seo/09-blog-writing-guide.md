# Blog Writing Guide — How to Write Posts That Rank and Convert

> This is not a generic "write quality content" guide. It documents the specific voice,
> structure, and techniques used on getcreatr.com — ready to apply to any project.

---

## The One Rule That Overrides Everything

Write for the person who is searching, not for Google.

When someone types "how to build a custom crm without code" into Google, they want a clear, specific answer from someone who has actually done it. Not an article that lists CRM features, explains what a CRM is, and then vaguely mentions "tools exist to help."

Google's algorithm has gotten extremely good at detecting whether content actually helps the person who searched or just contains the keywords. Write for the human. The ranking follows.

---

## Voice: The getcreatr Standard

The getcreatr essays follow a specific voice that has been deliberately developed. It sounds like a founder who has built things, seen things fail, and is telling you the honest version. Key characteristics:

**Concrete, not abstract**
- ❌ "AI builders can sometimes struggle with complex requirements"
- ✅ "Six sessions in, you're not building. You're undoing."

**Second person throughout**
- ❌ "Founders often find that their builds..."
- ✅ "You open an AI builder. Thirty seconds later, something appears."

**Short paragraphs, one idea each**
- Maximum 3–4 sentences per paragraph
- If you can break a paragraph in two, break it
- Short sentences mixed with occasional longer ones for rhythm

**Real specificity, not hedged vagueness**
- ❌ "many users" / "some founders" / "a significant percentage"
- ✅ "36 out of every 100 prompts" / "One developer burned $1,000+ on tokens" / "8% email open rate vs 70% WhatsApp"

**No AI tells** — these phrases must be deleted on sight:
- "In today's rapidly evolving landscape"
- "It's worth noting that"
- "In this article, we'll explore"
- "Let's dive in"
- "Here's why this matters" (as a bridge sentence)
- "Game-changing", "revolutionary", "cutting-edge"
- "In conclusion" / "To summarize" / "In summary"
- Any closing question added only to "engage" the reader

---

## Structure: The getcreatr Post Template

```
1. OPENER (no heading) — Start with a specific moment, quote, contradiction, or hard fact
   - NOT a definition of the topic
   - NOT "In this post we'll cover..."
   - NOT a question designed to make you feel understood
   
2. SECTION 1 — The thing everyone experiences (with a name)
   - Opens with a specific scenario, not a general statement
   - Uses a blockquote for the single most important data point
   
3. SECTION 2 — Why this is happening (the real diagnosis)
   - Goes deeper than the surface explanation
   - Includes the structural/technical reason, explained in plain English
   - Cites at least one external stat or source

4. SECTION 3 — Real proof (case study or example)
   - A specific client, a specific build, specific details
   - What was discovered, what it changed, what the outcome was
   - No bullet lists — narrative prose

5. SECTION 4 — The broader context (why every alternative has this problem too)
   - Fair to competitors — explains their product decision honestly
   - Not "they're bad" but "they made a tradeoff, here's what it costs you"

6. SECTION 5 — What doing it right looks like
   - Concrete and specific
   - Not "requirements are important" but "for a CRM, you answer these specific questions"

7. CLOSER — Practical and honest
   - What the reader should do now
   - One CTA to your product — natural, not forced
   - No "I hope this was helpful" / No summary of what you just said
```

---

## The Opening: Most Important Part of the Post

Google measures dwell time. If people bounce in the first 30 seconds, the post gets downranked. The opening has to earn the read.

**Three opening formulas that work:**

**Formula 1: The Competitor's Own Words**
```
[Competitor] published a post last year called "[their title]".
The flaw, by their own description: "[their quote]".
They weren't wrong about the symptom. But they described the wrong disease.
```

**Formula 2: The Specific Scenario**
```
Picture this. You [specific situation]. You know what you need: [specific thing].
So you [obvious action]. [Short result].
[Time later], you realize [the thing that went wrong].
```

**Formula 3: The Hard Stat or Contradiction**
```
[Surprising stat]. And yet [the contradiction most people believe].
[One-sentence explanation of why these two things are both true].
```

---

## Using Evidence and Stats

Every post should include at least 2–3 external data points. Rules for using them:

1. **Only cite real sources** — never make up numbers, never round dramatically
2. **Contextualize the number** — don't just drop a stat, explain what it means
3. **Prefer specific over general** — "36 out of 100 prompts" reads better than "36% of prompts"
4. **Link the source** — inline link to the original research
5. **Weave into narrative** — don't list stats at the end, embed them where they support the argument

**Good stat usage:**
```
One in three prompts is recovery, not progress. A separate study found that over 80% of 
rework in software projects traces back to requirements that weren't defined before 
building started. That number isn't new — it comes from decades of traditional software 
development research. What's new is that nobody's applied it to AI builders yet.
```

**Bad stat usage:**
```
According to research, 80% of rework traces to requirements issues. Additionally, 
36% of prompts are error prompts. Furthermore, only 30% of software projects succeed.
```

---

## Writing the Case Study / Proof Section

This is the section that separates your content from everything else that ranks. Most content says "here's how it works." Your content says "here's exactly how it worked for a real client."

**Structure for a case study within a blog post:**

1. Name the client (or describe them specifically enough to be real)
2. State the problem they came in with
3. Describe what the requirements process revealed — specific, concrete details
4. State the outcome with specific numbers or timeframes

**Example of doing it right:**
```
When a jewelry trade client came to Creatr, they came in knowing they needed a CRM. 
Everything else was a conversation. Here's what came out that wouldn't have come from 
a prompt box: pipeline stage and contact source were completely different concerns. 
One describes where a deal is sitting. The other describes how it got there — trade show, 
referral, cold outreach. Their sales director had been trying to answer one question for 
two years: which shows generate leads that close? With those two fields merged, that 
question was unanswerable. With them separated, it's a five-second filter.
```

**What makes this work:**
- Specific client type (jewelry wholesaler)
- Specific problem (couldn't answer which shows generated closing leads)
- Specific solution (separate fields for pipeline stage vs. lead source)
- Specific outcome (question answerable with a 5-second filter)

---

## Writing for AI Overviews and GEO (Generative Engine Optimization)

ChatGPT, Perplexity, and Google AI Overviews now answer questions directly. Getting cited by AI is valuable — it builds brand presence without requiring a click.

**What AI systems pull from your content:**
- Clear, structured answers to specific questions
- Numbered or bulleted lists (for "how to" queries)
- Comparison tables (for "X vs Y" queries)
- Strong, quotable single sentences

**Writing for AI citation:**

```markdown
## The 5 Questions to Answer Before You Build Anything With AI

Before writing a single prompt, answer these five questions:

1. **Who uses this?** List every user type and what they can do. Not "users" — specifically who.
2. **What are the core actions?** The 3–5 things the system absolutely must handle.
3. **Where does data live?** Shared across the whole business, or isolated per customer?
4. **What triggers automation?** A date, a status change, a manual click, an inbound message?
5. **What does "working" look like?** At the end of week one, what specifically is happening?
```

AI systems will extract and cite these kinds of structured answers for "questions to ask before building an app" queries.

---

## Internal Linking Strategy

Every post should have:
- **2 links to related posts** — linked with descriptive anchor text
- **1 link to a relevant product page** — naturally placed, not forced

**How to choose anchor text:**
- ❌ "click here" / "read more" / "learn more"
- ✅ "how requirements gathering works" / "the SalesCRM case study" / "DeepBuild's approach"

**Where to add internal links after publishing:**
When you publish post B, go back to post A (an existing, related post) and add a link from post A to post B. This distributes link equity from established pages to new ones.

---

## The Quality Checklist

Before publishing any post, run through this:

```
Content:
[ ] Primary keyword in H1 (naturally)
[ ] Primary keyword in first 100 words (naturally)
[ ] Primary keyword in meta description
[ ] At least 2 external stats with sources
[ ] At least 1 real example or case study
[ ] No AI tells (check the banned phrases list above)
[ ] Author byline with real name and role
[ ] At least 2 internal links

Technical:
[ ] OG image exists at /og/[slug].png (1200×630px)
[ ] Metadata entry added to sections.ts
[ ] datePublished and dateModified are correct
[ ] Slug is descriptive and includes keyword

After Publishing:
[ ] Request indexing in GSC
[ ] Share on 1–2 channels where your buyers hang out
[ ] Add internal links from 2 existing posts to this one
```

---

## How Long Should Posts Be?

**The answer: as long as the best-ranking post, plus 20%**

1. Google your target keyword
2. Open the top 3 results
3. Roughly estimate their word count (word count tool or browser extension)
4. Write to at least match the longest, plus add something they're missing

**Rough minimums by type:**
- Comparison post ("Lovable vs Bolt"): 2,000 words
- How-to guide ("How to build a CRM"): 2,200 words
- Opinion/analysis piece: 1,500 words
- Pillar page / comprehensive guide: 3,500 words

**But:** A 1,500-word post that's dense with real examples beats a 4,000-word post padded with filler. Length is a proxy for completeness, not a goal in itself.

---

## Updating Old Posts

After 6 months, go back to posts that are ranking 8–20 and improve them:

1. Add one new real example or case study
2. Update any stats that have newer versions
3. Add 2–3 new subsections if competitors have published more depth
4. Update the `dateModified` in sections.ts
5. Request re-indexing in GSC

Posts that are refreshed and re-requested regularly maintain and improve their rankings. Posts that are published and never touched slowly drop.
