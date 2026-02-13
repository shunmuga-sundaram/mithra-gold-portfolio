/**
 * JWT (JSON Web Token) Configuration
 *
 * This file centralizes all JWT-related settings for authentication.
 */

/**
 * Secret keys for signing tokens
 * In production, these MUST be strong, random secrets stored in environment variables
 */
export const JWT_CONFIG = {
    // Secret key for access tokens (short-lived)
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret-change-in-production',

    // Secret key for refresh tokens (long-lived)
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret-change-in-production',

    // Token expiration times
    ACCESS_TOKEN_EXPIRY: '30d',   // 30 days (as per your requirement)
    REFRESH_TOKEN_EXPIRY: '90d',  // 90 days (as per your requirement)

    // Token issuer (your application name)
    ISSUER: 'mithra-portfolio-tracker',

    // Token audience (who can use this token)
    AUDIENCE: 'mithra-users',
};

/**
 * Helper function to get token expiry in seconds
 * Useful for sending to frontend
 */
export function getTokenExpiryInSeconds(tokenType: 'access' | 'refresh'): number {
    const expiry = tokenType === 'access'
        ? JWT_CONFIG.ACCESS_TOKEN_EXPIRY
        : JWT_CONFIG.REFRESH_TOKEN_EXPIRY;

    // Convert "30d" to seconds: 30 * 24 * 60 * 60 = 2592000
    const days = parseInt(expiry);
    return days * 24 * 60 * 60;
}

/**
 * JWT Payload Interface
 * Defines what data we store inside the token
 */
export interface JWTPayload {
    id: string;          // User/Admin ID
    email: string;       // User/Admin email
    role: string;        // 'admin', 'super_admin', 'member'
    type: 'admin' | 'member';  // Which portal they belong to
}
