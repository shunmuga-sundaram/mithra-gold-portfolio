import { Admin, IAdmin } from '../entities/Admin';

/**
 * Admin Repository
 *
 * This class handles all database operations for Admin collection.
 * It provides a clean abstraction layer between business logic and database.
 *
 * Why use Repository Pattern?
 * - Centralized data access logic
 * - Easier to test (can mock the repository)
 * - Single place to change database queries
 * - Business logic doesn't know about MongoDB details
 */
export class AdminRepository {
    /**
     * Find admin by email address
     *
     * @param email - Admin's email address
     * @param includePassword - Whether to include password field (default: false)
     * @returns Admin document or null if not found
     *
     * Usage:
     * - Login: const admin = await AdminRepository.findByEmail(email, true);
     * - Profile: const admin = await AdminRepository.findByEmail(email);
     */
    static async findByEmail(
        email: string,
        includePassword: boolean = false
    ): Promise<IAdmin | null> {
        try {
            // Build the query
            let query = Admin.findOne({ email: email.toLowerCase() });

            // Include password only if explicitly requested
            // (Remember: password has 'select: false' in schema)
            if (includePassword) {
                query = query.select('+password');
            }

            // Execute query
            const admin = await query.exec();

            return admin;
        } catch (error) {
            console.error('Error in AdminRepository.findByEmail:', error);
            throw error;
        }
    }

    /**
     * Find admin by ID
     *
     * @param id - Admin's MongoDB ObjectId (as string)
     * @returns Admin document or null if not found
     *
     * Usage:
     * const admin = await AdminRepository.findById('507f1f77bcf86cd799439011');
     */
    static async findById(id: string): Promise<IAdmin | null> {
        try {
            const admin = await Admin.findById(id).exec();
            return admin;
        } catch (error) {
            console.error('Error in AdminRepository.findById:', error);
            throw error;
        }
    }

    /**
     * Find admin by ID and include password
     * Useful for password change operations
     *
     * @param id - Admin's MongoDB ObjectId (as string)
     * @returns Admin document with password or null if not found
     */
    static async findByIdWithPassword(id: string): Promise<IAdmin | null> {
        try {
            const admin = await Admin.findById(id).select('+password').exec();
            return admin;
        } catch (error) {
            console.error('Error in AdminRepository.findByIdWithPassword:', error);
            throw error;
        }
    }

    /**
     * Create a new admin
     *
     * @param adminData - Admin data (name, email, password, role)
     * @returns Created admin document (without password)
     *
     * Usage:
     * const newAdmin = await AdminRepository.create({
     *     name: 'John Doe',
     *     email: 'john@example.com',
     *     password: 'Admin@123',
     *     role: 'admin'
     * });
     *
     * Note: Password will be automatically hashed by pre-save hook
     */
    static async create(adminData: {
        name: string;
        email: string;
        password: string;
        role?: 'admin' | 'super_admin';
        isActive?: boolean;
    }): Promise<IAdmin> {
        try {
            // Create new admin document
            const admin = new Admin({
                name: adminData.name,
                email: adminData.email.toLowerCase(), // Ensure lowercase
                password: adminData.password,
                role: adminData.role || 'admin',
                isActive: adminData.isActive !== undefined ? adminData.isActive : true,
            });

            // Save to database (pre-save hook will hash the password)
            await admin.save();

            // Return admin without password
            return admin;
        } catch (error) {
            console.error('Error in AdminRepository.create:', error);

            // Handle duplicate email error
            if ((error as any).code === 11000) {
                throw new Error('Admin with this email already exists');
            }

            throw error;
        }
    }

