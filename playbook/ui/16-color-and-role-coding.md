# Color Coding & Role System

## Role Color Palette

Each user role has a semantic color set used consistently across icon backgrounds, badges, and avatars:

| Role | Background | Text | Dark Background | Dark Text |
|---|---|---|---|---|
| PRINCIPAL | `bg-purple-50` | `text-purple-600` | `dark:bg-purple-950` | `dark:text-purple-400` |
| ADMIN | `bg-blue-50` | `text-blue-600` | `dark:bg-blue-950` | `dark:text-blue-400` |
| TEACHER | `bg-blue-50` | `text-blue-600` | `dark:bg-blue-950` | `dark:text-blue-400` |
| ACCOUNTANT | `bg-emerald-50` | `text-emerald-600` | `dark:bg-emerald-950` | `dark:text-emerald-400` |
| STAFF | `bg-gray-50` | `text-gray-600` | `dark:bg-gray-950` | `dark:text-gray-400` |

---

## Status Color Palette

| Status | Background | Text | Usage |
|---|---|---|---|
| Active / Paid / Success | `bg-emerald-50 text-emerald-700` | `dark:bg-emerald-950/30 dark:text-emerald-400` | Paid fees, active students |
| Pending / Warning | `bg-amber-50 text-amber-700` | `dark:bg-amber-950/20 dark:text-amber-300` | Pending payments, warnings |
| Overdue / Error / Critical | `bg-red-50 text-red-700` | `dark:bg-red-950/30 dark:text-red-400` | Overdue bills, errors |
| Info / In-progress | `bg-blue-50 text-blue-700` | `dark:bg-blue-950/30 dark:text-blue-400` | In-progress, info |
| Absent | `bg-red-50 text-red-600` | `dark:bg-red-950 dark:text-red-400` | Attendance absent |
| Present | `bg-emerald-50 text-emerald-600` | `dark:bg-emerald-950 dark:text-emerald-400` | Attendance present |
| Late | `bg-amber-50 text-amber-600` | `dark:bg-amber-950 dark:text-amber-400` | Late arrival |

---

## Badge color application

```tsx
// Paid bill
<Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
    Paid
</Badge>

// Pending
<Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
    Pending
</Badge>

// Overdue
<Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
    Overdue
</Badge>

// Active
<Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
    Active
</Badge>

// Inactive / Archived
<Badge variant="outline" className="text-neutral-500">
    Inactive
</Badge>
```

---

## Avatar Gradient Fallbacks

When no profile image is available, use a gradient by initial:
```tsx
// Default (all users)
<div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600
                flex items-center justify-center">
    <span className="text-white text-xs font-bold">{name[0]}</span>
</div>
```

In the sidebar profile area this gradient is always used as a fallback.

---

## Icon + Color Combos (stat cards)

```tsx
// Students / Users
iconColor="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"

// Finance / Money
iconColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"

// Warnings / Leaves / Alerts
iconColor="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"

// Errors / Absent / Overdue
iconColor="bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"

// Exams / Academic
iconColor="bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"

// Calendar / Schedule
iconColor="bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400"
```

---

## Brand Orange Usage

Used exclusively for:
- Primary CTA buttons (`bg-orange-500 hover:bg-orange-600`)
- Focus rings on inputs (`focus-visible:ring-orange-500`)
- Links in auth forms (`text-orange-500 hover:text-orange-600`)
- Eyebrow labels in hero (`text-orange-400`)
- Landing page "Yatra" special link (`text-orange-700 bg-orange-50`)
- Progress/accent dots (`bg-orange-400 animate-pulse`)
- Active sidebar state in landing page navbar logo icon

Do NOT use orange for:
- Error states (use red)
- Success states (use emerald)
- Info states (use blue)

---

## Dark Mode Color Pairs

| Light | Dark |
|---|---|
| `bg-white` | `dark:bg-neutral-950` |
| `bg-neutral-50` | `dark:bg-neutral-900` |
| `bg-neutral-100` | `dark:bg-neutral-800` |
| `border-neutral-200` | `dark:border-neutral-800` |
| `text-neutral-900` | `dark:text-white` |
| `text-neutral-600` | `dark:text-neutral-400` |
| `text-neutral-500` | `dark:text-neutral-400` |
| `text-neutral-400` | `dark:text-neutral-500` |
| `shadow-sm` | (same, shadows are lower contrast on dark) |

---

## Opacity-based Colors (overlays)

Used on landing page (dark video background):
```
text-white/50    → subheading on dark video
text-white/40    → secondary H1 line
text-white/70    → paragraph text on dark panels
border-white/10  → subtle card borders
bg-white/5       → very subtle card fills
bg-white/10      → slightly visible card fills
bg-black/30      → navbar overlay
```
