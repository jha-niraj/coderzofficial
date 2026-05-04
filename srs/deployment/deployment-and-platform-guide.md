# SalesCRM — Complete Platform & Deployment Guide

> **Purpose of this document:** A full technical reference covering how this platform is built, how every feature works, and exactly how it is deployed to Cloudflare Workers. Written to be self-contained — you should be able to rebuild this platform on a new project by reading this file alone.

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Tech Stack — Every Library Explained](#2-tech-stack--every-library-explained)
3. [Repository Structure](#3-repository-structure)
4. [Database Schema — All 13 Tables](#4-database-schema--all-13-tables)
5. [Authentication & Roles](#5-authentication--roles)
6. [Feature-by-Feature Breakdown](#6-feature-by-feature-breakdown)
7. [API Routes](#7-api-routes)
8. [Third-Party Integrations](#8-third-party-integrations)
9. [Environment Variables](#9-environment-variables)
10. [Local Development Setup](#10-local-development-setup)
11. [Cloudflare Deployment — Full Walkthrough](#11-cloudflare-deployment--full-walkthrough)
12. [Configuration Files Explained](#12-configuration-files-explained)
13. [Database Migrations](#13-database-migrations)
14. [Seed Script — Demo Data](#14-seed-script--demo-data)
15. [Architectural Patterns Used](#15-architectural-patterns-used)
16. [Replicating This Platform on a New Project](#16-replicating-this-platform-on-a-new-project)

---

## 1. Platform Overview

SalesCRM is a purpose-built sales CRM for a jewelry wholesale business. It manages the full lifecycle of a prospect — from first contact at a trade show through to becoming an active paying customer.

### The 6-Stage Pipeline

Every lead in the system passes through these stages in order:

```
New → Demo Scheduled → Demo Completed → First Request Submitted → First Order Placed → Active Customer
```

Stage transitions are triggered three ways:
1. **Manually** — a rep clicks "Move to next stage"
2. **Automatically** — a customer books a demo (advances `new → demo_scheduled`)
3. **Via webhook** — the external customer portal fires an event when an order is placed

### Two User Roles

| Role | What they can do |
|------|-----------------|
| **Admin** | Full access — all leads, all reps, dashboard analytics, user management, template management, timing rules |
| **Sales Rep (user)** | Their own leads only, their own tasks, their own appointments, email templates (read), scheduling links |

---

## 2. Tech Stack — Every Library Explained

### Core Framework

| Package | Version | Why it's used |
|---------|---------|---------------|
| `next` | ^15.3.5 | The full-stack React framework. Uses App Router (not Pages Router). Handles routing, server components, server actions, and API routes. |
| `react` / `react-dom` | 18 | UI rendering library. |
| `typescript` | ~5.8.0 | Static typing across the entire codebase. |

### Database

| Package | Version | Why it's used |
|---------|---------|---------------|
| `drizzle-orm` | ^0.45.0 | TypeScript-first ORM. Write SQL-like queries with full type safety. Replaces Prisma in this stack. |
| `drizzle-kit` | ^0.31.8 | CLI tool for generating and running database migrations from the Drizzle schema. |
| `drizzle-zod` | ^0.8.0 | Auto-generates Zod validation schemas from Drizzle table definitions. Avoids duplication. |
| `@neondatabase/serverless` | ^1.0.2 | Neon PostgreSQL client that works in serverless/edge environments (including Cloudflare Workers). Uses HTTP instead of TCP connections. |

### Authentication

| Package | Version | Why it's used |
|---------|---------|---------------|
| `better-auth` | ^1.4.18 | Full-featured auth library. Handles sessions, email+password, password reset, and role-based access via its admin plugin. Has a Drizzle adapter. |

**Why better-auth instead of NextAuth?** better-auth has native support for the Drizzle adapter, a built-in admin plugin with RBAC, and works cleanly with Cloudflare Workers (no Node.js-only dependencies).

### UI Framework

| Package | Version | Why it's used |
|---------|---------|---------------|
| `tailwindcss` | ^3.4.17 | Utility-first CSS. All styling is done via Tailwind classes. |
| `@radix-ui/*` | various | Unstyled, accessible UI primitives (dialogs, dropdowns, selects, etc.). Shadcn/ui is built on top of these. |
| `class-variance-authority` | ^0.7.1 | Creates type-safe variant APIs for components (e.g., `Button` with `size` and `variant` props). |
| `tailwind-merge` | ^3.3.1 | Merges Tailwind class strings intelligently — prevents conflicts when combining class names. |
| `clsx` | ^2.1.1 | Conditionally joins class names. Used together with `tailwind-merge` in the `cn()` utility. |
| `lucide-react` | ^0.563.0 | Icon library. Used for all icons throughout the UI. |
| `sonner` | ^2.0.7 | Toast notification library. Appears at bottom of screen for success/error feedback. |
| `next-themes` | ^0.4.6 | Dark/light mode theme switching. |

### Forms & Validation

| Package | Version | Why it's used |
|---------|---------|---------------|
| `react-hook-form` | ^7.71.1 | Performant form state management. Minimal re-renders. |
| `@hookform/resolvers` | ^5.2.2 | Connects Zod schemas to react-hook-form for validation. |
| `zod` | ^3.25.1 | Schema validation library. Used for API input validation, form validation, and type inference. |

### Data Fetching & Server Actions

| Package | Version | Why it's used |
|---------|---------|---------------|
| `@tanstack/react-query` | ^5.80.7 | Client-side data fetching, caching, and invalidation. Used for queries that need to refetch on the client. |
| `next-safe-action` | ^7.10.4 | Type-safe wrapper around Next.js Server Actions. Adds input validation via Zod and middleware support. |

### Data Tables

| Package | Version | Why it's used |
|---------|---------|---------------|
| `@tanstack/react-table` | ^8.21.3 | Headless table library. Powers the leads list, tasks list, and appointments table. |

### Charts & Analytics

| Package | Version | Why it's used |
|---------|---------|---------------|
| `@nivo/*` | ^0.99.0 | Comprehensive React chart library (bar, line, pie, funnel, heatmap, etc.). Used for the admin dashboard analytics. |
| `recharts` | 2.15.4 | Secondary chart library. Used for simpler chart needs. |
| `echarts` / `echarts-for-react` | ^6.0.0 | ECharts wrapper — used for specific complex visualizations. |

### Animations

| Package | Version | Why it's used |
|---------|---------|---------------|
| `motion` / `framer-motion` | ^12.23.x | Animation library. Used on login page, page transitions, and UI micro-interactions. |
| `canvas-confetti` | ^1.9.3 | Confetti animation — fires when a lead reaches "Active Customer" stage. |

### Drag & Drop

| Package | Version | Why it's used |
|---------|---------|---------------|
| `@dnd-kit/core` | ^6.3.1 | Drag-and-drop primitives. Used for reordering items in lists. |
| `@dnd-kit/sortable` | ^10.0.0 | Sortable list extension for dnd-kit. |

### Date & Time

| Package | Version | Why it's used |
|---------|---------|---------------|
| `date-fns` | ^4.1.0 | Date manipulation and formatting. Used throughout for date display and calculation. |
| `react-day-picker` | ^9.13.0 | Calendar date picker component. Used in the scheduling booking flow. |

### Deployment (Cloudflare)

| Package | Version | Why it's used |
|---------|---------|---------------|
| `@opennextjs/cloudflare` | ^1.14.7 | Adapter that compiles a Next.js app to run on Cloudflare Workers. Handles SSR, API routes, caching. |
| `wrangler` | ^4.60.0 | Cloudflare's CLI. Used to deploy the worker, manage R2 buckets, and set secrets. |

### Other Utilities

| Package | Version | Why it's used |
|---------|---------|---------------|
| `handlebars` | ^4.7.8 | Template engine. Used to merge `{{rep_name}}`, `{{company_name}}` placeholders in email templates. |
| `aws4fetch` | ^1.0.20 | AWS Signature V4 signing for R2 file uploads (Cloudflare R2 uses S3-compatible API). |
| `react-phone-number-input` | ^3.4.16 | International phone number input with flag picker. |
| `cmdk` | ^1.1.1 | Command palette component (`⌘K`). |
| `vaul` | ^1.1.2 | Drawer/sheet component. Used for mobile-friendly slide-up panels. |
| `embla-carousel-react` | ^8.6.0 | Carousel component. |
| `input-otp` | ^1.4.2 | OTP/PIN input component. |

---

## 3. Repository Structure

```
salescrm/
├── src/
│   ├── app/                        # Next.js App Router — all routes live here
│   │   ├── (admin)/                # Route group: admin-only pages
│   │   │   └── admin/
│   │   │       ├── dashboard/      # Analytics dashboard (admin only)
│   │   │       ├── users/          # User management
│   │   │       ├── templates/      # Email template management
│   │   │       └── settings/       # Follow-up timing rules, platform settings
│   │   ├── (app)/                  # Route group: authenticated rep pages
│   │   │   ├── leads/              # Lead list + lead detail [id]
│   │   │   ├── tasks/              # Follow-up tasks
│   │   │   ├── schedule/           # Appointments view
│   │   │   ├── templates/          # Email templates (rep: read-only)
│   │   │   ├── trade-shows/        # Trade show events
│   │   │   └── settings/           # User account settings
│   │   ├── (auth)/                 # Login, reset password pages (unauthenticated)
│   │   ├── (public)/               # Public booking page /book/[linkId]
│   │   └── api/                    # API routes
│   │       ├── auth/[...all]/      # better-auth catch-all handler
│   │       ├── auth/google-calendar/callback/  # Google Calendar OAuth callback
│   │       ├── webhooks/portal/    # Inbound portal webhook endpoint
│   │       ├── webhooks/resend/    # Resend email webhook
│   │       ├── scheduling/available-dates/     # Slot availability API
│   │       ├── email/upload-attachment/        # R2 file upload
│   │       └── cron/appointment-reminders/     # 24hr reminder cron
│   │
│   ├── components/                 # Shared UI components
│   │   ├── ui/                     # Shadcn/ui primitives (button, input, dialog, etc.)
│   │   ├── layout/                 # App shell (sidebar, header, dashboard-header)
│   │   ├── blocks/                 # Complex reusable feature blocks
│   │   └── charts/                 # Chart wrapper components
│   │
│   ├── db/                         # Database layer
│   │   ├── index.ts                # Drizzle client (connects to Neon via DATABASE_URL)
│   │   └── schema/
│   │       ├── schema.ts           # All 13 table definitions + relations (1137 lines)
│   │       └── index.ts            # Re-exports schema + db
│   │
│   ├── features/                   # Feature modules (each = one domain)
│   │   ├── auth/                   # User creation, invite flow
│   │   ├── leads/                  # Lead CRUD, pipeline moves, email sending
│   │   ├── tasks/                  # Follow-up task management
│   │   ├── scheduling/             # Booking links, public booking flow, appointments
│   │   ├── trade-shows/            # Trade show CRUD
│   │   ├── email-templates/        # Template CRUD + Handlebars rendering
│   │   ├── timeline/               # Activity log entries
│   │   ├── notifications/          # In-app + email notifications
│   │   ├── reports/                # Dashboard analytics queries
│   │   ├── dashboard/              # Dashboard widgets
│   │   ├── webhooks/               # Portal webhook processing
│   │   └── landing/                # Login page components
│   │
│   ├── guesto/                     # Third-party integration wrappers
│   │   ├── google-calendar/        # Google Calendar OAuth + event CRUD
│   │   ├── r2/                     # Cloudflare R2 file storage
│   │   └── resend/                 # Resend email API wrapper
│   │
│   ├── lib/                        # Shared utilities
│   │   ├── auth/
│   │   │   ├── server.ts           # better-auth server config (THE auth instance)
│   │   │   ├── client.ts           # better-auth browser client
│   │   │   └── permissions.ts      # RBAC roles and resource permissions
│   │   ├── safe-action.ts          # next-safe-action client setup
│   │   └── utils.ts                # cn() helper, misc utilities
│   │
│   ├── hooks/                      # Shared React hooks
│   ├── providers/                  # React context providers (QueryClient, Theme, etc.)
│   └── types/                      # Global TypeScript types (SessionUser, etc.)
│
├── scripts/
│   ├── seed-admin.ts               # Bootstrap: creates first admin user
│   └── seed.ts                     # Full demo data seed (45 leads, all models)
│
├── migrations/                     # Drizzle-generated SQL migration files
│   └── 0000_cool_bulldozer.sql     # Initial schema migration
│
├── patches/
│   └── better-auth@1.4.18.patch    # Patch for better-auth Cloudflare compatibility
│
├── public/                         # Static assets (logos, images)
├── srs/                            # Requirements + documentation
├── package.json
├── wrangler.jsonc                  # Cloudflare Workers deployment config
├── open-next.config.ts             # OpenNext Cloudflare adapter config
├── next.config.ts                  # Next.js configuration
├── drizzle.config.ts               # Database migration config
└── tsconfig.json                   # TypeScript compiler config
```

---

## 4. Database Schema — All 13 Tables

The ORM is **Drizzle ORM** with a PostgreSQL database (hosted on **Neon**). All tables are defined in `src/db/schema/schema.ts`.

### 4.1 Auth Tables (managed by better-auth)

#### `user`
The platform user. Fields added beyond better-auth defaults:
```
id            text PK
name          text
email         text UNIQUE
emailVerified boolean
image         text (nullable)
role          text  ← 'admin' | 'user' (added by admin plugin)
banned        boolean
banReason     text
banExpires    timestamp
createdAt / updatedAt
```

#### `session`
Active login sessions. One row per logged-in device.
```
id, expiresAt, token (UNIQUE), ipAddress, userAgent
userId → user.id (CASCADE)
impersonatedBy (for admin impersonation)
```

#### `account`
OAuth provider accounts. For email+password, stores the hashed password here.
```
id, accountId, providerId ('credential' for email+password)
userId → user.id (CASCADE)
accessToken, refreshToken, password (hashed)
```

#### `verification`
Email verification and password reset tokens.
```
id, identifier (email), value (token), expiresAt
```

---

### 4.2 Core CRM Tables

#### `trade_shows`
Physical trade show events attended by the sales team.
```
id            text PK
name          text (e.g. "JCK Las Vegas 2026")
location      text (e.g. "Venetian Expo, Las Vegas, NV")
timezone      text (IANA, e.g. "America/Los_Angeles")
startDate     date  ← DATE type, not timestamptz
endDate       date
notes         text (nullable)
createdBy     text → user.id (RESTRICT)
```
**Constraint:** `end_date >= start_date`

#### `scheduling_links`
Public booking URLs. The `id` IS the URL token (`/book/[id]`).
```
id            text PK  ← doubles as the URL slug
userId        text → user.id (CASCADE)  ← the rep who owns this link
type          text  ← 'trade_show' | 'virtual_demo'
durationOptions  integer[]  ← [30, 45, 60] — customer picks one
tradeShowId   text → trade_shows.id (SET NULL) — only for trade_show type
timezone      text  ← venue TZ for trade_show; null for virtual_demo
isActive      boolean (default true)
availabilityWindows  jsonb  ← [{day_of_week: 1, start_time: "09:00", end_time: "17:00"}]
```
`day_of_week`: 0 = Sunday, 1 = Monday … 6 = Saturday

#### `leads`
The core entity. One row = one prospect/customer.
```
id              text PK
companyName     text  ← required
contactName     text  ← required
email           text (nullable)
phone           text (nullable)
leadSource      text  ← 'trade_show' | 'referral' | 'partnership' | 'advertisements'
initialInterest text  ← 'custom_jewelry' | 'stock_programs' (nullable)
pipelineStage   text  ← 'new' | 'demo_scheduled' | 'demo_completed' |
                        'first_request_submitted' | 'first_order_placed' | 'active_customer'
stageEnteredAt  timestamptz  ← reset to NOW() on each stage change
notes           text (nullable)
assignedTo      text → user.id (SET NULL)  ← the responsible rep
createdBy       text → user.id (RESTRICT)
tradeShowId     text → trade_shows.id (SET NULL)  ← if lead_source = 'trade_show'
portalCustomerId text UNIQUE  ← matches inbound webhook events to this lead
orderCount      integer (default 0)
orderTotalValue numeric(12,2) (default 0)
portalAutoAdvanceBlocked boolean  ← if true, webhooks won't auto-advance stage
```

#### `appointments`
Created when a customer submits the public booking form.
```
id                    text PK
schedulingLinkId      text → scheduling_links.id (RESTRICT)
repUserId             text → user.id (RESTRICT)
leadId                text → leads.id (SET NULL)  ← null if unrecognized booker
tradeShowId           text → trade_shows.id (SET NULL)
customerName          text
customerEmail         text
customerCompany       text (nullable)
customerNotes         text (nullable)
appointmentType       text  ← 'trade_show' | 'virtual_demo'
durationMinutes       integer
scheduledAt           timestamptz  ← absolute UTC time of meeting
timezoneDisplay       text  ← IANA TZ shown to customer
status                text  ← 'confirmed' | 'rescheduled' | 'cancelled' | 'completed'
googleCalendarEventId text (nullable)  ← for calendar sync updates/deletes
googleMeetLink        text (nullable)
isUnrecognizedBooker  boolean  ← true if email didn't match any lead
reminderSentAt        timestamptz  ← set when 24hr reminder is sent
```

#### `follow_up_tasks`
The daily workflow for sales reps. Auto-generated by the system on stage changes, or manually created by reps.
```
id                    text PK
leadId                text → leads.id (CASCADE)  ← nullable for manual tasks
assignedTo            text → user.id (RESTRICT)
createdBy             text → user.id (SET NULL)  ← null for auto-generated
title                 text
description           text (nullable)
dueAt                 timestamptz
reminderAt            timestamptz (nullable)  ← custom reminder time
status                text  ← 'pending' | 'completed'
outcomeNotes          text (nullable)  ← filled in when marking complete
completedAt           timestamptz  ← required when status = 'completed'
isAutoGenerated       boolean
pipelineStageTrigger  text  ← which stage triggered creation (auto tasks only)
```

#### `email_templates`
Admin-managed library of email templates with Handlebars merge fields.
```
id            text PK
name          text
pipelineStage text  ← 'new' | 'demo_scheduled' | ... | 'active_customer' | 'general'
subject       text  ← supports {{company_name}}, {{contact_name}}, {{rep_name}}, {{rep_email}}
body          text  ← Handlebars template body
createdBy     text → user.id (RESTRICT)
updatedBy     text → user.id (SET NULL)
```

---

### 4.3 Activity & Audit Tables

#### `activity_timeline`
Append-only event log per lead. **Never updated after insert.**
```
id          text PK
leadId      text → leads.id (CASCADE)
actorUserId text → user.id (SET NULL)  ← null for System events
actorLabel  text  ← user's name, or 'System'
eventType   text  ← one of:
                   'lead_created' | 'lead_edited' | 'stage_changed' |
                   'stage_override' | 'email_sent' | 'email_prepared' |
                   'appointment_booked' | 'appointment_completed' |
                   'appointment_cancelled' | 'appointment_rescheduled' |
                   'task_completed' | 'portal_webhook' |
                   'note_added' | 'file_uploaded'
metadata    jsonb  ← shape depends on eventType (see below)
createdAt   timestamptz
```

**Metadata shapes by event type:**
```json
stage_changed:          { "from": "new", "to": "demo_scheduled" }
email_sent:             { "template_id": "...", "subject": "...", "to": "..." }
appointment_booked:     { "appointment_id": "...", "scheduled_at": "ISO string" }
task_completed:         { "task_id": "...", "outcome_notes": "..." }
portal_webhook:         { "event": "order_placed", "order_id": "ORD-1234", "order_total": 4200 }
note_added:             { "content": "..." }
file_uploaded:          { "filename": "quote.pdf", "file_key": "leads/abc/quote.pdf", "mime_type": "application/pdf" }
lead_edited:            { "changed_fields": ["email", "phone"] }
```

#### `file_attachments`
Files uploaded against a lead, stored in Cloudflare R2.
```
id            text PK
leadId        text → leads.id (CASCADE)
uploadedBy    text → user.id (RESTRICT)
filename      text  ← original filename shown in UI
fileKey       text UNIQUE  ← R2 object key (used to generate presigned URLs)
fileSizeBytes integer
mimeType      text
createdAt     timestamptz
```
**Note:** The URL is never stored — presigned URLs are generated on demand via the R2 client.

---

### 4.4 Configuration & System Tables

#### `follow_up_timing_rules`
One row per non-terminal pipeline stage. Controls when auto-generated tasks are due.
```
id             text PK
pipelineStage  text UNIQUE  ← 'new' | 'demo_scheduled' | ... | 'first_order_placed'
timingValue    integer  ← e.g. 2
timingUnit     text     ← 'hours' | 'days' | 'business_days' | 'weeks'
```
Example: `timingValue=2, timingUnit='business_days'` → task due 2 business days after stage entry.

#### `notifications`
In-app notification inbox. One row per recipient per event.
```
id            text PK
userId        text → user.id (CASCADE)
type          text  ← 'task_created' | 'task_assigned' | 'stage_changed_webhook' |
                      'unrecognized_booker' | 'appointment_confirmed' |
                      'appointment_rescheduled' | 'appointment_cancelled'
title         text  ← short summary line
body          text (nullable)
isRead        boolean (default false)
readAt        timestamptz (nullable)
linkType      text  ← 'lead' | 'task' | 'appointment'
linkId        text  ← entity id to navigate to on click
relatedLeadId        text → leads.id (CASCADE)
relatedTaskId        text → follow_up_tasks.id (CASCADE)
relatedAppointmentId text → appointments.id (CASCADE)
```

#### `user_google_calendars`
OAuth tokens for Google Calendar integration. One record per user.
```
id              text PK
userId          text UNIQUE → user.id (CASCADE)
googleEmail     text  ← shown in UI to confirm which account is connected
accessToken     text  ← encrypted before storage
refreshToken    text  ← encrypted before storage
tokenExpiresAt  timestamptz
scope           text  ← OAuth scopes granted
connectedAt     timestamptz
```

---

## 5. Authentication & Roles

### How Authentication Works

This platform uses **better-auth** (`src/lib/auth/server.ts`).

```typescript
// src/lib/auth/server.ts
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  plugins: [
    admin({
      ac,                    // access control instance
      roles: { admin: adminRole, user: userRole },
      defaultRole: 'user',
    }),
  ],
});
```

The auth instance is a singleton. It handles:
- **Session management** — creates/reads/destroys sessions stored in the `session` table
- **Email+password** — hashes passwords with argon2, stores in `account.password`
- **Password reset** — generates a token, emails a reset link via Resend
- **Admin plugin** — adds role field to user, enables user management via `auth.api.createUser()`

### RBAC — Resource Permissions

Defined in `src/lib/auth/permissions.ts`:

```typescript
// Resources and their allowed actions
const statement = {
  ...defaultStatements,         // user, session management
  lead: ["create", "read", "update", "delete"],
  task: ["create", "read", "update", "delete"],
  appointment: ["read"],
  tradeShow: ["create", "read", "update", "delete"],
  emailTemplate: ["create", "read", "update", "delete"],
  timeline: ["create", "read"],
  fileAttachment: ["create", "read"],
  notification: ["read", "update"],
  report: ["read"],
  settings: ["read", "update"],
};

// Admin: full access to everything
export const adminRole = ac.newRole({ ...all permissions });

// User (Sales Rep): same permissions, but data is scoped to owned records
// Scoping is enforced at the QUERY layer, not here
export const userRole = ac.newRole({ ...same permissions });
```

**Important:** RBAC defines what actions are allowed. Data scoping (e.g. "reps can only see their own leads") is enforced in the database query layer — every rep query includes `WHERE assigned_to = userId`.

### Checking Authentication in Server Components

```typescript
import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';

const session = await auth.api.getSession({ headers: await headers() });
if (!session) redirect('/login');
const user = session.user; // has id, name, email, role
```

### Checking Authentication in Server Actions

```typescript
// src/lib/safe-action.ts defines action clients
export const actionClient = createSafeActionClient();
export const authActionClient = createSafeActionClient().use(async ({ next }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');
  return next({ ctx: { user: session.user } });
});
export const adminActionClient = authActionClient.use(async ({ next, ctx }) => {
  if (ctx.user.role !== 'admin') throw new Error('Forbidden');
  return next({ ctx });
});
```

---

## 6. Feature-by-Feature Breakdown

### 6.1 Lead Management

**Location:** `src/features/leads/`

**What it does:**
- Create, view, edit, delete leads
- Move leads between pipeline stages
- View all leads in a kanban-style board or list view
- Filter by stage, lead source, assigned rep, date range
- Assign leads to reps

**Key files:**
- `actions/create-lead.ts` — Server action for creating a lead; also creates the first timeline entry and auto-generates the initial follow-up task
- `actions/change-lead-stage.ts` — Handles stage transitions; creates a `stage_changed` timeline entry, generates a new follow-up task based on `follow_up_timing_rules`, sends an email notification to the rep
- `actions/delete-lead.ts` — Cascade-deletes timeline, tasks, notifications, attachments
- `queries/get-leads.ts` — Role-aware query: admins get all leads, reps get only assigned leads

**Pipeline stage rules:**
- `portalAutoAdvanceBlocked = true` → inbound portal webhooks will NOT advance the stage
- `stageEnteredAt` is reset on every stage change → used for analytics (time-in-stage)

---

### 6.2 Follow-Up Tasks

**Location:** `src/features/tasks/`

**What it does:**
- Auto-generated tasks when a lead enters any non-terminal stage
- Manual tasks can be created by reps (with or without an associated lead)
- Due date calculated from `follow_up_timing_rules` for auto tasks
- Reps can mark tasks complete, add outcome notes
- Overdue tasks shown prominently

**Auto-task creation flow:**
1. Lead stage changes to (e.g.) `demo_completed`
2. `change-lead-stage.ts` reads the timing rule for `demo_completed` (e.g., 3 business days)
3. Calculates `dueAt = now + 3 business days`
4. Inserts a `follow_up_tasks` row with `isAutoGenerated = true`
5. Sends an in-app notification + email to the assigned rep

**Business days calculation:** Skips Saturday and Sunday when calculating due dates.

---

### 6.3 Appointment Scheduling

**Location:** `src/features/scheduling/`

**How the public booking flow works:**

```
Customer visits /book/[linkId]
        ↓
Frontend loads the scheduling link data (getSchedulingLinkPublic)
        ↓
Customer picks a date on the calendar
        ↓
GET /api/scheduling/available-dates
  → reads rep's availability_windows for that day
  → reads rep's existing confirmed/rescheduled appointments
  → subtracts occupied slots
  → returns free time slots
        ↓
Customer picks a slot and fills in name/email/company/notes
        ↓
bookAppointment server action runs:
  1. Race-condition check: re-verify slot is still free
  2. Match customer email → lead (sets isUnrecognizedBooker if no match)
  3. Create Google Calendar event with Meet link (if rep has calendar connected)
  4. Insert appointment row
  5. If lead was in 'new' stage → auto-advance to 'demo_scheduled'
  6. Create activity timeline entry
  7. Send confirmation emails (customer + rep) via Resend
  8. Create in-app notification for rep
```

**Two types of scheduling links:**

| Type | Timezone | Trade Show |
|------|----------|------------|
| `trade_show` | Fixed to venue's IANA TZ | Linked to a trade_shows row |
| `virtual_demo` | Customer's browser-detected TZ | No trade show |

**Reschedule / Cancel flow:** Customer can use the links in the confirmation email. These call `reschedule-appointment.ts` or `cancel-appointment.ts` server actions, which update the appointment status, update the Google Calendar event, and notify the rep.

**24-hour reminder:** `GET /api/cron/appointment-reminders` is meant to be called by a cron job. It finds all `confirmed` appointments where `scheduled_at` is ~24 hours away and `reminder_sent_at IS NULL`, sends reminder emails, and sets `reminder_sent_at`.

---

### 6.4 Email Templates

**Location:** `src/features/email-templates/`

**What it does:**
- Admins create templates organized by pipeline stage
- Reps open an email drawer on a lead detail page, pick a template relevant to the current stage
- Template body supports Handlebars merge fields: `{{company_name}}`, `{{contact_name}}`, `{{rep_name}}`, `{{rep_email}}`
- Rendered server-side with Handlebars before being sent via Resend

**Merge fields:**
```handlebars
Hi {{contact_name}},

Thank you for your interest. I'm {{rep_name}} from SalesCRM.
Looking forward to connecting with {{company_name}}.

{{rep_name}}
{{rep_email}}
```

**Email sending:** The actual send goes through `src/guesto/resend/` (the Resend API wrapper). After sending, a `email_sent` timeline entry is created on the lead.

---

### 6.5 Trade Shows

**Location:** `src/features/trade-shows/`

**What it does:**
- Admins create trade show events (name, location, timezone, dates)
- When a trade show is created, a scheduling link is automatically created for it
- Leads can be tagged with `tradeShowId` when `leadSource = 'trade_show'`
- Trade show page shows all leads from that show, appointments, and the booking link

---

### 6.6 Activity Timeline

**Location:** `src/features/timeline/`

**What it does:**
- Append-only log of everything that happens on a lead
- Shows in chronological order on the lead detail page
- Actors are either the logged-in user (name shown) or "System" (automated events)
- Admin can see all events; reps see events on their leads

**Creating a timeline entry:**
```typescript
// src/features/timeline/actions/create-timeline-entry.ts
await createTimelineEntry({
  leadId: 'lead-uuid',
  actorUserId: session.user.id,  // or null for System
  actorLabel: session.user.name, // or 'System'
  eventType: 'note_added',
  metadata: { content: 'Called customer, left voicemail.' },
});
```

---

### 6.7 Portal Webhook Integration

**Location:** `src/app/api/webhooks/portal/` + `src/features/webhooks/`

**What it does:**
The external customer portal (where customers submit custom orders) fires webhooks to this CRM when key events happen. The CRM uses these to auto-advance the lead's pipeline stage.

**Endpoint:** `POST /api/webhooks/portal`

**How it works:**
1. Portal fires a webhook with a payload identifying the customer (`portalCustomerId`) and the event type
2. The CRM finds the matching lead via `leads.portalCustomerId`
3. Based on the event type, it may advance the pipeline stage:
   - `request_submitted` → advance to `first_request_submitted`
   - `order_placed` → advance to `first_order_placed`, increment `orderCount`, update `orderTotalValue`
4. Creates a `portal_webhook` timeline entry
5. Sends a `stage_changed_webhook` notification to the rep
6. If `portalAutoAdvanceBlocked = true` on the lead → skip stage advance (rep took manual control)

---

### 6.8 Notifications

**Location:** `src/features/notifications/`

**Two delivery channels:**
1. **In-app** — stored in `notifications` table, shown in the bell icon dropdown (max 20 most recent)
2. **Email** — sent via `send-email-notification.ts` for high-priority events only

**Events that trigger in-app notifications:**
- `task_created` — new auto-generated task
- `task_assigned` — rep assigned a task from another user
- `appointment_confirmed` — customer booked via scheduling link
- `unrecognized_booker` — customer booked but email doesn't match any lead
- `stage_changed_webhook` — portal webhook advanced a lead
- `appointment_rescheduled` / `appointment_cancelled`

**Events that also send email:**
- `task_created` (auto-generated tasks only)
- `stage_changed_webhook`

---

### 6.9 Admin Dashboard / Reports

**Location:** `src/features/reports/`, `src/app/(admin)/admin/dashboard/`

**Metrics surfaced:**
- Pipeline funnel (how many leads at each stage)
- Lead volume by source (trade show vs referral vs partnership vs ads)
- Stage conversion rates (what % move from stage N to stage N+1)
- Average time-in-stage (using `stage_entered_at`)
- Overdue follow-up tasks by rep
- Revenue pipeline (sum of `order_total_value` by stage)
- Activity heatmap (timeline events per day)

---

## 7. API Routes

All API routes are in `src/app/api/`:

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/auth/[...all]` | `*` | — | better-auth catch-all (login, logout, session, reset password) |
| `/api/auth/google-calendar/callback` | `GET` | Authenticated | Google Calendar OAuth callback — exchanges code for tokens, stores in `user_google_calendars` |
| `/api/webhooks/portal` | `POST` | Webhook secret | Inbound events from the customer portal |
| `/api/webhooks/resend` | `POST` | Webhook secret | Resend email delivery events (bounces, opens) |
| `/api/scheduling/available-dates` | `GET` | Public | Returns available time slots for a scheduling link on a given date |
| `/api/email/upload-attachment` | `POST` | Authenticated | Uploads a file to R2, returns the file key |
| `/api/cron/appointment-reminders` | `GET` | Cron secret | Sends 24hr reminder emails for upcoming appointments |

---

## 8. Third-Party Integrations

### 8.1 Neon (PostgreSQL Database)

**What it is:** Serverless PostgreSQL. Connection via HTTP (not TCP) — required for Cloudflare Workers which don't support persistent TCP connections.

**How it's configured:**
```typescript
// src/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });
```

**Environment variable:** `DATABASE_URL=postgresql://user:pass@host/dbname`

---

### 8.2 Resend (Email)

**What it is:** Transactional email API. Used for all outbound emails (password reset, appointment confirmations, task notifications).

**Wrapper:** `src/guesto/resend/` — a thin wrapper around the Resend REST API.

**How it's used:**
```typescript
const resend = new GuestoResendAPI({ apiKey: process.env.RESEND_API_KEY });
await resend.sendEmail({
  from: process.env.RESEND_FROM_EMAIL,
  to: 'customer@example.com',
  subject: 'Your appointment is confirmed',
  html: '<p>...</p>',
});
```

**Environment variables:**
- `RESEND_API_KEY` — your Resend API key
- `RESEND_FROM_EMAIL` — the verified sender address (e.g. `noreply@yourdomain.com`)

---

### 8.3 Google Calendar

**What it is:** OAuth 2.0 integration. Sales reps connect their Google Calendar so that booked appointments automatically create calendar events with Google Meet links.

**OAuth flow:**
1. Rep clicks "Connect Google Calendar" in Settings
2. Redirect to `/api/auth/google-calendar/callback` with `state` containing the user ID
3. Google returns `code` → exchange for `access_token` + `refresh_token`
4. Tokens are **encrypted** before storing in `user_google_calendars`
5. On appointment booking, `getCalendarClient(userId)` decrypts and uses the tokens

**What it creates on booking:**
- A Google Calendar event on the rep's calendar
- Attendees: customer + rep
- Google Meet link auto-generated
- Description includes customer notes

**Environment variables:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (e.g. `https://yourapp.com/api/auth/google-calendar/callback`)
- `ENCRYPTION_KEY` — for encrypting/decrypting OAuth tokens at rest

---

### 8.4 Cloudflare R2 (File Storage)

**What it is:** S3-compatible object storage from Cloudflare. Used for file attachments uploaded to lead records.

**How it works:**
1. Rep uploads a file from the lead detail page
2. `POST /api/email/upload-attachment` receives the file, streams it to R2
3. R2 returns an object key (e.g. `leads/abc123/quote.pdf`)
4. The `file_key` is stored in `file_attachments` (never the URL — URLs expire)
5. When displaying, the server generates a presigned URL on demand

**Environment variables:**
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_ACCOUNT_ID`

---

## 9. Environment Variables

Create a `.env` file at the project root with the following:

```bash
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# ── Auth ──────────────────────────────────────────────────────────────────────
BETTER_AUTH_SECRET=your-32-char-random-secret-here
BETTER_AUTH_URL=https://your-deployment-url.com  # or http://localhost:3000 for dev

# ── Email ─────────────────────────────────────────────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# ── Google Calendar ───────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx
GOOGLE_REDIRECT_URI=https://your-deployment-url.com/api/auth/google-calendar/callback
ENCRYPTION_KEY=32-char-hex-string-for-token-encryption

# ── Cloudflare R2 ─────────────────────────────────────────────────────────────
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_ACCOUNT_ID=your-cloudflare-account-id

# ── Cron Security ─────────────────────────────────────────────────────────────
CRON_SECRET=random-secret-for-cron-endpoint-protection

# ── Webhook Security ──────────────────────────────────────────────────────────
PORTAL_WEBHOOK_SECRET=shared-secret-with-portal-team
```

**For Cloudflare Workers deployment**, set secrets via Wrangler (not `.env`):
```bash
wrangler secret put DATABASE_URL
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put RESEND_API_KEY
# ... etc for each secret
```

---

## 10. Local Development Setup

### Prerequisites
- **Bun** (package manager + runtime) — `curl -fsSL https://bun.sh/install | bash`
- **Wrangler** — installed as a dev dependency, run via `bunx wrangler`
- A **Neon** database (free tier works)
- A **Resend** account (free tier for testing)

### Step-by-Step Setup

```bash
# 1. Clone and install
git clone <repo>
cd salescrm
bun install

# 2. Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL, BETTER_AUTH_SECRET, etc.

# 3. Run database migrations
bunx drizzle-kit push
# OR generate and apply migration files:
bunx drizzle-kit generate
bunx drizzle-kit migrate

# 4. Seed the database
bun run scripts/seed.ts      # Full demo data (45 leads, all models)
# OR just the admin user:
bun run scripts/seed-admin.ts

# 5. Start the dev server
bun run dev
# Opens on http://localhost:3000
```

### Available Scripts

| Script | Command | What it does |
|--------|---------|--------------|
| `dev` | `next dev --turbopack` | Start dev server with Turbopack (fast HMR) |
| `build` | `next build` | Production build (for Node.js hosting) |
| `start` | `next start` | Start production server (Node.js) |
| `deploy` | `opennextjs-cloudflare build && wrangler deploy --dispatch-namespace benro-testing` | Build for Cloudflare AND deploy to Workers for Platforms |
| `deploy:build` | `opennextjs-cloudflare build` | Build for Cloudflare only (no deploy) |
| `lint` | `eslint .` | Run ESLint |
| `format` | `prettier --write` | Format all files |
| `typecheck` | `tsc --noEmit` | TypeScript type check without emitting |
| `seed` | `bun run scripts/seed.ts` | Seed full demo data |
| `seed:admin` | `bun run scripts/seed-admin.ts` | Create admin user only |
| `knip` | `knip --cache` | Find unused exports and dependencies |

---

## 11. Cloudflare Deployment — Full Walkthrough

### The Deployment Stack

```
Next.js App
    ↓ compiled by
OpenNext (opennextjs/cloudflare)
    ↓ produces
.open-next/worker.js       ← the Cloudflare Worker
.open-next/assets/         ← static files served from Cloudflare
    ↓ deployed via
Wrangler CLI
    ↓ runs on
Cloudflare Workers for Platforms (dispatch namespace)
```

### Why Cloudflare Workers — Not Vercel?

- **Edge runtime everywhere** — runs in 300+ data centers globally, no cold starts
- **Workers for Platforms** — a "dispatch namespace" lets you deploy many customer worker instances under one umbrella
- **R2 integration** — native S3-compatible storage, no egress fees
- **Cost** — Workers' free tier is very generous (100,000 requests/day free)

### Step 1 — Prerequisites

1. **Cloudflare account** — free at cloudflare.com
2. **Wrangler authenticated:**
   ```bash
   bunx wrangler login
   ```
3. **R2 bucket created:**
   ```bash
   bunx wrangler r2 bucket create next-cache
   ```
4. **Dispatch namespace created** (Workers for Platforms):
   ```bash
   bunx wrangler dispatch-namespace create benro-testing
   ```

### Step 2 — Set Worker Secrets

All environment variables from `.env` must be set as Worker secrets. **Do not put secrets in `wrangler.jsonc`.**

```bash
bunx wrangler secret put DATABASE_URL
# Paste: postgresql://user:pass@host/db

bunx wrangler secret put BETTER_AUTH_SECRET
bunx wrangler secret put BETTER_AUTH_URL
bunx wrangler secret put RESEND_API_KEY
bunx wrangler secret put RESEND_FROM_EMAIL
bunx wrangler secret put GOOGLE_CLIENT_ID
bunx wrangler secret put GOOGLE_CLIENT_SECRET
bunx wrangler secret put GOOGLE_REDIRECT_URI
bunx wrangler secret put ENCRYPTION_KEY
bunx wrangler secret put R2_ACCESS_KEY_ID
bunx wrangler secret put R2_SECRET_ACCESS_KEY
bunx wrangler secret put R2_BUCKET_NAME
bunx wrangler secret put R2_ACCOUNT_ID
bunx wrangler secret put CRON_SECRET
bunx wrangler secret put PORTAL_WEBHOOK_SECRET
```

### Step 3 — Build for Cloudflare

```bash
bun run deploy:build
# Equivalent to: opennextjs-cloudflare build
```

This runs:
1. `next build` — standard Next.js build
2. OpenNext Cloudflare adapter transforms the output into a Cloudflare Worker

Output is placed in `.open-next/`:
```
.open-next/
├── worker.js           ← the Workers bundle
├── assets/             ← static files (JS, CSS, images)
│   └── _next/
└── cache/              ← prerendered pages for SSG
```

### Step 4 — Deploy

```bash
bun run deploy
# Equivalent to: opennextjs-cloudflare build && wrangler deploy --dispatch-namespace benro-testing
```

To deploy to a direct Worker URL (not dispatch namespace), remove `--dispatch-namespace`:
```bash
bunx wrangler deploy
```

### Step 5 — Add a Custom Domain

In the Cloudflare dashboard:
1. Workers & Pages → your worker → Settings → Domains & Routes
2. Add custom domain → enter your domain
3. Cloudflare automatically provisions an SSL certificate

### Step 6 — Verify Deployment

```bash
bunx wrangler tail    # Stream live logs from the deployed worker
```

Or visit your worker URL in the browser and check that the login page loads.

---

### How OpenNext Works Internally

OpenNext transforms a Next.js app for non-Vercel runtimes. For Cloudflare specifically:

**SSR (Server-Side Rendering):**
- Every `page.tsx` that is not static gets compiled into a Worker handler
- Requests come in as `Request` objects, responses go out as `Response` objects
- No Node.js APIs — must use `fetch`, `crypto.subtle`, `URL`, etc.

**Static Assets:**
- CSS, JS chunks, images → served from `assets/` binding (Cloudflare CDN)
- Not served through the Worker itself

**Incremental Static Regeneration (ISR):**
- Pages cached in **R2** (persistent storage)
- In-memory **regional cache** layer for fast hits (30-minute TTL)
- On-demand revalidation via `revalidateTag()` / `revalidatePath()` works fine
- **Time-based ISR (`export const revalidate = 60`)** does NOT work in dispatch namespaces — use on-demand revalidation instead

**Tag Cache (Sharded Durable Objects):**
- `revalidateTag('leads')` invalidates all cached pages tagged with 'leads'
- Implemented via Cloudflare Durable Objects (SQLite-backed, sharded across 12 objects)

---

## 12. Configuration Files Explained

### 12.1 `wrangler.jsonc` — Cloudflare Workers Config

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",

  // The compiled worker entry point (produced by OpenNext)
  "main": ".open-next/worker.js",

  // Worker name — this is what shows in the Cloudflare dashboard
  // Change this for each new customer/project
  "name": "salescrm-demo",

  // Minimum date for Cloudflare compatibility flags
  // Always use a recent date to get the latest APIs
  "compatibility_date": "2025-07-26",

  // nodejs_compat: enables Node.js APIs (crypto, stream, etc.) in Workers
  // global_fetch_strictly_public: makes fetch() behave like browser fetch
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],

  // Static assets served from Cloudflare CDN
  // "ASSETS" binding allows the Worker to serve static files
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },

  // R2 bucket for caching SSG/ISR pages
  // "NEXT_INC_CACHE_R2_BUCKET" is the binding name OpenNext expects
  "r2_buckets": [
    {
      "binding": "NEXT_INC_CACHE_R2_BUCKET",
      "bucket_name": "next-cache"
    }
  ],

  // Durable Object for on-demand revalidation tag cache
  // "NEXT_TAG_CACHE_DO_SHARDED" is the binding name OpenNext expects
  "durable_objects": {
    "bindings": [
      {
        "name": "NEXT_TAG_CACHE_DO_SHARDED",
        "class_name": "DOShardedTagCache"
      }
    ]
  },

  // Migrations register the Durable Object class in Cloudflare's registry
  // Only needed once — subsequent deploys reuse the same migration tag
  "migrations": [
    {
      "tag": "v1",
      "new_sqlite_classes": ["DOShardedTagCache"]
    }
  ],

  // Cloudflare Images binding — enables next/image optimization
  "images": {
    "binding": "IMAGES"
  }
}
```

**Key rule:** For Workers for Platforms (dispatch namespaces), you CANNOT use:
- `WORKER_SELF_REFERENCE` — service bindings don't work in dispatch namespaces
- Time-based ISR — relies on self-reference for background revalidation

---

### 12.2 `open-next.config.ts` — OpenNext Cloudflare Adapter

```typescript
import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';

export default defineCloudflareConfig({
  // How SSG/ISR pages are cached
  // r2IncrementalCache: stores cached pages in R2
  // withRegionalCache: adds an in-memory layer on top (30-min TTL, reduces R2 reads)
  // mode: 'long-lived' — keeps in-memory cache as long as possible
  // shouldLazilyUpdateOnCacheHit: true — refresh cache in background, return stale immediately
  // bypassTagCacheOnCacheHit: false — always check if tags were invalidated
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: 'long-lived',
    shouldLazilyUpdateOnCacheHit: true,
    bypassTagCacheOnCacheHit: false,
  }),

  // On-demand revalidation cache
  // baseShardSize: 12 — splits the tag cache across 12 Durable Objects for scalability
  tagCache: doShardedTagCache({ baseShardSize: 12 }),

  // true = intercept requests to static pages before they hit the Worker
  // Faster cold starts for SSG pages
  // Set to false if using Partial Prerendering (PPR)
  enableCacheInterception: true,
});
```

---

### 12.3 `next.config.ts` — Next.js Configuration

```typescript
const nextConfig: NextConfig = {
  experimental: {
    // Disable HMR cache eviction in dev — prevents phantom reloads on some VMs
    serverComponentsHmrCache: false,
  },

  onDemandEntries: {
    // Keep compiled routes in memory for 12 hours (dev performance)
    maxInactiveAge: 1000 * 60 * 60 * 12,
    pagesBufferLength: 200,
  },

  // Expose BETTER_AUTH_URL to browser — needed for auth redirects
  env: {
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  },

  trailingSlash: false,  // /leads not /leads/

  images: {
    unoptimized: false,      // Enable Cloudflare Images optimization
    remotePatterns: [{ protocol: 'https', hostname: '*' }],  // Allow all HTTPS images
  },

  // Skip ESLint/TypeScript errors during build (for speed)
  // Remove these in a strict production setup
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  productionBrowserSourceMaps: true,  // Enable source maps for debugging

  // pdfkit is a Node.js package — exclude from Workers bundle
  serverExternalPackages: ['pdfkit'],

  webpack: (config, { dev, isServer }) => {
    // Source maps in all environments
    config.devtool = 'source-map';

    // Fix for VMs (Firecracker/Fly.io) where file mtime is unreliable
    // Use content hashing instead of timestamps for cache invalidation
    if (dev) {
      config.snapshot = { module: { hash: true }, resolve: { hash: true } };
    }

    // Browser-side: polyfill Node.js modules that don't exist in browsers
    if (!isServer) {
      config.resolve.fallback = { fs: false, net: false, tls: false, ... };
    }

    return config;
  },
};
```

---

### 12.4 `drizzle.config.ts` — Database Migrations

```typescript
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });  // Load .env for DATABASE_URL

export default defineConfig({
  schema: './src/db/schema/index.ts',  // Where your table definitions are
  out: './migrations',                  // Where to write SQL migration files
  dialect: 'postgresql',               // Neon is PostgreSQL
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Commands:**
```bash
bunx drizzle-kit generate   # Generate a new SQL migration from schema changes
bunx drizzle-kit migrate    # Apply pending migrations to the database
bunx drizzle-kit push       # Push schema directly (dev only — skips migration files)
bunx drizzle-kit studio     # Open Drizzle Studio (visual DB browser)
```

---

### 12.5 `tsconfig.json` — TypeScript Configuration

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",              // Modern JS output
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",   // Enables imports without file extensions
    "strict": true,                  // Enable all strict checks
    "isolatedModules": true,         // Required for Next.js fast refresh
    "noEmit": true,                  // Type check only, don't produce .js files
    "skipLibCheck": true,            // Skip type checking of node_modules
    "strictNullChecks": false,       // Allow null/undefined loosely (intentional)
    "noImplicitAny": true,           // Must annotate types explicitly
    "jsx": "preserve",               // Let Next.js handle JSX transformation
    "paths": {
      "@/*": ["./src/*"]             // @/components → src/components, etc.
    }
  }
}
```

**The `@/` path alias** is used everywhere:
```typescript
import { db } from '@/db';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth/client';
```

---

### 12.6 `package.json` — Complete Reference

```json
{
  "name": "base-extended-shadcn",
  "version": "0.1.0",
  "private": true,
  "type": "module",       // ← ESM everywhere, no CommonJS

  "scripts": {
    "dev": "next dev --turbopack",           // Dev with Turbopack bundler (fast)
    "build": "next build",                   // Standard Next.js build (Node.js hosting)
    "start": "next start",                   // Start Node.js production server
    "deploy": "opennextjs-cloudflare build && wrangler deploy --dispatch-namespace benro-testing",
    "deploy:build": "opennextjs-cloudflare build",
    "format": "prettier --write \"./**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "typecheck": "tsc --noEmit",
    "knip": "knip --cache",                  // Dead code detection
    "seed": "bun run scripts/seed.ts",
    "seed:admin": "bun run scripts/seed-admin.ts"
  },

  "patchedDependencies": {
    // better-auth has a bug when running in Cloudflare Workers
    // This patch fixes it — stored in patches/better-auth@1.4.18.patch
    "better-auth@1.4.18": "patches/better-auth@1.4.18.patch"
  }
}
```

---

## 13. Database Migrations

### How migrations work in this project

The schema is the **source of truth** in `src/db/schema/schema.ts`. Migrations are generated from it.

**Development workflow:**
```bash
# 1. Edit src/db/schema/schema.ts (add a column, new table, etc.)

# 2. Generate a migration file
bunx drizzle-kit generate
# Creates: migrations/0001_add_column.sql

# 3. Review the generated SQL
cat migrations/0001_add_column.sql

# 4. Apply to your dev database
bunx drizzle-kit migrate

# 5. Commit both schema.ts and the migration file
```

**Production deployment:**
- Run `bunx drizzle-kit migrate` against the production DATABASE_URL before deploying the Worker
- The Worker never runs migrations itself — always run migrations separately first

**Push (dev shortcut):**
```bash
bunx drizzle-kit push
# Skips migration files — directly syncs schema to dev database
# NEVER use in production
```

---

## 14. Seed Script — Demo Data

### `scripts/seed-admin.ts` — Bootstrap Admin

Creates the first admin user. Run once when setting up a new environment.

```bash
bun run scripts/seed-admin.ts
```

Creates:
- Email: `prince+admin@getcreatr.com`
- Password: `StrongPassword@123`
- Role: `admin`, `emailVerified: true`

### `scripts/seed.ts` — Full Demo Seed

Creates a complete demo dataset for client demonstrations.

```bash
bun run scripts/seed.ts
```

**What it creates:**

| Entity | Count | Details |
|--------|-------|---------|
| Users | 6 | 1 admin + 5 sales reps |
| Trade Shows | 4 | 2 past (Tucson, NY NOW), 2 upcoming (JCK Vegas, Atlanta) |
| Scheduling Links | 8 | 5 virtual demo (one per rep) + 3 trade show links |
| Leads | 45 | ~7-8 leads at each of the 6 pipeline stages |
| Appointments | 15 | Mix of confirmed, completed, cancelled |
| Follow-up Tasks | 34 | Mix of pending (including overdue) and completed |
| Email Templates | 18 | Multiple per pipeline stage + general templates |
| Follow-up Timing Rules | 5 | One per non-terminal stage |
| Activity Timeline | 100+ | Rich history for every lead |
| Notifications | 12 | For multiple users and event types |

**Demo credentials after seeding:**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@salescrm.demo` | `Admin@Demo2026!` |
| Sales Rep | `sarah.chen@salescrm.demo` | `Rep@Demo2026!` |
| Sales Rep | `james.patel@salescrm.demo` | `Rep@Demo2026!` |
| Sales Rep | `olivia.brooks@salescrm.demo` | `Rep@Demo2026!` |
| Sales Rep | `marcus.lee@salescrm.demo` | `Rep@Demo2026!` |
| Sales Rep | `priya.nair@salescrm.demo` | `Rep@Demo2026!` |

---

## 15. Architectural Patterns Used

### 15.1 Feature-Driven Directory Structure

Each feature is self-contained in `src/features/[feature]/`:
```
features/leads/
├── actions/       ← Server actions (mutations)
├── queries/       ← Server-side data fetching functions
├── components/    ← React components specific to this feature
└── types/         ← Zod schemas and TypeScript types
```

This makes it easy to:
- Find all code related to a feature in one place
- Extract features into separate packages if needed
- Understand the blast radius of a change

### 15.2 Server Actions via `next-safe-action`

All mutations use Next.js Server Actions wrapped with `next-safe-action`:

```typescript
// src/features/leads/actions/create-lead.ts
export const createLead = authActionClient
  .schema(createLeadSchema)           // Zod validation
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx;             // Authenticated user from middleware
    // ... DB insert
    return { success: true, leadId };
  });
```

**Benefits:**
- Input is always validated via Zod before the action runs
- Authentication is checked by the middleware chain (`authActionClient` or `adminActionClient`)
- Type-safe on both client and server — the return type is inferred

### 15.3 Drizzle ORM Query Pattern

```typescript
// Queries are plain TypeScript functions, not React hooks
// src/features/leads/queries/get-leads.ts

export async function getLeads(userId: string, isAdmin: boolean) {
  const query = db.select().from(leads);

  if (!isAdmin) {
    // Role-based data scoping at the query layer
    query.where(eq(leads.assignedTo, userId));
  }

  return query.orderBy(desc(leads.createdAt));
}
```

### 15.4 Append-Only Activity Timeline

The `activity_timeline` table is **never updated** after insert. This is an intentional architectural decision:
- Preserves a complete, auditable history of every action
- No `updated_at` column exists on this table
- To "correct" an entry, you insert a new one (e.g., `stage_override` event)

### 15.5 Public Booking Page (No Auth Required)

The `/book/[linkId]` route is inside the `(public)` route group. It:
- Has no authentication middleware
- Uses `actionClient` (not `authActionClient`) in `book-appointment.ts`
- Reads from the DB via the scheduling link ID (the link IS the token)
- Identifies the customer by email lookup — no login required

### 15.6 Cloudflare Workers Compatibility Rules

Things that DON'T work in Cloudflare Workers (and what to use instead):

| ❌ Node.js API | ✅ Workers equivalent |
|--------------|----------------------|
| `fs.readFile()` | Store in R2, use `fetch()` |
| `net.createConnection()` (TCP) | Use HTTP-mode DB client (`@neondatabase/serverless`) |
| `setTimeout()` for long delays | Durable Objects or Cron Triggers |
| `process.env` | Worker secrets via `wrangler secret put` |
| Prisma (uses native binaries) | Drizzle ORM (pure JS) |
| NextAuth (relies on Node.js crypto) | better-auth (Web Crypto API) |

---

## 16. Replicating This Platform on a New Project

To rebuild this platform for a different vertical (not jewelry), here is the minimum checklist:

### Step 1 — Infrastructure Setup
```bash
# 1. Create Neon database
# 2. Create Resend account + verify sender domain
# 3. Create Cloudflare account + R2 bucket
# 4. Create Google Cloud project + OAuth 2.0 credentials
```

### Step 2 — Clone & Configure
```bash
git clone <repo>
bun install

# Rename the project
# In package.json: change "name"
# In wrangler.jsonc: change "name" (the Worker name)
```

### Step 3 — Adapt the Domain Model

The core changes for a different business:

1. **`src/db/schema/schema.ts`** — Change the `leads` table to match your entities. Change `pipelineStage` values to your workflow stages.

2. **`src/lib/auth/permissions.ts`** — Update resource names to match your domain.

3. **`src/lib/auth/server.ts`** — Update `trustedOrigins` to your domains.

4. **Follow-up timing rules** — Seed them to match your stage names.

5. **Email templates** — Create templates for your workflow stages.

### Step 4 — Deploy
```bash
# Set secrets
bunx wrangler secret put DATABASE_URL
# ... all other secrets

# Run migrations
bunx drizzle-kit migrate

# Seed admin user
bun run scripts/seed-admin.ts

# Deploy to Cloudflare
bun run deploy
```

### Step 5 — Point Your Domain
In Cloudflare Dashboard → Workers & Pages → your worker → Custom Domains → Add Domain.

---

## Quick Reference Card

```
Local dev:        bun run dev
Type check:       bun run typecheck
Build CF:         bun run deploy:build
Deploy CF:        bun run deploy
DB push (dev):    bunx drizzle-kit push
DB migrate:       bunx drizzle-kit migrate
DB studio:        bunx drizzle-kit studio
Seed (full):      bun run seed
Seed (admin):     bun run seed:admin
Lint:             bun run lint
Format:           bun run format
View CF logs:     bunx wrangler tail
Set CF secret:    bunx wrangler secret put SECRET_NAME
List CF secrets:  bunx wrangler secret list
```

---

*Document generated: April 2026 | Platform: SalesCRM v0.1.0*
