import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * MEMBER MODEL - Mongoose Schema
 *
 * Defines the structure of Member documents in MongoDB
 *
 * Purpose:
 * - Store member (customer) information
 * - Handle authentication for member login
 * - Track gold holdings and transactions
 * - Manage active/inactive status
 *
 * Collections:
 * Database: mithra_portfolio
 * Collection: members
 */

/**
 * MEMBER INTERFACE
 *
 * TypeScript interface defining the shape of a Member document
 * Extends Document to include MongoDB methods (_id, save, etc.)
 */
export interface IMember extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  goldHoldings: number;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * MEMBER SCHEMA
 *
 * Mongoose schema with validation rules and constraints
 */
const MemberSchema = new Schema<IMember>(
  {
    /**
     * NAME
     *
     * Member's full name
     * - Required field
     * - Trimmed (removes leading/trailing spaces)
     * - Minimum 2 characters
     */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    /**
     * EMAIL
     *
     * Member's email address (used for login)
     * - Required field
     * - Must be unique (MongoDB index)
     * - Stored in lowercase
     * - Trimmed
     * - Indexed for fast lookups
     *
     * UNIQUE CONSTRAINT:
     * - MongoDB creates a unique index on this field
     * - Prevents duplicate emails
     * - Throws error if duplicate: E11000 duplicate key error
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // 👈 UNIQUE CONSTRAINT
      lowercase: true, // Convert to lowercase before saving
      trim: true,
      index: true, // Create index for faster queries
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },

    /**
     * PASSWORD
     *
     * Member's password (hashed)
     * - Required field
     * - Never stored as plain text
     * - Hashed using bcrypt (10 salt rounds)
     * - Pre-save hook handles hashing automatically
     *
     * Security:
     * - Minimum 8 characters
     * - Must contain: uppercase, lowercase, number, special char
     * - Validated in DTO layer (backend/src/app/dtos/member.dto.ts)
     */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password in queries by default
    },

    /**
     * PHONE
     *
     * Member's contact phone number
     * - Required field
     * - Can include country code, dashes, spaces
     * - Example formats: +1 234-567-8900, 1234567890, +91-9876543210
     */
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [
        /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/,
        'Please enter a valid phone number',
      ],
    },

    /**
     * GOLD HOLDINGS
     *
     * Total grams of gold owned by member
     * - Calculated from buy/sell trades
     * - Default: 0 (new members start with no gold)
     * - Updated when trades are created
     *
     * Calculation:
     * goldHoldings = SUM(buyTrades.quantity) - SUM(sellTrades.quantity)
     *
     * Future: Auto-calculate from Trade model
     */
    goldHoldings: {
      type: Number,
      default: 0,
      min: [0, 'Gold holdings cannot be negative'],
    },

    /**
     * IS ACTIVE
     *
     * Account status (active/inactive)
     * - true: Member can login and make trades
     * - false: Member cannot login (soft deleted)
     *
     * Soft Delete Pattern:
     * - Instead of deleting member from database
     * - Set isActive = false
     * - Preserves historical data (trades, transactions)
     * - Can reactivate later if needed
     */
    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * RESET PASSWORD TOKEN
     *
     * Token for password reset functionality
     * - Generated when user requests password reset
     * - Used to verify reset request
     * - Cleared after password is reset
     */
    resetPasswordToken: {
      type: String,
      select: false, // Don't include in queries by default
    },

    /**
     * RESET PASSWORD EXPIRY
     *
     * Expiration timestamp for reset token
     * - Default: 15 minutes from token generation
     * - Token invalid after this time
     */
    resetPasswordExpires: {
      type: Date,
      select: false, // Don't include in queries by default
    },
  },
  {
    /**
     * SCHEMA OPTIONS
     */
    timestamps: true, // Automatically add createdAt and updatedAt fields
    versionKey: '__v', // Version key for optimistic concurrency control
  }
);

/**
 * PRE-SAVE HOOK - PASSWORD HASHING
 *
 * Automatically hash password before saving to database
 *
 * When this runs:
 * - Before every save() operation
 * - Only when password is modified (new member or password change)
 *
 * How it works:
 * 1. Check if password was modified
 * 2. Generate salt (random data to make hash unique)
 * 3. Hash password with salt using bcrypt
 * 4. Replace plain password with hashed password
 * 5. Save to database
 *
 * Security:
 * - Salt rounds: 10 (good balance of security and performance)
 * - Same password = different hash (due to random salt)
 * - One-way hash (cannot decrypt back to plain password)
 */
