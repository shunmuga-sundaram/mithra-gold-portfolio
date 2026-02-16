import { Router } from 'express';
import { ApiRouter } from '../../helpers/api-router';
import { MemberController } from '../../controllers/member/member-controller';
import { BodyValidationMiddleware } from '../../middlewares/validation-middleware';
import { CreateMemberDto, UpdateMemberDto } from '../../dtos/member.dto';
import { AuthenticationMiddleware } from '../../middlewares/authentication-middleware';
import { RequireAdmin } from '../../middlewares/authorization-middleware';

/**
 * MEMBER ROUTER
 *
 * Defines all routes for Member CRUD operations
 *
 * Route Pattern: /members/*
 * All routes require admin authentication and authorization
 *
 * Middleware Chain:
 * Request → CORS → Body Parser → Authentication → Authorization → Validation → Controller → Error Handler
 *
 * All member routes are protected and require:
 * 1. Valid JWT token (AuthenticationMiddleware)
 * 2. Admin role (RequireAdmin)
 * 3. Valid request data (BodyValidationMiddleware - where applicable)
 */

export class MemberRouter implements ApiRouter {
  public readonly baseUrl = '/members';
  private router: Router;

  public constructor() {
    this.router = Router();
    this.initRoutes();
  }

  public get Router(): Router {
    return this.router;
  }

  private initRoutes(): void {
    /**
     * APPLY AUTHENTICATION & AUTHORIZATION TO ALL ROUTES
     *
     * These middlewares will run for EVERY route in this router
     * - AuthenticationMiddleware: Verify JWT token, set req.user
     * - RequireAdmin: Check if user is admin or super_admin
     *
     * This means we don't need to add these middlewares to each individual route
     * All member endpoints are admin-only by default
     */
    this.router.use(AuthenticationMiddleware);
    this.router.use(RequireAdmin);

    /**
     * ======================
     * STATISTICS ENDPOINTS (MUST BE BEFORE /:id)
     * ======================
     *
     * IMPORTANT: Place specific routes BEFORE parameterized routes
     * Otherwise /stats will be matched as /:id with id="stats"
     */

    /**
     * GET /members/stats
     *
     * Get member statistics (total, active, inactive counts)
     *
     * Example Response (200):
     * {
     *   "total": 100,
     *   "active": 85,
     *   "inactive": 15
     * }
     */
    this.router.get('/stats', MemberController.getMemberStats);

    /**
     * ======================
     * SEARCH ENDPOINTS (MUST BE BEFORE /:id)
     * ======================
     */

    /**
     * GET /members/search
     *
     * Search members by name or email
     *
     * Query Parameters:
     * - query: Search term (required, min 2 characters)
     * - page: Page number (default: 1)
     * - limit: Items per page (default: 10)
     *
     * Example Request:
     * GET /members/search?query=john&page=1&limit=10
     *
     * Example Response (200):
     * {
     *   "data": [...members...],
     *   "pagination": { page: 1, limit: 10, total: 2, pages: 1 }
     * }
     */
    this.router.get('/search', MemberController.searchMembers);

    /**
     * ======================
     * MEMBER CRUD ENDPOINTS
     * ======================
     */

    /**
     * GET /members
     *
     * Get paginated list of all members
     *
     * Query Parameters:
     * - page: Page number (default: 1)
     * - limit: Items per page (default: 10)
     * - sortBy: Field to sort by (default: createdAt)
     * - sortOrder: asc or desc (default: desc)
     * - activeOnly: true/false (default: false)
     *
     * Example Request:
     * GET /members?page=1&limit=10&sortBy=name&sortOrder=asc
     *
     * Example Response (200):
     * {
     *   "data": [...members...],
     *   "pagination": { page: 1, limit: 10, total: 100, pages: 10 }
     * }
     */
    this.router.get('/', MemberController.getAllMembers);

    /**
     * POST /members
     *
     * Create new member
     *
     * Request Body (CreateMemberDto):
     * {
     *   "name": "John Doe",
     *   "email": "john@example.com",
     *   "password": "SecurePass@123",
     *   "phone": "+1 234-567-8900",
     *   "goldHoldings": 0  // Optional
     * }
     *
     * Example Response (201):
     * {
     *   "id": "507f1f77bcf86cd799439011",
     *   "name": "John Doe",
     *   "email": "john@example.com",
     *   "phone": "+1 234-567-8900",
     *   "goldHoldings": 0,
     *   "isActive": true,
     *   "createdAt": "2024-01-01T00:00:00.000Z",
     *   "updatedAt": "2024-01-01T00:00:00.000Z"
     * }
     *
     * Error Response (409 - Duplicate Email):
     * {
     *   "success": false,
     *   "message": "Email already exists. Please use a different email.",
     *   "statusCode": 409
     * }
     */
    this.router.post(
      '/',
      BodyValidationMiddleware(CreateMemberDto),
      MemberController.createMember
    );

    /**
     * GET /members/:id
     *
     * Get single member by ID
     *
     * URL Parameters:
     * - id: Member ID (MongoDB ObjectId)
     *
     * Example Request:
     * GET /members/507f1f77bcf86cd799439011
     *
     * Example Response (200):
     * {
     *   "id": "507f1f77bcf86cd799439011",
     *   "name": "John Doe",
     *   ...member data...
     * }
     *
     * Error Response (404):
     * {
     *   "success": false,
     *   "message": "Member not found",
     *   "statusCode": 404
     * }
     */
    this.router.get('/:id', MemberController.getMemberById);

    /**
     * PUT /members/:id
     *
     * Update existing member
     *
     * URL Parameters:
     * - id: Member ID
     *
     * Request Body (UpdateMemberDto) - All optional:
     * {
     *   "name": "Jane Doe",
     *   "phone": "+1 987-654-3210",
     *   "goldHoldings": 75.5
     * }
     *
     * Note: Cannot update email or password through this endpoint
     *
     * Example Response (200):
     * {
     *   "id": "507f1f77bcf86cd799439011",
     *   "name": "Jane Doe",
     *   ...updated member data...
     * }
     */
    this.router.put(
      '/:id',
      BodyValidationMiddleware(UpdateMemberDto),
      MemberController.updateMember
    );

    /**
     * PATCH /members/:id/toggle-status
     *
     * Toggle member active status (activate/deactivate)
     *
     * URL Parameters:
     * - id: Member ID
     *
     * How it works:
     * - isActive: true → false (deactivate)
     * - isActive: false → true (reactivate)
     *
     * Example Response (200):
     * {
     *   "id": "507f1f77bcf86cd799439011",
     *   "isActive": false,  // Toggled
     *   ...member data...
     * }
     */
    this.router.patch('/:id/toggle-status', MemberController.toggleMemberStatus);

    /**
     * DELETE /members/:id
     *
     * Delete member (soft delete - sets isActive = false)
     *
     * URL Parameters:
     * - id: Member ID
     *
     * Note: SOFT DELETE
     * - Does NOT remove from database
     * - Sets isActive = false
     * - Preserves all data
     * - Can be reactivated
     *
     * Example Response (200):
     * {
     *   "id": "507f1f77bcf86cd799439011",
     *   "isActive": false,  // Soft deleted
     *   ...member data...
     * }
     */
    this.router.delete('/:id', MemberController.deleteMember);
  }
}

