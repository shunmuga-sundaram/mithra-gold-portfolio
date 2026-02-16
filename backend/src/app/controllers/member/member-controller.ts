import { Request, Response, NextFunction } from 'express';
import MemberService from '../../services/member/member-service';
import { CreateMemberDto, UpdateMemberDto } from '../../dtos/member.dto';

/**
 * MEMBER CONTROLLER
 *
 * HTTP Request/Response Handler for Member operations
 *
 * Purpose:
 * - Handle incoming HTTP requests
 * - Extract data from request (body, params, query)
 * - Call service methods
 * - Return formatted JSON responses
 * - Handle errors with Express error middleware
 *
 * Pattern: MVC (Model-View-Controller)
 * - Controller handles HTTP layer
 * - Service handles business logic
 * - Repository handles data access
 * - Model defines data structure
 *
 * Architecture:
 * HTTP Request → Router → Controller → Service → Repository → Database
 */

export class MemberController {
  /**
   * GET ALL MEMBERS
   *
   * Endpoint: GET /api/members?page=1&limit=10&sortBy=name&sortOrder=asc
   *
   * Query Parameters:
   * - page: Page number (default: 1)
   * - limit: Items per page (default: 10)
   * - sortBy: Field to sort by (default: createdAt)
   * - sortOrder: asc or desc (default: desc)
   * - activeOnly: true/false (default: false)
   *
   * Response (200):
   * {
   *   "data": [...members...],
   *   "pagination": {
   *     "page": 1,
   *     "limit": 10,
   *     "total": 50,
   *     "pages": 5
   *   }
   * }
   *
   * How it works:
   * 1. Extract query parameters from request
   * 2. Parse and validate parameters
   * 3. Call appropriate service method
   * 4. Return paginated results
   */
  static async getAllMembers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      /**
       * EXTRACT QUERY PARAMETERS
       *
       * req.query contains URL query parameters
       * Example: ?page=2&limit=20&activeOnly=true
       *
       * Default values:
       * - page: 1
       * - limit: 10
       * - sortBy: createdAt
       * - sortOrder: desc
       */
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
      const activeOnly = req.query.activeOnly === 'true';

      /**
       * CALL SERVICE
       *
       * Choose method based on activeOnly flag
       */
      const result = activeOnly
        ? await MemberService.getActiveMembers({ page, limit, sortBy, sortOrder })
        : await MemberService.getAllMembers({ page, limit, sortBy, sortOrder });

