/**
 * Simple script to test MongoDB connection
 * Run with: node test-connection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithra_portfolio';

async function testConnection() {
    try {
        console.log('🔄 Attempting to connect to MongoDB...');
        console.log(`📍 Connection URI: ${MONGODB_URI}`);

        await mongoose.connect(MONGODB_URI);

        console.log('✅ MongoDB Connection SUCCESS!');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🖥️  Host: ${mongoose.connection.host}`);
        console.log(`⚡ Port: ${mongoose.connection.port}`);
        console.log(`📈 Ready State: ${mongoose.connection.readyState} (1 = connected)`);

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`\n📂 Collections in database:`);
        if (collections.length === 0) {
            console.log('   (No collections yet - this is normal for a new database)');
        } else {
            collections.forEach(col => {
                console.log(`   - ${col.name}`);
            });
        }

        await mongoose.disconnect();
        console.log('\n🔌 Disconnected successfully');
        console.log('\n🎉 Connection test PASSED!');

    } catch (error) {
        console.error('❌ MongoDB Connection FAILED!');
        console.error('Error:', error.message);

        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 Tip: Make sure MongoDB is running!');
            console.error('   Start it with: sudo systemctl start mongod');
            console.error('   Or check status: sudo systemctl status mongod');
        }

        process.exit(1);
    }
}

testConnection();
