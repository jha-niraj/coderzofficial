# Empty States & User Feedback

## Empty State Component

```tsx
import { EmptyState } from "@repo/ui/components/ui/empty-state"

<EmptyState
    icon={<FileSpreadsheet className="h-10 w-10" />}
    title="No students yet"
    description="Add your first student to get started with class management."
    actionLabel="Add Student"
    onAction={() => router.push("/students/new")}
/>
```

Internal structure:
```tsx
<div className="flex flex-col items-center justify-center text-center p-8
                bg-white dark:bg-neutral-900 rounded-xl shadow-sm">
    <div className="text-gray-400 dark:text-gray-500 mb-4">{icon}</div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{description}</p>
    {action ? action : (
        <Button onClick={onAction} variant="outline">{actionLabel}</Button>
    )}
</div>
```

---

## Inline Empty State (inside table/list)

```tsx
{items.length === 0 && (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800
                        flex items-center justify-center">
            <FolderOpen className="h-6 w-6 text-neutral-400" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">
            No results found
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            {search ? "Try a different search term." : "Start by creating your first record."}
        </p>
        <Button size="sm" onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create First
        </Button>
    </div>
)}
```

---

## Toast Notifications

```tsx
import { toast } from "@repo/ui/components/ui/sonner"

// Success
toast.success("Created!", {
    description: "Your record has been saved successfully."
})

// Error
toast.error("Something went wrong", {
    description: "Please try again or contact support."
})

// Info
toast("Session expired", {
    description: "Please sign in again to continue."
})

// With promise
toast.promise(asyncOperation(), {
    loading: "Saving...",
    success: "Saved!",
    error: "Failed to save."
})
```

`<Sonner />` component is rendered in the root layout:
```tsx
// in app/layout.tsx or providers.tsx
import { Toaster } from "@repo/ui/components/ui/sonner"
<Toaster richColors position="top-right" />
```

---

## Loading States

### Page-level loader

```tsx
import { PageLoader } from "@repo/ui/components/ui/loader"

// Used as Suspense fallback
<Suspense fallback={<PageLoader />}>
    <PageContent />
</Suspense>
```

### Inline spinner (DotmSquare11)

```tsx
import { DotmSquare11 } from "@repo/ui/components/ui/dotm-square-11"

// In buttons
{isLoading ? <DotmSquare11 size={16} dotSize={2} speed={1.5} /> : "Submit"}

// Standalone (auth form loading state)
<DotmSquare11 size={16} dotSize={2} speed={1.5} className="mr-2 flex-shrink-0" />
```

### Skeleton loaders

```tsx
import { Skeleton } from "@repo/ui/components/ui/skeleton"

// Avatar skeleton
<Skeleton className="h-10 w-10 rounded-full" />

// Text skeletons
<div className="space-y-2">
    <Skeleton className="h-4 w-48" />
    <Skeleton className="h-3 w-32" />
</div>

// Card skeleton
<div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
    <Skeleton className="h-4 w-24 mb-3" />
    <Skeleton className="h-8 w-16" />
</div>
```

---

## Error Block (form-level)

```tsx
{error && (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700
                    dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
        {error}
    </div>
)}
```

---

## Warning / Info Callout

```tsx
{/* Amber warning */}
<div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed
                text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
    <strong>Note:</strong> This action cannot be undone.
</div>

{/* Blue info */}
<div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs
                text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
    <AlertCircle className="inline h-3.5 w-3.5 mr-1" />
    This will send an email notification to all selected members.
</div>
```

---

## Success State (after form submit)

```tsx
{submitted && (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30
                        flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            All done!
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
            The record has been created successfully.
        </p>
        <Button onClick={() => router.push("/list")}>
            View All Records
        </Button>
    </motion.div>
)}
```

---

## Offline Fallback

```tsx
const isOnline = useNetworkStatus()
if (!isOnline) return <OfflineFallback />

function OfflineFallback() {
    return (
        <div className="h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 100 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-gradient-to-br from-primary/10 via-primary/5 to-background
                               backdrop-blur-xl rounded-2xl shadow-2xl p-10 max-w-sm w-full
                               text-center border border-border">
                    {/* Bouncing WifiOff icon */}
                    {/* "Connection Lost" heading */}
                    {/* Refresh button */}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
```

Hook:
```tsx
function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    useEffect(() => {
        const online = () => setIsOnline(true)
        const offline = () => setIsOnline(false)
        window.addEventListener('online', online)
        window.addEventListener('offline', offline)
        return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline) }
    }, [])
    return isOnline
}
```

---

## Confirmation Dialog

```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel,
         AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
         AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@repo/ui/components/ui/alert-dialog"

<AlertDialog>
    <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">Delete</Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the record.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white">
                Delete
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
```
