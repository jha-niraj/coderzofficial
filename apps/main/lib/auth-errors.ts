// Authentication error codes and their corresponding user-friendly messages
export const AUTH_ERROR_MESSAGES = {
    // BetterAuth error codes (these are what signIn.email() returns in result.error.code)
    INVALID_EMAIL_OR_PASSWORD: "Incorrect email or password. Please try again",
    USER_NOT_FOUND: "No account found with this email address",
    EMAIL_NOT_VERIFIED: "Please verify your email before signing in",
    INVALID_PASSWORD: "Incorrect password. Please try again",
    PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
    EMAIL_ALREADY_EXISTS: "An account with this email already exists",
    USER_ALREADY_EXISTS: "An account with this email already exists",
    SOCIAL_ACCOUNT_ALREADY_LINKED: "This social account is already linked to another user",
    ACCOUNT_NOT_FOUND: "No account found with this email address",

    // Legacy custom codes kept for backwards compatibility
    INVALID_CREDENTIALS: "Incorrect email or password. Please try again",
    OAUTH_ACCOUNT: "This account was created with a social login. Please use Google or GitHub to sign in",
    EMAIL_PASSWORD_REQUIRED: "Please provide both email and password",
    INTERNAL_ERROR: "Server error. Please try again later",

    // Default fallback
    DEFAULT: "An unexpected error occurred. Please try again"
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERROR_MESSAGES;

/**
 * Get user-friendly error message from a BetterAuth error code or message string.
 */
export function getAuthErrorMessage(error: string | undefined): string {
    if (!error) {
        return AUTH_ERROR_MESSAGES.DEFAULT;
    }

    // Exact match first
    if (error in AUTH_ERROR_MESSAGES) {
        return AUTH_ERROR_MESSAGES[error as AuthErrorCode];
    }

    // Substring match (BetterAuth sometimes returns full sentences containing the code)
    for (const [code, message] of Object.entries(AUTH_ERROR_MESSAGES)) {
        if (error.toUpperCase().includes(code)) {
            return message;
        }
    }

    return AUTH_ERROR_MESSAGES.DEFAULT;
}

/**
 * Check if the error means the user needs to verify their email.
 */
export function shouldRedirectToVerification(error: string | undefined): boolean {
    return error?.toUpperCase().includes("EMAIL_NOT_VERIFIED") === true;
}
