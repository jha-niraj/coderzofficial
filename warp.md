# CoderzOfficial - Project Reference

## Project Overview
Full-stack learning platform with monorepo structure (Turborepo + pnpm workspace)
- **Tech Stack**: Next.js 15, React 19, TypeScript, Prisma, PostgreSQL, TailwindCSS
- **Structure**: Apps (main, admin) + Shared packages (prisma, auth, ui)

---

## Directory Structure

```
/home/niraj/Documents/coderzhq/coderzofficial/
├── apps/
│   ├── main/                    # Main platform (student-facing)
│   │   ├── app/
│   │   │   ├── (auth)/          # Auth routes (signin, register, etc.)
│   │   │   ├── (home)/          # Marketing pages (aboutus, blogs, careers, etc.)
│   │   │   ├── (main)/          # Main platform routes
│   │   │   │   ├── ai/
│   │   │   │   ├── assessments/
│   │   │   │   ├── bookmarks/
│   │   │   │   ├── challenges/
│   │   │   │   ├── chat/
│   │   │   │   ├── collective/
│   │   │   │   ├── communities/
│   │   │   │   ├── Learns/
│   │   │   │   ├── feedback/
│   │   │   │   ├── home/
│   │   │   │   ├── interview/
│   │   │   │   ├── leaderboard/
│   │   │   │   ├── learnings/
│   │   │   │   ├── mock/
│   │   │   │   ├── opensource/
│   │   │   │   ├── products/
│   │   │   │   ├── profile/
│   │   │   │   ├── projects/
│   │   │   │   ├── purchase/
│   │   │   │   ├── referrals/
│   │   │   │   ├── sharecredits/
│   │   │   │   ├── store/
│   │   │   │   ├── studio/
│   │   │   │   └── transactions/
│   │   │   ├── api/             # API routes
│   │   │   └── context/
│   │   ├── actions/             # Server actions by module
│   │   │   ├── (auth)/
│   │   │   ├── (chat)/
│   │   │   ├── (common)/
│   │   │   └── (main)/
│   │   ├── components/          # React components
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── middleware.ts
│   │   └── package.json
│   │
│   └── admin/                   # Admin panel
│       ├── app/
│       │   └── (main)/          # Admin routes
│       │       ├── admins/      # Admin management
│       │       ├── api/
│       │       ├── credits/     # Credits management (NEEDS PAGES)
│       │       ├── dashboard/   # Admin dashboard ✓
│       │       └── users/       # User management ✓
│       ├── actions/
│       │   └── admin.action.ts  # ✓ Complete
│       ├── components/
│       │   └── navigation/
│       │       ├── sidebar.tsx
│       │       └── sidebarprovider.tsx
│       ├── lib/
│       │   ├── navigation.ts    # Navigation config with permissions
│       │   └── utils.ts
│       └── package.json
│
├── packages/
│   ├── prisma/
│   │   ├── schema/              # Multi-file Prisma schema
│   │   │   ├── schema.prisma    # Main schema with User model
│   │   │   ├── admin.prisma     # ✓ Admin models
│   │   │   ├── activities.prisma
│   │   │   ├── aitools.prisma
│   │   │   ├── assessments.prisma
│   │   │   ├── badgexp.prisma
│   │   │   ├── bookmarks.prisma
│   │   │   ├── challanges.prisma
│   │   │   ├── chat.prisma
│   │   │   ├── collective.prisma
│   │   │   ├── communities.prisma
│   │   │   ├── Learns.prisma
│   │   │   ├── credits.prisma
│   │   │   ├── mock.prisma
│   │   │   ├── opensource.prisma
│   │   │   ├── products.prisma
│   │   │   ├── projects.prisma
│   │   │   ├── studio.prisma
│   │   │   └── worker.prisma
│   │   ├── seed.ts              # ✓ Super admin seed script
│   │   ├── index.ts
│   │   ├── client.ts
│   │   └── package.json
│   │
│   ├── auth/                    # Authentication (NextAuth)
│   │   ├── index.ts
│   │   └── package.json
│   │
│   ├── ui/                      # Shared UI components
│   │   └── components/ui/
│   │
│   ├── eslint-config/
│   └── typescript-config/
│
├── .env                         # Environment variables
├── package.json                 # Root package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Key Database Models

### Admin System (admin.prisma)
- **AdminAccess**: Admin users with roles and permissions
  - Roles: SUPER_ADMIN, CONTENT_ADMIN, FINANCE_ADMIN, COMMUNITY_ADMIN, MODULE_MANAGER, VIEWER
  - Relations: User (1:1), AdminInvitation (1:n), AdminAuditLog (1:n)
- **AdminInvitation**: Invitation codes for new admins
- **AdminAuditLog**: All admin actions for audit trail
- **AdminDashboardStats**: Cached stats for performance
- **AdminNotification**: Notifications for admins
- **AdminSystemSettings**: System configuration

### Main Platform Models
- **User** (schema.prisma): Main user model with all relations
- **Projects** (projects.prisma): Project-based learning
- **MockInterviewVoice** (mock.prisma): AI mock interviews
- **Community** (communities.prisma): Community platform
- **Feedback** (schema.prisma): User feedback system
- **CreditTransaction** (credits.prisma): Credit system
- **Learn** (Learns.prisma): Learns hub
- **Challenges** (challanges.prisma): Forge & Crucible challenges

---

## Admin Navigation Structure

### Primary Navigation
1. **Dashboard** - Overview stats and pending actions
2. **Users** - User management
   - All Users
   - Roles & Access
3. **Credits** - Credit management
   - Transactions
   - Requests (approval workflow)
   - Transfers
   - Payments
4. **Projects** - Project management
   - All Projects
   - Project Ideas
5. **Mock Interviews** - Mock interview management
   - Voice Mocks
   - Sessions
6. **Assessments** - Assessment management
   - Topics
   - Questions
7. **Challenges** - Challenge management
   - Forge Tracks
   - Crucible Events
   - Collective
8. **Communities** - Community moderation
   - All Communities
   - Reports
9. **Feedback** - User feedback management
10. **Analytics** - Platform analytics

### Secondary Navigation (Administration)
1. **Admin Management**
   - All Admins
   - Invitations
   - Audit Logs
2. **System**
   - Settings
   - Database

---

## Admin Permission System

### Permission Levels
- `read`: View data
- `write`: Create/Update data
- `delete`: Delete data
- `full`: All permissions

### Default Permissions by Role
```typescript
SUPER_ADMIN: Full access to everything
CONTENT_ADMIN: Manage projects, mocks, assessments, challenges
FINANCE_ADMIN: Full credit management
COMMUNITY_ADMIN: Full community management
MODULE_MANAGER: Custom permissions per invitation
VIEWER: Read-only access to all modules
```

### Helper Functions (lib/navigation.ts)
- `hasPermission(permissions, module, level)`: Check permission
- `getNavigationForPermissions(permissions)`: Filter nav by permissions
- `defaultPermissionsByRole`: Default permissions map

---

## Server Actions Pattern

### Location
- Admin: `/apps/admin/actions/[module].action.ts`
- Main: `/apps/main/actions/(main)/[module]/[action].ts`

### Pattern
```typescript
"use server"

