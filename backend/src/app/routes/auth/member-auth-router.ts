import { Router } from 'express';
import { MemberAuthController } from '../../controllers/auth/member-auth-controller';
import { BodyValidationMiddleware } from '../../middlewares/validation-middleware';
import { MemberLoginDto, MemberRefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from '../../dtos/member-auth.dto';

/**
 * Member Authentication Router
 *
 * This file defines all routes related to member authentication.
 * It connects HTTP endpoints to controller methods with appropriate middleware.
 *
 * Route Pattern:
 * /api/auth/member/*
 *
 * All routes in this file will be prefixed with /api/auth/member
 * (the prefix is added in the main router configuration)
 */

/**
 * Create Express Router instance
 */
const memberAuthRouter = Router();

/**
 * POST /api/auth/member/login
 *
 * Member Login Endpoint
 *
 * Flow:
 * 1. Request comes in
 * 2. BodyValidationMiddleware validates request body against MemberLoginDto
 * 3. If validation passes, MemberAuthController.login() executes
 * 4. Controller calls service, returns response
 *
 * Middleware Chain:
 * Request → BodyValidationMiddleware(MemberLoginDto) → MemberAuthController.login → Response
 *
 * Example Request:
 * POST /api/auth/member/login
 * Headers: { "Content-Type": "application/json" }
 * Body: { "email": "member@example.com", "password": "SecurePass@123" }
 *
 * Example Success Response (200):
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
 * Example Error Response (401):
 * {
 *   "success": false,
 *   "message": "Invalid email or password"
 * }
 */
memberAuthRouter.post(
    '/login',
    BodyValidationMiddleware(MemberLoginDto),
    MemberAuthController.login
);

/**
 * POST /api/auth/member/refresh
 *
 * Refresh Access Token Endpoint
 *
 * Flow:
 * 1. Request comes with refresh token
 * 2. BodyValidationMiddleware validates MemberRefreshTokenDto
 * 3. Controller verifies refresh token and generates new access token
 *
 * Middleware Chain:
 * Request → BodyValidationMiddleware(MemberRefreshTokenDto) → MemberAuthController.refreshToken → Response
 *
 * Example Request:
 * POST /api/auth/member/refresh
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
memberAuthRouter.post(
    '/refresh',
    BodyValidationMiddleware(MemberRefreshTokenDto),
    MemberAuthController.refreshToken
);

/**
 * GET /api/auth/member/me
 *
 * Get Current Member Profile Endpoint
 *
 * Returns the profile of the currently logged-in member based on JWT token.
 *
 * Flow:
 * 1. Request comes with Authorization header
 * 2. Controller extracts token from header
 * 3. Controller verifies token and fetches member data
 *
 * Note: In a future step, we'll add auth middleware to automatically
 * verify token before reaching controller.
 *
 * Example Request:
 * GET /api/auth/member/me
 * Headers: { "Authorization": "Bearer eyJ..." }
 *
 * Example Success Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "member": {
 *       "id": "698f39ee812b8ec1dd4b8c3e",
 *       "name": "John Doe",
 *       "email": "john@example.com",
 *       "phone": "+1 234-567-8900",
 *       "goldHoldings": 75.5
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
memberAuthRouter.get(
    '/me',
    MemberAuthController.getProfile
);

/**
 * POST /api/auth/member/forgot-password
 *
 * Forgot Password Endpoint
 *
 * Initiates password reset process by sending reset link to member's email.
 *
 * Flow:
 * 1. Member enters email address
 * 2. Server generates reset token (15-minute expiry)
 * 3. Server sends email with reset link
 * 4. Server always returns success (security: don't reveal if email exists)
 *
 * Middleware Chain:
 * Request → BodyValidationMiddleware(ForgotPasswordDto) → MemberAuthController.forgotPassword → Response
 *
 * Example Request:
 * POST /api/auth/member/forgot-password
 * Body: { "email": "member@example.com" }
 *
 * Example Response (200):
 * {
 *   "success": true,
 *   "message": "If an account with that email exists, a password reset link has been sent."
 * }
 */
memberAuthRouter.post(
    '/forgot-password',
    BodyValidationMiddleware(ForgotPasswordDto),
    MemberAuthController.forgotPassword
);

/**
 * POST /api/auth/member/reset-password
 *
 * Reset Password Endpoint
 *
 * Resets member's password using reset token from email.
 *
 * Flow:
 * 1. Member clicks link in email (contains token)
 * 2. Member enters new password
 * 3. Server validates token and expiry
 * 4. Server updates password (auto-hashed)
 * 5. Server clears reset token
 *
 * Middleware Chain:
 * Request → BodyValidationMiddleware(ResetPasswordDto) → MemberAuthController.resetPassword → Response
 *
 * Example Request:
 * POST /api/auth/member/reset-password
 * Body: {
 *   "token": "abc123...",
 *   "newPassword": "NewSecurePass@123"
 * }
 *
 * Example Success Response (200):
 * {
 *   "success": true,
 *   "message": "Password has been reset successfully. You can now login with your new password."
 * }
 *
 * Example Error Response (400):
 * {
 *   "success": false,
 *   "message": "Invalid or expired reset token"
 * }
 */
memberAuthRouter.post(
    '/reset-password',
    BodyValidationMiddleware(ResetPasswordDto),
    MemberAuthController.resetPassword
);

/**
 * POST /api/auth/member/logout
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
 * POST /api/auth/member/logout
 * Headers: { "Authorization": "Bearer eyJ..." }
 *
 * Example Response (200):
 * {
 *   "success": true,
 *   "message": "Logged out successfully"
 * }
 */
memberAuthRouter.post(
    '/logout',
    MemberAuthController.logout
);

/**
 * Export the router
 */
export default memberAuthRouter;
