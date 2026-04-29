# Component Library Reference

All UI components live in `packages/ui/src/components/ui/`. Imported as:
```tsx
import { Button } from "@repo/ui/components/ui/button"
import { cn } from "@repo/ui/lib/utils"
```

---

## Button

```tsx
// Variants: default, outline, ghost, destructive, secondary, link
<Button variant="default" size="sm">Save</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="ghost" size="sm">Skip</Button>
<Button variant="destructive" size="sm">Delete</Button>

// Sizes: default, sm, lg, icon
<Button size="icon"><X className="h-4 w-4" /></Button>

// With icon
<Button className="gap-2"><Plus className="h-4 w-4" />Add Student</Button>

// Loading
<Button disabled>
    <DotmSquare11 size={16} dotSize={2} speed={1.5} className="mr-2" />
    Saving…
</Button>

// Custom (orange CTA)
<Button className="h-11 w-full rounded-xl bg-orange-500 font-medium text-white hover:bg-orange-600">
    Get Started
</Button>
```

---

## Card

```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@repo/ui/components/ui/card"

<Card className="rounded-2xl">
    <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description here.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
        {/* Content */}
    </CardContent>
    <CardFooter className="border-t pt-4 flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
    </CardFooter>
</Card>
```

---

## Input

```tsx
import { Input } from "@repo/ui/components/ui/input"

<Input
    type="email"
    placeholder="Enter email"
    className="h-11 rounded-xl border-neutral-200 bg-neutral-50
               focus-visible:ring-orange-500 dark:border-neutral-800 dark:bg-neutral-900"
/>
```

---

## Textarea

```tsx
import { Textarea } from "@repo/ui/components/ui/textarea"

<Textarea
    placeholder="Enter description..."
    rows={4}
    className="rounded-xl border-neutral-200 bg-neutral-50 resize-none
               focus-visible:ring-orange-500 dark:border-neutral-800 dark:bg-neutral-900"
/>
```

---

## Select

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"

<Select value={value} onValueChange={setValue}>
    <SelectTrigger className="h-11 rounded-xl border-neutral-200 dark:border-neutral-800">
        <SelectValue placeholder="Select an option" />
    </SelectTrigger>
    <SelectContent>
        <SelectItem value="a">Option A</SelectItem>
        <SelectItem value="b">Option B</SelectItem>
    </SelectContent>
</Select>
```

---

## Badge

```tsx
import { Badge } from "@repo/ui/components/ui/badge"

<Badge>Active</Badge>
<Badge variant="outline">Pending</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Paid</Badge>
```

---

## Avatar

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar"

<Avatar className="h-10 w-10">
    <AvatarImage src={user.image} alt={user.name} />
    <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        {initials}
    </AvatarFallback>
</Avatar>
```

---

## Dialog

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/components/ui/dialog"

<Dialog open={open} onOpenChange={setOpen}>
    <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
            <DialogTitle>Create New Record</DialogTitle>
            <DialogDescription>Fill in the details below.</DialogDescription>
        </DialogHeader>
        {/* Form content */}
        <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Create</Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
```

---

## Sheet (Slide-over)

```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@repo/ui/components/ui/sheet"

<Sheet>
    <SheetTrigger asChild>
        <Button>Open</Button>
    </SheetTrigger>
    <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
            <SheetTitle>Edit Details</SheetTitle>
            <SheetDescription>Make changes to the record.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
            {/* Form */}
        </div>
    </SheetContent>
</Sheet>
```

---

## Tabs

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"

<Tabs defaultValue="tab1">
    <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">Content 1</TabsContent>
    <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

---

## Table

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table"

<Table>
    <TableHeader>
        <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
        </TableRow>
    </TableHeader>
    <TableBody>
        {rows.map(row => (
            <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell><Badge>{row.status}</Badge></TableCell>
                <TableCell className="text-right font-mono">NPR {row.amount}</TableCell>
            </TableRow>
        ))}
    </TableBody>
</Table>
```

---

## Tooltip

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@repo/ui/components/ui/tooltip"

<TooltipProvider>
    <Tooltip>
        <TooltipTrigger asChild>
            <Button size="icon"><Settings className="h-4 w-4" /></Button>
        </TooltipTrigger>
        <TooltipContent side="right"
            className="bg-neutral-900 dark:bg-white text-white dark:text-black">
            Settings
        </TooltipContent>
    </Tooltip>
</TooltipProvider>
```

---

## Dropdown Menu

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem,
         DropdownMenuSeparator, DropdownMenuTrigger } from "@repo/ui/components/ui/dropdown-menu"

<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={handleView}>View Details</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
            Delete
        </DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
```

---

## Separator

```tsx
import { Separator } from "@repo/ui/components/ui/separator"

<Separator className="my-4" />
<Separator orientation="vertical" className="h-6 mx-2" />
```

---

## ScrollArea

```tsx
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"

<ScrollArea className="h-[400px] w-full">
    {/* Long list content */}
</ScrollArea>
```

Used in sidebar, Sheet panels, and any container that needs custom scrollbars.

---

## Progress

```tsx
import { Progress } from "@repo/ui/components/ui/progress"

<Progress value={75} className="mt-2" />  {/* 0-100 */}
```

---

## Switch

```tsx
import { Switch } from "@repo/ui/components/ui/switch"

<div className="flex items-center gap-3">
    <Switch id="notifications" checked={enabled} onCheckedChange={setEnabled} />
    <Label htmlFor="notifications">Enable notifications</Label>
</div>
```

---

## InputOTP (6-digit code)

```tsx
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@repo/ui/components/ui/input-otp"

<InputOTP maxLength={6} value={otp} onChange={setOtp}>
    <InputOTPGroup>
        {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
    </InputOTPGroup>
</InputOTP>
```

---

## Skeleton

```tsx
import { Skeleton } from "@repo/ui/components/ui/skeleton"

<Skeleton className="h-4 w-48 rounded" />
<Skeleton className="h-10 w-10 rounded-full" />
```

---

## EmptyState (custom)

```tsx
import { EmptyState } from "@repo/ui/components/ui/empty-state"

<EmptyState
    icon={<Users className="h-10 w-10" />}
    title="No students found"
    description="Add your first student to get started."
    actionLabel="Add Student"
    onAction={() => router.push('/students/new')}
/>
```

---

## DotmSquare11 (loading dots)

```tsx
import { DotmSquare11 } from "@repo/ui/components/ui/dotm-square-11"

<DotmSquare11 size={16} dotSize={2} speed={1.5} />
```

---

## Collapsible

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@repo/ui/components/ui/collapsible"

<Collapsible open={isOpen} onOpenChange={setIsOpen}>
    <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between">
            Advanced Options
            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </Button>
    </CollapsibleTrigger>
    <CollapsibleContent className="pt-2">
        {/* Hidden content */}
    </CollapsibleContent>
</Collapsible>
```