MemberSchema.pre('save', async function () {
  const member = this as IMember;

  /**
   * OPTIMIZATION: Only hash if password was modified
   *
   * Why?
   * - If updating name/phone, don't re-hash password
   * - Saves CPU time
   * - Prevents changing password hash unintentionally
   */
  if (!member.isModified('password')) {
    return;
  }

  /**
   * STEP 1: Generate Salt
   *
   * Salt: Random data added to password before hashing
   * 10 rounds: Balance between security and speed
   * - More rounds = more secure but slower
   * - 10 is industry standard
   */
  const salt = await bcrypt.genSalt(10);

  /**
   * STEP 2: Hash Password
   *
   * Combines password + salt → irreversible hash
   * Example:
   * "Admin@123" + salt → "$2b$10$abcd1234..."
   */
  member.password = await bcrypt.hash(member.password, salt);
});

/**
 * METHOD: comparePassword
 *
 * Compare plain password with hashed password
 *
 * Used for:
 * - Member login authentication
 * - Verify password is correct
 *
 * How it works:
 * 1. Member enters password: "MyPassword@123"
 * 2. Retrieve hashed password from database: "$2b$10$abcd..."
 * 3. bcrypt.compare() checks if they match
 * 4. Returns true/false
 *
 * Security:
 * - bcrypt automatically handles salt extraction
 * - Timing-attack resistant
 * - Cannot reverse-engineer password from hash
 *
 * @param candidatePassword - Plain text password to check
 * @returns Promise<boolean> - true if match, false if not
 */
MemberSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    /**
     * bcrypt.compare() does:
     * 1. Extract salt from stored hash
     * 2. Hash candidatePassword with same salt
     * 3. Compare hashes
     * 4. Return true if equal
     */
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

/**
 * INDEXES
 *
 * Create database indexes for faster queries
 *
 * Why indexes?
 * - Speed up searches by 10x-100x
 * - Like index in a book (jump to page instead of reading all pages)
 *
 * Trade-offs:
 * - Faster reads (queries)
 * - Slightly slower writes (need to update index)
 * - More storage space
 *
 * For members, reads >> writes, so indexes are worth it
 */

/**
 * Email Index (already created by unique: true)
 * - Used for: Login (findByEmail)
 * - Automatically created by unique constraint
 */

/**
 * Active Members Index
 * - Used for: Listing active members
 * - Compound index for common query patterns
 */
MemberSchema.index({ isActive: 1, createdAt: -1 });

/**
 * TRANSFORM: Remove password from JSON output
 *
 * When sending member object to frontend, don't include password
 *
 * Security best practice:
 * - Never send password hash to client
 * - Even hashed passwords shouldn't be exposed
 *
 * How it works:
 * - When you call member.toJSON()
 * - Or send member in API response
 * - This transform function runs
 * - Removes password field
 * - Converts _id to id (cleaner API)
 */
MemberSchema.set('toJSON', {
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
 * CREATE MODEL
 *
 * Create Mongoose model from schema
 * Model = Class for creating/querying documents
 */
const Member = model<IMember>('Member', MemberSchema);

export default Member;

/**
 * USAGE EXAMPLES:
 *
 * CREATE MEMBER:
 * const member = await Member.create({
 *   name: "John Doe",
 *   email: "john@example.com",
 *   password: "MyPassword@123", // Will be auto-hashed
 *   phone: "+1 234-567-8900"
 * });
 *
 * FIND BY EMAIL:
 * const member = await Member.findOne({ email: "john@example.com" })
 *   .select('+password'); // Include password for login
 *
 * VERIFY PASSWORD:
 * const isValid = await member.comparePassword("MyPassword@123");
 * if (isValid) {
 *   // Login successful
 * }
 *
 * UPDATE MEMBER:
 * await Member.findByIdAndUpdate(id, { name: "Jane Doe" });
 *
 * SOFT DELETE:
 * await Member.findByIdAndUpdate(id, { isActive: false });
 *
 * FIND ACTIVE MEMBERS:
 * const activeMembers = await Member.find({ isActive: true });
 */
