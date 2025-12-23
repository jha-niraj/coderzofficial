// Mock Category and Level definitions for client components

export const MOCK_CATEGORIES = [
    { value: 'ALL', label: 'All Categories', icon: '🎯' },
    { value: 'TECHNICAL', label: 'Technical', icon: '💻' },
    { value: 'BEHAVIORAL', label: 'Behavioral', icon: '🤝' },
    { value: 'HR', label: 'HR', icon: '👔' },
    { value: 'SYSTEM_DESIGN', label: 'System Design', icon: '🏗️' },
    { value: 'LEADERSHIP', label: 'Leadership', icon: '👑' },
    { value: 'NEGOTIATION', label: 'Negotiation', icon: '💰' },
    { value: 'CODING', label: 'Coding', icon: '⌨️' },
    { value: 'CASE_STUDY', label: 'Case Study', icon: '📊' },
    { value: 'GENERAL', label: 'General', icon: '📋' },
] as const

export const MOCK_LEVELS = [
    { value: 'ALL', label: 'All Levels' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
    { value: 'EXPERT', label: 'Expert' },
] as const

export type MockCategoryValue = typeof MOCK_CATEGORIES[number]['value']
export type MockLevelValue = typeof MOCK_LEVELS[number]['value']