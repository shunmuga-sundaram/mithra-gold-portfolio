/**
 * Test Environment Variables Loading
 */
require('dotenv').config({ path: './.env' });

console.log('\n=== Testing Environment Variables ===\n');

const vars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'EMAIL_FROM_NAME',
  'EMAIL_FROM_ADDRESS',
  'ALLOWED_ORIGINS',
  'MONGODB_URI',
];

vars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask password
    const displayValue = varName.includes('PASSWORD')
      ? '***' + value.slice(-4)
      : value.length > 50
        ? value.substring(0, 50) + '...'
        : value;
    console.log(`✅ ${varName} = ${displayValue}`);
  } else {
    console.log(`❌ ${varName} = NOT SET`);
  }
});

console.log('\n=== End Test ===\n');
