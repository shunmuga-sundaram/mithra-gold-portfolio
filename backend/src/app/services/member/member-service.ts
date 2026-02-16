import MemberRepository, { PaginationOptions } from '../../models/repositories/MemberRepository';
import { CreateMemberDto, UpdateMemberDto } from '../../dtos/member.dto';
import emailService from '../email/email-service';

/**
 * MEMBER SERVICE
 *
 * Business Logic Layer for Member operations
 *
 * Purpose:
 * - Implement business rules
 * - Validate business constraints
 * - Coordinate between repository and controller
 * - Handle errors with meaningful messages
 * - Transform data for API responses
 *
 * Pattern: Service Layer
 * - Controller handles HTTP (request/response)
 * - Service handles business logic
 * - Repository handles database operations
 *
 * Architecture:
 * Controller → Service → Repository → Database
 */

export class MemberService {
  /**
   * GET ALL MEMBERS
   *
   * Retrieve paginated list of all members
   *
   * Business Logic:
   * - Default pagination: page 1, limit 10
   * - Sort by createdAt descending (newest first)
   * - Include all members (active and inactive)
   *
   * Use Cases:
   * - Admin member list page
   * - Member management dashboard
   *
   * @param options - Pagination and sorting options
   * @returns Promise<PaginatedResult>
   *
   * Example:
   * const result = await MemberService.getAllMembers({ page: 1, limit: 10 });
   */
  static async getAllMembers(options: PaginationOptions = { page: 1, limit: 10 }) {
    try {
      /**
       * CALL REPOSITORY
       *
       * Repository handles database query
       * Service just orchestrates and validates
       */
      const result = await MemberRepository.findAll(options);

      return result;
    } catch (error: any) {
      /**
       * ERROR HANDLING
       *
       * Catch database errors and transform to user-friendly messages
       */
      throw new Error(error.message || 'Failed to retrieve members');
    }
  }

  /**
   * GET ACTIVE MEMBERS ONLY
   *
   * Retrieve paginated list of active members
   *
   * Business Logic:
   * - Filter: isActive = true
   * - Exclude deactivated/soft-deleted members
   *
   * Use Cases:
   * - Display only active members
   * - Member dropdown for trades
   *
   * @param options - Pagination options
   * @returns Promise<PaginatedResult>
   */
  static async getActiveMembers(options: PaginationOptions = { page: 1, limit: 10 }) {
    try {
      const result = await MemberRepository.findActiveMembers(options);
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to retrieve active members');
    }
  }

  /**
   * GET MEMBER BY ID
   *
   * Retrieve single member by ID
   *
   * Business Logic:
   * - Validate ID format (MongoDB ObjectId)
   * - Check if member exists
   * - Return member data (without password)
   *
   * Use Cases:
   * - View member details
   * - Edit member form (pre-fill data)
   * - Display member profile
   *
   * @param id - Member ID
   * @returns Promise<IMember>
   * @throws 404 if member not found
   * @throws 400 if invalid ID format
   *
   * Example:
   * const member = await MemberService.getMemberById("507f1f77bcf86cd799439011");
   */
  static async getMemberById(id: string) {
    try {
      /**
       * VALIDATE ID FORMAT
       *
       * Repository returns null if invalid ObjectId format
       * Transform null to user-friendly error
       */
      const member = await MemberRepository.findById(id);

      /**
       * CHECK IF EXISTS
       *
       * If member not found, throw 404 error
       */
      if (!member) {
        throw new Error('Member not found');
      }

      return member;
    } catch (error: any) {
      /**
       * PRESERVE HTTP STATUS CODE
       *
       * If error already has status code (like 404), preserve it
       * Otherwise use 500 (server error)
       */
      throw new Error(
        error.message || 'Failed to retrieve member'
      );
    }
  }

