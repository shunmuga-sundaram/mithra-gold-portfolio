import jwt from 'jsonwebtoken';
import { AdminRepository } from '../../models/repositories/AdminRepository';
import { IAdmin } from '../../models/entities/Admin';
import { JWT_CONFIG, JWTPayload, getTokenExpiryInSeconds } from '../../config/jwt-config';

/**
 * Admin Authentication Service
 *
 * This service handles all authentication-related business logic for admins.
 * It contains the core login functionality with JWT token generation.
 *
 * Responsibilities:
 * - Validate credentials
 * - Generate JWT tokens
 * - Handle authentication errors
 * - Return sanitized admin data
 */

/**
 * Login Response Interface
 * Defines what data is returned after successful login
 */
export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        admin: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: number; // Seconds until token expires
    };
}

/**
 * Admin Auth Service Class
 */
export class AdminAuthService {
    /**
     * Login Method
     *
     * Authenticates admin and returns JWT tokens
     *
     * @param email - Admin's email address
     * @param password - Admin's plain text password
     * @returns LoginResponse with admin data and tokens
     * @throws Error if credentials are invalid or account is disabled
     *
     * Flow:
     * 1. Find admin by email (include password for verification)
     * 2. Check if admin exists
     * 3. Verify password
     * 4. Check if account is active
     * 5. Generate JWT tokens
     * 6. Return admin data + tokens
     */
    static async login(email: string, password: string): Promise<LoginResponse> {
        try {
            // Step 1: Find admin by email (include password for verification)
            const admin = await AdminRepository.findByEmail(email, true);

            // Step 2: Check if admin exists
            if (!admin) {
                // Don't reveal if email exists or not (security best practice)
                throw new Error('Invalid email or password');
            }

            // Step 3: Verify password using bcrypt
            const isPasswordValid = await admin.comparePassword(password);

            if (!isPasswordValid) {
                // Same error message as above (don't reveal which is wrong)
                throw new Error('Invalid email or password');
            }

            // Step 4: Check if account is active
            if (!admin.isActive) {
                throw new Error('Account is disabled. Please contact the administrator.');
            }

            // Step 5: Generate JWT tokens
            const tokens = this.generateTokens(admin);

            // Step 6: Return success response with admin data and tokens
            return {
                success: true,
                message: 'Login successful',
                data: {
                    admin: {
                        id: admin._id.toString(),
                        name: admin.name,
                        email: admin.email,
                        role: admin.role,
                    },
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    expiresIn: getTokenExpiryInSeconds('access'),
                },
            };
        } catch (error) {
            // Re-throw the error to be handled by controller
            throw error;
        }
    }

    /**
     * Generate JWT Tokens
     *
     * Creates both access and refresh tokens for the admin
     *
     * @param admin - Admin document
     * @returns Object containing accessToken and refreshToken
     *
     * Token Payload:
     * - id: Admin's MongoDB ObjectId
     * - email: Admin's email
     * - role: Admin's role (admin/super_admin)
     * - type: 'admin' (to distinguish from member tokens)
     */
    private static generateTokens(admin: IAdmin): {
        accessToken: string;
        refreshToken: string;
    } {
        // Create payload (data stored in token)
        const payload: JWTPayload = {
            id: admin._id.toString(),
            email: admin.email,
            role: admin.role,
            type: 'admin',
        };

        // Generate Access Token (short-lived) - 30 days in seconds
        const accessToken = jwt.sign(
            payload,
            JWT_CONFIG.ACCESS_TOKEN_SECRET,
            {
                expiresIn: 2592000, // 30 days in seconds (30 * 24 * 60 * 60)
                issuer: JWT_CONFIG.ISSUER,
                audience: JWT_CONFIG.AUDIENCE,
            }
        );

        // Generate Refresh Token (long-lived) - 90 days in seconds
        const refreshToken = jwt.sign(
            payload,
            JWT_CONFIG.REFRESH_TOKEN_SECRET,
            {
                expiresIn: 7776000, // 90 days in seconds (90 * 24 * 60 * 60)
                issuer: JWT_CONFIG.ISSUER,
                audience: JWT_CONFIG.AUDIENCE,
            }
        );

        return {
            accessToken,
            refreshToken,
        };
    }

