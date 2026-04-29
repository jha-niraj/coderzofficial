# Import Conventions & Project Setup

## Monorepo Structure

This is a pnpm workspace monorepo with Turborepo:
```
apps/
  main/      → Staff/principal web app (Next.js 15)
  student/   → Student portal (Next.js 15)
  admin/     → Internal admin panel (Next.js 15)
packages/
  ui/        → Shared component library (shadcn/ui)
  prisma/    → Database schema + Prisma client
  auth/      → NextAuth configuration
```

---

## UI Component Imports

```tsx
// All UI components from shared package
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Badge } from "@repo/ui/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar"
import { Separator } from "@repo/ui/components/ui/separator"
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"
import { Progress } from "@repo/ui/components/ui/progress"
import { Switch } from "@repo/ui/components/ui/switch"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { Skeleton } from "@repo/ui/components/ui/skeleton"
import { toast } from "@repo/ui/components/ui/sonner"

// Utility
import { cn } from "@repo/ui/lib/utils"

// Custom components
import { EmptyState } from "@repo/ui/components/ui/empty-state"
import { DotmSquare11 } from "@repo/ui/components/ui/dotm-square-11"
import { PageLoader } from "@repo/ui/components/ui/loader"

// Scroll reveal (landing pages)
import { ScrollReveal, ScrollRevealItem, ScrollRevealStagger } from "@repo/ui/components/scroll-reveal"

// Theme toggle
import { ThemeToggle } from "@repo/ui/components/themetoggle"
```

---

## Animation Imports

```tsx
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion"
```

---

## Icons

```tsx
// Lucide React (primary icon library)
import { Users, ArrowRight, ChevronDown, Lock, Settings } from "lucide-react"

// React Icons (social icons in footer)
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa"
```

---

## Next.js Imports

```tsx
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Suspense } from "react"
```

---

## Auth

```tsx
// Server-side (in server components and server actions)
import { auth } from "@repo/auth"

// Client-side
import { signIn, signOut, useSession } from "@repo/auth/client"
```

---

## Charts

```tsx
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from "recharts"
```

---

## Fonts

```tsx
// For nav links (Barlow — bolder, geometric)
import { Barlow } from "next/font/google"
const barlow = Barlow({ subsets: ["latin"], weight: ["500", "600", "700"] })
```

---

## Directive Requirements

```tsx
// Client components (use browser APIs, hooks, event handlers)
"use client"

// Server actions
"use server"
```

Rule: `"use client"` only when you need `useState`, `useEffect`, event handlers, or browser APIs. Everything else defaults to server components.

---

## `cn()` Utility

```tsx
import { cn } from "@repo/ui/lib/utils"

// Merges class names, handles conflicts (tailwind-merge + clsx)
cn("text-sm", isActive && "font-bold", className)
cn("bg-white", "dark:bg-neutral-950", someCondition ? "p-4" : "p-2")
```

---

## shadcn/ui Component Pattern

All shadcn components accept a `className` prop for overrides. Always extend, never override the entire component:

```tsx
// Good — add custom classes on top of defaults
<Button className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600">
    Submit
</Button>

// Good — extend Input with custom height and border
<Input className="h-11 rounded-xl border-neutral-200 dark:border-neutral-800" />
```

---

## Project-specific Utilities

```tsx
// Date formatting with Nepal calendar support (BS/AD)
import { formatSchoolDate, type SchoolCalendarSystem } from "@/lib/date/calendar-system"
const formatted = formatSchoolDate(new Date(), calendarSystem, { weekday: 'long', ... })

// Permission checking
import { hasPermission, ROLE_PERMISSIONS } from "@/lib/permissions"

// Navigation config
import { getNavigationForRole } from "@/lib/navigation"

// Tailwind cn alias (some files use local cx instead)
function cx(...classes: Array<string | undefined | false>) {
    return classes.filter(Boolean).join(' ')
}
```

---

## Environment Variables Pattern

```
NEXT_PUBLIC_*   → Available in browser
DATABASE_URL    → Server only
NEXTAUTH_SECRET → Server only
NEXTAUTH_URL    → Server only
CLOUDINARY_*    → Server only (image uploads)
RESEND_API_KEY  → Server only (emails)
```