  /**
   * CREATE MEMBER
   *
   * Create new member account
   *
   * Business Logic:
   * 1. Check if email already exists (uniqueness)
   * 2. Create member (password auto-hashed by model)
   * 3. Return created member (without password)
   *
   * Validations:
   * - Email uniqueness (MongoDB index)
   * - Password strength (validated by DTO)
   * - Required fields (validated by DTO)
   *
   * Use Cases:
   * - Admin creates new member
   * - Member self-registration (future)
   *
   * @param memberData - Member information (validated DTO)
   * @returns Promise<IMember>
   * @throws 409 if email already exists
   * @throws 400 if validation fails
   *
   * Example:
   * const member = await MemberService.createMember({
   *   name: "John Doe",
   *   email: "john@example.com",
   *   password: "SecurePass@123",
   *   phone: "+1 234-567-8900"
   * });
   */
  static async createMember(memberData: CreateMemberDto) {
    try {
      /**
       * BUSINESS RULE: CHECK EMAIL UNIQUENESS
       *
       * Before creating, check if email already exists
       * Prevents duplicate email error from MongoDB
       * Provides better error message
       */
      const existingMember = await MemberRepository.findByEmail(memberData.email);

      if (existingMember) {
        /**
         * EMAIL ALREADY EXISTS
         *
         * Return 409 Conflict (not 400)
         * 409 = Resource already exists
         * 400 = Bad request (validation error)
         */
        throw new Error('Email already exists. Please use a different email.');
      }

      /**
       * SAVE PLAIN PASSWORD
       *
       * Store plain password temporarily to send via email
       * Before it gets hashed by the model
       */
      const plainPassword = memberData.password;

      /**
       * CREATE MEMBER
       *
       * Repository creates member in database
       * Pre-save hook automatically hashes password
       * Returns created member without password
       */
      const member = await MemberRepository.create({
        name: memberData.name,
        email: memberData.email.toLowerCase(), // Store in lowercase
        password: memberData.password, // Will be hashed by model
        phone: memberData.phone,
        goldHoldings: memberData.goldHoldings || 0, // Default to 0
      });

      /**
       * SEND WELCOME EMAIL
       *
       * Send credentials to member's email
       * This runs asynchronously and doesn't block the response
       * If email fails, member is still created successfully
       */
      emailService
        .sendWelcomeEmail(member.email, member.name, plainPassword)
        .then((success) => {
          if (success) {
            console.log(`✅ Welcome email sent to ${member.email}`);
          } else {
            console.warn(`⚠️  Failed to send welcome email to ${member.email}`);
          }
        })
        .catch((error) => {
          console.error(`❌ Error sending welcome email to ${member.email}:`, error);
        });

      return member;
    } catch (error: any) {
      /**
       * ERROR HANDLING
       *
       * Different error types:
       * 1. Duplicate email (E11000) → 409 Conflict
       * 2. Validation error → 400 Bad Request
       * 3. Other → 500 Server Error
       */

      // MongoDB duplicate key error
      if (error.code === 11000) {
        throw new Error('Email already exists. Please use a different email.');
      }

      // Mongoose validation error
      if (error.name === 'ValidationError') {
        throw new Error(error.message || 'Validation failed');
      }

      // Already an UnhandledException (from our code)
      if (error instanceof Error) {
        throw error;
      }

      // Unknown error
      throw new Error(error.message || 'Failed to create member');
    }
  }

  /**
   * UPDATE MEMBER
   *
   * Update existing member details
   *
   * Business Logic:
   * - Only update provided fields
   * - Cannot update email (unique identifier)
   * - Cannot update password (use changePassword method)
   * - Cannot update isActive (use toggleStatus method)
   *
   * Allowed updates:
   * - name, phone, goldHoldings
   *
   * Use Cases:
   * - Admin edits member information
   * - Update member phone number
   * - Adjust gold holdings (manual correction)
   *
   * @param id - Member ID
   * @param updateData - Fields to update (validated DTO)
   * @returns Promise<IMember>
   * @throws 404 if member not found
   * @throws 400 if invalid ID or data
   *
   * Example:
   * const updated = await MemberService.updateMember(id, {
   *   name: "Jane Doe",
   *   phone: "+1 987-654-3210"
   * });
   */
  static async updateMember(id: string, updateData: UpdateMemberDto) {
    try {
      /**
       * CHECK IF MEMBER EXISTS
       *
       * Verify member exists before updating
       * Provides clear error message if not found
       */
      const existingMember = await MemberRepository.findById(id);

      if (!existingMember) {
        throw new Error('Member not found');
      }

      /**
       * UPDATE MEMBER
       *
       * Repository updates only provided fields
       * Other fields remain unchanged
       */
      const updatedMember = await MemberRepository.update(id, updateData);

      if (!updatedMember) {
        throw new Error('Failed to update member');
      }

      return updatedMember;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(error.message || 'Failed to update member');
    }
  }

  /**
   * TOGGLE MEMBER STATUS
   *
   * Activate or deactivate member account
   *
   * Business Logic:
   * - Current status: true → Toggle to: false
   * - Current status: false → Toggle to: true
   * - Soft delete pattern (doesn't remove from database)
   *
   * Effects when isActive = false:
   * - Member cannot login
   * - Member cannot create trades
   * - Historical data preserved
   * - Can be reactivated later
   *
   * Use Cases:
   * - Deactivate member (suspend account)
   * - Reactivate member
   * - Soft delete member
   *
   * @param id - Member ID
   * @returns Promise<IMember>
   * @throws 404 if member not found
   *
   * Example:
   * // Deactivate
   * const member = await MemberService.toggleMemberStatus(id);
   * console.log(member.isActive); // false
   *
   * // Reactivate
   * const member2 = await MemberService.toggleMemberStatus(id);
   * console.log(member2.isActive); // true
   */
  static async toggleMemberStatus(id: string) {
    try {
      /**
       * CHECK IF EXISTS
       */
      const existingMember = await MemberRepository.findById(id);

      if (!existingMember) {
        throw new Error('Member not found');
      }

      /**
       * TOGGLE STATUS
       *
       * Repository handles the toggle logic
       */
      const updatedMember = await MemberRepository.toggleStatus(id);

      if (!updatedMember) {
        throw new Error('Failed to toggle member status');
      }

      return updatedMember;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(error.message || 'Failed to toggle member status');
    }
  }