import { prisma } from "@repo/prisma"
import { getServerSession, authOptions } from "@repo/auth"
import { revalidatePath } from "next/cache"

interface Response<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

export async function actionName(params): Promise<Response> {
    try {
        // 1. Check authentication
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        // 2. Check admin access & permissions (admin only)
        const adminAccess = await prisma.adminAccess.findUnique({
            where: { userId: session.user.id }
        })
        if (!adminAccess || !hasPermission(adminAccess.permissions, 'module', 'level')) {
            return { success: false, error: "Not authorized" }
        }

        // 3. Perform database operation
        const result = await prisma.model.operation()

        // 4. Create audit log (admin actions)
        await prisma.adminAuditLog.create({
            data: {
                adminId: adminAccess.id,
                action: "CREATE|UPDATE|DELETE",
                module: "module_name",
                resourceType: "Model",
                resourceId: result.id,
                description: "Human readable description"
            }
        })

        // 5. Revalidate cache
        revalidatePath('/path')

        return { success: true, data: result }
    } catch (error) {
        console.error("Action error:", error)
        return { success: false, error: "Error message" }
    }
}
```

---

## Environment Setup

### Required Environment Variables (.env)
```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
ADMIN_NEXTAUTH_URL="http://localhost:3001"

# Add others as needed
```

### Database Commands
```bash
# From packages/prisma/
pnpm db:push          # Push schema to database
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Create migrations
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed super admin
pnpm db:reset         # Reset database (careful!)
```

### Development Commands
```bash
# From root
pnpm install          # Install all dependencies
pnpm dev              # Start all apps in dev mode