/**
 * ======================
 * USAGE IN MAIN ROUTER
 * ======================
 *
 * In routes/index.ts:
 * import { MemberRouter } from './member/member-router';
 *
 * export const route = new RootRouter(
 *   new SampleRouter(...),
 *   new AppRouter(...),
 *   new AuthRouter(),
 *   new MemberRouter()  // ← Add this
 * );
 *
 * This makes all routes available at:
 * - GET    /members          → List all members
 * - GET    /members/:id      → Get member by ID
 * - POST   /members          → Create member
 * - PUT    /members/:id      → Update member
 * - PATCH  /members/:id/toggle-status → Toggle status
 * - DELETE /members/:id      → Delete member (soft)
 * - GET    /members/search   → Search members
 * - GET    /members/stats    → Get statistics
 */

/**
 * ======================
 * MIDDLEWARE EXECUTION ORDER
 * ======================
 *
 * Example: POST /members
 *
 * 1. CORS Middleware (global)
 * 2. Body Parser (global)
 * 3. AuthenticationMiddleware (router-level) - Verify JWT
 * 4. RequireAdmin (router-level) - Check admin role
 * 5. BodyValidationMiddleware (route-level) - Validate DTO
 * 6. MemberController.createMember (route-level) - Handle request
 * 7. Error Middleware (global) - Catch errors
 */

/**
 * ======================
 * SECURITY FEATURES
 * ======================
 *
 * 1. JWT Authentication (all routes)
 * 2. Admin Authorization (all routes)
 * 3. Password hashing (bcrypt)
 * 4. Email uniqueness (MongoDB index)
 * 5. Input validation (class-validator)
 * 6. Soft delete (data preservation)
 * 7. Password exclusion (never returned)
 */