      /**
       * RETURN SUCCESS RESPONSE
       *
       * Status: 200 OK
       * Body: Paginated result with data and pagination info
       */
      res.status(200).json(result);
    } catch (error) {
      /**
       * ERROR HANDLING
       *
       * Pass error to Express error handling middleware
       * Middleware will format error response
       */
      next(error);
    }
  }

  /**
   * GET MEMBER BY ID
   *
   * Endpoint: GET /api/members/:id
   *
   * URL Parameters:
   * - id: Member ID (MongoDB ObjectId)
   *
   * Response (200):
   * {
   *   "id": "...",
   *   "name": "John Doe",
   *   "email": "john@example.com",
   *   "phone": "+1 234-567-8900",
   *   "goldHoldings": 125.5,
   *   "isActive": true,
   *   "createdAt": "2026-02-16T...",
   *   "updatedAt": "2026-02-16T..."
   * }
   *
   * Error Responses:
   * - 404: Member not found
   * - 400: Invalid ID format
   */
  static async getMemberById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      /**
       * EXTRACT URL PARAMETER
       *
       * req.params contains URL path parameters
       * Example: /api/members/507f1f77bcf86cd799439011
       * req.params.id = "507f1f77bcf86cd799439011"
       */
      const { id } = req.params;

      /**
       * CALL SERVICE
       *
       * Service validates ID and retrieves member
       * Throws 404 if not found
       */
      const member = await MemberService.getMemberById(id);

      /**
       * RETURN SUCCESS RESPONSE
       */
      res.status(200).json(member);
    } catch (error) {
      next(error);
    }
  }

  /**
   * CREATE MEMBER
   *
   * Endpoint: POST /api/members
   *
   * Request Body (validated by CreateMemberDto):
   * {
   *   "name": "John Doe",
   *   "email": "john@example.com",
   *   "password": "SecurePass@123",
   *   "phone": "+1 234-567-8900",
   *   "goldHoldings": 0  // optional
   * }
   *
   * Response (201):
   * {
   *   "id": "...",
   *   "name": "John Doe",
   *   "email": "john@example.com",
   *   "phone": "+1 234-567-8900",
   *   "goldHoldings": 0,
   *   "isActive": true,
   *   "createdAt": "2026-02-16T...",
   *   "updatedAt": "2026-02-16T..."
   * }
   *
   * Error Responses:
   * - 400: Validation error (DTO validation)
   * - 409: Email already exists
   *
   * How it works:
   * 1. BodyValidationMiddleware validates request body
   * 2. If valid, controller receives typed CreateMemberDto object
   * 3. Controller calls service to create member
   * 4. Service checks email uniqueness
   * 5. Repository creates member (password auto-hashed)
   * 6. Controller returns created member with 201 status
   */
  static async createMember(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      /**
       * EXTRACT REQUEST BODY
       *
       * req.body contains JSON body from request
       * Already validated by BodyValidationMiddleware(CreateMemberDto)
       * Type-safe: TypeScript knows this is CreateMemberDto
       */
      const memberData: CreateMemberDto = req.body;

      /**
       * CALL SERVICE
       *
       * Service handles:
       * - Email uniqueness check
       * - Member creation
       * - Password hashing (via model)
       *
       * Returns created member without password
       */
      const member = await MemberService.createMember(memberData);

      /**
       * RETURN SUCCESS RESPONSE
       *
       * Status: 201 Created (not 200)
       * 201 = Resource successfully created
       * 200 = Generic success
       */
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  }

  /**
   * UPDATE MEMBER
   *
   * Endpoint: PUT /api/members/:id
   *
   * URL Parameters:
   * - id: Member ID
   *
   * Request Body (validated by UpdateMemberDto):
   * {
   *   "name": "Jane Doe",        // optional
   *   "phone": "+1 987-654-3210", // optional
   *   "goldHoldings": 150.5       // optional
   * }
   *
   * Response (200):
   * {
   *   "id": "...",
   *   "name": "Jane Doe",  // updated
   *   "email": "john@example.com",  // unchanged
   *   "phone": "+1 987-654-3210",  // updated
   *   "goldHoldings": 150.5,  // updated
   *   "isActive": true,
   *   "createdAt": "2026-02-16T...",
   *   "updatedAt": "2026-02-16T..."  // timestamp updated
   * }
   *
   * Error Responses:
   * - 404: Member not found
   * - 400: Validation error
   *
   * Notes:
   * - Only send fields you want to update
   * - Other fields remain unchanged
   * - Cannot update: email, password, isActive
   */
  static async updateMember(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      /**
       * EXTRACT URL PARAMETER AND BODY
       */
      const { id } = req.params;
      const updateData: UpdateMemberDto = req.body;

      /**
       * CALL SERVICE
       *
       * Service validates member exists
       * Repository updates only provided fields
       */
      const member = await MemberService.updateMember(id, updateData);

      /**
       * RETURN SUCCESS RESPONSE
       */
      res.status(200).json(member);
    } catch (error) {
      next(error);
    }
  }

  /**
   * TOGGLE MEMBER STATUS
   *
   * Endpoint: PATCH /api/members/:id/toggle-status
   *
   * URL Parameters:
   * - id: Member ID
   *
   * Request Body: None
   *
   * Response (200):
   * {
   *   "id": "...",
   *   "name": "John Doe",
   *   "email": "john@example.com",
   *   "phone": "+1 234-567-8900",
   *   "goldHoldings": 125.5,
   *   "isActive": false,  // toggled from true to false
   *   "createdAt": "2026-02-16T...",
   *   "updatedAt": "2026-02-16T..."
   * }
   *
   * Error Responses:
   * - 404: Member not found
   *
   * How it works:
   * - Current status: true → New status: false
   * - Current status: false → New status: true
   * - Toggle is idempotent (can call multiple times)
   */
  static async toggleMemberStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      /**
       * EXTRACT URL PARAMETER
       */
      const { id } = req.params;

      /**
       * CALL SERVICE
       *
       * Service toggles isActive field
       */
      const member = await MemberService.toggleMemberStatus(id);

      /**
       * RETURN SUCCESS RESPONSE
       */
      res.status(200).json(member);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE MEMBER (SOFT DELETE)
   *
   * Endpoint: DELETE /api/members/:id
   *
   * URL Parameters:
   * - id: Member ID
   *
   * Request Body: None
   *
   * Response (200):
   * {
   *   "id": "...",
   *   "name": "John Doe",
   *   "email": "john@example.com",
   *   "phone": "+1 234-567-8900",
   *   "goldHoldings": 125.5,
   *   "isActive": false,  // deactivated
   *   "createdAt": "2026-02-16T...",
   *   "updatedAt": "2026-02-16T..."
   * }
   *
   * Error Responses:
   * - 404: Member not found
   * - 400: Member already inactive
   *
   * Notes:
   * - Soft delete (sets isActive = false)
   * - Member data preserved in database
   * - Can be reactivated using toggle status
   * - NOT a permanent deletion
   */
  static async deleteMember(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      /**
       * EXTRACT URL PARAMETER
       */
      const { id } = req.params;

      /**
       * CALL SERVICE
       *
       * Service performs soft delete
       * Sets isActive = false
       */
      const member = await MemberService.deleteMember(id);

      /**
       * RETURN SUCCESS RESPONSE
       */
      res.status(200).json(member);
    } catch (error) {
      next(error);
    }
  }

  /**
   * SEARCH MEMBERS
   *
   * Endpoint: GET /api/members/search?query=john&page=1&limit=10
   *
   * Query Parameters:
   * - query: Search term (min 2 characters)
   * - page: Page number (default: 1)
   * - limit: Items per page (default: 10)
   *
   * Response (200):
   * {
   *   "data": [...matching members...],
   *   "pagination": {
   *     "page": 1,
   *     "limit": 10,
   *     "total": 5,
   *     "pages": 1
   *   }
   * }
   *
   * Error Responses:
   * - 400: Search query too short (< 2 characters)
   *
   * How it works:
   * - Case-insensitive search
   * - Searches in name and email fields
   * - Returns paginated results
   *
   * Examples:
   * - query=john → Matches: "John Doe", "Johnny Smith", "john@example.com"
   * - query=doe → Matches: "John Doe", "Jane Doe"
   */
  static async searchMembers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      /**
       * EXTRACT QUERY PARAMETERS
       */
      const query = req.query.query as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      /**
       * CALL SERVICE
       *
       * Service validates query length (min 2 chars)
       * Repository performs regex search
       */
      const result = await MemberService.searchMembers(query, { page, limit });

      /**
       * RETURN SUCCESS RESPONSE
       */
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET MEMBER STATISTICS
   *
   * Endpoint: GET /api/members/stats
   *
   * Request Body: None
   *
   * Response (200):
   * {
   *   "total": 100,
   *   "active": 85,
   *   "inactive": 15
   * }
   *
   * Use Cases:
   * - Admin dashboard
   * - Member analytics
   * - Reports
   *
   * How it works:
   * - Count total members
   * - Count active members
   * - Calculate inactive (total - active)
   */
  static async getMemberStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      /**
       * CALL SERVICE
       *
       * Service calculates statistics
       */
      const stats = await MemberService.getMemberStats();

      /**
       * RETURN SUCCESS RESPONSE
       */
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
}