# Individual apps
pnpm --filter main dev       # Start main app (port 3000)
pnpm --filter admin dev      # Start admin app (port 3001)
```

---

## TODO: Implementation Tasks

### ✅ Completed
1. Database schema with admin models
2. Super admin seed script
3. Admin authentication & session management
4. Admin navigation structure with permissions
5. Admin sidebar component
6. Basic admin actions (admin.action.ts)
7. Dashboard page (using mock data - needs real data)
8. Users page (using mock data - needs real data)

### 🚧 In Progress
**Phase 2: Server Actions** - Create all server action files:
- [ ] user.action.ts - User management
- [ ] credit.action.ts - Credits management
- [ ] project.action.ts - Projects management
- [ ] mock.action.ts - Mock interviews management
- [ ] assessment.action.ts - Assessments management
- [ ] challenge.action.ts - Challenges management
- [ ] community.action.ts - Communities management
- [ ] feedback.action.ts - Feedback management
- [ ] analytics.action.ts - Analytics & stats
- [ ] system.action.ts - System configuration

**Phase 3: Admin Pages** - Create all missing pages:
- [ ] Update dashboard with real data
- [ ] Update users with real data
- [ ] Create user details page
- [ ] Create all Credits pages (transactions, requests, transfers, payments)
- [ ] Create all Projects pages
- [ ] Create all Mocks pages
- [ ] Create all Assessments pages
- [ ] Create all Challenges pages
- [ ] Create all Communities pages
- [ ] Create Feedback page
- [ ] Create Analytics page
- [ ] Create System pages

**Phase 4: Shared Components**
- [ ] DataTable component
- [ ] StatsCard component
- [ ] FilterBar component
- [ ] BulkActionBar component
- [ ] ConfirmDialog component
- [ ] ExportButton component

**Phase 5: Authorization**
- [ ] Enhance middleware
- [ ] Add permission checks in all actions
- [ ] Implement role-based UI

---

## Quick Reference

### Import Paths
```typescript
// Database
import { prisma } from "@repo/prisma"

// Auth
import { getServerSession, authOptions } from "@repo/auth"
import { useSession, signIn, signOut } from "@repo/auth"

// UI Components
import { Button } from "@repo/ui/components/ui/button"
import { toast } from "@repo/ui/components/ui/sonner"

// Utils
import { cn } from "@/lib/utils"
```

### Prisma Client Usage
```typescript
// Always import from @repo/prisma
import { prisma } from "@repo/prisma"

// The client is already instantiated
const users = await prisma.user.findMany()
```

### Super Admin Credentials
```
Email: admin@thecoderz.com
Password: Admin@123
```
⚠️ Change password after first login!

---

## Notes
- Multiple Prisma files enabled via `previewFeatures = ["fullTextSearchPostgres"]`
- All admin actions must create audit logs
- Use `revalidatePath()` after mutations
- Follow existing code patterns and conventions
- Keep components consistent with current design system
