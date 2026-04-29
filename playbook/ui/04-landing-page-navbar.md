# Landing Page Navbar

## Concept
A **floating pill navbar** fixed to the top of the viewport. It changes appearance based on scroll depth:
- **Before scroll**: transparent dark glass (designed for dark video hero backgrounds)
- **After 40px scroll**: solid white/dark surface with border and shadow

---

## Positioning
```tsx
<header className="fixed top-2 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-7xl -translate-x-1/2">
```
- `fixed top-2` — 8px from top, floats above content
- `left-1/2 -translate-x-1/2` — horizontally centered
- `w-[calc(100%-1.5rem)]` — full width minus 24px (12px each side breathing room)
- `max-w-7xl` — caps at 1280px on wide screens

---

## Scroll-aware Classes

```tsx
const wrapperCls = cn(
    "rounded-[16px] border transition-all duration-500",
    isScrolled
        ? "bg-white/95 dark:bg-neutral-950/95 border-neutral-200/80 dark:border-neutral-800 shadow-sm backdrop-blur-md"
        : "bg-black/30 border-white/10 backdrop-blur-md shadow-none"
)
```

### Nav links
```tsx
isScrolled
    ? "text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
    : "text-white/75 hover:text-white"
```

### CTA Button (primary)
```tsx
isScrolled
    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800"
    : "bg-white text-neutral-900 hover:bg-white/90"
```

### CTA Button (secondary)
```tsx
isScrolled
    ? "border-neutral-200 text-neutral-800 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
    : "border-white/30 text-white hover:bg-white/10"
```

---

## Scroll detection
```tsx
useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
}, [])
```

---

## Inner Layout
```tsx
<div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-3.5">
    {/* Logo */}
    <Link href="/" className={logoTextCls}>
        <Image src="/logo.webp" width={36} height={36} className="rounded-md" />
        <span>Gurukul<sup className="ml-0.5 text-xs opacity-50">®</sup></span>
    </Link>

    {/* Desktop nav links */}
    <nav className="hidden items-center gap-8 text-[14px] font-medium md:flex">
        <Link href="/features">Features</Link>
        <Link href="/pricing">Pricing</Link>
        {/* Special "Yatra" badge link */}
        <Link href="/yatra" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5
                                       border border-orange-200 bg-orange-50 text-orange-700
                                       dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-400">
            <Backpack className="h-3.5 w-3.5" />
            Yatra
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
        </Link>
    </nav>

    {/* Desktop auth controls */}
    <div className="hidden items-center gap-3 md:flex md:gap-4">
        <ThemeToggle />
        {/* Authenticated: Avatar dropdown */}
        {/* Unauthenticated: "Begin Journey" pill + "Sign In" border pill */}
    </div>

    {/* Mobile hamburger */}
    <button className="rounded-full border px-3 py-1.5 text-sm md:hidden">
        {mobileMenuOpen ? <X /> : <Menu />}
    </button>
</div>
```

---

## CTA Button Anatomy
```tsx
// Primary CTA — rounded-full with arrow badge
<Link href="/signup" className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold">
    Begin Journey
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900/10">
        <ArrowUpRight className="h-3.5 w-3.5 rotate-45" />
    </span>
</Link>

// Secondary CTA — rounded-full with border
<Link href="/signin" className="rounded-full border px-4 py-2.5 text-sm font-medium">
    Sign In
</Link>
```

---

## Authenticated User Menu (Desktop)
```tsx
<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Avatar className="h-10 w-10 border border-white/20 cursor-pointer">
            <AvatarImage src={userImage} />
            <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem><Link href="/home"><Home /> Home</Link></DropdownMenuItem>
        <DropdownMenuItem><Link href="/profile"><UserCircle /> Profile</Link></DropdownMenuItem>
        <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
            <LogOut /> Log Out
        </DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
```

---

## Mobile Menu (Expanded)
```tsx
{mobileMenuOpen && (
    <div className="border-t px-4 py-4 md:hidden">
        {/* Theme row */}
        <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-white/50">Theme</span>
            <ThemeToggle />
        </div>
        {/* Nav links stacked */}
        <nav className="space-y-3 text-sm text-white/80">
            <Link href="/features" className="block">Features</Link>
            ...
        </nav>
        {/* Auth section */}
        {isLoggedIn ? (
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                {/* Avatar + name row */}
                {/* 3-col grid: Home | Profile | Log Out */}
                <div className="grid grid-cols-3 gap-2">
                    <Link className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-xs">Home</Link>
                    <Link className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-xs">Profile</Link>
                    <button className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-400">Log Out</button>
                </div>
            </div>
        ) : (
            <div className="mt-4 flex flex-col gap-3">
                <Link className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-neutral-900">Begin Journey</Link>
                <Link className="rounded-full border border-white/30 py-3 text-center text-sm text-white">Sign In</Link>
            </div>
        )}
    </div>
)}
```

---

## Font for Nav Links
```tsx
import { Barlow } from "next/font/google"
const barlow = Barlow({ subsets: ["latin"], weight: ["500", "600", "700"] })
// Applied to the <nav> element: className={barlow.className}
```
