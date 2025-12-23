/**
 * Resume Text Utilities (SERVER-SAFE)
 * Contains utility functions that can be used on both client and server
 */

/**
 * Format resume text for AI consumption
 * Cleans up and structures the text
 */
export function formatResumeForAI(resumeText: string): string {
    // Remove excessive whitespace
    let formatted = resumeText.replace(/\s+/g, ' ');
    
    // Add line breaks for better readability
    formatted = formatted.replace(/\.\s+/g, '.\n');
    formatted = formatted.replace(/:\s+/g, ':\n');
    
    // Trim
    formatted = formatted.trim();
    
    return formatted;
}

/**
 * Validate resume text
 */
export function validateResumeText(text: string): {
    isValid: boolean;
    error?: string;
} {
    if (!text || typeof text !== 'string') {
        return {
            isValid: false,
            error: 'Resume text is empty or invalid'
        };
    }
    
    if (text.length < 50) {
        return {
            isValid: false,
            error: 'Resume text is too short'
        };
    }
    
    if (text.length > 50000) {
        return {
            isValid: false,
            error: 'Resume text is too long (max 50,000 characters)'
        };
    }
    
    return { isValid: true };
}