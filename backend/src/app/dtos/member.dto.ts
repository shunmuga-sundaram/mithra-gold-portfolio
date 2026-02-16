import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';

/**
 * MEMBER DTOs (Data Transfer Objects)
 *
 * Purpose:
 * - Validate incoming request data
 * - Enforce data rules before reaching service
 * - Provide clear error messages
 * - Type safety with TypeScript
 *
 * How it works:
 * 1. Request comes with JSON body
 * 2. BodyValidationMiddleware converts to DTO
 * 3. class-validator checks all rules
 * 4. If valid: passes to controller
 * 5. If invalid: returns 400 error with messages
 *
 * Pattern:
 * Controller → Middleware → DTO Validation → Service
 *
 * We already use this for AdminLoginDto!
 * Same pattern for members.
 */

/**
 * CREATE MEMBER DTO
 *
 * Validates data when creating a new member
 *
 * Used by: POST /api/members
 *
 * Required fields:
 * - name, email, password, phone
 *
 * Optional fields:
 * - goldHoldings (defaults to 0)
 *
 * Validations:
 * - Email must be valid format
 * - Password must be strong (8+ chars, uppercase, lowercase, digit, special)
 * - Phone must be valid format
 * - Name length limits
 */
export class CreateMemberDto {
  /**
   * NAME
   *
   * Member's full name
   *
   * Rules:
   * - Required (cannot be empty)
   * - String type
   * - Minimum 2 characters
   * - Maximum 100 characters
   *
   * Examples:
   * ✓ "John Doe"
   * ✓ "Jane Smith"
   * ✗ "J" (too short)
   * ✗ "" (empty)
   */
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name: string;

  /**
   * EMAIL
   *
   * Member's email address (unique, used for login)
   *
   * Rules:
   * - Required
   * - Valid email format
   * - Will be stored in lowercase
   * - Must be unique (checked by MongoDB)
   *
   * Examples:
   * ✓ "john@example.com"
   * ✓ "jane.smith@company.co.uk"
   * ✗ "invalid-email" (no @)
   * ✗ "john@" (incomplete)
   * ✗ "@example.com" (no local part)
   *
   * Note: Uniqueness is enforced by MongoDB unique index
   * If email exists, MongoDB throws E11000 duplicate key error
   */
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  /**
   * PASSWORD
   *
   * Member's login password (will be hashed before storing)
   *
   * Rules:
   * - Required
   * - Minimum 8 characters
   * - Must contain at least one uppercase letter (A-Z)
   * - Must contain at least one lowercase letter (a-z)
   * - Must contain at least one digit (0-9)
   * - Must contain at least one special character (@$!%*?&)
   *
   * Examples:
   * ✓ "SecurePass@123"
   * ✓ "MyP@ssw0rd"
   * ✓ "Strong!Pass1"
   * ✗ "password" (no uppercase, digit, special char)
   * ✗ "PASSWORD@" (no lowercase, digit)
   * ✗ "Pass@1" (too short, less than 8 chars)
   *
   * Security:
   * - Password will be hashed by pre-save hook in Member model
   * - Uses bcrypt with 10 salt rounds
   * - Plain password never stored in database
   */
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
  })
  password: string;

  /**
   * PHONE
   *
   * Member's contact phone number
   *
   * Rules:
   * - Required
   * - Valid phone format
   * - Can include country code, spaces, dashes, parentheses
   *
   * Examples:
   * ✓ "+1 234-567-8900"
   * ✓ "1234567890"
   * ✓ "+91-9876543210"
   * ✓ "(123) 456-7890"
   * ✗ "12-34" (too short)
   * ✗ "abcd" (not numbers)
   *
   * Regex Pattern Explanation:
   * ^[\+]? - Optional + at start (country code)
   * [(]?[0-9]{1,4}[)]? - Optional area code in parentheses
   * [-\s\.]? - Optional separator (dash, space, dot)
   * [0-9]{1,5} - Digits
   * $ - End of string
   */
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  @Matches(
    /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/,
    { message: 'Please enter a valid phone number' }
  )
  phone: string;

  /**
   * GOLD HOLDINGS (Optional)
   *
   * Initial gold holdings (in grams)
   *
   * Rules:
   * - Optional (defaults to 0 if not provided)
   * - Must be a number
   * - Cannot be negative
   *
   * Usually:
   * - New members start with 0
   * - Updated when trades are created
   *
   * Admin can override if importing existing data
   */
  @IsOptional()
  @IsNumber({}, { message: 'Gold holdings must be a number' })
  @Min(0, { message: 'Gold holdings cannot be negative' })
  goldHoldings?: number;
}

/**
 * UPDATE MEMBER DTO
 *
 * Validates data when updating an existing member
 *
 * Used by: PUT /api/members/:id
 *
 * All fields are optional:
 * - Only send fields you want to update
 * - Other fields remain unchanged
 *
 * NOT allowed to update:
 * - email (unique identifier, use separate endpoint)
 * - password (use separate changePassword endpoint)
 * - isActive (use toggleStatus endpoint)
 */
