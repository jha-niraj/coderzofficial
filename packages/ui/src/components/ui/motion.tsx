"use client"

import { motion, type MotionProps } from "framer-motion"
import { forwardRef, type ReactNode } from "react"

type MotionDivProps = MotionProps & {
    children: ReactNode
    className?: string
}

export const MotionDiv = motion.div

export const FadeIn = forwardRef<HTMLDivElement, MotionDivProps>(({ children, className, ...props }, ref) => {
    return (
        <MotionDiv
            ref={ref}
            initial={{ opacity: 0, y: 20 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className={className}
            {...props}
        >
            {children}
        </MotionDiv>
    )
})
FadeIn.displayName = "FadeIn"

export const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

export const SlideIn = forwardRef<HTMLDivElement, MotionDivProps>(({ children, className, ...props }, ref) => {
    return (
        <MotionDiv
            ref={ref}
            initial={{ opacity: 0, x: -20 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={className}
            {...props}
        >
            {children}
        </MotionDiv>
    )
})
SlideIn.displayName = "SlideIn"

export const ScaleIn = forwardRef<HTMLDivElement, MotionDivProps>(({ children, className, ...props }, ref) => {
    return (
        <MotionDiv
            ref={ref}
            initial={{ opacity: 0, scale: 0.9 }
            }
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={className}
            {...props}
        >
            {children}
        </MotionDiv>
    )
})
ScaleIn.displayName = "ScaleIn"

export const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

export const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
        },
    },
}

export const staggerItemLeft = {
    hidden: { opacity: 0, x: -20 },
    show: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.3,
        },
    },
}

export const staggerItemRight = {
    hidden: { opacity: 0, x: 20 },
    show: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.3,
        },
    },
}

export const tabAnimation = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }