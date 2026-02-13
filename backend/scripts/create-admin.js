/**
 * Create Admin Script
 *
 * This script creates the first admin account in the database.
 * Run this script ONCE to set up your initial admin user.
 *
 * Usage:
 *   node scripts/create-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB connection URI from environment variable
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithra_portfolio';

/**
 * Admin account details
 * CHANGE THESE VALUES as needed
 */
const ADMIN_DATA = {
    name: 'Super Admin',
    email: 'admin@mithra.com',
    password: 'Admin@123',  // This will be hashed before storing
    role: 'super_admin',
    isActive: true
};

/**
 * Main function to create admin
 */
async function createAdmin() {
    try {
        console.log('🔄 Starting admin creation process...\n');

        // Step 1: Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        console.log(`   URI: ${MONGODB_URI}`);

        await mongoose.connect(MONGODB_URI);

        console.log('✅ Connected to MongoDB successfully!\n');

        // Step 2: Check if admin already exists
        console.log('🔍 Checking if admin already exists...');
        const existingAdmin = await mongoose.connection.db
            .collection('admins')
            .findOne({ email: ADMIN_DATA.email.toLowerCase() });

        if (existingAdmin) {
            console.log('⚠️  Admin with this email already exists!');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Name: ${existingAdmin.name}`);
            console.log(`   Role: ${existingAdmin.role}`);
            console.log(`   Created: ${existingAdmin.createdAt}`);
            console.log('\n💡 Tip: Delete the existing admin first or use a different email.\n');

            await mongoose.disconnect();
            process.exit(0);
        }

        console.log('✅ No existing admin found. Proceeding with creation...\n');

        // Step 3: Hash the password
        console.log('🔐 Hashing password...');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, saltRounds);
        console.log(`   Salt rounds: ${saltRounds}`);
        console.log(`   Password hashed successfully!\n`);

        // Step 4: Create admin document
        console.log('💾 Creating admin document...');
        const adminDocument = {
            name: ADMIN_DATA.name,
            email: ADMIN_DATA.email.toLowerCase(),
            password: hashedPassword,
            role: ADMIN_DATA.role,
            isActive: ADMIN_DATA.isActive,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Step 5: Insert into database
        const result = await mongoose.connection.db
            .collection('admins')
            .insertOne(adminDocument);

        console.log('✅ Admin created successfully!\n');

        // Step 6: Display success information
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('         🎉 ADMIN ACCOUNT CREATED         ');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('📋 Account Details:');
        console.log(`   ID:       ${result.insertedId}`);
        console.log(`   Name:     ${ADMIN_DATA.name}`);
        console.log(`   Email:    ${ADMIN_DATA.email}`);
        console.log(`   Password: ${ADMIN_DATA.password} (original - store this safely!)`);
        console.log(`   Role:     ${ADMIN_DATA.role}`);
        console.log(`   Status:   ${ADMIN_DATA.isActive ? 'Active' : 'Inactive'}`);
        console.log(`   Created:  ${new Date().toLocaleString()}\n`);

        console.log('🔑 Login Credentials:');
        console.log(`   URL:      http://localhost:5173 (Admin Portal)`);
        console.log(`   Email:    ${ADMIN_DATA.email}`);
        console.log(`   Password: ${ADMIN_DATA.password}\n`);

        console.log('⚠️  IMPORTANT SECURITY NOTES:');
        console.log('   1. Change the default password after first login');
        console.log('   2. Never share these credentials');
        console.log('   3. Password is hashed in database (secure)');
        console.log('   4. This script should only be run ONCE\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Step 7: Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        console.log('✨ Script completed successfully!\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERROR: Admin creation failed!\n');
        console.error('Error details:', error.message);

        // Specific error handling
        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Troubleshooting:');
            console.error('   - MongoDB is not running');
            console.error('   - Start MongoDB: sudo systemctl start mongod');
            console.error('   - Check status: sudo systemctl status mongod');
        } else if (error.code === 11000) {
            console.error('\n💡 Troubleshooting:');
            console.error('   - Admin with this email already exists');
            console.error('   - Use a different email or delete existing admin');
        } else {
            console.error('\n💡 Troubleshooting:');
            console.error('   - Check your .env file configuration');
            console.error('   - Verify MONGODB_URI is correct');
            console.error('   - Ensure MongoDB is accessible');
        }

        console.error('\n');

        // Try to disconnect if connected
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }

        process.exit(1);
    }
}

// Run the script
console.log('\n');
console.log('╔════════════════════════════════════════╗');
console.log('║   MITHRA PORTFOLIO TRACKER             ║');
console.log('║   Admin Account Creation Script        ║');
console.log('╚════════════════════════════════════════╝');
console.log('\n');

createAdmin();