    /**
     * Update admin by ID
     *
     * @param id - Admin's MongoDB ObjectId
     * @param updateData - Fields to update
     * @returns Updated admin document or null if not found
     *
     * Usage:
     * const updated = await AdminRepository.update('507f...', {
     *     name: 'Jane Doe',
     *     isActive: false
     * });
     *
     * Note: This does NOT update password (use updatePassword method instead)
     */
    static async update(
        id: string,
        updateData: {
            name?: string;
            role?: 'admin' | 'super_admin';
            isActive?: boolean;
        }
    ): Promise<IAdmin | null> {
        try {
            const admin = await Admin.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            ).exec();

            return admin;
        } catch (error) {
            console.error('Error in AdminRepository.update:', error);
            throw error;
        }
    }

    /**
     * Update admin password
     *
     * @param id - Admin's MongoDB ObjectId
     * @param newPassword - New password (will be hashed automatically)
     * @returns Updated admin document or null if not found
     *
     * Usage:
     * await AdminRepository.updatePassword('507f...', 'NewPassword@123');
     */
    static async updatePassword(id: string, newPassword: string): Promise<IAdmin | null> {
        try {
            // Find admin with password field
            const admin = await Admin.findById(id).select('+password').exec();

            if (!admin) {
                return null;
            }

            // Update password (pre-save hook will hash it)
            admin.password = newPassword;
            await admin.save();

            // Return admin without password
            const updatedAdmin = await Admin.findById(id).exec();
            return updatedAdmin;
        } catch (error) {
            console.error('Error in AdminRepository.updatePassword:', error);
            throw error;
        }
    }

    /**
     * Delete admin by ID (soft delete - set isActive to false)
     *
     * @param id - Admin's MongoDB ObjectId
     * @returns Updated admin document or null if not found
     *
     * Usage:
     * await AdminRepository.softDelete('507f...');
     */
    static async softDelete(id: string): Promise<IAdmin | null> {
        try {
            const admin = await Admin.findByIdAndUpdate(
                id,
                { $set: { isActive: false } },
                { new: true }
            ).exec();

            return admin;
        } catch (error) {
            console.error('Error in AdminRepository.softDelete:', error);
            throw error;
        }
    }

    /**
     * Permanently delete admin by ID (hard delete)
     *
     * @param id - Admin's MongoDB ObjectId
     * @returns Deleted admin document or null if not found
     *
     * Usage:
     * await AdminRepository.hardDelete('507f...');
     *
     * Warning: This permanently deletes the admin. Use with caution!
     */
    static async hardDelete(id: string): Promise<IAdmin | null> {
        try {
            const admin = await Admin.findByIdAndDelete(id).exec();
            return admin;
        } catch (error) {
            console.error('Error in AdminRepository.hardDelete:', error);
            throw error;
        }
    }

    /**
     * Get all admins (with pagination)
     *
     * @param page - Page number (default: 1)
     * @param limit - Results per page (default: 10)
     * @param activeOnly - Only return active admins (default: true)
     * @returns Array of admin documents
     *
     * Usage:
     * const admins = await AdminRepository.findAll(1, 20);
     */
    static async findAll(
        page: number = 1,
        limit: number = 10,
        activeOnly: boolean = true
    ): Promise<{ admins: IAdmin[]; total: number; page: number; totalPages: number }> {
        try {
            const skip = (page - 1) * limit;

            // Build filter
            const filter = activeOnly ? { isActive: true } : {};

            // Get total count
            const total = await Admin.countDocuments(filter);

            // Get paginated admins
            const admins = await Admin.find(filter)
                .sort({ createdAt: -1 }) // Newest first
                .skip(skip)
                .limit(limit)
                .exec();

            return {
                admins,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            console.error('Error in AdminRepository.findAll:', error);
            throw error;
        }
    }

    /**
     * Count total admins
     *
     * @param activeOnly - Only count active admins (default: true)
     * @returns Total count
     */
    static async count(activeOnly: boolean = true): Promise<number> {
        try {
            const filter = activeOnly ? { isActive: true } : {};
            return await Admin.countDocuments(filter);
        } catch (error) {
            console.error('Error in AdminRepository.count:', error);
            throw error;
        }
    }
}
