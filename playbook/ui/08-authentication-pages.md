# Authentication Pages

## Concept
A two-panel layout: a branded media panel (left, 46% width) with a looping video + editorial copy, and a clean white form panel (right, remaining width). On mobile the left panel is hidden — only the form shows.

---

## AuthPanel Wrapper

```tsx
function AuthPanel({ children }) {
    return (
        <div className="min-h-screen flex max-w-7xl mx-auto">
            {/* Left: Video / Brand Panel (desktop only) */}
            <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden flex-col shrink-0">
                <video autoPlay loop muted playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                    src={VIDEO_URL} />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/65 to-black/50" />

                {/* Content over video */}
                <div className="relative z-10 flex h-full flex-col justify-between p-12 2xl:p-16">
                    {/* Top: Logo */}
                    <div className="flex items-center gap-2.5">
                        <GraduationCap className="h-7 w-7 text-orange-400" />
                        <span className="text-xl font-semibold tracking-tight text-white">Gurukul</span>
                    </div>

                    {/* Middle: Headline */}
                    <div>
                        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-orange-400/80">
                            School Management Platform
                        </p>
                        <h2 className="max-w-xs text-4xl font-bold leading-[1.1] text-white">
                            Welcome <span className="text-white/70">back to your school.</span>
                        </h2>
                        <p className="mt-5 max-w-xs text-base leading-relaxed text-white/70">
                            Pick up where you left off — students, exams, billing, and everything in between.
                        </p>
                    </div>

                    {/* Bottom: Quote */}
                    <div className="border-t border-white/10 pt-6">
                        <p className="max-w-xs text-sm italic leading-relaxed text-white/70">
                            &quot;Education is the passport to the future...&quot;
                        </p>
                        <p className="mt-2 text-xs text-orange-400/60">— Malcolm X</p>
                    </div>
                </div>
            </div>

            {/* Right: Form Panel */}
            <div className="flex flex-1 items-center justify-center overflow-y-auto bg-white p-8 dark:bg-neutral-950">
                {children}
            </div>
        </div>
    )
}
```

---

## Form Container

```tsx
<div className="w-full max-w-[400px]">
    {/* Mobile logo (hidden on desktop where panel shows) */}
    <div className="mb-6 flex items-center gap-2 lg:hidden">
        <GraduationCap className="h-6 w-6 text-orange-500" />
        <span className="text-lg font-semibold text-neutral-900 dark:text-white">Gurukul</span>
    </div>

    {/* Page header */}
    <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Sign in</h1>
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            Access your school dashboard.
        </p>
    </div>

    {/* Form content */}
</div>
```

---

## Social Sign-In Button (Google)

```tsx
<button type="button" onClick={handleGoogleSignIn} disabled={isGoogleLoading}
    className="flex w-full items-center justify-center gap-3 rounded-xl
               border border-neutral-200 bg-white px-4 py-2.5
               text-sm font-medium text-neutral-700 shadow-sm transition-all
               hover:bg-neutral-50
               dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800
               disabled:opacity-60">
    {isGoogleLoading
        ? <DotmSquare11 size={16} dotSize={2} speed={1.5} />
        : <svg className="h-4 w-4">...</svg>  /* Google logo SVG paths */
    }
    Continue with Google
</button>
```

---

## Or Divider

```tsx
<div className="my-5 flex items-center gap-3">
    <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
    <span className="text-xs text-neutral-400">or</span>
    <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
</div>
```

---

## Tab Switcher (Email / Phone)

```tsx
<div className="mb-5 flex rounded-xl border border-neutral-200 bg-neutral-50 p-1
                dark:border-neutral-800 dark:bg-neutral-900">
    {([["email", Mail, "Email"], ["phone", Phone, "Phone"]] as const).map(([m, Icon, label]) => (
        <button key={m} type="button" onClick={() => setMode(m)}
            className={cn(
                "cursor-pointer flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all",
                mode === m
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
            )}>
            <Icon className="h-3.5 w-3.5" />
            {label}
        </button>
    ))}
</div>
```

---

## Form Inputs

```tsx
<div className="space-y-1.5">
    <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Email address
    </Label>
    <Input type="email" placeholder="you@school.edu.np"
        className="h-11 rounded-xl border-neutral-200 bg-neutral-50 text-sm
                   placeholder:text-neutral-400 focus-visible:ring-orange-500
                   dark:border-neutral-800 dark:bg-neutral-900" />
</div>
```

Password input with show/hide toggle:
```tsx
<div className="relative">
    <Input type={showPassword ? "text" : "password"}
        className="h-11 rounded-xl ... pr-11" />
    <button type="button" onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
</div>
```

---

## Submit Button

```tsx
<Button type="submit" disabled={isLoading}
    className="h-11 w-full rounded-xl bg-orange-500 font-medium text-white hover:bg-orange-600">
    {isLoading
        ? <><DotmSquare11 size={16} dotSize={2} speed={1.5} className="mr-2 flex-shrink-0" />Signing in…</>
        : "Sign in"
    }
</Button>
```

---

## Error Message

```tsx
{error && (
    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3
                    text-sm text-red-700
                    dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
        {error}
    </div>
)}
```

---

## Info Callout (amber warning box)

```tsx
<div className={cn(
    "mt-5 rounded-xl border px-4 py-3 text-xs leading-relaxed",
    "border-amber-200 bg-amber-50 text-amber-800",
    "dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300"
)}>
    <strong>Staff & Teachers:</strong> Your principal will share your login credentials.
</div>
```

---

## Phone OTP Flow

```tsx
{/* Phone input + Send OTP button */}
<div className="flex gap-2">
    <CountryPhoneInput onChange={(e164) => setPhone(e164)} className="flex-1" />
    <Button type="button" onClick={handleSendOTP} variant="outline"
        className="h-11 shrink-0 rounded-xl border-neutral-200 dark:border-neutral-800 text-sm">
        {sendingOtp ? <DotmSquare11 /> : otpCooldown > 0 ? `${otpCooldown}s` : otpSent ? "Resend" : "Send OTP"}
    </Button>
</div>

{/* 6-digit OTP slots — shown only after OTP sent */}
{otpSent && (
    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
        <InputOTPGroup>
            {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
        </InputOTPGroup>
    </InputOTP>
)}
```

---

## Footer link (Sign up redirect)

```tsx
<p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
    New to Gurukul?{" "}
    <Link href="/signup" className="font-medium text-orange-500 hover:text-orange-600 hover:underline">
        Register your school
    </Link>
</p>
```