  /**
   * DELETE MEMBER (SOFT DELETE)
   *
   * Deactivate member (set isActive = false)
   *
   * Business Logic:
   * - Soft delete (doesn't remove from database)
   * - Set isActive = false
   * - Preserve all data (trades, history)
   *
   * Why soft delete?
   * - Maintain referential integrity
   * - Preserve audit trail
   * - Can reactivate if needed
   * - Don't lose transaction history
   *
   * Use Cases:
   * - Remove member from active list
   * - Close member account
   * - Suspend member temporarily
   *
   * @param id - Member ID
   * @returns Promise<IMember>
   * @throws 404 if member not found
   *
   * Note: For permanent deletion, use hardDelete (admin only, very rare)
   */
  static async deleteMember(id: string) {
    try {
      /**
       * CHECK IF EXISTS
       */
      const existingMember = await MemberRepository.findById(id);

      if (!existingMember) {
        throw new Error('Member not found');
      }

      /**
       * CHECK IF ALREADY DELETED
       *
       * If already inactive, inform user
       */
      if (!existingMember.isActive) {
        throw new Error('Member is already inactive');
      }

      /**
       * SOFT DELETE
       */
      const deletedMember = await MemberRepository.softDelete(id);

      if (!deletedMember) {
        throw new Error('Failed to delete member');
      }

      return deletedMember;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(error.message || 'Failed to delete member');
    }
  }

  /**
   * SEARCH MEMBERS
   *
   * Search members by name or email
   *
   * Business Logic:
   * - Case-insensitive search
   * - Search in name and email fields
   * - Paginated results
   *
   * Use Cases:
   * - Admin search box
   * - Find member by name
   * - Find member by email
   *
   * @param query - Search term
   * @param options - Pagination options
   * @returns Promise<PaginatedResult>
   *
   * Example:
   * const results = await MemberService.searchMembers("john", { page: 1, limit: 10 });
   * // Returns members with "john" in name or email
   */
  static async searchMembers(
    query: string,
    options: PaginationOptions = { page: 1, limit: 10 }
  ) {
    try {
      /**
       * VALIDATE SEARCH QUERY
       *
       * Require minimum 2 characters for search
       * Prevents searching single characters (too broad)
       */
      if (!query || query.trim().length < 2) {
        throw new Error('Search query must be at least 2 characters');
      }

      /**
       * SEARCH
       */
      const result = await MemberRepository.search(query.trim(), options);

      return result;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(error.message || 'Failed to search members');
    }
  }

  /**
   * GET MEMBER STATISTICS
   *
   * Get member counts and statistics
   *
   * Business Logic:
   * - Total members
   * - Active members
   * - Inactive members
   *
   * Use Cases:
   * - Admin dashboard
   * - Member analytics
   * - Reports
   *
   * @returns Promise<{ total, active, inactive }>
   *
   * Example:
   * const stats = await MemberService.getMemberStats();
   * // { total: 100, active: 85, inactive: 15 }
   */
  static async getMemberStats() {
    try {
      /**
       * PARALLEL QUERIES
       *
       * Get both counts at same time for better performance
       */
      const [total, active] = await Promise.all([
        MemberRepository.count(false), // All members
        MemberRepository.count(true),  // Active only
      ]);

      /**
       * CALCULATE INACTIVE
       *
       * Inactive = Total - Active
       */
      const inactive = total - active;

      return {
        total,
        active,
        inactive,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to retrieve member statistics');
    }
  }
}

export default MemberService;

/**
 * USAGE EXAMPLES:
 *
 * // Get all members (paginated)
 * const members = await MemberService.getAllMembers({ page: 1, limit: 10 });
 *
 * // Get active members only
 * const activeMembers = await MemberService.getActiveMembers({ page: 1, limit: 10 });
 *
 * // Get single member
 * const member = await MemberService.getMemberById("507f1f77bcf86cd799439011");
 *
 * // Create member
 * const newMember = await MemberService.createMember({
 *   name: "John Doe",
 *   email: "john@example.com",
 *   password: "SecurePass@123",
 *   phone: "+1 234-567-8900"
 * });
 *
 * // Update member
 * const updated = await MemberService.updateMember(id, {
 *   name: "Jane Doe",
 *   phone: "+1 987-654-3210"
 * });
 *
 * // Toggle status
 * const toggled = await MemberService.toggleMemberStatus(id);
 *
 * // Delete member (soft)
 * const deleted = await MemberService.deleteMember(id);
 *
 * // Search members
 * const results = await MemberService.searchMembers("john", { page: 1, limit: 10 });
 *
 * // Get statistics
 * const stats = await MemberService.getMemberStats();
 * console.log(stats); // { total: 100, active: 85, inactive: 15 }
 */
