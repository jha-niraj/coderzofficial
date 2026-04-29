# Hero Section

## Concept
A full-height section with a looping video background, dark gradient overlay, staggered text animation, and a 3D-perspective dashboard screenshot that "reveals" on page load then flattens slightly on scroll.

---

## Section Structure

```tsx
<section className="relative flex min-h-screen flex-col overflow-hidden px-6">
    {/* 1. Video Background */}
    {/* 2. Hero Text Block */}
    {/* 3. Dashboard Preview Card */}
</section>
```

---

## 1. Video Background

```tsx
<div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
    <video autoPlay loop muted playsInline className="h-full w-full object-cover">
        <source src="[cloudfront-video-url]" type="video/mp4" />
    </video>
    {/* Two-stop gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-neutral-950" />
</div>
```

Key points:
- `pointer-events-none` — video never intercepts clicks
- `absolute inset-0` — fills entire section
- Gradient: dark at top (`from-black/45`), transitions to the page background (`to-neutral-950`) at bottom so the video "fades into" the next section

---

## 2. Hero Text Block

```tsx
<motion.div
    className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center pt-40 text-center"
    variants={container}
    initial="hidden"
    animate="show"
>
```

### Eyebrow Badge (rotating word)
```tsx
<motion.div variants={item}
    className="mb-8 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm">
    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
    <span className="text-xs font-medium text-white/55 uppercase tracking-widest">Manage</span>
    <span className="text-xs font-semibold text-orange-400 uppercase tracking-widest min-w-[90px]
                     transition-all duration-280"
          style={{ opacity: wordVis ? 1 : 0, filter: wordVis ? "blur(0)" : "blur(6px)" }}>
        {ROTATE_WORDS[wordIdx]}
    </span>
    <span className="text-xs font-medium text-white/55 uppercase tracking-widest">in one platform</span>
</motion.div>
```

Word rotation:
```tsx
const ROTATE_WORDS = ["attendance", "examinations", "fee billing", "timetables", "homework", "analytics"]
// Swaps every 2600ms with a blur-fade transition (280ms blur/unblur)
```

### Main Headline
```tsx
<motion.h1 variants={item}
    className="text-balance text-[52px] font-bold leading-[1.0] tracking-[-2px] text-white
               sm:text-[68px] md:text-[84px]">
    <span className="block">Where legacy meets</span>
    <span className="block text-white/40">the future of education.</span>
</motion.h1>
```

Second line uses `text-white/40` — dimmed/ghosted for visual contrast hierarchy.

### Subheading
```tsx
<motion.p variants={item}
    className="mt-7 max-w-xl text-base leading-relaxed text-white/50 sm:text-lg">
    The complete school management system for Nepal...
</motion.p>
```

### CTA Buttons
```tsx
<motion.div variants={item} className="mt-9 flex flex-wrap items-center justify-center gap-3">
    {/* Primary */}
    <Link href="/signup"
        className="group inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-white px-8 py-4
                   text-[15px] font-semibold text-neutral-900 shadow-lg shadow-black/20
                   transition-all duration-300 hover:bg-white/95 hover:shadow-xl hover:-translate-y-0.5">
        Get Started Free
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-900/10
                         transition-transform duration-300 group-hover:translate-x-0.5">
            <ChevronRight className="h-3.5 w-3.5" />
        </span>
    </Link>

    {/* Secondary */}
    <Link href="/signin"
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20
                   bg-white/10 px-8 py-4 text-[15px] font-medium text-white
                   backdrop-blur-sm transition-all duration-300 hover:bg-white/15">
        Sign In
    </Link>
</motion.div>
```

---

## 3. Dashboard Preview (3D Scroll Effect)

```tsx
// Scroll-based transforms
const { scrollY } = useScroll()
const rotateX  = useTransform(scrollY, [0, 600], [14, 0])   // tilts from 14° → flat
const imgScale = useTransform(scrollY, [0, 600], [0.95, 1]) // scales up slightly
const imgOp    = useTransform(scrollY, [0, 300], [0.8, 1])  // fades in

<motion.div
    initial={{ opacity: 0, y: 48 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1.1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
    className="relative z-10 mx-auto mt-10 w-full max-w-5xl px-4"
>
    <div style={{ perspective: "1400px" }}>
        <motion.div
            style={{ rotateX, scale: imgScale, opacity: imgOp, transformStyle: "preserve-3d" }}
            className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/70"
        >
            {/* Sheen overlay */}
            <div className="pointer-events-none absolute -inset-px z-10 rounded-2xl
                            bg-gradient-to-b from-white/8 to-transparent" />

            <Image src="/dashboard-preview.png" width={1440} height={900}
                   className="h-auto w-full object-cover" priority />

            {/* Bottom fade into background */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-48
                            bg-gradient-to-t from-neutral-950 to-transparent" />
        </motion.div>
    </div>
</motion.div>
```

---

## Stagger Animation Variants

```tsx
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.09, delayChildren: 0.1 }
    },
}
const item = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1, y: 0,
        transition: { duration: 0.65, ease: scrollRevealEase }
    },
}
```

Supports `useReducedMotion()` — skips animations when system preference is set.

---

## Responsive sizing
| Screen | H1 size |
|---|---|
| Default | `text-[52px]` |
| sm | `text-[68px]` |
| md | `text-[84px]` |
