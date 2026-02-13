import { Request, Response, NextFunction } from 'express';
import { AdminAuthService } from '../../services/auth/admin-auth-service';

/**
 * Admin Auth Controller
 *
 * This controller handles HTTP requests related to admin authentication.
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
 * - Model: Admin entity (database)
 * - View: Frontend (React)
 * - Controller: THIS file (handles requests)
 *
 * Note: Request body validation is handled by BodyValidationMiddleware
 * with AdminLoginDto before reaching this controller
 */

/**
 * Admin Auth Controller Class
 */
export class AdminAuthController {
    /**
     * Login Handler
     *
     * Endpoint: POST /api/auth/admin/login
     * Middleware: BodyValidationMiddleware(AdminLoginDto)
     *
     * Request Body (validated by DTO):
     * {
     *   "email": "admin@mithra.com",
     *   "password": "Admin@123"
     * }
     *
     * Success Response (200 OK):
     * {
     *   "success": true,
     *   "message": "Login successful",
     *   "data": {
     *     "admin": { id, name, email, role },
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
            const result = await AdminAuthService.login(email, password);

            // Step 3: Send success response
            res.status(200).json(result);

        } catch (error: any) {
            // Step 4: Handle errors

            // Log error for debugging (in production, use proper logging)
            console.error('❌ Login error:', error.message);

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
     * Endpoint: POST /api/auth/admin/refresh
     * Middleware: BodyValidationMiddleware(RefreshTokenDto)
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
            const result = await AdminAuthService.refreshAccessToken(refreshToken);

            // Step 3: Send success response
            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: result,
            });

        } catch (error: any) {
            console.error('❌ Refresh token error:', error.message);

            // Send error response
            res.status(401).json({
                success: false,
                message: error.message || 'Invalid or expired refresh token',
            });
        }
    }

    /**
     * Get Current Admin Profile
     *
     * Endpoint: GET /api/auth/admin/me
     * Headers: Authorization: Bearer <token>
     *
     * Success Response (200 OK):
     * {
     *   "success": true,
     *   "data": {
     *     "admin": { id, name, email, role }
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

            // Step 2: Get admin from token
            const admin = await AdminAuthService.getAdminFromToken(token);

            // Step 3: Send success response
            res.status(200).json({
                success: true,
                data: {
                    admin: {
                        id: admin._id.toString(),
                        name: admin.name,
                        email: admin.email,
                        role: admin.role,
                    },
                },
            });

        } catch (error: any) {
            console.error('❌ Get profile error:', error.message);

            res.status(401).json({
                success: false,
                message: error.message || 'Unauthorized',
            });
        }
    }

    /**
     * Logout Handler
     *
     * Endpoint: POST /api/auth/admin/logout
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
            console.error('❌ Logout error:', error.message);

            res.status(500).json({
                success: false,
                message: 'Logout failed',
            });
        }
    }
}
