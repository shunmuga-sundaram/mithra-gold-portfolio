import { Request, Response, NextFunction } from 'express';
import { MemberAuthService } from '../../services/auth/member-auth-service';

/**
 * Member Auth Controller
 *
 * This controller handles HTTP requests related to member authentication.
 * It acts as the bridge between HTTP (Express) and business logic (Service).
 *
 * Responsibilities:
 * - Receive HTTP requests
 * - Extract validated request data (validation done by middleware)
 * - Call appropriate service methods
 * - Format and send HTTP responses
 * - Handle errors and send appropriate status codes
 *
 * MVC Pattern:
 * - Model: Member entity (database)
 * - View: Frontend (React)
 * - Controller: THIS file (handles requests)
 *
 * Note: Request body validation is handled by BodyValidationMiddleware
 * with MemberLoginDto before reaching this controller
 */

/**
 * Member Auth Controller Class
 */
export class MemberAuthController {
    /**
     * Login Handler
     *
     * Endpoint: POST /api/auth/member/login
     * Middleware: BodyValidationMiddleware(MemberLoginDto)
     *
     * Request Body (validated by DTO):
     * {
     *   "email": "member@example.com",
     *   "password": "SecurePass@123"
     * }
     *
     * Success Response (200 OK):
     * {
     *   "success": true,
     *   "message": "Login successful",
     *   "data": {
     *     "member": { id, name, email, phone, goldHoldings },
     *     "accessToken": "eyJ...",
     *     "refreshToken": "eyJ...",
     *     "expiresIn": 2592000
     *   }
     * }
     *
     * Error Responses:
     * - 400: Validation error (missing fields or invalid format)
     * - 401: Invalid credentials
     * - 403: Account disabled
     * - 500: Server error
     */
    static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Step 1: Extract email and password from request body
            // Note: Body is already validated by BodyValidationMiddleware
            const { email, password } = req.body;

            // Step 2: Call auth service to perform login
            const result = await MemberAuthService.login(email, password);

