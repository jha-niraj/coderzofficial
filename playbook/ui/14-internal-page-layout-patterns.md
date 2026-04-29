# Internal Page Layout Patterns

## Page Wrapper

All pages inside `(main)/` share this outer wrapper via the layout:
```tsx
<div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    {children}
</div>
```

Inside the page itself, content goes in a vertical stack with `space-y-8` or `space-y-6`:
```tsx
<div className="w-full max-w-7xl mx-auto space-y-8 pb-10">
    {/* Page header */}
    {/* KPI cards row */}
    {/* Main content panels */}
</div>
```

---

## Standard Page Header

```tsx
<div>
    <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
        Students
    </h1>
    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
        Manage all enrolled students in your school.
    </p>
</div>
```

With breadcrumb:
```tsx
<div>
    <p className="text-sm font-medium text-muted-foreground">School / Staff</p>
    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Staff Management</h1>
    <p className="mt-1 text-sm text-muted-foreground">{today}</p>
</div>
```

With action button on right:
```tsx
<div className="flex flex-col gap-2 border-b border-border/60 pb-6
                sm:flex-row sm:items-end sm:justify-between">
    <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
    </div>
    <Button variant="outline" size="sm" className="w-fit gap-2 rounded-full">
        Export
        <ArrowUpRight className="h-4 w-4" />
    </Button>
</div>
```

---

## Two-column Layout (form + preview / info)

```tsx
<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
    {/* Main form — takes 2/3 */}
    <div className="lg:col-span-2 space-y-6">
        <Card>...</Card>
        <Card>...</Card>
    </div>

    {/* Sidebar info — takes 1/3 */}
    <div className="space-y-4">
        <Card>
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent>...</CardContent>
        </Card>
    </div>
</div>
```

---

## Full-width Card Page (settings, configuration)

```tsx
<div className="space-y-6">
    <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your school settings.</p>
    </div>

    <Card>
        <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Configure your school profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {/* Fields */}
        </CardContent>
        <CardFooter className="border-t pt-4">
            <Button type="submit">Save Changes</Button>
        </CardFooter>
    </Card>
</div>
```

---

## Detail Page (view a single record)

```tsx
{/* Header with back button */}
<div className="flex items-center gap-4 mb-6">
    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
    </Button>
    <div>
        <h1 className="text-2xl font-bold tracking-tight">John Doe</h1>
        <p className="text-sm text-muted-foreground">Grade 10 • Section A</p>
    </div>
    <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => router.push(`/students/${id}/edit`)}>
            Edit
        </Button>
    </div>
</div>

{/* Content sections */}
<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div className="lg:col-span-2 space-y-6">
        <Card>{/* Personal info */}</Card>
        <Card>{/* Academic info */}</Card>
    </div>
    <div className="space-y-4">
        <Card>{/* Quick stats */}</Card>
        <Card>{/* Recent activity */}</Card>
    </div>
</div>
```

---

## Tab Navigation (sub-pages within a section)

```tsx
<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
    <TabsList className="mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="grades">Grades</TabsTrigger>
        <TabsTrigger value="attendance">Attendance</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
    </TabsList>

    <TabsContent value="overview">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Stat cards */}
        </div>
    </TabsContent>

    <TabsContent value="grades">
        {/* Table or chart */}
    </TabsContent>
</Tabs>
```

---

## Split Panel (list + detail — command center pattern)

```tsx
<div className="flex h-full gap-4">
    {/* Left: list panel */}
    <div className="w-80 shrink-0 rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden flex flex-col">
        {/* Search */}
        <div className="p-3 border-b border-neutral-100 dark:border-neutral-800">
            <Input placeholder="Search..." className="h-9 rounded-lg" />
        </div>
        {/* List */}
        <ScrollArea className="flex-1">
            {items.map(item => (
                <button key={item.id} onClick={() => setSelected(item.id)}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left border-b border-neutral-50 dark:border-neutral-800/50 transition-colors",
                        selected === item.id
                            ? "bg-neutral-100 dark:bg-neutral-800"
                            : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                    )}>
                    <Avatar className="h-8 w-8" />
                    <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.meta}</p>
                    </div>
                </button>
            ))}
        </ScrollArea>
    </div>

    {/* Right: detail panel */}
    <div className="flex-1 rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 p-6 overflow-y-auto">
        {selectedItem ? <DetailView item={selectedItem} /> : <NoSelection />}
    </div>
</div>
```

---

## Wizard / Multi-step Form

```tsx
{/* Step indicator */}
<div className="flex items-center gap-2 mb-8">
    {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-2">
            <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors",
                currentStep > index
                    ? "border-orange-500 bg-orange-500 text-white"
                    : currentStep === index
                    ? "border-orange-500 text-orange-500 bg-white dark:bg-neutral-950"
                    : "border-neutral-200 text-neutral-400 dark:border-neutral-700"
            )}>
                {currentStep > index ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            {!isCollapsed && (
                <span className={cn(
                    "text-sm font-medium",
                    currentStep >= index ? "text-neutral-900 dark:text-white" : "text-neutral-400"
                )}>{step.label}</span>
            )}
            {index < steps.length - 1 && (
                <div className={cn(
                    "h-px w-8 mx-1 transition-colors",
                    currentStep > index ? "bg-orange-500" : "bg-neutral-200 dark:bg-neutral-700"
                )} />
            )}
        </div>
    ))}
</div>

{/* Step content */}
{currentStep === 0 && <StepOne />}
{currentStep === 1 && <StepTwo />}

{/* Navigation */}
<div className="flex justify-between mt-8">
    <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
    </Button>
    <Button onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}>
        {currentStep === steps.length - 1 ? "Complete" : "Continue"}
        {currentStep < steps.length - 1 && <ArrowRight className="h-4 w-4 ml-2" />}
    </Button>
</div>
```

---

## Notification / Announcement Panel (Slide-over)

```tsx
<Sheet open={isOpen} onOpenChange={setIsOpen}>
    <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500
                                 text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                </span>
            )}
        </Button>
    </SheetTrigger>
    <SheetContent className="w-full sm:max-w-sm p-0" side="right">
        <div className="flex h-full flex-col">
            <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-base font-semibold">Notifications</h2>
            </div>
            <ScrollArea className="flex-1">
                {notifications.map(n => (
                    <div key={n.id} className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                        <p className="text-[10px] text-neutral-400 mt-1">{n.time}</p>
                    </div>
                ))}
            </ScrollArea>
        </div>
    </SheetContent>
</Sheet>
```
