import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import MemberRepository from '../../models/repositories/MemberRepository';
import { IMember } from '../../models/entities/Member';
import { JWT_CONFIG, JWTPayload, getTokenExpiryInSeconds } from '../../config/jwt-config';
import emailService from '../email/email-service';

/**
 * Member Authentication Service
 *
 * This service handles all authentication-related business logic for members.
 * It contains the core login functionality with JWT token generation.
 *
 * Responsibilities:
 * - Validate member credentials
 * - Generate JWT tokens
 * - Handle authentication errors
 * - Return sanitized member data
 */

/**
 * Member Login Response Interface
 * Defines what data is returned after successful login
 */
export interface MemberLoginResponse {
    success: boolean;
    message: string;
    data: {
        member: {
            id: string;
            name: string;
            email: string;
            phone: string;
            goldHoldings: number;
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: number; // Seconds until token expires
    };
}

/**
 * Member Auth Service Class
 */
export class MemberAuthService {
    /**
     * Login Method
     *
     * Authenticates member and returns JWT tokens
     *
     * @param email - Member's email address
     * @param password - Member's plain text password
     * @returns MemberLoginResponse with member data and tokens
     * @throws Error if credentials are invalid or account is disabled
     *
     * Flow:
     * 1. Find member by email (include password for verification)
     * 2. Check if member exists
     * 3. Verify password
     * 4. Check if account is active
     * 5. Generate JWT tokens
     * 6. Return member data + tokens
     */
    static async login(email: string, password: string): Promise<MemberLoginResponse> {
        try {
            // Step 1: Find member by email (include password for verification)
            const member = await MemberRepository.findByEmail(email, true);

            // Step 2: Check if member exists
            if (!member) {
                // Don't reveal if email exists or not (security best practice)
                throw new Error('Invalid email or password');
            }

            // Step 3: Verify password using bcrypt
            const isPasswordValid = await member.comparePassword(password);

            if (!isPasswordValid) {
                // Same error message as above (don't reveal which is wrong)
                throw new Error('Invalid email or password');
            }

            // Step 4: Check if account is active
            if (!member.isActive) {
                throw new Error('Account is disabled. Please contact the administrator.');
            }

            // Step 5: Generate JWT tokens
            const tokens = this.generateTokens(member);

            // Step 6: Return success response with member data and tokens
            return {
                success: true,
                message: 'Login successful',
                data: {
                    member: {
                        id: member._id.toString(),
                        name: member.name,
                        email: member.email,
                        phone: member.phone,
                        goldHoldings: member.goldHoldings,
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
     * Creates both access and refresh tokens for the member
     *
     * @param member - Member document
     * @returns Object containing accessToken and refreshToken
     *
     * Token Payload:
     * - id: Member's MongoDB ObjectId
     * - email: Member's email
     * - role: 'member' (to distinguish from admin tokens)
     * - type: 'member'
     */
    private static generateTokens(member: IMember): {
        accessToken: string;
        refreshToken: string;
    } {
        // Create payload (data stored in token)
        const payload: JWTPayload = {
            id: member._id.toString(),
            email: member.email,
            role: 'member', // Members always have 'member' role
            type: 'member',
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
     * Refresh Access Token
     *
     * Generates a new access token using a valid refresh token
     *
     * @param refreshToken - Valid refresh token
     * @returns Object with new accessToken and expiresIn
     * @throws Error if refresh token is invalid or expired
     */
    static async refreshAccessToken(refreshToken: string): Promise<{
        accessToken: string;
        expiresIn: number;
    }> {
        try {
            // Step 1: Verify refresh token
            const decoded = jwt.verify(
                refreshToken,
                JWT_CONFIG.REFRESH_TOKEN_SECRET,
                {
                    issuer: JWT_CONFIG.ISSUER,
                    audience: JWT_CONFIG.AUDIENCE,
                }
            ) as JWTPayload;

            // Step 2: Verify member still exists and is active
            const member = await MemberRepository.findById(decoded.id);

            if (!member) {
                throw new Error('Member not found');
            }

            if (!member.isActive) {
                throw new Error('Account is disabled');
            }

            // Step 3: Generate new access token
            const payload: JWTPayload = {
                id: member._id.toString(),
                email: member.email,
                role: 'member',
                type: 'member',
            };

            const accessToken = jwt.sign(
                payload,
                JWT_CONFIG.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: 2592000, // 30 days
                    issuer: JWT_CONFIG.ISSUER,
                    audience: JWT_CONFIG.AUDIENCE,
                }
            );

            return {
                accessToken,
                expiresIn: getTokenExpiryInSeconds('access'),
            };
        } catch (error: any) {
            throw new Error('Invalid or expired refresh token');
        }
    }

    /**
     * Get Member from JWT Token
     *
     * Verifies JWT token and returns member data
     *
     * @param token - JWT access token
     * @returns Member document
     * @throws Error if token is invalid or member not found
     */
    static async getMemberFromToken(token: string): Promise<IMember> {
        try {
            // Step 1: Verify token
            const decoded = jwt.verify(
                token,
                JWT_CONFIG.ACCESS_TOKEN_SECRET,
                {
                    issuer: JWT_CONFIG.ISSUER,
                    audience: JWT_CONFIG.AUDIENCE,
                }
            ) as JWTPayload;

            // Step 2: Get member from database
            const member = await MemberRepository.findById(decoded.id);

            if (!member) {
                throw new Error('Member not found');
            }

            if (!member.isActive) {
                throw new Error('Account is disabled');
            }

            return member;
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token has expired');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            } else {
                throw error;
            }
        }
    }

    /**
     * Request Password Reset
     *
     * Generates reset token and sends email with reset link
     *
     * @param email - Member's email address
     * @returns Success message
     * @throws Error if member not found or account is disabled
     *
     * Flow:
     * 1. Find member by email
     * 2. Check if member exists and is active
     * 3. Generate random reset token
     * 4. Set token expiry (15 minutes)
     * 5. Save token and expiry to member document
     * 6. Send password reset email
     * 7. Return success message
     */
    static async requestPasswordReset(email: string): Promise<{ message: string }> {
        try {
            // Step 1: Find member by email
            const member = await MemberRepository.findByEmail(email, false);

            // Step 2: Check if member exists
            if (!member) {
                // Don't reveal if email exists (security best practice)
                // Return success message even if email doesn't exist
                return {
                    message: 'If an account with that email exists, a password reset link has been sent.',
                };
            }

            // Check if account is active
            if (!member.isActive) {
                throw new Error('Account is disabled. Please contact the administrator.');
            }

            // Step 3: Generate random reset token (32 bytes = 64 hex characters)
            const resetToken = crypto.randomBytes(32).toString('hex');

            // Step 4: Set token expiry (15 minutes from now)
            const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

            // Step 5: Save token and expiry to member document
            member.resetPasswordToken = resetToken;
            member.resetPasswordExpires = resetPasswordExpires;
            await member.save();

            // Step 6: Send password reset email
            const emailSent = await emailService.sendPasswordResetEmail(
                member.email,
                member.name,
                resetToken
            );

            if (!emailSent) {
                console.warn('⚠️  Password reset email could not be sent, but token was saved');
            }

            // Step 7: Return success message
            return {
                message: 'If an account with that email exists, a password reset link has been sent.',
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Reset Password
     *
     * Validates reset token and updates member password
     *
     * @param token - Reset token from email
     * @param newPassword - New password to set
     * @returns Success message
     * @throws Error if token is invalid, expired, or member not found
     *
     * Flow:
     * 1. Find member by reset token
     * 2. Check if member exists
     * 3. Check if token is expired
     * 4. Update password (will be auto-hashed by pre-save hook)
     * 5. Clear reset token and expiry
     * 6. Save member document
     * 7. Return success message
     */
    static async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        try {
            // Step 1: Find member by reset token (need to include token field)
            const member = await MemberRepository.findByResetToken(token);

            // Step 2: Check if member exists
            if (!member) {
                throw new Error('Invalid or expired reset token');
            }

            // Step 3: Check if token is expired
            if (!member.resetPasswordExpires || member.resetPasswordExpires < new Date()) {
                throw new Error('Reset token has expired. Please request a new one.');
            }

            // Check if account is active
            if (!member.isActive) {
                throw new Error('Account is disabled. Please contact the administrator.');
            }

            // Step 4: Update password (will be auto-hashed by Member model pre-save hook)
            member.password = newPassword;

            // Step 5: Clear reset token and expiry
            member.resetPasswordToken = undefined;
            member.resetPasswordExpires = undefined;

            // Step 6: Save member document
            await member.save();

            // Step 7: Return success message
            return {
                message: 'Password has been reset successfully. You can now login with your new password.',
            };
        } catch (error) {
            throw error;
        }
    }
}

export default MemberAuthService;
