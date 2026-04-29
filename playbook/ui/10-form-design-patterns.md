# Form Design Patterns

## General Principles
- All form inputs: `h-11 rounded-xl` (standard height, extra-rounded)
- Input backgrounds: `bg-neutral-50 dark:bg-neutral-900`
- Border: `border-neutral-200 dark:border-neutral-800`
- Focus ring: `focus-visible:ring-orange-500`
- Label: `text-sm font-medium text-neutral-700 dark:text-neutral-300`
- Spacing between fields: `space-y-4`
- Spacing inside a field (label + input): `space-y-1.5`

---

## Form Field Wrapper

```tsx
function FormField({ id, label, children }) {
    return (
        <div className="flex flex-col gap-1.5 sm:gap-3">
            {label && (
                <Label htmlFor={id}
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {label}
                </Label>
            )}
            {children}
        </div>
    )
}
```

---

## Standard Input

```tsx
<Input
    type="text"
    placeholder="..."
    className="h-11 rounded-xl border-neutral-200 bg-neutral-50 text-sm
               placeholder:text-neutral-400 focus-visible:ring-orange-500
               dark:border-neutral-800 dark:bg-neutral-900"
/>
```

---

## Select

```tsx
<Select>
    <SelectTrigger className="h-11 rounded-xl border-neutral-200 bg-neutral-50
                               dark:border-neutral-800 dark:bg-neutral-900">
        <SelectValue placeholder="Select option" />
    </SelectTrigger>
    <SelectContent>
        <SelectItem value="value1">Option 1</SelectItem>
        <SelectItem value="value2">Option 2</SelectItem>
    </SelectContent>
</Select>
```

---

## Date Picker

```tsx
<DatePicker
    value={dateValue}
    onChange={setDateValue}
    className="h-11 rounded-xl border-neutral-200 dark:border-neutral-800"
/>
```

Imported from `@repo/ui/components/ui/date-picker`.

---

## Forgot password / inline link pattern

```tsx
<div className="flex items-center justify-between">
    <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Password</Label>
    <Link href="/forgotpassword" className="text-xs font-medium text-orange-500 hover:text-orange-600">
        Forgot password?
    </Link>
</div>
```

---

## Multi-section Form in Card

```tsx
<Card>
    <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="First Name"><Input ... /></FormField>
            <FormField label="Last Name"><Input ... /></FormField>
        </div>
        <FormField label="Address"><Input ... /></FormField>
    </CardContent>
</Card>
```

---

## Tabbed Form (multiple modes/steps in one form area)

```tsx
<Tabs defaultValue="single" className="w-full">
    <TabsList className="grid w-full grid-cols-2 rounded-xl">
        <TabsTrigger value="single" className="rounded-lg">Single Student</TabsTrigger>
        <TabsTrigger value="bulk" className="rounded-lg">Bulk Import</TabsTrigger>
    </TabsList>

    <TabsContent value="single" className="mt-4">
        {/* Single student form */}
    </TabsContent>

    <TabsContent value="bulk" className="mt-4">
        {/* CSV import UI */}
    </TabsContent>
</Tabs>
```

---

## Form Submit Flow

Loading state uses the `DotmSquare11` dot animation:
```tsx
import { DotmSquare11 } from "@repo/ui/components/ui/dotm-square-11"

<Button type="submit" disabled={isLoading}
    className="h-11 w-full rounded-xl bg-orange-500 font-medium text-white hover:bg-orange-600">
    {isLoading
        ? <><DotmSquare11 size={16} dotSize={2} speed={1.5} className="mr-2 flex-shrink-0" />Saving…</>
        : "Save Changes"
    }
</Button>
```

---

## Toast Notifications (form feedback)

```tsx
import { toast } from "@repo/ui/components/ui/sonner"

// Success
toast.success("Student created!", {
    description: "The student record has been saved."
})

// Error
toast.error("Failed to save", {
    description: "Please check the form and try again."
})
```

---

## Inline Validation Error

```tsx
{errors.email && (
    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
)}
```

Block-level error (same as auth):
```tsx
{error && (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700
                    dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
        {error}
    </div>
)}
```

---

## Avatar / Image Upload

```tsx
<div className="flex items-center gap-4">
    <Avatar className="h-16 w-16">
        <AvatarImage src={previewUrl} />
        <AvatarFallback className="text-lg font-bold">{initials}</AvatarFallback>
    </Avatar>
    <div>
        <Button variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload photo
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
        </Button>
        <p className="mt-1 text-xs text-neutral-500">JPG, PNG up to 2MB</p>
    </div>
</div>
```

---

## Bulk Import (CSV/Excel)

```tsx
{/* Drop zone */}
<div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed
                border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-neutral-900
                transition-colors hover:border-orange-300 hover:bg-orange-50/30 cursor-pointer"
     onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
    <Upload className="h-8 w-8 text-neutral-400" />
    <div className="text-center">
        <p className="text-sm font-medium text-neutral-900 dark:text-white">Drop your file here</p>
        <p className="text-xs text-neutral-500">or click to browse (.xlsx, .csv)</p>
    </div>
</div>

{/* Download template button */}
<Button variant="outline" size="sm" className="gap-2">
    <Download className="h-4 w-4" />
    Download Template
</Button>
```

---

## Sheet (Slide-over Form)

For creating/editing records without leaving the page:
```tsx
<Sheet>
    <SheetTrigger asChild>
        <Button><UserPlus className="h-4 w-4 mr-2" />Add Member</Button>
    </SheetTrigger>
    <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
            <SheetTitle>Add New Member</SheetTitle>
            <SheetDescription>Fill in the details below.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
            {/* Form fields */}
        </div>
    </SheetContent>
</Sheet>
```

---

## Checkbox with label

```tsx
<div className="flex items-center gap-2">
    <Checkbox id="isActive" checked={formData.isActive}
              onCheckedChange={v => setFormData(p => ({...p, isActive: !!v}))} />
    <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
        Active student
    </Label>
</div>
```
