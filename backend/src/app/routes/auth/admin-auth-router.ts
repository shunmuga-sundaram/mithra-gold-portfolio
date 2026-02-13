import { Router } from 'express';
import { AdminAuthController } from '../../controllers/auth/admin-auth-controller';
import { BodyValidationMiddleware } from '../../middlewares/validation-middleware';
import { AdminLoginDto, RefreshTokenDto } from '../../dtos/admin-auth.dto';

/**
 * Admin Authentication Router
 *
 * This file defines all routes related to admin authentication.
 * It connects HTTP endpoints to controller methods with appropriate middleware.
 *
 * Route Pattern:
 * /api/auth/admin/*
 *
 * All routes in this file will be prefixed with /api/auth/admin
 * (the prefix is added in the main router configuration)
 */

/**
 * Create Express Router instance
 */
const adminAuthRouter = Router();

/**
 * POST /api/auth/admin/login
 *
 * Admin Login Endpoint
 *
 * Flow:
 * 1. Request comes in
 * 2. BodyValidationMiddleware validates request body against AdminLoginDto
 * 3. If validation passes, AdminAuthController.login() executes
 * 4. Controller calls service, returns response
 *
 * Middleware Chain:
 * Request → BodyValidationMiddleware(AdminLoginDto) → AdminAuthController.login → Response
 *
 * Example Request:
 * POST /api/auth/admin/login
 * Headers: { "Content-Type": "application/json" }
 * Body: { "email": "admin@mithra.com", "password": "Admin@123" }
 *
 * Example Success Response (200):
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
 * Example Error Response (401):
 * {
 *   "success": false,
 *   "message": "Invalid email or password"
 * }
 */
adminAuthRouter.post(
    '/login',
    BodyValidationMiddleware(AdminLoginDto),
    AdminAuthController.login
);

/**
 * POST /api/auth/admin/refresh
 *
 * Refresh Access Token Endpoint
 *
 * Flow:
 * 1. Request comes with refresh token
 * 2. BodyValidationMiddleware validates RefreshTokenDto
 * 3. Controller verifies refresh token and generates new access token
 *
 * Middleware Chain:
 * Request → BodyValidationMiddleware(RefreshTokenDto) → AdminAuthController.refreshToken → Response
 *
 * Example Request:
 * POST /api/auth/admin/refresh
 * Body: { "refreshToken": "eyJ..." }
 *
 * Example Success Response (200):
 * {
 *   "success": true,
 *   "message": "Token refreshed successfully",
 *   "data": {
 *     "accessToken": "eyJ...",
 *     "expiresIn": 2592000
 *   }
 * }
 *
 * Example Error Response (401):
 * {
 *   "success": false,
 *   "message": "Invalid or expired refresh token"
 * }
 */
adminAuthRouter.post(
    '/refresh',
    BodyValidationMiddleware(RefreshTokenDto),
    AdminAuthController.refreshToken
);

/**
 * GET /api/auth/admin/me
 *
 * Get Current Admin Profile Endpoint
 *
 * Returns the profile of the currently logged-in admin based on JWT token.
 *
 * Flow:
 * 1. Request comes with Authorization header
 * 2. Controller extracts token from header
 * 3. Controller verifies token and fetches admin data
 *
 * Note: In a future step, we'll add auth middleware to automatically
 * verify token before reaching controller.
 *
 * Example Request:
 * GET /api/auth/admin/me
 * Headers: { "Authorization": "Bearer eyJ..." }
 *
 * Example Success Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "admin": {
 *       "id": "698f39ee812b8ec1dd4b8c3e",
 *       "name": "Super Admin",
 *       "email": "admin@mithra.com",
 *       "role": "super_admin"
 *     }
 *   }
 * }
 *
 * Example Error Response (401):
 * {
 *   "success": false,
 *   "message": "Authorization token is required"
 * }
 */
adminAuthRouter.get(
    '/me',
    AdminAuthController.getProfile
);

/**
 * POST /api/auth/admin/logout
 *
 * Logout Endpoint
 *
 * Since we're using stateless JWT authentication, logout is primarily
 * handled client-side by removing tokens from storage.
 *
 * This endpoint is optional and can be used for:
 * - Logging logout events
 * - Future token blacklisting implementation
 * - Audit trail
 *
 * Example Request:
 * POST /api/auth/admin/logout
 * Headers: { "Authorization": "Bearer eyJ..." }
 *
 * Example Response (200):
 * {
 *   "success": true,
 *   "message": "Logged out successfully"
 * }
 */
adminAuthRouter.post(
    '/logout',
    AdminAuthController.logout
);

/**
 * Export the router
 */
export default adminAuthRouter;
