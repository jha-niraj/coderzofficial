# Dashboard & Stats Panels

## Page Header

Every internal page starts with a standardized header:

```tsx
<div className="flex flex-col gap-2 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
    <div>
        <p className="text-sm font-medium text-muted-foreground">Home</p>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">{today}</p>
    </div>
    <Button variant="outline" size="sm" className="w-fit gap-2 rounded-full" onClick={...}>
        Profile
        <ArrowUpRight className="h-4 w-4" />
    </Button>
</div>
```

Simpler variant (used in most inner pages):
```tsx
<div>
    <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
        Staff
    </h1>
    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
        Overview of your school's staff and leave activity.
    </p>
</div>
```

---

## Panel (Dashboard Card)

```tsx
function Panel({ className, children, ...props }) {
    return (
        <div className={cn(
            "rounded-2xl border border-neutral-200/90 bg-card/70 shadow-sm dark:border-neutral-800",
            className
        )} {...props}>
            {children}
        </div>
    )
}

function PanelHeader({ className, children, ...props }) {
    return <div className={cn("px-5 pt-5 pb-2", className)} {...props}>{children}</div>
}

function PanelContent({ className, children, ...props }) {
    return <div className={cn("px-5 pb-5", className)} {...props}>{children}</div>
}

function PanelTitle({ children, className }) {
    return <h3 className={cn("text-base font-semibold tracking-tight", className)}>{children}</h3>
}

function PanelDescription({ children, className }) {
    return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
}
```

Usage:
```tsx
<Panel>
    <PanelHeader className="flex flex-row items-center justify-between">
        <PanelTitle className="text-sm font-medium">Total students</PanelTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
    </PanelHeader>
    <PanelContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">Active in this school</p>
    </PanelContent>
</Panel>
```

Grid: `grid gap-4 md:grid-cols-2 lg:grid-cols-4`

---

## KPI / Stat Card (alternative simpler pattern)

```tsx
function StatCard({ label, value, icon: Icon, iconColor }) {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 ${iconColor}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
            </div>
            <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white">{value}</p>
        </div>
    )
}
```

Icon color examples:
```
"bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"     → teachers
"bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"  → staff
"bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" → warnings/leaves
"bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"         → absences
"bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"      → admin
```

---

## Section Header (with "Open" link)

```tsx
function SectionHeader({ title, href }) {
    const router = useRouter()
    return (
        <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <Button type="button" variant="ghost" size="sm"
                className="shrink-0 gap-1 text-muted-foreground"
                onClick={() => router.push(href)}>
                Open
                <ArrowUpRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
```

---

## Quick Action Buttons

```tsx
<div className="flex flex-wrap gap-2">
    {visibleActions.map(action => (
        <Button key={action.key} variant="outline" size="sm"
            className="gap-2 rounded-full text-xs"
            onClick={() => router.push(action.path)}>
            <action.icon className="h-3.5 w-3.5" />
            {action.label}
        </Button>
    ))}
</div>
```

---

## Quick Link Card (navigates to a sub-page)

```tsx
function QuickLinkCard({ href, icon: Icon, iconBg, title, description }) {
    return (
        <Link href={href}
            className="group flex items-center justify-between rounded-2xl
                       border border-neutral-200 bg-white p-5
                       transition-colors hover:border-neutral-400
                       dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600">
            <div className="flex items-center gap-4">
                <div className={`rounded-xl p-2.5 ${iconBg}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{title}</p>
                    <p className="text-sm text-neutral-500">{description}</p>
                </div>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-neutral-600 dark:group-hover:text-neutral-300" />
        </Link>
    )
}
```

---

## Charts (Recharts)

```tsx
<ResponsiveContainer width="100%" height={220}>
    <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="fees" stroke="#10b981" strokeWidth={2} dot={false} />
    </LineChart>
</ResponsiveContainer>
```

Charts live inside `Panel` / `Card` components with a title header above.

---

## Progress Bar (inline with stat)

```tsx
<PanelContent>
    <div className="text-2xl font-bold">{stats.attendanceToday}%</div>
    <Progress value={stats.attendanceToday} className="mt-2" />
</PanelContent>
```

---

## Badge

```tsx
// Status badge
<Badge variant="outline" className="text-xs font-medium">
    Active
</Badge>

// Role badge
<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs">
    Teacher
</Badge>
```

---

## Activity Feed Item

```tsx
<div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <ActivityIcon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.description}</p>
    </div>
    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo}</span>
</div>
```

---

## Team Member Row

```tsx
<div className="flex items-center gap-3 py-2">
    <Avatar className="h-8 w-8">
        <AvatarImage src={member.image} alt={member.name} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{member.name}</p>
        <p className="text-xs text-muted-foreground capitalize">{member.role.toLowerCase()}</p>
    </div>
</div>
```

---

## Role-based Dashboard Variants

Different dashboards render for different roles:
- `PRINCIPAL` → full stats (students, attendance, fees, exams, team, activity)
- `ACCOUNTANT` → finance-focused (billing, expenses, trends)
- `TEACHER` → teaching-focused (periods today, classes, homework, attendance)
- `STAFF` → minimal (total students, attendance)

All variants share the same Panel/StatCard primitives — just different data and layout.