export default MemberController;

/**
 * REQUEST/RESPONSE FLOW:
 *
 * 1. Client Request:
 * POST /api/members
 * Headers: { "Content-Type": "application/json" }
 * Body: { "name": "John", "email": "john@example.com", ... }
 *
 * 2. Express Router:
 * Matches route → Applies middleware → Calls controller
 *
 * 3. Middleware Chain:
 * CORS → JWT Auth → Admin Authorization → Body Validation → Controller
 *
 * 4. Controller (this file):
 * - Extract data from request
 * - Call service method
 * - Return response
 *
 * 5. Service:
 * - Business logic
 * - Call repository
 *
 * 6. Repository:
 * - Database operations
 *
 * 7. Response Flow (back to client):
 * Repository → Service → Controller → Express → Client
 *
 * 8. Error Handling:
 * Any throw → next(error) → Error middleware → Formatted error response
 */

/**
 * USAGE EXAMPLES (will be used in routes):
 *
 * import MemberController from './controllers/member/member-controller';
 * import { BodyValidationMiddleware } from './middlewares';
 * import { CreateMemberDto, UpdateMemberDto } from './dtos/member.dto';
 *
 * // Get all members
 * router.get('/members', MemberController.getAllMembers);
 *
 * // Get member by ID
 * router.get('/members/:id', MemberController.getMemberById);
 *
 * // Create member
 * router.post('/members',
 *   BodyValidationMiddleware(CreateMemberDto),
 *   MemberController.createMember
 * );
 *
 * // Update member
 * router.put('/members/:id',
 *   BodyValidationMiddleware(UpdateMemberDto),
 *   MemberController.updateMember
 * );
 *
 * // Toggle status
 * router.patch('/members/:id/toggle-status',
 *   MemberController.toggleMemberStatus
 * );
 *
 * // Delete member
 * router.delete('/members/:id', MemberController.deleteMember);
 *
 * // Search members
 * router.get('/members/search', MemberController.searchMembers);
 *
 * // Get statistics
 * router.get('/members/stats', MemberController.getMemberStats);
 */
