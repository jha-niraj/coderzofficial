# Landing Page Section Patterns

## Section Anatomy

Every marketing section follows this structure:
```tsx
<section className="relative z-10 [bg-class] py-24 md:py-32 [border-top]">
    <div className="mx-auto max-w-7xl px-6 md:px-8">
        {/* Section header */}
        <ScrollReveal className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-6 font-display text-4xl text-neutral-900 md:text-5xl dark:text-white">
                Section title.
            </h2>
            <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                Supporting description.
            </p>
        </ScrollReveal>

        {/* Content grid */}
        <ScrollRevealStagger className="grid grid-cols-1 gap-8 md:grid-cols-3" stagger={0.1}>
            {items.map((item, idx) => (
                <ScrollRevealItem key={idx}>
                    {/* Card content */}
                </ScrollRevealItem>
            ))}
        </ScrollRevealStagger>
    </div>
</section>
```

---

## Section Visual Alternation

Sections alternate backgrounds to create visual rhythm:
```
Hero            → dark (video overlay, bg-neutral-950)
Features        → bg-white dark:bg-neutral-950
Pricing         → bg-white dark:bg-neutral-950, border-t
Testimonials    → bg-neutral-50 dark:bg-neutral-900, border-t
Footer          → bg-white dark:bg-neutral-950, border-t
```

Border top between sections:
```tsx
"border-t border-neutral-200 dark:border-white/5"
```

---

## Feature / Value Prop Card

```tsx
<div className="group flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-8
                transition-colors hover:bg-neutral-100
                dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]">
    {/* Icon circle */}
    <div className="w-12 h-12 rounded-full border border-neutral-200 dark:border-white/10
                    flex items-center justify-center
                    bg-white dark:bg-white/10
                    group-hover:bg-neutral-100 dark:group-hover:bg-white/20 transition-colors">
        <Icon className="w-5 h-5 text-neutral-700 dark:text-white/80" />
    </div>

    {/* Text */}
    <div>
        <h3 className="text-xl text-neutral-900 dark:text-white font-medium mb-3">{title}</h3>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">{desc}</p>
    </div>
</div>
```

Grid: `grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 md:gap-8`

---

## Pricing Card

```tsx
<div className={`relative rounded-2xl border p-8 ${
    plan.popular
        ? "z-10 scale-105 border-neutral-300 bg-neutral-50 dark:border-white/30 dark:bg-white/10"
        : "border-neutral-200 bg-white dark:border-white/5 dark:bg-neutral-900"
}`}>
    {/* "Most Selected" badge */}
    {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2
                        bg-neutral-900 dark:bg-white text-white dark:text-black
                        text-[10px] font-bold uppercase tracking-widest
                        px-3 py-1 rounded-full">
            Most Selected
        </div>
    )}

    {/* Plan icon */}
    <plan.icon className="w-6 h-6 mb-4 text-neutral-600 dark:text-white/50" />

    {/* Plan meta */}
    <h3 className="text-xl font-medium text-neutral-900 dark:text-white mb-2">{name}</h3>
    <p className="text-sm text-neutral-500 dark:text-white/50">{desc}</p>

    {/* Price */}
    <div className="mb-8">
        <span className="text-4xl font-display text-neutral-900 dark:text-white">NPR {price}</span>
        <span className="text-neutral-500 dark:text-white/40 text-sm"> / mo</span>
        <p className="text-xs text-neutral-400 dark:text-white/30 mt-1">+ NPR {setup} onboarding</p>
    </div>

    {/* Highlight badge */}
    {highlight && (
        <div className="mb-4 inline-flex items-center rounded-full
                        bg-orange-50 dark:bg-orange-500/10
                        px-3 py-1 text-[11px] font-semibold text-orange-600 dark:text-orange-400">
            {highlight}
        </div>
    )}

    {/* Feature list */}
    <ul className="space-y-4 mb-8">
        {features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-neutral-700 dark:text-white/70">
                <Check className="w-4 h-4 text-neutral-500 dark:text-white/40 shrink-0" />
                <span>{f}</span>
            </li>
        ))}
    </ul>

    {/* CTA */}
    <Link href={`/pricing#${name.toLowerCase()}`}
        className={`flex w-full items-center justify-center gap-2 py-3 rounded-full text-sm font-medium
            ${plan.popular
                ? "bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90"
                : "bg-neutral-100 dark:bg-white/5 text-neutral-900 dark:text-white border border-neutral-200 dark:border-white/10 hover:bg-neutral-200 dark:hover:bg-white/10"
            }`}>
        Select Plan
        <ArrowRight className="w-3.5 h-3.5" />
    </Link>
