import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

type Section = 'main' | 'jobs' | 'uni'

const STORAGE_KEY = 'coderz_last_section'

/**
 * Hook to manage and remember the user's last visited section
 * Stores the section in localStorage and provides utilities to get/set it
 */
export function useLastSection() {
    const pathname = usePathname()
    const router = useRouter()
    const [lastSection, setLastSectionState] = useState<Section>('main')
    const [isInitialized, setIsInitialized] = useState(false)

    // Determine current section from pathname
    const getCurrentSection = (): Section => {
        if (pathname?.startsWith('/jobs') || pathname?.startsWith('/companies')) {
            return 'jobs'
        }
        if (pathname?.startsWith('/uni')) {
            return 'uni'
        }
        return 'main'
    }

    // Initialize from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored && ['main', 'jobs', 'uni'].includes(stored)) {
                setLastSectionState(stored as Section)
            }
            setIsInitialized(true)
        }
    }, [])

    // Update localStorage when section changes
    useEffect(() => {
        if (isInitialized && pathname) {
            const currentSection = getCurrentSection()
            if (currentSection !== lastSection) {
                setLastSectionState(currentSection)
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORAGE_KEY, currentSection)
                }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, isInitialized])

    // Explicitly set the section
    const setLastSection = (section: Section) => {
        setLastSectionState(section)
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, section)
        }
    }

    // Navigate to the last section
    const navigateToLastSection = () => {
        switch (lastSection) {
            case 'jobs':
                router.push('/jobs')
                break
            case 'uni':
                router.push('/uni')
                break
            default:
                router.push('/home')
        }
    }

    // Get the path for the last section
    const getLastSectionPath = (): string => {
        switch (lastSection) {
            case 'jobs':
                return '/jobs'
            case 'uni':
                return '/uni'
            default:
                return '/home'
        }
    }

    return {
        lastSection,
        currentSection: getCurrentSection(),
        setLastSection,
        navigateToLastSection,
        getLastSectionPath,
        isInitialized
    }
}

/**
 * Get the last section from localStorage (for use outside of React components)
 */
export function getStoredLastSection(): Section {
    if (typeof window === 'undefined') return 'main'
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && ['main', 'jobs', 'uni'].includes(stored)) {
        return stored as Section
    }
    return 'main'
}

/**
 * Set the last section in localStorage (for use outside of React components)
 */
export function setStoredLastSection(section: Section) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, section)
    }
}
