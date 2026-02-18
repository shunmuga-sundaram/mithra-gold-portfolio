/**
 * Test Password Reset Email Sending
 */
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

async function testPasswordReset() {
  try {
    console.log('\n=== Testing Password Reset Flow ===\n');

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithra_portfolio';
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('   ✅ Connected\n');

    // Import services
    const { default: MemberAuthService } = require('./build/app/services/auth/member-auth-service');

    // Test email
    const testEmail = 'shanmugam@blaze.ws';
    console.log(`2. Requesting password reset for: ${testEmail}`);

    // Request password reset
    const result = await MemberAuthService.requestPasswordReset(testEmail);

    console.log('\n3. Result:');
    console.log('   Message:', result.message);

    // Check if token was saved in database
    const member = await mongoose.connection.db
      .collection('members')
      .findOne(
        { email: testEmail },
        { projection: { resetPasswordToken: 1, resetPasswordExpires: 1 } }
      );

    console.log('\n4. Database check:');
    if (member && member.resetPasswordToken) {
      console.log('   ✅ Reset token saved in database');
      console.log('   Token:', member.resetPasswordToken.substring(0, 20) + '...');
      console.log('   Expires:', member.resetPasswordExpires);
      console.log('   Time remaining:', Math.round((new Date(member.resetPasswordExpires) - new Date()) / 1000 / 60), 'minutes');
    } else {
      console.log('   ❌ No reset token found in database');
    }

    console.log('\n5. Check your email at:', testEmail);
    console.log('   - Check inbox');
    console.log('   - Check spam/junk folder');
    console.log('   - Check Gmail "All Mail" folder\n');

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Test complete\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testPasswordReset();
