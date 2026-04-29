# App Shell & Layout System

## Overview

The app shell is a two-panel layout: a fixed left sidebar + a scrollable right content area. The sidebar can collapse to icon-only width. On mobile, the sidebar slides in as a Sheet overlay.

---

## Layout Structure

```
<html>
  <body>
    <SidebarProvider>          ← Context: isCollapsed, isMobileOpen
      <div className="flex h-screen bg-neutral-100 dark:bg-black overflow-hidden">
        <MainSidebar />        ← Fixed, z-40, full height
        <div className="flex flex-col flex-1 h-screen overflow-hidden bg-neutral-100 dark:bg-black">
          <main className="h-full relative transition-all duration-300"
                ml-0 → lg:ml-[260px] (expanded) | lg:ml-[70px] (collapsed)>
            <div className="h-full w-full bg-white dark:bg-neutral-950
                            lg:rounded-l-4xl lg:border-l border-neutral-200 dark:border-neutral-800
                            shadow-xl">
              <ScrollArea className="h-full w-full">
                <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                  {children}
                </div>
              </ScrollArea>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  </body>
</html>
```

### Key visual details
- **Background behind sidebar**: `bg-neutral-100 dark:bg-black` — this peeks through as the "gap" between sidebar and content, giving depth
- **Content panel**: `bg-white dark:bg-neutral-950` with `lg:rounded-l-4xl` — the content card appears to float above the dark background
- **Left border**: `lg:border-l border-neutral-200 dark:border-neutral-800` — subtle edge line
- **Shadow**: `shadow-xl` — the panel has elevation

### Content max-width
Always wrap page content in:
```tsx
<div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
```

---

## Sidebar Widths

| State | Width | Main Content margin |
|---|---|---|
| Expanded | `lg:w-64` (256px) | `lg:ml-[260px]` |
| Collapsed | `lg:w-[90px]` | `lg:ml-[70px]` |
| Mobile | Full Sheet | `ml-0` |

Transition: `transition-all duration-300 ease-in-out` on both sidebar and main content.

---

## SidebarProvider Context

```tsx
interface SidebarContextType {
    isCollapsed: boolean
    setIsCollapsed: (collapsed: boolean) => void
    isMobileOpen: boolean
    setIsMobileOpen: (open: boolean) => void
}
```

- State persisted to `localStorage` under key `"admin-sidebar-collapsed"`
- Loaded on mount via `useEffect`

---

## Mobile Behavior

On mobile (`< lg`):
1. Sidebar is `hidden lg:flex` — not rendered in DOM on mobile
2. A hamburger button appears: `fixed top-6 left-6 z-50 lg:hidden`
3. Clicking opens a `<Sheet side="left">` with identical sidebar content
4. Sheet is `w-64 border-neutral-200 bg-white p-0 dark:border-neutral-800 dark:bg-neutral-950`
5. Navigating to any page auto-closes the sheet (`useEffect` on `pathname`)
6. Backdrop overlay: `fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden`

---

## Full-Screen Mode (optional)
Certain paths bypass the sidebar/shell entirely:
```tsx
if (isFullScreenMode) {
    return (
        <div className="h-screen w-screen bg-neutral-950 overflow-y-auto">
            {children}
        </div>
    )
}
```

---

## Network Offline Fallback

When `useNetworkStatus()` returns false, render a centered card instead of the layout:
```tsx
<div className="h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
    <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/10 via-primary/5 to-background backdrop-blur-xl
                   rounded-2xl shadow-2xl p-10 max-w-sm w-full text-center border border-border"
    >
        {/* WifiOff icon + message + refresh button */}
    </motion.div>
</div>
```

---

## Route Groups

```
app/
  (auth)/      → No sidebar. White background, no padding wrapper.
  (home)/      → No sidebar. Public marketing pages.
  (legal)/     → No sidebar. Simple prose layout.
  (main)/      → Full app shell with sidebar.
    (principal)/  → Sub-group, same shell, principal-only pages
    (teacher)/    → Sub-group, teacher-only pages
    (accountant)/ → Sub-group, accountant pages
    (academic)/   → Shared academic pages
```

Route groups use `()` parentheses — no URL segment. Used to scope layouts and metadata.
