# Motion & Animation

## Library
`framer-motion` — used throughout for page transitions, reveal animations, accordion toggles, and interactive feedback.

---

## Core Principles
1. **Purposeful motion** — animations communicate hierarchy and state change, not decoration
2. **Subtle defaults** — y-offset: 24px, duration: ~0.6s, ease-out curve
3. **Reduced motion support** — always check `useReducedMotion()` on hero sections
4. **No layout shift** — use `AnimatePresence` for mounting/unmounting

---

## Stagger Container Pattern

```tsx
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.09,
            delayChildren: 0.1,
        },
    },
}

const item = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.65, ease: scrollRevealEase },
    },
}

// Usage
<motion.div variants={container} initial="hidden" animate="show">
    <motion.div variants={item}>First</motion.div>
    <motion.div variants={item}>Second</motion.div>
    <motion.div variants={item}>Third</motion.div>
</motion.div>
```

---

## Scroll-triggered Reveal

```tsx
import { ScrollReveal, ScrollRevealItem, ScrollRevealStagger } from "@repo/ui/components/scroll-reveal"

// Single element reveal on enter
<ScrollReveal>
    <h2>Section Title</h2>
</ScrollReveal>

// Staggered children reveal
<ScrollRevealStagger stagger={0.1} className="grid grid-cols-3 gap-8">
    {items.map(item => (
        <ScrollRevealItem key={item.id}>
            <Card>...</Card>
        </ScrollRevealItem>
    ))}
</ScrollRevealStagger>
```

---

## Scroll-parallax (Hero Dashboard 3D tilt)

```tsx
const { scrollY } = useScroll()
const rotateX  = useTransform(scrollY, [0, 600], [14, 0])   // tilts from 14° to flat
const imgScale = useTransform(scrollY, [0, 600], [0.95, 1]) // grows slightly
const imgOp    = useTransform(scrollY, [0, 300], [0.8, 1])  // fades in

<div style={{ perspective: "1400px" }}>
    <motion.div
        style={{ rotateX, scale: imgScale, opacity: imgOp, transformStyle: "preserve-3d" }}
        className="relative overflow-hidden rounded-2xl">
        <Image ... />
    </motion.div>
</div>
```

---

## Sidebar Sub-menu Expand/Collapse

```tsx
<AnimatePresence>
    {isExpanded && !isCollapsed && (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-4 space-y-1">
            {children}
        </motion.div>
    )}
</AnimatePresence>
```

---

## Page / Modal Entrance

```tsx
<motion.div
    initial={{ opacity: 0, scale: 0.9, y: 100 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: 100 }}
    transition={{ duration: 0.6, ease: 'easeOut', type: 'spring', stiffness: 100 }}>
    {/* Modal content */}
</motion.div>
```

---

## Testimonial Card Carousel

```tsx
// Cards are `absolute inset-0`, stacked — only the active one is visible
<motion.div
    animate={{
        opacity: activeIndex === index ? 1 : 0,
        x: activeIndex === index ? 0 : 100,      // slides from right to center
        scale: activeIndex === index ? 1 : 0.95,
    }}
    transition={{ duration: 0.5, ease: "easeInOut" }}
    style={{ zIndex: activeIndex === index ? 10 : 0 }}>
    <Card>...</Card>
</motion.div>
```

---

## Button Micro-interactions

```tsx
<motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="...">
    Try Again
</motion.button>
```

---

## Floating Icon Animation (offline state)

```tsx
<motion.div
    animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
    className="flex justify-center mb-6">
    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full
                    flex items-center justify-center">
        <WifiOff className="w-8 h-8 text-primary" />
    </div>
</motion.div>
```

---

## Hero content entrance (delayed fade-up)

```tsx
<motion.div
    initial={{ opacity: 0, y: 48 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1.1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}>
    {/* Dashboard preview */}
</motion.div>
```

Ease `[0.16, 1, 0.3, 1]` is an aggressive "snap-in" curve (fast deceleration at end).

---

## Word Rotation (blur fade)

```tsx
const [wordVis, setWordVis] = useState(true)

// On interval: fade out → change word → fade in
setWordVis(false)
setTimeout(() => { setWordIdx(i => (i + 1) % words.length); setWordVis(true) }, 280)

// Inline style approach (not motion)
<span style={{ opacity: wordVis ? 1 : 0, filter: wordVis ? "blur(0)" : "blur(6px)" }}
      className="transition-all duration-280">
    {words[wordIdx]}
</span>
```

---

## Transition Presets

| Use case | duration | ease |
|---|---|---|
| Sidebar expand/collapse | 0.3s | CSS transition-all |
| Sub-menu reveal | 0.2s | default |
| Hero stagger items | 0.65s | scrollRevealEase |
| Dashboard preview entrance | 1.1s | [0.16, 1, 0.3, 1] |
| Modal entrance | 0.6s | spring (stiffness 100) |
| Testimonial slide | 0.5s | easeInOut |
| Button hover | instant | whileHover |

---

## Reduced Motion

```tsx
const reduced = useReducedMotion()

<motion.div
    {...(reduced
        ? { initial: false }  // skip animation entirely
        : { variants: container, initial: "hidden", animate: "show" }
    )}>
```
