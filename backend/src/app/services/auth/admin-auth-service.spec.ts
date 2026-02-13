/**
 * Admin Auth Service Tests
 *
 * This file contains unit tests for AdminAuthService using Jest.
 * We test all authentication methods including login, token generation,
 * and token verification.
 *
 * Run tests with: npm test
 * Run specific file: npm test admin-auth-service.spec.ts
 */

import { AdminAuthService } from './admin-auth-service';
import { AdminRepository } from '../../models/repositories/AdminRepository';
import { Admin } from '../../models/entities/Admin';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../../config/jwt-config';

// Mock the AdminRepository
jest.mock('../../models/repositories/AdminRepository');

// Mock JWT
jest.mock('jsonwebtoken');

describe('AdminAuthService', () => {
    // Clear all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login()', () => {
        it('should successfully login with valid credentials', async () => {
            // Arrange: Set up test data
            const mockAdmin = {
                _id: { toString: () => '507f1f77bcf86cd799439011' },
                name: 'Test Admin',
                email: 'admin@test.com',
                role: 'super_admin',
                isActive: true,
                comparePassword: jest.fn().mockResolvedValue(true),
            };

            // Mock repository to return the admin
            (AdminRepository.findByEmail as jest.Mock).mockResolvedValue(mockAdmin);

            // Mock JWT token generation
            (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

            // Act: Call the login method
            const result = await AdminAuthService.login('admin@test.com', 'Admin@123');

            // Assert: Verify the results
            expect(result.success).toBe(true);
            expect(result.message).toBe('Login successful');
            expect(result.data.admin.email).toBe('admin@test.com');
            expect(result.data.admin.name).toBe('Test Admin');
            expect(result.data.accessToken).toBe('mock-jwt-token');
            expect(result.data.refreshToken).toBe('mock-jwt-token');

            // Verify repository was called with correct parameters
            expect(AdminRepository.findByEmail).toHaveBeenCalledWith('admin@test.com', true);

            // Verify password comparison was called
            expect(mockAdmin.comparePassword).toHaveBeenCalledWith('Admin@123');

            // Verify JWT was generated (called twice: access + refresh)
            expect(jwt.sign).toHaveBeenCalledTimes(2);
        });

        it('should throw error if admin does not exist', async () => {
            // Arrange: Mock repository to return null (admin not found)
            (AdminRepository.findByEmail as jest.Mock).mockResolvedValue(null);

            // Act & Assert: Expect error to be thrown
            await expect(
                AdminAuthService.login('nonexistent@test.com', 'Admin@123')
            ).rejects.toThrow('Invalid email or password');

            // Verify repository was called
            expect(AdminRepository.findByEmail).toHaveBeenCalledWith('nonexistent@test.com', true);
        });

        it('should throw error if password is incorrect', async () => {
            // Arrange: Mock admin with incorrect password
            const mockAdmin = {
                _id: { toString: () => '507f1f77bcf86cd799439011' },
                email: 'admin@test.com',
                isActive: true,
                comparePassword: jest.fn().mockResolvedValue(false), // Wrong password
            };

            (AdminRepository.findByEmail as jest.Mock).mockResolvedValue(mockAdmin);

            // Act & Assert
            await expect(
                AdminAuthService.login('admin@test.com', 'WrongPassword')
            ).rejects.toThrow('Invalid email or password');

            // Verify password comparison was attempted
            expect(mockAdmin.comparePassword).toHaveBeenCalledWith('WrongPassword');
        });

        it('should throw error if account is disabled', async () => {
            // Arrange: Mock admin with isActive = false
            const mockAdmin = {
                _id: { toString: () => '507f1f77bcf86cd799439011' },
                email: 'admin@test.com',
                isActive: false, // Account disabled
                comparePassword: jest.fn().mockResolvedValue(true),
            };

            (AdminRepository.findByEmail as jest.Mock).mockResolvedValue(mockAdmin);

            // Act & Assert
            await expect(
                AdminAuthService.login('admin@test.com', 'Admin@123')
            ).rejects.toThrow('Account is disabled');
        });

        it('should not reveal if email exists on wrong password (security)', async () => {
            // Arrange: Test both scenarios return same error message
            const mockAdmin = {
                email: 'admin@test.com',
                isActive: true,
                comparePassword: jest.fn().mockResolvedValue(false),
            };

            // Scenario 1: Admin doesn't exist
            (AdminRepository.findByEmail as jest.Mock).mockResolvedValue(null);
            let error1;
            try {
                await AdminAuthService.login('admin@test.com', 'Admin@123');
            } catch (e: any) {
                error1 = e.message;
            }

            // Scenario 2: Admin exists but wrong password
            (AdminRepository.findByEmail as jest.Mock).mockResolvedValue(mockAdmin);
            let error2;
            try {
                await AdminAuthService.login('admin@test.com', 'WrongPassword');
            } catch (e: any) {
                error2 = e.message;
            }

            // Assert: Both errors should be identical (security best practice)
            expect(error1).toBe('Invalid email or password');
            expect(error2).toBe('Invalid email or password');
        });
    });

    describe('verifyAccessToken()', () => {
        it('should successfully verify valid access token', () => {
            // Arrange
            const mockPayload = {
                id: '507f1f77bcf86cd799439011',
                email: 'admin@test.com',
                role: 'super_admin',
                type: 'admin' as const,
            };

            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

            // Act
            const result = AdminAuthService.verifyAccessToken('valid-token');

            // Assert
            expect(result).toEqual(mockPayload);
            expect(jwt.verify).toHaveBeenCalledWith(
                'valid-token',
                JWT_CONFIG.ACCESS_TOKEN_SECRET,
                expect.objectContaining({
                    issuer: JWT_CONFIG.ISSUER,
                    audience: JWT_CONFIG.AUDIENCE,
                })
            );
        });

        it('should throw error for expired token', () => {
            // Arrange
            const expiredError = new jwt.TokenExpiredError('Token expired', new Date());
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw expiredError;
            });

            // Act & Assert
            expect(() => {
                AdminAuthService.verifyAccessToken('expired-token');
            }).toThrow('Token has expired. Please login again.');
        });

        it('should throw error for invalid token', () => {
            // Arrange
            const invalidError = new jwt.JsonWebTokenError('Invalid token');
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw invalidError;
            });

            // Act & Assert
            expect(() => {
                AdminAuthService.verifyAccessToken('invalid-token');
            }).toThrow('Invalid token. Please login again.');
        });
    });

    describe('refreshAccessToken()', () => {
        it('should generate new access token with valid refresh token', async () => {
            // Arrange
            const mockPayload = {
                id: '507f1f77bcf86cd799439011',
                email: 'admin@test.com',
                role: 'super_admin',
                type: 'admin' as const,
            };

            const mockAdmin = {
                _id: { toString: () => '507f1f77bcf86cd799439011' },
                email: 'admin@test.com',
                name: 'Test Admin',
                role: 'super_admin',
                isActive: true,
            };

            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
            (AdminRepository.findById as jest.Mock).mockResolvedValue(mockAdmin);
            (jwt.sign as jest.Mock).mockReturnValue('new-access-token');

            // Act
            const result = await AdminAuthService.refreshAccessToken('valid-refresh-token');

            // Assert
            expect(result.accessToken).toBe('new-access-token');
            expect(result.expiresIn).toBe(2592000); // 30 days in seconds
            expect(AdminRepository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });

        it('should throw error if admin no longer exists', async () => {
            // Arrange
            const mockPayload = {
                id: '507f1f77bcf86cd799439011',
                email: 'admin@test.com',
                role: 'super_admin',
                type: 'admin' as const,
            };

            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
            (AdminRepository.findById as jest.Mock).mockResolvedValue(null);

            // Act & Assert
            await expect(
                AdminAuthService.refreshAccessToken('valid-refresh-token')
            ).rejects.toThrow('Admin not found. Please login again.');
        });

        it('should throw error if admin account is disabled', async () => {
            // Arrange
            const mockPayload = {
                id: '507f1f77bcf86cd799439011',
                email: 'admin@test.com',
                role: 'super_admin',
                type: 'admin' as const,
            };

            const mockAdmin = {
                _id: { toString: () => '507f1f77bcf86cd799439011' },
                isActive: false, // Disabled account
            };

            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
            (AdminRepository.findById as jest.Mock).mockResolvedValue(mockAdmin);

            // Act & Assert
            await expect(
                AdminAuthService.refreshAccessToken('valid-refresh-token')
            ).rejects.toThrow('Account is disabled. Please contact the administrator.');
        });
    });

    describe('getAdminFromToken()', () => {
        it('should return admin data from valid token', async () => {
            // Arrange
            const mockPayload = {
                id: '507f1f77bcf86cd799439011',
                email: 'admin@test.com',
                role: 'super_admin',
                type: 'admin' as const,
            };

            const mockAdmin = {
                _id: { toString: () => '507f1f77bcf86cd799439011' },
                name: 'Test Admin',
                email: 'admin@test.com',
                role: 'super_admin',
                isActive: true,
            };

            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
            (AdminRepository.findById as jest.Mock).mockResolvedValue(mockAdmin);

            // Act
            const result = await AdminAuthService.getAdminFromToken('valid-token');

            // Assert
            expect(result).toEqual(mockAdmin);
            expect(result.email).toBe('admin@test.com');
            expect(result.name).toBe('Test Admin');
        });

        it('should throw error if admin not found', async () => {
            // Arrange
            const mockPayload = {
                id: '507f1f77bcf86cd799439011',
                email: 'admin@test.com',
                role: 'super_admin',
                type: 'admin' as const,
            };

            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
            (AdminRepository.findById as jest.Mock).mockResolvedValue(null);

            // Act & Assert
            await expect(
                AdminAuthService.getAdminFromToken('valid-token')
            ).rejects.toThrow('Admin not found.');
        });

        it('should throw error if admin account is disabled', async () => {
            // Arrange
            const mockPayload = {
                id: '507f1f77bcf86cd799439011',
                email: 'admin@test.com',
                role: 'super_admin',
                type: 'admin' as const,
            };

            const mockAdmin = {
                _id: { toString: () => '507f1f77bcf86cd799439011' },
                email: 'admin@test.com',
                isActive: false,
            };

            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
            (AdminRepository.findById as jest.Mock).mockResolvedValue(mockAdmin);

            // Act & Assert
            await expect(
                AdminAuthService.getAdminFromToken('valid-token')
            ).rejects.toThrow('Account is disabled.');
        });
    });
});
