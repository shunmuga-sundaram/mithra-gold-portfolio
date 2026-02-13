import cors from 'cors';
import { CorsOptions } from 'cors';

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 *
 * CORS controls which websites can call your API.
 * Without CORS, browsers block requests from different domains for security.
 */

/**
 * Get allowed origins from environment variable
 *
 * Format in .env file:
 * ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,https://admin.mithra.com
 *
 * Multiple domains separated by comma
 */
function getAllowedOrigins(): string[] {
    const originsEnv = process.env.ALLOWED_ORIGINS;

    if (!originsEnv) {
        // Default for development if not set
        console.warn('⚠️  ALLOWED_ORIGINS not set in .env, using defaults');
        return ['http://localhost:5173', 'http://localhost:5174'];
    }

    // Split by comma and trim whitespace
    return originsEnv.split(',').map(origin => origin.trim());
}

const allowedOrigins = getAllowedOrigins();

console.log('✅ CORS enabled for origins:', allowedOrigins);

/**
 * CORS Options Configuration
 */
const corsOptions: CorsOptions = {
    /**
     * Origin Check Function
     * Decides if a request should be allowed based on where it's coming from
     */
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        if (!origin) {
            return callback(null, true);
        }

        // Check if the origin is in our allowed list
        if (allowedOrigins.indexOf(origin) !== -1) {
            // Origin is allowed
            callback(null, true);
        } else {
            // Origin is NOT allowed
            console.warn(`❌ CORS blocked request from: ${origin}`);
            callback(new Error(`Not allowed by CORS policy: ${origin}`));
        }
    },

    /**
     * Allowed HTTP Methods
     */
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    /**
     * Allowed Headers
     * These are the headers frontend can send
     */
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
    ],

    /**
     * Exposed Headers
     * These headers are visible to the frontend in the response
     */
    exposedHeaders: ['Authorization'],

    /**
     * Allow Credentials (cookies, authorization headers)
     * Set to true if you're using cookies for auth
     */
    credentials: true,

    /**
     * Preflight Cache Duration
     * How long browser can cache the CORS preflight response (in seconds)
     */
    maxAge: 86400, // 24 hours
};

/**
 * Export configured CORS middleware
 */
export const corsMiddleware = cors(corsOptions);

/**
 * Helper: Check if origin is allowed
 * Useful for logging/debugging
 */
export function isOriginAllowed(origin: string): boolean {
    return allowedOrigins.includes(origin);
}
