import Member, { IMember } from '../entities/Member';
import { Types } from 'mongoose';

/**
 * MEMBER REPOSITORY
 *
 * Data Access Layer for Member operations
 *
 * Purpose:
 * - Centralize all database operations
 * - Separate data access from business logic
 * - Make code testable (easy to mock)
 * - Reusable across services
 *
 * Pattern: Repository Pattern
 * - Controller calls Service
 * - Service calls Repository
 * - Repository talks to Database
 *
 * Benefits:
 * - Single source of truth for queries
 * - Easy to change database implementation
 * - Clean separation of concerns
 */

/**
 * PAGINATION OPTIONS
 *
 * Interface for paginated queries
 */
export interface PaginationOptions {
  page: number;      // Current page (1-based)
  limit: number;     // Items per page
  sortBy?: string;   // Field to sort by
  sortOrder?: 'asc' | 'desc';
}

/**
 * PAGINATED RESULT
 *
 * Interface for paginated response
 */
export interface PaginatedResult<T> {
  data: T[];         // Array of items
  pagination: {
    page: number;    // Current page
    limit: number;   // Items per page
    total: number;   // Total items in database
    pages: number;   // Total number of pages
  };
}

export class MemberRepository {
  /**
   * FIND ALL MEMBERS (WITH PAGINATION)
   *
   * Get list of all members with pagination support
   *
   * Features:
   * - Pagination (page, limit)
   * - Sorting (by any field)
   * - Count total members
   * - Calculate total pages
   *
   * Use Cases:
   * - Admin member list page
   * - Export members
   * - Search members
   *
   * @param options - Pagination and sorting options
   * @returns Promise<PaginatedResult<IMember>>
   *
   * Example:
   * const result = await MemberRepository.findAll({ page: 1, limit: 10 });
   * console.log(result.data); // Array of 10 members
   * console.log(result.pagination.total); // Total count
   */
  static async findAll(
    options: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginatedResult<IMember>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    /**
     * PAGINATION CALCULATION
     *
     * Skip: How many documents to skip
     * Example: Page 1, limit 10 → skip 0
     *          Page 2, limit 10 → skip 10
     *          Page 3, limit 10 → skip 20
     */
    const skip = (page - 1) * limit;

    /**
     * SORT ORDER
     *
     * MongoDB sort:
     * 1 = ascending (A-Z, oldest first)
     * -1 = descending (Z-A, newest first)
     */
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    /**
     * PARALLEL QUERIES
     *
     * Run count and find in parallel for better performance
     * Promise.all() executes both at same time
     */
    const [members, total] = await Promise.all([
      /**
       * FIND QUERY
       * - Skip first N documents (pagination)
       * - Limit to N documents (page size)
       * - Sort by field
       * - Exclude password field (security)
       */
      Member.find()
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .select('-password'), // Don't return password

      /**
       * COUNT QUERY
       * - Count total documents
       * - Used to calculate total pages
       */
      Member.countDocuments(),
    ]);

    /**
     * CALCULATE TOTAL PAGES
     *
     * Example:
     * Total: 25, Limit: 10 → Pages: 3 (Math.ceil(25/10))
     * Total: 20, Limit: 10 → Pages: 2 (Math.ceil(20/10))
     */
    const pages = Math.ceil(total / limit);

    return {
      data: members,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  /**
   * FIND ACTIVE MEMBERS ONLY
   *
   * Get only active members (isActive = true)
   * Excludes soft-deleted members
   *
   * Use Cases:
   * - Display active members list
   * - Filter out deactivated accounts
   *
   * @param options - Pagination options
   * @returns Promise<PaginatedResult<IMember>>
   */
  static async findActiveMembers(
    options: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginatedResult<IMember>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [members, total] = await Promise.all([
      Member.find({ isActive: true }) // 👈 Only active members
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .select('-password'),

      Member.countDocuments({ isActive: true }), // Count only active
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data: members,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * FIND BY ID
   *
   * Get single member by MongoDB ObjectId
   *
   * Use Cases:
   * - View member details
   * - Edit member
   * - Verify member exists
   *
   * @param id - Member ID (MongoDB ObjectId as string)
   * @returns Promise<IMember | null>
   *
   * Example:
   * const member = await MemberRepository.findById("507f1f77bcf86cd799439011");
   * if (!member) throw new Error("Member not found");
   */
  static async findById(id: string): Promise<IMember | null> {
    /**
     * VALIDATION: Check if ID is valid ObjectId
     *
     * MongoDB ObjectId format: 24-character hex string
     * Invalid examples: "123", "abc", "invalid-id"
     * Valid example: "507f1f77bcf86cd799439011"
     */
    if (!Types.ObjectId.isValid(id)) {
      return null; // Invalid ID format
    }

    /**
     * FIND ONE
     *
     * findById() is shorthand for findOne({ _id: id })
     * Returns null if not found
     * Excludes password by default (security)
     */
    return await Member.findById(id).select('-password');
  }

  /**
   * FIND BY EMAIL
   *
   * Get member by email address
   *
   * Use Cases:
   * - Check if email already exists (before creating)
   * - Member login (with password)
   * - Password reset
   *
   * @param email - Member email address
   * @param includePassword - Whether to include password field (default: false)
   * @returns Promise<IMember | null>
   *
   * Examples:
   * // Check if email exists
   * const exists = await MemberRepository.findByEmail("john@example.com");
   *
   * // For login (need password)
   * const member = await MemberRepository.findByEmail("john@example.com", true);
   * const isValid = await member.comparePassword("password");
   */
  static async findByEmail(
    email: string,
    includePassword: boolean = false
  ): Promise<IMember | null> {
    /**
     * QUERY OPTIONS
     *
     * includePassword = false (default):
     * - Don't return password field
     * - Use for: checking email existence, displaying profile
     *
     * includePassword = true:
     * - Include password field
     * - Use for: login authentication only
     * - select('+password') overrides the 'select: false' in schema
     */
    const query = Member.findOne({ email: email.toLowerCase() });

    if (includePassword) {
      query.select('+password'); // Include password for authentication
    } else {
      query.select('-password'); // Exclude password (default)
    }

    return await query;
  }

  /**
   * FIND BY RESET TOKEN
   *
   * Get member by password reset token
   *
   * Use Cases:
   * - Password reset verification
   * - Validate reset token
   *
   * @param resetToken - Password reset token
   * @returns Promise<IMember | null>
   *
   * Example:
   * const member = await MemberRepository.findByResetToken(token);
   * if (!member || member.resetPasswordExpires < new Date()) {
   *   throw new Error("Invalid or expired token");
   * }
   */
  static async findByResetToken(resetToken: string): Promise<IMember | null> {
    /**
     * FIND BY RESET TOKEN
     *
     * Include resetPasswordToken and resetPasswordExpires fields
     * These fields have 'select: false' in schema, so need to explicitly include
     */
    return await Member.findOne({ resetPasswordToken: resetToken })
      .select('+resetPasswordToken +resetPasswordExpires');
  }

  /**
   * CREATE MEMBER
   *
   * Add new member to database
   *
   * Process:
   * 1. Check email uniqueness (handled by MongoDB unique index)
   * 2. Create member document
   * 3. Pre-save hook hashes password automatically
   * 4. Save to database
   * 5. Return created member (without password)
   *
   * @param memberData - Member information
   * @returns Promise<IMember>
   *
   * Example:
   * const member = await MemberRepository.create({
   *   name: "John Doe",
   *   email: "john@example.com",
   *   password: "SecurePass@123",
   *   phone: "+1 234-567-8900"
   * });
   *
   * Errors:
   * - Duplicate email: MongoServerError E11000 duplicate key
   * - Validation error: Missing required fields
   */
  static async create(memberData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    goldHoldings?: number;
  }): Promise<IMember> {
    /**
     * CREATE AND SAVE
     *
     * Member.create() does:
     * 1. Validate fields (required, format, etc.)
     * 2. Run pre-save hooks (password hashing)
     * 3. Check unique constraints (email)
     * 4. Insert into database
     * 5. Return saved document
     */
    const member = await Member.create(memberData);

    /**
     * RETURN WITHOUT PASSWORD
     *
     * .toJSON() applies transform (removes password)
     * Safe to send to frontend
     */
    return member;
  }

  /**
   * UPDATE MEMBER
   *
   * Update existing member details
   *
   * Allowed updates:
   * - name, phone, goldHoldings
   *
   * NOT allowed to update:
   * - email (unique identifier)
   * - password (use separate changePassword method)
   * - isActive (use toggleStatus method)
   *
   * @param id - Member ID
   * @param updateData - Fields to update
   * @returns Promise<IMember | null>
   *
   * Example:
   * const updated = await MemberRepository.update(id, {
   *   name: "Jane Doe",
   *   phone: "+1 987-654-3210"
   * });
   */
  static async update(
    id: string,
    updateData: {
      name?: string;
      phone?: string;
      goldHoldings?: number;
    }
  ): Promise<IMember | null> {
    /**
     * VALIDATE ID
     */
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    /**
     * FIND AND UPDATE
     *
     * Options:
     * - new: true → Return updated document (not old one)
     * - runValidators: true → Run schema validators
     * - select: '-password' → Don't return password
     */
    const member = await Member.findByIdAndUpdate(id, updateData, {
      new: true, // Return updated document
      runValidators: true, // Validate updated fields
    }).select('-password');

    return member;
  }

  /**
   * TOGGLE STATUS (ACTIVATE/DEACTIVATE)
   *
   * Toggle member's active status
   *
   * Use Cases:
   * - Deactivate member (soft delete)
   * - Reactivate member
   * - Suspend member temporarily
   *
   * @param id - Member ID
   * @returns Promise<IMember | null>
   *
   * Example:
   * // Deactivate
   * const member = await MemberRepository.toggleStatus(id);
   * console.log(member.isActive); // false
   *
   * // Reactivate
   * const member2 = await MemberRepository.toggleStatus(id);
   * console.log(member2.isActive); // true
   */
  static async toggleStatus(id: string): Promise<IMember | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    /**
     * GET CURRENT STATUS
     *
     * First fetch member to get current status
     */
    const member = await Member.findById(id);
    if (!member) {
      return null;
    }

    /**
     * TOGGLE STATUS
     *
     * true → false
     * false → true
     */
    member.isActive = !member.isActive;

    /**
     * SAVE
     *
     * Triggers pre-save hooks
     * Updates updatedAt timestamp
     */
    await member.save();

    /**
     * RETURN WITHOUT PASSWORD
     */
    const result = await Member.findById(id).select('-password');
    return result;
  }

  /**
   * SOFT DELETE
   *
   * Deactivate member (set isActive = false)
   * Does NOT delete from database
   *
   * Benefits:
   * - Preserve historical data
   * - Can reactivate later
   * - Maintain referential integrity (trades still linked)
   *
   * @param id - Member ID
   * @returns Promise<IMember | null>
   */
  static async softDelete(id: string): Promise<IMember | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const member = await Member.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    return member;
  }

  /**
   * HARD DELETE
   *
   * Permanently delete member from database
   *
   * WARNING: Use with caution!
   * - Cannot undo
   * - Loses all data
   * - May break foreign key references
   *
   * Recommended: Use softDelete() instead
   *
   * @param id - Member ID
   * @returns Promise<boolean> - true if deleted, false if not found
   */
  static async hardDelete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await Member.findByIdAndDelete(id);
    return result !== null;
  }

  /**
   * SEARCH MEMBERS
   *
   * Search members by name or email
   *
   * Use Cases:
   * - Admin search box
   * - Autocomplete
   * - Filter members
   *
   * @param query - Search term
   * @param options - Pagination options
   * @returns Promise<PaginatedResult<IMember>>
   *
   * Example:
   * const results = await MemberRepository.search("john", { page: 1, limit: 10 });
   */
  static async search(
    query: string,
    options: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginatedResult<IMember>> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    /**
     * SEARCH QUERY
     *
     * $or: Match ANY condition
     * $regex: Pattern matching (like SQL LIKE)
     * $options: 'i' = case-insensitive
     *
     * Example: query = "john"
     * Matches:
     * - name: "John Doe", "JOHN", "johnny"
     * - email: "john@example.com", "JOHN123@test.com"
     */
    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    };

    const [members, total] = await Promise.all([
      Member.find(searchQuery)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .select('-password'),

      Member.countDocuments(searchQuery),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data: members,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * COUNT MEMBERS
   *
   * Get total count of members
   *
   * @param onlyActive - Count only active members
   * @returns Promise<number>
   */
  static async count(onlyActive: boolean = false): Promise<number> {
    const query = onlyActive ? { isActive: true } : {};
    return await Member.countDocuments(query);
  }
}

export default MemberRepository;

/**
 * USAGE EXAMPLES:
 *
 * // Get paginated members
 * const result = await MemberRepository.findAll({ page: 1, limit: 10 });
 * console.log(result.data); // Array of members
 * console.log(result.pagination.total); // Total count
 *
 * // Get active members only
 * const active = await MemberRepository.findActiveMembers({ page: 1, limit: 10 });
 *
 * // Find by ID
 * const member = await MemberRepository.findById("507f1f77bcf86cd799439011");
 *
 * // Find by email
 * const member = await MemberRepository.findByEmail("john@example.com");
 *
 * // Create member
 * const newMember = await MemberRepository.create({
 *   name: "John Doe",
 *   email: "john@example.com",
 *   password: "SecurePass@123",
 *   phone: "+1 234-567-8900"
 * });
 *
 * // Update member
 * const updated = await MemberRepository.update(id, {
 *   name: "Jane Doe",
 *   phone: "+1 987-654-3210"
 * });
 *
 * // Toggle status
 * const toggled = await MemberRepository.toggleStatus(id);
 *
 * // Soft delete
 * const deleted = await MemberRepository.softDelete(id);
 *
 * // Search members
 * const results = await MemberRepository.search("john", { page: 1, limit: 10 });
 *
 * // Count members
 * const totalMembers = await MemberRepository.count();
 * const activeMembers = await MemberRepository.count(true);
 */
