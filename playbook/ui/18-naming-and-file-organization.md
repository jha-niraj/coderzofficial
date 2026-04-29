# Naming Conventions & File Organization

## File Naming
- **Pages**: `page.tsx` (Next.js App Router convention)
- **Layouts**: `layout.tsx`
- **Client components**: `kebab-case-client.tsx` (suffix `-client` for clarity)
- **Shared components**: `kebab-case.tsx`
- **Server actions**: `domain.action.ts`

---

## Component Naming
- **React components**: PascalCase
- **Hooks**: `use` prefix, camelCase (`useSidebar`, `useNetworkStatus`)
- **Context providers**: `[Domain]Provider`
- **Action files**: `[domain].action.ts`

---

## Folder Structure for a Page

```
app/(main)/students/
  page.tsx                   ← Server component (data fetching)
  _components/
    students-list-client.tsx  ← Main client component
    student-card.tsx          ← Sub-component
  new/
    page.tsx
    _components/
      new-student-client.tsx
  [id]/
    page.tsx
    edit/
      page.tsx
```

Rule: `_components/` folder holds page-specific client components. Shared components go in `components/`.

---

## Component Architecture

### Server Component (page.tsx)
```tsx
// No "use client"
// Fetches data, passes to client component
export default async function StudentsPage() {
    const students = await getStudents()
    return <StudentsListClient students={students} />
}
```

### Client Component (students-list-client.tsx)
```tsx
"use client"
// Receives data as props
// Handles UI state, search, filters, pagination
export function StudentsListClient({ students }: { students: Student[] }) {
    const [search, setSearch] = useState("")
    // ...
}
```

---

## Common Component Patterns

### Local `Panel` (for dashboard pages)
Define inline in the file — not a shared component unless reused in 3+ places:
```tsx
function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={cn("rounded-2xl border border-neutral-200/90 bg-card/70 shadow-sm dark:border-neutral-800", className)}>
            {children}
        </div>
    )
}
```

### Local `StatCard`
```tsx
function StatCard({ label, value, icon: Icon, iconColor }: StatCardProps) {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            ...
        </div>
    )
}
```

### Local `FormField`
```tsx
function FormField({ id, label, children }: { id?: string; label: string; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            {children}
        </div>
    )
}
```

These are defined at the top of the file that uses them, not exported.

---

## Type Naming

```tsx
// Props interfaces
interface HomeDashboardClientProps { ... }
interface StudentFormData { ... }

// Exported types for shared use
export type DashboardStats = { ... }
export type PerformanceDataRow = { ... }
```

---

## Action Return Pattern

```typescript
// All server actions return this shape
type ActionResult<T> = {
    success: boolean
    data?: T
    error?: string
}
```

---

## State Management

No global state library. Uses:
- `useState` for local UI state
- `useContext` for sidebar state (SidebarProvider)
- `useSession` from auth for user session
- React Server Components + server actions for data mutations
- `revalidatePath()` after mutations for cache invalidation

---

## Page Section Order (conventions)

For landing pages, sections appear in this order:
1. Navbar (fixed)
2. Hero section (full screen)
3. Social proof / quick stats strip
4. Features section
5. Product modules / detailed features
6. Testimonials
7. Pricing
8. FAQ
9. CTA banner
10. Footer

For app pages, content order:
1. Page header (H1 + description + optional action)
2. KPI stat cards (2-4 columns)
3. Primary content (table or main card)
4. Secondary content (secondary panels, activity feed)

---

## Responsive Breakpoints Used

| Breakpoint | Width | When used |
|---|---|---|
| (default) | 0+ | Mobile-first base |
| `sm:` | 640px | Stack → row layouts |
| `md:` | 768px | Show more columns |
| `lg:` | 1024px | Sidebar visible, 3+ columns |
| `xl:` | 1280px | Max width hit |
| `2xl:` | 1536px | Extra padding on wide screens |

Most grids: `grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-4`
