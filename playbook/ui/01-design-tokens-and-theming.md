# Design Tokens & Theming

## Stack
- **Tailwind CSS v4** — utility-first, no custom config file needed (config is in CSS)
- **shadcn/ui** — component library living in `packages/ui`
- **`cn()` utility** — `clsx` + `tailwind-merge`, imported from `@repo/ui/lib/utils`
- **Dark mode** — class-based (`dark:` prefix). Provider wraps the entire app.

---

## Color Palette

### Neutrals (primary surface & text)
| Token | Light | Dark | Usage |
|---|---|---|---|
| `bg-white` | #fff | — | Main content panels |
| `bg-neutral-50` | #fafafa | — | Subtle backgrounds, form inputs |
| `bg-neutral-100` | #f5f5f5 | — | App shell background |
| `bg-neutral-200` | #e5e5e5 | — | Borders in light mode |
| `bg-neutral-900` | #171717 | — | Primary CTA buttons, sidebar active |
| `bg-neutral-950` | #0a0a0a | — | Dark app shell bg |
| `dark:bg-neutral-900` | — | #171717 | Dark panels |
| `dark:bg-neutral-950` | — | #0a0a0a | Dark content area |
| `dark:border-neutral-800` | — | border | Dark borders |

### Brand Orange (accent / CTA)
| Token | Usage |
|---|---|
| `text-orange-400` | Eyebrow text, secondary labels |
| `text-orange-500` | Primary links, active focus rings |
| `bg-orange-500` | Primary submit buttons |
| `hover:bg-orange-600` | Button hover |
| `bg-orange-50` | Light badge / highlight tints |
| `dark:bg-orange-950/20` | Dark badge tint |

### Semantic colors
| Color | Usage |
|---|---|
| `text-red-600 / dark:text-red-400` | Destructive actions (sign out, delete) |
| `bg-red-50 / dark:bg-red-950/30` | Error message backgrounds |
| `border-red-200 / dark:border-red-900/50` | Error borders |
| `bg-amber-50` | Warning / info callouts |
| `text-blue-600` | Teacher role icon backgrounds |
| `text-emerald-600` | Staff / success role icons |

---

## Typography

### Font choices
- **Display / headings**: `font-display` — system serif or custom (configured in root CSS)
- **Body**: system sans-serif (Tailwind default)
- **Mono accents**: `font-mono` — used for role labels, section dividers, tracking-widest text

### Scale patterns
```
text-[10px] font-mono uppercase tracking-widest   → section group labels in sidebar
text-xs                                           → captions, timestamps
text-sm                                           → body, table cells, form labels
text-base / text-lg                               → paragraph text in landing sections
text-xl / text-2xl                                → card titles, page sub-headings
text-3xl / text-[28px]                            → page-level H1
text-4xl / text-5xl                               → landing section H2
text-[52px] md:text-[84px]                        → hero headline
text-[16vw]                                       → footer watermark letterform
```

### Key typography rules
- **`tracking-tight`** on all headings inside the app shell
- **`tracking-[-2px]`** on hero headlines (tight optical spacing)
- **`tracking-widest` + `uppercase` + `font-mono`** on section labels and eyebrow badges
- **`leading-relaxed`** on paragraph text in marketing pages
- **`text-balance`** on hero H1 for multi-line balance
- **`font-bold`** for all user names in profile areas

---

## Spacing System

All spacing from Tailwind's default scale. Key conventions:
- Section padding inside marketing pages: `py-24 md:py-32`
- Max content width: `max-w-7xl mx-auto px-6 md:px-8`
- Inner app content: `max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8`
- Gap between cards: `gap-4` to `gap-8`
- Panel internal padding: `px-5 py-5`

---

## Border Radius
| Token | Usage |
|---|---|
| `rounded-lg` (8px) | Buttons, inputs, nav items |
| `rounded-xl` (12px) | Auth inputs, form buttons, small cards |
| `rounded-2xl` (16px) | Dashboard panels, stat cards, feature cards |
| `rounded-full` | CTA buttons on landing, avatar, social icons |
| `rounded-l-4xl` | Main content area left edge against sidebar |

---

## Shadows
| Token | Usage |
|---|---|
| `shadow-sm` | Feature cards, subtle panel lift |
| `shadow-lg` | Floating navbar, profile dropdown |
| `shadow-xl` | Main content panel, hero dashboard |
| `shadow-2xl shadow-black/70` | Hero dashboard image |

---

## Dark Mode Strategy
Every element has both a light and dark variant:
```tsx
// Pattern: light first, then dark:
"bg-white dark:bg-neutral-950"
"text-neutral-900 dark:text-white"
"border-neutral-200 dark:border-neutral-800"
"text-neutral-500 dark:text-neutral-400"
```

Dark mode is toggled via `ThemeToggle` from `@repo/ui/components/themetoggle`. The sidebar bottom bar houses the toggle in the desktop sidebar.

---

## Glassmorphism Pattern (landing page only)
Used on the floating navbar and hero badges:
```
bg-black/30 backdrop-blur-md border border-white/10
```
Transitions to solid on scroll:
```
bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-neutral-200/80
```