            // Step 3: Send success response
            res.status(200).json(result);

        } catch (error: any) {
            // Step 4: Handle errors

            // Log error for debugging (in production, use proper logging)
            console.error('❌ Member login error:', error.message);

            // Determine appropriate status code and message
            let statusCode = 500;
            let message = 'Internal server error';

            if (error.message === 'Invalid email or password') {
                statusCode = 401; // Unauthorized
                message = error.message;
            } else if (error.message.includes('Account is disabled')) {
                statusCode = 403; // Forbidden
                message = error.message;
            }

            // Send error response
            res.status(statusCode).json({
                success: false,
                message: message,
            });
        }
    }

    /**
     * Refresh Token Handler
     *
     * Endpoint: POST /api/auth/member/refresh
     * Middleware: BodyValidationMiddleware(MemberRefreshTokenDto)
     *
     * Request Body (validated by DTO):
     * {
     *   "refreshToken": "eyJ..."
     * }
     *
     * Success Response (200 OK):
     * {
     *   "success": true,
     *   "message": "Token refreshed successfully",
     *   "data": {
     *     "accessToken": "eyJ...",
     *     "expiresIn": 2592000
     *   }
     * }
     *
     * Error Response (401):
     * {
     *   "success": false,
     *   "message": "Invalid or expired refresh token"
     * }
     */
    static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Step 1: Extract refresh token from request body
            // Note: Already validated by BodyValidationMiddleware
            const { refreshToken } = req.body;

            // Step 2: Call service to refresh access token
            const result = await MemberAuthService.refreshAccessToken(refreshToken);

            // Step 3: Send success response
            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: result,
            });

        } catch (error: any) {
            console.error('❌ Member refresh token error:', error.message);

            // Send error response
            res.status(401).json({
                success: false,
                message: error.message || 'Invalid or expired refresh token',
            });
        }
    }

    /**
     * Get Current Member Profile
     *
     * Endpoint: GET /api/auth/member/me
     * Headers: Authorization: Bearer <token>
     *
     * Success Response (200 OK):
     * {
     *   "success": true,
     *   "data": {
     *     "member": { id, name, email, phone, goldHoldings }
     *   }
     * }
     *
     * Error Response (401):
     * {
     *   "success": false,
     *   "message": "Unauthorized"
     * }
     *
     * Note: This endpoint will be protected by auth middleware
     */
    static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Step 1: Extract token from Authorization header
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({
                    success: false,
                    message: 'Authorization token is required',
                });
                return;
            }

            // Extract token (remove "Bearer " prefix)
            const token = authHeader.substring(7);

            // Step 2: Get member from token
            const member = await MemberAuthService.getMemberFromToken(token);

            // Step 3: Send success response
            res.status(200).json({
                success: true,
                data: {
                    member: {
                        id: member._id.toString(),
                        name: member.name,
                        email: member.email,
                        phone: member.phone,
                        goldHoldings: member.goldHoldings,
                    },
                },
            });

        } catch (error: any) {
            console.error('❌ Member get profile error:', error.message);

            res.status(401).json({
                success: false,
                message: error.message || 'Unauthorized',
            });
        }
    }

    /**
     * Forgot Password Handler
     *
     * Endpoint: POST /api/auth/member/forgot-password
     * Middleware: BodyValidationMiddleware(ForgotPasswordDto)
     *
     * Request Body (validated by DTO):
     * {
     *   "email": "member@example.com"
     * }
     *
     * Success Response (200 OK):
     * {
     *   "success": true,
     *   "message": "If an account with that email exists, a password reset link has been sent."
     * }
     *
     * Note: For security, always return success message even if email doesn't exist
     * This prevents email enumeration attacks
     */
    static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Step 1: Extract email from request body
            const { email } = req.body;

            // Step 2: Call service to generate reset token and send email
            const result = await MemberAuthService.requestPasswordReset(email);

            // Step 3: Send success response
            res.status(200).json({
                success: true,
                message: result.message,
            });

        } catch (error: any) {
            console.error('❌ Forgot password error:', error.message);

            // Determine status code
            let statusCode = 500;
            let message = 'An error occurred. Please try again later.';

            if (error.message.includes('Account is disabled')) {
                statusCode = 403;
                message = error.message;
            }

            res.status(statusCode).json({
                success: false,
                message: message,
            });
        }
    }

    /**
     * Reset Password Handler
     *
     * Endpoint: POST /api/auth/member/reset-password
     * Middleware: BodyValidationMiddleware(ResetPasswordDto)
     *
     * Request Body (validated by DTO):
     * {
     *   "token": "abc123...",
     *   "newPassword": "NewSecurePass@123"
     * }
     *
     * Success Response (200 OK):
     * {
     *   "success": true,
     *   "message": "Password has been reset successfully. You can now login with your new password."
     * }
     *
     * Error Responses:
     * - 400: Invalid or expired token
     * - 403: Account disabled
     * - 500: Server error
     */
    static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Step 1: Extract token and new password from request body
            const { token, newPassword } = req.body;

            // Step 2: Call service to reset password
            const result = await MemberAuthService.resetPassword(token, newPassword);

            // Step 3: Send success response
            res.status(200).json({
                success: true,
                message: result.message,
            });

        } catch (error: any) {
            console.error('❌ Reset password error:', error.message);

            // Determine status code
            let statusCode = 500;
            let message = 'An error occurred. Please try again later.';

            if (error.message.includes('Invalid or expired')) {
                statusCode = 400;
                message = error.message;
            } else if (error.message.includes('Account is disabled')) {
                statusCode = 403;
                message = error.message;
            }

            res.status(statusCode).json({
                success: false,
                message: message,
            });
        }
    }

    /**
     * Logout Handler
     *
     * Endpoint: POST /api/auth/member/logout
     *
     * Note: Since we're using stateless JWT, logout is handled client-side
     * by removing the token from storage. This endpoint is optional and
     * can be used for logging purposes or future token blacklisting.
     *
     * Success Response (200 OK):
     * {
     *   "success": true,
     *   "message": "Logged out successfully"
     * }
     */
    static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // In JWT authentication, logout is typically handled client-side
            // The frontend should remove the token from storage (localStorage/sessionStorage)

            // Future enhancements:
            // 1. Token blacklisting (add token to Redis blacklist)
            // 2. Log logout event for audit trail
            // 3. Invalidate refresh tokens in database

            res.status(200).json({
                success: true,
                message: 'Logged out successfully',
            });

        } catch (error: any) {
            console.error('❌ Member logout error:', error.message);

            res.status(500).json({
                success: false,
                message: 'Logout failed',
            });
        }
    }
}

export default MemberAuthController;