</div>
```

Popular card: `scale-105` — visually pops above its siblings.

---

## Testimonial Carousel

```tsx
<section className="relative z-10 border-t border-neutral-200 bg-neutral-50 py-24 dark:border-neutral-800 dark:bg-neutral-900">
    <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:gap-24">
        {/* Left: section label + heading + dot indicators */}
        <div className="space-y-6">
            <div className="inline-flex items-center rounded-full bg-neutral-900/10 px-3 py-1 text-sm font-medium text-neutral-800 dark:bg-white/10 dark:text-white">
                <Star className="mr-1 h-3.5 w-3.5 fill-current" />
                Trusted by institutions
            </div>
            <h2 className="text-3xl font-bold tracking-tighter text-neutral-900 dark:text-white sm:text-4xl md:text-5xl">
                Voices of quiet rebels.
            </h2>
            {/* Dot indicators */}
            <div className="flex items-center gap-3 pt-4">
                {reviews.map((_, index) => (
                    <button key={index} onClick={() => setActiveIndex(index)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                            activeIndex === index
                                ? "w-10 bg-neutral-900 dark:bg-white"
                                : "w-2.5 bg-neutral-500/30 dark:bg-white/30"
                        }`} />
                ))}
            </div>
        </div>

        {/* Right: animated testimonial card stack */}
        <div className="relative min-h-[340px] md:min-h-[420px]">
            {reviews.map((review, index) => (
                <motion.div key={review.id} className="absolute inset-0"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{
                        opacity: activeIndex === index ? 1 : 0,
                        x: activeIndex === index ? 0 : 100,
                        scale: activeIndex === index ? 1 : 0.95,
                    }}
                    style={{ zIndex: activeIndex === index ? 10 : 0 }}>
                    <div className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-8 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                        {/* Stars */}
                        {/* Quote text with large quote icon bg */}
                        {/* Separator */}
                        {/* Author row: Avatar + name + role */}
                    </div>
                </motion.div>
            ))}
            {/* Decorative corner squares */}
            <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-xl bg-neutral-900/5 dark:bg-white/5" />
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-xl bg-neutral-900/5 dark:bg-white/5" />
        </div>
    </div>
</section>
```

Auto-advances every 6000ms with a horizontal slide + scale transition.

---

## FAQ Section Pattern

Typically uses `<Accordion>` from shadcn/ui with a left-aligned text column and right-aligned questions column (or single-column stack).

Section header same pattern: `font-display text-4xl md:text-5xl` headline centered above.

---

## CTA Banner Section

```tsx
<section className="relative bg-neutral-900 dark:bg-white py-20 md:py-28">
    <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-4xl font-bold text-white dark:text-neutral-900 md:text-5xl">
            Ready to transform your school?
        </h2>
        <p className="mt-6 text-lg text-white/70 dark:text-neutral-600">
            Supporting copy here.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/signup"
                className="rounded-full bg-white dark:bg-neutral-900 px-8 py-4 text-sm font-semibold
                           text-neutral-900 dark:text-white shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                Get Started Free
            </Link>
        </div>
    </div>
</section>
```

---

## ScrollReveal Utility

```tsx
// Wraps sections/items for scroll-triggered entrance animation
import { ScrollReveal, ScrollRevealItem, ScrollRevealStagger } from "@repo/ui/components/scroll-reveal"

// ScrollReveal — fades in when entering viewport
<ScrollReveal className="...">
    <h2>...</h2>
</ScrollReveal>

// ScrollRevealStagger — staggers children
<ScrollRevealStagger stagger={0.1} className="grid ...">
    {items.map(item => (
        <ScrollRevealItem key={item.id}>...</ScrollRevealItem>
    ))}
</ScrollRevealStagger>
```

The `scrollRevealEase` constant from `@repo/ui/components/scroll-reveal` is a custom cubic-bezier easing.