    /**
     * Verify Access Token
     *
     * Validates and decodes a JWT access token
     *
     * @param token - JWT token string
     * @returns Decoded token payload
     * @throws Error if token is invalid or expired
     *
     * Usage:
     * const payload = AdminAuthService.verifyAccessToken(token);
     * console.log(payload.id); // Admin ID
     */
    static verifyAccessToken(token: string): JWTPayload {
        try {
            const decoded = jwt.verify(
                token,
                JWT_CONFIG.ACCESS_TOKEN_SECRET,
                {
                    issuer: JWT_CONFIG.ISSUER,
                    audience: JWT_CONFIG.AUDIENCE,
                }
            ) as JWTPayload;

            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Token has expired. Please login again.');
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid token. Please login again.');
            } else {
                throw new Error('Token verification failed.');
            }
        }
    }

    /**
     * Verify Refresh Token
     *
     * Validates and decodes a JWT refresh token
     *
     * @param token - JWT refresh token string
     * @returns Decoded token payload
     * @throws Error if token is invalid or expired
     */
    static verifyRefreshToken(token: string): JWTPayload {
        try {
            const decoded = jwt.verify(
                token,
                JWT_CONFIG.REFRESH_TOKEN_SECRET,
                {
                    issuer: JWT_CONFIG.ISSUER,
                    audience: JWT_CONFIG.AUDIENCE,
                }
            ) as JWTPayload;

            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Refresh token has expired. Please login again.');
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid refresh token. Please login again.');
            } else {
                throw new Error('Token verification failed.');
            }
        }
    }

    /**
     * Refresh Access Token
     *
     * Generates a new access token using a valid refresh token
     *
     * @param refreshToken - Valid JWT refresh token
     * @returns New access token
     * @throws Error if refresh token is invalid
     *
     * Usage:
     * When access token expires, use refresh token to get a new one
     * without requiring the user to login again
     */
    static async refreshAccessToken(refreshToken: string): Promise<{
        accessToken: string;
        expiresIn: number;
    }> {
        try {
            // Verify refresh token
            const decoded = this.verifyRefreshToken(refreshToken);

            // Find admin to ensure they still exist and are active
            const admin = await AdminRepository.findById(decoded.id);

            if (!admin) {
                throw new Error('Admin not found. Please login again.');
            }

            if (!admin.isActive) {
                throw new Error('Account is disabled. Please contact the administrator.');
            }

            // Generate new access token
            const payload: JWTPayload = {
                id: admin._id.toString(),
                email: admin.email,
                role: admin.role,
                type: 'admin',
            };

            const accessToken = jwt.sign(
                payload,
                JWT_CONFIG.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: 2592000, // 30 days in seconds
                    issuer: JWT_CONFIG.ISSUER,
                    audience: JWT_CONFIG.AUDIENCE,
                }
            );

            return {
                accessToken,
                expiresIn: getTokenExpiryInSeconds('access'),
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get Admin from Token
     *
     * Extracts admin ID from token and fetches admin data
     *
     * @param token - JWT access token
     * @returns Admin data (without password)
     * @throws Error if token is invalid or admin not found
     *
     * Usage:
     * Used in protected routes to get current logged-in admin
     */
    static async getAdminFromToken(token: string): Promise<IAdmin> {
        try {
            // Verify and decode token
            const decoded = this.verifyAccessToken(token);

            // Find admin
            const admin = await AdminRepository.findById(decoded.id);

            if (!admin) {
                throw new Error('Admin not found.');
            }

            if (!admin.isActive) {
                throw new Error('Account is disabled.');
            }

            return admin;
        } catch (error) {
            throw error;
        }
    }
}