export class UpdateMemberDto {
  /**
   * NAME (Optional)
   *
   * Update member's name
   *
   * Same validation as CreateMemberDto
   */
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name?: string;

  /**
   * PHONE (Optional)
   *
   * Update member's phone number
   *
   * Same validation as CreateMemberDto
   */
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @Matches(
    /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/,
    { message: 'Please enter a valid phone number' }
  )
  phone?: string;

  /**
   * GOLD HOLDINGS (Optional)
   *
   * Update member's gold holdings
   *
   * Usually updated by trade transactions, but admin can override
   */
  @IsOptional()
  @IsNumber({}, { message: 'Gold holdings must be a number' })
  @Min(0, { message: 'Gold holdings cannot be negative' })
  goldHoldings?: number;
}

/**
 * TOGGLE STATUS DTO
 *
 * Validates request to toggle member's active status
 *
 * Used by: PATCH /api/members/:id/toggle-status
 *
 * This DTO is simple - we just need the ID from URL params
 * No body parameters needed
 *
 * The service will:
 * 1. Get current status from database
 * 2. Toggle: true → false or false → true
 * 3. Save and return updated member
 */
export class ToggleStatusDto {
  // No body parameters needed
  // ID comes from URL: /api/members/:id/toggle-status
}

/**
 * MEMBER LOGIN DTO
 *
 * Validates member login credentials
 *
 * Used by: POST /api/auth/member/login (future member portal)
 *
 * Similar to AdminLoginDto but for members
 *
 * Required fields:
 * - email
 * - password
 */
export class MemberLoginDto {
  /**
   * EMAIL
   *
   * Member's email address
   */
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  /**
   * PASSWORD
   *
   * Member's password (plain text, will be compared with hash)
   *
   * No format validation here - just check it's provided
   * Backend will verify against hashed password
   */
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password: string;
}

/**
 * CHANGE PASSWORD DTO
 *
 * Validates password change request
 *
 * Used by: PATCH /api/members/:id/change-password
 *
 * Required fields:
 * - currentPassword (verify it's the member)
 * - newPassword (must meet strength requirements)
 */
export class ChangePasswordDto {
  /**
   * CURRENT PASSWORD
   *
   * Member's current password for verification
   */
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString({ message: 'Current password must be a string' })
  currentPassword: string;

  /**
   * NEW PASSWORD
   *
   * Member's new password
   *
   * Same strength requirements as initial password
   */
  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
  })
  newPassword: string;
}

/**
 * QUERY PARAMS DTO
 *
 * Validates query parameters for list/search endpoints
 *
 * Used by:
 * - GET /api/members?page=1&limit=10&sortBy=name&sortOrder=asc
 * - GET /api/members/search?query=john&page=1
 *
 * All fields optional (have defaults)
 */
export class MemberQueryDto {
  /**
   * PAGE
   *
   * Page number (1-based)
   * Default: 1
   */
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  /**
   * LIMIT
   *
   * Items per page
   * Default: 10
   * Max: 100 (prevent loading too much data)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Min(100, { message: 'Limit cannot exceed 100' })
  limit?: number;

  /**
   * SORT BY
   *
   * Field to sort by
   * Default: createdAt
   */
  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  sortBy?: string;

  /**
   * SORT ORDER
   *
   * Ascending or descending
   * Default: desc
   */
  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  sortOrder?: 'asc' | 'desc';

  /**
   * SEARCH QUERY
   *
   * Search term for name/email
   * Used by search endpoint
   */
  @IsOptional()
  @IsString({ message: 'Search query must be a string' })
  query?: string;

  /**
   * ACTIVE ONLY
   *
   * Filter to show only active members
   * Default: false (show all)
   */
  @IsOptional()
  @IsBoolean({ message: 'Active only must be a boolean' })
  activeOnly?: boolean;
}

/**
 * HOW DTOs ARE USED:
 *
 * 1. In Routes:
 * router.post('/members',
 *   BodyValidationMiddleware(CreateMemberDto),  // ← DTO validation
 *   MemberController.createMember
 * );
 *
 * 2. Request Flow:
 * Client sends JSON
 *   ↓
 * BodyValidationMiddleware converts to CreateMemberDto
 *   ↓
 * class-validator checks all decorators (@IsEmail, @MinLength, etc.)
 *   ↓
 * If valid: passes to controller with typed object
 * If invalid: returns 400 error with validation messages
 *
 * 3. Error Response Example:
 * POST /api/members
 * Body: { "name": "J", "email": "invalid", "password": "weak" }
 *
 * Response (400):
 * {
 *   "statusCode": 400,
 *   "message": [
 *     "Name must be at least 2 characters",
 *     "Please enter a valid email address",
 *     "Password must be at least 8 characters",
 *     "Password must contain at least one uppercase letter, ..."
 *   ],
 *   "error": "Bad Request"
 * }
 *
 * 4. Success Example:
 * POST /api/members
 * Body: {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "SecurePass@123",
 *   "phone": "+1 234-567-8900"
 * }
 *
 * → All validations pass ✓
 * → Controller receives typed CreateMemberDto object
 * → Service creates member
 * → Response (201): { ...member data... }
 */
