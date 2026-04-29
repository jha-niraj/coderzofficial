# Data Tables & Lists

## Table Component Pattern

```tsx
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@repo/ui/components/ui/table"

<div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
    <Table>
        <TableHeader>
            <TableRow className="bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Name
                </TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {rows.map(row => (
                <TableRow key={row.id}
                    className="border-b border-neutral-100 dark:border-neutral-800 cursor-pointer
                               hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-sm text-neutral-500">{row.class}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                        NPR {row.amount.toLocaleString()}
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
</div>
```

---

## Search Bar (above a table)

```tsx
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
    <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
            type="search"
            placeholder="Search students..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl border-neutral-200 bg-neutral-50 text-sm
                       dark:border-neutral-800 dark:bg-neutral-900"
        />
    </div>
    <div className="flex items-center gap-2">
        {/* Filter selects */}
        {/* Action button */}
    </div>
</div>
```

---

## Filter Row

```tsx
<div className="flex flex-wrap gap-2 mb-4">
    <Select value={classFilter} onValueChange={setClassFilter}>
        <SelectTrigger className="h-9 rounded-lg w-36 text-sm border-neutral-200 dark:border-neutral-800">
            <SelectValue placeholder="All Classes" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="">All Classes</SelectItem>
            {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
    </Select>
</div>
```

---

## Table Action Row (top right)

```tsx
<div className="flex items-center gap-2">
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 h-9 rounded-lg">
        <Download className="h-4 w-4" />
        Export
    </Button>
    <Button size="sm" onClick={() => router.push("/students/new")} className="gap-2 h-9 rounded-lg">
        <UserPlus className="h-4 w-4" />
        Add Student
    </Button>
</div>
```

---

## Loading State (table skeleton)

```tsx
import { Skeleton } from "@repo/ui/components/ui/skeleton"

<div className="space-y-2">
    {Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-neutral-100 p-4
                                 dark:border-neutral-800">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
        </div>
    ))}
</div>
```

---

## Pagination

```tsx
import { Pagination, PaginationContent, PaginationItem, PaginationLink,
         PaginationNext, PaginationPrevious } from "@repo/ui/components/ui/pagination"

<div className="flex items-center justify-between mt-4">
    <p className="text-sm text-neutral-500">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
    </p>
    <Pagination>
        <PaginationContent>
            <PaginationItem>
                <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""} />
            </PaginationItem>
            <PaginationItem>
                <PaginationLink isActive>{page}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
                <PaginationNext onClick={() => setPage(p => p + 1)}
                    className={page * pageSize >= total ? "pointer-events-none opacity-50" : ""} />
            </PaginationItem>
        </PaginationContent>
    </Pagination>
</div>
```

---

## Card-based List (alternative to table)

For mobile-friendlier lists:
```tsx
<div className="space-y-3">
    {items.map(item => (
        <div key={item.id}
            className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4
                       dark:border-neutral-800 dark:bg-neutral-900">
            <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    {item.name[0]}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900 dark:text-white truncate">{item.name}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{item.subtitle}</p>
            </div>
            <Badge variant="outline" className="shrink-0">{item.status}</Badge>
        </div>
    ))}
</div>
```

---

## Receivables / Aging Buckets (finance pattern)

```tsx
<div className="grid grid-cols-3 gap-3">
    {buckets.map(bucket => (
        <div key={bucket.label}
            className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                {bucket.label}
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                NPR {bucket.amount.toLocaleString()}
            </p>
            <p className="text-xs text-neutral-400">{bucket.count} bills</p>
        </div>
    ))}
</div>
```

---

## Tab-based Content Sections

```tsx
<Tabs defaultValue="overview" className="w-full">
    <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="income">Income</TabsTrigger>
        <TabsTrigger value="receivables">Receivables</TabsTrigger>
        <TabsTrigger value="alerts">Alerts</TabsTrigger>
    </TabsList>

    <TabsContent value="overview">
        {/* Content */}
    </TabsContent>
    ...
</Tabs>
```

---

## Search + Select Multi-step Pattern (e.g., billing creation)

```tsx
{/* Step 1: Search and select students */}
<div className="relative">
    <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
    <Input
        placeholder="Search by name or ID..."
        value={studentSearch}
        onChange={e => setStudentSearch(e.target.value)}
        className="pl-9 h-10 rounded-xl ..."
    />
</div>

{/* Search results list */}
{searchResults.map(student => (
    <div key={student.id}
        className={cn(
            "flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
            selectedIds.includes(student.id)
                ? "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20"
                : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
        )}
        onClick={() => toggleStudent(student.id)}>
        <Checkbox checked={selectedIds.includes(student.id)} />
        <div>
            <p className="text-sm font-medium">{student.firstName} {student.lastName}</p>
            <p className="text-xs text-neutral-500">{student.currentClass} • {student.section}</p>
        </div>
    </div>
))}
```

---

## Empty Table State

```tsx
{rows.length === 0 && (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <FileSpreadsheet className="h-6 w-6 text-neutral-400" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">
            No records found
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            {searchQuery ? "Try a different search term." : "Add your first record to get started."}
        </p>
        <Button size="sm" onClick={handleCreate}>
            Add First Record
        </Button>
    </div>
)}
```
