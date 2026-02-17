/**
 * CREATE ADMIN USER SCRIPT (Environment Variables)
 *
 * This script creates an admin user using environment variables.
 * Useful for automated deployments and CI/CD pipelines.
 *
 * Required Environment Variables:
 * - ADMIN_NAME: Admin's full name
 * - ADMIN_EMAIL: Admin's email address
 * - ADMIN_PASSWORD: Admin's password
 * - ADMIN_ROLE: Admin role (admin or super_admin) [optional, default: admin]
 *
 * Usage:
 * ADMIN_NAME="John Doe" ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="Admin@123" npm run create-admin:env
 *
 * Or with .env file:
 * Add the variables to .env file and run:
 * npm run create-admin:env
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { join } from 'path';
import { Admin, IAdmin } from '../app/models/entities/Admin';

// Load environment variables
config({ path: join(__dirname, '../../.env') });

// MongoDB connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithra_portfolio';

/**
 * Connect to MongoDB
 */
async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate password strength
 */
function isValidPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(password);
}

/**
 * Create admin user from environment variables
 */
async function createAdminFromEnv(): Promise<void> {
  try {
    console.log('\n==============================================');
    console.log('  CREATE ADMIN USER - Mithra Portfolio Tracker');
    console.log('==============================================\n');

    // Get admin details from environment variables
    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const role = (process.env.ADMIN_ROLE || 'admin') as 'admin' | 'super_admin';

    // Validate required environment variables
    if (!name) {
      throw new Error('ADMIN_NAME environment variable is required');
    }
    if (!email) {
      throw new Error('ADMIN_EMAIL environment variable is required');
    }
    if (!password) {
      throw new Error('ADMIN_PASSWORD environment variable is required');
    }

    // Validate name
    if (name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    // Validate email
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password
    if (!isValidPassword(password)) {
      throw new Error(
        'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
      );
    }

    // Validate role
    if (role !== 'admin' && role !== 'super_admin') {
      throw new Error('ADMIN_ROLE must be either "admin" or "super_admin"');
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.log('\n⚠️  Admin with this email already exists');
      console.log('==============================================');
      console.log(`Name:  ${existingAdmin.name}`);
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role:  ${existingAdmin.role}`);
      console.log(`ID:    ${existingAdmin._id}`);
      console.log('==============================================\n');
      return;
    }

    // Create admin user
    console.log('⏳ Creating admin user...');

    const admin = await Admin.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: role,
      isActive: true,
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('==============================================');
    console.log(`Name:  ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role:  ${admin.role}`);
    console.log(`ID:    ${admin._id}`);
    console.log('==============================================\n');
    console.log('You can now login to the admin portal with these credentials.\n');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Create admin user
    await createAdminFromEnv();

    // Disconnect
    await disconnectDatabase();

    // Exit successfully
    process.exit(0);
  } catch (error) {
    // Disconnect from database
    try {
      await disconnectDatabase();
    } catch (disconnectError) {
      // Ignore disconnect error
    }

    // Exit with error
    process.exit(1);
  }
}

// Run the script
main();
