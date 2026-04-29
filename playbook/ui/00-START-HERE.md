# UI Playbook — Gurukul Design System

## What This Is
A complete design playbook extracted from the Gurukul school management platform — a Next.js 15 + Tailwind CSS 4 + shadcn/ui SaaS product. Use this to replicate the exact design language, layout patterns, and component conventions in any new project.

## How to Use
1. Read this file first to understand the scope
2. Read `01-design-tokens-and-theming.md` to set up colors, typography, and spacing
3. Read the specific files relevant to what you're building
4. All files contain real, working code extracts — copy and adapt them

---

## File Index

| # | File | What it covers |
|---|---|---|
| 01 | `01-design-tokens-and-theming.md` | Colors, typography, spacing, dark mode, border radius, shadows |
| 02 | `02-app-shell-and-layout-system.md` | Sidebar + content area layout, route groups, full-screen mode |
| 03 | `03-sidebar-navigation.md` | Collapsible sidebar, nav items, sections, profile dropdown, mobile Sheet |
| 04 | `04-landing-page-navbar.md` | Floating pill navbar, scroll-aware color transitions, mobile menu |
| 05 | `05-hero-section.md` | Full-screen video hero, rotating words, 3D dashboard preview, stagger animation |
| 06 | `06-landing-page-sections.md` | Feature cards, pricing cards, testimonial carousel, CTA banner, scroll reveal |
| 07 | `07-footer-design.md` | Multi-column footer, watermark wordmark, social icons, newsletter form |
| 08 | `08-authentication-pages.md` | Split-panel auth, video left panel, email/phone tabs, OTP flow |
| 09 | `09-dashboard-and-stats-panels.md` | Page headers, Panel components, stat cards, charts, activity feed |
| 10 | `10-form-design-patterns.md` | Form fields, inputs, selects, sheet forms, bulk import, validation |
| 11 | `11-data-tables-and-lists.md` | Tables, search bars, filters, pagination, card lists, empty table states |
| 12 | `12-motion-and-animation.md` | Framer Motion patterns, scroll parallax, stagger, sidebar expand, carousel |
| 13 | `13-empty-states-and-feedback.md` | Empty states, toasts, loading states, error blocks, offline fallback |
| 14 | `14-internal-page-layout-patterns.md` | Page headers, two-column layouts, detail pages, wizard steps, notifications |
| 15 | `15-component-library-reference.md` | All shadcn/ui components with usage examples |
| 16 | `16-color-and-role-coding.md` | Role colors, status colors, badge colors, brand orange usage |
| 17 | `17-import-conventions-and-project-setup.md` | Import paths, directives, environment variables, `cn()` utility |
| 18 | `18-naming-and-file-organization.md` | File names, component patterns, state management, responsive breakpoints |

---

## Tech Stack Summary
- **Framework**: Next.js 15, App Router, React 19
- **Styling**: Tailwind CSS v4 (utility-first, no config file)
- **Components**: shadcn/ui (in `packages/ui`, imported as `@repo/ui/...`)
- **Animation**: Framer Motion
- **Icons**: Lucide React (primary), React Icons (social icons)
- **Dark mode**: Class-based (`dark:` prefix), toggled with ThemeToggle component
- **State**: useState + Context (no global state lib)

---

## Core Design Philosophy

### Visual Language
- **Minimal and precise** — neutral palette (whites, grays, black) with a single brand orange accent
- **High contrast** — strong dark/light pairs, content always readable
- **Depth through shadow** — cards and panels use `shadow-sm` to `shadow-xl` to create elevation
- **Generous rounded corners** — `rounded-xl` to `rounded-2xl` on all cards, `rounded-full` on pill buttons
- **Monospace accents** — section labels, role text, and metadata use `font-mono` to feel technical and precise

### Layout Philosophy
- **App shell**: Fixed sidebar + scrollable content. Content card "floats" with `rounded-l-4xl` edge
- **Landing pages**: Max-width 7xl (`max-w-7xl`), centered with `mx-auto px-6 md:px-8`
- **Internal pages**: Same max-width with `px-4 py-6 sm:px-6 lg:px-8`
- **Sections alternate** between white and neutral-50/neutral-100 backgrounds

### Interaction Patterns
- **Sidebar**: Collapses to icon-only (70px). State persisted to localStorage.
- **Forms**: Orange submit button, rounded-xl inputs, immediate toast feedback
- **Tables**: Rounded container, subtle hover rows, search + filter above
- **Navigation**: Active = `bg-black text-white`, inactive = neutral-600

### Landing Page Principles
- Full-screen video hero with dark overlay and staggered text entrance
- Floating pill navbar that transitions from glass to solid on scroll
- Sections use `ScrollReveal` for entrance animation
- Footer has oversized watermark letterform at bottom

---

## Quick Reference: Most-used Classes

```
Panel/card:       rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900
Page H1:          text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white
Section label:    text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500
Input:            h-11 rounded-xl border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900
CTA button:       h-11 rounded-xl bg-orange-500 font-medium text-white hover:bg-orange-600
Secondary button: rounded-full border border-neutral-200 px-4 py-2.5 text-sm
Nav active:       bg-black text-white rounded-lg px-3 py-2.5
Nav inactive:     text-neutral-600 hover:bg-neutral-200 rounded-lg px-3 py-2.5
Landing H2:       font-display text-4xl md:text-5xl text-neutral-900 dark:text-white
Badge active:     bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300
Badge warning:    bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300
Badge error:      bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300
```
