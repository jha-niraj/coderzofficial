# Sidebar Navigation

## Visual Structure (top to bottom)

```
┌─────────────────────────────┐
│  [Logo] Gurukul              │  ← Brand header with collapse toggle
│         School Management   │
├─────────────────────────────┤
│  Primary nav items          │  ← Icon + label, active = black bg
│                             │
│  WORKSPACE  ← monospace     │  ← Section group label (10px mono caps)
│  Workspace items            │
│                             │
│  MANAGEMENT ← monospace     │  ← Another group
│  Secondary items            │
├─────────────────────────────┤
│  [Theme] [Updates] [Notif]  │  ← Utility bar (hidden when collapsed)
│  [Avatar] Name              │  ← Profile area with hover dropdown
│           role              │
└─────────────────────────────┘
```

---

## Brand Header

```tsx
<div className={cn(
    "relative flex shrink-0 items-center border-b border-neutral-200 dark:border-neutral-800",
    isCollapsed ? "justify-center px-3 py-4" : "gap-3 px-4 py-4 pr-5"
)}>
    <Link href="/home" className="flex min-w-0 items-center gap-3 rounded-lg">
        <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-md">
            <Image src="/gurukulmainlogo.webp" fill />
        </span>
        {!isCollapsed && (
            <div className="min-w-0 flex-1">
                <h1 className="truncate font-bold tracking-tight text-neutral-900 dark:text-white">
                    Gurukul
                </h1>
                <p className="truncate font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    School Management
                </p>
            </div>
        )}
    </Link>
    {/* Collapse toggle — pill button pinned to right edge */}
    <button className="absolute top-1/2 -right-3 z-50 hidden -translate-y-1/2
                       rounded-full border border-neutral-200 bg-white p-1 shadow-lg
                       transition-colors hover:bg-neutral-100
                       dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800
                       lg:block">
        {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
    </button>
</div>
```

---

## Nav Item States

### Active item (current page)
```
bg-black text-white           (light)
bg-black text-white           (dark — same, works on dark bg)
```

### Inactive item (default)
```
text-neutral-600 dark:text-neutral-400
hover:text-neutral-900 dark:hover:text-white
hover:bg-neutral-200 dark:hover:bg-neutral-800/50
```

### Locked module item
```
text-neutral-400 dark:text-neutral-600
hover:bg-neutral-100 dark:hover:bg-neutral-800/30
opacity-50 on icon and text
<Lock className="h-3.5 w-3.5 opacity-60" /> shown on right
```

### Nav item base classes
```tsx
"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer"
```

---

## Collapsed State

When `isCollapsed = true`:
- Item: `justify-center px-3` (icon centered, no label)
- Each item wrapped in `<Tooltip side="right">` showing the item name
- Tooltip styling: `bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-800`
- Logo area: only logo image, no text
- Profile area: only avatar, no name/role text

---

## Section Group Labels

```tsx
<p className="text-[10px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400 px-2 tracking-widest">
    Workspace
</p>
```
Rendered above a group of nav items. Hidden when sidebar is collapsed.

---

## Expandable Parent Items (with children)

```tsx
// Parent button (navigates + expands)
<button onClick={() => { expand(item.path); router.push(item.path) }}
    className={cn(...navItemClasses, isActive && "bg-black text-white")}>
    <Icon className="h-5 w-5 flex-shrink-0" />
    {!isCollapsed && (
        <>
            <span className="flex-1 text-left whitespace-nowrap overflow-hidden">{item.name}</span>
            <span onClick={e => { e.stopPropagation(); toggle(item.path) }}
                className="inline-flex rounded p-1 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/50">
                <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
            </span>
        </>
    )}
</button>

// Children — animated reveal
<AnimatePresence>
    {isExpanded && !isCollapsed && (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-4 space-y-1">
            {item.children.map(child => renderNavItem(child, depth + 1))}
        </motion.div>
    )}
</AnimatePresence>
```

Child items use `text-xs` and `h-4 w-4` icon (smaller than parent's `text-sm` / `h-5 w-5`).

---

## Profile Section (bottom)

```tsx
<div className="relative px-3 py-2"
     onMouseEnter={showDropdown} onMouseLeave={hideDropdown}>
    <button className={cn(
        "flex cursor-pointer items-center gap-3 w-full rounded-lg
         hover:bg-neutral-100 dark:hover:bg-neutral-800 p-2 transition-colors",
        isCollapsed && "justify-center"
    )}>
        {/* Avatar: image or gradient fallback */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600
                        flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
            <span className="text-white text-xs font-bold">{initial}</span>
        </div>
        {!isCollapsed && (
            <div className="flex-1 text-left min-w-0 hidden lg:block">
                <p className="text-sm font-bold truncate text-neutral-900 dark:text-white">{name}</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate font-mono capitalize">{role}</p>
            </div>
        )}
    </button>

    {/* Flyout dropdown — appears to the right of sidebar */}
    {profileDropdownOpen && (
        <div className="absolute left-full ml-1 bottom-0 z-50 w-64
                        overflow-hidden rounded-lg border border-neutral-200 bg-white
                        shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            {/* User info header */}
            {/* Profile Settings link */}
            {/* Sign Out button → text-red-600 hover:bg-red-50 */}
        </div>
    )}
</div>
```

Dropdown appears via `left-full ml-1` — positioned to the right of the sidebar, not below.

---

## Utility Bar (above profile)

```tsx
<div className="flex items-center justify-between gap-2 border-b border-neutral-200
                px-3 py-2 dark:border-neutral-800">
    <div className="cursor-pointer px-4">
        <ThemeToggle />
    </div>
    <div className="flex items-center gap-1">
        {isPrincipal && <PlatformUpdatesPanel />}
        <NotificationsPanel />
    </div>
</div>
```

Hidden entirely when sidebar is collapsed.

---

## Auto-expand on navigation

When the user navigates to a child route, the parent item auto-expands:
```tsx
useEffect(() => {
    const allItems = [...navItems, ...workspaceItems, ...secondaryItems]
    for (const item of allItems) {
        if (item.children) {
            for (const child of item.children) {
                if (pathname.startsWith(child.path)) {
                    setExpandedItems(prev =>
                        prev.includes(item.path) ? prev : [...prev, item.path]
                    )
                    break
                }
            }
        }
    }
}, [pathname, navItems, workspaceItems, secondaryItems])
```

---

## Navigation Data Structure

```typescript
interface NavigationItem {
    name: string
    path: string
    icon: LucideIcon
    children?: NavigationItem[]
}

interface Navigation {
    primary: NavigationItem[]
    workspace: NavigationItem[]
    secondary: NavigationItem[]
}
```

Navigation is role-filtered at render time using `getNavigationForRole(userRole, effectivePermissions)`.
