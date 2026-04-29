# Footer Design

## Concept
A multi-column footer with a brand column, navigation columns, newsletter signup, social icons, a legal strip, and a large watermark wordmark at the very bottom.

---

## Structure

```tsx
<footer className="relative bg-white dark:bg-neutral-950 text-black dark:text-white
                   overflow-hidden pt-24 pb-0 border-t border-neutral-200 dark:border-white/5 z-10">
    <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
            {/* Brand column: md:col-span-4 */}
            {/* Spacer: md:col-span-1 */}
            {/* Platform links: md:col-span-2 */}
            {/* Legal links: md:col-span-2 */}
            {/* Newsletter: md:col-span-3 */}
        </div>

        {/* Legal strip */}
        <div className="border-t border-neutral-200 dark:border-white/10 py-8
                        flex flex-col md:flex-row justify-between items-center gap-4
                        text-sm text-neutral-500 dark:text-white/40">
            <div>© {year} Company Name. All rights reserved.</div>
            <div className="flex items-center gap-8">
                <Link>Privacy</Link>
                <Link>Terms</Link>
                {/* Back to top button */}
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200
                                   dark:border-white/10 bg-neutral-50 dark:bg-white/5
                                   px-3 py-1.5 text-xs font-medium
                                   text-neutral-600 dark:text-white/50
                                   hover:text-neutral-900 dark:hover:text-white
                                   hover:bg-neutral-100 dark:hover:bg-white/10 transition-all">
                    <ArrowUp className="h-3 w-3" />
                    Back to top
                </button>
            </div>
        </div>
    </div>

    {/* Watermark */}
    <div className="w-full border-t border-white/5 pt-2 pointer-events-none select-none overflow-hidden">
        <h1 className="text-[16vw] leading-[0.75] font-display text-center tracking-[-0.04em]
                       text-transparent bg-clip-text
                       bg-gradient-to-b from-neutral-300/40 dark:from-white/[0.1] to-transparent">
            GURUKUL
        </h1>
    </div>
</footer>
```

---

## Brand Column (col-span-4)

```tsx
<div className="space-y-6">
    <Link href="/" className="inline-flex items-center gap-3 text-3xl tracking-tight font-display">
        <Image src="/logo.webp" width={44} height={44} className="rounded-md" />
        <span>Gurukul<sup className="text-xs ml-0.5 opacity-50">R</sup></span>
    </Link>
    <p className="text-neutral-600 dark:text-white/50 text-base leading-relaxed max-w-sm">
        Tagline or description.
    </p>
    {/* Social icons row */}
    <div className="flex gap-4 pt-2">
        <SocialIcon icon={<FaFacebookF />} href="..." />
        <SocialIcon icon={<FaInstagram />} href="..." />
        <SocialIcon icon={<FaLinkedinIn />} href="..." />
        <SocialIcon icon={<FaTwitter />} href="..." />
    </div>
</div>
```

---

## Social Icon Component

```tsx
function SocialIcon({ icon, href }) {
    return (
        <Link href={href} target="_blank" rel="noreferrer"
            className="w-10 h-10 flex items-center justify-center rounded-full
                       bg-neutral-100 dark:bg-white/5
                       border border-neutral-300 dark:border-white/10
                       text-neutral-600 dark:text-white/50
                       hover:bg-neutral-200 dark:hover:bg-white/10
                       hover:text-neutral-900 dark:hover:text-white
                       transition-all duration-300">
            {icon}
        </Link>
    )
}
```

---

## Navigation Column

```tsx
<div>
    <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-white/70 mb-6">
        Platform
    </h4>
    <ul className="space-y-4">
        <FooterLink href="/features">Features</FooterLink>
        <FooterLink href="/pricing">Pricing</FooterLink>
    </ul>
</div>
```

```tsx
function FooterLink({ href, children }) {
    return (
        <li>
            <Link href={href}
                className="text-neutral-600 dark:text-white/50
                           hover:text-neutral-900 dark:hover:text-white
                           transition-colors duration-200 text-sm cursor-pointer">
                {children}
            </Link>
        </li>
    )
}
```

---

## Newsletter Form

```tsx
<div>
    <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-white/70 mb-6">
        Stay Updated
    </h4>
    <p className="text-neutral-600 dark:text-white/50 text-sm mb-6">
        Insights and platform updates. No noise.
    </p>
    <form className="relative group">
        <Input type="email" placeholder="Enter your email"
            className="w-full h-12 bg-neutral-100 dark:bg-white/5
                       border border-neutral-300 dark:border-white/10 rounded-lg
                       pl-4 pr-12 text-sm
                       focus:border-neutral-500 dark:focus:border-white/30
                       focus:bg-white dark:focus:bg-white/10 transition-colors" />
        <button type="submit"
            className="absolute right-2 top-2 h-8 w-8 rounded-md
                       bg-neutral-200 dark:bg-white/10
                       flex items-center justify-center
                       hover:bg-neutral-300 dark:hover:bg-white/20 transition-colors">
            <ArrowRight className="w-4 h-4 text-neutral-700 dark:text-white" />
        </button>
    </form>
</div>
```

---

## Watermark (bottom text art)

```tsx
<h1 className="text-[16vw] leading-[0.75] font-display text-center tracking-[-0.04em]
               text-transparent bg-clip-text
               bg-gradient-to-b from-neutral-300/40 dark:from-white/[0.1] to-transparent">
    COMPANYNAME
</h1>
```

- `text-[16vw]` — viewport-relative, fills the full width
- `leading-[0.75]` — tight line height, text hugs the bottom edge
- `text-transparent bg-clip-text` — gradient applied to text fill
- Gradient: partially visible at top, fades to transparent at bottom
- `pointer-events-none select-none` — purely decorative

---

## Conditional rendering

Footer is hidden on internal app pages:
```tsx
const hideFooter = ["/profile", "/home", "/onboarding"].some(path => pathname.startsWith(path))
if (hideFooter) return null
```
