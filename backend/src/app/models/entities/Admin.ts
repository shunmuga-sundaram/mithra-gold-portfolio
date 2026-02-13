import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * Admin Interface (TypeScript Type)
 * Defines the structure of an Admin document
 */
export interface IAdmin extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'super_admin';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    // Instance method to compare passwords
    comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * Admin Schema Definition
 * Defines the structure and validation rules for Admin collection
 */
const AdminSchema = new Schema<IAdmin>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },

        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: function (email: string) {
                    // Email format validation using regex
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                },
                message: 'Please provide a valid email address',
            },
        },

        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Don't include password in queries by default
        },

        role: {
            type: String,
            enum: {
                values: ['admin', 'super_admin'],
                message: 'Role must be either admin or super_admin',
            },
            default: 'admin',
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        // Automatic timestamps
        timestamps: true,

        // Collection name in MongoDB
        collection: 'admins',
    }
);

/**
 * PRE-SAVE HOOK: Hash password before saving
 *
 * This runs automatically BEFORE saving a new admin or updating password
 */
AdminSchema.pre('save', async function () {
    // 'this' refers to the admin document being saved
    const admin = this;

    // Only hash the password if it has been modified (or is new)
    if (!admin.isModified('password')) {
        return;
    }

    // Generate salt (random data added to password)
    const salt = await bcrypt.genSalt(10);

    // Hash the password with the salt
    admin.password = await bcrypt.hash(admin.password, salt);
});

/**
 * INSTANCE METHOD: Compare password with hashed password
 *
 * Usage: const isMatch = await admin.comparePassword('User@123');
 */
AdminSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    try {
        // Compare plain text password with hashed password
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

/**
 * TRANSFORM: Remove password from JSON output
 *
 * When you send admin object to frontend, password won't be included
 */
AdminSchema.set('toJSON', {
    transform: function (doc: any, ret: any) {
        // Remove password field
        delete ret.password;
        // Convert _id to id for cleaner API
        ret.id = ret._id;
        delete ret._id;
        // Remove version key
        delete ret.__v;
        return ret;
    },
});

/**
 * INDEXES: Create database indexes for better performance
 */
AdminSchema.index({ email: 1 }, { unique: true }); // Unique index on email

/**
 * Admin Model
 * This is what we use to interact with the database
 */
export const Admin: Model<IAdmin> = mongoose.model<IAdmin>('Admin', AdminSchema);
