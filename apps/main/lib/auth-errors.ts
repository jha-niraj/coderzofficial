// Authentication error codes and their corresponding user-friendly messages
export const AUTH_ERROR_MESSAGES = {
    // Custom error codes from our auth system
    USER_NOT_FOUND: "No account found with this email address",
    INVALID_CREDENTIALS: "Incorrect password. Please try again",
    EMAIL_NOT_VERIFIED: "Please verify your email before signing in",
    OAUTH_ACCOUNT: "This account was created with Google. Please use Google sign-in",
    EMAIL_PASSWORD_REQUIRED: "Please provide both email and password",
    INTERNAL_ERROR: "Server error. Please try again later",
    
    // NextAuth error codes
    CredentialsSignin: "Invalid email or password",
    CallbackRouteError: "Authentication failed. Please try again",
    Configuration: "Server error. Please try again later",
    AccessDenied: "Access denied",
    Verification: "Email verification required",
    OAuthSignin: "Sign-in failed. Please try again",
    OAuthCallback: "Sign-in failed. Please try again",
    EmailSignin: "Email sign-in failed",
    SessionRequired: "Please sign in to continue",
    OAuthAccountNotLinked: "This social account is not linked to any user account",
    
    // Default fallback
    DEFAULT: "An unexpected error occurred"
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERROR_MESSAGES;

/**
 * Get user-friendly error message
 */
export function getAuthErrorMessage(error: string | undefined): string {
    if (!error) {
        return AUTH_ERROR_MESSAGES.DEFAULT;
    }

    // Check for exact matches first
    if (error in AUTH_ERROR_MESSAGES) {
        return AUTH_ERROR_MESSAGES[error as AuthErrorCode];
    }

    // Check if the error contains any of our custom error codes
    for (const [code, message] of Object.entries(AUTH_ERROR_MESSAGES)) {
        if (error.includes(code)) {
            return message;
        }
    }

    return AUTH_ERROR_MESSAGES.DEFAULT;
}

/**
 * Check if error requires redirect to verification page
 */
export function shouldRedirectToVerification(error: string | undefined): boolean {
    return error?.includes("EMAIL_NOT_VERIFIED") === true;
} 