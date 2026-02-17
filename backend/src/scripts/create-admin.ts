/**
 * CREATE ADMIN USER SCRIPT
 *
 * This script creates an admin user in the database.
 * Use this for initial production setup or to create new admin users.
 *
 * Usage:
 * ts-node src/scripts/create-admin.ts
 *
 * Or compile and run:
 * npm run build
 * node build/scripts/create-admin.js
 */

import mongoose from 'mongoose';
import * as readline from 'readline';
import { config } from 'dotenv';
import { join } from 'path';
import { Admin, IAdmin } from '../app/models/entities/Admin';

// Load environment variables
config({ path: join(__dirname, '../../.env') });

// MongoDB connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithra_portfolio';

/**
 * Create readline interface for user input
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Prompt user for input
 */
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

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
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(password);
}

/**
 * Create admin user
 */
async function createAdmin(): Promise<void> {
  try {
    console.log('\n==============================================');
    console.log('  CREATE ADMIN USER - Mithra Portfolio Tracker');
    console.log('==============================================\n');

    // Get admin details from user input
    const name = await question('Enter admin name: ');
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    const email = await question('Enter admin email: ');
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      throw new Error('Admin with this email already exists');
    }

    const password = await question('Enter admin password (min 8 chars, uppercase, lowercase, number, special char): ');
    if (!isValidPassword(password)) {
      throw new Error(
        'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
      );
    }

    const confirmPassword = await question('Confirm password: ');
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const roleInput = await question('Enter role (admin/super_admin) [default: admin]: ');
    const role = roleInput.trim() || 'admin';
    if (role !== 'admin' && role !== 'super_admin') {
      throw new Error('Role must be either "admin" or "super_admin"');
    }

    // Create admin user
    console.log('\n⏳ Creating admin user...');

    const admin = await Admin.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: role as 'admin' | 'super_admin',
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
    await createAdmin();

    // Disconnect
    await disconnectDatabase();

    // Close readline interface
    rl.close();

    // Exit successfully
    process.exit(0);
  } catch (error) {
    // Close readline interface
    rl.close();

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
