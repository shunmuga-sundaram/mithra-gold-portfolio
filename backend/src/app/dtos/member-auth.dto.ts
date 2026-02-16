import { IsEmail, IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';

/**
 * Member Login DTO (Data Transfer Object)
 *
 * This class defines the structure and validation rules for member login requests.
 * It uses class-validator decorators to automatically validate incoming data.
 *
 * Benefits of using DTOs:
 * - Automatic validation
 * - Clear contract for API requests
 * - Type safety
 * - Reusable validation rules
 * - Better error messages
 */

/**
 * Member Login DTO
 *
 * Used for: POST /api/auth/member/login
 */
export class MemberLoginDto {
    /**
     * Email field validation
     *
     * Rules:
     * - Must be provided (IsNotEmpty)
     * - Must be valid email format (IsEmail)
     * - Will be converted to lowercase in service
     */
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

    /**
     * Password field validation
     *
     * Rules:
     * - Must be provided (IsNotEmpty)
     * - Must be a string (IsString)
     * - Minimum 8 characters (MinLength)
     * - Must contain: 1 uppercase, 1 lowercase, 1 number, 1 special character (Matches)
     */
    @IsNotEmpty({ message: 'Password is required' })
    @IsString({ message: 'Password must be a string' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        }
    )
    password: string;
}

/**
 * Refresh Token DTO
 *
 * Used for: POST /api/auth/member/refresh
 */
export class MemberRefreshTokenDto {
    /**
     * Refresh Token field validation
     *
     * Rules:
     * - Must be provided (IsNotEmpty)
     * - Must be a string (IsString)
     */
    @IsNotEmpty({ message: 'Refresh token is required' })
    @IsString({ message: 'Refresh token must be a string' })
    refreshToken: string;
}
