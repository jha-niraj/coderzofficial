"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "../../lib/utils"

const Tabs = TabsPrimitive.Root

/**
 * TabsList
 * - Full-width
 * - Rounded container
 * - Border + background
 * - Light / Dark support
 */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      `
      flex w-full
      rounded-xl border
      bg-white dark:bg-neutral-900
      border-gray-200 dark:border-neutral-700
      overflow-hidden
      `,
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

/**
 * TabsTrigger
 * - Equal-width tabs
 * - Taller height
 * - Clear active / hover states
 * - Handles icon + text: centers content, supports icon-only and text-only
 */
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      `
      flex-1
      flex items-center justify-center gap-1.5
      py-3 rounded-2xl
      text-center text-sm font-semibold
      cursor-pointer
      transition-colors
      text-gray-600 dark:text-gray-300

      hover:bg-gray-100 dark:hover:bg-neutral-800

      data-[state=active]:bg-gray-200
      dark:data-[state=active]:bg-neutral-700
      data-[state=active]:text-gray-900
      dark:data-[state=active]:text-white

      focus-visible:outline-none
      focus-visible:ring-2
      focus-visible:ring-ring
      focus-visible:ring-offset-2

      disabled:pointer-events-none
      disabled:opacity-50
      [&>svg]:shrink-0
      `,
      className
    )}
    {...props}
  >
    {children}
  </TabsPrimitive.Trigger>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

/**
 * TabsContent
 * - Keep this minimal
 * - Content styling should live in the page
 */
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      `
      mt-2
      focus-visible:outline-none
      focus-visible:ring-2
      focus-visible:ring-ring
      focus-visible:ring-offset-2
      `,
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }